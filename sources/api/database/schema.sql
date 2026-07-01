-- ExportWise Database Schema
-- POC version: SQLite
-- Compatible with SQL Server migration (see notes below).
--
-- SQL Server migration notes:
--   INTEGER PRIMARY KEY AUTOINCREMENT -> INT IDENTITY(1,1) PRIMARY KEY
--   TEXT -> NVARCHAR(500) or NVARCHAR(MAX)
--   DATETIME -> DATETIME2 or DATE

-- Country
CREATE TABLE IF NOT EXISTS Country (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT    NOT NULL,
    region  TEXT    NOT NULL
);

-- Manufacturer
-- code: short unique prefix used in product SKUs, e.g. 'TNV' for Tnuva
CREATE TABLE IF NOT EXISTS Manufacturer (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    code    TEXT    NOT NULL UNIQUE,
    name    TEXT    NOT NULL
);

-- Product
-- sku: unique SKU in format {manufacturerCode}-{number}, e.g. 'TNV-001'
CREATE TABLE IF NOT EXISTS Product (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sku   TEXT    NOT NULL UNIQUE,
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    ingredients TEXT,
    description TEXT
);

-- CommitteeDecision
-- Represents a license request: a manufacturer asking to export a product to a country.
-- decisionStatus: 'אושר' | 'נדחה' | 'אושר בתנאים'
CREATE TABLE IF NOT EXISTS CommitteeDecision (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    manufacturerId  INTEGER NOT NULL REFERENCES Manufacturer(id),
    productId       INTEGER NOT NULL REFERENCES Product(id),
    countryId       INTEGER NOT NULL REFERENCES Country(id),
    decisionStatus  TEXT    NOT NULL,
    decisionReason  TEXT,
    conditions      TEXT,
    risks           TEXT,
    decisionDate    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_sku     ON Product(sku);
CREATE INDEX IF NOT EXISTS idx_cd_manufacturer     ON CommitteeDecision(manufacturerId);
CREATE INDEX IF NOT EXISTS idx_cd_product          ON CommitteeDecision(productId);
CREATE INDEX IF NOT EXISTS idx_cd_country          ON CommitteeDecision(countryId);
CREATE INDEX IF NOT EXISTS idx_cd_status           ON CommitteeDecision(decisionStatus);
CREATE INDEX IF NOT EXISTS idx_cd_date             ON CommitteeDecision(decisionDate);
