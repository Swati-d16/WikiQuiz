import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizGenerator } from "@/components/QuizGenerator";
import { QuizHistory } from "@/components/QuizHistory";
import { Brain, History } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              WikiQuiz AI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform any Wikipedia article into an engaging, AI-powered educational quiz
          </p>
        </header>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Generate Quiz
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Past Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <QuizGenerator />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <QuizHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;