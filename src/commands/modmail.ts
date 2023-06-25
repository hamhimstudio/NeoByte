import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import { Discord, Guard, SelectMenuComponent, Slash, SlashGroup } from "discordx";
import githubService from "../services/githubService.js";
import { Inject } from "typedi";
import modmailService from "../services/modmailService.js";
import { RequirePermissionGuard } from "../guards/RequirePermissionGuard.js";
import { modmailReason } from "../models/modmail.js";

@SlashGroup({
  description: "Mod Mail related commands",
  name: "mail",
  dmPermission: false,
})
@SlashGroup("mail")
@Discord()
export class ModMailCommands {
  static generateEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle("Modmail");
    embed.setDescription(`# Welcome!
Select a inquiry reason and a Mod Mail Channel will be created!`);

    const menu = new StringSelectMenuBuilder()
      .addOptions(
        modmailReason.map((reason) => {
          return {
            label: reason.label,
            value: reason.value || reason.label,
            description: reason.description,
          };
        })
      )
      .setMaxValues(1)
      .setPlaceholder("Select a reason!")
      .setCustomId("modmail-create");
    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        menu
      );
    return { embeds: [embed], components: [buttonRow] };
  }

  @Inject()
  modmailService: modmailService;

  @Slash({
    description: "Claims a modmail.",
    dmPermission: false,
  })
  @Guard(RequirePermissionGuard("ManageMessages"))
  async claim(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    try {
      await this.modmailService.claimMail(
        interaction.channelId,
        interaction.user.id
      );
    } catch (exception) {
      if (exception instanceof Error) {
        console.log(exception.message);
        interaction.editReply(exception.message || "Something went wrong");
      }
    }

    interaction.editReply("Mail successfully claimed");
  }

  @Slash({
    description: "Closes this modmail.",
    dmPermission: false,
  })
  async close(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    try {
      await this.modmailService.closeMail(interaction.channelId);
    } catch (exception) {
      if (exception instanceof Error) {
        console.log(exception.message);
        await interaction.editReply(
          exception.message || "Something went wrong"
        );
        return;
      }
    }
    await interaction.editReply("Mail successfully closed");

    await interaction.channel
      ?.send(`This modmail has been closed! By ${interaction.user.toString()}
If you want to reopen it, please use \`/mail open\``);
  }

  @Slash({
    description: "Reopens this modmail.",
    dmPermission: false,
  })
  async open(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    try {
      await this.modmailService.openMail(interaction.channelId);
    } catch (exception) {
      if (exception instanceof Error) {
        console.log(exception.message);
        await interaction.editReply(
          exception.message || "Something went wrong"
        );
        return;
      }
    }
    await interaction.editReply("Mail successfully closed");

    await interaction.channel
      ?.send(`This modmail has been reopened! By ${interaction.user.toString()}
If you want to close it, please use \`/mail close\``);
  }

  @Slash({
    description: "Posts the Mod Mail Hub Message.",
    dmPermission: false,
  })
  @Guard(RequirePermissionGuard("ManageGuild"))
  async hub(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await interaction.channel?.send(ModMailCommands.generateEmbed());

    await interaction.editReply("Hub message successfully posted");
  }

  @SelectMenuComponent({id: "modmail-create"})
  async createMail(interaction:StringSelectMenuInteraction): Promise<void> {
    if(!interaction.guild || !interaction.member ||  !(interaction.member instanceof GuildMember)) return;
    await interaction.deferReply({ephemeral: true});
    const reason = interaction.values[0];
    
    if(!reason) {
      await interaction.editReply("Something went wrong!");
      return;
    }

    const modmail = await this.modmailService.createMail(interaction.member, interaction.guild, reason);

    await interaction.editReply(`Modmail created! <#${modmail.channel.id}>`);
  }
}
