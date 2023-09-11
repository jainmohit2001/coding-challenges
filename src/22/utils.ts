import { IDnsHeader, IQuestion } from './types';

function parseDomainToByteString(domain: string): string {
  let encodedDomain = '';
  domain.split('.').forEach((value) => {
    encodedDomain += value.length.toString(16).padStart(2, '0');
    encodedDomain += value
      .split('')
      .map((char) => {
        return char.charCodeAt(0).toString(16).padStart(2, '0');
      })
      .join('');
  });
  encodedDomain += (0).toString(16).padStart(2, '0');
  return encodedDomain;
}

function convertHeaderToByteString(header: IDnsHeader): string {
  let output = '';
  const radix = 16;
  output += header.id.toString(radix).padStart(4, '0');

  // Using Big endian notation to create the 16 bit integer
  // bit 0 is MSB hence << 15 is used with header.qr
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

  output += header.qdCount.toString(radix).padStart(4, '0');
  output += header.anCount.toString(radix).padStart(4, '0');
  output += header.nsCount.toString(radix).padStart(4, '0');
  output += header.arCount.toString(radix).padStart(4, '0');
  return output;
}

function convertQuestionsToByteString(questions: IQuestion[]): string {
  let output = '';

  questions.forEach((question) => {
    output += parseDomainToByteString(question.name);
    output += question.type.toString(16).padStart(4, '0');
    output += question.class.toString(16).padStart(4, '0');
  });

  return output;
}

export {
  convertHeaderToByteString,
  parseDomainToByteString,
  convertQuestionsToByteString
};
