/**
 *
 * @param {} error
 */
const handleErrorStatus = (error) => {
  const internalServerError = 500;
  const badRequestError = 400;

  if (typeof error !== "undefined") {
    if (typeof error.code !== "undefined") {
      return error.code;
    }
    if (typeof error.status !== "undefined") {
      return error.status;
    }
    if (typeof error.errors !== "undefined") {
      return badRequestError;
    }
  }

  return internalServerError;
};

module.exports = handleErrorStatus;
