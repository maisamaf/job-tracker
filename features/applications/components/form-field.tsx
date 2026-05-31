import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
    id: string
    label: string
    required?: boolean
    error?: string[]
    hint?: string
    className?: string
    children: React.ReactNode
}

export function FormField({
    id,
    label,
    required,
    error,
    hint,
    className,
    children,
}: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <Label
                htmlFor={id}
                className={cn(
                    "text-sm font-medium",
                    error?.length && "text-destructive"
                )}
            >
                {label}
                {required && (
                    <span className="text-destructive ml-0.5" aria-hidden>*</span>
                )}
            </Label>

            {children}

            {hint && !error?.length && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}

            {error?.map((msg) => (
                <p key={msg} className="text-xs text-destructive">
                    {msg}
                </p>
            ))}
        </div>
    )
}