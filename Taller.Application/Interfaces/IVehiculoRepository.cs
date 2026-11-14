using Taller.Domain;

namespace Taller.Application.Interfaces;

public interface IVehiculoRepository
{
    Task<IReadOnlyList<Vehiculo>> ListarAsync(int? clienteId, string? buscar);
    Task<Vehiculo?> ObtenerAsync(int id);
    Task<Vehiculo> CrearAsync(Vehiculo vehiculo);
    Task<bool> ActualizarAsync(Vehiculo vehiculo);
}
