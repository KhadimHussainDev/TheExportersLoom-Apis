import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';  
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';  
import { AppService } from './app.service';  
import { MachineModule } from './machines/machine.module';
// import { ProjectModule } from './project/project.module';
import { SeederModule } from './scripts/seeder.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',  
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),  
        // logging: true,
      }),
    }),

    UsersModule,
    AuthModule,
    MachineModule,
    // ProjectModule,
    SeederModule,
  ],
  controllers: [AppController],  
  providers: [AppService],  
})
export class AppModule {}
