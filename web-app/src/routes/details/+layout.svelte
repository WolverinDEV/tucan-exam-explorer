<script lang="ts">
	import ExamSelectList from '$lib/components/exam-select/exam-select-list.svelte';
	import ExamSelect from '../../lib/components/exam-select/exam-select.svelte';
	import PageFooter from '../../lib/components/page/page-footer.svelte';
	import type { LayoutProps } from './$types';

	const { children, data, params }: LayoutProps = $props();
	const selectedExamId = $derived.by(() => {
		if (!params.examId) {
			return null;
		}

		const examId = parseInt(params.examId);
		return isNaN(examId) ? null : examId;
	});
</script>

<div class="flex h-svh w-svw flex-col">
	<div class="flex h-full min-h-min flex-row gap-2 overflow-auto p-3">
		<ExamSelectList selected={selectedExamId} exams={data.availableExams} class="hidden md:flex" />
		<div class="flex flex-1 flex-col gap-1">
			<ExamSelect selected={selectedExamId} exams={data.availableExams} class="flex md:hidden" />
			{@render children()}
		</div>
	</div>
	<PageFooter />
</div>
