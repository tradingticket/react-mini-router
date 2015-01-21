var React = require('react'),
    pathToRegexp = require('path-to-regexp'),
    urllite = require('urllite/lib/core'),
    detect = require('./detect');

module.exports = {

    contextTypes: {
        path: React.PropTypes.string,
        root: React.PropTypes.string,
        useHistory: React.PropTypes.bool
    },

    childContextTypes: {
        path: React.PropTypes.string,
        root: React.PropTypes.string,
        useHistory: React.PropTypes.bool
    },
    setHash: function (url) {
      var path = url.pathname + (url.search || '');

      this.setState({ path: path});
    },
    getChildContext: function() {
        return {
            path: this.state.path,
            root: this.state.root,
            useHistory: this.state.useHistory
        }
    },

    getDefaultProps: function() {
        return {
            routes: {}
        };
    },

    getInitialState: function() {
        return {
            path: getInitialPath(this),
            root: (this.context.root || '') + (this.props.root || ''),
            useHistory: (this.props.history || this.context.useHistory) && detect.hasPushState
        };
    },

    componentWillMount: function() {
        this.setState({ _routes: processRoutes(this.state.root, this.routes, this) });
    },

    componentDidMount: function() {
        this.getDOMNode().addEventListener('click', this.handleClick, false);

        if (this.state.useHistory) {
            window.addEventListener('popstate', this.onPopState, false);
        } else {
            if (window.location.hash.indexOf('#!') === -1) {
                window.location.hash = '#!/';
            }

            window.addEventListener('hashchange', this.onPopState, false);
        }
    },

    componentWillUnmount: function() {
        this.getDOMNode().removeEventListener('click', this.handleClick);

        if (this.state.useHistory) {
            window.removeEventListener('popstate', this.onPopState);
        } else {
            window.removeEventListener('hashchange', this.onPopState);
        }
    },

    onPopState: function(e) {
        url = urllite(e.url)
        this.setHash(url)
    },

    renderCurrentRoute: function() {
        var path = this.state.path,
            url = urllite(path),
            queryParams = parseSearch(url.search);

        var parsedPath = url.pathname;

        if (!parsedPath || parsedPath.length === 0) parsedPath = '/';

        var matchedRoute = this.matchRoute(parsedPath);

        if (matchedRoute) {
            return matchedRoute.handler.apply(this, matchedRoute.params.concat(queryParams));
        } else if (this.notFound) {
            return this.notFound(parsedPath, queryParams);
        } else {
            throw new Error('No route matched path: ' + parsedPath);
        }
    },

    handleClick: function(evt) {
        var url = getHref(evt);

        if (url && this.matchRoute(url.pathname)) {
            evt.preventDefault();
            // See: http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html
            // Give any component event listeners a chance to fire in the current event loop,
            // since they happen at the end of the bubbling phase. (Allows an onClick prop to
            // work correctly on the event target <a/> component.)
            
            this.setHash(url);
        }
    },

    matchRoute: function(path) {
        if (!path) return false;

        var matchedRoute = {};

        this.state._routes.some(function(route) {
            var matches = route.pattern.exec(path);

            if (matches) {
                matchedRoute.handler = route.handler;
                matchedRoute.params = matches.slice(1, route.params.length + 1);

                return true;
            }

            return false;
        });

        return matchedRoute.handler ? matchedRoute : false;
    }

};

function getInitialPath(component) {
    var path = component.props.path || component.context.path,
        url;

    if (!path && detect.canUseDOM) {
        url = urllite(window.location.href);

        if (!component.props.useHistory && url.hash) {
            path = urllite(url.hash.slice(2)).pathname;
        } else {
            path = url.pathname;
        }
    }

    return path || '/';
}

function getHref(evt) {
    target = evt.target
    if(target.nodeName != 'A')
      target = evt.target.querySelector('a')
    if(target)
      return urllite(target.href);
    return 0;
}

function processRoutes(root, routes, component) {
    var patterns = [],
        path, pattern, keys, handler, handlerFn;

    for (path in routes) {
        if (routes.hasOwnProperty(path)) {
            keys = [];
            pattern = pathToRegexp(root + path, keys);
            handler = routes[path];
            handlerFn = component[handler];

            patterns.push({ pattern: pattern, params: keys, handler: handlerFn });
        }
    }

    return patterns;
}

function parseSearch(str) {
    var parsed = {};

    if (str.indexOf('?') === 0) str = str.slice(1);

    var pairs = str.split('&');

    pairs.forEach(function(pair) {
        var keyVal = pair.split('=');

        parsed[decodeURIComponent(keyVal[0])] = decodeURIComponent(keyVal[1]);
    });

    return parsed;
}
