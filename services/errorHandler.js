export function handleError(err) {
  if ("statusCode" in err) {
  } else {
    err["statusCode"] = 500;
  }
}

export function throwError(code, message = null) {
  var err = new Error();
  err["statusCode"] = code;
  switch (code) {
    case 400:
      err.message = message || "Bad request.";
      break;
    case 401:
      err.message = message || "Unauthorized.";
      break;
    case 403:
      err.message = message || "Forbidden.";
      break;
    case 404:
      err.message = message || "Not found.";
      break;
    case 409:
      err.message = message || "Already exists.";
      break;
    case 500:
      err.message = message || "Internal server error.";
      break;
  }
  throw err;
}

export function validateFields(fields) {
  fields.forEach((field) => (!field ? throwError(400) : true));
}
