import { env } from "bun";
import { Database } from "bun:sqlite";

const DATABASE_PATH = env.DATABASE_PATH || "/var/tomatobot/database.sqlite";
const database = new Database(DATABASE_PATH, { create: true });

try {
    database.run(`CREATE TABLE reactions (message TEXT, userId TEXT, reactor TEXT, guildId TEXT, UNIQUE(message, reactor));`);
    database.run(`CREATE TABLE punishments (message TEXT, userId TEXT, channelId TEXT, date INTEGER);`);
} catch (e) {}

export function addReaction($messageId: string, $authorId: string, $reactorId: string, $guildId: string) {
    return database
        .query(
            `INSERT INTO reactions (message, userId, reactor, guildId) VALUES ($messageId, $authorId, $reactorId, $guildId);`
        )
        .run({ $messageId, $authorId, $reactorId, $guildId });
}

export function removeReaction($messageId: string, $reactorId: string) {
    return database
        .query(`DELETE FROM reactions WHERE message = $messageId AND reactor = $reactorId;`)
        .run({ $messageId, $reactorId });
}

export function getReactions($messageId: string) {
    return database.query(`SELECT * FROM reactions WHERE message = $messageId;`).all({ $messageId });
}

export function createPunishment($messageId: string, $userId: string, $channelId: string) {
    return database
        .query(`INSERT INTO punishments (message, userId, channelId, date) VALUES ($messageId, $userId, $channelId, $date);`)
        .run({ $messageId, $userId, $channelId, $date: Date.now() });
}

export function findPunishment($messageId: string) {
    return database.query(`SELECT * FROM punishments WHERE message = $messageId;`).all({ $messageId });
}
