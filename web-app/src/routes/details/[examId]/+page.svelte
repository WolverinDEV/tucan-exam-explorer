<script lang="ts">
	import type { PageProps } from './$types';
	import ExamInfo from '../../../lib/components/exam-info/exam-info.svelte';
	import { Spinner } from '../../../lib/components/ui/spinner';
	import { IconCross, IconError404 } from '@tabler/icons-svelte';

	const { data }: PageProps = $props();
</script>

{#await data.exam}
	<Spinner class="m-auto size-8" />
{:then exam}
	{#if exam}
		<ExamInfo {exam} />
	{:else}
		<div class="flex h-full flex-col justify-center">
			<IconError404 class="size-8 self-center text-red-800" />
			<span class="self-center font-mono text-xl text-red-800 select-none">exam not found</span>
		</div>
	{/if}
{/await}
