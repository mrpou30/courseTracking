// Sound Effects
const loginSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3");
const saveSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3");
let soundEnabled = true;
let currentMonth = new Date();

// ========================
// LOGIN
// ========================
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  if (username === "admin" && password === "123") {
    document.getElementById('login-container').classList.add('hidden');
    const app = document.getElementById('app');
    app.classList.remove('hidden');
    setTimeout(() => app.classList.add('animated-container'), 100);

    requestNotificationPermission();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderCalendar();
    updateProgress();

    if (soundEnabled) loginSound.play();
  } else {
    errorEl.textContent = "Username atau password salah!";
  }
}

// ========================
// NOTIFIKASI
// ========================
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Browser ini tidak mendukung notifikasi.");
    return;
  }

  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

function scheduleRepeatingNotification(materi, startDate, isRepeating) {
  const start = new Date(startDate);
  const now = new Date();

  if (start <= now && !isRepeating) {
    showNotification(materi, "Waktunya belajar sekarang! 🎯");
    return;
  }

  if (isRepeating) {
    // Simpan ke localStorage untuk di-check tiap hari
    let repeating = JSON.parse(localStorage.getItem('repeatingReminders')) || [];
    repeating.push({
      id: Date.now(),
      materi,
      startDate: start.toISOString(),
      isActive: true
    });
    localStorage.setItem('repeatingReminders', JSON.stringify(repeating));

    // Cek tiap hari
    checkDailyReminders();
  } else {
    const timeDiff = start.getTime() - now.getTime();
    if (timeDiff > 0) {
      setTimeout(() => {
        showNotification(materi, "Jangan lupa catat progressmu! 📝");
      }, timeDiff);
    }
  }
}

function checkDailyReminders() {
  // Cek setiap jam 9 pagi
  const now = new Date();
  const nextCheck = new Date();
  nextCheck.setHours(9, 0, 0, 0);
  if (now > nextCheck) {
    nextCheck.setDate(nextCheck.getDate() + 1);
  }

  const timeToNextCheck = nextCheck.getTime() - now.getTime();
  setTimeout(() => {
    triggerDailyReminders();
    // Set ulang untuk besok
    setTimeout(checkDailyReminders, 24 * 60 * 60 * 1000);
  }, timeToNextCheck);
}

function triggerDailyReminders() {
  let repeating = JSON.parse(localStorage.getItem('repeatingReminders')) || [];
  const today = new Date();
  const activeReminders = repeating.filter(r => {
    const startDate = new Date(r.startDate);
    return r.isActive && startDate <= today;
  });

  activeReminders.forEach(r => {
    showNotification(r.materi, "Hari ini jangan lupa belajar! 🔁");
  });
}

function showNotification(materi, body) {
  if (Notification.permission === "granted") {
    new Notification("📚 Course Reminder", {
      body: `Halo! Saatnya belajar: ${materi}\n${body}`,
      icon: "https://cdn-icons-png.flaticon.com/512/2965/2965331.png"
    });
  }
}

// ========================
// DARK MODE & SOUND
// ========================
function toggleDarkMode() {
  const body = document.body;
  const toggleBtn = document.getElementById('darkModeToggle');
  let currentTheme = body.getAttribute('data-theme') || 'light';
  let newTheme = currentTheme === 'light' ? 'dark' : 'light';

  body.setAttribute('data-theme', newTheme);
  toggleBtn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', newTheme);

  if (soundEnabled) loginSound.play();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const toggleBtn = document.getElementById('soundToggle');
  toggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
}

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.getElementById('darkModeToggle').textContent = '☀️';
  }
  checkDailyReminders();
});

// ========================
// UTILITIES
// ========================
function updateDateTime() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('id-ID', options);
  const timeStr = now.toLocaleTimeString('id-ID');
  document.getElementById('datetime').textContent = `${dateStr} | ${timeStr}`;
}

function formatTanggal(tglString) {
  if (!tglString) return "-";
  const tgl = new Date(tglString);
  return tgl.toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ========================
// PROGRESS BAR
// ========================
function updateProgress() {
  const data = JSON.parse(localStorage.getItem('courseData')) || [];
  if (data.length === 0) {
    document.getElementById('progress-fill').style.width = '0%';
    document.getElementById('progress-text').textContent = '0% - Belum ada target';
    return;
  }

  // Asumsi: progress dihitung dari jumlah materi yang sudah dipelajari
  const totalMateri = data.length;
  const progressPercent = Math.min(100, (totalMateri / 20) * 100); // Misal target 20 materi

  document.getElementById('progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('progress-text').textContent = `${Math.round(progressPercent)}% - ${totalMateri} materi selesai`;
}

// ========================
// KALENDER
// ========================
function renderCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const calendarTitle = document.getElementById('calendar-title');
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  calendarTitle.textContent = `${new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

  calendarGrid.innerHTML = '';

  // Header hari
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  days.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day calendar-day-header';
    dayElement.textContent = day;
    calendarGrid.appendChild(dayElement);
  });

  // Dapatkan data belajar
  const data = JSON.parse(localStorage.getItem('courseData')) || [];
  const learnedDates = data.map(d => d.tanggal);
  const nextDates = data.map(d => d.tanggalSelanjutnya);

  // Dapatkan hari pertama dan jumlah hari
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Isi sel kosong di awal
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day';
    calendarGrid.appendChild(emptyDay);
  }

  // Isi hari dalam bulan
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;

    const dateStr = new Date(year, month, day).toISOString().split('T')[0];

    // Cek apakah hari ini
    if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
      dayElement.classList.add('today');
    }

    // Cek apakah sudah dipelajari
    if (learnedDates.includes(dateStr)) {
      dayElement.classList.add('learned');
      dayElement.title = "Sudah dipelajari";
    }

    // Cek apakah jadwal next
    if (nextDates.includes(dateStr)) {
      dayElement.classList.add('next-learn');
      dayElement.title = "Jadwal belajar selanjutnya";
    }

    calendarGrid.appendChild(dayElement);
  }
}

function prevMonth() {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
}

// ========================
// SIMPAN DATA
// ========================
function simpanData() {
  const tanggal = document.getElementById('tanggal').value;
  const namaMateri = document.getElementById('namaMateri').value;
  const catatan = document.getElementById('catatan').value;
  const materiSelanjutnya = document.getElementById('materiSelanjutnya').value;
  const tanggalSelanjutnya = document.getElementById('tanggalSelanjutnya').value;
  const repeatReminder = document.getElementById('repeatReminder').checked;

  if (!tanggal || !namaMateri || !materiSelanjutnya || !tanggalSelanjutnya) {
    alert("Semua field wajib diisi!");
    return;
  }

  const newData = {
    id: Date.now(),
    tanggal,
    namaMateri,
    catatan,
    materiSelanjutnya,
    tanggalSelanjutnya,
    savedAt: new Date().toISOString()
  };

  let data = JSON.parse(localStorage.getItem('courseData')) || [];
  data.push(newData);
  localStorage.setItem('courseData', JSON.stringify(data));

  // Reset form
  document.getElementById('tanggal').value = '';
  document.getElementById('namaMateri').value = '';
  document.getElementById('catatan').value = '';
  document.getElementById('materiSelanjutnya').value = '';
  document.getElementById('tanggalSelanjutnya').value = '';

  // Jadwalkan notifikasi
  scheduleRepeatingNotification(materiSelanjutnya, tanggalSelanjutnya, repeatReminder);

  // Update UI
  if (soundEnabled) saveSound.play();
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#a8e6cf', '#ffd3b6', '#a8d0ff', '#d0f0c0']
  });

  updateProgress();
  renderCalendar();
  lihatData();

  alert(`Data disimpan!\n${repeatReminder ? 'Notifikasi berulang diaktifkan' : 'Notifikasi sekali dijadwalkan'} untuk: ${formatTanggal(tanggalSelanjutnya)}`);
}

// ========================
// LIHAT, EDIT, HAPUS, EXPORT
// ========================
function lihatData() {
  const container = document.getElementById('saved-data-container');
  const listEl = document.getElementById('saved-list');
  container.classList.remove('hidden');

  const data = JSON.parse(localStorage.getItem('courseData')) || [];

  if (data.length === 0) {
    listEl.innerHTML = "<p>Belum ada data tersimpan.</p>";
    return;
  }

  data.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

  let html = "";
  data.forEach((item, index) => {
    const isLast = index === 0;
    html += `
      <div class="saved-item">
        <h4>📅 ${formatTanggal(item.tanggal)}</h4>
        <p><strong>Nama Materi:</strong> 
          <span class="${isLast ? 'highlight-materi' : ''}">${item.namaMateri}</span>
        </p>
        <p><strong>Catatan:</strong> ${item.catatan || '-'}</p>
        <p><strong>Materi Selanjutnya:</strong> 
          <span class="${isLast ? 'highlight-next' : ''}">${item.materiSelanjutnya}</span>
        </p>
        <p><strong>Tanggal Lanjut:</strong> ${formatTanggal(item.tanggalSelanjutnya)}</p>
        <p><small>Disimpan: ${new Date(item.savedAt).toLocaleString('id-ID')}</small></p>
        <div class="action-buttons">
          <button onclick="exportPDFSingle(${item.id})" class="btn-edit btn-export-small">📄 PDF</button>
          <button onclick="editData(${item.id})" class="btn-edit">✏️ Edit</button>
          <button onclick="hapusData(${item.id})" class="btn-delete">🗑️ Hapus</button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

function exportPDFSingle(id) {
  const { jsPDF } = window.jspdf;
  const data = JSON.parse(localStorage.getItem('courseData')) || [];
  const item = data.find(d => d.id === id);

  if (!item) {
    alert("Data tidak ditemukan!");
    return;
  }

  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.text("Course Tracking - Single Entry", 14, y);
  y += 15;

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, y);
  y += 15;

  doc.setFontSize(14);
  doc.text(`📌 Entry Detail`, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Tanggal: ${formatTanggal(item.tanggal)}`, 14, y); y += 6;
  doc.text(`Materi: ${item.namaMateri}`, 14, y); y += 6;
  doc.text(`Catatan: ${item.catatan || '-'}`, 14, y); y += 6;
  doc.text(`Next: ${item.materiSelanjutnya} (${formatTanggal(item.tanggalSelanjutnya)})`, 14, y); y += 6;
  doc.text(`Disimpan: ${new Date(item.savedAt).toLocaleString('id-ID')}`, 14, y); y += 10;

  doc.save(`course-entry-${id}.pdf`);
}

function editData(id) {
  const data = JSON.parse(localStorage.getItem('courseData')) || [];
  const item = data.find(d => d.id === id);

  if (!item) return;

  document.getElementById('tanggal').value = item.tanggal;
  document.getElementById('namaMateri').value = item.namaMateri;
  document.getElementById('catatan').value = item.catatan;
  document.getElementById('materiSelanjutnya').value = item.materiSelanjutnya;
  document.getElementById('tanggalSelanjutnya').value = item.tanggalSelanjutnya;

  const newData = data.filter(d => d.id !== id);
  localStorage.setItem('courseData', JSON.stringify(newData));

  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('namaMateri').focus();

  alert("Data dimuat ke form. Silakan edit lalu klik Simpan.");
}

function hapusData(id) {
  if (!confirm("Yakin ingin menghapus data ini?")) return;

  let data = JSON.parse(localStorage.getItem('courseData')) || [];
  data = data.filter(d => d.id !== id);
  localStorage.setItem('courseData', JSON.stringify(data));

  updateProgress();
  renderCalendar();
  lihatData();
  alert("Data berhasil dihapus!");
}