-- Function to generate sample English learning content for a user
CREATE OR REPLACE FUNCTION public.generate_english_sample_data(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  english_folder_id uuid;
  vocab_deck_id uuid;
  grammar_deck_id uuid;
  phrases_deck_id uuid;
BEGIN
  -- Create English folder
  INSERT INTO public.folders (user_id, name)
  VALUES (target_user_id, 'English')
  RETURNING id INTO english_folder_id;

  -- Create vocabulary deck
  INSERT INTO public.decks (user_id, folder_id, name)
  VALUES (target_user_id, english_folder_id, 'Basic Vocabulary')
  RETURNING id INTO vocab_deck_id;

  -- Create grammar deck
  INSERT INTO public.decks (user_id, folder_id, name)
  VALUES (target_user_id, english_folder_id, 'Grammar Fundamentals')
  RETURNING id INTO grammar_deck_id;

  -- Create phrases deck
  INSERT INTO public.decks (user_id, folder_id, name)
  VALUES (target_user_id, english_folder_id, 'Common Phrases')
  RETURNING id INTO phrases_deck_id;

  -- Insert vocabulary cards
  INSERT INTO public.cards (user_id, deck_id, front, back) VALUES
  (target_user_id, vocab_deck_id, 'Apple', 'A round fruit that grows on trees, usually red, green, or yellow'),
  (target_user_id, vocab_deck_id, 'Beautiful', 'Having qualities that give pleasure to the senses; attractive'),
  (target_user_id, vocab_deck_id, 'Courage', 'The ability to do something frightening; bravery'),
  (target_user_id, vocab_deck_id, 'Delicious', 'Having a very pleasant taste or smell'),
  (target_user_id, vocab_deck_id, 'Extraordinary', 'Very unusual or remarkable; going beyond what is normal'),
  (target_user_id, vocab_deck_id, 'Fantastic', 'Extremely good; excellent'),
  (target_user_id, vocab_deck_id, 'Generous', 'Showing readiness to give more than necessary; unselfish'),
  (target_user_id, vocab_deck_id, 'Harmony', 'A pleasing combination or arrangement of different things'),
  (target_user_id, vocab_deck_id, 'Inspire', 'To fill someone with the urge to do something creative'),
  (target_user_id, vocab_deck_id, 'Journey', 'An act of traveling from one place to another');

  -- Insert grammar cards
  INSERT INTO public.cards (user_id, deck_id, front, back) VALUES
  (target_user_id, grammar_deck_id, 'Present Simple - Formation', 'Subject + base verb (+ s/es for 3rd person singular)\nExample: I work / He works'),
  (target_user_id, grammar_deck_id, 'Past Simple - Formation', 'Subject + verb + ed (regular) or irregular past form\nExample: I worked / I went'),
  (target_user_id, grammar_deck_id, 'Present Perfect - Formation', 'Subject + have/has + past participle\nExample: I have worked / She has gone'),
  (target_user_id, grammar_deck_id, 'Future Simple - Formation', 'Subject + will + base verb\nExample: I will work / They will go'),
  (target_user_id, grammar_deck_id, 'Articles - A/An/The', 'A: before consonant sounds (a car)\nAn: before vowel sounds (an apple)\nThe: specific items (the car we bought)'),
  (target_user_id, grammar_deck_id, 'Comparative Adjectives', 'Short adjectives: add -er (bigger, faster)\nLong adjectives: more + adjective (more beautiful)\nIrregular: good→better, bad→worse'),
  (target_user_id, grammar_deck_id, 'Question Formation', 'With "be": Be + subject + complement? (Are you ready?)\nWith other verbs: Do/Does + subject + verb? (Do you like coffee?)'),
  (target_user_id, grammar_deck_id, 'Prepositions of Time', 'IN: months, years, seasons (in March, in 2024)\nON: days, dates (on Monday, on July 4th)\nAT: specific times (at 3 PM, at noon)'),
  (target_user_id, grammar_deck_id, 'Modal Verbs - Can/Could', 'Can: present ability, permission, possibility\nCould: past ability, polite requests, possibility\nExample: I can swim / Could you help me?'),
  (target_user_id, grammar_deck_id, 'Conditional Sentences - Type 1', 'If + present simple, will + base verb\nUsed for real future possibilities\nExample: If it rains, I will stay home');

  -- Insert common phrases cards
  INSERT INTO public.cards (user_id, deck_id, front, back) VALUES
  (target_user_id, phrases_deck_id, 'How are you?', 'A common greeting asking about someone''s well-being\nResponses: "I''m fine, thank you" / "Good, how about you?"'),
  (target_user_id, phrases_deck_id, 'Nice to meet you', 'Said when meeting someone for the first time\nResponse: "Nice to meet you too" / "Likewise"'),
  (target_user_id, phrases_deck_id, 'Excuse me', 'Used to politely get attention or apologize for a small mistake\nUsage: "Excuse me, where is the bathroom?" / "Excuse me" (when passing by)'),
  (target_user_id, phrases_deck_id, 'I''m sorry', 'Used to apologize\nVariations: "Sorry" (informal) / "I apologize" (formal)'),
  (target_user_id, phrases_deck_id, 'Thank you very much', 'A polite way to express gratitude\nResponse: "You''re welcome" / "No problem" / "My pleasure"'),
  (target_user_id, phrases_deck_id, 'Could you please...?', 'A polite way to make requests\nExample: "Could you please help me?" / "Could you please repeat that?"'),
  (target_user_id, phrases_deck_id, 'I don''t understand', 'Used when you need clarification\nAlternatives: "I''m confused" / "Could you explain that again?"'),
  (target_user_id, phrases_deck_id, 'What does ... mean?', 'Used to ask for the meaning of a word or phrase\nExample: "What does ''serendipity'' mean?"'),
  (target_user_id, phrases_deck_id, 'Have a great day!', 'A friendly farewell\nAlternatives: "Have a good day" / "Take care" / "See you later"'),
  (target_user_id, phrases_deck_id, 'It''s my pleasure', 'A polite response to "thank you"\nAlternatives: "You''re welcome" / "Don''t mention it" / "No worries"');

END;
$$;

-- Create sample data for any authenticated user (can be called from the app)
-- This function can be called: SELECT generate_english_sample_data(auth.uid());