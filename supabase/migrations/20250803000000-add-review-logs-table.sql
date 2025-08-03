-- Create review_logs table for storing FSRS review history
-- This enables undo functionality using ts-fsrs rollback() method

CREATE TABLE public.review_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Store complete RecordLog object as JSONB for ts-fsrs rollback
  record_log JSONB NOT NULL,
  
  -- Quick access fields (extracted from record_log for queries)
  rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 4),
  review_time TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_review_logs_card_id 
    FOREIGN KEY (card_id) REFERENCES public.cards(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_logs_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.review_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own review logs" ON public.review_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own review logs" ON public.review_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own review logs" ON public.review_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own review logs" ON public.review_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_review_logs_user_id ON public.review_logs(user_id);
CREATE INDEX idx_review_logs_card_id ON public.review_logs(card_id);
CREATE INDEX idx_review_logs_review_time ON public.review_logs(review_time DESC);
CREATE INDEX idx_review_logs_user_card ON public.review_logs(user_id, card_id, review_time DESC);

-- Trigger for updated_at
CREATE TRIGGER update_review_logs_updated_at
  BEFORE UPDATE ON public.review_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments
COMMENT ON TABLE public.review_logs IS 'Stores FSRS review history for undo functionality using ts-fsrs rollback';
COMMENT ON COLUMN public.review_logs.record_log IS 'Complete RecordLog object from ts-fsrs for rollback functionality';
COMMENT ON COLUMN public.review_logs.rating IS 'FSRS rating given (0=Manual, 1=Again, 2=Hard, 3=Good, 4=Easy)';
COMMENT ON COLUMN public.review_logs.review_time IS 'When the review was performed';