import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  InspectionRecord,
  RatingValue,
  CorrectiveAction,
  Signatures
} from './types';
import {
  CATEGORIES,
  INSPECTION_ITEMS,
  TOTAL_PARAMETERS,
  SAFETY_CRITICAL_ITEMS,
  DEPARTMENTS,
  HOD_NAMES,
  RATING_OPTIONS,
  calculateScore,
  computeAcademicYear,
  getTodayDateString,
  generateReferenceNumber
} from './data/inspectionData';
import { COLOR_THEMES, CATEGORY_COLORS, getThemeById } from './theme';
import { ScoreGauge } from './components/ScoreGauge';
import { SignaturePad } from './components/SignaturePad';
import { ReportView } from './components/ReportView';
import { HistoryView } from './components/HistoryView';
import {
  ClipboardCheck,
  History,
  FileText,
  Save,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowUp,
  Wand2,
  Calendar,
  Building,
  User,
  ShieldAlert,
  Info,
  Check,
  RotateCcw,
  Palette
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'jce_inspection_draft';
const RECORDS_STORAGE_KEY = 'jce_inspection_records';
const THEME_STORAGE_KEY = 'jce_theme_id';

const createBlankSignatures = (): Signatures => ({
  inspectingHod: { name: '', signatureImage: '' },
  departmentHod: { name: '', signatureImage: '' },
  principal: { name: '', signatureImage: '' }
});

const createBlankRecord = (): InspectionRecord => {
  const today = getTodayDateString();
  return {
    ref: '',
    date: today,
    academicYear: computeAcademicYear(today),
    inspectingHod: '',
    department: '',
    departmentHod: '',
    ratings: {},
    remarks: {},
    notes: ['', '', ''],
    actions: [
      {
        id: '1',
        deficiency: '',
        actionRequired: '',
        responsiblePerson: '',
        targetDate: '',
        completed: false
      }
    ],
    signatures: createBlankSignatures(),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'report'>('form');
  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'navy-gold';
    } catch {
      return 'navy-gold';
    }
  });

  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const [savedRecords, setSavedRecords] = useState<InspectionRecord[]>(() => {
    try {
      const data = localStorage.getItem(RECORDS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [draft, setDraft] = useState<InspectionRecord>(() => {
    try {
      const data = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...createBlankRecord(), ...parsed };
      }
    } catch {
      // fallback
    }
    return createBlankRecord();
  });

  const [viewingRecord, setViewingRecord] = useState<InspectionRecord | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({
    0: true, // open Category A initially
    1: true
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    } catch {}
  }, [themeId]);

  // Sync draft to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage quota
    }
  }, [draft]);

  // Sync records to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(savedRecords));
    } catch {
      // Ignore
    }
  }, [savedRecords]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentScore = useMemo(() => calculateScore(draft.ratings), [draft.ratings]);

  // Category completion counts
  const categoryProgress = useMemo(() => {
    return CATEGORIES.map((_, catIdx) => {
      const itemsInCat = INSPECTION_ITEMS.filter(i => i.categoryIndex === catIdx);
      const answeredInCat = itemsInCat.filter(i => draft.ratings[i.id]).length;
      return {
        total: itemsInCat.length,
        answered: answeredInCat,
        isComplete: answeredInCat === itemsInCat.length
      };
    });
  }, [draft.ratings]);

  // Update specific draft field
  const updateDraft = <K extends keyof InspectionRecord>(key: K, value: InspectionRecord[K]) => {
    setDraft(prev => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  // Update Date & recompute AY
  const handleDateChange = (newDate: string) => {
    setDraft(prev => ({
      ...prev,
      date: newDate,
      academicYear: computeAcademicYear(newDate),
      updatedAt: new Date().toISOString()
    }));
  };

  // Update single rating
  const handleRatingChange = (itemId: number, rating: RatingValue) => {
    setDraft(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [itemId]: rating
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Update single remark
  const handleRemarkChange = (itemId: number, remark: string) => {
    setDraft(prev => ({
      ...prev,
      remarks: {
        ...prev.remarks,
        [itemId]: remark
      },
      updatedAt: new Date().toISOString()
    }));
  };

  // Update notes
  const handleNoteChange = (index: number, text: string) => {
    setDraft(prev => {
      const nextNotes: [string, string, string] = [...prev.notes];
      nextNotes[index] = text;
      return {
        ...prev,
        notes: nextNotes,
        updatedAt: new Date().toISOString()
      };
    });
  };

  // Jump to specific item ID
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const jumpToItem = (itemId: number) => {
    const item = INSPECTION_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    // ensure category is expanded
    setOpenCategories(prev => ({ ...prev, [item.categoryIndex]: true }));

    setTimeout(() => {
      const el = itemRefs.current[itemId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2');
        el.style.setProperty('--tw-ring-color', theme.primary);
        setTimeout(() => el.classList.remove('ring-2'), 1500);
      }
    }, 150);
  };

  // Jump to first unanswered item
  const jumpToFirstUnrated = () => {
    const firstUnrated = INSPECTION_ITEMS.find(i => !draft.ratings[i.id]);
    if (firstUnrated) {
      jumpToItem(firstUnrated.id);
    }
  };

  // Mark all remaining unrated as N/A
  const handleMarkRemainingNA = () => {
    const unrated = INSPECTION_ITEMS.filter(i => !draft.ratings[i.id]);
    if (unrated.length === 0) {
      alert('All 37 parameters are already evaluated or marked N/A.');
      return;
    }
    if (
      confirm(
        `Mark the remaining ${unrated.length} unrated parameter(s) as "N/A - Not Applicable"? Only do this if they genuinely do not apply to ${draft.department || 'this department'}.`
      )
    ) {
      setDraft(prev => {
        const nextRatings = { ...prev.ratings };
        unrated.forEach(item => {
          nextRatings[item.id] = 'NA';
        });
        return {
          ...prev,
          ratings: nextRatings,
          updatedAt: new Date().toISOString()
        };
      });
      showToast(`Marked ${unrated.length} item(s) as N/A`);
    }
  };

  // Clear form
  const handleClearForm = () => {
    if (confirm('Clear the entire inspection form? All unsubmitted changes will be lost.')) {
      const fresh = createBlankRecord();
      setDraft(fresh);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Form cleared');
    }
  };

  // Action plan managers
  const handleAddAction = () => {
    setDraft(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          id: String(Date.now()),
          deficiency: '',
          actionRequired: '',
          responsiblePerson: '',
          targetDate: '',
          completed: false
        }
      ],
      updatedAt: new Date().toISOString()
    }));
  };

  const handleUpdateAction = (index: number, field: keyof CorrectiveAction, val: any) => {
    setDraft(prev => {
      const nextActions = [...prev.actions];
      nextActions[index] = { ...nextActions[index], [field]: val };
      return {
        ...prev,
        actions: nextActions,
        updatedAt: new Date().toISOString()
      };
    });
  };

  const handleDeleteAction = (index: number) => {
    setDraft(prev => {
      const nextActions = prev.actions.filter((_, idx) => idx !== index);
      return {
        ...prev,
        actions: nextActions.length > 0 ? nextActions : [createBlankRecord().actions[0]],
        updatedAt: new Date().toISOString()
      };
    });
  };

  // Auto-generate actions from low rated items (1 or 2)
  const handleGenerateActionsFromLow = () => {
    const lowItems = INSPECTION_ITEMS.filter(
      i => draft.ratings[i.id] === '1' || draft.ratings[i.id] === '2'
    );
    if (lowItems.length === 0) {
      alert('No parameters are currently rated Poor (2) or Very Poor (1).');
      return;
    }

    let addedCount = 0;
    setDraft(prev => {
      const nextActions = [...prev.actions];
      lowItems.forEach(item => {
        const prefix = `Parameter ${item.id}: ${item.text}`;
        const existing = nextActions.some(a => a.deficiency.includes(`Parameter ${item.id}:`));
        if (!existing) {
          const remarkPart = prev.remarks[item.id] ? ` — Observed: ${prev.remarks[item.id]}` : '';
          const emptySlotIndex = nextActions.findIndex(
            a => !a.deficiency.trim() && !a.actionRequired.trim()
          );

          const newAction: CorrectiveAction = {
            id: String(Date.now() + Math.random()),
            deficiency: `${prefix}${remarkPart}`,
            actionRequired: '',
            responsiblePerson: prev.departmentHod || 'HOD / Lab In-charge',
            targetDate: '',
            completed: false
          };

          if (emptySlotIndex >= 0) {
            nextActions[emptySlotIndex] = newAction;
          } else {
            nextActions.push(newAction);
          }
          addedCount++;
        }
      });
      return {
        ...prev,
        actions: nextActions,
        updatedAt: new Date().toISOString()
      };
    });

    if (addedCount > 0) {
      showToast(`Added ${addedCount} corrective action item(s) from low ratings`);
    } else {
      alert('All low-rated parameters are already included in the corrective action plan.');
    }
  };

  // Submit inspection
  const handleSubmitInspection = () => {
    if (!draft.date) {
      alert('Please specify the inspection date.');
      return;
    }
    if (!draft.inspectingHod.trim()) {
      alert('Please specify the inspecting HOD name.');
      return;
    }
    if (!draft.department.trim()) {
      alert('Please select or specify the inspected department.');
      return;
    }

    if (currentScore.unratedCount > 0) {
      alert(
        `Inspection Incomplete: ${currentScore.unratedCount} parameter(s) remain unrated. Please provide a rating (1 to 5) or mark N/A for each parameter before official submission.`
      );
      jumpToFirstUnrated();
      return;
    }

    const lowRatedCount = INSPECTION_ITEMS.filter(
      i => draft.ratings[i.id] === '1' || draft.ratings[i.id] === '2'
    ).length;

    const signaturesPending = [
      draft.signatures.inspectingHod.signatureImage,
      draft.signatures.departmentHod.signatureImage,
      draft.signatures.principal.signatureImage
    ].filter(img => !img).length;

    const confirmMsg =
      `Submit formal inspection report for ${draft.department}?\n\n` +
      `• Final Score: ${currentScore.percentage?.toFixed(2)}% (${currentScore.band})\n` +
      `• Deficiencies Rated Poor/Very Poor: ${lowRatedCount}\n` +
      `• Digital Signatures Pending: ${signaturesPending}\n\n` +
      `Once submitted, the record is archived in Institutional History and can be printed or exported.`;

    if (!confirm(confirmMsg)) return;

    const recordRef = draft.ref || generateReferenceNumber(draft.date);
    const submittedRecord: InspectionRecord = {
      ...draft,
      ref: recordRef,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to records
    setSavedRecords(prev => {
      const filtered = prev.filter(r => r.ref !== recordRef);
      return [submittedRecord, ...filtered];
    });

    // Clear active draft
    setDraft(createBlankRecord());
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}

    setViewingRecord(submittedRecord);
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Inspection submitted successfully! Reference: ${recordRef}`);
  };

  // History action handlers
  const handleViewReport = (record: InspectionRecord) => {
    setViewingRecord(record);
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditRecord = (record: InspectionRecord) => {
    if (
      confirm(
        `Load inspection "${record.ref}" for ${record.department} into the active form? Any unsaved current draft will be replaced.`
      )
    ) {
      setDraft({ ...record });
      setActiveTab('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Loaded ${record.ref} for editing`);
    }
  };

  const handleDeleteRecord = (ref: string) => {
    setSavedRecords(prev => prev.filter(r => r.ref !== ref));
    showToast(`Deleted inspection record ${ref}`);
  };

  const handleImportRecords = (newRecords: InspectionRecord[]) => {
    setSavedRecords(prev => {
      const existingRefs = new Set(prev.map(r => r.ref));
      const incoming = newRecords.filter(r => !existingRefs.has(r.ref));
      return [...incoming, ...prev];
    });
  };

  // Export CSV
  const handleExportCsv = (recordsToExport: InspectionRecord[] = savedRecords) => {
    if (recordsToExport.length === 0) {
      alert('No saved records to export.');
      return;
    }

    const headers = [
      'Reference',
      'Date',
      'Academic Year',
      'Inspecting HOD',
      'Department',
      'Inspected Dept HOD',
      'Score Obtained (A)',
      'Max Possible (B)',
      'Percentage (%)',
      'Performance Band',
      'Pending Action Items',
      ...INSPECTION_ITEMS.map(i => `P${i.id}: ${i.text.slice(0, 30)}...`)
    ];

    const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = recordsToExport.map(r => {
      const sc = calculateScore(r.ratings);
      const pendingCount = (r.actions || []).filter(
        a => (a.deficiency || a.actionRequired) && !a.completed
      ).length;

      return [
        r.ref,
        r.date,
        r.academicYear || computeAcademicYear(r.date),
        r.inspectingHod,
        r.department,
        r.departmentHod,
        sc.obtainedScore,
        sc.maxPossibleScore,
        sc.percentage !== null ? sc.percentage.toFixed(2) : '',
        sc.band,
        pendingCount,
        ...INSPECTION_ITEMS.map(i => r.ratings[i.id] || '')
      ].map(escapeCsv).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JCE-Inspections-Export-${getTodayDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported CSV file');
  };

  // Export JSON
  const handleExportJson = (recordsToExport: InspectionRecord[] = savedRecords) => {
    const dataStr = JSON.stringify(recordsToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JCE-Inspections-Backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON backup file');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between pb-24 print:p-0 print:bg-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{ backgroundColor: theme.primary }}
          className="fixed top-4 right-4 z-50 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-fade-in no-print"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Institutional Top Header */}
      <header
        style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.borderAccent }}
        className="no-print text-white shadow-md border-b-4"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold opacity-90 text-amber-300">
              Jain Group of Institutions (JGI)
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase">
              Jain College of Engineering, Belagavi
            </h1>
            <p className="text-xs text-slate-200 font-medium tracking-wide hidden sm:block">
              Department Cleanliness, Tidiness &amp; Maintenance Quality Audit System
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Color Theme Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemePicker(prev => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                title="Change theme color"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm shrink-0"
                  style={{ backgroundColor: theme.previewColor }}
                />
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{theme.name}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showThemePicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Color Palette
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                    {COLOR_THEMES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setThemeId(t.id);
                          setShowThemePicker(false);
                          showToast(`Theme changed to ${t.name}`);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          themeId === t.id
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-sm shrink-0"
                            style={{ backgroundColor: t.previewColor }}
                          />
                          <span>{t.name}</span>
                        </div>
                        {themeId === t.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-black/20 p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'form'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Form</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
                {savedRecords.length > 0 && (
                  <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full font-extrabold">
                    {savedRecords.length}
                  </span>
                )}
              </button>

              {viewingRecord && (
                <button
                  type="button"
                  onClick={() => setActiveTab('report')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'report'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1">
        {/* VIEW 1: INSPECTION FORM */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            {/* Auto-save & Local Storage notice */}
            <div
              className="bg-white border-l-4 rounded-r-xl p-3.5 shadow-sm text-xs text-slate-600 flex items-center justify-between gap-3"
              style={{ borderColor: theme.primary }}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" style={{ color: theme.primary }} />
                <span>
                  Draft is saved automatically in this device’s local browser storage. Use{' '}
                  <b>Export JSON</b> in History to backup or transfer inspection records across devices.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                Auto-Saved
              </span>
            </div>

            {/* Audit Details Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                <Building className="w-5 h-5" style={{ color: theme.primary }} />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Inspection Identification &amp; Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Inspection Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Inspection <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    AY: {draft.academicYear || computeAcademicYear(draft.date)}
                  </span>
                </div>

                {/* Inspecting HOD */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Name of Inspecting HOD <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={
                      HOD_NAMES.includes(draft.inspectingHod)
                        ? draft.inspectingHod
                        : draft.inspectingHod
                        ? '__CUSTOM__'
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CUSTOM__') {
                        updateDraft('inspectingHod', ' ');
                      } else {
                        updateDraft('inspectingHod', val);
                        setDraft(p => ({
                          ...p,
                          signatures: {
                            ...p.signatures,
                            inspectingHod: { ...p.signatures.inspectingHod, name: val }
                          }
                        }));
                      }
                    }}
                    className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  >
                    <option value="">Select Inspecting HOD...</option>
                    {HOD_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="__CUSTOM__">Other (Enter custom name)...</option>
                  </select>

                  {(!HOD_NAMES.includes(draft.inspectingHod) && draft.inspectingHod !== '') && (
                    <input
                      type="text"
                      autoFocus
                      value={draft.inspectingHod.trim() === '' ? '' : draft.inspectingHod}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft('inspectingHod', val);
                        setDraft(p => ({
                          ...p,
                          signatures: {
                            ...p.signatures,
                            inspectingHod: { ...p.signatures.inspectingHod, name: val }
                          }
                        }));
                      }}
                      placeholder="Type custom HOD name..."
                      className="mt-2 w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2"
                    />
                  )}
                  <span className="text-[11px] text-slate-400 mt-1 block">Conducting official</span>
                </div>

                {/* Department Inspected */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department Inspected <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={draft.department}
                    onChange={(e) => updateDraft('department', e.target.value)}
                    className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">Target engineering dept</span>
                </div>

                {/* HOD of Inspected Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    HOD of Inspected Department
                  </label>
                  <select
                    value={
                      HOD_NAMES.includes(draft.departmentHod)
                        ? draft.departmentHod
                        : draft.departmentHod
                        ? '__CUSTOM__'
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CUSTOM__') {
                        updateDraft('departmentHod', ' ');
                      } else {
                        updateDraft('departmentHod', val);
                        setDraft(p => ({
                          ...p,
                          signatures: {
                            ...p.signatures,
                            departmentHod: { ...p.signatures.departmentHod, name: val }
                          }
                        }));
                      }
                    }}
                    className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  >
                    <option value="">Select Department HOD...</option>
                    {HOD_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="__CUSTOM__">Other (Enter custom name)...</option>
                  </select>

                  {(!HOD_NAMES.includes(draft.departmentHod) && draft.departmentHod !== '') && (
                    <input
                      type="text"
                      autoFocus
                      value={draft.departmentHod.trim() === '' ? '' : draft.departmentHod}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft('departmentHod', val);
                        setDraft(p => ({
                          ...p,
                          signatures: {
                            ...p.signatures,
                            departmentHod: { ...p.signatures.departmentHod, name: val }
                          }
                        }));
                      }}
                      placeholder="Type custom HOD name..."
                      className="mt-2 w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2"
                    />
                  )}
                  <span className="text-[11px] text-slate-400 mt-1 block">Head of inspected dept</span>
                </div>
              </div>
            </div>

            {/* Score Summary & Evaluation Gauge */}
            <ScoreGauge score={currentScore} theme={theme} onJumpToFirstUnrated={jumpToFirstUnrated} />

            {/* Quick Category Jump Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map(([title], idx) => {
                const prog = categoryProgress[idx];
                const catCode = title.split('.')[0];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setOpenCategories(prev => ({ ...prev, [idx]: true }));
                      const firstInCat = INSPECTION_ITEMS.find(i => i.categoryIndex === idx);
                      if (firstInCat) jumpToItem(firstInCat.id);
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                      prog.isComplete
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{catCode}</span>
                    <span className="text-[10px] opacity-75 font-normal">
                      ({prog.answered}/{prog.total})
                    </span>
                    {prog.isComplete && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {/* All 7 Checklist Categories Accordions with individual category accent borders */}
            <div className="space-y-4">
              {CATEGORIES.map(([categoryTitle], catIndex) => {
                const catItems = INSPECTION_ITEMS.filter(item => item.categoryIndex === catIndex);
                const isOpen = openCategories[catIndex] ?? false;
                const prog = categoryProgress[catIndex];
                const catAccent = CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length];

                return (
                  <div
                    key={catIndex}
                    className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden border-l-4 ${catAccent.border}`}
                  >
                    {/* Category Accordion Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setOpenCategories(prev => ({ ...prev, [catIndex]: !prev[catIndex] }))
                      }
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50 hover:bg-slate-100/80 transition-colors border-b border-slate-200/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`font-extrabold text-sm sm:text-base ${catAccent.text}`}>
                          {categoryTitle}
                        </span>
                        {prog.isComplete ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" /> Complete
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {prog.answered} of {prog.total} evaluated
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                          {isOpen ? 'Collapse' : 'Expand'}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* Parameter Items */}
                    {isOpen && (
                      <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-4">
                        {catItems.map((item) => {
                          const currentRating = draft.ratings[item.id] || '';
                          const currentRemark = draft.remarks[item.id] || '';
                          const isLow = currentRating === '1' || currentRating === '2';
                          const isSafetyPoor = isLow && item.isSafetyCritical;

                          return (
                            <div
                              key={item.id}
                              ref={el => {
                                itemRefs.current[item.id] = el;
                              }}
                              id={`item-${item.id}`}
                              className={`pt-4 first:pt-0 rounded-xl transition-all ${
                                isSafetyPoor
                                  ? 'bg-rose-50/70 p-4 border-2 border-rose-400 mt-2'
                                  : isLow
                                  ? 'bg-amber-50/60 p-4 border border-amber-300 mt-2'
                                  : ''
                              }`}
                            >
                              {/* Item Text & Critical badge */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className="font-black text-sm shrink-0 mt-0.5"
                                    style={{ color: theme.primary }}
                                  >
                                    {item.id}.
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                                      {item.text}
                                    </p>
                                    {item.isSafetyCritical && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded mt-1">
                                        <ShieldAlert className="w-3 h-3 text-rose-700" />
                                        Safety-Critical Institutional Parameter
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Rating Selector */}
                                <div className="sm:w-64 shrink-0">
                                  <select
                                    value={currentRating}
                                    onChange={(e) =>
                                      handleRatingChange(item.id, e.target.value as RatingValue)
                                    }
                                    className={`w-full text-xs font-semibold rounded-xl p-2.5 border transition-all ${
                                      currentRating === '5'
                                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                                        : currentRating === '4'
                                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                                        : currentRating === '3'
                                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                                        : isLow
                                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                                        : currentRating === 'NA'
                                        ? 'bg-slate-100 border-slate-300 text-slate-600'
                                        : 'bg-white border-slate-300 text-slate-500'
                                    }`}
                                  >
                                    <option value="">Select rating score...</option>
                                    {RATING_OPTIONS.map(opt => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Remarks Input */}
                              <div className="mt-2">
                                <textarea
                                  rows={1}
                                  placeholder={
                                    isLow
                                      ? 'Mandatory: Explain the deficiency identified and location...'
                                      : 'Observations / Remarks (optional)'
                                  }
                                  value={currentRemark}
                                  onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                                  className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 ${
                                    isLow && !currentRemark.trim()
                                      ? 'border-amber-400 bg-white placeholder:text-amber-700/70 focus:ring-amber-500'
                                      : 'border-slate-300 bg-slate-50/60 focus:bg-white'
                                  }`}
                                />
                              </div>

                              {/* Warnings & Next/Previous mini navigation */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 text-xs">
                                <div>
                                  {isSafetyPoor ? (
                                    <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      Safety-critical item rated poor — flagged for immediate corrective action plan.
                                    </span>
                                  ) : isLow && !currentRemark.trim() ? (
                                    <span className="text-amber-800 text-[11px] font-medium">
                                      Please enter a remark explaining this deficiency.
                                    </span>
                                  ) : null}
                                </div>

                                <div className="flex items-center gap-1.5 ml-auto text-[11px]">
                                  {item.id > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => jumpToItem(item.id - 1)}
                                      className="px-2 py-0.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded hover:bg-slate-200"
                                    >
                                      ‹ Prev (#{item.id - 1})
                                    </button>
                                  )}
                                  {item.id < TOTAL_PARAMETERS && (
                                    <button
                                      type="button"
                                      onClick={() => jumpToItem(item.id + 1)}
                                      className="px-2 py-0.5 text-slate-700 hover:text-slate-900 bg-slate-100 rounded hover:bg-slate-200 font-medium"
                                    >
                                      Next (#{item.id + 1}) ›
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Specific Remarks by Inspecting HOD Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5" style={{ color: theme.primary }} />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                  Specific Remarks by the Inspecting HOD
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. Major Positive Observations
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Highlight noteworthy cleanliness, student projects, lab organization, or best practices observed..."
                    value={draft.notes[0]}
                    onChange={(e) => handleNoteChange(0, e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-rose-800">
                    2. Areas Requiring Immediate Attention
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List specific defects, broken fixtures, electrical hazards, chemical labelling, washroom hygiene, or urgent maintenance issues..."
                    value={draft.notes[1]}
                    onChange={(e) => handleNoteChange(1, e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. Suggestions for Improvement
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Longer-term housekeeping suggestions, painting, rearrangement, periodic deep-cleaning schedule, scrap disposal..."
                    value={draft.notes[2]}
                    onChange={(e) => handleNoteChange(2, e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>

            {/* Department Corrective Action Plan Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" style={{ color: theme.primary }} />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      Department Corrective Action Plan
                    </h2>
                    <p className="text-xs text-slate-500">
                      Record targeted rectification actions with assigned responsibility and deadlines.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateActionsFromLow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Auto-Fill from Low-Rated Items</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddAction}
                    style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-opacity hover:opacity-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Action</span>
                  </button>
                </div>
              </div>

              {/* Action items list */}
              <div className="space-y-4">
                {draft.actions.map((action, idx) => (
                  <div
                    key={action.id || idx}
                    className={`border rounded-xl p-4 transition-all ${
                      action.completed
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Action Item #{idx + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={action.completed}
                            onChange={(e) =>
                              handleUpdateAction(idx, 'completed', e.target.checked)
                            }
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                          <span>Mark Completed</span>
                        </label>
                        {draft.actions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAction(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Delete this action"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Deficiency Identified
                        </label>
                        <textarea
                          rows={2}
                          value={action.deficiency}
                          onChange={(e) =>
                            handleUpdateAction(idx, 'deficiency', e.target.value)
                          }
                          placeholder="e.g., Projector cable loose in Room 204..."
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Corrective Action Required
                        </label>
                        <textarea
                          rows={2}
                          value={action.actionRequired}
                          onChange={(e) =>
                            handleUpdateAction(idx, 'actionRequired', e.target.value)
                          }
                          placeholder="e.g., Request electrician for trunking and fixture..."
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Responsible Person
                        </label>
                        <input
                          type="text"
                          list="hod-action-datalist"
                          value={action.responsiblePerson}
                          onChange={(e) =>
                            handleUpdateAction(idx, 'responsiblePerson', e.target.value)
                          }
                          placeholder="Select HOD or type staff name..."
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1"
                        />
                        <datalist id="hod-action-datalist">
                          {HOD_NAMES.map(name => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Target Completion Date
                        </label>
                        <input
                          type="date"
                          value={action.targetDate}
                          onChange={(e) =>
                            handleUpdateAction(idx, 'targetDate', e.target.value)
                          }
                          className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures & Formal Approvals Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CheckCircle className="w-5 h-5" style={{ color: theme.primary }} />
                <div>
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                    Institutional Signatures &amp; Approvals
                  </h2>
                  <p className="text-xs text-slate-500">
                    Draw digital signatures using finger, stylus, or mouse pad.
                  </p>
                </div>
              </div>

              {/* Institutional Undertaking Statement */}
              <div
                className="p-3.5 border-l-4 rounded-r-xl text-xs sm:text-sm font-semibold italic"
                style={{
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primary,
                  color: theme.primary
                }}
              >
                “The inspection findings have been noted, and necessary corrective actions will be initiated wherever required.”
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Inspecting HOD */}
                <SignaturePad
                  label="1. Inspecting HOD"
                  name={draft.signatures.inspectingHod.name || draft.inspectingHod}
                  onNameChange={(name) =>
                    setDraft(p => ({
                      ...p,
                      signatures: {
                        ...p.signatures,
                        inspectingHod: { ...p.signatures.inspectingHod, name }
                      }
                    }))
                  }
                  signatureImage={draft.signatures.inspectingHod.signatureImage}
                  onSignatureChange={(signatureImage) =>
                    setDraft(p => ({
                      ...p,
                      signatures: {
                        ...p.signatures,
                        inspectingHod: { ...p.signatures.inspectingHod, signatureImage }
                      }
                    }))
                  }
                />

                {/* 2. HOD of Inspected Department */}
                <SignaturePad
                  label="2. HOD of Inspected Department"
                  name={draft.signatures.departmentHod.name || draft.departmentHod}
                  onNameChange={(name) =>
                    setDraft(p => ({
                      ...p,
                      signatures: {
                        ...p.signatures,
                        departmentHod: { ...p.signatures.departmentHod, name }
                      }
                    }))
                  }
                  signatureImage={draft.signatures.departmentHod.signatureImage}
                  onSignatureChange={(signatureImage) =>
                    setDraft(p => ({
                      ...p,
                      signatures: {
                        ...p.signatures,
                        departmentHod: { ...p.signatures.departmentHod, signatureImage }
                      }
                    }))
                  }
                />

                {/* 3. Principal */}
                <SignaturePad
                  label="3. Principal Approval"
                  name={draft.signatures.principal.name}
                  onNameChange={(name) =>
                    setDraft(p => ({
                      ...p,
                      signatures: {
                        ...p.signatures,
                        principal: { ...p.signatures.principal, name }
                      }
                    }))
                  }
                  signatureImage={draft.signatures.principal.signatureImage}
                  onSignatureChange={(signatureImage) =>
                    setDraft(p => ({
                      ...p,
                      signatures: {
                        ...p.signatures,
                        principal: { ...p.signatures.principal, signatureImage }
                      }
                    }))
                  }
                />
              </div>
            </div>

            {/* Bottom Actions Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
                    showToast('Draft saved successfully to local storage');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" style={{ color: theme.primary }} />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewingRecord(draft);
                    setActiveTab('report');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-opacity hover:opacity-90"
                >
                  <FileText className="w-4 h-4" />
                  <span>Preview Official Report</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkRemainingNA}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <span>Mark Remaining N/A...</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearForm}
                  className="inline-flex items-center gap-1 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Form</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmitInspection}
                style={{ backgroundColor: theme.primary }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm sm:text-base font-bold text-white rounded-xl shadow-md transition-opacity hover:opacity-95 ml-auto"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Submit Inspection</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: HISTORY & ANALYTICS */}
        {activeTab === 'history' && (
          <HistoryView
            records={savedRecords}
            theme={theme}
            onViewReport={handleViewReport}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onImportRecords={handleImportRecords}
            onExportCsv={() => handleExportCsv(savedRecords)}
            onExportJson={() => handleExportJson(savedRecords)}
            onNewInspection={() => {
              setActiveTab('form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: OFFICIAL REPORT VIEW */}
        {activeTab === 'report' && viewingRecord && (
          <ReportView
            record={viewingRecord}
            theme={theme}
            onBack={() => {
              setActiveTab(viewingRecord.status === 'submitted' ? 'history' : 'form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExportCsv={() => handleExportCsv([viewingRecord])}
            onExportJson={() => handleExportJson([viewingRecord])}
          />
        )}
      </main>

      {/* Sticky Bottom Progress Floating Bar (only on form view) */}
      {activeTab === 'form' && (
        <div
          style={{ backgroundColor: theme.headerBg }}
          className="no-print fixed bottom-0 left-0 right-0 z-40 text-white py-2.5 px-4 shadow-xl border-t border-white/10 flex items-center justify-between gap-4"
        >
          <div className="flex-1 max-w-xl flex items-center gap-3">
            <div className="w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentScore.ratedCount + currentScore.naCount) / TOTAL_PARAMETERS) * 100}%`
                }}
              />
            </div>
            <div className="text-xs font-bold whitespace-nowrap text-amber-300">
              {currentScore.ratedCount + currentScore.naCount}/{TOTAL_PARAMETERS}
              {currentScore.percentage !== null && (
                <span className="text-white ml-2">
                  · {currentScore.percentage.toFixed(2)}% ({currentScore.band})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentScore.unratedCount > 0 && (
              <button
                type="button"
                onClick={jumpToFirstUnrated}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Jump to Unrated ({currentScore.unratedCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-black/30 hover:bg-black/40 px-3 py-1.5 rounded-lg border border-white/20 transition-colors"
              title="Scroll to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Top</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
