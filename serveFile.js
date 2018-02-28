var fs = require("fs");

var mimeNames = {
    'css': 'text/css',
    'html': 'text/html',
    'js': 'application/javascript',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'ogg': 'application/ogg', 
    'ogv': 'video/ogg', 
    'oga': 'audio/ogg',
    'txt': 'text/plain',
    'wav': 'audio/x-wav',
    'webm': 'video/webm',
    'mkv': 'video/webm',
    'srt': 'texttrack'
};

function sendFile(fileName, range, response) {
	if(!checkIfValidFile(fileName)) sendResponse(response, 404, null, null);
	else if(!range) sendCompleteFile(fileName, response);
	else sendPartialFile(fileName, range, response);
}

function sendCompleteFile(fileName, response) {
	var responseHeaders = {
		'Content-Type': getMimeFromFileName(fileName),
		'Content-Length': fs.statSync(fileName).size,
		'Accept-Ranges': 'bytes'
	};
	sendResponse(response, 200, responseHeaders, fs.createReadStream(fileName));
}

function sendPartialFile(fileName, range, response) {
	var totalLength = fs.statSync(fileName).size;
	var start, end;
	var parsedRange;
	var chunkSize = 1024 * 1024 * 5;

	parsedRange = range.match(/bytes=([\d]*)-([\d]*)/);
	start = parseInt(parsedRange[1]);
	end = parseInt(parsedRange[2]);

	if(isNaN(end)) end = (start + chunkSize - 1) > (totalLength - 1)? (totalLength - 1) : (start + chunkSize - 1);
	if(isNaN(start)) {
		start = totalLength - end;
		end = totalLength - 1;
	}

	if(start > end || start >= totalLength || end < 0)
		sendResponse(response, 416, {'Content-Range': 'bytes */' + totalLength}, null);

	var responseHeaders = {
		'Content-Range': 'bytes ' + start + '-' + end + '/' + totalLength,
		'Content-Length': end - start + 1,
		'Content-Type': getMimeFromFileName(fileName),
		'Accept-Ranges': 'bytes',
		'Cache-Control': 'no-cache'
	};

	sendResponse(response, 206, responseHeaders, fs.createReadStream(fileName, {start: start, end: end}));
}

function sendResponse(response, status, responseHeaders, readable) {
	response.writeHead(status, responseHeaders);
	if(readable == null) response.end();
	else readable.on("open", function() {
		readable.pipe(response);
	});
}

function getMimeFromFileName(fileName) {
	var ext = getExtFromFileName(fileName);
	if(ext == null) return 'application/octet-stream';
    if(mimeNames[ext.toLowerCase()] == undefined) return 'application/octet-stream';
    return mimeNames[ext.toLowerCase()];
}

function getExtFromFileName(fileName) {
	if(fileName.indexOf('') == -1) return null;
	else return fileName.split('.').pop();
}

function checkIfValidFile(fileName) {
	if(!fs.existsSync(fileName) || !fs.statSync(fileName).isFile()) return false;
	return true;
}

exports.sendFile = sendFile;
