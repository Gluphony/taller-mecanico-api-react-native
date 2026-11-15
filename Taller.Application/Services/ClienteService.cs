using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Taller.Application.Services;

public sealed class ClienteService(IClienteRepository repository)
{
    public async Task<IReadOnlyList<ClienteDto>> ListarAsync(string? buscar) =>
        (await repository.ListarAsync(Limpiar(buscar))).Select(Mapear).ToArray();

    public async Task<ClienteDto?> ObtenerAsync(int id) =>
        MapearNullable(await repository.ObtenerAsync(id));

    public async Task<ClienteDto> CrearAsync(GuardarClienteRequest request) =>
        Mapear(await repository.CrearAsync(CrearEntidad(request)));

    public async Task<bool> ActualizarAsync(int id, GuardarClienteRequest request)
    {
        if (await repository.ObtenerAsync(id) is null) return false;
        return await repository.ActualizarAsync(CrearEntidad(request, id));
    }

    public async Task<ResultadoEliminacion> EliminarAsync(int id)
    {
        if (await repository.EliminarAsync(id)) return ResultadoEliminacion.Eliminado;
        return await repository.ObtenerAsync(id) is null
            ? ResultadoEliminacion.NoEncontrado
            : ResultadoEliminacion.TieneRegistrosRelacionados;
    }

    private static ClienteDto Mapear(Cliente x) => new()
    {
        Id = x.Id, NombreCompleto = x.NombreCompleto, Telefono = x.Telefono,
        Email = x.Email, Direccion = x.Direccion, FechaRegistro = x.FechaRegistro
    };

    private static ClienteDto? MapearNullable(Cliente? x) =>
        x is null ? null : Mapear(x);

    private static string? Limpiar(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static Cliente CrearEntidad(GuardarClienteRequest request, int id = 0) => new()
    {
        Id = id,
        NombreCompleto = ValidarNombre(request.NombreCompleto),
        Telefono = Limpiar(request.Telefono),
        Email = Limpiar(request.Email)?.ToLowerInvariant(),
        Direccion = Limpiar(request.Direccion)
    };

    private static string ValidarNombre(string value)
    {
        var nombre = value.Trim();
        if (nombre.Length < 2)
            throw new ArgumentException("El nombre del cliente debe tener al menos 2 caracteres no vacíos.");
        return nombre;
    }
}
