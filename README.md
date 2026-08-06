# Travel Story

A full-stack MERN application for keeping a personal travel journal. Sign up, write stories about places you've visited, attach photos and locations, and browse them with search, date filters, and favourites.

## Features

- **User accounts** — signup/login with JWT authentication and bcrypt-hashed passwords
- **Travel stories** — create, edit, and delete stories with a title, text, cover image, visited locations, and visit date
- **Image uploads** — cover photos stored on the server via Multer
- **Search & filter** — full-text search across stories and date-range filtering with a calendar picker
- **Favourites** — pin your best memories to the top
- **Public sharing** — generate a read-only link to share a story with anyone
- **Map view** — see everywhere you've been on an interactive map
- **AI assist** — destination suggestions based on your travel history and a one-click story polish, powered by the OpenAI API

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router |
| Backend  | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI       | OpenAI API (any OpenAI-compatible endpoint) |

## Getting Started

### Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd travel-story-project
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   ```
   Create `backend/.env`:
   ```
   ACCESS_TOKEN_SECRET=<any long random string>
   MONGODB_URI=<your MongoDB connection string>
   OPENAI_API_KEY=<your OpenAI API key>   # optional, needed for AI features
   OPENAI_MODEL=gpt-4o-mini               # optional, defaults to gpt-4o-mini
   OPENAI_BASE_URL=<compatible endpoint>  # optional, e.g. an OpenCode Zen gateway
   ```
   If `MONGODB_URI` is not set, the server falls back to the connection string in `backend/config.json` (`mongodb://localhost:27017/`).

   Start the server:
   ```bash
   npm start
   ```
   The API runs on `http://localhost:8000`.

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open the URL Vite prints (default `http://localhost:5173`).
