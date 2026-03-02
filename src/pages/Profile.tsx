import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, QrCode, Shield, KeyRound, LogOut, Wallet, Gift, Camera } from "lucide-react";

export default function Profile() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 2FA state
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [token2fa, setToken2fa] = useState("");
    const [settingUp2FA, setSettingUp2FA] = useState(false);

    // Recovery codes state
    const [recoveryCodes, setRecoveryCodes] = useState<any[]>([]);
    const [permanentPassword, setPermanentPassword] = useState("");
    const [showingCodes, setShowingCodes] = useState(false);

    // Change password state
    const [passwords, setPasswords] = useState({ permanent: "", new: "" });

    // Wallet & Gift state
    const [giftCode, setGiftCode] = useState("");
    const [myGifts, setMyGifts] = useState<any[]>([]);
    const [redeeming, setRedeeming] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchMyGifts();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("profile_picture", file);

        try {
            const res = await fetch("/api/user/profile-picture", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("covarium_token")}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Erro ao enviar foto");
            const data = await res.json();

            const updatedUser = { ...user, profile_picture_url: data.url };
            setUser(updatedUser);
            localStorage.setItem("covarium_user", JSON.stringify(updatedUser));
            toast({ title: "Foto de perfil atualizada!" });
        } catch (error) {
            toast({ title: "Erro ao fazer upload", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem("covarium_token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const textData = await res.text();
                setUser(textData ? JSON.parse(textData) : {});
            } else {
                localStorage.removeItem("covarium_token");
                navigate("/login");
            }
        } catch {
            toast({ title: "Erro de conexão", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchMyGifts = async () => {
        const token = localStorage.getItem("covarium_token");
        if (!token) return;

        try {
            const res = await fetch("/api/user/gifts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyGifts(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRedeem = async () => {
        if (!giftCode) return;
        setRedeeming(true);
        try {
            const res = await fetch("/api/user/redeem-gift", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("covarium_token")}`
                },
                body: JSON.stringify({ code: giftCode })
            });

            const data = await res.json();
            if (res.ok) {
                toast({ title: `Sucesso! R$ ${data.amount.toFixed(2)} adicionados à sua carteira.` });
                setGiftCode("");
                fetchProfile();
            } else {
                toast({ title: "Erro", description: data.error, variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Erro de conexão", variant: "destructive" });
        } finally {
            setRedeeming(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("covarium_token");
        localStorage.removeItem("covarium_user");
        navigate("/login");
    };

    const setup2FA = async () => {
        try {
            const res = await fetch("/api/auth/2fa/generate", {
                method: "POST",
                headers: { Authorization: `Bearer ${localStorage.getItem("covarium_token")}` }
            });
            const textData = await res.text();
            const data = textData ? JSON.parse(textData) : {};
            if (!res.ok || data.error) throw new Error(data.error || "Erro na resposta do servidor");

            setQrCode(data.qrCodeUrl);
            setSecret(data.secret);
            setSettingUp2FA(true);
        } catch (err: any) {
            toast({ title: "Erro ao gerar 2FA", description: err.message, variant: "destructive" });
        }
    };

    const verify2FA = async () => {
        try {
            const res = await fetch("/api/auth/2fa/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("covarium_token")}`
                },
                body: JSON.stringify({ token: token2fa })
            });
            if (res.ok) {
                toast({ title: "Autenticação em Duas Etapas ATIVADA!" });
                setSettingUp2FA(false);
                fetchProfile();
            } else {
                toast({ title: "Código incorreto", variant: "destructive" });
            }
        } catch { }
    };

    const loadRecoveryCodes = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/auth/recovery-codes?permanent_password=${permanentPassword}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("covarium_token")}` }
            });
            if (!res.ok) throw new Error("Senha incorreta");
            const textData = await res.text();
            setRecoveryCodes(textData ? JSON.parse(textData) : []);
            setShowingCodes(true);
            setPermanentPassword("");
        } catch (err: any) {
            toast({ title: err.message, variant: "destructive" });
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("covarium_token")}`
                },
                body: JSON.stringify({
                    permanent_password: passwords.permanent,
                    new_password: passwords.new
                })
            });
            if (!res.ok) throw new Error("Senha permanente incorreta");
            toast({ title: "Senha alterada com sucesso!" });
            setPasswords({ permanent: "", new: "" });
        } catch (err: any) {
            toast({ title: err.message, variant: "destructive" });
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center pt-24"><Loader2 className="w-8 h-8 animate-spin text-neon-purple" /></div>;

    return (
        <div className="min-h-screen bg-background pt-24 px-4 pb-20">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar className="w-20 h-20 border-2 border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                <AvatarImage src={user?.profile_picture_url || `https://mc-heads.net/avatar/${user?.username}`} className="object-cover" />
                                <AvatarFallback className="bg-background text-lg font-display">
                                    {user?.username?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 p-1 bg-neon-purple rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                                {uploading ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Camera className="w-3 h-3 text-white" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                            {user?.active_tag && (
                                <Badge className="absolute -bottom-2 -left-2 bg-neon-purple text-primary-foreground font-display text-[10px] shadow-lg">
                                    {user.active_tag}
                                </Badge>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">Meu Perfil</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-muted-foreground font-body">{user?.username} ({user?.email})</p>
                                {user?.role === 'admin' && <Badge variant="outline" className="text-neon-cyan border-neon-cyan/50 text-[10px]">ADMIN</Badge>}
                            </div>
                        </div>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* WALLET CARD */}
                <div className="md:col-span-2 bg-card p-6 rounded-2xl border border-border/50 space-y-6 bg-gradient-to-br from-card to-neon-purple/5">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Wallet className="text-neon-cyan" /> Minha Carteira
                    </h2>
                    <div className="p-6 bg-background/50 border border-border/50 rounded-xl text-center space-y-1">
                        <p className="text-xs text-muted-foreground font-body uppercase tracking-tighter">Saldo Disponível</p>
                        <p className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">
                            R$ {Number(user?.wallet_balance || 0).toFixed(2).replace('.', ',')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-display font-bold tracking-wider">RESGATAR CÓDIGO</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="XXXX-XXXX-XXXX"
                                value={giftCode}
                                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                                className="bg-background/50 border-border/50 focus:border-neon-purple/50 tracking-widest font-mono"
                            />
                            <Button onClick={handleRedeem} disabled={redeeming} className="bg-gradient-to-r from-neon-purple to-neon-blue">
                                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "RESGATAR"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* MY GIFTS CARD */}
                <div className="md:col-span-2 bg-card p-6 rounded-2xl border border-border/50 space-y-6">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <Gift className="text-neon-cyan" /> Meus Códigos / Presentes
                    </h2>

                    {myGifts.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground font-body">Você ainda não gerou nenhum código de presente.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="pb-4 font-display text-xs tracking-wider text-muted-foreground">CÓDIGO</th>
                                        <th className="pb-4 font-display text-xs tracking-wider text-muted-foreground">VALOR</th>
                                        <th className="pb-4 font-display text-xs tracking-wider text-muted-foreground">STATUS</th>
                                        <th className="pb-4 font-display text-xs tracking-wider text-muted-foreground">DATA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {myGifts.map((gift: any) => (
                                        <tr key={gift.id} className="group">
                                            <td className="py-4 font-mono font-bold text-neon-cyan select-all cursor-copy" onClick={() => {
                                                navigator.clipboard.writeText(gift.code);
                                                toast({ title: "Código copiado!" });
                                            }}>
                                                {gift.code}
                                            </td>
                                            <td className="py-4 font-body text-foreground">R$ {Number(gift.amount).toFixed(2)}</td>
                                            <td className="py-4">
                                                <Badge variant="outline" className={gift.status === 'redeemed' ? 'text-muted-foreground border-border/50' : 'text-green-500 border-green-500/50'}>
                                                    {gift.status === 'redeemed' ? 'Resgatado' : 'Disponível'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-xs font-body text-muted-foreground">
                                                {new Date(gift.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* PASSWORD CARD */}
                <div className="md:col-span-2 bg-card p-6 rounded-2xl border border-border/50 space-y-6">
                    <h2 className="text-xl font-display font-bold flex items-center gap-2">
                        <KeyRound className="text-neon-cyan" /> Trocar Senha Comum
                    </h2>
                    <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-muted-foreground">Senha Permanente (Autorização)</label>
                            <Input
                                type="password"
                                value={passwords.permanent}
                                onChange={e => setPasswords({ ...passwords, permanent: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Nova Senha Comum</label>
                            <Input
                                type="password"
                                value={passwords.new}
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                required
                            />
                        </div>
                        <Button type="submit" className="md:col-span-2">Confirmar Troca de Senha</Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
