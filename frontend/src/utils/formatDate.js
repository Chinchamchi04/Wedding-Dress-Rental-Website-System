/**
 * Định dạng ngày tháng tiếng Việt đầy đủ (Ví dụ: "Thứ Bảy, 28/10/2026")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatVietnameseDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${dayName}, ${d}/${m}/${y}`;
}

/**
 * Định dạng ngày ngắn gọn (Ví dụ: "28/10/2026")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}/${m}/${y}`;
}

