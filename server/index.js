import express from "express";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const DATA_FILE = path.resolve(process.cwd(), "server", "data", "coffees.json");

let fxCache = {
  usdGel: null,
  fetchedAtMs: 0,
};

const FX_CACHE_TTL_MS = 5 * 60 * 1000;

app.use(express.json());
app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: false,
  })
);

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial = {
      coffees: [],
      ingredients: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    return { coffees: [], ingredients: [] };
  }
  if (!Array.isArray(parsed.coffees)) parsed.coffees = [];
  if (!Array.isArray(parsed.ingredients)) parsed.ingredients = [];
  return parsed;
}

async function writeData(data) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeCoffeePayload(payload) {
  const name =
    typeof payload.name === "string"
      ? payload.name.trim()
      : typeof payload.title === "string"
        ? payload.title.trim()
        : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const long_description =
    payload.long_description === null || payload.long_description === undefined
      ? null
      : typeof payload.long_description === "string"
        ? payload.long_description.trim()
        : null;

  const image_url_raw = payload.image_url ?? payload.image;
  const image_url =
    image_url_raw === null || image_url_raw === undefined
      ? null
      : typeof image_url_raw === "string"
        ? image_url_raw.trim()
        : null;

  const price_usd = Number(payload.price_usd);
  const price_gel = Number(payload.price_gel);

  const ingredients = Array.isArray(payload.ingredients)
    ? payload.ingredients.filter((x) => typeof x === "string")
    : [];
  const title = typeof payload.title === "string" ? payload.title.trim() : null;
  const country = typeof payload.country === "string" ? payload.country.trim() : null;
  const caffeine = payload.caffeine === undefined || payload.caffeine === null ? null : Number(payload.caffeine);

  if (!name) return { ok: false, error: "name is required" };
  if (!description) return { ok: false, error: "description is required" };
  if (!Number.isFinite(price_usd)) return { ok: false, error: "price_usd must be a number" };
  if (!Number.isFinite(price_gel)) return { ok: false, error: "price_gel must be a number" };

  return {
    ok: true,
    coffee: {
      name,
      description,
      long_description,
      image_url,
      price_usd,
      price_gel,
      title,
      country,
      caffeine: Number.isFinite(caffeine) ? caffeine : null,
      ingredients,
    },
  };
}

function normalizeIngredientPayload(payload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const strength = typeof payload.strength === "string" ? payload.strength.trim() : "";
  const flavor = typeof payload.flavor === "string" ? payload.flavor.trim() : "";
  const price = Number(payload.price);

  if (!name) return { ok: false, error: "name is required" };
  if (!Number.isFinite(price)) return { ok: false, error: "price must be a number" };

  return {
    ok: true,
    ingredient: {
      name,
      price,
      description,
      strength,
      flavor,
    },
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/fx/usd-gel", async (_req, res) => {
  try {
    const now = Date.now();
    const isFresh = fxCache.usdGel && now - fxCache.fetchedAtMs < FX_CACHE_TTL_MS;
    if (isFresh) {
      return res.json({
        rate: fxCache.usdGel,
        base: "USD",
        quote: "GEL",
        fetched_at: new Date(fxCache.fetchedAtMs).toISOString(),
        cached: true,
      });
    }

    const url = "https://bankofgeorgia.ge/api/currencies/convert/USD/GEL?amountFrom=1";
    const upstream = await fetch(url);
    if (!upstream.ok) {
      throw new Error(`Upstream failed: ${upstream.status}`);
    }
    const body = await upstream.json();
    const rate = Number(body?.data?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error("Invalid rate from upstream");
    }

    fxCache = {
      usdGel: rate,
      fetchedAtMs: now,
    };

    return res.json({
      rate,
      base: "USD",
      quote: "GEL",
      fetched_at: new Date(now).toISOString(),
      cached: false,
    });
  } catch (err) {
    if (fxCache.usdGel) {
      return res.json({
        rate: fxCache.usdGel,
        base: "USD",
        quote: "GEL",
        fetched_at: new Date(fxCache.fetchedAtMs).toISOString(),
        cached: true,
        stale: true,
      });
    }
    return res.status(502).json({ error: "Failed to fetch FX rate" });
  }
});

app.get("/api/coffees", async (_req, res) => {
  try {
    const data = await readData();
    const coffees = [...data.coffees].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    res.json(coffees);
  } catch (err) {
    res.status(500).json({ error: "Failed to read coffees" });
  }
});

app.get("/api/coffees/:id", async (req, res) => {
  try {
    const data = await readData();
    const coffee = data.coffees.find((c) => c.id === req.params.id);
    if (!coffee) return res.status(404).json({ error: "Coffee not found" });
    res.json(coffee);
  } catch {
    res.status(500).json({ error: "Failed to read coffee" });
  }
});

app.post("/api/coffees", async (req, res) => {
  const normalized = normalizeCoffeePayload(req.body);
  if (!normalized.ok) return res.status(400).json({ error: normalized.error });

  try {
    const data = await readData();

    const created_at = nowIso();
    const newCoffee = {
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
      ...normalized.coffee,
      created_at,
      updated_at: created_at,
    };

    data.coffees.push(newCoffee);
    await writeData(data);

    res.status(201).json(newCoffee);
  } catch {
    res.status(500).json({ error: "Failed to create coffee" });
  }
});

app.put("/api/coffees/:id", async (req, res) => {
  const normalized = normalizeCoffeePayload(req.body);
  if (!normalized.ok) return res.status(400).json({ error: normalized.error });

  try {
    const data = await readData();
    const idx = data.coffees.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Coffee not found" });

    const existing = data.coffees[idx];
    const updated = {
      ...existing,
      ...normalized.coffee,
      updated_at: nowIso(),
    };

    data.coffees[idx] = updated;
    await writeData(data);

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update coffee" });
  }
});

app.delete("/api/coffees/:id", async (req, res) => {
  try {
    const data = await readData();
    const before = data.coffees.length;
    data.coffees = data.coffees.filter((c) => c.id !== req.params.id);
    if (data.coffees.length === before) return res.status(404).json({ error: "Coffee not found" });

    await writeData(data);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete coffee" });
  }
});

app.get("/api/ingredients", async (_req, res) => {
  try {
    const data = await readData();
    res.json(data.ingredients);
  } catch {
    res.status(500).json({ error: "Failed to read ingredients" });
  }
});

app.get("/api/ingredients/:id", async (req, res) => {
  try {
    const data = await readData();
    const ingredient = data.ingredients.find((i) => i.id === req.params.id);
    if (!ingredient) return res.status(404).json({ error: "Ingredient not found" });
    res.json(ingredient);
  } catch {
    res.status(500).json({ error: "Failed to read ingredient" });
  }
});

app.post("/api/ingredients", async (req, res) => {
  const normalized = normalizeIngredientPayload(req.body);
  if (!normalized.ok) return res.status(400).json({ error: normalized.error });

  try {
    const data = await readData();

    const newIngredient = {
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
      ...normalized.ingredient,
    };

    data.ingredients.push(newIngredient);
    await writeData(data);

    res.status(201).json(newIngredient);
  } catch {
    res.status(500).json({ error: "Failed to create ingredient" });
  }
});

app.put("/api/ingredients/:id", async (req, res) => {
  const normalized = normalizeIngredientPayload(req.body);
  if (!normalized.ok) return res.status(400).json({ error: normalized.error });

  try {
    const data = await readData();
    const idx = data.ingredients.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Ingredient not found" });

    const updated = {
      ...data.ingredients[idx],
      ...normalized.ingredient,
      id: req.params.id,
    };

    data.ingredients[idx] = updated;
    await writeData(data);
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update ingredient" });
  }
});

app.delete("/api/ingredients/:id", async (req, res) => {
  try {
    const data = await readData();
    const before = data.ingredients.length;
    data.ingredients = data.ingredients.filter((i) => i.id !== req.params.id);
    if (data.ingredients.length === before) return res.status(404).json({ error: "Ingredient not found" });

    await writeData(data);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete ingredient" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Coffee API running on http://localhost:${PORT}`);
});
