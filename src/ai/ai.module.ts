import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import {OpenAiService} from "./openai.service";
import {CarsModule} from "../cars/cars.module";


@Module({
  imports:[CarsModule],
  controllers: [AiController],
  providers: [ OpenAiService],
  exports: [AiService],
})
export class AiModule {}
