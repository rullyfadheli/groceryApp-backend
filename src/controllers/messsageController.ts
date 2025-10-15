import { Socket } from "socket.io";

class ChatController {
  public static async sendMessage(socket: Socket) {
    const token = socket.handshake.auth.token as string;
  }
}
