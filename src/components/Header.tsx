import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { CartSidebar } from "./CartSidebar";
import { Button } from "./ui/button";
import { User, LogOut, Wallet, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
    const { items, total } = useCart();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("covarium_token");
            if (!token) return;

            try {
                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    localStorage.setItem("covarium_user", JSON.stringify(data));
                }
            } catch (e) {
                console.error("Failed to fetch user", e);
            }
        };

        fetchUser();
        // Refresh user data every 30 seconds to keep wallet balance updated
        const interval = setInterval(fetchUser, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("covarium_token");
        localStorage.removeItem("covarium_user");
        setUser(null);
        navigate("/");
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-16">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                {/* Left Side: Logo & User Profile */}
                <div className="flex items-center gap-4 md:gap-8">
                    <Link to="/" className="text-xl md:text-2xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">
                        COVARIUM
                    </Link>

                    {user && (
                        <div className="hidden sm:flex items-center gap-3 p-1.5 pl-2 pr-4 bg-muted/30 border border-border/50 rounded-full hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => navigate("/perfil")}>
                            <Avatar className="h-8 w-8 border-2 border-neon-purple/50">
                                <AvatarImage src={`https://mc-heads.net/avatar/${user.username}`} />
                                <AvatarFallback>{user.username?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-display font-bold tracking-wider leading-none">{user.username}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {user.active_tag ? (
                                        <Badge className="h-4 text-[10px] px-1 bg-neon-purple text-primary-foreground font-display">{user.active_tag}</Badge>
                                    ) : user.role === 'admin' ? (
                                        <Badge variant="outline" className="h-4 text-[10px] px-1 border-neon-cyan/50 text-neon-cyan font-display">ADMIN</Badge>
                                    ) : (
                                        <Badge variant="outline" className="h-4 text-[10px] px-1 border-muted-foreground/50 text-muted-foreground font-display">USER</Badge>
                                    )}
                                    <span className="text-[10px] text-muted-foreground font-body">R$ {Number(user.wallet_balance || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Navigation & Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden md:flex items-center gap-6 mr-4">
                        <Link to="/" className="text-sm font-display font-bold text-muted-foreground hover:text-foreground transition-colors">INÍCIO</Link>
                        <Link to="/equipe" className="text-sm font-display font-bold text-muted-foreground hover:text-foreground transition-colors">EQUIPE</Link>
                    </div>

                    {/* Cart Sidebar */}
                    <CartSidebar />

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <User className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 backdrop-blur-xl">
                            {user ? (
                                <>
                                    <DropdownMenuLabel className="font-display tracking-wider">MINHA CONTA</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer gap-2">
                                        <User className="w-4 h-4" /> Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer gap-2">
                                        <Wallet className="w-4 h-4" /> Carteira (R$ {Number(user.wallet_balance || 0).toFixed(2)})
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer gap-2 text-neon-cyan">
                                            <LayoutDashboard className="w-4 h-4" /> Painel Admin
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-border/50" />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-red-500 hover:text-red-400">
                                        <LogOut className="w-4 h-4" /> Sair
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <>
                                    <DropdownMenuItem onClick={() => navigate("/login")} className="cursor-pointer font-bold">Entrar</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate("/register")} className="cursor-pointer">Criar Conta</DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;
