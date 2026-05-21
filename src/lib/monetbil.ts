import axios from "axios";

const MONETBIL_API_URL = "https://api.monetbil.com/v1/payment/initiate";

export async function initiateMonetbilPayment({ 
  orderId, 
  amount 
}: { 
  orderId: string; 
  amount: number 
}) {
  const params = new URLSearchParams({
    apikey: process.env.MONETBIL_API_KEY!,
    service: process.env.MONETBIL_SERVICE_KEY!,
    amount: amount.toString(),
    currency: "XAF",
    order_id: orderId,
    notify_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/monetbil`,
    return_url: `${process.env.NEXT_PUBLIC_URL}/orders/${orderId}`,
  });

  const response = await axios.post(MONETBIL_API_URL, params.toString());
  return response.data.payment_url;
}