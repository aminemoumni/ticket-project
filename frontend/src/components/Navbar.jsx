import { useNavigate, NavLink } from 'react-router-dom'
import { LifeBuoy, LogOut, Moon, Sun, Shield } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/Badges'
import { cn } from '@/lib/utils'

export default function Navbar() {
    const { user, logout } = useAuthStore()
    const { theme, toggle } = useThemeStore()
    const navigate = useNavigate()

    const isAdmin = user?.roles?.includes('ROLE_ADMIN')
    const role = user?.roles?.[0]?.replace('ROLE_', '').toLowerCase()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const linkCls = ({ isActive }) => cn(
        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )

    return (
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex items-center gap-6">
                    <NavLink to="/dashboard" className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl text-white shadow-sm brand-mark">
                            <LifeBuoy className="size-5" />
                        </span>
                        <span className="font-heading text-base font-semibold tracking-tight">Support</span>
                    </NavLink>
                    <div className="hidden items-center gap-1 sm:flex">
                        <NavLink to="/dashboard" className={linkCls}>Tickets</NavLink>
                        {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        aria-label="Toggle theme"
                        title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                    >
                        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </Button>

                    <div className="hidden items-center gap-2.5 rounded-full border border-border/70 bg-card/60 py-1 pl-1 pr-3 sm:flex">
                        <Avatar firstName={user?.firstName} lastName={user?.lastName} className="size-7" />
                        <div className="leading-tight">
                            <p className="max-w-[12rem] truncate text-xs font-medium">{user?.email}</p>
                            <p className="flex items-center gap-1 text-[0.7rem] capitalize text-muted-foreground">
                                {isAdmin && <Shield className="size-3" />}{role}
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="size-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
