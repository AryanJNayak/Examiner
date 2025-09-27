import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: path.resolve('../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const History = [];

// 🔹 Function to generate MCQs
async function generateMCQs(mcqCount) {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'embedding-001'
  });

  // Pinecone setup
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

  // Example query string (could come from user input later)
  const queryText = 'Generate MCQs from syllabus';

  // Convert query into embedding (will be 1024 dim if using embedding-001)
  const queryVector = await embeddings.embedQuery(queryText);

  const searchResults = await pineconeIndex.query({
    topK: 10,
    vector: queryVector, // ✅ use actual embedding
    includeMetadata: true
  });

  const context = searchResults.matches.map((match) => match.metadata.text).join('\n\n---\n\n');

  History.push({
    role: 'user',
    parts: [{ text: `Generate ${mcqCount} MCQs from the syllabus context` }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: History,
    config: {
      systemInstruction: `
        You are an intelligent exam question generator.
        Generate ${mcqCount} MCQs from the syllabus context provided.
        Output strictly in JSON format:

        [
          {
            "question": "string",
            "options": {
              "A": "string",
              "B": "string",
              "C": "string",
              "D": "string"
            },
            "correctAnswer": "A/B/C/D",
            "explanation": "string"
          }
        ]

        Context: ${context}
      `
    }
  });

  History.push({
    role: 'model',
    parts: [{ text: response.text }]
  });

  return response.text;
}

// 🔹 API endpoint
app.post('/generate-mcqs', async (req, res) => {
  try {
    const { count } = req.body; // Example: { "count": 5 }
    const mcqCount = parseInt(count) || 5;

    const result = await generateMCQs(mcqCount);

    // Try parsing JSON
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (err) {
      return res.status(500).json({
        error: 'LLM did not return valid JSON',
        raw: result
      });
    }

    res.json({ mcqs: parsed });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
