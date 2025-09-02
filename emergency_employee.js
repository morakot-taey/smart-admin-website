// emergency_employee.js (ฉบับแก้ไขล่าสุด)

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
let userCompany = null; // ตัวแปรสำหรับเก็บสังกัดของผู้ใช้ที่ล็อกอิน
const dataRef = db.ref('emergency_contacts');

document.addEventListener('DOMContentLoaded', function() {
    // ✅ **ดึงข้อมูลผู้ใช้ออกจาก sessionStorage**
    const savedUserString = sessionStorage.getItem('current_emergency_user');
    if (savedUserString) {
        const savedUser = JSON.parse(savedUserString);
        userCompany = savedUser.company; // เก็บค่าสังกัด เช่น 'EQR', 'TEI'
    } else {
        // หากไม่มีข้อมูลล็อกอิน ให้ส่งกลับไปหน้าล็อกอิน
        alert('กรุณาเข้าสู่ระบบก่อน');
        window.location.href = 'emergency_login.html';
        return; // หยุดการทำงานของฟังก์ชัน
    }

    dataRef.on('value', (snapshot) => {
        const data = snapshot.val();
        allData = data ? data : {};
        filterData(); // เรียกใช้ฟังก์ชันแสดงผล
    });
});

function getFilteredData() {
    const dataArray = Object.values(allData);

    // ✅ **ขั้นตอนที่ 1: กรองข้อมูลตามสังกัด (Affiliation) ของผู้ใช้**
    const companyFilteredData = dataArray.filter(item => {
        // ตรวจสอบว่าคอลัมน์ "Affiliation" มีค่าตรงกับสังกัดของผู้ใช้หรือไม่
        return item["Affiliation"] && item["Affiliation"].trim() === userCompany;
    });

    // ✅ **ขั้นตอนที่ 2: กรองข้อมูลจากช่องค้นหา (ทำงานกับข้อมูลที่กรองตามสังกัดแล้ว)**
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    if (!searchTerm) {
        return companyFilteredData; // ถ้าไม่มีการค้นหา ให้แสดงข้อมูลที่กรองตามสังกัดทั้งหมด
    }

    return companyFilteredData.filter(item => 
        Object.values(item).join(' ').toLowerCase().includes(searchTerm)
    );
}

function filterData() {
    renderTable(getFilteredData());
}

function renderTable(dataToRender) {
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';
    
    if (dataToRender.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">ไม่พบข้อมูลในสังกัดของคุณ</td></tr>';
        return;
    }

    dataToRender.forEach((item) => {
        const row = `<tr>
            <td>${item["Employee Code"] || '-'}</td>
            <td>${item["Name – Surname"] || '-'}</td>
            <td>${item["Department"] || '-'}</td>
            <td>${item["Affiliation"] || '-'}</td>
            <td>${item["Company"] || '-'}</td>
            <td>${item["Position"] || '-'}</td>
            <td>${item["Telephone"] || '-'}</td>
            <td>${item["ชื่อผู้ติดต่อ"] || '-'}</td>
            <td>${item["เบอร์โทรศัพท์"] || '-'}</td>
            <td>${item["ความสัมพันธ์"] || '-'}</td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function logoutAndGoHome() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
