import { Events, SlashCommandBuilder } from "discord.js";

export default interface ICommand {
    data: SlashCommandBuilder
    execute: (eventData:any) => Promise<void> | void
}