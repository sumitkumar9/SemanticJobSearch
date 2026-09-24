require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { createEmbedding, generateAnswer } = require("./gemini");
const { ingestJobs } = require("./ingest");
const { getCollections, createCollection, searchJobs } = require("./vectorStore");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const result = await getCollections();
    res.json({ status: "ok", collections: result.collections });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/collection", async (_req, res) => {
  try {
    res.json(await createCollection());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/ingest", async (_req, res) => {
  try {
    res.json({ message: "Job data added to Qdrant", result: await ingestJobs() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/search", async (req, res) => {
  const query = typeof req.body.query === "string" ? req.body.query.trim() : "";
  if (!query) return res.status(400).json({ message: "Enter a job search query." });

  try {
    const embedding = await createEmbedding(query);
    const results = await searchJobs(embedding, 8);
    res.json({ query, jobs: results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/chat", async (req, res) => {
  const query = typeof req.body.query === "string" ? req.body.query.trim() : "";
  if (!query) return res.status(400).json({ message: "Enter a job search query." });

  try {
    const embedding = await createEmbedding(query);
    const jobs = await searchJobs(embedding, 5);
    const answer = jobs.length
      ? await generateAnswer(query, jobs)
      : "I couldn't find any matching jobs. Try a different description or skill set.";
    res.json({ query, answer, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Job search API listening on port ${PORT}`));
