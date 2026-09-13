import React from 'react';
import { AuraScaffoldScreen } from '../src/components/AuraScaffoldScreen';

export default function SalaryDayScreen(): React.ReactElement {
  return (
    <AuraScaffoldScreen
      eyebrow="AURA PLAN"
      icon="cash-outline"
      title="Salary Day"
      description="Guide new income into essentials, reserves, and goals with clear approval before anything is prepared."
      nextStep="Income allocation recommendations and approval are next."
    />
  );
}
