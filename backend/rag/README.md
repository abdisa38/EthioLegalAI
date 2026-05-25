# RAG pipeline

This folder contains the Retrieval-Augmented Generation pipeline for EthioLegal AI.

## Environment variables

- CHROMA_URL: Chroma server URL (example: http://localhost:8000)
- CHROMA_COLLECTION: Chroma collection name
- GEMINI_EMBED_MODEL: Gemini embedding model (example: gemini-embedding-001)
- RAG_CHUNK_SIZE: Chunk size for text splitting (default: 1000)
- RAG_CHUNK_OVERLAP: Chunk overlap for text splitting (default: 150)
- RAG_TOP_K: Number of chunks to retrieve for each query (default: 4)

## Notes

- Uploading a document extracts text, splits into chunks, and stores embeddings in Chroma.
- Chat queries fetch relevant chunks for the current user and inject them into Gemini prompts.
