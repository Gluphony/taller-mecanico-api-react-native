using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;
using System.Text.RegularExpressions;

namespace Taller.Application.Services;

public sealed class VehiculoService(IVehiculoRepository repository, IClienteRepository clientes)
{
    public async Task<IReadOnlyList<VehiculoDto>> ListarAsync(int? clienteId, string? buscar)
    {
        if (clienteId is <= 0)
            throw new ArgumentException("El cliente debe ser un identificador positivo.");
        var filtro = Limpiar(buscar);
        if (filtro?.Length > 120)
            throw new ArgumentException("La búsqueda no puede superar 120 caracteres.");
        return (await repository.ListarAsync(clienteId, filtro)).Select(Mapear).ToArray();
    }

    public async Task<VehiculoDto?> ObtenerAsync(int id) =>
        MapearNullable(await repository.ObtenerAsync(id));

    public async Task<VehiculoDto?> CrearAsync(GuardarVehiculoRequest request)
    {
        var vehiculo = CrearEntidad(request);
        if (await clientes.ObtenerAsync(vehiculo.ClienteId) is null) return null;
        return Mapear(await repository.CrearAsync(vehiculo));
    }

    public async Task<bool> ActualizarAsync(int id, GuardarVehiculoRequest request)
    {
        var vehiculo = CrearEntidad(request, id);
        if (await repository.ObtenerAsync(id) is null ||
            await clientes.ObtenerAsync(vehiculo.ClienteId) is null) return false;
        return await repository.ActualizarAsync(vehiculo);
    }

    public async Task<bool> AsociarClienteAsync(int id, int clienteId)
    {
        if (await repository.ObtenerAsync(id) is null ||
            await clientes.ObtenerAsync(clienteId) is null) return false;
        return await repository.AsociarClienteAsync(id, clienteId);
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
        if (request is null) throw new ArgumentNullException(nameof(request));
        if (string.IsNullOrWhiteSpace(request.Placa) || string.IsNullOrWhiteSpace(request.Marca) || string.IsNullOrWhiteSpace(request.Modelo))
            throw new ArgumentException("La placa, la marca y el modelo son obligatorios.");
        var placa = request.Placa.Trim().ToUpperInvariant();
        var marca = request.Marca.Trim();
        var modelo = request.Modelo.Trim();
        var vin = Limpiar(request.Vin)?.ToUpperInvariant();
        if (placa.Length is < 2 or > 12 || !Regex.IsMatch(placa, @"^[A-Z0-9][A-Z0-9 -]{0,10}[A-Z0-9]$"))
            throw new ArgumentException("La placa debe tener entre 2 y 12 letras, números, espacios o guiones.");
        if (marca.Length is < 1 or > 60 || modelo.Length is < 1 or > 60)
            throw new ArgumentException("La marca y el modelo deben tener entre 1 y 60 caracteres no vacíos.");
        if (vin is not null && (vin.Length is < 11 or > 17 || !Regex.IsMatch(vin, @"^[A-HJ-NPR-Z0-9]{11,17}$")))
            throw new ArgumentException("El VIN debe tener entre 11 y 17 letras o números; no puede usar I, O ni Q.");
        if (request.Anio is not null && (request.Anio < 1886 || request.Anio > DateTime.UtcNow.Year + 1))
            throw new ArgumentException($"El año debe estar entre 1886 y {DateTime.UtcNow.Year + 1}.");
        var color = Limpiar(request.Color);
        if (color?.Length > 40)
            throw new ArgumentException("El color no puede superar 40 caracteres.");

        return new Vehiculo
        {
            Id = id,
            ClienteId = request.ClienteId,
            Placa = placa,
            Vin = vin,
            Marca = marca,
            Modelo = modelo,
            Anio = request.Anio,
            Color = color
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
