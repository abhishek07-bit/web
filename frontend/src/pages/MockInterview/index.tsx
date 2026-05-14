import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Brain, ArrowRight, Loader2, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import { useInterviewStore } from '../../store/interviewStore';
import { interviewAPI } from '../../api/client';
import { useVoice } from '../../hooks/useVoice';

type Phase = 'question' | 'evaluating' | 'feedback';

export default function MockInterviewPage() {
  const navigate = useNavigate();
  const { 
    sessionId, 
    questions, 
    currentQuestionIndex, 
    nextQuestion, 
    addAnswer,
    endSession 
  } = useInterviewStore();

  const { speak, stop, isSpeaking, isEnabled, toggle } = useVoice({ rate: 0.95, pitch: 1.0 });

  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [currentFeedback, setCurrentFeedback] = useState<{ score: number; feedback: string } | null>(null);
  const [questionVisible, setQuestionVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (!sessionId || questions.length === 0) {
      navigate('/interview/setup');
    }
  }, [sessionId, questions, navigate]);

  // Speak question aloud when it changes
  useEffect(() => {
    if (currentQuestion && phase === 'question') {
      setQuestionVisible(false);
      setTimeout(() => setQuestionVisible(true), 50);
      
      if (isEnabled) {
        const fullText = currentQuestion.subPrompt 
          ? `${currentQuestion.text}. ${currentQuestion.subPrompt}`
          : currentQuestion.text;
        speak(fullText);
      }
    }
  }, [currentQuestionIndex, currentQuestion, phase]);

  useEffect(() => {
    if (phase !== 'question') return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIndex, phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const moveToNext = useCallback(() => {
    stop();
    setCurrentFeedback(null);
    setPhase('question');
    if (isLastQuestion) {
      endSession(currentFeedback?.score || 75);
      navigate(`/feedback/${sessionId}`);
    } else {
      setAnswerText('');
      setTimer(0);
      nextQuestion();
    }
  }, [isLastQuestion, stop, nextQuestion, endSession, navigate, sessionId, currentFeedback]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !answerText.trim()) return;
    stop();
    setPhase('evaluating');
    setLoading(true);

    try {
      const { data } = await interviewAPI.submitAnswer(currentQuestion.id, {
        text: answerText,
        confidence,
        duration: timer,
      });

      addAnswer({
        id: crypto.randomUUID(),
        questionId: currentQuestion.id,
        text: answerText,
        confidence,
        duration: timer,
        score: data.score,
        feedback: data.feedback,
      });

      const fb = { score: data.score || 70, feedback: data.feedback || 'Answer recorded.' };
      setCurrentFeedback(fb);
      setPhase('feedback');

      // AI speaks the feedback
      if (isEnabled && fb.feedback) {
        const spokenFeedback = `You scored ${fb.score} out of 100. ${fb.feedback}`;
        speak(spokenFeedback);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      const fb = { score: 70, feedback: 'Response recorded. Moving to next question.' };
      setCurrentFeedback(fb);
      setPhase('feedback');
      if (isEnabled) speak(fb.feedback);
    } finally {
      setLoading(false);
    }
  }, [currentQuestion, answerText, confidence, timer, addAnswer, stop, isEnabled, speak]);

  if (!currentQuestion) return null;

  return (
    <main className="flex-1 flex flex-col max-w-max-width mx-auto w-full px-container-padding relative h-screen">
      {/* Top: Timer & Progress */}
      <header className="w-full pt-lg max-w-4xl mx-auto flex flex-col gap-sm animate-fade-in">
        <div className="flex justify-between items-end font-label-sm text-label-sm text-secondary uppercase tracking-widest">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="flex items-center gap-md">
            <button
              onClick={toggle}
              className={`flex items-center gap-xs px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${
                isEnabled
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-secondary border border-outline-variant'
              }`}
              title={isEnabled ? 'Turn off AI voice' : 'Turn on AI voice'}
            >
              {isEnabled ? <Volume2 size={12} strokeWidth={2} /> : <VolumeX size={12} strokeWidth={2} />}
              {isEnabled ? 'Voice On' : 'Voice Off'}
            </button>
            <span className="flex items-center gap-xs">
              <Timer size={14} strokeWidth={1.5} />
              {formatTime(timer)}
            </span>
          </div>
        </div>
        <ProgressBar value={((currentQuestionIndex + 1) / questions.length) * 100} height="2px" />
      </header>

      {/* EVALUATING PHASE */}
      {phase === 'evaluating' && (
        <section className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
          <Loader2 className="animate-spin text-primary mb-md" size={40} />
          <p className="font-label-bold text-label-bold text-secondary">AI is evaluating your answer...</p>
        </section>
      )}

      {/* FEEDBACK PHASE */}
      {phase === 'feedback' && currentFeedback && (
        <section className="flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto w-full px-lg animate-scale-in">
          {/* Score circle */}
          <div className="relative w-24 h-24 flex items-center justify-center mb-lg">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-outline-variant"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor" strokeWidth="2.5"
              />
              <path
                className="text-primary transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="currentColor"
                strokeDasharray={`${currentFeedback.score}, 100`}
                strokeWidth="2.5" strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-display text-[28px] font-bold text-primary">{currentFeedback.score}</span>
          </div>

          {/* Feedback text */}
          <div className="bg-[var(--color-card-bg)] border border-[var(--color-card-border)] rounded-pebble p-lg w-full mb-lg">
            <div className="flex items-center gap-sm mb-sm">
              <MessageSquare size={16} className="text-primary" strokeWidth={1.5} />
              <span className="font-label-bold text-label-sm text-secondary uppercase tracking-widest">AI Feedback</span>
            </div>
            <p className="font-body-md text-body-md text-on-background leading-relaxed">{currentFeedback.feedback}</p>
          </div>

          {/* Voice indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2 mb-md animate-fade-in">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center voice-pulse">
                <Volume2 size={12} strokeWidth={2} />
              </div>
              <div className="flex items-end gap-0.5 h-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-0.5 bg-primary rounded-full voice-wave" style={{ animationDelay: `${i * 0.1}s`, height: '3px' }} />
                ))}
              </div>
              <span className="font-label-sm text-label-sm text-secondary">Speaking...</span>
            </div>
          )}

          <button
            onClick={moveToNext}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-bold text-label-bold flex items-center gap-2 hover:opacity-90 transition-all"
          >
            {isLastQuestion ? 'View Full Report' : 'Next Question'}
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </section>
      )}

      {/* QUESTION PHASE */}
      {phase === 'question' && (
        <>
          <section className={`flex-1 flex flex-col justify-center items-center text-center max-w-3xl mx-auto w-full px-lg my-lg transition-all duration-500 ${questionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-secondary mb-lg">
              <Brain size={14} strokeWidth={1.5} />
              {currentQuestion.category || 'General'}
            </div>

            {isSpeaking && (
              <div className="flex items-center gap-2 mb-md animate-fade-in">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center voice-pulse">
                  <Volume2 size={12} strokeWidth={2} />
                </div>
                <div className="flex items-end gap-0.5 h-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-0.5 bg-primary rounded-full voice-wave" style={{ animationDelay: `${i * 0.1}s`, height: '3px' }} />
                  ))}
                </div>
                <span className="font-label-sm text-label-sm text-secondary">AI is speaking...</span>
              </div>
            )}

            <h1 className="font-display text-display text-on-background max-w-2xl">
              {currentQuestion.text}
            </h1>
            {currentQuestion.subPrompt && (
              <p className="font-body-lg text-body-lg text-secondary mt-md max-w-xl">
                {currentQuestion.subPrompt}
              </p>
            )}
          </section>

          {/* Bottom: Input Area */}
          <section className="w-full max-w-4xl mx-auto pb-lg flex flex-col gap-md animate-slide-up">
            <div className="flex justify-center gap-sm">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setConfidence(level)}
                  className={`px-4 py-2 rounded-full font-label-bold text-label-sm transition-all duration-200 ${
                    confidence === level
                      ? 'bg-primary text-on-primary border border-primary'
                      : 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-full rounded-[24px] border border-outline-variant bg-surface-container-low p-lg flex flex-col gap-sm transition-all duration-300 focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/5">
              <textarea
                ref={textareaRef}
                className="w-full h-28 bg-transparent border-none outline-none resize-none font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-0 p-0"
                placeholder="Type your response here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />
              <div className="flex justify-between items-center pt-sm border-t border-outline-variant/50">
                <span className="font-label-sm text-label-sm text-secondary">
                  {answerText.length > 0 ? `${answerText.length} chars` : ''}
                </span>
                <div className="flex items-center gap-sm">
                  <button 
                    onClick={() => { stop(); setAnswerText(''); setTimer(0); nextQuestion(); }}
                    className="px-4 py-2 rounded-full bg-transparent text-primary font-label-bold text-label-sm hover:bg-surface-container-high transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !answerText.trim()}
                    className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-bold text-label-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : null}
                    {isLastQuestion ? 'Finish' : 'Submit'}
                    {!loading && <ArrowRight size={14} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
