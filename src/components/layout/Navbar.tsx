import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, LayoutDashboard, FileText, FolderOpen } from 'lucide-react';
import { useAuth } from "../auth/authContext";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';

export const Navbar = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Due Diligence', path: '/due-diligence' },
        { label: 'MCP Report', path: '/mcp-report' },
        { label: 'Blog Generator', path: '/blog-generator' },
        { label: 'File Manager', path: '/file-manager' },
        { label: 'Demo', path: '/demo' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Blog', path: '/blog' },
    ];

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await auth.signOut();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Failed to log out');
        }
    };

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!user || !user.displayName) return 'U';
        return user.displayName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-primary">Aidiligence Pro</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth and Theme Toggle */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ModeToggle />
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            {user.displayName && (
                                                <p className="font-medium">{user.displayName}</p>
                                            )}
                                            {user.email && (
                                                <p className="w-[200px] truncate text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="cursor-pointer flex w-full items-center">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/due-diligence" className="cursor-pointer flex w-full items-center">
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>Due Diligence</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/mcp-report" className="cursor-pointer flex w-full items-center">
                                            <FileText className="mr-2 h-4 w-4" />
                                            <span>MCP Report</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/file-manager" className="cursor-pointer flex w-full items-center">
                                            <FolderOpen className="mr-2 h-4 w-4" />
                                            <span>File Manager</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="cursor-pointer flex w-full items-center">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/settings" className="cursor-pointer flex w-full items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/login">Sign In</Link>
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                    <Link to="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <ModeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                            className="text-foreground"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4">
                        <div className="flex flex-col space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {user ? (
                                <>
                                    <Link 
                                        to="/dashboard" 
                                        className="flex items-center text-muted-foreground hover:text-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <Link 
                                        to="/profile" 
                                        className="flex items-center text-muted-foreground hover:text-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </Link>
                                    <Link 
                                        to="/settings" 
                                        className="flex items-center text-muted-foreground hover:text-foreground"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center text-destructive hover:text-destructive/90"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 pt-2">
                                    <Button variant="outline" asChild>
                                        <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                                    </Button>
                                    <Button variant="default" asChild>
                                        <Link to="/register" onClick={() => setIsOpen(false)}>Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
