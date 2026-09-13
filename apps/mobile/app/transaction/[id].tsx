import React from 'react';
import { AuraScaffoldScreen } from '../../src/components/AuraScaffoldScreen';

export default function TransactionDetailScreen(): React.ReactElement {
  return (
    <AuraScaffoldScreen
      eyebrow="AURA MONEY"
      icon="card-outline"
      title="Transaction Detail"
      description="Inspect a transaction, its category, and Aura's explanation before taking any corrective action."
      nextStep="Live transaction details and categorization controls are next."
    />
  );
}
