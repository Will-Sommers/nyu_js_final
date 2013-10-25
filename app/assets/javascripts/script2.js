'use strict'

var API_BASE = "https://api.github.com/repos/";
var recursiveTreeLookup = function(repoLocation) {
  var repoLocation = repoLocation;
  var commitAPIPath = getAllCommits(repoLocation);
  var commits = $.getJSON(commitAPIPath + "?access_token=" + API_TOKEN);


  var tree = commits.then(function(data) {
    var mostRecentCommit = data[0].sha;
    var treeAPIPath = API_BASE + repoLocation +
      "/git/trees/" + mostRecentCommit + "?access_token=" + API_TOKEN + "&recursive=1";
    return  $.getJSON(treeAPIPath);
  });

  var jsFiles = tree.then(function(data) {
    var arr = [];
    var repoFile;
    for (var i = 0; i < data.tree.length; i++) {
      repoFile = data.tree[i];
      if(checkForJSFileType(repoFile.path)) {
        arr.push(repoFile)
      }
    }
    var fileNames = filePathNames(repoLocation, arr)

    for (var i = 0; i < 3; i++) {
      getFileContent(fileNames[i]);
    }
  });
};

var getFileContent = function(fileLocation) {
  $.get(fileLocation + "?access_token=" + API_TOKEN,
    function() {
    console.log('started');
  }).done(function(data) {
    console.log(data);
  });

}

var filePathNames = function(repoLocation, jsFiles){
  var arr = [];
  for (var i = 0; i < jsFiles.length; i++) {
    var rawURL = API_BASE + repoLocation + '/contents/' + jsFiles[i].path;
    arr.push(rawURL)
  }
  return arr;
};

var getAllCommits= function(repoLocation) {
  return API_BASE + repoLocation + '/commits';
}

var checkForJSFileType = function(path) {
  var pathArray = path.split('.');
  var fileType = pathArray[pathArray.length - 1]
  return fileType == 'js';
}


//var a = $.getJSON("https://api.github.com/repos/afeld/advanced_js/contents/vendor/recipes.js",
//    { Origin: 'http://localhost:3000/',
//      user: 'will-sommers' }
//);

//a.then( function(data) { console.log(data.content) } );


recursiveTreeLookup('afeld/advanced_js');