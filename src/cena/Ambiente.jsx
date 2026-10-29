// Cenário do clube: chão, calçadas, sede com terraço, árvores, mureta e postes.
// As quadras (x = -13, 0, 13; z = -12, 12; 11.2 x 21.2 cada) ficam livres.
import { useMemo } from 'react';

const COR_CHAO = '#cfc8ba';
const COR_CALCADA = '#a9a294';
const COR_DECK = '#a8835c';
const COR_LAMPADA = '#ffe2a8';
const COR_VIDRO_NOITE = '#ffc78a';

// Terreno: x de -52 a 58, z de -40 a 40
const TERRENO = { x: 3, largura: 110, profundidade: 80 };

function Chao() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[TERRENO.x, 0, 0]} receiveShadow>
      <planeGeometry args={[TERRENO.largura, TERRENO.profundidade]} />
      <meshStandardMaterial color={COR_CHAO} roughness={0.95} />
    </mesh>
  );
}

// Faixas de calçada: [x, z, largura em x, profundidade em z]
const CALCADAS = [
  [1, 0, 46, 2], // corredor central entre as fileiras
  [-6.5, 0, 1.6, 46], // entre quadras 1-2 e 4-5
  [6.5, 0, 1.6, 46], // entre quadras 2-3 e 5-6
  [0, -24, 42, 2.4], // fundo
  [0, 24, 42, 2.4], // frente
  [-20, 0, 2.4, 50], // lateral esquerda
  [20.2, 0, 2.4, 50], // lateral direita, chega no terraço
];

function Calcadas() {
  return (
    <group>
      {CALCADAS.map(([x, z, l, p], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012 + i * 0.0005, z]} receiveShadow>
          <planeGeometry args={[l, p]} />
          <meshStandardMaterial color={COR_CALCADA} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Mesa({ posicao, corOmbrelone }) {
  return (
    <group position={posicao}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 16]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.75, 8]} />
        <meshStandardMaterial color="#2a2d33" />
      </mesh>
      {/* ombrelone */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 2.2, 6]} />
        <meshStandardMaterial color="#2a2d33" />
      </mesh>
      <mesh position={[0, 2.45, 0]} castShadow>
        <coneGeometry args={[1.25, 0.5, 8]} />
        <meshStandardMaterial color={corOmbrelone} roughness={0.7} flatShading />
      </mesh>
      {/* bancos */}
      {[[-0.95, 0], [0.95, 0], [0, -0.95], [0, 0.95]].map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 0.25, bz]} castShadow>
          <boxGeometry args={[0.38, 0.5, 0.38]} />
          <meshStandardMaterial color="#3a3f48" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

const MESAS = [
  [[23.2, 0.15, -6], '#f25f3a'],
  [[24.8, 0.15, -3], '#d9f24a'],
  [[23.2, 0.15, 0], '#16a36b'],
  [[24.8, 0.15, 3], '#f25f3a'],
  [[23.2, 0.15, 6], '#ffcf3d'],
];

function Sede({ noite }) {
  const frenteX = 26.5;
  return (
    <group>
      {/* terraço de madeira */}
      <mesh position={[24, 0.075, 0]} receiveShadow castShadow>
        <boxGeometry args={[5, 0.15, 16]} />
        <meshStandardMaterial color={COR_DECK} roughness={0.85} />
      </mesh>
      {MESAS.map(([p, cor], i) => (
        <Mesa key={i} posicao={p} corOmbrelone={cor} />
      ))}

      {/* corpo do prédio */}
      <mesh position={[31, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 4, 18]} />
        <meshStandardMaterial color="#ece6da" roughness={0.9} />
      </mesh>
      {/* telhado plano saliente */}
      <mesh position={[30.6, 4.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[10.4, 0.35, 19.4]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.7} />
      </mesh>
      {/* faixa verde-limão na borda do telhado */}
      <mesh position={[25.42, 4.17, 0]}>
        <boxGeometry args={[0.06, 0.2, 19.4]} />
        <meshStandardMaterial color="#d9f24a" emissive="#b6d12a" emissiveIntensity={noite ? 0.8 : 0.15} />
      </mesh>

      {/* fachada de vidro voltada para as quadras */}
      <mesh position={[frenteX - 0.04, 1.65, 0]}>
        <boxGeometry args={[0.08, 2.9, 16]} />
        <meshStandardMaterial
          color="#9fc6d9"
          roughness={0.15}
          metalness={0.2}
          emissive={COR_VIDRO_NOITE}
          emissiveIntensity={noite ? 1.3 : 0}
        />
      </mesh>
      {/* montantes da fachada */}
      {Array.from({ length: 9 }, (_, i) => -8 + i * 2).map((z) => (
        <mesh key={z} position={[frenteX - 0.1, 1.65, z]} castShadow>
          <boxGeometry args={[0.12, 2.9, 0.1]} />
          <meshStandardMaterial color="#1f2228" />
        </mesh>
      ))}
      {/* porta */}
      <mesh position={[frenteX - 0.12, 1.15, 0]}>
        <boxGeometry args={[0.06, 2.3, 1.8]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.5} />
      </mesh>

      {/* luz quente do terraço à noite */}
      <pointLight position={[24, 3.2, 0]} color={COR_VIDRO_NOITE} intensity={noite ? 40 : 0} distance={16} decay={2} />
    </group>
  );
}

// Posições fixas das árvores na borda do terreno (fora das quadras e da sede)
function posicoesArvores() {
  const lista = [];
  for (let x = -44; x <= 40; x += 12) {
    lista.push([x, -33.5]);
    lista.push([x + 4, 33.5]);
  }
  for (const z of [-18, 0, 18]) lista.push([-44, z]);
  for (const z of [-26, 26]) lista.push([45, z]);
  return lista; // 21 árvores
}

// Pseudoaleatório determinístico: a maquete sai igual em toda recarga
const acaso = (n) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

function Arvore({ posicao, semente }) {
  const escala = 0.8 + acaso(semente) * 0.6;
  const conica = acaso(semente + 7) > 0.55;
  const verde = ['#4f8a4a', '#5f9a52', '#3f7a45', '#6aa35a'][Math.floor(acaso(semente + 3) * 4)];
  return (
    <group position={[posicao[0], 0, posicao[1]]} scale={escala} rotation={[0, acaso(semente + 11) * Math.PI, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 1.8, 6]} />
        <meshStandardMaterial color="#6b4a33" roughness={0.9} />
      </mesh>
      {conica ? (
        <mesh position={[0, 3.1, 0]} castShadow>
          <coneGeometry args={[1.5, 3.4, 7]} />
          <meshStandardMaterial color={verde} roughness={0.85} flatShading />
        </mesh>
      ) : (
        <mesh position={[0, 3, 0]} castShadow>
          <icosahedronGeometry args={[1.6, 0]} />
          <meshStandardMaterial color={verde} roughness={0.85} flatShading />
        </mesh>
      )}
    </group>
  );
}

function Mureta() {
  // x de -50 a 56, z de -38 a 38
  const altura = 0.6;
  const lados = [
    [3, -38, 106, 0.3],
    [3, 38, 106, 0.3],
    [-50, 0, 0.3, 76],
    [56, 0, 0.3, 76],
  ];
  return (
    <group>
      {lados.map(([x, z, l, p], i) => (
        <mesh key={i} position={[x, altura / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[l, altura, p]} />
          <meshStandardMaterial color="#b9b2a4" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

const POSTES_X = [-19.5, -6.5, 6.5, 19.5];

function Postes({ noite }) {
  return (
    <group>
      {POSTES_X.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 3.2, 8]} />
            <meshStandardMaterial color="#23262c" />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <sphereGeometry args={[0.22, 12, 10]} />
            <meshStandardMaterial
              color={noite ? '#fff3d6' : '#d8d4cc'}
              emissive={COR_LAMPADA}
              emissiveIntensity={noite ? 3 : 0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Ambiente({ luz }) {
  const noite = Boolean(luz?.refletores);
  const arvores = useMemo(posicoesArvores, []);
  return (
    <group>
      <Chao />
      <Calcadas />
      <Mureta />
      <Sede noite={noite} />
      <Postes noite={noite} />
      {arvores.map((p, i) => (
        <Arvore key={i} posicao={p} semente={i + 1} />
      ))}
    </group>
  );
}
