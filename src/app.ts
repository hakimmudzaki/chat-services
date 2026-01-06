import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes.js';
import { initDB } from './infrastructure/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Untuk ES Module, buat __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors()); // Izinkan akses dari Frontend manapun
app.use(express.json());

// Serve static files dari folder chat-frontend
app.use(express.static(path.join(__dirname, '../chat-frontend')));

// Init Database saat start
initDB().then(() => {
  console.log('Database connected');
});

app.use('/api', router);

// Route default: redirect ke login.html
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`Server Chat berjalan di port ${PORT}`);
});