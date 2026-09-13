import React from 'react';
import { AuraScaffoldScreen } from '../src/components/AuraScaffoldScreen';

export default function ForecastScreen(): React.ReactElement {
  return (
    <AuraScaffoldScreen
      eyebrow="LYVORA FORECAST"
      icon="calendar-outline"
      title="Financial Forecast"
      description="See the cash-flow calendar, upcoming commitments, and confidence-adjusted balance outlook."
      nextStep="Forecast calculations and calendar events are next."
    />
  );
}
