-- MySQL Script generated by MySQL Workbench
-- Wed Jul 21 20:53:59 2021
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema g-nom_dev
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema g-nom_dev
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `g-nom_dev` DEFAULT CHARACTER SET utf8 ;
USE `g-nom_dev` ;

-- -----------------------------------------------------
-- Table `g-nom_dev`.`taxon`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`taxon` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ncbiTaxonID` INT NOT NULL,
  `scientificName` VARCHAR(400) NOT NULL,
  `imageStatus` TINYINT(1) NOT NULL DEFAULT 0,
  `lastUpdatedBy` INT NOT NULL,
  `lastUpdatedOn` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`assembly`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`assembly` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `taxonID` INT NOT NULL,
  `name` VARCHAR(400) NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `addedBy` INT NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  `lastUpdatedBy` INT NOT NULL,
  `lastUpdatedOn` TIMESTAMP NOT NULL,
  `additionalFilesPath` VARCHAR(400) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `assemblyName_UNIQUE` (`name` ASC) VISIBLE,
  INDEX `taxonID_idx` (`taxonID` ASC) VISIBLE,
  CONSTRAINT `taxonID`
    FOREIGN KEY (`taxonID`)
    REFERENCES `g-nom_dev`.`taxon` (`id`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`analysis`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`analysis` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assemblyID` INT NOT NULL,
  `name` VARCHAR(400) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `addedBy` INT NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  `additionalFilesPath` VARCHAR(400) NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyAnalysisID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `assemblyAnalysisID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `g-nom_dev`.`assembly` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`busco`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`busco` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `analysisID` INT NOT NULL,
  `completeSingle` INT NOT NULL,
  `completeDuplicated` INT NOT NULL,
  `fragmented` INT NOT NULL,
  `missing` INT NOT NULL,
  `total` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `analysisBuscoID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `g-nom_dev`.`analysis` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`milts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`milts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `analysisID` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `analysisMiltsID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `g-nom_dev`.`analysis` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`taxonGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`taxonGeneralInfo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `taxonID` INT NOT NULL,
  `generalInfoLabel` VARCHAR(400) NOT NULL,
  `generalInfoDescription` VARCHAR(2000) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `taxonIDgeneralInfo_idx` (`taxonID` ASC) VISIBLE,
  CONSTRAINT `taxonIDgeneralInfo`
    FOREIGN KEY (`taxonID`)
    REFERENCES `g-nom_dev`.`taxon` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`fcat`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`fcat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `analysisID` INT NOT NULL,
  `m1_similar` INT NOT NULL,
  `m1_dissimilar` INT NOT NULL,
  `m1_duplicated` INT NOT NULL,
  `m1_missing` INT NOT NULL,
  `m1_ignored` INT NOT NULL,
  `m2_similar` INT NOT NULL,
  `m2_dissimilar` INT NOT NULL,
  `m2_duplicated` INT NOT NULL,
  `m2_missing` INT NOT NULL,
  `m2_ignored` INT NOT NULL,
  `m3_similar` INT NOT NULL,
  `m3_dissimilar` INT NOT NULL,
  `m3_duplicated` INT NOT NULL,
  `m3_missing` INT NOT NULL,
  `m3_ignored` INT NOT NULL,
  `m4_similar` INT NOT NULL,
  `m4_dissimilar` INT NOT NULL,
  `m4_duplicated` INT NOT NULL,
  `m4_missing` INT NOT NULL,
  `m4_ignored` INT NOT NULL,
  `total` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `analysisFcatID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `g-nom_dev`.`analysis` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`repeatmasker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`repeatmasker` (
  `id` INT NOT NULL,
  `analysisID` INT NOT NULL,
  `retroelements` INT NOT NULL,
  `retroelements_length` INT NOT NULL,
  `dna_transposons` INT NOT NULL,
  `dna_transposons_length` INT NOT NULL,
  `rolling_circles` INT NOT NULL,
  `rolling_circles_length` INT NOT NULL,
  `unclassified` INT NOT NULL,
  `unclassified_length` INT NOT NULL,
  `small_rna` INT NOT NULL,
  `small_rna_length` INT NOT NULL,
  `satellites` INT NOT NULL,
  `satellites_length` INT NOT NULL,
  `simple_repeats` INT NOT NULL,
  `simple_repeats_length` INT NOT NULL,
  `low_complexity` INT NOT NULL,
  `low_complexity_length` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `analysisID_UNIQUE` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `analysisRepeatmaskerID`
    FOREIGN KEY (`analysisID`)
    REFERENCES `g-nom_dev`.`analysis` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`annotation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`annotation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assemblyID` INT NOT NULL,
  `name` VARCHAR(400) NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `addedBy` INT NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  `additionalFilesPath` VARCHAR(400) NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyAnnotationID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `assemblyAnnotationID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `g-nom_dev`.`assembly` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`bookmark`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`bookmark` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userID` INT NOT NULL,
  `assemblyID` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `userIDSubscription_idx` (`userID` ASC) VISIBLE,
  INDEX `assemblyIDSubscription_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `userIDSubscription`
    FOREIGN KEY (`userID`)
    REFERENCES `g-nom_dev`.`user` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `assemblyIDSubscription`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `g-nom_dev`.`assembly` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`proteins`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`proteins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `annotationID` INT NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `additionalFilesPath` VARCHAR(400) NULL,
  PRIMARY KEY (`id`),
  INDEX `annotationIDproteins_idx` (`annotationID` ASC) VISIBLE,
  CONSTRAINT `annotationIDproteins`
    FOREIGN KEY (`annotationID`)
    REFERENCES `g-nom_dev`.`annotation` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`assemblyGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`assemblyGeneralInfo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assemblyID` INT NOT NULL,
  `generalInfoLabel` VARCHAR(400) NOT NULL,
  `generalInfoDescription` VARCHAR(400) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyIDassemblyGeneralInfo_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `assemblyIDassemblyGeneralInfo`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `g-nom_dev`.`assembly` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`proteinFeatures`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`proteinFeatures` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `proteinsID` INT NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `additionalFilesPath` VARCHAR(400) NULL,
  PRIMARY KEY (`id`),
  INDEX `proteinsIDfeatures_idx` (`proteinsID` ASC) VISIBLE,
  CONSTRAINT `proteinsIDfeatures`
    FOREIGN KEY (`proteinsID`)
    REFERENCES `g-nom_dev`.`proteins` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`analysisGeneralInfo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`analysisGeneralInfo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `analysisID` INT NOT NULL,
  `generalInfoLabel` VARCHAR(400) NOT NULL,
  `generalInfoDescription` VARCHAR(2000) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `analysisIDGeneralInfo_idx` (`analysisID` ASC) VISIBLE,
  CONSTRAINT `analysisIDGeneralInfo`
    FOREIGN KEY (`analysisID`)
    REFERENCES `g-nom_dev`.`analysis` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`mapping`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`mapping` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assemblyID` INT NOT NULL,
  `name` VARCHAR(400) NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `addedBy` INT NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  `additionalFilesPath` VARCHAR(400) NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyIDMapping_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `assemblyIDMapping`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `g-nom_dev`.`assembly` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`reference`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`reference` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `taxonID` INT NOT NULL,
  `name` VARCHAR(400) NOT NULL,
  `path` VARCHAR(400) NOT NULL,
  `addedBy` INT NOT NULL,
  `addedOn` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `taxonIDReference_idx` (`taxonID` ASC) VISIBLE,
  CONSTRAINT `taxonIDReference`
    FOREIGN KEY (`taxonID`)
    REFERENCES `g-nom_dev`.`taxon` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `g-nom_dev`.`assemblyStatistics`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `g-nom_dev`.`assemblyStatistics` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `assemblyID` INT NOT NULL,
  `numberOfSequences` INT NOT NULL,
  `cumulativeSequenceLength` INT NOT NULL,
  `n50` INT NOT NULL,
  `n90` INT NOT NULL,
  `largestSequence` INT NOT NULL,
  `gcPercent` FLOAT NOT NULL,
  `gcPercentMasked` FLOAT NOT NULL,
  `softmaskedBases` INT NOT NULL,
  `hardmaskedBases` INT NOT NULL,
  `sequencesLarger1000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger1000` INT NOT NULL,
  `sequencesLarger2500` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger2500` INT NOT NULL,
  `sequencesLarger5000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger5000` INT NOT NULL,
  `sequencesLarger10000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger10000` INT NOT NULL,
  `sequencesLarger25000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger25000` INT NOT NULL,
  `sequencesLarger50000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger50000` INT NOT NULL,
  `sequencesLarger100000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger100000` INT NOT NULL,
  `sequencesLarger250000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger250000` INT NOT NULL,
  `sequencesLarger500000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger500000` INT NOT NULL,
  `sequencesLarger1000000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger1000000` INT NOT NULL,
  `sequencesLarger2500000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger2500000` INT NOT NULL,
  `sequencesLarger5000000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger5000000` INT NOT NULL,
  `sequencesLarger10000000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger10000000` INT NOT NULL,
  `sequencesLarger25000000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger25000000` INT NOT NULL,
  `sequencesLarger50000000` INT NOT NULL,
  `cumulativeSequenceLengthSequencesLarger50000000` INT NOT NULL,
  `types` VARCHAR(50) NOT NULL,
  `maskings` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `assemblyStatisticsIDassemblyID_idx` (`assemblyID` ASC) VISIBLE,
  CONSTRAINT `assemblyStatisticsIDassemblyID`
    FOREIGN KEY (`assemblyID`)
    REFERENCES `g-nom_dev`.`assembly` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- -----------------------------------------------------
-- Data for table `g-nom_dev`.`user`
-- -----------------------------------------------------
START TRANSACTION;
USE `g-nom_dev`;
INSERT INTO `g-nom_dev`.`user` (`id`, `username`, `password`, `role`) VALUES (DEFAULT, 'admin', 'd987f042a7945828cc9425c13c1e688abf953efccbf34df492552a05d7bbe934a696501851f16616e5e527627d97f1dde346eb1d62d7f11bf929de7d33e8e3eb', 'admin');

COMMIT;

