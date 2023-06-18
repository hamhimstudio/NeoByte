import { ClientEvents } from "discord.js";

export default interface IEvent {
    name: keyof ClientEvents
    once?: boolean
    execute: (...args:any) => Promise<void> | void
}