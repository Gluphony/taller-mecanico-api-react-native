using System.Text.Json;
using Microsoft.Data.SqlClient;

namespace Foro2_Last;

public sealed class ApiExceptionMiddleware(
    RequestDelegate next,
    ILogger<ApiExceptionMiddleware> logger)
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
        catch (SqlException exception) when (exception.Number == 547)
        {
            await WriteError(context, StatusCodes.Status409Conflict,
                "La operación entra en conflicto con registros relacionados.");
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Error no controlado al procesar {Path}", context.Request.Path);
            await WriteError(context, StatusCodes.Status500InternalServerError,
                "Ocurrió un error interno. Consulte el registro del servidor.");
        }
    }

    private static async Task WriteError(HttpContext context, int status, string message)
    {
        if (context.Response.HasStarted) return;
        context.Response.Clear();
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(new
        {
            mensaje = message,
            traceId = context.TraceIdentifier
        }));
    }
}
