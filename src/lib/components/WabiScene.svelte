<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type * as Three from 'three';

	let { children, view = 'home', onProgress }: { children?: Snippet; view?: 'home' | 'projects'; onProgress?: (progress: number) => void } = $props();
	let changeView: (next: 'home' | 'projects') => void = () => {};
	$effect(() => { changeView(view); });
	let container: HTMLDivElement;
	let dispose = () => {};
	let sceneReady = $state(false);
	let rocksReady = $state(false);
	let unavailable = $state(false);
	let simplified = $state(false);

	onMount(() => {
		let cancelled = false;
		let teardown = () => {};
		dispose = () => {
			cancelled = true;
			teardown();
		};

		void import('./wabi-three.js').then((THREE) => {
			if (cancelled || !container) return;
			const { STLLoader, GLTFLoader, Reflector, mergeGeometries } = THREE;

			const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			let reduced = motionQuery.matches;
			let renderer: Three.WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
			} catch {
				// The editorial layer and navigation remain usable without WebGL.
				unavailable = true;
				return;
			}
			renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.toneMapping = THREE.ACESFilmicToneMapping;
			renderer.toneMappingExposure = 0.96;
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFShadowMap;
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
			container.appendChild(renderer.domElement);
			renderer.domElement.dataset.sceneInstance = crypto.randomUUID();

			/* ===== Reconstructed Mono-ha / Karesansui Sanctuary (枯山水 · 物派残境) =====
			   Stripped of decorative clutter (no sun sprite, no bench, no fence, no reeds,
			   no digital Bayer/halftone dot-matrix). Raw paper-mist and obsidian sumi-ink
			   water form a continuous spatial scroll from Hero through the entire About
			   section, darkening into Night Ink (夜墨) in the final Creed chapter & /projects. */
			const paperBg = new THREE.Color('#eae3d4');
			const nightBg = new THREE.Color('#1b1a17');
			const paperFog = new THREE.Color('#e2dacb');
			const nightFog = new THREE.Color('#1d1c18');

			const scene = new THREE.Scene();
			scene.background = paperBg.clone();
			const fog = new THREE.FogExp2('#e2dacb', 0.034);
			scene.fog = fog;

			const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 160);
			const cameraHome = new THREE.Vector3(0.0, 2.36, 19.4);
			camera.position.copy(cameraHome);
			const lookAt = new THREE.Vector3(1.85, 2.65, -2.2);
			const fromCamera = new THREE.Vector3();
			const fromLook = new THREE.Vector3();
			const destination = new THREE.Vector3();
			const destinationLook = new THREE.Vector3();
			let currentView = view;
			let journeyStarted = -Infinity;
			const journeyDuration = 1860;

			const startTime = performance.now();
			let animation = 0;
			let lastFrame = 0;
			let frameDirty = true;
			let mouseX = 0;
			let mouseY = 0;
			let targetMouseX = 0;
			let targetMouseY = 0;
			let scrollProgress = 0;
			let smoothScroll = 0;
			let nightCurrent = view === 'projects' ? 1 : 0;
			let lastReportedProgress = -1;
			let containerWidth = container.clientWidth || window.innerWidth;
			let containerHeight = container.clientHeight || window.innerHeight;
			let containerLeft = 0;
			let containerTop = 0;
			let seed = 1776;
			let sceneVisible = true;
			let destroyed = false;
			let contextLost = false;
			const materials: Three.Material[] = [];
			const textures: Three.Texture[] = [];

			const scratchMatrix = new THREE.Matrix4();
			const scratchEuler = new THREE.Euler();
			const scratchQuat = new THREE.Quaternion();
			const scratchPos = new THREE.Vector3();
			const scratchScale = new THREE.Vector3();
			const stoneSlabGeometries: Three.BufferGeometry[] = [];
			const darkStoneSlabGeometries: Three.BufferGeometry[] = [];

			function scheduleRender() {
				if (!animation && !destroyed && !contextLost && sceneVisible && !document.hidden && (!reduced || frameDirty)) {
					animation = requestAnimationFrame(render);
				}
			}

			changeView = (next) => {
				if (next === currentView) return;
				fromCamera.copy(camera.position);
				fromLook.copy(lookAt);
				currentView = next;
				journeyStarted = performance.now();
				container.dataset.journey = 'moving';
				frameDirty = true;
				targetMouseX = targetMouseY = 0;
				onScroll();
				scheduleRender();
			};

			function rand() {
				seed = (seed * 1664525 + 1013904223) >>> 0;
				return seed / 4294967296;
			}

			function mat(options: Three.MeshStandardMaterialParameters) {
				const result = new THREE.MeshStandardMaterial(options);
				materials.push(result);
				return result;
			}

			function addTexture(texture: Three.Texture) {
				texture.colorSpace = THREE.SRGBColorSpace;
				textures.push(texture);
				return texture;
			}

			function addMergedStaticMesh(geometries: Three.BufferGeometry[], material: Three.Material, castShadow = false, receiveShadow = false) {
				if (geometries.length === 0) return null;
				const merged = mergeGeometries(geometries, false);
				for (const g of geometries) g.dispose();
				if (!merged) return null;
				const mesh = new THREE.Mesh(merged, material);
				mesh.castShadow = castShadow;
				mesh.receiveShadow = receiveShadow;
				mesh.matrixAutoUpdate = false;
				scene.add(mesh);
				return mesh;
			}

			const skyUniforms = {
				uNight: { value: view === 'projects' ? 1 : 0 },
				uStepTime: { value: 0 }
			};
			const skyMaterial = new THREE.ShaderMaterial({
				side: THREE.BackSide,
				fog: false,
				uniforms: skyUniforms,
				vertexShader: 'varying vec3 v; void main(){ v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
				fragmentShader: `
					uniform float uNight;
					uniform float uStepTime;
					varying vec3 v;
					float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
					float noise(vec3 p) {
						vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
						return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
							mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
					}
					void main(){
						vec3 dir = normalize(v);
						float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
						float wash = noise(dir * 4.5 + vec3(uStepTime * 0.02, 0.0, 0.0)) * 0.6 + noise(dir * 14.0) * 0.4;
						// Raw Washi Paper mist (宣纸雾境) vs. Night Ink (夜墨深渊)
						vec3 paperHorizon = vec3(0.76, 0.72, 0.64);
						vec3 paperZenith  = vec3(0.66, 0.62, 0.54);
						vec3 paperSky = mix(paperHorizon, paperZenith, smoothstep(0.45, 0.88, h));
						paperSky += (wash - 0.5) * 0.045;

						vec3 nightHorizon = vec3(0.065, 0.060, 0.052);
						vec3 nightZenith  = vec3(0.024, 0.022, 0.019);
						vec3 nightSky = mix(nightHorizon, nightZenith, smoothstep(0.42, 0.85, h));
						float ember = pow(max(0.0, dot(dir, normalize(vec3(-0.18, 0.08, -1.0)))), 14.0);
						nightSky += vec3(0.14, 0.09, 0.04) * ember;
						nightSky += (wash - 0.5) * 0.02;

						vec3 c = mix(paperSky, nightSky, uNight);
						// Coarse analog mineral grain (颗粒感)
						float grain = hash(floor(gl_FragCoord.xyz * 0.5) + uStepTime * 17.0) - 0.5;
						c += grain * 0.022;
						gl_FragColor = vec4(c, 1.0);
						#include <tonemapping_fragment>
						#include <colorspace_fragment>
					}`
			});
			materials.push(skyMaterial);
			const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 36, 20), skyMaterial);
			sky.matrixAutoUpdate = false;
			scene.add(sky);

			const lightAnchor = new THREE.Vector3(-1.5, 4.8, -9.5);
			const reflectionSize = containerWidth < 600 ? 256 : 512;
			const water = new Reflector(new THREE.PlaneGeometry(180, 180), {
				textureWidth: reflectionSize,
				textureHeight: reflectionSize,
				clipBias: .003,
				multisample: 0,
				color: '#8c8576',
				shader: {
					uniforms: {
						color: { value: null },
						tDiffuse: { value: null },
						textureMatrix: { value: null },
						time: { value: 0 },
						uNight: { value: view === 'projects' ? 1 : 0 },
						sunPosition: { value: lightAnchor.clone() }
					},
					vertexShader: `
						uniform mat4 textureMatrix;
						varying vec4 reflectionUv;
						varying vec3 worldPosition;
						void main(){
							worldPosition=(modelMatrix*vec4(position,1.)).xyz;
							reflectionUv=textureMatrix*vec4(position,1.);
							gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
						}`,
					fragmentShader: `
						uniform sampler2D tDiffuse;
						uniform float time;
						uniform float uNight;
						uniform vec3 sunPosition;
						varying vec4 reflectionUv;
						varying vec3 worldPosition;
						float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
						void main(){
							vec2 p = worldPosition.xz;
							// Stepped 12fps time for tactile stop-motion water cadence (卡顿感)
							float st = floor(time * 12.0) / 12.0;
							// Karesansui (枯山水) concentric raked sand-and-water rings around the Torii & monoliths
							float dTorii = length(p - vec2(2.85, -2.2));
							float dMono  = length(p - vec2(5.2, 5.0));
							float rake = sin(dTorii * 14.0 - st * 0.55) * 0.55
								+ sin(dMono * 16.0 - st * 0.4) * 0.35
								+ sin(p.x * 3.2 + p.y * 2.4 + st * 0.3) * 0.25;
							vec2 distortion = vec2(rake * 0.0022, cos(p.y * 6.0 + st * 0.3) * 0.0012);
							vec2 uv = reflectionUv.xy / reflectionUv.w + distortion;
							vec3 reflection = texture2D(tDiffuse, uv).rgb;

							vec3 view = normalize(cameraPosition - worldPosition);
							float fresnel = 0.24 + 0.38 * pow(1.0 - max(view.y, 0.0), 3.0);

							// Sumi-ink basin on raw paper vs. deep obsidian night water
							vec3 paperWater = vec3(0.58, 0.55, 0.48);
							vec3 nightWater = vec3(0.032, 0.030, 0.026);
							vec3 waterTint = mix(paperWater, nightWater, uNight);
							vec3 base = mix(waterTint, reflection, fresnel);

							// Dry-ink Karesansui ridge lines etched into the surface
							float ridgeLine = smoothstep(0.65, 0.95, abs(rake));
							vec3 ridgeInk = mix(vec3(0.32, 0.30, 0.26), vec3(0.14, 0.12, 0.09), uNight);
							base = mix(base, ridgeInk, ridgeLine * 0.18);

							// Coarse mineral grain (粗糙颗粒感)
							float grain = hash2(floor(gl_FragCoord.xy * 0.5) + st * 13.0) - 0.5;
							base += grain * 0.026;

							float haze = 1.0 - exp(-max(0.0, length(p) - 6.0) * 0.022);
							vec3 fogTone = mix(vec3(0.75, 0.71, 0.63), vec3(0.048, 0.045, 0.038), uNight);
							base = mix(base, fogTone, haze * 0.82);

							gl_FragColor = vec4(base, 1.0);
							#include <tonemapping_fragment>
							#include <colorspace_fragment>
						}`
				}
			});
			water.rotation.x = -Math.PI / 2;
			water.position.y = -0.28;
			if (!(water.material instanceof THREE.ShaderMaterial)) throw new Error('Expected reflector shader');
			const waterUniforms = water.material.uniforms;
			const updateReflection = water.onBeforeRender;
			let reflectedAt = -Infinity;
			const lastReflectedCamPos = new THREE.Vector3(Infinity, Infinity, Infinity);
			const lastReflectedLookAt = new THREE.Vector3(Infinity, Infinity, Infinity);
			water.onBeforeRender = (...args) => {
				const now = performance.now();
				const camMoved =
					camera.position.distanceToSquared(lastReflectedCamPos) > 1e-6 ||
					lookAt.distanceToSquared(lastReflectedLookAt) > 1e-6;
				if (!frameDirty && (!camMoved || now - reflectedAt < 90)) return;
				reflectedAt = now;
				lastReflectedCamPos.copy(camera.position);
				lastReflectedLookAt.copy(lookAt);
				updateReflection.apply(water, args);
			};
			scene.add(water);

			const mistSprites: Three.SpriteMaterial[] = [];
			addMistLayer(-6.5, 0.75, -12, 30, 1.6, 0.18);
			addMistLayer(3.0, 0.55, -18, 34, 1.25, 0.14);
			addMistLayer(-1.5, 0.42, 4.5, 22, 0.95, 0.12);

			const stoneMaterial = mat({ color: '#3b3932', roughness: 1, flatShading: true });
			const darkStoneMaterial = mat({ color: '#24231e', roughness: 1, flatShading: true });

			// Sparse, brutalist monolithic stepping plinths on the right side of the Karesansui basin (Kanso 简素)
			const causewaySlabs: [number, number, number, number, number][] = [
				[4.2, 12.0, 0.95, 0.11, 0.52],
				[3.4, 9.0, 1.15, 0.12, 0.48],
				[3.9, 6.0, 0.85, 0.09, 0.55],
				[2.6, 3.2, 1.35, 0.14, 0.46],
				[2.2, 0.4, 1.55, 0.15, 0.50],
				[2.8, -2.2, 2.25, 0.16, 0.44],
				[3.6, -4.8, 1.40, 0.13, 0.48],
				[4.2, -7.0, 1.75, 0.15, 0.52]
			];
			for (const [x, z, radius, height, scaleZ] of causewaySlabs) {
				addSlab({
					x,
					z,
					y: -0.22 + (rand() - 0.5) * 0.03,
					radius,
					height,
					scaleZ,
					material: rand() > 0.4 ? darkStoneMaterial : stoneMaterial
				});
			}

			const toriiMaterial = mat({
				color: '#7a7568',
				roughness: 1,
				metalness: 0,
				vertexColors: true
			});
			// A lightweight silhouette holds the composition while the scanned model loads.
			const gatePreview = new THREE.Group();
			for (const x of [1.35, 4.35]) {
				const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.19, .28, 4.1, 8), darkStoneMaterial);
				pillar.position.set(x, 1.95, -2.2);
				gatePreview.add(pillar);
			}
			for (const [width, height, y] of [[5.1, .28, 4.6], [4.8, .23, 4.32], [4.9, .24, 3.65]]) {
				const beam = new THREE.Mesh(new THREE.BoxGeometry(width, height, .32), darkStoneMaterial);
				beam.position.set(2.85, y, -2.2);
				gatePreview.add(beam);
			}
			scene.add(gatePreview);
			new STLLoader().load('/models/torii.stl', (geometry) => {
				if (destroyed) { geometry.dispose(); return; }
				frameDirty = true;
				if (!geometry.attributes.normal) geometry.computeVertexNormals();
				weatherGeometry(geometry);
				const torii = new THREE.Mesh(geometry, toriiMaterial);
				torii.scale.setScalar(6.5);
				torii.position.set(2.85, 2.32, -2.2);
				torii.rotation.set(0.012, -0.15, 0.008);
				torii.castShadow = true;
				torii.receiveShadow = true;
				torii.updateMatrix();
				torii.matrixAutoUpdate = false;
				scene.add(torii);
				scene.remove(gatePreview);
				gatePreview.traverse((node) => { if (node instanceof THREE.Mesh) node.geometry.dispose(); });
				sceneReady = true;
				renderer.shadowMap.needsUpdate = true;
				scheduleRender();
			}, undefined, () => {
				if (destroyed) return;
				sceneReady = true;
				simplified = true;
				frameDirty = true;
				scheduleRender();
			});

			const archiveStonePreview = new THREE.Group();
			scene.add(archiveStonePreview);

			// Mono-ha (物派) raw stone monoliths positioned around the Torii and the Archive shore
			// [x, z, scale, rotY]
			const rockPlacements: [number, number, number, number][] = [
				// Foreground stone on right
				[5.2, 5.0, 3.4, 0.42],
				// Flanking the Torii sanctuary on the right
				[1.4, -1.8, 3.5, 0.85],
				[4.2, -1.6, 3.8, 2.10],
				[3.1, -3.6, 4.4, 1.65],
				[4.9, -3.2, 3.1, 2.75],
				[1.8, -4.2, 3.6, 0.30],
				// Far right stones
				[6.4, 0.5, 3.8, 1.40],
				// Archive shore (/projects view) stones
				[8.6, -0.8, 4.4, 0.60],
				[10.2, -2.8, 3.8, 1.90],
				[11.5, -1.5, 3.0, 2.40]
			];

			new GLTFLoader().load('/models/rock/rock_07.gltf', (gltf) => {
				const source = gltf.scene;
				frameDirty = true;
				if (destroyed) {
					source.traverse((node) => {
						if (!(node instanceof THREE.Mesh)) return;
						node.geometry.dispose();
						for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
							for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
							material.dispose();
						}
					});
					return;
				}
				let rockMesh: Three.Mesh | null = null;
				source.traverse((node) => {
					if (!(node instanceof THREE.Mesh)) return;
					rockMesh ??= node;
					node.castShadow = true;
					node.receiveShadow = true;
					for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
						if (material instanceof THREE.MeshStandardMaterial) {
							material.roughness = 1;
							material.color.multiply(new THREE.Color('#4a473e'));
						}
						materials.push(material);
					}
				});

				if (rockMesh) {
					const meshNode = rockMesh as Three.Mesh;
					const instancedRocks = new THREE.InstancedMesh(meshNode.geometry, meshNode.material, rockPlacements.length);
					instancedRocks.castShadow = true;
					instancedRocks.receiveShadow = true;
					instancedRocks.matrixAutoUpdate = false;

					for (let i = 0; i < rockPlacements.length; i += 1) {
						const [x, z, scale, rotY] = rockPlacements[i];
						scratchPos.set(x, -0.23, z);
						scratchEuler.set((rand() - 0.5) * 0.12, rotY, (rand() - 0.5) * 0.10);
						scratchQuat.setFromEuler(scratchEuler);
						scratchScale.setScalar(scale);
						scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
						instancedRocks.setMatrixAt(i, scratchMatrix);
					}
					instancedRocks.instanceMatrix.needsUpdate = true;
					scene.add(instancedRocks);

					// Standing weathered monoliths on the Archive shore (/projects)
					const bounds = new THREE.Box3().setFromObject(source);
					const size = bounds.getSize(new THREE.Vector3());
					const center = bounds.getCenter(new THREE.Vector3());
					const standingGeos: Three.BufferGeometry[] = [];
					const groupMatrix = new THREE.Matrix4();
					for (const [x, z, height, width, depth, angle] of [[7.2, -2.4, 2.1, 0.9, 0.68, -0.12], [8.1, -2.8, 1.3, 0.76, 0.6, 0.28]]) {
						const sx = width / size.x, sy = height / size.y, sz = depth / size.z;
						scratchPos.set(-center.x * sx, -0.22 - bounds.min.y * sy, -center.z * sz);
						scratchQuat.identity();
						scratchScale.set(sx, sy, sz);
						scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);

						scratchPos.set(x, 0, z);
						scratchEuler.set(0, angle, 0);
						scratchQuat.setFromEuler(scratchEuler);
						scratchScale.set(1, 1, 1);
						groupMatrix.compose(scratchPos, scratchQuat, scratchScale);
						groupMatrix.multiply(scratchMatrix);

						const g = meshNode.geometry.clone();
						g.applyMatrix4(groupMatrix);
						g.computeVertexNormals();
						standingGeos.push(g);
					}
					addMergedStaticMesh(standingGeos, meshNode.material as Three.Material, true, true);

					scene.remove(archiveStonePreview);
					archiveStonePreview.traverse((node) => { if (node instanceof THREE.Mesh) node.geometry.dispose(); });
					rocksReady = true;
				}

				renderer.shadowMap.needsUpdate = true;
				scheduleRender();
			}, undefined, () => {
				if (destroyed) return;
				rocksReady = true;
				simplified = true;
				frameDirty = true;
				scheduleRender();
			});

			addDistantRidges();
			addArchiveShore();

			addMergedStaticMesh(stoneSlabGeometries, stoneMaterial, true, true);
			addMergedStaticMesh(darkStoneSlabGeometries, darkStoneMaterial, true, true);

			const hemiLight = new THREE.HemisphereLight('#e6dfd0', '#2b2923', 1.35);
			scene.add(hemiLight);
			const keyLight = new THREE.DirectionalLight('#f2e6cf', 2.4);
			keyLight.position.set(-1.5, 6.5, -8.5);
			keyLight.target.position.set(-2.5, 0, 1.5);
			scene.add(keyLight.target);
			keyLight.castShadow = true;
			keyLight.shadow.mapSize.set(512, 512);
			keyLight.shadow.camera.left = -12;
			keyLight.shadow.camera.right = 12;
			keyLight.shadow.camera.top = 12;
			keyLight.shadow.camera.bottom = -12;
			keyLight.shadow.normalBias = .025;
			keyLight.shadow.bias = -.0003;
			scene.add(keyLight);

			const rimLight = new THREE.DirectionalLight('#d4b483', 0.85);
			rimLight.position.set(4.2, 4.5, -7.5);
			scene.add(rimLight);

			const fillLight = new THREE.DirectionalLight('#d8d2c5', 1.15);
			fillLight.position.set(1.8, 3.4, 14);
			scene.add(fillLight);

			function addSlab({ x, y, z, radius, height, scaleZ, material }: { x: number; y: number; z: number; radius: number; height: number; scaleZ: number; material: Three.Material }) {
				const geometry = new THREE.CylinderGeometry(radius, radius * (.86 + rand() * .22), height, 6 + Math.floor(rand() * 3), 1);
				const positions = geometry.attributes.position;
				for (let i = 0; i < positions.count; i += 1) {
					positions.setX(i, positions.getX(i) * (.84 + rand() * .24));
					positions.setZ(i, positions.getZ(i) * (.80 + rand() * .30));
					positions.setY(i, positions.getY(i) + (rand() - .5) * .03);
				}
				scratchPos.set(x, y, z);
				scratchEuler.set((rand() - .5) * .05, rand() * Math.PI, (rand() - .5) * .05);
				scratchQuat.setFromEuler(scratchEuler);
				scratchScale.set(1, 1, scaleZ);
				scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
				geometry.applyMatrix4(scratchMatrix);
				geometry.computeVertexNormals();
				if (material === stoneMaterial) {
					stoneSlabGeometries.push(geometry);
				} else {
					darkStoneSlabGeometries.push(geometry);
				}
			}

			function weatherGeometry(geometry: Three.BufferGeometry) {
				const position = geometry.attributes.position;
				const count = position.count;
				const colors = new Float32Array(count * 3);
				const dark = new THREE.Color('#23221e');
				const ash = new THREE.Color('#666358');
				const moss = new THREE.Color('#34392e');
				const clay = new THREE.Color('#5c4130');
				const c = new THREE.Color();
				for (let i = 0; i < count; i += 1) {
					const x = position.getX(i);
					const y = position.getY(i);
					const z = position.getZ(i);
					const patch = Math.sin(x * 36 + y * 19) * Math.cos(z * 44 - y * 17);
					const verticalWear = smoothstep(-.36, .32, y);
					c.copy(dark).lerp(ash, Math.max(0, patch) * .54).lerp(moss, Math.max(0, -patch) * .45 * verticalWear);
					if (patch > .66) c.lerp(clay, .24);
					const offset = i * 3;
					colors[offset] = c.r;
					colors[offset + 1] = c.g;
					colors[offset + 2] = c.b;
				}
				geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
			}


			function addArchiveShore() {
				for (let i = 0; i < 8; i++) {
					const angle = (i / 8) * Math.PI * 2;
					const radius = 0.8 + rand() * 2.4;
					addSlab({
						x: 8.6 + Math.cos(angle) * radius,
						z: -1.6 + Math.sin(angle) * radius * 0.7,
						y: -0.21 + rand() * 0.04,
						radius: 0.75 + rand() * 0.85,
						height: 0.08 + rand() * 0.10,
						scaleZ: 0.48 + rand() * 0.28,
						material: rand() > 0.35 ? darkStoneMaterial : stoneMaterial
					});
				}
				for (const [x, z, width, height] of [[7.2, -2.4, 0.44, 2.1], [8.1, -2.8, 0.34, 1.3]]) {
					const geometry = new THREE.IcosahedronGeometry(1, 2);
					const positions = geometry.attributes.position;
					for (let i = 0; i < positions.count; i++) {
						const wear = .88 + rand() * .16;
						positions.setXYZ(i, positions.getX(i) * wear, positions.getY(i) * wear, positions.getZ(i) * wear);
					}
					geometry.computeVertexNormals();
					const stone = new THREE.Mesh(geometry, stoneMaterial);
					stone.position.set(x, height / 2 - .18, z);
					stone.scale.set(width, height / 2, width * .75);
					stone.rotation.z = -.05;
					stone.castShadow = stone.receiveShadow = true;
					archiveStonePreview.add(stone);
				}
			}

			function addDistantRidges() {
				for (let row = 0; row < 2; row++) {
					const geometry = new THREE.PlaneGeometry(130, 7, 84, 1);
					const position = geometry.attributes.position;
					for (let i = 0; i < position.count; i++) {
						const x = position.getX(i);
						const top = position.getY(i) > 0;
						const ridge = Math.max(0, Math.sin(x * .13 + row * 2.2) * 1.6 + Math.sin(x * .34 + row) * .55);
						position.setY(i, top ? ridge : -3);
					}
					geometry.computeVertexNormals();
					const ridgeMat = new THREE.MeshBasicMaterial({
						color: row === 0 ? '#454239' : '#585449',
						fog: true
					});
					materials.push(ridgeMat);
					const ridge = new THREE.Mesh(geometry, ridgeMat);
					ridge.position.set(row * 8, -.55, -42 - row * 18);
					ridge.updateMatrix();
					ridge.matrixAutoUpdate = false;
					scene.add(ridge);
				}
			}

			function addMistLayer(x: number, y: number, z: number, w: number, h: number, opacity: number) {
				const spriteMat = new THREE.SpriteMaterial({
					map: mistTexture(),
					transparent: true,
					opacity,
					depthWrite: false,
					fog: false
				});
				materials.push(spriteMat);
				mistSprites.push(spriteMat);
				const mist = new THREE.Sprite(spriteMat);
				mist.position.set(x, y, z);
				mist.scale.set(w, h, 1);
				mist.updateMatrix();
				mist.matrixAutoUpdate = false;
				scene.add(mist);
			}

			function smoothstep(edge0: number, edge1: number, x: number) {
				const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
				return t * t * (3 - 2 * t);
			}

			function mistTexture() {
				const canvas = document.createElement('canvas');
				canvas.width = 256;
				canvas.height = 64;
				const c = canvas.getContext('2d');
				if (!c) return addTexture(new THREE.Texture());
				const gradient = c.createLinearGradient(0, 0, 0, 64);
				gradient.addColorStop(0, 'rgba(226,218,203,0)');
				gradient.addColorStop(.48, 'rgba(226,218,203,.72)');
				gradient.addColorStop(1, 'rgba(226,218,203,0)');
				c.fillStyle = gradient;
				c.fillRect(0, 0, 256, 64);
				return addTexture(new THREE.CanvasTexture(canvas));
			}

			function resize() {
				frameDirty = true;
				const rect = container.getBoundingClientRect();
				const { width, height } = rect;
				if (!width || !height) return;
				containerWidth = width;
				containerHeight = height;
				containerLeft = rect.left;
				containerTop = rect.top;
				renderer.setSize(width, height, false);
				camera.aspect = width / height;
				camera.fov = width < 600 ? 52 : 26;
				camera.updateProjectionMatrix();
				scheduleRender();
			}

			function move(event: PointerEvent) {
				if (!sceneVisible || !containerWidth || !containerHeight) return;
				targetMouseX = (event.clientX - containerLeft) / containerWidth - .5;
				targetMouseY = (event.clientY - containerTop) / containerHeight - .5;
				scheduleRender();
			}

			function onScroll() {
				// Track unified Hero + About scroll continuum ([data-scene-scroll]) when present
				const scrollHost = document.querySelector('[data-scene-scroll]') as HTMLElement | null;
				const wrapper = scrollHost ?? container.parentElement;
				if (!wrapper) return;
				const rect = wrapper.getBoundingClientRect();
				const scrollable = wrapper.offsetHeight - containerHeight;
				scrollProgress = currentView === 'projects' || reduced || scrollable <= 0 ? 0 : Math.max(0, Math.min(1, -rect.top / scrollable));
				scheduleRender();
			}

			function updateMotion() {
				reduced = motionQuery.matches;
				if (reduced) smoothScroll = 0;
				onScroll();
				frameDirty = true;
				scheduleRender();
			}

			function onVisibilityChange() {
				if (!document.hidden) scheduleRender();
			}

			// 5-Act telephoto camera waypoints across Hero (0) -> 序 (0.25) -> 志 (0.50) -> 行 (0.75) -> 道 (1.0)
			const camWaypoints: [number, number, number][] = [
				[0.0, 2.36, 19.4],
				[-0.35, 2.40, 17.2],
				[-0.75, 2.45, 14.8],
				[-1.10, 2.48, 12.6],
				[-1.30, 2.38, 10.8]
			];
			const lookWaypoints: [number, number, number][] = [
				[1.85, 2.65, -2.2],
				[2.05, 2.70, -2.4],
				[2.25, 2.75, -2.7],
				[2.45, 2.78, -3.1],
				[2.65, 2.60, -3.6]
			];

			function sampleTrack(points: [number, number, number][], t: number, out: Three.Vector3) {
				const scaled = Math.max(0, Math.min(1, t)) * (points.length - 1);
				const idx = Math.min(points.length - 2, Math.floor(scaled));
				const frac = smoothstep(0, 1, scaled - idx);
				const a = points[idx];
				const b = points[idx + 1];
				out.set(
					THREE.MathUtils.lerp(a[0], b[0], frac),
					THREE.MathUtils.lerp(a[1], b[1], frac),
					THREE.MathUtils.lerp(a[2], b[2], frac)
				);
			}

			const sampledCam = new THREE.Vector3();
			const sampledLook = new THREE.Vector3();

			function render(now = performance.now()) {
				if (destroyed || contextLost || !sceneVisible || document.hidden || (reduced && !frameDirty)) {
					animation = 0;
					return;
				}
				animation = requestAnimationFrame(render);
				// 20fps film-gate cadence for tactile analog presence
				if (now - lastFrame < 1000 / 20) return;
				lastFrame = now;
				const time = reduced ? 0 : (now - startTime) / 1000;
				const steppedTime = Math.floor(time * 12) / 12;
				waterUniforms.time.value = time;
				skyUniforms.uStepTime.value = steppedTime;

				mouseX += (targetMouseX - mouseX) * .045;
				mouseY += (targetMouseY - mouseY) * .045;
				smoothScroll += (scrollProgress - smoothScroll) * .11;
				if (Math.abs(scrollProgress - smoothScroll) < 0.0001) smoothScroll = scrollProgress;

				const p = currentView === 'projects' ? 0 : smoothScroll;
				if (Math.abs(p - lastReportedProgress) > 0.0004) {
					lastReportedProgress = p;
					onProgress?.(p);
				}

				// Atmosphere shift: Raw Washi Paper mist in Acts 0-III, plunging into Night Ink in Act IV (道篇) or /projects
				const nightGoal = currentView === 'projects' ? 1 : smoothstep(0.68, 0.88, p);
				nightCurrent += (nightGoal - nightCurrent) * (reduced ? 1 : 0.14);
				skyUniforms.uNight.value = nightCurrent;
				waterUniforms.uNight.value = nightCurrent;
				if (scene.background instanceof THREE.Color) {
					scene.background.copy(paperBg).lerp(nightBg, nightCurrent);
				}
				fog.color.copy(paperFog).lerp(nightFog, nightCurrent);
				hemiLight.intensity = THREE.MathUtils.lerp(1.35, 0.45, nightCurrent);
				keyLight.intensity = THREE.MathUtils.lerp(2.4, 1.35, nightCurrent);
				fillLight.intensity = THREE.MathUtils.lerp(1.15, 0.32, nightCurrent);
				for (const m of mistSprites) {
					m.color.setRGB(
						THREE.MathUtils.lerp(0.88, 0.16, nightCurrent),
						THREE.MathUtils.lerp(0.85, 0.15, nightCurrent),
						THREE.MathUtils.lerp(0.79, 0.13, nightCurrent)
					);
				}

				const mobile = containerWidth < 600;
				if (currentView === 'projects') {
					destination.set(mobile ? 11.2 : 12.2, 2.45, 15.4);
					destinationLook.set(mobile ? 10.2 : 11.0, 2.1, -2.5);
				} else {
					sampleTrack(camWaypoints, p, sampledCam);
					sampleTrack(lookWaypoints, p, sampledLook);
					if (mobile) {
						sampledLook.x -= 0.55;
						sampledLook.y += 0.25;
					}
					if (!reduced) {
						// Subtle stepped analog camera breath (卡顿呼吸感)
						const sway = Math.sin(steppedTime * 0.7) * 0.025;
						const bob = Math.cos(steppedTime * 0.9) * 0.012;
						sampledCam.x += mouseX * 0.18 + sway;
						sampledCam.y -= mouseY * 0.08 + bob;
					}
					destination.copy(sampledCam);
					destinationLook.copy(sampledLook);
				}

				const travel = reduced ? 1 : Math.min(1, (now - journeyStarted) / journeyDuration);
				const easedTravel = travel * travel * (3 - 2 * travel);
				if (travel === 1 && container.dataset.journey !== 'settled') container.dataset.journey = 'settled';
				camera.position.lerpVectors(fromCamera, destination, easedTravel);
				lookAt.lerpVectors(fromLook, destinationLook, easedTravel);
				camera.lookAt(lookAt);
				camera.rotation.z = 0;

				renderer.render(scene, camera);
				frameDirty = false;
			}

			function onContextLost(event: Event) {
				event.preventDefault();
				contextLost = true;
				unavailable = true;
			}

			function onContextRestored() {
				contextLost = false;
				unavailable = false;
				frameDirty = true;
				renderer.shadowMap.needsUpdate = true;
				resize();
				onScroll();
				scheduleRender();
			}

			const observer = new ResizeObserver(() => { resize(); onScroll(); });
			observer.observe(container);
			const visibility = new IntersectionObserver(([entry]) => {
				sceneVisible = entry.isIntersecting;
				if (sceneVisible) scheduleRender();
			});
			visibility.observe(container);
			window.addEventListener('pointermove', move, { passive: true });
			window.addEventListener('scroll', onScroll, { passive: true });
			document.addEventListener('visibilitychange', onVisibilityChange);
			motionQuery.addEventListener('change', updateMotion);
			renderer.domElement.addEventListener('webglcontextlost', onContextLost);
			renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
			resize();
			onScroll();
			scheduleRender();
			teardown = () => {
				destroyed = true;
				cancelAnimationFrame(animation);
				observer.disconnect();
				visibility.disconnect();
				window.removeEventListener('pointermove', move);
				window.removeEventListener('scroll', onScroll);
				document.removeEventListener('visibilitychange', onVisibilityChange);
				motionQuery.removeEventListener('change', updateMotion);
				renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
				renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
				const sceneMaterials = new Set(materials);
				scene.traverse((object) => {
					if (object instanceof THREE.Mesh) object.geometry.dispose();
					if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
						for (const material of Array.isArray(object.material) ? object.material : [object.material]) sceneMaterials.add(material);
					}
				});
				sceneMaterials.forEach((material) => {
					for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
				});
				sceneMaterials.forEach((item) => item.dispose());
				textures.forEach((item) => item.dispose());
				water.dispose();
				keyLight.shadow.dispose();
				renderer.dispose();
				renderer.domElement.remove();
			};
		});
	});
	onDestroy(() => dispose());
</script>

<div class="wabi-scene" data-view={view} class:scene-unavailable={unavailable} class:scene-ready={sceneReady && rocksReady} bind:this={container} aria-label={view === 'projects' ? '鸟居右侧水岸的三维作品场景' : '枯山水与残石鸟居的三维场域'}>
	{#if unavailable}<p class="scene-notice machine" role="status">〔注〕设备未启用三维加速，已载入静态残境底图。</p>{/if}
	{#if simplified && !unavailable}<p class="scene-quality-note machine" role="status">〔注〕部分模型未能载入，当前显示基础三维场景。</p>{/if}
</div>

<style>
	.wabi-scene {
		position: sticky;
		top: 0;
		height: 100svh;
		width: 100%;
		overflow: hidden;
		background: var(--color-bg);
	}
	.wabi-scene[data-view="projects"] {
		background: var(--raw-night);
	}
	.scene-unavailable { background: var(--color-bg-alt); }
	.scene-unavailable :global(canvas) { visibility: hidden; }
	.scene-notice {
		position: absolute;
		bottom: var(--space-4);
		right: var(--grid-margin);
		max-width: 28em;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-machine);
		line-height: var(--leading-base);
		opacity: 0.65;
		pointer-events: none;
		z-index: 1;
	}
	.scene-quality-note {
		position: absolute;
		bottom: var(--space-4);
		right: var(--grid-margin);
		max-width: 28em;
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		letter-spacing: var(--tracking-machine);
		opacity: 0.65;
		pointer-events: none;
		z-index: 1;
	}
	.wabi-scene :global(canvas) {
		display: block;
		width: 100% !important;
		height: 100% !important;
	}
	.wabi-scene::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(ellipse 84% 72% at 50% 48%, transparent 55%, rgba(42, 41, 36, 0.14));
		mix-blend-mode: multiply;
	}
</style>
