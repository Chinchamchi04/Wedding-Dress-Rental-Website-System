import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tự động cuộn lên đầu trang mỗi khi chuyển trang (Route change)
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Nếu có hash trong URL (ví dụ: #silhouettes, #collection), cuộn đến phần tử tương ứng
    if (hash && hash.length > 1) {
      try {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      } catch (e) {
        // Bỏ qua lỗi cú pháp selector không hợp lệ
      }
    }

    // Cuộn lên đầu trang ngay lập tức khi chuyển route
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    } catch (e) {
      // ignore
    }
  }, [pathname, search, hash]);

  return null;
}
