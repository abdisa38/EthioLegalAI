const { z } = require("zod");

const askSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required").max(4000, "Message too long"),
    language: z.string().optional(),
  }),
});

module.exports = {
  askSchema,
};
