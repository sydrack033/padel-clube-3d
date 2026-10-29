// Jogadores articulados (pernas, braços, raquete na mão) e a bola da partida.
// A bola segue um ciclo fixo e os jogadores leem a posição dela para correr e dar o golpe na hora certa.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, CapsuleGeometry, CylinderGeometry, SphereGeometry } from 'three';

// Geometrias compartilhadas por todos os bonecos (são dezenas em cena)
const G = {
  perna: new CapsuleGeometry(0.075, 0.6, 4, 8),
  tenis: new BoxGeometry(0.13, 0.08, 0.27),
  short: new CylinderGeometry(0.19, 0.22, 0.26, 10),
  tronco: new CapsuleGeometry(0.18, 0.34, 4, 10),
  braco: new CapsuleGeometry(0.055, 0.4, 4, 8),
  mao: new SphereGeometry(0.06, 8, 6),
  pescoco: new CylinderGeometry(0.06, 0.07, 0.1, 8),
  cabeca: new SphereGeometry(0.15, 16, 12),
  cabelo: new SphereGeometry(0.158, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
  rabo: new SphereGeometry(0.075, 10, 8),
  bone: new CylinderGeometry(0.158, 0.158, 0.08, 16),
  aba: new BoxGeometry(0.2, 0.018, 0.16),
  cabo: new CylinderGeometry(0.022, 0.026, 0.2, 8),
  raquete: new CylinderGeometry(0.15, 0.15, 0.032, 20),
  aro: new CylinderGeometry(0.162, 0.162, 0.024, 20),
  bola: new SphereGeometry(0.11, 12, 10),
};

const PELES = ['#f1c7a5', '#c99572', '#8d5a3b', '#e8b48f', '#a8724f'];
const CABELOS = ['#2b1d14', '#5a3a22', '#d9b26b', '#111111', '#7a2f1c'];
const RAQUETES = [['#e6402e', '#1c1f24'], ['#f2f2f2', '#1679d9'], ['#ffd23f', '#1c1f24'], ['#1c1f24', '#d9f24a']];

// Uniformes das duplas: [camisa, short]
const UNIFORMES = [
  [['#f25f3a', '#1f2a44'], ['#1f2a44', '#f2f2f2']],
  [['#ffffff', '#16a36b'], ['#16a36b', '#ffffff']],
  [['#ffcf3d', '#2b2f38'], ['#7a4de8', '#2b2f38']],
  [['#2fb7c9', '#13202b'], ['#e83f6f', '#13202b']],
  [['#f2f2f2', '#c43d2f'], ['#232832', '#f2f2f2']],
];

const PERIODO_BOLA = 3.6; // segundos de ida e volta
const JANELA_GOLPE = 0.11; // fração do ciclo em que o braço completa o golpe

// t: 0 = bola na dupla do fundo (z-), 0.5 = na dupla da frente (z+), volta a 1
export function posicaoDaBola(tempo) {
  const t = (tempo / PERIODO_BOLA) % 1;
  const ida = t < 0.5 ? t * 2 : 2 - t * 2;
  return {
    t,
    x: Math.sin(tempo * 0.7) * 2.2,
    y: 0.95 + Math.sin(ida * Math.PI) * 2.3,
    z: -4.4 + ida * 8.8,
  };
}

// Distância cíclica (-0.5..0.5) entre o momento atual e o momento do golpe
function distanciaDoGolpe(t, momento) {
  let d = t - momento;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

function Raquete({ cores }) {
  const [face, aro] = cores;
  return (
    // presa na mão: cabo segue o braço, a "pá" logo abaixo, de frente para a rede
    <group position={[0, -0.5, 0]}>
      <mesh geometry={G.cabo} position={[0, -0.1, 0]} castShadow>
        <meshStandardMaterial color="#1c1f24" roughness={0.6} />
      </mesh>
      <group position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.28, 1]}>
        <mesh geometry={G.aro} castShadow>
          <meshStandardMaterial color={aro} roughness={0.4} />
        </mesh>
        <mesh geometry={G.raquete} castShadow>
          <meshStandardMaterial color={face} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Cabeca({ pele, cabelo, estilo, bone }) {
  return (
    <group position={[0, 1.66, 0]}>
      <mesh geometry={G.pescoco} position={[0, -0.15, 0]}>
        <meshStandardMaterial color={pele} roughness={0.8} />
      </mesh>
      <mesh geometry={G.cabeca} castShadow>
        <meshStandardMaterial color={pele} roughness={0.8} />
      </mesh>
      {estilo === 'bone' ? (
        <>
          <mesh geometry={G.bone} position={[0, 0.08, 0]}>
            <meshStandardMaterial color={bone} roughness={0.7} />
          </mesh>
          <mesh geometry={G.aba} position={[0, 0.05, 0.13]}>
            <meshStandardMaterial color={bone} roughness={0.7} />
          </mesh>
        </>
      ) : (
        <mesh geometry={G.cabelo} position={[0, 0.02, -0.01]}>
          <meshStandardMaterial color={cabelo} roughness={0.9} />
        </mesh>
      )}
      {estilo === 'rabo' && (
        <mesh geometry={G.rabo} position={[0, 0.02, -0.17]} scale={[0.9, 1.5, 0.9]}>
          <meshStandardMaterial color={cabelo} roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

function Jogador({ base, lado, indice, variante, emJogo }) {
  const corpo = useRef();
  const tronco = useRef();
  const pernaE = useRef();
  const pernaD = useRef();
  const bracoE = useRef();
  const bracoD = useRef();

  const semente = variante * 4 + indice;
  const [camisa, short] = UNIFORMES[variante % UNIFORMES.length][lado < 0 ? 0 : 1];
  const pele = PELES[semente % PELES.length];
  const cabelo = CABELOS[(semente * 3) % CABELOS.length];
  const estilo = ['curto', 'bone', 'rabo', 'curto', 'bone'][semente % 5];
  const raquete = RAQUETES[semente % RAQUETES.length];
  const fase = semente * 1.37;

  useFrame(({ clock }) => {
    if (!corpo.current) return;
    const tempo = clock.elapsedTime + variante * 1.3;
    const andar = clock.elapsedTime + fase;

    if (!emJogo) {
      // esperando a quadra: parado, balançando a raquete
      tronco.current.rotation.y = Math.sin(andar * 0.7) * 0.25;
      bracoD.current.rotation.x = -0.15 + Math.sin(andar * 1.4) * 0.12;
      bracoE.current.rotation.x = 0.05;
      pernaE.current.rotation.x = 0;
      pernaD.current.rotation.x = 0;
      return;
    }

    const bola = posicaoDaBola(tempo);
    // quem pega a bola é o jogador do lado (x) em que ela vem
    const minhaBola = Math.sign(base[0]) === Math.sign(bola.x || 1);
    const momentoDoGolpe = lado < 0 ? 0 : 0.5;
    const d = distanciaDoGolpe(bola.t, momentoDoGolpe);

    // desloca acompanhando a bola; o parceiro cobre o meio
    const alvoX = base[0] + (bola.x - base[0]) * (minhaBola ? 0.5 : 0.12);
    corpo.current.position.x += (alvoX - corpo.current.position.x) * 0.06;
    corpo.current.position.z = base[2] + Math.sin(andar * 0.8) * 0.35;

    // passada: pernas e braço livre alternam
    const velocidade = Math.min(Math.abs(alvoX - corpo.current.position.x) * 6, 1);
    const passo = Math.sin(andar * 10) * (0.25 + 0.45 * velocidade);
    pernaE.current.rotation.x = passo;
    pernaD.current.rotation.x = -passo;
    bracoE.current.rotation.x = -passo * 0.7;
    corpo.current.position.y = Math.abs(Math.sin(andar * 10)) * 0.04 * (0.5 + velocidade);

    // golpe: prepara (raquete para trás), bate (para a frente e para cima) e volta à posição de espera
    const espera = -0.55;
    let angulo = espera;
    let giro = 0;
    if (minhaBola && d > -0.3 && d < -JANELA_GOLPE) {
      const p = (d + 0.3) / (0.3 - JANELA_GOLPE);
      angulo = espera + p * 1.5;
      giro = p * 0.5;
    } else if (minhaBola && Math.abs(d) <= JANELA_GOLPE) {
      const p = (d + JANELA_GOLPE) / (2 * JANELA_GOLPE);
      angulo = 0.95 - p * 2.7;
      giro = 0.5 - p * 1.1;
    } else if (minhaBola && d > JANELA_GOLPE && d < 0.25) {
      const p = (d - JANELA_GOLPE) / (0.25 - JANELA_GOLPE);
      angulo = -1.75 + p * (1.75 + espera);
      giro = -0.6 + p * 0.6;
    }
    bracoD.current.rotation.x = angulo;
    tronco.current.rotation.y = giro;
  });

  return (
    <group ref={corpo} position={base}>
      {/* virado para a rede; 1,3x maior que o real para ler bem de longe */}
      <group rotation={[0, lado < 0 ? 0 : Math.PI, 0]} scale={1.3}>
        {[[-0.1, pernaE], [0.1, pernaD]].map(([x, ref]) => (
          <group key={x} ref={ref} position={[x, 0.86, 0]}>
            <mesh geometry={G.perna} position={[0, -0.4, 0]} castShadow>
              <meshStandardMaterial color={pele} roughness={0.8} />
            </mesh>
            <mesh geometry={G.tenis} position={[0, -0.8, 0.04]} castShadow>
              <meshStandardMaterial color="#f4f4f4" roughness={0.6} />
            </mesh>
          </group>
        ))}
        <mesh geometry={G.short} position={[0, 0.86, 0]} castShadow>
          <meshStandardMaterial color={short} roughness={0.8} />
        </mesh>

        <group ref={tronco}>
          <mesh geometry={G.tronco} position={[0, 1.22, 0]} castShadow>
            <meshStandardMaterial color={camisa} roughness={0.7} />
          </mesh>
          <Cabeca pele={pele} cabelo={cabelo} estilo={estilo} bone={camisa} />

          <group ref={bracoE} position={[-0.25, 1.43, 0]} rotation={[0, 0, 0.12]}>
            <mesh geometry={G.braco} position={[0, -0.24, 0]} castShadow>
              <meshStandardMaterial color={pele} roughness={0.8} />
            </mesh>
            <mesh geometry={G.mao} position={[0, -0.48, 0]}>
              <meshStandardMaterial color={pele} roughness={0.8} />
            </mesh>
          </group>

          <group ref={bracoD} position={[0.25, 1.43, 0]} rotation={[-0.55, 0, -0.15]}>
            <mesh geometry={G.braco} position={[0, -0.24, 0]} castShadow>
              <meshStandardMaterial color={pele} roughness={0.8} />
            </mesh>
            <mesh geometry={G.mao} position={[0, -0.48, 0]}>
              <meshStandardMaterial color={pele} roughness={0.8} />
            </mesh>
            <Raquete cores={raquete} />
          </group>
        </group>
      </group>
    </group>
  );
}

function Bola({ variante }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const b = posicaoDaBola(clock.elapsedTime + variante * 1.3);
    ref.current.position.set(b.x, b.y, b.z);
  });
  return (
    <mesh ref={ref} geometry={G.bola} castShadow>
      <meshStandardMaterial color="#d9f24a" emissive="#b6d12a" emissiveIntensity={0.6} />
    </mesh>
  );
}

const POSICOES = [[-2.4, 0, -5.2], [2.4, 0, -5.2], [-2.4, 0, 5.2], [2.4, 0, 5.2]];

export function PartidaEmJogo({ variante = 0 }) {
  return (
    <group position={[0, 0.2, 0]}>
      {POSICOES.map((p, i) => (
        <Jogador key={i} base={p} lado={p[2] < 0 ? -1 : 1} indice={i} variante={variante} emJogo />
      ))}
      <Bola variante={variante} />
    </group>
  );
}

// Turma chegando: espera do lado de fora, junto da porta, já de raquete na mão
export function TurmaChegando({ variante = 0 }) {
  const lugares = [[0, 0, -1.3], [0.7, 0, -0.4], [0, 0, 0.5], [0.8, 0, 1.4]];
  return (
    <group position={[6.4, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {lugares.map((p, i) => (
        <Jogador key={i} base={p} lado={-1} indice={i} variante={variante + 1} emJogo={false} />
      ))}
    </group>
  );
}
