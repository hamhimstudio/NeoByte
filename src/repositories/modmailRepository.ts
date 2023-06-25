import { Service } from "typedi";
import baseRepository from "./baseRepository.js";
import modmail, { modmailState } from "../models/modmail.js";

@Service()
export default class modmailRepository extends baseRepository<modmail> {
  constructor() {
    super(modmail);
  }
  async getMailsForUser(userId: string, guildId: string, state?: modmailState) {
    const filter: { [key: string]: any } = {
      userId: {
        $eq: userId,
      },
      guildId: { $eq: guildId },
    };
    if (state) filter.state = { $eq: state };
    return await this.repository.find({ where: filter });
  }

  async getMailsForModerator(
    userId: string,
    guildId: string,
    state?: modmailState
  ) {
    const filter: { [key: string]: any } = {
      assignedModeratorId: {
        $eq: userId,
      },
      guildId: { $eq: guildId },
    };
    if (state) filter.state = { $eq: state };
    return await this.repository.find({ where: filter });
  }

  async createmail(
    userId: string,
    guildId: string,
    reason: string,
    channel: string
  ) {
    const modmail = this.repository.create();
    modmail.userId = userId;
    modmail.guildId = guildId;
    modmail.reason = reason;
    modmail.state = modmailState.OPEN;
    modmail.channelId = channel;
    return await this.save(modmail);
  }

  async removemail(mail: modmail) {
    return await this.delete(mail);
  }
}
