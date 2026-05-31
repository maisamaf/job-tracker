import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-lg font-semibold mb-2">Application not found</h2>
            <p className="text-sm text-muted-foreground mb-6">
                This application doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button asChild variant="outline">
                <Link href="/applications">Back to applications</Link>
            </Button>
        </div>
    )
}