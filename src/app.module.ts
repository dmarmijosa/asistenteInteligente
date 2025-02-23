import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CarsModule} from './cars/cars.module';
import {Car} from "./cars/entities/car.entity";
import {ConfigModule} from "@nestjs/config";
import { AiModule } from './ai/ai.module';

// @ts-ignore
@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      TypeOrmModule.forRoot({
         type: 'postgres',
         host: process.env.DB_HOST || 'localhost',
         port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
         username: process.env.DB_USER || 'postgres',
         password: process.env.DB_PASS || 'postgres',
         database: process.env.DB_NAME || 'mi_asistente_db',
         entities: [Car],
         synchronize: true,
      }),
      CarsModule,
      AiModule
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {
}
