// Céu e sol conforme a hora do dia: interpola entre pontos-chave.
import { Color } from 'three';

const CHAVES = [
  { m: 0, ceu: '#0b0f1c', sol: 0.08, corSol: '#7f8fd6', amb: 0.18 },
  { m: 330, ceu: '#141a2e', sol: 0.12, corSol: '#8fa3ff', amb: 0.22 },
  { m: 390, ceu: '#e0a987', sol: 0.9, corSol: '#ffb27a', amb: 0.45 },
  { m: 480, ceu: '#cfe2ec', sol: 2.3, corSol: '#fff1dc', amb: 0.75 },
  { m: 720, ceu: '#d8e8f1', sol: 2.8, corSol: '#ffffff', amb: 0.85 },
  { m: 1020, ceu: '#e8d8c2', sol: 2.2, corSol: '#ffd9a8', amb: 0.7 },
  { m: 1095, ceu: '#c9785a', sol: 1.0, corSol: '#ff8a4c', amb: 0.45 },
  { m: 1155, ceu: '#252b45', sol: 0.18, corSol: '#8fa3ff', amb: 0.26 },
  { m: 1440, ceu: '#0b0f1c', sol: 0.08, corSol: '#7f8fd6', amb: 0.18 },
];

const tmpA = new Color();
const tmpB = new Color();

export function luzDoHorario(minuto) {
  const m = Math.min(Math.max(minuto, 0), 1440);
  let i = CHAVES.findIndex((c) => c.m > m);
  if (i <= 0) i = CHAVES.length - 1;
  const a = CHAVES[i - 1];
  const b = CHAVES[i];
  const t = (m - a.m) / (b.m - a.m || 1);
  const mistura = (x, y) => '#' + tmpA.set(x).lerp(tmpB.set(y), t).getHexString();

  // Sol nasce no leste (x+) e se põe no oeste (x-)
  const fracaoDia = Math.min(Math.max((m - 360) / (1110 - 360), 0), 1);
  const angulo = Math.PI * fracaoDia;
  return {
    ceu: mistura(a.ceu, b.ceu),
    corSol: mistura(a.corSol, b.corSol),
    sol: a.sol + (b.sol - a.sol) * t,
    ambiente: a.amb + (b.amb - a.amb) * t,
    posicaoSol: [Math.cos(angulo) * 60, 12 + Math.sin(angulo) * 55, -25],
    // Refletores acendem no fim da tarde e de madrugada
    refletores: m >= 1080 || m < 390,
  };
}
