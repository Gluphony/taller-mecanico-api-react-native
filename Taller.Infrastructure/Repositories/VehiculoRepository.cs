using System.Data;
using Microsoft.Data.SqlClient;
using Taller.Application.Interfaces;
using Taller.Domain;
using Taller.Infrastructure.Database;

namespace Taller.Infrastructure.Repositories;

public sealed class VehiculoRepository(SqlConnectionFactory connections) : IVehiculoRepository
{
    public async Task<IReadOnlyList<Vehiculo>> ListarAsync(int? clienteId, string? buscar)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.VehiculosListar);
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = (object?)clienteId ?? DBNull.Value;
        command.Parameters.Add("@Buscar", SqlDbType.NVarChar, 120).Value = (object?)buscar ?? DBNull.Value;

        await using var reader = await command.ExecuteReaderAsync();
        var vehiculos = new List<Vehiculo>();
        while (await reader.ReadAsync()) vehiculos.Add(Mapear(reader));
        return vehiculos;
    }

    public async Task<Vehiculo?> ObtenerAsync(int id)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.VehiculosObtenerPorId);
        command.Parameters.Add("@VehiculoId", SqlDbType.Int).Value = id;

        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? Mapear(reader) : null;
    }

    public async Task<Vehiculo> CrearAsync(Vehiculo vehiculo)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.VehiculosCrear);
        AgregarCampos(command, vehiculo);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            throw new InvalidOperationException("El procedimiento de creación no devolvió el vehículo.");
        return Mapear(reader);
    }

    public async Task<bool> ActualizarAsync(Vehiculo vehiculo)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.VehiculosActualizar);
        command.Parameters.Add("@VehiculoId", SqlDbType.Int).Value = vehiculo.Id;
        AgregarCampos(command, vehiculo);
        return Convert.ToBoolean(await command.ExecuteScalarAsync());
    }

    public async Task<bool> AsociarClienteAsync(int vehiculoId, int clienteId)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.VehiculosAsociarCliente);
        command.Parameters.Add("@VehiculoId", SqlDbType.Int).Value = vehiculoId;
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = clienteId;
        return Convert.ToBoolean(await command.ExecuteScalarAsync());
    }

    public async Task<bool> EliminarAsync(int id)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = ProcedimientosSql.CrearComando(connection, ProcedimientosSql.VehiculosEliminar);
        command.Parameters.Add("@VehiculoId", SqlDbType.Int).Value = id;
        return Convert.ToBoolean(await command.ExecuteScalarAsync());
    }

    private static void AgregarCampos(SqlCommand command, Vehiculo vehiculo)
    {
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = vehiculo.ClienteId;
        command.Parameters.Add("@Placa", SqlDbType.NVarChar, 12).Value = vehiculo.Placa;
        command.Parameters.Add("@Vin", SqlDbType.NVarChar, 17).Value = (object?)vehiculo.Vin ?? DBNull.Value;
        command.Parameters.Add("@Marca", SqlDbType.NVarChar, 60).Value = vehiculo.Marca;
        command.Parameters.Add("@Modelo", SqlDbType.NVarChar, 60).Value = vehiculo.Modelo;
        command.Parameters.Add("@Anio", SqlDbType.SmallInt).Value =
            vehiculo.Anio is int anio ? (object)(short)anio : DBNull.Value;
        command.Parameters.Add("@Color", SqlDbType.NVarChar, 40).Value = (object?)vehiculo.Color ?? DBNull.Value;
    }

    private static Vehiculo Mapear(SqlDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("VehiculoId")),
        ClienteId = reader.GetInt32(reader.GetOrdinal("ClienteId")),
        ClienteNombre = reader.GetString(reader.GetOrdinal("ClienteNombre")),
        Placa = reader.GetString(reader.GetOrdinal("Placa")),
        Vin = NullableString(reader, "Vin"),
        Marca = reader.GetString(reader.GetOrdinal("Marca")),
        Modelo = reader.GetString(reader.GetOrdinal("Modelo")),
        Anio = reader.IsDBNull(reader.GetOrdinal("Anio")) ? null : (int?)reader.GetInt16(reader.GetOrdinal("Anio")),
        Color = NullableString(reader, "Color"),
        FechaRegistro = reader.GetDateTime(reader.GetOrdinal("FechaRegistro"))
    };

    private static string? NullableString(SqlDataReader reader, string column)
    {
        var ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }
}
