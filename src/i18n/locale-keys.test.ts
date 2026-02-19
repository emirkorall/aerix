import { describe, it, expect } from "vitest";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import ptBR from "../../messages/pt-BR.json";
import fr from "../../messages/fr.json";
import de from "../../messages/de.json";

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      keys = keys.concat(getKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

const enKeys = getKeys(en);

describe("i18n key consistency", () => {
  const locales: Record<string, Record<string, unknown>> = {
    es,
    "pt-BR": ptBR,
    fr,
    de,
  };

  for (const [name, msgs] of Object.entries(locales)) {
    it(`${name}.json has the same keys as en.json`, () => {
      const keys = getKeys(msgs);
      const missing = enKeys.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !enKeys.includes(k));

      expect(missing, `Missing keys in ${name}`).toEqual([]);
      expect(extra, `Extra keys in ${name}`).toEqual([]);
    });
  }
});
