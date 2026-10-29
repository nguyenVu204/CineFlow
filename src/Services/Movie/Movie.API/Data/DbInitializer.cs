using MovieEntity = Movie.API.Models.Movie;
using MovieStatus = Movie.API.Models.MovieStatus;

namespace Movie.API.Data;

public static class DbInitializer
{
    public static void Seed(MovieDbContext context)
    {
        context.Database.EnsureCreated();

        if (context.Movies.Any())
        {
            return;
        }

        var movies = new[]
        {
            new MovieEntity
            {
                Title = "Hành Tinh Cát: Phần Hai",
                OriginalTitle = "Dune: Part Two",
                Description = "Paul Atreides hợp nhất với tộc người Fremen và bắt đầu hành trình trả thù những kẻ đã hủy hoại gia tộc mình. Đứng trước sự lựa chọn giữa tình yêu của cuộc đời và số phận của vũ trụ, anh phải ngăn chặn một tương lai tồi tệ mà chỉ mình anh nhìn thấy.",
                DurationMinutes = 166,
                ReleaseDate = new DateTime(2025, 3, 15),
                PosterUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
                BackdropUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80",
                Genre = "Khoa Học Viễn Tưởng",
                Status = MovieStatus.NowShowing,
                Rating = 9.4,
                AgeRating = "C16",
                Director = "Denis Villeneuve",
                Cast = "Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem",
                Formats = "IMAX Laser,2D Phụ Đề,Dolby Atmos",
                TrailerUrl = "https://www.youtube.com/embed/Way9Dexny3w"
            },
            new MovieEntity
            {
                Title = "Kẻ Đánh Cắp Giấc Mơ: Tái Khởi",
                OriginalTitle = "Inception: Awakening IMAX",
                Description = "Phiên bản kỷ niệm 4K IMAX Laser. Dom Cobb là một siêu trộm có khả năng xâm nhập vào tiềm thức của người khác thông qua giấc mơ để đánh cắp những bí mật vô giá. Nhiệm vụ cuối cùng của anh là cấy một ý tưởng vào não bộ mục tiêu.",
                DurationMinutes = 148,
                ReleaseDate = new DateTime(2025, 3, 20),
                PosterUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
                BackdropUrl = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1400&q=80",
                Genre = "Hành Động",
                Status = MovieStatus.NowShowing,
                Rating = 9.6,
                AgeRating = "C13",
                Director = "Christopher Nolan",
                Cast = "Leonardo DiCaprio, Joseph Gordon-Levitt, Cillian Murphy, Tom Hardy",
                Formats = "IMAX Laser,2D Phụ Đề",
                TrailerUrl = "https://www.youtube.com/embed/YoHD9XEInc0"
            },
            new MovieEntity
            {
                Title = "Vệ Binh Dải Ngân Hà: Hồi Kết",
                OriginalTitle = "Guardians of the Galaxy Vol. 3",
                Description = "Đội Vệ Binh bước vào chuyến phiêu lưu cuối cùng đầy cảm xúc nhằm bảo vệ Rocket khỏi kẻ sáng tạo tàn nhẫn High Evolutionary. Một nhiệm vụ sinh tử có thể đặt dấu chấm hết cho cả đội nếu thất bại.",
                DurationMinutes = 150,
                ReleaseDate = new DateTime(2025, 3, 10),
                PosterUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                BackdropUrl = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=80",
                Genre = "Hành Động",
                Status = MovieStatus.NowShowing,
                Rating = 9.1,
                AgeRating = "C13",
                Director = "James Gunn",
                Cast = "Chris Pratt, Zoe Saldaña, Dave Bautista, Bradley Cooper",
                Formats = "3D Phụ Đề,2D Phụ Đề",
                TrailerUrl = "https://www.youtube.com/embed/u3V5KDHRQvk"
            },
            new MovieEntity
            {
                Title = "Lời Nguyền Huyết Nguyệt",
                OriginalTitle = "Crimson Moon Curse",
                Description = "Tại một ngôi làng cổ ẩn sâu trong rừng sương mù Đà Lạt, mỗi đêm trăng máu xuất hiện đều đánh thức một giao ước tâm linh từ trăm năm trước. Những bí mật gia tộc kinh hoàng dần bị phơi bày.",
                DurationMinutes = 118,
                ReleaseDate = new DateTime(2025, 3, 22),
                PosterUrl = "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80",
                BackdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
                Genre = "Kinh Dị",
                Status = MovieStatus.NowShowing,
                Rating = 8.5,
                AgeRating = "C18",
                Director = "Lê Văn Kiệt",
                Cast = "Kaity Nguyễn, Quang Tuấn, NSƯT Hữu Châu",
                Formats = "2D Phụ Đề,Dolby Atmos",
                TrailerUrl = "https://www.youtube.com/embed/Way9Dexny3w"
            },
            new MovieEntity
            {
                Title = "Vùng Đất Linh Hồn Phiêu Lưu",
                OriginalTitle = "Spirited Realms",
                Description = "Cô bé Sora tình cờ bước qua cánh cổng cổ xưa dẫn vào thế giới của những vị thần thời tiết. Để cứu thị trấn nhỏ khỏi cơn bão vĩnh cửu, cô phải tìm kiếm chiếc chìa khóa ánh sáng.",
                DurationMinutes = 125,
                ReleaseDate = new DateTime(2025, 3, 5),
                PosterUrl = "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
                BackdropUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80",
                Genre = "Hoạt Hình",
                Status = MovieStatus.NowShowing,
                Rating = 9.3,
                AgeRating = "P",
                Director = "Makoto Shinkai",
                Cast = "Mone Kamishiraishi, Ryunosuke Kamiki (Lồng tiếng)",
                Formats = "2D Lồng Tiếng,2D Phụ Đề",
                TrailerUrl = "https://www.youtube.com/embed/YoHD9XEInc0"
            },
            new MovieEntity
            {
                Title = "Chuyến Tàu Mùa Thu Năm Ấy",
                OriginalTitle = "Autumn Express to Kyoto",
                Description = "Hai người xa lạ tình cờ gặp nhau trên chuyến tàu đêm hướng về Kyoto giữa mùa lá đỏ rực rỡ, mở ra câu chuyện tình lãng mạn nhưng cũng đầy trắc trở.",
                DurationMinutes = 132,
                ReleaseDate = new DateTime(2025, 3, 18),
                PosterUrl = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
                BackdropUrl = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80",
                Genre = "Tình Cảm",
                Status = MovieStatus.NowShowing,
                Rating = 8.8,
                AgeRating = "C13",
                Director = "Trần Anh Hùng",
                Cast = "Anh Tú, Phương Anh Đào, Hồng Đào",
                Formats = "2D Phụ Đề",
                TrailerUrl = "https://www.youtube.com/embed/u3V5KDHRQvk"
            }
        };

        context.Movies.AddRange(movies);
        context.SaveChanges();
    }
}
