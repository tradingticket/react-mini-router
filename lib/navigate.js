var detect = require('./detect');

module.exports = function triggerUrl(url, silent) {
    if (detect.hasHashbang()) {
        window.location.hash = '#!' + url;
    } else if (detect.hasPushState) {
        window.history.pushState({}, '', url);
        var e = new window.Event('popstate')
        e.url = window.location.href + url;
        if (!silent) window.dispatchEvent(e);
    } else {
        console.error("Browser does not support pushState, and hash is missing a hashbang prefix!");
    }
};
