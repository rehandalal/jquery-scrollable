//
// jQuery Scrollable Plugin 
// http://github.com/rehandalal/jquery-scrollable
// Version: 1.0.0
// 
// Create iOS / Mac OS X Lion style fading scrollbars for scrollable elements.
// 
// Copyright (c) 2012, Rehan Dalal
// Licensed under the Unlicense (http://unlicense.org/)
//
(function($){
    var methods = {
        'create': function(options) {
            var defaults = {
                align: 'right',
                fade: true,
                margin: 0,
                mousewheel: true,
                mousewheel_step: 32,
                show_track: false,
                thumb_class: 'scrollable_thumb',
                track_class: 'scrollable_track',
                track_width: 8,
                wrapper_class: 'scrollable_wrapper'
            };
            
            var data = $.extend(defaults, options);
            
            return this.each(function(){
                var $this = $(this);
                                
                // Check if this is an existing scrollable and if so destroy
                $this.scrollable('destroy');

                $this.data('scrollable', data);

                var containerHeight = $this.height();
                var trackHeight = containerHeight - (2 * data.margin);
                
                // Wrap the existing content
                var wrapper = $('<div></div>')
                    .addClass(data.wrapper_class)
                    .css({
                        height: containerHeight,
                        overflow: 'hidden',
                        position: 'relative',
                        width: $this.outerWidth()
                    });
                
                $this.wrap(wrapper);
                var container = $this.parent();
                
                // Create the track and thumb
                var track = $('<div></div>')
                    .addClass(data.track_class)
                    .css({
                        bottom: data.margin + 'px',
                        display: (!data.fade && data.show_track)?'block':'none',
                        left: (data.align == 'left')?data.margin + 'px':'auto',
                        position: 'absolute',
                        right: (data.align == 'right')?data.margin + 'px':'auto',
                        top: data.margin + 'px',
                        width: data.track_width + 'px',
                        zIndex: 1000
                    });
                    
                var thumb = $('<div></div>')
                    .addClass(data.thumb_class)
                    .css({
                        display: (data.fade)?'none':'block',
                        left: (data.align == 'left')?data.margin + 'px':'auto',
                        position: 'absolute',
                        right: (data.align == 'right')?data.margin + 'px':'auto',
                        top: data.margin + 'px',
                        width: data.track_width + 'px',
                        zIndex: 2000
                    });
                    
                // Store the track and thumb
                data.track = track;
                data.thumb = thumb;
                    
                $this.scrollable('refresh');
                    
                // Create the invisible track used for containment on the draggable
                var container_track = track.clone()
                    .css({
                        display: 'block',
                        visibility: 'hidden',
                        zIndex: 0
                    });
                
                // Insert the track and thumb
                container.append(container_track)
                    .append(track)
                    .append(thumb);
                
                // Make the thumb draggable and handle drag events
                thumb.draggable({
                    axis: 'y',
                    containment: container_track,
                    start: function(){
                        $(this).data('dragging', true);
                    },
                    stop: function(){
                        $(this).data('dragging', false);
                        if ((container.data('hovering') !== true) && (data.fade === true)) hide();
                    },
                    drag: function(){
                        // Calculate the Y offset required for scrolling to
                        var y = (($(this).position().top - data.margin) / (trackHeight - thumb.height())) * (data.scrollableHeight - containerHeight);
                        $this.scrollTop(y);
                    }
                });
                
                // Handle hover events if necessary
                if (data.fade === true) {
                    container.hover(function(){
                        container.data('hovering', true);
                        show();
                    }, function(){
                        container.data('hovering', false);
                        if (thumb.data('dragging') !== true) hide();
                    });
                }
                
                // Handle mousewheel
                container.on("DOMMouseScroll", onMouseWheel);
                container.on("mousewheel", onMouseWheel);
                
                // Hide the scrollbar
                function hide() {
                    if (data.show_track) track.fadeOut(500);
                    thumb.fadeOut(500);
                }
                
                // Function to scroll onMouseWheel
                function onMouseWheel(event) {
                    var e = event.originalEvent;
                    var delta = (e.wheelDelta)?-e.wheelDelta:e.detail;
                    delta = delta / Math.abs(delta);
                    
                    var y = $this.scrollTop() + (delta * data.mousewheel_step);
                    $this.scrollTop(y);
                    
                    thumb.css({
                        top: (data.margin + (($this.scrollTop() / (data.scrollableHeight - containerHeight)) * (trackHeight - thumb.height()))) + 'px' 
                    });
                    
                    // Ensure that the page is not being scrolled
                    return false;
                }
                
                // Show the scrollbar
                function show() {
                    if (data.show_track) track.fadeIn(150);
                    thumb.fadeIn(150);
                }
            });
        },
        'destroy': function() {
            return this.each(function(){
                var $this = $(this);
                
                if ($this.data('scrollable') !== undefined) {
                    // Unbind all events
                    $(window).unbind('.scrollable');

                    // Remove data
                    $this.removeData('scrollable');

                    // Clear the added CSS and remove the parent
                    $this.css({
                        height: '', 
                        position: '', 
                        overflow: ''
                    });

                    $this.unwrap();
                }
            });
        },
        'refresh': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('scrollable');
                
                if (data !== undefined) {
                    var containerHeight = $this.parent().height();

                    var top = $this.scrollTop();

                    // Set the overflow to visible to get the correct scrollable height
                    $this.css({
                        height: 'auto',
                        overflow: 'visible'
                    })

                    // Store the scrollable height
                    data.scrollableHeight = $this.height();

                    // Restore the overflow to hidden
                    $this.css({
                        height: containerHeight,
                        overflow: 'hidden'
                    });

                    // Reset the scroll top
                    $this.scrollTop(top);

                    // Fix the thumb height
                    var thumbHeight = containerHeight * containerHeight / data.scrollableHeight;
                    if (thumbHeight < 16) thumbHeight = 16;
                    data.thumb.css({
                        height: thumbHeight + 'px'
                    });

                    // Reposition the thumb
                    data.thumb.css({
                        top: (data.margin + (($this.scrollTop() / (data.scrollableHeight - containerHeight)) * (data.track.height() - data.thumb.height()))) + 'px' 
                    });
                }
            });
        }
    };
    
    $.fn.scrollable = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.create.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.scrollable');
        }
    }
})(jQuery);