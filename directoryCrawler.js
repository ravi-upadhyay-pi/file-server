
var fs = require('fs');

var sharedFoldersFile = './sharedFolders.json';
var sharedFolders = new Object;

function getDirectory(path) {
	var childList = [];
	var returnList = [];
	var expandedPath = '';
	var splitPath = [];

	if(path == '') 
		return Object.keys(sharedFolders).map(function (key) {return sharedFolders[key]});

	splitPath = path.split('/');
	splitPath[0] = sharedFolders[splitPath[0]].absPath;
	expandedPath = splitPath.join('/');
	try { childList = fs.readdirSync(expandedPath); }
	catch(ex) { childList = []; }

	for(var i = 0; i < childList.length; i++) {
		var childPath = path + childList[i];
		var absPath = expandedPath + childList[i];
		var stat;
		try { stat = fs.statSync(absPath); }
		catch (ex) { continue; }
		if(!stat.isFile()) childPath += '/';
		returnList.push({
			name: childList[i],
			path: childPath,
			absPath: absPath,
			isFile: stat.isFile(),
			size: stat.size,
			lastModified: stat.mtime.getTime()
		});
	}
	returnList.sort(function(a, b) { return b.lastModified - a.lastModified; });
	return returnList;
}

function init() {
	sharedFolders = JSON.parse(fs.readFileSync(sharedFoldersFile, 'utf8'));
}

function updateSharedFoldersFile() {
	fs.writeFileSync(sharedFoldersFile, JSON.stringify(sharedFolders));
}

function updateShare(shareList) {
	sharedFolders = new Object;
	for(var i = 0; i < shareList.length; i++) {
		sharedFolders[shareList[i].name] = {
			name: shareList[i].name,
			path: shareList[i].name + '/',
			absPath: shareList[i].path,
			isFile: false,
			size: 0
		};
	}
	updateSharedFoldersFile();
}

exports.getDirectory = getDirectory;
exports.updateShare = updateShare;
exports.init = init;