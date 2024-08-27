import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./Users";
import {MeasurementTypes} from "./MeasurementType";

@Entity()
export class Measurements {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Users, (user) => user.code)
    userCode!: number

    @ManyToOne(() => MeasurementTypes, (type) => type.id)
    type!: number;

    @Column()
    value: string;

    @Column()
    imageUrl: string

    @Column()
    hasConfirmed: boolean;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    constructor(value: string, imageUrl: string, hasConfirmed: boolean) {
        this.value = value;
        this.imageUrl = imageUrl;
        this.hasConfirmed = hasConfirmed;
    }
}
