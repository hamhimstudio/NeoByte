import type { ArgsOf } from "discordx"
import { Discord, On } from "discordx"
import { GuildMember, ThreadChannel, ForumChannel } from "discord.js"
import { Inject } from "typedi"
import welcomeService from "../services/welcomeService.js"
import removeRoleService from "../services/removeRoleService.js"
import autoPingRole from "./../services/autoPingService.js"

@Discord()
export class ReadyEvent {
    @On({ event: "ready" })
    readyEvent([client]: ArgsOf<"ready">): void {
        console.log("Bot is ready and logged in as " + client.user?.tag)
    }
}
@Discord()
export class MemberJoinEvent {
    @Inject()
    welcomeService: welcomeService
    @On({ event: "guildMemberAdd" })
    async memberJoinEvent([member]: ArgsOf<"guildMemberAdd">): Promise<void> {
        const guildId = member.guild.id
        try {
            await this.welcomeService.sendWelcomeMessage(member, guildId)
        } catch (error) {
            console.error("Error in memberJoinEvent:", error)
        }
    }
}
@Discord()
export class MemberUpdateEvent {
    @Inject()
    removeRoleService: removeRoleService
    @On({ event: "guildMemberUpdate" })
    async memberJoinEvent([
        member,
    ]: ArgsOf<"guildMemberUpdate">): Promise<void> {
        const guildId = member.guild.id
        try {
            await this.removeRoleService.removeUnverifiedRole(
                member as GuildMember,
                guildId
            )
        } catch (error) {
            console.error("Error in guildMemberUpdate event listener:", error)
        }
    }
}
@Discord()
export class ThreadCreateEvent {
    @Inject()
    autoPingRole: autoPingRole
    @On({ event: "threadCreate" })
    async postCreateEvent([thread]: ArgsOf<"threadCreate">): Promise<void> {
        const threadChannel = thread as ThreadChannel
        const guildId = thread.guild.id
        await this.autoPingRole.pingHelperRole(guildId, threadChannel)
    }
}
