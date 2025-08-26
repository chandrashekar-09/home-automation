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
    .describe('The relevant text excerpts from the PDF content.'),
});
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

export async function semanticSearch(
  input: SemanticSearchInput
): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const prompt = `You are an expert academic assistant. A student has uploaded PDF documents, and wants to ask a question.

  Your job is to return relevant excerpts from the PDF content that will help answer the question.

  Question: {{question}}

  PDF Content: {{pdfContent}}

  Return the excerpts as a list of strings.
  `;

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: SemanticSearchOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
      prompt: {
        text: prompt,
        input: input,
      },
      output: {
        schema: SemanticSearchOutputSchema,
      },
    });
    return output!;
  }
);
