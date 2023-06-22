import { DataSource } from "typeorm"

const connection = new DataSource({
    type: "mongodb",
    host: process.env.MONGODB_URL || "localhost",
    port: Number(process.env.MONGODB_PORT)|| 27017,
    database: process.env.MONGODB_DB || "tce-bot",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    entities: [],
})

export default connection;
