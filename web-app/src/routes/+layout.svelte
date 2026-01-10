<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg?url';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>TUCaN Exam Explorer</title>
</svelte:head>

{@render children()}
