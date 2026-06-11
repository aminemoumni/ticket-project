import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, MessageSquare, AlertCircle, CalendarDays } from 'lucide-react'
import { getTicket, updateTicket, getComments, createComment } from '@/services/ticketService'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge, PriorityBadge, Avatar } from '@/components/Badges'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function TicketDetail() {
    const { id } = useParams()
    const { token, user } = useAuthStore()
    const navigate = useNavigate()
    const [ticket, setTicket] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [error, setError] = useState(null)

    const isAgentOrAdmin = user?.roles?.includes('ROLE_AGENT') || user?.roles?.includes('ROLE_ADMIN')

    useEffect(() => {
        const load = async () => {
            try {
                const [ticketRes, commentsRes] = await Promise.all([
                    getTicket(token, id),
                    getComments(token, id),
                ])
                setTicket(ticketRes.data)
                setComments(commentsRes.data)
            } catch {
                setError('Failed to load ticket')
            }
        }
        load()
    }, [token, id])

    const handleStatusChange = async (status) => {
        try {
            const res = await updateTicket(token, id, { status })
            setTicket(res.data)
        } catch {
            setError('Failed to update status')
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        try {
            const res = await createComment(token, id, newComment)
            setComments([...comments, res.data])
            setNewComment('')
        } catch {
            setError('Failed to add comment')
        }
    }

    if (!ticket) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="size-4" /> Back to tickets
            </Button>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
            )}

            <Card className="shadow-sm">
                <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="font-heading text-xl font-semibold tracking-tight">{ticket.title}</h1>
                        <StatusBadge status={ticket.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Avatar firstName={ticket.user.firstName} lastName={ticket.user.lastName} className="size-6 text-[0.6rem]" />
                            {ticket.user.firstName} {ticket.user.lastName}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-3.5" /> {ticket.createdAt}
                        </span>
                    </div>

                    <p className="whitespace-pre-line border-t border-border pt-4 text-sm leading-relaxed text-foreground/90">
                        {ticket.description}
                    </p>

                    {isAgentOrAdmin && (
                        <div className="flex items-center gap-3 border-t border-border pt-4">
                            <span className="text-sm font-medium">Status</span>
                            <Select value={ticket.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8">
                <h2 className="mb-4 flex items-center gap-2 font-heading text-base font-semibold">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    Comments
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{comments.length}</span>
                </h2>

                <div className="space-y-3">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                            <Avatar firstName={comment.author.firstName} lastName={comment.author.lastName} className="size-8 text-[0.65rem]" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium">{comment.author.firstName} {comment.author.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{comment.createdAt}</p>
                                </div>
                                <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{comment.content}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                            No comments yet. Start the conversation below.
                        </p>
                    )}
                </div>

                <form onSubmit={handleAddComment} className="mt-4 flex items-end gap-2">
                    <textarea
                        className="min-h-12 flex-1 rounded-lg border border-input bg-transparent p-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                        placeholder="Add a comment…"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <Button type="submit" size="lg" className="h-11" disabled={!newComment.trim()}>
                        <Send className="size-4" /> Send
                    </Button>
                </form>
            </div>
        </div>
    )
}
