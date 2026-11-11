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
  const str = String(dateStr).trim();
  // Nếu đã ở định dạng DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    return str;
  }
  // Nếu ở định dạng YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    const d = parts[2].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[0];
    return `${d}/${m}/${y}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return str;

  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();

  return `${d}/${m}/${y}`;
}

