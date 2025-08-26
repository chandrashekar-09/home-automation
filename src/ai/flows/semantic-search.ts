'use server';
/**
 * @fileOverview Semantic search flow for retrieving relevant text excerpts from uploaded PDFs.
 *
 * - semanticSearch - A function that takes a question and PDF content and returns relevant text excerpts.
 * - SemanticSearchInput - The input type for the semanticSearch function.
 * - SemanticSearchOutput - The return type for the semanticSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticSearchInputSchema = z.object({
  question: z
    .string()
    .describe('The question to search for relevant information.'),
  pdfContent: z
    .string()
    .describe('The extracted text content from the PDF documents.'),
});
export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

const SemanticSearchOutputSchema = z.object({
  excerpts: z
    .array(z.string())
    .describe('The most relevant text excerpts from the PDF content that help answer the question.'),
});
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

export async function semanticSearch(
  input: SemanticSearchInput
): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const semanticSearchPrompt = ai.definePrompt({
  name: 'semanticSearchPrompt',
  input: {
    schema: SemanticSearchInputSchema,
  },
  output: {
    schema: SemanticSearchOutputSchema,
  },
  prompt: `You are an expert academic research assistant. A student has provided the text content of a PDF document and has a question about it.

Your task is to carefully analyze the PDF content and extract the most relevant excerpts that will help answer the student's question. Return a list of the most relevant text excerpts.

Question: {{{question}}}

PDF Content:
---
{{{pdfContent}}}
---

Return the excerpts as a list of strings.`,
});

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: SemanticSearchOutputSchema,
  },
  async (input) => {
    const {output} = await semanticSearchPrompt(input);
    return output!;
  }
);
