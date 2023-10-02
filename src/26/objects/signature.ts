/**
 * Signature is used to identify who and when created a commit .
 *
 * @export
 * @class Signature
 */
export class Signature {
  name: string;
  email: string;
  timestamp: Date;

  constructor(name: string, email: string, timestamp?: Date) {
    this.name = name;
    this.email = email;
    this.timestamp = timestamp ?? new Date();
  }

  toString(): string {
    return `${this.name} <${this.email}> ${getTimeAndTimeZone(this.timestamp)}`;
  }
}

/**
 * Given a line from the commit object in splitted form,
 * this function returns the signature corresponding to the line.
 * The split is array is of the following format:
 * - split[0] = 'author' | 'committer'
 * - split[1] = name
 * - split[2] = "<email>"
 * - split[3] = time in seconds since midnight, January 1, 1970 GMT
 * - split[4] = timezone offset
 *
 * @export
 * @param {string[]} split
 * @returns {Signature}
 */
export function decodeSignature(split: string[]): Signature {
  const name = split[1];

  // Ignore the opening and closing brackets
  const email = split[2].substring(1, split[2].length - 1);
  const ms = parseInt(split[3]) * 1000;
  const timestamp = new Date();
  timestamp.setTime(ms);
  // TODO: Check if we need to handle the offset.

  return new Signature(name, email, timestamp);
}

/**
 * Converts a given Date object's timezone to `(+/-)hhmm` format.
 * View this to for the sign calculation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset#negative_values_and_positive_values
 * @export
 * @param {Date} date
 * @returns {string}
 */

export function getTimeAndTimeZone(date: Date): string {
  const seconds = Math.floor(date.getTime() / 1000);
  const timezoneOffsetInMin = date.getTimezoneOffset();
  const sign = timezoneOffsetInMin <= 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(timezoneOffsetInMin) / 60);
  const minutes = Math.abs(timezoneOffsetInMin) - 60 * hours;
  return `${seconds} ${sign}${hours.toString().padStart(2, '0')}${minutes
    .toString()
    .padStart(2, '0')}`;
}
