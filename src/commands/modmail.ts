import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  TextChannel,
} from "discord.js";
import {
  ButtonComponent,
  Discord,
  Guard,
  SelectMenuComponent,
  Slash,
  SlashGroup,
} from "discordx";
import { Inject } from "typedi";
import { RequirePermissionGuard } from "../guards/RequirePermissionGuard.js";
import { modmailReason } from "../models/modmail.js";
import modmailService from "../services/modmailService.js";
import { transcriptcmd } from "./transcript.js";

@SlashGroup({
  description: "ModMail commands",
  name: "mail",
  dmPermission: false,
})
@SlashGroup("mail")
@Discord()
export class ModMailCommands {
  static generateEmbed() {
    const embed = new EmbedBuilder();
    embed.setTitle("Modmail");
    embed.setDescription(`Welcome to our modmail system! Please select the reason behind creating this inquiry and a  inquiry channel will be created!`);

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
    description: "Claim an inquiry",
    dmPermission: false,
  })
  @Guard(RequirePermissionGuard("ManageMessages"))
  async claim(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();
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
      return;
    }

    interaction.editReply(`Inquiry claimed by ${interaction.user.toString()}`);
  }

  @Slash({
    description: "Close inquiry.",
    dmPermission: false,
  })
  async close(interaction: CommandInteraction): Promise<void> {
    if (
      !interaction.channel ||
      !interaction.inGuild() ||
      !interaction.channel.isTextBased() ||
      interaction.channel.type === ChannelType.GuildAnnouncement ||
      interaction.channel.isThread() ||
      interaction.channel.type === ChannelType.GuildStageVoice ||
      interaction.channel.type === ChannelType.GuildVoice
    )
      {
        await interaction.reply("This command can only be used in a valid text channel!");
        return
      };
    await interaction.deferReply({ ephemeral: true });
    try {
      await this.modmailService.closeMail(interaction.channel);
    } catch (exception) {
      if (exception instanceof Error) {
        console.log(exception.message);
        await interaction.editReply(
          exception.message || "Something went wrong"
        );
        return;
      }
    }

    await interaction.editReply("Inquiry successfully closed");

    const button = new ButtonBuilder()
      .setCustomId("remove_mail")
      .setLabel("Delete nquiry")
      .setStyle(ButtonStyle.Danger);
    const buttonRow =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        button
      );

    await interaction.channel?.send({
      content: `This inquiry has been closed by ${interaction.user.toString()}! If you wish to reopen it, please use the  \`/mail open\ slash command!`,
      components: [buttonRow],
    });
  }

  @Slash({
    description: "Reopen inquiry.",
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
    await interaction.editReply("Inquiry successfully reopened!");

    await interaction.channel
      ?.send(`This inquiry has been reopened! By ${interaction.user.toString()} If you wish close it again, please use the  \`/mail close\` slash command!`);
  }

  @Slash({
    description: "Post modmail embed",
    dmPermission: false,
  })
  @Guard(RequirePermissionGuard("ManageGuild"))
  async hub(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await interaction.channel?.send(ModMailCommands.generateEmbed());

    await interaction.editReply("Modmail message successfully posted");
  }

  @SelectMenuComponent({ id: "modmail-create" })
  async createMail(interaction: StringSelectMenuInteraction): Promise<void> {
    if (
      !interaction.guild ||
      !interaction.member ||
      !(interaction.member instanceof GuildMember)
    )
      return;
    await interaction.deferReply({ ephemeral: true });
    const reason = interaction.values[0];

    if (!reason) {
      await interaction.editReply("Something went wrong!");
      return;
    }

    const modmail = await this.modmailService.createMail(
      interaction.member,
      interaction.guild,
      reason
    );

    await interaction.editReply(`Inquiry created! <#${modmail.channel.id}>`);
  }

  @ButtonComponent({ id: "remove_mail" })
  async removeMail(interaction: ButtonInteraction): Promise<void> {
    if (
      !interaction.guild ||
      !interaction.member ||
      !(interaction.member instanceof GuildMember)
    )
      return;
    if (!interaction.member.roles.cache.has(process.env.MODMAIL_PING_ROLE!)) {
      await interaction.reply({
        content: "You don't have the permission to do that!",
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });

    await interaction.message.edit({ components: [] });
    const mail = await this.modmailService.findMailByChannel(
      interaction.channelId
    );
    if (!mail) {
      await interaction.editReply("This is not a inquiry channel");
      return;
    }
    try {
      await this.modmailService.removeMail(mail);
    } catch (exception) {
      if (exception instanceof Error) {
        console.log(exception.message);
        await interaction.editReply(
          exception.message || "Something went wrong"
        );
        return;
      }
    }
    await interaction.editReply("Inquiry successfully removed!");

    await interaction.channel?.send(
      `This inquiry has been removed by ${interaction.user.toString()}!`
    );
    if (interaction.channel) {
      var attachment = new AttachmentBuilder(
        Buffer.from(
          await transcriptcmd.startTranscript(interaction.channel, -1),
          "utf8"
        ),
        {
          name: (interaction.channel! as TextChannel).name + ".html",
        }
      );
      const user = await interaction.guild.members.fetch(mail.userId);
      await user.send({
        content: "Your inquiry has been deleted and archived.\nHere is the transcript!",
        files: [attachment],
      });
      const log_channel = await interaction.guild.channels.fetch(
        process.env.MODMAIL_LOG_CHANNEL!
      );
      if (log_channel instanceof TextChannel)
        await log_channel.send({
          content: "An inquiry has been deleted and archived.\nHere is the transcript!",
          files: [attachment],
        });

      setTimeout(() => {
        interaction.channel?.delete();
      }, 5000);
    }
  }
}
