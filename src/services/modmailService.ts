import { ObjectId } from "mongodb";
import { Inject, Service } from "typedi";
import modmailRepository from "../repositories/modmailRepository.js";
import modmail, { modmailState } from "../models/modmail.js";
import { bot } from "../main.js";
import { ChannelType, Guild, GuildMember, TextChannel } from "discord.js";

@Service()
export default class modmailService {
  @Inject()
  modmailRepository: modmailRepository;

  async findMail(id: string) {
    return await this.modmailRepository.findOne({
      where: { _id: ObjectId.createFromHexString(id) },
    });
  }

  async findMailByChannel(channel: string) {
    return await this.modmailRepository.findOne({
      where: { channelId: { $eq: channel } },
    });
  }

  async getMailsForUser(userId: string, guildId: string) {
    return await this.modmailRepository.getMailsForUser(userId, guildId);
  }

  async getMailsForModerator(userId: string, guildId: string) {
    return await this.modmailRepository.getMailsForModerator(userId, guildId);
  }

  async createMail(member: GuildMember, guild: Guild, reason: string) {
    const existingMail = await this.getMailsForUser(member.id, guild.id);

    const channel = await guild.channels.create({
      name: `modmail-for-${member.displayName}-${existingMail.length + 1}`,
      reason: `User ${member.displayName} requested a modmail channel`,
      type: ChannelType.GuildText,
      parent: process.env.MODMAIL_CATEGORY_ID!,
    });
    await channel.lockPermissions();
    await channel.permissionOverwrites.create(channel.guild.roles.everyone, {
      ReadMessageHistory: false,
      SendMessages: false,
      ViewChannel: false,
    });

    await channel.permissionOverwrites.create(member, {
      ReadMessageHistory: true,
      SendMessages: true,
      ViewChannel: true,
    });

    if (process.env.MODMAIL_PING_ROLE)
      await channel.permissionOverwrites.create(process.env.MODMAIL_PING_ROLE, {
        ReadMessageHistory: true,
        SendMessages: true,
        ViewChannel: true,
      });

    channel.send(`Hello ${member.toString()}! A moderator will be with you shortly. 
Please describe your inquiry in as much detail as possible.
> Reason : **${reason}**
<@&${process.env.MODMAIL_PING_ROLE}>`);

    return {
      modmail: await this.modmailRepository.createmail(
        member.id,
        guild.id,
        reason,
        channel.id
      ),
      channel: channel,
    };
  }

  async claimMail(channel: string, moderatorId: string) {
    const mail = await this.findMailByChannel(channel);
    if (!mail) throw new Error("This is not a valid modmail channel");
    mail.assignedModeratorId = moderatorId;
    return await this.modmailRepository.save(mail);
  }

  async closeMail(channel: TextChannel) {
    const mail = await this.findMailByChannel(channel.id);
    if (!mail) throw new Error("This is not a valid modmail channel");

    await channel.permissionOverwrites.delete(mail.userId);

    mail.state = modmailState.CLOSED;
    return await this.modmailRepository.save(mail);
  }

  async openMail(channel: string) {
    const mail = await this.findMailByChannel(channel);
    if (!mail) throw new Error("This is not a valid modmail channel");
    const chnl = await bot.channels.fetch(mail.channelId);
    mail.state = modmailState.OPEN;
    return await this.modmailRepository.save(mail);
  }

  async removeMail(mail: modmail) {
    return await this.modmailRepository.removemail(mail);
  }
  async updateMail(mail: modmail) {
    return await this.modmailRepository.save(mail);
  }
}
