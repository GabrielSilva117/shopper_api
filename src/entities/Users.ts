import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    code!: number;

    @Column({type: "varchar", length: 30})
    name: string;

    @Column({unique: true, type: "varchar", length: 40})
    email: string;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }
}
