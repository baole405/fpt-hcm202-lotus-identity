# Lotus Identity | Hành Trình Khám Phá Bản Sắc & Vươn Ra Thế Giới

Dự án này là **Sản phẩm Sáng tạo** nhóm cho môn học **HCM202 (Tư tưởng Hồ Chí Minh)** tại **Trường Đại học FPT (FPT University)**.

## 🌟 Chủ đề Nhóm
> **“Hiểu mình để vươn ra thế giới: vai trò của văn hóa, đạo đức và con người trong phát triển cá nhân hiện nay”**

## 💡 Ý tưởng Dự án
Website **Lotus Identity** là một cổng trải nghiệm trực quan hóa giúp sinh viên FPT định vị bản thân và rèn luyện đạo đức trước khi bước vào môi trường hội nhập quốc tế. Trang web được thiết kế theo phong cách hiện đại với số lượng văn bản tối giản, tập trung truyền tải thông điệp qua các hình ảnh nghệ thuật số, hiệu ứng chuyển động tương tác cao và biểu đồ tư duy sinh động.

---

## 🎨 Điểm nhấn Trải nghiệm UI/UX (WOW Factors)
- **Canvas Particle Background**: Hệ thống hạt chuyển động mô phỏng cánh hoa sen vàng và hồng trôi lơ lửng trên nền chàm sâu thẳm, phản ứng nhẹ khi di chuyển chuột.
- **Interactive Glassmorphic Cards (3D Tilt)**: Các thẻ nội dung kính mờ tự động nghiêng theo góc nhìn 3D khi di chuột qua, tạo chiều sâu thị giác.
- **Trắc nghiệm Đánh giá & SVG Radar Chart**: Bộ câu hỏi tình huống thực tế giúp chấm điểm và vẽ trực tiếp biểu đồ Radar định vị khả năng hội nhập (Văn hóa, Đạo đức, Tự học, Bản lĩnh, Hội nhập).
- **AI Mentor Chatbot**: Khung chat giả lập thông minh hỗ trợ giải đáp nhanh các thắc mắc về việc áp dụng tư tưởng Hồ Chí Minh vào cuộc sống sinh viên với hiệu ứng gõ chữ tự nhiên.
- **Responsive Layout & Scroll triggers**: Toàn bộ trang web đáp ứng hoàn hảo trên mọi thiết bị di động và máy tính, đi kèm hiệu ứng xuất hiện chuyển động mượt mà khi cuộn trang (`IntersectionObserver`).

---

## 🛠️ Công nghệ Sử dụng
- **Core**: HTML5, Vanilla JavaScript (ES6)
- **Styling**: CSS3 Variables, Glassmorphism, 3D Transforms, Keyframe Animations
- **Icons**: FontAwesome v6
- **Fonts**: Outfit & Playfair Display (Google Fonts)

---

## 🚀 Cách Chạy Dự án locally
Trang web được xây dựng thuần bằng tài nguyên tĩnh nên không cần quá trình build phức tạp:
1. Double-click trực tiếp vào file `index.html` để chạy trên trình duyệt.
2. Hoặc sử dụng extension **Live Server** trong VS Code để khởi chạy local server.

---

## 📦 Hướng dẫn Deploy lên Vercel
Bạn có thể triển khai trang web lên Vercel chỉ với 1 dòng lệnh:
```bash
# Cài đặt hoặc chạy Vercel CLI để deploy
npx vercel
```
*Lưu ý trên Windows PowerShell: sử dụng `npx.cmd vercel` nếu gặp lỗi chính sách thực thi.*
