import { useEffect, useState } from 'react'
import { Users, Shield, AlertCircle } from 'lucide-react'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/Badges'
import { cn } from '@/lib/utils'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

const ROLE = {
    ROLE_ADMIN: { label: 'Admin', cls: 'bg-primary/10 text-primary ring-primary/20' },
    ROLE_AGENT: { label: 'Agent', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20' },
    ROLE_USER: { label: 'User', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 ring-zinc-500/20' },
}

function RoleBadge({ role }) {
    const r = ROLE[role] ?? { label: role, cls: 'bg-muted text-muted-foreground ring-border' }
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', r.cls)}>
            {r.label}
        </span>
    )
}

export default function AdminDashboard() {
    const { token } = useAuthStore()
    const [users, setUsers] = useState([])
    const [error, setError] = useState(null)

    const updateRole = async (id, role) => {
        try {
            await api.patch(`/admin/users/${id}/role`, { role }, auth(token))
            setUsers(prev => prev.map(u => (u.id === id ? { ...u, roles: [role] } : u)))
        } catch {
            setError('Failed to update role')
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/admin/users', auth(token))
                setUsers(res.data)
            } catch {
                setError('Failed to load users')
            }
        }
        load()
    }, [token])

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Shield className="size-5" />
                </span>
                <div>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">Admin dashboard</h1>
                    <p className="text-sm text-muted-foreground">Manage users and roles · {users.length}</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" /> {error}
                </div>
            )}

            <Card className="overflow-hidden p-0 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                <th className="px-5 py-3 font-medium">User</th>
                                <th className="px-5 py-3 font-medium">Email</th>
                                <th className="px-5 py-3 font-medium">Role</th>
                                <th className="px-5 py-3 text-right font-medium">Change role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar firstName={u.firstName} lastName={u.lastName} className="size-8 text-[0.65rem]" />
                                            <span className="font-medium">{u.firstName} {u.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                                    <td className="px-5 py-3"><RoleBadge role={u.roles[0]} /></td>
                                    <td className="px-5 py-3">
                                        <div className="flex justify-end">
                                            <Select onValueChange={(role) => updateRole(u.id, role)}>
                                                <SelectTrigger className="w-40">
                                                    <SelectValue placeholder="Change role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ROLE_USER">User</SelectItem>
                                                    <SelectItem value="ROLE_AGENT">Agent</SelectItem>
                                                    <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                                        <Users className="mx-auto mb-2 size-6 opacity-60" />
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
