import {Request, Response} from "express";
import {AppDataSource} from "../data-source";
import {Measurements} from "../entities/Measuraments";
import GeminiService from "./GeminiService";
import {MeasurementTypeEnum} from "../models/MeasurementTypeEnum";
import UserService from "./UserService";

export class MeasurementService {
    static async searchMeasurement(dateTime: Date, customerCode: string, measureType: number) {
        const [measurements, count] = await AppDataSource.getRepository(Measurements)
            .createQueryBuilder('measurement')
            .leftJoinAndSelect('measurement.user', 'user')
            .where('user.code = :customerCode', { customerCode })
            .andWhere('measurement.measurementDate = :dateTime', { dateTime })
            .andWhere('measurement.type = :measureType', { measureType })
            .getManyAndCount();

        return count > 0;
    }
}

export default new MeasurementService();
