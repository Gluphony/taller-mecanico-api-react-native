using System.Data;
using Microsoft.Data.SqlClient;
using Taller.Application.Interfaces;
using Taller.Domain;
using Taller.Infrastructure.Database;

namespace Taller.Infrastructure.Repositories;

public sealed class UsuarioRepository(SqlConnectionFactory connections) : IUsuarioRepository
{
    public async Task<bool> HayUsuariosAsync()
    {
        const string sql = "SELECT CASE WHEN EXISTS (SELECT 1 FROM dbo.Usuarios) THEN 1 ELSE 0 END;";
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        return Convert.ToInt32(await command.ExecuteScalarAsync()) == 1;
    }
    public async Task<Usuario?> ObtenerPorNombreAsync(string nombreUsuario)
    {
        const string sql = """
            SELECT UsuarioId, NombreUsuario, PasswordHash, Rol, Activo
            FROM dbo.Usuarios
            WHERE NombreUsuario = @NombreUsuario;
            """;
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
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
        using var transaction = connection.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            await using (var check = new SqlCommand(
                "SELECT COUNT_BIG(*) FROM dbo.Usuarios WITH (UPDLOCK, HOLDLOCK);",
                connection, transaction))
            {
                if (Convert.ToInt64(await check.ExecuteScalarAsync()) > 0)
                {
                    transaction.Rollback();
                    return false;
                }
            }

            const string insert = """
                INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash, Rol, Activo)
                VALUES (@NombreUsuario, @PasswordHash, N'Administrador', 1);
                """;
            await using (var command = new SqlCommand(insert, connection, transaction))
            {
                command.Parameters.Add("@NombreUsuario", SqlDbType.NVarChar, 80).Value = usuario.NombreUsuario;
                command.Parameters.Add("@PasswordHash", SqlDbType.NVarChar, 256).Value = usuario.PasswordHash;
                await command.ExecuteNonQueryAsync();
            }

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

