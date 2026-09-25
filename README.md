# RoleMatch — RAG Job Search chatbot.

A small beginner project that finds sample job listings from a natural-language description. It demonstrates how text embeddings and Qdrant similarity search work, with a simple chat-style React interface.

## How it works

```text
jobs.csv → create a vector for each job → save jobs and vectors in Qdrant
user message → create a query vector → find similar jobs → show job cards
```

The app uses Gemini's embedding API and Qdrant. After Qdrant finds a few relevant jobs, Gemini receives the user's query and those job details as context and writes a short grounded answer. The matching job cards are shown alongside the answer. Gemini is instructed to use only the retrieved listings and not invent job details.

## Requirements

- Node.js and npm
- Docker
- A Gemini API key

## Run it

1. Start Qdrant from the project root:

   ```bash
   docker compose up -d
   ```

2. Create `backend/.env`:

   ```env
   PORT=5000
   QDRANT_URL=http://localhost:6333
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Install and start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. In a second terminal, create the collection and add the sample jobs:

   ```bash
   curl -X POST http://localhost:5000/collection
   curl -X POST http://localhost:5000/ingest
   ```

   Run ingestion again whenever you change `backend/data/jobs.csv`. If you already created the old 1536-dimensional `jobs` collection, delete it in the Qdrant dashboard before creating the collection again, then ingest the jobs again.

5. Start the frontend in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open http://localhost:5173.

## Try a search

Enter a description such as “Python backend developer with AWS experience.” The app converts it to a vector, asks Qdrant for the closest job vectors, and displays the matching listings and similarity scores.

Example questions to try:

- “Python backend developer with AWS experience”
- “I'm new to the industry and want to work with data and SQL”
- “Find a remote design role where I can use Figma and do user research”
- “I enjoy building websites with React and TypeScript”
- “Help me find a role working with cloud infrastructure and deployments”
- “Are there any jobs helping customers solve technical problems?”

The dataset in `backend/data/jobs.csv` has 24 fictional sample roles. Each role has an ID, title, company, location, work type, skills, and description. Each job's searchable text combines its title, description, skills, location, and work type.

## API

- `GET /health` — check the backend and Qdrant connection
- `POST /collection` — create the `jobs` collection
- `POST /ingest` — embed and store the CSV jobs
- `POST /search` — return matching jobs with `{"query":"Python developer with AWS"}`
- `POST /chat` — retrieve jobs and generate a grounded conversational answer

The collection uses cosine distance and 3072 dimensional vectors. The same embedding model and dimensions must be used for both jobs and search queries.

## Project structure

```text
backend/
  data/jobs.csv
  src/gemini.js       # turns text into vectors
  src/ingest.js       # reads jobs and stores their vectors
  src/server.js       # API endpoints
  src/vectorStore.js  # Qdrant collection and search
frontend/
  index.html
  src/App.jsx         # chat-style search page and job cards
  src/main.jsx        # React entry point
  src/index.css
  vite.config.js
docker-compose.yml
```
