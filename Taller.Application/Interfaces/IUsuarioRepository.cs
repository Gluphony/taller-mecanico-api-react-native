using Taller.Domain;

namespace Taller.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<bool> ExisteAlgunUsuarioAsync();
    Task<Usuario?> ObtenerPorNombreAsync(string nombreUsuario);
    Task<bool> CrearPrimerAdministradorAsync(Usuario usuario);
    Task<bool> CrearUsuarioAsync(Usuario usuario);
}

