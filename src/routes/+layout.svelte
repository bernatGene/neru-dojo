<script lang="ts">
	import { base } from '$app/paths';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={`${base}/neru-appicon.png`} /></svelte:head>
{@render children()}
