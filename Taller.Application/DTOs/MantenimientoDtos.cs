using System.ComponentModel.DataAnnotations;

namespace Taller.Application.DTOs;

public sealed class MantenimientoDto
{
    public int Id { get; init; }
    public int VehiculoId { get; init; }
    public string? Placa { get; init; }
    public string? Marca { get; init; }
    public string? Modelo { get; init; }
    [Required(ErrorMessage = "La fecha del servicio es obligatoria.")]
    public DateTime FechaServicio { get; init; }
    public string TipoServicio { get; init; } = string.Empty;
    public string Descripcion { get; init; } = string.Empty;
    public int? Kilometraje { get; init; }
    public decimal Costo { get; init; }
    public string? Tecnico { get; init; }
    public string? Recomendaciones { get; init; }
    public DateTime? ProximoMantenimiento { get; init; }
    public DateTime? ActualizadoEn { get; init; }
}

public sealed class GuardarMantenimientoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Selecciona un vehículo válido.")]
    public int VehiculoId { get; init; }

    public DateTime FechaServicio { get; init; }

    [Required(ErrorMessage = "El tipo de servicio es obligatorio.")]
    [StringLength(80, MinimumLength = 2, ErrorMessage = "El tipo de servicio debe tener entre 2 y 80 caracteres.")]
    public string TipoServicio { get; init; } = string.Empty;

    [Required(ErrorMessage = "Describe el trabajo realizado.")]
    [StringLength(2000, MinimumLength = 2, ErrorMessage = "La descripción debe tener entre 2 y 2000 caracteres.")]
    public string Descripcion { get; init; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "El kilometraje debe ser un entero igual o mayor que cero.")]
    public int? Kilometraje { get; init; }

    [Range(typeof(decimal), "0", "999999999.99", ErrorMessage = "El costo debe estar entre 0 y 999,999,999.99.")]
    public decimal Costo { get; init; }

    [StringLength(120, ErrorMessage = "El nombre del técnico no puede superar 120 caracteres.")]
    public string? Tecnico { get; init; }

    [StringLength(2000, ErrorMessage = "Las recomendaciones no pueden superar 2000 caracteres.")]
    public string? Recomendaciones { get; init; }

    public DateTime? ProximoMantenimiento { get; init; }
}
