﻿/// <reference path="/umbraco_client/Application/NamespaceManager.js" />

Umbraco.Sys.registerNamespace("Umbraco.Controls.CodeEditor");

(function($) {
    Umbraco.Controls.CodeEditor.UmbracoEditor = function(isSimpleEditor, controlId) {
        
        //initialize
        var _isSimpleEditor = isSimpleEditor;
        var _controlId = controlId;
        
        if (!_isSimpleEditor && typeof(codeEditor) == "undefined") {
            throw "CodeMirror editor not found!";
        }        
        
        //create the inner object
        var obj =  {
            
            _editor: (typeof(codeEditor) == "undefined" ? null : codeEditor), //the codemirror object
            _control: $("#" + _controlId), //the original textbox as a jquery object
            _cmSave: null,//the saved selection of the code mirror editor (used for IE)
            
            IsSimpleEditor: typeof(CodeMirror) == "undefined" ? true : typeof(codeEditor) == "undefined" ? true : _isSimpleEditor,
            
            GetCode: function() {
                if (this.IsSimpleEditor) {
                    return this._control.val();
                }  
                else {
                    //this is a wrapper for CodeMirror
                    return this._editor.getCode();
                }                
            },            
            Insert: function(open, end, txtEl, arg3) {                
                //arg3 gets appended to open, not actually sure why it's needed but we'll keep it for legacy, it's optional                
                if (_isSimpleEditor) {
                    if (navigator.userAgent.match('MSIE')) {
                        this._IEInsertSelection(open, end, txtEl, arg3);
                    }
                    else {
                        //if not ie, use jquery field select, it's easier                        
                        var selection = jQuery("#" + txtEl).getSelection().text;
                        var replace = (arg3) ? open + arg3 : open; //concat open and arg3, if arg3 specified
                        if (end != "") {
                            replace = replace + selection + end;
                        }
                        jQuery("#" + txtEl).replaceSelection(replace);
                        jQuery("#" + txtEl).focus();
                        this._insertSimple(open, end, txtEl, arg3);
                    }                    
                }
                else {
                    this._editor.win.document.body.focus(); //need to restore the focus to the editor body
                    
                    //if the saved selection (IE only) is not null, then
                    //reselect the selection there is one, otherwise, expand the non-selection by 1
                    //I know, this is wierd but it's an IE issue and this fixes it.
                    if (this._cmSave != null) {
                        if (this._cmSave.text.length > 0) {
                             this._cmSave.select();
                        }
                        else {
                            this._cmSave.expand("character");
                        }
                    }
                    
                    var selection = this._editor.selection();
                    var replace = (arg3) ? open + arg3 : open; //concat open and arg3, if arg3 specified
                    if (end != "") {
                        replace = replace + selection + end;
                    }
                    this._editor.replaceSelection(replace);
                    this._editor.focus();
                }
            },
            _IEInsertSelection: function(open, end, txtEl) {
                var tArea = document.getElementById(txtEl);
                tArea.focus();
                var open = (open) ? open : "";
                var end = (end) ? end : "";
                var curSelect = tArea.currRange;                
                if (arguments[3]) {
                    if (end == "") {
                        curSelect.text = open + arguments[3];
                    } else {
                        curSelect.text = open + arguments[3] + curSelect.text + end;
                    }
                } else {
                    if (end == "") {
                        curSelect.text = open;
                    } else {
                        curSelect.text = open + curSelect.text + end;
                    }
                }
                curSelect.select();
            },        
            _IESelectionHelper: function() {
                 /// <summary>
                 /// Because IE is lame, we have to continuously save the selections created by the user
                 /// in the editors so that when the selections are lost (i.e. the user types in a different text box
                 /// we'll need to restore the selection when they return focus
                 /// </summary>
                 if (navigator.userAgent.match('MSIE')) {                 
                    var _this = this;
                    if (this._editor == null)  {
                        function storeCaret(editEl) {
                            editEl.currRange = document.selection.createRange().duplicate();    
                        }
                        //need to store the selection details on each event while editing content                        
                        this._control.select( function() {storeCaret(this)} );
                        this._control.click( function() {storeCaret(this)} );
                        this._control.keyup( function() {storeCaret(this)} );
                    }
                    else {                        
                        //when the editor loses focus, save the current selection
                        this._editor.win.document.body.onblur = function() 
                        { 
                            _this._cmSave = _this._editor.win.document.selection.createRange();                   
                            return true;
                        };
                    }                    
                }
            }
        };
        obj._IESelectionHelper();
        return obj;
    }    
})(jQuery); 

