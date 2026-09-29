<script lang="ts">
	import { onMount } from 'svelte';
	import type * as Three from 'three';
	let host: HTMLDivElement;
	onMount(() => {
		let destroyed = false;
		let cleanup = () => {};
		// The landscape is entirely geometry. Render only on resize, not on an idle animation loop.
		void import('./wabi-three.js').then(THREE => {
			if (destroyed) return;
			let renderer: Three.WebGLRenderer;
			try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
			catch { return; }
			renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
			renderer.setClearColor(0, 0);
			host.appendChild(renderer.domElement);
			const css = getComputedStyle(host);
			const paper = css.getPropertyValue('--color-bg-deep').trim();
			const stone = css.getPropertyValue('--color-text-muted').trim();
			const scene = new THREE.Scene();
			scene.fog = new THREE.Fog(paper, 12, 36);
			const camera = new THREE.PerspectiveCamera(32, 1, .1, 80);
			camera.position.set(1, 3.6, 18);
			camera.lookAt(0, 1, -2);
			scene.add(new THREE.HemisphereLight(paper, stone, 2));
			const light = new THREE.DirectionalLight(paper, 3);
			light.position.set(-5, 10, 6); scene.add(light);
			const material = new THREE.MeshStandardMaterial({ color: stone, roughness: 1, flatShading: true });
			let seed = 732;
			const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
			const geometries: Three.BufferGeometry[] = [];
			const matrix = new THREE.Matrix4();
			const pos = new THREE.Vector3();
			const euler = new THREE.Euler();
			const quat = new THREE.Quaternion();
			const scale = new THREE.Vector3();
			for (let row = 0; row < 3; row++) {
				for (let i = 0; i < 16; i++) {
					const geometry = new THREE.IcosahedronGeometry(1, 1);
					const vertices = geometry.attributes.position;
					for (let v = 0; v < vertices.count; v++) {
						const x = vertices.getX(v), y = vertices.getY(v), z = vertices.getZ(v);
						const wear = .86 + Math.sin(x * 9 + z * 7) * .12;
						vertices.setXYZ(v, x * wear, y * wear, z * wear);
					}
					const x = (i - 7.5) * 2.7;
					const rise = Math.abs(x) / 12;
					pos.set(x, -2 + rise + random() * .55, -row * 7);
					scale.set(1.6 + random(), .65 + rise + random() * .7, 1.2 + random());
					euler.set(random() * .3, random() * 3, random() * .3);
					quat.setFromEuler(euler);
					matrix.compose(pos, quat, scale);
					geometry.applyMatrix4(matrix);
					geometry.computeVertexNormals();
					geometries.push(geometry);
				}
			}
			const merged = THREE.mergeGeometries(geometries, false);
			for (const g of geometries) g.dispose();
			if (merged) {
				const mesh = new THREE.Mesh(merged, material);
				mesh.matrixAutoUpdate = false;
				scene.add(mesh);
			}
			const render = () => {
				const { width, height } = host.getBoundingClientRect();
				if (destroyed || !width || !height) return;
				renderer.setSize(width, height, false);
				camera.aspect = width / height; camera.updateProjectionMatrix();
				renderer.render(scene, camera);
			};
			const observer = new ResizeObserver(render); observer.observe(host); render();
			cleanup = () => {
				observer.disconnect();
				scene.traverse(node => { if (node instanceof THREE.Mesh) node.geometry.dispose(); });
				material.dispose(); renderer.dispose(); renderer.domElement.remove();
			};
		}).catch(() => { /* Decorative scene failure must not block content. */ });
		return () => { destroyed = true; cleanup(); };
	});
</script>

<div class="archive-landscape" bind:this={host} aria-hidden="true"></div>

<style>
	.archive-landscape { position: absolute; inset: 0; opacity: .38; pointer-events: none; }
	.archive-landscape :global(canvas) { width: 100%; height: 100%; display: block; }
</style>
