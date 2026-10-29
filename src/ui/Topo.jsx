import { STATUS } from '../dados.js';

const real = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function Topo({ resumo, emJogo, quadrasAtivas, onRestaurar }) {
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <header className="topo">
      <div className="marca">
        <span className="marca-bola" aria-hidden="true" />
        <div>
          <h1>Punto de Oro</h1>
          <p>Pádel Clube · {hoje}</p>
        </div>
      </div>

      <dl className="numeros">
        <div>
          <dt>Ocupação do dia</dt>
          <dd>{Math.round(resumo.ocupacao * 100)}<small>%</small></dd>
        </div>
        <div>
          <dt>Em jogo agora</dt>
          <dd>{emJogo}<small>/{quadrasAtivas}</small></dd>
        </div>
        <div>
          <dt>Faturamento previsto</dt>
          <dd>{real(resumo.faturamento)}</dd>
        </div>
        <div>
          <dt>A receber</dt>
          <dd className={resumo.aReceber ? 'alerta' : ''}>{real(resumo.aReceber)}</dd>
        </div>
      </dl>

      <div className="legenda">
        {Object.entries(STATUS).map(([k, s]) => (
          <span key={k}><i style={{ background: s.cor }} />{s.rotulo}</span>
        ))}
        <button type="button" className="link" onClick={onRestaurar}>Restaurar exemplo</button>
      </div>
    </header>
  );
}
