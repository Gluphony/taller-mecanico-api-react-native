using System.ComponentModel.DataAnnotations;
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
        [FromQuery, Range(1, int.MaxValue, ErrorMessage = "El vehículo debe ser un identificador positivo.")] int? vehiculoId) =>
        Ok(await mantenimientos.ListarAsync(vehiculoId));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MantenimientoDto>> Obtener([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id)
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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id, GuardarMantenimientoRequest request) =>
        await mantenimientos.ActualizarAsync(id, request) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id) =>
        await mantenimientos.EliminarAsync(id) ? NoContent() : NotFound();
}
