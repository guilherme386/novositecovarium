import { Link } from "react-router-dom";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, ShoppingCart, MessageSquare, Newspaper, CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import News from "./News";
import Forum from "./Forum";
import Store from "./Store";

const DiscordIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
);

const Index = () => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<"inicio" | "noticias" | "forum" | "loja">("inicio");
    const serverIp = "jogar.covarium.com";

    const handleCopy = () => {
        setCopied(true);
        toast({
            title: "IP Copiado!",
            description: "O IP do servidor foi copiado para sua área de transferência.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Hub Banner Background */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-neon-purple/20 to-background/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]" />

            {/* Main Header / Banner Area */}
            <div className="relative pt-32 pb-16 px-4">
                <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-12">

                    {/* Center Logo */}
                    <div className="relative transform hover:scale-105 transition-transform duration-500">
                        <h1 className="text-7xl md:text-8xl font-display font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan drop-shadow-[0_0_15px_rgba(188,19,254,0.5)]">
                            COVARIUM
                        </h1>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-2xl justify-between">
                        {/* Play Now (Copy IP) Button */}
                        <CopyToClipboard text={serverIp} onCopy={handleCopy}>
                            <div className="flex items-center gap-4 bg-card/60 hover:bg-card border border-border/50 hover:border-neon-purple/50 p-4 rounded-xl cursor-pointer transition-all w-full sm:w-[48%] group">
                                <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center text-neon-purple group-hover:scale-110 transition-transform">
                                    <Gamepad2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-display font-bold tracking-wider text-sm flex items-center justify-between">
                                        CONECTE-SE JÁ!
                                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-body mt-1">Clique para copiar o IP</p>
                                </div>
                            </div>
                        </CopyToClipboard>

                        {/* Discord Button */}
                        <a href="https://dsc.gg/covarium" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 hover:border-[#5865F2]/50 p-4 rounded-xl cursor-pointer transition-all w-full sm:w-[48%] group">
                            <div className="flex-1 text-right">
                                <h3 className="font-display font-bold tracking-wider text-sm text-[#5865F2]">DISCORD</h3>
                                <p className="text-xs text-muted-foreground font-body mt-1">Acesse nosso Discord</p>
                            </div>
                            <div className="w-12 h-12 rounded-lg bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2] group-hover:scale-110 transition-transform">
                                <DiscordIcon />
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* Navigation Bar inside the Hub */}
            <div className="border-y border-border/50 bg-card/30 backdrop-blur-md sticky top-16 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab("inicio")}
                            className={`${activeTab === "inicio" ? "text-neon-cyan border-neon-cyan" : "text-muted-foreground border-transparent hover:text-foreground"} font-display font-bold text-sm tracking-wider flex items-center gap-2 border-b-2 pb-1 transition-colors`}
                        >
                            INÍCIO
                        </button>
                        <button
                            onClick={() => setActiveTab("noticias")}
                            className={`${activeTab === "noticias" ? "text-neon-cyan border-neon-cyan" : "text-muted-foreground border-transparent hover:text-foreground"} font-display font-bold text-sm tracking-wider flex items-center gap-2 border-b-2 pb-1 transition-colors`}
                        >
                            <Newspaper className="w-4 h-4" /> NOTÍCIAS
                        </button>
                        <button
                            onClick={() => setActiveTab("forum")}
                            className={`${activeTab === "forum" ? "text-neon-cyan border-neon-cyan" : "text-muted-foreground border-transparent hover:text-foreground"} font-display font-bold text-sm tracking-wider flex items-center gap-2 border-b-2 pb-1 transition-colors`}
                        >
                            <MessageSquare className="w-4 h-4" /> FÓRUM
                        </button>
                        <button
                            onClick={() => setActiveTab("loja")}
                            className={`${activeTab === "loja" ? "text-neon-cyan border-neon-cyan" : "text-muted-foreground border-transparent hover:text-foreground"} font-display font-bold text-sm tracking-wider flex items-center gap-2 border-b-2 pb-1 transition-colors`}
                        >
                            <ShoppingCart className="w-4 h-4" /> LOJA
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area (Dynamic Tabs) */}
            <div className="relative min-h-[500px]">
                {activeTab === "inicio" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-4 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column (Info / Welcome) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-card/40 border border-border/50 rounded-2xl p-8 backdrop-blur-sm">
                                    <h2 className="text-2xl font-display font-bold text-foreground tracking-wider mb-6 flex items-center gap-3">
                                        <span className="w-2 h-8 bg-neon-purple rounded-full"></span>
                                        BEM-VINDO AO COVARIUM!
                                    </h2>

                                    <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
                                        <p>
                                            Junte-se à nossa comunidade para ter a melhor experiência de jogo. Nossa loja oficial é o único lugar autorizado para adquirir benefícios, itens cosméticos e ranks.
                                        </p>

                                        <ul className="space-y-3 mt-6">
                                            <li className="flex items-start gap-3">
                                                <SparkleIcon />
                                                <span>Por favor, leia atentamente os detalhes de cada plano ou item antes de prosseguir com a compra.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <SparkleIcon />
                                                <span>Certifique-se de fornecer corretamente o seu Nickname (Nome no jogo) para evitar problemas na ativação.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <SparkleIcon />
                                                <span>Toda compra ajuda diretamente o servidor a se manter online e trazer atualizações frequentes!</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <SparkleIcon />
                                                <span>Seus dados de pagamento são processados de forma 100% segura.</span>
                                            </li>
                                        </ul>

                                        <p className="text-sm border-l-4 border-neon-cyan pl-4 py-2 bg-neon-cyan/5 mt-6 font-medium text-foreground">
                                            Ao efetuar uma compra, você concorda automaticamente com nossos Termos e Condições e regras do servidor.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (Widgets) */}
                            <div className="space-y-6">
                                {/* Discord Widget */}
                                <a href="https://dsc.gg/covarium" target="_blank" rel="noopener noreferrer" className="block p-1 rounded-2xl bg-[#5865F2] hover:shadow-[0_0_30px_rgba(88,101,242,0.4)] transition-all cursor-pointer group transform hover:-translate-y-1">
                                    <div className="bg-card px-8 py-10 rounded-xl text-center h-full">
                                        <div className="w-12 h-12 text-[#5865F2] mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                            <DiscordIcon />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-foreground tracking-wider mb-2">COMUNIDADE</h3>
                                        <p className="text-xs text-muted-foreground font-body">Junte-se ao nosso Discord e fique por dentro das novidades!</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "noticias" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <News />
                    </div>
                )}
                {activeTab === "forum" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Forum />
                    </div>
                )}
                {activeTab === "loja" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Store />
                    </div>
                )}
            </div>
        </div>
    );
};

const SparkleIcon = () => (
    <svg className="w-5 h-5 text-neon-orange shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a4.4 4.4 0 0 1 0-8.595L8.5 2.303A2 2 0 0 0 9.937.867l1.582-6.134a4.4 4.4 0 0 1 8.595 0l1.582 6.134a2 2 0 0 0 1.437 1.436l6.134 1.582a4.4 4.4 0 0 1 0 8.595l-6.134 1.582a2 2 0 0 0-1.437 1.437l-1.582 6.134a4.4 4.4 0 0 1-8.595 0z" />
    </svg>
)

export default Index;
