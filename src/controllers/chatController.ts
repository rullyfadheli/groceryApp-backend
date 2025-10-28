import { Socket, Server } from "socket.io";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import postgres from "postgres";
import MessageServices from "../services/messageServices";
dotenv.config();

/**
 * Extends the basic Socket.IO Socket type to include user details.
 */
interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    name: string;
    role?: string;
  };
}

/**
 * A simple in-memory map to track which user is connected to which socket.
 * { user_id -> socket_id }
 * In a multi-server setup, this should be replaced with Redis.
 */
const userSocketMap = new Map<string, string>();

/**
 * Verifies a JWT token, trying both User and Admin secrets.
 * @param {string} token - The raw JWT token.
 * @returns {JwtPayload | null} The decoded payload or null if invalid.
 */
const verifyAuthToken = (token: string): JwtPayload | null => {
  if (!token) {
    return null;
  }

  try {
    // Try to verify as a regular user
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;
  } catch (userError) {
    // If user token fails, try to verify as an admin
    try {
      return jwt.verify(
        token,
        process.env.ADMIN_ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;
    } catch (adminError) {
      // If both fail, return null
      console.log("Token verification failed for both user and admin.");
      return null;
    }
  }
};

class ChatController {
  /**
   * Handles new Socket.IO connections and chat event listeners.
   * @param {Server} io - The main Socket.IO Server instance.
   * @param {AuthenticatedSocket} socket - The individual client socket.
   */
  public static async handleChat(io: Server, socket: AuthenticatedSocket) {
    // Authenticate the connection
    const token = socket.handshake.auth.token as string;
    if (!token) {
      socket.emit("connection_error", {
        message: "Authentication failed. No token.",
      });
      return socket.disconnect();
    }

    const access_token = token.split(" ")[1];
    const userData = verifyAuthToken(access_token);

    // console.log(userData);

    if (!userData) {
      socket.emit("connection_error", {
        message: "Authentication failed. Invalid token.",
      });
      return socket.disconnect();
    }

    // Attach user data to the socket and map user_id to socket_id
    socket.user = {
      id: userData.id as string,
      name: userData.username as string,
      role: userData?.role as string,
    };
    userSocketMap.set(socket.user.id, socket.id);
    console.log(`User connected: ${socket.user.name} (Socket: ${socket.id})`);

    // Handle incoming messages
    socket.on(
      "sendMessage",
      async (
        msg: { conversation_id: string; text: string },
        callback: (response: {
          status: string;
          data?: any;
          message?: string;
        }) => void
      ) => {
        if (!socket.user) {
          return callback({
            status: "error",
            message: "Authentication required.",
          });
        }

        try {
          const recipient_id: string = "fc97e34c-faeb-412e-bca0-3563a5b2fe89";
          const sender_id = socket.user.id;
          const { conversation_id, text } = msg;

          // console.log(userData);
          // console.log(conversation_id);
          // console.log(text);

          // Save message to database
          const saveMessage: postgres.Row | false =
            await MessageServices.insertMessage(
              conversation_id,
              sender_id,
              text
            );

          if (!saveMessage) {
            return callback({
              status: "error",
              message: "Failed to save message.",
            });
          }

          // Find the recipient's socket ID
          const recipientSocketId = userSocketMap.get(recipient_id);

          if (recipientSocketId) {
            // Emit message to the recipient if they are online
            io.to(recipientSocketId).emit("receiveMessage", saveMessage);
          }

          // Send acknowledgment back to the sender
          callback({ status: "ok", data: saveMessage });
        } catch (error) {
          console.log(error);
          callback({ status: "error", message: "Server error." });
        }
      }
    );
    // Handle disconnection
    socket.on("disconnect", () => {
      if (socket.user) {
        userSocketMap.delete(socket.user.id);
        console.log(`User disconnected: ${socket.user.name}`);
      }
    });
  }

  // --- HTTP ENDPOINTS ---

  /**
   * [HTTP] Starts or finds a conversation with another user.
   * Expects { recipient_id: string } in the request body.
   * @param {Request} req - Express request object (expects req.user).
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} JSON object of the conversation.
   */
  public static async startConversation(
    req: Request,
    res: Response
  ): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied" });
    }
    try {
      const user_id = req.user.id as string;
      const { recipient_id } = req.body;
      const role = req.user?.role;

      let user1_id: string = "";
      let user2_id: string = "";

      if (role === "admin") {
        user1_id = recipient_id;
        user2_id = user_id;
      } else if (role !== "admin" || !role) {
        user1_id = user_id;
        user2_id = recipient_id;
      }

      if (!recipient_id) {
        return res.status(400).json({ message: "Recipient ID is required" });
      }

      const getConversation = await MessageServices.getConversationBySenderId(
        user_id
      );

      if (!getConversation || getConversation.length === 0) {
        const startConversation = await MessageServices.startConversation(
          user1_id,
          user2_id
        );

        // console.log(startConversation);

        if (!startConversation) {
          return res
            .status(500)
            .json({ message: "Failed to start conversation" });
        }
        return res.status(200).json(startConversation);
      }

      const messages = getConversation.map((message) => {
        const isSender = message.sender_id === user_id;

        return {
          rest: {
            isSender,
            ...message,
          },
        };
      });

      console.log(messages);

      const conversationID: number = getConversation[0].id;

      const finalResponse = [{ id: conversationID, messages }];

      return res.status(200).json(finalResponse);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /**
   * [HTTP] Gets the list of all conversations for the logged-in user.
   * @param {Request} req - Express request object (expects req.user).
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} JSON list of conversations.
   */
  // public static async getConversationsBySenderId(
  //   req: Request,
  //   res: Response
  // ): Promise<Response> {
  //   if (!req.user) {
  //     return res.status(401).json({ message: "Access denied" });
  //   }

  //   try {
  //     const userId = req.user.id as string;
  //     const conversations: false | postgres.RowList<postgres.Row[]> =
  //       await MessageServices.getConversationBySenderId(userId);

  //     if (!conversations) {
  //       return res
  //         .status(500)
  //         .json({ message: "Server error, failed to fetch conversations" });
  //     }

  //     // Handle empty case gracefully
  //     if (conversations.length === 0) {
  //       return res.status(200).json([]); // Return empty array, not an error
  //     }

  //     return res.status(200).json(conversations);
  //   } catch (err) {
  //     console.log(err);
  //     return res
  //       .status(500)
  //       .json({ message: "Server error, failed to fetch chat data" });
  //   }
  // }

  /**
   * [HTTP] Gets all messages for a specific conversation.
   * @param {Request} req - Express request object (expects req.user and req.params.id).
   * @param {Response} res - Express response object.
   * @returns {Promise<Response>} JSON list of messages with 'is_sender' flag.
   */
  public static async getMessagesByConversationId(
    req: Request,
    res: Response
  ): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ message: "Access denied" });
    }

    try {
      const userId = req.user.id as string;
      const conversation_id = parseInt(req.params.id, 10); // Get ID from URL param

      if (isNaN(conversation_id)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      const messages: false | postgres.RowList<postgres.Row[]> =
        await MessageServices.getMessages(conversation_id, userId); // Pass userId

      if (!messages) {
        return res
          .status(500)
          .json({ message: "Server error, failed to fetch messages" });
      }

      return res.status(200).json(messages);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Server error, failed to fetch messages" });
    }
  }
}

export default ChatController;
