import "reflect-metadata";
import { Column, Entity } from "typeorm";
import BaseModel from "./baseModel.js";

@Entity({ name: "user-warnings" })
export default class warn extends BaseModel {
    @Column()
    moderatorUserId: string;

    @Column()
    userId: string;

    @Column()
    guildId: string;

    @Column()
    reason: string;

    // @Column()
    // points: number;

    @Column()
    timestamp: Date;
}
