/*
   Instala el CRUD de la API en TallerMecanicoDb.
   Ejecutar después de create_database.sql. CREATE OR ALTER permite repetirlo.
*/
USE [TallerMecanicoDb];
GO

/* Clientes */
CREATE OR ALTER PROCEDURE dbo.Clientes_Listar
    @Buscar NVARCHAR(254) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @Buscar = NULLIF(LTRIM(RTRIM(@Buscar)), N'');

    SELECT ClienteId, NombreCompleto, Telefono, Email, Direccion, FechaRegistro
    FROM dbo.Clientes
    WHERE @Buscar IS NULL
       OR NombreCompleto LIKE N'%' + @Buscar + N'%'
       OR Telefono LIKE N'%' + @Buscar + N'%'
       OR Email LIKE N'%' + @Buscar + N'%'
    ORDER BY NombreCompleto, ClienteId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Clientes_ObtenerPorId
    @ClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ClienteId, NombreCompleto, Telefono, Email, Direccion, FechaRegistro
    FROM dbo.Clientes
    WHERE ClienteId = @ClienteId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Clientes_Crear
    @NombreCompleto NVARCHAR(120),
    @Telefono NVARCHAR(30) = NULL,
    @Email NVARCHAR(254) = NULL,
    @Direccion NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Nuevo TABLE (ClienteId INT NOT NULL);

    INSERT INTO dbo.Clientes (NombreCompleto, Telefono, Email, Direccion)
        OUTPUT INSERTED.ClienteId INTO @Nuevo (ClienteId)
    VALUES (@NombreCompleto, @Telefono, @Email, @Direccion);

    SELECT c.ClienteId, c.NombreCompleto, c.Telefono, c.Email, c.Direccion, c.FechaRegistro
    FROM dbo.Clientes AS c
    INNER JOIN @Nuevo AS n ON n.ClienteId = c.ClienteId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Clientes_Actualizar
    @ClienteId INT,
    @NombreCompleto NVARCHAR(120),
    @Telefono NVARCHAR(30) = NULL,
    @Email NVARCHAR(254) = NULL,
    @Direccion NVARCHAR(250) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Clientes
    SET NombreCompleto = @NombreCompleto,
        Telefono = @Telefono,
        Email = @Email,
        Direccion = @Direccion,
        ActualizadoEn = SYSUTCDATETIME()
    WHERE ClienteId = @ClienteId;

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Actualizado;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Clientes_Eliminar
    @ClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Clientes
    WHERE ClienteId = @ClienteId
      AND NOT EXISTS
      (
          SELECT 1
          FROM dbo.Vehiculos
          WHERE ClienteId = @ClienteId
      );

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Eliminado;
END;
GO

/* Vehículos */
CREATE OR ALTER PROCEDURE dbo.Vehiculos_Listar
    @ClienteId INT = NULL,
    @Buscar NVARCHAR(120) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @Buscar = NULLIF(LTRIM(RTRIM(@Buscar)), N'');

    SELECT v.VehiculoId, v.ClienteId, c.NombreCompleto AS ClienteNombre,
           v.Placa, v.Vin, v.Marca, v.Modelo, v.Anio, v.Color, v.FechaRegistro
    FROM dbo.Vehiculos AS v
    INNER JOIN dbo.Clientes AS c ON c.ClienteId = v.ClienteId
    WHERE (@ClienteId IS NULL OR v.ClienteId = @ClienteId)
      AND
      (
          @Buscar IS NULL
          OR v.Placa LIKE N'%' + @Buscar + N'%'
          OR v.Marca LIKE N'%' + @Buscar + N'%'
          OR v.Modelo LIKE N'%' + @Buscar + N'%'
          OR c.NombreCompleto LIKE N'%' + @Buscar + N'%'
      )
    ORDER BY v.Placa, v.VehiculoId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Vehiculos_ObtenerPorId
    @VehiculoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT v.VehiculoId, v.ClienteId, c.NombreCompleto AS ClienteNombre,
           v.Placa, v.Vin, v.Marca, v.Modelo, v.Anio, v.Color, v.FechaRegistro
    FROM dbo.Vehiculos AS v
    INNER JOIN dbo.Clientes AS c ON c.ClienteId = v.ClienteId
    WHERE v.VehiculoId = @VehiculoId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Vehiculos_Crear
    @ClienteId INT,
    @Placa NVARCHAR(12),
    @Vin NVARCHAR(17) = NULL,
    @Marca NVARCHAR(60),
    @Modelo NVARCHAR(60),
    @Anio SMALLINT = NULL,
    @Color NVARCHAR(40) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Nuevo TABLE (VehiculoId INT NOT NULL);

    INSERT INTO dbo.Vehiculos (ClienteId, Placa, Vin, Marca, Modelo, Anio, Color)
        OUTPUT INSERTED.VehiculoId INTO @Nuevo (VehiculoId)
    VALUES (@ClienteId, @Placa, @Vin, @Marca, @Modelo, @Anio, @Color);

    SELECT v.VehiculoId, v.ClienteId, c.NombreCompleto AS ClienteNombre,
           v.Placa, v.Vin, v.Marca, v.Modelo, v.Anio, v.Color, v.FechaRegistro
    FROM dbo.Vehiculos AS v
    INNER JOIN dbo.Clientes AS c ON c.ClienteId = v.ClienteId
    INNER JOIN @Nuevo AS n ON n.VehiculoId = v.VehiculoId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Vehiculos_Actualizar
    @VehiculoId INT,
    @ClienteId INT,
    @Placa NVARCHAR(12),
    @Vin NVARCHAR(17) = NULL,
    @Marca NVARCHAR(60),
    @Modelo NVARCHAR(60),
    @Anio SMALLINT = NULL,
    @Color NVARCHAR(40) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Vehiculos
    SET ClienteId = @ClienteId,
        Placa = @Placa,
        Vin = @Vin,
        Marca = @Marca,
        Modelo = @Modelo,
        Anio = @Anio,
        Color = @Color,
        ActualizadoEn = SYSUTCDATETIME()
    WHERE VehiculoId = @VehiculoId;

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Actualizado;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Vehiculos_AsociarCliente
    @VehiculoId INT,
    @ClienteId INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Vehiculos
    SET ClienteId = @ClienteId,
        ActualizadoEn = SYSUTCDATETIME()
    WHERE VehiculoId = @VehiculoId;

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Asociado;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Vehiculos_Eliminar
    @VehiculoId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Vehiculos
    WHERE VehiculoId = @VehiculoId
      AND NOT EXISTS
      (
          SELECT 1
          FROM dbo.ServiciosMantenimiento
          WHERE VehiculoId = @VehiculoId
      );

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Eliminado;
END;
GO

/* Servicios de mantenimiento e historial */
CREATE OR ALTER PROCEDURE dbo.Mantenimientos_Listar
    @VehiculoId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT s.ServicioId, s.VehiculoId, v.Placa, v.Marca, v.Modelo,
           s.FechaServicio, s.TipoServicio, s.Descripcion, s.Kilometraje,
           s.Costo, s.Tecnico, s.Recomendaciones, s.ProximoMantenimiento,
           s.ActualizadoEn
    FROM dbo.ServiciosMantenimiento AS s
    INNER JOIN dbo.Vehiculos AS v ON v.VehiculoId = s.VehiculoId
    WHERE @VehiculoId IS NULL OR s.VehiculoId = @VehiculoId
    ORDER BY s.FechaServicio DESC, s.ServicioId DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Mantenimientos_ObtenerPorId
    @ServicioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT s.ServicioId, s.VehiculoId, v.Placa, v.Marca, v.Modelo,
           s.FechaServicio, s.TipoServicio, s.Descripcion, s.Kilometraje,
           s.Costo, s.Tecnico, s.Recomendaciones, s.ProximoMantenimiento,
           s.ActualizadoEn
    FROM dbo.ServiciosMantenimiento AS s
    INNER JOIN dbo.Vehiculos AS v ON v.VehiculoId = s.VehiculoId
    WHERE s.ServicioId = @ServicioId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Mantenimientos_Crear
    @VehiculoId INT,
    @FechaServicio DATETIME2(0),
    @TipoServicio NVARCHAR(80),
    @Descripcion NVARCHAR(2000),
    @Kilometraje INT = NULL,
    @Costo DECIMAL(11,2),
    @Tecnico NVARCHAR(120) = NULL,
    @Recomendaciones NVARCHAR(2000) = NULL,
    @ProximoMantenimiento DATETIME2(0) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Nuevo TABLE (ServicioId INT NOT NULL);

    INSERT INTO dbo.ServiciosMantenimiento
        (VehiculoId, FechaServicio, TipoServicio, Descripcion, Kilometraje,
         Costo, Tecnico, Recomendaciones, ProximoMantenimiento)
        OUTPUT INSERTED.ServicioId INTO @Nuevo (ServicioId)
    VALUES
        (@VehiculoId, @FechaServicio, @TipoServicio, @Descripcion, @Kilometraje,
         @Costo, @Tecnico, @Recomendaciones, @ProximoMantenimiento);

    SELECT s.ServicioId, s.VehiculoId, v.Placa, v.Marca, v.Modelo,
           s.FechaServicio, s.TipoServicio, s.Descripcion, s.Kilometraje,
           s.Costo, s.Tecnico, s.Recomendaciones, s.ProximoMantenimiento,
           s.ActualizadoEn
    FROM dbo.ServiciosMantenimiento AS s
    INNER JOIN dbo.Vehiculos AS v ON v.VehiculoId = s.VehiculoId
    INNER JOIN @Nuevo AS n ON n.ServicioId = s.ServicioId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Mantenimientos_Actualizar
    @ServicioId INT,
    @FechaServicio DATETIME2(0),
    @TipoServicio NVARCHAR(80),
    @Descripcion NVARCHAR(2000),
    @Kilometraje INT = NULL,
    @Costo DECIMAL(11,2),
    @Tecnico NVARCHAR(120) = NULL,
    @Recomendaciones NVARCHAR(2000) = NULL,
    @ProximoMantenimiento DATETIME2(0) = NULL
AS
BEGIN
    SET NOCOUNT ON;

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
    WHERE ServicioId = @ServicioId;

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Actualizado;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Mantenimientos_Eliminar
    @ServicioId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.ServiciosMantenimiento
    WHERE ServicioId = @ServicioId;

    SELECT CONVERT(BIT, CASE WHEN @@ROWCOUNT = 1 THEN 1 ELSE 0 END) AS Eliminado;
END;
GO

/* Acceso del administrador */
CREATE OR ALTER PROCEDURE dbo.Usuarios_Existe
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CONVERT(BIT, CASE WHEN EXISTS (SELECT 1 FROM dbo.Usuarios) THEN 1 ELSE 0 END) AS Existe;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Usuarios_ObtenerPorNombre
    @NombreUsuario NVARCHAR(80)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT UsuarioId, NombreUsuario, PasswordHash, Rol, Activo
    FROM dbo.Usuarios
    WHERE NombreUsuario = @NombreUsuario;
END;
GO

CREATE OR ALTER PROCEDURE dbo.Usuarios_CrearPrimerAdministrador
    @NombreUsuario NVARCHAR(80),
    @PasswordHash NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (SELECT 1 FROM dbo.Usuarios WITH (UPDLOCK, HOLDLOCK))
        BEGIN
            COMMIT TRANSACTION;
            SELECT CONVERT(BIT, 0) AS Creado;
            RETURN;
        END;

        INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash)
        VALUES (@NombreUsuario, @PasswordHash);

        COMMIT TRANSACTION;
        SELECT CONVERT(BIT, 1) AS Creado;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
