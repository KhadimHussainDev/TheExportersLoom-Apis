import { Controller, Post, Body, HttpException, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('signup')
    @UsePipes(new ValidationPipe({
        whitelist: true,             // Strip any extra fields not defined in the DTO
        forbidNonWhitelisted: true,  // Reject requests with extra fields
        transform: true,             // Automatically transform payloads to the expected DTO
        exceptionFactory: (errors) => {
            const messages = errors.map(
                err => `${err.property} - ${Object.values(err.constraints).join(', ')}`
            );
            return new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: messages,
                error: 'Bad Request'
            }, HttpStatus.BAD_REQUEST);
        }
    }))
    async signUp(@Body() createUserDto: CreateUserDto): Promise<any> {
        console.log('Sign-up request received', createUserDto);
        try {
            const result = await this.usersService.create(createUserDto);
            return { success: true, ...result };
        } catch (error) {
            console.error('Error occurred during signup:', error);
            throw new HttpException({
                success: false,
                message: 'User registration failed',
                error: error.message || 'Unknown error occurred'
            }, HttpStatus.BAD_REQUEST);
        }
    }
}
