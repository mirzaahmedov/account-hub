import z from "zod";

export const BatchActionBodySchema = z.object({
  ids: z.array(z.number()).nonempty(),
});
