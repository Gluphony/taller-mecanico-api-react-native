using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Taller.Application.Services;

public sealed class MantenimientoService(
    IMantenimientoRepository repository,
    IVehiculoRepository vehiculos)
{
    public async Task<IReadOnlyList<MantenimientoDto>> ListarAsync(int? vehiculoId) =>
        (await repository.ListarAsync(vehiculoId)).Select(Mapear).ToArray();

    public async Task<MantenimientoDto?> ObtenerAsync(int id) =>
        MapearNullable(await repository.ObtenerAsync(id));

    public async Task<MantenimientoDto?> CrearAsync(GuardarMantenimientoRequest request)
    {
        if (await vehiculos.ObtenerAsync(request.VehiculoId) is null) return null;
        if (request.FechaServicio == default)
            throw new ArgumentException("La fecha del servicio es obligatoria.");
        if (request.ProximoMantenimiento is not null &&
            request.ProximoMantenimiento.Value.Date < request.FechaServicio.Date)
            throw new ArgumentException("El próximo mantenimiento no puede ser anterior al servicio.");

        var servicio = await repository.CrearAsync(new ServicioMantenimiento
        {
            VehiculoId = request.VehiculoId,
            FechaServicio = request.FechaServicio,
            TipoServicio = request.TipoServicio.Trim(),
            Descripcion = request.Descripcion.Trim(),
            Kilometraje = request.Kilometraje,
            Costo = request.Costo,
            Tecnico = Limpiar(request.Tecnico),
            Recomendaciones = Limpiar(request.Recomendaciones),
            ProximoMantenimiento = request.ProximoMantenimiento
        });
        return Mapear(servicio);
    }

    private static MantenimientoDto Mapear(ServicioMantenimiento x) => new()
    {
        Id = x.Id, VehiculoId = x.VehiculoId, Placa = x.Placa,
        Marca = x.Marca, Modelo = x.Modelo, FechaServicio = x.FechaServicio,
        TipoServicio = x.TipoServicio, Descripcion = x.Descripcion,
        Kilometraje = x.Kilometraje, Costo = x.Costo, Tecnico = x.Tecnico,
        Recomendaciones = x.Recomendaciones, ProximoMantenimiento = x.ProximoMantenimiento
    };

    private static MantenimientoDto? MapearNullable(ServicioMantenimiento? x) =>
        x is null ? null : Mapear(x);

    private static string? Limpiar(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
