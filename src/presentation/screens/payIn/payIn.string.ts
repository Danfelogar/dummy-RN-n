export const PAY_IN_STRINGS = {
  // Screen title
  SCREEN_TITLE: 'Create PayIn',

  //Info banner offline
  INFO_BANNER_TITLE_OFFLINE: "You're offline",
  INFO_BANNER_SUBTITLE_OFFLINE:
    'Your payment will be queued and sent automatically when your connection is restored.',
  // Info banner
  INFO_BANNER_TITLE: 'Precision Transaction',
  INFO_BANNER_SUBTITLE:
    'Ensure all customer data matches the official registry for secure processing.',

  // Field labels
  AMOUNT_LABEL: 'Amount',
  CUSTOMER_ID_LABEL: 'Customer ID',
  PAYMENT_METHOD_LABEL: 'Payment Method',
  DESCRIPTION_LABEL: 'Description (optional)',

  // Placeholders
  AMOUNT_PLACEHOLDER: '0.00',
  CUSTOMER_ID_PLACEHOLDER: 'Enter identification number',
  DESCRIPTION_PLACEHOLDER: 'Add a note about this payment...',

  // Payment methods
  PAYMENT_METHOD_CARD: 'CARD',
  PAYMENT_METHOD_BANK_TRANSFER: 'BANK_TRANSFER',
  PAYMENT_METHOD_CASH: 'CASH',

  // Summary
  FEE_ESTIMATE_LABEL: 'Fee Estimate',
  TOTAL_CHARGE_LABEL: 'Total Charge',

  // Button
  CREATE_PAY_IN_BUTTON_OFFLINE: 'Queue Payment',
  CREATE_PAY_IN_BUTTON: 'Create PayIn',

  // Validation errors
  VALIDATION_AMOUNT_REQUIRED: 'Amount is required',
  VALIDATION_AMOUNT_POSITIVE: 'Amount must be greater than 0',
  VALIDATION_AMOUNT_INSUFFICIENT:
    'Insufficient balance (amount + fee exceeds your available balance)',
  VALIDATION_CUSTOMER_ID_REQUIRED: 'Customer ID is required',
  VALIDATION_PAYMENT_METHOD_REQUIRED: 'Payment method is required',
  VALIDATION_INVALID_PAYMENT_METHOD: 'Invalid payment method selected',

  // Modal - Processing
  MODAL_PROCESSING_TITLE: 'Processing payment...',
  MODAL_PROCESSING_SUBTITLE: 'Securely verifying transaction details',

  // Modal - Success
  MODAL_SUCCESS_TITLE: 'Payment Successful',
  MODAL_SUCCESS_SUBTITLE: 'Your payment has been processed securely.',
  MODAL_SUCCESS_TRANSACTION_ID: 'Transaction ID',
  MODAL_SUCCESS_AMOUNT: 'Amount',
  MODAL_SUCCESS_DATE: 'Date',
  MODAL_SUCCESS_VIEW_TRANSACTION: 'View Transaction',
  MODAL_SUCCESS_RETURN_DASHBOARD: 'Return to Dashboard',

  // Currency
  CURRENCY_SYMBOL: '$',
  CURRENCY_CODE: 'USD',
} as const;
