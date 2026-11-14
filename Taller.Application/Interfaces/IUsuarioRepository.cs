using Taller.Domain;

namespace Taller.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> ObtenerPorNombreAsync(string nombreUsuario);
    Task<bool> CrearPrimerAdministradorAsync(Usuario usuario);
}

