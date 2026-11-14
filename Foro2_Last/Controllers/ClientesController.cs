using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taller.Application.DTOs;
using Taller.Application.Services;

namespace Foro2_Last.Controllers;

[ApiController]
[Authorize]
[Route("api/clientes")]
public sealed class ClientesController(ClienteService clientes) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClienteDto>>> Listar([FromQuery] string? buscar) =>
        Ok(await clientes.ListarAsync(buscar));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDto>> Obtener(int id)
    {
        var cliente = await clientes.ObtenerAsync(id);
        return cliente is null ? NotFound() : Ok(cliente);
    }

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Crear(GuardarClienteRequest request)
    {
        var cliente = await clientes.CrearAsync(request);
        return CreatedAtAction(nameof(Obtener), new { id = cliente.Id }, cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, GuardarClienteRequest request) =>
        await clientes.ActualizarAsync(id, request) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var resultado = await clientes.EliminarAsync(id);
        return resultado switch
        {
            ResultadoEliminacion.Eliminado => NoContent(),
            ResultadoEliminacion.NoEncontrado => NotFound(),
            _ => Conflict(new { mensaje = "No se puede eliminar el cliente porque tiene vehículos asociados." })
        };
    }
}
