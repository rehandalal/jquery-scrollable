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
                margin: 0,
                railclass: 'scrollable_rail',
                railwidth: 8,
                riderclass: 'scrollable_rider',
                showalways: false,
                showrail: false,
                wheelstep: 32,
                wrapperclass: 'scrollable_wrapper'
            };
            
            var data = $.extend(defaults, options);
            
            return this.each(function(){
                var $this = $(this);
                
                // Check if this is an existing scrollable and if so destroy
                if ($this.data('scrollable')) {
                    $this.scrollable('destroy');
                    
                    // Clear the added CSS and remove the parent
                    $this.css({
                        height: '', 
                        position: '', 
                        overflow: ''
                    });

                    var clone = $this.clone();

                    $this.parent().after(clone);
                    $this.parent().remove();
                    $this = clone;
                }

                $this.data('scrollable', data);

                var containerHeight = $this.height();
                var railHeight = containerHeight - (2 * data.margin);
                
                // Wrap the existing content
                var wrapper = $('<div></div>')
                    .addClass(data.wrapperclass)
                    .css({
                        height: containerHeight,
                        overflow: 'hidden',
                        position: 'relative',
                        width: $this.outerWidth()
                    });
                
                $this.wrap(wrapper);
                var container = $this.parent();
                
                // Create the rail and rider
                var rail = $('<div></div>')
                    .addClass(data.railclass)
                    .css({
                        bottom: data.margin + 'px',
                        display: (data.showalways && data.showrail)?'block':'none',
                        left: (data.align == 'left')?data.margin + 'px':'auto',
                        position: 'absolute',
                        right: (data.align == 'right')?data.margin + 'px':'auto',
                        top: data.margin + 'px',
                        width: data.railwidth + 'px',
                        zIndex: 1000
                    });
                    
                var rider = $('<div></div>')
                    .addClass(data.riderclass)
                    .css({
                        display: (data.showalways)?'block':'none',
                        left: (data.align == 'left')?data.margin + 'px':'auto',
                        position: 'absolute',
                        right: (data.align == 'right')?data.margin + 'px':'auto',
                        top: data.margin + 'px',
                        width: data.railwidth + 'px',
                        zIndex: 2000
                    });
                    
                // Store the rail and rider
                data.rail = rail;
                data.rider = rider;
                    
                $this.scrollable('refresh');
                    
                // Create the invisible rail used for containment on the draggable
                var contrail = rail.clone()
                    .removeClass(data.railclass)
                    .css({
                        display: 'block',
                        zIndex: 0
                    });
                
                // Insert the rail and rider
                container.append(contrail)
                    .append(rail)
                    .append(rider);
                
                // Make the rider draggable and handle drag events
                rider.draggable({
                    axis: 'y',
                    containment: contrail,
                    start: function(){
                        $(this).data('dragging', true);
                    },
                    stop: function(){
                        $(this).data('dragging', false);
                        if (container.data('hovering') !== true) hide();
                    },
                    drag: function(){
                        // Calculate the Y offset required for scrolling to
                        var y = (($(this).position().top - data.margin) / (railHeight - rider.height())) * (data.scrollableHeight - containerHeight);
                        $this.scrollTop(y);
                    }
                });
                
                // Handle hover events if necessary
                if (data.showalways !== true) {
                    container.hover(function(){
                        container.data('hovering', true);
                        show();
                    }, function(){
                        container.data('hovering', false);
                        if (rider.data('dragging') !== true) hide();
                    });
                }
                
                // Handle mousewheel
                container.on("DOMMouseScroll", onMouseWheel);
                container.on("mousewheel", onMouseWheel);
                
                // Hide the scrollbar
                function hide() {
                    if (data.showrail) rail.fadeOut(500);
                    rider.fadeOut(500);
                }
                
                // Function to scroll onMouseWheel
                function onMouseWheel(event) {
                    var e = event.originalEvent;
                    var delta = (e.wheelDelta)?e.wheelDelta:e.detail;
                    delta = delta / Math.abs(delta);
                    
                    var y = $this.scrollTop() + (delta * data.wheelstep);
                    $this.scrollTop(y);
                    
                    rider.css({
                        top: (data.margin + (($this.scrollTop() / (data.scrollableHeight - containerHeight)) * (railHeight - rider.height()))) + 'px' 
                    });
                }
                
                // Show the scrollbar
                function show() {
                    if (data.showrail) rail.fadeIn(150);
                    rider.fadeIn(150);
                }
            });
        },
        'destroy': function() {
            return this.each(function(){
                var $this = $(this);

                // Unbind all events
                $(window).unbind('.scrollable');

                // Remove data
                $this.removeData('scrollable');
            });
        },
        'refresh': function() {
            return this.each(function(){
                var $this = $(this);
                var data = $this.data('scrollable');
                
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
                
                // Fix the rider height
                var riderHeight = containerHeight * containerHeight / data.scrollableHeight;
                if (riderHeight < 16) riderHeight = 16;
                data.rider.css({
                    height: riderHeight + 'px'
                });
                
                // Reposition the rider
                data.rider.css({
                    top: (data.margin + (($this.scrollTop() / (data.scrollableHeight - containerHeight)) * (data.rail.height() - data.rider.height()))) + 'px' 
                });
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