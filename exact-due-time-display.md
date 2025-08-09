# Exact Due Time Display

## What Changed

Replaced vague due date labels like "Due soon", "Due now" with exact due times to provide clarity on when cards are actually due.

## New Display Format

### For Overdue Cards
- `1m ago` - 1 minute overdue
- `2h ago` - 2 hours overdue  
- `3d ago` - 3 days overdue

### For Cards Due Soon
- `Due now` - Due within 1 minute
- `Due in 5m` - Due in 5 minutes
- `Due in 2h` - Due in 2 hours

### For Cards Due Later Today
- `Due at 3:30 PM` - Due later today at specific time

### For Cards Due Tomorrow
- `Due tomorrow at 9:00 AM` - Due tomorrow at specific time

### For Cards Due Later
- `Due Jan 15 at 2:00 PM` - Due on specific future date

## Example Scenarios

### After Answering "Again"
**Before**: Shows "Due now" immediately after answering "Again"
**After**: Shows "Due in 1m" (or whatever the FSRS interval is)

This eliminates confusion where cards show as "Due now" when they're actually scheduled for a few minutes later.

### Regular Study Cards
- New cards: "New"
- Cards due in 30 minutes: "Due in 30m"
- Cards due in 3 hours: "Due in 3h"
- Cards due at 5 PM today: "Due at 5:00 PM"
- Cards due tomorrow: Won't appear (filtered out as future cards)

## Benefits

1. **Clarity**: Users know exactly when cards are due
2. **No Confusion**: "Again" cards show their actual due time
3. **Better Planning**: Users can see if they should wait or study now
4. **Accurate Information**: Precise timing instead of vague categories

## Technical Implementation

- Added `formatExactDueTime()` function in Home.tsx
- Uses browser's `toLocaleTimeString()` and `toLocaleDateString()` for proper formatting
- Maintains existing filtering logic (only New, Due Today, Overdue)
- Provides millisecond-accurate timing calculations