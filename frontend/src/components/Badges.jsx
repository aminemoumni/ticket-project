import { cn } from '@/lib/utils'

const STATUS = {
    open: { label: 'Open', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' },
    in_progress: { label: 'In progress', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20' },
    resolved: { label: 'Resolved', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20' },
    closed: { label: 'Closed', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-zinc-500/20' },
}

const PRIORITY = {
    low: { label: 'Low', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
    medium: { label: 'Medium', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    high: { label: 'High', dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
}

export function StatusBadge({ status }) {
    const s = STATUS[status] ?? { label: status, cls: 'bg-muted text-muted-foreground ring-border' }
    return (
        <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            s.cls
        )}>
            {s.label}
        </span>
    )
}

export function PriorityBadge({ priority }) {
    const p = PRIORITY[priority] ?? { label: priority, dot: 'bg-muted-foreground', text: 'text-muted-foreground' }
    return (
        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', p.text)}>
            <span className={cn('size-2 rounded-full', p.dot)} />
            {p.label}
        </span>
    )
}

export function Avatar({ firstName = '', lastName = '', className }) {
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?'
    return (
        <span className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white brand-mark',
            className
        )}>
            {initials}
        </span>
    )
}
