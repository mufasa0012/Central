'use server';
/**
 * @fileOverview An AI flow for recognizing product details from an image.
 *
 * - recognizeProductFromImage - A function that analyzes a product photo.
 * - RecognizeProductInput - The input type for the recognizeProductFromImage function.
 * - RecognizeProductOutput - The return type for the recognizeProductFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecognizeProductInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RecognizeProductInput = z.infer<typeof RecognizeProductInputSchema>;

const RecognizeProductOutputSchema = z.object({
  productName: z.string().describe('The identified name of the product.'),
  brand: z.string().describe('The identified brand of the product.'),
  category: z.string().describe('The suggested category for the product.'),
});
export type RecognizeProductOutput = z.infer<typeof RecognizeProductOutputSchema>;

export async function recognizeProductFromImage(input: RecognizeProductInput): Promise<RecognizeProductOutput> {
  return recognizeProductFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeProductPrompt',
  input: {schema: RecognizeProductInputSchema},
  output: {schema: RecognizeProductOutputSchema},
  prompt: `You are an expert product identifier for a retail shop. Your task is to analyze the provided image of a product and extract its key details.

  Identify the product's full name, its brand, and suggest an appropriate category for it.
  
  Example categories: Grains, Pantry, Dairy, Bakery, Detergents, Beverages, Produce, Snacks, Canned Goods, Household.

  Image: {{media url=photoDataUri}}`,
});

const recognizeProductFlow = ai.defineFlow(
  {
    name: 'recognizeProductFlow',
    inputSchema: RecognizeProductInputSchema,
    outputSchema: RecognizeProductOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
