import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, MessageSquare, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForumPost {
    id: number;
    type: "geral" | "denuncia";
    author: string;
    title: string;
    content: string;
    created_at: string;
    image_url?: string;
}

const Forum = () => {
    const { toast } = useToast();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"geral" | "denuncia">("geral");

    const isLoggedIn = !!localStorage.getItem("covarium_token");

    const [newPost, setNewPost] = useState({ title: "", content: "", image_url: "" });

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/forum");
            if (!res.ok) throw new Error("Erro ao carregar os posts");
            const textData = await res.text();
            const data = textData ? JSON.parse(textData) : [];
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                throw new Error(data.error || "Erro ao carregar os fóruns");
            }
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoggedIn) {
            toast({ title: "Você precisa estar logado para postar.", variant: "destructive" });
            return;
        }

        if (!newPost.title || !newPost.content) {
            toast({ title: "Preencha o título e a mensagem!", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("covarium_token")}`
                },
                body: JSON.stringify({ ...newPost, type: activeTab })
            });
            if (!res.ok) throw new Error("Erro ao criar post");

            const textData = await res.text();
            const created = textData ? JSON.parse(textData) : null;
            if (created) setPosts([created, ...posts]);
            setNewPost({ title: "", content: "", image_url: "" });
            toast({ title: "Post enviado com sucesso! ✅" });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(p => p.type === activeTab);

    return (
        <div className="w-full pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-foreground">
                        FÓRUM DA COMUNIDADE
                    </h1>
                    <p className="text-muted-foreground font-body max-w-2xl mx-auto">
                        Discuta com outros jogadores, compartilhe memes, tire dúvidas ou faça denúncias para a nossa equipe avaliar.
                    </p>
                </div>

                <Tabs defaultValue="geral" onValueChange={(val) => setActiveTab(val as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                        <TabsTrigger value="geral" className="font-display tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> GERAL
                        </TabsTrigger>
                        <TabsTrigger value="denuncia" className="font-display tracking-widest flex items-center gap-2">
                            <Shield className="w-4 h-4" /> DENÚNCIAS
                        </TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Column */}
                        <div className="lg:col-span-1 border border-border/50 rounded-xl p-6 bg-card/50 backdrop-blur-sm self-start sticky top-24">
                            <h3 className="font-display text-xl tracking-wider mb-4 border-b border-border/50 pb-2">
                                CRIAR NOVO POST
                            </h3>

                            {!isLoggedIn ? (
                                <div className="text-center py-6 space-y-4">
                                    <p className="text-muted-foreground font-body">Faça login com sua conta do servidor para criar tópicos.</p>
                                    <Link to="/login">
                                        <Button className="bg-neon-purple text-white w-full">Fazer Login</Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground font-body">Título</label>
                                        <Input
                                            placeholder="Título do seu post..."
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground font-body">Mensagem</label>
                                        <Textarea
                                            placeholder="Escreva sua mensagem aqui..."
                                            rows={4}
                                            value={newPost.content}
                                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-muted-foreground font-body">Imagem / Print (Opcional URL)</label>
                                        <Input
                                            placeholder="https://imgur.com/..."
                                            value={newPost.image_url}
                                            onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Cole um link direto do Imgur, Discord, etc.</p>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full font-display tracking-widest bg-neon-purple hover:bg-neon-purple/80 text-white"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> ENVIAR</>}
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* List Column */}
                        <div className="lg:col-span-2 space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="text-center p-12 border border-border/50 border-dashed rounded-xl bg-muted/20">
                                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground font-body">Nenhum post encontrado nesta categoria.</p>
                                </div>
                            ) : (
                                filteredPosts.map(post => (
                                    <Card key={post.id} className="border-border/50 bg-card hover:border-neon-purple/50 transition-colors">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="font-display text-xl tracking-wide">{post.title}</CardTitle>
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-body">
                                                    {new Date(post.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <CardDescription className="font-body text-sm font-bold text-neon-cyan flex items-center gap-2">
                                                <img src={`https://minotar.net/helm/${post.author}/24.png`} alt={post.author} className="w-6 h-6 rounded" />
                                                {post.author}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground font-body whitespace-pre-wrap leading-relaxed">
                                                {post.content}
                                            </p>
                                            {post.image_url && (
                                                <div className="mt-4 border border-border/50 rounded-lg overflow-hidden flex justify-center bg-black/50">
                                                    <img src={post.image_url} alt="Anexo do Post" className="max-h-96 object-contain" />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default Forum;
