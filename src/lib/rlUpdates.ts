import * as cheerio from "cheerio";

export interface PatchNote {
  title: string;
  date: string;
  href: string;
  tag: string;
}

const RL_PATCH_NOTES_URL =
  "https://www.rocketleague.com/news/tag/patch-notes";

export async function fetchPatchNotes(): Promise<PatchNote[]> {
  try {
    const res = await fetch(RL_PATCH_NOTES_URL, {
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!res.ok) return [];

    const html = await res.text();
    return parsePatchNotes(html);
  } catch {
    return [];
  }
}

export function parsePatchNotes(html: string): PatchNote[] {
  const $ = cheerio.load(html);
  const items: PatchNote[] = [];

  // The RL news page renders article cards. We try multiple selectors
  // to be resilient to minor markup changes.
  const selectors = [
    "a[href*='/news/']",
    ".news-card",
    "article a",
    "[data-testid='news-card']",
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const $el = $(el);

      // Resolve href
      let href = $el.attr("href") ?? $el.find("a").first().attr("href") ?? "";
      if (href && !href.startsWith("http")) {
        href = `https://www.rocketleague.com${href}`;
      }
      if (!href || !href.includes("/news/")) return;

      // Title: prefer heading text, then aria-label, then link text
      const title =
        $el.find("h1, h2, h3, h4, h5, [class*='title']").first().text().trim() ||
        $el.attr("aria-label")?.trim() ||
        $el.text().trim().slice(0, 120);

      if (!title) return;

      // Date
      const date =
        $el.find("time").attr("datetime") ??
        $el.find("[class*='date'], time, [class*='Date']").first().text().trim() ??
        "";

      // Deduplicate
      if (items.some((i) => i.href === href)) return;

      items.push({
        title,
        date,
        href,
        tag: "Patch Notes",
      });
    });

    if (items.length > 0) break;
  }

  return items.slice(0, 12);
}
