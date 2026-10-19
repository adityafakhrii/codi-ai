/**
 * Codi AI — 3D Mascot WebGL Controller (AI-First GLB + Procedural Engine)
 *
 * Implements a hybrid AI-first 3D mascot runtime:
 *   1. GLB Mode: Automatically checks and loads `/models/codi-mascot.glb` (generated
 *      via AI Image-to-3D pipeline from `img/mascot-hero-fur.png`).
 *   2. Procedural Engine: High-fidelity Three.js geometry matching Otus identity
 *      active whenever the GLB model is being generated or as seamless fallback.
 *
 * Features:
 *   - Agibot-inspired studio lighting (ambient, directional key, soft fill, intense violet rim light).
 *   - Mouse & touch gaze tracking (independent head tilt & torso rotation).
 *   - Natural periodic spherical eye blinking (with randomized double-blink chance).
 *   - Organic spring-damped bounce on click/tap with haptic vibration.
 *   - Dynamic state transitions: 'idle' | 'listening' | 'thinking' | 'speaking' | 'typing'.
 *   - Teacher mode theme switching: 'math' (violet/gold) | 'general' (emerald).
 *   - Full responsiveness & prefers-reduced-motion accessibility compliance.
 */

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[Codi3D] Three.js is not loaded.');
    return;
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var activeInstances = [];
  var globalCharacterState = 'idle';
  var globalTeacherTheme = 'math';

  // ─── Brand Colors ───────────────────────────────────────────────────
  var COLOR_VIOLET_ROYAL  = 0x5522DB; // Rich velvety saturated body violet
  var COLOR_VIOLET_DARK   = 0x38129C; // Shadow & forehead crest deep violet
  var COLOR_VIOLET_DEEP   = 0x1E0A56; // Ambient shadow & headphone cavity
  var COLOR_LAVENDER_PLUSH= 0xD0C2F8; // Soft plush face mask & belly fluff
  var COLOR_LAVENDER_BEAK = 0xDDD2FA; // Delicate pastel lilac beak
  var COLOR_EYE_BLACK     = 0x0C081A; // Deep glossy cartoon midnight black
  var COLOR_WHITE         = 0xFFFFFF; // Crisp glossy catchlights
  var COLOR_BEAK_GOLD     = 0xE8B84A; // Golden paws/feet
  var COLOR_HEADPHONE_PAD = 0x180D38; // Headphone ear cushions
  var COLOR_GREEN_ACCENT  = 0x34D399; // Listening state emerald
  var COLOR_RIM_VIOLET    = 0xA78BFA; // Agibot-style violet rim halo
  var COLOR_THINKING_GOLD = 0xF59E0B; // Thinking state amber

  // ─── Instance Factory ────────────────────────────────────────────────

  function createCodiInstance(container, isWorkspace) {
    if (!container) return null;

    // ── Layout & Responsive View Configuration ──
    function getLayout() {
      var w = container.clientWidth  || (isWorkspace ? 90 : 820);
      var h = container.clientHeight || (isWorkspace ? 90 : 480);

      if (isWorkspace) {
        var compact = container.closest('.is-compact') !== null;
        return {
          workspace: true,
          scale:      1.0,
          cameraZ:    compact ? 4.6 : 4.1,
          glbScale:   compact ? 1.18 : 1.32,
          glbOffsetY: compact ? -0.32 : -0.36,
          baseY:      0,
          headRotMulX: 0.15,
          headRotMulY: 0.22,
          bodyRotMulX: 0.05,
          bodyRotMulY: 0.08
        };
      }

      var vw = window.innerWidth;
      if (vw <= 640) {
        return {
          workspace: false,
          scale:      1.0,
          cameraZ:    4.0,
          glbScale:   1.88,
          glbOffsetY: -0.88,
          baseY:      0,
          headRotMulX: 0.14,
          headRotMulY: 0.22,
          bodyRotMulX: 0.05,
          bodyRotMulY: 0.08
        };
      }
      if (vw <= 1024) {
        return {
          workspace: false,
          scale:      1.0,
          cameraZ:    4.1,
          glbScale:   1.76,
          glbOffsetY: -0.82,
          baseY:      0,
          headRotMulX: 0.14,
          headRotMulY: 0.22,
          bodyRotMulX: 0.05,
          bodyRotMulY: 0.09
        };
      }
      return {
        workspace: false,
        scale:      1.0,
        cameraZ:    4.0,
        glbScale:   1.86,
        glbOffsetY: -0.86,
        baseY:      0,
        headRotMulX: 0.16,
        headRotMulY: 0.25,
        bodyRotMulX: 0.06,
        bodyRotMulY: 0.10
      };
    }

    var layout = getLayout();

    // ── Scene / Camera / Renderer ──
    var scene = new THREE.Scene();
    var initW = container.clientWidth  || (isWorkspace ? 90 : 820);
    var initH = container.clientHeight || (isWorkspace ? 90 : 480);

    var camera = new THREE.PerspectiveCamera(
      isWorkspace ? 30 : 32,
      initW / Math.max(initH, 1),
      0.1,
      100
    );
    camera.position.set(0, 0, layout.cameraZ);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (err) {
      console.warn('[Codi3D] WebGL initialization failed:', err);
      return null;
    }

    renderer.setSize(initW, initH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Clean any prior canvas
    var existingCanvas = container.querySelector('canvas');
    if (existingCanvas) {
      container.removeChild(existingCanvas);
    }
    container.appendChild(renderer.domElement);

    // ── Root Mascot Group ──
    var owlRoot = new THREE.Group();
    owlRoot.position.set(0, layout.baseY, 0);
    owlRoot.scale.set(layout.scale, layout.scale, layout.scale);
    scene.add(owlRoot);

    // ── Studio Lighting (Sinematik Agibot Reference) ──
    var ambientLight = new THREE.AmbientLight(0x241454, 1.4);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(COLOR_WHITE, 1.25);
    keyLight.position.set(2.0, 3.8, 4.2);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0x9E86EE, 0.60);
    fillLight.position.set(-2.8, 1.2, 3.0);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(COLOR_RIM_VIOLET, 2.8);
    rimLight.position.set(0, 4.2, -3.2);
    scene.add(rimLight);

    var cursorLight = new THREE.PointLight(COLOR_LAVENDER_PLUSH, 1.0, 7.0);
    cursorLight.position.set(0, 0.4, 3.0);
    scene.add(cursorLight);

    // ── GLB vs Procedural Management ──
    var isGlbLoaded = false;
    var glbScene = null;
    var glbHeadNode = null;
    var glbEyeNodes = [];

    // Procedural Rig references
    var headGroup = new THREE.Group();
    var bodyGroup = new THREE.Group();
    var beakPivot = null;
    var leftWing = null;
    var rightWing = null;
    var eyelids = [];

    // ── Build High-Fidelity Procedural Model ──
    function buildProceduralRig() {
      // Materials
      var velvetBodyMat = new THREE.MeshStandardMaterial({
        color: COLOR_VIOLET_ROYAL,
        roughness: 0.82,
        metalness: 0.02
      });

      var darkCrestMat = new THREE.MeshStandardMaterial({
        color: COLOR_VIOLET_DARK,
        roughness: 0.80,
        metalness: 0.04
      });

      var plushLavenderMat = new THREE.MeshStandardMaterial({
        color: COLOR_LAVENDER_PLUSH,
        roughness: 0.78,
        metalness: 0.02
      });

      var eyeBlackMat = new THREE.MeshStandardMaterial({
        color: COLOR_EYE_BLACK,
        roughness: 0.06,
        metalness: 0.08
      });

      var catchlightMat = new THREE.MeshBasicMaterial({ color: COLOR_WHITE });

      var eyeRingMat = new THREE.MeshStandardMaterial({
        color: COLOR_LAVENDER_PLUSH,
        roughness: 0.45,
        metalness: 0.05
      });

      var eyelidMat = new THREE.MeshStandardMaterial({
        color: COLOR_VIOLET_ROYAL,
        roughness: 0.80,
        metalness: 0.02
      });

      var beakMat = new THREE.MeshStandardMaterial({
        color: COLOR_LAVENDER_BEAK,
        roughness: 0.35,
        metalness: 0.06
      });

      var goldMat = new THREE.MeshStandardMaterial({
        color: COLOR_BEAK_GOLD,
        roughness: 0.40,
        metalness: 0.05
      });

      var headphoneShellMat = new THREE.MeshStandardMaterial({
        color: COLOR_VIOLET_DARK,
        roughness: 0.28,
        metalness: 0.42
      });

      var headphoneRingMat = new THREE.MeshStandardMaterial({
        color: COLOR_LAVENDER_PLUSH,
        roughness: 0.22,
        metalness: 0.25,
        emissive: COLOR_VIOLET_ROYAL,
        emissiveIntensity: 0.38
      });

      var headphonePadMat = new THREE.MeshStandardMaterial({
        color: COLOR_HEADPHONE_PAD,
        roughness: 0.88,
        metalness: 0.0
      });

      var headbandMat = new THREE.MeshStandardMaterial({
        color: COLOR_VIOLET_ROYAL,
        roughness: 0.35,
        metalness: 0.20
      });

      // Head
      headGroup.position.set(0, 0.52, 0);
      owlRoot.add(headGroup);

      var headGeo = new THREE.SphereGeometry(1.24, 48, 48);
      var headMesh = new THREE.Mesh(headGeo, velvetBodyMat);
      headMesh.scale.set(1.14, 0.94, 0.90);
      headGroup.add(headMesh);

      // Plush face discs
      function buildFaceDisc(xSign) {
        var discGeo = new THREE.SphereGeometry(0.58, 36, 36);
        var discMesh = new THREE.Mesh(discGeo, plushLavenderMat);
        discMesh.position.set(xSign * 0.44, 0.04, 0.80);
        discMesh.scale.set(1.12, 1.16, 0.38);
        return discMesh;
      }
      headGroup.add(buildFaceDisc(-1));
      headGroup.add(buildFaceDisc(1));

      var chinGeo = new THREE.SphereGeometry(0.38, 24, 24);
      var chinMesh = new THREE.Mesh(chinGeo, plushLavenderMat);
      chinMesh.position.set(0, -0.34, 0.88);
      chinMesh.scale.set(1.05, 0.70, 0.40);
      headGroup.add(chinMesh);

      var crestGeo = new THREE.ConeGeometry(0.24, 0.58, 20);
      var crestMesh = new THREE.Mesh(crestGeo, darkCrestMat);
      crestMesh.position.set(0, 0.34, 0.96);
      crestMesh.rotation.z = Math.PI;
      crestMesh.scale.set(1.0, 1.0, 0.45);
      headGroup.add(crestMesh);

      // Sweeping Brow Horns
      function buildSweepingBrow(xSign) {
        var brow = new THREE.Group();
        brow.position.set(xSign * 0.46, 0.36, 0.82);

        var p1Geo = new THREE.ConeGeometry(0.18, 0.74, 16);
        var p1 = new THREE.Mesh(p1Geo, darkCrestMat);
        p1.position.set(xSign * 0.26, 0.24, -0.05);
        p1.rotation.z = xSign * -0.68;
        p1.rotation.x = -0.15;
        brow.add(p1);

        var p2Geo = new THREE.ConeGeometry(0.14, 0.64, 16);
        var p2 = new THREE.Mesh(p2Geo, darkCrestMat);
        p2.position.set(xSign * 0.36, 0.14, -0.08);
        p2.rotation.z = xSign * -0.88;
        p2.rotation.x = -0.10;
        brow.add(p2);

        var p3Geo = new THREE.ConeGeometry(0.15, 0.56, 16);
        var p3 = new THREE.Mesh(p3Geo, darkCrestMat);
        p3.position.set(xSign * 0.14, 0.06, 0.04);
        p3.rotation.z = xSign * -0.38;
        p3.rotation.x = -0.05;
        brow.add(p3);

        return brow;
      }
      headGroup.add(buildSweepingBrow(-1));
      headGroup.add(buildSweepingBrow(1));

      // Eyes
      function buildEyeRig(xSign) {
        var eyeGroup = new THREE.Group();
        var x = xSign * 0.44;
        var y = 0.04;
        var z = 0.88;

        var ringGeo = new THREE.TorusGeometry(0.40, 0.038, 16, 48);
        var ring = new THREE.Mesh(ringGeo, eyeRingMat);
        ring.position.set(x, y, z + 0.06);
        headGroup.add(ring);

        var eyeGeo = new THREE.SphereGeometry(0.39, 36, 36);
        var eye = new THREE.Mesh(eyeGeo, eyeBlackMat);
        eye.position.set(x, y, z);
        eyeGroup.add(eye);

        var hl1Geo = new THREE.SphereGeometry(0.098, 16, 16);
        var hl1 = new THREE.Mesh(hl1Geo, catchlightMat);
        hl1.position.set(x + (xSign > 0 ? 0.09 : 0.05), y + 0.14, z + 0.36);
        eyeGroup.add(hl1);

        var hl2Geo = new THREE.SphereGeometry(0.046, 12, 12);
        var hl2 = new THREE.Mesh(hl2Geo, catchlightMat);
        hl2.position.set(x - (xSign > 0 ? 0.06 : 0.08), y - 0.08, z + 0.36);
        eyeGroup.add(hl2);

        var lidPivot = new THREE.Group();
        lidPivot.position.set(x, y, z);
        var lidGeo = new THREE.SphereGeometry(0.405, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        var lid = new THREE.Mesh(lidGeo, eyelidMat);
        lid.rotation.x = -Math.PI * 0.5;
        lidPivot.add(lid);
        eyeGroup.add(lidPivot);

        eyelids.push({ pivot: lid });
        headGroup.add(eyeGroup);
      }
      buildEyeRig(-1);
      buildEyeRig(1);

      // Beak
      beakPivot = new THREE.Group();
      beakPivot.position.set(0, -0.15, 1.14);
      var beakGeo = new THREE.ConeGeometry(0.16, 0.36, 20);
      var beakMesh = new THREE.Mesh(beakGeo, beakMat);
      beakMesh.rotation.x = Math.PI * 0.56;
      beakPivot.add(beakMesh);
      headGroup.add(beakPivot);

      // Headphones
      function buildEarCup(xSign) {
        var cup = new THREE.Group();
        var x = xSign * 1.35;
        var y = 0.06;
        var z = 0.08;

        var outerGeo = new THREE.CylinderGeometry(0.40, 0.40, 0.24, 32);
        var outer = new THREE.Mesh(outerGeo, headphoneShellMat);
        outer.position.set(x, y, z);
        outer.rotation.z = Math.PI * 0.5;
        outer.rotation.y = xSign * 0.16;
        cup.add(outer);

        var haloGeo = new THREE.TorusGeometry(0.26, 0.045, 16, 32);
        var halo = new THREE.Mesh(haloGeo, headphoneRingMat);
        halo.position.set(x + xSign * 0.125, y, z);
        halo.rotation.y = Math.PI * 0.5;
        cup.add(halo);

        var padGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.14, 32);
        var pad = new THREE.Mesh(padGeo, headphonePadMat);
        pad.position.set(x - xSign * 0.12, y, z);
        pad.rotation.z = Math.PI * 0.5;
        pad.rotation.y = xSign * 0.16;
        cup.add(pad);

        return cup;
      }
      headGroup.add(buildEarCup(-1));
      headGroup.add(buildEarCup(1));

      var bandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.26, 0.18, 0.04),
        new THREE.Vector3(-0.95, 0.88, 0.02),
        new THREE.Vector3(-0.55, 1.28, 0.00),
        new THREE.Vector3( 0.00, 1.38, 0.00),
        new THREE.Vector3( 0.55, 1.28, 0.00),
        new THREE.Vector3( 0.95, 0.88, 0.02),
        new THREE.Vector3( 1.26, 0.18, 0.04)
      ]);
      var bandGeo = new THREE.TubeGeometry(bandCurve, 40, 0.08, 16, false);
      var bandMesh = new THREE.Mesh(bandGeo, headbandMat);
      headGroup.add(bandMesh);

      // Body Group
      bodyGroup.position.set(0, -0.66, 0);
      owlRoot.add(bodyGroup);

      var bodyGeo = new THREE.SphereGeometry(1.14, 48, 48);
      var bodyMesh = new THREE.Mesh(bodyGeo, velvetBodyMat);
      bodyMesh.scale.set(1.12, 1.15, 0.90);
      bodyGroup.add(bodyMesh);

      var bellyGeo = new THREE.SphereGeometry(0.80, 36, 36);
      var bellyMesh = new THREE.Mesh(bellyGeo, plushLavenderMat);
      bellyMesh.position.set(0, -0.04, 0.48);
      bellyMesh.scale.set(0.88, 1.05, 0.46);
      bodyGroup.add(bellyMesh);

      function buildWing(xSign) {
        var wing = new THREE.Group();
        wing.position.set(xSign * 1.05, 0.05, -0.08);

        var wingGeo = new THREE.SphereGeometry(0.50, 28, 28);
        var wingMesh = new THREE.Mesh(wingGeo, darkCrestMat);
        wingMesh.scale.set(0.38, 0.85, 0.54);
        wingMesh.position.set(xSign * 0.06, -0.22, 0);
        wingMesh.rotation.z = xSign * 0.22;
        wingMesh.rotation.y = xSign * -0.14;
        wing.add(wingMesh);

        if (xSign < 0) leftWing = wing;
        else rightWing = wing;

        return wing;
      }
      bodyGroup.add(buildWing(-1));
      bodyGroup.add(buildWing(1));

      function buildFoot(xSign) {
        var footGeo = new THREE.SphereGeometry(0.22, 24, 24);
        var foot = new THREE.Mesh(footGeo, goldMat);
        foot.position.set(xSign * 0.38, -1.20, 0.30);
        foot.scale.set(1.25, 0.52, 1.35);
        return foot;
      }
      bodyGroup.add(buildFoot(-1));
      bodyGroup.add(buildFoot(1));

      // Start hidden so there is no 1-second procedural flash while GLB loads
      headGroup.visible = false;
      bodyGroup.visible = false;
    }

    buildProceduralRig();

    // ── Attempt AI-Generated GLB Model Loading ──
    var glbPivot = null;
    if (typeof THREE.GLTFLoader !== 'undefined') {
      var gltfLoader = new THREE.GLTFLoader();
      var glbPath = '/models/codi-mascot.glb?v=20261019_1';
      gltfLoader.load(
        glbPath,
        function (gltf) {
          try {
            console.log('[Codi3D] Successfully loaded AI-generated GLB mascot model from ' + glbPath);
            isGlbLoaded = true;
            glbScene = gltf.scene;

            // Compute bounding box and center point
            var bbox = new THREE.Box3().setFromObject(glbScene);
            var center = new THREE.Vector3();
            bbox.getCenter(center);

            // Grand bust portrait matching mascot-hero-fur.png framing
            glbPivot = new THREE.Group();
            glbPivot.scale.set(layout.glbScale, layout.glbScale, layout.glbScale);
            glbPivot.position.set(0, 0, 0);

            // Center GLB horizontally and depth-wise inside glbPivot
            glbScene.position.set(-center.x, 0, -center.z);

            glbPivot.add(glbScene);

            // Inspect hierarchy for material tuning, sRGB texture mapping, and head/eye sub-meshes
            glbScene.traverse(function (child) {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material.roughness = Math.max(child.material.roughness || 0.45, 0.55);
                  child.material.metalness = Math.min(child.material.metalness || 0.05, 0.12);
                  if (child.material.map) {
                    child.material.map.encoding = THREE.sRGBEncoding;
                    child.material.map.needsUpdate = true;
                  }
                }
                var name = (child.name || '').toLowerCase();
                if (name.includes('head') || name.includes('face')) {
                  glbHeadNode = child;
                }
                if (name.includes('eye')) {
                  glbEyeNodes.push(child);
                }
              }
            });

            // Transition: ensure procedural rig remains hidden and show GLB model
            headGroup.visible = false;
            bodyGroup.visible = false;
            owlRoot.add(glbPivot);
          } catch (err) {
            console.error('[Codi3D] Error configuring GLB mascot:', err);
            headGroup.visible = true;
            bodyGroup.visible = true;
          }
        },
        undefined,
        function (err) {
          console.error('[Codi3D] GLB load error from ' + glbPath + ':', err);
          isGlbLoaded = false;
          // Fallback to procedural model only if GLB failed
          headGroup.visible = true;
          bodyGroup.visible = true;
        }
      );
    }

    // ── Interactive State Variables ──
    var targetHeadRotX = 0;
    var targetHeadRotY = 0;
    var targetBodyRotX = 0;
    var targetBodyRotY = 0;
    var bounceOffset   = 0;
    var bounceVelocity = 0;

    // Pointer move handler (mouse & touch gaze tracking)
    function onPointerMove(clientX, clientY) {
      var rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var normX = ((clientX - rect.left) / rect.width)  * 2 - 1;
      var normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      var clX = Math.max(-1.3, Math.min(1.3, normX));
      var clY = Math.max(-1.0, Math.min(1.0, normY));

      targetHeadRotY =  clX * layout.headRotMulY;
      targetHeadRotX = -clY * layout.headRotMulX;

      targetBodyRotY =  clX * layout.bodyRotMulY;
      targetBodyRotX = -clY * layout.bodyRotMulX;

      cursorLight.position.x = clX * 2.4;
      cursorLight.position.y = clY * 1.6 + 0.4;
    }

    if (!isWorkspace) {
      window.addEventListener('mousemove', function (e) {
        onPointerMove(e.clientX, e.clientY);
      }, { passive: true });

      window.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches.length > 0) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
    }

    // Click / Tap bounce trigger with haptic feedback
    function onCharacterClick() {
      bounceVelocity = 0.55;
      triggerBlink(true);
      if (navigator.vibrate) {
        try { navigator.vibrate(12); } catch (e) {}
      }
    }
    container.addEventListener('click', onCharacterClick);
    container.addEventListener('touchstart', onCharacterClick, { passive: true });

    // ── Natural Blinking System ──
    var blinkSystem = {
      active: false,
      timer: 0,
      duration: 0.22,
      nextBlinkIn: 3.5 + Math.random() * 3.5,
      isDoubleBlink: false,
      doubleBlinkPending: false
    };

    function triggerBlink(force) {
      if (blinkSystem.active && !force) return;
      blinkSystem.active = true;
      blinkSystem.timer = 0;
      blinkSystem.duration = 0.20 + Math.random() * 0.06;
      blinkSystem.isDoubleBlink = !force && Math.random() < 0.22;
      blinkSystem.doubleBlinkPending = blinkSystem.isDoubleBlink;
    }

    function updateBlinking(delta) {
      blinkSystem.nextBlinkIn -= delta;
      if (blinkSystem.nextBlinkIn <= 0) {
        triggerBlink(false);
        blinkSystem.nextBlinkIn = 3.6 + Math.random() * 3.8;
      }

      if (!blinkSystem.active) return;

      blinkSystem.timer += delta;
      var phase = (blinkSystem.timer / blinkSystem.duration) * Math.PI;

      if (phase < Math.PI) {
        var closeAmount = Math.sin(phase);
        var upperRot = -Math.PI * 0.5 + closeAmount * (Math.PI * 0.50);

        for (var i = 0; i < eyelids.length; i++) {
          eyelids[i].pivot.rotation.x = upperRot;
        }

        // If GLB has separate eye nodes, animate squish/scale
        if (glbEyeNodes.length > 0) {
          var eyeSquish = 1.0 - closeAmount * 0.75;
          for (var k = 0; k < glbEyeNodes.length; k++) {
            glbEyeNodes[k].scale.y = eyeSquish;
          }
        }
      } else {
        for (var j = 0; j < eyelids.length; j++) {
          eyelids[j].pivot.rotation.x = -Math.PI * 0.5;
        }
        if (glbEyeNodes.length > 0) {
          for (var m = 0; m < glbEyeNodes.length; m++) {
            glbEyeNodes[m].scale.y = 1.0;
          }
        }

        if (blinkSystem.doubleBlinkPending) {
          blinkSystem.doubleBlinkPending = false;
          blinkSystem.timer = 0;
          blinkSystem.duration = 0.16;
        } else {
          blinkSystem.active = false;
        }
      }
    }

    // ── Performance & Intersection Observer ──
    var isVisible    = true;
    var isTabVisible = !document.hidden;
    var isRunning    = false;
    var animRafId    = null;
    var clock        = new THREE.Clock();

    function startAnimation() {
      if (isRunning) return;
      if (!isVisible || !isTabVisible || container.offsetParent === null) return;
      isRunning = true;
      clock.start();
      animRafId = requestAnimationFrame(animate);
    }

    function stopAnimation() {
      isRunning = false;
      if (animRafId) {
        cancelAnimationFrame(animRafId);
        animRafId = null;
      }
      clock.stop();
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isVisible = entry.isIntersecting;
        if (isVisible && isTabVisible && container.offsetParent !== null) {
          startAnimation();
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(container);

    document.addEventListener('visibilitychange', function () {
      isTabVisible = !document.hidden;
      if (isVisible && isTabVisible && container.offsetParent !== null) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });

    // ── Window Resize ──
    function onResize() {
      if (!container) return;
      var w = container.clientWidth;
      var h = container.clientHeight;
      if (!w || !h) return;

      layout = getLayout();
      camera.aspect = w / Math.max(h, 1);
      camera.position.z = layout.cameraZ;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (glbPivot) {
        glbPivot.scale.set(layout.glbScale, layout.glbScale, layout.glbScale);
      }
      owlRoot.position.y = isGlbLoaded ? layout.glbOffsetY : (layout.baseY || 0);

      if (isVisible && isTabVisible && container.offsetParent !== null) {
        startAnimation();
      }
    }

    var resizeRafId = null;
    function handleResize() {
      if (resizeRafId) return;
      resizeRafId = requestAnimationFrame(function () {
        resizeRafId = null;
        onResize();
      });
    }
    window.addEventListener('resize', handleResize, { passive: true });

    // ── Animation Loop ──
    var speechInfluence    = 0.0;
    var listeningInfluence = 0.0;
    var thinkingInfluence  = 0.0;

    function animate() {
      if (!isRunning) return;
      if (!isVisible || !isTabVisible || container.offsetParent === null) {
        stopAnimation();
        return;
      }
      animRafId = requestAnimationFrame(animate);

      var delta = Math.min(clock.getDelta(), 0.1);
      var elapsed = clock.getElapsedTime();

      // State influence blending
      var isSpeakingOrTyping = globalCharacterState === 'speaking' || globalCharacterState === 'typing';
      var tSpeech = isSpeakingOrTyping ? 1.0 : 0.0;
      var tListen = globalCharacterState === 'listening' ? 1.0 : 0.0;
      var tThink  = globalCharacterState === 'thinking'  ? 1.0 : 0.0;

      speechInfluence    += (tSpeech - speechInfluence)       * 0.12;
      listeningInfluence += (tListen - listeningInfluence)   * 0.12;
      thinkingInfluence  += (tThink  - thinkingInfluence)    * 0.12;

      // Spring bounce physics
      if (bounceVelocity !== 0 || bounceOffset > 0.001) {
        bounceOffset += bounceVelocity * delta * 60;
        bounceVelocity -= bounceOffset * 0.28;
        bounceVelocity *= 0.84;
        if (Math.abs(bounceOffset) < 0.002 && Math.abs(bounceVelocity) < 0.005) {
          bounceOffset = 0;
          bounceVelocity = 0;
        }
      }

      // Idle vertical floating & breathing kinematics
      var baseYPos = isGlbLoaded ? layout.glbOffsetY : (layout.baseY || 0);
      var curY = baseYPos;
      if (!prefersReducedMotion) {
        var floatWave = Math.sin(elapsed * 1.2) * 0.024;
        var breathScale = 1.0 + Math.sin(elapsed * 2.2) * 0.012;
        curY += floatWave + bounceOffset * 0.08;
        bodyGroup.scale.set(1.0, breathScale, 1.0);
        if (glbPivot) {
          glbPivot.scale.set(layout.glbScale, layout.glbScale * breathScale, layout.glbScale);
        }
      }

      // Workspace orientation
      if (isWorkspace) {
        if (speechInfluence > 0.001) {
          var spSpeed = elapsed * 6.5;
          targetHeadRotX = Math.sin(spSpeed * 0.7) * 0.04 * speechInfluence;
          targetHeadRotY = Math.sin(spSpeed * 0.4) * 0.05 * speechInfluence;
        } else if (thinkingInfluence > 0.001) {
          targetHeadRotX =  0.04 * thinkingInfluence;
          targetHeadRotY = Math.sin(elapsed * 1.8) * 0.05 * thinkingInfluence;
        } else if (listeningInfluence > 0.001) {
          targetHeadRotX = -0.04 * listeningInfluence;
          targetHeadRotY = Math.sin(elapsed * 1.4) * 0.03 * listeningInfluence;
        } else {
          targetHeadRotX = Math.sin(elapsed * 0.35) * 0.015;
          targetHeadRotY = Math.sin(elapsed * 0.28) * 0.035;
        }
      }

      // Damped lerp on head rotation (primary gaze tracker)
      headGroup.rotation.x += (targetHeadRotX - headGroup.rotation.x) * 0.075;
      headGroup.rotation.y += (targetHeadRotY - headGroup.rotation.y) * 0.075;

      bodyGroup.rotation.x += (targetBodyRotX - bodyGroup.rotation.x) * 0.045;
      bodyGroup.rotation.y += (targetBodyRotY - bodyGroup.rotation.y) * 0.045;

      // If GLB loaded, orient GLB head or root pivot
      var activeGlbMesh = glbPivot || glbScene;
      if (isGlbLoaded && activeGlbMesh) {
        if (glbHeadNode) {
          glbHeadNode.rotation.x += (targetHeadRotX - glbHeadNode.rotation.x) * 0.075;
          glbHeadNode.rotation.y += (targetHeadRotY - glbHeadNode.rotation.y) * 0.075;
        } else {
          activeGlbMesh.rotation.x += (targetHeadRotX * 0.85 - activeGlbMesh.rotation.x) * 0.08;
          activeGlbMesh.rotation.y += (targetHeadRotY * 0.85 - activeGlbMesh.rotation.y) * 0.08;
        }
      }

      // State-driven expressive behaviors
      if (speechInfluence > 0.001) {
        var talkT = elapsed * 8.0;
        headGroup.rotation.z = Math.sin(talkT * 0.4) * 0.028 * speechInfluence;
        if (isGlbLoaded && activeGlbMesh) {
          activeGlbMesh.rotation.z = Math.sin(talkT * 0.4) * 0.032 * speechInfluence;
        }

        if (beakPivot) {
          var beakChirp = Math.abs(Math.sin(talkT * 1.1)) * 0.35 * speechInfluence;
          beakPivot.scale.set(1.0 + beakChirp * 0.2, 1.0 + beakChirp, 1.0);
          beakPivot.position.y = -0.15 - beakChirp * 0.04;
        }

        if (leftWing && rightWing) {
          var wingWave = Math.sin(talkT * 0.8) * 0.12 * speechInfluence;
          leftWing.rotation.z  = -wingWave;
          rightWing.rotation.z =  wingWave;
        }

        rimLight.intensity = THREE.MathUtils.lerp(rimLight.intensity, 2.9, 0.15);
      } else if (listeningInfluence > 0.001) {
        headGroup.rotation.z = 0;
        if (isGlbLoaded && activeGlbMesh) {
          activeGlbMesh.rotation.z *= 0.90;
        }
        if (beakPivot) {
          beakPivot.scale.set(1.0, 1.0, 1.0);
          beakPivot.position.y = -0.15;
        }
        rimLight.color.setHex(COLOR_GREEN_ACCENT);
        rimLight.intensity = 2.4 + Math.sin(elapsed * 4.5) * 0.45;
      } else if (thinkingInfluence > 0.001) {
        headGroup.rotation.z = 0.05 * thinkingInfluence;
        if (isGlbLoaded && activeGlbMesh) {
          activeGlbMesh.rotation.z = 0.048 * thinkingInfluence;
        }
        if (beakPivot) {
          beakPivot.scale.set(1.0, 1.0, 1.0);
          beakPivot.position.y = -0.15;
        }
        rimLight.color.setHex(COLOR_THINKING_GOLD);
        rimLight.intensity = 2.3 + Math.sin(elapsed * 3.0) * 0.35;
      } else {
        headGroup.rotation.z *= 0.92;
        if (isGlbLoaded && activeGlbMesh) {
          activeGlbMesh.rotation.z *= 0.92;
        }
        if (beakPivot) {
          beakPivot.scale.set(1.0, 1.0, 1.0);
          beakPivot.position.y = -0.15;
        }
        if (leftWing && rightWing) {
          leftWing.rotation.z  *= 0.90;
          rightWing.rotation.z *= 0.90;
        }
        var targetRim = globalTeacherTheme === 'general' ? COLOR_GREEN_ACCENT : (globalTeacherTheme === 'pancasila' ? COLOR_THINKING_GOLD : COLOR_RIM_VIOLET);
        rimLight.color.setHex(targetRim);
        rimLight.intensity = 2.8;
      }

      owlRoot.position.y = curY;

      // Natural eye blinking
      updateBlinking(delta);

      renderer.render(scene, camera);
    }

    // ── Public Instance Handle ──
    return {
      onResize: onResize,
      startAnimation: startAnimation,
      stopAnimation: stopAnimation,
      setTheme: function (themeId) {
        var targetColor = themeId === 'general' ? COLOR_GREEN_ACCENT : (themeId === 'pancasila' ? COLOR_THINKING_GOLD : COLOR_RIM_VIOLET);
        rimLight.color.setHex(targetColor);
      },
      triggerBounce: function () {
        bounceVelocity = 0.55;
        triggerBlink(true);
      }
    };
  }

  // ─── Initialization ─────────────────────────────────────────────────

  function initInstances() {
    var landingEl = document.getElementById('codi-3d-canvas-container');
    if (landingEl && !landingEl.dataset.codiInitialized) {
      landingEl.dataset.codiInitialized = 'true';
      var inst = createCodiInstance(landingEl, false);
      if (inst) activeInstances.push(inst);
    }

    var workspaceEl = document.getElementById('workspace-3d-canvas-container');
    if (workspaceEl && !workspaceEl.dataset.codiInitialized) {
      workspaceEl.dataset.codiInitialized = 'true';
      var inst2 = createCodiInstance(workspaceEl, true);
      if (inst2) activeInstances.push(inst2);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstances);
  } else {
    initInstances();
  }

  // ─── Global Controller API ──────────────────────────────────────────

  window.setCodiState = function (state) {
    if (['idle', 'listening', 'thinking', 'speaking', 'typing'].indexOf(state) !== -1) {
      globalCharacterState = state;
    } else {
      globalCharacterState = 'idle';
    }
  };

  window.setCodiTeacherTheme = function (themeId) {
    globalTeacherTheme = themeId;
    activeInstances.forEach(function (inst) {
      if (inst && inst.setTheme) inst.setTheme(themeId);
    });
  };

  window.refreshCodi3D = function () {
    initInstances();
    activeInstances.forEach(function (inst) {
      if (inst && inst.onResize) inst.onResize();
      if (inst && inst.startAnimation) inst.startAnimation();
    });
  };

  window.triggerCodiBounce = function () {
    activeInstances.forEach(function (inst) {
      if (inst && inst.triggerBounce) inst.triggerBounce();
    });
  };

})();
