-- Performance Optimization Migration

-- 1. Add missing indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_card_fsrs_user_id ON public.card_fsrs(user_id);
CREATE INDEX IF NOT EXISTS idx_card_fsrs_card_id ON public.card_fsrs(card_id);
CREATE INDEX IF NOT EXISTS idx_card_fsrs_due_date ON public.card_fsrs(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_folder_id ON public.decks(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);

-- 2. Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_cards_user_deck ON public.cards(user_id, deck_id);
CREATE INDEX IF NOT EXISTS idx_card_fsrs_user_due ON public.card_fsrs(user_id, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_card_fsrs_user_state ON public.card_fsrs(user_id, state);

-- 3. Add proper foreign key constraints
ALTER TABLE public.cards ADD CONSTRAINT fk_cards_deck_id 
  FOREIGN KEY (deck_id) REFERENCES public.decks(id) ON DELETE CASCADE;

ALTER TABLE public.decks ADD CONSTRAINT fk_decks_folder_id 
  FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;

ALTER TABLE public.card_fsrs ADD CONSTRAINT fk_card_fsrs_card_id 
  FOREIGN KEY (card_id) REFERENCES public.cards(id) ON DELETE CASCADE;

-- 4. Create optimized view for cards with FSRS data and deck info
CREATE OR REPLACE VIEW public.cards_with_details AS
SELECT 
  c.id,
  c.front,
  c.back,
  c.user_id,
  c.deck_id,
  c.created_at,
  c.updated_at,
  d.name as deck_name,
  f.name as folder_name,
  f.id as folder_id,
  cf.state,
  cf.due_date,
  cf.difficulty,
  cf.stability,
  cf.reps,
  cf.lapses,
  cf.last_review
FROM public.cards c
LEFT JOIN public.decks d ON c.deck_id = d.id
LEFT JOIN public.folders f ON d.folder_id = f.id
LEFT JOIN public.card_fsrs cf ON c.id = cf.card_id;

-- 5. Create view for study cards (cards due for review)
CREATE OR REPLACE VIEW public.study_cards AS
SELECT *
FROM public.cards_with_details
WHERE due_date IS NULL OR due_date <= NOW()
ORDER BY 
  CASE 
    WHEN due_date IS NULL THEN 0  -- New cards first
    ELSE 1
  END,
  due_date ASC NULLS FIRST;

-- 6. Enable realtime for better performance monitoring
ALTER TABLE public.cards REPLICA IDENTITY FULL;
ALTER TABLE public.card_fsrs REPLICA IDENTITY FULL;
ALTER TABLE public.decks REPLICA IDENTITY FULL;
ALTER TABLE public.folders REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_fsrs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.decks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.folders;

-- 7. Optimize autovacuum settings for high-activity tables
ALTER TABLE public.cards SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE public.card_fsrs SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- 8. Create function to get user deck count efficiently
CREATE OR REPLACE FUNCTION public.get_deck_card_counts(p_user_id UUID)
RETURNS TABLE(deck_id UUID, card_count BIGINT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT d.id as deck_id, COUNT(c.id) as card_count
  FROM public.decks d
  LEFT JOIN public.cards c ON d.id = c.deck_id
  WHERE d.user_id = p_user_id
  GROUP BY d.id;
$$;