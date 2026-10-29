// A cena: câmera isométrica, sol/céu conforme a hora, cenário, quadras e as etiquetas por cima.
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Vector3 } from 'three';
import { QUADRAS, STATUS, statusDaQuadra } from '../dados.js';
import { luzDoHorario } from './luz.js';
import { Quadra, rotuloDoStatus } from './Quadra.jsx';
import { Ambiente } from './Ambiente.jsx';

const ALTURA_ETIQUETA = 6.5;

const CENTRO_DO_CLUBE = new Vector3(6, 0, 0);

// Pedaço da tela que sobra entre o topo, a linha do tempo e o painel da quadra
function areaLivre(largura, altura) {
  const caixa = (sel) => document.querySelector(sel)?.getBoundingClientRect();
  const topo = caixa('.topo');
  const linha = caixa('.linha');
  const painel = caixa('.painel');
  const painelAoLado = painel && painel.left > largura / 2;
  const painelEmbaixo = painel && !painelAoLado;
  return {
    esquerda: 8,
    direita: painelAoLado ? painel.left - 8 : largura - 8,
    cima: (topo?.bottom ?? 0) + 8,
    baixo: painelEmbaixo ? painel.top - 8 : (linha?.top ?? altura) - 8,
  };
}

// Sem quadra escolhida: enquadra o clube inteiro. Com quadra: voa até ela e
// aproxima, encaixando a quadra no espaço livre ao lado (ou acima) do painel.
function Enquadramento({ selecionada }) {
  const { camera, size, controls } = useThree();
  const animando = useRef(true);
  const primeira = useRef(true);
  const area = useRef(null);
  const alvo = useMemo(() => new Vector3(), []);
  const passo = useMemo(() => new Vector3(), []);
  const eixo = useMemo(() => new Vector3(), []);

  useEffect(() => {
    // depois do commit: o painel da quadra já está na tela para ser medido
    area.current = selecionada ? areaLivre(size.width, size.height) : null;
    animando.current = true;
  }, [selecionada, size.width, size.height]);

  useFrame(() => {
    if (!animando.current || !controls) return;
    const quadra = QUADRAS.find((q) => q.id === selecionada);
    let zoomAlvo = Math.min(size.width / 88, size.height / 66);
    alvo.copy(quadra ? new Vector3(quadra.x, 0, quadra.z) : CENTRO_DO_CLUBE);
    if (quadra && area.current) {
      const a = area.current;
      // a quadra em perspectiva isométrica ocupa ~22 x 15 unidades na tela
      zoomAlvo = Math.max(Math.min((a.direita - a.esquerda) / 22, (a.baixo - a.cima) / 15), zoomAlvo);
      const dx = (a.esquerda + a.direita) / 2 - size.width / 2;
      const dy = (a.cima + a.baixo) / 2 - size.height / 2;
      alvo.addScaledVector(eixo.setFromMatrixColumn(camera.matrixWorld, 0), -dx / zoomAlvo);
      alvo.addScaledVector(eixo.setFromMatrixColumn(camera.matrixWorld, 1), dy / zoomAlvo);
    }
    const suavidade = primeira.current ? 1 : 0.09;
    primeira.current = false;
    passo.copy(alvo).sub(controls.target).multiplyScalar(suavidade);
    controls.target.add(passo);
    camera.position.add(passo);
    camera.zoom += (zoomAlvo - camera.zoom) * suavidade;
    camera.updateProjectionMatrix();
    controls.update();
    if (passo.length() < 0.005 && Math.abs(zoomAlvo - camera.zoom) < 0.005) animando.current = false;
  });
  return null;
}

function Iluminacao({ luz }) {
  return (
    <>
      <color attach="background" args={[luz.ceu]} />
      <fog attach="fog" args={[luz.ceu, 140, 260]} />
      <hemisphereLight args={[luz.ceu, '#4a4237', luz.ambiente]} />
      <directionalLight
        position={luz.posicaoSol}
        intensity={luz.sol}
        color={luz.corSol}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={200}
        shadow-bias={-0.0005}
      />
    </>
  );
}

// Etiquetas são HTML comum numa camada por cima do canvas (o <Html> da drei
// perde etiqueta no React 19). Aqui só projetamos a posição de cada quadra a cada frame.
function ProjetorDeEtiquetas({ ancoras }) {
  const v = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const q of QUADRAS) {
      const el = ancoras.current[q.id];
      if (!el) continue;
      v.set(q.x, ALTURA_ETIQUETA, q.z).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  });
  return null;
}

export function Clube({ minuto, reservas, selecionada, onSelecionar }) {
  const luz = useMemo(() => luzDoHorario(minuto), [minuto]);
  const status = QUADRAS.map((q) => statusDaQuadra(q, reservas, minuto));
  const ancoras = useRef({});

  return (
    <div className="cena">
      <Canvas shadows dpr={[1, 2]} onPointerMissed={() => onSelecionar(null)}>
        <OrthographicCamera makeDefault position={[55, 48, 55]} near={-200} far={400} />
        <OrbitControls
          makeDefault
          target={[6, 0, 0]}
          enableDamping
          minPolarAngle={0.45}
          maxPolarAngle={1.15}
          minZoom={4}
          maxZoom={40}
          screenSpacePanning
        />
        <Iluminacao luz={luz} />
        <Ambiente luz={luz} />
        {QUADRAS.map((q, i) => (
          <Quadra
            key={q.id}
            quadra={q}
            status={status[i]}
            refletores={luz.refletores}
            selecionada={selecionada === q.id}
            onSelecionar={onSelecionar}
          />
        ))}
        <Enquadramento selecionada={selecionada} />
        <ProjetorDeEtiquetas ancoras={ancoras} />
      </Canvas>

      <div className="etiquetas">
        {QUADRAS.map((q, i) => (
          <div key={q.id} className="ancora" ref={(el) => { ancoras.current[q.id] = el; }}>
            <button
              type="button"
              className={`etiqueta ${selecionada === q.id ? 'ativa' : ''}`}
              style={{ '--cor': STATUS[status[i].tipo].cor }}
              onClick={() => onSelecionar(q.id)}
              aria-label={`${q.nome}: ${STATUS[status[i].tipo].rotulo}`}
            >
              <span className="etiqueta-num">{q.id}</span>
              <span className="etiqueta-texto">
                <strong>{STATUS[status[i].tipo].rotulo}</strong>
                <small>{rotuloDoStatus(status[i])}</small>
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
