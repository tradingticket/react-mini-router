module.exports = function triggerUrl(url, silent) {
        var e = new window.Event('popstate')
        e.url = window.location.href + url;
        window.dispatchEvent(e);
};
