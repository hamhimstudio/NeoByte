import { DataSource } from "typeorm";
import warn from "../models/warn.js";
import serverSettings from "../models/serverSettings.js";


const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: Number(process.env.MONGODB_PORT)|| 27017,
    database: process.env.MONGODB_DB || "discord-bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    entities: [warn, serverSettings],
    synchronize:true,
})

export default connection;

