using System.ComponentModel.DataAnnotations;

namespace Taller.Application.DTOs;

public sealed class MantenimientoDto
{
    public int Id { get; init; }
    public int VehiculoId { get; init; }
    public string? Placa { get; init; }
    public string? Marca { get; init; }
    public string? Modelo { get; init; }
    public DateTime FechaServicio { get; init; }
    public string TipoServicio { get; init; } = string.Empty;
    public string Descripcion { get; init; } = string.Empty;
    public int? Kilometraje { get; init; }
    public decimal Costo { get; init; }
    public string? Tecnico { get; init; }
    public string? Recomendaciones { get; init; }
    public DateTime? ProximoMantenimiento { get; init; }
}

public sealed class GuardarMantenimientoRequest
{
    [Range(1, int.MaxValue)]
    public int VehiculoId { get; init; }

    public DateTime FechaServicio { get; init; }

    [Required, StringLength(80, MinimumLength = 2)]
    public string TipoServicio { get; init; } = string.Empty;

    [Required, StringLength(2000, MinimumLength = 2)]
    public string Descripcion { get; init; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int? Kilometraje { get; init; }

    [Range(typeof(decimal), "0", "999999999.99")]
    public decimal Costo { get; init; }

    [StringLength(120)]
    public string? Tecnico { get; init; }

    [StringLength(2000)]
    public string? Recomendaciones { get; init; }

    public DateTime? ProximoMantenimiento { get; init; }
}
