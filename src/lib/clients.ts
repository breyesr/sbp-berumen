// src/lib/clients.ts
import { Pool } from 'pg';
import OpenAI from 'openai';

// --- VALIDATE ENVIRONMENT VARIABLES ---
if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_LOCAL) {
    throw new Error('Database connection string is not set in environment variables (expected POSTGRES_URL or POSTGRES_URL_LOCAL).');
}
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables.');
}

// --- CLIENTS ---

let pgPoolInstance: Pool | null = null;
let openaiInstance: OpenAI | null = null;

const getPgPool = () => {
    if (!pgPoolInstance) {
        const connectionString = process.env.NODE_ENV === 'production' 
            ? process.env.POSTGRES_URL 
            : process.env.POSTGRES_URL_LOCAL;
        
        const isProduction = process.env.NODE_ENV === 'production';
        const isLocal = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');

        pgPoolInstance = new Pool({
            connectionString,
            // Increased pool size for scalability. 
            // In serverless environments, this should be balanced with the total number of lambda instances.
            // Using a connection proxy (like PgBouncer or Supabase Pooling) is highly recommended.
            max: Number(process.env.POSTGRES_MAX_CONNECTIONS) || (isProduction ? 10 : 1), 
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            // Enable SSL for production if not a local database. 
            // Most managed providers (Supabase, Neon) require SSL.
            ssl: isProduction && !isLocal ? { rejectUnauthorized: false } : false
        });

        // Error handling for the pool
        pgPoolInstance.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    return pgPoolInstance;
};

const getOpenAIClient = () => {
    if (!openaiInstance) {
        openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiInstance;
};

export const db = getPgPool();
export const openai = getOpenAIClient();
