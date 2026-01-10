import { z } from "zod";

export const kFormSchema = z.object({
    email: z.string()
        .min(4, { error: "Deine E-Mail sollte min. 4 Zeichen lang sein" })
        .max(64, { error: "Deine E-Mail sollte max. 64 Zeichen lang sein" })
        .refine(data => /^[a-z0-9\.\-+]+$/ig.test(data), { error: "Deine E-Mail enthält ungültige Zeichen" }),
});

export type FormSchema = typeof kFormSchema;