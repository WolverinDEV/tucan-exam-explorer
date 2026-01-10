<script lang="ts">
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '$lib/components/ui/card';
	import { IconCircleOff, IconUsersGroup, IconUserX } from '@tabler/icons-svelte';
	import type { Exam } from '../../server/db/schema';
	import CardKpi from './card-kpi.svelte';
	import DepartmentIcon from '../department/department-icon.svelte';
	import { extractDepartmentIdFromModuleId } from '../../shared/department';
	import DepartmentName from '../department/department-name.svelte';

	const { exam }: { exam: Exam } = $props();
	const grades = $derived.by(() => {
		const values = Object.entries(exam.gradeOverview).map(([key, count]) => ({
			label: key,
			count: count
		}));

		values.sort((a, b) => a.label.localeCompare(b.label));
		return values;
	});
	const gradesMaxValue = $derived.by(() => grades.reduce((a, b) => Math.max(a, b.count), 0));
	const gradesAverage = $derived.by(() => {
		let totalScore = 0;
		for (const entry of grades) {
			let score = parseFloat(entry.label.replaceAll(',', '.'));
			if (isNaN(score)) {
				score = 1.0;
			}

			totalScore += score * entry.count;
		}

		return totalScore / grades.reduce((a, b) => a + b.count, 0);
	});

	const departmentId = $derived(extractDepartmentIdFromModuleId(exam.moduleId));
</script>

<div class="flex flex-col p-3 pt-0 md:items-start md:justify-between">
	<CardTitle
		class="hidden w-[10em] min-w-full overflow-hidden text-lg text-nowrap text-ellipsis md:block md:text-xl"
		title={`${exam.moduleId} ${exam.moduleName}`}
	>
		{exam.moduleId}
		{exam.moduleName}
	</CardTitle>
	<CardDescription class="text-300 mt-1 flex items-center gap-3 text-xs md:text-sm">
		<div class="bg-800 flex h-9 w-9 items-center justify-center rounded-lg">
			<DepartmentIcon {departmentId} />
		</div>

		<div class="space-y-0.5">
			<div
				class="overflow-hidden text-[0.75rem] font-medium text-nowrap text-ellipsis text-slate-100 md:text-xs"
			>
				FB{departmentId}
				<DepartmentName {departmentId} />
			</div>
			<div class="text-[0.7rem] text-slate-400 md:text-xs">
				<!-- 14.02.2023 · -->
				{exam.examName}
			</div>
		</div>
	</CardDescription>
</div>

<div class="h-px w-full bg-muted"></div>

<div class="space-y-6 p-4">
	<div class="grid grid-cols-3 gap-3 md:gap-6">
		<CardKpi name="Teilnehmer" value={`${exam.participationTotal}`}>
			{#snippet icon()}
				<IconUsersGroup size={'2.5em'} />
			{/snippet}
		</CardKpi>
		<CardKpi name="Fehlend" value={`${exam.participationMissing}`}>
			{#snippet icon()}
				<IconUserX size={'2.5em'} />
			{/snippet}
		</CardKpi>
		<CardKpi name="Durchschnitt" value={`${gradesAverage.toFixed(2)}`}>
			{#snippet icon()}
				<IconCircleOff size={'2.5em'} />
			{/snippet}
		</CardKpi>
	</div>

	<Card class="border bg-transparent">
		<CardHeader class="pb-2">
			<CardTitle class="text-sm font-semibold md:text-base">Notenübersicht</CardTitle>
		</CardHeader>

		<CardContent class="pt-1">
			<div class="flex h-52 items-end gap-2 md:h-64 md:gap-3">
				{#each grades as grade}
					<div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
						<span class="xs:hidden text-[0.65rem] text-slate-300">
							{grade.count}
						</span>
						<div
							class={`min-h-2 w-full rounded-t-md bg-sky-500`}
							style={`height: ${(grade.count / gradesMaxValue) * 100}%`}
						></div>
						<span class="mt-1 text-[0.65rem] text-slate-400 md:text-xs">
							{grade.label}
						</span>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>
</div>
