export const formatFCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
};

export const calculateInvoice = (items: any[]) => {
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tva = Math.round(subtotal * 0.1925); // TVA Cameroun
  const total = subtotal + tva;
  return { subtotal, tva, total };
};