import prisma from "./prisma";

export async function debitSellerBalance(sellerId: string, amount: number, reason: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Récupérer le solde actuel
    const seller = await tx.user.findUnique({
      where: { id: sellerId },
      select: { balance: true }
    });

    if (!seller || seller.balance < amount) {
      throw new Error("Solde insuffisant");
    }

    // 2. Déduire le montant
    await tx.user.update({
      where: { id: sellerId },
      data: { balance: { decrement: amount } }
    });

    // 3. Créer la trace
    await tx.transaction.create({
      data: {
        userId: sellerId,
        amount: -amount,
        reason: reason
      }
    });

    return true;
  });
}