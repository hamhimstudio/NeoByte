import "reflect-metadata"
import { Column, Entity } from "typeorm"
import BaseModel from "./baseModel.js"

@Entity({ name: "server-settings" })
export default class serverSettings extends BaseModel {
    @Column()
    guildId: string

    @Column()
    logsChannelId?: string

    @Column()
    welcomeMessageChannelId?: string

    @Column()
    welcomeMessage?: string

    @Column()
    unverifiedRole?: string

    @Column()
    autoPingRole?: string

    @Column()
    helpChannel?: string
}
