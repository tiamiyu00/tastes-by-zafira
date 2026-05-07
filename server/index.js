import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ——— Image upload ———
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomBytes(10).toString('hex') + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ——— Menu ———
app.get('/api/menu', (_req, res) => {
  const db = readDB();
  res.json(db.menu);
});

app.post('/api/menu', (req, res) => {
  const db = readDB();
  const newItem = {
    id: Date.now().toString(),
    name: '',
    category: 'Food Class',
    price: 0,
    image: '',
    available: true,
    popular: false,
    chefsSpecial: false,
    ...req.body,
  };
  db.menu.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', (req, res) => {
  const db = readDB();
  const idx = db.menu.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  db.menu[idx] = { ...db.menu[idx], ...req.body };
  writeDB(db);
  res.json(db.menu[idx]);
});

app.delete('/api/menu/:id', (req, res) => {
  const db = readDB();
  db.menu = db.menu.filter((i) => i.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// ——— Settings ———
app.get('/api/settings', (_req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

app.listen(PORT, () => {
  console.log(`\n🍽️  Tastes by Zafira API → http://localhost:${PORT}\n`);
});
