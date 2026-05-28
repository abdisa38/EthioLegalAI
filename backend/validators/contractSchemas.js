const { z } = require("zod");

const analyzeSchema = z.object({
  body: z.object({
    documentId: z.string().min(1, "documentId is required"),
    language: z.string().optional(),
    refresh: z.boolean().optional(),
  }),
});

const getSchema = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});

module.exports = {
  analyzeSchema,
  getSchema,
};
