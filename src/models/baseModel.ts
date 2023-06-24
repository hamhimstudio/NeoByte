import "reflect-metadata";
import {
    ObjectId,
    ObjectIdColumn,
    ObjectLiteral,
} from "typeorm";
class BaseModel implements ObjectLiteral {
    @ObjectIdColumn()
    _id: ObjectId;
}

export default BaseModel;
