// Configuration
const OFFICE_LOCATION = {
  lat: 13.7563, 
  lng: 100.5018,
  radius: 50 
};

const WORK_HOURS = {
  start: '08:30',
  end: '16:30',
  totalMinutes: 480 // 8 hours
};

const PENALTY_RATE = 50; // บาทต่อนาทีที่มาสาย

const VALID_QR_CODE = 'OFFICE_CHECKIN_2024'; // QR Code ที่ถูกต้อง

// State
let isWorking = false;
let records = [];
let workStartTime = null;
let dayType = 'normal';
let currentEmployee = null;
let currentLocation = null;
let otRequests = [];

// DOM Elements
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const clockInBtn = document.getElementById('clockInBtn');
const clockOutBtn = document.getElementById('clockOutBtn');
const workingStatus = document.getElementById('workingStatus');
const workDuration = document.getElementById('workDuration');
const lastClockIn = document.getElementById('lastClockIn');
const lastClockOut = document.getElementById('lastClockOut');
const totalWorkTime = document.getElementById('totalWorkTime');
const lateStatus = document.getElementById('lateStatus');
const workTimeNote = document.getElementById('workTimeNote');
const penaltyCard = document.getElementById('penaltyCard');
const penaltyAmount = document.getElementById('penaltyAmount');
const penaltyReason = document.getElementById('penaltyReason');
const todayHistory = document.getElementById('todayHistory');
const dayTypeBadge = document.getElementById('dayTypeBadge');
const locationCard = document.getElementById('locationCard');
const locationStatus = document.getElementById('locationStatus');
const refreshLocationBtn = document.getElementById('refreshLocationBtn');
const toast = document.getElementById('toast');
const quickEmployeeName = document.getElementById('quickEmployeeName');
const quickEmployeeId = document.getElementById('quickEmployeeId');
const changeEmployeeBtn = document.getElementById('changeEmployeeBtn');
const employeeModal = document.getElementById('employeeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const employeeForm = document.getElementById('employeeForm');
const employeeNameInput = document.getElementById('employeeName');
const employeeIdInput = document.getElementById('employeeId');
const manualTimeBtn = document.getElementById('manualTimeBtn');
const manualTimeModal = document.getElementById('manualTimeModal');
const closeManualTimeBtn = document.getElementById('closeManualTimeBtn');
const cancelManualTimeBtn = document.getElementById('cancelManualTimeBtn');
const manualTimeForm = document.getElementById('manualTimeForm');
const scanQrBtn = document.getElementById('scanQrBtn');
const qrScannerModal = document.getElementById('qrScannerModal');
const closeQrScannerBtn = document.getElementById('closeQrScannerBtn');
const qrVideo = document.getElementById('qrVideo');
const historyDate = document.getElementById('historyDate');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const historicalRecords = document.getElementById('historicalRecords');
const workDaysCount = document.getElementById('workDaysCount');
const specialDaysCount = document.getElementById('specialDaysCount');
const totalOTHours = document.getElementById('totalOTHours');
const otRequestForm = document.getElementById('otRequestForm');
const otRequestsList = document.getElementById('otRequestsList');
const leaveForm = document.getElementById('leaveForm');

// Initialize
function init() {
  loadFromStorage();
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
  updateUI();
  updateMonthlySummary();
  requestNotificationPermission();
  checkLocation();
  
  historyDate.value = new Date().toISOString().split('T')[0];
  document.getElementById('otDate').value = new Date().toISOString().split('T')[0];
  
  if (!currentEmployee) {
    showEmployeeModal();
  }
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// Show notification
function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
    });
    
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe47OihUBELTKXh8LJnHgU3k9nyyXkpBSh+zPLaizsKGGS46+mjTxELTqvm8bZpIAU4ldryyXgpBSh9y/HaizsKGGO36+mjUBEKTqzm8LRnHgU2lNryyXgoBSh8yvDaizsKF2O36umkUBEKTqzl77RoHwU1ltnxy3goBSh7yfDajDsJF2K16umkUREKTavl7rJoIAU0ldjwy3goBSh7yfDajTwJFmG06umkUhEJTKrl7rJpIQUzldLxy3goBCh6yO/ZjT0JFl+06+mjUxEJTKrl7bBpIgUylNHxy3goBCh5yO/ZjT0JFl606+mjUxEJS6rm7bFoIgUxlNDxzHkoBCh5x+/Zjj4JFVy06+mjVBEJTKvm7bFnIgUwlNDxzHkoCiZ5xu/Zjz4JFVu06+mjVREJTKnn7bFnIwUvlM/xy3koCiV5xu/Zjz8JFVq06+mjVREJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIwUtlM/xy3koCiV5xu/Zjz8JFVm06+mjVhEJS6jm7LFnIw==');
    audio.play().catch(() => {});

    setTimeout(() => notification.close(), 5000);
  }
}

// Check GPS Location
function checkLocation() {
  if (!navigator.geolocation) {
    locationStatus.innerHTML = '<div class="location-error">⚠️ เบราว์เซอร์ไม่รองรับ GPS</div>';
    return;
  }

  locationStatus.innerHTML = '<div class="location-checking">🔍 กำลังตรวจสอบ GPS...</div>';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        OFFICE_LOCATION.lat,
        OFFICE_LOCATION.lng
      );

      if (distance <= OFFICE_LOCATION.radius) {
        locationStatus.innerHTML = `
          <div class="location-verified">
            ✅ <strong>อยู่ในพื้นที่ทำงาน</strong><br>
            <small>ระยะห่าง: ${Math.round(distance)} เมตร</small>
          </div>
        `;
      } else {
        locationStatus.innerHTML = `
          <div class="location-outside">
            ❌ <strong>อยู่นอกพื้นที่ทำงาน</strong><br>
            <small>ระยะห่าง: ${Math.round(distance)} เมตร (เกิน ${OFFICE_LOCATION.radius}m)</small>
          </div>
        `;
      }
    },
    (error) => {
      locationStatus.innerHTML = '<div class="location-error">❌ ไม่สามารถเข้าถึง GPS ได้<br><small>กรุณาเปิดใช้งาน Location</small></div>';
      console.error('GPS error:', error);
    }
  );
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if location is valid
function isLocationValid() {
  if (!currentLocation) return false;
  
  const distance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    OFFICE_LOCATION.lat,
    OFFICE_LOCATION.lng
  );
  
  return distance <= OFFICE_LOCATION.radius;
}

// Calculate late penalty
function calculateLatePenalty(clockInTime) {
  const [hours, minutes] = WORK_HOURS.start.split(':').map(Number);
  const standardStart = hours * 60 + minutes; // minutes since midnight
  
  const clockInDate = new Date(clockInTime);
  const clockInMinutes = clockInDate.getHours() * 60 + clockInDate.getMinutes();
  
  if (clockInMinutes > standardStart) {
    const lateMinutes = clockInMinutes - standardStart;
    return {
      minutes: lateMinutes,
      amount: lateMinutes * PENALTY_RATE
    };
  }
  
  return { minutes: 0, amount: 0 };
}

// Calculate work hours vs standard
function calculateWorkHours(clockInTime, clockOutTime) {
  if (!clockInTime || !clockOutTime) return { actual: 0, standard: WORK_HOURS.totalMinutes };
  
  const duration = clockOutTime - clockInTime;
  const actualMinutes = Math.floor(duration / 60000);
  
  return {
    actual: actualMinutes,
    standard: WORK_HOURS.totalMinutes
  };
}

// Load from localStorage
function loadFromStorage() {
  const savedRecords = localStorage.getItem('attendance_records_pro');
  const savedIsWorking = localStorage.getItem('is_working_pro');
  const savedWorkStartTime = localStorage.getItem('work_start_time_pro');
  const savedDayType = localStorage.getItem('day_type_pro');
  const savedEmployee = localStorage.getItem('current_employee_pro');
  const savedOTRequests = localStorage.getItem('ot_requests');

  if (savedRecords) records = JSON.parse(savedRecords);
  if (savedIsWorking === 'true' && savedWorkStartTime) {
    isWorking = true;
    workStartTime = Number(savedWorkStartTime);
  }
  if (savedDayType) dayType = savedDayType;
  if (savedEmployee) {
    currentEmployee = JSON.parse(savedEmployee);
    updateEmployeeDisplay();
  }
  if (savedOTRequests) {
    otRequests = JSON.parse(savedOTRequests);
    renderOTRequests();
  }
}

// Update employee display
function updateEmployeeDisplay() {
  if (currentEmployee) {
    quickEmployeeName.textContent = currentEmployee.name;
    quickEmployeeId.textContent = currentEmployee.id;
  } else {
    quickEmployeeName.textContent = '-';
    quickEmployeeId.textContent = '-';
  }
}

// Show/Hide modals
function showEmployeeModal() {
  employeeModal.classList.add('show');
  employeeNameInput.focus();
}

function hideEmployeeModal() {
  employeeModal.classList.remove('show');
}

function showManualTimeModal() {
  manualTimeModal.classList.add('show');
}

function hideManualTimeModal() {
  manualTimeModal.classList.remove('show');
}

function showQrScannerModal() {
  qrScannerModal.classList.add('show');
  startQRScanner();
}

function hideQrScannerModal() {
  qrScannerModal.classList.remove('show');
  stopQRScanner();
}

// QR Code Scanner (Simulated - would need jsQR library for real implementation)
let qrStream = null;

function startQRScanner() {
  // Simulated QR scanner - in production, use jsQR library
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      qrStream = stream;
      qrVideo.srcObject = stream;
      qrVideo.play();
      
      showToast('📷 กล้องเปิดแล้ว', 'โปรดสแกน QR Code ให้อยู่ในกรอบ');
      
      // Simulate QR code detection after 3 seconds
      setTimeout(() => {
        if (qrScannerModal.classList.contains('show')) {
          handleQRCodeScanned(VALID_QR_CODE);
        }
      }, 3000);
    })
    .catch(err => {
      showToast('❌ ข้อผิดพลาด', 'ไม่สามารถเปิดกล้องได้');
      hideQrScannerModal();
    });
}

function stopQRScanner() {
  if (qrStream) {
    qrStream.getTracks().forEach(track => track.stop());
    qrStream = null;
  }
}

function handleQRCodeScanned(code) {
  stopQRScanner();
  hideQrScannerModal();
  
  if (code === VALID_QR_CODE) {
    showToast('✅ QR Code ถูกต้อง', 'ยืนยันตำแหน่งสำเร็จ');
    handleClockIn(false, true);
  } else {
    showToast('❌ QR Code ไม่ถูกต้อง', 'กรุณาสแกน QR Code ที่ถูกต้อง');
  }
}

// Update current time
function updateCurrentTime() {
  const now = new Date();
  
  currentTimeEl.textContent = now.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  currentDateEl.textContent = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  if (isWorking && workStartTime) {
    const duration = Date.now() - workStartTime;
    workDuration.textContent = formatDuration(duration);
  }
}

// Format duration
function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Check if employee is set
function checkEmployee() {
  if (!currentEmployee) {
    showToast('⚠️ กรุณาระบุข้อมูลพนักงาน', 'กรุณากรอกชื่อและรหัสพนักงานก่อนลงเวลา');
    showEmployeeModal();
    return false;
  }
  return true;
}

// Clock In
function handleClockIn(isManual = false, qrVerified = false) {
  if (!checkEmployee()) return;

  // Check location unless QR verified
  if (!qrVerified && !isLocationValid()) {
    showToast('❌ อยู่นอกพื้นที่ทำงาน', 'กรุณาอยู่ในพื้นที่ทำงานหรือสแกน QR Code');
    return;
  }

  const now = Date.now();
  const penalty = calculateLatePenalty(now);
  
  const record = {
    id: now.toString(),
    type: 'in',
    time: new Date(now).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: new Date(now).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    timestamp: now,
    dayType,
    employee: {
      name: currentEmployee.name,
      id: currentEmployee.id
    },
    location: currentLocation,
    qrVerified,
    penalty: penalty.amount > 0 ? penalty : null
  };

  records.unshift(record);
  isWorking = true;
  workStartTime = now;
  
  localStorage.setItem('is_working_pro', 'true');
  localStorage.setItem('work_start_time_pro', now.toString());
  localStorage.setItem('attendance_records_pro', JSON.stringify(records));

  if ('vibrate' in navigator) {
    navigator.vibrate(200);
  }

  let message = `${currentEmployee.name} - เวลา ${record.time}${dayType === 'special' ? ' (วันพิเศษ)' : ''}`;
  if (penalty.amount > 0) {
    message += `\n⚠️ มาสาย ${penalty.minutes} นาที (หัก ${penalty.amount} บาท)`;
  }

  showNotification('✅ ลงเวลาเข้างานสำเร็จ', message);
  showToast('✅ ลงเวลาเข้างานสำเร็จ', message);

  updateUI();
  updateMonthlySummary();
}

// Clock Out
function handleClockOut() {
  if (!checkEmployee()) return;

  const now = Date.now();
  const record = {
    id: now.toString(),
    type: 'out',
    time: new Date(now).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: new Date(now).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    timestamp: now,
    dayType,
    employee: {
      name: currentEmployee.name,
      id: currentEmployee.id
    },
    location: currentLocation
  };

  records.unshift(record);
  isWorking = false;
  workStartTime = null;
  
  localStorage.setItem('is_working_pro', 'false');
  localStorage.removeItem('work_start_time_pro');
  localStorage.setItem('attendance_records_pro', JSON.stringify(records));

  if ('vibrate' in navigator) {
    navigator.vibrate(200);
  }

  showToast(
    '👋 ลงเวลาออกงานสำเร็จ',
    `${currentEmployee.name} - เวลา ${record.time}`
  );

  updateUI();
  updateMonthlySummary();
}

// Manual time entry
function handleManualTime(clockInTime, clockOutTime) {
  if (!checkEmployee()) return;

  const today = new Date().toISOString().split('T')[0];
  
  // Clock In
  const inTimestamp = new Date(`${today}T${clockInTime}`).getTime();
  const penalty = calculateLatePenalty(inTimestamp);
  
  const inRecord = {
    id: inTimestamp.toString(),
    type: 'in',
    time: clockInTime,
    date: new Date(inTimestamp).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    timestamp: inTimestamp,
    dayType,
    employee: {
      name: currentEmployee.name,
      id: currentEmployee.id
    },
    manual: true,
    penalty: penalty.amount > 0 ? penalty : null
  };
  
  records.unshift(inRecord);

  // Clock Out (if provided)
  if (clockOutTime) {
    const outTimestamp = new Date(`${today}T${clockOutTime}`).getTime();
    const outRecord = {
      id: outTimestamp.toString(),
      type: 'out',
      time: clockOutTime,
      date: new Date(outTimestamp).toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      timestamp: outTimestamp,
      dayType,
      employee: {
        name: currentEmployee.name,
        id: currentEmployee.id
      },
      manual: true
    };
    
    records.unshift(outRecord);
  }

  localStorage.setItem('attendance_records_pro', JSON.stringify(records));
  
  showToast('✅ บันทึกเวลาสำเร็จ', 'บันทึกเวลาเข้า-ออกงานแล้ว');
  updateUI();
  updateMonthlySummary();
}

// Calculate total time
function calculateTotalTime() {
  const today = new Date().toLocaleDateString('th-TH');
  const filtered = records.filter(r => 
    new Date(r.timestamp).toLocaleDateString('th-TH') === today
  );
  
  const sorted = [...filtered].sort((a, b) => a.timestamp - b.timestamp);
  let totalMinutes = 0;
  
  for (let i = 0; i < sorted.length - 1; i += 2) {
    if (sorted[i].type === 'in' && sorted[i + 1]?.type === 'out') {
      const duration = sorted[i + 1].timestamp - sorted[i].timestamp;
      totalMinutes += duration / 60000;
    }
  }

  if (isWorking && workStartTime) {
    totalMinutes += (Date.now() - workStartTime) / 60000;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  return { hours, minutes, totalMinutes };
}

// Get today's penalty
function getTodayPenalty() {
  const today = new Date().toLocaleDateString('th-TH');
  const todayRecords = records.filter(r => 
    new Date(r.timestamp).toLocaleDateString('th-TH') === today &&
    r.type === 'in' &&
    r.penalty
  );
  
  if (todayRecords.length === 0) return null;
  
  const totalPenalty = todayRecords.reduce((sum, r) => sum + r.penalty.amount, 0);
  const totalMinutes = todayRecords.reduce((sum, r) => sum + r.penalty.minutes, 0);
  
  return { amount: totalPenalty, minutes: totalMinutes };
}

// Update monthly summary
function updateMonthlySummary() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthRecords = records.filter(r => {
    const recordDate = new Date(r.timestamp);
    return recordDate.getMonth() === currentMonth && 
           recordDate.getFullYear() === currentYear;
  });

  const workDays = new Set();
  const specialDays = new Set();

  monthRecords.forEach(record => {
    if (record.type === 'in') {
      const dateKey = new Date(record.timestamp).toLocaleDateString('th-TH');
      workDays.add(dateKey);
      if (record.dayType === 'special') {
        specialDays.add(dateKey);
      }
    }
  });

  workDaysCount.textContent = `${workDays.size} วัน`;
  specialDaysCount.textContent = `${specialDays.size} วัน`;
  
  // Calculate OT from approved requests
  const approvedOT = otRequests.filter(req => req.status === 'approved');
  const totalOT = approvedOT.reduce((sum, req) => {
    const start = new Date(`2000-01-01T${req.startTime}`);
    const end = new Date(`2000-01-01T${req.endTime}`);
    return sum + (end - start) / 3600000;
  }, 0);
  
  totalOTHours.textContent = `${Math.floor(totalOT)} ชม.`;
}

// Update UI
function updateUI() {
  clockInBtn.disabled = isWorking;
  clockOutBtn.disabled = !isWorking;

  workingStatus.style.display = isWorking ? 'block' : 'none';

  const today = new Date().toLocaleDateString('th-TH');
  const todayRecords = records.filter(r => 
    new Date(r.timestamp).toLocaleDateString('th-TH') === today
  );

  const lastIn = todayRecords.find(r => r.type === 'in');
  const lastOut = todayRecords.find(r => r.type === 'out');
  
  lastClockIn.textContent = lastIn ? lastIn.time : '-';
  lastClockOut.textContent = lastOut ? lastOut.time : '-';
  
  // Show late status
  if (lastIn && lastIn.penalty) {
    lateStatus.textContent = `⚠️ มาสาย ${lastIn.penalty.minutes} นาที`;
    lateStatus.style.color = 'var(--warning)';
    lateStatus.style.fontWeight = '600';
  } else if (lastIn) {
    lateStatus.textContent = '✅ ตรงเวลา';
    lateStatus.style.color = 'var(--success)';
    lateStatus.style.fontWeight = '600';
  } else {
    lateStatus.textContent = '';
  }

  const { hours, minutes, totalMinutes } = calculateTotalTime();
  totalWorkTime.textContent = `${hours} ชม. ${minutes} นาที`;
  
  const diffMinutes = totalMinutes - WORK_HOURS.totalMinutes;
  if (diffMinutes > 0) {
    workTimeNote.textContent = `✅ เกินมาตรฐาน ${Math.floor(diffMinutes / 60)} ชม. ${Math.floor(diffMinutes % 60)} นาที`;
    workTimeNote.style.color = 'var(--success)';
  } else if (diffMinutes < 0 && !isWorking) {
    workTimeNote.textContent = `⚠️ ต่ำกว่ามาตรฐาน ${Math.floor(Math.abs(diffMinutes) / 60)} ชม. ${Math.floor(Math.abs(diffMinutes) % 60)} นาที`;
    workTimeNote.style.color = 'var(--warning)';
  } else {
    workTimeNote.textContent = 'เวลามาตรฐาน: 8 ชม.';
    workTimeNote.style.color = 'var(--text-muted)';
  }

  // Show penalty card
  const penalty = getTodayPenalty();
  if (penalty) {
    penaltyCard.style.display = 'block';
    penaltyAmount.textContent = `${penalty.amount} บาท`;
    penaltyReason.textContent = `มาสาย ${penalty.minutes} นาที (${PENALTY_RATE} บาท/นาที)`;
  } else {
    penaltyCard.style.display = 'none';
  }

  renderHistory(todayRecords, todayHistory);

  dayTypeBadge.textContent = dayType === 'normal' ? '📅 วันปกติ' : '⭐ วันพิเศษ';
  
  document.querySelectorAll('.day-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === dayType);
  });
}

// Render history
function renderHistory(recordsList, container) {
  if (recordsList.length === 0) {
    container.innerHTML = '<p class="text-center text-muted">ไม่มีข้อมูลการลงเวลา</p>';
    return;
  }

  container.innerHTML = recordsList.map(record => `
    <div class="history-item">
      <div class="history-info">
        <div class="history-icon ${record.type}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${record.type === 'in' 
              ? '<polyline points="15 3 21 3 21 9"/><polyline points="10 17 3 17 3 11"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="17" x2="10" y2="10"/>'
              : '<polyline points="9 21 3 21 3 15"/><polyline points="14 7 21 7 21 13"/><line x1="3" y1="21" x2="10" y2="14"/><line x1="21" y1="7" x2="14" y2="14"/>'
            }
          </svg>
        </div>
        <div class="history-details">
          <div class="history-type">
            ${record.type === 'in' ? 'เข้างาน' : 'ออกงาน'}
            ${record.dayType === 'special' ? '<span class="history-badge badge-special">วันพิเศษ</span>' : ''}
            ${record.manual ? '<span class="history-badge" style="background: var(--warning-light); color: var(--warning);">ระบุเวลาเอง</span>' : ''}
            ${record.qrVerified ? '<span class="history-badge" style="background: var(--special-light); color: var(--special);">QR ✓</span>' : ''}
          </div>
          <div class="history-date">${record.date}</div>
          ${record.employee ? `<div class="history-employee">👤 ${record.employee.name} (${record.employee.id})</div>` : ''}
          ${record.penalty ? `<div class="history-employee" style="color: var(--warning); font-weight: 600;">⚠️ มาสาย ${record.penalty.minutes} นาที (หัก ${record.penalty.amount} บาท)</div>` : ''}
        </div>
      </div>
      <div class="history-time">${record.time}</div>
    </div>
  `).join('');
}

// Render OT Requests
function renderOTRequests() {
  if (otRequests.length === 0) {
    otRequestsList.innerHTML = '<p class="text-center text-muted">ยังไม่มีคำขออนุมัติ OT</p>';
    return;
  }

  otRequestsList.innerHTML = otRequests.map(req => `
    <div class="request-item">
      <div class="request-header">
        <strong>OT วันที่ ${new Date(req.date).toLocaleDateString('th-TH')}</strong>
        <span class="request-status status-${req.status}">
          ${req.status === 'pending' ? '⏳ รออนุมัติ' : req.status === 'approved' ? '✅ อนุมัติแล้ว' : '❌ ไม่อนุมัติ'}
        </span>
      </div>
      <div class="request-details">
        <strong>เวลา:</strong> ${req.startTime} - ${req.endTime}<br>
        <strong>เหตุผล:</strong> ${req.reason}
      </div>
    </div>
  `).join('');
}

// Show toast
function showToast(title, description) {
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-desc">${description}</div>
  `;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

// Event Listeners
clockInBtn.addEventListener('click', () => handleClockIn());
clockOutBtn.addEventListener('click', () => handleClockOut());

document.querySelectorAll('.day-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    dayType = btn.dataset.type;
    localStorage.setItem('day_type_pro', dayType);
    updateUI();
  });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
  });
});

changeEmployeeBtn.addEventListener('click', showEmployeeModal);
closeModalBtn.addEventListener('click', hideEmployeeModal);
cancelModalBtn.addEventListener('click', hideEmployeeModal);

employeeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  currentEmployee = {
    name: employeeNameInput.value.trim(),
    id: employeeIdInput.value.trim()
  };
  
  localStorage.setItem('current_employee_pro', JSON.stringify(currentEmployee));
  updateEmployeeDisplay();
  hideEmployeeModal();
  
  showToast('✅ บันทึกข้อมูลสำเร็จ', `พนักงาน: ${currentEmployee.name}`);
});

manualTimeBtn.addEventListener('click', showManualTimeModal);
closeManualTimeBtn.addEventListener('click', hideManualTimeModal);
cancelManualTimeBtn.addEventListener('click', hideManualTimeModal);

manualTimeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const clockInTime = document.getElementById('manualClockInTime').value;
  const clockOutTime = document.getElementById('manualClockOutTime').value;
  
  handleManualTime(clockInTime, clockOutTime);
  hideManualTimeModal();
  manualTimeForm.reset();
});

scanQrBtn.addEventListener('click', showQrScannerModal);
closeQrScannerBtn.addEventListener('click', hideQrScannerModal);

refreshLocationBtn.addEventListener('click', checkLocation);

viewHistoryBtn.addEventListener('click', () => {
  const date = historyDate.value;
  const recordsList = records.filter(r => {
    const recordDate = new Date(r.timestamp).toISOString().split('T')[0];
    return recordDate === date;
  });
  
  renderHistory(recordsList, historicalRecords);
});

otRequestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const request = {
    id: Date.now().toString(),
    date: document.getElementById('otDate').value,
    startTime: document.getElementById('otStartTime').value,
    endTime: document.getElementById('otEndTime').value,
    reason: document.getElementById('otReason').value,
    status: 'pending',
    employee: currentEmployee
  };
  
  otRequests.unshift(request);
  localStorage.setItem('ot_requests', JSON.stringify(otRequests));
  
  renderOTRequests();
  otRequestForm.reset();
  document.getElementById('otDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('otStartTime').value = '16:30';
  
  showToast('✅ ส่งคำขอสำเร็จ', 'รอการอนุมัติจากผู้จัดการ');
});

leaveForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const leaveRequest = {
    type: document.getElementById('leaveType').value,
    date: document.getElementById('leaveDate').value,
    reason: document.getElementById('leaveReason').value,
    employee: currentEmployee,
    timestamp: Date.now()
  };
  
  const leaveRequests = JSON.parse(localStorage.getItem('leave_requests') || '[]');
  leaveRequests.unshift(leaveRequest);
  localStorage.setItem('leave_requests', JSON.stringify(leaveRequests));
  
  leaveForm.reset();
  showToast('✅ ส่งคำขอลางานสำเร็จ', 'รอการอนุมัติจากผู้จัดการ');
});

// Initialize app
init();