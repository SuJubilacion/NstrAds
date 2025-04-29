import { Ad as PrismaAd } from '@prisma/client';
import prisma from './prisma';

// Define interface types that match the existing app's expectations
export interface User {
  id: number;
  username: string;
  password: string;
  npub: string;
  createdAt: Date;
}

export interface InsertUser {
  username: string;
  password: string;
  npub: string;
}

export interface Ad {
  id: number;
  title: string;
  targetUrl: string;
  imagePath: string;
  userId?: number;
  description?: string;
  budget?: number;
  duration?: number;
  tags?: string;
  status?: string;
  impressions?: number;
  clicks?: number;
  createdAt: Date;
}

export interface InsertAd {
  title: string;
  targetUrl: string;
  imagePath: string;
  userId?: number;
  description?: string;
  budget?: number;
  duration?: number;
  tags?: string;
  status?: string;
}

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

// Convert between Prisma types and our interface types
function prismaAdToAd(prismaAd: PrismaAd): Ad {
  return {
    id: parseInt(prismaAd.id),
    title: prismaAd.title,
    targetUrl: prismaAd.targetUrl,
    imagePath: prismaAd.imagePath,
    createdAt: prismaAd.createdAt,
  };
}

// In-memory storage for users until we add them to Prisma schema
class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userIdCounter: number;

  constructor() {
    this.users = new Map();
    this.userIdCounter = 1;
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

  // Ad methods using Prisma
  async getAd(id: number): Promise<Ad | undefined> {
    const ad = await prisma.ad.findUnique({
      where: { id: String(id) }
    });
    
    return ad ? prismaAdToAd(ad) : undefined;
  }

  async getAdsByUserId(userId: number): Promise<Ad[]> {
    // Since we don't have a userId field in our Ad model yet, we're returning all ads
    // In a real implementation, we would filter by userId
    const ads = await prisma.ad.findMany();
    return ads.map(prismaAdToAd);
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const { title, targetUrl, imagePath } = insertAd;
    
    const ad = await prisma.ad.create({
      data: {
        title,
        targetUrl,
        imagePath,
      }
    });
    
    return prismaAdToAd(ad);
  }

  async updateAd(id: number, updatedFields: Partial<InsertAd>): Promise<Ad | undefined> {
    const { title, targetUrl, imagePath } = updatedFields;
    
    const ad = await prisma.ad.update({
      where: { id: String(id) },
      data: {
        ...(title && { title }),
        ...(targetUrl && { targetUrl }),
        ...(imagePath && { imagePath }),
      }
    });
    
    return prismaAdToAd(ad);
  }

  async deleteAd(id: number): Promise<boolean> {
    try {
      await prisma.ad.delete({
        where: { id: String(id) }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async incrementAdClicks(id: number): Promise<Ad | undefined> {
    // This would be implemented if we had a clicks field in our model
    return this.getAd(id);
  }

  async incrementAdImpressions(id: number): Promise<Ad | undefined> {
    // This would be implemented if we had an impressions field in our model
    return this.getAd(id);
  }

  async getAllAds(): Promise<Ad[]> {
    const ads = await prisma.ad.findMany();
    return ads.map(prismaAdToAd);
  }
}

export const storage = new MemStorage();
