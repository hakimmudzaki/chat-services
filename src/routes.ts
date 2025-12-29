import express, { Request, Response } from 'express'; // <-- Import Request & Response
import { AuthService } from './services/AuthService.js';
import { ChatService } from './services/ChatService.js';

const router = express.Router();
const authService = new AuthService();
const chatService = new ChatService();

// --- Auth Routes ---
// Tambahkan tipe : Request dan : Response di setiap handler
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await authService.register(username, password);
    res.json(result);
  } catch (e: any) { // Pastikan error di-cast ke any
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

// --- Friend Routes ---
router.post('/friends/add', async (req: Request, res: Response) => {
  try {
    const { myId, friendUsername } = req.body;
    const result = await authService.addFriend(myId, friendUsername);
    res.json(result);
  } catch (e: any) { 
    res.status(400).json({ error: e.message }); 
  }
});

router.get('/friends/:myId', async (req: Request, res: Response) => {
  const result = await authService.getMyFriends(req.params.myId);
  res.json(result);
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
    // req.query isinya bisa string, undefined, atau array. Kita paksa jadi string.
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