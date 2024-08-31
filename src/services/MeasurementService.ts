import {Request, Response} from "express";
import {AppDataSource} from "../data-source";
import {Measurements} from "../entities/Measuraments";
import GeminiService from "./GeminiService";
import {MeasurementTypeEnum} from "../models/MeasurementTypeEnum";
import UserService from "./UserService";
import { validate as isUuid, v4 } from 'uuid';
import AbstractService from "./AbstractService";
import {imageHolder} from "../imageHolder";
import {GoogleGenerativeAI} from "@google/generative-ai";

export class MeasurementService {
    public async uploadMeasurementUrl(req: Request, res: Response, imageHolder: { [key: string]: { base64: string; expiresAt: number } },
                                      geminiAPIKey: string | undefined) {
        const { image, customer_code, measure_datetime, measure_type } = req.body;

        try {
            // Validation
            if (!image || !customer_code || !measure_datetime || !measure_type) {
                return AbstractService.constructBadResponseObj(res, 400, 'INVALID_DATA', 'Os dados fornecidos no corpo da requisição são inválidos');
            }

            if (measure_type && MeasurementTypeEnum[measure_type] == undefined) {
                return AbstractService.constructBadResponseObj(res, 400, 'INVALID_DATA', 'Parâmetro measure type diferente de WATER ou GAS');
            }

            const int_measure_type = MeasurementTypeEnum[measure_type as keyof typeof MeasurementTypeEnum]

            // Validate measure_datetime
            const datetime= await MeasurementService.searchMeasurement(new Date(measure_datetime), customer_code, int_measure_type);
            if (datetime) {
                return AbstractService.constructBadResponseObj(res, 409, 'DOUBLE_REPORT', 'Leitura do mês já realizada')
            }

            const geminiService = new GeminiService(new GoogleGenerativeAI(geminiAPIKey ?? ''));

            const result = await geminiService.fetchMeasurementByImage(image);

            const image_url = MeasurementService.storeImageInImageHolder(image);

            const insertedMeasurement = await MeasurementService.saveMeasurement(customer_code, measure_datetime, int_measure_type, result.response.text().replace(/\D/g, ''), image_url);

            // Output the generated text to the console
            if (insertedMeasurement) {
                return res.status(200).json({ image_url: image_url, measure_value: parseInt(insertedMeasurement.raw[0].value), measure_uuid: insertedMeasurement.raw[0].id });
            }

            throw new Error('Insert failed!');
        } catch (error) {
            console.error('Error uploading data:', error);
            return AbstractService.constructBadResponseObj(res, 500, 'ERROR', 'Internal server error')
        }
    }

    public async confirmMeasurement(req: Request, res: Response){
        const { measure_uuid, confirmed_value } = req.body;

        try {
            if (!measure_uuid || !isUuid(measure_uuid) || !confirmed_value || !Number.isInteger(confirmed_value)) {
                return AbstractService.constructBadResponseObj(res, 400, 'INVALID_DATA', 'Os dados fornecidos no corpo da requisição são inválidos');
            }

            const measurementByUUID = await MeasurementService.getMeasurementByUUID(measure_uuid);

            if (!measurementByUUID) {
                return AbstractService.constructBadResponseObj(res, 404, 'MEASURE_NOT_FOUND', 'Leitura do mês já realizada')
            }

            if (measurementByUUID.hasConfirmed) {
                return AbstractService.constructBadResponseObj(res, 409, 'CONFIRMATION_DUPLICATE', 'Leitura do mês já realizada')
            }

            // Update the hasConfirmed field to true
            measurementByUUID.hasConfirmed = true;

            // If the confirmed value is somewhat different from the GEMINI reading, the logic will store the req body value
            if (parseInt(measurementByUUID.value) !== confirmed_value) {
                measurementByUUID.value = confirmed_value;
            }

            await AppDataSource.getRepository(Measurements).save(measurementByUUID);

            return res.status(200).json({ success: true });
        } catch (err) {
            console.log(err)
            return AbstractService.constructBadResponseObj(res, 500, 'ERROR', 'Internal server error')
        }
    }

    public async listMeasurementsByCustomer(req: Request, res: Response){
        const { customer_code } = req.params;
        const { measure_type } = req.query

        try {
            if (measure_type && typeof measure_type === "string") {
                if (MeasurementTypeEnum[measure_type as keyof typeof MeasurementTypeEnum] == undefined) {
                    return AbstractService.constructBadResponseObj(res, 400, 'INVALID_DATA', 'Parâmetro measure type diferente de WATER ou GAS');
                }
            }

            let measures = await MeasurementService.getMeasurementsByUserCode(customer_code)

            if (measures.length == 0) {
                return AbstractService.constructBadResponseObj(res, 404, 'MEASURES_NOT_FOUND', 'Nenhuma leitura encontrada')
            }

            measures = measures.map((measurement) => {
                return {
                    ...measurement,
                    measure_type: MeasurementTypeEnum[measurement.measure_type] || measurement.measure_type
                };
            });


            return res.status(200).json({ customer_code: customer_code, measures: measures });
        } catch (err) {
            console.log(err)
            return AbstractService.constructBadResponseObj(res, 500, 'ERROR', 'Internal server error')
        }
    }

    static async saveMeasurement(customer_code: string, measure_datetime: Date, measure_type: number, value: string, image_url: string){
        try {
            await UserService.createUser(customer_code);

            return AppDataSource
                .createQueryBuilder()
                .insert()
                .into(Measurements)
                .values({
                    user: customer_code,
                    measurementDate: measure_datetime,
                    type: measure_type,
                    value: value,
                    imageUrl: image_url
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
