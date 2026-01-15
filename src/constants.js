// Read the key from the .env file
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Create the URL dynamically
export const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;