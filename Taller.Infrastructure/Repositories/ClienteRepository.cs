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
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.ClientesListar);
        command.Parameters.Add("@Buscar", SqlDbType.NVarChar, 254).Value = (object?)buscar ?? DBNull.Value;

        await using var reader = await command.ExecuteReaderAsync();
        var clientes = new List<Cliente>();
        while (await reader.ReadAsync()) clientes.Add(Mapear(reader));
        return clientes;
    }

    public async Task<Cliente?> ObtenerAsync(int id)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.ClientesObtenerPorId);
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = id;

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? Mapear(reader) : null;
    }

    public async Task<Cliente> CrearAsync(Cliente cliente)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.ClientesCrear);
        AgregarCampos(command, cliente);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            throw new InvalidOperationException("El procedimiento de creación no devolvió el cliente.");
        return Mapear(reader);
    }

    public async Task<bool> ActualizarAsync(Cliente cliente)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.ClientesActualizar);
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = cliente.Id;
        AgregarCampos(command, cliente);
        return Convert.ToBoolean(await command.ExecuteScalarAsync());
    }

    public async Task<bool> EliminarAsync(int id)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.ClientesEliminar);
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = id;
        return Convert.ToBoolean(await command.ExecuteScalarAsync());
    }

    private static void AgregarCampos(SqlCommand command, Cliente cliente)
    {
        command.Parameters.Add("@NombreCompleto", SqlDbType.NVarChar, 120).Value = cliente.NombreCompleto;
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
