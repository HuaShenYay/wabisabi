<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
	import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

	let container;
	let cleanup = null;

	// ===== Tunable composition & palette =====
	const CONFIG = {
		camera: {
			fov: 30,
			pos: [0.5, 3.2, 15.5],
			look: [-2.4, 2.9, -2.5],
			dolly: 0.012
		},
		// Explicit world position of the sun (right third, moderate height, far)
		sunWorld: [9, 6.8, -40],
		torii: { x: -3.6, z: -1.0, halfWidth: 1.85, height: 5.2 },
		colors: {
			skyZenith: '#aaa98c',
			skyHorizon: '#ddb082',
			skyLow: '#8e987d',
			sun: '#f3865d',
			sunCore: '#ffd0a2',
			fog: '#9e9b7e',
			waterNear: '#6d7360',
			waterFar: '#a99f7f',
			waterSun: '#ffbe86',
			wood: '#463b2f',
			woodDark: '#372f26',
			stone: '#6b6858',
			stoneWet: '#5a5b4d',
			reed: '#9c4a34',
			reedTip: '#b86a4a',
			bird: '#241f1a'
		}
	};

	onMount(() => {
		let renderer, scene, camera, composer, clock;
		let animationId = null;
		let waterUniforms, reedUniforms, skyUniforms;
		let birds = [];
		let sunSprite, sunGlow;
		let cameraBaseX, cameraBaseY, cameraBaseZ;
		let lookTarget = new THREE.Vector3(...CONFIG.camera.look);
		let mouseTargetX = 0, mouseTargetY = 0, mouseX = 0, mouseY = 0;
		let bloomPass;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const sunWorld = new THREE.Vector3(...CONFIG.sunWorld);
		// Sun direction points from the scene focus toward the sun (surface-to-sun)
		const sunDir = sunWorld.clone().sub(new THREE.Vector3(...CONFIG.camera.look)).normalize();
		const C = CONFIG.colors;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const w = entry.contentRect.width;
				const h = entry.contentRect.height;
				if (w > 0 && h > 0) {
					if (!scene) initScene(w, h);
					else resize(w, h);
				}
			}
		});
		ro.observe(container);

		// ---------- Canvas texture helpers ----------
		function radialSprite(inner, outer, size = 128) {
			const c = document.createElement('canvas');
			c.width = c.height = size;
			const ctx = c.getContext('2d');
			const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
			g.addColorStop(0, inner);
			g.addColorStop(0.5, outer);
			g.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, size, size);
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			return t;
		}

		function discSprite(core, edge, size = 128) {
			const c = document.createElement('canvas');
			c.width = c.height = size;
			const ctx = c.getContext('2d');
			const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
			g.addColorStop(0, core);
			g.addColorStop(0.55, edge);
			g.addColorStop(0.68, edge);
			g.addColorStop(0.78, 'rgba(255,150,100,0.25)');
			g.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, size, size);
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			return t;
		}

		function birdTexture() {
			const c = document.createElement('canvas');
			c.width = c.height = 64;
			const ctx = c.getContext('2d');
			ctx.strokeStyle = C.bird;
			ctx.lineWidth = 6;
			ctx.lineCap = 'round';
			ctx.beginPath();
			// gull "M" silhouette
			ctx.moveTo(6, 42);
			ctx.quadraticCurveTo(22, 20, 32, 33);
			ctx.quadraticCurveTo(42, 20, 58, 42);
			ctx.stroke();
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			return t;
		}

		function duckTexture() {
			const c = document.createElement('canvas');
			c.width = c.height = 128;
			const ctx = c.getContext('2d');
			ctx.fillStyle = '#1c1712';
			// body
			ctx.beginPath();
			ctx.ellipse(66, 78, 34, 20, 0, 0, Math.PI * 2);
			ctx.fill();
			// chest / neck
			ctx.beginPath();
			ctx.moveTo(44, 78);
			ctx.quadraticCurveTo(40, 48, 52, 40);
			ctx.quadraticCurveTo(60, 36, 60, 52);
			ctx.quadraticCurveTo(58, 68, 62, 80);
			ctx.fill();
			// head
			ctx.beginPath();
			ctx.arc(52, 40, 11, 0, Math.PI * 2);
			ctx.fill();
			// tail
			ctx.beginPath();
			ctx.moveTo(96, 72);
			ctx.lineTo(112, 66);
			ctx.lineTo(98, 82);
			ctx.fill();
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			return t;
		}

		function reedTexture() {
			const c = document.createElement('canvas');
			c.width = 128;
			c.height = 256;
			const ctx = c.getContext('2d');
			const blades = 22;
			for (let i = 0; i < blades; i++) {
				const baseX = 20 + Math.random() * 88;
				const topX = baseX + (Math.random() - 0.5) * 40;
				const w = 2 + Math.random() * 3;
				const topY = 20 + Math.random() * 60;
				const grad = ctx.createLinearGradient(0, 256, 0, topY);
				grad.addColorStop(0, '#633d2e');
				grad.addColorStop(0.55, '#8a4c38');
				grad.addColorStop(1, '#9e6d51');
				ctx.strokeStyle = grad;
				ctx.lineWidth = w;
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(baseX, 256);
				ctx.quadraticCurveTo((baseX + topX) / 2, 130, topX, topY);
				ctx.stroke();

				// a few drooping leaves for density
				ctx.fillStyle = 'rgba(105,70,48,0.72)';
				for (let j = 0; j < 3; j++) {
					const leafY = 100 + Math.random() * 110;
					const dir = Math.random() > 0.5 ? 1 : -1;
					ctx.beginPath();
					ctx.moveTo(baseX, leafY);
					ctx.quadraticCurveTo(baseX + dir * 12, leafY - 10, baseX + dir * (18 + Math.random() * 16), leafY - 5);
					ctx.quadraticCurveTo(baseX + dir * 10, leafY, baseX, leafY);
					ctx.fill();
				}
			}
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			return t;
		}

		function reflectionTexture() {
			const c = document.createElement('canvas');
			c.width = 128;
			c.height = 256;
			const ctx = c.getContext('2d');
			ctx.fillStyle = 'rgba(0,0,0,0)';
			ctx.fillRect(0, 0, 128, 256);
			// vertical soft dark bands mimicking pillars mirrored
			ctx.filter = 'blur(4px)';
			ctx.fillStyle = 'rgba(20,17,13,0.55)';
			ctx.fillRect(40, 0, 12, 220);
			ctx.fillRect(80, 0, 12, 220);
			ctx.fillRect(30, 10, 72, 16);
			const t = new THREE.CanvasTexture(c);
			t.colorSpace = THREE.SRGBColorSpace;
			return t;
		}

		function initScene(w, h) {
			clock = new THREE.Clock();

			// === Renderer ===
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
			renderer.setSize(w, h);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 0.68;
			renderer.shadowMap.enabled = false;
			container.appendChild(renderer.domElement);

			// === Scene + Fog ===
			scene = new THREE.Scene();
			scene.background = new THREE.Color(C.fog);
			scene.fog = new THREE.FogExp2(new THREE.Color(C.fog).getHex(), 0.019);

			// === Camera ===
			[cameraBaseX, cameraBaseY, cameraBaseZ] = CONFIG.camera.pos;
			camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, w / h, 0.1, 200);
			camera.position.set(cameraBaseX, cameraBaseY, cameraBaseZ);
			camera.lookAt(lookTarget);

			buildSky();
			buildWater();
			buildTorii();
			buildStones();
			buildBench();
			buildReeds();
			buildReflection();
			buildBirds();
			buildDuck();
			buildLights();
			buildPost(w, h);

			container.addEventListener('mousemove', onMouseMove);
			animate();
		}

		// ---------- Sky + sun ----------
		function buildSky() {
			skyUniforms = {
				uZenith: { value: new THREE.Color(C.skyZenith) },
				uHorizon: { value: new THREE.Color(C.skyHorizon) },
				uLow: { value: new THREE.Color(C.skyLow) },
				uSunColor: { value: new THREE.Color(C.sun) },
				uSunDir: { value: sunDir.clone() }
			};
			const skyMat = new THREE.ShaderMaterial({
				side: THREE.BackSide,
				depthWrite: false,
				fog: false,
				uniforms: skyUniforms,
				vertexShader: `
					varying vec3 vDir;
					void main() {
						vDir = position;
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}
				`,
				fragmentShader: `
					uniform vec3 uZenith;
					uniform vec3 uHorizon;
					uniform vec3 uLow;
					uniform vec3 uSunColor;
					uniform vec3 uSunDir;
					varying vec3 vDir;
					void main() {
						vec3 d = normalize(vDir);
						float t = d.y;
						vec3 sky = mix(uHorizon, uZenith, smoothstep(0.0, 0.55, t));
						sky = mix(uLow, sky, smoothstep(-0.15, 0.08, t));
						float s = max(dot(d, normalize(uSunDir)), 0.0);
						sky += uSunColor * pow(s, 3.2) * 0.55;
						sky += uSunColor * pow(s, 40.0) * 0.9;
						gl_FragColor = vec4(sky, 1.0);
					}
				`
			});
			const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), skyMat);
			sky.frustumCulled = false;
			scene.add(sky);

			// Sun disc + glow sprites placed at the configured sun world position
			const sunPos = sunWorld.clone();
			sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
				map: radialSprite('rgba(255,190,140,0.85)', 'rgba(255,150,100,0.25)', 256),
				transparent: true,
				depthWrite: false,
				depthTest: false,
				blending: THREE.AdditiveBlending,
				fog: false
			}));
			sunGlow.position.copy(sunPos);
			sunGlow.scale.set(8.5, 8.5, 1);
			sunGlow.material.opacity = 0.52;
			sunGlow.renderOrder = 1;
			scene.add(sunGlow);

			sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
				map: discSprite(C.sunCore, C.sun, 128),
				transparent: true,
				depthWrite: false,
				depthTest: false,
				fog: false
			}));
			sunSprite.position.copy(sunPos);
			sunSprite.scale.set(3.2, 3.2, 1);
			sunSprite.material.opacity = 0.92;
			sunSprite.renderOrder = 2;
			scene.add(sunSprite);
		}

		// ---------- Water ----------
		function buildWater() {
			const geo = new THREE.PlaneGeometry(400, 400, 48, 48);
			geo.rotateX(-Math.PI / 2);
			waterUniforms = {
				uTime: { value: 0 },
				uNear: { value: new THREE.Color(C.waterNear) },
				uFar: { value: new THREE.Color(C.waterFar) },
				uSun: { value: new THREE.Color(C.waterSun) },
				uFog: { value: new THREE.Color(C.fog) },
				uSunDir: { value: sunDir.clone() },
				uCam: { value: new THREE.Vector3() }
			};
			const mat = new THREE.ShaderMaterial({
				uniforms: waterUniforms,
				fog: false,
				vertexShader: `
					uniform float uTime;
					varying vec3 vWorld;
					varying vec2 vWaterUv;
					void main() {
						vec3 p = position;
						float broadWave =
							sin(p.x * 0.16 + uTime * 0.35) * 0.025 +
							cos(p.z * 0.13 + uTime * 0.28) * 0.020;
						p.y += broadWave;
						vec4 wp = modelMatrix * vec4(p, 1.0);
						vWorld = wp.xyz;
						vWaterUv = p.xz;
						gl_Position = projectionMatrix * viewMatrix * wp;
					}
				`,
				fragmentShader: `
					uniform float uTime;
					uniform vec3 uNear;
					uniform vec3 uFar;
					uniform vec3 uSun;
					uniform vec3 uFog;
					uniform vec3 uSunDir;
					uniform vec3 uCam;
					varying vec3 vWorld;
					varying vec2 vWaterUv;
					void main() {
						float dist = length(vWorld.xz - uCam.xz);
						float depthMix = smoothstep(3.0, 45.0, dist);
						vec3 color = mix(uNear, uFar, depthMix);

						// fine ripples baked into the surface normal
						vec2 waveA = vec2(
							sin(vWaterUv.y * 2.7 - uTime * 1.1),
							cos(vWaterUv.x * 3.2 + uTime * 0.8)
						);
						vec2 waveB = vec2(
							sin((vWaterUv.x + vWaterUv.y) * 5.1 + uTime * 0.6),
							cos((vWaterUv.x - vWaterUv.y) * 4.3 - uTime * 0.9)
						);
						vec3 N = normalize(vec3(
							(waveA.x + waveB.x * 0.45) * 0.055,
							1.0,
							(waveA.y + waveB.y * 0.45) * 0.055
						));

						// surface-to-camera and surface-to-sun, blinn-phong style
						vec3 V = normalize(uCam - vWorld);
						vec3 L = normalize(uSunDir);
						vec3 H = normalize(V + L);
						float spec = max(dot(N, H), 0.0);

						float broad = pow(spec, 18.0) * 0.22;
						float glitter = pow(spec, 120.0) * 0.95;

						// constrain the reflection band width so the right side does not blow out
						float pathMask = exp(-pow((vWorld.x - 5.0) * 0.22, 2.0));
						float broken = 0.45 + 0.55 *
							sin(vWorld.z * 12.0 + uTime * 1.3) *
							sin(vWorld.x * 8.0 - uTime * 0.7);
						broken = max(broken, 0.0);

						color += uSun * (broad + glitter * broken) * pathMask;

						// grazing-angle sky reflection softens the horizon
						float fres = pow(1.0 - max(dot(V, N), 0.0), 4.0);
						color = mix(color, uFog, fres * 0.55);

						float fogF = smoothstep(14.0, 60.0, dist);
						color = mix(color, uFog, fogF);
						gl_FragColor = vec4(color, 1.0);
					}
				`
			});
			const water = new THREE.Mesh(geo, mat);
			water.position.y = -0.02;
			scene.add(water);
		}

		// ---------- Torii ----------
		function makeWeathered(geo, amount = 0.03) {
			const pos = geo.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				pos.setXYZ(
					i,
					pos.getX(i) + (Math.random() - 0.5) * amount,
					pos.getY(i) + (Math.random() - 0.5) * amount,
					pos.getZ(i) + (Math.random() - 0.5) * amount
				);
			}
			pos.needsUpdate = true;
			geo.computeVertexNormals();
			return geo;
		}

		function createWeatheredWoodMaterial({
			base = '#564838',
			dark = '#251f19',
			moss = '#65705b',
			roughness = 0.82
		} = {}) {
			return new THREE.ShaderMaterial({
				uniforms: {
					uBase: { value: new THREE.Color(base) },
					uDark: { value: new THREE.Color(dark) },
					uMoss: { value: new THREE.Color(moss) },
					uSunDir: { value: sunDir.clone() },
					uFogColor: { value: new THREE.Color(C.fog) },
					uFogDensity: { value: 0.019 },
					uRoughness: { value: roughness },
					uGrainAxis: { value: new THREE.Vector3(0, 1, 0) }
				},
				vertexShader: `
					varying vec3 vWorldPos;
					varying vec3 vWorldNormal;
					varying vec3 vLocalPos;
					varying vec3 vViewPos;
					void main() {
						vLocalPos = position;
						vec4 worldPos = modelMatrix * vec4(position, 1.0);
						vWorldPos = worldPos.xyz;
						vWorldNormal = normalize(mat3(transpose(inverse(modelMatrix))) * normal);
						vec4 viewPos = viewMatrix * worldPos;
						vViewPos = viewPos.xyz;
						gl_Position = projectionMatrix * viewPos;
					}
				`,
				fragmentShader: `
					precision highp float;
					uniform vec3 uBase;
					uniform vec3 uDark;
					uniform vec3 uMoss;
					uniform vec3 uSunDir;
					uniform vec3 uFogColor;
					uniform float uFogDensity;
					uniform float uRoughness;
					uniform vec3 uGrainAxis;
					varying vec3 vWorldPos;
					varying vec3 vWorldNormal;
					varying vec3 vLocalPos;
					varying vec3 vViewPos;
					float hash31(vec3 p) {
						p = fract(p * 0.1031);
						p += dot(p, p.yzx + 33.33);
						return fract((p.x + p.y) * p.z);
					}
					float noise3(vec3 p) {
						vec3 i = floor(p);
						vec3 f = fract(p);
						f = f * f * (3.0 - 2.0 * f);
						return mix(
							mix(
								mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
								mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x),
								f.y),
							mix(
								mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
								mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x),
								f.y),
							f.z);
					}
					float fbm(vec3 p) {
						float value = 0.0;
						float amplitude = 0.5;
						for (int i = 0; i < 4; i++) {
							value += noise3(p) * amplitude;
							p = p * 2.03 + 9.17;
							amplitude *= 0.5;
						}
						return value;
					}
					void main() {
						vec3 N = normalize(vWorldNormal);
						vec3 L = normalize(uSunDir);
						vec3 V = normalize(cameraPosition - vWorldPos);

						float coarse = fbm(vWorldPos * 0.75);
						float speckle = noise3(vWorldPos * 8.0);

						// grain runs along the member's dominant axis
						vec3 axis = normalize(uGrainAxis);
						float along = dot(vLocalPos, axis);
						vec3 acrossVec = vLocalPos - axis * along;
						float grain = fbm(vec3(length(acrossVec) * 3.0, along * 7.5, coarse * 1.4));
						grain += sin(along * 22.0 + coarse * 6.0) * 0.06;
						grain = clamp(grain, 0.0, 1.0);

						vec3 albedo = mix(uDark, uBase, 0.35 + grain * 0.65);

						float rotMask = smoothstep(0.52, 0.76, coarse);
						albedo = mix(albedo, uDark * 0.72, rotMask * 0.65);

						float upward = smoothstep(0.15, 0.9, N.y);
						float mossNoise = smoothstep(0.48, 0.72, fbm(vWorldPos * 1.4));
						albedo = mix(albedo, uMoss, upward * mossNoise * 0.48);

						float wear = smoothstep(0.91, 0.98, speckle);
						albedo = mix(albedo, vec3(0.42, 0.39, 0.31), wear * 0.45);

						float hemi = N.y * 0.5 + 0.5;
						float ambient = 0.28 + hemi * 0.20;
						float wrapDiffuse = max((dot(N, L) + 0.45) / 1.45, 0.0);
						float diffuse = max(dot(N, L), 0.0);

						float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);
						float backLight = pow(max(dot(-N, L), 0.0), 3.0);
						vec3 rimColor = vec3(1.0, 0.51, 0.28);

						vec3 color = albedo * (ambient + wrapDiffuse * 0.42 + diffuse * 0.10);
						color += rimColor * rim * backLight * 0.15;

						float dist = length(vViewPos);
						float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
						color = mix(color, uFogColor, clamp(fogFactor * 0.72, 0.0, 0.82));

						gl_FragColor = vec4(color, 1.0);
					}
				`
			});
		}

		function createDecayedBeam({
			length = 6,
			height = 0.5,
			depth = 0.65,
			segments = 18,
			sag = 0.12,
			seed = 1
		} = {}) {
			const geo = new THREE.BoxGeometry(length, height, depth, segments, 2, 2);
			const pos = geo.attributes.position;
			for (let i = 0; i < pos.count; i++) {
				const x = pos.getX(i);
				const y = pos.getY(i);
				const z = pos.getZ(i);
				const nx = x / (length * 0.5);
				const edge = Math.abs(nx);
				const centerSag = -(1.0 - nx * nx) * sag;
				const rightDecay = THREE.MathUtils.smoothstep(nx, 0.35, 1.0) * -0.14;
				const rough =
					Math.sin(x * 4.7 + seed) * 0.025 +
					Math.sin(x * 11.3 + seed * 2.0) * 0.012;
				const edgeDamage = Math.pow(edge, 5.0) * 0.07;
				const zRough = Math.sin(x * 8.0 + z * 9.0) * 0.018;
				pos.setXYZ(
					i,
					x + rough * 0.35,
					y + centerSag + rightDecay + rough + (Math.random() - 0.5) * edgeDamage,
					z + zRough + (Math.random() - 0.5) * 0.018
				);
			}
			pos.needsUpdate = true;
			geo.computeVertexNormals();
			geo.computeBoundingSphere();
			return geo;
		}

		function addBeamCap(parent, x, flip, material, H, hw) {
			const cap = new THREE.Mesh(
				createDecayedBeam({
					length: 1.15,
					height: 0.42,
					depth: 0.7,
					segments: 5,
					sag: -0.035,
					seed: flip > 0 ? 11 : 17
				}),
				material
			);
			cap.position.set(x, H + 0.5, 0);
			cap.rotation.z = flip * 0.10;
			parent.add(cap);
		}

		function vineTexture() {
			const c = document.createElement('canvas');
			c.width = 128;
			c.height = 256;
			const ctx = c.getContext('2d');
			ctx.clearRect(0, 0, c.width, c.height);
			ctx.lineCap = 'round';
			for (let i = 0; i < 12; i++) {
				const startX = 20 + Math.random() * 88;
				const endX = startX + (Math.random() - 0.5) * 40;
				const endY = 130 + Math.random() * 120;
				const grad = ctx.createLinearGradient(0, 0, 0, endY);
				grad.addColorStop(0, 'rgba(50,45,29,0.95)');
				grad.addColorStop(1, 'rgba(83,70,40,0.25)');
				ctx.strokeStyle = grad;
				ctx.lineWidth = 1 + Math.random() * 2;
				ctx.beginPath();
				ctx.moveTo(startX, 0);
				ctx.bezierCurveTo(
					startX + (Math.random() - 0.5) * 20, endY * 0.3,
					endX + (Math.random() - 0.5) * 18, endY * 0.7,
					endX, endY
				);
				ctx.stroke();
				for (let j = 0; j < 4; j++) {
					const y = 30 + Math.random() * Math.max(40, endY - 40);
					ctx.fillStyle = 'rgba(71,64,39,0.65)';
					ctx.beginPath();
					ctx.ellipse(
						startX + (Math.random() - 0.5) * 18, y,
						2 + Math.random() * 3, 5 + Math.random() * 5,
						Math.random(), 0, Math.PI * 2
					);
					ctx.fill();
				}
			}
			const tex = new THREE.CanvasTexture(c);
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.generateMipmaps = true;
			return tex;
		}

		function buildTorii() {
			const t = CONFIG.torii;
			const g = new THREE.Group();
			const woodVertical = createWeatheredWoodMaterial({
				base: '#615343',
				dark: '#29231d',
				moss: '#66705c'
			});
			woodVertical.uniforms.uGrainAxis.value.set(0, 1, 0);
			const woodHorizontal = createWeatheredWoodMaterial({
				base: '#594b3d',
				dark: '#251f1a',
				moss: '#606957'
			});
			woodHorizontal.uniforms.uGrainAxis.value.set(1, 0, 0);
			const wood = woodVertical;
			const woodDark = woodHorizontal;

			const hw = t.halfWidth;
			const H = t.height;

			// Two pillars (slightly tapered, slight lean)
			const pillarGeo = makeWeathered(new THREE.CylinderGeometry(0.24, 0.3, H, 10), 0.04);
			const pL = new THREE.Mesh(pillarGeo, wood);
			pL.position.set(-hw, H / 2, 0);
			pL.rotation.z = 0.02;
			g.add(pL);
			const pR = new THREE.Mesh(pillarGeo, wood);
			pR.position.set(hw, H / 2, 0);
			pR.rotation.z = -0.015;
			g.add(pR);

			// Nuki (lower crossbeam) extends beyond pillars
			const nuki = new THREE.Mesh(
				makeWeathered(new THREE.BoxGeometry(hw * 2 + 1.0, 0.34, 0.4), 0.03),
				woodHorizontal
			);
			nuki.position.set(0, H * 0.66, 0);
			nuki.rotation.z = -0.012;
			g.add(nuki);

			// Shimaki (upper beam) just under kasagi
			const shimaki = new THREE.Mesh(
				makeWeathered(new THREE.BoxGeometry(hw * 2 + 1.7, 0.32, 0.5), 0.03),
				woodHorizontal
			);
			shimaki.position.set(-0.05, H + 0.05, 0);
			shimaki.rotation.z = -0.03;
			g.add(shimaki);

			// Kasagi (top beam) — segmented, sagging, decayed toward the right end
			const kasagi = new THREE.Mesh(
				createDecayedBeam({
					length: hw * 2 + 2.5,
					height: 0.52,
					depth: 0.68,
					segments: 20,
					sag: 0.10,
					seed: 4
				}),
				woodHorizontal
			);
			kasagi.position.set(-0.05, H + 0.46, 0);
			kasagi.rotation.z = -0.025;
			g.add(kasagi);
			addBeamCap(g, -hw - 1.6, -1, woodHorizontal, H, hw);
			addBeamCap(g, hw + 1.6, 1, woodHorizontal, H, hw);

			// Gakuzuka (center plaque)
			const plaque = new THREE.Mesh(
				new THREE.BoxGeometry(0.7, 0.9, 0.14),
				woodDark
			);
			plaque.position.set(0.05, H * 0.83, 0.05);
			g.add(plaque);

			// Shimenawa hint: sagging rope between pillars
			const rope = new THREE.Mesh(
				new THREE.CylinderGeometry(0.07, 0.07, hw * 2, 6),
				new THREE.MeshLambertMaterial({ color: '#6a5a3c' })
			);
			rope.rotation.z = Math.PI / 2;
			rope.position.set(0, H * 0.6, 0.35);
			g.add(rope);

			// Hanging vines / thin branch clusters with alpha-tested branch texture
			const vineMat = new THREE.MeshBasicMaterial({
				map: vineTexture(),
				color: '#817250',
				alphaTest: 0.25,
				transparent: false,
				side: THREE.DoubleSide,
				depthWrite: true,
				fog: true
			});
			const vinePos = [-1.3, -0.9, -0.4, 0.2, 0.7, 1.15];
			vinePos.forEach((vx) => {
				const len = 0.7 + Math.random() * 1.6;
				const vine = new THREE.Mesh(new THREE.PlaneGeometry(0.65, len), vineMat);
				vine.position.set(vx, H * 0.6 - len / 2 + 0.15, 0.3);
				vine.rotation.z = (Math.random() - 0.5) * 0.12;
				g.add(vine);
			});

			g.position.set(t.x, 0, t.z);
			scene.add(g);

			// Secondary broken frame to the right of the torii (石台 fence remnant)
			const frame = new THREE.Group();
			const fPostGeo = makeWeathered(new THREE.CylinderGeometry(0.16, 0.2, 2.6, 8), 0.03);
			const fp1 = new THREE.Mesh(fPostGeo, wood);
			fp1.position.set(-0.9, 1.3, 0);
			frame.add(fp1);
			const fp2 = new THREE.Mesh(fPostGeo, wood);
			fp2.position.set(0.9, 1.15, 0);
			fp2.rotation.z = 0.05;
			frame.add(fp2);
			const fBar = new THREE.Mesh(
				makeWeathered(new THREE.BoxGeometry(2.4, 0.22, 0.24), 0.03),
				wood
			);
			fBar.position.set(0, 2.2, 0);
			fBar.rotation.z = -0.04;
			frame.add(fBar);
			const fBar2 = new THREE.Mesh(
				new THREE.BoxGeometry(2.2, 0.16, 0.18),
				wood
			);
			fBar2.position.set(0, 1.2, 0);
			frame.add(fBar2);
			frame.position.set(t.x + 3.4, 0, t.z + 0.3);
			scene.add(frame);
		}

		// ---------- Stone island + stepping path ----------
		function buildStones() {
			const t = CONFIG.torii;
			const islandMat = new THREE.MeshLambertMaterial({ color: C.stone });
			const wetMat = new THREE.MeshLambertMaterial({ color: C.stoneWet });

			// Flat island slabs under the torii so it does not float
			const islandGeo = new THREE.DodecahedronGeometry(1, 0);
			const island = new THREE.InstancedMesh(islandGeo, islandMat, 10);
			const d = new THREE.Object3D();
			for (let i = 0; i < 10; i++) {
				d.position.set(
					t.x + (Math.random() - 0.4) * 4.5,
					0.02,
					t.z + (Math.random() - 0.5) * 2.4
				);
				d.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.06);
				d.scale.set(1.2 + Math.random() * 0.8, 0.16 + Math.random() * 0.08, 1.0 + Math.random() * 0.7);
				d.updateMatrix();
				island.setMatrixAt(i, d.matrix);
			}
			island.instanceMatrix.needsUpdate = true;
			scene.add(island);

			// Stepping stones: from near-center foreground toward the torii
			const stepGeo = new THREE.DodecahedronGeometry(1, 0);
			const count = 26;
			const steps = new THREE.InstancedMesh(stepGeo, wetMat, count);
			for (let i = 0; i < count; i++) {
				const f = i / count;
				// path curves from (0.6, z=7) toward torii base
				const z = 7.0 - f * 8.5;
				const x = THREE.MathUtils.lerp(0.6, t.x + 0.8, f) + (Math.random() - 0.5) * 0.8;
				const wobble = Math.sin(f * 6.0) * 0.5;
				d.position.set(x + wobble, 0.02 + Math.random() * 0.03, z);
				d.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.05);
				d.scale.set(0.7 + Math.random() * 0.5, 0.1 + Math.random() * 0.05, 0.5 + Math.random() * 0.4);
				d.updateMatrix();
				steps.setMatrixAt(i, d.matrix);
			}
			steps.instanceMatrix.needsUpdate = true;
			scene.add(steps);

			// Scattered wet flat stones toward the right (near sun reflection)
			const scatter = new THREE.InstancedMesh(stepGeo, wetMat, 18);
			for (let i = 0; i < 18; i++) {
				d.position.set(
					2 + Math.random() * 12,
					0.01 + Math.random() * 0.03,
					-2 + Math.random() * 8
				);
				d.rotation.set(0, Math.random() * Math.PI, 0);
				d.scale.set(0.5 + Math.random() * 0.9, 0.06 + Math.random() * 0.05, 0.4 + Math.random() * 0.6);
				d.updateMatrix();
				scatter.setMatrixAt(i, d.matrix);
			}
			scatter.instanceMatrix.needsUpdate = true;
			scene.add(scatter);
		}

		// ---------- Bench ----------
		function buildBench() {
			const t = CONFIG.torii;
			const g = new THREE.Group();
			const mat = new THREE.MeshLambertMaterial({ color: '#4d2f24' });
			const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.7), mat);
			top.position.y = 0.62;
			g.add(top);
			const legPositions = [
				[-0.65, -0.28], [0.65, -0.28], [-0.65, 0.28], [0.65, 0.28]
			];
			legPositions.forEach(([lx, lz]) => {
				const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.1), mat);
				leg.position.set(lx, 0.31, lz);
				g.add(leg);
			});
			g.position.set(t.x + 0.4, 0.2, t.z + 2.3);
			g.rotation.y = -0.2;
			scene.add(g);
		}

		// ---------- Reeds ----------
		function buildReeds() {
			const tex = reedTexture();
			reedUniforms = {
				uTime: { value: 0 },
				uMap: { value: tex },
				uFog: { value: new THREE.Color(C.fog) }
			};
			const geo = new THREE.PlaneGeometry(1.1, 1.5, 1, 2);
			geo.translate(0, 0.75, 0);
			const mat = new THREE.ShaderMaterial({
				uniforms: reedUniforms,
				side: THREE.DoubleSide,
				transparent: false,
				vertexShader: `
					uniform float uTime;
					varying vec2 vUv;
					varying vec3 vWorld;
					void main() {
						vUv = uv;
						vec3 p = position;
						float sway = sin(uTime * 0.9 + p.x * 0.5) * 0.1 + sin(uTime * 0.4) * 0.04;
						p.x += sway * p.y * 0.8;
						vec4 wp = instanceMatrix * vec4(p, 1.0);
						vWorld = (modelMatrix * wp).xyz;
						gl_Position = projectionMatrix * modelViewMatrix * wp;
					}
				`,
				fragmentShader: `
					uniform sampler2D uMap;
					uniform vec3 uFog;
					varying vec2 vUv;
					varying vec3 vWorld;
					void main() {
						vec4 tex = texture2D(uMap, vUv);
						if (tex.a < 0.45) discard;
						float dist = length(vWorld.xz);
						float fogF = smoothstep(12.0, 55.0, dist);
						vec3 col = mix(tex.rgb, uFog, fogF * 0.9);
						gl_FragColor = vec4(col, 1.0);
					}
				`
			});

			const total = 170;
			const reeds = new THREE.InstancedMesh(geo, mat, total);
			const d = new THREE.Object3D();
			let n = 0;
			const clumps = [
				// [minX, maxX, minZ, maxZ]
				[-16, -6, 2, 9],   // left foreground bank
				[3, 8, 5, 9],      // right near foreground bank
				[5, 11, 9, 13],    // bold right corner clump (close to camera)
				[9, 15, 3, 8],     // right foreground bank
				[-16, -8, -6, 2],  // left mid
				[9, 16, -6, 2]     // right mid
			];
			for (const [x0, x1, z0, z1] of clumps) {
				const per = total / clumps.length;
				for (let i = 0; i < per && n < total; i++) {
					const x = x0 + Math.random() * (x1 - x0);
					const z = z0 + Math.random() * (z1 - z0);
					const s = 0.7 + Math.random() * 1.1;
					d.position.set(x, 0, z);
					d.rotation.y = Math.random() * Math.PI;
					d.scale.set(s, s * (0.8 + Math.random() * 0.6), s);
					d.updateMatrix();
					reeds.setMatrixAt(n, d.matrix);
					n++;
				}
			}
			reeds.count = n;
			reeds.instanceMatrix.needsUpdate = true;
			scene.add(reeds);
		}

		// ---------- Torii reflection on water ----------
		function buildReflection() {
			const t = CONFIG.torii;
			const mat = new THREE.MeshBasicMaterial({
				map: reflectionTexture(),
				transparent: true,
				opacity: 0.5,
				depthWrite: false,
				fog: false
			});
			const geo = new THREE.PlaneGeometry(4.6, 5.5);
			geo.rotateX(-Math.PI / 2);
			const refl = new THREE.Mesh(geo, mat);
			refl.position.set(t.x, 0.01, t.z + 3.4);
			refl.renderOrder = 0.5;
			scene.add(refl);
		}

		// ---------- Birds ----------
		function buildBirds() {
			const tex = birdTexture();
			const mat = new THREE.SpriteMaterial({
				map: tex,
				transparent: true,
				depthWrite: false,
				opacity: 1.0,
				fog: false
			});
			// flock drifting near the sun (upper right), low enough to sit in frame
			const flockCenter = new THREE.Vector3(4.5, 7.4, -13);
			const flockCount = 16;
			for (let i = 0; i < flockCount; i++) {
				const s = new THREE.Sprite(mat);
				s.position.set(
					flockCenter.x + (Math.random() - 0.5) * 9.0,
					flockCenter.y + (Math.random() - 0.5) * 3.0,
					flockCenter.z + (Math.random() - 0.5) * 5
				);
				const size = 0.85 + Math.random() * 0.7;
				s.scale.set(size, size * 0.5, 1);
				s.renderOrder = 2;
				scene.add(s);
				birds.push({
					sprite: s,
					base: s.position.clone(),
					sp: 0.4 + Math.random() * 0.6,
					ph: Math.random() * Math.PI * 2,
					drift: 0.18 + Math.random() * 0.25
				});
			}
		}

		// ---------- Duck ----------
		function buildDuck() {
			const mat = new THREE.SpriteMaterial({
				map: duckTexture(),
				transparent: true,
				depthWrite: false,
				fog: false
			});
			const duck = new THREE.Sprite(mat);
			duck.position.set(1.6, 0.42, 1.8);
			duck.scale.set(1.0, 1.0, 1);
			duck.renderOrder = 3;
			scene.add(duck);
		}

		// ---------- Lights ----------
		function buildLights() {
			// dark ambient + warm rim, no triple-fill wash
			scene.add(new THREE.HemisphereLight(0xcab48f, 0x30382f, 0.82));
			const sun = new THREE.DirectionalLight(0xffa66f, 1.25);
			sun.position.copy(sunWorld);
			scene.add(sun);
			// faint cool fill from the camera side to reveal surface texture
			const fill = new THREE.DirectionalLight(0x89978d, 0.38);
			fill.position.set(2, 5, 12);
			scene.add(fill);
		}

		// ---------- Post ----------
		function buildPost(w, h) {
			composer = new EffectComposer(renderer);
			composer.addPass(new RenderPass(scene, camera));
			bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.16, 0.32, 0.92);
			composer.addPass(bloomPass);
			composer.addPass(new OutputPass());
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

			if (waterUniforms) {
				waterUniforms.uTime.value = time;
				waterUniforms.uCam.value.copy(camera.position);
			}
			if (reedUniforms) reedUniforms.uTime.value = time;

			mouseX += (mouseTargetX - mouseX) * 0.04;
			mouseY += (mouseTargetY - mouseY) * 0.04;

			if (!reduced) {
				camera.position.x = cameraBaseX + mouseX * 0.8;
				camera.position.y = cameraBaseY + mouseY * 0.35;
				camera.position.z = cameraBaseZ - time * CONFIG.camera.dolly;

				for (const b of birds) {
					b.sprite.position.x = b.base.x - time * b.drift;
					b.sprite.position.y = b.base.y + Math.sin(time * b.sp + b.ph) * 0.25;
					if (b.sprite.position.x < b.base.x - 14) b.base.x += 14;
				}
			}
			camera.lookAt(lookTarget);

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
						const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
						mats.forEach((m) => {
							if (m.map) m.map.dispose();
							m.dispose();
						});
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
