-- Create FSRS data table
CREATE TABLE public.card_fsrs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- FSRS algorithm fields
  state TEXT NOT NULL DEFAULT 'New' CHECK (state IN ('New', 'Learning', 'Review', 'Relearning')),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stability REAL NOT NULL DEFAULT 0,
  difficulty REAL NOT NULL DEFAULT 0,
  elapsed_days INTEGER NOT NULL DEFAULT 0,
  scheduled_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  last_review TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(card_id)
);

-- Enable RLS on card_fsrs table
ALTER TABLE public.card_fsrs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for card_fsrs
CREATE POLICY "Users can view their own card FSRS data" ON public.card_fsrs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own card FSRS data" ON public.card_fsrs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own card FSRS data" ON public.card_fsrs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own card FSRS data" ON public.card_fsrs
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_card_fsrs_updated_at
  BEFORE UPDATE ON public.card_fsrs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Remove FSRS fields from cards table
ALTER TABLE public.cards 
  DROP COLUMN state,
  DROP COLUMN due_date,
  DROP COLUMN stability,
  DROP COLUMN difficulty,
  DROP COLUMN elapsed_days,
  DROP COLUMN scheduled_days,
  DROP COLUMN reps,
  DROP COLUMN lapses,
  DROP COLUMN last_review;

-- Create indexes for better performance
CREATE INDEX idx_card_fsrs_user_id ON public.card_fsrs(user_id);
CREATE INDEX idx_card_fsrs_card_id ON public.card_fsrs(card_id);
CREATE INDEX idx_card_fsrs_due_date ON public.card_fsrs(due_date);
CREATE INDEX idx_card_fsrs_state ON public.card_fsrs(state);