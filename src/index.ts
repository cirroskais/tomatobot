import { env } from "bun";
import Eris from "eris";
import { messageReactionAdd } from "./events/messageReactionAdd";
import { messageReactionRemove } from "./events/messageReactionRemove";
import { messageDelete } from "./events/messageDelete";

if (!env.DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN");

const client = Eris(env.DISCORD_TOKEN);

client.on("messageReactionAdd", messageReactionAdd.bind(null, client));
client.on("messageReactionRemove", messageReactionRemove.bind(null, client));
client.on("messageDelete", messageDelete.bind(null, client));

client.connect();
