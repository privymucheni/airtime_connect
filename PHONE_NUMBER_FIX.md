# Phone Number Country Code Display Fix

## Issue
Phone numbers were displaying without country codes in the application (e.g., `+787279158` instead of `+263787279158`). This was particularly noticeable in the recipients table.

## Root Cause
1. **Phone numbers stored inconsistently** - Numbers were being stored in the database without proper E.164 formatting
2. **No formatting on display** - Phone numbers were displayed as-is from the database without any transformation
3. **Existing formatter not applied** - A `formatPhoneNumber` function existed in the code but wasn't being used when retrieving/displaying data

## Solution Implemented

### 1. Created Centralized Phone Formatter ([src/lib/phoneFormatter.ts](src/lib/phoneFormatter.ts))
- `formatPhoneNumber()` - Converts any phone number format to E.164 standard with country code
- `displayPhoneNumber()` - UI-friendly display format
- `hasCountryCode()` - Validates if phone number includes country code

**Handles:**
- Local Zimbabwean numbers (07xxxxxxxx or 086xxxxxxx) → Converts to +263 country code
- Numbers without "+" prefix → Adds it automatically
- Cleans spaces, dashes, parentheses, quotes

### 2. Updated Server Action ([src/actions/company.ts](src/actions/company.ts))
- Imports the new `formatPhoneNumber` function
- Formats all recipient phone numbers before returning dashboard data
- Ensures data is already formatted when it reaches the UI

### 3. Updated UI Component ([src/components/TransactionDetailModal.tsx](src/components/TransactionDetailModal.tsx))
- Imports `displayPhoneNumber` function
- Applies formatting as a safety layer when displaying phone numbers
- Provides defense-in-depth against any unformatted data

## Examples

### Before
```
+787279158  ❌ Missing country code
0787279158  ❌ Local format, no country code
787279158   ❌ No prefix at all
```

### After
```
+263787279158  ✅ Full E.164 format with Zimbabwe country code
```

## Best Practices Going Forward

1. **Always use `formatPhoneNumber()`** when storing phone numbers from user input
2. **Use `displayPhoneNumber()`** when showing phone numbers in the UI
3. **Store phone numbers in database** using the formatted version (E.164)
4. **Validate with `hasCountryCode()`** before processing for SMS/notifications

## Where to Apply Formatting

### When Storing Phone Numbers
```typescript
const formatted = formatPhoneNumber(userInput);
await prisma.recipient.create({
    data: { phoneNumber: formatted, ... }
});
```

### When Displaying Phone Numbers
```typescript
<p>{displayPhoneNumber(phoneNumber)}</p>
```

### When Sending SMS
```typescript
const formatted = formatPhoneNumber(phoneNumber);
await sendSMS(formatted, message);
```

## Files Modified
- ✅ `src/lib/phoneFormatter.ts` - New utility file
- ✅ `src/actions/company.ts` - Format phone numbers in dashboard data
- ✅ `src/components/TransactionDetailModal.tsx` - Format phone numbers in display

## Related Configuration
The `formatPhoneNumber` function previously existed in `src/actions/company.ts` but has been moved to the centralized utility for reusability.
