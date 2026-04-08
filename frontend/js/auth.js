// API URL
const API_URL = 'http://localhost:3000/api';

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Simpan token dan user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));
                
                // Redirect berdasarkan role
                if (data.user.role === 'admin') {
                    window.location.href = 'pages/admin-dashboard.html';
                } else {
                    window.location.href = 'pages/user-dashboard.html';
                }
            } else {
                errorMessage.textContent = data.message || 'Login gagal';
                errorMessage.classList.add('show');
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Terjadi kesalahan. Pastikan server backend berjalan.';
            errorMessage.classList.add('show');
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        
        if (password.length < 6) {
            errorMessage.textContent = 'Password minimal 6 karakter';
            errorMessage.classList.add('show');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, role: 'user' })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                Swal.fire({
                    title: 'Sukses',
                    text: 'Registrasi berhasil! Silakan login.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#0a4275'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            } else {
                errorMessage.textContent = data.message || 'Registrasi gagal';
                errorMessage.classList.add('show');
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Terjadi kesalahan. Pastikan server backend berjalan.';
            errorMessage.classList.add('show');
        }
    });
}

// Check if already logged in
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
        const user = JSON.parse(userInfo);
        // Redirect jika sudah login
        if (window.location.pathname.endsWith('index.html') || 
            window.location.pathname.endsWith('register.html') || 
            window.location.pathname === '/') {
            if (user.role === 'admin') {
                window.location.href = 'pages/admin-dashboard.html';
            } else {
                window.location.href = 'pages/user-dashboard.html';
            }
        }
    }
};

// Check auth saat page load (hanya di halaman login/register)
if (window.location.pathname.endsWith('index.html') || 
    window.location.pathname.endsWith('register.html') ||
    window.location.pathname === '/') {
    checkAuth();
}
