CREATE TABLE `ClothingSize` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `ClothingSize_companyId_name_key`(`companyId`, `name`),
  INDEX `ClothingSize_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Customer` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `cpf` VARCHAR(191) NULL,
  `cnpj` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `mobilePhone` VARCHAR(191) NULL,
  `landlinePhone` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Customer_companyId_cpf_key`(`companyId`, `cpf`),
  UNIQUE INDEX `Customer_companyId_cnpj_key`(`companyId`, `cnpj`),
  INDEX `Customer_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Product` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `costPrice` DECIMAL(12, 2) NOT NULL,
  `salePrice` DECIMAL(12, 2) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Product_companyId_name_key`(`companyId`, `name`),
  INDEX `Product_companyId_idx`(`companyId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductVariableDefault` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `variableId` VARCHAR(191) NOT NULL,
  `value` DECIMAL(12, 2) NOT NULL,

  UNIQUE INDEX `ProductVariableDefault_productId_variableId_key`(`productId`, `variableId`),
  INDEX `ProductVariableDefault_productId_idx`(`productId`),
  INDEX `ProductVariableDefault_variableId_idx`(`variableId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ClothingSize`
  ADD CONSTRAINT `ClothingSize_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Customer`
  ADD CONSTRAINT `Customer_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Product`
  ADD CONSTRAINT `Product_companyId_fkey`
  FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ProductVariableDefault`
  ADD CONSTRAINT `ProductVariableDefault_productId_fkey`
  FOREIGN KEY (`productId`) REFERENCES `Product`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductVariableDefault`
  ADD CONSTRAINT `ProductVariableDefault_variableId_fkey`
  FOREIGN KEY (`variableId`) REFERENCES `Variable`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;
