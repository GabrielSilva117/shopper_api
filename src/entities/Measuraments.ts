import {
    Column,
    CreateDateColumn,
    Entity, JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./Users";
import {MeasurementTypeEnum} from "../models/MeasurementTypeEnum";

@Entity()
export class Measurements {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Users, (user) => user.code)
    @JoinColumn({ referencedColumnName: "code" })
    user!: number

    @Column()
    type: MeasurementTypeEnum;

    @Column({nullable: true})
    value: string;

    @Column({nullable: true})
    imageUrl: string

    @Column({default: false})
    hasConfirmed: boolean;

    @Column()
    measurementDate: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    constructor(value: string, imageUrl: string, hasConfirmed: boolean, measurementDate: Date, type: MeasurementTypeEnum) {
        this.value = value;
        this.imageUrl = imageUrl;
        this.hasConfirmed = hasConfirmed;
        this.measurementDate = measurementDate;
        this.type = type;
    }
}
