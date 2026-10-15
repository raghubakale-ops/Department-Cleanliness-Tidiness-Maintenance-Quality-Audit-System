export type RatingValue = '5' | '4' | '3' | '2' | '1' | 'NA';

export interface InspectionItem {
  id: number;
  text: string;
  categoryIndex: number;
  categoryTitle: string;
  isSafetyCritical: boolean;
}

export interface CorrectiveAction {
  id: string;
  deficiency: string;
  actionRequired: string;
  responsiblePerson: string;
  targetDate: string;
  completed: boolean;
}

export interface Signatory {
  name: string;
  signatureImage: string; // Base64 PNG data URI
  dateSigned?: string;
}

export interface Signatures {
  inspectingHod: Signatory;
  departmentHod: Signatory;
  principal: Signatory;
}

export interface InspectionRecord {
  ref: string;
  date: string;
  academicYear: string;
  inspectingHod: string;
  department: string;
  departmentHod: string;
  ratings: Record<number, RatingValue>;
  remarks: Record<number, string>;
  notes: [string, string, string]; // [Positive observations, Immediate attention, Suggestions]
  actions: CorrectiveAction[];
  signatures: Signatures;
  status: 'draft' | 'submitted';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoreCalculation {
  obtainedScore: number; // A
  maxPossibleScore: number; // B
  ratedCount: number; // k
  naCount: number; // na
  unratedCount: number; // u
  percentage: number | null;
  band: string;
  bandColor: string;
  isComplete: boolean;
}
