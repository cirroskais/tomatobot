import type { Emoji, Message } from "eris";
import type Eris from "eris";
import { findPunishment, removeReaction } from "../lib/database";

export async function messageReactionRemove(
    client: Eris.Client,
    message: Message,
    emoji: Emoji,
    userID: string,
    burst: boolean
) {
    if (emoji.name !== "🍅") return;
    if (findPunishment(message.id).length)
        return console.log("[debug] ignoring removal", userID, "for", message.id, "because author was already punished");

    try {
        message = await client.getMessage(message.channel.id, message.id);
        if (!message.member) return;
        removeReaction(message.id, userID);
        console.log("[success] removed", userID, "from", message.id);
    } catch (_) {
        console.log("[error] failed to remove", userID, "from", message.id);
    }
}
