import { ObjectId } from "mongodb";
import { Inject, Service } from "typedi";
import warn from "../models/warn.js";
import warnRepository from "../repositories/warnRepository.js";


@Service()
export default class warnService {
    @Inject()
    warnRepository: warnRepository

    async findWarning(id: string) {
        return await this.warnRepository.findOne({ where: { _id: ObjectId.createFromHexString(id) 
        } })
    }

    async getWarningForUser(userId: string, guildId: string) {
        return await this.warnRepository.getWarningForUser(userId, guildId);
    }

    async createWarning(userId: string, guildId: string, reason: string, moderatorUserId: string, anonymous: boolean, points: number) {
        return await this.warnRepository.createWarning(userId, guildId, reason, moderatorUserId, anonymous, points);
      }
      
    async removeWarning(warn: warn) {
        return await this.warnRepository.removeWarning(warn);
    }
    async updateWarning(warn: warn) {
        return await this.warnRepository.save(warn);
    }

}