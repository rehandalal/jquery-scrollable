jQuery Scrollable
=================

A jQuery plugin to create iOS / Mac OS X Lion style fading scrollbars for scrollable elements.

Currently this plugin only supports vertical scrolling.

Dependencies
------------

- jQuery 1.7.2
- jQuery UI (For draggables)

Usage
-----

First, load jQuery, jQuery UI and the plugin:

    <script type="text/javascript" src="jquery-1.7.2.min.js" />
    <script type="text/javascript" src="jquery-ui-1.8.18.min.js" />
    <script type="text/javascript" src="jquery-scrollable-1.0.1.min.js" />

Next let's attach it to the DOM:

    <script type="text/javascript>
        $(document).ready(function(){
            $('#scrollable-div').scrollable();
        });
    </script>

Additionally you may pass options through to this function:

    <script type="text/javascript>
        $(document).ready(function(){
            $('#scrollable-div').scrollable({
                margin: 6,
                show_track: true
            });
        });
    </script>

For more usage and examples see: index.html