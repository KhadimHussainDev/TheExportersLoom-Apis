import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { ApiResponseDto } from '../dto/api-response.dto';

/**
 * Example Controller
 * This controller demonstrates how to use the standardized API response structure
 * It's not meant to be used in production, just for demonstration purposes
 */
@Controller('example')
export class ExampleController {
  private items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  /**
   * Get all items
   * The response interceptor will automatically wrap this in a standardized response
   */
  @Get()
  findAll() {
    // Just return the data, the ResponseInterceptor will handle the rest
    return this.items;
  }

  /**
   * Get item by ID
   * Explicitly using ApiResponseDto for more control
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    const item = this.items.find(item => item.id === +id);

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    // Explicitly use ApiResponseDto
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Item found successfully',
      item
    );
  }

  /**
   * Create a new item
   * Explicitly handling errors and using ApiResponseDto
   */
  @Post()
  create(@Body() createItemDto: { name: string }) {
    try {
      if (!createItemDto.name) {
        throw new BadRequestException('Name is required');
      }

      const newItem = {
        id: this.items.length + 1,
        name: createItemDto.name,
      };

      this.items.push(newItem);

      return ApiResponseDto.success(
        HttpStatus.CREATED,
        'Item created successfully',
        newItem
      );
    } catch (error) {
      // The HttpExceptionFilter will catch this and transform it
      throw error;
    }
  }

  /**
   * Update an item
   * Demonstrating error handling
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateItemDto: { name: string }) {
    const itemIndex = this.items.findIndex(item => item.id === +id);

    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    this.items[itemIndex] = {
      ...this.items[itemIndex],
      ...updateItemDto,
    };

    return ApiResponseDto.success(
      HttpStatus.OK,
      'Item updated successfully',
      this.items[itemIndex]
    );
  }

  /**
   * Delete an item
   * Demonstrating a response with no data
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    const itemIndex = this.items.findIndex(item => item.id === +id);

    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    this.items.splice(itemIndex, 1);

    return ApiResponseDto.success(
      HttpStatus.OK,
      'Item deleted successfully'
    );
  }

  /**
   * Demonstrate an error response
   */
  @Get('error/example')
  generateError() {
    throw new BadRequestException('This is an example error');
  }
} 