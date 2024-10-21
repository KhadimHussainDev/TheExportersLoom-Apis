import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsString()
    userType: string;

    @IsString()
    name: string;

    @IsString()
    companyName: string;

    @IsString()
    phone: string;

    @IsString()
    cnic: string;

    @IsString()
    address: string;
}
