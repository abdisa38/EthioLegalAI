let collectionId;

const getBaseUrl = () => {
  const chromaUrl = process.env.CHROMA_URL;
  if (!chromaUrl) {
    return null;
  }
  return chromaUrl.replace(/\/$/, "");
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Chroma error ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
};

const getCollectionId = async () => {
  if (collectionId) return collectionId;
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const name = process.env.CHROMA_COLLECTION || "ethiolegalai";
  const list = await fetchJson(`${baseUrl}/api/v1/collections`);
  const collections = list.collections || list || [];
  const existing = collections.find((item) => item.name === name);

  if (existing) {
    collectionId = existing.id;
    return collectionId;
  }

  const created = await fetchJson(`${baseUrl}/api/v1/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  collectionId = created.id;
  return collectionId;
};

const addDocuments = async ({ ids, embeddings, documents, metadatas }) => {
  const baseUrl = getBaseUrl();
  const id = await getCollectionId();
  if (!baseUrl || !id) {
    return false;
  }

  await fetchJson(`${baseUrl}/api/v1/collections/${id}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, embeddings, documents, metadatas }),
  });
  return true;
};

const queryDocuments = async ({ embedding, where, nResults, include }) => {
  const baseUrl = getBaseUrl();
  const id = await getCollectionId();
  if (!baseUrl || !id) {
    return { documents: [] };
  }

  return fetchJson(`${baseUrl}/api/v1/collections/${id}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query_embeddings: [embedding],
      n_results: nResults || 4,
      where: where || {},
      include: include || ["documents", "metadatas", "distances"],
    }),
  });
};

module.exports = {
  addDocuments,
  queryDocuments,
};
