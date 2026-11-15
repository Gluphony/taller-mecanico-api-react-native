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
    [HttpGet("status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> EstadoInicial() =>
        Ok(new { requiereConfiguracionInicial = await auth.RequiereConfiguracionInicialAsync() });

    [AllowAnonymous]
    [HttpPost("bootstrap")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CrearPrimerAdministrador(BootstrapAdminRequest request)
    {
        if (!await auth.CrearPrimerAdministradorAsync(request))
            return Conflict(new
            {
                codigo = "acceso_ya_configurado",
                mensaje = "Esta base de datos ya tiene una cuenta. Inicia sesión con el usuario que la configuró."
            });
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

    [Authorize(Roles = "Administrador")]
    [HttpPost("usuarios")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CrearUsuario(CrearUsuarioRequest request)
    {
        if (!await auth.CrearUsuarioAsync(request))
            return Conflict(new
            {
                codigo = "usuario_ya_registrado",
                mensaje = "Ya existe una cuenta con ese nombre de usuario."
            });

        return StatusCode(StatusCodes.Status201Created, new
        {
            mensaje = "Cuenta creada. El usuario ya puede iniciar sesión.",
            nombreUsuario = request.NombreUsuario.Trim(),
            rol = "Empleado"
        });
    }
}
