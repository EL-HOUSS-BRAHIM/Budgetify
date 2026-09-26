import { z } from 'zod';

export const ToolDefinitions = [
  {
    name: 'record_expense',
    description: 'Record an actual expense transaction that occurred.',
    parameters: z.object({
      amount: z.number().positive().describe('The expense amount (e.g. 15.50 for $15.50)'),
      category: z
        .string()
        .describe(
          'The category name (e.g. Food & Dining, Groceries, Transport, Entertainment, Utilities)',
        ),
      description: z.string().describe('Description or merchant name of the expense'),
      date: z
        .string()
        .optional()
        .describe('ISO date string of when the expense occurred (defaults to now)'),
    }),
  },
  {
    name: 'record_income',
    description: 'Record an income transaction (e.g. salary, freelance, gift).',
    parameters: z.object({
      amount: z.number().positive().describe('The income amount (e.g. 2500 for $2500)'),
      category: z.string().default('Salary & Income').describe('The income category'),
      description: z.string().describe('Description of the income source'),
      date: z.string().optional().describe('ISO date string (defaults to now)'),
    }),
  },
  {
    name: 'add_planned_item',
    description: 'Add a planned expense, bill, or checklist item for the month.',
    parameters: z.object({
      title: z
        .string()
        .describe(
          'Title of the planned item or bill (e.g. Internet Bill, Dental checkup, Car maintenance)',
        ),
      expected_amount: z.number().nonnegative().describe('Estimated or exact amount in dollars'),
      category: z.string().default('General').describe('Category name'),
      due_date: z.string().optional().describe('Expected due date (YYYY-MM-DD)'),
      is_recurring: z.boolean().default(false).describe('Whether this is a recurring monthly bill'),
      is_unplanned: z
        .boolean()
        .default(false)
        .describe('Set to true if this was an unexpected/unplanned expense added on the fly'),
    }),
  },
  {
    name: 'toggle_plan_item_status',
    description: 'Mark a planned bill or checklist item as done (paid) or undone (unpaid).',
    parameters: z.object({
      title_or_id: z
        .string()
        .describe('The title or ID of the planned item to mark (e.g. "Internet", "Rent")'),
      is_done: z.boolean().describe('True to mark as done/paid, False to mark as pending/unpaid'),
    }),
  },
  {
    name: 'get_financial_summary',
    description: 'Get total monthly spending, income, budget status, and pending checklist items.',
    parameters: z.object({
      month: z.string().optional().describe('Month string or date (defaults to current month)'),
    }),
  },
] as const;

export type ToolName = (typeof ToolDefinitions)[number]['name'];
