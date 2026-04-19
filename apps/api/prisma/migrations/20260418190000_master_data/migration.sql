-- Master data for Phase 1.
CREATE TABLE `MeasurementUnit` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `MeasurementUnit_companyId_name_key`(`companyId`, `name`),
  UNIQUE INDEX `MeasurementUnit_companyId_code_key`(`companyId`, `code`),
  INDEX `MeasurementUnit_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Variable` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Variable_companyId_name_key`(`companyId`, `name`),
  INDEX `Variable_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Sector` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `position` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Sector_companyId_name_key`(`companyId`, `name`),
  INDEX `Sector_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Stage` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `sectorId` VARCHAR(191) NOT NULL,
  `measurementUnitId` VARCHAR(191) NOT NULL,
  `variableId` VARCHAR(191) NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `capacityPerWorkday` DECIMAL(12, 2) NOT NULL,
  `position` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Stage_companyId_name_key`(`companyId`, `name`),
  INDEX `Stage_companyId_idx`(`companyId`),
  INDEX `Stage_sectorId_idx`(`sectorId`),
  INDEX `Stage_measurementUnitId_idx`(`measurementUnitId`),
  INDEX `Stage_variableId_idx`(`variableId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Template` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Template_companyId_name_key`(`companyId`, `name`),
  INDEX `Template_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `TemplateItem` (
  `id` VARCHAR(191) NOT NULL,
  `templateId` VARCHAR(191) NOT NULL,
  `stageId` VARCHAR(191) NOT NULL,
  `position` INTEGER NOT NULL DEFAULT 0,

  INDEX `TemplateItem_templateId_idx`(`templateId`),
  INDEX `TemplateItem_stageId_idx`(`stageId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `MeasurementUnit`
  ADD CONSTRAINT `MeasurementUnit_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Variable`
  ADD CONSTRAINT `Variable_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Sector`
  ADD CONSTRAINT `Sector_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Stage`
  ADD CONSTRAINT `Stage_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Stage`
  ADD CONSTRAINT `Stage_sectorId_fkey`
  FOREIGN KEY (`sectorId`) REFERENCES `Sector`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Stage`
  ADD CONSTRAINT `Stage_measurementUnitId_fkey`
  FOREIGN KEY (`measurementUnitId`) REFERENCES `MeasurementUnit`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Stage`
  ADD CONSTRAINT `Stage_variableId_fkey`
  FOREIGN KEY (`variableId`) REFERENCES `Variable`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Template`
  ADD CONSTRAINT `Template_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `TemplateItem`
  ADD CONSTRAINT `TemplateItem_templateId_fkey`
  FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `TemplateItem`
  ADD CONSTRAINT `TemplateItem_stageId_fkey`
  FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
