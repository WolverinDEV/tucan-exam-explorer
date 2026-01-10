<script lang="ts">
	import type { DepartmentGroup } from './utils';

	const { group }: { group: DepartmentGroup } = $props();
</script>

<div class="h-[1.5em] overflow-hidden pl-[.75em] text-ellipsis text-foreground/50 select-none">
	{group.name}
</div>
