using Taller.Domain;

namespace Taller.Application.Interfaces;

public interface IMantenimientoRepository
{
    Task<IReadOnlyList<ServicioMantenimiento>> ListarAsync(int? vehiculoId);
    Task<ServicioMantenimiento?> ObtenerAsync(int id);
    Task<ServicioMantenimiento> CrearAsync(ServicioMantenimiento servicio);
}
