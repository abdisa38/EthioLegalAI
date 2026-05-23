const { ChromaClient } = require("chromadb");

let client;
let collection;

const getCollection = async () => {
  const chromaUrl = process.env.CHROMA_URL;
  if (!chromaUrl) {
    return null;
  }

  if (!client) {
    client = new ChromaClient({ path: chromaUrl });
  }

  if (!collection) {
    const name = process.env.CHROMA_COLLECTION || "ethiolegalai";
    collection = await client.getOrCreateCollection({ name });
  }

  return collection;
};

const addDocuments = async ({ ids, embeddings, documents, metadatas }) => {
  const store = await getCollection();
  if (!store) {
    return false;
  }
  await store.add({ ids, embeddings, documents, metadatas });
  return true;
};

const queryDocuments = async ({ embedding, where, nResults }) => {
  const store = await getCollection();
  if (!store) {
    return { documents: [] };
  }
  return store.query({
    queryEmbeddings: [embedding],
    nResults: nResults || 4,
    where: where || {},
  });
};

module.exports = {
  addDocuments,
  queryDocuments,
};
