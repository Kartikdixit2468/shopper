import { z } from "zod";

export const activeStoreTypeSchema = z.enum(["PRESENCE", "LOCAL_STORE"]);

export type ActiveStoreType = z.infer<typeof activeStoreTypeSchema>;

export function parseActiveStoreType(value: unknown) {
  return activeStoreTypeSchema.safeParse(value);
}

export const storeModeContent: Record<
  ActiveStoreType,
  { title: string; description: string; label: string }
> = {
  PRESENCE: {
    title: "Online Presence",
    description: "Put your business online and help customers find you.",
    label: "Presence",
  },
  LOCAL_STORE: {
    title: "Local Store",
    description: "Show products, accept local orders, and manage pickup or delivery.",
    label: "Local Store",
  },
};
