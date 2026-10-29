using Booking.API.Data;
using Booking.API.Dtos;
using Booking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly BookingDbContext _context;

    public PromotionsController(BookingDbContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Promotion>>> GetPromotions([FromQuery] bool? activeOnly)
    {
        var query = _context.Promotions.AsNoTracking().AsQueryable();
        if (activeOnly == true)
        {
            query = query.Where(p => p.IsActive);
        }

        var promotions = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(promotions);
    }

    [AllowAnonymous]
    [HttpGet("{code}")]
    public async Task<ActionResult<Promotion>> GetPromotionByCode(string code)
    {
        var promo = await _context.Promotions.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Code == code.Trim().ToUpperInvariant());

        if (promo is null)
        {
            return NotFound();
        }

        return Ok(promo);
    }

    [AllowAnonymous]
    [HttpPost("validate")]
    public async Task<ActionResult<ValidatePromotionResponse>> ValidatePromotion([FromBody] ValidatePromotionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new ValidatePromotionResponse(false, "", "fixed", 0, 0, "Vui lòng nhập mã khuyến mãi."));
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var promo = await _context.Promotions.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Code == code);

        if (promo is null)
        {
            return Ok(new ValidatePromotionResponse(false, code, "fixed", 0, 0, "Mã khuyến mãi không tồn tại hoặc đã hết hạn!"));
        }

        if (!promo.IsActive)
        {
            return Ok(new ValidatePromotionResponse(false, code, promo.DiscountType, promo.DiscountValue, 0, "Mã khuyến mãi này hiện đang tạm dừng áp dụng!"));
        }

        if (request.OrderTotal < promo.MinOrderValue)
        {
            return Ok(new ValidatePromotionResponse(
                false,
                code,
                promo.DiscountType,
                promo.DiscountValue,
                0,
                $"Đơn hàng cần đạt tối thiểu {promo.MinOrderValue:N0}đ để áp dụng mã này!"));
        }

        decimal discountAmount = 0;
        if (promo.DiscountType.Equals("percent", StringComparison.OrdinalIgnoreCase))
        {
            discountAmount = Math.Round(request.OrderTotal * (promo.DiscountValue / 100m));
        }
        else
        {
            discountAmount = Math.Min(promo.DiscountValue, request.OrderTotal);
        }

        var message = promo.DiscountType.Equals("percent", StringComparison.OrdinalIgnoreCase)
            ? $"Áp dụng thành công: Giảm {promo.DiscountValue}% (tiết kiệm {discountAmount:N0}đ)!"
            : $"Áp dụng thành công: Giảm ngay {discountAmount:N0}đ!";

        return Ok(new ValidatePromotionResponse(
            true,
            promo.Code,
            promo.DiscountType,
            promo.DiscountValue,
            discountAmount,
            message));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Promotion>> CreatePromotion([FromBody] PromotionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code) || string.IsNullOrWhiteSpace(request.Title) || request.DiscountValue <= 0)
        {
            return BadRequest(new { message = "Code, title and positive discount value are required." });
        }

        var code = request.Code.Trim().ToUpperInvariant();
        if (await _context.Promotions.AnyAsync(p => p.Code == code))
        {
            return Conflict(new { message = $"Mã khuyến mãi '{code}' đã tồn tại!" });
        }

        var promotion = new Promotion
        {
            Code = code,
            Title = request.Title.Trim(),
            DiscountType = request.DiscountType?.Trim().ToLowerInvariant() == "percent" ? "percent" : "fixed",
            DiscountValue = request.DiscountValue,
            MinOrderValue = request.MinOrderValue,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Promotions.Add(promotion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPromotionByCode), new { code = promotion.Code }, promotion);
    }

    [HttpPut("{code}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdatePromotion(string code, [FromBody] PromotionRequest request)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        var promo = await _context.Promotions.FirstOrDefaultAsync(p => p.Code == normalizedCode);
        if (promo is null)
        {
            return NotFound();
        }

        promo.Title = request.Title.Trim();
        promo.DiscountType = request.DiscountType?.Trim().ToLowerInvariant() == "percent" ? "percent" : "fixed";
        promo.DiscountValue = request.DiscountValue;
        promo.MinOrderValue = request.MinOrderValue;
        promo.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{code}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePromotion(string code)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        var promo = await _context.Promotions.FirstOrDefaultAsync(p => p.Code == normalizedCode);
        if (promo is null)
        {
            return NotFound();
        }

        _context.Promotions.Remove(promo);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{code}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Promotion>> TogglePromotionActive(string code)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        var promo = await _context.Promotions.FirstOrDefaultAsync(p => p.Code == normalizedCode);
        if (promo is null)
        {
            return NotFound();
        }

        promo.IsActive = !promo.IsActive;
        await _context.SaveChangesAsync();
        return Ok(promo);
    }
}

