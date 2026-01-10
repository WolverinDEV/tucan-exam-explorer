<script lang="ts">
	import type { SemesterGroup } from './utils';

	const { group }: { group: SemesterGroup } = $props();
</script>

<div class="h-[1.5em] overflow-hidden text-ellipsis text-foreground/50 select-none">
	{group.name}
</div>
