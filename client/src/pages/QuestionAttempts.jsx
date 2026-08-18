import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

// Difficulty colors
const DIFFICULTY_COLORS = {
  easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-700', border: 'border-emerald-300' },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-700', border: 'border-amber-300' },
  hard: { bg: 'bg-red-500/15', text: 'text-red-700', border: 'border-red-300' },
};

// Category/Type colors
const TYPE_COLORS = {
  technical: { bg: 'bg-blue-500/15', text: 'text-blue-700' },
  behavioral: { bg: 'bg-purple-500/15', text: 'text-purple-700' },
  hr: { bg: 'bg-teal-500/15', text: 'text-teal-700' },
  aptitude: { bg: 'bg-orange-500/15', text: 'text-orange-700' },
};

// Score badge helper
function getScoreBadgeClass(score) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

export default function QuestionAttempts() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  // Accordion state: set of expanded attempt IDs
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    api
      .get(`/evaluation/attempts/${id}`)
      .then(({ data }) => {
        setData(data);
        // Expand the most recent attempt by default if available
        if (data.attempts && data.attempts.length > 0) {
          setExpandedIds(new Set([data.attempts[0]._id]));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch attempts:', err);
        setError(err.response?.data?.message || 'Failed to load attempt history');
        setLoading(false);
      });
  }, [id]);

  const toggleAccordion = (attemptId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(attemptId)) {
        next.delete(attemptId);
      } else {
        next.add(attemptId);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (!data?.attempts) return;
    if (expandedIds.size === data.attempts.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(data.attempts.map((a) => a._id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-10">
          <div className="glass-card p-8 animate-pulse space-y-4">
            <div className="h-6 w-32 bg-stone-200 rounded" />
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-20 bg-stone-200 rounded w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-10 text-center">
          <div className="glass-card p-8">
            <p className="text-red-500 text-lg mb-4">{error || 'Question not found'}</p>
            <button onClick={() => navigate('/questions')} className="btn-primary">
              ← Back to Practice Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { question, attempts = [], stats = {} } = data;
  const diffColors = DIFFICULTY_COLORS[question?.difficulty] || DIFFICULTY_COLORS.easy;
  const typeColors = TYPE_COLORS[question?.type] || TYPE_COLORS.technical;
  const allExpanded = attempts.length > 0 && expandedIds.size === attempts.length;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 page-enter">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Practice Questions
          </button>

          <button
            onClick={() => navigate(`/practice/${question._id}`)}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Practice Again
          </button>
        </div>

        {/* Question Details Header Card */}
        <div className="glass-card p-6 md:p-8 mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {question.role}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors.bg} ${typeColors.text}`}>
              {question.type}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${diffColors.bg} ${diffColors.text}`}>
              {question.difficulty}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-stone-900 leading-relaxed">
            {question.text}
          </h1>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1">
              Total Attempts
            </span>
            <span className="text-2xl font-black text-stone-900">{stats.totalAttempts}</span>
          </div>

          <div className="glass-card p-4 text-center">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1">
              Best Score
            </span>
            <span className={`text-2xl font-black ${stats.highestScore >= 80 ? 'text-emerald-700' : stats.highestScore >= 50 ? 'text-amber-700' : 'text-stone-900'}`}>
              {stats.totalAttempts > 0 ? `${stats.highestScore}%` : 'N/A'}
            </span>
          </div>

          <div className="glass-card p-4 text-center">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1">
              Average Score
            </span>
            <span className="text-2xl font-black text-stone-900">
              {stats.totalAttempts > 0 ? `${stats.averageScore}%` : 'N/A'}
            </span>
          </div>

          <div className="glass-card p-4 text-center">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-1">
              Latest Attempt
            </span>
            <span className="text-xs font-bold text-stone-800 leading-tight block mt-1">
              {stats.latestAttemptDate
                ? new Date(stats.latestAttemptDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Never'}
            </span>
          </div>
        </div>

        {/* Section Heading with Accordion Expand All Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span>📜 Attempt History</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700">
              {attempts.length} {attempts.length === 1 ? 'record' : 'records'}
            </span>
          </h2>

          {attempts.length > 0 && (
            <button
              onClick={toggleExpandAll}
              className="text-xs font-semibold text-amber-900 hover:text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-900/20 px-3 py-1.5 rounded-lg transition-all"
            >
              {allExpanded ? 'Collapse All ▲' : 'Expand All ▼'}
            </button>
          )}
        </div>

        {/* Attempt List (Accordion Format) */}
        {attempts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">No Previous Attempts Found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
              You haven't attempted this question yet. Submit your answer to get instant AI scoring, keyword matching, and targeted recommendations.
            </p>
            <button
              onClick={() => navigate(`/practice/${question._id}`)}
              className="btn-primary inline-flex items-center gap-2"
            >
              Start Practice Now →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt, index) => {
              const attemptNumber = attempts.length - index;
              const formattedDate = new Date(attempt.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              });
              const isOpen = expandedIds.has(attempt._id);

              return (
                <div
                  key={attempt._id}
                  className="glass-card overflow-hidden transition-all border border-stone-200 hover:border-amber-900/30"
                >
                  {/* Accordion Header (Clickable) */}
                  <button
                    onClick={() => toggleAccordion(attempt._id)}
                    className="w-full p-5 text-left flex flex-wrap items-center justify-between gap-4 hover:bg-stone-500/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 rounded-xl bg-amber-900/10 text-amber-950 font-bold flex items-center justify-center text-xs border border-amber-900/20 shrink-0">
                        #{attemptNumber}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-stone-900">
                            Attempt #{attemptNumber}
                          </h3>
                          <span className="text-xs text-stone-400">•</span>
                          <span className="text-xs text-stone-500">{formattedDate}</span>
                        </div>
                        {/* Truncated answer snippet when collapsed */}
                        {!isOpen && (
                          <p className="text-xs text-stone-500 line-clamp-1 mt-1 truncate">
                            {attempt.userAnswer}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getScoreBadgeClass(
                          attempt.overallScore
                        )}`}
                      >
                        {attempt.overallScore}% Score
                      </span>

                      <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600 text-xs font-bold transition-transform duration-300">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {/* Accordion Content Body (Visible when open) */}
                  {isOpen && (
                    <div className="p-6 md:p-8 pt-2 border-t border-stone-200/80 space-y-6 page-enter">
                      {/* Sub-Scores Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-stone-100/80 p-3 rounded-xl border border-stone-200 text-center">
                          <span className="text-xs text-stone-500 font-medium block">🔑 Keywords Score</span>
                          <span className="text-base font-bold text-stone-900">
                            {attempt.keywordScore}%
                          </span>
                        </div>
                        <div className="bg-stone-100/80 p-3 rounded-xl border border-stone-200 text-center">
                          <span className="text-xs text-stone-500 font-medium block">🧬 Semantic Match</span>
                          <span className="text-base font-bold text-stone-900">
                            {attempt.embeddingScore}%
                          </span>
                        </div>
                        <div className="bg-stone-100/80 p-3 rounded-xl border border-stone-200 text-center">
                          <span className="text-xs text-stone-500 font-medium block">🤖 AI Evaluation</span>
                          <span className="text-base font-bold text-stone-900">
                            {attempt.llmScore}%
                          </span>
                        </div>
                      </div>

                      {/* User's Submitted Answer */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                          Your Submitted Answer
                        </h4>
                        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-stone-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {attempt.userAnswer}
                        </div>
                      </div>

                      {/* Keywords Breakdown */}
                      {((attempt.matchedKeywords && attempt.matchedKeywords.length > 0) ||
                        (attempt.missingKeywords && attempt.missingKeywords.length > 0)) && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                            Keyword Analysis
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {attempt.matchedKeywords?.map((kw, i) => (
                              <span
                                key={`m-${i}`}
                                className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-850 font-medium border border-emerald-200"
                              >
                                ✓ {kw}
                              </span>
                            ))}
                            {attempt.missingKeywords?.map((kw, i) => (
                              <span
                                key={`x-${i}`}
                                className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-850 font-medium border border-red-200"
                              >
                                ✗ {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Feedback Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attempt.strengths?.length > 0 && (
                          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-200">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <span>💪</span> Strengths
                            </h4>
                            <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
                              {attempt.strengths.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {attempt.weaknesses?.length > 0 && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-200">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <span>⚠️</span> Areas for Improvement
                            </h4>
                            <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
                              {attempt.weaknesses.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {attempt.missingPoints?.length > 0 && (
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-200">
                            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <span>❌</span> Missing Concepts
                            </h4>
                            <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
                              {attempt.missingPoints.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {attempt.suggestions?.length > 0 && (
                          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-200">
                            <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <span>💡</span> Actionable Suggestions
                            </h4>
                            <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
                              {attempt.suggestions.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Latency info footer */}
                      {attempt.latency && (
                        <div className="pt-3 border-t border-stone-200 text-right text-[11px] text-stone-400">
                          Evaluated in {(attempt.latency.total / 1000).toFixed(1)}s (LLM: {(attempt.latency.llm / 1000).toFixed(1)}s, Embedding: {attempt.latency.embedding}ms)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
