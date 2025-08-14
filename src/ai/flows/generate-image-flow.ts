
'use server';
/**
 * @fileOverview An AI flow for generating images from a text prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(promptText: string): Promise<GenerateImageOutput> {
  return generateImageFlow(promptText);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.string(),
    outputSchema: GenerateImageOutputSchema,
  },
  async (prompt) => {
    console.log('Generating image with prompt:', prompt);
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media?.url) {
        console.error('Image generation failed to return a valid media object.');
        throw new Error('Image generation failed to return an image.');
      }
      
      console.log('Image generated successfully.');
      return { imageDataUri: media.url };

    } catch (error) {
        console.error("Error in generateImageFlow:", error);
        throw new Error(`Image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
