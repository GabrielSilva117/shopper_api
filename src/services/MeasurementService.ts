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

    static async saveMeasurement(customer_code: number, measure_datetime: Date, measure_type: number){
        try {
            await UserService.createUser(customer_code);

            return AppDataSource
                .createQueryBuilder()
                .insert()
                .into(Measurements)
                .values({
                    user: customer_code,
                    measurementDate: measure_datetime,
                    type: measure_type
                })
                .execute()
        } catch (e) {
            console.error(e)
        }
    }

    static storeImageInImageHolder(image: string){
        const id = v4(); // Generate a unique ID for the image
        const expiresAt = Date.now() + 3600000; // 1 hour from now
        imageHolder[id] = { base64: image, expiresAt };
        return `http://localhost:8080/image/${id}`;
    }


    static async searchMeasurement(dateTime: Date, customerCode: string, measureType: number) {
        const count = await AppDataSource.getRepository(Measurements)
            .createQueryBuilder('measurement')
            .leftJoinAndSelect('measurement.user', 'user')
            .where('user.code = :customerCode', { customerCode })
            .andWhere('measurement.measurementDate = :dateTime', { dateTime })
            .andWhere('measurement.type = :measureType', { measureType })
            .getCount();

        return count > 0;
    }

    static getMeasurementByUUID(uuid: string) {
        return AppDataSource
            .getRepository(Measurements)
            .createQueryBuilder('measurement')
            .where('measurement.id = :uuid', { uuid: uuid })
            .getOne();
    }

    static getMeasurementsByUserCode(user_code: string) {
        return AppDataSource
            .getRepository(Measurements)
            .createQueryBuilder('measurement')
            .select('measurement.id', 'measurement_uuid')
            .addSelect('measurement.measurementDate', 'measurement_datetime')
            .addSelect('measurement.type', 'measure_type')
            .addSelect('measurement.hasConfirmed', 'has_confirmed')
            .addSelect('measurement.imageUrl', 'image_url')
            .where('measurement.user = :code', { code: user_code })
            .getRawMany()
    }
}

export default new MeasurementService();
