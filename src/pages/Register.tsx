import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Lock, User, Mail, Loader2 } from "lucide-react";

export default function Register() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        permanent_password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const textData = await res.text();
            const data = textData ? JSON.parse(textData) : {};

            if (!res.ok) throw new Error(data.error || "Erro ao registrar");

            localStorage.setItem("covarium_token", data.token);
            localStorage.setItem("covarium_user", JSON.stringify(data.user));

            toast({
                title: "Conta criada com sucesso!",
                description: "Seja bem-vindo ao Covarium.",
            });

            navigate("/perfil");
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message,
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
                        CRIAR CONTA
                    </h2>
                    <p className="text-muted-foreground font-body text-sm">
                        Junte-se à comunidade Covarium
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Usuário (Ex: Notch)"
                                className="pl-10 bg-background/50 border-border/50 focus:border-neon-purple/50 transition-colors"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </div>

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
                                placeholder="Senha (Alterável)"
                                className="pl-10 bg-background/50 border-border/50 focus:border-neon-purple/50 transition-colors"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="PIN de Segurança (PERMANENTE)"
                                className="pl-10 bg-background/50 border-border/50 focus:border-neon-purple/50 transition-colors"
                                value={form.permanent_password}
                                onChange={(e) => setForm({ ...form, permanent_password: e.target.value })}
                                required
                            />
                            <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                                * Esta senha não pode ser alterada. Será usada para recuperar a conta e trocar a senha comum.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity font-display tracking-widest text-primary-foreground"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "REGISTRAR"}
                    </Button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors"
                        >
                            Já tem uma conta? Conecte-se
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
