using System.ComponentModel.DataAnnotations;

namespace Taller.Application.DTOs;

public sealed class LoginRequest
{
    [Required, StringLength(80)]
    public string NombreUsuario { get; init; } = string.Empty;

    [Required, StringLength(200, MinimumLength = 8)]
    public string Contrasena { get; init; } = string.Empty;
}

public sealed class BootstrapAdminRequest
{
    [Required, StringLength(80, MinimumLength = 3)]
    public string NombreUsuario { get; init; } = string.Empty;

    [Required, StringLength(200, MinimumLength = 12)]
    public string Contrasena { get; init; } = string.Empty;
}

public sealed class LoginResponse
{
    public string Token { get; init; } = string.Empty;
    public string Tipo { get; init; } = "Bearer";
    public DateTime ExpiraEn { get; init; }
    public string NombreUsuario { get; init; } = string.Empty;
    public string Rol { get; init; } = string.Empty;
}
