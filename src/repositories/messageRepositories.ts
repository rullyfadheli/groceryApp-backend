import sql from "../config/database.js";

class MessageRepositories {
  /**
   * Inserts a new message into the database.
   * @param {string} conversation_id - The ID of the conversation.
   * @param {string} sender_id - The ID of the user sending the message.
   * @param {string} message - The content of the message.
   * @returns {Promise<any>} The newly created message row.
   */
  public static async insertMessage(
    conversation_id: string,
    sender_id: string,
    message: string
  ) {
    // 1. Insert the message
    const query = await sql`
      INSERT INTO messages (conversation_id, sender_id, message, created_at)
      VALUES (${conversation_id}, ${sender_id}, ${message}, NOW())
      RETURNING *;
    `;

    // 2. Update the conversation's timestamp (so it appears at the top of the list)
    await this.updateConversationTimestamp(conversation_id);

    return query[0];
  }

  /**
   * Updates the 'updated_at' timestamp of a conversation.
   * (You should add an 'updated_at' column to your 'conversations' table)
   * @param {string} conversation_id - The ID of the conversation to update.
   */
  public static async updateConversationTimestamp(conversation_id: string) {
    await sql`
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = ${conversation_id};
    `;
  }

  /**
   * Retrieves all conversations for a specific user.
   * @param {string} user_id - The ID of the current user.
   * @returns {Promise<any[]>} A list of conversations.
   */
  public static async getConversation(user_id: string) {
    const query = await sql`
      SELECT 
      c.*,
      m.sender_id,
      m.created_at,
      m.message
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE user1_id = ${user_id} OR user2_id = ${user_id}
      ORDER BY updated_at DESC
      LIMIT 30;
    `;
    return query;
  }

  /**
   * Retrieves messages for a specific conversation,
   * and flags which messages were sent by the current user.
   * @param {number} conversation_id - The ID of the conversation.
   * @param {string} current_user_id - The ID of the user viewing the chat.
   * @returns {Promise<any[]>} A list of messages with an 'is_sender' flag.
   */
  public static async getMessage(
    conversation_id: number,
    current_user_id: string
  ) {
    const query = await sql`
      SELECT 
        id,
        conversation_id,
        sender_id,
        message,
        created_at,
        (sender_id = ${current_user_id}) AS is_sender
      FROM messages
      WHERE conversation_id = ${conversation_id}
      ORDER BY created_at ASC
      LIMIT 100; -- Get more history, consider pagination
    `;
    return query;
  }

  /**
   * Finds an existing conversation between two users, or creates a new one.
   * @param {string} user1_id - The ID of the first user.
   * @param {string} user2_id - The ID of the second user.
   * @returns {Promise<any>} The existing or newly created conversation row.
   */
  public static async createConversation(user1_id: string, user2_id: string) {
    const query = await sql`
      INSERT INTO conversations (user1_id, user2_id, created_at, updated_at)
      VALUES (${user1_id}, ${user2_id}, NOW(), NOW())
      RETURNING *;
    `;
    return query[0];
  }
}

export default MessageRepositories;
