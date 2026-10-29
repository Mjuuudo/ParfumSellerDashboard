// Base URL of the backend API, read from NEXT_PUBLIC_API_URL (frontend/.env).
// Next.js replaces `process.env.NEXT_PUBLIC_API_URL` with its value when it compiles the app,
// so it must be written out exactly like this (no destructuring, no dynamic key).
const fromEnv = process.env.NEXT_PUBLIC_API_URL;

if (!fromEnv) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Add it to frontend/.env (see frontend/.env.example).");
}

// e.g. "http://localhost:8000/api" — trailing slashes removed so `${API_BASE_URL}/brand` is always clean.
export const API_BASE_URL = fromEnv.replace(/\/+$/, "");
