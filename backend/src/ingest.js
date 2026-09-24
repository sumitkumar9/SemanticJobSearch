require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createEmbedding } = require("./gemini");
const { insertJobs } = require("./vectorStore");

const csvPath = path.join(__dirname, "../data/jobs.csv");

function readJobs() {
  return new Promise((resolve, reject) => {
    const jobs = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (job) => jobs.push(job))
      .on("end", () => resolve(jobs))
      .on("error", reject);
  });
}

function jobText(job) {
  return `${job.title}. ${job.description} Skills: ${job.skills}. Location: ${job.location}. Work type: ${job.work_type}.`;
}

async function ingestJobs() {
  const jobs = await readJobs();
  for (const job of jobs) {
    job.embedding = await createEmbedding(jobText(job));
  }
  await insertJobs(jobs);
  return { jobsAdded: jobs.length };
}

module.exports = { ingestJobs };
