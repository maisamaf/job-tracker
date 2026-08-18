"use client"

import type { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BulkDeleteDialogProps {
  open: boolean
  count: number
  itemLabel: string
  itemLabelPlural: string
  description: ReactNode
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function BulkDeleteDialog({
  open,
  count,
  itemLabel,
  itemLabelPlural,
  description,
  isPending,
  onCancel,
  onConfirm,
}: BulkDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count > 1 ? `${count} ${itemLabelPlural}` : itemLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
