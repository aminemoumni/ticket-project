import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { createTicket } from '@/services/ticketService'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export default function CreateTicket() {
    const { token } = useAuthStore()
    const navigate = useNavigate()
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium' })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await createTicket(token, form)
            navigate('/dashboard')
        } catch {
            setError('Failed to create ticket')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="size-4" /> Back to tickets
            </Button>

            <Card className="shadow-sm">
                <CardHeader className="border-b [.border-b]:pb-4">
                    <CardTitle className="text-lg">Open a new ticket</CardTitle>
                    <CardDescription>Describe your issue and we'll get back to you.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    {error && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="size-4 shrink-0" /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" className="h-10" value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Short summary of the issue" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea id="description"
                                className="min-h-32 w-full rounded-lg border border-input bg-transparent p-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Provide as much detail as possible…" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={form.priority} onValueChange={val => setForm({ ...form, priority: val })}>
                                <SelectTrigger className="h-10 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating…' : 'Create ticket'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
