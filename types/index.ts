export type GameState = "idle" | "waiting" | "red" | "result" | "tooEarly";

export type ReactionTimeEntry = {
  key: string;
  timeMs: number;
  date: Date;
};

export type ReactionTimeStats = {
  bestTime: number | null;
  averageTime: number | null;
  totalGames: number;
  top10: ReactionTimeEntry[];
  last20Attempts: number[];
};