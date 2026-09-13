# Budgetify Mobile Design Guide

Status: active source of truth for mobile UI decisions

## Product Promise

Budgetify is an AI-native personal financial operating system. It understands
the user's current position, learns from past money movement, anticipates what
comes next, and helps turn goals into an actionable plan.

The product promise is: **Your money should manage itself. You tell Budgetify
what you want, review the plan, and remain in control.**

Every daily experience should answer three questions quickly:

1. What can I safely spend now?
2. What changed, and what is likely to happen next?
3. What decision, bill, plan, or goal needs my attention?

The interface should progressively reduce manual work without hiding risk or
removing user agency. It must be calm, candid, useful before decorative, and
clear enough to scan with one hand in a few seconds.

## Product Layers

The product works as five connected layers rather than a collection of isolated
features:

1. **Money:** accounts, cash, cards, income, transactions, bills,
  subscriptions, loans, savings, and investments.
2. **Intelligence:** safe-to-spend, financial health, unusual spending,
  affordability, cash-flow pressure, savings capacity, and forecasts.
3. **Automation:** categorization, recurring-payment detection, reminders,
  adaptive plans, and user-approved rules.
4. **AI:** context-aware text and voice commands that explain, suggest, prepare,
  and, only with appropriate approval, execute actions.
5. **Planning:** today, this month, future cash flow, scenarios, goals, and
  long-term progress.

Money is the source of truth. Intelligence derives from it. Automation and AI
operate through the same reviewed domain actions used by the interface.

## Experience Principles

1. **Decisions before decoration.** Lead with remaining money, upcoming
   obligations, and exceptions. Avoid generic charts or cards without an action.
2. **Plain financial language.** Use “Left to spend,” “Due this week,” and
   “Over budget,” not accounting jargon.
3. **One primary action per view.** Secondary actions remain available but do not
   compete with the next useful step.
4. **Trust is visible.** Show dates, status, source, loading, errors, and whether a
   change was saved. Never imply that mock or stale data is current.
5. **Color carries meaning sparingly.** Green is the brand and positive state;
   red is reserved for loss, danger, or overspending; amber means attention.
6. **Assistant actions are reviewable.** Echo the interpreted amount, category,
   and date. Destructive or ambiguous actions require confirmation.
7. **Accessible by default.** Support dynamic text, screen readers, reduced
   motion, password managers, 48 dp touch targets, and non-color status labels.
8. **Future as well as history.** Show predicted transactions and balances next
  to actual activity, with prediction styling, confidence, and provenance.
9. **Progressively less work.** Repeated actions should become suggestions and
  opt-in rules, while every automation remains inspectable and reversible.

## Information Architecture

The bottom navigation contains no more than five destinations.

| Tab | User question | Primary content |
| --- | --- | --- |
| Home | “What matters now?” | Safe-to-spend, snapshot, health, upcoming obligations, timeline, insights |
| Money | “Where is my money?” | Accounts, transactions, cards, cash, bills, subscriptions |
| Plan | “What should my money do?” | Salary allocation, budgets, calendar, recurring commitments, forecast |
| Goals | “What am I building toward?” | Goal progress, contribution plans, scenarios, milestones |
| AI | “Can Budgetify help me decide or do this?” | Context-aware chat/voice, explanations, proposals, action review |

Settings is not a primary job. Open it from the profile control in a screen
header. Adding a transaction remains a focused modal opened from Home and
Money. Financial Health, Forecast, What If, Inbox, Reports, Automations, and
Privacy are focused secondary destinations, not additional permanent tabs.

## North-Star Metric: Safe-to-Spend

Safe-to-Spend is the dominant daily number. It is not the current balance and
must never be presented as one.

```text
liquid funds
+ reliable income expected before the planning horizon
- unpaid obligations due in that horizon
- committed savings and goal contributions
- the user's minimum safety buffer
- forecast essential variable spending
= safe-to-spend
```

- Store and calculate every amount in integer minor units.
- Include only sources and commitments with explicit dates and ownership.
- Show the planning horizon, last update time, included accounts, and confidence.
- Label incomplete results as estimates and explain which inputs are missing.
- If required inputs are absent, show “Safe-to-Spend is not ready” with the next
  setup action. Never substitute account balance, budget remaining, or fixtures.
- A negative value is a projected shortfall. Preserve the sign and pair it with
  the earliest cause and one review action.

## Home Command Center

Home prioritizes decisions in this order:

1. Safe-to-Spend, its horizon, confidence, and plain-language explanation.
2. Financial snapshot: available funds, spending, saved amount, and upcoming
  commitments. No more than three supporting metrics share equal weight.
3. Attention queue: bills due, forecast risk, uncategorized activity, and
  assistant proposals awaiting review.
4. Financial timeline: actual past events and clearly distinguished predicted
  future events, ending in a projected balance.
5. One contextual insight or recommendation with “Why?” and a reversible action.

The first viewport must communicate the user's current position and next useful
action. Charts, health scores, and recommendations never displace the underlying
amounts, dates, and explanation.

## Visual Direction

The visual language is a modern personal ledger: crisp columns, quiet surfaces,
strong numeric hierarchy, compact rows, and restrained borders. Avoid
glassmorphism, decorative gradients, oversized headings, emoji icons, nested
cards, and shadows used as decoration.

- **Mood:** capable, calm, candid, practical
- **Density:** compact but touch-safe
- **Shape:** 8 px card radius; circular icon controls; no pill-shaped containers
  unless the control is a filter or segmented choice
- **Elevation:** borders first; one subtle shadow level only for floating UI
- **Icons:** one outlined vector family at 20/24 px; filled version only for the
  selected bottom-tab state

## Color System

Components consume semantic tokens, never primitive colors directly.

### Primitive Palette

| Token | Value | Purpose |
| --- | --- | --- |
| `pine-800` | `#0F6B4F` | Brand anchor and primary action |
| `pine-700` | `#0F7A5A` | Pressed/high-emphasis brand state |
| `pine-100` | `#DDF3E9` | Positive/brand-tinted surfaces |
| `cobalt-700` | `#1D4ED8` | Informational action and links |
| `cobalt-100` | `#DBEAFE` | Informational surface |
| `coral-700` | `#B42318` | Expense, destructive, over-budget |
| `coral-100` | `#FEE4E2` | Destructive/expense surface |
| `amber-700` | `#B54708` | Due soon, warning, attention |
| `amber-100` | `#FEF0C7` | Warning surface |
| `ink-950` | `#17211B` | Primary light-theme text |
| `ink-700` | `#34453B` | Secondary light-theme text |
| `ink-500` | `#5D6C63` | Muted light-theme text |
| `mist-100` | `#F4F7F5` | App background |
| `mist-200` | `#E7EDE9` | Subtle fill and divider |
| `mist-300` | `#D5DFD9` | Strong border |
| `white` | `#FFFFFF` | Primary light-theme surface |

### Semantic Tokens

| Role | Light | Dark |
| --- | --- | --- |
| `background.primary` | `#F4F7F5` | `#0F1713` |
| `background.secondary` | `#EAF0EC` | `#131E18` |
| `background.card` | `#FFFFFF` | `#18231D` |
| `background.raised` | `#FFFFFF` | `#1F2C25` |
| `text.primary` | `#17211B` | `#F4F7F5` |
| `text.secondary` | `#34453B` | `#C5D0C9` |
| `text.tertiary` | `#5D6C63` | `#98AAA0` |
| `brand.primary` | `#0F6B4F` | `#4FD1A1` |
| `brand.onPrimary` | `#FFFFFF` | `#08251A` |
| `brand.soft` | `#DDF3E9` | `#173B2E` |
| `semantic.info` | `#1D4ED8` | `#7AA2FF` |
| `semantic.warning` | `#B54708` | `#F6C177` |
| `semantic.expense` | `#B42318` | `#FF8A80` |
| `semantic.income` | `#067647` | `#58D6A0` |
| `border.default` | `#D5DFD9` | `#35443B` |
| `border.subtle` | `#E7EDE9` | `#26342C` |

White text is used only on sufficiently dark fills. Muted text must retain a
minimum 4.5:1 contrast ratio. Charts use labels or patterns in addition to
color.

## Typography

Use **Manrope** throughout the app. It is compact, legible, and gives numbers a
clear contemporary rhythm. Enable tabular numerals for balances and amounts.

| Style | Size / line | Weight | Use |
| --- | --- | --- | --- |
| Display | 32 / 38 | 700 | One key balance or safe-to-spend amount |
| Title 1 | 24 / 30 | 700 | Screen title |
| Title 2 | 20 / 26 | 700 | Major section |
| Title 3 | 17 / 22 | 600 | Row group or compact panel heading |
| Body | 15 / 22 | 400 | Default content |
| Body strong | 15 / 22 | 600 | Labels and row titles |
| Small | 13 / 18 | 400 | Supporting information |
| Label | 12 / 16 | 600 | Controls and metadata |
| Micro | 11 / 14 | 600 | Chart axes and compact status only |

Do not scale type with viewport width. Allow text to wrap, respect dynamic type,
and avoid all-caps paragraphs. Amounts align by decimal where practical.

## Spacing, Radius, and Size

- Base spacing unit: 4 dp
- Spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48`
- Phone gutter: 16 dp; large phone/tablet gutter: 24 dp
- Section gap: 24 dp; related-item gap: 8 or 12 dp
- Card radius: 8 dp
- Input/button radius: 8 dp
- Full-round controls: icon buttons, avatars, status dots only
- Minimum touch target: 48 x 48 dp on Android, 44 x 44 pt on iOS
- Bottom navigation visual height: 64 dp plus safe-area inset

## Core Components

### Screen Header

- Screen title on the left, profile control on the right.
- Optional contextual subtitle; no generic welcome copy.
- Home may show the current month as a compact selector.

### Summary Band

- Unframed full-width content block, not a card inside a card.
- One dominant amount, a plain-language label, comparison, and one next action.
- Never show more than three equally weighted metrics in the first viewport.

### List Row

- Minimum 64 dp height with a 48 dp interaction region.
- Leading category icon, title + metadata, trailing amount/status.
- Dividers align to text, not edge-to-edge through the leading icon.
- Amount sign and text label distinguish income from expense; color is secondary.

### Card

- Use only for a discrete repeated item, alert, or framed tool.
- 8 dp radius, 1 dp border, no shadow by default.
- Do not nest cards or turn entire page sections into floating cards.

### Buttons

- Primary: filled brand color, concise verb, one per view.
- Secondary: bordered surface.
- Tertiary: text or icon button.
- Disabled: visibly muted and non-interactive.
- Loading state preserves button dimensions.

### Inputs and Filters

- Persistent visible label for forms; placeholder is an example, not a label.
- Search may use a leading search icon and clear control.
- Filters use chips or a segmented control only when the set is small and stable.
- Validation appears next to the field and remains until corrected.

### Empty, Loading, Error, and Offline States

- Empty: explain what is absent and offer one relevant action.
- Loading: reserve final layout dimensions; prefer skeleton rows over full-screen
  spinners after initial setup.
- Error: state what failed, preserve entered data, and provide retry.
- Offline/stale: keep cached values visible with a timestamp and explicit status.

## Motion and Feedback

- Press feedback: 80–120 ms opacity or surface-color change; never resize layout.
- Screen/content entrance: 180–240 ms, subtle fade/translate only when it improves
  continuity.
- Completion: short check/state transition plus accessible announcement.
- Respect reduced-motion settings and render the final state immediately.
- Success and failure feedback must be visible and announced; silent writes are
  not acceptable.

## Assistant Experience

- Support text first; voice is an input mode available throughout the product,
  not a separate intelligence layer.
- Composer remains reachable above the keyboard and safe-area inset.
- Suggested prompts demonstrate useful actions, not feature descriptions.
- Before a write, show the interpreted amount, date, account/category, and action.
- Confirm ambiguous or destructive actions. Never invent missing financial data.
- Tool results link to the affected transaction, budget, or plan item.
- Audio is transcribed on device; raw audio is not retained by default.
- Responses use the user's financial context and state which data informed a
  recommendation. Generic financial guidance is visibly separated from a
  personalized calculation.
- Every recommendation offers “Why?”; every completed reversible action offers
  “Undo” for an appropriate bounded period.

### Action Authority

| Level | Assistant may | Required interaction |
| --- | --- | --- |
| Inform | Read and explain financial state | No confirmation |
| Suggest | Recommend an adjustment or scenario | User chooses whether to continue |
| Prepare | Fill a transaction, plan, goal, rule, or transfer proposal | User reviews all material fields |
| Execute | Commit an app write or approved external action | Explicit confirmation and authenticated authorization |

External money movement is disabled by default. The assistant never silently
transfers funds, expands its own permissions, or treats natural-language intent
as approval for a high-impact action.

## Screen Inventory

### Foundation

- Launch/session restoration
- Sign in, create account, reset password, email verification
- First-run currency and consent setup

### Primary Tabs

- Home command center and attention queue
- Money hub: accounts, transactions, cards, cash, bills, and subscriptions
- Plan hub: salary allocation, budgets, calendar, commitments, and forecast
- Goals list, goal detail, contribution plan, and scenarios
- AI conversation, voice input, explanation, and action review

### Secondary Flows

- Add/edit transaction
- Financial Health detail
- Account, transaction, card, bill, subscription, and category detail
- Budget detail/editor and salary allocation approval
- Financial calendar, 30-day forecast, and What If simulator
- AI Inbox, insights, reports, and automation rules
- Receipt scanner and financial document review
- Notifications and shared-finance invitations
- Profile and preferences
- Privacy, permissions, AI data access, export, and account deletion

### Later Platform Expansion

- Read-only bank and card connections before any payment initiation
- Multi-currency display without rewriting historical transaction currency
- Irregular-income planning and cash-wallet reconciliation
- Household/shared finance and AI-assisted splits
- Investments, loans, and net-worth views
- Provider-approved payment execution with step-up authentication and audit trail

## Content Voice

- Direct: “$420 left to spend,” not “Your remaining available balance is $420.”
- Neutral: “Dining is $38 over budget,” not “You overspent again.”
- Actionable: pair risk with a next step.
- Specific: include amount, date, and category whenever available.
- Never use shame, alarmist language, or celebratory copy for routine actions.

## Definition of Done for a Screen

- Uses semantic tokens and shared primitives; no ad-hoc colors or emoji icons.
- Covers loading, empty, error, offline/stale, and success states where relevant.
- Works with light/dark themes, largest text size, and reduced motion.
- Has no clipped text at 360 dp width and no hidden content behind safe areas.
- Every control has a 48 dp target, visible pressed/disabled state, and accessible
  name.
- Financial values use integer minor units and tabular numerals.
- Real data is labeled honestly; mock fallback data is never presented as live.