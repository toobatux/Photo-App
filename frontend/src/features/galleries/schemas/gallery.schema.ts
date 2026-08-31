import { z } from "zod";

export const gallerySchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
});

export type GalleryFormData = z.infer<typeof gallerySchema>