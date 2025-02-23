import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Car} from "./entities/car.entity";
import {MoreThan, Repository} from "typeorm";

@Injectable()
export class CarsService {
    constructor(@InjectRepository(Car)
                private readonly carRepository: Repository<Car>,) {
    }

    findAll(): Promise<Car[]> {
        return this.carRepository.find();
    }

    findOne(id: number): Promise<Car | null> {
        return this.carRepository.findOne({where: {id}})
    }

    create(carData: Partial<Car>): Promise<Car> {
        const newCar = this.carRepository.create(carData);
        return this.carRepository.save(newCar);
    }

    async update(id: number, carData: Partial<Car>) {
        await this.carRepository.update(id, carData);
        return this.findOne(id)
    }

    async remove(id: number): Promise<void> {
        await this.carRepository.delete(id)
    }

    async createBulk(carsData: Partial<Car>[]): Promise<Car[]> {
        const newCars = this.carRepository.create(carsData);
        return this.carRepository.save(newCars);
    }

    async findWithPriceGreaterThan(minPrice: number): Promise<Car[]> {
        return this.carRepository.find({
            where: {precio: MoreThan(minPrice)},
        });
    }

    async findBy(query: any): Promise<Car[]> {
        return this.carRepository.find({where: query});
    }
}
