using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Taller.Application.DTOs;
using Taller.Application.Services;

namespace Foro2_Last.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(AuthService auth) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("bootstrap")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CrearPrimerAdministrador(BootstrapAdminRequest request)
    {
        if (!await auth.CrearPrimerAdministradorAsync(request))
            return Conflict(new { mensaje = "El administrador inicial ya fue creado." });
        return StatusCode(StatusCodes.Status201Created,
            new { mensaje = "Administrador inicial creado. Ya puede iniciar sesión." });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> IniciarSesion(LoginRequest request)
    {
        var resultado = await auth.IniciarSesionAsync(request);
        return resultado is null
            ? Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." })
            : Ok(resultado);
    }
}
