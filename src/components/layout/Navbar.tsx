
import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { Button } from "@/components/ui/button";
import { Home, User, LogIn } from "lucide-react";

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex items-center justify-between h-16 px-4">
                <Link to="/" className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <span className="font-semibold">AI Due Diligence</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Button variant="ghost" asChild>
                            <Link to="/profile" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild>
                            <Link to="/login" className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
