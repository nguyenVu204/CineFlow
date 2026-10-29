using Booking.API.Data;
using Booking.API.Dtos;
using Booking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booking.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly BookingDbContext _context;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(BookingDbContext context, ILogger<PaymentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("create")]
    public async Task<ActionResult<PaymentResponse>> CreatePayment(
        [FromBody] CreatePaymentRequest request,
        CancellationToken cancellationToken)
    {
        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

        if (booking is null)
        {
            return NotFound(new { message = "Booking not found." });
        }

        var method = (request.PaymentMethod ?? "MOMO").Trim().ToUpperInvariant();
        var transactionId = $"TXN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}";
        var qrData = $"CINEVERSE-PAY-{method}-{booking.BookingCode}-{booking.TotalAmount}";
        var qrCodeUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={Uri.EscapeDataString(qrData)}";
        var paymentUrl = request.ReturnUrl ?? $"https://cineverse.vn/checkout/callback?txn={transactionId}&bookingCode={booking.BookingCode}";

        var transaction = new PaymentTransaction
        {
            TransactionId = transactionId,
            BookingId = booking.Id,
            PaymentMethod = method,
            Amount = booking.TotalAmount,
            Status = "Pending",
            PaymentUrl = paymentUrl,
            QrCodeUrl = qrCodeUrl,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = booking.ExpiresAt
        };

        _context.PaymentTransactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Created payment transaction {TransactionId} for booking {BookingId}.", transactionId, booking.Id);

        return Ok(new PaymentResponse(
            transaction.TransactionId,
            transaction.BookingId,
            transaction.PaymentMethod,
            transaction.Amount,
            transaction.PaymentUrl,
            transaction.QrCodeUrl,
            transaction.ExpiresAt,
            transaction.Status));
    }

    [HttpGet("{transactionId}/status")]
    public async Task<ActionResult<PaymentResponse>> GetPaymentStatus(
        string transactionId,
        CancellationToken cancellationToken)
    {
        var transaction = await _context.PaymentTransactions
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TransactionId == transactionId, cancellationToken);

        if (transaction is null)
        {
            return NotFound(new { message = "Payment transaction not found." });
        }

        return Ok(new PaymentResponse(
            transaction.TransactionId,
            transaction.BookingId,
            transaction.PaymentMethod,
            transaction.Amount,
            transaction.PaymentUrl,
            transaction.QrCodeUrl,
            transaction.ExpiresAt,
            transaction.Status));
    }

    [HttpPost("{transactionId}/confirm")]
    public async Task<IActionResult> ConfirmPayment(
        string transactionId,
        CancellationToken cancellationToken)
    {
        var transaction = await _context.PaymentTransactions
            .FirstOrDefaultAsync(t => t.TransactionId == transactionId, cancellationToken);

        if (transaction is null)
        {
            return NotFound(new { message = "Payment transaction not found." });
        }

        transaction.Status = "Completed";
        await _context.SaveChangesAsync(cancellationToken);

        return Ok(new { success = true, transactionId, status = "Completed" });
    }
}

