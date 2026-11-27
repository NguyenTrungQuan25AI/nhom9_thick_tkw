/**
 * Bộ hàm xử lý thuần túy (Pure Functions) cho phân hệ
 * "Dashboard Cá nhân & Lộ trình Học tập (The Learning Path)".
 * Không phụ thuộc DOM, không gây tác dụng phụ và an toàn với các trường hợp biên.
 */

var {
  convertToScale4,
  calculateGPA4,
  getAcademicRank,
  getCompletionStats,
  getAcademicWarning,
  filterCourses,
} = (() => {
  /**
   * Bảng quy đổi điểm hệ 10 sang thang điểm 4 chuẩn (sắp xếp giảm dần theo ngưỡng).
   * @type {ReadonlyArray<{ minScore10: number, scale4: number }>}
   */
  const SCALE_4_THRESHOLDS = Object.freeze([
    { minScore10: 8.5, scale4: 4.0 },
    { minScore10: 8.0, scale4: 3.5 },
    { minScore10: 7.0, scale4: 3.0 },
    { minScore10: 6.5, scale4: 2.5 },
    { minScore10: 5.5, scale4: 2.0 },
    { minScore10: 5.0, scale4: 1.5 },
    { minScore10: 4.0, scale4: 1.0 },
    { minScore10: 0.0, scale4: 0.0 },
  ]);

  /**
   * Bảng xếp loại học lực theo GPA hệ 4 (sắp xếp giảm dần theo ngưỡng).
   * @type {ReadonlyArray<{ minGpa4: number, rank: string }>}
   */
  const ACADEMIC_RANK_THRESHOLDS = Object.freeze([
    { minGpa4: 3.6, rank: "Xuất sắc" },
    { minGpa4: 3.2, rank: "Giỏi" },
    { minGpa4: 2.5, rank: "Khá" },
    { minGpa4: 2.0, rank: "Trung bình" },
    { minGpa4: 0.0, rank: "Yếu / Cảnh báo" },
  ]);

  const WARNING_GPA_THRESHOLD = 2.0;

  /**
   * Kiểm tra giá trị có phải số hữu hạn trong khoảng [min, max] hay không.
   * @param {unknown} value
   * @param {number} min
   * @param {number} max
   * @returns {boolean}
   */
  function isFiniteNumberInRange(value, min, max) {
    return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
  }

  /**
   * Làm tròn số đến số chữ số thập phân chỉ định, tránh sai số dấu phẩy động.
   * @param {number} value
   * @param {number} decimals
   * @returns {number}
   */
  function roundTo(value, decimals) {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Giới hạn một giá trị số trong khoảng [min, max].
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Kiểm tra số tín chỉ hợp lệ (> 0).
   * @param {unknown} credits
   * @returns {boolean}
   */
  function hasValidCredits(credits) {
    return typeof credits === "number" && Number.isFinite(credits) && credits > 0;
  }

  /**
   * Quy đổi điểm hệ 10 sang thang điểm 4 chuẩn.
   * Trả về `null` nếu điểm là `null`, `undefined`, `NaN` hoặc nằm ngoài khoảng [0, 10].
   * @param {number | null | undefined} score10
   * @returns {number | null}
   */
  function convertToScale4(score10) {
    if (!isFiniteNumberInRange(score10, 0, 10)) {
      return null;
    }

    const matched = SCALE_4_THRESHOLDS.find((entry) => score10 >= entry.minScore10);
    return matched ? matched.scale4 : 0.0;
  }

  /**
   * Tính điểm trung bình tích lũy GPA hệ 4 có trọng số theo số tín chỉ.
   * Chỉ tính các môn có `score10` hợp lệ (khác `null` và thuộc [0, 10]) và `credits > 0`.
   * Trả về `0` nếu danh sách rỗng hoặc không có môn hợp lệ.
   * @param {ReadonlyArray<{ credits?: number, score10?: number | null }>} courses
   * @returns {number}
   */
  function calculateGPA4(courses) {
    if (!Array.isArray(courses) || courses.length === 0) {
      return 0;
    }

    let totalWeightedPoints = 0;
    let totalCredits = 0;

    for (const course of courses) {
      if (!course || typeof course !== "object" || !hasValidCredits(course.credits)) {
        continue;
      }

      const scale4 = convertToScale4(course.score10);
      if (scale4 === null) {
        continue;
      }

      totalWeightedPoints += scale4 * course.credits;
      totalCredits += course.credits;
    }

    if (totalCredits === 0) {
      return 0;
    }

    return roundTo(totalWeightedPoints / totalCredits, 2);
  }

  /**
   * Xếp loại học lực tương ứng với GPA hệ 4.
   * @param {number} gpa4
   * @returns {string}
   */
  function getAcademicRank(gpa4) {
    if (!isFiniteNumberInRange(gpa4, 0, 4)) {
      return "Chưa xếp loại";
    }

    const matched = ACADEMIC_RANK_THRESHOLDS.find((entry) => gpa4 >= entry.minGpa4);
    return matched ? matched.rank : "Yếu / Cảnh báo";
  }

  /**
   * Tính thống kê hoàn thành tín chỉ của lộ trình học tập.
   * Nếu `programTotalCredits` không hợp lệ hoặc <= 0, tự động lấy tổng tín chỉ các môn trong danh sách.
   * Tỷ lệ `%` hoàn thành luôn được giới hạn trong khoảng [0, 100].
   * @param {ReadonlyArray<{ credits?: number, status?: string }>} courses
   * @param {number} [programTotalCredits]
   * @returns {{
   *   completedCredits: number,
   *   totalCredits: number,
   *   remainingCredits: number,
   *   completionPercent: number
   * }}
   */
  function getCompletionStats(courses, programTotalCredits) {
    const safeCourses = Array.isArray(courses) ? courses : [];

    let completedCredits = 0;
    let roadmapCredits = 0;

    for (const course of safeCourses) {
      if (!course || typeof course !== "object" || !hasValidCredits(course.credits)) {
        continue;
      }

      roadmapCredits += course.credits;
      if (course.status === "completed") {
        completedCredits += course.credits;
      }
    }

    const totalCredits = hasValidCredits(programTotalCredits)
      ? programTotalCredits
      : roadmapCredits;

    const rawPercent = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;
    const completionPercent = roundTo(clamp(rawPercent, 0, 100), 1);
    const remainingCredits = Math.max(0, totalCredits - completedCredits);

    return {
      completedCredits,
      totalCredits,
      remainingCredits,
      completionPercent,
    };
  }

  /**
   * Đánh giá trạng thái cảnh báo học vụ dựa trên GPA hệ 4.
   * Ngưỡng cảnh báo: `gpa4 < 2.0` -> `isWarning: true`, `level: "danger"`.
   * @param {number} gpa4
   * @returns {{
   *   isWarning: boolean,
   *   level: "normal" | "danger",
   *   badgeText: string,
   *   message: string
   * }}
   */
  function getAcademicWarning(gpa4) {
    if (!isFiniteNumberInRange(gpa4, 0, 4)) {
      return {
        isWarning: false,
        level: "normal",
        badgeText: "Chưa có dữ liệu",
        message: "Chưa có dữ liệu GPA hợp lệ để đánh giá cảnh báo học vụ.",
      };
    }

    if (gpa4 < WARNING_GPA_THRESHOLD) {
      return {
        isWarning: true,
        level: "danger",
        badgeText: "Cảnh báo học vụ",
        message: `GPA tích lũy đạt ${gpa4.toFixed(2)} (dưới ngưỡng 2.00). Bạn thuộc diện cảnh báo học vụ và cần có kế hoạch cải thiện điểm số.`,
      };
    }

    return {
      isWarning: false,
      level: "normal",
      badgeText: "Học tập bình thường",
      message: `GPA tích lũy đạt ${gpa4.toFixed(2)} (từ 2.00 trở lên). Tiến độ học tập hiện tại đang ổn định.`,
    };
  }

  /**
   * Lọc danh sách môn học theo học kỳ, trạng thái hoặc từ khóa tìm kiếm (mã/tên môn).
   * Không làm biến đổi mảng gốc.
   * @param {ReadonlyArray<{ code?: string, name?: string, semester?: number | string, status?: string }>} courses
   * @param {{
   *   semester?: number | string | null,
   *   status?: string | null,
   *   keyword?: string | null
   * }} [filters]
   * @returns {Array<object>}
   */
  function filterCourses(courses, filters = {}) {
    if (!Array.isArray(courses)) {
      return [];
    }

    const safeFilters = filters && typeof filters === "object" ? filters : {};
    const rawSemester = safeFilters.semester;
    const rawStatus = safeFilters.status;
    const rawKeyword = safeFilters.keyword;

    const hasSemesterFilter =
      rawSemester !== undefined &&
      rawSemester !== null &&
      String(rawSemester).trim() !== "" &&
      String(rawSemester).trim().toLowerCase() !== "all";

    const hasStatusFilter =
      typeof rawStatus === "string" &&
      rawStatus.trim() !== "" &&
      rawStatus.trim().toLowerCase() !== "all";

    const normalizedKeyword =
      typeof rawKeyword === "string" ? rawKeyword.trim().toLowerCase() : "";

    const targetSemester = hasSemesterFilter ? String(rawSemester).trim() : "";
    const targetStatus = hasStatusFilter ? rawStatus.trim() : "";

    return courses.filter((course) => {
      if (!course || typeof course !== "object") {
        return false;
      }

      if (hasSemesterFilter && String(course.semester) !== targetSemester) {
        return false;
      }

      if (hasStatusFilter && course.status !== targetStatus) {
        return false;
      }

      if (normalizedKeyword !== "") {
        const courseName = typeof course.name === "string" ? course.name.toLowerCase() : "";
        const courseCode = typeof course.code === "string" ? course.code.toLowerCase() : "";
        if (!courseName.includes(normalizedKeyword) && !courseCode.includes(normalizedKeyword)) {
          return false;
        }
      }

      return true;
    });
  }

  return {
    convertToScale4,
    calculateGPA4,
    getAcademicRank,
    getCompletionStats,
    getAcademicWarning,
    filterCourses,
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    convertToScale4,
    calculateGPA4,
    getAcademicRank,
    getCompletionStats,
    getAcademicWarning,
    filterCourses,
  };
}
