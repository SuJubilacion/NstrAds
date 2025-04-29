import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAdSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if npub already exists
      const existingUser = await storage.getUserByNpub(userData.npub);
      if (existingUser) {
        return res.status(400).json({ message: "User with this npub already exists" });
      }

      // Create user
      const user = await storage.createUser(userData);
      return res.status(201).json({
        id: user.id,
        username: user.username,
        npub: user.npub
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { npub } = req.body;
      if (!npub) {
        return res.status(400).json({ message: "npub is required" });
      }

      const user = await storage.getUserByNpub(npub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        id: user.id,
        username: user.username,
        npub: user.npub
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to login" });
    }
  });

  // Ad routes
  app.get("/api/ads", async (_req: Request, res: Response) => {
    try {
      const ads = await storage.getAllAds();
      return res.status(200).json(ads);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.get("/api/ads/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const ads = await storage.getAdsByUserId(userId);
      return res.status(200).json(ads);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch user ads" });
    }
  });

  app.post("/api/ads", async (req: Request, res: Response) => {
    try {
      const adData = insertAdSchema.parse(req.body);
      
      // Check if referenced user exists
      if (adData.userId) {
        const user = await storage.getUser(adData.userId);
        if (!user) {
          return res.status(400).json({ message: "Referenced user does not exist" });
        }
      }

      const ad = await storage.createAd(adData);
      return res.status(201).json(ad);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Failed to create ad" });
    }
  });

  app.get("/api/ads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      const ad = await storage.getAd(id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      return res.status(200).json(ad);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch ad" });
    }
  });

  app.patch("/api/ads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      // Validate update data
      const updateData = req.body;
      
      const ad = await storage.updateAd(id, updateData);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      return res.status(200).json(ad);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update ad" });
    }
  });

  app.delete("/api/ads/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      const success = await storage.deleteAd(id);
      if (!success) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete ad" });
    }
  });

  app.post("/api/ads/:id/impression", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      const ad = await storage.incrementAdImpressions(id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      return res.status(200).json({ impressions: ad.impressions });
    } catch (error) {
      return res.status(500).json({ message: "Failed to record impression" });
    }
  });

  app.post("/api/ads/:id/click", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ad ID" });
      }
      
      const ad = await storage.incrementAdClicks(id);
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
      
      return res.status(200).json({ clicks: ad.clicks });
    } catch (error) {
      return res.status(500).json({ message: "Failed to record click" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
