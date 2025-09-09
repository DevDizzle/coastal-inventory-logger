-- sql/create-system-hours-table.sql
-- Table for storing system hours metrics submitted from the app.

CREATE TABLE Inventory.PC_SystemHours (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    [Location] NVARCHAR(10) NOT NULL,
    [Date] DATE NOT NULL,
    [Metric] NVARCHAR(100) NOT NULL,
    [Hours] DECIMAL(18,2) NOT NULL,
    CreatedBy NVARCHAR(256) NOT NULL,
    Source NVARCHAR(50) NOT NULL DEFAULT 'App',
    CreatedDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
