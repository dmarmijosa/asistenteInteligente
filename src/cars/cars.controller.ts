import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {CarsService} from "./cars.service";
import {Car} from "./entities/car.entity";

@Controller('cars')
export class CarsController {
    constructor(private readonly carService:CarsService) {}

    @Get()
    findAll():Promise<Car[]>{
        return this.carService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Car | null>{
        return this.carService.findOne(+id);
    }

    @Post()
    create(@Body() carData:Partial<Car>):Promise<Car>{
        return this.carService.create(carData);
    }

    @Patch(':id')
    update(@Param('id') id:string, @Body() carData: Partial<Car>):Promise<Car | null>{
        return this.carService.update(+id, carData)
    }

    @Delete(':id')
    remove(@Param('id') id:string): Promise<void>{
        return this.carService.remove(+id);
    }

}

