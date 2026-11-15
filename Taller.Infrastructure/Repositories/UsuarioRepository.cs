using System.Data;
using Microsoft.Data.SqlClient;
using Taller.Application.Interfaces;
using Taller.Domain;
using Taller.Infrastructure.Database;

namespace Taller.Infrastructure.Repositories;

public sealed class UsuarioRepository(SqlConnectionFactory connections) : IUsuarioRepository
{
    public async Task<Usuario?> ObtenerPorNombreAsync(string nombreUsuario)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.UsuariosObtenerPorNombre);
        command.Parameters.Add("@NombreUsuario", SqlDbType.NVarChar, 80).Value = nombreUsuario;

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return new Usuario
        {
            Id = reader.GetInt32(reader.GetOrdinal("UsuarioId")),
            NombreUsuario = reader.GetString(reader.GetOrdinal("NombreUsuario")),
            PasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash")),
            Rol = reader.GetString(reader.GetOrdinal("Rol")),
            Activo = reader.GetBoolean(reader.GetOrdinal("Activo"))
        };
    }

    public async Task<bool> CrearPrimerAdministradorAsync(Usuario usuario)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(
            connection,
            ProcedimientosSql.UsuariosCrearPrimerAdministrador);
        command.Parameters.Add("@NombreUsuario", SqlDbType.NVarChar, 80).Value = usuario.NombreUsuario;
        command.Parameters.Add("@PasswordHash", SqlDbType.NVarChar, 256).Value = usuario.PasswordHash;
        return Convert.ToBoolean(await command.ExecuteScalarAsync());
    }
}
