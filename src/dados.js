// Regras do clube e reservas de exemplo. Tempo sempre em minutos desde 00:00.

export const DURACAO_JOGO = 90;
export const PRIMEIRO_HORARIO = 7 * 60;
export const ULTIMO_HORARIO = 22 * 60;
export const INICIO_NOBRE = 17 * 60 + 30;

export const PRECO = { normal: 100, nobre: 160 };

export const QUADRAS = [
  { id: 1, nome: 'Quadra 1', apelido: 'Central', x: -13, z: -12 },
  { id: 2, nome: 'Quadra 2', apelido: null, x: 0, z: -12 },
  { id: 3, nome: 'Quadra 3', apelido: null, x: 13, z: -12 },
  { id: 4, nome: 'Quadra 4', apelido: null, x: -13, z: 12 },
  { id: 5, nome: 'Quadra 5', apelido: null, x: 0, z: 12 },
  { id: 6, nome: 'Quadra 6', apelido: null, x: 13, z: 12, manutencao: 'Troca do gramado' },
];

export const STATUS = {
  livre: { rotulo: 'Livre', cor: '#46d68c' },
  em_breve: { rotulo: 'Começa já', cor: '#ffc23d' },
  jogando: { rotulo: 'Em jogo', cor: '#ff6a3d' },
  manutencao: { rotulo: 'Manutenção', cor: '#8b929c' },
};

export function horarios() {
  const lista = [];
  for (let m = PRIMEIRO_HORARIO; m <= ULTIMO_HORARIO; m += DURACAO_JOGO) lista.push(m);
  return lista;
}

export const precoDoHorario = (inicio) => (inicio >= INICIO_NOBRE ? PRECO.nobre : PRECO.normal);

export function hhmm(minutos) {
  const m = ((Math.round(minutos) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function agoraEmMinutos() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// Horários ocupados por quadra (índice do slot do dia: 0 = 07:00, 1 = 08:30 ... 10 = 22:00)
const OCUPACAO_EXEMPLO = {
  1: [0, 2, 3, 5, 7, 8, 9, 10],
  2: [1, 4, 6, 7, 8, 9],
  3: [0, 3, 7, 8, 9, 10],
  4: [2, 5, 6, 8, 9],
  5: [1, 3, 7, 8, 10],
};

const NOMES = [
  'Rafa', 'Camila', 'Bruno', 'Juliana', 'Thiago', 'Marina', 'Diego', 'Patrícia', 'Leo', 'Fernanda',
  'Gustavo', 'Bia', 'Rodrigo', 'Lu', 'André', 'Carol', 'Felipe', 'Nati', 'Vini', 'Paula',
];

export function reservasExemplo() {
  const slots = horarios();
  const lista = [];
  let n = 0;
  for (const [quadra, indices] of Object.entries(OCUPACAO_EXEMPLO)) {
    for (const i of indices) {
      const inicio = slots[i];
      lista.push({
        id: `ex-${quadra}-${i}`,
        quadra: Number(quadra),
        inicio,
        fim: inicio + DURACAO_JOGO,
        nome: `${NOMES[n % NOMES.length]} + 3`,
        pago: n % 5 !== 3,
        mensalista: n % 7 === 0,
        valor: precoDoHorario(inicio),
      });
      n++;
    }
  }
  return lista;
}

export function statusDaQuadra(quadra, reservas, minuto) {
  if (quadra.manutencao) return { tipo: 'manutencao', motivo: quadra.manutencao };
  const daQuadra = reservas.filter((r) => r.quadra === quadra.id).sort((a, b) => a.inicio - b.inicio);
  const atual = daQuadra.find((r) => r.inicio <= minuto && minuto < r.fim);
  if (atual) return { tipo: 'jogando', reserva: atual, restante: atual.fim - minuto };
  const proxima = daQuadra.find((r) => r.inicio > minuto);
  if (proxima && proxima.inicio - minuto <= 30) return { tipo: 'em_breve', reserva: proxima, faltam: proxima.inicio - minuto };
  return { tipo: 'livre', proxima };
}

export function resumoDoDia(reservas) {
  const ativas = QUADRAS.filter((q) => !q.manutencao);
  const total = ativas.length * horarios().length;
  const ocupados = reservas.filter((r) => ativas.some((q) => q.id === r.quadra)).length;
  const faturamento = reservas.reduce((s, r) => s + r.valor, 0);
  const aReceber = reservas.filter((r) => !r.pago).reduce((s, r) => s + r.valor, 0);
  return { ocupacao: total ? ocupados / total : 0, ocupados, total, faturamento, aReceber };
}

// Quantas quadras estão em jogo em cada meia hora do dia (para o mini-gráfico da linha do tempo)
export function ocupacaoPorMeiaHora(reservas, de = 6 * 60, ate = 24 * 60) {
  const barras = [];
  for (let m = de; m < ate; m += 30) {
    barras.push({ minuto: m, quadras: reservas.filter((r) => r.inicio <= m && m < r.fim).length });
  }
  return barras;
}
