/**
 * Handles client requests
 * @param {string} url
 * @param {} requestOptions
 * @returns
 */
const request = async (url, requestOptions, retries = 3) => {
  let data = null;
  let status = 200;

  try {
    const response = await fetch(url, requestOptions);
    if (response.ok) {
      data = await response.json();
    } else {
      if (response.status >= 500) {
        status = response.status;
        throw new Error("Internal server error");
      }
      if ([401, 472].includes(response.status)) {
        status = 401;
      }

      if (retries > 0 && response.status === 429) {
        return setTimeout(() => {
          request(url, requestOptions, retries - 1);
        }, process.env.NEXT_PUBLIC_RETRY_INTERVAL);
      } else {
        throw new Error("Maximum amount of retries exceeded.");
      }
    }
  } catch (error) {
    console.log(error);
    data = {
      message: "Oops.. An error ocurred. Please try again later.",
    };
  }

  return { data, status };
};

module.exports = request;
