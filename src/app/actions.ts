'use server';

import {generateAnswer} from '@/ai/flows/llm-answer-generation';
import {semanticSearch} from '@/ai/flows/semantic-search';
import {z} from 'zod';

const scholarAiActionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  pdfContent: z.string().min(1, 'PDF content cannot be empty.'),
});

export async function askQuestion(input: {
  question: string;
  pdfContent: string;
}) {
  const validation = scholarAiActionSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
      answer: null,
      excerpts: null,
    };
  }

  const {question, pdfContent} = validation.data;

  try {
    const searchResult = await semanticSearch({question, pdfContent});

    const excerpts = searchResult.excerpts;

    if (!excerpts || excerpts.length === 0) {
      return {
        success: true,
        answer:
          "I couldn't find any relevant information in the document to answer your question.",
        excerpts: [],
      };
    }

    const context = excerpts.join('\n\n---\n\n');

    const answerResult = await generateAnswer({question, context});

    return {
      success: true,
      answer: answerResult.answer,
      excerpts,
    };
  } catch (error) {
    console.error('Error in askQuestion action:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: `An unexpected error occurred while processing your question. ${errorMessage}`,
      answer: null,
      excerpts: null,
    };
  }
}
