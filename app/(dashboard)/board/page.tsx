import type { Metadata } from "next";
import { getBoardApplications } from "@/features/board/actions/get-board-applications";
import { KanbanBoard } from "@/features/board/components/kanban-board";

export const metadata: Metadata = { title: "Board — JobTrackr" };

export default async function BoardPage() {
  const board = await getBoardApplications();
  return <KanbanBoard initialData={board} />;
}
