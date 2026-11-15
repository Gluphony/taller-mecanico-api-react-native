using System.ComponentModel.DataAnnotations;

namespace Taller.Application.DTOs;

public sealed class VehiculoDto
{
    public int Id { get; init; }
    public int ClienteId { get; init; }
    public string? ClienteNombre { get; init; }
    public string Placa { get; init; } = string.Empty;
    public string? Vin { get; init; }
    public string Marca { get; init; } = string.Empty;
    public string Modelo { get; init; } = string.Empty;
    public int? Anio { get; init; }
    public string? Color { get; init; }
    public DateTime FechaRegistro { get; init; }
}

public sealed class GuardarVehiculoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Selecciona un cliente válido.")]
    public int ClienteId { get; init; }

    [Required(ErrorMessage = "La placa es obligatoria.")]
    [StringLength(12, MinimumLength = 2, ErrorMessage = "La placa debe tener entre 2 y 12 caracteres.")]
    [RegularExpression(@"^[A-Za-z0-9][A-Za-z0-9 -]{0,10}[A-Za-z0-9]$", ErrorMessage = "La placa solo admite letras, números, espacios y guiones.")]
    public string Placa { get; init; } = string.Empty;

    [StringLength(17, MinimumLength = 11, ErrorMessage = "El VIN debe tener entre 11 y 17 caracteres.")]
    [RegularExpression(@"(?i)^[A-HJ-NPR-Z0-9]{11,17}$", ErrorMessage = "El VIN solo admite letras y números; no usa I, O ni Q.")]
    public string? Vin { get; init; }

    [Required(ErrorMessage = "La marca es obligatoria.")]
    [StringLength(60, MinimumLength = 1, ErrorMessage = "La marca no puede superar 60 caracteres.")]
    public string Marca { get; init; } = string.Empty;

    [Required(ErrorMessage = "El modelo es obligatorio.")]
    [StringLength(60, MinimumLength = 1, ErrorMessage = "El modelo no puede superar 60 caracteres.")]
    public string Modelo { get; init; } = string.Empty;

    [Range(1886, 2100, ErrorMessage = "El año debe estar entre 1886 y 2100.")]
    public int? Anio { get; init; }

    [StringLength(40, ErrorMessage = "El color no puede superar 40 caracteres.")]
    public string? Color { get; init; }
}

public sealed class AsociarVehiculoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Selecciona un cliente válido.")]
    public int ClienteId { get; init; }
}
