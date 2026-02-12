import { db } from './firebase.js';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// 1. Hàm lấy Fingerprint & IP (Dùng để nhận diện kình ngư)
async function getIdentity() {
    let visitorId = "unknown-visitor";
    let ip = "0.0.0.0";

    try {
        // Lấy IP trước (Thường ít bị chặn hơn)
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;

        // Thử lấy Fingerprint, nếu tạch (do AdBlock) thì bỏ qua
        const FingerprintJS = await import('https://fpjscdn.net/v3/YOUR_API_KEY') // Hoặc dùng bản mở rộng khác
            .catch(() => null); 
        
        if (FingerprintJS) {
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            visitorId = result.visitorId;
        } else {
            // Nếu bị chặn, dùng tạm IP làm ID để hệ thống vẫn chạy được
            visitorId = `blocked-${ip.replace(/\./g, '-')}`;
        }
    } catch (error) {
        console.warn("Cảnh báo: Hệ thống bảo mật bị AdBlock hạn chế, chuyển sang chế độ dự phòng.");
        visitorId = `fallback-${Date.now()}`;
    }

    return { fingerprint: visitorId, ip: ip };
}

// 2. Hàm lấy danh sách câu hỏi
export async function thinhLinhDu() {
    try {
        const querySnapshot = await getDocs(collection(db, "LinhKhoCauHoi"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Thiên kiếp chặn đường: ", e);
        return [];
    }
}

// 3. Hàm khắc tên (Có check IP & Fingerprint chống spam)
// core.js
// core.js

export async function khacDanhBangVang(ten, diem) {
    let identity = { fingerprint: "none", ip: "unknown" };

    try {
        // Bước 1: Lấy IP trước (ít bị chặn hơn fingerprint)
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            identity.ip = ipData.ip;
            identity.fingerprint = `ip-${ipData.ip.replace(/\./g, '-')}`; // Dự phòng ID bằng IP
        } catch (ipErr) {
            console.warn("Không lấy được IP, dùng ID ngẫu nhiên.");
            identity.fingerprint = `random-${Math.floor(Math.random() * 1000000)}`;
        }

        // Bước 2: Thử lấy Fingerprint (nếu AdBlock chặn thì bỏ qua luôn, không để lỗi)
        try {
            // Chỉ thử import nếu không bị AdBlock chặn link
            const fpPromise = import('https://openfpcdn.io/fingerprintjs/v4').then(fp => fp.load());
            const fp = await fpPromise;
            const result = await fp.get();
            identity.fingerprint = result.visitorId;
        } catch (fpErr) {
            console.warn("Fingerprint bị chặn (AdBlock), dùng ID dự phòng.");
        }

        // Bước 3: Check spam trong DB
        const q = query(
            collection(db, "quiz_results"), 
            where("fingerprint", "==", identity.fingerprint)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.size >= 2) {
            alert("Đạo hữu hôm nay thi thế là đủ rồi! Nghỉ ngơi tí đi.");
            return false;
        }

        // Bước 4: Lưu vào Firestore
        await addDoc(collection(db, "quiz_results"), {
            danh_tanh: ten,
            linh_luc: diem,
            thoi_gian: serverTimestamp(),
            fingerprint: identity.fingerprint,
            dia_chi_ip: identity.ip
        });
        
        return true;
    } catch (e) {
        console.error("Thiên kiếp quật lỗi: ", e);
        alert("Có lỗi xảy ra khi lưu danh, check console nha bro!");
        return false;
    }
}

// 4. Hàm lấy Bảng Vàng 
export async function thinhBangVang() {
    const bangVangRef = collection(db, "quiz_results");
    const q = query(bangVangRef, orderBy("linh_luc", "desc"), limit(10));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
        console.error("Lỗi thỉnh Bảng Vàng:", e);
        return [];
    }
}