import { Controller, Post, Body, HttpException, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}


    @Post('signup')
    
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

