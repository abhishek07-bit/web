import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Calendar, Search, History, Code, Landmark, ArrowRight, Loader2 } from 'lucide-react';
import PebbleCard from '../../components/common/PebbleCard';
import { useAuthStore } from '../../store/authStore';
import { useInterviewStore } from '../../store/interviewStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { sessions, fetchSessions, loading } = useInterviewStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const firstName = user?.firstName || 'there';
  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
    : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      {/* Header Section */}
      <header className="mb-xl max-w-3xl mt-xl">
        <h2 className="font-display text-display text-primary mb-md">{getGreeting()}, {firstName}.</h2>
        <p className="font-headline-md text-headline-md text-secondary">
          {totalSessions === 0 && !loading
            ? 'Start your first mock interview to build your readiness score.'
            : totalSessions > 0 
              ? `You've completed ${totalSessions} session${totalSessions !== 1 ? 's' : ''}. ${avgScore > 0 ? `Average score: ${avgScore}%.` : ''}`
              : loading ? 'Loading your progress...' : ''}
        </p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:gap-[24px]">
        {/* Main Pebble Card: Readiness Score */}
        <PebbleCard className="lg:col-span-8 flex flex-col justify-between min-h-[300px]" padding="large">
          <div className="flex justify-between items-start mb-xl">
            <div>
              <h3 className="font-label-bold text-label-bold text-secondary mb-xs">Interview Readiness Score</h3>
              <p className="font-display text-display text-primary">
                {loading ? <Loader2 className="animate-spin text-secondary" size={32} /> : (totalSessions > 0 ? `${avgScore}%` : '—')}
              </p>
            </div>
            <TrendingUp size={36} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="mt-auto">
            <div className="flex justify-between font-label-sm text-label-sm text-secondary mb-sm">
              <span>Current Progress</span>
              <span>Target: 95%</span>
            </div>
            <div className="w-full h-[8px] bg-surface-variant rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(avgScore, 100)}%` }}
              />
            </div>
            <p className="font-body-md text-body-md text-secondary mt-md">
              {totalSessions === 0 && !loading
                ? 'Complete your first session to see insights here.'
                : 'Keep practicing to improve your score. Consistency is key.'}
            </p>
          </div>
        </PebbleCard>

        {/* Secondary Pebble: Quick Actions */}
        <PebbleCard className="lg:col-span-4 flex flex-col">
          <div className="flex items-center gap-sm mb-lg">
            <Calendar size={24} className="text-primary" strokeWidth={1.5} />
            <h3 className="font-label-bold text-label-bold text-primary">Quick Actions</h3>
          </div>
          <div className="flex flex-col gap-md flex-1">
            <Link
              to="/interview/setup"
              className="flex justify-between items-center py-sm px-md rounded-btn bg-primary text-on-primary hover:opacity-90 transition-opacity"
            >
              <span className="font-label-bold text-label-bold">Start Mock Interview</span>
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
            <Link
              to="/resume"
              className="flex justify-between items-center py-sm px-md rounded-btn border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="font-label-bold text-label-bold">Upload Resume</span>
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
            <Link
              to="/analytics"
              className="flex justify-between items-center py-sm px-md rounded-btn border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="font-label-bold text-label-bold">View Analytics</span>
              <ArrowRight size={18} strokeWidth={1.5} />
            </Link>
          </div>
        </PebbleCard>

        {/* Stats */}
        <PebbleCard className="lg:col-span-4">
          <div className="flex items-center gap-sm mb-lg">
            <Search size={24} className="text-primary" strokeWidth={1.5} />
            <h3 className="font-label-bold text-label-bold text-primary">Your Stats</h3>
          </div>
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-secondary">Total Sessions</span>
              <span className="font-label-bold text-label-bold text-primary">{totalSessions}</span>
            </div>
            <div className="h-px bg-outline-variant" />
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-secondary">Average Score</span>
              <span className="font-label-bold text-label-bold text-primary">
                {avgScore > 0 ? `${avgScore}%` : '—'}
              </span>
            </div>
            <div className="h-px bg-outline-variant" />
            <div className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-secondary">Questions Answered</span>
              <span className="font-label-bold text-label-bold text-primary">
                {sessions.reduce((sum, s) => sum + (s.answers?.length || 0), 0)}
              </span>
            </div>
          </div>
        </PebbleCard>

        {/* Recent History */}
        <PebbleCard className="lg:col-span-8">
          <div className="flex items-center justify-between mb-lg">
            <div className="flex items-center gap-sm">
              <History size={24} className="text-primary" strokeWidth={1.5} />
              <h3 className="font-label-bold text-label-bold text-primary">Recent History</h3>
            </div>
            <Link className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" to="/analytics">
              View All
            </Link>
          </div>
          {totalSessions === 0 ? (
            <div className="py-xl text-center">
              <p className="font-body-md text-body-md text-secondary">No sessions yet. Start your first mock interview!</p>
              <Link
                to="/interview/setup"
                className="inline-flex items-center gap-sm mt-lg bg-primary text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-full hover:opacity-90 transition-opacity"
              >
                Begin Practice <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              {sessions.slice(0, 5).map((session, i) => (
                <div key={session.id} className={`flex justify-between items-center py-md ${i < sessions.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center">
                      {session.role?.includes('Design') ? (
                        <Landmark size={16} className="text-secondary" strokeWidth={1.5} />
                      ) : (
                        <Code size={16} className="text-secondary" strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold text-primary">{session.role || 'Interview'} at {session.company || 'Company'}</p>
                      <p className="font-label-sm text-label-sm text-secondary">
                        {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent'} • {session.duration || 45} mins
                      </p>
                    </div>
                  </div>
                  <span className="font-label-bold text-label-bold text-primary">
                    {session.score ? `${session.score}%` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PebbleCard>
      </div>
    </>
  );
}
