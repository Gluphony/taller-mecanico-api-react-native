using System.Text.Json;
using Microsoft.Data.SqlClient;

namespace Foro2_Last;

public sealed class ApiExceptionMiddleware(
    RequestDelegate next,
    ILogger<ApiExceptionMiddleware> logger,
    IWebHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ArgumentException exception)
        {
            await WriteError(context, StatusCodes.Status400BadRequest, exception.Message);
        }
        catch (SqlException exception) when (exception.Number is 2601 or 2627)
        {
            await WriteError(context, StatusCodes.Status409Conflict,
                "Ya existe un registro con uno de los valores únicos enviados.");
        }
        catch (SqlException exception) when (exception.Number is 2 or 53 or 4060 or 18456 or 10060)
        {
            logger.LogError(exception, "No se pudo conectar con SQL Server al procesar {Path}", context.Request.Path);
            await WriteError(context, StatusCodes.Status503ServiceUnavailable,
                "No se pudo conectar con la base de datos.", DevelopmentDetail(exception));
        }
        catch (SqlException exception) when (exception.Number == 547)
        {
            await WriteError(context, StatusCodes.Status409Conflict,
                "La operación entra en conflicto con registros relacionados.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Error no controlado al procesar {Path}", context.Request.Path);
            await WriteError(context, StatusCodes.Status500InternalServerError,
                "Ocurrió un error interno. Consulte el registro del servidor.", DevelopmentDetail(exception));
        }
    }

    private string? DevelopmentDetail(Exception exception) =>
        environment.IsDevelopment() ? exception.Message : null;

    private static async Task WriteError(
        HttpContext context,
        int status,
        string message,
        string? detail = null)
    {
        if (context.Response.HasStarted) return;
        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        var payload = new Dictionary<string, string>
        {
            ["mensaje"] = message,
            ["traceId"] = context.TraceIdentifier
        };
        if (detail is not null) payload["detalle"] = detail;
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
}
