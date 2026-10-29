import { useMemo } from 'react';
import { QUADRAS, hhmm, ocupacaoPorMeiaHora } from '../dados.js';

const DE = 6 * 60;
const ATE = 24 * 60;
const MARCAS = [6, 9, 12, 15, 18, 21, 24];

export function LinhaDoTempo({ minuto, onMudar, tocando, onTocar, onAgora, reservas }) {
  const barras = useMemo(() => ocupacaoPorMeiaHora(reservas, DE, ATE), [reservas]);
  const maximo = QUADRAS.filter((q) => !q.manutencao).length;
  const pct = ((minuto - DE) / (ATE - DE)) * 100;
  const noite = minuto >= 18 * 60 || minuto < 6 * 60 + 30;

  return (
    <section className="linha" aria-label="Linha do tempo do dia">
      <div className="relogio">
        <span className="relogio-hora">{hhmm(minuto)}</span>
        <span className="relogio-sub">{noite ? 'refletores acesos' : 'luz do dia'}</span>
      </div>

      <div className="controles">
        <button type="button" className="redondo" onClick={onTocar} aria-label={tocando ? 'Pausar' : 'Ver o dia passar'}>
          {tocando ? '❚❚' : '▶'}
        </button>
        <button type="button" className="pilula" onClick={onAgora}>Agora</button>
      </div>

      <div className="trilho">
        <div className="barras" aria-hidden="true">
          {barras.map((b) => (
            <span
              key={b.minuto}
              className={b.minuto <= minuto && minuto < b.minuto + 30 ? 'atual' : ''}
              style={{ height: `${Math.max(6, (b.quadras / maximo) * 100)}%` }}
              title={`${hhmm(b.minuto)} · ${b.quadras} quadra(s)`}
            />
          ))}
        </div>
        <div className="marcador" style={{ left: `${pct}%` }} aria-hidden="true" />
        <input
          type="range"
          min={DE}
          max={ATE - 5}
          step={5}
          value={minuto}
          onChange={(e) => onMudar(Number(e.target.value))}
          aria-label="Horário"
          aria-valuetext={hhmm(minuto)}
        />
        <div className="marcas" aria-hidden="true">
          {MARCAS.map((h) => <span key={h}>{String(h % 24).padStart(2, '0')}h</span>)}
        </div>
      </div>
    </section>
  );
}
