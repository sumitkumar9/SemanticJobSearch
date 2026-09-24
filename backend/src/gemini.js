const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function createEmbedding(text) {
  const response = await client.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 3072 },
  });
  return response.embeddings[0].values;
}

async function generateAnswer(query, jobs) {
  const jobContext = jobs.map((job, index) => `
    Job ${index + 1}
    Title: ${job.title}
    Company: ${job.company}
    Location: ${job.location}
    Work type: ${job.work_type}
    Skills: ${job.skills}
    Description: ${job.description}
  `).join("\n");

  const response = await client.models.generateContent({
    model: "gemini-flash-lite-latest",
    config: {
      systemInstruction: `You are RoleMatch, a helpful job search assistant.
                          Answer the user's request using only the job listings provided in the message.
                          Briefly explain which roles seem relevant and why, then invite them to refine their search if useful.
                          Do not invent job details, requirements, benefits, or links.
                          If the listings are not a close fit, say so clearly.
                          Keep the answer concise.`,
          },
    contents: `User request:\n${query}\n\nJobs retrieved from the job database:\n${jobContext}`,
  });

  return response.text;
}

module.exports = { createEmbedding, generateAnswer };
