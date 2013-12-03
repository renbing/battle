function File() {
}

File.readFile = function(path, callback) {
    Ajax.get(path, function(status, _path, xhr){
        callback && callback(status != 200, xhr.responseText, _path);
    });
}
