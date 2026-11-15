using System.ComponentModel.DataAnnotations;
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
        [FromQuery, Range(1, int.MaxValue, ErrorMessage = "El cliente debe ser un identificador positivo.")] int? clienteId,
        [FromQuery, StringLength(120, ErrorMessage = "La búsqueda no puede superar 120 caracteres.")] string? buscar) =>
        Ok(await vehiculos.ListarAsync(clienteId, buscar));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VehiculoDto>> Obtener([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id)
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
    public async Task<IActionResult> Actualizar([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id, GuardarVehiculoRequest request) =>
        await vehiculos.ActualizarAsync(id, request) ? NoContent() : NotFound();

    [HttpPut("{id:int}/cliente")]
    public async Task<IActionResult> AsociarCliente([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id, AsociarVehiculoRequest request) =>
        await vehiculos.AsociarClienteAsync(id, request.ClienteId) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id)
    {
        var resultado = await vehiculos.EliminarAsync(id);
        return resultado switch
        {
            ResultadoEliminacion.Eliminado => NoContent(),
            ResultadoEliminacion.NoEncontrado => NotFound(),
            _ => Conflict(new { mensaje = "No se puede eliminar el vehículo porque tiene servicios registrados." })
        };
    }

    [HttpGet("{id:int}/historial")]
    public async Task<IActionResult> Historial([Range(1, int.MaxValue, ErrorMessage = "El identificador debe ser positivo.")] int id)
    {
        if (await vehiculos.ObtenerAsync(id) is null) return NotFound();
        return Ok(await mantenimientos.ListarAsync(id));
    }
}
