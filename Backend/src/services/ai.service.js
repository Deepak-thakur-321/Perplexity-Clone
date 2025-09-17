const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
   apiKey: process.env.GEMINI_API_KEY
});

// Simple non-streaming response
async function generateResult(prompt) {
   const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
         {
            role: "user",
            parts: [{ text: prompt }]
         }
      ]
   });

   // ✅ Extract safe text
   return response.text;
}

// Conversation memory
const memory = [
   {
      role: "user",
      parts: [{ text: "who are you ?" }]
   },
   {
      role: "model",
      parts: [{ text: "I am an AI created by Google" }]
   }
];

// Streaming response
async function generateStream(prompt, onData) {
   memory.push({
      role: "user",
      parts: [{ text: prompt }]
   });

   const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      contents: memory
   });

   let responseText = "";

   // ✅ Properly extract stream chunks
   for await (const chunk of stream.stream) {
      const part = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
      responseText += part;
      onData(part);
   }

   memory.push({
      role: "model",
      parts: [{ text: responseText }]
   });
}

module.exports = {
   generateResult,
   generateStream
};
