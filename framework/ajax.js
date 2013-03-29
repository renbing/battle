var Ajax = {};
Ajax.pool = [];

Ajax.request = function (url, opt_options) {
    var options = opt_options || {},
        data = options.data || "",
        async = !(options.async === false),
        method = (options.method || "GET").toUpperCase(),
        headers = options.headers || {},
        tick, xhr;

    function stateChangeHandler() {
        if(xhr.readyState == 4) {
            var status = -1;
            try {
                status = xhr.status;
            } catch (ex) {
            }

            options.callback && options.callback(status, url, xhr);
            var index = Ajax.pool.indexOf(xhr);
            if(index > -1) {
                Ajax.pool.splice(index, 1);
            }
            xhr = null;
        }
    }

    function dataStringify(datas) {
        if(typeof datas == 'string') {
            return datas;
        }
        var retStr = '';
        for (var key in datas) {
            if(retStr != '') {
                retStr += '&';
            }
            retStr += (key + '=' + datas[key]);
        }
        return retStr;
    }

    xhr = new XMLHttpRequest();
    xhr.open(method, url, async);
    xhr.onreadystatechange = stateChangeHandler;

    headers['X-Requested-With'] = 'XMLHttpRequest';
    if(method == 'POST' && ! headers['Content-Type']) {
        headers['Content-Type'] = "application/x-www-form-urlencoded";
    }

    for(var key in headers) {
        if(headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key]);
        }
    }

    data = dataStringify(data);
    if(method == 'GET') {
        if(data) {
            url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
            data = "";
        }
    }

    xhr.send(data);
    Ajax.pool.push(xhr);
    
    return xhr;
};

Ajax.get = function (url, callback) {
    return Ajax.request(url, {'callback': callback});
};

Ajax.post = function (url, data, callback) {
    return Ajax.request(
        url,
        {
            'callback': callback,
            'method': 'POST',
            'data': data
        }
    );
};
