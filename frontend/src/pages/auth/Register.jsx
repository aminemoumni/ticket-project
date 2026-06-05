import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LifeBuoy, User, Mail, Lock, ArrowRight, Moon, Sun, AlertCircle } from 'lucide-react'
import { register } from '../../services/authService'
import useThemeStore from '../../store/themeStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function Register() {
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { theme, toggle } = useThemeStore()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await register(form)
            navigate('/login')
        } catch (err) {
            const data = err.response?.data
            setError(data?.error || (data?.errors && Object.values(data.errors)[0]) || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label="Toggle theme"
                className="absolute right-4 top-4"
            >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>

            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="mb-4 flex size-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/20 brand-mark">
                        <LifeBuoy className="size-7" />
                    </span>
                    <h1 className="font-heading text-2xl font-semibold tracking-tight">Create your account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Get started with the support workspace</p>
                </div>

                <Card className="shadow-xl shadow-foreground/5">
                    <CardHeader>
                        <CardTitle>Sign up</CardTitle>
                        <CardDescription>It only takes a moment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                <AlertCircle className="size-4 shrink-0" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="firstName" name="firstName" placeholder="John"
                                            className="h-10 pl-9" value={form.firstName} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input id="lastName" name="lastName" placeholder="Doe"
                                        className="h-10" value={form.lastName} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="email" type="email" name="email" placeholder="you@example.com"
                                        className="h-10 pl-9" value={form.email} onChange={handleChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="password" type="password" name="password" placeholder="At least 8 characters"
                                        className="h-10 pl-9" value={form.password} onChange={handleChange} required />
                                </div>
                            </div>
                            <Button type="submit" size="lg" className="h-10 w-full" disabled={loading}>
                                {loading ? 'Creating…' : <>Create account <ArrowRight className="size-4" /></>}
                            </Button>
                        </form>
                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
