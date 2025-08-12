-- Add tags column to cards table to support tagging
ALTER TABLE public.cards 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for better performance on tag queries
CREATE INDEX idx_cards_tags ON public.cards USING GIN (tags);

-- Create a function to search cards by tags
CREATE OR REPLACE FUNCTION search_cards_by_tags(tag_query TEXT[])
RETURNS TABLE (
  id UUID,
  front TEXT,
  back TEXT,
  deck_id UUID,
  user_id UUID,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE sql STABLE AS $$
  SELECT 
    c.id,
    c.front,
    c.back,
    c.deck_id,
    c.user_id,
    c.tags,
    c.created_at,
    c.updated_at
  FROM public.cards c
  WHERE c.tags && tag_query;
$$;

-- Create a view for cards with tag statistics
CREATE OR REPLACE VIEW cards_with_tag_stats AS
SELECT 
  c.*,
  array_length(c.tags, 1) as tag_count
FROM public.cards c;

-- Create function to get all unique tags for a user
CREATE OR REPLACE FUNCTION get_user_tags(user_uuid UUID)
RETURNS TABLE (tag TEXT, count BIGINT) 
LANGUAGE sql STABLE AS $$
  SELECT 
    unnest(tags) as tag,
    COUNT(*) as count
  FROM public.cards 
  WHERE user_id = user_uuid 
    AND tags IS NOT NULL 
    AND array_length(tags, 1) > 0
  GROUP BY tag
  ORDER BY count DESC, tag;
$$;