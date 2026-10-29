// Uma quadra de pádel (10 x 20 m) com vidro, alambrado, rede, refletores e o que estiver acontecendo nela.
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { hhmm, STATUS } from '../dados.js';
import { PartidaEmJogo, TurmaChegando } from './Jogadores.jsx';

const LARGURA = 10;
const COMPRIMENTO = 20;
const ALTURA_VIDRO = 3;

function Vidro({ posicao, tamanho }) {
  return (
    <mesh position={posicao}>
      <boxGeometry args={tamanho} />
      <meshStandardMaterial color="#cfeeff" transparent opacity={0.22} roughness={0.05} metalness={0.1} depthWrite={false} />
    </mesh>
  );
}

function Poste({ posicao, altura }) {
  return (
    <mesh position={[posicao[0], altura / 2 + 0.2, posicao[1]]} castShadow>
      <boxGeometry args={[0.09, altura, 0.09]} />
      <meshStandardMaterial color="#16191e" roughness={0.6} />
    </mesh>
  );
}

function Estrutura() {
  const meioX = LARGURA / 2;
  const meioZ = COMPRIMENTO / 2;
  const postes = [];
  // fundos: postes a cada 2,5 m
  for (let x = -meioX; x <= meioX + 0.01; x += 2.5) {
    postes.push([[x, -meioZ], 4], [[x, meioZ], 4]);
  }
  // laterais: postes a cada 2 m
  for (let z = -meioZ + 2; z < meioZ; z += 2) {
    postes.push([[-meioX, z], 3], [[meioX, z], 3]);
  }
  return (
    <group>
      {/* vidros do fundo (3 m) */}
      <Vidro posicao={[0, 0.2 + ALTURA_VIDRO / 2, -meioZ]} tamanho={[LARGURA, ALTURA_VIDRO, 0.06]} />
      <Vidro posicao={[0, 0.2 + ALTURA_VIDRO / 2, meioZ]} tamanho={[LARGURA, ALTURA_VIDRO, 0.06]} />
      {/* vidros laterais: 2 m altos + 2 m mais baixos em cada canto */}
      {[-1, 1].map((lx) =>
        [-1, 1].map((lz) => (
          <group key={`${lx}${lz}`}>
            <Vidro posicao={[lx * meioX, 0.2 + 1.5, lz * (meioZ - 1)]} tamanho={[0.06, 3, 2]} />
            <Vidro posicao={[lx * meioX, 0.2 + 1, lz * (meioZ - 3)]} tamanho={[0.06, 2, 2]} />
          </group>
        )),
      )}
      {/* alambrado do meio das laterais */}
      {[-1, 1].map((lx) => (
        <mesh key={lx} position={[lx * meioX, 0.2 + 1.5, 0]}>
          <boxGeometry args={[0.03, 3, COMPRIMENTO - 8]} />
          <meshStandardMaterial color="#1b1f26" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
      {/* tela acima do vidro do fundo */}
      {[-1, 1].map((lz) => (
        <mesh key={lz} position={[0, 0.2 + ALTURA_VIDRO + 0.5, lz * meioZ]}>
          <boxGeometry args={[LARGURA, 1, 0.03]} />
          <meshStandardMaterial color="#1b1f26" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
      {postes.map(([p, h], i) => <Poste key={i} posicao={p} altura={h} />)}
    </group>
  );
}

function Linhas() {
  const branco = <meshStandardMaterial color="#f4f6f8" roughness={0.9} />;
  const y = 0.215;
  return (
    <group>
      {[-6.95, 6.95].map((z) => (
        <mesh key={z} position={[0, y, z]}>
          <boxGeometry args={[LARGURA, 0.005, 0.06]} />
          {branco}
        </mesh>
      ))}
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[0.06, 0.005, 13.9]} />
        {branco}
      </mesh>
    </group>
  );
}

function Rede() {
  return (
    <group position={[0, 0.2, 0]}>
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[LARGURA, 0.88, 0.03]} />
        <meshStandardMaterial color="#20242c" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[LARGURA, 0.06, 0.05]} />
        <meshStandardMaterial color="#f4f6f8" />
      </mesh>
      {[-1, 1].map((l) => (
        <mesh key={l} position={[l * (LARGURA / 2 + 0.05), 0.46, 0]} castShadow>
          <boxGeometry args={[0.1, 0.92, 0.1]} />
          <meshStandardMaterial color="#16191e" />
        </mesh>
      ))}
    </group>
  );
}

function Refletores({ acesos }) {
  const cantos = [[-5.6, -10.6], [5.6, -10.6], [-5.6, 10.6], [5.6, 10.6]];
  return (
    <group>
      {cantos.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 3.4, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 6.8, 6]} />
            <meshStandardMaterial color="#2a2f37" />
          </mesh>
          <mesh position={[-Math.sign(x) * 0.3, 6.8, -Math.sign(z) * 0.3]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.18, 0.5]} />
            <meshStandardMaterial
              color={acesos ? '#fff6dc' : '#3a3f48'}
              emissive={acesos ? '#fff1c4' : '#000000'}
              emissiveIntensity={acesos ? 2.2 : 0}
            />
          </mesh>
        </group>
      ))}
      {acesos && <pointLight position={[0, 8, 0]} intensity={140} distance={26} decay={1.6} color="#fff2d6" />}
    </group>
  );
}

function Manutencao() {
  return (
    <group>
      {[[-3, 0.2, -6], [2.5, 0.2, 4], [3.5, 0.2, -2]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1] + 0.35, p[2]]} castShadow>
          <coneGeometry args={[0.25, 0.7, 10]} />
          <meshStandardMaterial color="#ff7a1a" />
        </mesh>
      ))}
      {/* rolos de grama nova */}
      {[[-1.5, -2], [0.5, -3.2], [-2.8, 5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.55, z]} rotation={[0, 0.4 * i, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 2.2, 14]} />
          <meshStandardMaterial color="#2f5fb3" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Contorno colorido que mostra o status; pulsa quando a turma está para entrar
function Contorno({ cor, destaque, pulsar }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const base = destaque ? 0.95 : 0.6;
    ref.current.material.opacity = pulsar ? base * (0.55 + 0.45 * Math.sin(clock.elapsedTime * 4) ** 2) : base;
  });
  return (
    <mesh ref={ref} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[LARGURA + (destaque ? 2.4 : 1.6), COMPRIMENTO + (destaque ? 2.4 : 1.6)]} />
      <meshBasicMaterial color={cor} transparent opacity={0.6} toneMapped={false} />
    </mesh>
  );
}

export function rotuloDoStatus(status) {
  switch (status.tipo) {
    case 'jogando':
      return `até ${hhmm(status.reserva.fim)}`;
    case 'em_breve':
      return `entra em ${status.faltam} min`;
    case 'manutencao':
      return status.motivo;
    default:
      return status.proxima ? `próximo ${hhmm(status.proxima.inicio)}` : 'sem jogos';
  }
}

export function Quadra({ quadra, status, refletores, selecionada, onSelecionar }) {
  const [sobre, setSobre] = useState(false);
  const cor = STATUS[status.tipo].cor;
  const manutencao = status.tipo === 'manutencao';
  return (
    <group
      position={[quadra.x, 0, quadra.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelecionar(quadra.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setSobre(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setSobre(false);
        document.body.style.cursor = '';
      }}
    >
      <Contorno cor={selecionada ? '#ffffff' : cor} destaque={selecionada || sobre} pulsar={status.tipo === 'em_breve'} />
      {/* base de concreto */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[LARGURA + 1.2, 0.2, COMPRIMENTO + 1.2]} />
        <meshStandardMaterial color="#2b3038" roughness={0.9} />
      </mesh>
      {/* grama sintética */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LARGURA, COMPRIMENTO]} />
        <meshStandardMaterial color={manutencao ? '#56637a' : '#2c6bd0'} roughness={0.95} />
      </mesh>
      {!manutencao && <Linhas />}
      {!manutencao && <Rede />}
      <Estrutura />
      <Refletores acesos={refletores && status.tipo !== 'manutencao' && status.tipo !== 'livre'} />
      {status.tipo === 'jogando' && <PartidaEmJogo variante={quadra.id} />}
      {status.tipo === 'em_breve' && <TurmaChegando variante={quadra.id} />}
      {manutencao && <Manutencao />}
    </group>
  );
}
