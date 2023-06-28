import { Service } from "typedi";
import warn from "../models/warn.js";
import baseRepository from "./baseRepository.js";

@Service()
export default class warnRepository extends baseRepository<warn> {
    constructor() {
        super(warn);
    }

    async getWarningForModerationUser(userId: string, guildId?: string) {
        return await this.find({
            moderatorUserId: { $eq: userId },
            guildId: { $eq: guildId },
        });
    }

    async getWarningForUser(userId: string, guildId: string) {
        return await this.find({
            userId: { $eq: userId },
            guildId: { $eq: guildId },
        });
    }
    async createWarning(
        userId: string,
        guildId: string,
        reason: string,
        moderatorUserId: string,
        anonymous: boolean,
        points: number
    ) {
        const warning = this.repository.create();
        warning.userId = userId;
        warning.guildId = guildId;
        warning.reason = reason;
        warning.moderatorUserId = moderatorUserId;
        warning.anonymous = anonymous;
        warning.points = points;
        warning.timestamp =  new Date();
        // warning.points = points;
        return await this.save(warning);
    }

    async removeWarning(warn: warn) {
        return await this.delete(warn);
    }
    
}