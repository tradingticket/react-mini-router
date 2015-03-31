module.exports = function triggerUrl(url, silent) {
  /*   
  if (detect.hasHashbang()) {
    window.location.hash = '#!' + url;
  } else if (detect.hasPushState) {
    window.history.pushState({}, '', url);
    if (!silent) window.dispatchEvent(new window.Event('popstate'));
  }
  */

  /* Support for IE9 comes first */
  if (window.REACT_MINI_ROUTER_HANDLE) {
    window.REACT_MINI_ROUTER_HANDLE({url: url});
  }
};
