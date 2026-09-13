import React from 'react';
import { AuraScaffoldScreen } from '../src/components/AuraScaffoldScreen';

export default function PrivacyScreen(): React.ReactElement {
  return (
    <AuraScaffoldScreen
      eyebrow="LYVORA PRIVACY"
      icon="shield-checkmark-outline"
      title="Privacy & AI Access"
      description="Control the data Lyvora may read, what it may prepare, and the approval level required for each action."
      nextStep="Granular AI permissions and data export controls are next."
    />
  );
}
