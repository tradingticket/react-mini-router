module.exports = function triggerUrl(url, silent) {
    window.history.pushState({}, '', url);
    var e = new window.Event('popstate')
    e.url = window.location.href + url;
};
