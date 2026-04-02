'use client';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function NextProgressBar() {
  return (
    <ProgressBar
      height="8px"
      color="#34d399"
      options={{ showSpinner: false }}
      delay={0}
    />
  );
}
