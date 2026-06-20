-- CreateEnum
CREATE TYPE "Frequence" AS ENUM ('UNIQUE', 'QUOTIDIEN', 'HEBDOMADAIRE', 'MENSUEL');

-- CreateEnum
CREATE TYPE "VirementProgrammeStatut" AS ENUM ('ACTIF', 'SUSPENDU', 'TERMINE');

-- CreateTable
CREATE TABLE "VirementProgramme" (
    "id" SERIAL NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "libelle" TEXT NOT NULL,
    "frequence" "Frequence" NOT NULL,
    "statut" "VirementProgrammeStatut" NOT NULL DEFAULT 'ACTIF',
    "dateProchaineExecution" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "compteSourceId" INTEGER NOT NULL,
    "beneficiaireId" INTEGER NOT NULL,

    CONSTRAINT "VirementProgramme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VirementProgramme" ADD CONSTRAINT "VirementProgramme_compteSourceId_fkey" FOREIGN KEY ("compteSourceId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirementProgramme" ADD CONSTRAINT "VirementProgramme_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "Beneficiaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
