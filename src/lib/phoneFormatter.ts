/**
 * Phone number formatting utility
 * Converts various phone number formats to E.164 standard with country code
 * Handles Zimbabwe phone numbers in all formats
 */

export function formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, parentheses, quotes
    let cleaned = phoneNumber
        .toString()
        .replace(/[\s\-()"']/g, '')
        .trim();

    // Handle empty strings
    if (!cleaned) return phoneNumber;

    // Remove + if present so we can normalize
    cleaned = cleaned.replace(/^\+/, '');

    // If it's 10 digits starting with 0, remove the leading 0 (local Zimbabwe format)
    // e.g., 0787279158 -> 787279158
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = cleaned.substring(1);
    }

    // If it's 9 digits, it's missing the country code - it's a Zimbabwe number
    // e.g., 787279158 -> 263787279158
    if (cleaned.length === 9 && !cleaned.startsWith('263')) {
        cleaned = '263' + cleaned;
    }

    // If it has country code but missing +, add it
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    return cleaned;
}

/**
 * Display format for phone numbers in UI
 * Shows full E.164 format with country code
 */
export function displayPhoneNumber(phoneNumber: string): string {
    return formatPhoneNumber(phoneNumber);
}

/**
 * Validate if phone number has a country code
 */
export function hasCountryCode(phoneNumber: string): boolean {
    const formatted = formatPhoneNumber(phoneNumber);
    return formatted.startsWith('+') && formatted.length > 1;
}
