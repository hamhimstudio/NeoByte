import {
  ApplicationCommandOptionType,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Inject } from "typedi";
import serverSettingsService from "../../services/serverSettingsService.js";

@Discord()
export class ServerSettingsCommand {
  @Inject()
  serverSettings: serverSettingsService;
  @Slash({
    description: "Sets the Log Channel",
    dmPermission: false,
    defaultMemberPermissions: ["ManageGuild"],
  })
  async setlogchannel(
    @SlashOption({
      name: "channel",
      description: "The channel to set as the log channel",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    })
    logChannel: TextChannel,
    interaction: CommandInteraction
  ): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply("You must be in a guild!");
      return;
    }
    await interaction.deferReply();

    const guild = interaction.guild;

    const serverSettings = await this.serverSettings.getSettings(guild.id);

    serverSettings.logsChannelId = logChannel.id;
    try {
      await this.serverSettings.createOrUpdateSettings(serverSettings);
    } catch (exc) {
      console.error(exc);
      await interaction.editReply("Failed to set the log channel!");
      return;
    }
    interaction.editReply("Successfully set the log channel!");
  }
}
