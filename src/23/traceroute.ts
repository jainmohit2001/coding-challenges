import { randomBytes } from 'crypto';
import UDP from 'dgram';
import dns from 'dns';

// This library has an issue.
// The hotfix is present at https://github.com/algj/node-raw-socket
const raw = require('raw-socket');

/**
 * Used to check for timeout while waiting for response.
 *
 * @type {NodeJS.Timeout}
 */
let timeout: NodeJS.Timeout;

/**
 * The IPv4 address of destination domain/host.
 *
 * @type {string}
 */
let DESTINATION_IP: string;

/**
 * Maximum number of hops.
 * This represents the Time-to-live(TTL) value for the UDP packets.
 *
 * @type {number}
 */
const MAX_HOPS: number = 64;

/**
 * UDP packet size in bytes
 *
 * @type {number}
 */
const PACKET_SIZE: number = 32;

/**
 * Timeout value in ms.
 *
 * @type {number}
 */
const TIMEOUT_IN_MS: number = 1000;

/**
 * The global variable corresponding to TTL for UDP packet.
 *
 * @type {number}
 */
let CURRENT_TTL: number = 0;

/**
 * The current port where the UDP packets are sent.
 *
 * @type {number}
 */
let CURRENT_PORT: number = 33434;

/**
 * The time when the UDP packet is sent.
 *
 * @type {[number, number]}
 */
let startTime: [number, number];

/**
 * Different types of ICMP messages.
 * https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol
 *
 * @enum {number}
 */
enum ICMPMessageType {
  ECHO_REPLY = 0,
  DESTINATION_UNREACHABLE = 3,
  REDIRECT_MESSAGE = 5,
  ECHO_REQUEST = 8,
  TIME_EXCEEDED = 11,
  PARAMETER_PROBLEM = 12
}

// Check if a host is provided.
if (process.argv.length !== 3) {
  console.error('Usage\nnode traceroute.ts <domain>');
  process.exit(1);
}

const host = process.argv[2];

// Make sure the host is valid
ipLookup(host)
  .then((value) => {
    // Set the IPv4 address for the host
    DESTINATION_IP = value;
    console.log(
      'traceroute to %s (%s), %d hops max, %d byte packets',
      host,
      DESTINATION_IP,
      MAX_HOPS,
      PACKET_SIZE
    );
    // Start the ICMP message listener
    startICMPListener();

    // Start sending UDP messages
    sendUDPMessage();
  })
  .catch((err) => {
    console.error("IP Lookup failed for '%s', code %s", host, err.code);
    process.exit(1);
  });

/**
 * This function is executed in two cases:
 * 1. If the timeout as occurred while waiting for an ICMP message,
 * 2. When an ICMP message is received
 *
 * @async
 * @param {?string} [source]
 * @returns {*}
 */
async function printToConsoleAndSendMessage(source?: string) {
  // Clear timeout if present
  if (timeout) {
    clearTimeout(timeout);
  }
  // Since we received an ICMP message, this corresponds to the endTime
  const diff = process.hrtime(startTime);

  if (!source) {
    // Timeout condition, no source found
    console.log('%d\t*\t*\t*', CURRENT_TTL);
  } else {
    // Reverse lookup and print info
    const host = (await reverseDnsLookup(source)) ?? source;
    console.log(
      '%d\t%f ms\t%s (%s)',
      CURRENT_TTL,
      (diff[1] / 1000_000).toPrecision(5),
      host,
      source
    );

    // Traceroute complete condition
    if (source === DESTINATION_IP) {
      console.log('\nTraceroute completed on hop %d\n', CURRENT_TTL);
      process.exit(0);
    }
  }
  // Send the next UDP message.
  setImmediate(sendUDPMessage);
}

/**
 * Function to send a UDP message.
 */
function sendUDPMessage() {
  // Increasing TTL and PORT whenever we send a new UDP message.
  // TODO: Add 3 tries with each TTL.
  CURRENT_TTL++;
  CURRENT_PORT++;

  // Traceroute couldn't complete
  if (CURRENT_TTL > MAX_HOPS) {
    console.log('Reached maximum hops %d', CURRENT_TTL);
    process.exit(0);
  }

  // Create a UDP Socket and update TTL
  const socket = UDP.createSocket('udp4');
  socket.bind(() => {
    socket.setTTL(CURRENT_TTL);
  });

  startTime = process.hrtime();

  // Send random bytes of length PACKET_SIZE
  socket.send(
    randomBytes(PACKET_SIZE),
    0,
    PACKET_SIZE,
    CURRENT_PORT,
    DESTINATION_IP,
    (err) => {
      if (err) {
        console.error(err);
      }
      // This helps us looping over sendUDPMessage with a timeout
      timeout = setTimeout(printToConsoleAndSendMessage, TIMEOUT_IN_MS);
      socket.close();
    }
  );
}

/**
 * This function creates a Socket and starts listening to ICMP packets.
 */
function startICMPListener() {
  const socket = raw.createSocket({
    protocol: raw.Protocol.ICMP,
    addressFamily: raw.AddressFamily.IPv4
  });

  socket.on('message', (msg: Buffer, source: string) => {
    const offset = 20;
    const msgType = msg.readUInt8(offset);
    const msgCode = msg.readUInt8(offset + 1);

    // When a TTL expiry condition is satisfied
    // or when the destination becomes unreachable (also true when reached destination)
    if (
      (msgType === ICMPMessageType.TIME_EXCEEDED && msgCode === 0) ||
      (msgType === ICMPMessageType.DESTINATION_UNREACHABLE && msgCode === 3)
    ) {
      printToConsoleAndSendMessage(source);
    }
  });

  socket.on('error', (err: string) => {
    console.error(err);
  });

  socket.on('close', () => {
    console.log('socket closed');
  });
}

/**
 * Function to perform DNS lookup.
 * It returns a Promise which is resolved with the IPv4 address.
 *
 * @async
 * @param {string} host
 * @returns {Promise<string>}
 */
async function ipLookup(host: string): Promise<string> {
  return new Promise<string>((res, rej) => {
    dns.lookup(
      host,
      { family: 4, hints: dns.V4MAPPED | dns.ADDRCONFIG },
      (err, address) => {
        if (err) {
          rej(err);
          return;
        }
        res(address);
      }
    );
  });
}

/**
 * Reverse DNS lookup.
 * Returns a promise which resolves with a an address if found otherwise null.
 *
 * @async
 * @param {string} ip
 * @returns {Promise<string | null>}
 */
async function reverseDnsLookup(ip: string): Promise<string | null> {
  return new Promise<string | null>((res) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        res(null);
        return;
      }
      let address = hostnames[0];
      for (let i = 1; i < hostnames.length; i++) {
        if (hostnames[i].length < address.length) {
          address = hostnames[i];
        }
      }
      res(address);
    });
  });
}
