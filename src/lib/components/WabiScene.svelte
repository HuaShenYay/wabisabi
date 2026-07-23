<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
	import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
	import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

	let container;
	let cleanup = null;

	onMount(() => {
		let renderer, scene, camera, composer, clock;
		let animationId = null;
		let waterUniforms, reedUniforms;
		let birdGeo, birdVel;
		let birdCount = 18;
		let cameraBaseZ = 14;
		let mouseTargetX = 0, mouseTargetY = 0;
		let mouseX = 0, mouseY = 0;
		let bloomPass;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				const h = entry.contentRect.height;
				if (w > 0 && h > 0) {
					if (!scene) {
						initScene(w, h);
					} else {
						resize(w, h);
					}
				}
			}
		});
		ro.observe(container);

		function initScene(w, h) {
			clock = new THREE.Clock();

			// === Renderer ===
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
			renderer.setSize(w, h);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 0.82;
			container.appendChild(renderer.domElement);

			// === Scene + Fog ===
			scene = new THREE.Scene();
			scene.fog = new THREE.FogExp2(0x8a7f6a, 0.016);

			// === Camera ===
			camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
			camera.position.set(0, 3.5, cameraBaseZ);
			camera.lookAt(0, 2.5, -5);

			// === Sky ===
			const skyGeo = new THREE.SphereGeometry(500, 32, 16);
			const skyMat = new THREE.ShaderMaterial({
				side: THREE.BackSide,
				depthWrite: false,
				uniforms: {
					uTop: { value: new THREE.Color('#b0a088') },
					uHorizon: { value: new THREE.Color('#d4a878') },
					uBottom: { value: new THREE.Color('#6a5e4a') },
					uSunDir: { value: new THREE.Vector3(-1, 0.12, -0.4).normalize() },
					uSunColor: { value: new THREE.Color('#f5d4a0') }
				},
				vertexShader: `
					varying vec3 vDir;
					void main() {
						vec4 wp = modelMatrix * vec4(position, 1.0);
						vDir = wp.xyz;
						gl_Position = projectionMatrix * viewMatrix * wp;
					}
				`,
				fragmentShader: `
					uniform vec3 uTop;
					uniform vec3 uHorizon;
					uniform vec3 uBottom;
					uniform vec3 uSunDir;
					uniform vec3 uSunColor;
					varying vec3 vDir;
					void main() {
						vec3 d = normalize(vDir);
						float hh = d.y;
						vec3 sky = mix(uHorizon, uTop, smoothstep(0.0, 0.6, hh));
						sky = mix(uBottom, sky, smoothstep(-0.25, 0.05, hh));
						float sun = max(dot(d, normalize(uSunDir)), 0.0);
						sky += uSunColor * pow(sun, 5.0) * 0.35;
						sky += uSunColor * pow(sun, 48.0) * 1.8;
						sky += uSunColor * pow(sun, 512.0) * 4.0;
						gl_FragColor = vec4(sky, 1.0);
					}
				`
			});
			scene.add(new THREE.Mesh(skyGeo, skyMat));

			// === Water ===
			const waterGeo = new THREE.PlaneGeometry(300, 300, 80, 80);
			waterGeo.rotateX(-Math.PI / 2);
			waterUniforms = {
				uTime: { value: 0 },
				uColor: { value: new THREE.Color('#242018') },
				uSunColor: { value: new THREE.Color('#d4a878') },
				uSunDir: { value: new THREE.Vector3(-1, 0.12, -0.4).normalize() },
				uFogColor: { value: new THREE.Color('#8a7f6a') }
			};
			const waterMat = new THREE.ShaderMaterial({
				uniforms: waterUniforms,
				vertexShader: `
					uniform float uTime;
					varying vec3 vWorldPos;
					varying float vWave;
					void main() {
						vec3 pos = position;
						float w1 = sin(pos.x * 0.1 + uTime * 0.4) * 0.05;
						float w2 = cos(pos.z * 0.08 + uTime * 0.3) * 0.035;
						float w3 = sin((pos.x + pos.z) * 0.05 + uTime * 0.2) * 0.025;
						pos.y += w1 + w2 + w3;
						vWave = w1 + w2 + w3;
						vec4 wp = modelMatrix * vec4(pos, 1.0);
						vWorldPos = wp.xyz;
						gl_Position = projectionMatrix * viewMatrix * wp;
					}
				`,
				fragmentShader: `
					uniform vec3 uColor;
					uniform vec3 uSunColor;
					uniform vec3 uSunDir;
					uniform vec3 uFogColor;
					varying vec3 vWorldPos;
					varying float vWave;
					void main() {
						vec3 color = uColor;
						vec3 dir = normalize(vWorldPos - cameraPosition);
						vec3 refl = reflect(dir, vec3(0.0, 1.0, 0.0));
						float sunRefl = max(dot(refl, normalize(uSunDir)), 0.0);
						color += uSunColor * pow(sunRefl, 3.0) * 0.12;
						color += uSunColor * pow(sunRefl, 28.0) * 0.5;
						color += vec3(vWave * 0.35);
						float dist = length(vWorldPos.xz);
						float fogF = 1.0 - exp(-dist * 0.014);
						color = mix(color, uFogColor, fogF * 0.85);
						gl_FragColor = vec4(color, 1.0);
					}
				`
			});
			scene.add(new THREE.Mesh(waterGeo, waterMat));

			// === Stones ===
			const stoneMat = new THREE.MeshStandardMaterial({
				color: 0x4a4438,
				roughness: 0.95,
				metalness: 0.0
			});
			const stepMat = new THREE.MeshStandardMaterial({
				color: 0x534c40,
				roughness: 0.92,
				metalness: 0.0
			});

			// Stone steps leading to pavilion
			for (let i = 0; i < 5; i++) {
				const step = new THREE.Mesh(
					new THREE.BoxGeometry(1.5 - i * 0.15, 0.15, 0.8),
					stepMat
				);
				step.position.set(0, 0.08 + i * 0.02, 6 - i * 1.2);
				step.rotation.y = (Math.random() - 0.5) * 0.15;
				scene.add(step);
			}

			// Scattered rocks
			for (let i = 0; i < 35; i++) {
				const size = 0.25 + Math.random() * 0.7;
				const geo = new THREE.DodecahedronGeometry(size, 0);
				const stone = new THREE.Mesh(geo, stoneMat);
				const angle = Math.random() * Math.PI * 2;
				const radius = 5 + Math.random() * 18;
				stone.position.set(
					Math.cos(angle) * radius,
					size * 0.25,
					Math.sin(angle) * radius - 3
				);
				stone.rotation.set(
					Math.random() * 0.3,
					Math.random() * Math.PI * 2,
					Math.random() * 0.3
				);
				stone.scale.y = 0.35 + Math.random() * 0.3;
				scene.add(stone);
			}

			// === Pavilion ===
			const pavilion = new THREE.Group();
			const woodMat = new THREE.MeshStandardMaterial({ color: 0x383022, roughness: 0.85 });
			const woodMat2 = new THREE.MeshStandardMaterial({ color: 0x3a3225, roughness: 0.85 });
			const roofMat = new THREE.MeshStandardMaterial({ color: 0x423828, roughness: 0.9 });
			const baseMat = new THREE.MeshStandardMaterial({ color: 0x423b30, roughness: 0.92 });

			// Foundation
			const foundation = new THREE.Mesh(
				new THREE.BoxGeometry(7, 0.5, 5),
				baseMat
			);
			foundation.position.y = 0.25;
			pavilion.add(foundation);

			// Pillar positions
			const corners = [
				{ x: -2.8, z: -1.8, h: 3.5, lean: 0.02 },
				{ x: 2.8, z: -1.8, h: 3.5, lean: 0 },
				{ x: -2.8, z: 1.8, h: 2.0, lean: 0.06 },
				{ x: 2.8, z: 1.8, h: 1.2, lean: 0.09 }
			];

			corners.forEach((c, i) => {
				// Stone base
				const base = new THREE.Mesh(
					new THREE.CylinderGeometry(0.4, 0.45, 0.3, 8),
					baseMat
				);
				base.position.set(c.x, 0.65, c.z);
				pavilion.add(base);

				// Wooden pillar
				const pillar = new THREE.Mesh(
					new THREE.CylinderGeometry(0.16, 0.2, c.h, 8),
					i % 2 === 0 ? woodMat : woodMat2
				);
				pillar.position.set(c.x + c.lean, 0.8 + c.h / 2, c.z);
				pillar.rotation.z = c.lean * 0.4;
				pavilion.add(pillar);

				// Jagged top on broken pillars
				if (c.h < 3.5) {
					const jagged = new THREE.Mesh(
						new THREE.CylinderGeometry(0.1, 0.16, 0.4, 5),
						woodMat2
					);
					jagged.position.set(c.x + c.lean, 0.8 + c.h, c.z);
					jagged.rotation.z = c.lean * 0.4 + 0.2;
					jagged.rotation.x = 0.15;
					pavilion.add(jagged);
				}
			});

			// Back beam (intact)
			const beam1 = new THREE.Mesh(
				new THREE.BoxGeometry(6, 0.18, 0.18),
				woodMat
			);
			beam1.position.set(0, 4.3, -1.8);
			pavilion.add(beam1);

			// Left side beam (partially collapsed)
			const beam2 = new THREE.Mesh(
				new THREE.BoxGeometry(0.18, 0.18, 3),
				woodMat2
			);
			beam2.position.set(-2.8, 4.1, 0);
			beam2.rotation.z = 0.12;
			pavilion.add(beam2);

			// Roof main section
			const roof = new THREE.Mesh(
				new THREE.BoxGeometry(8, 0.12, 4.5),
				roofMat
			);
			roof.position.set(0.3, 4.7, -1.5);
			roof.rotation.x = -0.12;
			roof.rotation.z = 0.04;
			pavilion.add(roof);

			// Roof edge (decorative, partially broken)
			const roofEdge = new THREE.Mesh(
				new THREE.BoxGeometry(8.2, 0.08, 0.3),
				roofMat
			);
			roofEdge.position.set(0.3, 4.55, 0.6);
			roofEdge.rotation.x = -0.12;
			pavilion.add(roofEdge);

			// Fallen roof fragment
			const fallenRoof = new THREE.Mesh(
				new THREE.BoxGeometry(2.2, 0.1, 1.6),
				roofMat
			);
			fallenRoof.position.set(4, 0.35, 3);
			fallenRoof.rotation.set(0.25, 0.7, 0.15);
			pavilion.add(fallenRoof);

			// Fallen beam
			const fallenBeam = new THREE.Mesh(
				new THREE.BoxGeometry(2.5, 0.18, 0.18),
				woodMat2
			);
			fallenBeam.position.set(-3.5, 0.55, 3.5);
			fallenBeam.rotation.set(0.1, 0.6, 0.05);
			pavilion.add(fallenBeam);

			pavilion.position.set(0, 0, -2);
			scene.add(pavilion);

			// === Reeds ===
			const reedCount = 1200;
			const reedGeo = new THREE.PlaneGeometry(0.05, 1.6, 1, 3);
			reedGeo.translate(0, 0.8, 0);
			reedUniforms = {
				uTime: { value: 0 },
				uColor: { value: new THREE.Color('#7a6d4a') },
				uColorTip: { value: new THREE.Color('#a89868') }
			};
			const reedMat = new THREE.ShaderMaterial({
				uniforms: reedUniforms,
				side: THREE.DoubleSide,
				transparent: true,
				vertexShader: `
					uniform float uTime;
					varying float vY;
					void main() {
						vec3 pos = position;
						float wind = sin(uTime * 0.7 + pos.x * 0.4 + pos.z * 0.3) * 0.12;
						float gust = sin(uTime * 0.3) * 0.05;
						pos.x += (wind + gust) * pos.y;
						pos.z += wind * 0.3 * pos.y;
						vY = pos.y;
						gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
					}
				`,
				fragmentShader: `
					uniform vec3 uColor;
					uniform vec3 uColorTip;
					varying float vY;
					void main() {
						vec3 col = mix(uColor * 0.55, uColorTip, smoothstep(0.0, 1.6, vY));
						gl_FragColor = vec4(col, 0.82);
					}
				`
			});
			const reeds = new THREE.InstancedMesh(reedGeo, reedMat, reedCount);
			const dummy = new THREE.Object3D();
			let placed = 0;
			for (let i = 0; i < reedCount * 2 && placed < reedCount; i++) {
				const angle = Math.random() * Math.PI * 2;
				const radius = 5 + Math.random() * 20;
				const x = Math.cos(angle) * radius;
				const z = Math.sin(angle) * radius - 3;
				// Skip center area (pavilion)
				if (Math.abs(x) < 4.5 && z > -5 && z < 4) continue;

				const scale = 0.5 + Math.random() * 0.7;
				dummy.position.set(x, 0, z);
				dummy.rotation.y = Math.random() * Math.PI;
				dummy.scale.set(1, scale, 1);
				dummy.updateMatrix();
				reeds.setMatrixAt(placed, dummy.matrix);
				placed++;
			}
			reeds.count = placed;
			reeds.instanceMatrix.needsUpdate = true;
			scene.add(reeds);

			// === Birds ===
			const birdPositions = new Float32Array(birdCount * 3);
			birdVel = new Float32Array(birdCount * 3);
			for (let i = 0; i < birdCount; i++) {
				birdPositions[i * 3] = (Math.random() - 0.5) * 30;
				birdPositions[i * 3 + 1] = 8 + Math.random() * 5;
				birdPositions[i * 3 + 2] = -10 - Math.random() * 15;
				birdVel[i * 3] = -0.015 - Math.random() * 0.01;
				birdVel[i * 3 + 1] = 0;
				birdVel[i * 3 + 2] = 0.008 + Math.random() * 0.004;
			}
			birdGeo = new THREE.BufferGeometry();
			birdGeo.setAttribute('position', new THREE.BufferAttribute(birdPositions, 3));

			// Bird texture (simple V-shape)
			const birdCanvas = document.createElement('canvas');
			birdCanvas.width = 32;
			birdCanvas.height = 32;
			const bctx = birdCanvas.getContext('2d');
			bctx.fillStyle = 'rgba(30,25,20,0.9)';
			bctx.beginPath();
			bctx.moveTo(16, 8);
			bctx.lineTo(4, 24);
			bctx.lineTo(16, 19);
			bctx.lineTo(28, 24);
			bctx.closePath();
			bctx.fill();
			const birdTex = new THREE.CanvasTexture(birdCanvas);

			const birdMat = new THREE.PointsMaterial({
				size: 0.5,
				sizeAttenuation: true,
				transparent: true,
				opacity: 0.7,
				map: birdTex,
				alphaTest: 0.1,
				color: 0x1a1612
			});
			scene.add(new THREE.Points(birdGeo, birdMat));

			// === Lighting ===
			const sunLight = new THREE.DirectionalLight(0xf5d4a0, 1.1);
			sunLight.position.set(-20, 4, -8);
			scene.add(sunLight);

			scene.add(new THREE.AmbientLight(0x7a7060, 0.35));
			scene.add(new THREE.HemisphereLight(0xc4b498, 0x3a3528, 0.25));

			// === Post-processing ===
			composer = new EffectComposer(renderer);
			composer.addPass(new RenderPass(scene, camera));
			bloomPass = new UnrealBloomPass(
				new THREE.Vector2(w, h), 0.35, 0.5, 0.88
			);
			composer.addPass(bloomPass);
			composer.addPass(new FilmPass(0.12, false));
			composer.addPass(new OutputPass());

			// === Events ===
			container.addEventListener('mousemove', onMouseMove);

			// === Animate ===
			animate();
		}

		function onMouseMove(e) {
			const rect = container.getBoundingClientRect();
			mouseTargetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
			mouseTargetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
		}

		function resize(w, h) {
			if (!renderer || !camera) return;
			renderer.setSize(w, h);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			if (composer) composer.setSize(w, h);
			if (bloomPass) bloomPass.setSize(w, h);
		}

		function animate() {
			animationId = requestAnimationFrame(animate);
			const time = clock.getElapsedTime();

			if (waterUniforms) waterUniforms.uTime.value = time;
			if (reedUniforms) reedUniforms.uTime.value = time;

			// Smooth mouse
			mouseX += (mouseTargetX - mouseX) * 0.04;
			mouseY += (mouseTargetY - mouseY) * 0.04;

			if (!reduced) {
				// Slow dolly forward
				camera.position.z = cameraBaseZ - time * 0.015;
				camera.position.x = mouseX * 1.2;
				camera.position.y = 3.5 + mouseY * 0.4;
			}
			camera.lookAt(0, 2.5, -5);

			// Birds
			if (birdGeo && !reduced) {
				const pos = birdGeo.attributes.position.array;
				for (let i = 0; i < birdCount; i++) {
					pos[i * 3] += birdVel[i * 3];
					pos[i * 3 + 1] += Math.sin(time * 0.8 + i * 0.7) * 0.008;
					pos[i * 3 + 2] += birdVel[i * 3 + 2];
					if (pos[i * 3] < -18) pos[i * 3] = 18;
					if (pos[i * 3 + 2] > 8) pos[i * 3 + 2] = -25;
				}
				birdGeo.attributes.position.needsUpdate = true;
			}

			composer.render();
		}

		cleanup = () => {
			if (animationId) cancelAnimationFrame(animationId);
			ro.disconnect();
			container.removeEventListener('mousemove', onMouseMove);
			if (renderer) {
				renderer.dispose();
				if (renderer.domElement && renderer.domElement.parentNode) {
					renderer.domElement.parentNode.removeChild(renderer.domElement);
				}
			}
			if (scene) {
				scene.traverse((obj) => {
					if (obj.geometry) obj.geometry.dispose();
					if (obj.material) {
						if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
						else obj.material.dispose();
					}
				});
			}
		};
	});

	onDestroy(() => {
		if (cleanup) cleanup();
	});
</script>

<div class="wabi-scene" bind:this={container}></div>

<style>
	.wabi-scene {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		overflow: hidden;
	}
	.wabi-scene :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
	}
</style>
