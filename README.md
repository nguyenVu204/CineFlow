# CineFlow — Nền tảng đặt vé xem phim

CineFlow là ứng dụng đặt vé xem phim được xây dựng theo kiến trúc microservices. Người dùng có thể tìm phim, chọn rạp và suất chiếu, giữ ghế, hoàn tất đặt vé và xem lịch sử vé. Quản trị viên quản lý nội dung phim, rạp, phòng chiếu, ghế, suất chiếu và tài khoản.

Điểm kỹ thuật trọng tâm của dự án là xử lý tình huống **nhiều người cùng chọn một ghế**, đồng thời đảm bảo trạng thái đặt vé được lưu bền vững và có thể phát sự kiện bất đồng bộ.

## Mục lục

- [Chức năng](#chức-năng)
- [Kiến trúc](#kiến-trúc)
- [Các vấn đề kỹ thuật quan trọng](#các-vấn-đề-kỹ-thuật-quan-trọng)
- [Công nghệ](#công-nghệ)
- [Chạy toàn bộ bằng Docker Compose](#chạy-toàn-bộ-bằng-docker-compose)
- [Luồng demo](#luồng-demo)
- [API chính](#api-chính)
- [Chạy kiểm thử](#chạy-kiểm-thử)
- [Giới hạn hiện tại](#giới-hạn-hiện-tại)

## Chức năng

### Khách hàng

- Đăng ký, đăng nhập và xác thực bằng JWT.
- Duyệt, tìm kiếm phim; xem rạp, phòng chiếu, suất chiếu và sơ đồ ghế.
- Giữ một hoặc nhiều ghế trong thời hạn 5 phút, theo dõi trạng thái ghế.
- Áp dụng mã khuyến mãi, chọn đồ ăn/thức uống và xem tổng tiền.
- Xác nhận hoặc hủy đặt vé; xem thông tin vé và lịch sử đặt vé.
- Xem mã QR vé trong giao diện demo.

### Quản trị viên

- Quản lý phim, rạp, phòng chiếu, ghế và suất chiếu.
- Quản lý tài khoản và vai trò; khóa hoặc mở khóa tài khoản.
- Quản lý dữ liệu khuyến mãi, đồ ăn/thức uống và tra cứu đặt vé.
- Đánh dấu ghế bảo trì để không cho khách hàng chọn.

## Kiến trúc

```text
React + TypeScript
        |
        v
   YARP API Gateway
        |
        +--> Identity Service --> IdentityDb
        +--> Movie Service ----> MovieDb
        +--> Cinema Service ---> CinemaDb
        +--> Booking Service --> BookingDb
                                      |       |
                                      v       v
                                    Redis  RabbitMQ

       Các database chạy trên cùng một SQL Server container
```

Mỗi service sở hữu database riêng về mặt logic. Khi chạy local, các database dùng chung một SQL Server container để đơn giản hóa việc cài đặt. Cinema Service gọi Booking Service để khởi tạo các bản ghi ghế theo suất chiếu; các API dành cho người dùng đi qua YARP Gateway.

| Thành phần | Trách nhiệm |
|---|---|
| **Identity Service** | Tài khoản, vai trò, đăng nhập, JWT và trạng thái khóa tài khoản |
| **Movie Service** | Danh mục và thông tin phim |
| **Cinema Service** | Rạp, phòng chiếu, ghế và suất chiếu |
| **Booking Service** | Trạng thái ghế theo suất chiếu, giữ ghế, đặt vé, khuyến mãi, thanh toán demo và outbox |
| **API Gateway** | Định tuyến các API và tập hợp tài liệu Swagger |
| **React frontend** | Giao diện khách hàng và khu vực quản trị |

## Các vấn đề kỹ thuật quan trọng

### 1. Tránh bán trùng ghế khi có nhiều yêu cầu đồng thời

Hai khách hàng có thể gửi yêu cầu chọn cùng một ghế gần như đồng thời. Chỉ kiểm tra trạng thái ghế ở frontend là không đủ, vì cả hai request đều có thể nhìn thấy ghế còn trống. Booking Service xử lý ở backend theo nhiều lớp:

1. Lấy Redis distributed lock cho từng ghế của suất chiếu; các ghế được sắp xếp trước khi lấy khóa để giảm nguy cơ tranh chấp khi đặt nhiều ghế.
2. Trong SQL transaction, đọc và kiểm tra trạng thái mới nhất rồi chuyển ghế hợp lệ sang trạng thái `Held`.
3. Dùng `rowversion` của SQL Server để phát hiện cập nhật cạnh tranh trên cùng bản ghi.
4. Có unique index trên cặp `(ShowtimeId, SeatId)` để không tạo trùng ghế trong một suất chiếu.
5. Nếu khóa không lấy được hoặc ghế đã được giữ/đặt/bảo trì, request bị từ chối thay vì trả kết quả đặt ghế thành công giả.

Redis lock là lớp điều phối giữa các instance; SQL Server vẫn là nơi lưu trạng thái chính thức. Kết hợp khóa phân tán, transaction và optimistic concurrency giúp bảo vệ cả lúc nhiều request cạnh tranh lẫn khi dữ liệu thay đổi giữa các bước xử lý.

### 2. Giữ ghế có thời hạn và tự giải phóng

Ghế được giữ trong **5 phút** để khách hàng hoàn tất đặt vé. Booking Service chạy `SeatReleaseBackgroundService`, định kỳ tìm các lượt giữ đã hết hạn, cập nhật booking sang `Expired`, đưa ghế về `Available` và ghi sự kiện giải phóng vào outbox. Worker kiểm tra theo chu kỳ 10 giây; vì vậy việc giải phóng tự động có thể trễ tối đa xấp xỉ một chu kỳ kiểm tra.

Trạng thái ghế gồm `Available`, `Held`, `Booked` và `Maintenance`. Ghế bảo trì không thể được giữ như ghế trống thông thường.

### 3. RabbitMQ và Transactional Outbox

Nếu ứng dụng cập nhật database thành công nhưng không gửi được message tới RabbitMQ, các service phía sau sẽ không biết booking đã thay đổi. Dự án dùng **Transactional Outbox** để giảm rủi ro lệch trạng thái:

- Booking và message outbox được ghi trong cùng SQL transaction.
- `OutboxProcessorBackgroundService` đọc các message chưa xử lý và phát chúng lên RabbitMQ.
- Message được gửi dưới dạng JSON, queue bền vững và message được đánh dấu persistent.
- Các loại sự kiện hiện có gồm `BookingConfirmed` và `SeatReleased`.

Outbox giúp message không bị mất chỉ vì RabbitMQ tạm thời không sẵn sàng tại thời điểm ghi booking. Worker có thể gửi lại message chưa được đánh dấu đã xử lý; do đó consumer thực tế nên được thiết kế idempotent để chịu được message trùng.

**Phạm vi hiện tại:** dự án có publisher và outbox worker, nhưng chưa có consumer nghiệp vụ cho các sự kiện này. RabbitMQ hiện minh họa khâu phát sự kiện, không đồng nghĩa đã triển khai đầy đủ hệ thống thông báo hay xử lý downstream.

### 4. Idempotency khi xác nhận đặt vé

API xác nhận booking nhận header tùy chọn `Idempotency-Key`. Nếu client gửi lại cùng yêu cầu do timeout hoặc retry mạng, hệ thống có thể trả lại response đã lưu thay vì tạo thêm kết quả xác nhận. Key được ràng buộc với người dùng và booking; dùng lại key cho một yêu cầu khác sẽ bị trả `409 Conflict`.

### 5. Khóa tài khoản và phân quyền

API được bảo vệ bằng JWT. Người đăng ký công khai nhận vai trò `Customer`; các thao tác quản trị yêu cầu vai trò `Admin`. Quản trị viên có thể khóa/mở khóa tài khoản, và Identity Service từ chối đăng nhập khi tài khoản đang bị khóa. Việc đặt vé lấy user ID từ JWT đã xác thực thay vì tin vào user ID do client tự gửi.

## Công nghệ

- **Backend:** C#, ASP.NET Core Web API trên .NET 8, Entity Framework Core
- **Database:** SQL Server
- **Điều phối cạnh tranh:** Redis, StackExchange.Redis
- **Message broker:** RabbitMQ
- **Gateway:** YARP
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Triển khai local:** Docker Compose
- **Kiểm thử:** xUnit

## Chạy toàn bộ bằng Docker Compose

### Yêu cầu

- Git
- Docker Desktop có Docker Compose

### Khởi chạy

Từ thư mục gốc repository, tạo file cấu hình local:

```powershell
Copy-Item .env.example .env
```

Mở `.env`, thay `SQL_SA_PASSWORD` bằng mật khẩu SQL Server mạnh và điền hai giá trị bí mật riêng biệt:

- `JWT_SECRET`: khóa ký JWT, tối thiểu 32 byte UTF-8.
- `INTERNAL_API_KEY`: khóa dùng cho lời gọi nội bộ Cinema → Booking, tối thiểu 32 byte UTF-8.

Không commit `.env` hoặc chia sẻ các khóa này. Có thể tùy chỉnh các cổng host trong cùng file nếu máy đã sử dụng cổng mặc định.

Khởi chạy các container:

```powershell
docker compose up --build -d
docker compose ps
```

Theo dõi log nếu một service chưa sẵn sàng:

```powershell
docker compose logs -f api-gateway booking-service
```

Compose khởi tạo SQL Server, Redis, RabbitMQ, bốn API service, API Gateway và frontend. Mỗi service tạo database riêng và dữ liệu mẫu khi khởi động lần đầu. Có thể dừng các container bằng:

```powershell
docker compose down
```

Để giữ dữ liệu SQL qua lần dừng container, cần bổ sung cấu hình volume bền vững cho SQL Server; Compose hiện tại không khai báo volume cho database.

### Địa chỉ local mặc định

| Thành phần | Địa chỉ |
|---|---|
| Frontend chạy trong Docker | http://localhost:5174 |
| API Gateway | http://localhost:5100 |
| Swagger tổng hợp qua Gateway | http://localhost:5100/swagger |
| Identity API Swagger | http://localhost:5104/swagger |
| Movie API Swagger | http://localhost:5101/swagger |
| Cinema API Swagger | http://localhost:5102/swagger |
| Booking API Swagger | http://localhost:5103/swagger |
| RabbitMQ Management UI | http://localhost:15673 |

Các cổng có thể đổi trong `.env`. Bên trong Docker network, các service dùng tên container và cổng nội bộ: `sqlserver:1433`, `redis:6379`, `rabbitmq:5672`, và API service ở `:8080`. RabbitMQ local hiện dùng tài khoản mặc định `guest`; không sử dụng cấu hình này cho production.

### Tài khoản quản trị đầu tiên

Để tạo tài khoản Admin bootstrap, điền `BOOTSTRAP_ADMIN_EMAIL` và `BOOTSTRAP_ADMIN_PASSWORD` trong `.env` trước lần khởi chạy đầu tiên. Tài khoản đăng ký công khai luôn nhận vai trò `Customer`, không thể tự chọn quyền Admin.

## Luồng demo

1. Mở frontend và đăng ký hoặc đăng nhập.
2. Chọn phim, rạp, suất chiếu và các ghế đang trống.
3. Giữ ghế; kiểm tra ghế chuyển sang trạng thái đang giữ và thời hạn 5 phút.
4. Xác nhận đặt vé bằng luồng thanh toán demo.
5. Mở mục vé của tôi để xem booking và chi tiết vé.
6. Thử mở hai phiên trình duyệt và cùng giữ một ghế để quan sát request cạnh tranh bị từ chối.
7. Đăng nhập bằng Admin để quản lý phim, lịch chiếu, sơ đồ ghế và tài khoản.

Booking Service có API thanh toán minh họa để tạo giao dịch và trạng thái thanh toán. Giao diện/luồng demo không kết nối cổng thanh toán thật; việc tạo QR hoặc đổi trạng thái giao dịch không phải bằng chứng đã thanh toán ngoài đời.

## API chính

Các đường dẫn sau được phục vụ qua API Gateway. Những endpoint quản trị yêu cầu JWT có vai trò phù hợp; endpoint booking yêu cầu JWT trừ khi nêu rõ khác.

| Nhóm | Một số endpoint |
|---|---|
| Tài khoản | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Phim | `GET /api/movies`, `GET /api/movies/{id}`; thao tác ghi dành cho Admin |
| Rạp và suất chiếu | `GET /api/cinemas`, `GET /api/showtimes`, `GET /api/showtimes/{id}`; thao tác ghi dành cho Admin |
| Ghế và booking | `GET /api/bookings/showtimes/{showtimeId}/seats`, `POST /api/bookings/hold`, `POST /api/bookings/{id}/confirm`, `POST /api/bookings/{id}/cancel` |
| Booking của tôi | `GET /api/bookings/my-bookings` |
| Thanh toán demo | `POST /api/payments/create`, `GET /api/payments/{transactionId}/status`, `POST /api/payments/{transactionId}/confirm` |
| Tình trạng dịch vụ | `GET /health` |

Cinema Service gửi danh sách ghế của phòng chiếu sang Booking Service khi tạo suất chiếu. Endpoint khởi tạo ghế là endpoint nội bộ được bảo vệ bằng `X-Internal-Api-Key`, không dành cho client frontend gọi trực tiếp. Nếu Booking Service không sẵn sàng, suất chiếu có thể đã được tạo nhưng bước khởi tạo ghế thất bại; cần xử lý/retry bước này.

## Chạy kiểm thử

Chạy các kiểm thử của solution:

```powershell
dotnet test CinemaBooking.sln
```

Kiểm thử hiện có tập trung vào quy tắc trạng thái ghế, thời hạn giữ, mã booking, validation yêu cầu giữ ghế, idempotency hash và quy tắc hủy booking.
