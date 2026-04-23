export const TRANSACTION_DETAILS_STRINGS = {
  // Header
  SCREEN_TITLE: 'Transaction Details',
  BACK_BUTTON_ACCESSIBILITY: 'Go back',

  // Section titles
  SECTION_TRANSACTION_INFO: 'Transaction Information',
  SECTION_BLOCKCHAIN: 'Blockchain Verified',

  // Info card fields
  FIELD_TRANSACTION_ID: 'Transaction ID',
  FIELD_CUSTOMER_ID: 'Customer ID',
  FIELD_PAYMENT_METHOD: 'Payment Method',
  FIELD_AMOUNT: 'Amount',
  FIELD_STATUS: 'Status',
  FIELD_DESCRIPTION: 'Description',
  FIELD_CREATED_AT: 'Created At',
  FIELD_UPDATED_AT: 'Updated At',

  // Copy
  COPY_SUCCESS: 'Copied to clipboard',
  COPY_ICON_ACCESSIBILITY: 'Copy transaction ID',

  // Receipt icon accessibility
  RECEIPT_ICON_ACCESSIBILITY: 'Transaction receipt',

  // Blockchain card
  BLOCKCHAIN_SUBTITLE: 'Settled via Tumipay Core Network.',
  BLOCKCHAIN_HASH_PREFIX: 'Hash:',
  BLOCKCHAIN_HASH_MOCK: '0x72a...98f2',
  VIEW_NETWORK_RECEIPT: 'View Network Receipt',

  // Payment method labels
  PAYMENT_METHOD_CARD: 'CARD',
  PAYMENT_METHOD_BANK_TRANSFER: 'BANK_TRANSFER',
  PAYMENT_METHOD_CASH: 'CASH',

  // Date separator
  DATE_TIME_SEPARATOR: '•',

  // Not found
  NOT_FOUND_TITLE: 'Transaction not found',
  NOT_FOUND_SUBTITLE: 'The requested transaction could not be loaded.',
} as const;
