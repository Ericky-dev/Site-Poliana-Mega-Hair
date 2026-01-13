/**
 * PIX BR Code Generator
 * Generates EMV QR Code payload for PIX payments
 */

const CRC_TABLE = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
  0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
  0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
  0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
  0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
  0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
  0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
  0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
  0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
  0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
  0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
  0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
];

/**
 * Calculate CRC16 checksum for PIX
 */
function crc16(str) {
  let crc = 0xFFFF;
  const bytes = Buffer.from(str, 'utf-8');

  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    const j = (c ^ (crc >> 8)) & 0xFF;
    crc = CRC_TABLE[j] ^ (crc << 8);
  }

  let answer = crc & 0xFFFF;
  answer = answer.toString(16).toUpperCase();

  return answer.padStart(4, '0');
}

/**
 * Format EMV field with ID and value
 */
function formatField(id, value) {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Remove accents and special characters
 */
function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .substring(0, 25);
}

/**
 * Generate PIX BR Code payload
 * @param {number} amount - Payment amount
 * @param {string} description - Payment description (optional)
 * @returns {string} PIX code (copy and paste format)
 */
function generatePixPayload(amount, description = '') {
  const pixKey = process.env.PIX_KEY || '';
  const receiverName = normalizeText(process.env.PIX_RECEIVER_NAME || 'Beauty Salon');
  const city = normalizeText(process.env.PIX_CITY || 'Sao Paulo');

  if (!pixKey) {
    throw new Error('PIX_KEY not configured');
  }

  // Merchant Account Information (ID 26)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', pixKey);
  const merchantAccountInfo = formatField('26', gui + key);

  // Build payload
  let payload = '';

  // Payload Format Indicator (ID 00)
  payload += formatField('00', '01');

  // Merchant Account Information (ID 26)
  payload += merchantAccountInfo;

  // Merchant Category Code (ID 52)
  payload += formatField('52', '0000');

  // Transaction Currency (ID 53) - BRL = 986
  payload += formatField('53', '986');

  // Transaction Amount (ID 54)
  if (amount && amount > 0) {
    payload += formatField('54', amount.toFixed(2));
  }

  // Country Code (ID 58)
  payload += formatField('58', 'BR');

  // Merchant Name (ID 59)
  payload += formatField('59', receiverName);

  // Merchant City (ID 60)
  payload += formatField('60', city);

  // Additional Data Field (ID 62) - Transaction ID
  const txId = description ? normalizeText(description).replace(/\s/g, '') : 'BEAUTYSALON';
  const additionalData = formatField('05', txId.substring(0, 25));
  payload += formatField('62', additionalData);

  // CRC16 (ID 63) - placeholder for calculation
  payload += '6304';

  // Calculate and append CRC16
  const crc = crc16(payload);
  payload = payload.slice(0, -4) + formatField('63', crc);

  return payload;
}

/**
 * Validate PIX key format
 */
function validatePixKey(key) {
  // CPF: 11 digits
  if (/^\d{11}$/.test(key)) return { valid: true, type: 'CPF' };

  // CNPJ: 14 digits
  if (/^\d{14}$/.test(key)) return { valid: true, type: 'CNPJ' };

  // Phone: +55 followed by 10-11 digits
  if (/^\+55\d{10,11}$/.test(key)) return { valid: true, type: 'PHONE' };

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return { valid: true, type: 'EMAIL' };

  // Random key (EVP): 32 hex characters with dashes
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    return { valid: true, type: 'EVP' };
  }

  return { valid: false, type: null };
}

module.exports = {
  generatePixPayload,
  validatePixKey,
  crc16
};
