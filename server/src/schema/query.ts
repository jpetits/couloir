import z from "zod";

export const getActivitiesSchema = z.object({
  limit: z.coerce
    .number()
    .gt(0, { message: "errors.amountRequired" })
    .default(10),
});
