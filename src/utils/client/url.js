/**
 *
 * @param {} router
 * @returns
 */
const getHostFromUrl = (router) => {
  if (!router.asPath) {
    return null;
  }

  const queryString = router.asPath.split("?")[1];
  const urlParams = new URLSearchParams("?" + queryString);
  return urlParams.get("host");
};

export { getHostFromUrl };
