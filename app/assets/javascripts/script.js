'use strict'
var app = {};

app.models = {};
app.views = {};

var WordModel= Backbone.Model.extend({

});

var WordView = Backbone.View.extend({


  el: 'div.word',

  events: {
  },

  initialize: function() {
    this.render()
    var timer = new TimerView;
  },

  render: function() {
    this.$el.html('<div> sdfasfasdfsadfasd </div>');
    return this
  },

  move: function() {
    var that = this;
    setInterval(function(){
      var size = that.$el.css('font-size');
      size = parseInt(size, 10);

      that.$el.css('font-size', (size + 2) + 'px');
    }, 400)

  }
});

var TimerView = Backbone.View.extend({

  el: 'div.timer',

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html('<div> 30 </div>');
    this.setTimer();
  },

  setTimer: function() {
    var timerStart = parseInt(this.$el.text(), 10);
  }
});

var a = new WordView;


