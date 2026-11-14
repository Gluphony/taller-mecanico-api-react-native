using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Foro2_Last.Security;

public sealed class JwtTokenIssuer(IConfiguration configuration) : ITokenIssuer
{
    public (string Token, DateTime ExpiraEn) CrearToken(Usuario usuario)
    {
        var issuer = configuration["Jwt:Issuer"] ?? "TallerMecanicoApi";
        var audience = configuration["Jwt:Audience"] ?? "TallerMecanicoMobile";
        var minutes = int.TryParse(configuration["Jwt:ExpiresMinutes"], out var configured)
            ? Math.Clamp(configured, 5, 1440)
            : 60;
        var expires = DateTime.UtcNow.AddMinutes(minutes);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.NombreUsuario),
            new Claim(ClaimTypes.Role, usuario.Rol)
        };
        var token = new JwtSecurityToken(
            issuer, audience, claims, DateTime.UtcNow, expires, credentials);
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
