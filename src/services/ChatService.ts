import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../infrastructure/db.js';
import { Message } from '../domain/types.js'; // <-- Import tipe Message
import dotenv from 'dotenv';

dotenv.config();

export class ChatService {
  private PARTNER_URL = process.env.PARTNER_API_URL;

  async sendMessage(senderId: string, receiverId: string, plainText: string) {
    if (!plainText) throw new Error("Pesan tidak boleh kosong");

    let encryptedContent = plainText;
    try {
      const response = await axios.post(`${this.PARTNER_URL}/encrypt`, {
        text: plainText,
        keyContext: `${senderId}-${receiverId}`
      });
      encryptedContent = response.data.result; 
    } catch (error: any) { // <-- Tambahkan type any di error
      console.error("Gagal enkripsi, simpan plaintext (fallback)", error.message);
    }

    const newMessage: Message = {
      id: uuidv4(),
      senderId,
      receiverId,
      content: encryptedContent, 
      timestamp: Date.now()
    };

    await db.read();
    db.data!.messages.push(newMessage);
    await db.write();

    return newMessage;
  }

  async getHistory(myId: string, friendId: string) {
    await db.read();
    
    // 1. Fix variabel 'm' dengan tipe Message
    const chats = db.data!.messages.filter((m: Message) => 
      (m.senderId === myId && m.receiverId === friendId) ||
      (m.senderId === friendId && m.receiverId === myId)
    );

    // 2. Fix variabel 'msg' dengan tipe Message
    const decryptedChats = await Promise.all(chats.map(async (msg: Message) => {
      try {
        const response = await axios.post(`${this.PARTNER_URL}/decrypt`, {
          text: msg.content,
          keyContext: `${msg.senderId}-${msg.receiverId}`
        });
        return { ...msg, content: response.data.result };
      } catch (error) {
        return { ...msg, content: "[Gagal Decrypt]" };
      }
    }));

    // 3. Fix variabel 'a' dan 'b' dengan tipe Message
    return decryptedChats.sort((a: Message, b: Message) => a.timestamp - b.timestamp);
  }
}