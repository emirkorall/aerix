export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type PlanTier = "free" | "starter" | "pro";

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export interface WeeklyPlanDay {
  focus: string;
  time: string;
  goals: string[];
}

const FREE_PLAN: WeeklyPlanDay[] = [
  {
    focus: "Car Control",
    time: "25 min",
    goals: [
      "Practice air roll and landing recovery",
      "Focus on smooth turning at speed",
    ],
  },
  {
    focus: "Ball Control",
    time: "20 min",
    goals: [
      "Dribble the ball on your car for extended periods",
      "Work on flicks from carry position",
    ],
  },
  {
    focus: "Shooting",
    time: "30 min",
    goals: [
      "Hit power shots from different angles",
      "Practice redirect shots off the wall",
    ],
  },
  {
    focus: "Defense & Saves",
    time: "25 min",
    goals: [
      "Shadow defend without overcommitting",
      "Practice backboard saves and clears",
    ],
  },
  {
    focus: "Recoveries",
    time: "20 min",
    goals: [
      "Land on all four wheels after every aerial",
      "Chain wave dashes into play",
    ],
  },
  {
    focus: "Free Play Discipline",
    time: "35 min",
    goals: [
      "Combine skills from the week in free play",
      "Stay intentional — pick a focus each 5 minutes",
    ],
  },
  {
    focus: "Review & Light Play",
    time: "20 min",
    goals: [
      "Replay one or two recent matches and note patterns",
      "Play casually and apply what you practiced",
    ],
  },
];

const STARTER_PLAN: WeeklyPlanDay[] = [
  {
    focus: "Car Control",
    time: "30 min",
    goals: [
      "Practice air roll and landing recovery",
      "Focus on smooth turning at speed",
      "Hold powerslide through tight turns without losing momentum",
    ],
  },
  {
    focus: "Ball Control",
    time: "25 min",
    goals: [
      "Dribble the ball on your car for extended periods",
      "Work on flicks from carry position",
      "Catch the ball from a bounce and regain carry",
    ],
  },
  {
    focus: "Shooting",
    time: "35 min",
    goals: [
      "Hit power shots from different angles",
      "Practice redirect shots off the wall",
      "Place shots low and into corners under light pressure",
    ],
  },
  {
    focus: "Defense & Saves",
    time: "30 min",
    goals: [
      "Shadow defend without overcommitting",
      "Practice backboard saves and clears",
      "Read opponent touches to position earlier",
    ],
  },
  {
    focus: "Recoveries",
    time: "25 min",
    goals: [
      "Land on all four wheels after every aerial",
      "Chain wave dashes into play",
      "Recover off walls and transition into a play",
    ],
  },
  {
    focus: "Free Play Discipline",
    time: "40 min",
    goals: [
      "Combine skills from the week in free play",
      "Stay intentional — pick a focus each 5 minutes",
      "Practice transitioning between offense and defense",
    ],
  },
  {
    focus: "Review & Light Play",
    time: "25 min",
    goals: [
      "Replay one or two recent matches and note patterns",
      "Play casually and apply what you practiced",
      "Identify one recurring mistake and write it down",
    ],
  },
];

const PRO_PLAN: WeeklyPlanDay[] = [
  {
    focus: "Car Control",
    time: "35 min",
    goals: [
      "Air roll recovery into immediate boost-efficient play",
      "Smooth turning at speed with directional air roll",
      "Maintain supersonic through complex obstacle courses",
    ],
  },
  {
    focus: "Ball Control",
    time: "30 min",
    goals: [
      "Extended carries with sudden direction changes",
      "Flick variations: 45-degree, musty, breezi setups",
      "Catch aerials and transition into controlled dribble",
    ],
  },
  {
    focus: "Shooting",
    time: "40 min",
    goals: [
      "Double-tap setups from backboard reads",
      "Power shots with placement under defensive pressure",
      "Fast aerial shots from midfield with accuracy",
    ],
  },
  {
    focus: "Defense & Saves",
    time: "35 min",
    goals: [
      "Shadow defense with controlled challenges",
      "Backboard reads into immediate counter-attacks",
      "Aerial saves with recovery into boost lane",
    ],
  },
  {
    focus: "Recoveries",
    time: "30 min",
    goals: [
      "Wall-to-air recovery with directional air roll",
      "Chain wave dashes into immediate offensive pressure",
      "Ceiling recovery into controlled play",
    ],
  },
  {
    focus: "Free Play Discipline",
    time: "45 min",
    goals: [
      "Combine advanced mechanics in realistic scenarios",
      "Simulate 1v1 pressure: speed, reads, and adaptations",
      "Push comfort zone on one mechanic you avoid",
    ],
  },
  {
    focus: "Review & Light Play",
    time: "30 min",
    goals: [
      "Replay analysis: decision-making in key moments",
      "Apply week's improvements in ranked play",
      "Track progress on your weakest mechanic",
    ],
  },
];

export const WEEKLY_PLANS: Record<PlanTier, WeeklyPlanDay[]> = {
  free: FREE_PLAN,
  starter: STARTER_PLAN,
  pro: PRO_PLAN,
};

/** Returns today's index into the weekly plan (0 = Monday, 6 = Sunday). */
export function getTodayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export function getTodayPlan(tier: PlanTier = "free"): WeeklyPlanDay {
  return WEEKLY_PLANS[tier][getTodayIndex()];
}

export function parsePlanTier(raw: string | null | undefined): PlanTier {
  if (raw === "starter" || raw === "pro") return raw;
  return "free";
}
