using System.Data;
using Microsoft.Data.SqlClient;
using Taller.Application.Interfaces;
using Taller.Domain;
using Taller.Infrastructure.Database;

namespace Taller.Infrastructure.Repositories;

public sealed class MantenimientoRepository(SqlConnectionFactory connections) : IMantenimientoRepository
{
    private const string SelectFields = """
        SELECT s.ServicioId, s.VehiculoId, v.Placa, v.Marca, v.Modelo,
               s.FechaServicio, s.TipoServicio, s.Descripcion, s.Kilometraje,
               s.Costo, s.Tecnico, s.Recomendaciones, s.ProximoMantenimiento,
               s.ActualizadoEn
        FROM dbo.ServiciosMantenimiento s
        INNER JOIN dbo.Vehiculos v ON v.VehiculoId = s.VehiculoId
        """;

    public async Task<IReadOnlyList<ServicioMantenimiento>> ListarAsync(int? vehiculoId)
    {
        var sql = SelectFields + "\n" + """
            WHERE (@VehiculoId IS NULL OR s.VehiculoId = @VehiculoId)
            ORDER BY s.FechaServicio DESC, s.ServicioId DESC;
            """;
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@VehiculoId", SqlDbType.Int).Value = (object?)vehiculoId ?? DBNull.Value;
        await using var reader = await command.ExecuteReaderAsync();
        var servicios = new List<ServicioMantenimiento>();
        while (await reader.ReadAsync()) servicios.Add(Mapear(reader));
        return servicios;
    }

    public async Task<ServicioMantenimiento?> ObtenerAsync(int id)
    {
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(SelectFields + " WHERE s.ServicioId = @Id;", connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        await using var reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? Mapear(reader) : null;
    }

    public async Task<ServicioMantenimiento> CrearAsync(ServicioMantenimiento servicio)
    {
        const string sql = """
            INSERT INTO dbo.ServiciosMantenimiento
                (VehiculoId, FechaServicio, TipoServicio, Descripcion, Kilometraje,
                 Costo, Tecnico, Recomendaciones, ProximoMantenimiento)
            OUTPUT INSERTED.ServicioId
            VALUES
                (@VehiculoId, @FechaServicio, @TipoServicio, @Descripcion, @Kilometraje,
                 @Costo, @Tecnico, @Recomendaciones, @ProximoMantenimiento);
            """;
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        AgregarParametros(command, servicio);
        var id = Convert.ToInt32(await command.ExecuteScalarAsync());
        return (await ObtenerAsync(id))!;
    }

    public async Task<bool> ActualizarAsync(ServicioMantenimiento servicio)
    {
        const string sql = """
            UPDATE dbo.ServiciosMantenimiento
            SET FechaServicio = @FechaServicio,
                TipoServicio = @TipoServicio,
                Descripcion = @Descripcion,
                Kilometraje = @Kilometraje,
                Costo = @Costo,
                Tecnico = @Tecnico,
                Recomendaciones = @Recomendaciones,
                ProximoMantenimiento = @ProximoMantenimiento,
                ActualizadoEn = SYSUTCDATETIME()
            WHERE ServicioId = @Id;
            """;
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = servicio.Id;
        AgregarParametros(command, servicio);
        return await command.ExecuteNonQueryAsync() == 1;
    }

    public async Task<bool> EliminarAsync(int id)
    {
        const string sql = "DELETE FROM dbo.ServiciosMantenimiento WHERE ServicioId = @Id;";
        await using var connection = await connections.OpenAsync();
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Id", SqlDbType.Int).Value = id;
        return await command.ExecuteNonQueryAsync() == 1;
    }

    private static void AgregarParametros(SqlCommand command, ServicioMantenimiento servicio)
    {
        command.Parameters.Add("@VehiculoId", SqlDbType.Int).Value = servicio.VehiculoId;
        command.Parameters.Add("@FechaServicio", SqlDbType.DateTime2).Value = servicio.FechaServicio;
        command.Parameters.Add("@TipoServicio", SqlDbType.NVarChar, 80).Value = servicio.TipoServicio;
        command.Parameters.Add("@Descripcion", SqlDbType.NVarChar, 2000).Value = servicio.Descripcion;
        command.Parameters.Add("@Kilometraje", SqlDbType.Int).Value = (object?)servicio.Kilometraje ?? DBNull.Value;
        var costo = command.Parameters.Add("@Costo", SqlDbType.Decimal);
        costo.Precision = 11;
        costo.Scale = 2;
        costo.Value = servicio.Costo;
        command.Parameters.Add("@Tecnico", SqlDbType.NVarChar, 120).Value = (object?)servicio.Tecnico ?? DBNull.Value;
        command.Parameters.Add("@Recomendaciones", SqlDbType.NVarChar, 2000).Value = (object?)servicio.Recomendaciones ?? DBNull.Value;
        command.Parameters.Add("@ProximoMantenimiento", SqlDbType.DateTime2).Value = (object?)servicio.ProximoMantenimiento ?? DBNull.Value;
    }

    private static ServicioMantenimiento Mapear(SqlDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("ServicioId")),
        VehiculoId = reader.GetInt32(reader.GetOrdinal("VehiculoId")),
        Placa = reader.GetString(reader.GetOrdinal("Placa")),
        Marca = reader.GetString(reader.GetOrdinal("Marca")),
        Modelo = reader.GetString(reader.GetOrdinal("Modelo")),
        FechaServicio = reader.GetDateTime(reader.GetOrdinal("FechaServicio")),
        TipoServicio = reader.GetString(reader.GetOrdinal("TipoServicio")),
        Descripcion = reader.GetString(reader.GetOrdinal("Descripcion")),
        Kilometraje = reader.IsDBNull(reader.GetOrdinal("Kilometraje")) ? null : reader.GetInt32(reader.GetOrdinal("Kilometraje")),
        Costo = reader.GetDecimal(reader.GetOrdinal("Costo")),
        Tecnico = NullableString(reader, "Tecnico"),
        Recomendaciones = NullableString(reader, "Recomendaciones"),
        ProximoMantenimiento = reader.IsDBNull(reader.GetOrdinal("ProximoMantenimiento")) ? null : reader.GetDateTime(reader.GetOrdinal("ProximoMantenimiento")),
        ActualizadoEn = reader.IsDBNull(reader.GetOrdinal("ActualizadoEn")) ? null : reader.GetDateTime(reader.GetOrdinal("ActualizadoEn"))
    };

    private static string? NullableString(SqlDataReader reader, string column)
    {
        var ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }
}
