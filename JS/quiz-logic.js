import { thinhLinhDu, khacDanhBangVang , thinhBangVang} from './core.js';

// Truy xuất các thành phần giao diện (UI Elements)
const manHinhChinh = document.getElementById('trang-chu');
const khongGianKhaoThi = document.getElementById('khong-gian-khao-thi');
const manHinhKetThuc = document.getElementById('ket-thuc');

const cauHoiHienTai = document.getElementById('cau-hoi');
const danhSachTraLoi = document.getElementById('danh-sach-tra-loi');
const hienThiDiem = document.getElementById('diem-so');

let danhSachCauHoi = [];
let chiSoCauHoi = 0;
let linhLucTichTu = 0;

// --- 1. NGHI THỨC KHỞI SỰ ---
document.getElementById('btn-bat-dau').addEventListener('click', async () => {
    console.log("⚡ Ấn ký đã nhận! Đang kết nối Vân Linh Tàng Các..."); 
    
    manHinhChinh.classList.add('an');
    khongGianKhaoThi.classList.remove('an');
    
    try {
        // Thỉnh dữ liệu từ Singapore Cloud
        danhSachCauHoi = await thinhLinhDu();
        
        if (danhSachCauHoi && danhSachCauHoi.length > 0) {
            hienThiCauHoi();
        } else {
            cauHoiHienTai.innerText = "Linh kho trống rỗng hoặc chưa cấu hình Rules!";
        }
    } catch (error) {
        console.error("Thiên kiếp xuất hiện:", error);
        cauHoiHienTai.innerText = "Kết nối thất bại, hãy kiểm tra lại Internet!";
    }
});

// --- 2. HIỂN THỊ KHẢO THÍ ---
function hienThiCauHoi() {
    const cauHoi = danhSachCauHoi[chiSoCauHoi];
    cauHoiHienTai.innerText = `Câu ${chiSoCauHoi + 1}: ${cauHoi.noi_dung}`;
    danhSachTraLoi.innerHTML = '';

    cauHoi.lua_chon.forEach((luaChon, index) => {
        const nut = document.createElement('button');
        nut.innerText = luaChon;
        nut.className = 'an-ky';
        nut.onclick = () => kiemTraDapAn(index);
        danhSachTraLoi.appendChild(nut);
    });
}

// --- 3. KIỂM TRA ĐẠO HẠNH ---
function kiemTraDapAn(idx) {
    if (idx === danhSachCauHoi[chiSoCauHoi].dap_an_dung) {
        linhLucTichTu += 10; // Mỗi câu đúng tặng 10 linh lực
        hienThiDiem.innerText = linhLucTichTu;
    }

    chiSoCauHoi++;
    if (chiSoCauHoi < danhSachCauHoi.length) {
        hienThiCauHoi();
    } else {
        hoanTatKhaoThi();
    }
}

// --- 4. VIÊN MÃN & KHẮC TÊN ---
function hoanTatKhaoThi() {
    khongGianKhaoThi.classList.add('an');
    manHinhKetThuc.classList.remove('an');
    document.getElementById('diem-cuoi').innerText = linhLucTichTu;
}

// quiz-logic.js
document.getElementById('btn-luu-danh').addEventListener('click', async (e) => {
    const nutBam = e.target; // Lấy chính cái nút vừa bấm
    const ten = document.getElementById('ten-kình-ngư').value;
    
    if (!ten) {
        alert("Xin hãy để lại danh tánh!");
        return;
    }

    // --- BƯỚC 1: KHÓA ẤN KÝ (Chống gửi 2 lần) ---
    nutBam.disabled = true;
    nutBam.innerText = "Đang khắc tên...";

    try {
        // --- BƯỚC 2: THỰC HIỆN LƯU ---
        const ketQua = await khacDanhBangVang(ten, linhLucTichTu);

        if (ketQua) {
            alert("Danh tánh của Kình Chủ đã được lưu truyền vạn cổ!");
            location.reload();
        } else {
            // Nếu hàm trả về false (do spam hoặc lỗi)
            nutBam.disabled = false;
            nutBam.innerText = "Khắc Tên Lên Mây";
        }
    } catch (error) {
        // --- BƯỚC 3: XỬ LÝ THIÊN KIẾP (Lỗi bất ngờ) ---
        console.error("Lỗi chí mạng:", error);
        alert("Có biến rồi bro! Kiểm tra kết nối mạng xem sao.");
        nutBam.disabled = false;
        nutBam.innerText = "Khắc Tên Lên Mây";
    }
});
// --- NGHI THỨC XEM BẢNG VÀNG ---
document.getElementById('btn-xep-hang').addEventListener('click', async () => {
    const danhSach = await thinhBangVang();
    if (danhSach.length === 0) {
        alert("Chưa có anh tài nào lưu danh!");
        return;
    }

    // Tạo nội dung hiển thị đơn giản bằng alert hoặc console trước
    let nọiDung = "🏛️ BẢNG VÀNG KÌNH NGƯ 🏛️\n";
    danhSach.forEach((kn, i) => {
        nọiDung += `${i + 1}. ${kn.danh_tanh} - ${kn.linh_luc} điểm\n`;
    });
    alert(nọiDung);
});
// JS/quiz-logic.js
const btnLuuDanh = document.getElementById('btn-luu-danh');

btnLuuDanh.addEventListener('click', async () => {
    const ten = document.getElementById('ten-kình-ngư').value;
    if (!ten) {
        alert("Xin hãy để lại danh tánh!");
        return;
    }

    // 1. Khóa nút ngay lập tức để chống bấm 2 lần
    btnLuuDanh.disabled = true;
    btnLuuDanh.innerText = "Đang khắc tên...";

    try {
        const success = await khacDanhBangVang(ten, linhLucTichTu);
        if (success) {
            alert("Danh tánh của Kình Chủ đã được lưu truyền vạn cổ!");
            location.reload(); 
        } else {
            // Nếu không thành công (spam), mở lại nút để họ sửa
            btnLuuDanh.disabled = false;
            btnLuuDanh.innerText = "Khắc Tên Lên Mây";
        }
    } catch (error) {
        btnLuuDanh.disabled = false;
        btnLuuDanh.innerText = "Khắc Tên Lên Mây";
    }
});
document.getElementById('btn-quay-lai').addEventListener('click', () => {
    // 1. Ẩn màn hình kết thúc, hiện trang chủ
    document.getElementById('ket-thuc').classList.add('an');
    document.getElementById('trang-chu').classList.remove('an');

    // 2. Reset các biến số để thi lại từ đầu
    linhLucTichTu = 0; 
    chiSoCauHoi = 0;
    hienThiDiem.innerText = "0";
    
    // 3. FIX LỖI: Dùng đúng ID 'ten-kình-ngư' đã đặt ở index.html
    const oNhapTen = document.getElementById('ten-kình-ngư');
    if (oNhapTen) {
        oNhapTen.value = ''; 
    }

    // 4. Mở khóa lại nút Lưu Danh (nếu trước đó bị khóa do lỗi)
    const btnLuu = document.getElementById('btn-luu-danh');
    if (btnLuu) {
        btnLuu.disabled = false;
        btnLuu.innerText = "Khắc Tên Lên Mây";
    }
});