import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const podcasts = pgTable("podcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  originalContent: text("original_content").notNull(),
  generatedScript: jsonb("generated_script").notNull(),
  audioUrl: text("audio_url"),
  duration: integer("duration"), // in seconds
  settings: jsonb("settings").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  createdAt: true,
});

export const podcastGenerationRequestSchema = z.object({
  content: z.string().min(100, "Content must be at least 100 characters"),
  maleVoice: z.string().default("David"),
  femaleVoice: z.string().default("Sarah"),
  maleSpeed: z.number().min(0.7).max(1.3).default(1.0),
  femaleSpeed: z.number().min(0.7).max(1.3).default(1.0),
  targetLength: z.enum(["brief", "standard", "detailed", "indepth"]).default("standard"),
  tone: z.enum(["professional", "conversational", "casual", "academic"]).default("conversational"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Podcast = typeof podcasts.$inferSelect;
export type PodcastGenerationRequest = z.infer<typeof podcastGenerationRequestSchema>;

export interface ScriptSegment {
  speaker: "male" | "female";
  name: string;
  content: string;
}

export interface GeneratedScript {
  segments: ScriptSegment[];
  estimatedDuration: number;
}
