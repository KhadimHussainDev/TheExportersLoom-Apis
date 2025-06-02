import { HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MODULE_TYPES, STATUS } from '../common';
import { CuttingService } from '../modules/cutting module/cutting.service';
import { FabricPricingService } from '../modules/fabric-price module/fabric-pricing.service';
import { FabricQuantityService } from '../modules/fabric-quantity-module/fabric-quantity.service';
import { LogoPrintingService } from '../modules/logo-printing module/logo-printing.service';
import { PackagingService } from '../modules/packaging module/packaging.service';
import { StitchingService } from '../modules/stitching module/stitching.service';
import { OrderService } from '../order/order.service';
import { User } from '../users/entities/user.entity';
import { BidService } from './bid.service';
import { CreateBidResponseDto } from './dto/create-bid-response.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { BidResponse } from './entities/bid-response.entity';
import { Bid } from './entities/bid.entity';

// Type for mocked repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Create mock repositories
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

describe('BidService', () => {
  let service: BidService;
  let bidRepository: MockRepository<Bid>;
  let userRepository: MockRepository<User>;
  let bidResponseRepository: MockRepository<BidResponse>;

  // Mock service dependencies
  let fabricPricingService: Partial<FabricPricingService>;
  let fabricQuantityService: Partial<FabricQuantityService>;
  let cuttingService: Partial<CuttingService>;
  let logoPrintingService: Partial<LogoPrintingService>;
  let packagingService: Partial<PackagingService>;
  let stitchingService: Partial<StitchingService>;
  let orderService: Partial<OrderService>;

  beforeEach(async () => {
    // Create mock implementations of all dependent services
    fabricPricingService = {
      updateFabricPricingStatus: jest.fn().mockResolvedValue(undefined),
    };
    fabricQuantityService = {
      updateFabricQuantityStatus: jest.fn().mockResolvedValue(undefined),
    };
    cuttingService = {
      updateCuttingStatus: jest.fn().mockResolvedValue(undefined),
    };
    logoPrintingService = {
      updateLogoPrintingStatus: jest.fn().mockResolvedValue(undefined),
    };
    packagingService = {
      updatePackagingBagsStatus: jest.fn().mockResolvedValue(undefined),
    };
    stitchingService = {
      updateStitchingStatus: jest.fn().mockResolvedValue(undefined),
    };
    orderService = {
      createOrder: jest.fn().mockResolvedValue({ order_id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidService,
        { provide: getRepositoryToken(Bid), useValue: createMockRepository() },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        { provide: getRepositoryToken(BidResponse), useValue: createMockRepository() },
        { provide: FabricPricingService, useValue: fabricPricingService },
        { provide: FabricQuantityService, useValue: fabricQuantityService },
        { provide: CuttingService, useValue: cuttingService },
        { provide: LogoPrintingService, useValue: logoPrintingService },
        { provide: PackagingService, useValue: packagingService },
        { provide: StitchingService, useValue: stitchingService },
        { provide: OrderService, useValue: orderService },
      ],
    }).compile();

    service = module.get<BidService>(BidService);
    bidRepository = module.get(getRepositoryToken(Bid));
    userRepository = module.get(getRepositoryToken(User));
    bidResponseRepository = module.get(getRepositoryToken(BidResponse));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a bid if found', async () => {
      const mockBid = { bid_id: 1, title: 'Test Bid' };
      bidRepository.findOne.mockResolvedValue(mockBid);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBid);
      expect(bidRepository.findOne).toHaveBeenCalledWith({
        where: { bid_id: 1 },
      });
    });

    it('should throw an error if bid is not found', async () => {
      bidRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Bid with ID 999 not found.'
      );
    });
  });

  describe('createBid', () => {
    it('should create and return a new bid for FABRIC_PRICING module', async () => {
      // Mock data
      const userId = 1;
      const moduleId = 100;
      const title = 'Test Bid';
      const description = 'Test Description';
      const price = 1000;
      const status = 'Active';
      const moduleType = MODULE_TYPES.FABRIC_PRICING;

      // Mock user repository response
      const mockUser = { user_id: userId, username: 'testuser' };
      userRepository.findOne.mockResolvedValue(mockUser);

      // Mock bid repository save method
      const mockBid = {
        user: mockUser,
        title,
        description,
        price,
        status,
        module_id: moduleId,
        module_type: moduleType,
      };
      bidRepository.save.mockResolvedValue({ bid_id: 1, ...mockBid });

      // Execute the method
      const result = await service.createBid(
        userId,
        moduleId,
        title,
        description,
        price,
        status,
        moduleType,
      );

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(fabricPricingService.updateFabricPricingStatus).toHaveBeenCalledWith(
        moduleId,
        STATUS.POSTED
      );
      expect(bidRepository.save).toHaveBeenCalled();
      expect(result.bid_id).toBe(1);
      expect(result.title).toBe(title);
    });

    it('should throw an error if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createBid(
          999,
          1,
          'Test Bid',
          'Description',
          1000,
          'Active',
          MODULE_TYPES.FABRIC_PRICING
        )
      ).rejects.toThrow('User with ID 999 not found.');
    });

    it('should throw an error if module type is invalid', async () => {
      const mockUser = { user_id: 1 };
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.createBid(
          1,
          1,
          'Test Bid',
          'Description',
          1000,
          'Active',
          'INVALID_TYPE' as any
        )
      ).rejects.toThrow('Invalid module_type provided.');
    });
  });

  describe('getAllBids', () => {
    it('should return all active bids', async () => {
      const mockBids = [
        { bid_id: 1, title: 'Bid 1', status: 'Active' },
        { bid_id: 2, title: 'Bid 2', status: 'Active' },
      ];
      bidRepository.find.mockResolvedValue(mockBids);

      const result = await service.getAllBids();

      expect(result).toEqual(mockBids);
      expect(bidRepository.find).toHaveBeenCalledWith({
        where: { status: 'Active' },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
    });

    it('should throw an error if the repository call fails', async () => {
      bidRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getAllBids()).rejects.toThrow(
        'Error fetching all bids: Database error'
      );
    });
  });

  describe('deactivateBid', () => {
    it('should set a bid status to inactive', async () => {
      const mockBid = { bid_id: 1, status: 'Active' };
      bidRepository.findOne.mockResolvedValue(mockBid);

      const updatedBid = { ...mockBid, status: STATUS.INACTIVE };
      bidRepository.save.mockResolvedValue(updatedBid);

      const result = await service.deactivateBid(1);

      expect(result.status).toBe(STATUS.INACTIVE);
      expect(bidRepository.findOne).toHaveBeenCalledWith({
        where: { bid_id: 1 },
      });
      expect(bidRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if bid is not found', async () => {
      bidRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivateBid(999)).rejects.toThrow(
        'Bid with ID 999 not found.'
      );
    });
  });

  describe('editBid', () => {
    it('should update and return the bid with new values', async () => {
      const bidId = 1;
      const mockBid = {
        bid_id: bidId,
        title: 'Original Title',
        description: 'Original Description',
        price: 1000,
        status: 'Active',
      };

      bidRepository.findOne.mockResolvedValue(mockBid);

      const updateBidDto: UpdateBidDto = {
        title: 'Updated Title',
        price: 1500,
      };

      const updatedBid = {
        ...mockBid,
        title: updateBidDto.title,
        price: updateBidDto.price,
      };

      bidRepository.save.mockResolvedValue(updatedBid);

      const result = await service.editBid(bidId, updateBidDto);

      expect(result.title).toBe('Updated Title');
      expect(result.price).toBe(1500);
      expect(result.description).toBe('Original Description'); // Unchanged
      expect(bidRepository.findOne).toHaveBeenCalledWith({
        where: { bid_id: bidId },
      });
      expect(bidRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if bid is not found', async () => {
      bidRepository.findOne.mockResolvedValue(null);

      await expect(
        service.editBid(999, { title: 'New Title' })
      ).rejects.toThrow('Bid with ID 999 not found.');
    });

    it('should throw an error if bid is inactive', async () => {
      const mockBid = {
        bid_id: 1,
        status: 'inActive',
      };

      bidRepository.findOne.mockResolvedValue(mockBid);

      await expect(
        service.editBid(1, { title: 'New Title' })
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getBidWithResponses', () => {
    it('should return a bid with its responses', async () => {
      const mockBid = {
        bid_id: 1,
        title: 'Test Bid',
        responses: [
          { response_id: 101, price: 800 },
          { response_id: 102, price: 900 }
        ]
      };

      bidRepository.findOne.mockResolvedValue(mockBid);

      const result = await service.getBidWithResponses(1);

      expect(result).toEqual(mockBid);
      expect(bidRepository.findOne).toHaveBeenCalledWith({
        where: { bid_id: 1 },
        relations: ['user', 'responses', 'responses.manufacturer'],
      });
    });

    it('should throw NotFoundException if bid is not found', async () => {
      bidRepository.findOne.mockResolvedValue(null);

      await expect(service.getBidWithResponses(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createBidResponse', () => {
    it('should create and return a new bid response', async () => {
      // Mock data
      const manufacturerId = 2;
      const createBidResponseDto: CreateBidResponseDto = {
        bid_id: 1,
        price: 900,
        message: 'I can do this job',
        machineId: 123,
        deadline: new Date(),
      };

      // Mock bid and user
      const mockBid = { bid_id: 1, title: 'Test Bid' };
      const mockManufacturer = { user_id: manufacturerId, username: 'manufacturer1' };

      bidRepository.findOne.mockResolvedValue(mockBid);
      userRepository.findOne.mockResolvedValue(mockManufacturer);
      bidResponseRepository.findOne.mockResolvedValue(null); // No existing response

      // Mock response creation
      const mockResponse = {
        response_id: 101,
        bid_id: createBidResponseDto.bid_id,
        manufacturer_id: manufacturerId,
        price: createBidResponseDto.price,
        message: createBidResponseDto.message,
      };
      bidResponseRepository.save.mockResolvedValue(mockResponse);

      // Execute the method
      const result = await service.createBidResponse(
        manufacturerId,
        createBidResponseDto
      );

      // Assertions
      expect(bidRepository.findOne).toHaveBeenCalledWith({
        where: { bid_id: createBidResponseDto.bid_id },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: manufacturerId },
      });
      expect(bidResponseRepository.findOne).toHaveBeenCalled();
      expect(bidResponseRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if bid is not found', async () => {
      bidRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createBidResponse(2, {
          bid_id: 999,
          price: 800,
          message: 'Test response',
          machineId: 123,
          deadline: new Date(),
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if manufacturer is not found', async () => {
      const mockBid = { bid_id: 1 };
      bidRepository.findOne.mockResolvedValue(mockBid);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createBidResponse(999, {
          bid_id: 1,
          price: 800,
          message: 'Test response',
          machineId: 123,
          deadline: new Date(),
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException if manufacturer already responded to the bid', async () => {
      // Mock bid and user
      const mockBid = { bid_id: 1 };
      const mockManufacturer = { user_id: 2 };
      const mockExistingResponse = { response_id: 101 };

      bidRepository.findOne.mockResolvedValue(mockBid);
      userRepository.findOne.mockResolvedValue(mockManufacturer);
      bidResponseRepository.findOne.mockResolvedValue(mockExistingResponse);

      await expect(
        service.createBidResponse(2, {
          bid_id: 1,
          price: 800,
          message: 'Test response',
          machineId: 123,
          deadline: new Date(),
        })
      ).rejects.toThrow(HttpException);
    });
  });

  // Additional test cases can be added for the remaining methods:
  // - getBidResponses
  // - getManufacturerResponses
  // - updateBidResponse
  // - acceptBidResponse
  // - rejectBidResponse
  // - findBidByModuleId
}); 