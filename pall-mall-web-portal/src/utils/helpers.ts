/**
 * Helper utility functions
 */

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Truncate text
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text?.charAt(0).toUpperCase() + text?.slice(1).toLowerCase();
};

/**
 * Format phone number with country code for API payload
 * Ensures format: "+44 7986588525" (country code + space + number)
 * @param phoneNumber - Raw phone number (may include country code)
 * @param countryCode - Country code with + (e.g., "+44")
 * @returns Formatted phone number with space after country code
 */
export const formatPhoneNumberWithCountryCode = (
  phoneNumber: string | undefined,
  countryCode: string | undefined
): string | undefined => {
  if (!phoneNumber || !countryCode) {
    return phoneNumber;
  }

  // Remove all spaces and non-digit characters except +
  const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Remove country code from the number if present
  const countryCodeDigits = countryCode.replace('+', '');
  let numberWithoutCode = cleanNumber;
  
  // Remove leading + if present
  if (numberWithoutCode.startsWith('+')) {
    numberWithoutCode = numberWithoutCode.substring(1);
  }
  
  // Remove country code digits if they're at the start
  if (numberWithoutCode.startsWith(countryCodeDigits)) {
    numberWithoutCode = numberWithoutCode.substring(countryCodeDigits.length);
  }
  
  // Format: country code + space + number
  return `${countryCode} ${numberWithoutCode}`;
};

/**
 * Format dropdown label from backend format to UI-friendly format
 * Converts: "ADMIN" → "Admin", "24_days" → "24 Days", "test_user" → "Test User"
 * @param label - Raw label from backend
 * @returns Formatted label for UI display
 */
export const formatDropdownLabel = (label: string): string => {
  if (!label) return label;
  
  // Replace underscores with spaces
  const withSpaces = label.replace(/_/g, ' ');
  
  // Convert to title case (capitalize first letter of each word)
  return withSpaces
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format ISO date string to readable format
 * @param dateString - ISO date string (e.g., "2026-01-25T22:10:19.1907")
 * @returns Formatted date string (e.g., "2025-10-30 09:15") or "-" if invalid
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString || dateString === "null" || dateString === "undefined") {
    return "-";
  }

  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    // Format: "2025-10-30 09:15"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return "-";
  }
};

// Find option by value in select options

export const findOption = (options = [], value: string | null) => {
  if (!value) return null;
  return options.find((opt) => opt.value === value) ?? null;
};

// Camel Case conversion => Eg: "hello world"  => using this, it becomes "Hello World"

export const convertToCamelCase = (text?: string | null): string => {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Handle Enter key press to submit
 */
export const handleEnterStart = (e: any, callback: () => void) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    callback();
  }
};

/**
 * Download file from URL
 */

export const downloadFromUrl = (url: string) => {
  window.open(url, "_blank");
};



 
  // Example:
  //  "xyZ abc SS" → "Xyz Abc SS"
 
export const formatUserName = (text?: string | null): string => {
  if (!text) return "";

  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      // Preserve initials like SS, IT, HR
      if (word === word.toUpperCase()) {
        return word;
      }

      // Normal name formatting
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

