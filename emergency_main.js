// emergency_main.js (ฉบับอัปเกรดฟังก์ชัน + กราฟ + นำเข้าอัจฉริยะ)

const firebaseConfig = {
    apiKey: "AIzaSyBFep1y9I0OR5Hu_Gf0Mbywu-PEgFdQD2k",
    authDomain: "smartadmin-hr-project.firebaseapp.com",
    databaseURL: "https://smartadmin-hr-project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smartadmin-hr-project",
    storageBucket: "smartadmin-hr-project.firebasestorage.app",
    messagingSenderId: "797763301010",
    appId: "1:797763301010:web:2c4b5e24ac0750e67cc04b"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let allData = {};
let allLogs = [];
let editingId = null;
let currentUser = null;
let reportChart = null; 
const dataRef = db.ref('emergency_contacts');
const logsRef = db.ref('emergency_logs');

document.addEventListener('DOMContentLoaded', function() {
    const savedUserString = sessionStorage.getItem('current_emergency_user');
    if (savedUserString) {
        currentUser = JSON.parse(savedUserString);
    } else {
        alert('กรุณาเข้าสู่ระบบก่อน');
        window.location.href = 'emergency_login.html';
        return;
    }
    
    initializeChart();

    dataRef.on('value', (snapshot) => {
        allData = snapshot.val() || {};
        filterData();
        updateStatsAndChart();
    });

    logsRef.on('value', (snapshot) => {
        allLogs = snapshot.val() ? Object.values(snapshot.val()) : [];
        allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
        renderLogs();
        updateStatsAndChart();
    });
});

function addLog(action, target = '') {
    if (!currentUser) return;
    const newLog = {
        time: new Date().toISOString(),
        user: currentUser.username,
        action: action,
        target: target
    };
    logsRef.push(newLog);
}

// ---- Chart and Stats Update ----
function initializeChart() {
    const ctx = document.getElementById('report-chart').getContext('2d');
    reportChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['ข้อมูลทั้งหมด', 'ผู้เข้าระบบวันนี้', 'การส่งออก (วันนี้)'],
            datasets: [{
                label: 'จำนวน',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { color: '#fff' } },
                x: { ticks: { color: '#fff' } }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'สรุปภาพรวมการใช้งาน', color: '#fff', font: { size: 16 } }
            }
        }
    });
}

function updateStatsAndChart() {
    // ✅ **อ้างอิงข้อมูลจาก allData (emergency_contacts) สำหรับกราฟ "ข้อมูลทั้งหมด"**
    const totalRecords = Object.keys(allData).length; 
    const today = new Date().toISOString().slice(0, 10);
    const loginsToday = allLogs.filter(log => log.time.startsWith(today) && log.action === 'เข้าสู่ระบบ').length;
    const exportsToday = allLogs.filter(log => log.time.startsWith(today) && log.action.includes('ส่งออก')).length;
    
    if (reportChart) {
        // ✅ **แก้ไขการอ้างอิงข้อมูลในกราฟให้ถูกต้อง**
        reportChart.data.datasets[0].data = [totalRecords, loginsToday, exportsToday];
        reportChart.update();
    }
}


// ---- Data Filtering and Rendering ----
function getFilteredData() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const dataArray = Object.keys(allData).map(key => ({ firebaseId: key, ...allData[key] }));
    if (!searchTerm) return dataArray;
    return dataArray.filter(item => Object.values(item).join(' ').toLowerCase().includes(searchTerm));
}

function filterData() { renderTable(getFilteredData()); }

function renderTable(dataToRender) {
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';
    dataToRender.forEach((item) => {
        const row = `<tr>
            <td>${item["Employee Code"] || '-'}</td><td>${item["Name – Surname"] || '-'}</td><td>${item["Department"] || '-'}</td>
            <td>${item["Affiliation"] || '-'}</td><td>${item["Company"] || '-'}</td><td>${item["Position"] || '-'}</td>
            <td>${item["Telephone"] || '-'}</td><td>${item["ชื่อผู้ติดต่อ"] || '-'}</td><td>${item["เบอร์โทรศัพท์"] || '-'}</td>
            <td>${item["ความสัมพันธ์"] || '-'}</td>
            <td><button class="action-button" onclick="openEditModal('${item.firebaseId}')"><i class="fas fa-edit"></i></button>
                <button class="action-button" onclick="deleteData('${item.firebaseId}', '${item["Employee Code"]}')"><i class="fas fa-trash"></i></button>
            </td></tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function renderLogs() {
    const logTableBody = document.getElementById('log-table-body');
    logTableBody.innerHTML = '';
    allLogs.forEach(log => {
        const time = new Date(log.time).toLocaleString('th-TH');
        const row = `<tr><td>${time}</td><td>${log.user}</td><td>${log.action}${log.target ? `: ${log.target}`: ''}</td></tr>`;
        logTableBody.insertAdjacentHTML('beforeend', row);
    });
}

// ---- Modal and Form Handling ----
function showModal() { document.getElementById('modal-backdrop').classList.add('active'); document.getElementById('data-modal').classList.add('open'); }
function closeModal() { document.getElementById('modal-backdrop').classList.remove('active'); document.getElementById('data-modal').classList.remove('open'); }

function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').innerText = 'เพิ่มข้อมูลติดต่อฉุกเฉิน';
    document.getElementById('data-form').reset();
    document.getElementById('form-emp-code').disabled = false;
    showModal();
}

function openEditModal(firebaseId) {
    const item = allData[firebaseId];
    if (!item) return;
    editingId = firebaseId;
    document.getElementById('form-emp-code').value = item["Employee Code"] || '';
    document.getElementById('form-name').value = item["Name – Surname"] || '';
    document.getElementById('form-dept').value = item["Department"] || '';
    document.getElementById('form-affil').value = item["Affiliation"] || '';
    document.getElementById('form-company').value = item["Company"] || '';
    document.getElementById('form-pos').value = item["Position"] || '';
    document.getElementById('form-tel').value = item["Telephone"] || '';
    document.getElementById('form-contact-name').value = item["ชื่อผู้ติดต่อ"] || '';
    document.getElementById('form-contact-tel').value = item["เบอร์โทรศัพท์"] || '';
    document.getElementById('form-relation').value = item["ความสัมพันธ์"] || '';
    document.getElementById('form-emp-code').disabled = true;
    document.getElementById('modal-title').innerText = 'แก้ไขข้อมูลติดต่อฉุกเฉิน';
    showModal();
}

document.getElementById('data-form').onsubmit = function(e) {
    e.preventDefault();
    const formData = {
        "Employee Code": document.getElementById('form-emp-code').value.trim(),
        "Name – Surname": document.getElementById('form-name').value.trim(),
        "Department": document.getElementById('form-dept').value.trim(),
        "Affiliation": document.getElementById('form-affil').value.trim(),
        "Company": document.getElementById('form-company').value.trim(),
        "Position": document.getElementById('form-pos').value.trim(),
        "Telephone": document.getElementById('form-tel').value.trim(),
        "ชื่อผู้ติดต่อ": document.getElementById('form-contact-name').value.trim(),
        "เบอร์โทรศัพท์": document.getElementById('form-contact-tel').value.trim(),
        "ความสัมพันธ์": document.getElementById('form-relation').value.trim(),
    };
    if (editingId) {
        dataRef.child(editingId).update(formData).then(() => { addLog('แก้ไขข้อมูล', formData["Employee Code"]); closeModal(); }).catch(err => console.error("Update failed:", err));
    } else {
        dataRef.push(formData).then(() => { addLog('เพิ่มข้อมูล', formData["Employee Code"]); closeModal(); }).catch(err => console.error("Push failed:", err));
    }
};

function deleteData(firebaseId, empCode) {
    if (confirm(`คุณต้องการลบข้อมูลของพนักงานรหัส ${empCode} ใช่หรือไม่?`)) {
        dataRef.child(firebaseId).remove().then(() => { addLog('ลบข้อมูล', empCode); }).catch(err => console.error("Remove failed:", err));
    }
}

// ---- Import / Export ----
async function handleFileImport(e) {
    const file = e.target.files[0]; // ✅ แก้ไข: รับไฟล์แรกไฟล์เดียว
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheet = workbook.Sheets[workbook.SheetNames[0]]; // ✅ แก้ไข: อ่านจากชีทแรกเสมอ
            const importedData = XLSX.utils.sheet_to_json(sheet);

            if (confirm(`คุณต้องการนำเข้า Master Data จำนวน ${importedData.length} รายการ และอัปเดตทุกระบบใช่หรือไม่?`)) {
                
                const employeesNodeData = {};
                const emergencyContactsNodeData = {};
                
                importedData.forEach(row => {
                    const empId = row['Employee Code'];
                    if (!empId) return;

                    // 1. เตรียมข้อมูลสำหรับ /employees
                    employeesNodeData[empId] = {
                        'Employee Code': empId,
                        'Name – Surname': row['Name – Surname'],
                        'Department': row['Department'],
                        'Affiliation': row['Affiliation'],
                        'Company': row['Company'],
                        'Position': row['Position'],
                        'สิทธิการรักษา': row['สิทธิการรักษา'] || 'N/A' 
                    };

                    // 2. เตรียมข้อมูลสำหรับ /emergency_contacts
                    emergencyContactsNodeData[empId] = {
                        'Employee Code': empId,
                        'Name – Surname': row['Name – Surname'],
                        'Affiliation': row['Affiliation'],
                        'Telephone': row['Telephone'],
                        'ชื่อผู้ติดต่อ': row['ชื่อผู้ติดต่อ'],
                        'เบอร์โทรศัพท์': row['เบอร์โทรศัพท์'],
                        'ความสัมพันธ์': row['ความสัมพันธ์']
                    };
                });
                
                const updates = {};
                updates['/employees'] = employeesNodeData;
                updates['/emergency_contacts'] = emergencyContactsNodeData;

                // ✅ **ส่งข้อมูลทั้งหมดขึ้นไปอัปเดตที่ root**
                await db.ref().update(updates);
                
                alert('นำเข้าและอัปเดตข้อมูลทุกระบบสำเร็จ!');
                addLog('นำเข้า Master Data', `${importedData.length} รายการ`);
            }
        } catch (err) {
            console.error("Error importing file:", err);
            alert("เกิดข้อผิดพลาดในการนำเข้าไฟล์: " + err.message);
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
}

function exportToExcel() {
    const dataToExport = getFilteredData().map(({ firebaseId, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "EmergencyContacts");
    XLSX.writeFile(wb, 'emergency-contacts.xlsx');
    addLog('ส่งออกข้อมูล', `${dataToExport.length} รายการ`);
}

function exportLogToExcel() {
    const ws = XLSX.utils.json_to_sheet(allLogs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UsageHistory");
    XLSX.writeFile(wb, 'emergency-usage-history.xlsx');
    addLog('ส่งออกประวัติ');
}

function logoutAndGoHome() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
