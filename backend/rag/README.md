# RAG pipeline

This folder contains the Retrieval-Augmented Generation pipeline for EthioLegal AI.

## Environment variables

- CHROMA_URL: Chroma server URL (example: http://localhost:8000)
- CHROMA_COLLECTION: Chroma collection name
- GEMINI_EMBED_MODEL: Gemini embedding model (example: gemini-embedding-001)
- RAG_CHUNK_SIZE: Chunk size for text splitting (default: 1000)
- RAG_CHUNK_OVERLAP: Chunk overlap for text splitting (default: 150)
- RAG_TOP_K: Number of chunks to retrieve for each query (default: 4)
- RAG_RETRIEVE_K: Number of chunks to fetch before reranking (default: 12)
- RAG_MAX_RESULTS: Maximum chunks kept after reranking (default: 4)
- RAG_MIN_CHUNK_SIZE: Minimum chunk length (default: 200)
- RAG_MAX_CHUNKS: Max chunks to index per document (default: 200)
- RAG_MAX_CONTEXT_CHARS: Max characters injected into prompt (default: 3500)
- RAG_SIMILARITY_THRESHOLD: Minimum similarity score (default: 0.45)
- RAG_DEBUG: Log retrieval debug info (true/false)

## Notes

- Uploading a document extracts text, splits into chunks, and stores embeddings in Chroma.
- Chat queries fetch relevant chunks for the current user, rerank them, and inject them into Gemini prompts.
