import React, { useState, useMemo } from 'react';
import { InspectionRecord } from '../types';
import { DEPARTMENTS, PERFORMANCE_BANDS, calculateScore, computeAcademicYear } from '../data/inspectionData';
import { ColorTheme } from '../theme';
import {
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Upload,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  RotateCcw,
  PlusCircle,
  Building2
} from 'lucide-react';

interface HistoryViewProps {
  records: InspectionRecord[];
  theme: ColorTheme;
  onViewReport: (record: InspectionRecord) => void;
  onEditRecord: (record: InspectionRecord) => void;
  onDeleteRecord: (ref: string) => void;
  onImportRecords: (records: InspectionRecord[]) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onNewInspection: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  theme,
  onViewReport,
  onEditRecord,
  onDeleteRecord,
  onImportRecords,
  onExportCsv,
  onExportJson,
  onNewInspection
}) => {
  // Filter states
  const [selectedAy, setSelectedAy] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [hodSearch, setHodSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBand, setSelectedBand] = useState('');
  const [onlyPendingActions, setOnlyPendingActions] = useState(false);

  // Available academic years from records
  const academicYears = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.academicYear) set.add(r.academicYear);
      else if (r.date) set.add(computeAcademicYear(r.date));
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // Today for overdue checks
  const today = new Date().toISOString().slice(0, 10);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const ay = record.academicYear || computeAcademicYear(record.date);
      if (selectedAy && ay !== selectedAy) return false;
      if (selectedDate && record.date !== selectedDate) return false;
      if (hodSearch && !record.inspectingHod.toLowerCase().includes(hodSearch.toLowerCase())) return false;
      if (selectedDept && record.department !== selectedDept) return false;

      const score = calculateScore(record.ratings);
      if (selectedBand && score.band !== selectedBand) return false;

      if (onlyPendingActions) {
        const pendingCount = (record.actions || []).filter(a => (a.deficiency || a.actionRequired) && !a.completed).length;
        if (pendingCount === 0) return false;
      }

      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  }, [records, selectedAy, selectedDate, hodSearch, selectedDept, selectedBand, onlyPendingActions]);

  // Department-wise summary computation (Latest vs Previous)
  const departmentSummary = useMemo(() => {
    const map: Record<string, InspectionRecord[]> = {};
    records.forEach(r => {
      if (!map[r.department]) map[r.department] = [];
      map[r.department].push(r);
    });

    return Object.entries(map).map(([dept, recs]) => {
      recs.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.submittedAt || '').localeCompare(a.submittedAt || ''));
      const latest = recs[0];
      const previous = recs[1];

      const latestScore = calculateScore(latest.ratings).percentage;
      const prevScore = previous ? calculateScore(previous.ratings).percentage : null;
      const change = latestScore !== null && prevScore !== null ? latestScore - prevScore : null;

      return {
        department: dept,
        latestDate: latest.date,
        latestScore,
        prevScore,
        change,
        totalAudits: recs.length
      };
    }).sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
  }, [records]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = records.length;
    let sumScore = 0;
    let scoreCount = 0;
    let pendingActionsTotal = 0;
    let overdueActionsTotal = 0;

    records.forEach(r => {
      const sc = calculateScore(r.ratings);
      if (sc.percentage !== null) {
        sumScore += sc.percentage;
        scoreCount++;
      }
      (r.actions || []).forEach(a => {
        if ((a.deficiency || a.actionRequired) && !a.completed) {
          pendingActionsTotal++;
          if (a.targetDate && a.targetDate < today) {
            overdueActionsTotal++;
          }
        }
      });
    });

    const avgScore = scoreCount > 0 ? (sumScore / scoreCount).toFixed(1) : null;
    return { total, avgScore, pendingActionsTotal, overdueActionsTotal };
  }, [records, today]);

  const handleResetFilters = () => {
    setSelectedAy('');
    setSelectedDate('');
    setHodSearch('');
    setSelectedDept('');
    setSelectedBand('');
    setOnlyPendingActions(false);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedList: InspectionRecord[] = Array.isArray(parsed) ? parsed : [parsed];
        if (importedList.length === 0 || !importedList[0].ratings) {
          alert('Invalid backup file. Ensure this is a JCE inspection JSON file.');
          return;
        }
        onImportRecords(importedList);
        alert(`Successfully imported ${importedList.length} inspection record(s).`);
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Archived Audits</span>
          <div className="text-2xl font-black mt-1" style={{ color: theme.primary }}>{stats.total}</div>
          <span className="text-[11px] text-slate-400">Total institutional records</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Average Score</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats.avgScore ? `${stats.avgScore}%` : '—'}
          </div>
          <span className="text-[11px] text-slate-400">Across completed audits</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Pending Actions</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingActionsTotal}</div>
          <span className="text-[11px] text-slate-400">Corrective items open</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Overdue Items</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.overdueActionsTotal}</div>
          <span className="text-[11px] text-slate-400">Exceeded target completion</span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: theme.primary }} />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Filter Records
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={onNewInspection}
              style={{ backgroundColor: theme.primary }}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Inspection
            </button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Academic Year</label>
            <select
              value={selectedAy}
              onChange={(e) => setSelectedAy(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1"
            >
              <option value="">All Academic Years</option>
              {academicYears.map(ay => (
                <option key={ay} value={ay}>{ay}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Performance Band</label>
            <select
              value={selectedBand}
              onChange={(e) => setSelectedBand(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1"
            >
              <option value="">All Ratings</option>
              {PERFORMANCE_BANDS.map(b => (
                <option key={b.label} value={b.label}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Inspecting HOD</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name..."
                value={hodSearch}
                onChange={(e) => setHodSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-7 pr-2 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Inspection Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1"
            />
          </div>
        </div>

        {/* Action checkbox */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyPendingActions}
              onChange={(e) => setOnlyPendingActions(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span>Show only departments with pending corrective action items</span>
          </label>
        </div>
      </div>

      {/* Department-wise summary table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4" style={{ color: theme.primary }} />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Department Performance &amp; Progress Benchmark
          </h2>
        </div>

        {departmentSummary.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No audits recorded yet. Complete an inspection to view department comparisons.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Audits</th>
                  <th className="py-2.5 px-3 text-center">Latest Score</th>
                  <th className="py-2.5 px-3 text-center">Previous Score</th>
                  <th className="py-2.5 px-3 text-center">Progress</th>
                  <th className="py-2.5 px-3 text-right">Latest Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentSummary.map(row => (
                  <tr key={row.department} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{row.department}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{row.totalAudits}</td>
                    <td className="py-2.5 px-3 text-center font-bold" style={{ color: theme.primary }}>
                      {row.latestScore !== null ? `${row.latestScore.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      {row.prevScore !== null ? `${row.prevScore.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.change !== null ? (
                        <span
                          className={`inline-flex items-center gap-0.5 font-bold ${
                            row.change > 0
                              ? 'text-emerald-700'
                              : row.change < 0
                              ? 'text-rose-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {row.change > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : row.change < 0 ? (
                            <TrendingDown className="w-3.5 h-3.5" />
                          ) : null}
                          {row.change > 0 ? '+' : ''}
                          {row.change.toFixed(2)} pts
                        </span>
                      ) : (
                        <span className="text-slate-400">Baseline</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                      {row.latestDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filtered Inspection Records List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Saved Inspection Reports ({filteredRecords.length})
          </h2>
          {records.length > 0 && filteredRecords.length !== records.length && (
            <span className="text-xs text-slate-500">
              Showing {filteredRecords.length} of {records.length} total
            </span>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">No saved inspections match the current filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or create a new inspection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map(record => {
              const score = calculateScore(record.ratings);
              const pendingActions = (record.actions || []).filter(
                a => (a.deficiency || a.actionRequired) && !a.completed
              );
              const overdueActions = pendingActions.filter(a => a.targetDate && a.targetDate < today);

              return (
                <div
                  key={record.ref}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: theme.primaryLight, color: theme.primary }}
                        >
                          {record.ref}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{record.date}</span>
                          <span>·</span>
                          <span>AY {record.academicYear || computeAcademicYear(record.date)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black" style={{ color: theme.primary }}>
                          {score.percentage !== null ? `${score.percentage.toFixed(2)}%` : '—'}
                        </div>
                        <span className={`text-[11px] font-bold ${score.bandColor}`}>
                          {score.band}
                        </span>
                      </div>
                    </div>

                    {/* Department name */}
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {record.department}
                    </h3>
                    <div className="text-xs text-slate-600 mt-1">
                      <span>Inspected by: </span>
                      <span className="font-medium">{record.inspectingHod || 'Not specified'}</span>
                      {record.departmentHod && (
                        <span className="text-slate-400"> (HOD: {record.departmentHod})</span>
                      )}
                    </div>

                    {/* Action items status notice */}
                    {pendingActions.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          {pendingActions.length} corrective action{pendingActions.length > 1 ? 's' : ''} pending
                          {overdueActions.length > 0 && (
                            <strong className="text-rose-700 ml-1">
                              ({overdueActions.length} overdue)
                            </strong>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onViewReport(record)}
                      style={{ backgroundColor: theme.primary }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-opacity hover:opacity-90 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditRecord(record)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Edit inspection"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Permanently delete inspection record ${record.ref} for ${record.department}?`)) {
                            onDeleteRecord(record.ref);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
