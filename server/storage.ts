import { type User, type InsertUser, type Podcast, type InsertPodcast } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Podcast methods
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getPodcast(id: string): Promise<Podcast | undefined>;
  getRecentPodcasts(): Promise<Podcast[]>;
  updatePodcast(id: string, updates: Partial<Podcast>): Promise<Podcast | undefined>;
  updatePodcastStatus(id: string, status: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private podcasts: Map<string, Podcast>;

  constructor() {
    this.users = new Map();
    this.podcasts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Podcast methods implementation
  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const id = randomUUID();
    const podcast: Podcast = { 
      ...insertPodcast,
      id,
      createdAt: new Date(),
      status: insertPodcast.status || "processing", // Ensure status is always defined
      audioUrl: insertPodcast.audioUrl || null, // Ensure audioUrl is string | null, not undefined
      duration: insertPodcast.duration || null // Ensure duration is number | null, not undefined
    };
    this.podcasts.set(id, podcast);
    return podcast;
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    return this.podcasts.get(id);
  }

  async getRecentPodcasts(): Promise<Podcast[]> {
    const podcasts = Array.from(this.podcasts.values());
    // Sort by creation date, most recent first, and limit to 10
    return podcasts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  async updatePodcast(id: string, updates: Partial<Podcast>): Promise<Podcast | undefined> {
    const existing = this.podcasts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.podcasts.set(id, updated);
    return updated;
  }

  async updatePodcastStatus(id: string, status: string): Promise<void> {
    const existing = this.podcasts.get(id);
    if (existing) {
      existing.status = status;
      this.podcasts.set(id, existing);
    }
  }
}

export const storage = new MemStorage();
