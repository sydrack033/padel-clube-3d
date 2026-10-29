import { useState } from 'react';
import { DURACAO_JOGO, INICIO_NOBRE, STATUS, hhmm, horarios, precoDoHorario } from '../dados.js';

function Horario({ inicio, reserva, passou, aberto, onAbrir, onReservar, onCancelar }) {
  const [nome, setNome] = useState('');
  const preco = precoDoHorario(inicio);
  const nobre = inicio >= INICIO_NOBRE;

  if (reserva) {
    return (
      <li className="slot ocupado">
        <span className="slot-hora">{hhmm(inicio)}</span>
        <span className="slot-quem">
          {reserva.nome}
          <span className="selos">
            {reserva.mensalista && <em className="selo">mensalista</em>}
            <em className={`selo ${reserva.pago ? 'pago' : 'pendente'}`}>{reserva.pago ? 'pago' : 'Pix pendente'}</em>
          </span>
        </span>
        {reserva.nova && !passou && (
          <button type="button" className="link" onClick={() => onCancelar(reserva.id)}>cancelar</button>
        )}
      </li>
    );
  }

  if (passou) {
    return (
      <li className="slot passou">
        <span className="slot-hora">{hhmm(inicio)}</span>
        <span className="slot-quem">não reservado</span>
      </li>
    );
  }

  return (
    <li className={`slot livre ${aberto ? 'aberto' : ''}`}>
      <span className="slot-hora">{hhmm(inicio)}</span>
      {!aberto ? (
        <button type="button" className="reservar" onClick={onAbrir}>
          Reservar <span>R$ {preco}{nobre ? ' · nobre' : ''}</span>
        </button>
      ) : (
        <form
          className="form-reserva"
          onSubmit={(e) => {
            e.preventDefault();
            onReservar(inicio, nome.trim());
          }}
        >
          <input
            autoFocus
            placeholder="Nome de quem reserva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={40}
          />
          <button type="submit" className="confirmar">Gerar Pix · R$ {preco}</button>
        </form>
      )}
    </li>
  );
}

export function Painel({ quadra, status, reservas, minuto, onReservar, onCancelar, onFechar }) {
  const [aberto, setAberto] = useState(null);
  const s = STATUS[status.tipo];
  const ocupados = reservas.length;
  const total = horarios().length;

  return (
    <aside className="painel" aria-label={`Agenda da ${quadra.nome}`}>
      <header className="painel-topo" style={{ '--cor': s.cor }}>
        <div>
          <p className="painel-num">{String(quadra.id).padStart(2, '0')}</p>
          <h2>{quadra.nome}{quadra.apelido ? <small> · {quadra.apelido}</small> : null}</h2>
          <p className="painel-status"><i />{s.rotulo} às {hhmm(minuto)}</p>
        </div>
        <button type="button" className="fechar" onClick={onFechar} aria-label="Fechar">×</button>
      </header>

      {status.tipo === 'manutencao' ? (
        <p className="painel-aviso">Fechada hoje: {status.motivo}. Volta amanhã.</p>
      ) : (
        <>
          <div className="painel-resumo">
            <span><strong>{ocupados}</strong>/{total} horários vendidos</span>
            <span>Jogos de {DURACAO_JOGO} min</span>
          </div>
          <ul className="slots">
            {horarios().map((inicio) => (
              <Horario
                key={`${quadra.id}-${inicio}`}
                inicio={inicio}
                reserva={reservas.find((r) => r.inicio === inicio)}
                passou={inicio + DURACAO_JOGO <= minuto}
                aberto={aberto === inicio}
                onAbrir={() => setAberto(inicio)}
                onReservar={(ini, nome) => {
                  setAberto(null);
                  onReservar(quadra.id, ini, nome);
                }}
                onCancelar={onCancelar}
              />
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
