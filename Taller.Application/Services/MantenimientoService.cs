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
        ValidarDatos(request);
        if (await vehiculos.ObtenerAsync(request.VehiculoId) is null) return null;

        var servicio = await repository.CrearAsync(CrearEntidad(request));
        return Mapear(servicio);
    }

    public async Task<bool> ActualizarAsync(int id, GuardarMantenimientoRequest request)
    {
        var actual = await repository.ObtenerAsync(id);
        if (actual is null) return false;
        if (request.VehiculoId != actual.VehiculoId)
            throw new ArgumentException("No se puede cambiar el vehículo de un servicio existente.");

        ValidarDatos(request);
        return await repository.ActualizarAsync(CrearEntidad(request, actual.VehiculoId, id));
    }

    public Task<bool> EliminarAsync(int id) => repository.EliminarAsync(id);

    private static void ValidarDatos(GuardarMantenimientoRequest request)
    {
        if (request.FechaServicio == default)
            throw new ArgumentException("La fecha del servicio es obligatoria.");
        if (request.TipoServicio.Trim().Length < 2)
            throw new ArgumentException("El tipo de servicio debe tener al menos 2 caracteres no vacíos.");
        if (request.Descripcion.Trim().Length < 2)
            throw new ArgumentException("La descripción debe tener al menos 2 caracteres no vacíos.");
        if (request.ProximoMantenimiento is not null &&
            request.ProximoMantenimiento.Value < request.FechaServicio)
            throw new ArgumentException("El próximo mantenimiento no puede ser anterior al servicio.");
    }

    private static MantenimientoDto Mapear(ServicioMantenimiento x) => new()
    {
        Id = x.Id, VehiculoId = x.VehiculoId, Placa = x.Placa,
        Marca = x.Marca, Modelo = x.Modelo, FechaServicio = x.FechaServicio,
        TipoServicio = x.TipoServicio, Descripcion = x.Descripcion,
        Kilometraje = x.Kilometraje, Costo = x.Costo, Tecnico = x.Tecnico,
        Recomendaciones = x.Recomendaciones, ProximoMantenimiento = x.ProximoMantenimiento,
        ActualizadoEn = x.ActualizadoEn
    };

    private static MantenimientoDto? MapearNullable(ServicioMantenimiento? x) =>
        x is null ? null : Mapear(x);

    private static ServicioMantenimiento CrearEntidad(
        GuardarMantenimientoRequest request,
        int? vehiculoId = null,
        int id = 0) => new()
    {
        Id = id,
        VehiculoId = vehiculoId ?? request.VehiculoId,
        FechaServicio = request.FechaServicio,
        TipoServicio = request.TipoServicio.Trim(),
        Descripcion = request.Descripcion.Trim(),
        Kilometraje = request.Kilometraje,
        Costo = request.Costo,
        Tecnico = Limpiar(request.Tecnico),
        Recomendaciones = Limpiar(request.Recomendaciones),
        ProximoMantenimiento = request.ProximoMantenimiento
    };

    private static string? Limpiar(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
