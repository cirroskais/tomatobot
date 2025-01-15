import { env } from "bun";
import type Eris from "eris";
import { findPunishment, getReactions } from "../lib/database";
const REACTIONS = isNaN(Number(env.REACTIONS)) ? 8 : Number(env.REACTIONS);
const TIMEOUT = isNaN(Number(env.TIMEOUT)) ? 600000 : Number(env.TIMEOUT);

export function messageDelete(client: Eris.Client, message: { id: string }) {
    if (findPunishment(message.id).length)
        return console.log("[debug] ignoring delete for", message.id, "because author was already punished");

    const reactions: { message: string; userId: string; reactor: string; guildId: string }[] = getReactions(
        message.id
    ) as any[];

    if (reactions.length >= REACTIONS / 2) {
        const userId = reactions[0].userId;
        const guildId = reactions[0].guildId;

        client
            .editGuildMember(
                guildId,
                userId,
                { communicationDisabledUntil: new Date(Date.now() + TIMEOUT / 2) },
                "Deleted a half-tomatoed message"
            )
            .catch((_) => {});
    }
}
