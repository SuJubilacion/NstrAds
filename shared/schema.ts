import { z } from "zod";

// Define schemas that match our Prisma models
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  npub: z.string()
});

export const insertAdSchema = z.object({
  title: z.string(),
  targetUrl: z.string(),
  imagePath: z.string(),
  userId: z.number().optional(),
  description: z.string().optional(),
  budget: z.number().optional(),
  duration: z.number().optional(),
  tags: z.string().optional(),
  status: z.string().optional(),
});

// Define types based on our schema
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAd = z.infer<typeof insertAdSchema>;
