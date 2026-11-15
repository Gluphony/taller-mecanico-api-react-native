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
        return await repository.ActualizarAsync(CrearEntidad(request, id));
    }

    public async Task<bool> AsociarClienteAsync(int id, int clienteId)
    {
        var vehiculo = await repository.ObtenerAsync(id);
        if (vehiculo is null || await clientes.ObtenerAsync(clienteId) is null) return false;
        vehiculo.ClienteId = clienteId;
        return await repository.ActualizarAsync(vehiculo);
    }

    public async Task<ResultadoEliminacion> EliminarAsync(int id)
    {
        if (await repository.EliminarAsync(id)) return ResultadoEliminacion.Eliminado;
        return await repository.ObtenerAsync(id) is null
            ? ResultadoEliminacion.NoEncontrado
            : ResultadoEliminacion.TieneRegistrosRelacionados;
    }

    private static Vehiculo CrearEntidad(GuardarVehiculoRequest request, int id = 0)
    {
        var placa = request.Placa.Trim().ToUpperInvariant();
        var marca = request.Marca.Trim();
        var modelo = request.Modelo.Trim();
        var vin = Limpiar(request.Vin)?.ToUpperInvariant();
        if (placa.Length is < 2 or > 12)
            throw new ArgumentException("La placa debe tener entre 2 y 12 caracteres no vacíos.");
        if (marca.Length is < 1 or > 60 || modelo.Length is < 1 or > 60)
            throw new ArgumentException("La marca y el modelo deben tener entre 1 y 60 caracteres no vacíos.");
        if (vin is not null && vin.Length is < 11 or > 17)
            throw new ArgumentException("El VIN debe tener entre 11 y 17 caracteres.");
        if (request.Anio is not null && request.Anio is < 1886 or > 2100)
            throw new ArgumentException("El año debe estar entre 1886 y 2100.");

        return new Vehiculo
        {
            Id = id,
            ClienteId = request.ClienteId,
            Placa = placa,
            Vin = vin,
            Marca = marca,
            Modelo = modelo,
            Anio = request.Anio,
            Color = Limpiar(request.Color)
        };
    }

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
