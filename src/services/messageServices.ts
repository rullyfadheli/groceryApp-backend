import MessageRepositories from "../repositories/messageRepositories.js";
import postgres from "postgres";

class MessageServices {
  /**
   * Inserts a new message into the database.
   * @param {string} conversation_id - The ID of the conversation.
   * @param {string} sender_id - The ID of the user sending the message.
   * @param {string} message - The content of the message.
   * @returns {Promise<false | postgres.Row>} The new message row or false on failure.
   */
  public static async insertMessage(
    conversation_id: string,
    sender_id: string,
    message: string
  ): Promise<false | postgres.Row> {
    try {
      const res: postgres.Row = await MessageRepositories.insertMessage(
        conversation_id,
        sender_id,
        message
      );
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Finds or creates a new conversation between two users.
   * @param {string} user1_id - The ID of the current user.
   * @param {string} user2_id - The ID of the user to chat with.
   * @returns {Promise<false | postgres.Row>} The conversation row or false on failure.
   */
  public static async startConversation(
    user1_id: string,
    user2_id: string
  ): Promise<false | postgres.Row> {
    try {
      const res: postgres.Row = await MessageRepositories.createConversation(
        user1_id,
        user2_id
      );
      return res;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * Gets all conversations for a specific user.
   * @param {string} user_id - The ID of the current user.
   * @returns {Promise<false | postgres.RowList<postgres.Row[]>>} List of conversations or false on failure.
   */
  public static async getConversationBySenderId(
    user_id: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const res: postgres.RowList<postgres.Row[]> =
        await MessageRepositories.getConversation(user_id);
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Gets all messages for a conversation, relative to the current user.
   * @param {number} conversation_id - The ID of the conversation.
   * @param {string} current_user_id - The ID of the user viewing the chat.
   * @returns {Promise<false | postgres.RowList<postgres.Row[]>>} List of messages or false on failure.
   */
  public static async getMessages(
    conversation_id: number,
    current_user_id: string // Parameter ini sangat penting
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const res: postgres.RowList<postgres.Row[]> =
        await MessageRepositories.getMessage(conversation_id, current_user_id);
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default MessageServices;
