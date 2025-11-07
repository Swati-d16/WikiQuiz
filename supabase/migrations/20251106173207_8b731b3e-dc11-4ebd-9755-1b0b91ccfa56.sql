-- Create table for storing Wikipedia quizzes
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wikipedia_url TEXT NOT NULL,
  article_title TEXT NOT NULL,
  scraped_content TEXT,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on created_at for faster sorting
CREATE INDEX idx_quizzes_created_at ON public.quizzes(created_at DESC);

-- Create index on wikipedia_url for faster lookups
CREATE INDEX idx_quizzes_url ON public.quizzes(wikipedia_url);

-- Enable Row Level Security
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read quizzes (public app)
CREATE POLICY "Allow public read access to quizzes"
  ON public.quizzes
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert quizzes (public app)
CREATE POLICY "Allow public insert access to quizzes"
  ON public.quizzes
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();