import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MachineModule } from './machines/machine.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProjectModule } from './project/project.module';
import { SeederModule } from './scripts/seeder.module';
import { LogoPrintingModule } from './modules/logo-printing module/logo-printing.module';
import { CuttingModule } from './modules/cutting module/cutting.module';
import { StitchingModule } from './modules/stitching module/stitching.module';
import { PackagingModule } from './modules/packaging module/packaging.module';
import { BidModule } from './bid/bid.module';
import { OrderModule } from './order/order.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CostEstimationModule } from './cost-estimation/cost-estimation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const entities = [__dirname + '/**/*.entity{.ts,.js}'];
        // console.log('Entities being loaded:', entities);

        return {
          type: configService.get<string>('DB_TYPE') as 'postgres',
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities,
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
          // logging: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    MachineModule,
    ProjectModule,
    LogoPrintingModule,
    CuttingModule,
    StitchingModule,
    SeederModule,
    PackagingModule,
    MessagesModule,
    NotificationsModule,
    BidModule,
    OrderModule,
    ReviewsModule,
    CostEstimationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
