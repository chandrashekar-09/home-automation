import {z} from 'genkit';

// Schemas for llm-answer-generation.ts
export const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The question to answer.'),
  context: z.string().describe('The relevant context from the document.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

export const GenerateAnswerOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question, grounded in the provided context.'),
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

// Schemas for semantic-search.ts
export const SemanticSearchInputSchema = z.object({
  question: z
    .string()
    .describe('The question to search for relevant information.'),
  pdfContent: z
    .string()
    .describe('The extracted text content from the PDF documents.'),
});
export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

export const SemanticSearchOutputSchema = z.object({
  excerpts: z
    .array(z.string())
    .describe(
      'The most relevant text excerpts from the PDF content that help answer the question.'
    ),
});
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;
