using System.Data;
using Microsoft.Data.SqlClient;

namespace Taller.Infrastructure.Database;

internal static class ProcedimientosSql
{
    public const string ClientesListar = "dbo.Clientes_Listar";
    public const string ClientesObtenerPorId = "dbo.Clientes_ObtenerPorId";
    public const string ClientesCrear = "dbo.Clientes_Crear";
    public const string ClientesActualizar = "dbo.Clientes_Actualizar";
    public const string ClientesEliminar = "dbo.Clientes_Eliminar";

    public const string VehiculosListar = "dbo.Vehiculos_Listar";
    public const string VehiculosObtenerPorId = "dbo.Vehiculos_ObtenerPorId";
    public const string VehiculosCrear = "dbo.Vehiculos_Crear";
    public const string VehiculosActualizar = "dbo.Vehiculos_Actualizar";
    public const string VehiculosAsociarCliente = "dbo.Vehiculos_AsociarCliente";
    public const string VehiculosEliminar = "dbo.Vehiculos_Eliminar";

    public const string MantenimientosListar = "dbo.Mantenimientos_Listar";
    public const string MantenimientosObtenerPorId = "dbo.Mantenimientos_ObtenerPorId";
    public const string MantenimientosCrear = "dbo.Mantenimientos_Crear";
    public const string MantenimientosActualizar = "dbo.Mantenimientos_Actualizar";
    public const string MantenimientosEliminar = "dbo.Mantenimientos_Eliminar";

    public const string UsuariosObtenerPorNombre = "dbo.Usuarios_ObtenerPorNombre";
    public const string UsuariosExiste = "dbo.Usuarios_Existe";
    public const string UsuariosCrearPrimerAdministrador = "dbo.Usuarios_CrearPrimerAdministrador";
    public const string UsuariosCrear = "dbo.Usuarios_Crear";

    public static SqlCommand CrearComando(SqlConnection conexion, string procedimiento) =>
        new(procedimiento, conexion) { CommandType = CommandType.StoredProcedure };
}
