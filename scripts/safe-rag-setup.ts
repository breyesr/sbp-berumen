import { Client } from "pg";

async function safeSetup() {
  // Get URL from argument or environment
  const url = process.argv[2] || process.env.POSTGRES_URL;

  if (!url) {
    console.error("❌ Error: No database URL provided.");
    console.log("\nUsage:");
    console.log("npx tsx scripts/safe-rag-setup.ts \"postgres://user:pass@host:port/db\"");
    console.log("OR set the POSTGRES_URL environment variable.");
    process.exit(1);
  }

  console.log("🚀 Starting safe RAG infrastructure setup on:");
  console.log(`🔗 ${url.split('@')[1] || 'URL hidden for security'}`);
  
  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    console.log("✅ Connected to database.");

    // 1. Ensure vector extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");
    console.log("✅ Extension 'vector' verified.");

    // 2. Create documents table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY,
        content TEXT NOT NULL,
        embedding VECTOR(1536) NOT NULL,
        metadata JSONB,
        content_tsvector TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
      );
    `;
    await client.query(createTableQuery);
    console.log("✅ Table 'documents' verified.");

    // 3. Create indexes safely
    await client.query("CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents USING GIN (metadata);");
    await client.query("CREATE INDEX IF NOT EXISTS documents_tsvector_idx ON documents USING GIN (content_tsvector);");
    
    // HNSW index for vector search
    try {
        await client.query("CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING HNSW (embedding vector_l2_ops);");
        console.log("✅ Vector search indexes verified.");
    } catch (e) {
        console.warn("⚠️ HNSW index creation failed (likely low memory or DB version), but table is ready.");
    }

    console.log("\n🎉 Remote RAG infrastructure is ready and safe.");
  } catch (err) {
    console.error("❌ Setup failed:", err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

safeSetup();
