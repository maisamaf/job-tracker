import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function EmptyAnalytics() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-5">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-2">No data yet</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Add some applications and move them through your pipeline — analytics
        will appear here as your job search progresses.
      </p>
      <Button asChild>
        <Link href="/applications/new">Add your first application</Link>
      </Button>
    </div>
  );
}
