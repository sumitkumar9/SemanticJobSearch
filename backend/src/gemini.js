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
    ID: ${job.id}
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
                          Only help users find or compare jobs. Short phrases describing a role, skill, or work preference are valid job-search requests, even when they are not full sentences. A request for a job type that is not present in the listings is still a job-search request; say no close matches were found instead of using the out-of-scope response.
                          If the user asks for unrelated information rather than job search, do not answer it; use this answer: "I can only help find jobs. Describe the role, skills, or work preferences you're looking for." and return an empty relevantJobIds array.
                          Answer the user's request using only the job listings provided in the message.
                          Give a short summary of the best matches in 1-2 sentences. Mention why they fit the request, but do not repeat the job titles, companies, descriptions, or other details that are shown separately in the job cards.
                          You may briefly invite the user to refine their search.
                          Do not invent job details, requirements, benefits, or links.
                          Evaluate each listing against the user's request. Include listings that match the requested role or have meaningfully related duties or skills, even if their title differs. Exclude only clearly unrelated listings. If none have meaningful overlap, use an empty relevantJobIds array and say that no close matches were found. For non-job questions, use the job-search-only response specified above.
                          Return a JSON object with answer (a short plain-text response) and relevantJobIds (an array containing only IDs from the supplied listings).`,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          answer: { type: "STRING", description: "A brief 1-2 sentence summary, or a short no-close-matches response." },
          relevantJobIds: {
            type: "ARRAY",
            items: { type: "INTEGER" },
            description: "IDs of jobs matching the requested role or having meaningfully related duties or skills; exclude clearly unrelated jobs.",
          },
        },
        required: ["answer", "relevantJobIds"],
      },
    },
    contents: `User request:\n${query}\n\nJobs retrieved from the job database:\n${jobContext}`,
  });

  return JSON.parse(response.text);
}

module.exports = { createEmbedding, generateAnswer };
