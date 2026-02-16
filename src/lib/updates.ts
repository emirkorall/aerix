export type UpdateCategory = "Season" | "Patch" | "Esports" | "Meta";

export interface UpdateItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: UpdateCategory;
  summary: string;
  trainingImpact: string[];
  links?: { label: string; href: string }[];
}

export const ALL_CATEGORIES: UpdateCategory[] = [
  "Season",
  "Patch",
  "Esports",
  "Meta",
];

export const UPDATES: UpdateItem[] = [
  {
    id: "upd-season-16-reset",
    date: "2026-02-10",
    title: "Season 16 rank reset and distribution shift",
    category: "Season",
    summary:
      "New season brought a soft reset. Most players dropped roughly one sub-rank. The middle ranks are more compressed, meaning lobbies may feel harder than usual for a few weeks.",
    trainingImpact: [
      "Expect tougher opponents at your current rank — tighten fundamentals.",
      "Shadow defense and rotation become more important in compressed lobbies.",
      "Focus on consistency over flashy plays while the ladder settles.",
    ],
    links: [
      {
        label: "Rocket League official blog",
        href: "https://www.rocketleague.com/news",
      },
    ],
  },
  {
    id: "upd-patch-hitbox-feb",
    date: "2026-02-05",
    title: "Car hitbox consistency update",
    category: "Patch",
    summary:
      "A recent patch improved hitbox alignment for several car bodies. Visual models now match collision shapes more closely, which may subtly affect how shots and 50/50s feel.",
    trainingImpact: [
      "If your main car was adjusted, spend time in free play re-calibrating touches.",
      "50/50 outcomes may change slightly — practice reading post-challenge bounces.",
      "Power shot angles could shift marginally — run a few training packs to re-groove.",
      "Consider trying your car in a workshop map to feel the difference.",
    ],
  },
  {
    id: "upd-meta-recoveries",
    date: "2026-01-28",
    title: "Meta note: faster recoveries matter more than ever",
    category: "Meta",
    summary:
      "High-level play continues to speed up. Clean recoveries — landing on all four wheels, wave dashing off walls, and half-flip resets — are separating ranks more than mechanical ceiling shots.",
    trainingImpact: [
      "Drill wave dashes and half flips daily until they are automatic.",
      "Focus on landing facing the play after every aerial.",
      "Small pad pathing keeps you fast without going out of position.",
      "Recovery speed directly converts to more boost and better positioning.",
    ],
  },
  {
    id: "upd-esports-rlcs-spring",
    date: "2026-01-20",
    title: "RLCS Spring Split format announced",
    category: "Esports",
    summary:
      "The spring split moves to a new open-qualifier format. More teams get a shot at regional finals, which could shift the competitive meta as underdogs bring unpredictable styles.",
    trainingImpact: [
      "Watch qualifier replays for creative plays you can adapt to ranked.",
      "Expect new demo-heavy and bump-heavy strategies to trickle into ranked.",
      "Review passing plays — coordinated offense is a growing trend at all levels.",
    ],
    links: [
      {
        label: "RLCS schedule",
        href: "https://esports.rocketleague.com",
      },
    ],
  },
  {
    id: "upd-season-15-rewards",
    date: "2026-01-15",
    title: "Season 15 rewards and what they mean for your grind",
    category: "Season",
    summary:
      "Season 15 rewards have been distributed. If you didn't hit your target rank, now is the time to plan your training for the new season while motivation is fresh.",
    trainingImpact: [
      "Set a concrete rank target for Season 16 and pick training that supports it.",
      "Review replays from your last 10 games of Season 15 to find patterns.",
      "Identify one skill gap (defense, aerials, positioning) and build a weekly plan around it.",
    ],
  },
  {
    id: "upd-patch-boost-jan",
    date: "2026-01-10",
    title: "Boost pad pickup radius adjustment",
    category: "Patch",
    summary:
      "Boost pad pickup radius was slightly expanded in a quality-of-life update. Collecting small pads while driving at speed should feel more forgiving.",
    trainingImpact: [
      "Pad pathing routes are now slightly more lenient — update your muscle memory.",
      "This favors small-pad rotations over big-boost starving.",
      "Practice collecting pads during rotations without looking down.",
      "Defensive rotations that rely on pad collection become more reliable.",
    ],
  },
  {
    id: "upd-meta-kickoff",
    date: "2026-01-05",
    title: "Kickoff meta shifting toward speed flips",
    category: "Meta",
    summary:
      "Speed flip kickoffs continue to dominate at Champion and above. Players who don't use them are consistently losing the initial 50/50 and giving up early pressure.",
    trainingImpact: [
      "Learn the speed flip input if you haven't — it's becoming table stakes above Diamond.",
      "Practice the cancel timing until it's consistent from both left and right spawns.",
      "Even a basic speed flip beats a standard front flip kickoff at high ranks.",
      "Pair kickoff practice with post-kickoff positioning for the full advantage.",
    ],
  },
  {
    id: "upd-esports-team-changes",
    date: "2025-12-20",
    title: "Off-season roster moves and playstyle trends",
    category: "Esports",
    summary:
      "Several top teams reshuffled rosters during the off-season. New team compositions are leaning toward mechanical flexibility — players who can both create and defend at speed.",
    trainingImpact: [
      "Versatility is valued — train both offensive and defensive mechanics each week.",
      "Watch how new rosters adapt their rotation styles in early matches.",
      "Solo queue benefits from being able to fill any role — practice all three positions.",
    ],
  },
];

export function getUpdateById(id: string): UpdateItem | undefined {
  return UPDATES.find((u) => u.id === id);
}

export function getUpdatesByCategory(category: UpdateCategory): UpdateItem[] {
  return UPDATES.filter((u) => u.category === category);
}
