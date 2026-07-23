<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';
	import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

	let container;
	let dispose = () => {};

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
		renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.76;
		container.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.background = new THREE.Color('#899486');
		scene.fog = new THREE.FogExp2('#899486', 0.053);

		const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 120);
		const cameraHome = new THREE.Vector3(0.18, 2.36, 19.4);
		const target = new THREE.Vector3(-2.7, 2.85, -1.7);
		camera.position.copy(cameraHome);

		const clock = new THREE.Clock();
		let animation;
		let mouseX = 0;
		let mouseY = 0;
		let targetMouseX = 0;
		let targetMouseY = 0;
		let seed = 1776;
		const materials = [];
		const textures = [];

		function rand() {
			seed = (seed * 1664525 + 1013904223) >>> 0;
			return seed / 4294967296;
		}

		function mat(options) {
			const result = new THREE.MeshStandardMaterial(options);
			materials.push(result);
			return result;
		}

		function addTexture(texture) {
			texture.colorSpace = THREE.SRGBColorSpace;
			textures.push(texture);
			return texture;
		}

		const sky = new THREE.Mesh(
			new THREE.SphereGeometry(80, 40, 22),
			new THREE.ShaderMaterial({
				side: THREE.BackSide,
				fog: false,
				vertexShader: 'varying vec3 v; void main(){ v=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
				fragmentShader: `varying vec3 v; void main(){
					float h=normalize(v).y*.5+.5;
					vec3 low=vec3(.45,.54,.47);
					vec3 mid=vec3(.64,.61,.47);
					vec3 high=vec3(.91,.63,.39);
					vec3 c=mix(low,mid,smoothstep(.18,.55,h));
					c=mix(c,high,smoothstep(.55,.94,h));
					gl_FragColor=vec4(c,1.);
				}`
			})
		);
		scene.add(sky);

		const sun = new THREE.Sprite(new THREE.SpriteMaterial({
			map: circleTexture(),
			transparent: true,
			depthWrite: false,
			fog: false
		}));
		sun.position.set(5.35, 3.28, -18);
		sun.scale.set(1.2, 1.2, 1);
		scene.add(sun);

		const waterUniforms = {
			time: { value: 0 },
			sunX: { value: 4.85 }
		};
		const water = new THREE.Mesh(
			new THREE.PlaneGeometry(110, 110, 150, 150),
			new THREE.ShaderMaterial({
				uniforms: waterUniforms,
				transparent: true,
				vertexShader: `uniform float time; varying vec3 p; varying float ripple; void main(){
					vec3 q=position;
					float a=sin(q.x*.21+time*.17)*.028;
					float b=cos(q.z*.31-time*.22)*.022;
					q.y+=a+b;
					ripple=a+b;
					p=(modelMatrix*vec4(q,1.)).xyz;
					gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
				}`,
				fragmentShader: `uniform float time; uniform float sunX; varying vec3 p; varying float ripple; void main(){
					float distanceFade=smoothstep(-10.,20.,p.z);
					float mirrored=exp(-(p.x-sunX)*(p.x-sunX)*.22);
					float broken=.45+.55*sin(p.z*7.4+sin(p.x*2.1)*2.5+time*.8);
					float small=.35+.65*sin(p.z*16.0+p.x*.9-time*.55);
					float reflection=mirrored*broken*small*smoothstep(-7.,9.,p.z);
					vec3 base=mix(vec3(.18,.25,.22),vec3(.42,.46,.35),distanceFade);
					base+=vec3(1.0,.42,.16)*reflection*.31;
					base+=vec3(.05,.07,.05)*ripple;
					gl_FragColor=vec4(base,.94);
				}`
			})
		);
		water.rotation.x = -Math.PI / 2;
		water.position.y = -0.28;
		scene.add(water);

		addMistLayer(-7.5, 1.1, -9, 16, 1.9, 0.34);
		addMistLayer(2.5, 1.0, -10, 18, 1.6, 0.26);

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
			color: '#292820',
			roughness: 1,
			metalness: 0,
			vertexColors: true
		});
		new STLLoader().load('/models/torii.stl', (geometry) => {
			geometry.computeVertexNormals();
			weatherGeometry(geometry);
			const torii = new THREE.Mesh(geometry, toriiMaterial);
			torii.scale.setScalar(6.7);
			torii.position.set(-3.55, 2.32, -1.9);
			torii.rotation.set(0.012, -0.04, 0.008);
			scene.add(torii);
		});

		addToriiDetails();
		addBenchAndFence();

		new GLTFLoader().load('/models/rock/rock_07.gltf', (gltf) => {
			const source = gltf.scene;
			source.traverse((node) => {
				if (!node.isMesh) return;
				node.material = node.material.clone();
				node.material.roughness = 1;
				node.material.color.multiply(new THREE.Color('#6d6753'));
				materials.push(node.material);
			});
			for (let i = 0; i < 12; i += 1) {
				const rock = source.clone(true);
				const angle = rand() * Math.PI * 2;
				rock.position.set(-2.65 + Math.cos(angle) * (3.05 + rand() * 1.25), -0.23, -1.05 + Math.sin(angle) * (1.25 + rand() * .65));
				rock.rotation.set((rand() - .5) * .18, rand() * Math.PI, (rand() - .5) * .12);
				rock.scale.setScalar(.32 + rand() * .58);
				scene.add(rock);
			}
		});

		addReedBeds();
		addBirds();
		addPerchedSilhouette();

		scene.add(new THREE.HemisphereLight('#b6b18d', '#151c15', 1.55));
		const sunset = new THREE.DirectionalLight('#ff9a5d', 3.65);
		sunset.position.set(6, 3.5, -13);
		scene.add(sunset);
		const fill = new THREE.DirectionalLight('#7fa28e', 1.0);
		fill.position.set(-5.5, 7, 6);
		scene.add(fill);

		function addSlab({ x, y, z, radius, height, scaleZ, material }) {
			const geometry = new THREE.CylinderGeometry(radius, radius * (.83 + rand() * .28), height, 7 + Math.floor(rand() * 4), 1);
			const positions = geometry.attributes.position;
			for (let i = 0; i < positions.count; i += 1) {
				positions.setX(i, positions.getX(i) * (.82 + rand() * .28));
				positions.setZ(i, positions.getZ(i) * (.78 + rand() * .34));
				positions.setY(i, positions.getY(i) + (rand() - .5) * .035);
			}
			positions.needsUpdate = true;
			geometry.computeVertexNormals();
			const slab = new THREE.Mesh(geometry, material);
			slab.position.set(x, y, z);
			slab.scale.set(1, 1, scaleZ);
			slab.rotation.set((rand() - .5) * .08, rand() * Math.PI, (rand() - .5) * .08);
			scene.add(slab);
			return slab;
		}

		function weatherGeometry(geometry) {
			const position = geometry.attributes.position;
			const colors = [];
			const dark = new THREE.Color('#1c1a15');
			const ash = new THREE.Color('#54584a');
			const moss = new THREE.Color('#2f3d2b');
			const rust = new THREE.Color('#5d3325');
			for (let i = 0; i < position.count; i += 1) {
				const x = position.getX(i);
				const y = position.getY(i);
				const z = position.getZ(i);
				const patch = Math.sin(x * 36 + y * 19) * Math.cos(z * 44 - y * 17);
				const verticalWear = smoothstep(-.36, .32, y);
				const c = dark.clone().lerp(ash, Math.max(0, patch) * .58).lerp(moss, Math.max(0, -patch) * .5 * verticalWear);
				if (patch > .64) c.lerp(rust, .28);
				colors.push(c.r, c.g, c.b);
			}
			geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		}

		function addToriiDetails() {
			const vineMat = new THREE.LineBasicMaterial({ color: '#27271b', transparent: true, opacity: .9 });
			materials.push(vineMat);
			for (let i = 0; i < 58; i += 1) {
				const x = -6.05 + rand() * 5.35;
				const top = 4.66 + rand() * .34;
				const length = .22 + Math.pow(rand(), 1.55) * 1.35;
				const z = -1.37 + (rand() - .5) * .24;
				const curve = new THREE.CatmullRomCurve3([
					new THREE.Vector3(x, top, z),
					new THREE.Vector3(x + (rand() - .5) * .09, top - length * .44, z + (rand() - .5) * .04),
					new THREE.Vector3(x + (rand() - .5) * .14, top - length, z)
				]);
				const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(5));
				scene.add(new THREE.Line(geometry, vineMat));
			}

			const rope = new THREE.Mesh(
				new THREE.TorusGeometry(1.32, .025, 8, 80, Math.PI),
				mat({ color: '#4a321f', roughness: 1 })
			);
			rope.position.set(-3.35, 3.34, -1.18);
			rope.rotation.set(Math.PI, 0, 0);
			rope.scale.set(1.55, .48, 1);
			scene.add(rope);

			const plaque = new THREE.Mesh(new THREE.BoxGeometry(.62, .82, .055), mat({ color: '#171612', roughness: .95 }));
			plaque.position.set(-3.18, 4.17, -1.11);
			plaque.rotation.z = -0.055;
			scene.add(plaque);
		}

		function addBenchAndFence() {
			const benchMat = mat({ color: '#332217', roughness: .9 });
			const legMat = mat({ color: '#211a13', roughness: 1 });
			const seat = new THREE.Mesh(new THREE.BoxGeometry(1.24, .12, .42), benchMat);
			seat.position.set(-2.92, .44, .62);
			scene.add(seat);
			for (const x of [-3.42, -2.42]) {
				for (const z of [.43, .8]) {
					const leg = new THREE.Mesh(new THREE.BoxGeometry(.09, .42, .09), legMat);
					leg.position.set(x, .19, z);
					scene.add(leg);
				}
			}

			for (let i = 0; i < 4; i += 1) {
				const post = new THREE.Mesh(new THREE.CylinderGeometry(.08, .11, .96 - i * .06, 7), legMat);
				post.position.set(-.45 + i * .46, .24, -.85 - i * .02);
				post.rotation.z = (rand() - .5) * .1;
				scene.add(post);
			}
			const rail = new THREE.Mesh(new THREE.BoxGeometry(1.42, .11, .12), legMat);
			rail.position.set(.18, .58, -.88);
			rail.rotation.z = -0.02;
			scene.add(rail);
		}

		function addReedBeds() {
			const reedTexture = makeReedTexture();
			const clusters = [
				[-7.2, 1.7, 5.5, 2.7, 32],
				[3.9, 1.5, 4.9, 3.2, 42],
				[-5.9, .9, -1.2, 2.5, 22],
				[-.9, .95, -1.3, 1.6, 18]
			];
			for (const [baseX, width, baseZ, depth, count] of clusters) {
				for (let i = 0; i < count; i += 1) {
					const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
						map: reedTexture,
						transparent: true,
						depthWrite: false,
						fog: true,
						color: new THREE.Color().setHSL(.045 + rand() * .025, .44, .3 + rand() * .13)
					}));
					materials.push(sprite.material);
					sprite.position.set(baseX + (rand() - .5) * width, .34 + rand() * .22, baseZ + (rand() - .5) * depth);
					const size = .8 + rand() * 1.25;
					sprite.scale.set(size * (.46 + rand() * .22), size, 1);
					scene.add(sprite);
				}
			}
		}

		function addBirds() {
			const textureA = makeBirdTexture(false);
			const textureB = makeBirdTexture(true);
			for (let i = 0; i < 24; i += 1) {
				const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
					map: i % 3 === 0 ? textureB : textureA,
					transparent: true,
					depthWrite: false,
					fog: false,
					color: '#181811'
				}));
				materials.push(sprite.material);
				sprite.position.set(2.2 + rand() * 5.6, 4.0 + rand() * 2.25, -9.5 - rand() * 2.5);
				const size = .12 + rand() * .18;
				sprite.scale.set(size * (1.4 + rand()), size, 1);
				scene.add(sprite);
			}
		}

		function addPerchedSilhouette() {
			const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
				map: makePerchedTexture(),
				transparent: true,
				depthWrite: false,
				fog: true,
				color: '#11120d'
			}));
			materials.push(sprite.material);
			sprite.position.set(.95, .46, .48);
			sprite.scale.set(.48, .78, 1);
			scene.add(sprite);
		}

		function addMistLayer(x, y, z, w, h, opacity) {
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
			scene.add(mist);
		}

		function smoothstep(edge0, edge1, x) {
			const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
			return t * t * (3 - 2 * t);
		}

		function circleTexture() {
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 160;
			const c = canvas.getContext('2d');
			const gradient = c.createRadialGradient(80, 80, 0, 80, 80, 80);
			gradient.addColorStop(0, '#fff9d8');
			gradient.addColorStop(.38, '#ffd48f');
			gradient.addColorStop(.58, '#ff8a5e');
			gradient.addColorStop(.75, 'rgba(255,129,83,.24)');
			gradient.addColorStop(1, 'rgba(255,129,83,0)');
			c.fillStyle = gradient;
			c.fillRect(0, 0, 160, 160);
			return addTexture(new THREE.CanvasTexture(canvas));
		}

		function mistTexture() {
			const canvas = document.createElement('canvas');
			canvas.width = 256;
			canvas.height = 64;
			const c = canvas.getContext('2d');
			const gradient = c.createLinearGradient(0, 0, 0, 64);
			gradient.addColorStop(0, 'rgba(137,148,134,0)');
			gradient.addColorStop(.45, 'rgba(137,148,134,.8)');
			gradient.addColorStop(1, 'rgba(137,148,134,0)');
			c.fillStyle = gradient;
			c.fillRect(0, 0, 256, 64);
			return addTexture(new THREE.CanvasTexture(canvas));
		}

		function makeReedTexture() {
			const canvas = document.createElement('canvas');
			canvas.width = 128;
			canvas.height = 256;
			const c = canvas.getContext('2d');
			for (let i = 0; i < 36; i += 1) {
				const x = 20 + rand() * 88;
				const top = 20 + rand() * 70;
				c.strokeStyle = i % 3 === 0 ? 'rgba(132,58,38,.86)' : 'rgba(75,45,31,.78)';
				c.lineWidth = .9 + rand() * 1.2;
				c.beginPath();
				c.moveTo(x, 252);
				c.quadraticCurveTo(x + (rand() - .5) * 20, 150, x + (rand() - .5) * 26, top);
				c.stroke();
			}
			return addTexture(new THREE.CanvasTexture(canvas));
		}

		function makeBirdTexture(openWing) {
			const canvas = document.createElement('canvas');
			canvas.width = 96;
			canvas.height = 48;
			const c = canvas.getContext('2d');
			c.strokeStyle = '#151511';
			c.lineWidth = 5;
			c.lineCap = 'round';
			c.beginPath();
			if (openWing) {
				c.moveTo(10, 28); c.quadraticCurveTo(35, 4, 48, 26); c.quadraticCurveTo(64, 4, 86, 22);
			} else {
				c.moveTo(10, 24); c.quadraticCurveTo(33, 14, 48, 25); c.quadraticCurveTo(63, 14, 86, 24);
			}
			c.stroke();
			return addTexture(new THREE.CanvasTexture(canvas));
		}

		function makePerchedTexture() {
			const canvas = document.createElement('canvas');
			canvas.width = 96;
			canvas.height = 128;
			const c = canvas.getContext('2d');
			c.fillStyle = '#10110d';
			c.beginPath();
			c.ellipse(48, 76, 15, 34, -.12, 0, Math.PI * 2);
			c.fill();
			c.beginPath();
			c.ellipse(50, 34, 9, 12, 0, 0, Math.PI * 2);
			c.fill();
			c.strokeStyle = '#10110d';
			c.lineWidth = 8;
			c.lineCap = 'round';
			c.beginPath();
			c.moveTo(52, 42);
			c.quadraticCurveTo(34, 28, 46, 18);
			c.stroke();
			c.lineWidth = 3;
			c.beginPath();
			c.moveTo(42, 108); c.lineTo(36, 125);
			c.moveTo(52, 108); c.lineTo(58, 125);
			c.stroke();
			return addTexture(new THREE.CanvasTexture(canvas));
		}

		function resize() {
			const { width, height } = container.getBoundingClientRect();
			if (!width || !height) return;
			renderer.setSize(width, height, false);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}

		function move(event) {
			const bounds = container.getBoundingClientRect();
			targetMouseX = (event.clientX - bounds.left) / bounds.width - .5;
			targetMouseY = (event.clientY - bounds.top) / bounds.height - .5;
		}

		function render() {
			animation = requestAnimationFrame(render);
			const time = clock.getElapsedTime();
			waterUniforms.time.value = time;
			mouseX += (targetMouseX - mouseX) * .035;
			mouseY += (targetMouseY - mouseY) * .035;
			if (!reduced) camera.position.set(cameraHome.x + mouseX * .22, cameraHome.y - mouseY * .1, cameraHome.z);
			camera.lookAt(target);
			renderer.render(scene, camera);
		}

		const observer = new ResizeObserver(resize);
		observer.observe(container);
		container.addEventListener('pointermove', move, { passive: true });
		resize();
		render();
		dispose = () => {
			cancelAnimationFrame(animation);
			observer.disconnect();
			container.removeEventListener('pointermove', move);
			scene.traverse((object) => object.geometry?.dispose?.());
			materials.forEach((item) => item.dispose());
			textures.forEach((item) => item.dispose());
			renderer.dispose();
			renderer.domElement.remove();
		};
	});
	onDestroy(() => dispose());
</script>

<div class="wabi-scene" bind:this={container} aria-label="Three dimensional torii at sunset"></div>

<style>
	.wabi-scene { position: absolute; inset: 0; overflow: hidden; background: #899486; }
	.wabi-scene :global(canvas) { display: block; width: 100% !important; height: 100% !important; }
	.wabi-scene::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			linear-gradient(180deg, rgba(255, 172, 104, .13), transparent 34%),
			radial-gradient(ellipse 74% 66% at 50% 48%, transparent 55%, rgba(15, 19, 15, .34));
		mix-blend-mode: multiply;
	}
</style>
