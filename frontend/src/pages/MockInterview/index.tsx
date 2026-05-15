import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Brain, ArrowRight, Loader2, Volume2, VolumeX, MessageSquare, Mic, ShieldCheck, MicOff, Zap, ShieldAlert, Activity } from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import { useInterviewStore } from '../../store/interviewStore';
import { interviewAPI } from '../../api/client';
import { useVoice } from '../../hooks/useVoice';
import { useSpeechToText } from '../../hooks/useSpeechToText';

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

  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    isSupported: isSpeechSupported 
  } = useSpeechToText({
    onResult: (text) => {
      setAnswerText(prev => prev + (prev ? ' ' : '') + text);
    }
  });

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

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (phase !== 'question') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const moveToNext = useCallback(() => {
    stop();
    stopListening();
    const lastScore = currentFeedback?.score || 0;
    setCurrentFeedback(null);
    setPhase('question');
    if (isLastQuestion) {
      endSession(lastScore);
      navigate(`/feedback/${sessionId}`);
    } else {
      setAnswerText('');
      setTimer(0);
      nextQuestion();
    }
  }, [isLastQuestion, stop, stopListening, nextQuestion, endSession, navigate, sessionId, currentFeedback]);

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !answerText.trim()) return;
    stop();
    stopListening();
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

      const fb = { score: data.score, feedback: data.feedback };
      setCurrentFeedback(fb);
      setPhase('feedback');

      if (isEnabled && fb.feedback) {
        speak(`Rating: ${fb.score}. ${fb.feedback}`);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setPhase('question');
    } finally {
      setLoading(false);
    }
  }, [currentQuestion, answerText, confidence, timer, addAnswer, stop, isEnabled, speak, stopListening]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-6 relative h-[calc(100vh-100px)] overflow-hidden animate-fade-in">
      
      {/* Simulation HUD */}
      <header className="w-full pt-8 flex flex-col gap-6 relative z-30">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-bold text-[10px] uppercase tracking-[0.2em]">
                {currentQuestion.category || 'Core Assessment'}
              </div>
              <div className="flex items-center gap-2 text-secondary font-label-bold text-[10px] uppercase tracking-widest">
                <Timer size={14} className="text-primary" />
                {formatTime(timer)}
              </div>
            </div>
            <h2 className="font-display text-lg font-bold text-primary">Challenge {currentQuestionIndex + 1} of {questions.length}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className={`group flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${
                isEnabled ? 'glass border-primary/30 text-primary shadow-lg shadow-primary/10' : 'bg-surface-container-low border-outline-variant text-outline'
              }`}
            >
              {isEnabled ? <Volume2 size={16} className="group-hover:scale-110 transition-transform" /> : <VolumeX size={16} />}
              <span className="font-label-bold text-[10px] uppercase tracking-widest">{isEnabled ? 'Neural Voice Live' : 'Voice Offline'}</span>
            </button>
          </div>
        </div>
        <ProgressBar value={((currentQuestionIndex + 1) / questions.length) * 100} height="3px" />
      </header>

      {/* Main Simulation Stage */}
      <div className="flex-1 flex flex-col relative overflow-hidden mt-12">
        
        {/* PHASE: EVALUATING */}
        {phase === 'evaluating' && (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-50 glass backdrop-blur-md rounded-[48px] animate-fade-in">
            <div className="relative mb-10">
              <div className="w-32 h-32 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <Brain className="absolute inset-0 m-auto text-primary animate-pulse" size={48} />
            </div>
            <h2 className="font-display text-4xl font-bold text-primary tracking-tight mb-4">Neural Processing...</h2>
            <p className="font-body-lg text-secondary text-lg max-w-sm">Synthesizing response vectors and technical validity.</p>
          </div>
        )}

        {/* PHASE: FEEDBACK */}
        {phase === 'feedback' && currentFeedback && (
          <div className="absolute inset-0 flex flex-col justify-center items-center z-40 px-6 animate-scale-in">
            <div className="glass rounded-[48px] p-12 w-full max-w-3xl shadow-premium relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
              
              {/* Score HUD */}
              <div className="flex justify-center mb-12">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-outline-variant/30" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <circle 
                      className="text-primary transition-all duration-1000 ease-out" 
                      cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeDasharray={`${currentFeedback.score}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-display text-5xl font-bold text-primary tracking-tighter">{currentFeedback.score}</span>
                    <span className="text-[9px] font-label-bold text-secondary uppercase tracking-[0.2em] mt-1">Rating</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-primary mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <h3 className="font-label-bold text-xs uppercase tracking-[0.3em]">Neural Performance Insight</h3>
              </div>
              
              <p className="font-body-lg text-2xl text-primary leading-relaxed mb-12 italic font-medium">
                "{currentFeedback.feedback}"
              </p>

              <button
                onClick={moveToNext}
                className="w-full py-5 rounded-[24px] bg-primary text-on-primary font-display font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group shadow-lg shadow-primary/20"
              >
                {isLastQuestion ? 'Finalize Mission Report' : 'Next Strategic Challenge'}
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE: QUESTION */}
        {phase === 'question' && (
          <div className="flex-1 flex flex-col relative z-20">
            <section className={`flex-1 flex flex-col justify-center items-center text-center max-w-5xl mx-auto w-full transition-all duration-1000 ${questionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              
              <div className="mb-12 h-12 flex items-center justify-center">
                {(isSpeaking || isListening) && (
                  <div className="flex items-center gap-4 px-6 py-2 rounded-full glass border-primary/20 animate-fade-in shadow-lg">
                    <div className="flex gap-1.5 h-4 items-end">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-1.5 bg-primary rounded-full animate-voice-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-label-bold text-primary uppercase tracking-[0.2em]">
                      {isListening ? 'Neural Intake Active' : 'AI Synchronizing...'}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary leading-[1.1] mb-12 tracking-tight">
                {currentQuestion.text}
              </h1>
              
              {currentQuestion.subPrompt && (
                <div className="flex items-start gap-4 text-left glass border-primary/10 p-6 rounded-[28px] max-w-2xl shadow-premium">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Zap size={20} />
                  </div>
                  <p className="font-body-lg text-secondary leading-relaxed italic text-lg">
                    <span className="font-bold text-primary not-italic">Briefing:</span> {currentQuestion.subPrompt}
                  </p>
                </div>
              )}
            </section>

            {/* Response Deck */}
            <section className="w-full max-w-5xl mx-auto pb-16 animate-slide-up relative">
              
              {/* Confidence Selectors */}
              <div className="flex justify-center gap-3 mb-8">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidence(level)}
                    className={`px-8 py-2.5 rounded-full text-[10px] font-label-bold transition-all border uppercase tracking-[0.2em] ${
                      confidence === level
                        ? 'bg-primary text-on-primary border-primary shadow-xl shadow-primary/20 scale-105'
                        : 'glass text-secondary border-outline-variant/30 hover:border-primary/40'
                    }`}
                  >
                    {level} Confidence
                  </button>
                ))}
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-[48px] blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative glass border border-outline-variant/30 rounded-[40px] p-10 focus-within:border-primary/40 transition-all shadow-premium">
                  
                  {isListening && (
                    <div className="absolute top-6 right-10 flex items-center gap-3 animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest font-display">Capture Active</span>
                    </div>
                  )}

                  <textarea
                    ref={textareaRef}
                    className="w-full h-40 bg-transparent border-none outline-none resize-none font-body-lg text-2xl text-primary placeholder:text-outline/40 focus:ring-0 p-0 custom-scrollbar leading-relaxed"
                    placeholder={isListening ? "Listening to your response..." : "Initialize strategic response..."}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                  
                  <div className="flex flex-col md:flex-row justify-between items-center mt-10 pt-10 border-t border-outline-variant/20 gap-8">
                    <div className="flex items-center gap-6">
                      {isSpeechSupported && (
                        <button
                          onClick={handleMicToggle}
                          className={`w-16 h-16 rounded-[24px] transition-all duration-500 flex items-center justify-center group ${
                            isListening 
                              ? 'bg-red-500 text-white shadow-2xl shadow-red-500/40 scale-110' 
                              : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'
                          }`}
                          title={isListening ? 'Stop Capture' : 'Start Neural Capture'}
                        >
                          {isListening ? <MicOff size={28} /> : <Mic size={28} className="group-hover:scale-110 transition-transform" />}
                        </button>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-primary font-label-bold text-[10px] uppercase tracking-widest">
                          <ShieldCheck size={14} />
                          Secure Channel
                        </div>
                        <span className="text-[10px] text-outline font-bold uppercase tracking-tighter mt-1">Ready for Assessment</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <button 
                        onClick={() => { stop(); stopListening(); setAnswerText(''); setTimer(0); nextQuestion(); }}
                        className="text-outline font-label-bold text-xs hover:text-primary transition-colors uppercase tracking-widest px-4"
                      >
                        Skip Vector
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !answerText.trim()}
                        className="flex-1 md:flex-none px-12 py-5 rounded-[24px] bg-primary text-on-primary font-display font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                      >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <ShieldAlert size={24} />}
                        {isLastQuestion ? 'Finalize Mission' : 'Submit Intel'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
