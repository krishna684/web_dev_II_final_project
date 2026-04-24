export type ConnectionGoal =
  | 'romantic' | 'collaborator' | 'friend' | 'mentor'
  | 'travel' | 'co-founder' | 'deep-conversation' | 'creative-partner' | 'casual';

export interface PersonaOwner {
  _id: string;
  name: string;
}

export interface Persona {
  _id?: string;
  userId?: string | PersonaOwner;
  name: string;
  traits: string[];
  interests: string[];
  connectionGoal: ConnectionGoal;
  moodTag: string;
  bio: string;
  currentVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonaVersion {
  _id: string;
  personaId: string;
  versionNumber: number;
  snapshot: Persona;
  savedAt: string;
}
