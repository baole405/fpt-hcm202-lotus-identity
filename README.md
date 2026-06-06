# Slow Identity | Hành Trình Khám Phá Bản Sắc & Vươn Ra Thế Giới

Dự án này là **Sản phẩm Sáng tạo** nhóm cho môn học **HCM202 (Tư tưởng Hồ Chí Minh)** tại **Trường Đại học FPT (FPT University)**.

## 🌟 Thông tin Dự án
- **Tên nhóm:** Slow
- **Giảng viên hướng dẫn:** Thầy Nguyễn Văn Bình (Nguyen Van Binh)
- **Chủ đề thuyết trình:** 
  > **“Hiểu mình để vươn ra thế giới: vai trò của văn hóa, đạo đức và con người trong phát triển cá nhân hiện nay”**

## 💡 Ý tưởng Dự án
Website **Slow Identity** là một cổng trải nghiệm trực quan hóa giúp sinh viên FPT định vị bản thân và rèn luyện đạo đức trước khi bước vào môi trường hội nhập quốc tế. Trang web được thiết kế theo phong cách hiện đại với số lượng văn bản tối giản, tập trung truyền tải thông điệp qua các hình ảnh nghệ thuật số, hiệu ứng chuyển động tương tác cao và biểu đồ tư duy sinh động.

---

## 🎨 Điểm nhấn Trải nghiệm UI/UX (WOW Factors)
- **Premium Light Mode**: Giao diện sáng thanh lịch, hạn chế tối đa các tông màu tối, mang lại cảm giác mở và trực quan.
- **Solid Headings**: Toàn bộ các chữ tiêu đề (Heading) sử dụng màu đơn sắc cao cấp, rõ nét, không dùng gradient màu.
- **Canvas Particle Background**: Hệ thống hạt chuyển động mô phỏng cánh hoa sen hồng nhạt lơ lửng trên nền sáng, phản ứng nhẹ khi di chuyển chuột.
- **Interactive Glassmorphic Cards (3D Tilt)**: Các thẻ nội dung kính mờ tự động nghiêng theo góc nhìn 3D khi di chuột qua.
- **Trắc nghiệm Đánh giá & SVG Radar Chart**: Bộ câu hỏi tình huống thực tế giúp chấm điểm và vẽ trực tiếp biểu đồ Radar định vị khả năng hội nhập (Văn hóa, Đạo đức, Tự học, Bản lĩnh, Hội nhập).
- **AI Mentor Chatbot**: Khung chat mô phỏng ChatGPT/Claude giúp giải đáp nhanh các thắc mắc về việc áp dụng tư tưởng Hồ Chí Minh vào học tập.
- **Minigame Ghép Cặp Bản Sắc**: Trò chơi lật thẻ bài rèn luyện kiến thức về Cần, Kiệm, Liêm, Chính theo tư tưởng của Bác.

---

## 🛠️ Công nghệ Sử dụng
- **Core**: HTML5, Vite, TypeScript (TS)
- **Styling**: CSS3 Variables, Glassmorphism, 3D Transforms, Keyframe Animations
- **Icons**: FontAwesome v6
- **Fonts**: Outfit & Playfair Display (Google Fonts)

---

## 🚀 Cách Chạy Dự án locally

Dự án sử dụng Vite và TypeScript, cần cài đặt node_modules trước khi chạy:

```bash
# 1. Cài đặt các package phụ thuộc
npm install

# 2. Khởi chạy server phát triển local (Vite)
npm run dev

# 3. Biên dịch và đóng gói sản phẩm tĩnh (TypeScript build)
npm run build
```

---

## 📦 Hướng dẫn Deploy lên Vercel
Dự án được kết nối tự động với GitHub. Mỗi khi bạn đẩy code mới lên GitHub, Vercel sẽ tự động build thông qua câu lệnh `npm run build` và deploy trực tiếp:
👉 **[Trang web demo trực tuyến: hcm202-slow.vercel.app](https://hcm202-slow.vercel.app)**
