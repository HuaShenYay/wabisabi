<script>
	import { onMount, onDestroy } from 'svelte';
	import * as THREE from 'three';

	let container;
	let cleanup = null;

	const HERO_LINES = [
		{ text: '宋子杰是一位', col: 4 },
		{ text: 'AI艺术家与', col: 2 },
		{ text: '创意探索者', col: 1 },
		{ text: '来自上海', col: 4 },
		{ text: '热爱游戏', col: 5 },
		{ text: '与故事', col: 3 }
	];

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const isMobile = window.innerWidth < 768;

		if (container && container.clientWidth > 0 && container.clientHeight > 0) {
			initScene();
			return;
		}

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
					observer.disconnect();
					initScene();
					break;
				}
			}
		});

		if (container) observer.observe(container);

		return () => {
			observer.disconnect();
		};
	});

	function initScene() {
		if (!container) return;

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const isMobile = window.innerWidth < 768;
		const w = container.clientWidth;
		const h = container.clientHeight;

		// ===== Render text + ink bleed to canvas =====
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const texW = Math.floor(w * dpr);
		const texH = Math.floor(h * dpr);
		const textCanvas = document.createElement('canvas');
		textCanvas.width = texW;
		textCanvas.height = texH;
		const ctx = textCanvas.getContext('2d');

		// Paper base
		ctx.fillStyle = '#f0ebe0';
		ctx.fillRect(0, 0, texW, texH);

		// Hero text - asymmetric column placement matching CSS layout
		const isDesktop = w >= 768;
		const baseFontSize = isDesktop ? Math.min(w * 0.052, 66) : Math.min(w * 0.068, 46);
		ctx.font = `300 ${baseFontSize * dpr}px "Orelo Semi Wide", "Noto Serif SC", serif`;
		ctx.textBaseline = 'top';

		// Use 14-column grid for finer control with side padding
		const cols = isDesktop ? 14 : 4;
		const colW = texW / cols;
		const rowH = baseFontSize * dpr * 1.2;
		const topPad = texH * 0.15;
		const leftPad = colW * 0.5;

		// Map original 6-col positions to 14-col grid with 0.5col left padding
		// orig col 1 = 16.7% → (x - 0.5) / 14 = 0.167 → x = 0.167*14 + 0.5 = 2.84
		// orig col 2 = 33.3% → x = 0.333*14 + 0.5 = 5.16
		// orig col 3 = 50.0% → x = 0.500*14 + 0.5 = 7.5
		// orig col 4 = 66.7% → x = 0.667*14 + 0.5 = 9.84
		// orig col 5 = 83.3% → x = 0.833*14 + 0.5 = 12.16 → too far right, cap at 10
		const lines = isDesktop
			? [
					{ text: '宋子杰是一位', col: 9, row: 0 },
					{ text: 'AI艺术家与', col: 5, row: 1 },
					{ text: '创意探索者', col: 2, row: 2 },
					{ text: '来自上海', col: 9, row: 3.8 },
					{ text: '热爱游戏', col: 10, row: 4.8 },
					{ text: '与故事', col: 7, row: 5.8 }
				]
			: [
					{ text: '宋子杰', col: 2, row: 0 },
					{ text: '是一位AI艺术家', col: 1, row: 1 },
					{ text: '与创意', col: 1, row: 2 },
					{ text: '探索者', col: 2, row: 3 },
					{ text: '来自上海', col: 1, row: 4.5 },
					{ text: '热爱游戏', col: 2, row: 5.5 },
					{ text: '与故事', col: 1, row: 6.5 }
				];

		// Pass 1: Ink bleed shadow (soft, blurred, larger)
		ctx.fillStyle = 'rgba(38, 35, 32, 0.18)';
		ctx.filter = 'blur(' + (3 * dpr) + 'px)';
		lines.forEach((line, i) => {
			const x = leftPad + (line.col - 1) * colW;
			const y = topPad + line.row * rowH;
			ctx.fillText(line.text, x + 1 * dpr, y + 1 * dpr);
		});

		// Pass 2: Main ink with subtle pressure variation
		ctx.filter = 'none';
		lines.forEach((line, i) => {
			const x = leftPad + (line.col - 1) * colW;
			const y = topPad + line.row * rowH;
			const opacity = 0.75 + (i % 3) * 0.08;
			ctx.fillStyle = `rgba(32, 28, 24, ${opacity})`;
			ctx.fillText(line.text, x, y);
		});

		// Pass 3: Ink speckle at edges (salt-and-pepper texture for handmade feel)
		const imageData = ctx.getImageData(0, 0, texW, texH);
		const data = imageData.data;
		for (let i = 0; i < data.length; i += 4) {
			if (data[i] < 210 && Math.random() < 0.12) {
				const v = Math.random() * 35 - 17;
				data[i] = Math.max(0, Math.min(255, data[i] + v));
				data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + v));
				data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + v));
			}
		}
		ctx.putImageData(imageData, 0, 0);

		const textTexture = new THREE.CanvasTexture(textCanvas);
		textTexture.minFilter = THREE.LinearMipMapLinearFilter;
		textTexture.magFilter = THREE.LinearFilter;
		textTexture.anisotropy = 4;

		// ===== Scene setup =====
		const scene = new THREE.Scene();

		const camera = new THREE.OrthographicCamera(
			-w / 2, w / 2, h / 2, -h / 2, 0.1, 1000
		);
		camera.position.z = 120;

		const renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: 'high-performance'
		});
		renderer.setSize(w, h);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.05;
		container.appendChild(renderer.domElement);

		// ===== Paper plane with custom shader =====
		const segments = isMobile ? 180 : 320;
		const geometry = new THREE.PlaneGeometry(w, h, segments, segments);

		const vertexShader = `
			uniform float uTime;
			uniform float uNoiseStrength;
			uniform float uTextHeight;
			uniform sampler2D uTextTexture;
			uniform vec2 uMouse;
			uniform vec2 uPlaneSize;

			varying vec2 vUv;
			varying float vElevation;
			varying vec3 vNormal;
			varying float vTextMask;

			// Simplex 3D noise
			vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
			vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
			vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
			vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

			float snoise(vec3 v) {
				const vec2 C = vec2(1.0/6.0, 1.0/3.0);
				const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
				vec3 i = floor(v + dot(v, C.yyy));
				vec3 x0 = v - i + dot(i, C.xxx);
				vec3 g = step(x0.yzx, x0.xyz);
				vec3 l = 1.0 - g;
				vec3 i1 = min(g.xyz, l.zxy);
				vec3 i2 = max(g.xyz, l.zxy);
				vec3 x1 = x0 - i1 + C.xxx;
				vec3 x2 = x0 - i2 + C.yyy;
				vec3 x3 = x0 - D.yyy;
				i = mod289(i);
				vec4 p = permute(permute(permute(
					i.z + vec4(0.0, i1.z, i2.z, 1.0))
					+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
					+ i.x + vec4(0.0, i1.x, i2.x, 1.0));
				float n_ = 0.142857142857;
				vec3 ns = n_ * D.wyz - D.xzx;
				vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
				vec4 x_ = floor(j * ns.z);
				vec4 y_ = floor(j - 7.0 * x_);
				vec4 x = x_ * ns.x + ns.yyyy;
				vec4 y = y_ * ns.x + ns.yyyy;
				vec4 h = 1.0 - abs(x) - abs(y);
				vec4 b0 = vec4(x.xy, y.xy);
				vec4 b1 = vec4(x.zw, y.zw);
				vec4 s0 = floor(b0)*2.0 + 1.0;
				vec4 s1 = floor(b1)*2.0 + 1.0;
				vec4 sh = -step(h, vec4(0.0));
				vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
				vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
				vec3 p0 = vec3(a0.xy, h.x);
				vec3 p1 = vec3(a0.zw, h.y);
				vec3 p2 = vec3(a1.xy, h.z);
				vec3 p3 = vec3(a1.zw, h.w);
				vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
				p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
				vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
				m = m * m;
				return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
			}

			void main() {
				vUv = uv;

				// Text luminance -> height map (ink = raised)
				float textLum = texture2D(uTextTexture, uv).r;
				float textHeight = (1.0 - textLum) * uTextHeight;

				// Multi-octave paper fiber noise
				float n1 = snoise(vec3(uv * 2.5, uTime * 0.05)) * 0.5;
				float n2 = snoise(vec3(uv * 6.0, uTime * 0.03)) * 0.25;
				float n3 = snoise(vec3(uv * 14.0, uTime * 0.02)) * 0.1;
				float n4 = snoise(vec3(uv * 30.0, uTime * 0.01)) * 0.04;
				float paperNoise = (n1 + n2 + n3 + n4) * uNoiseStrength;

				// Fibrous lines along paper grain
				float grain = snoise(vec3(uv.x * 8.0 + uv.y * 0.3, uv.y * 25.0, uTime * 0.02)) * 0.12;

				// Mouse parallax: subtle Z shift and slight XY warp
				float parallaxZ = (uMouse.x * 0.5 + uMouse.y * 0.3) * 2.0;
				vec2 warp = vec2(uMouse.x * 0.002, uMouse.y * 0.001);

				vec3 pos = position;
				pos.xy += warp * pos.xy * 0.02;

				// Combined elevation: text rises above paper fibers
				float elevation = paperNoise + grain + textHeight + parallaxZ;
				vElevation = elevation;
				vTextMask = 1.0 - textLum;

				pos.z += elevation;

				// Compute normal from finite differences (paper noise + text height)
				float eps = 1.0 / 256.0;

				// Paper noise at neighbors
				float nL = snoise(vec3((uv - vec2(eps, 0.0)) * 2.5, uTime * 0.05)) * 0.5
					+ snoise(vec3((uv - vec2(eps, 0.0)) * 6.0, uTime * 0.03)) * 0.25;
				float nR = snoise(vec3((uv + vec2(eps, 0.0)) * 2.5, uTime * 0.05)) * 0.5
					+ snoise(vec3((uv + vec2(eps, 0.0)) * 6.0, uTime * 0.03)) * 0.25;
				float nD = snoise(vec3((uv - vec2(0.0, eps)) * 2.5, uTime * 0.05)) * 0.5
					+ snoise(vec3((uv - vec2(0.0, eps)) * 6.0, uTime * 0.03)) * 0.25;
				float nU = snoise(vec3((uv + vec2(0.0, eps)) * 2.5, uTime * 0.05)) * 0.5
					+ snoise(vec3((uv + vec2(0.0, eps)) * 6.0, uTime * 0.03)) * 0.25;

				float paperL = nL * uNoiseStrength;
				float paperR = nR * uNoiseStrength;
				float paperD = nD * uNoiseStrength;
				float paperU = nU * uNoiseStrength;

				// Text height at neighbors
				float textLumL = texture2D(uTextTexture, uv - vec2(eps, 0.0)).r;
				float textLumR = texture2D(uTextTexture, uv + vec2(eps, 0.0)).r;
				float textLumD = texture2D(uTextTexture, uv - vec2(0.0, eps)).r;
				float textLumU = texture2D(uTextTexture, uv + vec2(0.0, eps)).r;
				float textHL = (1.0 - textLumL) * uTextHeight;
				float textHR = (1.0 - textLumR) * uTextHeight;
				float textHD = (1.0 - textLumD) * uTextHeight;
				float textHU = (1.0 - textLumU) * uTextHeight;

				float hL = paperL + textHL;
				float hR = paperR + textHR;
				float hD = paperD + textHD;
				float hU = paperU + textHU;

				// Proper normal from height field (world-space scale)
				float dx = uPlaneSize.x * eps;
				float dy = uPlaneSize.y * eps;
				vec3 nrm = normalize(vec3(
					(hL - hR) / (2.0 * dx),
					(hD - hU) / (2.0 * dy),
					1.0
				));
				vNormal = nrm;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
			}
		`;

		const fragmentShader = `
			uniform sampler2D uTextTexture;
			uniform vec3 uPaper;
			uniform vec3 uPaperWarm;
			uniform vec3 uPaperDeep;
			uniform vec3 uInk;
			uniform vec3 uInkWarm;
			uniform vec3 uClay;
			uniform vec3 uSand;
			uniform float uTime;

			varying vec2 vUv;
			varying float vElevation;
			varying vec3 vNormal;
			varying float vTextMask;

			// Simple hash noise for grain
			float hash(vec2 p) {
				return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
			}

			void main() {
				// Paper base gradient (warm at top, deeper at bottom)
				vec3 paperGrad = mix(uPaper, uPaperWarm, vUv.y);
				paperGrad = mix(paperGrad, uPaperDeep, smoothstep(0.5, 1.0, vUv.y));

				// Side light from upper-left (low angle, strong shadows for relief)
				vec3 lightDir = normalize(vec3(-0.6, 0.25, 0.45));
				float diffuse = max(dot(vNormal, lightDir), 0.0);

				// Strong rim light from right side
				vec3 rimDir = normalize(vec3(0.9, 0.1, 0.35));
				float rim = pow(max(dot(vNormal, rimDir), 0.0), 1.8) * 0.45;

				// Ambient bounce from below
				float bounce = max(dot(vNormal, vec3(0.0, -0.5, 0.85)), 0.0) * 0.08;

				float totalLight = 0.38 + diffuse * 0.62 + rim + bounce;

				// Lit paper
				vec3 litPaper = paperGrad * totalLight;

				// Text shadow cast on paper below text (self-shadowing)
				vec2 shadowOffset = vec2(0.012, -0.008);
				float shadowText = texture2D(uTextTexture, vUv + shadowOffset).r;
				float shadow = (1.0 - shadowText) * 0.35 * (1.0 - vTextMask);

				// Text ink - beveled edge effect for embossed look
				float textSharp = smoothstep(0.25, 0.55, vTextMask);
				float textSoft = smoothstep(0.0, 0.4, vTextMask);
				float bevel = textSoft - textSharp;

				vec3 ink = mix(uInkWarm, uInk, textSharp);
				float inkLight = 0.2 + diffuse * 0.5 + rim * 0.75;
				vec3 litInk = ink * inkLight;

				// Blend ink over paper
				vec3 color = mix(litPaper, litInk, textSharp);

				// Bevel / edge highlight (clay-like warm tone catching side light)
				vec3 edgeColor = uClay * (0.35 + totalLight * 0.65);
				color = mix(color, edgeColor, bevel * 0.4);

				// Apply shadow
				color *= 1.0 - shadow;

				// Fine grain shimmer
				float grain1 = hash(vUv * 1200.0 + uTime * 0.001) * 0.018;
				float grain2 = hash(vUv * 600.0 + vec2(uTime * 0.002)) * 0.01;
				color += grain1 + grain2 - 0.014;

				// Vignette - darker at edges (Yugen)
				float vigX = smoothstep(1.0, 0.2, abs(vUv.x - 0.5) * 2.0);
				float vigY = smoothstep(1.0, 0.25, abs(vUv.y - 0.5) * 2.0);
				float vignette = vigX * vigY;
				color = mix(color * 0.88, color, vignette);

				gl_FragColor = vec4(color, 1.0);
			}
		`;

		const uniforms = {
			uTime: { value: 0 },
			uTextTexture: { value: textTexture },
			uNoiseStrength: { value: isMobile ? 4.0 : 10.0 },
			uTextHeight: { value: 60.0 },
			uMouse: { value: new THREE.Vector2(0, 0) },
			uPlaneSize: { value: new THREE.Vector2(w, h) },
			uPaper: { value: new THREE.Color('#f5efe3') },
			uPaperWarm: { value: new THREE.Color('#ede4d0') },
			uPaperDeep: { value: new THREE.Color('#d9cfb8') },
			uInk: { value: new THREE.Color('#111010') },
			uInkWarm: { value: new THREE.Color('#23201b') },
			uClay: { value: new THREE.Color('#c47a48') },
			uSand: { value: new THREE.Color('#c9c0b3') }
		};

		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		// ===== Floating dust particles =====
		const particleCount = isMobile ? 30 : 80;
		const particleGeo = new THREE.BufferGeometry();
		const particlePositions = new Float32Array(particleCount * 3);
		const particleSizes = new Float32Array(particleCount);
		const particleSpeeds = new Float32Array(particleCount);

		for (let i = 0; i < particleCount; i++) {
			particlePositions[i * 3] = (Math.random() - 0.5) * w * 1.2;
			particlePositions[i * 3 + 1] = (Math.random() - 0.5) * h * 1.2;
			particlePositions[i * 3 + 2] = Math.random() * 30 - 15;
			particleSizes[i] = Math.random() * 1.5 + 0.5;
			particleSpeeds[i] = Math.random() * 0.5 + 0.1;
		}

		particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
		particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

		const particleMat = new THREE.PointsMaterial({
			color: 0x8a8379,
			size: 1.2,
			transparent: true,
			opacity: 0.25,
			sizeAttenuation: true
		});

		const particles = new THREE.Points(particleGeo, particleMat);
		scene.add(particles);

		// ===== Mouse parallax =====
		let targetMouseX = 0;
		let targetMouseY = 0;
		let mouseX = 0;
		let mouseY = 0;

		function onMouseMove(e) {
			const rect = container.getBoundingClientRect();
			targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
			targetMouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
		}

		if (!isMobile && !reduce) {
			window.addEventListener('mousemove', onMouseMove, { passive: true });
		}

		// ===== Resize =====
		function onResize() {
			const nw = container.clientWidth;
			const nh = container.clientHeight;
			camera.left = -nw / 2;
			camera.right = nw / 2;
			camera.top = nh / 2;
			camera.bottom = -nh / 2;
			camera.updateProjectionMatrix();
			renderer.setSize(nw, nh);
			mesh.scale.set(nw / w, nh / h, 1);
		}
		window.addEventListener('resize', onResize, { passive: true });

		// ===== Animation loop =====
		let animationId;
		const clock = new THREE.Clock();

		function animate() {
			const elapsed = clock.getElapsedTime();
			uniforms.uTime.value = reduce ? 0 : elapsed;

			mouseX += (targetMouseX - mouseX) * 0.035;
			mouseY += (targetMouseY - mouseY) * 0.035;
			uniforms.uMouse.value.set(mouseX, mouseY);

			// Subtle plane tilt
			if (!reduce) {
				mesh.rotation.x = mouseY * 0.025;
				mesh.rotation.y = mouseX * 0.025;
			}

			// Float particles gently
			if (!reduce) {
				const pos = particleGeo.attributes.position.array;
				for (let i = 0; i < particleCount; i++) {
					pos[i * 3 + 1] += particleSpeeds[i] * 0.3;
					pos[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.05;
					if (pos[i * 3 + 1] > h * 0.7) {
						pos[i * 3 + 1] = -h * 0.7;
					}
				}
				particleGeo.attributes.position.needsUpdate = true;
			}

			renderer.render(scene, camera);
			animationId = requestAnimationFrame(animate);
		}

		if (reduce) {
			renderer.render(scene, camera);
		} else {
			animate();
		}

		cleanup = () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('resize', onResize);
			geometry.dispose();
			material.dispose();
			textTexture.dispose();
			particleGeo.dispose();
			particleMat.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode) {
				renderer.domElement.parentNode.removeChild(renderer.domElement);
			}
		};
	}

	onDestroy(() => {
		if (cleanup) cleanup();
	});
</script>

<div class="hero-canvas-container" bind:this={container}></div>

<style>
	.hero-canvas-container {
		position: relative;
		width: 100%;
		height: clamp(480px, 70vh, 720px);
		z-index: 1;
		pointer-events: none;
	}
	@media (max-width: 768px) {
		.hero-canvas-container {
			height: clamp(400px, 60vh, 520px);
		}
	}
</style>
