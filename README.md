# SportCourtBooking - Hệ Thống Đặt Sân Thể Thao

SportCourtBooking là một hệ thống ứng dụng web chuyên nghiệp, cung cấp nền tảng quản lý và đặt sân thể thao (cầu lông, tennis, bóng đá, v.v.). Hệ thống được thiết kế theo kiến trúc Client-Server hiện đại, chia thành hai phần rõ rệt: Backend (API Server) và Frontend (Single Page Application).

---

## 🎯 Chức Năng Chính

### Dành cho Khách hàng (Customer)
- **Xác thực an toàn:** Đăng ký tài khoản (hỗ trợ xác thực qua OTP gửi qua email), Đăng nhập bằng JWT.
- **Tìm kiếm sân:** Tra cứu sân thể thao, xem lịch khả dụng theo thời gian thực (tích hợp khoảng giờ trống).
- **Đặt sân:** Đặt sân theo khung giờ mong muốn, tính toán giá tiền tự động.
- **Thanh toán:** Thanh toán tiền cọc để xác nhận đơn đặt sân.
- **Quản lý cá nhân:** Xem lịch sử đặt sân, cập nhật thông tin cá nhân.
- **Thông báo:** Nhận thông báo (real-time) về trạng thái đơn đặt sân.

### Dành cho Chủ sân (Owner) / Nhân viên (Staff)
- **Dashboard phân tích:** Xem thống kê doanh thu, số lượng đơn đặt sân.
- **Quản lý danh mục:** Thêm, sửa, xóa các Môn thể thao (Sports) và Sân (Courts).
- **Quản lý giá cả:** Thiết lập quy tắc giá linh hoạt theo từng khung giờ trong ngày (Court Prices).
- **Quản lý lịch trình:** Khóa sân (Block) khi bảo trì, duyệt/hủy đơn đặt sân của khách.
- **Quản lý người dùng:** Nâng cấp quyền cho tài khoản, quản lý danh sách khách hàng và nhân viên.
- **Khách vãng lai:** Tạo đơn đặt sân trực tiếp tại quầy cho khách không dùng ứng dụng.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend (`/Backend/Backend_SportCourtBooking`)
- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.5.x
- **Bảo mật:** Spring Security, JSON Web Token (JWT)
- **Database:** MySQL (với Spring Data JPA / Hibernate)
- **Real-time:** Spring WebSocket
- **Email:** Spring Boot Mail (Gửi mã OTP, thông báo)
- **Công cụ khác:** Lombok, Maven

### Frontend (`/Frontend/frontend-sport-booking`)
- **Core:** React 19, TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS, PostCSS
- **Routing:** React Router DOM v7
- **Giao tiếp API:** Axios (sử dụng Interceptors và Repository Pattern)
- **Real-time:** `@stomp/stompjs` (kết nối WebSocket)
- **Validation:** `class-validator`, `class-transformer`
- **UI Components:** Thiết kế custom với Tailwind, biểu tượng từ `lucide-react`, thông báo từ `react-toastify`.

---

## 📂 Cấu Trúc Dự Án

Dự án được tổ chức theo dạng thư mục song song cho Frontend và Backend:

```
SportCourtBooking/
├── Backend/
│   └── Backend_SportCourtBooking/     # Source code Backend (Spring Boot)
│       ├── src/main/java/...          # Controllers, Services, Repositories, Entities, Config
│       ├── src/main/resources/        # Cấu hình application.properties
│       └── pom.xml                    # Quản lý dependencies Maven
│
├── Frontend/
│   └── frontend-sport-booking/        # Source code Frontend (React/Vite)
│       ├── src/
│       │   ├── core/                  # Cấu hình API Client trung tâm
│       │   ├── entities/              # Định nghĩa Types/Interfaces dữ liệu
│       │   ├── features/              # Các module chức năng (Auth, Bookings, Courts, Owner,...)
│       │   ├── services/              # Lớp giao tiếp gọi API, WebSocket
│       │   └── shared/                # UI Components chung, Hooks, Utils
│       ├── package.json               # Quản lý dependencies NPM
│       └── tailwind.config.js         # Cấu hình TailwindCSS
│
└── README.md                          # Tài liệu dự án (File bạn đang đọc)
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy (Local Development)

### 1. Khởi chạy Backend (Spring Boot)
Yêu cầu: Java 17+, Maven (hoặc dùng `mvnw` đi kèm), MySQL Server.

1. Mở MySQL, tạo một database mới, ví dụ: `sport_booking_db`.
2. Mở file cấu hình tại `Backend/Backend_SportCourtBooking/src/main/resources/application.properties` (tạo mới nếu chưa có) và cấu hình kết nối DB, ví dụ:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/sport_booking_db?useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   
   spring.jpa.hibernate.ddl-auto=update
   
   # Cấu hình JWT Secret
   jwt.secret=chuoi_bi_mat_rat_dai_va_an_toan_o_day
   
   # Cấu hình Email (để test OTP)
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```
3. Mở terminal tại thư mục `Backend/Backend_SportCourtBooking`:
   ```bash
   ./mvnw spring-boot:run
   ```
   *Backend sẽ chạy trên cổng `http://localhost:8080`*.

### 2. Khởi chạy Frontend (React)
Yêu cầu: Node.js 18+

1. Di chuyển vào thư mục Frontend:
   ```bash
   cd Frontend/frontend-sport-booking
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Chạy server phát triển:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy trên cổng `http://localhost:5173` (hoặc cổng mà Vite cấp).*

---

## 🧪 Tài liệu kiểm thử API (Test Flow)

Đối với các bạn phát triển Backend hoặc QA, vui lòng tham khảo luồng test nghiệp vụ chi tiết (từ tạo Môn thể thao -> Tạo Sân -> Khách đặt lịch -> Chủ sân duyệt -> Thanh toán) trong file: 
👉 **[`POSTMAN_TEST_FLOW.md`](./Backend/Backend_SportCourtBooking/POSTMAN_TEST_FLOW.md)**

---

**© 2026 - SportCourtBooking Team.**
