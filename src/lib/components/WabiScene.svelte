<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type * as Three from 'three';

	let { children, view = 'home', onProgress }: { children?: Snippet; view?: 'home' | 'projects'; onProgress?: (progress: number) => void } = $props();
	let changeView: (next: 'home' | 'projects') => void = () => {};
	$effect(() => { changeView(view); });
	let container: HTMLDivElement;
	let editorial: HTMLDivElement;
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
			renderer.toneMappingExposure = 0.82;
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = THREE.PCFShadowMap;
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
			container.appendChild(renderer.domElement);
			renderer.domElement.dataset.sceneInstance = crypto.randomUUID();

			const scene = new THREE.Scene();
			scene.background = new THREE.Color('#aca492');
			scene.fog = new THREE.FogExp2('#827d69', 0.031);

			const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 160);
			const cameraHome = new THREE.Vector3(0.18, 2.36, 19.4);
			camera.position.copy(cameraHome);
			const lookAt = new THREE.Vector3(-2.3, 3.0, -4.63);
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

			const sky = new THREE.Mesh(
				new THREE.SphereGeometry(80, 40, 22),
				new THREE.ShaderMaterial({
					side: THREE.BackSide,
					fog: false,
					vertexShader: 'varying vec3 v; void main(){ v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
					fragmentShader: `
						varying vec3 v;
						float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
						float noise(vec3 p) {
							vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
							return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
								mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
						}
						void main(){
							vec3 dir=normalize(v);
							float h=dir.y*.5+.5;
							float clouds=noise(dir*6.)*.55+noise(dir*15.)*.28+noise(dir*38.)*.12;
							vec3 c=mix(vec3(.18,.20,.17),vec3(.23,.22,.17),smoothstep(.4,.78,h));
							float sunward=pow(max(0.,dot(dir,normalize(vec3(.10,.14,-1.)))),18.);
							c+=vec3(.24,.15,.055)*sunward;
							c+=(clouds-.48)*.10;
							gl_FragColor=vec4(c,1.);
							#include <tonemapping_fragment>
							#include <colorspace_fragment>
						}`
				})
			);
			sky.matrixAutoUpdate = false;
			scene.add(sky);

			const sun = new THREE.Sprite(new THREE.SpriteMaterial({
				map: circleTexture(),
				transparent: true,
				depthWrite: false,
				fog: false
			}));
			// Camera is a 22° telephoto aimed left, so the horizontal frame is
			// narrow; a sun this side of the look axis lands in the open sky to
			// the right of the torii (matching the reference), not off-frame.
			sun.position.set(1.0, 3.1, -8.5);
			sun.scale.set(3.4, 3.4, 1);
			sun.updateMatrix();
			sun.matrixAutoUpdate = false;
			scene.add(sun);
			const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(.22, 24, 16), new THREE.MeshBasicMaterial({ color: '#eac080', fog: false }));
			sunDisc.position.copy(sun.position);
			sunDisc.updateMatrix();
			sunDisc.matrixAutoUpdate = false;
			scene.add(sunDisc);

			const reflectionSize = containerWidth < 600 ? 256 : 512;
			const water = new Reflector(new THREE.PlaneGeometry(180, 180), {
				textureWidth: reflectionSize,
				textureHeight: reflectionSize,
				clipBias: .003,
				multisample: 0,
				color: '#777565',
				shader: {
					uniforms: {
						color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
						time: { value: 0 }, sunPosition: { value: sun.position.clone() }
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
						uniform vec3 sunPosition;
						varying vec4 reflectionUv;
						varying vec3 worldPosition;
						void main(){
							vec2 p=worldPosition.xz;
							float wave=sin(p.x*2.1+p.y*3.7+time*.65)*.45
								+sin(p.x*4.7-p.y*5.2-time*.4)*.3
								+sin(p.y*13.1+sin(p.x*3.)+time*.8)*.15;
							vec2 distortion=vec2(wave*.0025, sin(p.y*7.+time*.35)*.001);
							vec2 uv=reflectionUv.xy/reflectionUv.w+distortion;
							vec3 reflection=texture2D(tDiffuse,uv).rgb;
							vec3 view=normalize(cameraPosition-worldPosition);
							float fresnel=.2+.32*pow(1.-max(view.y,0.),3.);
							vec3 base=mix(vec3(.045,.055,.046),reflection,fresnel);
							vec3 normal=normalize(vec3(wave*.06,1.,cos(p.y*5.4+time*.4)*.08));
							vec3 light=normalize(sunPosition-worldPosition);
							float glint=pow(max(dot(reflect(-light,normal),view),0.),100.);
							base+=vec3(.65,.38,.13)*glint*.5;
							base+=vec3(.015,.014,.01)*wave;
							float haze=1.-exp(-max(0.,length(p)-8.)*.016);
							base=mix(base,vec3(.18,.19,.15),haze*.7);
							gl_FragColor=vec4(base,1.);
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
				if (!frameDirty && (!camMoved || now - reflectedAt < 80)) return;
				reflectedAt = now;
				lastReflectedCamPos.copy(camera.position);
				lastReflectedLookAt.copy(lookAt);
				updateReflection.apply(water, args);
			};
			scene.add(water);

			addMistLayer(-7.5, .8, -15, 32, 1.5, 0.14);
			addMistLayer(2.5, .6, -22, 34, 1.1, 0.12);

			const stoneMaterial = mat({ color: '#5b594a', roughness: 1, flatShading: true });
			const darkStoneMaterial = mat({ color: '#3e4035', roughness: 1, flatShading: true });

			for (let i = 0; i < 22; i += 1) {
				const angle = rand() * Math.PI * 2;
				const radiusX = 1.2 + rand() * 3.55;
				const radiusZ = .25 + rand() * 1.35;
				addSlab({
					x: -2.95 + Math.cos(angle) * radiusX,
					z: -1.1 + Math.sin(angle) * radiusZ,
					y: -0.22 + rand() * 0.08,
					radius: .62 + rand() * 1.25,
					height: .08 + rand() * .13,
					scaleZ: .42 + rand() * .35,
					material: rand() > .32 ? stoneMaterial : darkStoneMaterial
				});
			}

			for (let i = 0; i < 19; i += 1) {
				const progress = i / 18;
				addSlab({
					x: THREE.MathUtils.lerp(0.72, -2.72, progress) + (rand() - .5) * .42,
					z: THREE.MathUtils.lerp(8.15, .58, progress) + (rand() - .5) * .32,
					y: -0.18 + progress * .02,
					radius: THREE.MathUtils.lerp(.46, .7, progress) + rand() * .34,
					height: .065 + rand() * .09,
					scaleZ: .42 + rand() * .25,
					material: rand() > .26 ? stoneMaterial : darkStoneMaterial
				});
			}

			const toriiMaterial = mat({
				color: '#b7b4a9',
				roughness: 1,
				metalness: 0,
				vertexColors: true
			});
			// A lightweight silhouette holds the composition while the scanned model loads.
			const gatePreview = new THREE.Group();
			for (const x of [-5.02, -2.02]) {
				const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.19, .28, 4.1, 8), darkStoneMaterial);
				pillar.position.set(x, 1.95, -1.9);
				gatePreview.add(pillar);
			}
			for (const [width, height, y] of [[5.1, .28, 4.6], [4.8, .23, 4.32], [4.9, .24, 3.65]]) {
				const beam = new THREE.Mesh(new THREE.BoxGeometry(width, height, .32), darkStoneMaterial);
				beam.position.set(-3.52, y, -1.9);
				gatePreview.add(beam);
			}
			scene.add(gatePreview);
			new STLLoader().load('/models/torii.stl', (geometry) => {
				if (destroyed) { geometry.dispose(); return; }
				frameDirty = true;
				if (!geometry.attributes.normal) geometry.computeVertexNormals();
				weatherGeometry(geometry);
				const torii = new THREE.Mesh(geometry, toriiMaterial);
				torii.scale.setScalar(6.7);
				torii.position.set(-3.55, 2.32, -1.9);
				torii.rotation.set(0.012, -0.04, 0.008);
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
				// Keep the procedural gate: it is still geometry, never a replacement image.
				sceneReady = true;
				simplified = true;
				frameDirty = true;
				scheduleRender();
			});

			addToriiDetails();
			addBenchAndFence();
			const archiveStonePreview = new THREE.Group();
			scene.add(archiveStonePreview);

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
							material.color.multiply(new THREE.Color('#6d6753'));
						}
						materials.push(material);
					}
				});

				if (rockMesh) {
					const meshNode = rockMesh as Three.Mesh;
					const instancedRocks = new THREE.InstancedMesh(meshNode.geometry, meshNode.material, 16);
					instancedRocks.castShadow = true;
					instancedRocks.receiveShadow = true;
					instancedRocks.matrixAutoUpdate = false;
					let instanceIdx = 0;

					for (let i = 0; i < 12; i += 1) {
						const angle = rand() * Math.PI * 2;
						scratchPos.set(-2.65 + Math.cos(angle) * (3.05 + rand() * 1.25), -0.23, -1.05 + Math.sin(angle) * (1.25 + rand() * .65));
						scratchEuler.set((rand() - .5) * .18, rand() * Math.PI, (rand() - .5) * .12);
						scratchQuat.setFromEuler(scratchEuler);
						// The scanned mesh is only ~0.3 units across; bring it into the metre-scale scene.
						scratchScale.setScalar(2.6 + rand() * 3.8);
						scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
						instancedRocks.setMatrixAt(instanceIdx++, scratchMatrix);
					}

					rocksReady = true;
					// Reuse the scanned surface for the weathered stones of the next shore.
					const bounds = new THREE.Box3().setFromObject(source);
					const size = bounds.getSize(new THREE.Vector3());
					const center = bounds.getCenter(new THREE.Vector3());
					const standingGeos: Three.BufferGeometry[] = [];
					const groupMatrix = new THREE.Matrix4();
					for (const [x, z, height, width, depth, angle] of [[7.1, -2.5, 2.2, .9, .65, -.12], [7.9, -2.8, 1.25, .75, .6, .3]]) {
						const sx = width / size.x, sy = height / size.y, sz = depth / size.z;
						scratchPos.set(-center.x * sx, -.2 - bounds.min.y * sy, -center.z * sz);
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
						standingGeos.push(g);
					}
					addMergedStaticMesh(standingGeos, meshNode.material as Three.Material, true, true);

					scene.remove(archiveStonePreview);
					archiveStonePreview.traverse((node) => { if (node instanceof THREE.Mesh) node.geometry.dispose(); });

					// The same scanned rocks continue along the shore to the right.
					for (const [x, z, scale] of [[6.0, -.6, 4.6], [9.2, -3.5, 3.2], [10.8, -1.5, 2.6], [7.2, 2.0, 2.2]]) {
						scratchPos.set(x, -.26, z);
						scratchEuler.set(0, rand() * Math.PI, 0);
						scratchQuat.setFromEuler(scratchEuler);
						scratchScale.setScalar(scale);
						scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
						instancedRocks.setMatrixAt(instanceIdx++, scratchMatrix);
					}
					instancedRocks.instanceMatrix.needsUpdate = true;
					scene.add(instancedRocks);
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

			addReedBeds();
			addDistantRidges();
			const homeSeed = seed;
			addArchiveShore();
			addReedBeds([[6.1, 1.3, 1.4, .8, 14], [11.8, .7, -.8, .8, 8]]);
			seed = homeSeed;

			// Batch all 65 procedural stone slabs into 2 static draw calls (stoneMaterial & darkStoneMaterial)
			addMergedStaticMesh(stoneSlabGeometries, stoneMaterial, true, true);
			addMergedStaticMesh(darkStoneSlabGeometries, darkStoneMaterial, true, true);

			scene.add(new THREE.HemisphereLight('#c3b99e', '#33392f', 1.2));
			const sunset = new THREE.DirectionalLight('#f4d29c', 3.2);
			sunset.position.set(1.0, 6, -8.5);
			sunset.target.position.set(-3, 0, 0);
			scene.add(sunset.target);
			sunset.castShadow = true;
			sunset.shadow.mapSize.set(512, 512);
			sunset.shadow.camera.left = -10;
			sunset.shadow.camera.right = 10;
			sunset.shadow.camera.top = 9;
			sunset.shadow.camera.bottom = -9;
			sunset.shadow.normalBias = .025;
			sunset.shadow.bias = -.0003;
			scene.add(sunset);
			const rimLight = new THREE.DirectionalLight('#ffdca4', .65);
			rimLight.position.set(3.4, 5.0, -8);
			scene.add(rimLight);
			// Soft frontal fill so the backlit torii reads as weathered grey stone
			// (as in the reference) rather than a flat black silhouette.
			const fill = new THREE.DirectionalLight('#bcb8a8', 1.35);
			fill.position.set(1.5, 3.2, 12);
			scene.add(fill);

			function addSlab({ x, y, z, radius, height, scaleZ, material }: { x: number; y: number; z: number; radius: number; height: number; scaleZ: number; material: Three.Material }) {
				const geometry = new THREE.CylinderGeometry(radius, radius * (.83 + rand() * .28), height, 7 + Math.floor(rand() * 4), 1);
				const positions = geometry.attributes.position;
				for (let i = 0; i < positions.count; i += 1) {
					positions.setX(i, positions.getX(i) * (.82 + rand() * .28));
					positions.setZ(i, positions.getZ(i) * (.78 + rand() * .34));
					positions.setY(i, positions.getY(i) + (rand() - .5) * .035);
				}
				scratchPos.set(x, y, z);
				scratchEuler.set((rand() - .5) * .08, rand() * Math.PI, (rand() - .5) * .08);
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
				const dark = new THREE.Color('#3d3c33');
				const ash = new THREE.Color('#82847b');
				const moss = new THREE.Color('#3f4a38');
				const rust = new THREE.Color('#5d3325');
				const c = new THREE.Color();
				for (let i = 0; i < count; i += 1) {
					const x = position.getX(i);
					const y = position.getY(i);
					const z = position.getZ(i);
					const patch = Math.sin(x * 36 + y * 19) * Math.cos(z * 44 - y * 17);
					const verticalWear = smoothstep(-.36, .32, y);
					c.copy(dark).lerp(ash, Math.max(0, patch) * .58).lerp(moss, Math.max(0, -patch) * .5 * verticalWear);
					if (patch > .64) c.lerp(rust, .28);
					const offset = i * 3;
					colors[offset] = c.r;
					colors[offset + 1] = c.g;
					colors[offset + 2] = c.b;
				}
				geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
			}

			function addToriiDetails() {
				const ropeMaterial = mat({ color: '#594633', roughness: 1 });
				const ropeCurve = new THREE.CatmullRomCurve3([
					new THREE.Vector3(-5.02, 3.4, -1.4),
					new THREE.Vector3(-4.1, 2.88, -1.3),
					new THREE.Vector3(-3.1, 2.82, -1.3),
					new THREE.Vector3(-2.02, 3.4, -1.4)
				]);
				const ropeGeometries: Three.BufferGeometry[] = [
					new THREE.TubeGeometry(ropeCurve, 48, .021, 6, false)
				];
				for (let i = 0; i < 30; i++) {
					const from = ropeCurve.getPoint(.03 + i / 32);
					const to = from.clone().add(new THREE.Vector3((rand() - .5) * .035, -.04 - rand() * .17, .008));
					ropeGeometries.push(new THREE.TubeGeometry(new THREE.LineCurve3(from, to), 1, .003, 3));
				}
				addMergedStaticMesh(ropeGeometries, ropeMaterial);

				const plaque = new THREE.Mesh(new THREE.BoxGeometry(.62, .82, .055), mat({ color: '#171612', roughness: .95 }));
				plaque.position.set(-3.18, 4.17, -1.11);
				plaque.rotation.z = -0.055;
				plaque.updateMatrix();
				plaque.matrixAutoUpdate = false;
				scene.add(plaque);
			}

			function addBenchAndFence() {
				const benchMat = mat({ color: '#332217', roughness: .9 });
				const legMat = mat({ color: '#211a13', roughness: 1 });
				const seat = new THREE.Mesh(new THREE.BoxGeometry(1.24, .12, .42), benchMat);
				seat.position.set(-2.92, .44, .62);
				seat.updateMatrix();
				seat.matrixAutoUpdate = false;
				scene.add(seat);

				const legGeometries: Three.BufferGeometry[] = [];
				for (const x of [-3.42, -2.42]) {
					for (const z of [.43, .8]) {
						const g = new THREE.BoxGeometry(.09, .42, .09);
						g.translate(x, .19, z);
						legGeometries.push(g);
					}
				}

				for (let i = 0; i < 4; i += 1) {
					const g = new THREE.CylinderGeometry(.08, .11, .96 - i * .06, 7);
					scratchPos.set(-.45 + i * .46, .24, -.85 - i * .02);
					scratchEuler.set(0, 0, (rand() - .5) * .1);
					scratchQuat.setFromEuler(scratchEuler);
					scratchScale.set(1, 1, 1);
					scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
					g.applyMatrix4(scratchMatrix);
					legGeometries.push(g);
				}
				const railGeo = new THREE.BoxGeometry(1.42, .11, .12);
				scratchPos.set(.18, .58, -.88);
				scratchEuler.set(0, 0, -0.02);
				scratchQuat.setFromEuler(scratchEuler);
				scratchScale.set(1, 1, 1);
				scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
				railGeo.applyMatrix4(scratchMatrix);
				legGeometries.push(railGeo);

				addMergedStaticMesh(legGeometries, legMat);
			}

			function addReedBeds(clusters = [
				[-6.4, 1.2, 3.4, 1.1, 16], [2.4, 1.8, 5.2, 1.7, 22],
				[-5.5, .8, -.7, .7, 15], [-1.8, .8, -1.3, .6, 12]
			]) {
				const stemMaterial = mat({ color: '#66513a', roughness: 1 });
				const headMaterial = mat({ color: '#857254', roughness: 1 });
				const seedGeometry = new THREE.SphereGeometry(1, 5, 4);
				const stemGeometries: Three.BufferGeometry[] = [];
				const headGeometries: Three.BufferGeometry[] = [];
				for (const [baseX, width, baseZ, depth, count] of clusters) {
					for (let i = 0; i < count; i++) {
						const x = baseX + (rand() - .5) * width;
						const z = baseZ + (rand() - .5) * depth;
						const height = .35 + rand() * 1.25;
						const lean = (rand() - .5) * .45;
						const curve = new THREE.CatmullRomCurve3([
							new THREE.Vector3(x, -.25, z),
							new THREE.Vector3(x + lean * .25, height * .35, z + .025),
							new THREE.Vector3(x + lean, height, z + .09)
						]);
						stemGeometries.push(new THREE.TubeGeometry(curve, 6, .005 + rand() * .004, 3, false));
						for (let j = 0; j < 3; j++) {
							const t = .65 + j * .12;
							const origin = curve.getPoint(t);
							const side = j % 2 === 0 ? 1 : -1;
							const end = origin.clone().add(new THREE.Vector3(side * .07, .08, 0));
							const twigCurve = new THREE.LineCurve3(origin, end);
							stemGeometries.push(new THREE.TubeGeometry(twigCurve, 1, .003, 3, false));
							const headGeo = seedGeometry.clone();
							scratchPos.copy(end);
							scratchEuler.set(0, 0, -side * .32);
							scratchQuat.setFromEuler(scratchEuler);
							scratchScale.set(.014, .05 + rand() * .025, .012);
							scratchMatrix.compose(scratchPos, scratchQuat, scratchScale);
							headGeo.applyMatrix4(scratchMatrix);
							headGeometries.push(headGeo);
						}
					}
				}
				seedGeometry.dispose();
				addMergedStaticMesh(stemGeometries, stemMaterial);
				addMergedStaticMesh(headGeometries, headMaterial);
			}

			function addArchiveShore() {
				// An adjoining island, built in this world rather than a second scene.
				for (let i = 0; i < 24; i++) {
					const angle = rand() * Math.PI * 2;
					const radius = Math.sqrt(rand());
					addSlab({ x: 8.7 + Math.cos(angle) * radius * 3.2,
						z: -.8 + Math.sin(angle) * radius * 2.1,
						y: -.2 + rand() * .06, radius: .6 + rand() * .8,
						height: .07 + rand() * .11, scaleZ: .5 + rand() * .3,
						material: rand() > .3 ? stoneMaterial : darkStoneMaterial });
				}
				// Low weathered standing stones give the nearby shore its own silhouette.
				for (const [x, z, height, radius] of [[7.1, -2.5, 2.2, .42], [7.9, -2.8, 1.25, .32]]) {
					const geometry = new THREE.IcosahedronGeometry(1, 1);
					const positions = geometry.attributes.position;
					for (let i = 0; i < positions.count; i++) {
						const wear = .86 + rand() * .2;
						positions.setXYZ(i, positions.getX(i) * wear, positions.getY(i) * wear, positions.getZ(i) * wear);
					}
					geometry.computeVertexNormals();
					const stone = new THREE.Mesh(geometry, stoneMaterial);
					stone.position.set(x, height / 2 - .15, z);
					stone.scale.set(radius, height / 2, radius * .7);
					stone.rotation.z = -.06;
					stone.castShadow = stone.receiveShadow = true;
					archiveStonePreview.add(stone);
				}
			}

			function addDistantRidges() {
				for (let row = 0; row < 3; row++) {
					const geometry = new THREE.PlaneGeometry(120, 8, 100, 1);
					const position = geometry.attributes.position;
					for (let i = 0; i < position.count; i++) {
						const x = position.getX(i);
						const top = position.getY(i) > 0;
						const ridge = Math.max(0, Math.sin(x * .16 + row * 2) * 1.8 + Math.sin(x * .39 + row) * .7 + Math.sin(x * 1.15) * .15);
						position.setY(i, top ? ridge : -3);
					}
					geometry.computeVertexNormals();
					const ridge = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
						color: ['#6e7063', '#747568', '#7e7c6d'][row], fog: true
					}));
					ridge.position.set(row * 6, -.5, -38 - row * 16);
					ridge.updateMatrix();
					ridge.matrixAutoUpdate = false;
					scene.add(ridge);
				}
			}

			function addMistLayer(x: number, y: number, z: number, w: number, h: number, opacity: number) {
				const mist = new THREE.Sprite(new THREE.SpriteMaterial({
					map: mistTexture(),
					transparent: true,
					opacity,
					depthWrite: false,
					fog: false
				}));
				materials.push(mist.material);
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

			function circleTexture() {
				const canvas = document.createElement('canvas');
				canvas.width = canvas.height = 160;
				const c = canvas.getContext('2d');
				if (!c) return addTexture(new THREE.Texture());
				const gradient = c.createRadialGradient(80, 80, 0, 80, 80, 80);
				gradient.addColorStop(0, '#fffaf0');
				gradient.addColorStop(.22, '#fdf0cf');
				gradient.addColorStop(.42, 'rgba(240,214,158,.72)');
				gradient.addColorStop(.62, 'rgba(224,193,142,.34)');
				gradient.addColorStop(.82, 'rgba(210,182,142,.12)');
				gradient.addColorStop(1, 'rgba(210,182,142,0)');
				c.fillStyle = gradient;
				c.fillRect(0, 0, 160, 160);
				return addTexture(new THREE.CanvasTexture(canvas));
			}

			function mistTexture() {
				const canvas = document.createElement('canvas');
				canvas.width = 256;
				canvas.height = 64;
				const c = canvas.getContext('2d');
				if (!c) return addTexture(new THREE.Texture());
				const gradient = c.createLinearGradient(0, 0, 0, 64);
				gradient.addColorStop(0, 'rgba(172,164,146,0)');
				gradient.addColorStop(.45, 'rgba(172,164,146,.8)');
				gradient.addColorStop(1, 'rgba(172,164,146,0)');
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
				camera.fov = width < 600 ? 55 : 26;
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
				const wrapper = container.parentElement;
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

			function render(now = performance.now()) {
				if (destroyed || contextLost || !sceneVisible || document.hidden || (reduced && !frameDirty)) {
					animation = 0;
					return;
				}
				animation = requestAnimationFrame(render);
				if (now - lastFrame < 1000 / 30) return;
				lastFrame = now;
				const time = reduced ? 0 : (now - startTime) / 1000;
				waterUniforms.time.value = time;
				mouseX += (targetMouseX - mouseX) * .035;
				mouseY += (targetMouseY - mouseY) * .035;
				smoothScroll += (scrollProgress - smoothScroll) * .08;
				if (Math.abs(scrollProgress - smoothScroll) < 0.0001) smoothScroll = scrollProgress;

				const p = currentView === 'projects' ? 0 : smoothScroll;
				if (Math.abs(p - lastReportedProgress) > 0.0004) {
					lastReportedProgress = p;
					onProgress?.(p);
					container.style.setProperty('--intro-opacity', String(Math.max(0, 1 - p * 4)));
					container.style.setProperty('--intro-drift', `${-p * 36}px`);
					if (editorial) editorial.inert = p > .24;
				}
				// Cinematic ease: slow crawl in, accelerate through gate, slow drift out
				const eased = p * p * (3 - 2 * p);
				const invT = 1 - eased;

				// Bezier path: start → torii gate → beyond
				let camX = invT * invT * 0.18 + 2 * invT * eased * (-3.55) + eased * eased * (-5.5);
				// Camera dips low approaching the gate, rises after passing through
				const gateDip = Math.sin(eased * Math.PI);
				let camY = invT * invT * 2.36 + 2 * invT * eased * 2.32 + eased * eased * 3.4 - gateDip * .35;
				const camZ = invT * invT * 19.4 + 2 * invT * eased * (-1.9) + eased * eased * (-9.0);
				if (!reduced) {
					camX += mouseX * .22 * (1 - eased);
					camY -= mouseY * .1 * (1 - eased);
				}

				// LookAt leads the camera — looks ahead toward where it's going
				const lead = Math.min(eased + .18, 1);
				const mobile = containerWidth < 600;
				const lookX = (mobile ? -3.3 : -2.3) * (1 - eased) + (-5.5) * eased;
				const lookY = (mobile ? 3.3 : 2.85) + (3.8 - (mobile ? 3.3 : 2.85)) * lead - Math.sin(lead * Math.PI) * .2;
				const lookZ = -1.7 + (-18.0 - (-1.7)) * lead;
				if (currentView === 'projects') {
					destination.set(mobile ? 9.7 : 10.4, 2.55, 17.3);
					destinationLook.set(mobile ? 8.1 : 8.6, 2.3, -2.5);
				} else {
					destination.set(camX, camY, camZ);
					destinationLook.set(lookX, lookY, lookZ);
				}
				const travel = reduced ? 1 : Math.min(1, (now - journeyStarted) / journeyDuration);
				const easedTravel = travel * travel * (3 - 2 * travel);
				if (travel === 1 && container.dataset.journey !== 'settled') container.dataset.journey = 'settled';
				camera.position.lerpVectors(fromCamera, destination, easedTravel);
				lookAt.lerpVectors(fromLook, destinationLook, easedTravel);
				camera.lookAt(lookAt);

				// Subtle cinematic roll: tilts slightly as passing through, levels out after
				camera.rotation.z = currentView === 'projects' ? 0 : Math.sin(eased * Math.PI) * .025;

				// Keep scene fully visible; sticky scroll-away reveals content naturally
				renderer.render(scene, camera);
				frameDirty = false;
			}

			function onContextLost(event: Event) {
				event.preventDefault();
				contextLost = true;
				unavailable = true;
				container.style.removeProperty('--intro-opacity');
				container.style.removeProperty('--intro-drift');
				if (editorial) editorial.inert = false;
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
				sunset.shadow.dispose();
				renderer.dispose();
				renderer.domElement.remove();
			};
		});
	});
	onDestroy(() => dispose());
</script>

<div class="wabi-scene" data-view={view} class:scene-unavailable={unavailable} class:scene-ready={sceneReady && rocksReady} bind:this={container} aria-label={view === 'projects' ? '鸟居右侧水岸的三维作品场景' : '日落水面的三维鸟居'}>
	<div class="scene-editorial" bind:this={editorial}>{@render children?.()}</div>
	{#if unavailable}<p class="scene-notice" role="status">当前设备无法显示 3D 场景，仍可继续阅读与浏览作品。</p>{/if}
	{#if simplified && !unavailable}<p class="scene-quality-note" role="status">部分模型未能载入，当前显示基础三维场景。</p>{/if}
</div>

<style>
	.wabi-scene { position: sticky; top: 0; height: 100svh; width: 100%; overflow: hidden; background: var(--color-text); }
	.scene-unavailable { background: var(--color-text); }
	.scene-unavailable :global(canvas) { visibility: hidden; }
	.scene-notice { position: absolute; top: 45%; left: var(--grid-margin); right: var(--grid-margin); max-width: 28em; color: var(--color-bg); font-size: var(--text-sm); line-height: var(--leading-base); }
	.scene-quality-note { position: absolute; top: var(--space-7); left: var(--grid-margin); right: var(--grid-margin); max-width: 28em; color: var(--color-bg); font: var(--text-xs)/var(--leading-base) var(--font-ui); text-shadow: 0 1px var(--space-2) var(--color-text); }
	.scene-editorial { position: absolute; inset: 0; z-index: 2; opacity: var(--intro-opacity, 1); transform: translateY(var(--intro-drift, 0px)); }
	.wabi-scene :global(canvas) { display: block; width: 100% !important; height: 100% !important; }
	.wabi-scene::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(180deg, rgba(226, 197, 148, .12), transparent 34%),
			radial-gradient(ellipse 74% 66% at 50% 48%, transparent 58%, rgba(28, 26, 20, .26));
		mix-blend-mode: multiply;
	}
</style>
