/**
 * ============================================================================
 * File: js/data.js
 * Dự án: Dashboard Cá nhân & Lộ trình Học tập (The Learning Path)
 * Mô tả: Dữ liệu mẫu các môn học, các hàm thuần (Pure Functions) tính GPA hệ 4,
 *        xếp loại học lực, cấu hình màu trạng thái, lưu trữ LocalStorage và
 *        xử lý tương tác Thêm / Sửa / Xóa / Lọc / Tìm kiếm theo thời gian thực.
 * ============================================================================
 */

// 1. DỮ LIỆU MẪU (JSON ARRAY) & CẤU HÌNH LOCALSTORAGE

// Khóa lưu trữ dữ liệu môn học trên trình duyệt
const STORAGE_KEY_MON_HOC = "the_learning_path_courses_v1";

// Bộ dữ liệu mẫu mặc định gồm 10 môn học đại học thực tế (dùng để khởi tạo & khôi phục)
const DANH_SACH_MON_HOC_MAC_DINH = [
    {
        maMon: "IT101",
        tenMon: "Nhập môn Lập trình",
        hocKy: 1,
        soTinChi: 3,
        diemHe10: 8.8,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT102",
        tenMon: "Toán rời rạc",
        hocKy: 1,
        soTinChi: 3,
        diemHe10: 7.8,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT201",
        tenMon: "Cấu trúc dữ liệu & Giải thuật",
        hocKy: 2,
        soTinChi: 4,
        diemHe10: 8.4,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT202",
        tenMon: "Lập trình Hướng đối tượng",
        hocKy: 2,
        soTinChi: 3,
        diemHe10: 9.1,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT203",
        tenMon: "Cơ sở dữ liệu",
        hocKy: 3,
        soTinChi: 3,
        diemHe10: 7.2,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT204",
        tenMon: "Mạng máy tính",
        hocKy: 3,
        soTinChi: 3,
        diemHe10: 6.7,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT301",
        tenMon: "Lập trình Web",
        hocKy: 4,
        soTinChi: 4,
        diemHe10: 8.6,
        trangThai: "da_hoan_thanh"
    },
    {
        maMon: "IT302",
        tenMon: "Trí tuệ nhân tạo",
        hocKy: 4,
        soTinChi: 3,
        diemHe10: null,
        trangThai: "dang_hoc"
    },
    {
        maMon: "IT303",
        tenMon: "Công nghệ Phần mềm",
        hocKy: 4,
        soTinChi: 3,
        diemHe10: null,
        trangThai: "dang_hoc"
    },
    {
        maMon: "IT401",
        tenMon: "An toàn & Bảo mật Thông tin",
        hocKy: 5,
        soTinChi: 3,
        diemHe10: null,
        trangThai: "chua_hoc"
    }
];

/**
 * Tạo bản sao độc lập từ danh sách môn học mặc định để tránh sửa trực tiếp dữ liệu gốc.
 * @returns {Array<Object>} Mảng bản sao các môn học mẫu.
 */
function taoBanSaoDuLieuMau() {
    return DANH_SACH_MON_HOC_MAC_DINH.map((mon) => ({ ...mon }));
}

/**
 * Đọc danh sách môn học từ localStorage; nếu chưa có hoặc dữ liệu lỗi thì nạp mảng mặc định.
 * @returns {Array<Object>} Danh sách môn học hợp lệ.
 */
function taiDuLieuTuStorage() {
    if (typeof localStorage === "undefined") {
        return taoBanSaoDuLieuMau();
    }

    try {
        const chuoiLuu = localStorage.getItem(STORAGE_KEY_MON_HOC);
        if (!chuoiLuu) return taoBanSaoDuLieuMau();

        const duLieuDoc = JSON.parse(chuoiLuu);
        if (!Array.isArray(duLieuDoc)) return taoBanSaoDuLieuMau();

        return duLieuDoc;
    } catch (err) {
        return taoBanSaoDuLieuMau();
    }
}

/**
 * Lưu mảng danhSachMonHoc hiện tại vào localStorage để giữ nguyên sau khi tải lại trang.
 * @param {Array<Object>} dsMon - Danh sách môn học cần lưu.
 */
function luuDuLieuVaoStorage(dsMon) {
    if (typeof localStorage === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY_MON_HOC, JSON.stringify(dsMon));
    } catch (err) {
        // Bỏ qua an toàn nếu trình duyệt tắt quyền lưu trữ cục bộ
    }
}

// Danh sách môn học đang hoạt động của Dashboard (tự động khôi phục từ localStorage nếu có)
let danhSachMonHoc = taiDuLieuTuStorage();

// Trạng thái bộ lọc, từ khóa tìm kiếm và mã môn đang mở chế độ sửa trực tiếp
const trangThaiGiaoDien = {
    boLocTrangThai: "tat_ca",
    tuKhoaTimKiem: "",
    maMonDangSua: null
};

// 2. CÁC HÀM XỬ LÝ LOGIC CỐT LÕI (PURE FUNCTIONS)

/**
 * Quy đổi điểm hệ 10 sang điểm hệ 4 và điểm chữ theo chuẩn tín chỉ đại học Việt Nam.
 * @param {number|null} diemHe10 - Điểm tổng kết thang 10 của môn học.
 * @returns {{ diemHe4: number|null, diemChu: string }} Đối tượng chứa điểm hệ 4 và điểm chữ.
 */
function quyDoiDiemHe4(diemHe10) {
    if (typeof diemHe10 !== "number" || Number.isNaN(diemHe10) || diemHe10 < 0 || diemHe10 > 10) {
        return { diemHe4: null, diemChu: "Chưa có" };
    }

    if (diemHe10 >= 8.5) return { diemHe4: 4.0, diemChu: "A" };
    if (diemHe10 >= 8.0) return { diemHe4: 3.5, diemChu: "B+" };
    if (diemHe10 >= 7.0) return { diemHe4: 3.0, diemChu: "B" };
    if (diemHe10 >= 6.5) return { diemHe4: 2.5, diemChu: "C+" };
    if (diemHe10 >= 5.5) return { diemHe4: 2.0, diemChu: "C" };
    if (diemHe10 >= 5.0) return { diemHe4: 1.5, diemChu: "D+" };
    if (diemHe10 >= 4.0) return { diemHe4: 1.0, diemChu: "D" };

    return { diemHe4: 0.0, diemChu: "F" };
}

/**
 * Tính điểm trung bình tích lũy hệ 4 (GPA) có trọng số theo số tín chỉ
 * cho các môn đã hoàn thành, làm tròn 2 chữ số thập phân.
 * @param {Array<Object>} dsMon - Danh sách các môn học.
 * @returns {number} Giá trị GPA hệ 4 (trả về 0.00 nếu chưa có môn nào hoàn thành).
 */
function tinhGPAHe4(dsMon) {
    if (!Array.isArray(dsMon) || dsMon.length === 0) {
        return Number((0).toFixed(2));
    }

    const monDaHoanThanh = dsMon.filter(
        (mon) =>
            mon.trangThai === "da_hoan_thanh" &&
            typeof mon.diemHe10 === "number" &&
            typeof mon.soTinChi === "number" &&
            mon.soTinChi > 0
    );

    if (monDaHoanThanh.length === 0) {
        return Number((0).toFixed(2));
    }

    const { tongDiemTrongSo, tongTinChi } = monDaHoanThanh.reduce(
        (acc, mon) => {
            const { diemHe4 } = quyDoiDiemHe4(mon.diemHe10);
            if (diemHe4 !== null) {
                acc.tongDiemTrongSo += diemHe4 * mon.soTinChi;
                acc.tongTinChi += mon.soTinChi;
            }
            return acc;
        },
        { tongDiemTrongSo: 0, tongTinChi: 0 }
    );

    if (tongTinChi === 0) {
        return Number((0).toFixed(2));
    }

    return Number((tongDiemTrongSo / tongTinChi).toFixed(2));
}

/**
 * Xếp loại học lực dựa trên điểm GPA hệ 4.
 * @param {number} gpa - Điểm trung bình tích lũy hệ 4.
 * @returns {string} Chuỗi xếp loại học lực tương ứng.
 */
function xepLoaiHocLuc(gpa) {
    const diemGPA = Number(gpa);

    if (Number.isNaN(diemGPA) || diemGPA < 2.0) {
        return "Yếu (Cảnh báo học vụ)";
    }
    if (diemGPA >= 3.6) return "Xuất sắc";
    if (diemGPA >= 3.2) return "Giỏi";
    if (diemGPA >= 2.5) return "Khá";
    return "Trung bình";
}

/**
 * Trả về cấu hình màu sắc và thông điệp trạng thái theo mức GPA,
 * hài hòa với bảng màu Teal - Vàng ấm - Kem sáng của Dashboard.
 * @param {number} gpa - Điểm trung bình tích lũy hệ 4.
 * @returns {{ textColor: string, bgColor: string, borderColor: string, badgeClass: string, thongBao: string }}
 */
function layTrangThaiMauSac(gpa) {
    const diemGPA = Number(gpa);

    if (Number.isNaN(diemGPA) || diemGPA < 2.0) {
        return {
            textColor: "#DC2626",
            bgColor: "#FEE2E2",
            borderColor: "#FCA5A5",
            badgeClass: "status-danger",
            thongBao: "Cảnh báo: GPA dưới 2.0"
        };
    }

    if (diemGPA < 2.5) {
        return {
            textColor: "#D97706",
            bgColor: "#FEF3C7",
            borderColor: "#FCD34D",
            badgeClass: "status-warning",
            thongBao: "Cần cải thiện điểm số"
        };
    }

    if (diemGPA < 3.2) {
        return {
            textColor: "#B45309",
            bgColor: "#FEF9C3",
            borderColor: "#FDE047",
            badgeClass: "status-good",
            thongBao: "Tiến độ ổn định"
        };
    }

    return {
        textColor: "#0F766E",
        bgColor: "#CCFBF1",
        borderColor: "#5EEAD4",
        badgeClass: "status-excellent",
        thongBao: "Phong độ xuất sắc"
    };
}

/**
 * Tổng hợp toàn bộ chỉ số học tập để sẵn sàng đổ dữ liệu ra giao diện Dashboard.
 * @param {Array<Object>} dsMon - Danh sách các môn học đầu vào.
 * @returns {{
 *   gpaHe4: number,
 *   xepLoai: string,
 *   mauSac: Object,
 *   tongTinChiTichLuy: number,
 *   soMonHoanThanh: number,
 *   danhSachChiTiet: Array<Object>
 * }}
 */
function tongHopDashboard(dsMon) {
    const danhSachAnToan = Array.isArray(dsMon) ? dsMon : [];
    const gpaHe4 = tinhGPAHe4(danhSachAnToan);
    const xepLoai = xepLoaiHocLuc(gpaHe4);
    const mauSac = layTrangThaiMauSac(gpaHe4);

    // Gắn thêm điểm hệ 4 và điểm chữ vào bản sao của từng môn học
    const danhSachChiTiet = danhSachAnToan.map((mon) => {
        const { diemHe4, diemChu } = quyDoiDiemHe4(mon.diemHe10);
        return {
            ...mon,
            diemHe4,
            diemChu
        };
    });

    // Thống kê số môn đã hoàn thành và tổng tín chỉ tích lũy
    const monHoanThanh = danhSachChiTiet.filter((mon) => mon.trangThai === "da_hoan_thanh");
    const soMonHoanThanh = monHoanThanh.length;
    const tongTinChiTichLuy = monHoanThanh.reduce((tong, mon) => tong + (mon.soTinChi || 0), 0);

    return {
        gpaHe4,
        xepLoai,
        mauSac,
        tongTinChiTichLuy,
        soMonHoanThanh,
        danhSachChiTiet
    };
}

/**
 * Tự động sinh mã môn học mới không trùng lặp theo định dạng MH011, MH012...
 * @param {Array<Object>} dsMon - Danh sách môn học hiện có.
 * @returns {string} Mã môn học duy nhất mới.
 */
function taoMaMonMoi(dsMon) {
    const tapMaHienCo = new Set(dsMon.map((mon) => mon.maMon));
    let soThuTu = dsMon.length + 1;

    while (tapMaHienCo.has(`MH${String(soThuTu).padStart(3, "0")}`)) {
        soThuTu += 1;
    }

    return `MH${String(soThuTu).padStart(3, "0")}`;
}

/**
 * Thoát ký tự HTML đặc biệt để đảm bảo an toàn khi hiển thị tên môn người dùng nhập.
 * @param {string} chuoi - Chuỗi văn bản đầu vào.
 * @returns {string} Chuỗi đã được thoát ký tự HTML.
 */
function thoatKyTuHTML(chuoi) {
    return String(chuoi)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// 3. HÀM CẬP NHẬT GIAO DIỆN (DOM HELPERS)

/**
 * Trả về cấu hình hiển thị (nhãn, class CSS, phần trăm tiến độ) cho từng trạng thái môn học.
 * @param {string} trangThai - Trạng thái môn học ("da_hoan_thanh" | "dang_hoc" | "chua_hoc").
 * @returns {{ nhan: string, cardClass: string, badgeClass: string, phanTram: number }}
 */
function layCauHinhTrangThaiMon(trangThai) {
    if (trangThai === "da_hoan_thanh") {
        return {
            nhan: "Đã hoàn thành",
            cardClass: "course-card--completed",
            badgeClass: "status-badge--completed",
            phanTram: 100
        };
    }
    if (trangThai === "dang_hoc") {
        return {
            nhan: "Đang học",
            cardClass: "course-card--in-progress",
            badgeClass: "status-badge--in-progress",
            phanTram: 55
        };
    }
    return {
        nhan: "Chưa học",
        cardClass: "course-card--upcoming",
        badgeClass: "status-badge--upcoming",
        phanTram: 0
    };
}

/**
 * Hiển thị thông báo ngay dưới form nhập liệu (thay thế hoàn toàn cho alert()).
 * @param {string} noiDung - Nội dung thông báo cần hiển thị.
 * @param {"success"|"error"|"info"} [loai="info"] - Loại thông báo quyết định màu sắc.
 */
function hienThiThongBaoForm(noiDung, loai = "info") {
    const messageEl = document.getElementById("form-message");
    if (!messageEl) return;

    messageEl.classList.remove("form-message--success", "form-message--error", "form-message--info");
    if (!noiDung) {
        messageEl.textContent = "";
        return;
    }

    messageEl.classList.add(`form-message--${loai}`);
    messageEl.textContent = noiDung;
}

/**
 * Cập nhật khối Tổng quan GPA, xếp loại, tín chỉ tích lũy, màu cảnh báo và Progress Bar tổng quan.
 * @param {Array<Object>} [dsMon=danhSachMonHoc] - Danh sách môn học dùng để hiển thị.
 * @returns {Object} Đối tượng dữ liệu tổng hợp vừa được cập nhật.
 */
function capNhatGiaoDienGPA(dsMon = danhSachMonHoc) {
    const duLieu = tongHopDashboard(dsMon);
    const { gpaHe4, xepLoai, mauSac, tongTinChiTichLuy, soMonHoanThanh, danhSachChiTiet } = duLieu;
    const cacClassTrangThai = ["status-danger", "status-warning", "status-good", "status-excellent"];
    const tongSoMon = danhSachChiTiet.length;
    const phanTramHoanThanh = tongSoMon > 0 ? Math.round((soMonHoanThanh / tongSoMon) * 100) : 0;

    // Hàm nội bộ áp dụng màu sắc và class trạng thái cho huy hiệu
    const apDungMauTrangThai = (el) => {
        el.classList.remove(...cacClassTrangThai);
        el.classList.add(mauSac.badgeClass);
        el.style.color = mauSac.textColor;
        el.style.backgroundColor = mauSac.bgColor;
        el.style.borderColor = mauSac.borderColor;
    };

    // Cập nhật điểm GPA hệ 4
    const gpaEl = document.getElementById("gpa-value");
    if (gpaEl) {
        gpaEl.textContent = gpaHe4.toFixed(2);
        gpaEl.style.color = mauSac.textColor;
    }

    // Đổi màu viền trên thẻ Tổng quan GPA để cảnh báo trực quan khi GPA thay đổi
    const overallCard = document.querySelector(".overall-progress-card");
    if (overallCard) {
        overallCard.style.borderTopColor = mauSac.textColor;
    }

    // Cập nhật xếp loại học lực
    const rankEl = document.getElementById("gpa-rank");
    if (rankEl) {
        rankEl.textContent = xepLoai;
        apDungMauTrangThai(rankEl);
    }

    // Cập nhật huy hiệu trạng thái GPA
    const badgeEl = document.getElementById("gpa-badge");
    if (badgeEl) {
        badgeEl.textContent = mauSac.thongBao;
        apDungMauTrangThai(badgeEl);
    }

    // Cập nhật thông báo chi tiết GPA
    const messageEl = document.getElementById("gpa-message");
    if (messageEl) {
        messageEl.textContent = `${mauSac.thongBao} • Xếp loại ${xepLoai} (${gpaHe4.toFixed(2)}/4.00)`;
        messageEl.style.color = mauSac.textColor;
    }

    // Cập nhật tổng tín chỉ tích lũy
    const creditsEl = document.getElementById("total-credits");
    if (creditsEl) {
        creditsEl.textContent = `${tongTinChiTichLuy} tín chỉ`;
    }

    // Cập nhật số môn đã hoàn thành
    const completedEl = document.getElementById("completed-courses");
    if (completedEl) {
        completedEl.textContent = `${soMonHoanThanh} / ${tongSoMon} môn`;
    }

    // Cập nhật thanh Progress Bar tổng quan chương trình
    const percentEl = document.getElementById("overall-progress-percent");
    if (percentEl) {
        percentEl.textContent = `${phanTramHoanThanh}%`;
    }

    const progressBarEl = document.getElementById("overall-progress-bar");
    if (progressBarEl) {
        progressBarEl.setAttribute("aria-valuenow", String(phanTramHoanThanh));
    }

    const progressFillEl = document.getElementById("overall-progress-fill");
    if (progressFillEl) {
        progressFillEl.style.setProperty("--percent", `${phanTramHoanThanh}%`);
    }

    const progressNoteEl = document.getElementById("overall-progress-note");
    if (progressNoteEl) {
        progressNoteEl.textContent = `Đã hoàn thành ${soMonHoanThanh}/${tongSoMon} môn (${tongTinChiTichLuy} tín chỉ)`;
    }

    return duLieu;
}

/**
 * Render danh sách các thẻ <article> môn học có áp dụng bộ lọc trạng thái, tìm kiếm
 * và hỗ trợ khung sửa trực tiếp cùng nút Sửa điểm / Xóa trên từng thẻ.
 * @param {Object} duLieu - Đối tượng kết quả trả về từ tongHopDashboard().
 */
function renderDanhSachMonHoc(duLieu) {
    const container = document.getElementById("course-list");
    if (!container) return;

    const tuKhoa = trangThaiGiaoDien.tuKhoaTimKiem.trim().toLowerCase();
    const boLoc = trangThaiGiaoDien.boLocTrangThai;

    // Lọc đồng thời theo trạng thái và từ khóa tìm kiếm tên/mã môn
    const danhSachHienThi = duLieu.danhSachChiTiet.filter((mon) => {
        const khopTrangThai = boLoc === "tat_ca" || mon.trangThai === boLoc;
        const khopTuKhoa =
            tuKhoa === "" ||
            mon.tenMon.toLowerCase().includes(tuKhoa) ||
            mon.maMon.toLowerCase().includes(tuKhoa);
        return khopTrangThai && khopTuKhoa;
    });

    // Cập nhật bộ đếm số môn đang hiển thị trên thanh công cụ
    const countEl = document.getElementById("course-filter-count");
    if (countEl) {
        countEl.textContent = `${danhSachHienThi.length} / ${duLieu.danhSachChiTiet.length} môn`;
    }

    if (danhSachHienThi.length === 0) {
        container.innerHTML = `
            <article class="card course-card">
                <h3 class="course-title">Không tìm thấy môn học phù hợp</h3>
                <p class="course-desc">Hãy thử từ khóa tìm kiếm khác hoặc chuyển bộ lọc sang “Tất cả trạng thái”.</p>
            </article>
        `;
        return;
    }

    container.innerHTML = danhSachHienThi
        .map((mon, chiSo) => {
            const cauHinh = layCauHinhTrangThaiMon(mon.trangThai);
            const hienThiDiem10 = mon.diemHe10 !== null ? mon.diemHe10.toFixed(1) : "—";
            const hienThiDiem4 = mon.diemHe4 !== null ? mon.diemHe4.toFixed(1) : "—";
            const chipHighlight = mon.diemChu === "A" ? "metric-chip--accent" : "";
            const doTreMs = Math.min(chiSo * 45, 360);
            const tenAnToan = thoatKyTuHTML(mon.tenMon);
            const maAnToan = thoatKyTuHTML(mon.maMon);
            const dangSua = trangThaiGiaoDien.maMonDangSua === mon.maMon;

            // Khung chỉnh sửa trực tiếp trạng thái và điểm hệ 10 ngay trong thẻ môn học
            const khungSuaHTML = dangSua
                ? `
                    <div class="course-edit-panel" data-edit-panel="${maAnToan}">
                        <div class="course-edit-row">
                            <div class="course-edit-field">
                                <label class="course-edit-label" for="edit-status-${maAnToan}">Trạng thái</label>
                                <select id="edit-status-${maAnToan}" class="form-control course-edit-control" data-edit-status>
                                    <option value="da_hoan_thanh" ${mon.trangThai === "da_hoan_thanh" ? "selected" : ""}>Đã hoàn thành</option>
                                    <option value="dang_hoc" ${mon.trangThai === "dang_hoc" ? "selected" : ""}>Đang học</option>
                                    <option value="chua_hoc" ${mon.trangThai === "chua_hoc" ? "selected" : ""}>Chưa học</option>
                                </select>
                            </div>
                            <div class="course-edit-field">
                                <label class="course-edit-label" for="edit-score-${maAnToan}">Điểm hệ 10</label>
                                <input
                                    type="number"
                                    id="edit-score-${maAnToan}"
                                    class="form-control course-edit-control"
                                    data-edit-score
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value="${mon.diemHe10 !== null ? mon.diemHe10 : ""}"
                                    placeholder="0 – 10"
                                    ${mon.trangThai !== "da_hoan_thanh" ? "disabled" : ""}
                                >
                            </div>
                        </div>
                        <div class="course-edit-actions">
                            <button type="button" class="action-btn action-btn--save" data-action="save-edit" data-id="${maAnToan}">Lưu thay đổi</button>
                            <button type="button" class="action-btn action-btn--cancel" data-action="cancel-edit" data-id="${maAnToan}">Hủy</button>
                        </div>
                    </div>
                `
                : `
                    <div class="course-actions">
                        <button type="button" class="action-btn action-btn--edit" data-action="edit" data-id="${maAnToan}">Sửa điểm</button>
                        <button type="button" class="action-btn action-btn--delete" data-action="delete" data-id="${maAnToan}">Xóa</button>
                    </div>
                `;

            return `
                <article class="card course-card course-card--animate ${cauHinh.cardClass}" data-course-id="${maAnToan}" style="--stagger: ${doTreMs}ms;">
                    <div class="course-header">
                        <span class="course-stage">Học kỳ ${mon.hocKy} &bull; ${maAnToan}</span>
                        <span class="status-badge ${cauHinh.badgeClass}">${cauHinh.nhan}</span>
                    </div>
                    <h3 class="course-title">${tenAnToan}</h3>
                    <div class="course-metrics">
                        <div class="metric-chip">
                            <span class="metric-label">Tín chỉ</span>
                            <span class="metric-value">${mon.soTinChi} TC</span>
                        </div>
                        <div class="metric-chip">
                            <span class="metric-label">Hệ 10</span>
                            <span class="metric-value">${hienThiDiem10}</span>
                        </div>
                        <div class="metric-chip ${chipHighlight}">
                            <span class="metric-label">Hệ 4 / Chữ</span>
                            <span class="metric-value">${hienThiDiem4} (${mon.diemChu})</span>
                        </div>
                    </div>
                    <div class="course-progress">
                        <div class="progress-info">
                            <span class="progress-label">Tiến độ môn học</span>
                            <span class="progress-value">${cauHinh.phanTram}%</span>
                        </div>
                        <div class="progress-bar" role="progressbar" aria-label="Tiến độ môn ${tenAnToan}" aria-valuenow="${cauHinh.phanTram}" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-track">
                                <div class="progress-fill" style="--percent: ${cauHinh.phanTram}%;"></div>
                            </div>
                        </div>
                    </div>
                    ${khungSuaHTML}
                </article>
            `;
        })
        .join("");
}

/**
 * Render biểu đồ cột điểm số các môn đã hoàn thành vào Section "Biểu đồ tiến độ".
 * @param {Object} duLieu - Đối tượng kết quả trả về từ tongHopDashboard().
 */
function renderBieuDoDiem(duLieu) {
    const chartBarsEl = document.getElementById("chart-bars");
    if (!chartBarsEl) return;

    const monCoDiem = duLieu.danhSachChiTiet.filter(
        (mon) => mon.trangThai === "da_hoan_thanh" && typeof mon.diemHe10 === "number"
    );

    if (monCoDiem.length === 0) {
        chartBarsEl.innerHTML = `<p class="section-desc">Chưa có môn học đã hoàn thành để vẽ biểu đồ điểm số.</p>`;
        return;
    }

    // Tìm điểm cao nhất để làm nổi bật bằng màu vàng ấm
    const diemCaoNhat = Math.max(...monCoDiem.map((mon) => mon.diemHe10));

    chartBarsEl.innerHTML = monCoDiem
        .map((mon) => {
            const phanTram = Math.round(mon.diemHe10 * 10);
            const laCaoNhat = mon.diemHe10 === diemCaoNhat ? "chart-column--highest" : "";
            const tenAnToan = thoatKyTuHTML(mon.tenMon);
            const tenNgan = mon.tenMon.length > 14 ? `${thoatKyTuHTML(mon.tenMon.slice(0, 13))}…` : tenAnToan;

            return `
                <div class="chart-column ${laCaoNhat}" style="--percent: ${phanTram}%;" title="${tenAnToan}: ${mon.diemHe10.toFixed(1)}/10 (${mon.diemChu})">
                    <span class="bar-value">${mon.diemHe10.toFixed(1)} (${mon.diemChu})</span>
                    <div class="bar-track">
                        <div class="bar-fill"></div>
                    </div>
                    <span class="bar-label">
                        ${thoatKyTuHTML(mon.maMon)}
                        <span class="bar-sublabel">${tenNgan}</span>
                    </span>
                </div>
            `;
        })
        .join("");
}

/**
 * Render danh sách các môn đang học & sắp học vào khối <aside> Trọng tâm học kỳ.
 * @param {Object} duLieu - Đối tượng kết quả trả về từ tongHopDashboard().
 */
function renderMonDangHoc(duLieu) {
    const listEl = document.getElementById("active-courses-list");
    if (!listEl) return;

    const monCanChuY = duLieu.danhSachChiTiet.filter((mon) => mon.trangThai !== "da_hoan_thanh");

    if (monCanChuY.length === 0) {
        listEl.innerHTML = `
            <li class="goal-item">
                <span class="goal-text">Bạn đã hoàn thành toàn bộ các môn trong lộ trình!</span>
                <span class="goal-tag">100%</span>
            </li>
        `;
        return;
    }

    listEl.innerHTML = monCanChuY
        .map((mon) => {
            const laChuaHoc = mon.trangThai === "chua_hoc";
            const itemClass = laChuaHoc ? "goal-item--upcoming" : "";
            const nhanTrangThai = laChuaHoc ? `HK${mon.hocKy} • Sắp học` : `HK${mon.hocKy} • Đang học`;

            return `
                <li class="goal-item ${itemClass}">
                    <span class="goal-text"><strong>${thoatKyTuHTML(mon.maMon)}</strong> – ${thoatKyTuHTML(mon.tenMon)} (${mon.soTinChi} TC)</span>
                    <span class="goal-tag">${nhanTrangThai}</span>
                </li>
            `;
        })
        .join("");
}

/**
 * Đồng bộ lại toàn bộ Dashboard theo thời gian thực sau mỗi lần Thêm / Sửa / Xóa / Khôi phục.
 * @returns {Object} Đối tượng tổng hợp mới nhất.
 */
function dongBoToanBoDashboard() {
    const ketQuaMoi = capNhatGiaoDienGPA(danhSachMonHoc);
    renderDanhSachMonHoc(ketQuaMoi);
    renderBieuDoDiem(ketQuaMoi);
    renderMonDangHoc(ketQuaMoi);
    return ketQuaMoi;
}

// 4. XỬ LÝ SỰ KIỆN FORM THÊM MÔN, EVENT DELEGATION (SỬA/XÓA) & LỌC TÌM KIẾM

/**
 * Gắn sự kiện cho form thêm môn học, tự động khóa ô điểm hệ 10 theo trạng thái
 * và nút khôi phục dữ liệu mẫu.
 */
function khoiTaoFormNhapLieu() {
    const formEl = document.getElementById("course-form");
    const nameInput = document.getElementById("input-course-name");
    const semesterSelect = document.getElementById("input-semester");
    const creditsInput = document.getElementById("input-credits");
    const statusSelect = document.getElementById("input-status");
    const scoreInput = document.getElementById("input-score");
    const resetBtn = document.getElementById("btn-reset-data");

    if (!formEl || !nameInput || !semesterSelect || !creditsInput || !statusSelect || !scoreInput) {
        return;
    }

    // Tự động khóa ô điểm hệ 10 khi trạng thái không phải "Đã hoàn thành"
    const dongBoTrangThaiODiem = () => {
        const daHoanThanh = statusSelect.value === "da_hoan_thanh";
        scoreInput.disabled = !daHoanThanh;
        scoreInput.required = daHoanThanh;
        if (!daHoanThanh) {
            scoreInput.value = "";
            scoreInput.placeholder = "Chỉ nhập khi đã hoàn thành";
        } else {
            scoreInput.placeholder = "0.0 – 10.0";
        }
    };

    statusSelect.addEventListener("change", dongBoTrangThaiODiem);
    dongBoTrangThaiODiem();

    // Xử lý sự kiện submit thêm môn học mới
    formEl.addEventListener("submit", (event) => {
        event.preventDefault();

        const tenMon = nameInput.value.trim();
        const hocKy = Number.parseInt(semesterSelect.value, 10);
        const soTinChi = Number.parseInt(creditsInput.value, 10);
        const trangThai = statusSelect.value;

        if (!tenMon) {
            hienThiThongBaoForm("Vui lòng nhập tên môn học trước khi thêm.", "error");
            nameInput.focus();
            return;
        }

        if (Number.isNaN(hocKy) || hocKy < 1 || hocKy > 8) {
            hienThiThongBaoForm("Học kỳ không hợp lệ (chỉ chấp nhận từ Học kỳ 1 đến Học kỳ 8).", "error");
            semesterSelect.focus();
            return;
        }

        if (Number.isNaN(soTinChi) || soTinChi < 1 || soTinChi > 10) {
            hienThiThongBaoForm("Số tín chỉ phải là số nguyên trong khoảng từ 1 đến 10.", "error");
            creditsInput.focus();
            return;
        }

        let diemHe10 = null;
        if (trangThai === "da_hoan_thanh") {
            const giaTriDiem = Number.parseFloat(scoreInput.value);
            if (scoreInput.value.trim() === "" || Number.isNaN(giaTriDiem) || giaTriDiem < 0 || giaTriDiem > 10) {
                hienThiThongBaoForm("Với môn đã hoàn thành, vui lòng nhập điểm hệ 10 hợp lệ từ 0.0 đến 10.0.", "error");
                scoreInput.focus();
                return;
            }
            diemHe10 = Number(giaTriDiem.toFixed(1));
        }

        const monMoi = {
            maMon: taoMaMonMoi(danhSachMonHoc),
            tenMon,
            hocKy,
            soTinChi,
            diemHe10,
            trangThai
        };

        danhSachMonHoc.push(monMoi);
        luuDuLieuVaoStorage(danhSachMonHoc);
        trangThaiGiaoDien.maMonDangSua = null;

        formEl.reset();
        semesterSelect.value = "4";
        creditsInput.value = "3";
        statusSelect.value = "da_hoan_thanh";
        dongBoTrangThaiODiem();

        const ketQua = dongBoToanBoDashboard();
        hienThiThongBaoForm(
            `Đã thêm môn “${monMoi.tenMon}” (${monMoi.maMon}). GPA hiện tại: ${ketQua.gpaHe4.toFixed(2)} (${ketQua.xepLoai}).`,
            "success"
        );
    });

    // Nút khôi phục dữ liệu mẫu mặc định và xóa dữ liệu lưu trong localStorage
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (typeof localStorage !== "undefined") {
                try {
                    localStorage.removeItem(STORAGE_KEY_MON_HOC);
                } catch (err) {
                    // Bỏ qua nếu không truy cập được localStorage
                }
            }

            danhSachMonHoc = taoBanSaoDuLieuMau();
            trangThaiGiaoDien.boLocTrangThai = "tat_ca";
            trangThaiGiaoDien.tuKhoaTimKiem = "";
            trangThaiGiaoDien.maMonDangSua = null;

            const searchEl = document.getElementById("search-course");
            const filterEl = document.getElementById("filter-status");
            if (searchEl) searchEl.value = "";
            if (filterEl) filterEl.value = "tat_ca";

            const ketQua = dongBoToanBoDashboard();
            hienThiThongBaoForm(
                `Đã khôi phục 10 môn học mẫu ban đầu. GPA hiện tại: ${ketQua.gpaHe4.toFixed(2)} (${ketQua.xepLoai}).`,
                "info"
            );
        });
    }
}

/**
 * Sử dụng Event Delegation trên #course-list để xử lý Sửa điểm, Lưu, Hủy và Xóa môn học.
 */
function khoiTaoThaoTacDanhSach() {
    const container = document.getElementById("course-list");
    if (!container) return;

    // Lắng nghe thay đổi trạng thái trong khung sửa trực tiếp để tự khóa/mở ô điểm
    container.addEventListener("change", (event) => {
        const statusEl = event.target.closest("[data-edit-status]");
        if (!statusEl) return;

        const panel = statusEl.closest(".course-edit-panel");
        const scoreEl = panel ? panel.querySelector("[data-edit-score]") : null;
        if (!scoreEl) return;

        const daHoanThanh = statusEl.value === "da_hoan_thanh";
        scoreEl.disabled = !daHoanThanh;
        if (!daHoanThanh) {
            scoreEl.value = "";
        } else {
            scoreEl.focus();
        }
    });

    // Lắng nghe các nút Sửa điểm / Lưu / Hủy / Xóa qua Event Delegation
    container.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-action]");
        if (!btn) return;

        const hanhDong = btn.getAttribute("data-action");
        const maMon = btn.getAttribute("data-id");
        if (!maMon) return;

        // 1. Xóa môn học khỏi mảng
        if (hanhDong === "delete") {
            const monBiXoa = danhSachMonHoc.find((mon) => mon.maMon === maMon);
            if (!monBiXoa) return;

            danhSachMonHoc = danhSachMonHoc.filter((mon) => mon.maMon !== maMon);
            if (trangThaiGiaoDien.maMonDangSua === maMon) {
                trangThaiGiaoDien.maMonDangSua = null;
            }

            luuDuLieuVaoStorage(danhSachMonHoc);
            const ketQua = dongBoToanBoDashboard();
            hienThiThongBaoForm(
                `Đã xóa môn “${monBiXoa.tenMon}” (${monBiXoa.maMon}). GPA cập nhật: ${ketQua.gpaHe4.toFixed(2)} (${ketQua.xepLoai}).`,
                "info"
            );
            return;
        }

        // 2. Mở khung sửa điểm & trạng thái trực tiếp trên thẻ môn học
        if (hanhDong === "edit") {
            trangThaiGiaoDien.maMonDangSua = maMon;
            renderDanhSachMonHoc(tongHopDashboard(danhSachMonHoc));
            return;
        }

        // 3. Hủy chế độ sửa
        if (hanhDong === "cancel-edit") {
            trangThaiGiaoDien.maMonDangSua = null;
            renderDanhSachMonHoc(tongHopDashboard(danhSachMonHoc));
            return;
        }

        // 4. Lưu điểm hệ 10 & trạng thái mới cho môn học
        if (hanhDong === "save-edit") {
            const panel = btn.closest(".course-edit-panel");
            const statusEl = panel ? panel.querySelector("[data-edit-status]") : null;
            const scoreEl = panel ? panel.querySelector("[data-edit-score]") : null;
            const monCanSua = danhSachMonHoc.find((mon) => mon.maMon === maMon);
            if (!monCanSua || !statusEl || !scoreEl) return;

            const trangThaiMoi = statusEl.value;
            let diemMoi = null;

            if (trangThaiMoi === "da_hoan_thanh") {
                const giaTriDiem = Number.parseFloat(scoreEl.value);
                if (scoreEl.value.trim() === "" || Number.isNaN(giaTriDiem) || giaTriDiem < 0 || giaTriDiem > 10) {
                    hienThiThongBaoForm(
                        `Không thể lưu môn “${monCanSua.tenMon}”: điểm hệ 10 phải nằm trong khoảng 0.0 – 10.0.`,
                        "error"
                    );
                    scoreEl.focus();
                    return;
                }
                diemMoi = Number(giaTriDiem.toFixed(1));
            }

            monCanSua.trangThai = trangThaiMoi;
            monCanSua.diemHe10 = diemMoi;
            trangThaiGiaoDien.maMonDangSua = null;

            luuDuLieuVaoStorage(danhSachMonHoc);
            const ketQua = dongBoToanBoDashboard();
            hienThiThongBaoForm(
                `Đã cập nhật môn “${monCanSua.tenMon}”. GPA mới: ${ketQua.gpaHe4.toFixed(2)} (${ketQua.xepLoai}).`,
                "success"
            );
        }
    });
}

/**
 * Lắng nghe sự kiện input (tìm kiếm tên môn) và change (chọn trạng thái lọc) theo thời gian thực.
 */
function khoiTaoBoLocVaTimKiem() {
    const searchInput = document.getElementById("search-course");
    const filterSelect = document.getElementById("filter-status");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            trangThaiGiaoDien.tuKhoaTimKiem = searchInput.value;
            renderDanhSachMonHoc(tongHopDashboard(danhSachMonHoc));
        });
    }

    if (filterSelect) {
        filterSelect.addEventListener("change", () => {
            trangThaiGiaoDien.boLocTrangThai = filterSelect.value;
            renderDanhSachMonHoc(tongHopDashboard(danhSachMonHoc));
        });
    }
}

// 5. HIỆU ỨNG TƯƠNG TÁC HIỆN ĐẠI (COUNT-UP, SCROLL REVEAL, SCROLL-SPY, BACK TO TOP)

/**
 * Tạo hiệu ứng đếm số mượt mà (Ease-Out Cubic) cho các chỉ số GPA, phần trăm và tín chỉ lúc mới tải trang.
 * @param {HTMLElement|null} el - Phần tử DOM hiển thị con số.
 * @param {number} giaTriDich - Giá trị đích cần đếm tới.
 * @param {Function} dinhDang - Hàm định dạng chuỗi hiển thị từ giá trị hiện tại.
 * @param {number} [thoiLuong=850] - Thời lượng hiệu ứng (ms).
 */
function chayHieuUngDemSo(el, giaTriDich, dinhDang, thoiLuong = 850) {
    if (!el || typeof window === "undefined") return;

    const giamChuyenDong =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (giamChuyenDong || typeof window.requestAnimationFrame !== "function") {
        el.textContent = dinhDang(giaTriDich);
        return;
    }

    const thoiDiemBatDau = performance.now();
    const buocCapNhat = (thoiDiemHienTai) => {
        const tienTrinh = Math.min((thoiDiemHienTai - thoiDiemBatDau) / thoiLuong, 1);
        const heSoMuot = 1 - Math.pow(1 - tienTrinh, 3);
        el.textContent = dinhDang(giaTriDich * heSoMuot);

        if (tienTrinh < 1) {
            window.requestAnimationFrame(buocCapNhat);
        } else {
            el.textContent = dinhDang(giaTriDich);
        }
    };

    window.requestAnimationFrame(buocCapNhat);
}

/**
 * Kích hoạt hiệu ứng xuất hiện mượt khi cuộn trang, thanh tiến trình cuộn,
 * Scroll-Spy cho thanh điều hướng và nút quay về đầu trang.
 * @param {Object} duLieu - Đối tượng kết quả tổng hợp ban đầu từ tongHopDashboard().
 */
function khoiTaoHieuUngHienDai(duLieu) {
    const tongSoMon = duLieu.danhSachChiTiet.length;
    const phanTramHoanThanh = tongSoMon > 0 ? Math.round((duLieu.soMonHoanThanh / tongSoMon) * 100) : 0;

    chayHieuUngDemSo(document.getElementById("gpa-value"), duLieu.gpaHe4, (val) => val.toFixed(2), 850);
    chayHieuUngDemSo(
        document.getElementById("overall-progress-percent"),
        phanTramHoanThanh,
        (val) => `${Math.round(val)}%`,
        800
    );
    chayHieuUngDemSo(
        document.getElementById("total-credits"),
        duLieu.tongTinChiTichLuy,
        (val) => `${Math.round(val)} tín chỉ`,
        750
    );

    // Scroll Reveal bằng IntersectionObserver
    const cacPhanKhu = document.querySelectorAll(".dashboard-section, .dashboard-aside");
    if ("IntersectionObserver" in window) {
        const quanSat = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.06, rootMargin: "0px 0px -25px 0px" }
        );

        cacPhanKhu.forEach((section) => {
            section.classList.add("reveal");
            quanSat.observe(section);
        });
    }

    // Thanh tiến trình cuộn, Scroll-Spy và nút Quay về đầu trang
    const thanhCuon = document.getElementById("scroll-progress");
    const nutLenDauTrang = document.getElementById("back-to-top");
    const cacLienKetNav = document.querySelectorAll(".nav-link");

    const capNhatTheoViTriCuon = () => {
        const viTriCuon = window.scrollY || document.documentElement.scrollTop;
        const chieuCaoCoTheCuon =
            document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (thanhCuon && chieuCaoCoTheCuon > 0) {
            const tyLeCuon = Math.min((viTriCuon / chieuCaoCoTheCuon) * 100, 100);
            thanhCuon.style.width = `${tyLeCuon}%`;
        }

        if (nutLenDauTrang) {
            nutLenDauTrang.classList.toggle("back-to-top--visible", viTriCuon > 240);
        }

        let idDangXem = "overview";
        cacPhanKhu.forEach((section) => {
            if (viTriCuon >= section.offsetTop - 150) {
                idDangXem = section.id;
            }
        });

        cacLienKetNav.forEach((link) => {
            const laMucHienTai = link.getAttribute("href") === `#${idDangXem}`;
            link.classList.toggle("nav-link--active", laMucHienTai);
        });
    };

    window.addEventListener("scroll", capNhatTheoViTriCuon, { passive: true });
    capNhatTheoViTriCuon();

    if (nutLenDauTrang) {
        nutLenDauTrang.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

// 6. KHỞI CHẠY & KIỂM TRA DỮ LIỆU KHI TẢI TRANG

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        const ketQuaDashboard = dongBoToanBoDashboard();
        khoiTaoFormNhapLieu();
        khoiTaoThaoTacDanhSach();
        khoiTaoBoLocVaTimKiem();
        khoiTaoHieuUngHienDai(ketQuaDashboard);

        // In bảng tổng quan và danh sách môn học chi tiết ra Console để kiểm tra
        console.log("=== TỔNG HỢP DASHBOARD HỌC TẬP ===");
        console.table([
            {
                "GPA Hệ 4": ketQuaDashboard.gpaHe4.toFixed(2),
                "Xếp loại": ketQuaDashboard.xepLoai,
                "Tín chỉ tích lũy": ketQuaDashboard.tongTinChiTichLuy,
                "Số môn hoàn thành": ketQuaDashboard.soMonHoanThanh,
                "Trạng thái": ketQuaDashboard.mauSac.thongBao,
                "Class màu": ketQuaDashboard.mauSac.badgeClass
            }
        ]);

        console.log("=== DANH SÁCH MÔN HỌC CHI TIẾT ===");
        console.table(ketQuaDashboard.danhSachChiTiet);
    });
}
