import { DataSource } from 'typeorm';
import 'reflect-metadata';
import {Users} from "./entities/Users";
import {Measurements} from "./entities/Measuraments";
import {MeasurementTypes} from "./entities/MeasurementType";

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'shopperapi',
    synchronize: true,
    logging: false,
    entities: [Users, Measurements, MeasurementTypes],
    migrations: [],
    subscribers: [],
});

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });
