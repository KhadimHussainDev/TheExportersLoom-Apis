# Standardized API Response Structure

This directory contains components for standardizing API responses across the application.

## Overview

All API responses in the application follow a standardized structure, making it easier for frontend developers to handle responses consistently. This structure applies to both successful responses and error responses.

## Response Structure

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

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

## Components

### ApiResponseDto

The `ApiResponseDto` class defines the structure for all API responses. It includes:

- `success`: Boolean indicating whether the request was successful
- `statusCode`: HTTP status code
- `message`: Response message
- `data`: Optional response data
- `error`: Optional error details

### ResponseInterceptor

The `ResponseInterceptor` automatically transforms all controller responses to the standardized format.

### HttpExceptionFilter

The `HttpExceptionFilter` catches all exceptions and transforms them into the standardized error response format.

### ServiceResponseDto

The `ServiceResponseDto` is used internally by services to return responses with a message and optional data.

## Usage

### In Controllers

```typescript
@Get()
findAll() {
  // The response interceptor will automatically wrap this in a standardized response
  return this.usersService.findAll();
}

@Get(':id')
findOne(@Param('id') id: string) {
  // Explicitly use ApiResponseDto for more control
  return ApiResponseDto.success(200, 'User found successfully', this.usersService.findOne(+id));
}
```

### In Services

```typescript
async findAll(): Promise<ServiceResponseDto<User[]>> {
  const users = await this.userRepository.find();
  return ServiceResponseDto.success('Users retrieved successfully', users);
}
```

### Error Handling

```typescript
if (!user) {
  throw new NotFoundException(`User with ID ${id} not found`);
  // The HttpExceptionFilter will catch this and transform it to the standardized error response
}
```

## Service Layer Exception Handling

In our architecture, services are responsible for:

1. Implementing business logic
2. Accessing data repositories
3. Throwing appropriate exceptions when errors occur

Services should NOT format responses - that's the controller's job. Instead, services should:

- Return raw data for successful operations
- Throw appropriate NestJS exceptions for errors

### Exception Handling Guidelines

1. **Use NestJS Built-in Exceptions**: Always use NestJS built-in exception classes like `NotFoundException`, `BadRequestException`, etc.

2. **Provide Descriptive Error Messages**: Include specific details in error messages to help with debugging.

3. **Don't Catch Exceptions Unless Necessary**: Let exceptions bubble up to the controller where they'll be caught by the global exception filter.

4. **When to Catch Exceptions**: Only catch exceptions when you need to:
   - Transform them into a different type of exception
   - Perform cleanup operations
   - Log specific error details

### Example Service Method

```typescript
async findOne(id: number): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });
  
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  
  return user;
}
```

### Handling Transactions

When working with transactions, use a try/catch block and rethrow the exception:

```typescript
async createUser(createUserDto: CreateUserDto): Promise<User> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Transaction operations...
    const user = queryRunner.manager.create(User, createUserDto);
    await queryRunner.manager.save(user);
    
    await queryRunner.commitTransaction();
    return user;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    
    if (error.code === '23505') { // PostgreSQL unique violation
      throw new ConflictException('User with this email already exists');
    }
    
    throw error; // Rethrow other errors
  } finally {
    await queryRunner.release();
  }
}
```

## Frontend Handling

On the frontend, you can easily check if a response was successful:

```javascript
api.get('/users').then(response => {
  if (response.success) {
    // Handle successful response
    const data = response.data;
    console.log(response.message);
  } else {
    // Handle error response
    console.error(response.message);
    console.error(response.error);
  }
});
```

## Summary of Implementation

We've implemented a standardized API response structure with the following components:

1. **ApiResponseDto**: A class that defines the structure for all API responses.
2. **ResponseInterceptor**: An interceptor that automatically transforms all responses to the standardized format.
3. **HttpExceptionFilter**: A filter that catches all exceptions and transforms them into the standardized error format.
4. **ServiceResponseDto**: A class used internally by services to return responses with a message and optional data.

These components work together to ensure that all API responses follow the same structure, making it easier for frontend developers to handle responses consistently.

### Key Benefits

- **Consistency**: All API responses follow the same structure.
- **Simplicity**: Frontend developers can easily check if a response was successful.
- **Error Handling**: All errors are transformed into a standardized format.
- **Flexibility**: Controllers can still return custom responses when needed.

### Example Implementation

We've included an example controller (`ExampleController`) that demonstrates how to use the standardized response structure. This controller includes examples of:

- Basic success responses
- Explicit success responses
- Error responses
- Responses with no data

You can use this controller as a reference when implementing your own controllers. 