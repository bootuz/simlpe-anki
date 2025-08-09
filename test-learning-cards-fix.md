# Testing the "Again" Cards Fix

## What Was Fixed

The issue where cards answered with "Again" would disappear from the study queue has been resolved by:

1. **Updated `study_cards` SQL view** to include Learning/Relearning cards due within 30 minutes
2. **Enhanced Study.tsx** with visual indicators for card states
3. **Improved card status display** to show Learning, Relearning, New, Due, and Overdue states

## How to Test

### Before the Fix
1. Study a card and answer "Again"
2. Immediately try to study again
3. **Bug**: The card would disappear from study queue

### After the Fix
1. Study a card and answer "Again" 
2. The card should now:
   - Stay in the study queue if it's due within 30 minutes
   - Show a "Learning" or "Relearning" badge with repeat icon
   - Be available for immediate re-study

### Test Steps

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Apply Database Migration** (if you have Supabase CLI configured)
   ```bash
   npx supabase db push
   ```
   Or manually run the SQL from: `supabase/migrations/20250730130000-fix-learning-cards-study-queue.sql`

3. **Test the Flow**
   - Go to Study page
   - Answer a card with "Again"  
   - Complete the study session
   - Immediately start studying again
   - **Expected**: The "Again" card should appear with "Learning" badge

4. **Verify Visual Indicators**
   - New cards show "New" badge with book icon
   - Learning cards show "Learning" badge with repeat icon  
   - Relearning cards show "Relearning" badge with repeat icon
   - Overdue cards show time overdue with appropriate icons

## Technical Details

### Database Changes
- `study_cards` view now includes: `(state = 'Learning' OR state = 'Relearning') AND due_date <= NOW() + INTERVAL '30 minutes'`
- Cards are prioritized: New → Overdue/Due → Learning → Future

### Code Changes
- Added `state` field to `StudyCard` interface
- Added `getCardStatus()` helper function
- Enhanced study interface with status badges and icons
- Improved card metadata display

The fix ensures that FSRS learning intervals (1m, 10m) don't cause cards to disappear from the study queue while maintaining the original behavior of only showing New, Due Today, and Overdue cards.