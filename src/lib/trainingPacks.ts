import type { SectionName } from "./trainingPrograms";

export interface PackDrill {
  id: string;
  slug: string;
  title: string;
  goals: string[];
  videoId: string;
  creator: string;
  section: SectionName;
  tags: string[];
}

export interface TrainingPack {
  id: string;
  title: string;
  description: string;
  levelTag: string;
  planAccess: "free" | "starter" | "pro";
  drills: PackDrill[];
}

export const TRAINING_PACKS: TrainingPack[] = [
  {
    id: "pack-champion-consistency",
    title: "Champion Consistency",
    description:
      "A mixed pack for players pushing into Champion. Covers the key skills you need to do reliably every game.",
    levelTag: "Diamond–Champion",
    planAccess: "starter",
    drills: [
      {
        id: "pk-cc-fast-aerials",
        slug: "pk-cc-fast-aerials",
        title: "Fast Aerial Confidence",
        goals: [
          "Hit fast aerials consistently from different angles",
          "Get to the ball before opponents at any height",
        ],
        videoId: "lkBZg0Ldhls",
        creator: "Thanovic",
        section: "Mechanics",
        tags: ["Aerials", "Speed"],
      },
      {
        id: "pk-cc-power-shots",
        slug: "pk-cc-power-shots",
        title: "Power Shot Accuracy",
        goals: [
          "Place power shots on target from awkward positions",
          "Develop faster shot selection under pressure",
        ],
        videoId: "PjFRaWb0zSo",
        creator: "Wayton Pilkin",
        section: "Mechanics",
        tags: ["Shooting", "Accuracy"],
      },
      {
        id: "pk-cc-shadow-defense",
        slug: "pk-cc-shadow-defense",
        title: "Shadow Defense Fundamentals",
        goals: [
          "Shadow opponents without overcommitting",
          "Buy time for teammates to rotate back",
        ],
        videoId: "2aZA-NCRRgI",
        creator: "Thanovic",
        section: "Game Sense / Review",
        tags: ["Defense", "Positioning"],
      },
      {
        id: "pk-cc-recovery",
        slug: "pk-cc-recovery",
        title: "Recovery After Every Touch",
        goals: [
          "Land on all four wheels after aerials and wall play",
          "Maintain boost efficiency through clean recoveries",
        ],
        videoId: "dywBOyFN5LY",
        creator: "Virge",
        section: "Control / Free Play",
        tags: ["Recoveries", "Speed"],
      },
      {
        id: "pk-cc-rotation-reads",
        slug: "pk-cc-rotation-reads",
        title: "Rotation & Game Reads",
        goals: [
          "Read the play earlier to position yourself better",
          "Rotate efficiently without cutting teammates",
        ],
        videoId: "THcMLWOEc_o",
        creator: "SunlessKhan",
        section: "Game Sense / Review",
        tags: ["Rotation", "Game Sense"],
      },
    ],
  },
  {
    id: "pack-fast-aerials",
    title: "Fast Aerials",
    description:
      "Master the double-jump fast aerial. From basic timing to advanced adjustments, this pack builds your aerial speed from the ground up.",
    levelTag: "Gold–Diamond",
    planAccess: "starter",
    drills: [
      {
        id: "pk-fa-basics",
        slug: "pk-fa-basics",
        title: "Fast Aerial Basics",
        goals: [
          "Understand the double-jump fast aerial input sequence",
          "Hit consistent fast aerials from standing position",
        ],
        videoId: "lkBZg0Ldhls",
        creator: "Thanovic",
        section: "Mechanics",
        tags: ["Aerials", "Fundamentals"],
      },
      {
        id: "pk-fa-training-pack",
        slug: "pk-fa-training-pack",
        title: "Aerial Training Pack Drills",
        goals: [
          "Practice fast aerials in game-like scenarios",
          "Build muscle memory with structured repetition",
        ],
        videoId: "ed8B12t1RHg",
        creator: "Wayton Pilkin",
        section: "Mechanics",
        tags: ["Aerials", "Training Packs"],
      },
      {
        id: "pk-fa-reads",
        slug: "pk-fa-reads",
        title: "Reading Aerial Balls",
        goals: [
          "Judge ball trajectory to decide when to go up",
          "Position under the ball for a clean fast aerial",
        ],
        videoId: "LFr8GtG7kBU",
        creator: "Virge",
        section: "Game Sense / Review",
        tags: ["Aerials", "Game Sense"],
      },
      {
        id: "pk-fa-redirects",
        slug: "pk-fa-redirects",
        title: "Aerial Redirects & Touches",
        goals: [
          "Redirect the ball on target while in the air",
          "Use nose vs body to control aerial angle",
        ],
        videoId: "6Cy7UoKJRzA",
        creator: "Thanovic",
        section: "Mechanics",
        tags: ["Aerials", "Advanced"],
      },
    ],
  },
  {
    id: "pack-recoveries-speed",
    title: "Recoveries & Speed",
    description:
      "Speed isn't just about boosting. This pack teaches fast recoveries, wave dashes, and movement efficiency to keep you in the play.",
    levelTag: "Platinum–Champion",
    planAccess: "pro",
    drills: [
      {
        id: "pk-rs-wavedash",
        slug: "pk-rs-wavedash",
        title: "Wave Dash Fundamentals",
        goals: [
          "Execute wave dashes from walls and ground",
          "Use wave dashes to maintain speed without boost",
        ],
        videoId: "PjFRaWb0zSo",
        creator: "Wayton Pilkin",
        section: "Mechanics",
        tags: ["Movement", "Speed"],
      },
      {
        id: "pk-rs-landing",
        slug: "pk-rs-landing",
        title: "Clean Landings",
        goals: [
          "Always land on all four wheels after any aerial",
          "Point car toward play direction on landing",
        ],
        videoId: "dywBOyFN5LY",
        creator: "Virge",
        section: "Control / Free Play",
        tags: ["Recoveries", "Fundamentals"],
      },
      {
        id: "pk-rs-half-flip",
        slug: "pk-rs-half-flip",
        title: "Half Flip Mastery",
        goals: [
          "Execute half flips reliably in live games",
          "Use half flips to recover faster going backward",
        ],
        videoId: "V_4ajUfCVq4",
        creator: "SunlessKhan",
        section: "Mechanics",
        tags: ["Movement", "Speed"],
      },
      {
        id: "pk-rs-boost-pathing",
        slug: "pk-rs-boost-pathing",
        title: "Boost Pathing & Pads",
        goals: [
          "Pick up small pads while rotating to stay fueled",
          "Avoid going out of the play for full boost",
        ],
        videoId: "THcMLWOEc_o",
        creator: "SunlessKhan",
        section: "Game Sense / Review",
        tags: ["Boost", "Positioning"],
      },
    ],
  },
  {
    id: "pack-first-touch",
    title: "First Touch & Ball Control",
    description:
      "A slow, deliberate pack about controlling the ball. Covers ground dribbles, first touches, and car-ball coordination.",
    levelTag: "Silver–Platinum",
    planAccess: "pro",
    drills: [
      {
        id: "pk-ft-ground-dribble",
        slug: "pk-ft-ground-dribble",
        title: "Ground Dribbling Basics",
        goals: [
          "Balance the ball on your car for extended periods",
          "Control speed while carrying the ball",
        ],
        videoId: "eBmgRPOmUGo",
        creator: "Wayton Pilkin",
        section: "Control / Free Play",
        tags: ["Dribbling", "Control"],
      },
      {
        id: "pk-ft-first-touch",
        slug: "pk-ft-first-touch",
        title: "Soft First Touches",
        goals: [
          "Kill ball momentum with a controlled first touch",
          "Set up your next move with a better first touch",
        ],
        videoId: "PjFRaWb0zSo",
        creator: "Wayton Pilkin",
        section: "Control / Free Play",
        tags: ["Control", "Fundamentals"],
      },
      {
        id: "pk-ft-flicks",
        slug: "pk-ft-flicks",
        title: "Flick Basics",
        goals: [
          "Execute front flicks and diagonal flicks",
          "Time your jump and flip to maximize flick power",
        ],
        videoId: "6Cy7UoKJRzA",
        creator: "Thanovic",
        section: "Mechanics",
        tags: ["Dribbling", "Advanced"],
      },
      {
        id: "pk-ft-catch",
        slug: "pk-ft-catch",
        title: "Ball Catching & Receiving",
        goals: [
          "Catch bouncing balls by matching speed and angle",
          "Transition from receiving to a dribble or shot",
        ],
        videoId: "ed8B12t1RHg",
        creator: "Wayton Pilkin",
        section: "Control / Free Play",
        tags: ["Control", "Game Sense"],
      },
    ],
  },
  {
    id: "pack-rotation-defense",
    title: "Rotation & Defense Review",
    description:
      "Stop conceding easy goals. This pack covers proper rotation, defensive positioning, and when to challenge vs retreat.",
    levelTag: "Gold–Diamond",
    planAccess: "pro",
    drills: [
      {
        id: "pk-rd-rotation-basics",
        slug: "pk-rd-rotation-basics",
        title: "Rotation Fundamentals",
        goals: [
          "Understand back-post rotation in 2s and 3s",
          "Know when to rotate out vs stay on attack",
        ],
        videoId: "THcMLWOEc_o",
        creator: "SunlessKhan",
        section: "Game Sense / Review",
        tags: ["Rotation", "Fundamentals"],
      },
      {
        id: "pk-rd-shadow",
        slug: "pk-rd-shadow",
        title: "Shadow Defense Deep Dive",
        goals: [
          "Shadow from the correct angle and distance",
          "Force opponents into bad touches",
        ],
        videoId: "2aZA-NCRRgI",
        creator: "Thanovic",
        section: "Game Sense / Review",
        tags: ["Defense", "Positioning"],
      },
      {
        id: "pk-rd-challenge",
        slug: "pk-rd-challenge",
        title: "When to Challenge",
        goals: [
          "Identify the right moment to commit to a challenge",
          "Avoid 50/50s you can't win",
        ],
        videoId: "LFr8GtG7kBU",
        creator: "Virge",
        section: "Game Sense / Review",
        tags: ["Defense", "Decision Making"],
      },
      {
        id: "pk-rd-save-clear",
        slug: "pk-rd-save-clear",
        title: "Saves & Clears",
        goals: [
          "Clear the ball to safe zones, not back to danger",
          "Position on the post for consistent saves",
        ],
        videoId: "V_4ajUfCVq4",
        creator: "SunlessKhan",
        section: "Mechanics",
        tags: ["Defense", "Clears"],
      },
    ],
  },
];

export function getPackById(id: string): TrainingPack | undefined {
  return TRAINING_PACKS.find((p) => p.id === id);
}

/** Can the user access this pack's full content? */
export function canAccessPack(
  pack: TrainingPack,
  userPlan: "free" | "starter" | "pro"
): boolean {
  if (userPlan === "pro") return true;
  if (userPlan === "starter" && pack.planAccess !== "pro") return true;
  return false;
}
