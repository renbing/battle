
function CommonCSV(name, indexs) {
    var spliter = '\t';
    var rawData = resourceManager.get(name);

    indexs = indexs || [];

    var rows = rawData.split('\n');
    var columns = rows[1].split(spliter);
    for(var j=0; j<columns.length; j++ ) {
        columns[j] = columns[j].trim();
    }

    for( var i=2; i<rows.length; i++ ) {
        if( rows[i].trim().length == 0 ) {
            continue;
        }
        var cols = rows[i].split(spliter);
        if( cols.length != columns.length ){
            ERROR('invalid csv ' + name + ' at line: ' + i);
            continue;
        }

        var obj = {};
        for(var j=0; j<cols.length; j++ ) {
            var column = columns[j];
            var value = cols[j].trim();
            if( !isNaN(value) ) {
                value = +value;
            }
            obj[column] = value;
        }

        var data = this;
        for( var k=0; k<indexs.length-1; k++ ) {
            var index = indexs[k];
            if( !(obj[index] in data) ) {
                data[obj[index]] = {}; 
            }
            data = data[obj[index]];
        }

        var lastIndex = indexs[indexs.length-1];
        data[obj[lastIndex]] = obj;
    }
}

function GlobalCSV(name) {
    var spliter = '\t';
    var rawData = resourceManager.get(name);

    var rows = rawData.split('\n');
    for( var i=2; i<rows.length; i++ ) {
        if( rows[i].trim().length == 0 ) {
            continue;
        }
        var cols = rows[i].split(spliter);
        if( cols.length != 3 ) {
            ERROR('invalid global csv ' + name + ' at ' + i);
            continue;
        }
        var key = cols[1];
        var value = cols[2].trim();

        if( !isNaN(value) ) {
            value = +value;
        }
        this[key] = value;
    }
}
