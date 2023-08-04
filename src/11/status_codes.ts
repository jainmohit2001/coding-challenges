/**
 * Http codes supported by the Server
 *
 * @enum {number}
 */
enum HttpStatusCodes {
  HTTP_200_OK = 200,

  HTTP_400_Not_Found = 400,
  HTTP_401_Unauthorized = 401,

  HTTP_500_Server_error = 500
}

/**
 * This function returns a generic message for the HTTP status codes.
 *
 * @param {?number} [status]
 * @returns {string}
 */
function getStatusMessage(status?: number): string {
  switch (status) {
    case 200:
      return 'OK';
    case 400:
      return 'Not Found';
    case 401:
      return 'Unauthorized';
    case 500:
      return 'Server Error!';
  }
  return 'OK';
}

export { HttpStatusCodes, getStatusMessage };
