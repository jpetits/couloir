import z from "zod";

export const getActivitiesSchema = z.object({
  limit: z.coerce
    .number()
    .gt(0, { message: "errors.amountRequired" })
    .default(10),
  page: z.coerce.number().gt(0).default(1),
});

export const patchActivitiesSchema = z.object({
  name: z.string().optional(),
});
