/**
 * List available Gemini models for your API key
 * Run with: npx tsx src/test/listModels.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  console.log("Checking API Key...");
  console.log(
    "API Key:",
    process.env.GEMINI_API_KEY
      ? `${process.env.GEMINI_API_KEY.substring(0, 10)}...`
      : "NOT SET"
  );
  console.log("\nFetching available models...\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );

    const data = await response.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      console.log("\nPossible issues:");
      console.log("1. API key is invalid");
      console.log(
        "2. Generative Language API is not enabled in Google Cloud Console"
      );
      console.log("3. API key doesn't have permission to access Gemini models");
      return;
    }

    if (data.models) {
      console.log("✅ Available models:\n");
      data.models.forEach((model: any) => {
        console.log(`- ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        console.log(
          `  Supported Methods: ${
            model.supportedGenerationMethods?.join(", ") || "N/A"
          }`
        );
        console.log("");
      });
    } else {
      console.log("No models found or unexpected response:", data);
    }
  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

listModels();
