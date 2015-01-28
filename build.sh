browserify -e index.js -t browserify-shim -s ReactMiniRouter > dist/react-mini-router.js
uglifyjs dist/react-mini-router.js > dist/react-mini-router.min.js

