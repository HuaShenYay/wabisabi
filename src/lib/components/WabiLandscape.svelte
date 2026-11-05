<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import LandscapePlate from './LandscapePlate.svelte';

	let { view = 'home' }: { view?: 'home' | 'projects' } = $props();
	let container: HTMLDivElement;
	let nightRequested = $state(false);
	let nightReady = $state(false);
	let dayFailed = $state(false);
	let nightFailed = $state(false);
	let trunkFailed = $state(false);
	let boughFailed = $state(false);
	let dayRequested = $state(false);
	const showDay = $derived(view === 'home' || dayRequested);
	const showNight = $derived(view === 'projects' || nightRequested);
	let refresh = () => {};
	$effect(() => { void view; void nightReady; refresh(); });
	$effect(() => { if (view === 'home') dayRequested = true; });
	afterNavigate(() => refresh());

	onMount(() => {
		let frame = 0;
		let renderedView = view;
		let geometryDirty = true;
		let host: HTMLElement | null = null;
		let hero: HTMLElement | null = null;
		let top = 0, distance = 1, height = 1;
		let chapterTops: number[] = [];
		let ambient: Animation[] = [];
		let active = true;
		let disposed = false;
		const visited = new Set<string>();
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const narrow = matchMedia('(max-width: 768px)');
		const day = container.querySelector<HTMLElement>('.scene-day')!;
		const night = container.querySelector<HTMLElement>('.scene-night')!;
		const near = container.querySelector<HTMLElement>('.scene-foreground')!;
		const far = container.querySelector<HTMLElement>('.scene-distance')!;
		const veil = container.querySelector<HTMLElement>('.reading-veil')!;
		const mist = container.querySelector<HTMLElement>('.scene-mist')!;
		const branch = container.querySelector<HTMLElement>('.wind-branch')!;
		const clamp = (n: number) => Math.max(0, Math.min(1, n));
		const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
		const write = (element: HTMLElement | SVGElement, key: 'transform' | 'opacity' | 'visibility', value: string) => {
			if (element.style[key] !== value) element.style[key] = value;
		};
		const resize = new ResizeObserver(() => refresh());
		resize.observe(container);

		function stopWind() {
			ambient.forEach(animation => animation.cancel());
			ambient = [];
			container.dataset.wind = 'settled';
		}
		function breeze(chapter: string) {
			if (motion.matches || !active || document.hidden || visited.has(chapter)) return;
			visited.add(chapter);
			stopWind();
			container.dataset.wind = 'moving';
			const time = chapter === 'home-0' || chapter === 'projects' ? 6000 : 3600;
			ambient = [
				mist.animate([{ transform: 'translate3d(-2%,0,0)', opacity: .12 }, { transform: 'translate3d(1%,0,0)', opacity: .3, offset: .42 }, { transform: 'translate3d(0,0,0)', opacity: .18 }], { duration: time, easing: 'cubic-bezier(.22,.61,.36,1)' }),
				branch.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-1.1deg)', offset: .3 }, { transform: 'rotate(.35deg)', offset: .65 }, { transform: 'rotate(0deg)' }], { duration: time, easing: 'ease-in-out' })
			];
			const current = ambient;
			Promise.all(current.map(animation => animation.finished)).then(() => {
				if (ambient === current && !disposed) stopWind();
			}).catch(() => {});
		}
		function measure() {
			geometryDirty = false;
			const next = view === 'home' ? document.querySelector<HTMLElement>('[data-scene-scroll]') : null;
			if (host !== next) {
				if (host) resize.unobserve(host);
				host = next;
				if (host) resize.observe(host);
			}
			hero = host?.querySelector<HTMLElement>('.hero-intro') ?? null;
			height = container.clientHeight;
			const rect = host?.getBoundingClientRect();
			top = rect ? rect.top + scrollY : 0;
			distance = rect ? Math.max(1, rect.height - height) : 1;
			chapterTops = ['.preface', '.mv-focus', '.mv-edu', '.mv-creed'].map(selector => {
				const section = host?.querySelector(selector);
				return section ? section.getBoundingClientRect().top + scrollY : Infinity;
			});
		}
		function update() {
			frame = 0;
			if (geometryDirty) measure();
			const y = scrollY;
			const progress = host ? clamp((y - top) / distance) : 0;
			const travel = motion.matches ? 0 : progress;
			const mobile = narrow.matches;
			const isProject = view === 'projects';
			const enters = chapterTops.map((position, i) => i === 3
				? smooth((y - position + height * .05) / (height * .35))
				: smooth((y - position + height * .58) / (height * .6)));
			const darkness = isProject ? 1 : enters[3];
			const reading = isProject ? 0 : enters[0] * (1 - darkness);
			if (y + height * 2 > chapterTops[3]) nightRequested = true;
			write(day, 'transform', `translate3d(${(-travel * (mobile ? 2 : 3.5)).toFixed(3)}%, ${(-travel * 24.5).toFixed(2)}px, 0) scale(1.04)`);
			write(far, 'transform', `translate3d(${(-travel * .8).toFixed(3)}%, ${(-travel * 5.6).toFixed(2)}px, 0) scale(1.04)`);
			write(near, 'transform', `translate3d(${((isProject ? 10 : 0) + travel * (mobile ? 9 : 16)).toFixed(3)}%, ${(-travel * 70).toFixed(2)}px, 0)`);
			write(near, 'opacity', (isProject ? .12 : (1 - reading * .7) * (1 - darkness * .88)).toFixed(3));
			write(night, 'opacity', darkness.toFixed(3));
			write(night, 'visibility', darkness > .001 ? 'visible' : 'hidden');
			write(veil, 'opacity', (reading * (mobile ? .9 : .84)).toFixed(3));
			write(mist, 'visibility', darkness < .9 ? 'visible' : 'hidden');
			if (hero) {
				const hidden = progress > .24;
				write(hero, 'opacity', hidden ? '0' : Math.max(0, 1 - Math.pow(clamp(progress / .17), 1.15)).toFixed(3));
				write(hero, 'transform', hidden || motion.matches ? 'none' : `translate3d(0, ${(-progress * 130).toFixed(1)}px, 0)`);
				write(hero, 'visibility', hidden ? 'hidden' : 'visible');
			}
			const chapter = isProject ? 'projects' : `home-${enters.filter(value => value > .5).length}`;
			active = isProject || y < top + distance + height;
			if (!active || motion.matches) stopWind(); else breeze(chapter);
			container.dataset.chapter = chapter;
			container.dataset.progress = progress.toFixed(3);
			renderedView = view;
		}
		function schedule() {
			if (!frame && !document.hidden) frame = requestAnimationFrame(update);
		}
		refresh = () => {
			geometryDirty = true;
			// Native view-transition capture suspends rAF: compose route changes synchronously.
			if (renderedView !== view) { cancelAnimationFrame(frame); update(); }
			else schedule();
		};
		function visibility() {
			if (document.hidden) { cancelAnimationFrame(frame); frame = 0; stopWind(); }
			else refresh();
		}
		function motionChanged() { stopWind(); refresh(); }
		function prepareNight(event: Event) {
			if ((event.target as Element).closest?.('a[href="/projects"]')) nightRequested = true;
		}
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', refresh, { passive: true });
		document.addEventListener('visibilitychange', visibility);
		document.addEventListener('pointerover', prepareNight, { passive: true });
		document.addEventListener('focusin', prepareNight);
		motion.addEventListener('change', motionChanged);
		narrow.addEventListener('change', refresh);
		refresh();
		return () => {
			disposed = true;
			cancelAnimationFrame(frame); stopWind(); resize.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', refresh);
			document.removeEventListener('visibilitychange', visibility);
			document.removeEventListener('pointerover', prepareNight);
			document.removeEventListener('focusin', prepareNight);
			motion.removeEventListener('change', motionChanged);
			narrow.removeEventListener('change', refresh);
			refresh = () => {};
		};
	});
</script>

<div class="wabi-scene" data-view={view} data-wind="settled" data-day={dayFailed ? 'fallback' : 'ready'} bind:this={container} aria-hidden="true">
	<div class="scene-distance">
		<svg viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
			<path d="M0 820Q230 740 470 815T930 790T1440 765V1000H0Z" fill="currentColor" opacity=".06" />
			<path d="M0 920Q380 860 710 910T1440 860" fill="none" stroke="currentColor" opacity=".1" />
		</svg>
		{#if showDay}<div class="distance-photograph" class:failed={dayFailed}><LandscapePlate name="pine-day" eager onerror={() => { dayFailed = true; }} /></div>{/if}
	</div>
	<div class="scene-day scene-plane" class:failed={dayFailed}>
		{#if showDay}<LandscapePlate name="pine-day" eager onerror={() => { dayFailed = true; }} />{/if}
	</div>
	<div class="reading-veil"></div>
	<div class="scene-night" data-ready={nightReady} data-failed={nightFailed}>
		{#if showNight}
			<div class="night-photograph" class:failed={nightFailed}>
				<LandscapePlate name="pine-night" eager={view === 'projects'} onready={() => { nightReady = true; }} onerror={() => { nightFailed = true; }} />
			</div>
		{/if}
	</div>
	<div class="scene-foreground" class:failed={trunkFailed}>
		<LandscapePlate name="pine-trunk" onerror={() => { trunkFailed = true; }} />
	</div>
	<div class="scene-mist"></div>
	<div class="scene-wind" class:failed={boughFailed}>
		<div class="wind-branch">{#if showDay}<LandscapePlate name="pine-bough" onerror={() => { boughFailed = true; }} />{/if}</div>
	</div>
</div>

<style>
	.wabi-scene { position: relative; width: 100%; height: 100%; overflow: hidden; contain: paint; pointer-events: none; color: var(--color-text); background: var(--color-bg-alt); }
	.scene-distance, .scene-day, .distance-photograph, .reading-veil, .scene-night, .night-photograph { position: absolute; inset: 0; }
	.scene-distance svg { width: 100%; height: 100%; }
	.scene-day, .scene-distance { transform: scale(1.04); transform-origin: 68% 64%; }
	.distance-photograph { mask-image: linear-gradient(90deg, black 24%, transparent 76%); }
	.distance-photograph :global(img), .scene-day :global(img) { transform: scale(1.07); }
	.scene-day { mask-image: linear-gradient(90deg, transparent 28%, black 68%); }
	.scene-day::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, color-mix(in srgb, var(--color-bg) 35%, transparent), transparent 60%); }
	.reading-veil { background: linear-gradient(90deg, var(--color-bg) 18%, color-mix(in srgb, var(--color-bg) 94%, transparent) 65%, color-mix(in srgb, var(--color-bg) 52%, transparent)); opacity: 0; }
	.scene-night { background: var(--color-night); opacity: 0; visibility: hidden; }
	.night-photograph { opacity: .34; }
	.night-photograph :global(img) { transform: scale(-1.07, 1.07); }
	.night-photograph::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 5%, color-mix(in srgb, var(--color-night) 20%, transparent) 35%, var(--color-night) 85%); }
	.wabi-scene[data-view='projects'] .scene-night { opacity: 1; visibility: visible; }
	.scene-foreground { position: absolute; right: -16svh; top: -10svh; width: 82svh; height: 123svh; opacity: .96; mask-image: linear-gradient(90deg, transparent, black 12%); view-transition-name: pine-foreground; }
	.scene-foreground, .scene-wind { filter: grayscale(.72); }
	.scene-foreground :global(img) { object-fit: contain; object-position: right center; }
	.wabi-scene[data-view='projects'] .scene-foreground { opacity: .12; }
	.scene-mist { position: absolute; left: -5%; bottom: 9%; width: 110%; height: 26%; opacity: .18; background: radial-gradient(ellipse at 58% 65%, var(--color-bg) 0, color-mix(in srgb, var(--color-bg) 62%, transparent) 38%, transparent 70%); mask-image: linear-gradient(180deg, transparent, black 30%, black 65%, transparent); }
	.scene-wind { position: absolute; width: 28vw; aspect-ratio: 1.5; right: -2vw; top: -3%; opacity: .8; }
	.wind-branch { width: 100%; height: 100%; transform-origin: 100% 35%; }
	.failed { visibility: hidden; }
	.wabi-scene[data-view='projects'] .scene-wind, .wabi-scene[data-view='projects'] .scene-mist { display: none; }
	@media (max-width: 768px) {
		.scene-day, .scene-distance { transform-origin: 70% 60%; }
		.distance-photograph :global(img), .scene-day :global(img) { object-position: right center; transform: scale(1.12); }
		.scene-day::after { background: linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 30%, transparent), transparent 45%, color-mix(in srgb, var(--color-bg) 48%, transparent) 100%); }
		.scene-foreground { width: 46svh; right: -25svh; top: 36svh; height: 69svh; opacity: .8; }
		.reading-veil { background: var(--color-bg); }
		.scene-wind { width: 36vw; right: -19vw; top: 48%; opacity: .6; }
		.scene-mist { bottom: 18%; height: 18%; }
		.night-photograph::after { background: linear-gradient(180deg, color-mix(in srgb, var(--color-night) 20%, transparent), color-mix(in srgb, var(--color-night) 93%, transparent) 55%); }
	}
</style>
