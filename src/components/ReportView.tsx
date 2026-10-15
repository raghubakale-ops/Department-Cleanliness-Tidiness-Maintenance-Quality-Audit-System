import React from 'react';
import { InspectionRecord } from '../types';
import { CATEGORIES, INSPECTION_ITEMS, calculateScore } from '../data/inspectionData';
import { ColorTheme } from '../theme';
import { Printer, ArrowLeft, Download, FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';

interface ReportViewProps {
  record: InspectionRecord;
  theme: ColorTheme;
  onBack: () => void;
  onExportCsv?: () => void;
  onExportJson?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  record,
  theme,
  onBack,
  onExportCsv,
  onExportJson
}) => {
  const score = calculateScore(record.ratings);
  const todayDate = new Date().toISOString().slice(0, 10);

  const formatRating = (val?: string) => {
    if (!val) return '—';
    if (val === 'NA') return 'N/A';
    return val;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          )}

          {onExportJson && (
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export JSON</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            style={{ backgroundColor: theme.primary }}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-xl shadow hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Official Institutional Report Container */}
      <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-md text-slate-900 print:border-0 print:shadow-none print:p-0">
        {/* Institutional Header */}
        <div className="text-center pb-6 border-b-2" style={{ borderColor: theme.primary }}>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase" style={{ color: theme.primary }}>
            Jain College of Engineering, Belagavi
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-wide mt-0.5">
            (Approved by AICTE, New Delhi · Affiliated to VTU, Belagavi · Recognized by Govt. of Karnataka)
          </p>
          <div
            className="mt-3 inline-block text-white px-4 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider rounded"
            style={{ backgroundColor: theme.primary }}
          >
            Department Cleanliness, Tidiness and Maintenance Inspection Report
          </div>
        </div>

        {/* Audit Metadata Table */}
        <div className="mt-6">
          <table className="w-full text-xs sm:text-sm border-collapse border border-slate-400">
            <tbody>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70 w-1/4">Inspection Reference</td>
                <td className="border border-slate-400 p-2 font-mono font-bold w-1/4" style={{ color: theme.primary }}>
                  {record.ref || 'DRAFT (Not Submitted)'}
                </td>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70 w-1/4">Inspection Date</td>
                <td className="border border-slate-400 p-2 w-1/4 font-semibold">{record.date || '—'}</td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">Academic Year</td>
                <td className="border border-slate-400 p-2">{record.academicYear || '—'}</td>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">Audit Status</td>
                <td className="border border-slate-400 p-2 capitalize font-semibold">
                  {record.status === 'submitted' ? (
                    <span className="text-emerald-700">Submitted Official Record</span>
                  ) : (
                    <span className="text-amber-700">Incomplete Draft</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">Department Inspected</td>
                <td className="border border-slate-400 p-2 font-bold text-slate-800" colSpan={3}>
                  {record.department || '—'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">Inspecting HOD</td>
                <td className="border border-slate-400 p-2">{record.inspectingHod || '—'}</td>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">HOD of Inspected Dept.</td>
                <td className="border border-slate-400 p-2">{record.departmentHod || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detailed 37 Checklist Parameters Table */}
        <div className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-wide mb-2 flex items-center justify-between" style={{ color: theme.primary }}>
            <span>Detailed Parameter Evaluation (37 Parameters)</span>
            <span className="text-[11px] font-normal text-slate-500 lowercase">Rating scale: 5 (Excellent) to 1 (Very Poor), NA (Not Applicable)</span>
          </h2>
          <table className="w-full text-xs border-collapse border border-slate-400">
            <thead>
              <tr style={{ backgroundColor: theme.primary }} className="text-white">
                <th className="border border-slate-500 p-2 text-center w-10">Sl.</th>
                <th className="border border-slate-500 p-2 text-left">Area / Inspection Parameter</th>
                <th className="border border-slate-500 p-2 text-center w-20">Rating</th>
                <th className="border border-slate-500 p-2 text-left w-2/5">Remarks &amp; Observations</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map(([categoryTitle], catIndex) => {
                const catItems = INSPECTION_ITEMS.filter(item => item.categoryIndex === catIndex);
                return (
                  <React.Fragment key={catIndex}>
                    <tr className="bg-slate-200 font-bold" style={{ color: theme.primary }}>
                      <td colSpan={4} className="border border-slate-400 p-2 text-xs uppercase tracking-wide">
                        {categoryTitle}
                      </td>
                    </tr>
                    {catItems.map(item => {
                      const rating = record.ratings[item.id];
                      const remarks = record.remarks[item.id];
                      const isLow = rating === '1' || rating === '2';
                      return (
                        <tr
                          key={item.id}
                          className={isLow ? 'bg-amber-50/70 print:bg-transparent' : 'even:bg-slate-50/50 print:bg-transparent'}
                        >
                          <td className="border border-slate-300 p-1.5 text-center font-bold">{item.id}</td>
                          <td className="border border-slate-300 p-1.5 leading-snug">
                            {item.text}
                            {item.isSafetyCritical && (
                              <span className="ml-1.5 inline-block text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1 rounded">
                                Safety-Critical
                              </span>
                            )}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center font-bold">
                            <span className={isLow ? 'text-rose-700 font-black' : ''}>
                              {formatRating(rating)}
                            </span>
                          </td>
                          <td className="border border-slate-300 p-1.5 italic text-slate-700">
                            {remarks || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Score Summary Table */}
        <div className="mt-8 print-avoid-break">
          <h2 className="text-sm font-black uppercase tracking-wide mb-2" style={{ color: theme.primary }}>
            Institutional Audit Score Summary
          </h2>
          <table className="w-full text-xs sm:text-sm border-collapse border border-slate-400">
            <tbody>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70 w-1/2">
                  Parameters Evaluated (Rated 1–5 / N/A / Unrated)
                </td>
                <td className="border border-slate-400 p-2 font-semibold">
                  {score.ratedCount} Rated · {score.naCount} N/A · {score.unratedCount} Unrated
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">
                  Total Score Obtained (A) / Maximum Possible Score (B)
                </td>
                <td className="border border-slate-400 p-2 font-mono font-bold">
                  {score.obtainedScore} / {score.maxPossibleScore}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">
                  Overall Evaluation Percentage
                </td>
                <td className="border border-slate-400 p-2 font-extrabold text-base" style={{ color: theme.primary }}>
                  {score.percentage !== null ? `${score.percentage.toFixed(2)}%` : 'Score not available'}
                  {score.unratedCount > 0 && (
                    <span className="text-xs font-normal text-amber-700 ml-2 italic">
                      (Provisional – {score.unratedCount} item(s) unrated)
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2 font-bold bg-slate-100/70">
                  Overall Performance Rating Band
                </td>
                <td className="border border-slate-400 p-2 font-bold text-base" style={{ color: theme.primary }}>
                  {score.band}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Specific Remarks by Inspecting HOD */}
        <div className="mt-8 print-avoid-break">
          <h2 className="text-sm font-black uppercase tracking-wide mb-2" style={{ color: theme.primary }}>
            Specific Remarks by the Inspecting HOD
          </h2>
          <table className="w-full text-xs sm:text-sm border-collapse border border-slate-400">
            <tbody>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold bg-slate-100/70 w-1/3 align-top">
                  1. Major Positive Observations
                </td>
                <td className="border border-slate-400 p-2.5 whitespace-pre-line text-slate-800">
                  {record.notes[0]?.trim() || 'None recorded'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold bg-slate-100/70 w-1/3 align-top">
                  2. Areas Requiring Immediate Attention
                </td>
                <td className="border border-slate-400 p-2.5 whitespace-pre-line text-slate-800">
                  {record.notes[1]?.trim() || 'None recorded'}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-400 p-2.5 font-bold bg-slate-100/70 w-1/3 align-top">
                  3. Suggestions for Improvement
                </td>
                <td className="border border-slate-400 p-2.5 whitespace-pre-line text-slate-800">
                  {record.notes[2]?.trim() || 'None recorded'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Corrective Action Plan Table */}
        <div className="mt-8 print-avoid-break">
          <h2 className="text-sm font-black uppercase tracking-wide mb-2" style={{ color: theme.primary }}>
            Department Corrective Action Plan
          </h2>
          <table className="w-full text-xs border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-200 font-bold" style={{ color: theme.primary }}>
                <th className="border border-slate-400 p-2 text-center w-8">Sl.</th>
                <th className="border border-slate-400 p-2 text-left w-1/3">Deficiency Identified</th>
                <th className="border border-slate-400 p-2 text-left w-1/3">Corrective Action Required</th>
                <th className="border border-slate-400 p-2 text-left w-1/6">Responsible Person</th>
                <th className="border border-slate-400 p-2 text-center w-28">Target Date &amp; Status</th>
              </tr>
            </thead>
            <tbody>
              {record.actions && record.actions.filter(a => a.deficiency || a.actionRequired).length > 0 ? (
                record.actions
                  .filter(a => a.deficiency || a.actionRequired)
                  .map((action, idx) => {
                    const isOverdue =
                      action.targetDate && action.targetDate < todayDate && !action.completed;
                    return (
                      <tr key={action.id || idx}>
                        <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 p-2">{action.deficiency || '—'}</td>
                        <td className="border border-slate-300 p-2">{action.actionRequired || '—'}</td>
                        <td className="border border-slate-300 p-2">{action.responsiblePerson || '—'}</td>
                        <td className="border border-slate-300 p-2 text-center">
                          <div>{action.targetDate || '—'}</div>
                          {action.completed ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5">
                              <Clock className="w-3 h-3" /> OVERDUE
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={5} className="border border-slate-300 p-3 text-center text-slate-500 italic">
                    No corrective actions recorded for this audit.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Institutional Undertaking Declaration */}
        <div
          className="mt-8 p-3 bg-slate-50 border-l-4 text-xs sm:text-sm font-semibold text-slate-700 italic print-avoid-break"
          style={{ borderColor: theme.primary }}
        >
          “The inspection findings have been noted, and necessary corrective actions will be initiated wherever required.”
        </div>

        {/* Signatures & Approvals Block */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 grid grid-cols-3 gap-4 print-avoid-break text-center">
          {/* Inspecting HOD */}
          <div className="flex flex-col items-center justify-between border border-slate-200 rounded-lg p-3 bg-white">
            <span className="text-xs font-bold uppercase mb-1" style={{ color: theme.primary }}>
              Inspecting HOD
            </span>
            <div className="h-20 w-full flex items-center justify-center my-1">
              {record.signatures.inspectingHod.signatureImage ? (
                <img
                  src={record.signatures.inspectingHod.signatureImage}
                  alt="Inspecting HOD Signature"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400 italic">Signature pending</span>
              )}
            </div>
            <div className="w-full pt-1 border-t border-slate-200 text-xs">
              <span className="font-semibold block truncate">
                {record.signatures.inspectingHod.name || record.inspectingHod || '__________'}
              </span>
              <span className="text-[10px] text-slate-500">Signature &amp; Date</span>
            </div>
          </div>

          {/* Department HOD */}
          <div className="flex flex-col items-center justify-between border border-slate-200 rounded-lg p-3 bg-white">
            <span className="text-xs font-bold uppercase mb-1" style={{ color: theme.primary }}>
              HOD of Inspected Dept.
            </span>
            <div className="h-20 w-full flex items-center justify-center my-1">
              {record.signatures.departmentHod.signatureImage ? (
                <img
                  src={record.signatures.departmentHod.signatureImage}
                  alt="Department HOD Signature"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400 italic">Signature pending</span>
              )}
            </div>
            <div className="w-full pt-1 border-t border-slate-200 text-xs">
              <span className="font-semibold block truncate">
                {record.signatures.departmentHod.name || record.departmentHod || '__________'}
              </span>
              <span className="text-[10px] text-slate-500">Signature &amp; Date</span>
            </div>
          </div>

          {/* Principal */}
          <div className="flex flex-col items-center justify-between border border-slate-200 rounded-lg p-3 bg-white">
            <span className="text-xs font-bold uppercase mb-1" style={{ color: theme.primary }}>
              Principal
            </span>
            <div className="h-20 w-full flex items-center justify-center my-1">
              {record.signatures.principal.signatureImage ? (
                <img
                  src={record.signatures.principal.signatureImage}
                  alt="Principal Signature"
                  className="max-h-16 max-w-full object-contain"
                />
              ) : (
                <span className="text-xs text-slate-400 italic">Signature pending</span>
              )}
            </div>
            <div className="w-full pt-1 border-t border-slate-200 text-xs">
              <span className="font-semibold block truncate">
                {record.signatures.principal.name || 'Dr. J. G. Principal'}
              </span>
              <span className="text-[10px] text-slate-500">Approval &amp; Seal</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
          <span>Jain College of Engineering, T.S. Nagar, Hunchanatti Road, Belagavi - 590014</span>
          <span>Generated on {new Date().toLocaleDateString('en-GB')}</span>
        </div>
      </div>
    </div>
  );
};
