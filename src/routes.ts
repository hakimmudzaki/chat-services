import express, { Request, Response } from 'express';
import { AuthService } from './services/AuthService.js';
import { ChatService } from './services/ChatService.js';
import { db } from './infrastructure/db.js'; // <--- 1. TAMBAH IMPORT INI

const router = express.Router();
const authService = new AuthService();
const chatService = new ChatService();

// --- Auth Routes ---
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await authService.register(username, password);
    res.json(result);
  } catch (e: any) { 
    res.status(400).json({ error: e.message }); 
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (e: any) { 
    res.status(401).json({ error: e.message }); 
  }
});

// --- Friend Routes (SUDAH DIPERBAIKI) ---

// 1. ADD FRIEND (Dipakai Frontend)
// Menggunakan logic 'addFriendWithContact' yang return object lengkap
router.post('/friends/add', async (req: Request, res: Response) => {
  try {
    const { myId, friendUsername } = req.body;
    // Panggil service yang baru (pastikan service return { message, contact: {...} })
    const result = await authService.addFriendWithContact(myId, friendUsername);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 2. GET FRIEND LIST (Logic Populate ID -> Object)
router.get('/friends/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await db.read();
    
    // Ambil data user yang sedang login
    const user = db.data!.users.find((u: any) => u.id === userId);
    if (!user) {
        return res.json([]); 
    }

    // LOGIC POPULATE: Mengubah list ID ["id1", "id2"] menjadi Object [{id, username}, ...]
    // Agar frontend bisa menampilkan nama teman.
    const friendList = user.contacts.map((contactId: string) => {
        // Cari info teman berdasarkan ID
        const friendData = db.data!.users.find((u: any) => u.id === contactId);
        if (friendData) {
            return { id: friendData.id, username: friendData.username };
        }
        return null;
    }).filter((item: any) => item !== null); // Hapus yang null (user terhapus)

    res.json(friendList);

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- Password Change Route ---
router.post('/auth/change-password', async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;
    const result = await authService.changePassword(userId, newPassword);
    res.json(result);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

// --- Chat Routes ---
router.post('/chat/send', async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const result = await chatService.sendMessage(senderId, receiverId, message);
    res.json(result);
  } catch (e: any) { 
    res.status(500).json({ error: e.message }); 
  }
});

router.get('/chat/history', async (req: Request, res: Response) => {
  try {
    const myId = req.query.myId as string;
    const friendId = req.query.friendId as string;

    if(!myId || !friendId) throw new Error("Parameter kurang");
    
    const result = await chatService.getHistory(myId, friendId);
    res.json(result);
  } catch (e: any) { 
    res.status(500).json({ error: e.message }); 
  }
});

export default router;