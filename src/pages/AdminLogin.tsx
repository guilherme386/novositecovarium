import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ title: "Credenciais inválidas", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check if user has admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Erro ao verificar usuário", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      toast({ title: "Acesso negado — não é admin", variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border/50">
        <CardHeader className="text-center">
          <Lock className="w-10 h-10 mx-auto text-neon-purple mb-2" />
          <CardTitle className="font-display tracking-wider text-foreground">
            ADMIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-body">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-body">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted border-border text-foreground"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-display tracking-wider bg-gradient-to-r from-neon-purple to-neon-blue text-primary-foreground hover:opacity-90"
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
