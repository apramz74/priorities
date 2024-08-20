import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.REACT_APP_API_KEY;

if (!API_KEY) {
  throw new Error(
    "API_KEY is not set. Please check your environment variables."
  );
}

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize the model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export default model;
