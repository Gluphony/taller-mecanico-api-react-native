namespace Taller.Domain;

public sealed class Usuario
{
    public int Id { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Rol { get; set; } = "Administrador";
    public bool Activo { get; set; } = true;
}
