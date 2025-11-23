import React from 'react';
import { useAccessibility } from '../src/accessibility/AccessibilityContext';

export default function Dashboard() {
  const { state } = useAccessibility();
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: `${20 * state.fontScale}px` }}>Dashboard</h1>
      <p style={{ fontSize: `${14 * state.fontScale}px` }}>Textos e componentes podem usar state.fontScale, highContrast etc.</p>
    </div>
  );
}
