const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME = "jobs";
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL || "http://localhost:6333" });

async function getCollections() {
  return qdrant.getCollections();
}

async function createCollection() {
  const { collections } = await getCollections();
  if (collections.some((collection) => collection.name === COLLECTION_NAME)) {
    return { created: false, message: "Jobs collection already exists" };
  }
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: { size: 3072, distance: "Cosine" },
  });
  return { created: true, message: "Jobs collection created" };
}

async function insertJobs(jobs) {
  const points = jobs.map(({ embedding, ...job }) => ({
    id: Number(job.id),
    vector: embedding,
    payload: job,
  }));
  await qdrant.upsert(COLLECTION_NAME, { wait: true, points });
  return points.length;
}

async function searchJobs(embedding, limit = 8) {
  const response = await qdrant.query(COLLECTION_NAME, {
    query: embedding,
    limit,
    with_payload: true,
  });
  return response.points.map((point) => ({ ...point.payload, score: point.score }));
}

module.exports = { getCollections, createCollection, insertJobs, searchJobs };
