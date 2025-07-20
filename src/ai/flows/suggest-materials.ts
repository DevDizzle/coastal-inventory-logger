// src/ai/flows/suggest-materials.ts
'use server';
/**
 * @fileOverview A flow to suggest materials based on user input, tailored to a specific industry.
 *
 * - suggestMaterials - A function that suggests materials based on the input.
 * - SuggestMaterialsInput - The input type for the suggestMaterials function.
 * - SuggestMaterialsOutput - The return type for the suggestMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMaterialsInputSchema = z.object({
  partialMaterialName: z
    .string()
    .describe('The partial name of the material the user is typing.'),
  industry: z.string().describe('The industry of the customer.'),
});
export type SuggestMaterialsInput = z.infer<typeof SuggestMaterialsInputSchema>;

const SuggestMaterialsOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggested material name relevant to the industry.')
  ),
});
export type SuggestMaterialsOutput = z.infer<typeof SuggestMaterialsOutputSchema>;

export async function suggestMaterials(input: SuggestMaterialsInput): Promise<SuggestMaterialsOutput> {
  return suggestMaterialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMaterialsPrompt',
  input: {schema: SuggestMaterialsInputSchema},
  output: {schema: SuggestMaterialsOutputSchema},
  prompt: `You are an expert inventory management assistant. Your job is to provide material suggestions to the user based on what they are typing, for the industry that they are in.

Industry: {{{industry}}}
Partial Material Name: {{{partialMaterialName}}}

Suggest up to 5 materials that the user may be looking for. Respond as a JSON array of strings. Do not include any additional text in your response.`,
});

const suggestMaterialsFlow = ai.defineFlow(
  {
    name: 'suggestMaterialsFlow',
    inputSchema: SuggestMaterialsInputSchema,
    outputSchema: SuggestMaterialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
