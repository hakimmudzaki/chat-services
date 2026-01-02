import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { db } from '../infrastructure/db.js';
import { User } from '../domain/types.js'; // <-- Import tipe User

const SALT_ROUNDS = 10;

export class AuthService {
  async register(username: string, pass: string) {
    await db.read();
    // Tambahkan ": User" pada parameter u
    const users = db.data!.users;

    if (users.find((u: User) => u.username === username)) {
      throw new Error("Username sudah dipakai!");
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(pass, SALT_ROUNDS);

    const newUser: User = { 
      id: uuidv4(), 
      username, 
      password: hashedPassword, 
      contacts: [] 
    };
    
    users.push(newUser);
    await db.write();
    return { id: newUser.id, username: newUser.username };
  }

  async login(username: string, pass: string) {
    await db.read();
    // Cari user berdasarkan username
    const user = db.data!.users.find((u: User) => u.username === username);
    
    if (!user) throw new Error("Username atau Password salah!");

    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(pass, user.password || '');
    if (!isPasswordValid) throw new Error("Username atau Password salah!");

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

  // --- New Methods ---
  
  // Di AuthService.ts

async addFriendWithContact(myId: string, friendUsername: string) {
    await db.read();
    const users = db.data!.users;

    const me = users.find((u: User) => u.id === myId);
    if (!me) throw new Error("User saya tidak ditemukan");

    const friend = users.find((u: User) => u.username === friendUsername);
    if (!friend) throw new Error("Username teman tidak ditemukan!");

    // Cek berteman (Karena isinya string ID, ceknya gampang)
    if (me.contacts.includes(friend.id)) throw new Error("Sudah berteman!");

    // 1. SIMPAN KE DB (Cuma ID string, jadi gak bakal error Type)
    me.contacts.push(friend.id);

    // Mutual (Simpan ID saya ke teman)
    if (!friend.contacts.includes(me.id)) {
        friend.contacts.push(me.id);
    }

    await db.write();

    // 2. RETURN KE CONTROLLER (Kita rakit object manual di sini buat Frontend)
    // Walaupun di DB cuma ID, frontend butuh Username buat ditampilkan
    return { 
        message: "Berhasil tambah teman", 
        contact: { 
            id: friend.id, 
            username: friend.username 
        } 
    };
}

  async getFriendContacts(userId: string) {
    await db.read();
    const user = db.data!.users.find((u: User) => u.id === userId);
    if (!user) return [];

    // Return daftar kontak dengan detail
    const contacts = db.data!.users
      .filter((u: User) => user.contacts.includes(u.id))
      .map((u: User) => ({ id: u.id, username: u.username }));

    return contacts;
  }

  async changePassword(userId: string, newPassword: string) {
    await db.read();
    const user = db.data!.users.find((u: User) => u.id === userId);
    
    if (!user) throw new Error("User tidak ditemukan");

    // Hash password baru sebelum disimpan
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.write();
    return { message: "Password berhasil diganti" };
  }
}