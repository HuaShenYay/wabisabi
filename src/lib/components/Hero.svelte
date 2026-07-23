<script>
	// Always render text as overlay on the 3D scene
</script>

<!-- SVG emboss filter for wabi-sabi relief text -->
<svg class="svg-defs" aria-hidden="true" width="0" height="0">
	<defs>
		<filter id="wabi-emboss" x="-10%" y="-10%" width="120%" height="120%">
			<feGaussianBlur in="SourceAlpha" stdDeviation="0.4" />
			<feSpecularLighting
				surfaceScale="3.5"
				specularConstant="0.65"
				specularExponent="12"
				lighting-color="#f0e0c8"
				result="specular"
			>
				<feDistantLight azimuth="225" elevation="50" />
			</feSpecularLighting>
			<feComposite in="specular" in2="SourceAlpha" operator="in" result="lit" />
			<feComposite in="SourceGraphic" in2="lit" operator="arithmetic"
				k1="0" k2="1" k3="1" k4="0" />
		</filter>
		<!-- Paper grain texture -->
		<filter id="paper-grain">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" />
			<feColorMatrix values="0 0 0 0 0.88  0 0 0 0 0.82  0 0 0 0 0.72  0 0 0 0.04 0" />
			<feComposite in2="SourceGraphic" operator="in" />
		</filter>
	</defs>
</svg>

<h1 class="grid hero-grid mobileOnly">
	<span class="hero-line" style="grid-column-start: 3"><span>宋子杰</span></span>
	<span class="hero-line" style="grid-column-start: 1"><span>是一位AI艺术家</span></span>
	<span class="hero-line" style="grid-column-start: 1"><span>与创意</span></span>
	<span class="hero-line" style="grid-column-start: 4"><span>探索者</span></span>
	<span class="hero-line" style="grid-column-start: 1"><span>来自上海</span></span>
	<span class="hero-line" style="grid-column-start: 2"><span>热爱游戏</span></span>
	<span class="hero-line" style="grid-column-start: 1"><span>与故事</span></span>
</h1>

<h1 class="grid hero-grid desktopOnly">
	<span class="hero-line" style="grid-column-start: 4"><span>宋子杰是一位</span></span>
	<span class="hero-line" style="grid-column-start: 2"><span>AI艺术家与</span></span>
	<span class="hero-line" style="grid-column-start: 1"><span>创意探索者</span></span>
	<span class="hero-line" style="grid-column-start: 4"><span>来自上海</span></span>
	<span class="hero-line" style="grid-column-start: 5"><span>热爱游戏</span></span>
	<span class="hero-line" style="grid-column-start: 3"><span>与故事</span></span>
</h1>

<style>
	.svg-defs {
		position: absolute;
		width: 0;
		height: 0;
		pointer-events: none;
		z-index: 1;
	}
</style>
