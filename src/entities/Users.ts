import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({unique: true})
    code!: string;

    @Column({type: "varchar", length: 30})
    name: string;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    constructor(name: string) {
        this.name = name;
    }
}
