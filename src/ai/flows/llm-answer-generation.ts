'use server';
/**
 * @fileOverview LLM-based answer generation flow for question answering on PDF documents.
 *
 * - generateAnswer - A function that generates an answer to a question based on retrieved document content.
 * - GenerateAnswerInput - The input type for the generateAnswer function.
 * - GenerateAnswerOutput - The return type for the generateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswerInputSchema = z.object({
  question: z.string().describe('The question to answer.'),
  context: z.string().describe('The relevant context from the document.'),
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerInputSchema>;

const GenerateAnswerOutputSchema = z.object({
  answer: z
    .string()
    .describe('The answer to the question, grounded in the provided context.'),
});
export type GenerateAnswerOutput = z.infer<typeof GenerateAnswerOutputSchema>;

export async function generateAnswer(
  input: GenerateAnswerInput
): Promise<GenerateAnswerOutput> {
  return generateAnswerFlow(input);
}

const generateAnswerPrompt = ai.definePrompt({
  name: 'generateAnswerPrompt',
  input: {
    schema: GenerateAnswerInputSchema,
  },
  output: {
    schema: GenerateAnswerOutputSchema,
  },
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
    return output!;
  }
);
