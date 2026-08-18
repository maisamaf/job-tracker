"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteActionResult {
  success: boolean
  error?: string
}

export function useBulkSelection<T extends { id: string }>(
  items: T[],
  deleteAction: (ids: string[]) => Promise<DeleteActionResult>
) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null)

  const allSelected =
    items.length > 0 && items.every((item) => selected.has(item.id))
  const someSelected =
    items.some((item) => selected.has(item.id)) && !allSelected

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(items.map((item) => item.id)) : new Set())
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const ids = pendingDelete
    setPendingDelete(null)
    startTransition(async () => {
      const result = await deleteAction(ids)
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete.")
        return
      }
      setSelected((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      })
      router.refresh()
    })
  }

  return {
    selected,
    setSelected,
    allSelected,
    someSelected,
    pendingDelete,
    setPendingDelete,
    isPending,
    toggleAll,
    toggleOne,
    confirmDelete,
  }
}
