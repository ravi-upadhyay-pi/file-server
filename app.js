var http = require("http"),
    url = require("url"),
    sf = require("./serveFile"),
    fs = require("fs"),
    dc = require('./directoryCrawler')
    port = 5858;

dc.init();

function exactMatch(r, str) {
    var match = str.match(r);
    return match!=null && str == match[0];
};

http.createServer(function(request, response) {
    var uri = url.parse(request.url).pathname;
    uri = decodeURIComponent(uri);
    uri = uri.slice(1, uri.length);

    try {
        if(uri == '') {
            sf.sendFile('./public/index.html', request.Range, response);
        }

        else if(exactMatch(/public\/.*/i, uri)) {
            sf.sendFile('./' + uri, request.Range, response);    
        }

        else if(exactMatch(/updateShare\//i, uri)) {
            var fullBody = '';
            request.on('data', function(chunk) {
                fullBody += chunk.toString();
            });
            request.on('end', function() {
                var shareList  = JSON.parse(fullBody);
                dc.updateShare(shareList);
                response.end();
            })
        }

        else if(exactMatch(/getDirectory\/.*/i, uri)){
            var dirPath = uri.match(/getDirectory\/(.*)/i)[1];
            var dirList = dc.getDirectory(dirPath);
            response.end(JSON.stringify(dirList));
        }

        else sf.sendFile(uri, request.headers.range, response);
    }

    catch(ex) {
        console.log(uri, ex);
    }

}).listen(parseInt(port, 10));

console.log("File server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");


