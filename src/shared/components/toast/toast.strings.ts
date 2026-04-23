export const TOAST_STRINGS = {
  // Default titles per type
  DEFAULT_TITLE_SUCCESS: 'Success',
  DEFAULT_TITLE_ERROR: 'Error',
  DEFAULT_TITLE_WARNING: 'Warning',
  DEFAULT_TITLE_INFO: 'Info',

  // Default bodies per type
  DEFAULT_BODY_SUCCESS: 'Operation completed successfully.',
  DEFAULT_BODY_ERROR: 'Something went wrong. Please try again.',
  DEFAULT_BODY_WARNING: 'Please review before continuing.',
  DEFAULT_BODY_INFO: 'Here is some information for you.',

  // Toast type keys — used as record keys in the config
  TYPE_SUCCESS: 'success',
  TYPE_ERROR: 'error',
  TYPE_WARNING: 'warning',
  TYPE_INFO: 'info',
} as const;

export type ToastType = 'success' | 'error' | 'warning' | 'info';
