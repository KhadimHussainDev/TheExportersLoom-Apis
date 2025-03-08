# Standardized API Response Examples

This document provides examples of how to use the standardized API response structure in your controllers and services.

## Controller Examples

### Basic Success Response

```typescript
@Get()
findAll() {
  const users = this.usersService.findAll();
  // The response interceptor will automatically wrap this in a standardized response
  return users;
}
```

### Explicit Success Response

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  const user = this.usersService.findOne(+id);
  // Explicitly use ApiResponseDto for more control
  return ApiResponseDto.success(200, 'User found successfully', user);
}
```

### Error Response

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto) {
  try {
    const newUser = this.usersService.create(createUserDto);
    return ApiResponseDto.success(201, 'User created successfully', newUser);
  } catch (error) {
    // Explicitly handle errors (though the exception filter will catch unhandled errors)
    return ApiResponseDto.error(400, 'Failed to create user', error);
  }
}
```

## Service Examples

### Using ServiceResponseDto in Services

```typescript
async findAll(): Promise<ServiceResponseDto<User[]>> {
  const users = await this.userRepository.find();
  return ServiceResponseDto.success('Users retrieved successfully', users);
}

async findOne(id: number): Promise<ServiceResponseDto<User>> {
  const user = await this.userRepository.findOne({ where: { id } });
  
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  
  return ServiceResponseDto.success('User found successfully', user);
}
```

## Error Handling Examples

### Throwing Exceptions (will be caught by HttpExceptionFilter)

```typescript
async update(id: number, updateUserDto: UpdateUserDto): Promise<ServiceResponseDto<User>> {
  const user = await this.userRepository.findOne({ where: { id } });
  
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  
  const updatedUser = await this.userRepository.save({
    ...user,
    ...updateUserDto,
  });
  
  return ServiceResponseDto.success('User updated successfully', updatedUser);
}
```

## Response Format

### Success Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Your data here
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "error": {
    // Error details here
  }
}
``` 