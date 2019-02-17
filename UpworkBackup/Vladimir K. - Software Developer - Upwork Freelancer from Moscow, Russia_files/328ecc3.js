(function(window) {
    var previousHandler = window.onerror;
    var errorCache = [];
    var errorKey;
    var jsLogPath = Applet.getBasePath() + '/public/api/v1/aux/log-js';

    window.onerror = function(message, source, line, col, error) {
        errorKey = message + source + line + col;
        if ((errorCache.indexOf(errorKey) === -1) && (errorCache.length < 100)) {
            errorCache.push(errorKey);

            try {
                var params = {
                    message: message,
                    source:  source,
                    line:    line,
                    col:     col,
                    error:   error,
                    cookieLength: document.cookie.length,
                    userUid: (window.Applet && window.Applet.getUser()) ? window.Applet.getUser().getUid() : null,
                    page_runtime_id: window.Applet ? window.Applet.getVar('runtime_id') : null
                };
                var data = [];
                for (var key in params) {
                    data.push(key + '=' + encodeURI(params[key]));
                }
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', jsLogPath, true);
                xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xmlhttp.send(data.join('&'));
            } catch (e) {
                if (window.console && typeof window.console.error === 'function') {
                    window.console.error(e);
                }
            }
        }
        if (previousHandler) {
            previousHandler.apply(this, arguments);
        }
    };
})(window);