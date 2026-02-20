"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function CopyLinkButton({ username }: { username: string }) {
  const t = useTranslations("PublicProfile");
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        const url = `${window.location.origin}/u/${username}`;
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
        copied
          ? "bg-indigo-600/20 text-indigo-400"
          : "bg-indigo-600 text-white hover:bg-indigo-500"
      }`}
    >
      {copied ? t("linkCopied") : t("copyLink")}
    </button>
  );
}
