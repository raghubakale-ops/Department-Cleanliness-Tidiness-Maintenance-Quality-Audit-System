import { InspectionItem, RatingValue, ScoreCalculation } from '../types';

export const CATEGORIES: [string, string[]][] = [
  [
    'A. Classrooms and Teaching Areas',
    [
      'Floors, walls, doors, windows and blackboards/whiteboards are clean.',
      'Desks, benches, chairs and teaching furniture are clean and properly arranged.',
      'Projectors, screens, smart boards and other teaching equipment are clean and properly maintained.',
      'Unwanted papers, notices, charts and materials are removed.',
      'Dustbins are available, clean and not overflowing.'
    ]
  ],
  [
    'B. Corridors and Common Areas',
    [
      'Corridors, staircases and entrances are clean and unobstructed.',
      'Display boards and notice boards are neat and updated.',
      'Electrical panels, fire safety equipment and emergency exits are accessible.',
      'Unwanted materials and scrap are not stored in common areas.'
    ]
  ],
  [
    'C. Faculty Cabins and HOD Cabin',
    [
      'Tables, chairs, cupboards and other furniture are clean and orderly.',
      'Documents and files are systematically arranged.',
      'Unwanted documents and obsolete records are identified and disposed of according to institutional record-retention rules.',
      'Electrical and electronic equipment are clean and properly arranged.',
      'Personal belongings and miscellaneous materials do not create clutter.'
    ]
  ],
  [
    'D. Laboratories, Workshops and Equipment',
    [
      'Floors, workbenches, laboratory tables and equipment are clean.',
      'Machines, instruments, tools and accessories are properly arranged.',
      'Equipment is stored safely and appropriately labelled.',
      'Non-functional or damaged equipment is clearly labelled “NOT WORKING / OUT OF ORDER”.',
      'Non-functional equipment is segregated in a designated area wherever feasible and safe.',
      'Unwanted scrap, obsolete materials and unused components are removed or stored in designated locations.',
      'Cables, electrical connections and moving machine parts are managed safely.',
      'Laboratory chemicals, if applicable, are labelled and stored appropriately.',
      'Laboratory safety instructions and personal protective equipment are available and orderly.'
    ]
  ],
  [
    'E. Washrooms and Hygiene',
    [
      'Washrooms are clean and free from unpleasant odour.',
      'Washbasins, taps, mirrors and sanitary fixtures are clean and functional.',
      'Water supply and handwashing facilities are available.',
      'Waste bins are clean and emptied regularly.',
      'Cleaning requirements or maintenance defects are reported promptly.'
    ]
  ],
  [
    'F. Electrical, Furniture and General Maintenance',
    [
      'Fans, lights, switches and other electrical fittings are clean and functional.',
      'Furniture and fixtures are in good condition.',
      'Leaks, damaged fittings, cracks and other maintenance issues are identified and reported.',
      'Unused furniture and equipment are stored systematically.',
      'Waste is segregated and disposed of appropriately.'
    ]
  ],
  [
    'G. Overall Departmental Housekeeping',
    [
      'The department maintains a clean, orderly and professional appearance.',
      'Departmental spaces are free from unnecessary clutter.',
      'Cleaning and maintenance responsibilities are clearly followed.',
      'The department demonstrates a proactive approach to cleanliness, safety and upkeep.'
    ]
  ]
];

// Safety-critical item IDs based on JCE institutional safety audit
export const SAFETY_CRITICAL_ITEMS: number[] = [8, 18, 21, 22, 23];

// Flattened list of all 37 parameters
export const INSPECTION_ITEMS: InspectionItem[] = (() => {
  const items: InspectionItem[] = [];
  CATEGORIES.forEach(([categoryTitle, paramList], categoryIndex) => {
    paramList.forEach(text => {
      const id = items.length + 1;
      items.push({
        id,
        text,
        categoryIndex,
        categoryTitle,
        isSafetyCritical: SAFETY_CRITICAL_ITEMS.includes(id)
      });
    });
  });
  return items;
})();

export const TOTAL_PARAMETERS = INSPECTION_ITEMS.length; // 37

export const DEPARTMENTS = [
  'Artificial Intelligence and Machine Learning (AIML)',
  'Computer Science and Engineering (CS)',
  'Civil Engineering (CV)',
  'Electronics and Communication Engineering (EC)',
  'Electrical and Electronics Engineering (EE)',
  'Mechanical Engineering (ME)',
  'Physics (PHY)',
  'Chemistry (CHE)',
  'Mathematics (MAT)',
  'Master of Business Administration (MBA)',
  'Master of Computer Applications (MCA)',
  'Civil Engineering – Postgraduate (CV PG)'
];

export const HOD_NAMES = [
  'Dr. Mithun B.M.',
  'Dr. Uttam Patil',
  'Prof. Vinayakumar R. Bagali',
  'Dr. Mallikarjuna G. D.',
  'Dr. B. V. Hubballi',
  'Dr. S. RohitRaj',
  'Dr. Praveen Banasode',
  'Dr. Shivkumar M. A.',
  'Dr. B. K. Manuprasad',
  'Dr. Prashant Patil'
];

export const RATING_OPTIONS: { value: RatingValue; label: string; score: number | null; description: string }[] = [
  { value: '5', label: '5 – Excellent', score: 5, description: 'Exemplary condition, flawless upkeep' },
  { value: '4', label: '4 – Very Good', score: 4, description: 'Minor non-systemic issues only' },
  { value: '3', label: '3 – Satisfactory', score: 3, description: 'Acceptable baseline, room for improvement' },
  { value: '2', label: '2 – Poor', score: 2, description: 'Notable deficiency requiring attention' },
  { value: '1', label: '1 – Very Poor', score: 1, description: 'Unacceptable, immediate correction needed' },
  { value: 'NA', label: 'N/A – Not Applicable', score: null, description: 'Area/equipment not present in department' }
];

export const PERFORMANCE_BANDS: { min: number; label: string; color: string; bg: string; badge: string }[] = [
  { min: 90, label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50', badge: 'border-emerald-500 text-emerald-800' },
  { min: 80, label: 'Very Good', color: 'text-blue-700', bg: 'bg-blue-50', badge: 'border-blue-500 text-blue-800' },
  { min: 65, label: 'Satisfactory', color: 'text-amber-700', bg: 'bg-amber-50', badge: 'border-amber-500 text-amber-800' },
  { min: 50, label: 'Needs Improvement', color: 'text-orange-700', bg: 'bg-orange-50', badge: 'border-orange-500 text-orange-800' },
  { min: 0, label: 'Unsatisfactory', color: 'text-rose-700', bg: 'bg-rose-50', badge: 'border-rose-500 text-rose-800' }
];

export function getPerformanceBand(pct: number | null) {
  if (pct === null) return { label: 'Score not available', color: 'text-slate-500', bg: 'bg-slate-100', badge: 'border-slate-300 text-slate-600' };
  const found = PERFORMANCE_BANDS.find(b => pct >= b.min);
  return found || PERFORMANCE_BANDS[PERFORMANCE_BANDS.length - 1];
}

export function calculateScore(ratings: Record<number, RatingValue>): ScoreCalculation {
  let obtainedScore = 0;
  let ratedCount = 0;
  let naCount = 0;

  INSPECTION_ITEMS.forEach(item => {
    const val = ratings[item.id];
    if (val === 'NA') {
      naCount++;
    } else if (val && ['1', '2', '3', '4', '5'].includes(val)) {
      obtainedScore += parseInt(val, 10);
      ratedCount++;
    }
  });

  const unratedCount = TOTAL_PARAMETERS - ratedCount - naCount;
  const maxPossibleScore = ratedCount * 5;
  const percentage = ratedCount > 0 ? (obtainedScore / maxPossibleScore) * 100 : null;
  const bandInfo = getPerformanceBand(percentage);

  return {
    obtainedScore,
    maxPossibleScore,
    ratedCount,
    naCount,
    unratedCount,
    percentage,
    band: bandInfo.label,
    bandColor: bandInfo.color,
    isComplete: unratedCount === 0
  };
}

export function computeAcademicYear(dateStr: string): string {
  if (!dateStr) return '';
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(5, 7), 10);
  const f = (x: number) => String(x % 100).padStart(2, '0');
  return m >= 6 ? `${y}–${f(y + 1)}` : `${y - 1}–${f(y)}`;
}

export function getTodayDateString(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function generateReferenceNumber(dateStr: string): string {
  const dateFormatted = dateStr.replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JCE-${dateFormatted}-${rand}`;
}
