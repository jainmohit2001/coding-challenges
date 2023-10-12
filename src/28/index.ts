import { NtpClient } from './client';

const client = new NtpClient();

client
  .getTime()
  .then((buf) => {
    console.log(buf);
  })
  .catch((err) => {
    console.error(err);
  });
