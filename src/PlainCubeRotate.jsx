import { useEffect, useRef } from "react";
import * as THREE from "three";

const PlainCubeRotate = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1021);
    scene.fog = new THREE.Fog(0x0b1021, 8, 22);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(3.2, 2.8, 6.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6f543a,
      roughness: 0.46,
      metalness: 0.22,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    scene.add(cube);

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xf6e7c8 });
    const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    cube.add(edges);

    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.35 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    const keyLight = new THREE.DirectionalLight(0xfff3df, 1.1);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8fc8ff, 0.55);
    fillLight.position.set(-6, 4, -3);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const clock = new THREE.Clock();
    const cameraBase = new THREE.Vector3(3.2, 2.8, 6.4);
    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      cube.rotation.x = t * 0.55;
      cube.rotation.y = t * 0.78;
      cube.rotation.z = Math.sin(t * 0.7) * 0.08 + pointerCurrent.x * 0.14;
      cube.position.x = pointerCurrent.x * 0.22;
      cube.position.y = Math.sin(t * 1.5) * 0.34 + pointerCurrent.y * 0.1;

      plane.material.opacity = 0.18 + (1 - (cube.position.y + 0.34) / 0.68) * 0.25;

      pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.07;
      pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.07;
      camera.position.x = cameraBase.x + pointerCurrent.x * 1.15;
      camera.position.y = cameraBase.y + pointerCurrent.y * 0.65;
      camera.position.z = cameraBase.z - pointerCurrent.x * 0.45;

      camera.lookAt(0, cube.position.y * 0.2, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointerTarget.x = (x - 0.5) * 2.2;
      pointerTarget.y = -(y - 0.5) * 2.2;
    };

    const resetPointer = () => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    window.addEventListener("resize", handleResize);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", resetPointer);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", resetPointer);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      edgeGeometry.dispose();
      edgeMaterial.dispose();
      planeGeometry.dispose();
      planeMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background:
          "radial-gradient(circle at 20% 20%, #1a2749 0%, #0b1021 45%, #05070f 100%)",
      }}
    >
      <header
        style={{
          position: "absolute",
          top: "20px",
          width: "100%",
          textAlign: "center",
          zIndex: 10,
          animation: "fadeInDown 1s ease-out",
          paddingInline: "12px",
        }}
      >
        <h1
          style={{
            margin: 0,
            color: "#f4e8d2",
            fontSize: "clamp(1.5rem, 4.5vw, 2.7rem)",
            letterSpacing: "2px",
            fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
            textShadow: "0 2px 12px rgba(0, 0, 0, 0.45)",
          }}
        >
          Rotating Cube
        </h1>

        <style>
          {`
            @keyframes fadeInDown {
              from { opacity: 0; transform: translateY(-30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </header>

      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default PlainCubeRotate;