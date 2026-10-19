/**
 * Codi AI — Interactive 3D Mascot Character (Procedural Three.js)
 * Supports multiple viewports: Landing Hero & Chat Workspace Companion
 * Real-time smooth multi-harmonic speech animations, lip-sync mouth morphing,
 * conversational head gestures, antenna vocal waveforms, and teacher theme personalization.
 */

(function () {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded.');
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Shared Procedural Vertical Gradient Texture (Exact Codi Logo Palette)
  function createSmoothBodyGradient() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.00, '#A78BFA'); // soft glowing crown highlight
    grad.addColorStop(0.12, '#8E70FF'); // logo crown violet
    grad.addColorStop(0.44, '#6C4CF1'); // primary Codi purple (signature brand color)
    grad.addColorStop(0.76, '#4B2EC7'); // deep purple base (matches logo side pods)
    grad.addColorStop(1.00, '#24106E'); // deep shadow underside
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  const sharedBodyGradientTexture = createSmoothBodyGradient();

  // Registry of all active 3D character instances
  const activeInstances = [];
  let globalCharacterState = 'idle';
  let globalTeacherTheme = 'math';

  // 2. Factory: Create 3D Codi Instance
  function createCodiInstance(container, isWorkspace = false) {
    if (!container) return null;

    // A. Responsive Layout Configuration
    function getLayout() {
      const width = container.clientWidth || (isWorkspace ? 86 : 300);
      const height = container.clientHeight || (isWorkspace ? 86 : 300);

      if (isWorkspace) {
        // Workspace avatar stage: tight, crisp framing, antenna and chin fully visible
        const isCompact = container.closest('.is-compact') !== null;
        return {
          isWorkspace: true,
          scale: isCompact ? 0.90 : 0.96,
          cameraZ: isCompact ? 6.8 : 6.5,
          baseY: -0.16,
          targetRotXMult: 0.16,
          targetRotYMult: 0.28
        };
      }

      // Landing page hero stage
      const windowWidth = window.innerWidth;
      const isMobile = windowWidth <= 768;
      const isTablet = windowWidth > 768 && windowWidth <= 1024;

      if (isMobile) {
        return {
          isWorkspace: false,
          scale: 0.88,
          cameraZ: 8.0,
          baseY: -0.70,
          targetRotXMult: 0.12,
          targetRotYMult: 0.20
        };
      } else if (isTablet) {
        return {
          isWorkspace: false,
          scale: 0.80,
          cameraZ: 8.2,
          baseY: -0.28,
          targetRotXMult: 0.16,
          targetRotYMult: 0.28
        };
      } else {
        return {
          isWorkspace: false,
          scale: 0.82,
          cameraZ: 8.2,
          baseY: -0.24,
          targetRotXMult: 0.18,
          targetRotYMult: 0.32
        };
      }
    }

    let currentLayout = getLayout();

    // B. Scene & Camera Setup
    const scene = new THREE.Scene();
    const initialWidth = container.clientWidth || (isWorkspace ? 86 : 300);
    const initialHeight = container.clientHeight || (isWorkspace ? 86 : 300);

    const camera = new THREE.PerspectiveCamera(
      isWorkspace ? 34 : 36,
      initialWidth / initialHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, currentLayout.cameraZ);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to SVG:', e);
      const fallback = container.parentElement ? container.parentElement.querySelector('.workspace-codi-avatar-fallback') : null;
      if (fallback) fallback.classList.add('show-fallback');
      return null;
    }

    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isWorkspace ? 1.25 : 1.15;
    container.appendChild(renderer.domElement);

    // C. Group for entire Codi character
    const codiGroup = new THREE.Group();
    codiGroup.position.set(0, currentLayout.baseY, 0);
    codiGroup.scale.set(currentLayout.scale, currentLayout.scale, currentLayout.scale);
    scene.add(codiGroup);

    // D. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x382276, isWorkspace ? 2.2 : 1.8);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0xD6C8FF, 2.0);
    topLight.position.set(0, 5.0, 1.5);
    scene.add(topLight);

    const keyLight = new THREE.DirectionalLight(0xEAE4FF, 1.2);
    keyLight.position.set(1.5, 2.5, 4.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8E70FF, 1.1);
    fillLight.position.set(-3.2, 1.0, 2.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x754EFF, 2.8);
    rimLight.position.set(0, -2.0, -3.5);
    scene.add(rimLight);

    // E. Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      map: sharedBodyGradientTexture,
      color: 0xFFFFFF,
      roughness: 0.38,
      metalness: 0.0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.22,
      sheen: new THREE.Color(0x9E7EFF),
      sheenRoughness: 0.40,
      emissive: 0x221155,
      emissiveIntensity: 0.25
    });

    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x0A0814,
      roughness: 0.60,
      metalness: 0.05
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x7DF9FF,
      emissive: 0x7DF9FF,
      emissiveIntensity: 1.4,
      roughness: 0.15
    });

    const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    const blushMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF8EC7,
      transparent: true,
      opacity: 0.65
    });

    const smileMaterial = new THREE.MeshStandardMaterial({
      color: 0xC9B8FF,
      emissive: 0xC9B8FF,
      emissiveIntensity: 1.6,
      roughness: 0.1
    });

    const earPodMaterial = new THREE.MeshStandardMaterial({
      color: 0x4B2EC7,
      roughness: 0.30,
      metalness: 0.25
    });

    const glowAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xC9B8FF,
      emissiveIntensity: 2.8,
      roughness: 0.08
    });

    // F. Geometries & Assembly
    // 1. Head
    const headGeo = new THREE.SphereGeometry(1.62, 48, 36);
    headGeo.scale(1.16, 1.08, 1.02);

    const hPos = headGeo.attributes.position;
    for (let i = 0; i < hPos.count; i++) {
      const x = hPos.getX(i);
      const y = hPos.getY(i);
      const z = hPos.getZ(i);
      if (z > 0.3) {
        const rx = x / 1.35;
        const ry = y / 0.85;
        const distSq = rx * rx + ry * ry;
        if (distSq < 1.0) {
          const factor = 1.0 - distSq;
          hPos.setZ(i, z - factor * 0.32);
        }
      }
    }
    headGeo.computeVertexNormals();
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    codiGroup.add(headMesh);

    // 2. Visor Screen
    const visorShape = new THREE.Shape();
    const vw = 2.15, vh = 1.25, vr = 0.52;
    visorShape.moveTo(-vw / 2 + vr, -vh / 2);
    visorShape.lineTo(vw / 2 - vr, -vh / 2);
    visorShape.quadraticCurveTo(vw / 2, -vh / 2, vw / 2, -vh / 2 + vr);
    visorShape.lineTo(vw / 2, vh / 2 - vr);
    visorShape.quadraticCurveTo(vw / 2, vh / 2, vw / 2 - vr, vh / 2);
    visorShape.lineTo(-vw / 2 + vr, vh / 2);
    visorShape.quadraticCurveTo(-vw / 2, vh / 2, -vw / 2, vh / 2 - vr);
    visorShape.lineTo(-vw / 2, -vh / 2 + vr);
    visorShape.quadraticCurveTo(-vw / 2, -vh / 2, -vw / 2 + vr, -vh / 2);

    const visorGeo = new THREE.ExtrudeGeometry(visorShape, {
      depth: 0.10,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.04,
      bevelThickness: 0.04
    });
    visorGeo.center();
    const vPos = visorGeo.attributes.position;
    for (let i = 0; i < vPos.count; i++) {
      const x = vPos.getX(i);
      const y = vPos.getY(i);
      const z = vPos.getZ(i);
      const curveOffset = -(x * x * 0.08 + y * y * 0.05);
      vPos.setZ(i, z + curveOffset + 1.72);
    }
    visorGeo.computeVertexNormals();
    const visorMesh = new THREE.Mesh(visorGeo, visorMaterial);
    codiGroup.add(visorMesh);

    // 3. Digital Eyes
    const eyeGroup = new THREE.Group();
    codiGroup.add(eyeGroup);

    const eyeGeo = new THREE.SphereGeometry(0.20, 24, 20);
    eyeGeo.scale(0.85, 1.25, 0.35);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.46, 0.08, 1.82);
    eyeGroup.add(leftEye);

    const sparkleGeo = new THREE.SphereGeometry(0.045, 12, 12);
    sparkleGeo.scale(0.9, 1.2, 0.4);
    const leftSparkle = new THREE.Mesh(sparkleGeo, sparkleMaterial);
    leftSparkle.position.set(-0.43, 0.16, 1.90);
    eyeGroup.add(leftSparkle);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.46, 0.08, 1.82);
    eyeGroup.add(rightEye);

    const rightSparkle = new THREE.Mesh(sparkleGeo, sparkleMaterial);
    rightSparkle.position.set(0.49, 0.16, 1.90);
    eyeGroup.add(rightSparkle);

    // 4. Smile Arc (Mouth)
    const smileGeo = new THREE.TorusGeometry(0.18, 0.026, 16, 32, Math.PI * 0.72);
    smileGeo.rotateZ(Math.PI * 1.14);
    const smileMesh = new THREE.Mesh(smileGeo, smileMaterial);
    smileMesh.position.set(0, -0.22, 1.82);
    codiGroup.add(smileMesh);

    // 5. Rosy Blush Cheeks
    const blushGeo = new THREE.SphereGeometry(0.15, 18, 18);
    blushGeo.scale(1.2, 0.55, 0.25);

    const leftBlush = new THREE.Mesh(blushGeo, blushMaterial);
    leftBlush.position.set(-0.76, -0.16, 1.76);
    codiGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMaterial);
    rightBlush.position.set(0.76, -0.16, 1.76);
    codiGroup.add(rightBlush);

    // 6. Ear Pods
    const earPodGeo = new THREE.CylinderGeometry(0.20, 0.22, 0.28, 24);
    earPodGeo.rotateZ(Math.PI / 2);

    const leftEarPod = new THREE.Mesh(earPodGeo, earPodMaterial);
    leftEarPod.position.set(-1.74, 0.02, 0);
    codiGroup.add(leftEarPod);

    const rightEarPod = new THREE.Mesh(earPodGeo, earPodMaterial);
    rightEarPod.position.set(1.74, 0.02, 0);
    codiGroup.add(rightEarPod);

    const earDotGeo = new THREE.SphereGeometry(0.075, 14, 14);
    const leftEarDot = new THREE.Mesh(earDotGeo, glowAccentMaterial);
    leftEarDot.position.set(-1.90, 0.02, 0);
    codiGroup.add(leftEarDot);

    const rightEarDot = new THREE.Mesh(earDotGeo, glowAccentMaterial);
    rightEarDot.position.set(1.90, 0.02, 0);
    codiGroup.add(rightEarDot);

    // 7. Antenna with Glowing Translucent Pearl Bulb
    const stemGeo = new THREE.CylinderGeometry(0.042, 0.052, 0.58, 14);
    const stemMesh = new THREE.Mesh(stemGeo, earPodMaterial);
    stemMesh.position.set(0, 1.90, 0);
    codiGroup.add(stemMesh);

    const bulbGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const bulbMesh = new THREE.Mesh(bulbGeo, glowAccentMaterial);
    bulbMesh.position.set(0, 2.26, 0);
    codiGroup.add(bulbMesh);

    const bulbPointLight = new THREE.PointLight(0xD8CCFF, 2.4, 4.2);
    bulbPointLight.position.set(0, 2.28, 0.1);
    codiGroup.add(bulbPointLight);

    // 8. Halo Ring (Landing page only)
    let halo = null;
    if (!isWorkspace) {
      const haloGeo = new THREE.TorusGeometry(2.35, 0.016, 16, 100);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x6C4CF1,
        transparent: true,
        opacity: 0.25
      });
      halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(0, 0.3, -0.4);
      halo.rotation.x = Math.PI / 2.5;
      halo.rotation.y = 0.15;
      codiGroup.add(halo);
    }

    // G. Pointer Interaction & Tap Physics
    let targetRotationX = 0;
    let targetRotationY = 0;
    let bounceFactor = 0;

    function onPointerMove(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const rawX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      // Clamp so character stays within natural visual bounds
      const clampedX = Math.max(-1.5, Math.min(1.5, rawX));
      const clampedY = Math.max(-1.2, Math.min(1.2, rawY));

      targetRotationY = clampedX * currentLayout.targetRotYMult;
      targetRotationX = -clampedY * currentLayout.targetRotXMult;
    }

    // Only landing page tracks mouse; workspace uses autonomous natural movement
    if (!isWorkspace) {
      window.addEventListener('mousemove', (e) => {
        onPointerMove(e.clientX, e.clientY);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    }

    function onCharacterClick() {
      bounceFactor = 0.85;
      triggerBlink();
      if (navigator.vibrate) {
        navigator.vibrate(12);
      }
    }

    container.addEventListener('click', onCharacterClick);
    container.addEventListener('touchstart', onCharacterClick, { passive: true });

    // H. Blinking Animation
    let blinkState = { isBlinking: false, timer: 0 };
    function triggerBlink() {
      blinkState.isBlinking = true;
      blinkState.timer = 0;
    }

    // I. Intersection Observer
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);

    function onResize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      currentLayout = getLayout();
      camera.aspect = width / height;
      camera.position.z = currentLayout.cameraZ;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      codiGroup.scale.set(currentLayout.scale, currentLayout.scale, currentLayout.scale);
      codiGroup.position.y = currentLayout.baseY;

      if (halo) {
        halo.visible = !isWorkspace && window.innerWidth > 768;
      }
    }
    window.addEventListener('resize', onResize);

    // J. State & Smooth Animation Interpolation
    let speechInfluence = 0.0;
    let listeningInfluence = 0.0;
    let thinkingInfluence = 0.0;
    const clock = new THREE.Clock();
    let nextBlinkTime = 2.5;

    // K. Animation Render Loop
    function animate() {
      requestAnimationFrame(animate);

      // Skip render calculations when canvas container is hidden or scrolled off
      if (!isVisible || container.offsetParent === null) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for states (prevents pops or robotic snaps)
      const isSpeakingOrTyping = globalCharacterState === 'speaking' || globalCharacterState === 'typing';
      const targetSpeech = isSpeakingOrTyping ? 1.0 : 0.0;
      const targetListen = globalCharacterState === 'listening' ? 1.0 : 0.0;
      const targetThink = globalCharacterState === 'thinking' ? 1.0 : 0.0;

      speechInfluence += (targetSpeech - speechInfluence) * 0.14;
      listeningInfluence += (targetListen - listeningInfluence) * 0.14;
      thinkingInfluence += (targetThink - thinkingInfluence) * 0.14;

      // 1. Gentle Idle Floating Bobbing
      let currentBaseY = currentLayout.baseY;
      if (!prefersReducedMotion) {
        currentBaseY += Math.sin(elapsedTime * 1.5) * 0.035 + (bounceFactor * 0.12);
        if (halo && halo.visible) {
          halo.rotation.z += 0.002;
        }
      }

      // 2. Head Orientation: Autonomous Procedural in Workspace, Pointer Tracking on Landing
      if (isWorkspace) {
        if (speechInfluence > 0.001) {
          // Speaking or Typing: Lifelike conversational rhythm
          const speakTime = elapsedTime * 7.6;
          targetRotationX = (Math.sin(speakTime * 0.65) * 0.055 + Math.cos(speakTime * 1.4) * 0.02) * speechInfluence;
          targetRotationY = (Math.sin(speakTime * 0.35) * 0.06 + Math.sin(speakTime * 0.8) * 0.03) * speechInfluence;
        } else if (thinkingInfluence > 0.001) {
          // Thinking or Loading: Thoughtful ponder tilt and slow nod
          const thinkTime = elapsedTime * 2.6;
          targetRotationX = (Math.sin(thinkTime * 0.8) * 0.045 + 0.03) * thinkingInfluence;
          targetRotationY = (Math.sin(thinkTime * 0.5) * 0.08) * thinkingInfluence;
        } else if (listeningInfluence > 0.001) {
          // Listening: Attentive forward posture
          targetRotationX = -0.04 * listeningInfluence;
          targetRotationY = (Math.sin(elapsedTime * 2.0) * 0.04) * listeningInfluence;
        } else {
          // Idle: Calm natural glance around with soft harmonic motion
          targetRotationX = Math.sin(elapsedTime * 0.4) * 0.025;
          targetRotationY = Math.sin(elapsedTime * 0.35) * 0.06 + Math.cos(elapsedTime * 0.18) * 0.04;
        }
      }

      // Smooth Inertia Damping toward target rotation
      codiGroup.rotation.x += (targetRotationX - codiGroup.rotation.x) * 0.08;
      codiGroup.rotation.y += (targetRotationY - codiGroup.rotation.y) * 0.08;

      // 3. Ultra-Smooth Speaking & Typing Animation ("Pas Menjawab / Mengetik")
      if (speechInfluence > 0.001) {
        const speakTime = elapsedTime * 8.6;
        // Organic layered syllable rhythm (natural human speech cadence)
        const syllable1 = Math.sin(speakTime) * 0.5 + Math.cos(speakTime * 1.7) * 0.3;
        const syllable2 = Math.sin(speakTime * 2.4) * 0.2;
        const mouthOpen = Math.max(0.10, syllable1 + syllable2 + 0.45);

        // A. Smile Arc Lip-Sync Morphing (opens vertically, widens, and soft jaw cadence)
        smileMesh.scale.y = 1.0 + (mouthOpen * 0.95) * speechInfluence;
        smileMesh.scale.x = 1.0 + (Math.sin(speakTime * 0.75) * 0.24) * speechInfluence;
        smileMesh.position.y = -0.22 - (mouthOpen * 0.032) * speechInfluence;

        // B. Conversational Head Gestures (subtle conversational roll tilt)
        const headTilt = (Math.sin(speakTime * 0.36) * 0.045) * speechInfluence;
        codiGroup.rotation.z = headTilt;

        // C. Body Vertical Cadence
        const speakBob = (Math.sin(speakTime * 0.82) * 0.045) * speechInfluence;
        currentBaseY += speakBob;

        // D. Antenna Inertia & Vocal Waveform Glow
        stemMesh.rotation.z = (Math.sin(speakTime * 0.48) * 0.08) * speechInfluence;
        const vocalGlow = 2.6 + (Math.sin(speakTime * 1.1) * 1.0 + Math.cos(speakTime * 2.3) * 0.45) * speechInfluence;
        glowAccentMaterial.emissiveIntensity = THREE.MathUtils.lerp(glowAccentMaterial.emissiveIntensity, vocalGlow, 0.22);
        bulbPointLight.intensity = glowAccentMaterial.emissiveIntensity;

        // E. Warm Rosy Blush Cheeks
        blushMaterial.opacity = THREE.MathUtils.lerp(0.65, 0.90, speechInfluence);
      } else if (listeningInfluence > 0.001) {
        // Listening State: Active attention tilt & glowing cyan antenna pulse
        const listenPulse = 3.6 + Math.sin(elapsedTime * 8.0) * 1.2;
        glowAccentMaterial.emissiveIntensity = listenPulse;
        bulbPointLight.intensity = listenPulse;
        bulbPointLight.color.setHex(0x7DF9FF);
        codiGroup.rotation.z = Math.sin(elapsedTime * 3.0) * 0.04 * listeningInfluence;
        smileMesh.scale.set(1.0, 1.0, 1.0);
        smileMesh.position.y = -0.22;
      } else if (thinkingInfluence > 0.001) {
        // Thinking State: Thoughtful head tilt & amber breathing glow
        const thinkPulse = 2.2 + Math.sin(elapsedTime * 4.0) * 0.8;
        glowAccentMaterial.emissiveIntensity = thinkPulse;
        bulbPointLight.intensity = thinkPulse;
        bulbPointLight.color.setHex(0xFFD700);
        codiGroup.rotation.z = (0.08 + Math.sin(elapsedTime * 2.4) * 0.03) * thinkingInfluence;
        smileMesh.scale.set(1.0, 1.0, 1.0);
        smileMesh.position.y = -0.22;
      } else {
        // Idle State: Calm breathing glow & reset mouth position
        smileMesh.scale.y = 1.0;
        smileMesh.scale.x = 1.0;
        smileMesh.position.y = -0.22;
        codiGroup.rotation.z *= 0.92;
        stemMesh.rotation.z = Math.sin(elapsedTime * 2.0) * 0.03;

        bulbPointLight.color.setHex(globalTeacherTheme === 'general' ? 0x6EE7B7 : 0xD8CCFF);
        const bulbPulse = 2.2 + Math.sin(elapsedTime * 2.8) * 0.6;
        glowAccentMaterial.emissiveIntensity = bulbPulse;
        bulbPointLight.intensity = bulbPulse;
        blushMaterial.opacity = 0.65;
      }

      // Apply calculated vertical position
      codiGroup.position.y = currentBaseY;

      // Dampen bounce
      if (bounceFactor > 0.01) {
        bounceFactor *= 0.88;
      } else {
        bounceFactor = 0;
      }

      // 4. Smooth Blinking Logic
      nextBlinkTime -= delta;
      if (nextBlinkTime <= 0) {
        triggerBlink();
        nextBlinkTime = 3.0 + Math.random() * 3.5;
      }

      if (blinkState.isBlinking) {
        blinkState.timer += delta * 15;
        if (blinkState.timer < Math.PI) {
          const scaleY = THREE.MathUtils.lerp(1.0, 0.08, Math.sin(blinkState.timer));
          eyeGroup.scale.y = scaleY;
        } else {
          eyeGroup.scale.y = 1.0;
          blinkState.isBlinking = false;
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    return {
      container,
      isWorkspace,
      onResize,
      setTheme: function (themeId) {
        if (themeId === 'general') {
          eyeMaterial.color.setHex(0x6EE7B7);
          eyeMaterial.emissive.setHex(0x6EE7B7);
          fillLight.color.setHex(0x34D399);
        } else {
          eyeMaterial.color.setHex(0x7DF9FF);
          eyeMaterial.emissive.setHex(0x7DF9FF);
          fillLight.color.setHex(0x8E70FF);
        }
      },
      triggerBounce: function () {
        bounceFactor = 0.85;
        triggerBlink();
      }
    };
  }

  // 3. Initialize Instances (Landing & Workspace)
  function initInstances() {
    const landingContainer = document.getElementById('codi-3d-canvas-container');
    if (landingContainer && !landingContainer.dataset.codiInitialized) {
      landingContainer.dataset.codiInitialized = 'true';
      const inst = createCodiInstance(landingContainer, false);
      if (inst) activeInstances.push(inst);
    }

    const workspaceContainer = document.getElementById('workspace-3d-canvas-container');
    if (workspaceContainer && !workspaceContainer.dataset.codiInitialized) {
      workspaceContainer.dataset.codiInitialized = 'true';
      const inst = createCodiInstance(workspaceContainer, true);
      if (inst) activeInstances.push(inst);
    }
  }

  // Run on initial load and handle dynamic DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstances);
  } else {
    initInstances();
  }

  // 4. Global Controller API
  window.setCodiState = function (state) {
    if (['idle', 'listening', 'thinking', 'speaking', 'typing'].includes(state)) {
      globalCharacterState = state;
    } else {
      globalCharacterState = 'idle';
    }
  };

  window.setCodiTeacherTheme = function (themeId) {
    globalTeacherTheme = themeId;
    activeInstances.forEach((inst) => {
      if (inst.setTheme) inst.setTheme(themeId);
    });
  };

  window.refreshCodi3D = function () {
    initInstances();
    activeInstances.forEach((inst) => {
      if (inst.onResize) inst.onResize();
    });
  };

  window.triggerCodiBounce = function () {
    activeInstances.forEach((inst) => {
      if (inst.triggerBounce) inst.triggerBounce();
    });
  };
})();
