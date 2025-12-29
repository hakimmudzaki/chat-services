import { v4 as uuidv4 } from 'uuid';
import { db } from '../infrastructure/db.js';
import { User } from '../domain/types.js'; // <-- Import tipe User

export class AuthService {
  async register(username: string, pass: string) {
    await db.read();
    // Tambahkan ": User" pada parameter u
    const users = db.data!.users;

    if (users.find((u: User) => u.username === username)) {
      throw new Error("Username sudah dipakai!");
    }

    const newUser: User = { 
      id: uuidv4(), 
      username, 
      password: pass, 
      contacts: [] 
    };
    
    users.push(newUser);
    await db.write();
    return { id: newUser.id, username: newUser.username };
  }

  async login(username: string, pass: string) {
    await db.read();
    // Tambahkan ": User"
    const user = db.data!.users.find((u: User) => u.username === username && u.password === pass);
    
    if (!user) throw new Error("Username atau Password salah!");
    return { id: user.id, username: user.username, contacts: user.contacts };
  }

  async addFriend(myId: string, friendUsername: string) {
    await db.read();
    const users = db.data!.users;
    
    // Tambahkan ": User"
    const me = users.find((u: User) => u.id === myId);
    const friend = users.find((u: User) => u.username === friendUsername);

    if (!me || !friend) throw new Error("User tidak ditemukan");
    if (me.id === friend.id) throw new Error("Tidak bisa add diri sendiri");
    if (me.contacts.includes(friend.id)) throw new Error("Sudah berteman");

    me.contacts.push(friend.id);
    friend.contacts.push(me.id);
    
    await db.write();
    return { message: `Berhasil berteman dengan ${friendUsername}` };
  }

  async getMyFriends(myId: string) {
    await db.read();
    // Tambahkan ": User"
    const me = db.data!.users.find((u: User) => u.id === myId);
    if (!me) return [];

    const friends = db.data!.users
      .filter((u: User) => me.contacts.includes(u.id))
      .map((u: User) => ({ id: u.id, username: u.username })); // <-- Explicit type
      
    return friends;
  }
}