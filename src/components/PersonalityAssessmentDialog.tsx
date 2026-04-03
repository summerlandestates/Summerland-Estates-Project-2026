import { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  computePersonalityAssessment,
  personalityQuestions,
  type PersonalityAssessmentResult,
} from '@/lib/personalityAssessment';

interface PersonalityAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: PersonalityAssessmentResult) => Promise<void> | void;
  initialResult?: PersonalityAssessmentResult | null;
  title?: string;
  description?: string;
  saving?: boolean;
  inline?: boolean;
}

export default function PersonalityAssessmentDialog({
  open,
  onOpenChange,
  onComplete,
  initialResult,
  title = 'Personality Assessment',
  description = 'Answer a few quick questions to generate a personality summary for your profile.',
  saving = false,
  inline = false,
}: PersonalityAssessmentDialogProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setStep(0);
      setAnswers({});
    }
  }, [open]);

  const currentQuestion = personalityQuestions[step];
  const allAnswered = personalityQuestions.every((question) => Boolean(answers[question.id]));
  const result = useMemo(() => {
    if (!allAnswered) return null;
    return computePersonalityAssessment(answers);
  }, [allAnswered, answers]);

  const handleSelect = (value: string) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  };

  const handleContinue = async () => {
    if (step < personalityQuestions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    if (result) {
      await onComplete(result);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className={inline ? 'rounded-[28px] border border-border/70 bg-card shadow-lg' : 'fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4'}>
      <div className={`relative overflow-hidden rounded-[28px] border border-border/70 bg-card ${inline ? '' : 'max-h-[90vh] w-full max-w-3xl shadow-2xl'}`}>
        {inline ? (
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        )}

        <div className="border-b border-border/60 bg-gradient-to-r from-[#F7F2EC] to-white px-6 py-6 sm:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE3D8] text-[#8A8279]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-semibold text-foreground">{title}</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${inline ? 'space-y-6 px-6 py-6 sm:px-8' : 'max-h-[calc(90vh-10rem)] space-y-6 overflow-y-auto px-6 py-6 sm:px-8'}`}>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span>Question {Math.min(step + 1, personalityQuestions.length)} of {personalityQuestions.length}</span>
            {initialResult ? <span>Current: {initialResult.type}</span> : null}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#A89F91] transition-all duration-300"
              style={{ width: `${((step + 1) / personalityQuestions.length) * 100}%` }}
            />
          </div>

          {result && step === personalityQuestions.length - 1 ? (
            <div className="space-y-5 rounded-[24px] border border-border/70 bg-muted/20 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full bg-[#A89F91] px-4 py-1.5 text-white">{result.type}</Badge>
                <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                  {result.headline}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">{result.summary}</p>
                <p className="text-sm text-muted-foreground">{result.workStyle}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {result.strengths.map((strength) => (
                  <div key={strength} className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground">
                    {strength}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 rounded-[24px] border border-border/70 bg-muted/10 p-5 sm:p-6">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{currentQuestion.dimension}</p>
                <h3 className="text-2xl font-heading font-semibold text-foreground">{currentQuestion.prompt}</h3>
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <span>{currentQuestion.leftLabel}</span>
                  <span>{currentQuestion.rightLabel}</span>
                </div>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option) => {
                  const selected = answers[currentQuestion.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`rounded-[22px] border px-5 py-4 text-left transition-all ${
                        selected
                          ? 'border-[#A89F91] bg-[#F8F4EF] shadow-sm'
                          : 'border-border/70 bg-background hover:border-[#C9BFAF] hover:bg-[#FCFAF8]'
                      }`}
                    >
                      <p className="text-base font-medium text-foreground">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 px-6 py-5 sm:px-8">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (step === 0) {
                    onOpenChange(false);
                    return;
                  }
                  setStep((current) => Math.max(current - 1, 0));
                }}
                className="rounded-xl"
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleContinue}
              disabled={saving || !answers[currentQuestion.id]}
              className="rounded-xl bg-[#A89F91] text-white hover:bg-[#8A8279]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : step === personalityQuestions.length - 1 ? (
                'Use This Result'
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
