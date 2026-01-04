const API_URL = ''; // Để trống để gọi cùng domain
let currentEmail = '';
let inboxInterval;

// DOM Elements
const emailInput = document.getElementById('email-address');
const btnCopy = document.getElementById('btn-copy');
const btnRefresh = document.getElementById('btn-refresh-manual');
const inboxList = document.getElementById('inbox-list');
const loader = document.getElementById('loader');
const modal = document.getElementById('email-modal');
const modalContent = document.getElementById('modal-content');
const btnCloseModal = document.querySelector('.btn-close');

// 1. Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    generateNewEmail();
    startPolling();
});

// 2. Tạo email mới
async function generateNewEmail() {
    try {
        const response = await fetch(`${API_URL}/api/generate`);
        const data = await response.json();
        currentEmail = data.email;
        emailInput.value = currentEmail;

        // Reset inbox
        inboxList.innerHTML = `<div class="empty-state">
            <i class="fas fa-envelope-open-text"></i>
            <p>Đang kiểm tra thư cho ${currentEmail}...</p>
        </div>`;

        fetchInbox();
    } catch (error) {
        console.error('Lỗi tạo mail:', error);
    }
}

// 3. Lấy danh sách thư trong hộp thư
async function fetchInbox() {
    if (!currentEmail) return;

    loader.classList.remove('hidden');
    try {
        const response = await fetch(`${API_URL}/api/inbox/${currentEmail}`);
        const data = await response.json();
        renderInbox(data.emails);
    } catch (error) {
        console.error('Lỗi lấy hộp thư:', error);
    } finally {
        loader.classList.add('hidden');
    }
}

// 4. Hiển thị danh sách thư
function renderInbox(emails) {
    if (!emails || emails.length === 0) {
        return; // Giữ nguyên trạng thái empty
    }

    inboxList.innerHTML = '';
    emails.forEach(email => {
        const item = document.createElement('div');
        item.className = 'email-item';
        item.innerHTML = `
            <div class="avatar">${email.sender.substring(0, 1).toUpperCase()}</div>
            <div class="email-info">
                <h4>${escapeHtml(email.subject || '(Không tiêu đề)')}</h4>
                <p>${escapeHtml(email.sender)}</p>
            </div>
            <div class="time">${formatDate(email.received_at)}</div>
        `;
        item.onclick = () => openEmail(email.id);
        inboxList.appendChild(item);
    });
}

// 5. Mở xem chi tiết thư
async function openEmail(id) {
    try {
        const response = await fetch(`${API_URL}/api/email/${id}`);
        const email = await response.json();

        document.getElementById('modal-subject').innerText = email.subject || '(Không tiêu đề)';
        document.getElementById('modal-meta').innerText = `Từ: ${email.sender} • Lúc: ${formatDate(email.received_at)}`;

        // Nếu có nội dung HTML thì hiển thị, không thì hiển thị text
        modalContent.innerHTML = email.html_body || `<pre style="white-space: pre-wrap;">${escapeHtml(email.text_body)}</pre>`;

        modal.classList.remove('hidden');
    } catch (error) {
        alert('Không thể tải nội dung thư.');
    }
}

// 6. Utility Functions
function startPolling() {
    if (inboxInterval) clearInterval(inboxInterval);
    inboxInterval = setInterval(fetchInbox, 5000); // Mỗi 5 giây
}

btnCopy.onclick = () => {
    emailInput.select();
    document.execCommand('copy');
    const originalText = btnCopy.innerHTML;
    btnCopy.innerHTML = '<i class="fas fa-check"></i> <span>Đã Copy</span>';
    setTimeout(() => btnCopy.innerHTML = originalText, 2000);
};

btnRefresh.onclick = () => {
    if (confirm('Bạn muốn đổi địa chỉ email mới? Hộp thư cũ sẽ không thể truy cập nữa.')) {
        generateNewEmail();
    }
};

btnCloseModal.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); };

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
