import { StreamChat } from "stream-chat";

// On s'assure que cette instance n'est créée que si les clés sont présentes
const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY!;
const apiSecret = process.env.STREAM_SECRET;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_STREAM_KEY is missing in .env");
}

const streamServerClient = StreamChat.getInstance(apiKey, apiSecret);

// ✅ On augmente le timeout globalement pour compenser les lenteurs de connexion
streamServerClient.options.timeout = 15000; 

// ✅ On désactive le warmUp en mode développement pour économiser de la bande passante
if (process.env.NODE_ENV === 'development') {
  streamServerClient.options.warmUp = false;
}

export default streamServerClient;