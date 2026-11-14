using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taller.Application.DTOs;
using Taller.Application.Services;

namespace Foro2_Last.Controllers;

[ApiController]
[Authorize]
[Route("api/vehiculos")]
public sealed class VehiculosController(
    VehiculoService vehiculos,
    MantenimientoService mantenimientos) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VehiculoDto>>> Listar(
        [FromQuery] int? clienteId, [FromQuery] string? buscar) =>
        Ok(await vehiculos.ListarAsync(clienteId, buscar));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehiculoDto>> Obtener(int id)
    {
        var vehiculo = await vehiculos.ObtenerAsync(id);
        return vehiculo is null ? NotFound() : Ok(vehiculo);
    }

    [HttpPost]
    public async Task<ActionResult<VehiculoDto>> Crear(GuardarVehiculoRequest request)
    {
        var vehiculo = await vehiculos.CrearAsync(request);
        return vehiculo is null
            ? NotFound(new { mensaje = "No se encontró el cliente indicado." })
            : CreatedAtAction(nameof(Obtener), new { id = vehiculo.Id }, vehiculo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, GuardarVehiculoRequest request) =>
        await vehiculos.ActualizarAsync(id, request) ? NoContent() : NotFound();

    [HttpPut("{id:int}/cliente")]
    public async Task<IActionResult> AsociarCliente(int id, AsociarVehiculoRequest request) =>
        await vehiculos.AsociarClienteAsync(id, request.ClienteId) ? NoContent() : NotFound();

    [HttpGet("{id:int}/historial")]
    public async Task<IActionResult> Historial(int id)
    {
        if (await vehiculos.ObtenerAsync(id) is null) return NotFound();
        return Ok(await mantenimientos.ListarAsync(id));
    }
}
