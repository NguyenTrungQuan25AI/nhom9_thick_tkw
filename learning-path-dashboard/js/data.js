/**
 * Dữ liệu mẫu cho phân hệ "Dashboard Cá nhân & Lộ trình Học tập (The Learning Path)".
 * Toàn bộ dữ liệu được đóng băng (immutable) nhằm đảm bảo an toàn khi xử lý thuần túy.
 */

/**
 * Hồ sơ sinh viên mẫu.
 * @type {{
 *   studentId: string,
 *   fullName: string,
 *   major: string,
 *   totalCredits: number,
 *   currentSemester: number
 * }}
 */
var STUDENT_PROFILE = Object.freeze({
  studentId: "SV20240108",
  fullName: "Nguyễn Minh Khoa",
  major: "Kỹ thuật Phần mềm",
  totalCredits: 120,
  currentSemester: 4,
});

/**
 * Danh sách các môn học trong lộ trình học tập.
 * Trạng thái hợp lệ: "completed" | "in-progress" | "upcoming".
 * @type {ReadonlyArray<Readonly<{
 *   id: string,
 *   code: string,
 *   name: string,
 *   credits: number,
 *   score10: number | null,
 *   semester: number,
 *   status: "completed" | "in-progress" | "upcoming"
 * }>>}
 */
var LEARNING_COURSES = Object.freeze([
  Object.freeze({
    id: "c01",
    code: "INT1001",
    name: "Nhập môn Lập trình",
    credits: 3,
    score10: 8.8,
    semester: 1,
    status: "completed",
  }),
  Object.freeze({
    id: "c02",
    code: "MAT1002",
    name: "Toán rời rạc",
    credits: 3,
    score10: 7.4,
    semester: 1,
    status: "completed",
  }),
  Object.freeze({
    id: "c03",
    code: "INT1005",
    name: "Cấu trúc Dữ liệu & Giải thuật",
    credits: 4,
    score10: 8.2,
    semester: 2,
    status: "completed",
  }),
  Object.freeze({
    id: "c04",
    code: "INT1008",
    name: "Kiến trúc Máy tính & Hệ điều hành",
    credits: 3,
    score10: 6.7,
    semester: 2,
    status: "completed",
  }),
  Object.freeze({
    id: "c05",
    code: "INT2001",
    name: "Cơ sở Dữ liệu",
    credits: 3,
    score10: 5.8,
    semester: 3,
    status: "completed",
  }),
  Object.freeze({
    id: "c06",
    code: "INT2004",
    name: "Lập trình Hướng đối tượng",
    credits: 3,
    score10: 9.1,
    semester: 3,
    status: "completed",
  }),
  Object.freeze({
    id: "c07",
    code: "ENG2002",
    name: "Tiếng Anh Chuyên ngành CNTT",
    credits: 2,
    score10: 4.5,
    semester: 3,
    status: "completed",
  }),
  Object.freeze({
    id: "c08",
    code: "INT2010",
    name: "Phát triển Ứng dụng Web",
    credits: 4,
    score10: null,
    semester: 4,
    status: "in-progress",
  }),
  Object.freeze({
    id: "c09",
    code: "INT2012",
    name: "Công nghệ Phần mềm",
    credits: 3,
    score10: null,
    semester: 4,
    status: "in-progress",
  }),
  Object.freeze({
    id: "c10",
    code: "INT3001",
    name: "Kiểm thử & Đảm bảo Chất lượng Phần mềm",
    credits: 3,
    score10: null,
    semester: 5,
    status: "upcoming",
  }),
  Object.freeze({
    id: "c11",
    code: "INT3005",
    name: "Kiến trúc Phần mềm & Microservices",
    credits: 3,
    score10: null,
    semester: 5,
    status: "upcoming",
  }),
  Object.freeze({
    id: "c12",
    code: "INT4001",
    name: "Đồ án Tốt nghiệp Kỹ thuật Phần mềm",
    credits: 6,
    score10: null,
    semester: 6,
    status: "upcoming",
  }),
]);

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    STUDENT_PROFILE,
    LEARNING_COURSES,
  };
}

