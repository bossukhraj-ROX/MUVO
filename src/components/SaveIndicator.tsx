import { Check, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import { useProject } from '../lib/projectContext';
import './SaveIndicator.css';

export default function SaveIndicator() {
  const { saveState } = useProject();

  if (saveState === 'idle') return null;

  const config = {
    saving: { icon: Loader2, text: 'Saving…', class: 'save-saving', spin: true },
    saved: { icon: Check, text: 'Saved', class: 'save-saved', spin: false },
    error: { icon: AlertCircle, text: 'Save failed', class: 'save-error', spin: false },
  } as const;

  const { icon: Icon, text, class: cls, spin } = config[saveState as keyof typeof config] || config.saving;

  return (
    <div className={`save-indicator ${cls}`}>
      <Icon size={14} className={spin ? 'spin' : ''} />
      <span>{text}</span>
    </div>
  );
}
