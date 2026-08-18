export const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s.,'\-()&]+$/;
export const isValidText = (text) => SAFE_TEXT_REGEX.test(text);