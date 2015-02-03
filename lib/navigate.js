module.exports = function triggerUrl(url, silent) {
  var e = new window.Event('popstate')
  e.url = url;
  //e.url = e.url.replace('//', '/');
  window.dispatchEvent(e);
};
