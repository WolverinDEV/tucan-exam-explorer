<script lang="ts">
	import type { ExamMetadata } from '../../server/db/schema';
	import { cn } from '../../utils';

	const { exam, selected }: { exam: ExamMetadata; selected: boolean } = $props();
</script>

<a
	class={cn(
		'cursor-pointer flex-col rounded-sm px-1 py-0.5 pl-[1.5em] hover:bg-accent/50',
		selected && 'bg-accent'
	)}
	href={`/details/${exam.id}`}
	title={`${exam.moduleId} ${exam.moduleName}\n${exam.examName}`}
>
	<div class="block text-sm text-nowrap">
		{exam.moduleId}
		{exam.moduleName}
	</div>
	<div class="block text-xs text-nowrap">
		{exam.examName}
	</div>
</a>
