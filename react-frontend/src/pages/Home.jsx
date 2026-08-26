import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe, Layers, Image, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [backendStats, setBackendStats] = useState(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setBackendStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  // Three.js interactive nodes background hook
  useEffect(() => {
    let isMounted = true;
    let renderer, scene, camera, animationFrameId;
    let robotGroup, head, visor, visorMat, flare, sceneContent, tip, core;
    let mixer, gltfAnimations;
    let threeCleanUp = null;

    const initThree = () => {
      const container = document.getElementById('three-bg-container');
      if (!container) return;

      const THREE = window.THREE;
      if (!THREE) return;

      const createTextTexture = (text, textColor, fontStyle = 'bold 36px sans-serif') => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 64);
        ctx.font = fontStyle;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = textColor;
        ctx.shadowBlur = 6;
        ctx.fillText(text, 128, 32);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
      };

      const width = container.clientWidth;
      const height = container.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const clock = new THREE.Clock();

      // Create a master group for interactive rotations
      sceneContent = new THREE.Group();
      scene.add(sceneContent);

      // Add lights (Specular Phong setup)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      sceneContent.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4);
      directionalLight.position.set(5, 5, 5);
      sceneContent.add(directionalLight);

      const pointLight = new THREE.PointLight(0x818cf8, 2.5, 15);
      pointLight.position.set(0, 0.5, 2.0);
      sceneContent.add(pointLight);

      // --- FUTURISTIC SENTINEL ROBOT (Procedural model) ---
      robotGroup = new THREE.Group();
      robotGroup.position.set(0, -0.4, 0); // Positioned in the center
      robotGroup.scale.set(1.8, 1.8, 1.8); // Scaled up
      sceneContent.add(robotGroup);

      // 1. Neck joint
      const neckGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.2, 16);
      const neckMat = new THREE.MeshPhongMaterial({ color: 0x334155, shininess: 80 });
      const neck = new THREE.Mesh(neckGeom, neckMat);
      neck.position.set(0, 0.12, 0);
      robotGroup.add(neck);

      // 2. Torso / Chest casing
      const torsoGeom = new THREE.BoxGeometry(0.9, 0.6, 0.6);
      const torsoMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 80, specular: 0x475569 });
      const torso = new THREE.Mesh(torsoGeom, torsoMat);
      torso.position.set(0, -0.25, 0);
      robotGroup.add(torso);

      // 3. Glowing chest core
      const coreGeom = new THREE.SphereGeometry(0.12, 16, 16);
      core = new THREE.Mesh(coreGeom, new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 }));
      core.position.set(0, -0.22, 0.31);
      robotGroup.add(core);

      // 4. Side floating wings
      const leftWingGeom = new THREE.BoxGeometry(0.1, 0.5, 0.35);
      const wingMat = new THREE.MeshPhongMaterial({ color: 0x334155, shininess: 75, specular: 0x475569 });
      const leftWing = new THREE.Mesh(leftWingGeom, wingMat);
      leftWing.position.set(-0.55, -0.2, 0.05);
      leftWing.rotation.set(0, 0.1, -0.15);
      robotGroup.add(leftWing);

      const rightWing = new THREE.Mesh(leftWingGeom, wingMat);
      rightWing.position.set(0.55, -0.2, 0.05);
      rightWing.rotation.set(0, -0.1, 0.15);
      robotGroup.add(rightWing);

      // 5. Lower propulsion pod
      const podGeom = new THREE.CylinderGeometry(0.3, 0.08, 0.5, 4, 1);
      const podMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 80 });
      const pod = new THREE.Mesh(podGeom, podMat);
      pod.position.set(0, -0.7, 0);
      robotGroup.add(pod);

      // 6. Thruster nozzle
      const nozzleGeom = new THREE.CylinderGeometry(0.1, 0.14, 0.12, 16);
      const nozzleMat = new THREE.MeshPhongMaterial({ color: 0x475569, shininess: 100 });
      const nozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
      nozzle.position.set(0, -0.95, 0);
      robotGroup.add(nozzle);

      // 7. Thruster flame and outer plasma flare
      const tipGeom = new THREE.ConeGeometry(0.08, 0.25, 16);
      tip = new THREE.Mesh(tipGeom, new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.9 }));
      tip.position.set(0, -1.1, 0);
      tip.rotation.x = Math.PI;
      robotGroup.add(tip);

      const flareGeom = new THREE.ConeGeometry(0.15, 0.45, 16);
      flare = new THREE.Mesh(flareGeom, new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 }));
      flare.position.set(0, -1.2, 0);
      flare.rotation.x = Math.PI;
      robotGroup.add(flare);

      // 8. Head Group for cursor tracking
      head = new THREE.Group();
      head.position.set(0, 0.5, 0);
      robotGroup.add(head);

      // Head casing
      const headCasingGeom = new THREE.BoxGeometry(0.8, 0.6, 0.6);
      const headCasingMat = new THREE.MeshPhongMaterial({ color: 0x1e293b, shininess: 100, specular: 0x64748b });
      const headCasing = new THREE.Mesh(headCasingGeom, headCasingMat);
      head.add(headCasing);

      // Face Glass Screen
      const faceScreenGeom = new THREE.PlaneGeometry(0.7, 0.5);
      const faceScreenMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, shininess: 120 });
      const faceScreen = new THREE.Mesh(faceScreenGeom, faceScreenMat);
      faceScreen.position.set(0, 0, 0.301);
      head.add(faceScreen);

      // Visor Eye (Laser start point)
      const visorGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 32);
      visorGeom.rotateX(Math.PI / 2);
      visorMat = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.0, shininess: 100 });
      visor = new THREE.Mesh(visorGeom, visorMat);
      visor.position.set(0, 0, 0.33);
      head.add(visor);

      // Antennas
      const antBaseGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
      const antBaseMat = new THREE.MeshPhongMaterial({ color: 0x475569, shininess: 85 });

      const antLeft = new THREE.Mesh(antBaseGeom, antBaseMat);
      antLeft.position.set(-0.25, 0.4, 0);
      antLeft.rotation.z = 0.1;
      head.add(antLeft);

      const antRight = new THREE.Mesh(antBaseGeom, antBaseMat);
      antRight.position.set(0.25, 0.4, 0);
      antRight.rotation.z = -0.1;
      head.add(antRight);

      const sphereTipGeom = new THREE.SphereGeometry(0.05, 8, 8);
      const sphereTipMat = new THREE.MeshPhongMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.5 });

      const tipLeft = new THREE.Mesh(sphereTipGeom, sphereTipMat);
      tipLeft.position.set(-0.26, 0.53, 0);
      head.add(tipLeft);

      const tipRight = new THREE.Mesh(sphereTipGeom, sphereTipMat);
      tipRight.position.set(0.26, 0.53, 0);
      head.add(tipRight);

      // Ear plates
      const earGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
      earGeom.rotateZ(Math.PI / 2);
      const earMat = new THREE.MeshPhongMaterial({ color: 0x334155, shininess: 80 });

      const earLeft = new THREE.Mesh(earGeom, earMat);
      earLeft.position.set(-0.41, 0, 0);
      head.add(earLeft);

      const earRight = new THREE.Mesh(earGeom, earMat);
      earRight.position.set(0.41, 0, 0);
      head.add(earRight);


      // Interactive mouse variables
      let mouseX = 0, mouseY = 0;
      let targetX = 0, targetY = 0;
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let clickAnimTime = 0;
      let clickAnimType = "";

      const handleMouseDown = (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const handleMouseMoveGlobal = (e) => {
        const rect = container.getBoundingClientRect();
        const currentMouseX = ((e.clientX - rect.left) / width) * 2 - 1;
        const currentMouseY = -((e.clientY - rect.top) / height) * 2 + 1;

        mouseX = currentMouseX;
        mouseY = currentMouseY;

        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          sceneContent.rotation.y += deltaX * 0.007;
          sceneContent.rotation.x += deltaY * 0.007;
        }

        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      // Click event for interactive expressions / animations
      const handleCanvasClick = () => {
        const time = Date.now() * 0.001;
        // Limit animation triggers if one is already active in its first second
        if (clickAnimType && (time - clickAnimTime < 1.2)) return;

        const anims = ["spin", "nod", "pulse", "surge"];
        clickAnimType = anims[Math.floor(Math.random() * anims.length)];
        clickAnimTime = time;
      };

      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('click', handleCanvasClick);

      const animate = () => {
        if (!isMounted) return;
        animationFrameId = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;
        const deltaTime = clock.getDelta();

        // Robot idle hover and slight rocking
        robotGroup.position.y = -0.3 + Math.sin(time * 1.5) * 0.12;
        robotGroup.position.x = Math.cos(time * 0.7) * 0.05;
        robotGroup.rotation.z = Math.sin(time * 1.2) * 0.03;

        // Smooth mouse target tracking for the robot head
        targetX += (mouseX - targetX) * 0.07;
        targetY += (mouseY - targetY) * 0.07;

        // Reset click animation effects to default scales and states
        robotGroup.scale.set(1.8, 1.8, 1.8);
        if (flare) flare.scale.set(1.0, 1.0, 1.0);

        // Apply programmatic click animations
        const animElapsed = time - clickAnimTime;
        let headRotY = targetX * 0.55;
        let headRotX = -targetY * 0.35;
        let flashColor = false;

        if (clickAnimType && animElapsed < 1.2) {
          const t = animElapsed / 1.2;
          if (clickAnimType === "spin") {
            headRotY += t * Math.PI * 2;
          } else if (clickAnimType === "nod") {
            headRotX += Math.sin(t * Math.PI * 4) * 0.25;
          } else if (clickAnimType === "pulse") {
            const s = 1.8 + Math.sin(t * Math.PI) * 0.25;
            robotGroup.scale.set(s, s, s);
          } else if (clickAnimType === "surge") {
            if (flare) {
              const flareScaleY = 1.0 + Math.sin(time * 40) * 0.5;
              const flareScaleXZ = 1.0 + Math.cos(time * 40) * 0.3;
              flare.scale.set(flareScaleXZ, flareScaleY, flareScaleXZ);
            }
            flashColor = Math.sin(time * 25) > 0;
          }
        }

        if (head) {
          head.rotation.y = headRotY;
          head.rotation.x = headRotX;
        }

        // Pulse the general rocket exhaust flame scale gently
        if (!clickAnimType || clickAnimType !== "surge") {
          const baseFlameScale = 1.0 + Math.sin(time * 12) * 0.1;
          if (flare) flare.scale.set(baseFlameScale, baseFlameScale, baseFlameScale);
          if (tip) tip.scale.set(baseFlameScale, baseFlameScale, baseFlameScale);
        }

        // Cycle through fact checking states (every 4 seconds)
        // 0-2s: Verified Real (Green), 2-4s: Fake Detected (Red)
        const cycle = Math.floor(time / 4.0) % 2;
        let colorTarget = cycle === 0 ? 0x10b981 : 0xef4444; // green vs red
        if (flashColor) {
          colorTarget = 0xffffff; // white surge flash
        }

        // Apply dynamic color targets to scanning nodes
        if (visor && visor.material) visor.material.color.setHex(colorTarget);
        if (tip && tip.material) tip.material.color.setHex(colorTarget);
        if (core && core.material) core.material.color.setHex(colorTarget);



        // Force matrix update on world elements to get correct coordinates for laser start
        robotGroup.updateMatrixWorld(true);

        // Update Laser Beam to connect Visor and Document exactly
        const visorWorldPos = new THREE.Vector3();
        if (visor) {
          visor.getWorldPosition(visorWorldPos);
        } else {
          visorWorldPos.set(1.1, 0.13, 0.3);
        }


        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !camera || !renderer) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('click', handleCanvasClick);
        cancelAnimationFrame(animationFrameId);
        if (renderer) renderer.dispose();
      };
    };

    const loadScript = (url, checkGlobal) => {
      return new Promise((resolve) => {
        if (checkGlobal === 'THREE' && window.THREE) {
          resolve();
          return;
        }
        if (checkGlobal === 'THREE.GLTFLoader' && window.THREE && window.THREE.GLTFLoader) {
          resolve();
          return;
        }

        let script = document.querySelector(`script[src="${url}"]`);
        if (!script) {
          script = document.createElement('script');
          script.src = url;
          script.async = true;
          document.body.appendChild(script);
        }

        const handleLoad = () => {
          resolve();
        };

        script.addEventListener('load', handleLoad);
      });
    };

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE')
      .then(() => loadScript('https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js', 'THREE.GLTFLoader'))
      .then(() => {
        if (isMounted) {
          threeCleanUp = initThree();
        }
      });

    return () => {
      isMounted = false;
      if (threeCleanUp) {
        threeCleanUp();
      }
    };
  }, []);

  const features = [
    {
      icon: <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: t('multilingualTitle'),
      description: t('multilingualDesc'),
      color: 'from-indigo-500 to-indigo-400',
    },
    {
      icon: <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: t('multiDomainTitle'),
      description: t('multiDomainDesc'),
      color: 'from-indigo-500 to-indigo-400',
    },
    {
      icon: <Image className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: t('multiModalTitle'),
      description: t('multiModalDesc'),
      color: 'from-indigo-500 to-indigo-400',
    },
  ];

  const steps = [
    { number: '1', title: t('step1Title'), description: t('step1Desc') },
    { number: '2', title: t('step3Title'), description: t('step3Desc') },
    { number: '3', title: t('step4Title'), description: t('step4Desc') },
  ];


  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/20 to-violet-50/20 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950 border-b border-slate-100 dark:border-slate-900 py-16 md:py-24">
        {/* Animated grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Text Column */}
            <div className="lg:col-span-7 text-start space-y-6 pointer-events-none select-none">

              <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {t('heroTitlePrefix') && <>{t('heroTitlePrefix')}{' '}</>}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-[length:200%_auto] animate-text-gradient-flow bg-clip-text text-transparent">
                  {t('heroTitleHighlighted')}
                </span>
                {t('heroTitleSuffix') && <>{' '}{t('heroTitleSuffix')}</>}
              </h1>
              <p className="text-lg text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-4 pointer-events-auto">
                <Link
                  to="/analyzer"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  {/* Hover shimmer reflection */}
                  <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {t('verifyNow')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
                <Link
                  to="/about"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all text-center relative overflow-hidden group"
                >
                  {/* Subtle hover shine for secondary button */}
                  <span className="absolute inset-0 w-full h-full bg-slate-100/50 dark:bg-slate-800/50 transform -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none"></span>
                  <span className="relative z-10">{t('navAbout')}</span>
                </Link>
              </div>
            </div>

            {/* Right 3D Column */}
            <div className="lg:col-span-5 h-[280px] md:h-[350px] relative">
              <div id="three-bg-container" className="absolute inset-0 w-full h-full pointer-events-auto"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-500 animate-fade-in-up animate-float-slow"
                style={{ 
                  animationDelay: `${(idx + 1) * 100}ms`,
                  animationDuration: `${6 + idx * 2}s`
                }}
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center mb-6 relative mx-auto md:mx-0">
                  {feat.icon}
                  <div className="absolute inset-0 rounded-full animate-pulse-ring-slow border-2 border-indigo-500/20 opacity-0 group-hover:opacity-100"></div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-center md:text-left">{feat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed text-center md:text-left">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-display font-black text-center text-slate-900 dark:text-white mb-16">
            {t('howItWorks')}
          </h2>
          <div className="relative max-w-4xl mx-auto">
            {/* Horizontal line for desktop, vertical line for mobile */}
            <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-indigo-100 dark:bg-indigo-950/40 z-0"></div>
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center group animate-fade-in-up"
                  style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-full border-2 border-indigo-600 bg-white dark:bg-slate-950 flex items-center justify-center font-bold text-lg text-indigo-600 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>





    </div>
  );
}
