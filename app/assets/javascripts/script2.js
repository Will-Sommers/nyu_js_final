// Globals
// Look in env_variables for API tokens etc.
var API_BASE = "https://api.github.com/repos/";
var AUTH = "?access_token=" + API_TOKEN;

var app = app || {};


var a = $.getJSON("http://www.brooklynmuseum.org/opencollection/api/?method=collection.search&format=json&version=1&api_key=EWOW6S84A0&keyword=eames");

a.then(function(data) {
  alert('tes')
  console.log(data)
});

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

(function() {

  'use strict'

  app.BlockView = Backbone.View.extend({

    className: 'circle',

    render: function(color) {
      var that = this;
      var timeout = Math.floor(Math.random() * 44000);
      $(this.el).addClass(color)
      var randomInt = Math.floor(Math.random * 800) + 1
      $(this.el).css('left', randomInt)

      window.setTimeout(function() {
        that.removeFromView(); }, timeout)
      window.setInterval(function() {
        var top = $(that.el).css('top')
        var top = parseInt(top, 10) + Math.floor(Math.random() * 20);

        var left = $(that.el).css('left');
        var randomInt = Math.floor(Math.random() * 100) + 1;

        if (randomInt < 60) {
          left = parseInt(left, 10) + Math.floor(Math.random() * 20);
        } else if (randomInt > 80) {
          left = parseInt(left, 10) * Math.floor(Math.random() * 20);
        } else {
          left = parseInt(left, 10) - Math.floor(Math.random() * 20);
        }
        if(left < -200 || left > 1000) {
          that.removeFromView()
        }

        $(that.el).css({ 'top': top,
                         'left' : left
        });
      }, 100)

      return this;
    },
    removeFromView: function() {
      this.remove();
    }
  });
})();

(function($) {
  app.JsFileView = Backbone.View.extend({

    tagName: 'li',

    events: {
      'click div' : "fireBlocks",
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

      _.each(vars, function() {
        var blockView = new app.BlockView();
        $('.right-col').append(blockView.render('red').el);
      });

      _.each(functions, function() {
        var blockView = new app.BlockView();
        $('.right-col').append(blockView.render('grey').el);
      });

      _.each(all_caps, function() {
        var blockView = new app.BlockView();
        $('.right-col').append(blockView.render('slate').el);
      });
      _.each(jQueries, function() {
        var blockView = new app.BlockView();
        $('.right-col').append(blockView.render('orange').el);
      });
    },

  });
})(jQuery);

(function($) {

  "use strict"

  app.AppView = Backbone.View.extend({

    el: '.main',

    events: {
      "keypress .repo-name" : "findRepo",
      "click .play" : "fireAllBlocks"
    },


    initialize: function() {
      this.listenTo(app.JsFiles, 'add', this.addOne);
      this.children = [];
    },


    addOne: function(file) {
      var JsFileView = new app.JsFileView({
        model: file,
        collection: app.JsFiles
        });
      this.children.push(JsFileView);
      JsFileView.render();
      this.$el.find('.names').append(JsFileView.el);
    },

    findRepo: function(e) {
      if (e.which === 13) {
        $('.names').empty()
        var repoName = ($('.repo-name').val())
        module.recursiveTreeLookup(repoName);
      }
    },

    fireAllBlocks: function (){
      _.each(this.children, function(view) {
        view.fireBlocks()
      } );
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

    for (var i = 0; i < fileNames.length; i++) {
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

