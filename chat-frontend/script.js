// GANTI DENGAN DOMAIN STB KAMU (Pastikan https:// dan tidak ada spasi)
const BASE_URL = "https://hakim.tugastst.my.id/api"; 

let myId = null;
let myUsername = null;
let currentFriendId = null;
let refreshInterval = null;

// === TOGGLE HALAMAN ===
function showRegister() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('register-screen').classList.remove('hidden');
    document.getElementById('reg-error').innerText = "";
}

function showLogin() {
    document.getElementById('register-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-error').innerText = "";
}

// === FUNGSI REGISTER ===
async function doRegister() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const errorMsg = document.getElementById('reg-error');

    if (!username || !password) {
        errorMsg.innerText = "Username & Password wajib diisi!";
        return;
    }

    errorMsg.innerText = "Loading...";

    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registrasi Berhasil! Silakan Login.");
            showLogin(); // Pindah ke layar login
            document.getElementById('login-username').value = username; // Auto-fill
            document.getElementById('login-password').value = password;
        } else {
            errorMsg.innerText = data.error || "Registrasi Gagal (Username mungkin sudah ada)";
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Gagal koneksi ke server. (Cek CORS/Internet)";
    }
}

// === FUNGSI LOGIN ===
async function doLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    if (!username || !password) return;
    errorMsg.innerText = "Mencoba masuk...";

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            // SIMPAN DATA LOGIN
            myId = data.id || data.user.id; // Jaga-jaga struktur respon beda
            myUsername = username;
            
            masukKeAplikasi();
        } else {
            errorMsg.innerText = "Username atau Password salah!";
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Gagal koneksi. Cek Console (F12) untuk detail.";
    }
}

function masukKeAplikasi() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('chat-app').classList.remove('hidden');
    document.getElementById('my-avatar').innerText = myUsername.substring(0,2).toUpperCase();
    loadContacts();
}

function logout() {
    location.reload(); // Refresh halaman simpel
}

// ================= MANAJEMEN KONTAK =================

// 1. Load Kontak dari Database (Bukan dummy lagi)
async function loadContacts() {
    const list = document.getElementById('contact-list');
    list.innerHTML = ""; 

    // Tombol Tambah Teman (Tetap ada di paling atas)
    const addBtn = document.createElement('div');
    addBtn.className = 'contact-item';
    addBtn.innerHTML = `
        <div class="avatar" style="background: #00a884;">+</div>
        <div class="contact-info"><h4>Tambah Teman</h4><p>Cari via Username</p></div>
    `;
    addBtn.onclick = addFriendPrompt;
    list.appendChild(addBtn);

    // FETCH DARI BACKEND
    try {
        const res = await fetch(`${BASE_URL}/friends/${myId}`);
        const contacts = await res.json();

        // Render semua teman yang tersimpan
        contacts.forEach(friend => {
            addContactToUI(friend.id, friend.username);
        });
    } catch (err) {
        console.error("Gagal ambil kontak", err);
    }
}

// 2. Tambah Teman Pakai Username Saja
async function addFriendPrompt() {
    const friendUsername = prompt("Masukkan Username Teman:");
    if (!friendUsername) return;

    // Panggil API Baru
    try {
        const res = await fetch(`${BASE_URL}/friends/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ myId: myId, friendUsername: friendUsername })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Teman berhasil ditambahkan!");
            // Update UI langsung tanpa refresh
            addContactToUI(data.contact.id, data.contact.username);
            openChat(data.contact.id, data.contact.username);
        } else {
            alert("Gagal: " + data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error koneksi ke server");
    }
}

// Helper untuk render UI (Sama seperti sebelumnya)
function addContactToUI(id, username) {
    if (document.getElementById(`contact-${id}`)) return; 

    const list = document.getElementById('contact-list');
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.id = `contact-${id}`;
    div.innerHTML = `
        <div class="avatar">${username.substring(0,2).toUpperCase()}</div>
        <div class="contact-info">
            <h4>${username}</h4>
            <p>Klik untuk chat</p>
        </div>
    `;
    div.onclick = () => openChat(id, username);
    list.appendChild(div);
}
// === LOGIC CHAT (Sama seperti sebelumnya) ===
function openChat(friendId, friendName) {
    currentFriendId = friendId;
    document.getElementById('chat-header').style.display = 'flex';
    document.getElementById('chat-footer').style.display = 'flex';
    document.getElementById('current-friend-name').innerText = friendName;
    document.getElementById('friend-avatar').innerText = friendName.substring(0,2).toUpperCase();
    
    // Reset active class
    document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`contact-${friendId}`).classList.add('active');

    loadMessages();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(loadMessages, 3000);
}

async function loadMessages() {
    if (!currentFriendId) return;
    try {
        const res = await fetch(`${BASE_URL}/chat/history?myId=${myId}&friendId=${currentFriendId}`);
        const msgs = await res.json();
        renderMessages(msgs);
    } catch (e) { console.error("Gagal load chat", e); }
}

function renderMessages(messages) {
    const container = document.getElementById('messages-container');
    container.innerHTML = "";
    messages.forEach(msg => {
        const isMe = msg.senderId === myId;
        const div = document.createElement('div');
        div.className = `message-bubble ${isMe ? 'sent' : 'received'}`;
        const time = new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        div.innerHTML = `${msg.content}<span class="message-time">${time}</span>`;
        container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value;
    if (!text) return;
    
    input.value = ""; // Kosongkan input
    try {
        await fetch(`${BASE_URL}/chat/send`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ senderId: myId, receiverId: currentFriendId, message: text })
        });
        loadMessages();
    } catch (e) { alert("Gagal kirim"); }
}

// Enter key send
document.getElementById('message-input').addEventListener("keypress", (e) => {
    if(e.key === "Enter") sendMessage();
});
// ... kode js sebelumnya ...

// ================= FITUR PROFIL & GANTI PASSWORD =================

function openProfile() {
    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfile() {
    document.getElementById('profile-modal').classList.add('hidden');
    document.getElementById('new-password').value = ""; // Bersihkan input
}

async function doChangePassword() {
    const newPass = document.getElementById('new-password').value;

    if (!newPass || newPass.length < 3) {
        alert("Password minimal 3 karakter dong!");
        return;
    }

    // Konfirmasi dulu biar gak kepencet
    if (!confirm("Yakin mau ganti password?")) return;

    try {
        const res = await fetch(`${BASE_URL}/auth/change-password`, {
            method: 'POST', // Sesuai router.post kamu
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: myId,       // Kita ambil myId dari variabel global saat login
                newPassword: newPass
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Sukses! " + data.message);
            closeProfile();
        } else {
            alert("Gagal: " + (data.error || "Terjadi kesalahan server"));
        }
    } catch (err) {
        console.error(err);
        alert("Error koneksi ke backend");
    }
}