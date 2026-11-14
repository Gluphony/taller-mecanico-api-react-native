using System.Data;
using Microsoft.Data.SqlClient;
using Taller.Application.Interfaces;
using Taller.Domain;
using Taller.Infrastructure.Database;

namespace Taller.Infrastructure.Repositories;

public sealed class VehiculoRepository(SqlConnectionFactory connections) : IVehiculoRepository
{
    private const string SelectFields = """
        SELECT v.VehiculoId, v.ClienteId, c.NombreCompleto AS ClienteNombre,
               v.Placa, v.Vin, v.Marca, v.Modelo, v.Anio, v.Color, v.FechaRegistro
        FROM dbo.Vehiculos v
        INNER JOIN dbo.Clientes c ON c.ClienteId = v.ClienteId
        """;

    public async Task<IReadOnlyList<Vehiculo>> ListarAsync(int? clienteId, string? buscar)
    {
        var sql = SelectFields + """
            WHERE (@ClienteId IS NULL OR v.ClienteId = @ClienteId)
              AND (@Buscar IS NULL OR v.Placa LIKE N'%' + @Buscar + N'%'
                   OR v.Marca LIKE N'%' + @Buscar + N'%'
                   OR v.Modelo LIKE N'%' + @Buscar + N'%'
                   OR c.NombreCompleto LIKE N'%' + @Buscar + N'%')
            ORDER BY v.Placa;
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = (object?)clienteId ?? DBNull.Value;
        command.Parameters.Add("@Buscar", SqlDbType.NVarChar, 120).Value = (object?)buscar ?? DBNull.Value;
        await using var reader = await command.ExecuteReaderAsync();
        var vehiculos = new List<Vehiculo>();
        while (await reader.ReadAsync()) vehiculos.Add(Mapear(reader));
        return vehiculos;
    }

    public async Task<Vehiculo?> ObtenerAsync(int id)
    {
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(SelectFields + " WHERE v.VehiculoId = @Id;", connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? Mapear(reader) : null;
    }

    public async Task<Vehiculo> CrearAsync(Vehiculo vehiculo)
    {
        const string sql = """
            INSERT INTO dbo.Vehiculos (ClienteId, Placa, Vin, Marca, Modelo, Anio, Color)
            OUTPUT INSERTED.VehiculoId
            VALUES (@ClienteId, @Placa, @Vin, @Marca, @Modelo, @Anio, @Color);
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        AgregarCampos(command, vehiculo);
        var id = Convert.ToInt32(await command.ExecuteScalarAsync());
        return (await ObtenerAsync(id))!;
    }

    public async Task<bool> ActualizarAsync(Vehiculo vehiculo)
    {
        const string sql = """
            UPDATE dbo.Vehiculos
            SET ClienteId = @ClienteId, Placa = @Placa, Vin = @Vin, Marca = @Marca,
                Modelo = @Modelo, Anio = @Anio, Color = @Color,
                ActualizadoEn = SYSUTCDATETIME()
            WHERE VehiculoId = @Id;
            """;
        await using var connection = connections.Create();
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = vehiculo.Id;
        AgregarCampos(command, vehiculo);
        return await command.ExecuteNonQueryAsync() == 1;
    }

    private static void AgregarCampos(SqlCommand command, Vehiculo vehiculo)
    {
        command.Parameters.Add("@ClienteId", SqlDbType.Int).Value = vehiculo.ClienteId;
        command.Parameters.Add("@Placa", SqlDbType.NVarChar, 12).Value = vehiculo.Placa;
        command.Parameters.Add("@Vin", SqlDbType.NVarChar, 17).Value = (object?)vehiculo.Vin ?? DBNull.Value;
        command.Parameters.Add("@Marca", SqlDbType.NVarChar, 60).Value = vehiculo.Marca;
        command.Parameters.Add("@Modelo", SqlDbType.NVarChar, 60).Value = vehiculo.Modelo;
        command.Parameters.Add("@Anio", SqlDbType.SmallInt).Value = (object?)vehiculo.Anio ?? DBNull.Value;
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
        Anio = reader.IsDBNull(reader.GetOrdinal("Anio")) ? null : reader.GetInt16(reader.GetOrdinal("Anio")),
        Color = NullableString(reader, "Color"),
        FechaRegistro = reader.GetDateTime(reader.GetOrdinal("FechaRegistro"))
    };

    private static string? NullableString(SqlDataReader reader, string column)
    {
        var ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }
}
