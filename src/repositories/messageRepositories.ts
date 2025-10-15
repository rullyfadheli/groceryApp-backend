import sql from "../config/database.js";

class MessageRepositories {
  public static async insertMessage(sender_id: string, message: string) {
    const query =
      await sql`INSERT INTO messages (sender_id, message) VALUES (${sender_id}, ${message}) RETURNING *`;
    return query;
  }

  public static async getConversation(id: number) {
    const query = await sql`SELECT * FROM conversations WHERE id = ${id}`;
    return query;
  }
}

export default MessageRepositories;
