import { Controller, Get, Param } from '@nestjs/common';
import { BidService } from './bid.service';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}
  
}
