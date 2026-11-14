using System.ComponentModel.DataAnnotations;

namespace Taller.Application.DTOs;

public sealed class ClienteDto
{
    public int Id { get; init; }
    public string NombreCompleto { get; init; } = string.Empty;
    public string? Telefono { get; init; }
    public string? Email { get; init; }
    public string? Direccion { get; init; }
    public DateTime FechaRegistro { get; init; }
}

public sealed class GuardarClienteRequest
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string NombreCompleto { get; init; } = string.Empty;

    [StringLength(30)]
    public string? Telefono { get; init; }

    [EmailAddress, StringLength(254)]
    public string? Email { get; init; }

    [StringLength(250)]
    public string? Direccion { get; init; }
}
