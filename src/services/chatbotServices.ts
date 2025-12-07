import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// Unique identifier for chatbot messages
export const CHATBOT_SENDER_ID = "00000000-0000-0000-0000-000000000000";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const SYSTEM_PROMPT = `Kamu adalah asisten customer service virtual untuk FR Grocery, sebuah toko grocery online.

INFORMASI PENTING:
- Jam operasional: 08:00 AM - 09:00 PM setiap hari
- Produk unggulan: Sayuran segar, buah-buahan organik, daging berkualitas, dan produk dairy
- Website melayani pengiriman ke seluruh Indonesia

PANDUAN:
1. PENTING: Selalu jawab menggunakan bahasa yang sama dengan bahasa user. Jika user menulis dalam Bahasa Inggris, jawab dalam Bahasa Inggris. Jika user menulis dalam Bahasa Indonesia, jawab dalam Bahasa Indonesia.
2. Jawab dengan ramah dan sopan
3. Berikan informasi yang akurat tentang toko
4. Jika tidak tahu jawabannya, arahkan customer untuk menghubungi admin
5. Bantu customer dengan pertanyaan seputar produk, pesanan, dan pengiriman
6. Jawab dengan ringkas dan jelas, maksimal 2-3 kalimat`;

class ChatbotServices {
  public static async generateResponse(userMessage: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "Kamu adalah customer service FR Grocery." }],
          },
          {
            role: "model",
            parts: [{ text: SYSTEM_PROMPT }],
          },
        ],
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response.text();

      return response;
    } catch (error: any) {
      console.error("Gemini API Error:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        fullError: error,
      });
      return "Sorry, I caught a techincal issue, please try again later or contact the admin for assistance.";
    }
  }
}

export default ChatbotServices;
