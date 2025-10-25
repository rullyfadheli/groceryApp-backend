import verifyToken from "../controllers/verifyToken";
import ChatController from "../controllers/chatController";
import express, { Request, Response } from "express";

const messageRoutes = express.Router();

// messageRoutes.get(
//   "/conversation-userid",
//   verifyToken.verifyUser,
//   (req: Request, res: Response) => {
//     ChatController.getConversationsBySenderId(req, res);
//   }
// );

messageRoutes.post(
  "/start-conversation",
  verifyToken.verifyUser,
  (req: Request, res: Response) => {
    ChatController.startConversation(req, res);
  }
);

export default messageRoutes;
