import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clube } from './cena/Clube.jsx';
import { Topo } from './ui/Topo.jsx';
import { LinhaDoTempo } from './ui/LinhaDoTempo.jsx';
import { Painel } from './ui/Painel.jsx';
import {
  DURACAO_JOGO, QUADRAS, agoraEmMinutos, hhmm, precoDoHorario, reservasExemplo, resumoDoDia, statusDaQuadra,
} from './dados.js';

const CHAVE = 'clube3d-reservas-v1';
const INICIO_DIA = 6 * 60;
const FIM_DIA = 24 * 60 - 5;

function carregarReservas() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (Array.isArray(salvo)) return salvo;
  } catch { /* sem armazenamento: usa o exemplo */ }
  return reservasExemplo();
}

const limitar = (m) => Math.min(Math.max(m, INICIO_DIA), FIM_DIA);

export default function App() {
  const [reservas, setReservas] = useState(carregarReservas);
  const [minuto, setMinuto] = useState(() => limitar(agoraEmMinutos()));
  const [tocando, setTocando] = useState(false);
  const [selecionada, setSelecionada] = useState(null);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify(reservas)); } catch { /* ignora */ }
  }, [reservas]);

  // "Play": o dia passa rápido, 5 minutos a cada tique
  useEffect(() => {
    if (!tocando) return undefined;
    const id = setInterval(() => setMinuto((m) => (m + 5 > FIM_DIA ? INICIO_DIA : m + 5)), 90);
    return () => clearInterval(id);
  }, [tocando]);

  useEffect(() => {
    if (!aviso) return undefined;
    const id = setTimeout(() => setAviso(null), 3200);
    return () => clearTimeout(id);
  }, [aviso]);

  useEffect(() => {
    const fechar = (e) => e.key === 'Escape' && setSelecionada(null);
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, []);

  const resumo = useMemo(() => resumoDoDia(reservas), [reservas]);
  const emJogo = QUADRAS.filter((q) => statusDaQuadra(q, reservas, minuto).tipo === 'jogando').length;

  const reservar = useCallback((quadraId, inicio, nome) => {
    const id = `nova-${Date.now()}`;
    const nova = {
      id, quadra: quadraId, inicio, fim: inicio + DURACAO_JOGO, nome: nome || 'Sem nome',
      pago: false, mensalista: false, valor: precoDoHorario(inicio), nova: true,
    };
    setReservas((r) => [...r, nova]);
    setAviso({ tipo: 'pix', texto: `Pix gerado · Quadra ${quadraId} às ${hhmm(inicio)}` });
    // Simula o pagamento caindo alguns segundos depois
    setTimeout(() => {
      setReservas((r) => r.map((x) => (x.id === id ? { ...x, pago: true } : x)));
      setAviso({ tipo: 'ok', texto: `Pix recebido · ${nome || 'Reserva'} confirmada na Quadra ${quadraId}` });
    }, 2200);
  }, []);

  const cancelar = useCallback((id) => {
    setReservas((r) => r.filter((x) => x.id !== id));
    setAviso({ tipo: 'info', texto: 'Reserva cancelada' });
  }, []);

  const restaurar = () => {
    setReservas(reservasExemplo());
    setAviso({ tipo: 'info', texto: 'Reservas de exemplo restauradas' });
  };

  const quadra = QUADRAS.find((q) => q.id === selecionada);

  return (
    <div className="app">
      <div className="palco">
        <Clube minuto={minuto} reservas={reservas} selecionada={selecionada} onSelecionar={setSelecionada} />
      </div>

      <Topo resumo={resumo} emJogo={emJogo} quadrasAtivas={QUADRAS.filter((q) => !q.manutencao).length} onRestaurar={restaurar} />

      <LinhaDoTempo
        minuto={minuto}
        onMudar={(m) => { setTocando(false); setMinuto(limitar(m)); }}
        tocando={tocando}
        onTocar={() => setTocando((t) => !t)}
        onAgora={() => { setTocando(false); setMinuto(limitar(agoraEmMinutos())); }}
        reservas={reservas}
      />

      {quadra && (
        <Painel
          quadra={quadra}
          status={statusDaQuadra(quadra, reservas, minuto)}
          reservas={reservas.filter((r) => r.quadra === quadra.id)}
          minuto={minuto}
          onReservar={reservar}
          onCancelar={cancelar}
          onFechar={() => setSelecionada(null)}
        />
      )}

      {!quadra && <p className="dica">Clique numa quadra para ver a agenda e reservar · arraste para girar</p>}

      {aviso && <div className={`aviso aviso-${aviso.tipo}`} role="status">{aviso.texto}</div>}
    </div>
  );
}
