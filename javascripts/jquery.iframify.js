// 
//  jquery.iframify.js
//  FullWindow iframe slideshow
//  by vieron - http://github.com/vieron
//

(function($) {
  
  $.fn.iframify = function(options) {

      var opts = $.extend({}, $.fn.iframify.defaults, options),
          $wrap = $(this),
          $elements = $(opts.element, $wrap),
          $nav = $(opts.controls_wrapper, $wrap),
          $prev = $('<a href="#" class="arrow prev">Prev</a>'),
          $next = $('<a href="#" class="arrow next">Next</a>'),
          $play = $('<a href="#" class="play">Play</a>'),
          $controls = $play.add($prev).add($next),
          $timer = false,
          animated = false,
          loaded = [],
          active_element = 0,
          play_interval,
          is_playing = false;
          
          if ($elements.length < 1) return false;
					
          
      var animateTo = function($el, pos, callback){
						callback || (callback = function(){});
						$el.animate({'left': pos}, 'normal', callback);
					}
					
					getNext = function(n, number){
						var next_element = n+1;
						next_element = (next_element>=$elements.length) ? 0 : next_element;
						return number === true ? next_element : $elements.eq(next_element);
					},

					getPrev = function(n, number){
						var prev_element = n-1;
						prev_element = (prev_element<0) ? $elements.length-1 : prev_element;
						return number === true ? prev_element : $elements.eq(prev_element);
					},

					animateToVisible = function(dir, callback){
						callback || (callback = function(){});
						switch(dir){
							case 'left':
								var $nextNext = getNext(getNext(active_element, true));
								$nextNext.css('left', opts.elements_positions.right_hidden);
								animateTo($elements.eq(active_element), opts.elements_positions.left , callback);
								animateTo($nextNext, opts.elements_positions.right);
							  break;
							case 'right':
								var $prevPrev = getPrev(getPrev(active_element, true));
								$prevPrev.css('left', opts.elements_positions.left_hidden);
							  animateTo($elements.eq(active_element), opts.elements_positions.right, callback );
								
								animateTo($prevPrev, opts.elements_positions.left);
							  break;
							default:
							  return false;
						}
					},

					animateToHidden = function(dir, callback){
						callback || (callback = function(){});
						switch(dir){
							case 'left':
								var $next = getNext(active_element);
								animateTo($next, opts.elements_positions.right_hidden, function(){
									$next.css(opts.elements_positions.left_hidden);
									callback();
								});
							  break;
							case 'right':
								var $prev = getPrev(active_element);
							  animateTo($prev, opts.elements_positions.left_hidden, function(){
								$prev.css(opts.elements_positions.right_hidden);
								callback();
							} );
							  break;
							default:
							  return false;
						}
					},

					animateToActive = function(dir, callback){
						callback || (callback = function(){});
						
						$elements.css('z-index', 2);
						
						switch(dir){
							case 'left':
								var $next = getNext(active_element).css('z-index', 100);
								animateTo($next, opts.elements_positions.active, callback);
							  break;
							case 'right':
								var $prev = getPrev(active_element).css('z-index', 100);
							  animateTo($prev, opts.elements_positions.active, callback);
							  break;
							default:
							  return false
						}
						
					},
					
					UIEvents = function(){
					  $next.bind('click', function(){
    					goTo('next');
            });

            $prev.bind('click', function(){
    					goTo('prev');
            });

            $play.toggle( play, stop );

            //autoplay
            if (opts.autoplay) $play.trigger('click');
					},
					
					keyboardEvents = function(){
					  $(window).bind('keydown', function(e){
              var k = e.keyCode;
              if (k == '37') {
                e.preventDefault();
                $prev.trigger('click');
              }else if (k == '39'){
                e.preventDefault();
                $next.trigger('click');
              }else if (k == '32'){
                e.preventDefault();
                togglePlay();
              };
            });
					},
					positionateElements = function(){
					  $elements.not($elements.first()).css({
              position : 'absolute',
              top : 0,
              left : opts.elements_positions.right_hidden
            });
  					$elements.eq(1).css({
  					  'left' : opts.elements_positions.right,
  					  'z-index' : 1000
  					} );
  					$elements.eq($elements.length-1).css({
  					  left : opts.elements_positions.left,
  					  'z-index' : 1
  					});
					},
					
					onLoadHandler = function(){
					  loaded.push(this);
					  if (loaded.length === $elements.length) init();
					},
					
					goTo = function(dir, by_code){  //next or prev
            if (!$elements.is(':animated')) {
							if (dir == 'next') {
									animateToVisible('left', function(){
										active_element = getNext(active_element, true);
									});
									animateToHidden('right');
									animateToActive('left');
							};
							
							if (dir == 'prev') {
								animateToVisible('right');
								animateToActive('right');
								animateToHidden('left', function(){
									active_element = getPrev(active_element, true)
								}	);
							};
            };
            
            if (!by_code) stop();
            
          },
					
					togglePlay = function(){
					  if (is_playing) {
              stop();
            }else{
              play();
            };
					},
					
					play = function(){
					  stop();
					  is_playing = true;
					  
					  $play.removeClass("play").addClass('stop').text('Stop');
					  
					  play_interval = setInterval(function(){
               goTo('next', true);
             }, opts.autoplay_interval)
					},
					
					stop = function(){
					  clearInterval(play_interval);
					  is_playing = false;
					  $play.removeClass("stop").addClass('play').text('Play');
					},
					
					init = function(){
					    $nav.append($controls);
              positionateElements();
              UIEvents();
              if (opts.key_navigation) keyboardEvents();
              if (opts.init_when_loaded) $nav.animate({height : '5%'}, 800, 'swing').removeClass('loading');
					}
					

          if (opts.init_when_loaded) {
            $nav.animate({height : '100%'}, 300, 'swing').addClass('loading');
            $elements.load(onLoadHandler);
          }else{
            init();
          }
          

      return this;
  }; 




  // plugin defaults
  $.fn.iframify.defaults = {
    speed : 800,
    element : "iframe",
    elements_positions : {
			left : "-100%",
			active: 0,
			right: "100%",
			right_hidden : '250%',
			left_hidden : '-250%'
		}, 
    controls_wrapper : '#nav',
    key_navigation : true,
    autoplay : true,
    autoplay_interval : 10000,
    init_when_loaded : true,
    beforeFilter : function(n){ },
    afterFilter : function(n){ }
  };


})(jQuery);