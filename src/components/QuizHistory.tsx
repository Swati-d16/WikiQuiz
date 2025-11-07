import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ExternalLink, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface QuizRecord {
  id: string;
  wikipedia_url: string;
  article_title: string;
  questions: Question[];
  created_at: string;
}

export const QuizHistory = () => {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizRecord | null>(null);
  const [quizMode, setQuizMode] = useState<"view" | "take">("view");
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuizzes((data || []) as unknown as QuizRecord[]);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast({
        title: "Load Failed",
        description: "Could not load quiz history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-card shadow-card">
        <p className="text-muted-foreground">
          No quizzes generated yet. Create your first quiz from the Generate tab!
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article Title</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id} className="hover:bg-muted/50 transition-smooth">
                  <TableCell className="font-medium">{quiz.article_title}</TableCell>
                  <TableCell>{quiz.questions.length}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(quiz.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setQuizMode("take");
                          setSelectedQuiz(quiz);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Take Quiz
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuizMode("view");
                          setSelectedQuiz(quiz);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={quiz.wikipedia_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{quizMode === "take" ? "Take Quiz" : "Quiz Details"}</DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <QuizDisplay
              quiz={{
                id: selectedQuiz.id,
                title: selectedQuiz.article_title,
                url: selectedQuiz.wikipedia_url,
                questions: selectedQuiz.questions,
              }}
              mode={quizMode}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};