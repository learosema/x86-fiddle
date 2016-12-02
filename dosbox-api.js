(function() {
    this.Dosbox = (function() {
        function Dosbox(options) {
            this.onload = options.onload;
            this.onrun = options.onrun;
            this.module = new Dosbox.Module({
                canvas: document.querySelector('.dosbox-canvas')
            });
            this.ui.onStart((function(_this) {
                return function() {
                    _this.ui.showLoader();
                    return _this.downloadScript();
                }
                ;
            })(this));
        }
        Dosbox.prototype.run = function(archiveUrl, executable) {
            return new Dosbox.Mount(this.module,archiveUrl,{
                success: (function(_this) {
                    return function() {
                        var func, hide;
                        _this.ui.updateMessage("Launching " + executable);
                        hide = function() {
                            return _this.ui.hideLoader();
                        }
                        ;
                        func = function() {
                            return _this._dosbox_main(_this, executable);
                        }
                        ;
                        setTimeout(func, 1000);
                        return setTimeout(hide, 3000);
                    }
                    ;
                })(this),
                progress: (function(_this) {
                    return function(total, current) {
                        return _this.ui.updateMessage("Mount " + executable + " (" + (current * 100 / total | 0) + "%)");
                    }
                    ;
                })(this)
            });
        }
        ;
        Dosbox.prototype.requestFullScreen = function() {
            if (this.module.requestFullScreen) {
                return this.module.requestFullScreen(true, false);
            }
        }
        ;
        Dosbox.prototype.downloadScript = function() {
            this.module.setStatus('Downloading js-dos');
            this.ui.updateMessage('Downloading js-dos');
            return new Dosbox.Xhr('https://js-dos.com/cdn/js-dos.js',{
                success: (function(_this) {
                    return function(script) {
                        var func;
                        _this.ui.updateMessage('Initializing dosbox');
                        func = function() {
                            return _this._jsdos_init(_this.module, script, _this.onload);
                        }
                        ;
                        return setTimeout(func, 1000);
                    }
                    ;
                })(this),
                progress: (function(_this) {
                    return function(total, current) {
                        return _this.ui.updateMessage("Downloading js-dos (" + (current * 100 / total | 0) + "%)");
                    }
                    ;
                })(this)
            });
        }
        ;
        Dosbox.prototype._jsdos_init = function(module, script, onload) {
            var Module;
            Module = module;
            eval(script);
            if (onload) {
                return onload(this);
            }
        }
        ;
        Dosbox.prototype._dosbox_main = function(dosbox, executable) {
            var exception, func;
            try {
                if (dosbox.onrun) {
                    func = function() {
                        return dosbox.onrun(dosbox, executable);
                    }
                    ;
                    setTimeout(func, 1000);
                }
                return dosbox.module.ccall('dosbox_main', 'int', ['string'], [executable]);
            } catch (_error) {
                exception = _error;
                if (exception === 'SimulateInfiniteLoop') {} else {
                    return typeof console !== "undefined" && console !== null ? typeof console.error === "function" ? console.error(exception) : void 0 : void 0;
                }
            }
        }
        ;
        return Dosbox;
    })();
}
).call(this);
(function() {
    Dosbox.Module = (function() {
        function Module(options) {
            this.elCanvas = options.canvas;
            this.canvas = this.elCanvas[0];
        }
        Module.prototype.preRun = [];
        Module.prototype.postRun = [];
        Module.prototype.totalDependencies = 0;
        Module.prototype.print = function(text) {
            text = Array.prototype.slice.call(arguments).join(' ');
            return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(text) : void 0 : void 0;
        }
        ;
        Module.prototype.printErr = function(text) {
            text = Array.prototype.slice.call(arguments).join(' ');
            return typeof console !== "undefined" && console !== null ? typeof console.error === "function" ? console.error(text) : void 0 : void 0;
        }
        ;
        Module.prototype.setStatus = function(text) {
            return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(text) : void 0 : void 0;
        }
        ;
        Module.prototype.monitorRunDependencies = function(left) {
            var status;
            this.totalDependencies = Math.max(this.totalDependencies, left);
            status = left ? "Preparing... (" + (this.totalDependencies - left) + "/" + this.totalDependencies + ")" : 'All downloads complete.';
            return Module.setStatus(status);
        }
        ;
        return Module;
    })();
}
).call(this);
(function() {
    Dosbox.Mount = (function() {
        function Mount(module, url, options) {
            this.module = module;
            new Dosbox.Xhr(url,{
                success: (function(_this) {
                    return function(data) {
                        var bytes;
                        bytes = _this._toArray(data);
                        if (_this._mountZip(bytes)) {
                            return options.success();
                        } else {
                            return typeof console !== "undefined" && console !== null ? typeof console.error === "function" ? console.error('Unable to mount', url) : void 0 : void 0;
                        }
                    }
                    ;
                })(this),
                progress: options.progress
            });
        }
        Mount.prototype._mountZip = function(bytes) {
            var buffer, extracted;
            buffer = this.module._malloc(bytes.length);
            this.module.HEAPU8.set(bytes, buffer);
            extracted = this.module.ccall('extract_zip', 'int', ['number', 'number'], [buffer, bytes.length]);
            this.module._free(buffer);
            return extracted === 0;
        }
        ;
        Mount.prototype._toArray = function(data) {
            var arr, i, len;
            if (typeof data === 'string') {
                arr = new Array(data.length);
                i = 0;
                len = data.length;
                while (i < len) {
                    arr[i] = data.charCodeAt(i);
                    ++i;
                }
                return arr;
            }
            return data;
        }
        ;
        return Mount;
    })();
}
).call(this);
(function() {
    Dosbox.UI = (function() {
        function UI(options) {
            this.appendCss();
            this.div = $('#' + (options.id || 'dosbox'));
            this.wrapper = $('<div class="dosbox-container">');
            this.canvas = $('<canvas class="dosbox-canvas" oncontextmenu="event.preventDefault()">');
            this.overlay = $('<div class="dosbox-overlay">');
            this.loaderMessage = $('<div class="dosbox-loader-message">');
            this.loader = $('<div class="dosbox-loader">').append($('<div class="st-loader">').append($('<span class="equal">'))).append(this.loaderMessage);
            this.start = $('<div class="dosbox-start">Click to start');
            this.div.append(this.wrapper);
            this.wrapper.append(this.canvas);
            this.wrapper.append(this.loader);
            this.wrapper.append(this.overlay);
            this.overlay.append($('<div class="dosbox-powered">Powered by &nbsp;').append($('<a href="http://js-dos.com">js-dos.com')));
            this.overlay.append(this.start);
        }
        UI.prototype.onStart = function(fun) {
            return this.start.click((function(_this) {
                return function() {
                    fun();
                    return _this.overlay.hide();
                }
                ;
            })(this));
        }
        ;
        UI.prototype.appendCss = function() {
            var head, style;
            head = document.head || document.getElementsByTagName('head')[0];
            style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = this.css;
            } else {
                style.appendChild(document.createTextNode(this.css));
            }
            return head.appendChild(style);
        }
        ;
        UI.prototype.showLoader = function() {
            this.loader.show();
            return this.loaderMessage.html('');
        }
        ;
        UI.prototype.updateMessage = function(message) {
            return this.loaderMessage.html(message);
        }
        ;
        UI.prototype.hideLoader = function() {
            return this.loader.hide();
        }
        ;
        UI.prototype.css = '.dosbox-container { position: relative; min-width: 320px; min-height: 200px; } .dosbox-canvas { } .dosbox-overlay, .dosbox-loader { position: absolute; left: 0; right: 0; top: 0; bottom: 0; background-color: #333; } .dosbox-start { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; color: #f80; font-size: 1.5em; text-decoration: underline; cursor: pointer; } .dosbox-overlay a { color: #f80; } .dosbox-loader { display: none; } .dosbox-powered { position: absolute; right: 1em; bottom: 1em; font-size: 0.8em; color: #9C9C9C; } .dosbox-loader-message { text-align: center; position: absolute; left: 0; right: 0; bottom: 50%; margin: 0 0 -3em 0; box-sizing: border-box; color: #f80; font-size: 1.5em; } @-moz-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @-webkit-keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } @keyframes loading { 0% { left: 0; } 50% { left: 8.33333em; } 100% { left: 0; } } .st-loader { width: 10em; height: 2.5em; position: absolute; top: 50%; left: 50%; margin: -1.25em 0 0 -5em; box-sizing: border-box; } .st-loader:before, .st-loader:after { content: ""; display: block; position: absolute; top: 0; bottom: 0; width: 1.25em; box-sizing: border-box; border: 0.25em solid #f80; } .st-loader:before { left: -0.76923em; border-right: 0; } .st-loader:after { right: -0.76923em; border-left: 0; } .st-loader .equal { display: block; position: absolute; top: 50%; margin-top: -0.5em; left: 4.16667em; height: 1em; width: 1.66667em; border: 0.25em solid #f80; box-sizing: border-box; border-width: 0.25em 0; -moz-animation: loading 1.5s infinite ease-in-out; -webkit-animation: loading 1.5s infinite ease-in-out; animation: loading 1.5s infinite ease-in-out; }';
        return UI;
    })();
}
).call(this);

(function() {
    Dosbox.Xhr = (function() {
        function Xhr(url, options) {
            var e;
            this.success = options.success;
            this.progress = options.progress;
            if (window.ActiveXObject) {
                try {
                    this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
                } catch (_error) {
                    e = _error;
                    this.xhr = null ;
                }
            } else {
                this.xhr = new XMLHttpRequest();
            }
            this.xhr.open('GET', url, true);
            this.xhr.overrideMimeType('text/plain; charset=x-user-defined');
            this.xhr.addEventListener('progress', (function(_this) {
                return function(evt) {
                    if (_this.progress) {
                        return _this.progress(evt.total, evt.loaded);
                    }
                }
                ;
            })(this));
            this.xhr.onreadystatechange = (function(_this) {
                return function() {
                    return _this._onReadyStateChange();
                }
                ;
            })(this);
            this.xhr.send();
        }
        Xhr.prototype._onReadyStateChange = function() {
            if (this.xhr.readyState === 4 && this.success) {
                return this.success(this.xhr.responseText);
            }
        }
        ;
        return Xhr;
    })();
}
).call(this);
