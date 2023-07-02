import { Message, TextChannel } from "discord.js";
import { readFileSync } from "fs";
var template: string = readFileSync("./src/transcripts/template.html").toString();

var messageTemplate = `<div class="chatlog__message-group">
<div class="chatlog__author-avatar-container">
  <img
    class="chatlog__author-avatar"
    src="{user.avaturl}"
    alt="Avatar"
  />
</div>
<div class="chatlog__messages">
  <span
    class="chatlog__author-name"
    title="{user.name}"
    data-user-id="{user.id}"
    >{user.name}</span
  ><span class="chatlog__timestamp">{message.timestamp}</span>
  <div
    class="chatlog__message"
    data-message-id="{message.id}"
    id="message-{message.id}"
    title="Message sent: {message.timestamp}"
  >
    <div class="chatlog__content">
      <div class="markdown">
        <span class="preserve-whitespace">{message.content}</span>
      </div>
    </div>
  </div>
</div>
</div>`;

export default class transcript {
  public messages: Message[] = [];
  public channel: TextChannel;
  public parsedMessages: string = "";

  constructor(options: { messages: Message[]; title?: string }) {
    this.messages = options.messages.reverse();
    this.channel = options.messages[0].channel! as TextChannel;
  }
  getMessageContent(message: Message) {
    let content = message.content;
    if (message.embeds.length > 0) {
      content += message.embeds
        .map((x) => `[Embed: ${x.title} | ${x.description}]`)
        .join("\n");
    }
    if (message.attachments.size > 0) {
      content += message.attachments
        .map((x) => `[File: [${x.name}](${x.url})]`)
        .join("\n");
    }
    return message.content;
  }
  parseAllMessages() {
    this.messages.forEach((x) => {
      this.parsedMessages += this.parseMessage(x);
    });
  }

  parseMessage(msg: Message) {
    return messageTemplate
      .replaceAll(
        "{message.content}",
        this.getMessageContent(msg)
      )
      .replaceAll("{message.id}", msg.id)
      .replaceAll("{message.timestamp}", msg.createdAt.toDateString())
      .replaceAll(
        "{user.avaturl}",
          msg.author.displayAvatarURL() ||
          "https://cdn.discordapp.com/embed/avatars/0.png"
      )
      .replaceAll("{user.id}", msg.author.id)
      .replaceAll(
        "{user.name}",
        (msg.member?.nickname || msg.author.username) +
          (msg.author.bot ? " [BOT]" : "")
      );
  }

  getHtml() {
    this.parseAllMessages();
    var fullHtml = template
      .replaceAll("{guild.name}", this.channel.guild.name)
      .replaceAll(
        "{guild.avatar}",
        this.channel.guild.iconURL() ||
          "https://cdn.discordapp.com/embed/avatars/0.png"
      )
      .replaceAll("{thread.name}", this.channel.name)
      .replaceAll("{messages.history}", this.parsedMessages);
    return fullHtml;
  }
}
