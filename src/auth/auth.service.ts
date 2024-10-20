import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // Generates JWT token for a user
  async generateJwt(user: any): Promise<{ accessToken: string; refreshToken?: string }> {
    const payload = { username: user.email, sub: user.id }; // Adjust payload structure to fit your user entity

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
