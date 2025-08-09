# Calendar Day Study Logic

## What Changed

Updated the study logic to allow studying all cards due within the **current calendar day**, not just cards due "right now".

## New Behavior

### Before
- Only cards due **right now** or overdue were available for study
- If it's 9 AM and a card is due at 3 PM today, it would NOT be available

### After  
- All cards due **today** (same calendar day) are available for study
- If it's 9 AM and a card is due at 3 PM today, it IS available for study

## Examples

**Scenario**: It's currently 9:00 AM on January 15th

| Card Due Time | Before | After | Display |
|---------------|--------|-------|---------|
| Jan 15, 8:00 AM | ✅ Available | ✅ Available | "1h ago" |
| Jan 15, 9:00 AM | ✅ Available | ✅ Available | "Due now" |
| Jan 15, 3:00 PM | ❌ Not available | ✅ **Available** | "Due at 3:00 PM" |
| Jan 15, 11:59 PM | ❌ Not available | ✅ **Available** | "Due at 11:59 PM" |
| Jan 16, 9:00 AM | ❌ Not available | ❌ Not available | Won't show |

## Benefits

1. **Flexible Study Schedule**: Users can study cards early if they have time
2. **Complete Daily Tasks**: Users can finish all their daily reviews in one session
3. **Better User Experience**: No need to wait until exact due time to study
4. **Intuitive Behavior**: Matches user expectations of "daily" study sessions

## Technical Implementation

### Database Changes
```sql
-- Old logic: only cards due NOW or overdue
due_date <= NOW()

-- New logic: cards due TODAY or overdue  
due_date::date <= CURRENT_DATE
```

### Frontend Changes
- Updated `getDueDateStatus()` to check if card is due on same calendar day
- Uses `toDateString()` comparison for accurate calendar day matching
- Maintains exact time display ("Due at 3:00 PM") for clarity

## Study Queue Categories

1. **New Cards**: Never studied before
2. **Due Today**: Due anytime today (past or future)
3. **Overdue**: Due on previous days
4. **Learning**: Short-interval cards from "Again" responses

Cards due tomorrow or later are still filtered out and won't appear in the study queue.