/**
 * Main slide logic
 */

(function($, window, undefined) {
  var Slide = Backbone.Model.extend({
  });

  var Slides = Backbone.Collection.extend({
  });

  var SlideApp = Backbone.View.extend({
    slideCount: 0,
    slides: [],
    currentSlide: 0,
    el: 'body',
    imageBase: './',
    
    events: {
      'click': 'nextSlide',
    },
    
    initialize: function() {
      this.slides = new Slides;
      this.gatherSlides();
      
      _.bindAll(this, 'handleKeys');
      $(this.el).bind('keydown', this.handleKeys);
      $('body').focus();
    },
    
    gatherSlides: function() {
      var thisApp = this;
      var slide;
      
      // Read in template text
      this.slideTemplate = $('#slide-container-template').html();
      this.$slideTemplate = $(this.slideTemplate);
      
      this.$slideTemplate.find('.slide').each(function() {
        slide = new Slide;
        slide.set('template', $(this));
        slide.set('slideNum', thisApp.slideCount);
        
        // Get image
        if ($(this).attr('data-image') !== undefined && $(this).attr('data-image') != '') {
          slide.set('image', $(this).attr('data-image'));
        }
        
        thisApp.slides.add(slide);
        thisApp.slideCount++;
      });
    },
    
    handleKeys: function(e) {
      if (e.keyCode === 39) {
        this.nextSlide();
      }
      if (e.keyCode === 37) {
        this.previousSlide();
      }
    },
    
    expandText: function() {
      this.getDimensions();
      
      var $text = $('#current-slide-container p');
      var size = (this.windowHeight * 3);
      $text.css('font-size', size + 'px');

      while (
        $text.outerHeight(true) > this.windowHeight ||
        $text.outerWidth(true) > this.windowWidth) {
        size -= 30;
        $text.css('font-size', size + 'px');
      }
    },
    
    clearBackground: function() {
      $('#current-slide-container').css('background-image', '');
    },
    
    setBackground: function() {
      var imgURL = this.currentSlideObj.get('image');
      if (imgURL !== undefined) {
        var $container = $('#current-slide-container');
        
        $container.css('background-image', 'url(' + this.imageBase + imgURL + ')');
      }
    },
    
    getDimensions: function() {
      this.windowWidth = $(window).outerWidth(true);
      this.windowHeight = $(window).outerHeight(true);
    },
    
    showCurrentSlide: function() {
      this.showSlide(this.currentSlide);
    },
    
    nextSlide: function() {
      this.currentSlide++;
      
      if (this.currentSlide >= this.slideCount) {
        this.currentSlide = 0;
      }
      this.showSlide(this.currentSlide);
    },
    
    previousSlide: function() {
      this.currentSlide--;
      
      if (this.currentSlide < 0) {
        this.currentSlide = this.slideCount - 1;
      }
      this.showSlide(this.currentSlide);
    },
    
    showSlide: function(slide) {
      var slideToShow;
      
      if (_.isNumber(slide) && slide !== NaN) {
        slideToShow = this.slides.where({ slideNum: slide });
        if (!_.isEmpty(slideToShow)) {
          this.clearBackground();
        
          this.currentSlideObj = slideToShow[0];
          $('#current-slide-container').html(
            _.template(this.currentSlideObj.get('template').html(), this.currentSlideObj.toJSON()));

          this.expandText();
          this.setBackground();
          this.navSlide(slide);
        }
      }
    },
    
    navSlide: function(slide) {
      if (this.router !== undefined) {
        this.router.navigate('slide-' + slide);
      }
    }
  });
  
  var SlideRouter = Backbone.Router.extend({
    routes: {
      '': 'index',
      'slide-:slide': 'slideRoute',
      '*error': 'error'
    },
  
    initialize: function() {
      this.app = new SlideApp();
      this.app.router = this;
    },
  
    index: function(slide) {
      this.app.showSlide(0);
    },
  
    slideRoute: function(slide) {
      slide = parseInt(slide);
      
      if (_.isNumber(slide) && slide !== NaN) {
        this.app.currentSlide = slide;
        this.app.showSlide(slide);
      }
      else {
        this.app.showSlide(0);
      }
    },
  
    error: function(errorPath) {
      // Do something
    }
  });

  $(document).ready(function() {
    var router = new SlideRouter();
    Backbone.history.start();
  });
})(jQuery, window);