"use client";

import { useState } from "react";

interface ExpandableTextProps {
  text: string;
  limit?: number;
}

export default function ExpandableText({ text, limit = 250 }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Si le texte est plus court que la limite, on l'affiche normalement
  if (text.length <= limit) {
    return <div className="whitespace-pre-line break-words">{text}</div>;
  }

  return (
    <div className="whitespace-pre-line break-words">
      {isExpanded ? text : `${text.substring(0, limit)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-1 text-primary font-semibold hover:underline"
      >
        {isExpanded ? "Voir moins" : "Voir plus"}
      </button>
    </div>
  );
}