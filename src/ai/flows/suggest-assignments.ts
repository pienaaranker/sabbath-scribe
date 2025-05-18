'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting church roster assignments based on historical data and member availability.
 *
 * - suggestAssignments - A function that suggests assignments for church roles.
 * - SuggestAssignmentsInput - The input type for the suggestAssignments function.
 * - SuggestAssignmentsOutput - The return type for the suggestAssignments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAssignmentsInputSchema = z.object({
  date: z.string().describe('The date for which assignments are needed (YYYY-MM-DD).'),
  roles: z.array(z.string()).describe('The roles that need to be assigned (e.g., Preacher, Elder on Duty).'),
  availablePeople: z
    .array(z.object({
      name: z.string(),
      roles: z.array(z.string()).optional(),
      availability: z.array(z.string()).optional(), // Array of dates they are unavailable (YYYY-MM-DD)
    }))
    .describe('A list of people and their roles/availability.'),
  historicalData: z.string().describe('Historical assignment data to consider.'),
});

export type SuggestAssignmentsInput = z.infer<typeof SuggestAssignmentsInputSchema>;

const SuggestAssignmentsOutputSchema = z.record(z.string(), z.string().nullable()).describe(
  'A map of role to assigned person name, with null indicating no suitable assignment could be found.'
);

export type SuggestAssignmentsOutput = z.infer<typeof SuggestAssignmentsOutputSchema>;

export async function suggestAssignments(input: SuggestAssignmentsInput): Promise<SuggestAssignmentsOutput> {
  return suggestAssignmentsFlow(input);
}

const suggestAssignmentsPrompt = ai.definePrompt({
  name: 'suggestAssignmentsPrompt',
  input: {schema: SuggestAssignmentsInputSchema},
  output: {schema: SuggestAssignmentsOutputSchema},
  prompt: `You are an AI assistant designed to suggest assignments for church roles, taking into account availability and historical data.

Given the following information, suggest who should be assigned to each role for the specified date. If a role cannot be filled, indicate that the role cannot be filled (respond with null).

Date: {{{date}}}
Roles: {{#each roles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Available People: {{#each availablePeople}}{{{name}}} (Roles: {{#if roles}}{{#each roles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Any{{/if}}, Unavailable: {{#if availability}}{{#each availability}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}){{#unless @last}}\n{{/unless}}{{/each}}
Historical Data: {{{historicalData}}}

Output a JSON object mapping roles to the name of the person assigned to that role, or null if no one is available for that role. The keys of the object should be the roles provided in the input.
{
  "Preacher": "John Doe",
  "Elder on Duty": null,
  ...
}`,
});

const suggestAssignmentsFlow = ai.defineFlow(
  {
    name: 'suggestAssignmentsFlow',
    inputSchema: SuggestAssignmentsInputSchema,
    outputSchema: SuggestAssignmentsOutputSchema,
  },
  async input => {
    const {output} = await suggestAssignmentsPrompt(input);
    return output!;
  }
);
