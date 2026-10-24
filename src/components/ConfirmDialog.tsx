import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="440px">
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-6)', lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          className={`btn btn-sm ${destructive ? 'btn-destructive' : 'btn-primary'}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
