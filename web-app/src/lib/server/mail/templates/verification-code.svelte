<script>
	import {
		Html,
		Head,
		Body,
		Preview,
		Container,
		Section,
		Text,
		Button,
		Row
	} from 'better-svelte-email';

	let { link } = $props();
</script>

<Html>
	<Head />
	<Body class="bg-zinc-100">
		<Preview preview="Studentenverifizierung" />
		<Container class="m-8 mx-auto max-w-lg rounded-2xl bg-white p-8">
			<Section class="mx-auto text-left">
				<Text class="text-2xl font-bold text-zinc-900">Hallo lieber Kommilitone!</Text>
				<Text class="mt-3 text-zinc-600">
					Damit wir bestätigen können, dass du wirklich an der TU Darmstadt studierst, bekommst du
					den folgenden Link zugeschickt:
				</Text>
				<Row class="mt-6 text-center">
					<Button
						href={link}
						pX={24}
						pY={14}
						class="mx-auto rounded-lg bg-green-700 text-primary-foreground"
					>
						Verifizieren
					</Button>
				</Row>
				<Text class="mt-3 max-w-[30em] border-collapse wrap-break-word text-zinc-600">
					{link}
				</Text>
			</Section>
		</Container>
	</Body>
</Html>
