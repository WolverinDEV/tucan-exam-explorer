import z from "zod";
import { env as kEnvironmentRaw } from "$env/dynamic/private";
import { building } from "$app/environment";

const kSchemaEnvironment = z.object({
    DATABASE_URL: z.string().min(1),
    AUTH_UPDATE_KEY: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    EMAIL_STUDENT_SUFFIX: z.string().default("@stud.tu-darmstadt.de"),
});

export const kEnvironmentPrivate = building ? {} as any : kSchemaEnvironment.parse(kEnvironmentRaw);