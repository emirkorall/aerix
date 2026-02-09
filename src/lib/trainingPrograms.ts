export type SectionName =
  | "Mechanics"
  | "Control / Free Play"
  | "Game Sense / Review";

export const SECTION_ORDER: SectionName[] = [
  "Mechanics",
  "Control / Free Play",
  "Game Sense / Review",
];

export interface TrainingBlock {
  id: string;
  slug: string;
  title: string;
  goals: string[];
  videoId: string;
  creator: string;
  section: SectionName;
}

export interface TrainingProgram {
  tier: "free" | "starter" | "pro";
  label: string;
  tagline: string;
  blocks: TrainingBlock[];
}

// ──────────────────────────────────────────────
// FREE — Foundations (3 blocks)
// ──────────────────────────────────────────────

const FREE_BLOCKS: TrainingBlock[] = [
  {
    id: "free-car-control",
    slug: "car-control",
    title: "Basic Car Control",
    goals: [
      "Get comfortable moving your car smoothly on the ground and in the air",
      "Practice landing on all four wheels after jumps",
    ],
    videoId: "ed8owajA0Lc",
    creator: "Kevpert",
    section: "Mechanics",
  },
  {
    id: "free-ground-dribble",
    slug: "ground-dribble",
    title: "Ground Dribbling Basics",
    goals: [
      "Balance the ball on your car for 10+ seconds",
      "Learn to control speed while carrying",
    ],
    videoId: "576yfVb3MUM",
    creator: "Wayton Pilkin",
    section: "Control / Free Play",
  },
  {
    id: "free-rotation",
    slug: "rotation",
    title: "Rotation Fundamentals",
    goals: [
      "Understand when to rotate back vs challenge",
      "Learn basic 3s rotation patterns",
    ],
    videoId: "THcMLWOEc_o",
    creator: "SunlessKhan",
    section: "Game Sense / Review",
  },
];

// ──────────────────────────────────────────────
// STARTER — Structured Improvement (6 blocks)
// ──────────────────────────────────────────────

const STARTER_BLOCKS: TrainingBlock[] = [
  {
    id: "starter-key-mechanics",
    slug: "key-mechanics",
    title: "Key Mechanics for Ranking Up",
    goals: [
      "Learn the 5 most impactful mechanics for climbing ranks",
      "Focus practice time on skills that actually matter in games",
    ],
    videoId: "Zls47dgR58c",
    creator: "Thanovic",
    section: "Mechanics",
  },
  {
    id: "starter-fast-aerials",
    slug: "fast-aerials",
    title: "Fast Aerials",
    goals: [
      "Master the double-jump fast aerial timing",
      "Reach the ball before your opponent on aerial challenges",
    ],
    videoId: "lkBZg0Ldhls",
    creator: "Virge",
    section: "Mechanics",
  },
  {
    id: "starter-wall-play",
    slug: "wall-play",
    title: "Wall Clears & Stops",
    goals: [
      "Drive up walls and control the ball with wall stops",
      "Read bounces off the wall to position for clears",
    ],
    videoId: "fOA9lOjpbNE",
    creator: "Kevpert",
    section: "Control / Free Play",
  },
  {
    id: "starter-recovery",
    slug: "recovery",
    title: "Powerslide & Recovery",
    goals: [
      "Use powerslide to maintain momentum after landings",
      "Recover quickly off walls and re-enter play faster",
    ],
    videoId: "rA8fccIIMVs",
    creator: "Kevpert",
    section: "Control / Free Play",
  },
  {
    id: "starter-shadow",
    slug: "shadow-defense",
    title: "Shadow Defense",
    goals: [
      "Mirror your opponent without overcommitting",
      "Force them into bad touches and capitalize",
    ],
    videoId: "2aZA-NCRRgI",
    creator: "SunlessKhan",
    section: "Game Sense / Review",
  },
  {
    id: "starter-improvement-review",
    slug: "self-review",
    title: "Self-Review & Improvement",
    goals: [
      "Identify one recurring mistake holding you back",
      "Build a habit of reviewing your own gameplay critically",
    ],
    videoId: "GcG02ik0EyU",
    creator: "SunlessKhan",
    section: "Game Sense / Review",
  },
];

// ──────────────────────────────────────────────
// PRO — Competitive Track (9 blocks)
// ──────────────────────────────────────────────

const PRO_BLOCKS: TrainingBlock[] = [
  {
    id: "pro-air-roll",
    slug: "air-roll",
    title: "Directional Air Roll Control",
    goals: [
      "Understand air roll left, right, and dynamic air roll differences",
      "Adjust trajectory mid-air for precise touches",
    ],
    videoId: "eZ6upQhTpBQ",
    creator: "Kevpert",
    section: "Mechanics",
  },
  {
    id: "pro-ground-to-air",
    slug: "ground-to-air",
    title: "Ground to Air Dribbles",
    goals: [
      "Pop the ball off your car and follow it into the air smoothly",
      "Maintain control through the full ground-to-air transition",
    ],
    videoId: "3miaW-kwQQg",
    creator: "SpookLuke",
    section: "Mechanics",
  },
  {
    id: "pro-rebounds",
    slug: "rebounds",
    title: "Rebounds & Backboard Reads",
    goals: [
      "Read backboard bounces and position for follow-ups",
      "Score off rebounds with controlled second touches",
    ],
    videoId: "6cV5N31jYag",
    creator: "Kevpert",
    section: "Mechanics",
  },
  {
    id: "pro-boost-positioning",
    slug: "boost-positioning",
    title: "Boost Management & Positioning",
    goals: [
      "Maintain pressure without running out of boost",
      "Use small pads to stay in the play longer",
    ],
    videoId: "edWi_ATGh9A",
    creator: "Kevpert",
    section: "Control / Free Play",
  },
  {
    id: "pro-training-plan",
    slug: "training-routine",
    title: "Building a Training Routine",
    goals: [
      "Structure your practice sessions for maximum improvement",
      "Balance mechanics, game sense, and free play time",
    ],
    videoId: "GHCXa2LxTGs",
    creator: "Kevpert",
    section: "Control / Free Play",
  },
  {
    id: "pro-challenging",
    slug: "challenging",
    title: "How to Challenge as First Man",
    goals: [
      "Read when to challenge vs hold back as first man",
      "Apply pressure without leaving your team exposed",
    ],
    videoId: "ns7JAiLROhk",
    creator: "Kevpert",
    section: "Control / Free Play",
  },
  {
    id: "pro-1v1-decisions",
    slug: "1v1-analysis",
    title: "1v1 Replay Analysis",
    goals: [
      "Watch high-level 1v1 coaching to understand decision patterns",
      "Identify when to challenge, fake, or retreat",
    ],
    videoId: "K-v-b9v8FNs",
    creator: "Flakes",
    section: "Game Sense / Review",
  },
  {
    id: "pro-coaching-review",
    slug: "coaching-review",
    title: "Coaching Session Breakdown",
    goals: [
      "Learn from coached replay reviews at Diamond+ level",
      "Apply positioning and decision insights to your own play",
    ],
    videoId: "tO4GdpAXfWQ",
    creator: "Flakes",
    section: "Game Sense / Review",
  },
  {
    id: "pro-dead-plays",
    slug: "dead-plays",
    title: "Stop Chasing Dead Plays",
    goals: [
      "Recognize when a play is dead and rotate out",
      "Improve game awareness by reading play development",
    ],
    videoId: "RvuHJZMjrYU",
    creator: "SpookLuke",
    section: "Game Sense / Review",
  },
];

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────

export const TRAINING_PROGRAMS: Record<"free" | "starter" | "pro", TrainingProgram> = {
  free: {
    tier: "free",
    label: "Free",
    tagline: "Build your foundation. Master the basics before anything else.",
    blocks: FREE_BLOCKS,
  },
  starter: {
    tier: "starter",
    label: "Starter",
    tagline: "Structure your improvement. Every session has a purpose.",
    blocks: STARTER_BLOCKS,
  },
  pro: {
    tier: "pro",
    label: "Pro",
    tagline: "Train like you compete. Precision, speed, and game intelligence.",
    blocks: PRO_BLOCKS,
  },
};

export function getBlocksBySection(
  tier: "free" | "starter" | "pro"
): { section: SectionName; blocks: TrainingBlock[] }[] {
  const program = TRAINING_PROGRAMS[tier];
  return SECTION_ORDER.map((section) => ({
    section,
    blocks: program.blocks.filter((b) => b.section === section),
  })).filter((group) => group.blocks.length > 0);
}
