import { DataSource } from "typeorm";
import warn from "../models/warn.js";


const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: 2020,
    database: process.env.MONGODB_DB || "tce-bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    entities: [warn],
    synchronize:true,
})

export default connection;
