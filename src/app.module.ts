import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // Assuming you have an auth module

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // Your PostgreSQL username
      password: 'laiP1911844', // Your PostgreSQL password
      database: 'ExportersLoom', // Your PostgreSQL database
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Path to your entities
      synchronize: true, // Automatically synchronize your database with entities (use false in production)
    }),
    UsersModule,  // Include your UsersModule
    AuthModule,   // Include any other necessary modules
  ],
})
export class AppModule {}
