/**
 * WYSIWYG - jQuery plugin 1.0
 *
 * Copyright (c) 2007 Juan M Martinez
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 */
(function( $ )
{
    $.fn.document = function()
    {
        var element = this[0];

        if ( element.nodeName.toLowerCase() == 'iframe' )
            return element.contentWindow.document;
            /*
            return ( $.browser.msie )
                ? document.frames[element.id].document
                : element.contentWindow.document // contentDocument;
             */
        else
            return $(this);
    };

    $.fn.wysiwyg = function( options )
    {
        var options = $.extend({
            debug : false,
            html  : '<'+'?xml version="1.0" encoding="UTF-8"?'+'><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>INITIAL_CONTENT</body></html>'
        }, options);

        // not break the chain
        return this.each(function()
        {
            Wysiwyg(this, options);
        });
    };

    function Wysiwyg( element, options )
    {
        return this instanceof Wysiwyg
            ? this.init(element, options)
            : new Wysiwyg(element, options);
    }

    $.extend(Wysiwyg.prototype,
    {
        original : null,
        options  : {},

        element  : null,
        editor   : null,

        init : function( element, options )
        {
            this.editor = element;
            this.options = options || {};

            var newX = element.width || element.clientWidth;
            var newY = element.height || element.clientHeight;

            if ( element.nodeName.toLowerCase() == 'textarea' )
            {
                this.original = element;

                if ( newX == 0 && element.cols )
                    newX = element.cols * 8;

                var editor = this.editor = $('<iframe></iframe>').css({
                    minHeight : ( newY - 8 ).toString() + 'px',
                    width     : ( newX - 8 ).toString() + 'px'
                }).attr('id', $(element).attr('id') + 'IFrame');

                if ( $.browser.msie )
                {
                    this.editor
                        .css('height', ( newY ).toString() + 'px');

                    /**
                    var editor = $('<span></span>').css({
                        width     : ( newX - 8 ).toString() + 'px',
                        height    : ( newY - 8 ).toString() + 'px'
                    }).attr('id', $(element).attr('id') + 'IFrame');

                    editor.outerHTML = this.editor.outerHTML;
                     */
                }
            }

            var panel = this.panel = $('<ul></ul>').addClass('panel');

            this.appendMenu('bold');
            this.appendMenu('italic');
            // this.appendMenu('strikeThrough');
            // this.appendMenu('underline');

            this.appendMenuSeparator();
            this.appendMenu('justifyLeft');
            this.appendMenu('justifyCenter');
            this.appendMenu('justifyRight');
            this.appendMenu('justifyFull');

            // this.appendMenu('indent');
            // this.appendMenu('outdent');

            // this.appendMenuSeparator();
            // this.appendMenu('subscript');
            // this.appendMenu('superscript');

            // this.appendMenuSeparator();
            // this.appendMenu('undo');
            // this.appendMenu('redo');

            this.appendMenuSeparator();
            this.appendMenu('insertOrderedList');
            this.appendMenu('insertUnorderedList');
            // this.appendMenu('insertHorizontalRule');

            if ( $.browser.msie )
            {
                this.appendMenu('createLink', [], null, function( self ) { self.editorDoc.execCommand('createLink', true, null); });
                this.appendMenu('insertImage', [], null, function( self ) { self.editorDoc.execCommand('insertImage', true, null); });
            }
            else
            {
                this.appendMenu('createLink', [], null, function( self ) { var szURL = prompt('Ingrese una URL', 'http://'); if ( szURL && szURL.length > 0 ) self.editorDoc.execCommand('createLink', false, szURL); });
                this.appendMenu('insertImage', [], null, function( self ) { var szURL = prompt('Ingrese una URL', 'http://'); if ( szURL && szURL.length > 0 ) self.editorDoc.execCommand('insertImage', false, szURL); });
            }

            if ( $.browser.mozilla )
            {
                this.appendMenuSeparator();
                this.appendMenu('heading', ['h1'], 'h1');
                this.appendMenu('heading', ['h2'], 'h2');
                this.appendMenu('heading', ['h3'], 'h3');
                // this.appendMenu('heading', ['h4'], 'h4');
                // this.appendMenu('heading', ['h5'], 'h5');
                // this.appendMenu('heading', ['h6'], 'h6');
            }
            else
            {
                this.appendMenuSeparator();
                this.appendMenu('formatBlock', ['<h1>'], 'h1');
                this.appendMenu('formatBlock', ['<h2>'], 'h2');
                this.appendMenu('formatBlock', ['<h3>'], 'h3');
                // this.appendMenu('formatBlock', ['<h4>'], 'h4');
                // this.appendMenu('formatBlock', ['<h5>'], 'h5');
                // this.appendMenu('formatBlock', ['<h6>'], 'h6');
            }

            // this.appendMenuSeparator();
            // this.appendMenu('cut');
            // this.appendMenu('copy');
            // this.appendMenu('paste');

            if ( !( $.browser.msie ) )
            {
                this.appendMenuSeparator();
                this.appendMenu('increaseFontSize');
                this.appendMenu('decreaseFontSize');
            }

            this.appendMenuSeparator();
            this.appendMenu('html', [], null, function( self )
            {
                if ( self.viewHTML )
                {
                    self.setContent( $(self.original).val() );
                    $(self.original).hide();
                }
                else
                {
                    self.saveContent();
                    $(self.original).show();
                }

                self.viewHTML = !( self.viewHTML );
            });

            this.appendMenu('removeFormat', [], null, function( self )
            {
                self.editorDoc.execCommand('removeFormat', false, []);
                self.editorDoc.execCommand('unlink', false, []);
            });

            this.element = $('<div></div>').css({
                width : ( newX > 0 ) ? ( newX ).toString() + 'px' : '100%'
            }).addClass('wysiwyg')
              .append(panel)
              .append( $('<div><!-- --></div>').css({ clear : 'both' }) )
              .append(editor);

            $(element)
            // .css('display', 'none')
            .hide()
            .before(this.element);

            this.viewHTML = false;

            this.initialHeight = newY - 8;
            this.initialContent = $(element).text();

            this.initFrame();

            if ( this.initialContent.length == 0 )
                this.setContent('<br />');

            var self = this;

            $('form').each(function()
            {
                $(this).submit(function()
                {
                    self.saveContent();
                });
            });
        },

        initFrame : function()
        {
            this.editorDoc = $(this.editor).document();
            this.editorDoc.open();
            this.editorDoc.write(
                this.options.html.replace(/INITIAL_CONTENT/, this.initialContent)
            );
            this.editorDoc.close();
            this.editorDoc.contentEditable = 'true';

            this.editorDoc_designMode = false;

            try {
                this.editorDoc.designMode = 'on';
                this.editorDoc_designMode = true;
            } catch ( e ) {
                var self = this;

                // Will fail on Gecko if the editor is placed in an hidden container element
                // The design mode will be set ones the editor is focused

                $(this.editorDoc).focus(function()
                {
                    if ( !( self.editorDoc_designMode ) )
                    {
                        try {
                            self.editorDoc.designMode = 'on';
                            self.editorDoc_designMode = true;
                        } catch ( e ) {}
                    }
                });
            }
        },

        getContent : function()
        {
            return $( $(this.editor).document() ).find('body').html();
        },

        setContent : function( newContent )
        {
            $( $(this.editor).document() ).find('body').html(newContent);
        },

        saveContent : function()
        {
            if ( this.original )
                $(this.original).val( this.getContent() );
        },

        appendMenu : function( cmd, args, className, fn )
        {
            var self = this;
            var args = args || [];

            $('<li></li>').append(
                $('<a><!-- --></a>').addClass(className || cmd)
            ).mousedown(function() {
                if ( fn ) fn(self); else self.editorDoc.execCommand(cmd, false, args);
            }).appendTo( this.panel );
        },

        appendMenuSeparator : function()
        {
            $('<li class="separator"></li>').appendTo( this.panel );
        }
    });
})(jQuery);