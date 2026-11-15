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
    [Required(ErrorMessage = "El nombre del cliente es obligatorio.")]
    [StringLength(120, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 120 caracteres.")]
    public string NombreCompleto { get; init; } = string.Empty;

    [StringLength(30, ErrorMessage = "El teléfono no puede superar 30 caracteres.")]
    [RegularExpression(@"^\+?[0-9][0-9 ().-]{5,28}[0-9]$", ErrorMessage = "Escribe un teléfono con 7 a 15 dígitos.")]
    public string? Telefono { get; init; }

    [EmailAddress(ErrorMessage = "Escribe un correo válido.")]
    [StringLength(254, ErrorMessage = "El correo no puede superar 254 caracteres.")]
    public string? Email { get; init; }

    [StringLength(250, ErrorMessage = "La dirección no puede superar 250 caracteres.")]
    public string? Direccion { get; init; }
}
