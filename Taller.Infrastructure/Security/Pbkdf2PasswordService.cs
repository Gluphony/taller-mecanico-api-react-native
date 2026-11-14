using System.Security.Cryptography;
using Taller.Application.Interfaces;

namespace Taller.Infrastructure.Security;

public sealed class Pbkdf2PasswordService : IPasswordService
{
    private const int Iteraciones = 600_000;
    private const int SaltBytes = 16;
    private const int HashBytes = 32;
    private const string Algoritmo = "pbkdf2-sha256";

    public string CrearHash(string contrasena)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltBytes);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            contrasena, salt, Iteraciones, HashAlgorithmName.SHA256, HashBytes);
        return Algoritmo + "$" + Iteraciones + "$" +
               Convert.ToBase64String(salt) + "$" + Convert.ToBase64String(hash);
    }

    public bool Verificar(string encoded, string contrasena)
    {
        var parts = encoded.Split('$');
        if (parts.Length != 4 || parts[0] != Algoritmo ||
            !int.TryParse(parts[1], out var iterations) ||
            iterations < 100_000 || iterations > 2_000_000)
            return false;

        try
        {
            var salt = Convert.FromBase64String(parts[2]);
            var expected = Convert.FromBase64String(parts[3]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(
                contrasena, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
