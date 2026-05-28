const { z } = require("zod");

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required").max(4000, "Message too long"),
    language: z.string().optional(),
  }),
});

const simplifySchema = z.object({
  body: z.object({
    text: z.string().min(1, "Text is required").max(10000, "Text too long"),
    language: z.string().optional(),
  }),
});

module.exports = {
  chatSchema,
  simplifySchema,
};
