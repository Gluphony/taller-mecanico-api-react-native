using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;
using System.Text.RegularExpressions;

namespace Taller.Application.Services;

public sealed class AuthService(
    IUsuarioRepository usuarios,
    IPasswordService passwords,
    ITokenIssuer tokens)
{
    public async Task<bool> RequiereConfiguracionInicialAsync() =>
        !await usuarios.ExisteAlgunUsuarioAsync();

    public async Task<LoginResponse?> IniciarSesionAsync(LoginRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.NombreUsuario) ||
            string.IsNullOrWhiteSpace(request.Contrasena)) return null;
        var nombreUsuario = request.NombreUsuario.Trim();
        if (nombreUsuario.Length is < 3 or > 80 ||
            !Regex.IsMatch(nombreUsuario, @"^[A-Za-z0-9][A-Za-z0-9._-]*$"))
            return null;

        var usuario = await usuarios.ObtenerPorNombreAsync(nombreUsuario);
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
        if (request is null) throw new ArgumentNullException(nameof(request));
        if (string.IsNullOrWhiteSpace(request.NombreUsuario))
            throw new ArgumentException("El usuario es obligatorio.");
        var nombreUsuario = request.NombreUsuario.Trim();
        if (nombreUsuario.Length is < 3 or > 80 ||
            !Regex.IsMatch(nombreUsuario, @"^[A-Za-z0-9][A-Za-z0-9._-]*$"))
            throw new ArgumentException("El usuario debe tener entre 3 y 80 caracteres: letras sin acento, números, punto, guion o guion bajo.");
        if (request.Contrasena.Length is < 12 or > 200 || string.IsNullOrWhiteSpace(request.Contrasena))
            throw new ArgumentException("La contraseña inicial debe tener entre 12 y 200 caracteres.");

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

