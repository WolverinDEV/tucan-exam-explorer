<script lang="ts">
	import { IconBrandDiscord, IconBrandGithub, IconMail } from '@tabler/icons-svelte';
</script>

{#snippet social(Icon: any, name: string, href: string)}
	<a {href} class="border-b-2 border-transparent hover:border-foreground/50">
		<Icon class="inline size-4 self-center" />
		{name}
	</a>
{/snippet}

<footer
	class="mx-auto mt-auto flex w-full min-w-[33em] flex-row items-center justify-between gap-2 border-t border-card bg-card px-4 py-1 text-xs text-card-foreground/50"
>
	<span class="border-b-2 border-transparent text-left select-none md:text-center">
		© {new Date().getFullYear()} Markus Hadenfeldt.
		<div class="block md:inline-block"></div>
		All rights reserved.
	</span>

	<div class="flex flex-row gap-4">
		{@render social(IconMail, 'E-Mail', 'mailto:contact@tuna-systems.com')}
		{@render social(IconBrandDiscord, 'Discord', 'https://discord.gg/wnaxS5uktW')}
		{@render social(
			IconBrandGithub,
			'GitHub',
			'https://github.com/WolverinDEV/tucan-exam-explorer'
		)}
	</div>
</footer>
