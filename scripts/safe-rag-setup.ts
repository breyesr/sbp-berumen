import { db } from "../src/lib/clients";

async function safeSetup() {
  console.log("🚀 Starting safe RAG infrastructure setup...");
  try {
    // 1. Ensure vector extension
    await db.query("CREATE EXTENSION IF NOT EXISTS vector;");
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
    await db.query(createTableQuery);
    console.log("✅ Table 'documents' verified.");

    // 3. Create indexes safely
    await db.query("CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents USING GIN (metadata);");
    await db.query("CREATE INDEX IF NOT EXISTS documents_tsvector_idx ON documents USING GIN (content_tsvector);");
    // HNSW index for vector search
    try {
        await db.query("CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING HNSW (embedding vector_l2_ops);");
        console.log("✅ Vector search indexes verified.");
    } catch (e) {
        console.warn("⚠️ HNSW index creation failed (might be lack of memory or version support), but basic table is ready.");
    }

    console.log("\n🎉 RAG infrastructure is ready and safe.");
  } catch (err) {
    console.error("❌ Setup failed:", err);
  } finally {
    process.exit(0);
  }
}

safeSetup();
