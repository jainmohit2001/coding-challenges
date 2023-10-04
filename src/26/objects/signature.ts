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
 * Parses a line from commit object into a Signature instance.
 *
 * @export
 * @param {string} line
 * @returns {Signature}
 */
export function decodeSignature(line: string): Signature {
  let i = 0;

  // Name is present till an opening bracket is found.
  while (line[i] !== '<') {
    i++;
  }
  const name = line.substring(0, i).trim();

  i++; // Skip the opening bracket

  const emailStartPos = i;
  while (line[i] !== '>') {
    i++;
  }
  const email = line.substring(emailStartPos, i);

  i += 2; // Skip the closing bracket and a space

  // This split is of following the format: "<seconds> <offset>"
  const split = line.substring(i, line.length).trim().split(' ');
  const ms = parseInt(split[0]) * 1000;
  const timestamp = new Date();
  timestamp.setTime(ms);

  // TODO: Check if we need to handle the offset.

  return new Signature(name, email, timestamp);
}

/**
 * Converts a given Date object's timezone to `(+/-)hhmm` format.
 * View this for the sign calculation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset#negative_values_and_positive_values
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
