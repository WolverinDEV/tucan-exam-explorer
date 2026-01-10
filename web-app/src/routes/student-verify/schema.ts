import { z } from "zod";

export const kFormSchema = z.object({
    email: z.string().min(1).max(64).refine(data => /[a-z0-9\.\-+]/i.test(data)),
});

export type FormSchema = typeof kFormSchema;