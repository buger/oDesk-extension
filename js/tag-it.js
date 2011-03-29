(function($) {

  $.fn.tagit = function(options) {
    var self = this;

    var settings = {
      'itemName'          : 'item',
      'fieldName'         : 'tags',
      'availableTags'     : [],
      // callback: called when a tag is added
      'onTagAdded'        : null,
      // callback: called when a tag is removed
      'onTagRemoved'      : null,
      'tagSource'         : function(search, show_choices) {
                              var filter = new RegExp(search.term, "i");
                              var choices = settings.availableTags.filter(function(element) {
                                return (element.search(filter) != -1);
                              });
                              show_choices(subtract_array(choices, assigned_tags()));
                            },
      'removeConfirmation': false,
    };

    if (options) {
      $.extend(settings, options);
    }
    
    var text_metrics = $('<div />')
        .css({'display': 'none','padding':'0', 'margin':'0'})
        .appendTo(document.body);

    var tagList = $(this),
      tagInput  = $("<input class=\"tagit-input\" type=\"text\" />");
      BACKSPACE = 8,
      ENTER     = 13,
      SPACE     = 32,
      COMMA     = 44,
      TAB       = 9;
    
    var resizeTagInput = function() {
        text_metrics.html(tagInput.val());
        tagInput.css({'width': (text_metrics.outerWidth()+20)+'px'});
    }

    tagInput.bind('keydown', resizeTagInput);
    tagInput.bind('focus', resizeTagInput);
    
    self.initializing_tags = true;

    tagList
      // add the tagit CSS class.
      .addClass("tagit")
      // create the input field.
      .append($("<li class=\"tagit-new\"></li>\n").append(tagInput))
      .click(function(e) {
        if (e.target.tagName == 'A') {
          // Removes a tag when the little 'x' is clicked.
          // Event is binded to the UL, otherwise a new tag (LI > A) wouldn't have this event attached to it.
          remove_tag($(e.target).parent());

          tagInput.focus();
        } else {
          // Sets the focus() to the input field, if the user clicks anywhere inside the UL.
          // This is needed because the input field needs to be of a small size.
          tagInput.focus();
        }
      })
      // add existing tags
      .children("li")
        .each(function() {
          if (!$(this).hasClass('tagit-new')) {
            create_tag($(this).html(), $(this).attr("class"));
            $(this).remove();
          }
        });

    self.initializing_tags = false;

    tagInput
      .keydown(function(event) {
        var keyCode = event.keyCode || event.which;
        // Backspace is not detected within a keypress, so using a keydown
        if (keyCode == BACKSPACE && tagInput.val() == "") {
          var tag = tagList.children(".tagit-choice:last");
          if (!settings.removeConfirmation || tag.hasClass("remove")) {
            // When backspace is pressed, the last tag is deleted.
            remove_tag(tag);
          } else if (settings.removeConfirmation) {
            tag.addClass("remove");
          }
        }
      })
      .keypress(function(event) {
        var keyCode = event.keyCode || event.which;
        // Comma/Space/Enter are all valid delimiters for new tags. except when there is an open quote
        if (
            keyCode == COMMA ||
            keyCode == ENTER ||
            keyCode == TAB ||
            (
              false && keyCode == SPACE &&
              (
                (tagInput.val().trim().replace( /^s*/, "" ).charAt(0) != '"') ||
                (
                  tagInput.val().trim().charAt(0) == '"' &&
                  tagInput.val().trim().charAt(tagInput.val().trim().length - 1) == '"' &&
                  tagInput.val().trim().length - 1 != 0
                )
              )
            )
          ) {

          event.preventDefault();
          create_tag(tagInput.val().replace(/^"|"$|,+$/g, "").trim());
        }
        if (settings.removeConfirmation) {
          tagList.children(".tagit-choice:last").removeClass("remove");
        }
      });

    if (options.availableTags || options.tagSource) {
      tagInput.autocomplete({
        source: settings.tagSource,
        select: function(event, ui) {
          create_tag(ui.item.value);
          // Preventing the tag input to be updated with the chosen value.
          return false;
        }
      });
    }

    function assigned_tags() {
      var tags = [];
      tagList.children(".tagit-choice").each(function() {
        tags.push($(this).children("input").val());
      });
      return tags;
    }

    function subtract_array(a1, a2) {
      var result = new Array();
      for(var i = 0; i < a1.length; i++) {
        if (a2.indexOf(a1[i]) == -1) {
          result.push(a1[i]);
        }
      }
      return result;
    }

    function is_new(value) {
      var isNew = true;
      tagList.children(".tagit-choice").each(function(i) {
        if (value == $(this).children("input").val()) {
          isNew = false;
          return;
        }
      });
      return isNew;
    }

    function create_tag(value, additionalClass) {
      // Cleaning the input.
      tagInput.val("");

      if (!is_new(value) || value == "") {
        return false;
      }

      // create tag
      var tag = $("<li />")
        .addClass("tagit-choice")
        .addClass(additionalClass)
        .append(value)
        .append("<a class=\"close\">x</a>")
        .append("<input type=\"hidden\" style=\"display:none;\" value=\"" + value + "\" name=\"" + settings.itemName + "[" + settings.fieldName + "][]\">");

      // insert tag
      tagInput.parent().before(tag);
        
      if (settings.onTagAdded && !self.initializing_tags) {
        settings.onTagAdded(tag);
      }

    }

    function remove_tag(tag) {
      tag.remove();

      if (settings.onTagRemoved) {
        settings.onTagRemoved(tag);
      }
    }

    // maintaining chainability
    return this;
  };

  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
  };

})(jQuery);
