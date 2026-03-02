import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Loader2, ShieldAlert } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
        token2fa: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const textData = await res.text();
            const data = textData ? JSON.parse(textData) : {};

            if (data.error === "2FA_REQUIRED") {
                setShow2FA(true);
                setLoading(false);
                return;
            }

            if (!res.ok) throw new Error(data.error || "Erro ao conectar");

            localStorage.setItem("covarium_token", data.token);
            localStorage.setItem("covarium_user", JSON.stringify(data.user));

            toast({ title: "Bem-vindo de volta!" });
            navigate("/perfil");
        } catch (error: any) {
            const message = error.message.includes("<!DOCTYPE") ? "Erro de conexão com o servidor" : error.message;
            toast({
                title: "Erro",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24">
            <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="text-center relative z-10">
                    <h2 className="text-3xl font-display font-bold text-foreground tracking-wider mb-2">
                        CONECTAR
                    </h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Acesse sua conta do Covarium
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="E-mail"
                                className="pl-10 bg-background/50 border-border/50 focus:border-neon-purple/50 transition-colors"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Senha"
                                className="pl-10 bg-background/50 border-border/50 focus:border-neon-purple/50 transition-colors"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity font-display tracking-widest text-primary-foreground mt-6"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ENTRAR"}
                    </Button>

                    <div className="text-center mt-4 space-y-2">
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors block w-full"
                        >
                            Ainda não tem conta? Registre-se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
