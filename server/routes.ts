import type { Express, Request, Response } from "express";
import { db } from "./db.js";
import {
  prompts, agents, components, templates, snippets,
  connectors, socialDrafts, mailTemplates, interviewQuestions, userProgress, userProfiles,
  savedJobs, freelanceOffers, myServices
} from "../shared/schema.js";
import { eq, and, or } from "drizzle-orm";

function getUserId(req: Request): string | null {
  const id = req.headers["x-replit-user-id"];
  return id ? String(id) : null;
}

function requireUser(req: Request, res: Response): string | null {
  const id = getUserId(req);
  if (!id) { res.status(401).json({ error: "Not authenticated" }); return null; }
  return id;
}

function stripDates(data: Record<string, unknown>): Record<string, unknown> {
  const { createdAt, updatedAt, created_at, updated_at, ...rest } = data;
  void createdAt; void updatedAt; void created_at; void updated_at;
  return rest;
}

/** Only accept proper UUID v4 strings — rejects prefixed IDs like soc_xxx */
function isUUID(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

export function registerRoutes(app: Express) {

  // --- PROMPTS ---
  app.get("/api/prompts", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(prompts).where(eq(prompts.userId, uid)));
  });

  app.post("/api/prompts", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(prompts).where(and(eq(prompts.id, safeId), eq(prompts.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(prompts).set({ ...data, updatedAt: new Date() }).where(eq(prompts.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(prompts).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/prompts/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(prompts).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/prompts/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(prompts).where(and(eq(prompts.id, req.params.id), eq(prompts.userId, uid)));
    res.json({ ok: true });
  });

  // --- AGENTS ---
  app.get("/api/agents", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(agents).where(eq(agents.userId, uid)));
  });

  app.post("/api/agents", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(agents).where(and(eq(agents.id, safeId), eq(agents.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(agents).set({ ...data, updatedAt: new Date() }).where(eq(agents.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(agents).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/agents/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(agents).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/agents/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(agents).where(and(eq(agents.id, req.params.id), eq(agents.userId, uid)));
    res.json({ ok: true });
  });

  // --- COMPONENTS ---
  app.get("/api/components", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(components).where(eq(components.userId, uid)));
  });

  app.post("/api/components", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(components).where(and(eq(components.id, safeId), eq(components.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(components).set({ ...data, updatedAt: new Date() }).where(eq(components.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(components).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/components/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(components).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/components/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(components).where(and(eq(components.id, req.params.id), eq(components.userId, uid)));
    res.json({ ok: true });
  });

  // --- TEMPLATES ---
  app.get("/api/templates", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(templates).where(eq(templates.userId, uid)));
  });

  app.post("/api/templates", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(templates).where(and(eq(templates.id, safeId), eq(templates.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(templates).set({ ...data, updatedAt: new Date() }).where(eq(templates.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(templates).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/templates/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(templates).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/templates/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(templates).where(and(eq(templates.id, req.params.id), eq(templates.userId, uid)));
    res.json({ ok: true });
  });

  // --- SNIPPETS ---
  app.get("/api/snippets", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(snippets).where(eq(snippets.userId, uid)));
  });

  app.post("/api/snippets", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(snippets).where(and(eq(snippets.id, safeId), eq(snippets.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(snippets).set({ ...data, updatedAt: new Date() }).where(eq(snippets.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(snippets).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/snippets/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(snippets).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/snippets/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(snippets).where(and(eq(snippets.id, req.params.id), eq(snippets.userId, uid)));
    res.json({ ok: true });
  });

  // --- CONNECTORS ---
  app.get("/api/connectors", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(connectors).where(eq(connectors.userId, uid)));
  });

  app.post("/api/connectors", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(connectors).where(and(eq(connectors.id, safeId), eq(connectors.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(connectors).set({ ...data, updatedAt: new Date() }).where(eq(connectors.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(connectors).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/connectors/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(connectors).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/connectors/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(connectors).where(and(eq(connectors.id, req.params.id), eq(connectors.userId, uid)));
    res.json({ ok: true });
  });

  // --- SOCIAL DRAFTS ---
  app.get("/api/social-drafts", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(socialDrafts).where(eq(socialDrafts.userId, uid)));
  });

  app.post("/api/social-drafts", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(socialDrafts).where(and(eq(socialDrafts.id, safeId), eq(socialDrafts.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(socialDrafts).set({ ...data, updatedAt: new Date() }).where(eq(socialDrafts.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(socialDrafts).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/social-drafts/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(socialDrafts).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/social-drafts/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(socialDrafts).where(and(eq(socialDrafts.id, req.params.id), eq(socialDrafts.userId, uid)));
    res.json({ ok: true });
  });

  // --- MAIL TEMPLATES ---
  app.get("/api/mail-templates", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(mailTemplates).where(eq(mailTemplates.userId, uid)));
  });

  app.post("/api/mail-templates", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(mailTemplates).where(and(eq(mailTemplates.id, safeId), eq(mailTemplates.userId, uid))) : [];
    if (existing.length > 0) {
      const [r] = await db.update(mailTemplates).set({ ...data, updatedAt: new Date() }).where(eq(mailTemplates.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(mailTemplates).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/mail-templates/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(mailTemplates).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/mail-templates/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(mailTemplates).where(and(eq(mailTemplates.id, req.params.id), eq(mailTemplates.userId, uid)));
    res.json({ ok: true });
  });

  // --- INTERVIEW QUESTIONS ---
  app.get("/api/interview-questions", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(interviewQuestions).where(
      or(eq(interviewQuestions.isGlobal, true), eq(interviewQuestions.userId, uid))
    ));
  });

  app.post("/api/interview-questions", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    const existing = safeId ? await db.select().from(interviewQuestions).where(eq(interviewQuestions.id, safeId)) : [];
    if (existing.length > 0 && existing[0].userId === uid) {
      const [r] = await db.update(interviewQuestions).set(data).where(eq(interviewQuestions.id, safeId!)).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(interviewQuestions).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
      res.json(r);
    }
  });

  app.post("/api/interview-questions/bulk", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const items = req.body as any[];
    if (!items.length) { res.json([]); return; }
    const values = items.map(({ id, ...raw }) => {
      const data = stripDates(raw);
      const safeId = isUUID(id) ? id : undefined;
      return { ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any;
    });
    const result = await db.insert(interviewQuestions).values(values).onConflictDoNothing().returning();
    res.json(result);
  });

  app.delete("/api/interview-questions/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(interviewQuestions).where(and(eq(interviewQuestions.id, req.params.id), eq(interviewQuestions.userId, uid)));
    res.json({ ok: true });
  });

  // --- USER PROGRESS ---
  app.get("/api/progress", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(userProgress).where(eq(userProgress.userId, uid)));
  });

  app.post("/api/progress/toggle", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { itemId, areaId, completed } = req.body;
    const existing = await db.select().from(userProgress).where(
      and(eq(userProgress.userId, uid), eq(userProgress.itemId, itemId))
    );
    if (existing.length > 0) {
      const [r] = await db.update(userProgress).set({ completed, updatedAt: new Date() })
        .where(and(eq(userProgress.userId, uid), eq(userProgress.itemId, itemId))).returning();
      res.json(r);
    } else {
      const [r] = await db.insert(userProgress).values({ userId: uid, itemId, areaId, completed }).returning();
      res.json(r);
    }
  });

  // --- SAVED JOBS ---
  app.get("/api/jobs/saved", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(savedJobs).where(eq(savedJobs.userId, uid)));
  });

  app.post("/api/jobs/saved", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    if (safeId) {
      const existing = await db.select().from(savedJobs).where(and(eq(savedJobs.id, safeId), eq(savedJobs.userId, uid)));
      if (existing.length > 0) {
        const [r] = await db.update(savedJobs).set({ ...data, updatedAt: new Date() }).where(eq(savedJobs.id, safeId)).returning();
        res.json(r); return;
      }
    }
    const [r] = await db.insert(savedJobs).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
    res.json(r);
  });

  app.delete("/api/jobs/saved/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(savedJobs).where(and(eq(savedJobs.id, req.params.id), eq(savedJobs.userId, uid)));
    res.json({ ok: true });
  });

  app.get("/api/jobs/remote", async (req, res) => {
    try {
      const tag = req.query.tag ? `?tag=${encodeURIComponent(String(req.query.tag))}` : "";
      const r = await fetch(`https://remoteok.com/api${tag}`, {
        headers: { "User-Agent": "Mozilla/5.0 DevStudio/1.0", "Accept": "application/json" },
      });
      if (!r.ok) throw new Error(`RemoteOK ${r.status}`);
      const data = await r.json() as any[];
      res.json(data.slice(1).filter((j: any) => j.id && j.title).slice(0, 30));
    } catch {
      res.status(502).json({ error: "Failed to fetch remote jobs" });
    }
  });

  // --- FREELANCE OFFERS ---
  app.get("/api/jobs/offers", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(freelanceOffers).where(eq(freelanceOffers.userId, uid)));
  });

  app.post("/api/jobs/offers", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    if (safeId) {
      const existing = await db.select().from(freelanceOffers).where(and(eq(freelanceOffers.id, safeId), eq(freelanceOffers.userId, uid)));
      if (existing.length > 0) {
        const [r] = await db.update(freelanceOffers).set({ ...data, updatedAt: new Date() }).where(eq(freelanceOffers.id, safeId)).returning();
        res.json(r); return;
      }
    }
    const [r] = await db.insert(freelanceOffers).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
    res.json(r);
  });

  app.delete("/api/jobs/offers/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(freelanceOffers).where(and(eq(freelanceOffers.id, req.params.id), eq(freelanceOffers.userId, uid)));
    res.json({ ok: true });
  });

  // --- MY SERVICES ---
  app.get("/api/jobs/services", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    res.json(await db.select().from(myServices).where(eq(myServices.userId, uid)));
  });

  app.post("/api/jobs/services", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { id, ...raw } = req.body;
    const data = stripDates(raw);
    const safeId = isUUID(id) ? id : undefined;
    if (safeId) {
      const existing = await db.select().from(myServices).where(and(eq(myServices.id, safeId), eq(myServices.userId, uid)));
      if (existing.length > 0) {
        const [r] = await db.update(myServices).set({ ...data, updatedAt: new Date() }).where(eq(myServices.id, safeId)).returning();
        res.json(r); return;
      }
    }
    const [r] = await db.insert(myServices).values({ ...data, userId: uid, ...(safeId ? { id: safeId } : {}) } as any).returning();
    res.json(r);
  });

  app.delete("/api/jobs/services/:id", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    if (!isUUID(req.params.id)) { res.json({ ok: true }); return; }
    await db.delete(myServices).where(and(eq(myServices.id, req.params.id), eq(myServices.userId, uid)));
    res.json({ ok: true });
  });

  // --- USER PROFILE ---
  app.get("/api/profile", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, uid));
    res.json(rows[0] ?? null);
  });

  app.post("/api/profile", async (req, res) => {
    const uid = requireUser(req, res); if (!uid) return;
    const { displayName, avatarUrl, location } = req.body;
    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, uid));
    if (existing.length > 0) {
      const [r] = await db.update(userProfiles)
        .set({ displayName, avatarUrl, location, updatedAt: new Date() })
        .where(eq(userProfiles.userId, uid))
        .returning();
      res.json(r);
    } else {
      const [r] = await db.insert(userProfiles)
        .values({ userId: uid, displayName, avatarUrl, location })
        .returning();
      res.json(r);
    }
  });
}
