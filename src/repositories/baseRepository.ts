import {
  DataSource,
  EntityTarget,
  FilterOperators,
  MongoRepository,
  ObjectLiteral,
} from "typeorm";
import { MongoFindManyOptions } from "typeorm/find-options/mongodb/MongoFindManyOptions";
import { MongoFindOneOptions } from "typeorm/find-options/mongodb/MongoFindOneOptions";
import connection from "./connection.js";

export default class baseRepository<T extends ObjectLiteral> {
  connection: DataSource;
  repository: MongoRepository<T>;

  constructor(instance: EntityTarget<T>) {
    this.connection = connection;
    this.repository = this.connection.getMongoRepository<T>(instance)
  }
  create() {
    return this.repository.create();
  }
  async delete(item: T) {
    return await this.repository.delete(item);
  }
  async save(item: T) {
    return await this.repository.save(item);
  }
  async find(options: MongoFindManyOptions<T> | Partial<T> | FilterOperators<T>) {
    return await this.repository.find(options);
  }
  async findAll() {
    return await this.repository.find();
  }
  async findOne(options: MongoFindOneOptions<T>) {
    return await this.repository.findOne(options);
  }
}


