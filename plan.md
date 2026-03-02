

# Loja do Covarium - Servidor Minecraft

## Visão Geral
Uma loja online com tema dark/gaming para o servidor de Minecraft **Covarium**, onde jogadores podem comprar planos VIP, serviços de unban/unmute e clantags. O pagamento será feito via PIX com QR Code gerado pelo site.

---

## Páginas e Funcionalidades

### 1. Página Inicial (Landing)
- Banner principal com nome "Covarium" e estilo gamer/dark com cores vibrantes (roxo, azul neon)
- Cards dos planos e serviços disponíveis com preços
- Navegação simples para a seção de compra

### 2. Seção de Planos VIP
Três cards com destaque visual crescente:
- **VIP** — R$ 20,00
- **Plus** — R$ 25,00
- **Plus+** — R$ 35,00

Ao clicar em um plano, abre um formulário pedindo:
- **Nick do Minecraft** (obrigatório)
- **Nick do Discord** (obrigatório)

### 3. Seção ClanTag
- **ClanTag** — R$ 12,00
- Formulário com:
  - **Nick do Minecraft** (obrigatório)
  - **Nick do Discord** (obrigatório)
  - **Tag desejada** (limite de 12 caracteres, obrigatório)
- Validação: a tag NÃO pode ser "vip", "plus" ou "plus+"

### 4. Seção Unban / Unmute
Serviços para Minecraft E Discord (mesmos valores):
- **Unban** — R$ 40,00
- **Unmute** — R$ 20,00

Formulário pedindo:
- **Nick do Minecraft** (obrigatório)
- **Nick do Discord** (obrigatório)

### 5. Tela de Pagamento (QR Code PIX)
Após preencher os dados e confirmar:
- O site gera um **QR Code PIX** com o valor correto
- A mensagem do PIX inclui automaticamente:
  - O que foi comprado (ex: "VIP", "Plus+", "ClanTag")
  - Nick do Minecraft e Discord do jogador
  - Se for clantag, inclui a tag escolhida
- Link para o pixgg.com/ANJELINOBR como alternativa
- Exemplo de mensagem: `mine: Steve123 dc: Steve#1234 - VIP` ou `clantag, tag: Warriors mine: Steve123 dc: Steve#1234`

---

## Design
- **Tema escuro** com gradientes em roxo/azul neon
- Estilo gamer com cards destacados
- Responsivo (funciona no celular e PC)
- Animações sutis nos cards de planos

## Observações Técnicas
- Tudo no frontend, sem necessidade de backend/banco de dados
- O QR Code PIX será gerado no próprio site usando uma biblioteca de geração de QR codes
- Validação dos formulários (campos obrigatórios, limite de caracteres na clantag, bloqueio de tags proibidas)

