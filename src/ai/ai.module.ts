import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import {OpenAiService} from "./openai.service";
import {CarsModule} from "../cars/cars.module";


@Module({
  imports:[CarsModule],
  controllers: [AiController],
  providers: [AiService, OpenAiService],
  exports: [AiService],
})
export class AiModule {}
