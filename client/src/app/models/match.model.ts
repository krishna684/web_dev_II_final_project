import { Persona } from './persona.model';

export interface Match {
  _id: string;
  personaAId: string | Persona;
  personaBId: string | Persona;
  score: number;
  traitOverlap: number;
  interestSimilarity: number;
  goalAlignment: number;
  aiReport: string;
  matchedAt: string;
}
