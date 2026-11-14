using Taller.Domain;

namespace Taller.Application.Interfaces;

public interface IPasswordService
{
    string CrearHash(string contrasena);
    bool Verificar(string hash, string contrasena);
}

public interface ITokenIssuer
{
    (string Token, DateTime ExpiraEn) CrearToken(Usuario usuario);
}
