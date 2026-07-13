<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';

	let { children } = $props();
</script>

{#key page.url.pathname}
	{@render children()}
{/key}
