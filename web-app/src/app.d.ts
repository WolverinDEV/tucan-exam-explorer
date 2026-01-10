import '@poppanator/sveltekit-svg/dist/svg.d.ts'
import type z from 'zod';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			success: false,
			message: string,
			issues?: z.core.$ZodIssue[]
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
