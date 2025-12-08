import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// ---- Auth (dev) ----
app.get('/users', async (req, res) => {
  const { email, password } = req.query as { email?: string; password?: string };
  if (!email || !password) return res.json([]);
  const user = await prisma.user.findFirst({ where: { email, password } });
  res.json(user ? [user] : []);
});

// ---- Products ----
const assetsDir = path.join(process.cwd(), 'src', 'assets', 'products');
function ensureAssetsDir() {
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
}
function saveImageFromData(dataUrl: string, name?: string): string {
  ensureAssetsDir();
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data');
  const mime = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = (name && name.includes('.')) ? name.split('.').pop() : mime.split('/')[1] || 'png';
  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
  const filepath = path.join(assetsDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `/assets/products/${filename}`;
}

function normalizeImagesField(body: any) {
  if (body.images == null) body.images = [];
  if (typeof body.images === 'string') {
    try { body.images = JSON.parse(body.images); } catch { body.images = [body.images]; }
  }
  if (!Array.isArray(body.images)) body.images = [];
}

app.get('/products', async (req, res) => {
  const { storeId, q, category, minPrice, maxPrice, sort, quick } = req.query as {
    storeId?: string;
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    quick?: string;
  };

  const where: any = {};
  if (storeId) where.storeId = storeId;
  if (category && category !== 'All') where.category = category;

  const searchTerm = q?.trim();
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const priceFilter: any = {};
  const min = minPrice ? parseFloat(minPrice) : null;
  const max = maxPrice ? parseFloat(maxPrice) : null;
  if (!Number.isNaN(min!) && min !== null) priceFilter.gte = min;
  if (!Number.isNaN(max!) && max !== null) priceFilter.lte = max;

  // Quick filters inspired by Amazon-like browsing
  if (quick === 'budget') priceFilter.lte = Math.min(priceFilter.lte ?? Infinity, 20);
  if (quick === 'premium') priceFilter.gte = Math.max(priceFilter.gte ?? 0, 50);
  if (Object.keys(priceFilter).length) where.price = priceFilter;

  let orderBy: any = { createdAt: 'desc' };
  if (quick === 'trending') {
    orderBy = [{ createdAt: 'desc' }, { price: 'desc' }];
  } else if (quick === 'recent') {
    orderBy = { createdAt: 'desc' };
  }

  switch (sort) {
    case 'priceAsc':
      orderBy = { price: 'asc' };
      break;
    case 'priceDesc':
      orderBy = { price: 'desc' };
      break;
    case 'name':
      orderBy = { title: 'asc' };
      break;
    default:
      break;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: quick === 'trending' ? 20 : undefined,
  });
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

app.post('/products', async (req, res) => {
  try {
    const body = { ...req.body };
    normalizeImagesField(body);
    if (body.imageData) {
      const storedPath = saveImageFromData(body.imageData, body.imageName);
      body.images = [storedPath];
    }
    if (body.images) body.images = JSON.stringify(body.images);
    const created = await prisma.product.create({ data: body });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ message: e?.message || 'Upload failed' });
  }
});

app.patch('/products/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    normalizeImagesField(body);
    if (body.imageData) {
      const storedPath = saveImageFromData(body.imageData, body.imageName);
      body.images = [storedPath];
    }
    if (body.images) body.images = JSON.stringify(body.images);
    const updated = await prisma.product.update({ where: { id: req.params.id }, data: body });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ message: e?.message || 'Update failed' });
  }
});

app.delete('/products/:id', async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// ---- Orders ----
app.post('/orders', async (req, res) => {
  const o = req.body;
  const created = await prisma.order.create({
    data: {
      customerId: o.customerId ?? (await prisma.user.findFirst({ where: { roles: 'customer' } }))?.id!,
      total: o.total,
      status: o.status ?? 'PLACED',
      pickupTime: o.pickupTime ?? null,
      items: {
        create: o.items.map((i: any) => ({
          productId: i.productId,
          title: i.title,
          price: i.price,
          qty: i.qty
        }))
      }
    },
    include: { items: true }
  });
  res.status(201).json(created);
});

app.get('/orders', async (_req, res) => {
  const list = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json(list);
});

app.get('/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

// ---- Start ----
const PORT = 3333;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
