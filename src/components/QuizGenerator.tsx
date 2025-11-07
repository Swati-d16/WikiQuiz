import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QuizDisplay } from "./QuizDisplay";

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
  id: string;
  title: string;
  url: string;
  questions: Question[];
}

export const QuizGenerator = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Wikipedia URL",
        variant: "destructive",
      });
      return;
    }

    if (!url.includes("wikipedia.org")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Wikipedia URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedQuiz(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { url },
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedQuiz(data.quiz);
        toast({
          title: "Quiz Generated!",
          description: `Created ${data.quiz.questions.length} questions`,
        });
      } else {
        throw new Error(data?.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-card shadow-card hover:shadow-card-hover transition-smooth">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-card-foreground">Generate New Quiz</h2>
          </div>
          
          <div className="flex gap-3">
            <Input
              placeholder="https://en.wikipedia.org/wiki/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Enter any Wikipedia article URL to generate an AI-powered quiz
          </p>
        </div>
      </Card>

      {generatedQuiz && <QuizDisplay quiz={generatedQuiz} />}
    </div>
  );
};