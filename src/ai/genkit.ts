
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Note: You can also pass custom configuration to the genkit() function.
// See: https://firebase.google.com/docs/genkit/node/configuration
export const ai = genkit({
  plugins: [
    googleAI({
      // Note: The Node.js SDK requires an API key for Google AI.
      // You can create a key in Google AI Studio: https://aistudio.google.com/app/apikey
      // It is recommended to specify the key in the an environment variable:
      // `export GEMINI_API_KEY=<your key>`
    }),
  ],
});
