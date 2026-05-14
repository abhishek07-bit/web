import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Clock, Info } from 'lucide-react';
import PebbleCard from '../../components/common/PebbleCard';
import { useInterviewStore } from '../../store/interviewStore';

export default function AnalyticsPage() {
  const sessions = useInterviewStore((s) => s.sessions);

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
    : 0;

  // Calculate weekly trend
  const thisWeek = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });
  const lastWeek = sessions.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && diffDays <= 14;
  });
  const thisWeekAvg = thisWeek.length > 0
    ? Math.round(thisWeek.reduce((sum, s) => sum + (s.score || 0), 0) / thisWeek.length)
    : 0;
  const lastWeekAvg = lastWeek.length > 0
    ? Math.round(lastWeek.reduce((sum, s) => sum + (s.score || 0), 0) / lastWeek.length)
    : 0;
  const trend = thisWeekAvg - lastWeekAvg;

  // Group sessions by topic for heatmap
  const topicScores: Record<string, number[]> = {};
  sessions.forEach((s) => {
    const topic = s.role || 'General';
    if (!topicScores[topic]) topicScores[topic] = [];
    if (s.score) topicScores[topic].push(s.score);
  });

  return (
    <>
      <header className="mb-xl max-w-3xl mt-xl">
        <h2 className="font-display text-display text-primary mb-md">Weakness Analytics</h2>
        <p className="font-body-lg text-body-lg text-secondary">
          {totalSessions > 0
            ? 'A precise breakdown of your performance gaps across interview topics.'
            : 'Complete mock interviews to see your performance analytics here.'}
        </p>
      </header>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <PebbleCard>
          <div className="flex items-center gap-sm mb-md">
            <TrendingUp size={24} className="text-primary" strokeWidth={1.5} />
            <h3 className="font-label-bold text-label-bold text-secondary">Overall Readiness</h3>
          </div>
          <p className="font-display text-display text-primary">
            {avgScore > 0 ? `${avgScore}%` : '—'}
          </p>
          {trend !== 0 && (
            <span className="font-label-sm text-label-sm text-secondary mt-sm inline-block">
              {trend > 0 ? `+${trend}%` : `${trend}%`} this week
            </span>
          )}
        </PebbleCard>

        <PebbleCard>
          <div className="flex items-center gap-sm mb-md">
            <AlertTriangle size={24} className="text-primary" strokeWidth={1.5} />
            <h3 className="font-label-bold text-label-bold text-secondary">Total Sessions</h3>
          </div>
          <p className="font-display text-display text-primary">{totalSessions}</p>
          <span className="font-label-sm text-label-sm text-secondary mt-sm inline-block">
            {thisWeek.length} this week
          </span>
        </PebbleCard>

        <PebbleCard>
          <div className="flex items-center gap-sm mb-md">
            <Clock size={24} className="text-primary" strokeWidth={1.5} />
            <h3 className="font-label-bold text-label-bold text-secondary">Total Practice Time</h3>
          </div>
          <p className="font-display text-display text-primary">
            {totalSessions > 0 ? `${sessions.reduce((sum, s) => sum + (s.duration || 0), 0)}m` : '—'}
          </p>
          <span className="font-label-sm text-label-sm text-secondary mt-sm inline-block">
            Avg {totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions) : 0}m / session
          </span>
        </PebbleCard>
      </div>

      {/* Topic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <PebbleCard className="lg:col-span-2">
          <h4 className="font-headline-md text-headline-md text-primary mb-lg">Topic Performance</h4>
          {Object.keys(topicScores).length > 0 ? (
            <div className="flex flex-col gap-md">
              {Object.entries(topicScores).map(([topic, scores]) => {
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                return (
                  <div key={topic}>
                    <div className="flex justify-between font-label-sm text-label-sm text-secondary mb-xs">
                      <span>{topic}</span>
                      <span>{avg}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-xl text-center">
              <Info size={48} className="text-secondary mb-md" strokeWidth={1} />
              <p className="font-body-md text-body-md text-secondary">No data yet. Complete sessions to see topic performance.</p>
              <Link
                to="/interview/setup"
                className="mt-lg bg-primary text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-full hover:opacity-90 transition-opacity"
              >
                Start Practice
              </Link>
            </div>
          )}
        </PebbleCard>

        <PebbleCard>
          <h4 className="font-headline-md text-headline-md text-primary mb-lg">Session History</h4>
          {sessions.length > 0 ? (
            <div className="flex flex-col gap-sm">
              {sessions.slice(0, 6).map((s) => (
                <div key={s.id} className="flex justify-between items-center py-sm border-b border-outline-variant last:border-0">
                  <div>
                    <p className="font-label-bold text-label-bold text-primary">{s.role}</p>
                    <p className="font-label-sm text-label-sm text-secondary">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-label-bold text-label-bold text-primary">
                    {s.score ? `${s.score}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-secondary py-lg text-center">No sessions yet.</p>
          )}
        </PebbleCard>
      </div>
    </>
  );
}
