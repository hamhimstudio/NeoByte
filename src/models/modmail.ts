import "reflect-metadata";
import { Column, Entity } from "typeorm";
import BaseModel from "./baseModel.js";

export const enum modmailState {
  OPEN,
  CLOSED,
}

export const modmailReason: {label: string, description?: string, value?: string}[] = [
  { label: "General", description: "For General Inquiries" },
  { label: "Report", value: "Report a Member." },
  { label: "Appeal" },
  { label: "Other" },
];

@Entity({ name: "modmail" })
export default class modmail extends BaseModel {
  @Column()
  assignedModeratorId?: string;

  @Column()
  state: modmailState;

  @Column()
  userId: string;

  @Column()
  channelId: string;

  @Column()
  guildId: string;

  @Column()
  reason: string;

  @Column()
  creationTimestamp: Date;
}
