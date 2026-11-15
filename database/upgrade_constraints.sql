/* Reglas adicionales para bases creadas antes de la validación de formularios. */
USE [TallerMecanicoDb];
GO

IF EXISTS
(
    SELECT 1
    FROM dbo.Vehiculos
    WHERE LEN(LTRIM(RTRIM(Marca))) NOT BETWEEN 1 AND 60
       OR LEN(LTRIM(RTRIM(Modelo))) NOT BETWEEN 1 AND 60
       OR Placa LIKE N'%[^A-Z0-9 -]%'
       OR LEFT(LTRIM(RTRIM(Placa)), 1) NOT LIKE N'[A-Z0-9]'
       OR RIGHT(LTRIM(RTRIM(Placa)), 1) NOT LIKE N'[A-Z0-9]'
       OR (Vin IS NOT NULL AND
           (UPPER(Vin) LIKE N'%[^A-Z0-9]%' OR UPPER(Vin) LIKE N'%[IOQ]%'))
)
    THROW 51001, 'Hay vehículos que no cumplen el formato requerido. Corrige esos registros antes de aplicar esta migración.', 1;
GO

IF EXISTS
(
    SELECT 1
    FROM dbo.ServiciosMantenimiento
    WHERE LEN(LTRIM(RTRIM(TipoServicio))) NOT BETWEEN 2 AND 80
       OR LEN(LTRIM(RTRIM(Descripcion))) NOT BETWEEN 2 AND 2000
)
    THROW 51002, 'Hay servicios con tipo o descripción vacíos. Corrige esos registros antes de aplicar esta migración.', 1;
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'CK_Vehiculos_PlacaFormato'
)
    ALTER TABLE dbo.Vehiculos WITH CHECK ADD CONSTRAINT CK_Vehiculos_PlacaFormato
        CHECK
        (
            Placa NOT LIKE N'%[^A-Z0-9 -]%'
            AND LEFT(LTRIM(RTRIM(Placa)), 1) LIKE N'[A-Z0-9]'
            AND RIGHT(LTRIM(RTRIM(Placa)), 1) LIKE N'[A-Z0-9]'
        );
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'CK_Vehiculos_Marca'
)
    ALTER TABLE dbo.Vehiculos WITH CHECK ADD CONSTRAINT CK_Vehiculos_Marca
        CHECK (LEN(LTRIM(RTRIM(Marca))) BETWEEN 1 AND 60);
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'CK_Vehiculos_Modelo'
)
    ALTER TABLE dbo.Vehiculos WITH CHECK ADD CONSTRAINT CK_Vehiculos_Modelo
        CHECK (LEN(LTRIM(RTRIM(Modelo))) BETWEEN 1 AND 60);
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.Vehiculos')
      AND name = N'CK_Vehiculos_VinFormato'
)
    ALTER TABLE dbo.Vehiculos WITH CHECK ADD CONSTRAINT CK_Vehiculos_VinFormato
        CHECK
        (
            Vin IS NULL
            OR (LEN(LTRIM(RTRIM(Vin))) BETWEEN 11 AND 17
                AND UPPER(Vin) NOT LIKE N'%[^A-Z0-9]%'
                AND UPPER(Vin) NOT LIKE N'%[IOQ]%')
        );
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.ServiciosMantenimiento')
      AND name = N'CK_Servicios_Tipo'
)
    ALTER TABLE dbo.ServiciosMantenimiento WITH CHECK ADD CONSTRAINT CK_Servicios_Tipo
        CHECK (LEN(LTRIM(RTRIM(TipoServicio))) BETWEEN 2 AND 80);
GO

IF NOT EXISTS
(
    SELECT 1 FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.ServiciosMantenimiento')
      AND name = N'CK_Servicios_Descripcion'
)
    ALTER TABLE dbo.ServiciosMantenimiento WITH CHECK ADD CONSTRAINT CK_Servicios_Descripcion
        CHECK (LEN(LTRIM(RTRIM(Descripcion))) BETWEEN 2 AND 2000);
GO
