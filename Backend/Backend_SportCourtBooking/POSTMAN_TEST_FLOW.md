# Postman Test Flow

Tài liệu này mô tả thứ tự test API backend hiện tại theo đúng luồng nghiệp vụ của hệ thống đặt sân.

## 1. Chuẩn bị

### 1.1. Chạy backend

- Khởi động Spring Boot backend.
- Kiểm tra database đã có dữ liệu tối thiểu: ít nhất 1 tài khoản OWNER hoặc STAFF để duyệt đơn và tạo dữ liệu chủ sân.
- Nếu muốn test đăng ký bằng OTP, cần cấu hình mail để nhận OTP.

### 1.2. Tạo Postman Environment

Tạo các biến sau:

- `baseUrl` = `http://localhost:8080`
- `ownerToken` = token đăng nhập của OWNER
- `customerToken` = token đăng nhập của CUSTOMER
- `sportId` = id môn thể thao vừa tạo
- `courtId` = id sân vừa tạo
- `bookingId` = id đơn đặt sân

### 1.3. Header dùng chung

Với các API cần đăng nhập, thêm header:

- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

Trong đó `token` là `ownerToken` hoặc `customerToken` tùy luồng.

## 2. Luồng test chủ sân

### Bước 1: Đăng nhập OWNER

Endpoint:

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "owner@example.com",
  "password": "12345678"
}
```

Lấy token từ response và lưu vào `ownerToken`.

### Bước 2: Tạo môn thể thao

Endpoint:

```http
POST {{baseUrl}}/api/sports
```

Header:

```http
Authorization: Bearer {{ownerToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "Cầu lông",
  "iconUrl": "https://example.com/badminton.png"
}
```

Response sẽ trả về sport có `id`, lưu vào `sportId`.

### Bước 3: Tạo sân

Endpoint:

```http
POST {{baseUrl}}/api/courts
```

Header:

```http
Authorization: Bearer {{ownerToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "Sân 01",
  "sportId": 1,
  "description": "Sân mái che, nền tốt",
  "openTime": "05:00:00",
  "closeTime": "22:00:00",
  "active": true
}
```

Lưu `id` trả về vào `courtId`.

### Bước 4: Set giá sân theo khung giờ

Endpoint:

```http
POST {{baseUrl}}/api/courts/prices
```

Header:

```http
Authorization: Bearer {{ownerToken}}
Content-Type: application/json
```

Body:

```json
{
  "courtId": 1,
  "startTime": "05:00:00",
  "endTime": "17:00:00",
  "price": 150000
}
```

Tạo thêm một rule khác nếu muốn test giờ cao điểm:

```json
{
  "courtId": 1,
  "startTime": "17:00:00",
  "endTime": "22:00:00",
  "price": 200000
}
```

### Bước 5: Chặn lịch sân nếu cần

Endpoint:

```http
POST {{baseUrl}}/api/courts/blocks
```

Header:

```http
Authorization: Bearer {{ownerToken}}
Content-Type: application/json
```

Body:

```json
{
  "courtId": 1,
  "startTime": "2026-04-25T10:00:00",
  "endTime": "2026-04-25T12:00:00",
  "reason": "Bảo trì sân"
}
```

### Bước 6: Duyệt đơn đặt sân

Sau khi khách tạo booking, OWNER có thể xác nhận:

```http
PUT {{baseUrl}}/api/bookings/{{bookingId}}/status
```

Body:

```json
{
  "status": "CONFIRMED"
}
```

## 3. Luồng test khách hàng

### Cách A: Test đầy đủ đăng ký bằng OTP

Lưu ý: tài khoản mới đăng ký luôn được tạo với role `CUSTOMER`. Backend hiện không có API cho phép tự nâng tài khoản vừa đăng ký lên `OWNER`.

Nếu bạn chưa có sẵn OWNER để test luồng quản trị, hãy tạo 1 OWNER trực tiếp trong database, hoặc dùng 1 tài khoản OWNER đã có sẵn để gọi API đổi role.

#### Bước 1: Gửi OTP đăng ký

```http
POST {{baseUrl}}/api/auth/register/request-otp
```

Body:

```json
{
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "password": "12345678",
  "confirmPassword": "12345678",
  "phone": "0900000001"
}
```

#### Bước 2: Xác nhận OTP

```http
POST {{baseUrl}}/api/auth/register/verify-otp
```

Body:

```json
{
  "email": "customer@example.com",
  "otp": "123456"
}
```

Lưu ý: OTP thật phải lấy từ email. OTP cache chỉ tồn tại trong bộ nhớ, restart backend là mất.

Sau khi verify OTP thành công, tài khoản sẽ có role `CUSTOMER`.

### Cách nâng tài khoản lên OWNER để test

Endpoint đổi role chỉ dành cho OWNER:

```http
PUT {{baseUrl}}/api/users/{id}/role
```

Body:

```json
{
  "role": "OWNER"
}
```

Nhưng để gọi được API này, bạn phải đăng nhập bằng một tài khoản OWNER khác đã tồn tại trước đó.

Nếu hiện tại chưa có OWNER nào, cách nhanh nhất là:

1. Tạo 1 user trong DB.
2. Set cột `role` của user đó thành `OWNER` thủ công trong database.
3. Đăng nhập user này để dùng làm tài khoản quản trị đầu tiên.

### Cách B: Test nhanh không cần email

Nếu chưa cấu hình mail, dùng tài khoản CUSTOMER có sẵn trong DB, hoặc để OWNER tạo khách vãng lai bằng API `/api/auth/walk-in`.

```http
POST {{baseUrl}}/api/auth/walk-in?fullName=Khach%20Vo%20Danh&phone=0911222333
```

Header:

```http
Authorization: Bearer {{ownerToken}}
```

### Bước 3: Đăng nhập khách

```http
POST {{baseUrl}}/api/auth/login
```

Body:

```json
{
  "email": "customer@example.com",
  "password": "12345678"
}
```

Lưu token vào `customerToken`.

### Bước 4: Xem sân khả dụng

```http
GET {{baseUrl}}/api/courts/available?startTime=2026-04-25T10:00:00&endTime=2026-04-25T11:00:00&sportId=1
```

Không bắt buộc đăng nhập.

### Bước 5: Tạo đơn đặt sân

```http
POST {{baseUrl}}/api/bookings
```

Header:

```http
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "courtId": 1,
  "startTime": "2026-04-25T10:00:00",
  "endTime": "2026-04-25T11:00:00",
  "note": "Test booking"
}
```

Nếu muốn đặt hộ, thêm `userId`, nhưng chỉ OWNER/STAFF mới được đặt hộ.

### Bước 6: Xem đơn của tôi

```http
GET {{baseUrl}}/api/bookings/me
```

Header:

```http
Authorization: Bearer {{customerToken}}
```

### Bước 7: Thanh toán cọc

Chỉ thanh toán được khi đơn đã ở trạng thái `CONFIRMED`.

```http
POST {{baseUrl}}/api/payments
```

Header:

```http
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "bookingId": 1,
  "amount": 30000,
  "paymentMethod": "CASH",
  "transactionRef": "TEST-DEP-001"
}
```

Lưu ý quan trọng:

- `amount` phải đúng bằng 30% `totalPrice`, làm tròn theo logic backend.
- `paymentMethod` hiện chỉ nhận `CASH` hoặc `BANK_TRANSFER`.
- Đây là luồng ghi nhận nội bộ, chưa phải cổng thanh toán thật.

### Bước 8: Hủy đơn nếu cần

```http
PUT {{baseUrl}}/api/bookings/1/cancel?reason=Khach%20khong%20muon%20dat%20nua
```

Header:

```http
Authorization: Bearer {{customerToken}}
```

## 4. Luồng test đề xuất theo thứ tự thực tế

1. Đăng nhập OWNER.
2. Tạo môn thể thao.
3. Tạo sân với `openTime` và `closeTime`.
4. Tạo rule giá theo khung giờ.
5. Đăng ký khách bằng OTP hoặc dùng khách vãng lai.
6. Đăng nhập CUSTOMER.
7. Gọi `GET /api/courts/available` để kiểm tra sân trống.
8. Tạo booking.
9. OWNER xác nhận booking bằng `PUT /api/bookings/{id}/status`.
10. CUSTOMER thanh toán cọc bằng `POST /api/payments`.
11. Kiểm tra `GET /api/bookings/me` và `GET /api/notifications/me` nếu muốn xem trạng thái.

## 5. Những lỗi dễ gặp khi test

- `401 Unauthorized`: thiếu token hoặc token sai.
- `403 Forbidden`: dùng sai vai trò, ví dụ CUSTOMER gọi API chỉ dành cho OWNER.
- `OTP đã hết hạn`: OTP pending bị quá thời gian hoặc backend đã restart.
- `Số tiền cọc phải đúng 30% tổng đơn`: amount trong payment request không khớp.
- `Khung giờ đặt nằm ngoài giờ hoạt động của sân`: `startTime`/`endTime` không nằm trong `openTime`/`closeTime`.

## 6. Gợi ý test nhanh

Nếu bạn muốn test nhanh nhất mà không cần email:

1. Dùng OWNER đăng nhập.
2. Tạo sport + court + price rule.
3. Tạo khách vãng lai bằng `/api/auth/walk-in`.
4. Đăng nhập khách vãng lai bằng email dạng `phone@guest.local` và mật khẩu mặc định `123456`.
5. Tạo booking.
6. OWNER confirm booking.
7. CUSTOMER thanh toán cọc.
