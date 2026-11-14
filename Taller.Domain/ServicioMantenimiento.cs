namespace Taller.Domain;

public sealed class ServicioMantenimiento
{
    public int Id { get; set; }
    public int VehiculoId { get; set; }
    public DateTime FechaServicio { get; set; }
    public string TipoServicio { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int? Kilometraje { get; set; }
    public decimal Costo { get; set; }
    public string? Tecnico { get; set; }
    public string? Recomendaciones { get; set; }
    public DateTime? ProximoMantenimiento { get; set; }
    public DateTime? ActualizadoEn { get; set; }
    public string? Placa { get; set; }
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
}
