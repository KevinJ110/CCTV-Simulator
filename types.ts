
export enum IncidentType {
  THEFT = 'THEFT',
  TRESPASSING = 'TRESPASSING',
  VANDALISM = 'VANDALISM',
  SUSPICIOUS_PACKAGE = 'SUSPICIOUS_PACKAGE',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  NORMAL = 'NORMAL'
}

export enum SecurityAction {
  IGNORE = 'IGNORE',
  FLAG = 'FLAG',
  DISPATCH = 'DISPATCH',
  EVACUATE = 'EVACUATE'
}

export interface Scenario {
  id: string;
  location: string;
  description: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  correctAction: SecurityAction;
  explanation: string;
  imageUrl?: string;
}

export interface GameState {
  score: number;
  shiftTimeRemaining: number;
  activeScenario: Scenario | null;
  history: {
    scenarioId: string;
    action: SecurityAction;
    isCorrect: boolean;
    points: number;
  }[];
  isGameOver: boolean;
}
