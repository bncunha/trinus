-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('REGISTERED', 'IN_PROGRESS', 'PAUSED', 'CANCELED', 'FINISHED') NOT NULL DEFAULT 'REGISTERED',
    `startDate` DATE NULL,
    `deliveryDate` DATE NULL,
    `finalNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_companyId_orderNumber_key`(`companyId`, `orderNumber`),
    INDEX `orders_companyId_idx`(`companyId`),
    INDEX `orders_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `quantityMode` ENUM('SINGLE', 'SIZE_GRID') NOT NULL DEFAULT 'SINGLE',
    `quantity` DECIMAL(12, 2) NULL,
    `notes` TEXT NULL,

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_productId_idx`(`productId`),
    INDEX `order_items_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item_sizes` (
    `id` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NOT NULL,
    `sizeId` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(12, 2) NOT NULL,

    UNIQUE INDEX `order_item_sizes_orderItemId_sizeId_key`(`orderItemId`, `sizeId`),
    INDEX `order_item_sizes_orderItemId_idx`(`orderItemId`),
    INDEX `order_item_sizes_sizeId_idx`(`sizeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item_stages` (
    `id` VARCHAR(191) NOT NULL,
    `orderItemId` VARCHAR(191) NOT NULL,
    `stageId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `order_item_stages_orderItemId_idx`(`orderItemId`),
    INDEX `order_item_stages_stageId_idx`(`stageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `Template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item_sizes` ADD CONSTRAINT `order_item_sizes_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item_sizes` ADD CONSTRAINT `order_item_sizes_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `ClothingSize`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item_stages` ADD CONSTRAINT `order_item_stages_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `order_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item_stages` ADD CONSTRAINT `order_item_stages_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
