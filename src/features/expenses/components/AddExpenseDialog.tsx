import { Modal } from '@/components/ui/modal'
import { AddExpenseForm } from './AddExpenseForm'

export interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Centre dialog on desktop, bottom sheet on mobile — the Modal handles both. */
export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Log an expense"
      description="It updates your budget and savings right away."
    >
      <AddExpenseForm onSuccess={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />
    </Modal>
  )
}
