<script lang="ts">
	import type { Snippet } from 'svelte';

	const { name, value, icon }: { name: string; value: string; icon: Snippet } = $props();
</script>

<div class="flex flex-col items-center justify-center rounded-xl border py-3 md:py-4">
	<div class="mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs">
		{@render icon()}
	</div>
	<div class="text-xl font-semibold md:text-2xl">
		{value}
	</div>
	<div class="mt-0.5 text-[0.7rem] tracking-wide text-slate-400 uppercase md:text-xs">
		{name}
	</div>
</div>
