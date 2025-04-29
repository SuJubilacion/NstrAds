import { users, type User, type InsertUser, ads, type Ad, type InsertAd } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByNpub(npub: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ad methods
  getAd(id: number): Promise<Ad | undefined>;
  getAdsByUserId(userId: number): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: number): Promise<boolean>;
  incrementAdClicks(id: number): Promise<Ad | undefined>;
  incrementAdImpressions(id: number): Promise<Ad | undefined>;
  getAllAds(): Promise<Ad[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ads: Map<number, Ad>;
  private userIdCounter: number;
  private adIdCounter: number;

  constructor() {
    this.users = new Map();
    this.ads = new Map();
    this.userIdCounter = 1;
    this.adIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByNpub(npub: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.npub === npub,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Ad methods
  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async getAdsByUserId(userId: number): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(
      (ad) => ad.userId === userId,
    );
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = this.adIdCounter++;
    const now = new Date();
    const ad: Ad = { 
      ...insertAd, 
      id, 
      impressions: 0, 
      clicks: 0, 
      createdAt: now 
    };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: number, updatedFields: Partial<InsertAd>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd: Ad = { ...ad, ...updatedFields };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async deleteAd(id: number): Promise<boolean> {
    return this.ads.delete(id);
  }

  async incrementAdClicks(id: number): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd: Ad = { ...ad, clicks: ad.clicks + 1 };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async incrementAdImpressions(id: number): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd: Ad = { ...ad, impressions: ad.impressions + 1 };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async getAllAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }
}

export const storage = new MemStorage();
