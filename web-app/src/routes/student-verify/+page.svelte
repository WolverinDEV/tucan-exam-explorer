<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import PageFooter from '../../lib/components/page/page-footer.svelte';
	import Input from '../../lib/components/ui/input/input.svelte';

	import { kFormSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	const { data } = $props();
	const form = $derived(
		superForm(data.form, {
			validators: zod4Client(kFormSchema)
		})
	);

	const { form: formData, enhance, message, submitting } = $derived(form);
</script>

<Card.Root class="m-auto flex w-[25em] min-w-[10em]">
	<Card.Header>
		<Card.Title>Zugangsverifizierung</Card.Title>
		<Card.Description>Verifiziere, dass du ein Student der TU-Darmstadt bist.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance class="flex flex-col gap-3">
			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>E-Mail</Form.Label>
						<div class="flex flex-row">
							<Input {...props} bind:value={$formData.email} disabled={$submitting} />
							<span class="ml-[.5em] shrink-0 self-center text-sm text-foreground/70">
								{data.emailSuffix}
							</span>
						</div>
					{/snippet}
				</Form.Control>
				<Form.Description class="text-xs">Deine E-Mail wird nicht gespeichert!</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button class="self-end" disabled={$submitting}>
				{#if $submitting}
					Sende link...
				{:else}
					Link senden
				{/if}
			</Form.Button>
		</form>
		{#if $message}
			<div class="rounded-md border border-green-800 bg-green-600/20 p-3">
				{$message}
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<PageFooter />
