import { users, type User, type InsertUser, ads, type Ad, type InsertAd } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByNpub(npub: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.npub, npub));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Ad methods
  async getAd(id: number): Promise<Ad | undefined> {
    const result = await db.select().from(ads).where(eq(ads.id, id));
    return result[0];
  }

  async getAdsByUserId(userId: number): Promise<Ad[]> {
    return await db.select().from(ads).where(eq(ads.userId, userId));
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const result = await db.insert(ads).values(insertAd).returning();
    return result[0];
  }

  async updateAd(id: number, updatedFields: Partial<InsertAd>): Promise<Ad | undefined> {
    const result = await db
      .update(ads)
      .set(updatedFields)
      .where(eq(ads.id, id))
      .returning();
    return result[0];
  }

  async deleteAd(id: number): Promise<boolean> {
    const result = await db.delete(ads).where(eq(ads.id, id)).returning();
    return result.length > 0;
  }

  async incrementAdClicks(id: number): Promise<Ad | undefined> {
    // First get the current ad to get the current click count
    const currentAd = await this.getAd(id);
    if (!currentAd) return undefined;
    
    // Increment the clicks
    const result = await db
      .update(ads)
      .set({ clicks: currentAd.clicks + 1 })
      .where(eq(ads.id, id))
      .returning();
    return result[0];
  }

  async incrementAdImpressions(id: number): Promise<Ad | undefined> {
    // First get the current ad to get the current impressions count
    const currentAd = await this.getAd(id);
    if (!currentAd) return undefined;
    
    // Increment the impressions
    const result = await db
      .update(ads)
      .set({ impressions: currentAd.impressions + 1 })
      .where(eq(ads.id, id))
      .returning();
    return result[0];
  }

  async getAllAds(): Promise<Ad[]> {
    return await db.select().from(ads);
  }
}

export const storage = new DatabaseStorage();
