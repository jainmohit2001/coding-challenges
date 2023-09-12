/**
 * Refer to the documentation for more details:
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.2.2
 *
 * @enum {number}
 */
enum TypeValues {
  A = 1,
  NS = 2,
  MD = 3,
  MF = 4,
  CNAME = 5,
  SOA = 6,
  MB = 7,
  MG = 8,
  MR = 9,
  NULL = 10,
  WKS = 11,
  PTR = 12,
  HINFO = 13,
  MINFO = 14,
  MX = 15,
  TXT = 16
}

/**
 * Refer to the documentation for more details:
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.2.3
 *
 * @enum {number}
 */
enum QTypeValues {
  AXFR = 252,
  MAILB = 253,
  MAILA = 254,
  ALL = 255
}

/**
 * Refer to the documentation for more details:
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.2.4
 *
 * @enum {number}
 */
enum ClassValues {
  IN = 1,
  CS = 2,
  CH = 3,
  HS = 4
}

/**
 * Refer to the documentation for more details:
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.2.5
 *
 * @enum {number}
 */
enum QClassValues {
  All = 255
}

export { TypeValues, QTypeValues, ClassValues, QClassValues };
