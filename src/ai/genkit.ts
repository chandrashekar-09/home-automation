import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  // Use a global model configuration
  generate: {
    model: 'googleai/gemini-1.5-flash',
  },
});
