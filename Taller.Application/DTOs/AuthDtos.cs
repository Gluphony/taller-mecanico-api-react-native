using System.ComponentModel.DataAnnotations;

namespace Taller.Application.DTOs;

public sealed class LoginRequest
{
    [Required(ErrorMessage = "Escribe tu usuario.")]
    [StringLength(80, MinimumLength = 3, ErrorMessage = "El usuario debe tener entre 3 y 80 caracteres.")]
    [RegularExpression(@"^[A-Za-z0-9][A-Za-z0-9._-]*$", ErrorMessage = "El usuario solo admite letras sin acento, números, punto, guion y guion bajo.")]
    public string NombreUsuario { get; init; } = string.Empty;

    [Required(ErrorMessage = "Escribe tu contraseña.")]
    [StringLength(200, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 200 caracteres.")]
    public string Contrasena { get; init; } = string.Empty;
}

public sealed class BootstrapAdminRequest
{
    [Required(ErrorMessage = "El usuario es obligatorio.")]
    [StringLength(80, MinimumLength = 3, ErrorMessage = "El usuario debe tener entre 3 y 80 caracteres.")]
    [RegularExpression(@"^[A-Za-z0-9][A-Za-z0-9._-]*$", ErrorMessage = "El usuario solo admite letras sin acento, números, punto, guion y guion bajo.")]
    public string NombreUsuario { get; init; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(200, MinimumLength = 12, ErrorMessage = "La contraseña inicial debe tener entre 12 y 200 caracteres.")]
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
