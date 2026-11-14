using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taller.Application.DTOs;
using Taller.Application.Services;

namespace Foro2_Last.Controllers;

[ApiController]
[Authorize]
[Route("api/mantenimientos")]
public sealed class MantenimientosController(MantenimientoService mantenimientos) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MantenimientoDto>>> Listar(
        [FromQuery] int? vehiculoId) =>
        Ok(await mantenimientos.ListarAsync(vehiculoId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MantenimientoDto>> Obtener(int id)
    {
        var servicio = await mantenimientos.ObtenerAsync(id);
        return servicio is null ? NotFound() : Ok(servicio);
    }

    [HttpPost]
    public async Task<ActionResult<MantenimientoDto>> Crear(GuardarMantenimientoRequest request)
    {
        var servicio = await mantenimientos.CrearAsync(request);
        return servicio is null
            ? NotFound(new { mensaje = "No se encontró el vehículo indicado." })
            : CreatedAtAction(nameof(Obtener), new { id = servicio.Id }, servicio);
    }
}
