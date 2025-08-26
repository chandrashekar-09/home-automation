'use server';
/**
 * @fileOverview LLM-based answer generation flow for question answering on PDF documents.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateAnswerInput,
  GenerateAnswerOutput,
  GenerateAnswerInputSchema,
  GenerateAnswerOutputSchema,
} from './types';

const generateAnswerPrompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {
    schema: GenerateAnswerInputSchema,
  },
  output: {
    schema: GenerateAnswerOutputSchema,
  },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a helpful AI assistant designed to answer questions based *only* on the provided context from a document. Your answers must be grounded in the text. Do not use any outside knowledge.

If the context does not contain the information needed to answer the question, state that you could not find the answer in the document.

Context from the document:
---
{{{context}}}
---

Based on the context above, please answer the following question.

Question: {{{question}}}`,
});

const generateAnswerFlow = ai.defineFlow(
  {
    name: 'generateAnswerFlow',
    inputSchema: GenerateAnswerInputSchema,
    outputSchema: GenerateAnswerOutputSchema,
  },
  async (input) => {
    const {output} = await generateAnswerPrompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid answer.');
    }
    return output;
  }
);

export async function generateAnswer(
  input: GenerateAnswerInput
): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}
