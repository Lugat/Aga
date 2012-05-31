/**
 * Aga v1.07
 * http://squareflower.de/downloads/jquery/aga/
 *
 * Copyright 2010, Lukas Rydygel
 * Attribution-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-sa/3.0/
 */
(function($) {

  $.fn.aga = function(method) {

    var FN = function() {},
        POINTER = 'aga-pointer',
        SETTINGS = 'aga-settings',
        HORIZONTAL = 'horizontal',
        VERTICAL = 'vertical',
        OBJECT = 'object',
        FUNCTION = 'function',
        CLICK = 'click',
        HOVER = 'hover',
        NEXT = 'next',
        PREV = 'prev',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        LEFT = 'left',
        RIGHT = 'right',
        TOP = 'top',
        BOTTOM = 'bottom',
        VARIABLE = 'variable',
        CLASS = [];

        CLASS[HORIZONTAL] = ['aga-horizontal', 'aga-horizontal-item', 'aga-horizontal-item-open'],
        CLASS[VERTICAL] = ['aga-vertical', 'aga-vertical-item', 'aga-vertical-item-open'];

    var settings = {
      easing: ['', ''],
      size: {
        min: 20,
        max: VARIABLE
      },
      handler: function(element) {
        return $(element);
      },
      circular: false,
      orientation: HORIZONTAL,
      direction: LEFT,
      forceSize: true,
      start: 0,
      action: CLICK,
      stayOpen: true,
      animationTime: 500,
      hoverTime: 500,
      items: 'li',
      open: {
        before: FN,
        durring: FN,
        each: FN,
        after: FN
      },
      close: {
        before: FN,
        durring: FN,
        each: FN,
        after: FN
      }
    },

    pointer = settings.start,
    timeout,

    methods = {

      _getItems: function() {
        return $(this).children(settings.items);
      },

      _getSize: function(items, pos, size) {

        switch (settings.orientation) {

          case HORIZONTAL:
            return (settings.forceSize) ? size-((items.length-1)*settings.size.min) : $(items[pos]).width();
          break;

          case VERTICAL:
            return (settings.forceSize) ? size-((items.length-1)*settings.size.min) : $(items[pos]).height();
          break;

        }

      },

      _getAnimationProperties: function(key, value) {

        switch (key) {

          case TOP:
            return {
              'top':value
            };
          break;

          case RIGHT:
            return {
              'right':value
            };
          break;

          case BOTTOM:
            return {
              'bottom':value
            };
          break;

          case LEFT:
            return {
              'left':value
            };
          break;

          case HORIZONTAL:
            return {
              'width':value
            };
          break;

          case VERTICAL:
            return {
              'height':value
            };
          break;

        }

      },

      _setOptions: function(options) {

        $.extend(true, settings, options);

        $(this).data(SETTINGS, settings);

      },

      _getOptions: function() {
        return $(this).data(SETTINGS);
      },

      options: function(options) {
        return (typeof options === OBJECT) ? methods._setOptions.apply(this, [options]) : methods._getOptions.apply(this);
      },

      pointer: function() {
        return $(this).data(POINTER);
      },

      init: function(options) {

        methods._setOptions.apply(this, [options]);

        $(this).data(POINTER, pointer).addClass(CLASS[settings.orientation][0]);

        var obj = this,
            items = methods._getItems.apply(this),
            handler;

        for (var i = 0; i < items.length; i++) {

          (function(i) {

            handler = (typeof settings.handler == FUNCTION) ? settings.handler(items[i]) : null;

            $(items[i]).addClass(CLASS[settings.orientation][1]);

            if (handler) {

              switch (settings.action) {

                case CLICK:

                  handler.bind(CLICK, function() {

                    pointer = $(obj).data(POINTER);

                    (i == pointer && !settings.stayOpen) ? methods.close.apply(obj , [i, false]) : methods.open.apply(obj, [i, false]);

                  });

                break;

                case HOVER:

                  $(obj).hover(function() {}, function() {

                    clearTimeout(timeout);

                    timeout = setTimeout(function() {

                      (settings.stayOpen) ? null : methods.close.apply(obj , [i, false]);

                    }, settings.hoverTime);

                  });

                  handler.hover(function() {

                    clearTimeout(timeout);

                    timeout = setTimeout(function() {

                      methods.open.apply(obj, [i, false]);
                    }, settings.hoverTime);

                  });

                break;

              }

            }

          })(i);

        }

        (settings.start == null) ?  methods.close.apply(this, [null, true]) : methods.open.apply(this, [settings.start, true])

      },

      close: function(pos, fast) {

        $(this).data(POINTER, null);

        var items = methods._getItems.apply(this),
            properties = methods._getAnimationProperties(settings.orientation, (items.length*settings.size.min)),
            time = (fast) ? 0 : settings.animationTime,
            value,
            fn;

        if (!settings.forceSize) {
          $(this).animate(properties, time, settings.easing[1]);
        }

        settings.close.before(items, pos);

        var width = (settings.forceSize) ? $(this).width()/items.length : settings.size.min;

        for (var i = 0; i < items.length; i++) {

          value = (i*width),
          properties = methods._getAnimationProperties(settings.direction, value);

          fn = function(i) {

            settings.close.durring(items, i, pos);

            $(items[i]).animate(properties, time, settings.easing[1], function() {
              settings.close.each(items, i, pos);
            });

          };

          fn(i);

          $(items[i]).removeClass(CLASS[settings.orientation][2]);

        }

        settings.close.after(items, pos);

      },

      open: function(pos, fast) {

        switch (pos) {

          case NEXT:
            pos = pointer+1;
          break;

          case PREV:
            pos = pointer-1;
          break;

        }

        var items = methods._getItems.apply(this);

        if (pos < 0 || pos > items.length-1) {

          if (settings.circular) {
            pos = (pos < 0) ? items.length-1 : 0;
          } else {
            return false;
          }

        }

        $(this).data(POINTER, pos);

        var width = $(this).width(),
            itemSize = (settings.size.max == VARIABLE) ? methods._getSize(items, pos, width) : settings.size.max,
            contSize = (settings.size.max == VARIABLE) ? ((items.length-1)*settings.size.min)+itemSize : ((items.length-1)*settings.size.min)+settings.size.max,
            time = (fast) ? 0 : settings.animationTime,
            properties = methods._getAnimationProperties(settings.orientation, contSize),
            value,
            fn;

        if (!settings.forceSize) {
          $(this).animate(properties, time, settings.easing[0]);
        }

        settings.open.before(items, pos);

        for (var i = 0; i < items.length; i++) {

          value = (i <= pos) ? (i*settings.size.min) : ((i-1)*settings.size.min)+itemSize,
          properties = methods._getAnimationProperties(settings.direction, value);

          fn = function(i) {

            $(items[i]).animate(properties, time, settings.easing[0], function() {
              settings.open.each(items, i, pos);
            }).removeClass(CLASS[settings.orientation][2]);

            settings.open.durring(items, i, pos)

          };

          fn(i);

          (i == pos) ? $(items[i]).addClass(CLASS[settings.orientation][2]) : null;

        }

        settings.open.after(items, pos);

      },

      destroy: function() {

        var items = methods._getItems.apply(this),
            handler;

        $(this).removeClass(CLASS[settings.orientation][0]);

        for (var i = 0; i < items.length; i++) {

          (function(i) {

            handler = (typeof settings.handler == FUNCTION) ? settings.handler(items[i]) : null;

            $(items[i]).removeClass(CLASS[settings.orientation][0]+' '+CLASS[settings.orientation][1]);

            if (handler) {

              switch (settings.action) {

                case CLICK:
                  handler.unbind(CLICK);
                break;

                case HOVER:

                  $(this).unbind(MOUSEENTER+' '+MOUSELEAVE);

                  handler.unbind(MOUSEENTER);

                break;

              }

            }

          })(i);

        }

      }

    };

    var args = arguments;

    return this.each(function() {

      if (methods[method]) {

        settings = methods._getOptions.apply(this),
        pointer = $(this).data(POINTER);

        methods[method].apply(this, Array.prototype.slice.call(args, 1));

      } else if (typeof method === OBJECT || !method) {
        methods.init.apply(this, args);
      }

    });

  };

})(jQuery);