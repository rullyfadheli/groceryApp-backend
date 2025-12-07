/**
 * Simple test script for Chatbot Services
 * Run with: npx ts-node src/test/testChatbot.ts
 */

import ChatbotServices from "../services/chatbotServices.js";
import dotenv from "dotenv";
dotenv.config();

async function testChatbot() {
  console.log("Testing Chatbot Services...\n");
  console.log("API Key loaded:", process.env.GEMINI_API_KEY ? "Yes" : "No");
  console.log("---");

  const testMessages = [
    "Hi",
    "Jam berapa toko buka?",
    "What products do you sell?",
  ];

  for (const message of testMessages) {
    console.log(`\n📤 User: ${message}`);
    try {
      const response = await ChatbotServices.generateResponse(message);
      console.log(`🤖 Bot: ${response}`);
    } catch (error) {
      console.error(`❌ Error: ${error}`);
    }
    console.log("---");
  }
}

testChatbot();
