import { z } from "zod";

function withDefault<T extends z.ZodTypeAny>(
  schema: T,
  defaultValue: z.input<T>
): z.ZodType<T["_output"], T["_def"], T["_input"] | null | undefined> {
  return z.preprocess((val) => val ?? defaultValue, schema);
}

export const profileSchema = withDefault(
  z.object({
    name: withDefault(z.string(), "-"),
    displayName: z.string().nullish(),
  }),
  {}
);

export const profilesSchema = withDefault(z.record(profileSchema), {});

export const submissionSchema = withDefault(
  z.object({ data: z.string().default("{}") }),
  {}
);

export const submissionDataSchema = withDefault(
  z.object({ html: z.string().default("") }),
  {}
);

export const presenceSchema = z.number().nullish();

export const presencesSchema = withDefault(z.record(presenceSchema), {});

export const roomSchema = withDefault(
  z.object({
    admins: withDefault(
      z.record(z.object({ enabled: withDefault(z.boolean(), false) })),
      {}
    ),
    settings: withDefault(
      z.object({
        acceptingSubmissions: withDefault(z.boolean(), false),
        stage: withDefault(z.string(), "-,-,-,-,-,-,-,-"),
        challengeUrl: z.string().nullish(),
        timerEndTime: z.number().nullish(),
      }),
      {}
    ),
    profiles: profilesSchema,
    presence: presencesSchema,
    publicSubmissions: withDefault(z.record(submissionSchema), {}),
    privateSubmissions: withDefault(z.record(submissionSchema), {}),
  }),
  {}
);
