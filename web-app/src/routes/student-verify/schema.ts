import { z } from "zod";

export const kFormSchema = z.object({
    email: z.string().min(1).max(64),
});

export type FormSchema = typeof kFormSchema;