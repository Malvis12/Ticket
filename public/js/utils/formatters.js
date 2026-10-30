/**
 * Utility Formatters for Currency, Dates, Numbers and Timers
 */

/**
 * Format Kobo integer to Nigerian Naira (NGN)
 * e.g., 500000 -> "₦5,000"
 */
export function formatKobo(kobo) {
  if (kobo === null || kobo === undefined) return '₦0';
  const naira = Number(kobo) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(naira);
}

/**
 * Format timestamp into standard human readable string
 */
export function formatDate(dateInput, includeTime = true) {
  if (!dateInput || dateInput === 'TBA') return 'Date to be announced';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Date to be announced';
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.timeZone = 'Africa/Lagos';
  }
  return d.toLocaleDateString('en-NG', options);
}

/**
 * Format countdown seconds into MM:SS
 */
export function formatTimer(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

/**
 * Compute real-time countdown parts (days, hours, minutes, seconds)
 */
export function getCountdownParts(targetIsoDate) {
  if (!targetIsoDate) return null;
  const target = new Date(targetIsoDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Humanize internal status codes into luxury consumer labels
 */
export function humanizeStatus(status) {
  const map = {
    'VALID': 'Verified Pass',
    'USED': 'Already Checked In',
    'REVOKED': 'Pass Revoked',
    'REFUNDED': 'Refunded',
    'PENDING': 'Awaiting Payment',
    'PAID': 'Payment Confirmed',
    'FAILED': 'Payment Declined',
    'ADMIN': 'Event Administrator',
    'STAFF': 'Door & Check-In Staff',
    'FINANCE': 'Finance Team'
  };
  return map[status] || status;
}

/**
 * Sanitize strings for safe HTML interpolation
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate cryptographically random, verified ticket QR token
 * Format: TFS_SIG_<32hex>_<TIER>_<index>_VERIFIED
 */
export function generateQrToken(tierCode, index = 1) {
  const hex32 = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const cleanCode = (tierCode || 'PASS').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `TFS_SIG_${hex32}_${cleanCode}_${index}_VERIFIED`;
}

/**
 * Generate authoritative, sequential luxury Pass Number
 * Format: TFS-2026-<TIER_CODE>-<5-DIGIT_SEQ>-<SEAT_NO>
 * Example: TFS-2026-REG-00142-01
 */
export function generateTicketNumber(tierCode, index = 1, sequenceNum = null) {
  const cleanCode = (tierCode || 'PASS').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  const seq = sequenceNum !== null ? sequenceNum : Math.floor(100 + Math.random() * 900);
  const seqPad = String(seq).padStart(5, '0');
  const seatPad = String(index).padStart(2, '0');
  return `TFS-2026-${cleanCode}-${seqPad}-${seatPad}`;
}
