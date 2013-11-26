function File() {
}

File.readFile = function(path, callback) {
    Ajax.get(path, function(status, url, xhr){
        callback && callback(status != 200, xhr.responseText);
    });
}
