// Globals
// Look in env_variables for API tokens etc.
var API_BASE = "https://api.github.com/repos/";
var AUTH = "?access_token=" + API_TOKEN;

var app = app || {};


(function() {
  'use strict'

  app.JsFile = Backbone.Model.extend({

  });
})();

(function() {
  'use strict'

  var JsFiles = Backbone.Collection.extend({
    model: app.JsFile
  });

  app.JsFiles = new JsFiles();
})();

(function($) {
  app.JsFileView = Backbone.View.extend({

    tagName: 'li',

    events: {
      'click div' : "fireBlocks"
    },

    render: function() {
      this.$el.html("<div>" + this.model.get('name') + "</div>");
    },

    fireBlocks: function() {
      var content = this.model.get('content')
      var functions = content.match(/content/g);
      var vars = content.match(/var/g);
      var jQueries = content.match(/jQuery/);
      var all_caps = content.match(/\b([A-Z]{2,})\b/g);

    }
  });
})(jQuery);

(function($) {

  "use strict"

  app.AppView = Backbone.View.extend({

    el: '.main',

    events: {
      "keypress .repo-name" : "findRepo"
    },


    initialize: function() {
      this.listenTo(app.JsFiles, 'add', this.addOne);
    },


    addOne: function(file) {
      var JsFileView = new app.JsFileView({
        model: file,
        collection: app.JsFiles
        });
      JsFileView.render();
      this.$el.append(JsFileView.el);
    },

    findRepo: function(e) {
      if (e.which === 13) {
        var repoName = ($('.repo-name').val())
        module.recursiveTreeLookup(repoName);
      }
    }
  });

})(jQuery);

$(function () {

  'use strict'

  new app.AppView()

});

var module = {}

module.recursiveTreeLookup = function(repoLocation) {
  var repoLocation = repoLocation;
  var commitAPIPath = module.getAllCommits(repoLocation);
  var commits = $.getJSON(commitAPIPath);


  var tree = commits.then(function(data) {
    var mostRecentCommit = data[0].sha;
    var treeAPIPath = API_BASE + repoLocation +
      "/git/trees/" + mostRecentCommit + AUTH + "&recursive=1";
    return  $.getJSON(treeAPIPath);
  });

  var jsFiles = tree.then(function(data) {
    var arr = [];
    var repoFile;
    for (var i = 0; i < data.tree.length; i++) {
      repoFile = data.tree[i];
      if(module.checkForJSFileType(repoFile.path)) {
        arr.push(repoFile)
      }
    }
    var fileNames = module.filePathNames(repoLocation, arr)

    for (var i = 0; i < 5; i++) {
      module.getFileContent(fileNames[i]);
    }
  });
};

module.getFileContent = function(fileLocation) {
  var file =  $.get(fileLocation + AUTH)

  file.then(function(data) {
    file = new app.JsFile({
      name:   data.name,
      sha:    data.sha,
      content: $.base64.decode(data.content)
    });
    app.JsFiles.add(file)
  })
}

module.filePathNames = function(repoLocation, jsFiles){
  var arr = [];
  for (var i = 0; i < jsFiles.length; i++) {
    var rawURL = API_BASE + repoLocation + '/contents/' + jsFiles[i].path;
    arr.push(rawURL)
  }
  return arr;
};

module.getAllCommits= function(repoLocation) {
  return API_BASE + repoLocation + '/commits' + AUTH;
}

module.checkForJSFileType = function(path) {
  var pathArray = path.split('.');
  var fileType = pathArray[pathArray.length - 1]
  return fileType == 'js';
}

