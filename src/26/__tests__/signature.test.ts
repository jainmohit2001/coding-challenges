import {
  Signature,
  decodeSignature,
  getTimeAndTimeZone
} from '../objects/signature';

describe('Testing Signature related classes and functions', () => {
  const name = 'John Doe';
  const email = 'example@gmail.com';

  const date = new Date();
  const timeInSec = 1696322721;
  date.setTime(timeInSec * 1000);

  it('should return correct output - toString() method', () => {
    const signature = new Signature(name, email, date);
    const str = signature.toString();

    expect(str).toContain(`${name} <${email}> ${timeInSec}`);
  });

  it('should match timezone format', () => {
    const date = new Date();
    const str = getTimeAndTimeZone(date);
    const regex = /[+-](\d{2})(\d{2})/;

    expect(regex.test(str)).toBeTruthy();
  });

  it('should decode signature successfully', () => {
    const str = `${name} <${email}> ${timeInSec} +0530`;
    const signature = decodeSignature(str);

    expect(signature.name).toBe(name);
    expect(signature.email).toBe(email);
    expect(signature.timestamp.getTime()).toBe(date.getTime());
  });

  it('should convert date object to time and timezone offset', () => {
    const date = new Date();
    const seconds = Math.floor(date.getTime() / 1000);
    const output = getTimeAndTimeZone(date).trim();
    const [sec, timezone] = output.split(' ');

    expect(parseInt(sec)).toBe(seconds);
    const timezoneInMin =
      (timezone[0] === '+' ? -1 : 1) *
      (parseInt(timezone.substring(1, 3)) * 60 +
        parseInt(timezone.substring(3, 5)));
    expect(timezoneInMin).toBe(date.getTimezoneOffset());
  });
});
