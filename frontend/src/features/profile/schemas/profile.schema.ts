import { z } from "zod";
import { Filter } from "bad-words";

const filter = new Filter();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const locationRegex = /^[A-Za-z\s.-]+,\s*[A-Za-z\s.-]+$/;
const noHtmlRegex = /^[^<>]*$/;

export const profileSchema = z.object({
  name: z
    .string()
    .min(4, "Name must be at least 4 characters")
    .regex(noHtmlRegex, "HTML tags and angle brackets are not allowed")
    .refine(
      (val) => !val || !filter.isProfane(val),
      "Name contains inappropriate language.",
    ),
  bio: z
    .string()
    .regex(noHtmlRegex, "HTML tags and angle brackets are not allowed")
    .optional()
    .refine(
      (val) => !val || !filter.isProfane(val),
      "Bio contains inappropriate language.",
    ),
  location: z
    .string()
    .regex(noHtmlRegex, "HTML tags and angle brackets are not allowed")
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || locationRegex.test(val),
      "Format must be State, Country (e.g. California, USA)",
    ),
  camera: z
    .string()
    .regex(noHtmlRegex, "HTML tags and angle brackets are not allowed")
    .optional()
    .refine(
      (val) => !val || !filter.isProfane(val),
      "Cannot contain inappropriate language.",
    ),
  image: z
    .custom<FileList>()
    .transform((files) => (files && files.length > 0 ? files[0] : undefined))
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Max file size is 10MB.",
    )
    .refine(
      (file) => !file || ACCEPTED_TYPES.includes(file.type),
      "Only JPG, PNG, and WEBP are supported.",
    ),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
