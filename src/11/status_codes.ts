enum HttpStatusCodes {
  HTTP_200_OK = 200,

  HTTP_400_Not_Found = 400,
  HTTP_401_Unauthorized = 401
}

function getStatusMessage(status?: number): string {
  switch (status) {
    case 200:
      return 'OK';
    case 400:
      return 'Not Found';
    case 401:
      return 'Unauthorized';
  }
  return 'OK';
}

export { HttpStatusCodes, getStatusMessage };
