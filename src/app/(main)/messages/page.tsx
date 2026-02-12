"use client";

import { useSearchParams } from "next/navigation";
import Chat from "./Chat";
import Head from "next/head";

export default function Page() {
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");

  return (
    <>
      <Head>
        <title>Messages</title>
      </Head>
      <Chat initialSelectedUserId={selectedUserId || null} />
    </>
  );
}
