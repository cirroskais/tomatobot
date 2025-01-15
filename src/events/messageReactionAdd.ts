import { env } from "bun";
import type Eris from "eris";
import type { Member, Message } from "eris";
import { addReaction, createPunishment, findPunishment, getReactions } from "../lib/database";
const REACTIONS = isNaN(Number(env.REACTIONS)) ? 8 : Number(env.REACTIONS);
const TIMEOUT = isNaN(Number(env.TIMEOUT)) ? 600000 : Number(env.TIMEOUT);

interface Emoji {
    id?: string;
    name: string;
    animated?: boolean;
}

interface UncachedUser {
    id: string;
}

export async function messageReactionAdd(
    client: Eris.Client,
    message: Message,
    emoji: Emoji,
    reactor: Member | UncachedUser,
    burst: boolean
) {
    if (emoji.name !== "🍅") return;
    if (findPunishment(message.id).length)
        return console.log("[debug] ignoring add", reactor.id, "for", message.id, "because author was already punished");

    try {
        message = await client.getMessage(message.channel.id, message.id);
        if (!message.member || !message.guildID) return;
        addReaction(message.id, message.author.id, reactor.id, message.guildID);
        console.log("[success] added", reactor.id, "to", message.id);
    } catch (_) {
        console.log("[error] failed to add", reactor.id, "to", message.id);
        console.log(_);
    }

    if (!message.member) return;

    const reactions = getReactions(message.id);
    if (reactions.length >= REACTIONS) {
        createPunishment(message.id, message.author.id, message.channel.id);

        const deciders = reactions
            .map((_: any) => `<@${_.reactor}>`)
            .join(", ")
            .trim();

        message.member
            .edit({ communicationDisabledUntil: new Date(Date.now() + TIMEOUT) }, "Tomatoed")
            .then(() => {
                client.createMessage(message.channel.id, {
                    content: `${deciders} decided to mute you for 10 minutes.`,
                    messageReference: { channelID: message.channel.id, messageID: message.id, type: 0 },
                    allowedMentions: { repliedUser: true },
                });
            })
            .catch((_) => {
                client.createMessage(message.channel.id, {
                    content: `${deciders} wanted you muted for 10 minutes, but I couldn't apply the timeout.`,
                    messageReference: { channelID: message.channel.id, messageID: message.id, type: 0 },
                    allowedMentions: { repliedUser: true },
                });
            });
    }
}
