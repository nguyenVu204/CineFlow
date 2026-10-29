using Booking.API.Data;
using Booking.API.Dtos;
using Booking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConcessionsController : ControllerBase
{
    private readonly BookingDbContext _context;

    public ConcessionsController(BookingDbContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ConcessionResponse>>> GetConcessions([FromQuery] bool? inStockOnly)
    {
        var query = _context.Concessions.AsNoTracking().AsQueryable();
        if (inStockOnly == true)
        {
            query = query.Where(c => c.InStock);
        }

        var concessions = await query
            .OrderBy(c => c.Price)
            .Select(c => new ConcessionResponse(
                c.Id,
                c.Name,
                c.Description,
                c.Price,
                c.Icon,
                c.ImageUrl,
                c.InStock))
            .ToListAsync();

        return Ok(concessions);
    }

    [AllowAnonymous]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ConcessionResponse>> GetConcession(int id)
    {
        var c = await _context.Concessions.FindAsync(id);
        if (c is null)
        {
            return NotFound();
        }

        return Ok(new ConcessionResponse(c.Id, c.Name, c.Description, c.Price, c.Icon, c.ImageUrl, c.InStock));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ConcessionResponse>> CreateConcession([FromBody] ConcessionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || request.Price <= 0)
        {
            return BadRequest(new { message = "Concession name and positive price are required." });
        }

        var concession = new Concession
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Price = request.Price,
            Icon = string.IsNullOrWhiteSpace(request.Icon) ? "fa-popcorn" : request.Icon.Trim(),
            ImageUrl = request.ImageUrl?.Trim() ?? string.Empty,
            InStock = request.InStock
        };

        _context.Concessions.Add(concession);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetConcession),
            new { id = concession.Id },
            new ConcessionResponse(concession.Id, concession.Name, concession.Description, concession.Price, concession.Icon, concession.ImageUrl, concession.InStock));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateConcession(int id, [FromBody] ConcessionRequest request)
    {
        var concession = await _context.Concessions.FindAsync(id);
        if (concession is null)
        {
            return NotFound();
        }

        concession.Name = request.Name.Trim();
        concession.Description = request.Description?.Trim() ?? string.Empty;
        concession.Price = request.Price;
        if (!string.IsNullOrWhiteSpace(request.Icon)) concession.Icon = request.Icon.Trim();
        if (request.ImageUrl != null) concession.ImageUrl = request.ImageUrl.Trim();
        concession.InStock = request.InStock;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteConcession(int id)
    {
        var concession = await _context.Concessions.FindAsync(id);
        if (concession is null)
        {
            return NotFound();
        }

        _context.Concessions.Remove(concession);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:int}/stock")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ConcessionResponse>> ToggleStock(int id)
    {
        var concession = await _context.Concessions.FindAsync(id);
        if (concession is null)
        {
            return NotFound();
        }

        concession.InStock = !concession.InStock;
        await _context.SaveChangesAsync();

        return Ok(new ConcessionResponse(concession.Id, concession.Name, concession.Description, concession.Price, concession.Icon, concession.ImageUrl, concession.InStock));
    }
}

