// GANTI DENGAN DOMAIN STB KAMU
const BASE_URL = "https://hakim.tugastst.my.id/api"; 

// Variabel Global
let myId = null;
let myUsername = null;
let currentFriendId = null;
let refreshInterval = null;

// === TOGGLE HALAMAN LOGIN/REGISTER ===
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
        errorMsg.innerText = "Isi semua kolom!";
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
            alert("Berhasil! Silakan Login.");
            showLogin();
            document.getElementById('login-username').value = username;
        } else {
            errorMsg.innerText = data.error || "Gagal Register";
        }
    } catch (err) {
        errorMsg.innerText = "Error koneksi.";
    }
}

// === FUNGSI LOGIN (UPDATE PENTING) ===
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
            // 1. SIMPAN DATA KE BROWSER (Agar tidak hilang saat refresh)
            const userData = {
                id: data.id || data.user.id,
                username: username
            };
            localStorage.setItem('chat_user', JSON.stringify(userData));

            // 2. PINDAH HALAMAN
            window.location.href = 'index.html';
        } else {
            errorMsg.innerText = "Username/Password Salah!";
        }
    } catch (err) {
        errorMsg.innerText = "Gagal koneksi server.";
    }
}

// === LOGOUT ===
function logout() {
    if(confirm("Yakin mau keluar?")) {
        localStorage.removeItem('chat_user'); // Hapus sesi
        window.location.href = 'login.html'; // Balik ke login
    }
}

// ================= MANAJEMEN KONTAK =================
async function loadContacts() {
    const list = document.getElementById('contact-list');
    // Jangan clear innerHTML total agar tidak kedip parah, tapi untuk tugas simpel, clear aja gpp.
    // Kita simpan tombol tambah teman biar gak hilang
    const addBtnHTML = `
        <div class="contact-item" onclick="addFriendPrompt()">
            <div class="avatar" style="background: #00a884;">+</div>
            <div class="contact-info"><h4>Tambah Teman</h4><p>Cari via Username</p></div>
        </div>`;
    
    try {
        const res = await fetch(`${BASE_URL}/friends/${myId}`);
        const contacts = await res.json();
        
        // Render Ulang
        list.innerHTML = addBtnHTML; 
        contacts.forEach(friend => {
            addContactToUI(friend.id, friend.username);
        });
    } catch (err) {
        console.error("Gagal load kontak");
    }
}

async function addFriendPrompt() {
    const friendUsername = prompt("Masukkan Username Teman:");
    if (!friendUsername) return;

    try {
        const res = await fetch(`${BASE_URL}/friends/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ myId: myId, friendUsername: friendUsername })
        });
        const data = await res.json();

        if (res.ok) {
            alert("Berhasil berteman!");
            // Refresh manual sekali biar langsung muncul (walau ada auto refresh)
            loadContacts();
        } else {
            alert("Gagal: " + data.error);
        }
    } catch (err) {
        alert("Error server");
    }
}

function addContactToUI(id, username) {
    // Kalau sudah ada, jangan double (tapi cek ID agar update status active tetap jalan)
    if (document.getElementById(`contact-${id}`)) return;

    const list = document.getElementById('contact-list');
    const div = document.createElement('div');
    div.className = 'contact-item';
    div.id = `contact-${id}`;
    
    // Cek apakah ini teman yang sedang dibuka chatnya?
    if(id === currentFriendId) div.classList.add('active');

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

// ================= FITUR CHAT =================
function openChat(friendId, friendName) {
    currentFriendId = friendId;
    
    // Update UI Header
    document.getElementById('chat-header').style.display = 'flex';
    document.getElementById('chat-footer').style.display = 'flex';
    document.getElementById('current-friend-name').innerText = friendName;
    document.getElementById('friend-avatar').innerText = friendName.substring(0,2).toUpperCase();
    
    // Manage Class Active
    document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
    const activeContact = document.getElementById(`contact-${friendId}`);
    if(activeContact) activeContact.classList.add('active');

    loadMessages();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(loadMessages, 3000); // Poll chat tiap 3 detik
}

async function loadMessages() {
    if (!currentFriendId) return;
    try {
        const res = await fetch(`${BASE_URL}/chat/history?myId=${myId}&friendId=${currentFriendId}`);
        const msgs = await res.json();
        renderMessages(msgs);
    } catch (e) { console.error(e); }
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
    // Auto scroll bottom
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value;
    if (!text) return;
    input.value = ""; 
    
    try {
        await fetch(`${BASE_URL}/chat/send`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ senderId: myId, receiverId: currentFriendId, message: text })
        });
        loadMessages();
    } catch (e) { alert("Gagal kirim"); }
}

// Enter key send listener
const msgInput = document.getElementById('message-input');
if(msgInput){
    msgInput.addEventListener("keypress", (e) => {
        if(e.key === "Enter") sendMessage();
    });
}

// ================= PROFIL & PASSWORD =================
function openProfile() { document.getElementById('profile-modal').classList.remove('hidden'); }
function closeProfile() { document.getElementById('profile-modal').classList.add('hidden'); }

async function doChangePassword() {
    const newPass = document.getElementById('new-password').value;
    if (!newPass || newPass.length < 3) return alert("Password kependekan!");
    if (!confirm("Ganti password?")) return;

    try {
        const res = await fetch(`${BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: myId, newPassword: newPass })
        });
        const data = await res.json();
        if (res.ok) { alert("Sukses!"); closeProfile(); } 
        else { alert("Gagal: " + data.error); }
    } catch (err) { alert("Error backend"); }
}