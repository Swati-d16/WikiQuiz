import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Target, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  relatedTopics: string[];
}

interface Quiz {
  id?: string;
  title: string;
  url: string;
  questions: Question[];
}

interface QuizDisplayProps {
  quiz: Quiz;
  mode?: "view" | "take";
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const QuizDisplay = ({ quiz, mode = "view" }: QuizDisplayProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const score = isSubmitted ? calculateScore() : 0;
  const allAnswered = quiz.questions.every((_, idx) => selectedAnswers[idx]);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
            <p className="text-sm opacity-90 mb-3">
              {quiz.questions.length} questions generated from Wikipedia
            </p>
            {mode === "take" && isSubmitted && (
              <div className="mt-3 text-lg font-semibold">
                Score: {score} / {quiz.questions.length} ({Math.round((score / quiz.questions.length) * 100)}%)
              </div>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <a href={quiz.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Article
            </a>
          </Button>
        </div>
      </Card>

      {mode === "take" && !isSubmitted && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            size="lg"
            className="min-w-[200px]"
          >
            Submit Quiz
          </Button>
        </div>
      )}

      {mode === "take" && isSubmitted && (
        <div className="flex justify-center">
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            Retake Quiz
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {quiz.questions.map((q, idx) => (
          <Card key={idx} className="p-6 bg-gradient-card shadow-card hover:shadow-card-hover transition-smooth">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {idx + 1}
                    </span>
                    <Badge className={getDifficultyColor(q.difficulty)}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    {q.question}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(q.options).map(([key, value]) => {
                  const isSelected = mode === "take" && selectedAnswers[idx] === key;
                  const isCorrect = key === q.correctAnswer;
                  const showCorrect = mode === "view" || isSubmitted;
                  const showWrong = mode === "take" && isSubmitted && isSelected && !isCorrect;

                  return (
                    <div
                      key={key}
                      onClick={() => mode === "take" && handleAnswerSelect(idx, key)}
                      className={`p-4 rounded-lg border-2 transition-smooth ${
                        mode === "take" && !isSubmitted ? 'cursor-pointer hover:border-primary' : ''
                      } ${
                        showCorrect && isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : showWrong
                          ? 'border-red-500 bg-red-50 dark:bg-red-950'
                          : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-bold text-primary min-w-[24px]">{key}.</span>
                        <span className="text-card-foreground flex-1">{value}</span>
                        {showCorrect && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        {showWrong && (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {(mode === "view" || isSubmitted) && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-card-foreground mb-1">
                        Correct Answer: {q.correctAnswer}
                      </p>
                      <p className="text-sm text-muted-foreground">{q.explanation}</p>
                    </div>
                  </div>

                  {q.relatedTopics && q.relatedTopics.length > 0 && (
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-card-foreground mb-1">
                          Related Topics:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {q.relatedTopics.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};