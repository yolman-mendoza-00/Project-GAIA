// src/components/PlanetViewer.jsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three-stdlib';

const PlanetViewer = ({ percentage }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Escena y cámara
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // Estilos del renderer para llenar el contenedor
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    containerRef.current.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 5.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 9.4;

    // Cargar modelo según porcentaje
    const loader = new FBXLoader();
    let planet = null;

    const getModelPath = () => {
      if (percentage < 25) return '/models/Planeta_4.fbx';
      if (percentage < 50) return '/models/Planeta_3.fbx';
      if (percentage < 75) return '/models/Planeta_2.fbx';
      return '/models/Planeta_1.fbx';
    };

    loader.load(
      getModelPath(),
      (fbx) => {
        planet = fbx;
        planet.scale.set(0.1, 0.1, 0.1);
        planet.position.set(0, 0, 0);
        scene.add(planet);
      },
      undefined,
      (error) => {
        console.error('Error cargando el modelo:', error);
      }
    );

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      if (planet) planet.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    };
  }, [percentage]);

  // Contenedor responsive
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',      // Tamaño máximo
        aspectRatio: '1',       // Mantener forma cuadrada
        margin: '',       // Centrado
      }}
    />
  );
};

export default PlanetViewer;
