using Microsoft.OpenApi.Any;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Foro2_Last.Swagger;

public sealed class AuthRequestExampleFilter : IOperationFilter
{
    public void Apply(Microsoft.OpenApi.Models.OpenApiOperation operation, OperationFilterContext context)
    {
        var route = context.ApiDescription.RelativePath?.Split('?')[0].TrimEnd('/');
        if (route is not ("api/auth/bootstrap" or "api/auth/login")) return;
        if (operation.RequestBody is not { } requestBody ||
            !requestBody.Content.TryGetValue("application/json", out var body) ||
            body is null) return;

        body.Example = new OpenApiObject
        {
            ["nombreUsuario"] = new OpenApiString(string.Empty),
            ["contrasena"] = new OpenApiString(string.Empty)
        };
    }
}
