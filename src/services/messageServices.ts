import MessageRepositories from "../repositories/messageRepositories.js";
import postgres from "postgres";

class MessageServices {
  public static async insertMessage(
    sender_id: string,
    message: string
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const res: postgres.RowList<postgres.Row[]> =
        await MessageRepositories.insertMessage(sender_id, message);
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public static async getConversation(
    conversation_id: number
  ): Promise<false | postgres.RowList<postgres.Row[]>> {
    try {
      const res: postgres.RowList<postgres.Row[]> =
        await MessageRepositories.getConversation(conversation_id);
      return res;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default MessageServices;
