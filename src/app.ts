import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';
import { initDB } from './infrastructure/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Izinkan akses dari Frontend manapun
app.use(express.json());

// Init Database saat start
initDB().then(() => {
  console.log('Database connected');
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server Chat berjalan di port ${PORT}`);
});