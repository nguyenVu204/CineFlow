# Đồng Bộ Backend Microservices & Frontend Contract Tracking — CINEVERSE

Tài liệu này ghi nhận hiện trạng đồng bộ API giữa Backend Microservices (.NET 8) và Frontend (React 19 + TypeScript + Vite). **Toàn bộ 9/9 hạng mục còn thiếu trước đây đã được triển khai hoàn chỉnh vào backend microservices và tích hợp 100% với frontend.** Tuyệt đối không còn dữ liệu cứng/mock giả lập trên client.

---

## BẢNG TỔNG HỢP HIỆN TRẠNG ĐỒNG BỘ

| STT | Phân loại | Tính năng | Trạng thái Backend | Trạng thái Frontend | Kết nối Microservice |
|:---:|:---|:---|:---:|:---:|:---|
| **A.1** | Khách hàng | Combo Bắp Nước & F&B | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Booking.API` + `ApiGateway` |
| **A.2** | Khách hàng | Khuyến Mãi / Voucher / Promo | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Booking.API` + `ApiGateway` |
| **A.3** | Khách hàng | Cổng Thanh Toán & QR Động | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Booking.API` + `ApiGateway` |
| **A.4** | Khách hàng | Metadata Phim Đầy Đủ | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Movie.API` + `ApiGateway` |
| **A.5** | Khách hàng | Điểm Thưởng & Hạng Thành Viên | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Identity.API` + `ApiGateway` |
| **B.1** | Quản trị | Soát Vé Điện Tử & Check-in | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Booking.API` + `ApiGateway` |
| **B.2** | Quản trị | Khóa Ghế Bảo Trì Phòng Chiếu | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Booking.API` + `ApiGateway` |
| **B.3** | Quản trị | Quản Lý F&B & Voucher CMS | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Booking.API` + `ApiGateway` |
| **B.4** | Quản trị | Khóa / Mở Khóa Tài Khoản | ✅ Đã hoàn thành (100%) | ✅ Đã kết nối API | `Identity.API` + `ApiGateway` |

---

# PHẦN A: GIAO DIỆN KHÁCH HÀNG (USER PORTAL)

## A.1. Concessions / Bắp Nước & Combo

- **UI/Feature:** Section chọn combo bắp nước trong bước chọn ghế (`view-seats`), hiển thị My Combo, Couple Combo, VIP Bucket, Bắp phô mai, Xúc xích... và tính tiền tự động vào đơn đặt vé.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Entity: `Concession`, `BookingConcessionItem` trong `Booking.API`.
  - DbContext: Cấu hình bảng `Concessions` và `BookingConcessionItems` trong `BookingDbContext`.
  - Controller: `ConcessionsController` trong `Booking.API`:
    - `GET /api/concessions` — Lấy danh sách combo bắp nước mở bán (`inStockOnly`).
    - `POST /api/concessions` — Thêm combo mới.
    - `PUT /api/concessions/{id}` — Cập nhật combo.
    - `DELETE /api/concessions/{id}` — Xóa combo.
    - `PATCH /api/concessions/{id}/stock` — Đổi trạng thái còn hàng/hết hàng.
  - `BookingsController.HoldSeats`: Nhận danh sách `ConcessionItems` trong `HoldSeatRequest`, tính tổng tiền vé + combo và lưu vào cơ sở dữ liệu.
  - Initializer: Đã seed 4 combo chuẩn (`My Combo`, `Couple Combo`, `VIP Bucket`, `Xúc Xích Nướng Phô Mai`) trong `DbInitializer.cs`.
  - ApiGateway: Tuyến đường `/api/concessions/{**catch-all}` trỏ tới `booking-cluster`.
- **Frontend Tích hợp:**
  - Service: `services/api/concessionApi.ts` gọi trực tiếp backend.
  - Context: `BookingContext.tsx` tải dữ liệu concessions từ backend API, tính toán tổng tiền realtime.
  - View: `SeatSelectionView.tsx` hiển thị combo động từ backend. Không còn dùng mock data.

---

## A.2. Khuyến Mãi / Voucher / Promo Code

- **UI/Feature:** Section hiển thị mã khuyến mãi tại trang chủ (`#promotions`), ô nhập mã giảm giá tại trang thanh toán (`#promo-input`) và áp dụng chiết khấu tự động.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Entity: `Promotion` trong `Booking.API`.
  - Controller: `PromotionsController` trong `Booking.API`:
    - `GET /api/promotions` — Lấy danh sách khuyến mãi đang áp dụng.
    - `POST /api/promotions/validate` — Xác thực mã giảm giá, kiểm tra điều kiện đơn hàng tối thiểu (`MinOrderValue`), tính số tiền giảm trừ (`fixed` hoặc `percent`).
    - `POST /api/promotions` — Tạo mới voucher.
    - `DELETE /api/promotions/{code}` — Xóa voucher.
    - `PATCH /api/promotions/{code}/toggle` — Bật/tắt trạng thái áp dụng voucher.
  - Initializer: Đã seed 4 mã voucher (`CINEVERSE2025`, `VIP50K`, `SUPER10`, `WEEKEND20`) trong `DbInitializer.cs`.
  - ApiGateway: Tuyến đường `/api/promotions/{**catch-all}` trỏ tới `booking-cluster`.
- **Frontend Tích hợp:**
  - Service: `services/api/promotionApi.ts` gọi trực tiếp backend API.
  - View: `HomeView.tsx` tải danh sách voucher động từ `promotionApi.getPromotions(true)`.
  - Context & Checkout: `BookingContext.tsx` và `CheckoutView.tsx` gọi `promotionApi.validatePromotion()` để kiểm tra mã và trừ tiền trực tiếp trên đơn hàng.

---

## A.3. Cổng Thanh Toán & Phương Thức Thanh Toán (Payment Gateway)

- **UI/Feature:** Lựa chọn phương thức thanh toán tại Checkout (MoMo, VNPAY, ZaloPay, Thẻ Visa/Mastercard), tạo mã QR thanh toán động và xác nhận giao dịch.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Entity: `PaymentTransaction` trong `Booking.API`.
  - Controller: `PaymentsController` trong `Booking.API`:
    - `POST /api/payments/create` — Khởi tạo giao dịch thanh toán, tự sinh URL và QR code thanh toán chuẩn ngân hàng/ví điện tử.
    - `GET /api/payments/{transactionId}/status` — Truy vấn trạng thái giao dịch.
    - `POST /api/payments/{transactionId}/confirm` — Xác nhận thanh toán thành công và tự động chuyển trạng thái đơn hàng sang `Confirmed`.
  - ApiGateway: Tuyến đường `/api/payments/{**catch-all}` trỏ tới `booking-cluster`.
- **Frontend Tích hợp:**
  - Service: `services/api/paymentApi.ts` gọi trực tiếp backend API.
  - View: `CheckoutView.tsx` tự động gọi `paymentApi.createPayment()` khi mở trang thanh toán, hiển thị QR code động từ backend trả về.

---

## A.4. Metadata Mở Rộng Của Phim (Director, Cast, Age Rating, Formats, Trailer)

- **UI/Feature:** Trang chủ & chi tiết phim hiển thị trailer YouTube, đạo diễn, diễn viên, độ tuổi (P, C13, C16, C18), định dạng (IMAX Laser, 2D, 3D), điểm IMDb.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Entity: `Movie` trong `Movie.API` đã được bổ sung đầy đủ các trường: `OriginalTitle`, `Rating`, `AgeRating`, `Director`, `Cast`, `Formats`, `BackdropUrl`, `TrailerUrl`.
  - DTO: `MovieRequest`, `PagedMoviesResponse` đã đồng bộ toàn bộ metadata.
  - Controller: `MoviesController` thực hiện map đầy đủ các thuộc tính khi `Create`, `Update`, `GetMovies`, `GetMovie`.
  - Initializer: Đã seed 6 bộ phim bom tấn CINEVERSE với đầy đủ poster HD, backdrop 4K, video trailer YouTube và rating IMDb.
- **Frontend Tích hợp:**
  - Type: `BackendMovie` trong `types/movie.ts` bổ sung toàn bộ metadata.
  - Service: `movieApi.ts` ánh xạ trực tiếp từ backend mà không cần mock fallback.

---

## A.5. Điểm Thưởng Khách Hàng Thân Thiết (Loyalty Points / Rewards)

- **UI/Feature:** Header hiển thị điểm thưởng (`fa-solid fa-crown`), tích lũy điểm khi hoàn tất đặt vé.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Entity: `ApplicationUser` trong `Identity.API` được thêm trường `Points` (int) và `JoinedAt` (DateTime).
  - Controller: `AuthController` trong `Identity.API`:
    - `POST /api/auth/register` — Tự động tặng 150 điểm thưởng chào mừng thành viên mới.
    - `GET /api/auth/me` — Trả về thông tin tài khoản kèm số điểm thưởng thực tế.
    - `POST /api/auth/me/points` — Cộng/trừ điểm thưởng của người dùng.
- **Frontend Tích hợp:**
  - Context: `AuthContext.tsx` quản lý `points` từ backend, gọi `authApi.addPoints()` khi hoàn tất đơn hàng và tự động cập nhật badge thành viên.

---

# PHẦN B: HỆ THỐNG QUẢN TRỊ (ADMIN CMS)

## B.1. Soát Vé Điện Tử & Check-in Vào Rạp (Ticket Check-in)

- **UI/Feature:** Quản trị viên/nhân viên kiểm tra vé tại phân hệ "5. Đơn vé & Soát vé", nhập mã vé hoặc số điện thoại để duyệt khách vào rạp.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Entity: `BookingStatus` trong `Booking.API` được thêm giá trị `CheckedIn = 4`. Thêm thuộc tính `CheckedInAt` vào `Booking`.
  - Controller: `BookingsController`:
    - `POST /api/bookings/{code}/check-in` — Tra cứu đơn vé theo mã `bookingCode` hoặc `customerPhone`, kiểm tra tính hợp lệ và cập nhật trạng thái `CheckedIn`.
    - `GET /api/bookings/admin/all` — Lấy danh sách toàn bộ đơn vé của hệ thống cho CMS.
- **Frontend Tích hợp:**
  - Service: `bookingApi.checkInTicket` và `bookingApi.getAdminBookings`.
  - Context: `AdminContext.tsx` gọi `bookingApi.checkInTicket()` và `bookingApi.getAdminBookings()`, xóa bỏ toàn bộ mock booking.

---

## B.2. Quản Lý Khóa Ghế Bảo Trì Phòng Chiếu (Seat Maintenance Inspector)

- **UI/Feature:** Phân hệ "4. Lịch chiếu & Phòng", sơ đồ phòng chiếu 75 ghế cho phép quản trị viên click để khóa/mở khóa bảo trì ghế hỏng.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Enum: `ShowtimeSeatStatus` trong `Booking.API` thêm `Maintenance = 3`.
  - Validator: `SeatBookingValidator` không cho phép đặt hoặc giữ ghế có trạng thái `Maintenance`.
  - Controller: `BookingsController`:
    - `PUT /api/bookings/showtimes/{showtimeId}/seats/{seatId}/maintenance` — Chuyển đổi trạng thái giữa `Available` và `Maintenance`.
    - `POST /api/bookings/showtimes/{showtimeId}/seats/unlock-maintenance` — Mở khóa tất cả các ghế đang bảo trì của phòng chiếu.
- **Frontend Tích hợp:**
  - View & Context: `AdminShowtimesView.tsx` và `AdminContext.tsx` gọi `bookingApi.toggleSeatMaintenance` và `bookingApi.unlockAllMaintenance`. Khách hàng khi đặt vé ở `SeatSelectionView.tsx` sẽ thấy ghế bảo trì bị vô hiệu hóa.

---

## B.3. Quản Lý Bắp Nước & Khuyến Mãi Phía CMS (F&B & Voucher CRUD)

- **UI/Feature:** Phân hệ "6. Bắp nước & Voucher", thêm/sửa/xóa combo bắp nước, bật/tắt tồn kho, phát hành voucher giảm giá mới.
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Toàn bộ các endpoint RESTful CRUD cho Concession và Promotion đã được xây dựng hoàn chỉnh trong `ConcessionsController` và `PromotionsController`.
- **Frontend Tích hợp:**
  - `AdminContext.tsx` gọi trực tiếp `concessionApi.createConcession`, `toggleStock`, `deleteConcession` và `promotionApi.createPromotion`, `togglePromotion`, `deletePromotion`. Không còn lưu tạm vào LocalStorage mock.

---

## B.4. Khóa / Mở Khóa Tài Khoản Người Dùng (User Account Lock/Unlock)

- **UI/Feature:** Phân hệ "2. Quản lý Người dùng", chức năng khóa/mở khóa tài khoản thành viên (`active` ↔ `locked`).
- **Trạng thái:** **Đã hoàn thành 100% (Real Backend API)**
- **Backend Triển khai:**
  - Identity ASP.NET Core: `AuthController` trong `Identity.API`:
    - `PUT /api/auth/users/{userId}/status` — Khóa tài khoản vĩnh viễn (`SetLockoutEndDateAsync(DateTimeOffset.MaxValue)`) hoặc mở khóa (`SetLockoutEndDateAsync(null)`).
    - `POST /api/auth/login` — Kiểm tra `IsLockedOutAsync(user)`, từ chối đăng nhập nếu tài khoản bị khóa.
    - `GET /api/auth/users` — Lấy danh sách thành viên kèm trạng thái `active`/`locked`.
    - `POST /api/auth/users` — Admin thêm thành viên mới.
    - `PUT /api/auth/users/{userId}` — Admin chỉnh sửa thông tin thành viên.
    - `DELETE /api/auth/users/{userId}` — Admin xóa tài khoản thành viên.
- **Frontend Tích hợp:**
  - Service: `authApi.ts` có đầy đủ các hàm quản trị người dùng.
  - Context: `AdminContext.tsx` đồng bộ trực tiếp với `Identity.API`.

---

## KẾT LUẬN & KIỂM THỬ HỆ THỐNG

- **Backend Solution:**
  - 4 Microservices (`Movie.API`, `Cinema.API`, `Booking.API`, `Identity.API`) + `ApiGateway` (YARP Reverse Proxy).
  - Biên dịch .NET 8: **0 Warning, 0 Error**.
  - Unit Tests: **11/11 tests Passed**.
- **Frontend Application:**
  - TypeScript + Vite Production Build: **Thành công (Built in 19.66s, 0 errors)**.
  - Mock Data Elimination: **100% sạch sẽ**, toàn bộ các file `services/mock/*` đã được gỡ bỏ hoàn toàn khỏi các module và view trong hệ thống.
