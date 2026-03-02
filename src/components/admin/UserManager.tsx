import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Tags, UserCog, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface User {
    id: number;
    username: string;
    email: string;
    wallet_balance: number;
    store_tags: string[];
    active_tag: string | null;
    created_at: string;
}

const UserManager = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tagInput, setTagInput] = useState("");
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem("covarium_token");
        try {
            const res = await fetch("/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                const err = await res.json();
                toast({ title: "Erro ao carregar usuários", description: err.error || "Erro desconhecido", variant: "destructive" });
            }
        } catch (e: any) {
            toast({ title: "Erro de conexão", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTags = async () => {
        if (!selectedUser) return;
        setSaving(true);
        const token = localStorage.getItem("covarium_token");
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/tags`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    tags: selectedUser.store_tags,
                    active_tag: selectedUser.active_tag
                })
            });
            if (res.ok) {
                toast({ title: "Tags atualizadas com sucesso!" });
                fetchUsers();
                setSelectedUser(null);
            }
        } catch (e) {
            toast({ title: "Erro ao atualizar tags", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuário por nick ou email..."
                        className="pl-9 bg-muted border-border"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={fetchUsers}>Atualizar Lista</Button>
            </div>

            <Card className="bg-card border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50">
                                <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Usuário</TableHead>
                                <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Carteira</TableHead>
                                <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Tags</TableHead>
                                <TableHead className="text-muted-foreground font-display text-xs tracking-wider">Tag Ativa</TableHead>
                                <TableHead className="text-muted-foreground font-display text-xs tracking-wider text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8">Nenhum usuário encontrado</TableCell></TableRow>
                            ) : filteredUsers.map(user => (
                                <TableRow key={user.id} className="border-border/30">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{user.username}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-neon-cyan font-bold">R$ {Number(user.wallet_balance).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(user.store_tags || []).map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-[10px] py-0">{tag}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.active_tag ? (
                                            <Badge className="bg-neon-purple text-primary-foreground text-[10px]">{user.active_tag}</Badge>
                                        ) : <span className="text-muted-foreground text-xs">—</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="hover:text-neon-cyan"
                                            onClick={() => setSelectedUser({ ...user, store_tags: user.store_tags || [] })}
                                        >
                                            <UserCog className="w-4 h-4 mr-1" /> Gerenciar Tags
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog de Gestão de Tags */}
            <Dialog open={!!selectedUser} onOpenChange={(v) => !v && setSelectedUser(null)}>
                <DialogContent className="bg-card border-border/50">
                    <DialogHeader>
                        <DialogTitle>Gerenciar Tags - {selectedUser?.username}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <Label>Adicionar Nova Tag</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: MOD, VIP, MVP"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && tagInput) {
                                            if (!selectedUser?.store_tags.includes(tagInput)) {
                                                setSelectedUser({
                                                    ...selectedUser!,
                                                    store_tags: [...selectedUser!.store_tags, tagInput]
                                                });
                                            }
                                            setTagInput("");
                                        }
                                    }}
                                />
                                <Button onClick={() => {
                                    if (tagInput && !selectedUser?.store_tags.includes(tagInput)) {
                                        setSelectedUser({
                                            ...selectedUser!,
                                            store_tags: [...selectedUser!.store_tags, tagInput]
                                        });
                                        setTagInput("");
                                    }
                                }}>Add</Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Tags Disponíveis (Clique para remover)</Label>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-muted rounded-md">
                                {selectedUser?.store_tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        className="cursor-pointer hover:bg-destructive"
                                        onClick={() => setSelectedUser({
                                            ...selectedUser!,
                                            store_tags: selectedUser!.store_tags.filter(t => t !== tag),
                                            active_tag: selectedUser!.active_tag === tag ? null : selectedUser!.active_tag
                                        })}
                                    >
                                        {tag} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Tag Ativa (Selecionar uma)</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={selectedUser?.active_tag === null ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedUser({ ...selectedUser!, active_tag: null })}
                                >
                                    Nenhuma
                                </Button>
                                {selectedUser?.store_tags.map(tag => (
                                    <Button
                                        key={tag}
                                        variant={selectedUser.active_tag === tag ? "default" : "outline"}
                                        size="sm"
                                        className={selectedUser.active_tag === tag ? "bg-neon-purple" : ""}
                                        onClick={() => setSelectedUser({ ...selectedUser!, active_tag: tag })}
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancelar</Button>
                        <Button className="bg-neon-purple hover:bg-neon-purple/80" onClick={handleUpdateTags} disabled={saving}>
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManager;
