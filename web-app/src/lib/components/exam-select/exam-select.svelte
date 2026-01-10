<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import type { ClassValue } from 'clsx';
	import type { ExamMetadata } from '../../server/db/schema';
	import { cn } from '../../utils';
	import { buildSelectGroup } from './utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const props: { exams: ExamMetadata[]; selected: number | null; class?: ClassValue } = $props();
	const semesters = $derived.by(() => buildSelectGroup(props.exams));

	const selectedExam = $derived.by(() =>
		props.selected ? (props.exams.find((exam) => exam.id === props.selected) ?? null) : null
	);
	const selectedExamSemesters = $derived.by(() => {
		const semesters: Record<string, number> = {};

		if (!selectedExam) {
			return semesters;
		}

		for (const exam of props.exams) {
			if (exam.moduleId !== selectedExam.moduleId) {
				continue;
			}

			semesters[exam.semesterName] = exam.id;
		}

		return semesters;
	});

	const urlSemesterOverride = $derived(page.url.searchParams.get('semester'));

	let semesterOverride = $state<string | null>(null);
	const selectedSemester = $derived(
		semesters.find(
			(semester) => semester.name === (semesterOverride ?? selectedExam?.semesterName)
		) ?? semesters[0]
	);

	$effect(() => {
		if (selectedExam) {
			return;
		}

		if (semesterOverride) {
			return;
		}

		semesterOverride = urlSemesterOverride;
	});
</script>

<div class={cn('flex flex-col justify-stretch gap-1', props.class)}>
	<!-- Semester selector -->
	<Select.Root
		type="single"
		bind:value={
			() => selectedSemester.name,
			(value) => {
				if (selectedExam) {
					/* Clear the override and try to find that exam in that other semester or show an error */
					semesterOverride = null;

					const targetExamId = selectedExamSemesters[value];
					if (targetExamId) {
						goto(`/details/${targetExamId}`);
						return;
					}

					goto(`/details/?semester=${encodeURIComponent(value)}`);
					return;
				} else {
					semesterOverride = value;
				}
			}
		}
	>
		<Select.Trigger class="w-full">
			{selectedSemester.name}
		</Select.Trigger>
		<Select.Content>
			{#each semesters as semester}
				<Select.Item
					value={semester.name}
					class={cn(
						selectedExam && !selectedExamSemesters[semester.name] && 'text-muted-foreground'
					)}
				>
					{semester.name}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<!-- Exam selector -->
	<Select.Root
		type="single"
		bind:value={
			() => (props.selected ? `${props.selected}` : undefined),
			(value) => {
				if (!value) {
					return;
				}

				goto(`/details/${value}`);
			}
		}
	>
		<Select.Trigger class="w-[10em] min-w-full overflow-hidden text-nowrap text-ellipsis">
			{#if selectedExam}
				{selectedExam.moduleId} {selectedExam.moduleName}
			{:else}
				<span class="text-foreground/60">select an exam</span>
			{/if}
		</Select.Trigger>
		<Select.Content>
			{#each selectedSemester?.departments ?? [] as department}
				<Select.Group>
					<Select.Label>{department.name}</Select.Label>
					{#each department.exams as exam}
						<Select.Item value={`${exam.id}`}>
							<div class="pl-2">
								<span class="block">{exam.moduleId} {exam.moduleName}</span>
								<span class="block text-xs text-foreground/50">{exam.examName}</span>
							</div>
						</Select.Item>
					{/each}
				</Select.Group>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
