<script lang="ts">
	import type { ClassValue } from 'clsx';
	import type { ExamMetadata } from '../../server/db/schema';
	import { cn } from '../../utils';
	import LiExam from './li-exam.svelte';
	import LiGroupDepartment from './li-group-department.svelte';
	import LiGroupSemester from './li-group-semester.svelte';
	import { buildSelectGroup } from './utils';

	const props: { exams: ExamMetadata[]; selected: number | null; class?: ClassValue } = $props();
	const semesters = $derived.by(() => buildSelectGroup(props.exams));
</script>

<div class={cn('relative block min-h-[10em] w-[25vw] max-w-[20em] min-w-[10em]', props.class)}>
	<div class="absolute inset-0 grid flex-1 gap-1 overflow-auto rounded-sm border p-2">
		{#each semesters as semester}
			<LiGroupSemester group={semester} />
			{#each semester.departments as department}
				<LiGroupDepartment group={department} />
				{#each department.exams as exam (exam.id)}
					<LiExam {exam} selected={exam.id === props.selected} />
				{/each}
			{/each}
		{/each}
	</div>
</div>
