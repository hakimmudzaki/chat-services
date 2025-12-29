export interface User {
  id: string;
  username: string;
  password?: string;
  contacts: string[]; // List ID teman
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string; // Akan berisi Chipertext (Terenkripsi)
  timestamp: number;
}

export interface DatabaseSchema {
  users: User[];
  messages: Message[];
}