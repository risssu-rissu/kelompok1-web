// Check authentication
const token = getToken();
const userInfo = getUserInfo();

if (!token || !userInfo) {
    window.location.href = '../index.html';
} else if (userInfo.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
}

// Display user info
document.getElementById('userInfo').textContent = `Logged in as: ${userInfo.username}`;
document.getElementById('welcomeMessage').textContent = `Welcome, ${userInfo.username}`;

let allStudents = [];
let filteredStudents = [];
let allClasses = [];
let selectedClass = null;

// Load initial data
window.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    loadClasses();
    loadStatistics();
});

// Helper for status badges
function getStatusBadgeClass(status) {
    if(!status) return 'badge-status-aktif';
    const s = status.toLowerCase();
    if (s === 'aktif') return 'badge-status-aktif';
    if (s === 'lulus') return 'badge-status-lulus';
    if (s === 'pindah') return 'badge-status-pindah';
    if (s === 'keluar') return 'badge-status-keluar';
    return 'badge-status-aktif';
}

// Show/Hide sections
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    if (section === 'dashboard') {
        document.getElementById('dashboardSection').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Dashboard User';
        activateNavLink('Dashboard');
        loadStatistics();
    } else if (section === 'allStudents') {
        document.getElementById('allStudentsSection').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Semua Data Siswa';
        activateNavLink('Semua Siswa');
        renderMasterTable();
    } else if (section === 'students') {
        document.getElementById('studentsSection').classList.add('active');
        document.getElementById('pageTitle').textContent = 'Data Kelas';
        activateNavLink('Data Kelas');
        showClassSelectionView();
        loadClassCards();
    }
}

function activateNavLink(textMatch) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.includes(textMatch)) {
            link.classList.add('active');
        }
    });
}

// Load statistics & Widgets
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            allStudents = result.data;
            const students = result.data;
            const maleCount = students.filter(s => s.jenisKelamin === 'Laki-laki').length;
            const femaleCount = students.filter(s => s.jenisKelamin === 'Perempuan').length;
            const classes = [...new Set(students.map(s => s.kelas))].length;
            
            document.getElementById('totalStudents').textContent = students.length;
            document.getElementById('maleStudents').textContent = maleCount;
            document.getElementById('femaleStudents').textContent = femaleCount;
            document.getElementById('totalClasses').textContent = classes;

            // --- Status Summary Widget ---
            let aktif=0, lulus=0, pindah=0, keluar=0;
            students.forEach(s => {
                const st = (s.statusKeaktifan || 'Aktif').toLowerCase();
                if(st === 'aktif') aktif++;
                else if(st === 'lulus') lulus++;
                else if(st === 'pindah') pindah++;
                else if(st === 'keluar') keluar++;
            });

            document.getElementById('statusSummary').innerHTML = `
                <div class="status-summary-item">
                    <div class="status-summary-label">
                        <span class="status-dot bg-aktif"></span> Aktif
                    </div>
                    <span class="status-summary-value">${aktif}</span>
                </div>
                <div class="status-summary-item">
                    <div class="status-summary-label">
                        <span class="status-dot bg-lulus"></span> Lulus
                    </div>
                    <span class="status-summary-value">${lulus}</span>
                </div>
                <div class="status-summary-item">
                    <div class="status-summary-label">
                        <span class="status-dot bg-pindah"></span> Pindah
                    </div>
                    <span class="status-summary-value">${pindah}</span>
                </div>
                <div class="status-summary-item">
                    <div class="status-summary-label">
                        <span class="status-dot bg-keluar"></span> Keluar
                    </div>
                    <span class="status-summary-value">${keluar}</span>
                </div>
            `;

            // --- Activity Feed Widget (Latest 5 Students) ---
            const recent = [...students].slice(0, 5); 
            if(recent.length > 0) {
                document.getElementById('activityFeed').innerHTML = recent.map(s => `
                    <div class="activity-item">
                        <div class="activity-icon">${s.jenisKelamin === 'Laki-laki' ? '👨' : '👩'}</div>
                        <div class="activity-details">
                            <div class="activity-name">${s.nama}</div>
                            <div class="activity-meta">${s.kelas} • NISN: ${s.nisn}</div>
                        </div>
                        <span class="badge ${getStatusBadgeClass(s.statusKeaktifan)}">${s.statusKeaktifan || 'Aktif'}</span>
                    </div>
                `).join('');
            } else {
                document.getElementById('activityFeed').innerHTML = '<div style="text-align: center; color: var(--gray-400); padding: 20px;">Belum ada data</div>';
            }
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load students from API
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            allStudents = result.data;
            filteredStudents = allStudents;
            renderMasterTable();
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

// Load classes
async function loadClasses() {
    try {
        const response = await fetch(`${API_URL}/students/classes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            allClasses = result.data;
            const filterClass = document.getElementById('filterClass');
            if(filterClass) {
                filterClass.innerHTML = '<option value="">Semua Kelas</option>' + allClasses.map(c => `<option value="${c}">${c}</option>`).join('');
            }
            if (document.getElementById('classCardsContainer')) {
                displayClassCards(allClasses);
            }
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

function loadClassCards() {
    displayClassCards(allClasses);
}


// --- MASTER STUDENTS TABLE VIEWS ---
function renderMasterTable() {
    const tbody = document.getElementById('masterStudentsTableBody');
    if(!tbody) return;

    const classF = document.getElementById('filterClass').value;
    const statusF = document.getElementById('filterStatus').value;
    const searchVal = document.getElementById('searchMasterInput').value.toLowerCase();

    let result = allStudents;
    
    if(classF) result = result.filter(s => s.kelas === classF);
    if(statusF) result = result.filter(s => (s.statusKeaktifan || 'Aktif') === statusF);
    if(searchVal) {
        result = result.filter(s => s.nama.toLowerCase().includes(searchVal) || s.nisn.toLowerCase().includes(searchVal));
    }

    if (result.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--gray-400);">Tidak ada data yang cocok dengan pencarian / filter</td></tr>';
        return;
    }

    tbody.innerHTML = result.map(student => `
        <tr>
            <td><strong>${student.nisn}</strong></td>
            <td>${student.nama}</td>
            <td><span class="badge badge-primary">${student.kelas}</span></td>
            <td>${student.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</td>
            <td><span class="badge ${getStatusBadgeClass(student.statusKeaktifan)}">${student.statusKeaktifan || 'Aktif'}</span></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewStudent('${student._id}')">Lihat Detail</button>
            </td>
        </tr>
    `).join('');
}

// --- CLASS SPECIFIC VIEWS ---
function displayStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    if(!tbody) return;
    
    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--gray-400);">Belum ada siswa di kelas ini</td></tr>';
        return;
    }
    
    // Sort by noAbsen
    const sortedStudents = [...students].sort((a, b) => a.noAbsen - b.noAbsen);
    
    tbody.innerHTML = sortedStudents.map(student => `
        <tr>
            <td><strong>${student.noAbsen}</strong></td>
            <td>${student.nisn}</td>
            <td>${student.nama}</td>
            <td>${student.jenisKelamin}</td>
            <td><span class="badge ${getStatusBadgeClass(student.statusKeaktifan)}">${student.statusKeaktifan || 'Aktif'}</span></td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewStudent('${student._id}')">Lihat Detail</button>
            </td>
        </tr>
    `).join('');
}

// Search students in Class View
function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let filtered = allStudents.filter(student => student.kelas === selectedClass);
    
    if (searchTerm) {
        filtered = filtered.filter(student => 
            student.nama.toLowerCase().includes(searchTerm) ||
            student.nisn.toLowerCase().includes(searchTerm)
        );
    }
    filteredStudents = filtered;
    displayStudents(filteredStudents);
}

// Display class cards
function displayClassCards(classes) {
    const container = document.getElementById('classCardsContainer');
    
    if (classes.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--gray-400);">Data kelas belum tersedia.</p>';
        return;
    }
    
    container.innerHTML = classes.map(kelas => {
        const studentCount = allStudents.filter(s => s.kelas === kelas).length;
        const maleCount = allStudents.filter(s => s.kelas === kelas && s.jenisKelamin === 'Laki-laki').length;
        const femaleCount = allStudents.filter(s => s.kelas === kelas && s.jenisKelamin === 'Perempuan').length;
        
        return `
            <div class="class-card" onclick="selectClass('${kelas}')">
                <div class="class-card-header">
                    <h3>${kelas}</h3>
                </div>
                <div class="class-card-body">
                    <div class="class-stat">
                        <span class="class-stat-icon">👥</span>
                        <span class="class-stat-label">Total Siswa</span>
                        <span class="class-stat-value">${studentCount}</span>
                    </div>
                    <div class="class-stats-row">
                        <div class="class-stat-small">
                            <span>👨 Laki-laki</span>
                            <strong>${maleCount}</strong>
                        </div>
                        <div class="class-stat-small">
                            <span>👩 Perempuan</span>
                            <strong>${femaleCount}</strong>
                        </div>
                    </div>
                </div>
                <div class="class-card-footer">
                    <span>Lihat detail siswa kelas ini →</span>
                </div>
            </div>
        `;
    }).join('');
}

function searchClasses() {
    const searchTerm = document.getElementById('classSearchInput').value.toLowerCase();
    const filtered = allClasses.filter(kelas => 
        kelas.toLowerCase().includes(searchTerm)
    );
    displayClassCards(filtered);
}

function selectClass(kelas) {
    selectedClass = kelas;
    document.getElementById('selectedClassName').textContent = `Data Siswa - ${kelas}`;
    const classStudents = allStudents.filter(s => s.kelas === kelas);
    filteredStudents = classStudents;
    
    showStudentListView();
    displayStudents(filteredStudents);
}

function backToClassSelection() {
    showClassSelectionView();
    if(document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
}

function showClassSelectionView() {
    document.getElementById('classSelectionView').style.display = 'block';
    document.getElementById('studentListView').style.display = 'none';
    selectedClass = null;
}

function showStudentListView() {
    document.getElementById('classSelectionView').style.display = 'none';
    document.getElementById('studentListView').style.display = 'block';
}

// Modals
function viewStudent(id) {
    const student = allStudents.find(s => s._id === id);
    if (!student) return;
    
    const detailContent = document.getElementById('studentDetailContent');
    const badgeHtml = `<span class="badge ${getStatusBadgeClass(student.statusKeaktifan)}">${student.statusKeaktifan || 'Aktif'}</span>`;

    detailContent.innerHTML = `
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--gray-100);">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background:var(--blue-100); width: 50px; height: 50px; display:flex; align-items:center; justify-content:center; border-radius: 50%; font-size: 24px;">
                    ${student.jenisKelamin === 'Laki-laki' ? '👨' : '👩'}
                </div>
                <div>
                    <h3 style="margin:0; font-size: 18px;">${student.nama}</h3>
                    <p style="margin:0; font-size: 13px; color: var(--gray-500);">${student.nisn}</p>
                </div>
            </div>
            <div>${badgeHtml}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">No. Absen & Kelas</div>
            <div class="detail-value"><strong>${student.noAbsen}</strong> • ${student.kelas}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Jenis Kelamin</div>
            <div class="detail-value">${student.jenisKelamin}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Tanggal Lahir</div>
            <div class="detail-value">${formatDate(student.tanggalLahir)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Alamat</div>
            <div class="detail-value">${student.alamat}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Kontak</div>
            <div class="detail-value">${student.noTelepon} ${student.email ? `• ${student.email}` : ''}</div>
        </div>
    `;
    
    document.getElementById('detailModal').classList.add('show');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
}

// Logout
function logout() {
    Swal.fire({
        title: 'Konfirmasi Keluar',
        text: 'Apakah Anda yakin ingin logout?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '../index.html';
        }
    });
}

// Export Excel
function exportExcel() {
    const classF = document.getElementById('filterClass').value;
    const statusF = document.getElementById('filterStatus').value;
    const searchVal = document.getElementById('searchMasterInput').value.toLowerCase();
    
    let result = allStudents;
    if(classF) result = result.filter(s => s.kelas === classF);
    if(statusF) result = result.filter(s => (s.statusKeaktifan || 'Aktif') === statusF);
    if(searchVal) {
        result = result.filter(s => s.nama.toLowerCase().includes(searchVal) || s.nisn.toLowerCase().includes(searchVal));
    }

    if(result.length === 0){
        Swal.fire('Info', 'Tidak ada data untuk dieksport', 'info');
        return;
    }
    
    const exportData = result.map(s => ({
        'NISN': s.nisn,
        'Nama Lengkap': s.nama,
        'Jenis Kelamin': s.jenisKelamin,
        'Kelas': s.kelas,
        'Tanggal Lahir': formatDate(s.tanggalLahir),
        'No Telepon': s.noTelepon,
        'Alamat': s.alamat,
        'Email': s.email || '-',
        'Status Keaktifan': s.statusKeaktifan || 'Aktif'
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, "Sistem_Informasi_Siswa.xlsx");
}

function exportClassExcel() {
    const classStudents = allStudents.filter(s => s.kelas === selectedClass);
    if(classStudents.length === 0) return;

    const exportData = classStudents.map(s => ({
        'No. Absen': s.noAbsen,
        'NISN': s.nisn,
        'Nama Lengkap': s.nama,
        'Jenis Kelamin': s.jenisKelamin,
        'No Telepon': s.noTelepon,
        'Alamat': s.alamat,
        'Status': s.statusKeaktifan || 'Aktif'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Kelas ${selectedClass}`);
    XLSX.writeFile(wb, `Data_Siswa_Kelas_${selectedClass}.xlsx`);
}
