using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Taller.Application.Services;

public sealed class VehiculoService(IVehiculoRepository repository, IClienteRepository clientes)
{
    public async Task<IReadOnlyList<VehiculoDto>> ListarAsync(int? clienteId, string? buscar) =>
        (await repository.ListarAsync(clienteId, Limpiar(buscar))).Select(Mapear).ToArray();

    public async Task<VehiculoDto?> ObtenerAsync(int id) =>
        MapearNullable(await repository.ObtenerAsync(id));

    public async Task<VehiculoDto?> CrearAsync(GuardarVehiculoRequest request)
    {
        if (await clientes.ObtenerAsync(request.ClienteId) is null) return null;
        var vehiculo = CrearEntidad(request);
        return Mapear(await repository.CrearAsync(vehiculo));
    }

    public async Task<bool> ActualizarAsync(int id, GuardarVehiculoRequest request)
    {
        if (await repository.ObtenerAsync(id) is null ||
            await clientes.ObtenerAsync(request.ClienteId) is null) return false;
        var vehiculo = CrearEntidad(request);
        vehiculo.Id = id;
        return await repository.ActualizarAsync(vehiculo);
    }

    public async Task<bool> AsociarClienteAsync(int id, int clienteId)
    {
        var vehiculo = await repository.ObtenerAsync(id);
        if (vehiculo is null || await clientes.ObtenerAsync(clienteId) is null) return false;
        vehiculo.ClienteId = clienteId;
        return await repository.ActualizarAsync(vehiculo);
    }

    private static Vehiculo CrearEntidad(GuardarVehiculoRequest request) => new()
    {
        ClienteId = request.ClienteId,
        Placa = request.Placa.Trim().ToUpperInvariant(),
        Vin = Limpiar(request.Vin)?.ToUpperInvariant(),
        Marca = request.Marca.Trim(),
        Modelo = request.Modelo.Trim(),
        Anio = request.Anio,
        Color = Limpiar(request.Color)
    };

    private static VehiculoDto Mapear(Vehiculo x) => new()
    {
        Id = x.Id, ClienteId = x.ClienteId, ClienteNombre = x.ClienteNombre,
        Placa = x.Placa, Vin = x.Vin, Marca = x.Marca, Modelo = x.Modelo,
        Anio = x.Anio, Color = x.Color, FechaRegistro = x.FechaRegistro
    };

    private static VehiculoDto? MapearNullable(Vehiculo? x) =>
        x is null ? null : Mapear(x);

    private static string? Limpiar(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
