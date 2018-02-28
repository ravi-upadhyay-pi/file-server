var fileServer = angular.module('fileServer', ['ngRoute']);

fileServer.controller('listController', 
function($scope, $http, $document, $location){

	$scope.files = [];
	$scope.folders = [];
	$scope.shares = [];
	$scope.videoUrl = '';
	$scope.showPlayer = false;
	$scope.subtitleSource="",
	$scope.showShareWindow = false;
	$location.url('/');
	$scope.local = ($location.host() == 'localhost');

	$scope.getDirectory = function() {
		$http.get('/getDirectory' + $location.url())
		.then(function(response){
			$scope.files = [];
			$scope.folders = [];
			var current = $location.url();
			var parent = current == '/' ? '/' : current.substring(0, current.substring(0, current.length - 1).lastIndexOf('/') + 1);

			$scope.folders.push({
				name: "Go Up",
				path: parent,
				absPath: "", 
				size: 0,
				isFile: false	
			});

			for(var i = 0; i < response.data.length; i++)
				if(response.data[i].isFile == true)
					$scope.files.push(response.data[i]);
				else
					$scope.folders.push(response.data[i]);
		});
	};

	$scope.folderClick = function(folder){
		$location.url(folder.path);
	};

	$scope.fileClick = function(file) {
		$scope.playVideo(file.absPath);
	}

	$scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
		newUrl = newUrl.match(/([^#]*#?)(.*)/)[2];
		$scope.getDirectory();
	});

	$scope.playVideo = function(fileAbsPath) {
		$scope.subtitleSource = "/" + fileAbsPath.substring(0, fileAbsPath.lastIndexOf('.')) + '.srt';
		$scope.showPlayer = true;
		$document[0].getElementById("videoPlayer").src = '/' + fileAbsPath;
		$document[0].getElementById("videoPlayer").play();
	};

	$scope.shareWindow = function() {
		if($scope.showShareWindow == true) {
			$scope.showShareWindow = false;
			return;
		}
		$scope.shares = [];
		$http.get('/getDirectory/')
		.then(function(response) {
			for(var i = 0; i < response.data.length; i++) {
				$scope.shares.push({
					name: response.data[i].name,
					path: response.data[i].absPath
				});
			}
			$scope.showShareWindow = true;
		});
	};

	$scope.updateShare = function () {
		$http.post('/updateShare/', $scope.shares)
		.then(function(response) {
			$location.url('/');
			$scope.getDirectory();
			$scope.showShareWindow = false;
		});
	};
});