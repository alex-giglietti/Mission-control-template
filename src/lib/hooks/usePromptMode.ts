'use client';

import { useState, useEffect } from 'react';

export function usePromptMode() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem('mission_control_prompt_mode') === 'true');
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('mission_control_prompt_mode', String(next));
  };

  return { enabled, toggle };
}
