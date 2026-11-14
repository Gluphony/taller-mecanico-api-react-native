namespace Taller.Domain;

public sealed class Vehiculo
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string Placa { get; set; } = string.Empty;
    public string? Vin { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int? Anio { get; set; }
    public string? Color { get; set; }
    public string? ClienteNombre { get; set; }
    public DateTime FechaRegistro { get; set; }
}
