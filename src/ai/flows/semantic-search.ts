'use server';
/**
 * @fileOverview Semantic search flow for retrieving relevant text excerpts from uploaded PDFs.
 */

import {ai} from '@/ai/genkit';
import {
  SemanticSearchInput,
  SemanticSearchOutput,
  SemanticSearchInputSchema,
  SemanticSearchOutputSchema,
} from './types';

const semanticSearchPrompt = ai.definePrompt({
  name: 'semanticSearchPrompt',
  input: {
    schema: SemanticSearchInputSchema,
  },
  output: {
    schema: SemanticSearchOutputSchema,
  },
  model: 'googleai/gemini-1.5-flash',
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
    if (!output) {
      throw new Error('The AI model did not return valid excerpts.');
    }
    return output;
  }
);

export async function semanticSearch(
  input: SemanticSearchInput
): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}
