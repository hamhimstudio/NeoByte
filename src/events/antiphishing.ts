import { ArgsOf, Discord, On } from "discordx";
import { Message, MessageType } from "discord.js";
import axios from "axios";
import phishingResponse from "../models/phishing.js";

@Discord()
export class Phishing {
  private check(url: string, fullUrl: string) {
    var checksPromises = [];

    // Not available for now ;( (API is down)
    // checksPromises.push(
    //   new Promise((res, rej) => {
    //     axios
    //       .get("https://api.fishfish.gg/v1/domains/" + url)
    //       .then((x) => {
    //         return x.data;
    //       })
    //       .then(async (x: phishingResponse) => {
    //         if (x.category !== "safe") {
    //           res({ result: true, url: url });
    //         }
    //       })
    //       .catch((x) => {
    //         rej({ result: false, url: url });
    //         // Ignore
    //       });
    //   })
    // );

    checksPromises.push(
      new Promise((res, rej) => {
        axios
          .get("https://phish.sinking.yachts/v2/check/" + url)
          .then((x) => {
            return x.data;
          })
          .then(async (x: boolean) => {
            res({ result: Boolean(x), url: url });
          })
          .catch((x) => {
            rej({ result: false, url: url });
            // Ignore
          });
      })
    );

    checksPromises.push(
      new Promise((res, rej) => {
        const params = new URLSearchParams();
        params.append("url", fullUrl);
        axios
          .post("https://urlhaus-api.abuse.ch/v1/url/", params)
          .then((x) => {
            return x.data;
          })
          .then((x) => {
            res({
              result:
                x &&
                x.query_status !== "no_results" &&
                x.url_status === "online",
              url: url,
            });
          })
          .catch((x) => {
            res({ result: false, url: url });
          });
      })
    );

    return Promise.allSettled(checksPromises);
  }
  @On({ event: "messageUpdate", priority: 1 })
  async updateHandle([old, message]: ArgsOf<"messageUpdate">): Promise<void> {
    if (
      !message.inGuild() ||
      !message.author ||
      message.author.bot ||
      !message.member ||
      message.type === MessageType.ThreadCreated ||
      message.type === MessageType.GuildBoost ||
      message.type === MessageType.GuildBoostTier1 ||
      message.type === MessageType.GuildBoostTier2 ||
      message.type === MessageType.GuildBoostTier3 ||
      message.type === MessageType.ThreadStarterMessage
    ) {
      return;
    }
    this.handle(message);
  }

  @On({ event: "messageCreate", priority: 1 })
  async creationHandler([message]: ArgsOf<"messageCreate">): Promise<void> {
    if (
      !message.inGuild() ||
      !message.author ||
      message.author.bot ||
      !message.member ||
      message.type === MessageType.ThreadCreated ||
      message.type === MessageType.GuildBoost ||
      message.type === MessageType.GuildBoostTier1 ||
      message.type === MessageType.GuildBoostTier2 ||
      message.type === MessageType.GuildBoostTier3 ||
      message.type === MessageType.ThreadStarterMessage
    ) {
      return;
    }
    this.handle(message);
  }
  async handle(message: Message<boolean>): Promise<void> {
    var links = Array.from(
      message.content.matchAll(/(http[s]?:\/\/([^ \n])*)/gim)
    );
    if (links.length > 0) {
      var promises: Promise<unknown>[] = [];
      links.forEach((x) => {
        var fullUrl = x[0];
        var url = x[0].substring(x[0].toLowerCase().indexOf("://") + 3).trim();

        url = url.substring(0, url.indexOf("/") || url.length);

        promises.push(this.check(url, fullUrl));
      });
      Promise.allSettled(promises).then((x) => {
        try {
          var found = x.some((x) => {
            return (
              x.status === "fulfilled" &&
              (x.value as any[]).some((x) => {
                return x.status === "fulfilled" && x.value.result;
              })
            );
          });
          if (found) {
            message.member
              ?.disableCommunicationUntil(Date.now() + 60 * 60 * 1000)
              .catch((_) => {});
            message.channel.send(
              `Phishing link detected!
    User: <@${message.author.id}>`
            );
            message.delete().catch((_) => {});
          }
        } catch (x) {
          console.log("Couldnt delete phishing Message!");
          console.log(x);
        }
      });
    }
  }
}
