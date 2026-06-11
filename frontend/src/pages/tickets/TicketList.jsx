import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Inbox, Trash2, AlertCircle } from 'lucide-react'
import { getTickets, deleteTicket } from '@/services/ticketService'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { StatusBadge, PriorityBadge, Avatar } from '@/components/Badges'

export default function TicketList() {
    const navigate = useNavigate()
    const [tickets, setTickets] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const { token, user } = useAuthStore()
    const isAgent = user?.roles?.includes('ROLE_AGENT')

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getTickets(token)
                setTickets(res.data)
            } catch {
                setError('Failed to load tickets')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [token])

    const handleDelete = async (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await deleteTicket(token, id)
            setTickets(tickets.filter(t => t.id !== id))
        } catch {
            setError('Failed to delete ticket')
        }
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">Tickets</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAgent ? 'All support tickets' : 'Your support tickets'}
                        {!loading && ` · ${tickets.length}`}
                    </p>
                </div>
                {!isAgent && (
                    <Button size="lg" onClick={() => navigate('/tickets/new')}>
                        <Plus className="size-4" /> New ticket
                    </Button>
                )}
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Inbox className="size-6" />
                    </span>
                    <p className="font-medium">No tickets yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isAgent ? 'New tickets will appear here.' : 'Create your first ticket to get started.'}
                    </p>
                    {!isAgent && (
                        <Button className="mt-4" onClick={() => navigate('/tickets/new')}>
                            <Plus className="size-4" /> New ticket
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(ticket => (
                        <Link
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                        >
                            <Avatar firstName={ticket.user.firstName} lastName={ticket.user.lastName} />
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate font-medium group-hover:text-primary">{ticket.title}</h3>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span>{ticket.user.firstName} {ticket.user.lastName}</span>
                                    <span className="text-border">•</span>
                                    <span>{ticket.createdAt}</span>
                                    <span className="text-border">•</span>
                                    <PriorityBadge priority={ticket.priority} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={ticket.status} />
                                {!isAgent && (
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={(e) => handleDelete(e, ticket.id)}
                                        aria-label="Delete ticket"
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
