using System.Data;
using Microsoft.Data.SqlClient;
using Taller.Application.Interfaces;
using Taller.Domain;
using Taller.Infrastructure.Database;

namespace Taller.Infrastructure.Repositories;

public sealed class ClienteRepository(SqlConnectionFactory connections) : IClienteRepository
{
    public async Task<IReadOnlyList<Cliente>> ListarAsync(string? buscar)
    {
        const string sql = """
            SELECT ClienteId, NombreCompleto, Telefono, Email, Direccion, FechaRegistro
            FROM dbo.Clientes
            WHERE @Buscar IS NULL
               OR NombreCompleto LIKE N'%' + @Buscar + N'%'
               OR Telefono LIKE N'%' + @Buscar + N'%'
               OR Email LIKE N'%' + @Buscar + N'%'
            ORDER BY NombreCompleto;
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Buscar", SqlDbType.NVarChar, 254).Value = (object?)buscar ?? DBNull.Value;
        await using var reader = await command.ExecuteReaderAsync();
        var clientes = new List<Cliente>();
        while (await reader.ReadAsync()) clientes.Add(Mapear(reader));
        return clientes;
    }

    public async Task<Cliente?> ObtenerAsync(int id)
    {
        const string sql = """
            SELECT ClienteId, NombreCompleto, Telefono, Email, Direccion, FechaRegistro
            FROM dbo.Clientes WHERE ClienteId = @Id;
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? Mapear(reader) : null;
    }

    public async Task<Cliente> CrearAsync(Cliente cliente)
    {
        const string sql = """
            INSERT INTO dbo.Clientes (NombreCompleto, Telefono, Email, Direccion)
            OUTPUT INSERTED.ClienteId
            VALUES (@Nombre, @Telefono, @Email, @Direccion);
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        AgregarCampos(command, cliente);
        var id = Convert.ToInt32(await command.ExecuteScalarAsync());
        return (await ObtenerAsync(id))!;
    }

    public async Task<bool> ActualizarAsync(Cliente cliente)
    {
        const string sql = """
            UPDATE dbo.Clientes
            SET NombreCompleto = @Nombre, Telefono = @Telefono, Email = @Email,
                Direccion = @Direccion, ActualizadoEn = SYSUTCDATETIME()
            WHERE ClienteId = @Id;
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = cliente.Id;
        AgregarCampos(command, cliente);
        return await command.ExecuteNonQueryAsync() == 1;
    }

    private static void AgregarCampos(SqlCommand command, Cliente cliente)
    {
        command.Parameters.Add("@Nombre", SqlDbType.NVarChar, 120).Value = cliente.NombreCompleto;
        command.Parameters.Add("@Telefono", SqlDbType.NVarChar, 30).Value = (object?)cliente.Telefono ?? DBNull.Value;
        command.Parameters.Add("@Email", SqlDbType.NVarChar, 254).Value = (object?)cliente.Email ?? DBNull.Value;
        command.Parameters.Add("@Direccion", SqlDbType.NVarChar, 250).Value = (object?)cliente.Direccion ?? DBNull.Value;
    }

    private static Cliente Mapear(SqlDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("ClienteId")),
        NombreCompleto = reader.GetString(reader.GetOrdinal("NombreCompleto")),
        Telefono = NullableString(reader, "Telefono"),
        Email = NullableString(reader, "Email"),
        Direccion = NullableString(reader, "Direccion"),
        FechaRegistro = reader.GetDateTime(reader.GetOrdinal("FechaRegistro"))
    };

    private static string? NullableString(SqlDataReader reader, string column)
    {
        var ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }
}
