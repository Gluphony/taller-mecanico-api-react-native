using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Taller.Application.Services;

public sealed class AuthService(
    IUsuarioRepository usuarios,
    IPasswordService passwords,
    ITokenIssuer tokens)
{
    public async Task<LoginResponse?> IniciarSesionAsync(LoginRequest request)
    {
        var usuario = await usuarios.ObtenerPorNombreAsync(request.NombreUsuario.Trim());
        if (usuario is null || !usuario.Activo ||
            !passwords.Verificar(usuario.PasswordHash, request.Contrasena))
            return null;

        var (token, expiraEn) = tokens.CrearToken(usuario);
        return new LoginResponse
        {
            Token = token, ExpiraEn = expiraEn,
            NombreUsuario = usuario.NombreUsuario, Rol = usuario.Rol
        };
    }

    public async Task<bool> CrearPrimerAdministradorAsync(BootstrapAdminRequest request)
    {
        var nombreUsuario = request.NombreUsuario.Trim();
        if (nombreUsuario.Length < 3)
            throw new ArgumentException("El nombre de usuario debe tener al menos 3 caracteres no vacíos.");

        var usuario = new Usuario
        {
            NombreUsuario = nombreUsuario,
            PasswordHash = passwords.CrearHash(request.Contrasena),
            Rol = "Administrador",
            Activo = true
        };
        return await usuarios.CrearPrimerAdministradorAsync(usuario);
    }
}

