using Taller.Domain;

namespace Taller.Application.Interfaces;

public interface IClienteRepository
{
    Task<IReadOnlyList<Cliente>> ListarAsync(string? buscar);
    Task<Cliente?> ObtenerAsync(int id);
    Task<Cliente> CrearAsync(Cliente cliente);
    Task<bool> ActualizarAsync(Cliente cliente);
}
