import {
    ApplicationCommandOptionType,
    AttachmentBuilder,
    ChannelType,
    CommandInteraction,
    TextBasedChannel,
    TextChannel,
  } from "discord.js";
  import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import transcript from "../services/transcript.js";
import getMessages from "../utils/fetchManyMessages.js";
  
  @Discord()
  @SlashGroup({ description: "Bump Reminder", name: "transcript" })
  @SlashGroup("transcript")
  export class transcriptcmd {
    async startTranscript(channel: TextBasedChannel) {
      const foundMessages = await getMessages(channel, -1);
      var data = new transcript({ messages: foundMessages });
      var html = data.getHtml();
      return html;
    }
  
    @Slash({
      description: "Create a Transcript",
      defaultMemberPermissions: ["ManageMessages"],
    })
    async create(
      @SlashOption({
        name: "channel",
        description: "the channel where you want the transcript from",
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      })
      channel: TextBasedChannel,
      interaction: CommandInteraction
    ) {
      await interaction.deferReply();
      var attachment = new AttachmentBuilder(
        Buffer.from(
          await this.startTranscript(channel || interaction.channel!),
          "utf8"
        ),
        {
          name: ((channel || interaction.channel!) as TextChannel).name + ".html",
        }
      );
  
      await interaction.editReply({ files: [attachment] });
    }
  }
  