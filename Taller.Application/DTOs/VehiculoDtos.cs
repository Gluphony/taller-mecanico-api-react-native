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
    [Range(1, int.MaxValue)]
    public int ClienteId { get; init; }

    [Required, StringLength(12, MinimumLength = 2)]
    public string Placa { get; init; } = string.Empty;

    [StringLength(17, MinimumLength = 11)]
    public string? Vin { get; init; }

    [Required, StringLength(60, MinimumLength = 1)]
    public string Marca { get; init; } = string.Empty;

    [Required, StringLength(60, MinimumLength = 1)]
    public string Modelo { get; init; } = string.Empty;

    [Range(1886, 2100)]
    public int? Anio { get; init; }

    [StringLength(40)]
    public string? Color { get; init; }
}

public sealed class AsociarVehiculoRequest
{
    [Range(1, int.MaxValue)]
    public int ClienteId { get; init; }
}
