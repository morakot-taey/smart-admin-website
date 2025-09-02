// upload_script.js (ฉบับแก้ไข: อ่านไฟล์ JSON และดีไซน์ใหม่)

document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyBFep1y9I0OR5Hu_Gf0Mbywu-PEgFdQD2k",
        authDomain: "smartadmin-hr-project.firebaseapp.com",
        databaseURL: "https://smartadmin-hr-project-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "smartadmin-hr-project",
        storageBucket: "smartadmin-hr-project.firebasestorage.app",
        messagingSenderId: "797763301010",
        appId: "1:797763301010:web:2c4b5e24ac0750e67cc04b"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // --- Element References ---
    const modal = document.getElementById('admin-upload-modal');
    const secretButton = document.getElementById('secret-upload-button');
    const closeButton = modal.querySelector('.close-button');
    const loginView = document.getElementById('admin-login-view');
    const uploadView = document.getElementById('admin-upload-view');
    const loginButton = document.getElementById('admin-login-button');
    const passwordInput = document.getElementById('admin-password');
    const loginError = document.getElementById('admin-login-error');
    const uploadButton = document.getElementById('upload-master-button');
    const fileInput = document.getElementById('master-file-input');
    const uploadStatus = document.getElementById('upload-status');

    // --- Event Listeners ---
    secretButton.onclick = () => modal.style.display = 'block';
    closeButton.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    loginButton.onclick = () => {
        if (passwordInput.value === '660134') {
            loginView.style.display = 'none';
            uploadView.style.display = 'block';
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    };

    uploadButton.onclick = () => {
        const file = fileInput.files[0];
        if (!file) {
            uploadStatus.textContent = 'กรุณาเลือกไฟล์ Database.json ก่อน';
            uploadStatus.style.color = '#ffcccc';
            return;
        }

        uploadStatus.textContent = 'กำลังอ่านไฟล์...';
        uploadStatus.style.color = '#aaeaff';

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                // ✅ **แปลงข้อความในไฟล์เป็น JSON Object**
                const importedData = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedData)) {
                    throw new Error("รูปแบบไฟล์ JSON ไม่ถูกต้อง (ต้องเป็น Array)");
                }

                if (!confirm(`คุณต้องการอัปเดตข้อมูล ${importedData.length} รายการใช่หรือไม่?`)) {
                    uploadStatus.textContent = 'ยกเลิกการอัปเดต';
                    uploadStatus.style.color = 'orange';
                    return;
                }

                uploadStatus.textContent = 'กำลังอัปเดตฐานข้อมูล...';
                
                const employeesNodeData = {};
                const emergencyContactsNodeData = {};

                importedData.forEach(row => {
                    const empId = row['Employee Code'];
                    if (!empId) return;

                    employeesNodeData[empId] = {
                        'Employee Code': empId,
                        'Name – Surname': row['Name – Surname'],
                        'สิทธิการรักษา': row['สิทธิการรักษา'] || 'N/A'
                    };

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

                await db.ref().update(updates);
                
                uploadStatus.textContent = 'อัปเดตข้อมูลทุกระบบสำเร็จ!';
                uploadStatus.style.color = '#ccffdd';

                setTimeout(() => {
                    modal.style.display = 'none';
                    loginView.style.display = 'block';
                    uploadView.style.display = 'none';
                    passwordInput.value = '';
                    fileInput.value = '';
                    uploadStatus.textContent = '';
                }, 2000);

            } catch (err) {
                uploadStatus.textContent = 'เกิดข้อผิดพลาด: ' + err.message;
                uploadStatus.style.color = '#ffcccc';
                console.error("Error processing file:", err);
            }
        };
        reader.readAsText(file); // ✅ **อ่านไฟล์เป็น Text**
    };
});
