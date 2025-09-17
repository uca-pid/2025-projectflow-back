export function handleError(err) {
  if ("statusCode" in err) {
  } else {
    err["statusCode"] = 500;
  }
}

export function throwError(code) {
  var err = new Error();
  err["statusCode"] = code;
  switch (code) {
    case 400:
      err.message = "Bad request.";
      break;
    case 401:
      err.message = "Unauthorized.";
      break;
    case 403:
      err.message = "Forbidden.";
      break;
    case 404:
      err.message = "Not found.";
      break;
    case 409:
      err.message = "Already exists.";
      break;
    case 500:
      err.message = "Internal server error.";
      break;
  }
  throw err;
}

export function validateFields(fields) {
  fields.forEach((field) => (!field ? throwError(400) : true));
}
