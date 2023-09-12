import { TypeValues } from './enums';
import { IDnsHeader, IQuestion, IResourceRecord } from './types';

/**
 * Given a domain string, convert it into valid byte string.
 *
 * @param {string} domain
 * @returns {string}
 */
function parseDomainToByteString(
  domain: string,
  isIp: boolean = false
): string {
  let encodedDomain = '';

  // Parsing domain IP, e.g. 8.8.8.8
  if (isIp) {
    const domainSplitArr = domain.split('.');

    // Add length
    encodedDomain += domainSplitArr.length.toString(16).padStart(2, '0');

    // Add hex for each integer
    domainSplitArr.forEach((label) => {
      encodedDomain += parseInt(label).toString(16).padStart(2, '0');
    });

    return encodedDomain;
  }

  domain.split('.').forEach((label) => {
    // Add the length of the label
    encodedDomain += label.length.toString(16).padStart(2, '0');

    // Convert label into a byte string
    encodedDomain += label
      .split('')
      .map((char) => {
        return char.charCodeAt(0).toString(16).padStart(2, '0');
      })
      .join('');
  });

  // Add terminating character
  encodedDomain += (0).toString(16).padStart(2, '0');
  return encodedDomain;
}

/**
 * This function returns a valid byte string for a given header.
 *
 * @param {IDnsHeader} header
 * @returns {string}
 */
function convertHeaderToByteString(header: IDnsHeader): string {
  let output = '';
  const radix = 16;

  // Add header id
  output += header.id.toString(radix).padStart(4, '0');

  // Add flags
  output += (
    (header.qr << 15) +
    (header.opcode << 11) +
    (header.aa << 10) +
    (header.tc << 9) +
    (header.rd << 8) +
    (header.ra << 7) +
    (header.z << 4) +
    header.rCode
  )
    .toString(radix)
    .padStart(4, '0');

  // Question count, Answer count, Authority count and Additional count
  output += header.qdCount.toString(radix).padStart(4, '0');
  output += header.anCount.toString(radix).padStart(4, '0');
  output += header.nsCount.toString(radix).padStart(4, '0');
  output += header.arCount.toString(radix).padStart(4, '0');

  return output;
}

/**
 * This function converts the given list of questions into a valid byte string.
 *
 * @param {IQuestion[]} questions
 * @returns {string}
 */
function convertQuestionsToByteString(questions: IQuestion[]): string {
  let output = '';

  questions.forEach((question) => {
    output += parseDomainToByteString(question.name);
    output += question.type.toString(16).padStart(4, '0');
    output += question.class.toString(16).padStart(4, '0');
  });

  return output;
}

/**
 * This function converts a given Resource Record (RR) into a valid byte string.
 *
 * @param {IResourceRecord[]} arr
 * @returns {string}
 */
function convertResourceRecordToByteString(arr: IResourceRecord[]): string {
  let output = '';

  arr.forEach((rr) => {
    output += parseDomainToByteString(rr.name);
    output += rr.type.toString(16).padStart(4, '0');
    output += rr.class.toString(16).padStart(4, '0');
    output += rr.ttl.toString(16).padStart(8, '0');
    output += rr.dataLength.toString(16).padStart(4, '0');

    // For A record the data represents a valid ip
    // Example - 8.8.4.4
    if (rr.type === TypeValues.A) {
      output += parseDomainToByteString(rr.data, true);
    }
    // For NS record, the data is a domain string
    // Example - dns.google.com
    else if (rr.type === TypeValues.NS) {
      output += parseDomainToByteString(rr.data);
    }
    // Otherwise the data is having the byte string already
    else {
      output += rr.data;
    }
  });

  return output;
}

export {
  convertHeaderToByteString,
  parseDomainToByteString,
  convertQuestionsToByteString,
  convertResourceRecordToByteString
};
