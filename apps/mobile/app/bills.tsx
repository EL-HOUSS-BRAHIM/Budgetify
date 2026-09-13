import React from 'react';
import { AuraScaffoldScreen } from '../src/components/AuraScaffoldScreen';

export default function BillsScreen(): React.ReactElement {
  return (
    <AuraScaffoldScreen
      eyebrow="LYVORA MONEY"
      icon="receipt-outline"
      title="Subscriptions & Bills"
      description="Review recurring commitments, upcoming due dates, and changes that need your attention."
      nextStep="Recurring-bill detection and review actions are next."
    />
  );
}
