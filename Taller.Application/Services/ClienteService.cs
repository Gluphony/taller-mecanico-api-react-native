using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Taller.Application.DTOs;
using Taller.Application.Interfaces;
using Taller.Domain;

namespace Taller.Application.Services;

public sealed class ClienteService(IClienteRepository repository)
{
    public async Task<IReadOnlyList<ClienteDto>> ListarAsync(string? buscar)
    {
        var filtro = Limpiar(buscar);
        if (filtro?.Length > 254)
            throw new ArgumentException("La búsqueda no puede superar 254 caracteres.");
        return (await repository.ListarAsync(filtro)).Select(Mapear).ToArray();
    }

    public async Task<ClienteDto?> ObtenerAsync(int id) =>
        MapearNullable(await repository.ObtenerAsync(id));

    public async Task<ClienteDto> CrearAsync(GuardarClienteRequest request) =>
        Mapear(await repository.CrearAsync(CrearEntidad(request)));

    public async Task<bool> ActualizarAsync(int id, GuardarClienteRequest request)
    {
        var cliente = CrearEntidad(request, id);
        if (await repository.ObtenerAsync(id) is null) return false;
        return await repository.ActualizarAsync(cliente);
    }

    public async Task<ResultadoEliminacion> EliminarAsync(int id)
    {
        if (await repository.EliminarAsync(id)) return ResultadoEliminacion.Eliminado;
        return await repository.ObtenerAsync(id) is null
            ? ResultadoEliminacion.NoEncontrado
            : ResultadoEliminacion.TieneRegistrosRelacionados;
    }

    private static ClienteDto Mapear(Cliente x) => new()
    {
        Id = x.Id, NombreCompleto = x.NombreCompleto, Telefono = x.Telefono,
        Email = x.Email, Direccion = x.Direccion, FechaRegistro = x.FechaRegistro
    };

    private static ClienteDto? MapearNullable(Cliente? x) =>
        x is null ? null : Mapear(x);

    private static string? Limpiar(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static Cliente CrearEntidad(GuardarClienteRequest request, int id = 0)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));
        var telefono = Limpiar(request.Telefono);
        var email = Limpiar(request.Email);
        var direccion = Limpiar(request.Direccion);

        if (telefono is not null &&
            (!Regex.IsMatch(telefono, @"^\+?[0-9][0-9 ().-]{5,28}[0-9]$") ||
             telefono.Count(char.IsDigit) is < 7 or > 15))
            throw new ArgumentException("El teléfono debe contener entre 7 y 15 dígitos y usar solo +, espacios, paréntesis, puntos o guiones.");
        if (email is not null && (!new EmailAddressAttribute().IsValid(email) || email.Length > 254))
            throw new ArgumentException("Escribe un correo electrónico válido de hasta 254 caracteres.");
        if (direccion?.Length > 250)
            throw new ArgumentException("La dirección no puede superar 250 caracteres.");

        return new Cliente
        {
            Id = id,
            NombreCompleto = ValidarNombre(request.NombreCompleto),
            Telefono = telefono,
            Email = email?.ToLowerInvariant(),
            Direccion = direccion
        };
    }

    private static string ValidarNombre(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("El nombre del cliente es obligatorio.");
        var nombre = value.Trim();
        if (nombre.Length is < 2 or > 120)
            throw new ArgumentException("El nombre del cliente debe tener entre 2 y 120 caracteres no vacíos.");
        return nombre;
    }
}
