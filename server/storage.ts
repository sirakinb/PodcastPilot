import { type User, type InsertUser, type Podcast, type InsertPodcast } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

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

export class FileStorage implements IStorage {
  private users: Map<string, User>;
  private podcasts: Map<string, Podcast>;
  private readonly dataDir: string;
  private readonly usersFile: string;
  private readonly podcastsFile: string;

  constructor(dataDir: string = "data") {
    this.dataDir = dataDir;
    this.usersFile = path.join(dataDir, "users.json");
    this.podcastsFile = path.join(dataDir, "podcasts.json");
    this.users = new Map();
    this.podcasts = new Map();
    
    // Ensure data directory exists
    this.ensureDataDirectory();
    
    // Load existing data
    this.loadData();
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadData(): void {
    this.loadUsers();
    this.loadPodcasts();
  }

  private loadUsers(): void {
    try {
      if (fs.existsSync(this.usersFile)) {
        const data = fs.readFileSync(this.usersFile, "utf-8");
        const usersArray: User[] = JSON.parse(data);
        this.users = new Map(usersArray.map(user => [user.id, user]));
        console.log(`📁 Loaded ${this.users.size} users from file storage`);
      }
    } catch (error) {
      console.error("Error loading users from file:", error);
      this.users = new Map();
    }
  }

  private loadPodcasts(): void {
    try {
      if (fs.existsSync(this.podcastsFile)) {
        const data = fs.readFileSync(this.podcastsFile, "utf-8");
        const podcastsArray: Podcast[] = JSON.parse(data);
        // Convert string dates back to Date objects
        podcastsArray.forEach(podcast => {
          if (typeof podcast.createdAt === 'string') {
            podcast.createdAt = new Date(podcast.createdAt);
          }
        });
        this.podcasts = new Map(podcastsArray.map(podcast => [podcast.id, podcast]));
        console.log(`🎙️ Loaded ${this.podcasts.size} podcasts from file storage`);
      }
    } catch (error) {
      console.error("Error loading podcasts from file:", error);
      this.podcasts = new Map();
    }
  }

  private saveUsers(): void {
    try {
      const usersArray = Array.from(this.users.values());
      fs.writeFileSync(this.usersFile, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      console.error("Error saving users to file:", error);
    }
  }

  private savePodcasts(): void {
    try {
      const podcastsArray = Array.from(this.podcasts.values());
      fs.writeFileSync(this.podcastsFile, JSON.stringify(podcastsArray, null, 2));
    } catch (error) {
      console.error("Error saving podcasts to file:", error);
    }
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
    this.saveUsers();
    return user;
  }

  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const id = randomUUID();
    const podcast: Podcast = { 
      ...insertPodcast,
      id,
      createdAt: new Date(),
      status: insertPodcast.status || "processing",
      audioUrl: insertPodcast.audioUrl || null,
      duration: insertPodcast.duration || null
    };
    this.podcasts.set(id, podcast);
    this.savePodcasts();
    return podcast;
  }

  async getPodcast(id: string): Promise<Podcast | undefined> {
    return this.podcasts.get(id);
  }

  async getRecentPodcasts(): Promise<Podcast[]> {
    const podcasts = Array.from(this.podcasts.values());
    return podcasts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  async updatePodcast(id: string, updates: Partial<Podcast>): Promise<Podcast | undefined> {
    const existing = this.podcasts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.podcasts.set(id, updated);
    this.savePodcasts();
    return updated;
  }

  async updatePodcastStatus(id: string, status: string): Promise<void> {
    const existing = this.podcasts.get(id);
    if (existing) {
      existing.status = status;
      this.podcasts.set(id, existing);
      this.savePodcasts();
    }
  }
}

export const storage = new FileStorage();
