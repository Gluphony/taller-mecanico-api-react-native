using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Taller.Application.Services;

public sealed class MantenimientoService(
    IMantenimientoRepository repository,
    IVehiculoRepository vehiculos)
{
    public async Task<IReadOnlyList<MantenimientoDto>> ListarAsync(int? vehiculoId)
    {
        if (vehiculoId is <= 0)
            throw new ArgumentException("El vehículo debe ser un identificador positivo.");
        return (await repository.ListarAsync(vehiculoId)).Select(Mapear).ToArray();
    }

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
        ValidarDatos(request);
        var actual = await repository.ObtenerAsync(id);
        if (actual is null) return false;
        if (request.VehiculoId != actual.VehiculoId)
            throw new ArgumentException("No se puede cambiar el vehículo de un servicio existente.");

        return await repository.ActualizarAsync(CrearEntidad(request, actual.VehiculoId, id));
    }

    public Task<bool> EliminarAsync(int id) => repository.EliminarAsync(id);

    private static void ValidarDatos(GuardarMantenimientoRequest request)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));
        if (request.FechaServicio == default)
            throw new ArgumentException("La fecha del servicio es obligatoria.");
        if (request.FechaServicio.Year < 1886 || request.FechaServicio.Year > 2100)
            throw new ArgumentException("El año de la fecha de servicio debe estar entre 1886 y 2100.");
        if (string.IsNullOrWhiteSpace(request.TipoServicio) || string.IsNullOrWhiteSpace(request.Descripcion))
            throw new ArgumentException("El tipo de servicio y el trabajo realizado son obligatorios.");
        if (request.TipoServicio.Trim().Length is < 2 or > 80)
            throw new ArgumentException("El tipo de servicio debe tener entre 2 y 80 caracteres no vacíos.");
        if (request.Descripcion.Trim().Length is < 2 or > 2000)
            throw new ArgumentException("La descripción debe tener entre 2 y 2000 caracteres no vacíos.");
        if (request.Kilometraje is < 0)
            throw new ArgumentException("El kilometraje debe ser un entero igual o mayor que cero.");
        if (request.Costo is < 0 or > 999999999.99m)
            throw new ArgumentException("El costo debe estar entre 0 y 999,999,999.99.");
        if (request.Tecnico?.Trim().Length > 120)
            throw new ArgumentException("El nombre del técnico no puede superar 120 caracteres.");
        if (request.Recomendaciones?.Trim().Length > 2000)
            throw new ArgumentException("Las recomendaciones no pueden superar 2000 caracteres.");
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
