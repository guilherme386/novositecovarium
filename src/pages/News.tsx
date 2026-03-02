import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Newspaper, Calendar, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
    id: number;
    title: string;
    description: string;
    is_event: boolean;
    event_time?: string;
    expires_at?: string;
    created_at: string;
}

const News = () => {
    const { toast } = useToast();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const fetchNews = async () => {
        try {
            const res = await fetch("/api/news");
            if (!res.ok) throw new Error("Erro ao carregar as notícias");
            const textData = await res.text();
            const data = textData ? JSON.parse(textData) : [];

            if (!Array.isArray(data)) {
                throw new Error(data.error || "Erro ao carregar as notícias");
            }

            // Filter out expired news
            const validNews = data.filter((item: NewsItem) => {
                if (!item.expires_at) return true;
                return new Date(item.expires_at) > new Date();
            });

            setNews(validNews);
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div className="w-full pb-20">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <Newspaper className="w-16 h-16 mx-auto text-neon-blue animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-display font-bold tracking-wider text-foreground">
                        MURAL DE NOTÍCIAS
                    </h1>
                    <p className="text-muted-foreground font-body max-w-2xl mx-auto">
                        Fique por dentro das últimas novidades, atualizações e eventos especiais do servidor.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center p-12 border border-border/50 border-dashed rounded-xl bg-muted/20">
                        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-body">Não há notícias recentes no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((item) => (
                            <Card
                                key={item.id}
                                className="border-border/50 bg-card hover:-translate-y-2 hover:border-neon-blue/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                                onClick={() => setSelectedNews(item)}
                            >
                                <CardHeader className="pb-3 space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        {item.is_event ? (
                                            <Badge className="bg-neon-purple text-white font-display tracking-widest text-[10px] px-2 py-0.5">
                                                <Calendar className="w-3 h-3 mr-1 inline-block" /> EVENTO
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-neon-blue text-white font-display tracking-widest text-[10px] px-2 py-0.5">
                                                NOVIDADE
                                            </Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground font-body whitespace-nowrap">
                                            {new Date(item.created_at).toLocaleDateString("pt-BR")}
                                        </span>
                                    </div>
                                    <CardTitle className="font-display text-xl tracking-wider text-foreground line-clamp-2">
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground font-body text-sm line-clamp-3">
                                        {item.description}
                                    </p>
                                </CardContent>
                                {item.event_time && (
                                    <CardFooter className="pt-0 pb-4 border-t border-border/30 mt-4">
                                        <p className="text-xs font-bold text-neon-cyan flex items-center gap-1.5 mt-3">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(item.event_time).toLocaleString("pt-BR", {
                                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Detalhes da Notícia */}
            <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
                <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
                    <DialogHeader className="mb-4">
                        <div className="flex gap-2 mb-3">
                            {selectedNews?.is_event ? (
                                <Badge className="bg-neon-purple text-white font-display tracking-widest text-[10px]">EVENTO</Badge>
                            ) : (
                                <Badge className="bg-neon-blue text-white font-display tracking-widest text-[10px]">NOVIDADE</Badge>
                            )}
                        </div>
                        <DialogTitle className="text-2xl font-display tracking-wider mb-2">
                            {selectedNews?.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-body flex gap-4">
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Postado em {selectedNews?.created_at && new Date(selectedNews.created_at).toLocaleDateString("pt-BR")}
                            </span>
                            {selectedNews?.event_time && (
                                <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Acontece em {new Date(selectedNews.event_time).toLocaleString("pt-BR", {
                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 prose prose-invert max-w-none">
                        <p className="text-foreground font-body whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                            {selectedNews?.description}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default News;
