import { CommandInteraction, PermissionResolvable } from "discord.js";
import { ArgsOf, GuardFunction } from "discordx";
import { text } from "stream/consumers";

export function RequirePermissionGuard(permission: PermissionResolvable) {
  const guard: GuardFunction<CommandInteraction> = async (
    arg,
    client,
    next
  ) => {
    if (!arg.inGuild || !arg.member || typeof(arg.member.permissions) === "string" ) {
      await next();
      return;
    }
    if (!arg.member.permissions.has(permission, true)) {
      await arg.reply("You don't have permission to use this command!");
      return;
    }
    next()
  };

  return guard;
}
