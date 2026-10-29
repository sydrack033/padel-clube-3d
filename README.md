# Punto de Oro · Clube 3D

Protótipo de sistema de aluguel de quadras de pádel com o clube em 3D: tu vê as quadras
ao longo do dia, quem está jogando, e reserva com um clique.

**No ar:** https://sydrack033.github.io/padel-clube-3d/

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5174.

## O que tem

- **Clube em 3D isométrico**: 6 quadras (vidro, alambrado, rede, refletores), sede com bar, terraço e árvores.
- **Status por quadra**: livre, começa já (pisca, a turma esperando na porta), em jogo e manutenção.
- **Jogadores articulados**: pernas, braços, tênis, cabelo/boné/rabo de cavalo e raquete de pádel na mão.
  Correm atrás da bola e dão o golpe (prepara, bate, volta) quando ela chega no lado deles.
- **Câmera vai até a quadra**: clicou, ela voa e aproxima, encaixando a quadra no espaço livre ao lado do painel
  (ou acima dele no celular). Fechou, volta para o clube inteiro.
- **Linha do tempo**: arrasta pra ver o clube em qualquer hora; o céu e o sol mudam e os refletores acendem à noite
  só nas quadras em uso. O ▶ faz o dia passar rápido. As barras mostram quantas quadras estão ocupadas a cada meia hora.
- **Reserva**: clica na quadra (ou na etiqueta), escolhe o horário livre, põe o nome e "Gerar Pix".
  O pagamento é **simulado**: fica "Pix pendente" e cai como pago 2 segundos depois.
- **Números do dia**: ocupação, quadras em jogo, faturamento previsto e quanto falta receber.

Os dados são de exemplo (`src/dados.js`) e as reservas novas ficam no `localStorage` do navegador.
"Restaurar exemplo" volta ao começo.

## Stack

React 19 + Vite, **React Three Fiber** (Three.js no React) e **drei** (câmera e controles).
Tudo é geometria primitiva: nenhum modelo 3D externo.

| Arquivo | O que é |
|---|---|
| `src/dados.js` | quadras, horários (jogos de 90 min), preços, reservas de exemplo e status |
| `src/cena/Clube.jsx` | canvas, câmera, luz do dia e etiquetas sobre as quadras |
| `src/cena/Quadra.jsx` | a quadra e o que acontece nela |
| `src/cena/Jogadores.jsx` | jogadores, bola e a turma chegando |
| `src/cena/Ambiente.jsx` | chão, calçadas, sede, terraço, árvores e postes |
| `src/cena/luz.js` | cor do céu e posição do sol por horário |
| `src/ui/` | topo com os números, linha do tempo e painel de reserva |

## Deploy

Cada push na `main` gera o build e publica no GitHub Pages (`.github/workflows/deploy.yml`).

## Para virar sistema de verdade

Banco com login e tempo real (Supabase), Pix de verdade (Mercado Pago), regra de cancelamento,
mensalistas com horário fixo e lembrete no WhatsApp.
