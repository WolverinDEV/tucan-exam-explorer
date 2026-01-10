<script lang="ts">
	import type { Component } from 'svelte';
	import { kInstituteMapping } from './metadata';

	const { departmentId }: { departmentId: string } = $props();
	const department = $derived(kInstituteMapping[departmentId] ?? kInstituteMapping['']!);
	const iconPromise = $derived(department.icon().then((icon) => icon.default as any as Component));
</script>

{#await iconPromise}
	<div class="h-full w-full"></div>
{:then Icon}
	<Icon class="h-full w-full fill-foreground stroke-foreground" />
{/await}
