/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ 1806: /***/ (__unused_webpack_module, exports) => {
      /**
       * Expose `Emitter`.
       */

      exports.Emitter = Emitter;

      /**
       * Initialize a new `Emitter`.
       *
       * @api public
       */

      function Emitter(obj) {
        if (obj) return mixin(obj);
      }

      /**
       * Mixin the emitter properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }

      /**
       * Listen on the given `event` with `fn`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.on = Emitter.prototype.addEventListener = function (
        event,
        fn,
      ) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] =
          this._callbacks['$' + event] || []).push(fn);
        return this;
      };

      /**
       * Adds an `event` listener that will be invoked a single
       * time then automatically removed.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.once = function (event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
      };

      /**
       * Remove the given callback for `event` or all
       * registered callbacks.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.off =
        Emitter.prototype.removeListener =
        Emitter.prototype.removeAllListeners =
        Emitter.prototype.removeEventListener =
          function (event, fn) {
            this._callbacks = this._callbacks || {};

            // all
            if (0 == arguments.length) {
              this._callbacks = {};
              return this;
            }

            // specific event
            var callbacks = this._callbacks['$' + event];
            if (!callbacks) return this;

            // remove all handlers
            if (1 == arguments.length) {
              delete this._callbacks['$' + event];
              return this;
            }

            // remove specific handler
            var cb;
            for (var i = 0; i < callbacks.length; i++) {
              cb = callbacks[i];
              if (cb === fn || cb.fn === fn) {
                callbacks.splice(i, 1);
                break;
              }
            }

            // Remove event specific arrays for event types that no
            // one is subscribed for to avoid memory leak.
            if (callbacks.length === 0) {
              delete this._callbacks['$' + event];
            }

            return this;
          };

      /**
       * Emit `event` with the given args.
       *
       * @param {String} event
       * @param {Mixed} ...
       * @return {Emitter}
       */

      Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};

        var args = new Array(arguments.length - 1),
          callbacks = this._callbacks['$' + event];

        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }

        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }

        return this;
      };

      // alias used for reserved events (protected method)
      Emitter.prototype.emitReserved = Emitter.prototype.emit;

      /**
       * Return array of callbacks for `event`.
       *
       * @param {String} event
       * @return {Array}
       * @api public
       */

      Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
      };

      /**
       * Check if this emitter has `event` handlers.
       *
       * @param {String} event
       * @return {Boolean}
       * @api public
       */

      Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
      };

      /***/
    },

    /***/ 2415: /***/ (module) => {
      /**
       * Expose `Backoff`.
       */

      module.exports = Backoff;

      /**
       * Initialize backoff timer with `opts`.
       *
       * - `min` initial timeout in milliseconds [100]
       * - `max` max timeout [10000]
       * - `jitter` [0]
       * - `factor` [2]
       *
       * @param {Object} opts
       * @api public
       */

      function Backoff(opts) {
        opts = opts || {};
        this.ms = opts.min || 100;
        this.max = opts.max || 10000;
        this.factor = opts.factor || 2;
        this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
        this.attempts = 0;
      }

      /**
       * Return the backoff duration.
       *
       * @return {Number}
       * @api public
       */

      Backoff.prototype.duration = function () {
        var ms = this.ms * Math.pow(this.factor, this.attempts++);
        if (this.jitter) {
          var rand = Math.random();
          var deviation = Math.floor(rand * this.jitter * ms);
          ms =
            (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
        }
        return Math.min(ms, this.max) | 0;
      };

      /**
       * Reset the number of attempts.
       *
       * @api public
       */

      Backoff.prototype.reset = function () {
        this.attempts = 0;
      };

      /**
       * Set the minimum duration
       *
       * @api public
       */

      Backoff.prototype.setMin = function (min) {
        this.ms = min;
      };

      /**
       * Set the maximum duration
       *
       * @api public
       */

      Backoff.prototype.setMax = function (max) {
        this.max = max;
      };

      /**
       * Set the jitter
       *
       * @api public
       */

      Backoff.prototype.setJitter = function (jitter) {
        this.jitter = jitter;
      };

      /***/
    },

    /***/ 8479: /***/ (module, exports, __nccwpck_require__) => {
      /* eslint-env browser */

      /**
       * This is the web browser implementation of `debug()`.
       */

      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.storage = localstorage();
      exports.destroy = (() => {
        let warned = false;

        return () => {
          if (!warned) {
            warned = true;
            console.warn(
              'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.',
            );
          }
        };
      })();

      /**
       * Colors.
       */

      exports.colors = [
        '#0000CC',
        '#0000FF',
        '#0033CC',
        '#0033FF',
        '#0066CC',
        '#0066FF',
        '#0099CC',
        '#0099FF',
        '#00CC00',
        '#00CC33',
        '#00CC66',
        '#00CC99',
        '#00CCCC',
        '#00CCFF',
        '#3300CC',
        '#3300FF',
        '#3333CC',
        '#3333FF',
        '#3366CC',
        '#3366FF',
        '#3399CC',
        '#3399FF',
        '#33CC00',
        '#33CC33',
        '#33CC66',
        '#33CC99',
        '#33CCCC',
        '#33CCFF',
        '#6600CC',
        '#6600FF',
        '#6633CC',
        '#6633FF',
        '#66CC00',
        '#66CC33',
        '#9900CC',
        '#9900FF',
        '#9933CC',
        '#9933FF',
        '#99CC00',
        '#99CC33',
        '#CC0000',
        '#CC0033',
        '#CC0066',
        '#CC0099',
        '#CC00CC',
        '#CC00FF',
        '#CC3300',
        '#CC3333',
        '#CC3366',
        '#CC3399',
        '#CC33CC',
        '#CC33FF',
        '#CC6600',
        '#CC6633',
        '#CC9900',
        '#CC9933',
        '#CCCC00',
        '#CCCC33',
        '#FF0000',
        '#FF0033',
        '#FF0066',
        '#FF0099',
        '#FF00CC',
        '#FF00FF',
        '#FF3300',
        '#FF3333',
        '#FF3366',
        '#FF3399',
        '#FF33CC',
        '#FF33FF',
        '#FF6600',
        '#FF6633',
        '#FF9900',
        '#FF9933',
        '#FFCC00',
        '#FFCC33',
      ];

      /**
       * Currently only WebKit-based Web Inspectors, Firefox >= v31,
       * and the Firebug extension (any Firefox version) are known
       * to support "%c" CSS customizations.
       *
       * TODO: add a `localStorage` variable to explicitly enable/disable colors
       */

      // eslint-disable-next-line complexity
      function useColors() {
        // NB: In an Electron preload script, document will be defined but not fully
        // initialized. Since we know we're in Chrome, we'll just detect this case
        // explicitly
        if (
          typeof window !== 'undefined' &&
          window.process &&
          (window.process.type === 'renderer' || window.process.__nwjs)
        ) {
          return true;
        }

        // Internet Explorer and Edge do not support colors.
        if (
          typeof navigator !== 'undefined' &&
          navigator.userAgent &&
          navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
        ) {
          return false;
        }

        // Is webkit? http://stackoverflow.com/a/16459606/376773
        // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
        return (
          (typeof document !== 'undefined' &&
            document.documentElement &&
            document.documentElement.style &&
            document.documentElement.style.WebkitAppearance) ||
          // Is firebug? http://stackoverflow.com/a/398120/376773
          (typeof window !== 'undefined' &&
            window.console &&
            (window.console.firebug ||
              (window.console.exception && window.console.table))) ||
          // Is firefox >= v31?
          // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
          (typeof navigator !== 'undefined' &&
            navigator.userAgent &&
            navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
            parseInt(RegExp.$1, 10) >= 31) ||
          // Double check webkit in userAgent just in case we are in a worker
          (typeof navigator !== 'undefined' &&
            navigator.userAgent &&
            navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
        );
      }

      /**
       * Colorize log arguments if enabled.
       *
       * @api public
       */

      function formatArgs(args) {
        args[0] =
          (this.useColors ? '%c' : '') +
          this.namespace +
          (this.useColors ? ' %c' : ' ') +
          args[0] +
          (this.useColors ? '%c ' : ' ') +
          '+' +
          module.exports.humanize(this.diff);

        if (!this.useColors) {
          return;
        }

        const c = 'color: ' + this.color;
        args.splice(1, 0, c, 'color: inherit');

        // The final "%c" is somewhat tricky, because there could be other
        // arguments passed either before or after the %c, so we need to
        // figure out the correct index to insert the CSS into
        let index = 0;
        let lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match) => {
          if (match === '%%') {
            return;
          }
          index++;
          if (match === '%c') {
            // We only are interested in the *last* %c
            // (the user may have provided their own)
            lastC = index;
          }
        });

        args.splice(lastC, 0, c);
      }

      /**
       * Invokes `console.debug()` when available.
       * No-op when `console.debug` is not a "function".
       * If `console.debug` is not available, falls back
       * to `console.log`.
       *
       * @api public
       */
      exports.log = console.debug || console.log || (() => {});

      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */
      function save(namespaces) {
        try {
          if (namespaces) {
            exports.storage.setItem('debug', namespaces);
          } else {
            exports.storage.removeItem('debug');
          }
        } catch (error) {
          // Swallow
          // XXX (@Qix-) should we be logging these?
        }
      }

      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */
      function load() {
        let r;
        try {
          r = exports.storage.getItem('debug');
        } catch (error) {
          // Swallow
          // XXX (@Qix-) should we be logging these?
        }

        // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
        if (!r && typeof process !== 'undefined' && 'env' in process) {
          r = process.env.DEBUG;
        }

        return r;
      }

      /**
       * Localstorage attempts to return the localstorage.
       *
       * This is necessary because safari throws
       * when a user disables cookies/localstorage
       * and you attempt to access it.
       *
       * @return {LocalStorage}
       * @api private
       */

      function localstorage() {
        try {
          // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
          // The Browser also has localStorage in the global context.
          return localStorage;
        } catch (error) {
          // Swallow
          // XXX (@Qix-) should we be logging these?
        }
      }

      module.exports = __nccwpck_require__(4028)(exports);

      const { formatters } = module.exports;

      /**
       * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
       */

      formatters.j = function (v) {
        try {
          return JSON.stringify(v);
        } catch (error) {
          return '[UnexpectedJSONParseError]: ' + error.message;
        }
      };

      /***/
    },

    /***/ 4028: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      /**
       * This is the common logic for both the Node.js and web browser
       * implementations of `debug()`.
       */

      function setup(env) {
        createDebug.debug = createDebug;
        createDebug.default = createDebug;
        createDebug.coerce = coerce;
        createDebug.disable = disable;
        createDebug.enable = enable;
        createDebug.enabled = enabled;
        createDebug.humanize = __nccwpck_require__(1363);
        createDebug.destroy = destroy;

        Object.keys(env).forEach((key) => {
          createDebug[key] = env[key];
        });

        /**
         * The currently active debug mode names, and names to skip.
         */

        createDebug.names = [];
        createDebug.skips = [];

        /**
         * Map of special "%n" handling functions, for the debug "format" argument.
         *
         * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
         */
        createDebug.formatters = {};

        /**
         * Selects a color for a debug namespace
         * @param {String} namespace The namespace string for the for the debug instance to be colored
         * @return {Number|String} An ANSI color code for the given namespace
         * @api private
         */
        function selectColor(namespace) {
          let hash = 0;

          for (let i = 0; i < namespace.length; i++) {
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
          }

          return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
        }
        createDebug.selectColor = selectColor;

        /**
         * Create a debugger with the given `namespace`.
         *
         * @param {String} namespace
         * @return {Function}
         * @api public
         */
        function createDebug(namespace) {
          let prevTime;
          let enableOverride = null;
          let namespacesCache;
          let enabledCache;

          function debug(...args) {
            // Disabled?
            if (!debug.enabled) {
              return;
            }

            const self = debug;

            // Set `diff` timestamp
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;

            args[0] = createDebug.coerce(args[0]);

            if (typeof args[0] !== 'string') {
              // Anything else let's inspect with %O
              args.unshift('%O');
            }

            // Apply any `formatters` transformations
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
              // If we encounter an escaped % then don't increase the array index
              if (match === '%%') {
                return '%';
              }
              index++;
              const formatter = createDebug.formatters[format];
              if (typeof formatter === 'function') {
                const val = args[index];
                match = formatter.call(self, val);

                // Now we need to remove `args[index]` since it's inlined in the `format`
                args.splice(index, 1);
                index--;
              }
              return match;
            });

            // Apply env-specific formatting (colors, etc.)
            createDebug.formatArgs.call(self, args);

            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
          }

          debug.namespace = namespace;
          debug.useColors = createDebug.useColors();
          debug.color = createDebug.selectColor(namespace);
          debug.extend = extend;
          debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

          Object.defineProperty(debug, 'enabled', {
            enumerable: true,
            configurable: false,
            get: () => {
              if (enableOverride !== null) {
                return enableOverride;
              }
              if (namespacesCache !== createDebug.namespaces) {
                namespacesCache = createDebug.namespaces;
                enabledCache = createDebug.enabled(namespace);
              }

              return enabledCache;
            },
            set: (v) => {
              enableOverride = v;
            },
          });

          // Env-specific initialization logic for debug instances
          if (typeof createDebug.init === 'function') {
            createDebug.init(debug);
          }

          return debug;
        }

        function extend(namespace, delimiter) {
          const newDebug = createDebug(
            this.namespace +
              (typeof delimiter === 'undefined' ? ':' : delimiter) +
              namespace,
          );
          newDebug.log = this.log;
          return newDebug;
        }

        /**
         * Enables a debug mode by namespaces. This can include modes
         * separated by a colon and wildcards.
         *
         * @param {String} namespaces
         * @api public
         */
        function enable(namespaces) {
          createDebug.save(namespaces);
          createDebug.namespaces = namespaces;

          createDebug.names = [];
          createDebug.skips = [];

          let i;
          const split = (
            typeof namespaces === 'string' ? namespaces : ''
          ).split(/[\s,]+/);
          const len = split.length;

          for (i = 0; i < len; i++) {
            if (!split[i]) {
              // ignore empty strings
              continue;
            }

            namespaces = split[i].replace(/\*/g, '.*?');

            if (namespaces[0] === '-') {
              createDebug.skips.push(
                new RegExp('^' + namespaces.substr(1) + '$'),
              );
            } else {
              createDebug.names.push(new RegExp('^' + namespaces + '$'));
            }
          }
        }

        /**
         * Disable debug output.
         *
         * @return {String} namespaces
         * @api public
         */
        function disable() {
          const namespaces = [
            ...createDebug.names.map(toNamespace),
            ...createDebug.skips
              .map(toNamespace)
              .map((namespace) => '-' + namespace),
          ].join(',');
          createDebug.enable('');
          return namespaces;
        }

        /**
         * Returns true if the given mode name is enabled, false otherwise.
         *
         * @param {String} name
         * @return {Boolean}
         * @api public
         */
        function enabled(name) {
          if (name[name.length - 1] === '*') {
            return true;
          }

          let i;
          let len;

          for (i = 0, len = createDebug.skips.length; i < len; i++) {
            if (createDebug.skips[i].test(name)) {
              return false;
            }
          }

          for (i = 0, len = createDebug.names.length; i < len; i++) {
            if (createDebug.names[i].test(name)) {
              return true;
            }
          }

          return false;
        }

        /**
         * Convert regexp to namespace
         *
         * @param {RegExp} regxep
         * @return {String} namespace
         * @api private
         */
        function toNamespace(regexp) {
          return regexp
            .toString()
            .substring(2, regexp.toString().length - 2)
            .replace(/\.\*\?$/, '*');
        }

        /**
         * Coerce `val`.
         *
         * @param {Mixed} val
         * @return {Mixed}
         * @api private
         */
        function coerce(val) {
          if (val instanceof Error) {
            return val.stack || val.message;
          }
          return val;
        }

        /**
         * XXX DO NOT USE. This is a temporary stub function.
         * XXX It WILL be removed in the next major release.
         */
        function destroy() {
          console.warn(
            'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.',
          );
        }

        createDebug.enable(createDebug.load());

        return createDebug;
      }

      module.exports = setup;

      /***/
    },

    /***/ 8302: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      /**
       * Detect Electron renderer / nwjs process, which is node, but we should
       * treat as a browser.
       */

      if (
        typeof process === 'undefined' ||
        process.type === 'renderer' ||
        process.browser === true ||
        process.__nwjs
      ) {
        module.exports = __nccwpck_require__(8479);
      } else {
        module.exports = __nccwpck_require__(9079);
      }

      /***/
    },

    /***/ 9079: /***/ (module, exports, __nccwpck_require__) => {
      /**
       * Module dependencies.
       */

      const tty = __nccwpck_require__(3867);
      const util = __nccwpck_require__(1669);

      /**
       * This is the Node.js implementation of `debug()`.
       */

      exports.init = init;
      exports.log = log;
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.destroy = util.deprecate(() => {},
      'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');

      /**
       * Colors.
       */

      exports.colors = [6, 2, 3, 4, 5, 1];

      try {
        // Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
        // eslint-disable-next-line import/no-extraneous-dependencies
        const supportsColor = __nccwpck_require__(9892);

        if (
          supportsColor &&
          (supportsColor.stderr || supportsColor).level >= 2
        ) {
          exports.colors = [
            20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62,
            63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112,
            113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165,
            166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196,
            197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209,
            214, 215, 220, 221,
          ];
        }
      } catch (error) {
        // Swallow - we only care if `supports-color` is available; it doesn't have to be.
      }

      /**
       * Build up the default `inspectOpts` object from the environment variables.
       *
       *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
       */

      exports.inspectOpts = Object.keys(process.env)
        .filter((key) => {
          return /^debug_/i.test(key);
        })
        .reduce((obj, key) => {
          // Camel-case
          const prop = key
            .substring(6)
            .toLowerCase()
            .replace(/_([a-z])/g, (_, k) => {
              return k.toUpperCase();
            });

          // Coerce string value into JS value
          let val = process.env[key];
          if (/^(yes|on|true|enabled)$/i.test(val)) {
            val = true;
          } else if (/^(no|off|false|disabled)$/i.test(val)) {
            val = false;
          } else if (val === 'null') {
            val = null;
          } else {
            val = Number(val);
          }

          obj[prop] = val;
          return obj;
        }, {});

      /**
       * Is stdout a TTY? Colored output is enabled when `true`.
       */

      function useColors() {
        return 'colors' in exports.inspectOpts
          ? Boolean(exports.inspectOpts.colors)
          : tty.isatty(process.stderr.fd);
      }

      /**
       * Adds ANSI color escape codes if enabled.
       *
       * @api public
       */

      function formatArgs(args) {
        const { namespace: name, useColors } = this;

        if (useColors) {
          const c = this.color;
          const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
          const prefix = `  ${colorCode};1m${name} \u001B[0m`;

          args[0] = prefix + args[0].split('\n').join('\n' + prefix);
          args.push(
            colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m',
          );
        } else {
          args[0] = getDate() + name + ' ' + args[0];
        }
      }

      function getDate() {
        if (exports.inspectOpts.hideDate) {
          return '';
        }
        return new Date().toISOString() + ' ';
      }

      /**
       * Invokes `util.format()` with the specified arguments and writes to stderr.
       */

      function log(...args) {
        return process.stderr.write(util.format(...args) + '\n');
      }

      /**
       * Save `namespaces`.
       *
       * @param {String} namespaces
       * @api private
       */
      function save(namespaces) {
        if (namespaces) {
          process.env.DEBUG = namespaces;
        } else {
          // If you set a process.env field to null or undefined, it gets cast to the
          // string 'null' or 'undefined'. Just delete instead.
          delete process.env.DEBUG;
        }
      }

      /**
       * Load `namespaces`.
       *
       * @return {String} returns the previously persisted debug modes
       * @api private
       */

      function load() {
        return process.env.DEBUG;
      }

      /**
       * Init logic for `debug` instances.
       *
       * Create a new `inspectOpts` object in case `useColors` is set
       * differently for a particular `debug` instance.
       */

      function init(debug) {
        debug.inspectOpts = {};

        const keys = Object.keys(exports.inspectOpts);
        for (let i = 0; i < keys.length; i++) {
          debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
        }
      }

      module.exports = __nccwpck_require__(4028)(exports);

      const { formatters } = module.exports;

      /**
       * Map %o to `util.inspect()`, all on a single line.
       */

      formatters.o = function (v) {
        this.inspectOpts.colors = this.useColors;
        return util
          .inspect(v, this.inspectOpts)
          .split('\n')
          .map((str) => str.trim())
          .join(' ');
      };

      /**
       * Map %O to `util.inspect()`, allowing multiple lines if needed.
       */

      formatters.O = function (v) {
        this.inspectOpts.colors = this.useColors;
        return util.inspect(v, this.inspectOpts);
      };

      /***/
    },

    /***/ 1102: /***/ (__unused_webpack_module, exports) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.default = global;

      /***/
    },

    /***/ 4921: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.installTimerFunctions =
        exports.transports =
        exports.Transport =
        exports.protocol =
        exports.Socket =
          void 0;
      const socket_js_1 = __nccwpck_require__(402);
      Object.defineProperty(exports, 'Socket', {
        enumerable: true,
        get: function () {
          return socket_js_1.Socket;
        },
      });
      exports.protocol = socket_js_1.Socket.protocol;
      var transport_js_1 = __nccwpck_require__(4733);
      Object.defineProperty(exports, 'Transport', {
        enumerable: true,
        get: function () {
          return transport_js_1.Transport;
        },
      });
      var index_js_1 = __nccwpck_require__(6643);
      Object.defineProperty(exports, 'transports', {
        enumerable: true,
        get: function () {
          return index_js_1.transports;
        },
      });
      var util_js_1 = __nccwpck_require__(3571);
      Object.defineProperty(exports, 'installTimerFunctions', {
        enumerable: true,
        get: function () {
          return util_js_1.installTimerFunctions;
        },
      });

      /***/
    },

    /***/ 402: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Socket = void 0;
      const index_js_1 = __nccwpck_require__(6643);
      const util_js_1 = __nccwpck_require__(3571);
      const parseqs_1 = __importDefault(__nccwpck_require__(2567));
      const parseuri_1 = __importDefault(__nccwpck_require__(6795));
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const component_emitter_1 = __nccwpck_require__(1806);
      const engine_io_parser_1 = __nccwpck_require__(5643);
      const debug = (0, debug_1.default)('engine.io-client:socket'); // debug()
      class Socket extends component_emitter_1.Emitter {
        /**
         * Socket constructor.
         *
         * @param {String|Object} uri or options
         * @param {Object} opts - options
         * @api public
         */
        constructor(uri, opts = {}) {
          super();
          if (uri && 'object' === typeof uri) {
            opts = uri;
            uri = null;
          }
          if (uri) {
            uri = (0, parseuri_1.default)(uri);
            opts.hostname = uri.host;
            opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
            opts.port = uri.port;
            if (uri.query) opts.query = uri.query;
          } else if (opts.host) {
            opts.hostname = (0, parseuri_1.default)(opts.host).host;
          }
          (0, util_js_1.installTimerFunctions)(this, opts);
          this.secure =
            null != opts.secure
              ? opts.secure
              : typeof location !== 'undefined' &&
                'https:' === location.protocol;
          if (opts.hostname && !opts.port) {
            // if no port is specified manually, use the protocol default
            opts.port = this.secure ? '443' : '80';
          }
          this.hostname =
            opts.hostname ||
            (typeof location !== 'undefined' ? location.hostname : 'localhost');
          this.port =
            opts.port ||
            (typeof location !== 'undefined' && location.port
              ? location.port
              : this.secure
              ? '443'
              : '80');
          this.transports = opts.transports || ['polling', 'websocket'];
          this.readyState = '';
          this.writeBuffer = [];
          this.prevBufferLen = 0;
          this.opts = Object.assign(
            {
              path: '/engine.io',
              agent: false,
              withCredentials: false,
              upgrade: true,
              timestampParam: 't',
              rememberUpgrade: false,
              rejectUnauthorized: true,
              perMessageDeflate: {
                threshold: 1024,
              },
              transportOptions: {},
              closeOnBeforeunload: true,
            },
            opts,
          );
          this.opts.path = this.opts.path.replace(/\/$/, '') + '/';
          if (typeof this.opts.query === 'string') {
            this.opts.query = parseqs_1.default.decode(this.opts.query);
          }
          // set on handshake
          this.id = null;
          this.upgrades = null;
          this.pingInterval = null;
          this.pingTimeout = null;
          // set on heartbeat
          this.pingTimeoutTimer = null;
          if (typeof addEventListener === 'function') {
            if (this.opts.closeOnBeforeunload) {
              // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
              // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
              // closed/reloaded)
              addEventListener(
                'beforeunload',
                () => {
                  if (this.transport) {
                    // silently close the transport
                    this.transport.removeAllListeners();
                    this.transport.close();
                  }
                },
                false,
              );
            }
            if (this.hostname !== 'localhost') {
              this.offlineEventListener = () => {
                this.onClose('transport close');
              };
              addEventListener('offline', this.offlineEventListener, false);
            }
          }
          this.open();
        }
        /**
         * Creates transport of the given type.
         *
         * @param {String} transport name
         * @return {Transport}
         * @api private
         */
        createTransport(name) {
          debug('creating transport "%s"', name);
          const query = clone(this.opts.query);
          // append engine.io protocol identifier
          query.EIO = engine_io_parser_1.protocol;
          // transport name
          query.transport = name;
          // session id if we already have one
          if (this.id) query.sid = this.id;
          const opts = Object.assign(
            {},
            this.opts.transportOptions[name],
            this.opts,
            {
              query,
              socket: this,
              hostname: this.hostname,
              secure: this.secure,
              port: this.port,
            },
          );
          debug('options: %j', opts);
          return new index_js_1.transports[name](opts);
        }
        /**
         * Initializes transport to use and starts probe.
         *
         * @api private
         */
        open() {
          let transport;
          if (
            this.opts.rememberUpgrade &&
            Socket.priorWebsocketSuccess &&
            this.transports.indexOf('websocket') !== -1
          ) {
            transport = 'websocket';
          } else if (0 === this.transports.length) {
            // Emit error on next tick so it can be listened to
            this.setTimeoutFn(() => {
              this.emitReserved('error', 'No transports available');
            }, 0);
            return;
          } else {
            transport = this.transports[0];
          }
          this.readyState = 'opening';
          // Retry with the next transport if the transport is disabled (jsonp: false)
          try {
            transport = this.createTransport(transport);
          } catch (e) {
            debug('error while creating transport: %s', e);
            this.transports.shift();
            this.open();
            return;
          }
          transport.open();
          this.setTransport(transport);
        }
        /**
         * Sets the current transport. Disables the existing one (if any).
         *
         * @api private
         */
        setTransport(transport) {
          debug('setting transport %s', transport.name);
          if (this.transport) {
            debug('clearing existing transport %s', this.transport.name);
            this.transport.removeAllListeners();
          }
          // set up transport
          this.transport = transport;
          // set up transport listeners
          transport
            .on('drain', this.onDrain.bind(this))
            .on('packet', this.onPacket.bind(this))
            .on('error', this.onError.bind(this))
            .on('close', () => {
              this.onClose('transport close');
            });
        }
        /**
         * Probes a transport.
         *
         * @param {String} transport name
         * @api private
         */
        probe(name) {
          debug('probing transport "%s"', name);
          let transport = this.createTransport(name);
          let failed = false;
          Socket.priorWebsocketSuccess = false;
          const onTransportOpen = () => {
            if (failed) return;
            debug('probe transport "%s" opened', name);
            transport.send([{ type: 'ping', data: 'probe' }]);
            transport.once('packet', (msg) => {
              if (failed) return;
              if ('pong' === msg.type && 'probe' === msg.data) {
                debug('probe transport "%s" pong', name);
                this.upgrading = true;
                this.emitReserved('upgrading', transport);
                if (!transport) return;
                Socket.priorWebsocketSuccess = 'websocket' === transport.name;
                debug('pausing current transport "%s"', this.transport.name);
                this.transport.pause(() => {
                  if (failed) return;
                  if ('closed' === this.readyState) return;
                  debug('changing transport and sending upgrade packet');
                  cleanup();
                  this.setTransport(transport);
                  transport.send([{ type: 'upgrade' }]);
                  this.emitReserved('upgrade', transport);
                  transport = null;
                  this.upgrading = false;
                  this.flush();
                });
              } else {
                debug('probe transport "%s" failed', name);
                const err = new Error('probe error');
                // @ts-ignore
                err.transport = transport.name;
                this.emitReserved('upgradeError', err);
              }
            });
          };
          function freezeTransport() {
            if (failed) return;
            // Any callback called by transport should be ignored since now
            failed = true;
            cleanup();
            transport.close();
            transport = null;
          }
          // Handle any error that happens while probing
          const onerror = (err) => {
            const error = new Error('probe error: ' + err);
            // @ts-ignore
            error.transport = transport.name;
            freezeTransport();
            debug(
              'probe transport "%s" failed because of error: %s',
              name,
              err,
            );
            this.emitReserved('upgradeError', error);
          };
          function onTransportClose() {
            onerror('transport closed');
          }
          // When the socket is closed while we're probing
          function onclose() {
            onerror('socket closed');
          }
          // When the socket is upgraded while we're probing
          function onupgrade(to) {
            if (transport && to.name !== transport.name) {
              debug('"%s" works - aborting "%s"', to.name, transport.name);
              freezeTransport();
            }
          }
          // Remove all listeners on the transport and on self
          const cleanup = () => {
            transport.removeListener('open', onTransportOpen);
            transport.removeListener('error', onerror);
            transport.removeListener('close', onTransportClose);
            this.off('close', onclose);
            this.off('upgrading', onupgrade);
          };
          transport.once('open', onTransportOpen);
          transport.once('error', onerror);
          transport.once('close', onTransportClose);
          this.once('close', onclose);
          this.once('upgrading', onupgrade);
          transport.open();
        }
        /**
         * Called when connection is deemed open.
         *
         * @api private
         */
        onOpen() {
          debug('socket open');
          this.readyState = 'open';
          Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
          this.emitReserved('open');
          this.flush();
          // we check for `readyState` in case an `open`
          // listener already closed the socket
          if (
            'open' === this.readyState &&
            this.opts.upgrade &&
            this.transport.pause
          ) {
            debug('starting upgrade probes');
            let i = 0;
            const l = this.upgrades.length;
            for (; i < l; i++) {
              this.probe(this.upgrades[i]);
            }
          }
        }
        /**
         * Handles a packet.
         *
         * @api private
         */
        onPacket(packet) {
          if (
            'opening' === this.readyState ||
            'open' === this.readyState ||
            'closing' === this.readyState
          ) {
            debug(
              'socket receive: type "%s", data "%s"',
              packet.type,
              packet.data,
            );
            this.emitReserved('packet', packet);
            // Socket is live - any packet counts
            this.emitReserved('heartbeat');
            switch (packet.type) {
              case 'open':
                this.onHandshake(JSON.parse(packet.data));
                break;
              case 'ping':
                this.resetPingTimeout();
                this.sendPacket('pong');
                this.emitReserved('ping');
                this.emitReserved('pong');
                break;
              case 'error':
                const err = new Error('server error');
                // @ts-ignore
                err.code = packet.data;
                this.onError(err);
                break;
              case 'message':
                this.emitReserved('data', packet.data);
                this.emitReserved('message', packet.data);
                break;
            }
          } else {
            debug(
              'packet received with socket readyState "%s"',
              this.readyState,
            );
          }
        }
        /**
         * Called upon handshake completion.
         *
         * @param {Object} data - handshake obj
         * @api private
         */
        onHandshake(data) {
          this.emitReserved('handshake', data);
          this.id = data.sid;
          this.transport.query.sid = data.sid;
          this.upgrades = this.filterUpgrades(data.upgrades);
          this.pingInterval = data.pingInterval;
          this.pingTimeout = data.pingTimeout;
          this.onOpen();
          // In case open handler closes socket
          if ('closed' === this.readyState) return;
          this.resetPingTimeout();
        }
        /**
         * Sets and resets ping timeout timer based on server pings.
         *
         * @api private
         */
        resetPingTimeout() {
          this.clearTimeoutFn(this.pingTimeoutTimer);
          this.pingTimeoutTimer = this.setTimeoutFn(() => {
            this.onClose('ping timeout');
          }, this.pingInterval + this.pingTimeout);
          if (this.opts.autoUnref) {
            this.pingTimeoutTimer.unref();
          }
        }
        /**
         * Called on `drain` event
         *
         * @api private
         */
        onDrain() {
          this.writeBuffer.splice(0, this.prevBufferLen);
          // setting prevBufferLen = 0 is very important
          // for example, when upgrading, upgrade packet is sent over,
          // and a nonzero prevBufferLen could cause problems on `drain`
          this.prevBufferLen = 0;
          if (0 === this.writeBuffer.length) {
            this.emitReserved('drain');
          } else {
            this.flush();
          }
        }
        /**
         * Flush write buffers.
         *
         * @api private
         */
        flush() {
          if (
            'closed' !== this.readyState &&
            this.transport.writable &&
            !this.upgrading &&
            this.writeBuffer.length
          ) {
            debug('flushing %d packets in socket', this.writeBuffer.length);
            this.transport.send(this.writeBuffer);
            // keep track of current length of writeBuffer
            // splice writeBuffer and callbackBuffer on `drain`
            this.prevBufferLen = this.writeBuffer.length;
            this.emitReserved('flush');
          }
        }
        /**
         * Sends a message.
         *
         * @param {String} message.
         * @param {Function} callback function.
         * @param {Object} options.
         * @return {Socket} for chaining.
         * @api public
         */
        write(msg, options, fn) {
          this.sendPacket('message', msg, options, fn);
          return this;
        }
        send(msg, options, fn) {
          this.sendPacket('message', msg, options, fn);
          return this;
        }
        /**
         * Sends a packet.
         *
         * @param {String} packet type.
         * @param {String} data.
         * @param {Object} options.
         * @param {Function} callback function.
         * @api private
         */
        sendPacket(type, data, options, fn) {
          if ('function' === typeof data) {
            fn = data;
            data = undefined;
          }
          if ('function' === typeof options) {
            fn = options;
            options = null;
          }
          if ('closing' === this.readyState || 'closed' === this.readyState) {
            return;
          }
          options = options || {};
          options.compress = false !== options.compress;
          const packet = {
            type: type,
            data: data,
            options: options,
          };
          this.emitReserved('packetCreate', packet);
          this.writeBuffer.push(packet);
          if (fn) this.once('flush', fn);
          this.flush();
        }
        /**
         * Closes the connection.
         *
         * @api public
         */
        close() {
          const close = () => {
            this.onClose('forced close');
            debug('socket closing - telling transport to close');
            this.transport.close();
          };
          const cleanupAndClose = () => {
            this.off('upgrade', cleanupAndClose);
            this.off('upgradeError', cleanupAndClose);
            close();
          };
          const waitForUpgrade = () => {
            // wait for upgrade to finish since we can't send packets while pausing a transport
            this.once('upgrade', cleanupAndClose);
            this.once('upgradeError', cleanupAndClose);
          };
          if ('opening' === this.readyState || 'open' === this.readyState) {
            this.readyState = 'closing';
            if (this.writeBuffer.length) {
              this.once('drain', () => {
                if (this.upgrading) {
                  waitForUpgrade();
                } else {
                  close();
                }
              });
            } else if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          }
          return this;
        }
        /**
         * Called upon transport error
         *
         * @api private
         */
        onError(err) {
          debug('socket error %j', err);
          Socket.priorWebsocketSuccess = false;
          this.emitReserved('error', err);
          this.onClose('transport error', err);
        }
        /**
         * Called upon transport close.
         *
         * @api private
         */
        onClose(reason, desc) {
          if (
            'opening' === this.readyState ||
            'open' === this.readyState ||
            'closing' === this.readyState
          ) {
            debug('socket close with reason: "%s"', reason);
            // clear timers
            this.clearTimeoutFn(this.pingTimeoutTimer);
            // stop event from firing again for transport
            this.transport.removeAllListeners('close');
            // ensure transport won't stay open
            this.transport.close();
            // ignore further transport communication
            this.transport.removeAllListeners();
            if (typeof removeEventListener === 'function') {
              removeEventListener('offline', this.offlineEventListener, false);
            }
            // set ready state
            this.readyState = 'closed';
            // clear session id
            this.id = null;
            // emit close event
            this.emitReserved('close', reason, desc);
            // clean buffers after, so users can still
            // grab the buffers on `close` event
            this.writeBuffer = [];
            this.prevBufferLen = 0;
          }
        }
        /**
         * Filters upgrades, returning only those matching client transports.
         *
         * @param {Array} server upgrades
         * @api private
         *
         */
        filterUpgrades(upgrades) {
          const filteredUpgrades = [];
          let i = 0;
          const j = upgrades.length;
          for (; i < j; i++) {
            if (~this.transports.indexOf(upgrades[i]))
              filteredUpgrades.push(upgrades[i]);
          }
          return filteredUpgrades;
        }
      }
      exports.Socket = Socket;
      Socket.protocol = engine_io_parser_1.protocol;
      function clone(obj) {
        const o = {};
        for (let i in obj) {
          if (obj.hasOwnProperty(i)) {
            o[i] = obj[i];
          }
        }
        return o;
      }

      /***/
    },

    /***/ 4733: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Transport = void 0;
      const engine_io_parser_1 = __nccwpck_require__(5643);
      const component_emitter_1 = __nccwpck_require__(1806);
      const util_js_1 = __nccwpck_require__(3571);
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const debug = (0, debug_1.default)('engine.io-client:transport'); // debug()
      class Transport extends component_emitter_1.Emitter {
        /**
         * Transport abstract constructor.
         *
         * @param {Object} options.
         * @api private
         */
        constructor(opts) {
          super();
          this.writable = false;
          (0, util_js_1.installTimerFunctions)(this, opts);
          this.opts = opts;
          this.query = opts.query;
          this.readyState = '';
          this.socket = opts.socket;
        }
        /**
         * Emits an error.
         *
         * @param {String} str
         * @return {Transport} for chaining
         * @api protected
         */
        onError(msg, desc) {
          const err = new Error(msg);
          // @ts-ignore
          err.type = 'TransportError';
          // @ts-ignore
          err.description = desc;
          super.emit('error', err);
          return this;
        }
        /**
         * Opens the transport.
         *
         * @api public
         */
        open() {
          if ('closed' === this.readyState || '' === this.readyState) {
            this.readyState = 'opening';
            this.doOpen();
          }
          return this;
        }
        /**
         * Closes the transport.
         *
         * @api public
         */
        close() {
          if ('opening' === this.readyState || 'open' === this.readyState) {
            this.doClose();
            this.onClose();
          }
          return this;
        }
        /**
         * Sends multiple packets.
         *
         * @param {Array} packets
         * @api public
         */
        send(packets) {
          if ('open' === this.readyState) {
            this.write(packets);
          } else {
            // this might happen if the transport was silently closed in the beforeunload event handler
            debug('transport is not open, discarding packets');
          }
        }
        /**
         * Called upon open
         *
         * @api protected
         */
        onOpen() {
          this.readyState = 'open';
          this.writable = true;
          super.emit('open');
        }
        /**
         * Called with data.
         *
         * @param {String} data
         * @api protected
         */
        onData(data) {
          const packet = (0, engine_io_parser_1.decodePacket)(
            data,
            this.socket.binaryType,
          );
          this.onPacket(packet);
        }
        /**
         * Called with a decoded packet.
         *
         * @api protected
         */
        onPacket(packet) {
          super.emit('packet', packet);
        }
        /**
         * Called upon close.
         *
         * @api protected
         */
        onClose() {
          this.readyState = 'closed';
          super.emit('close');
        }
      }
      exports.Transport = Transport;

      /***/
    },

    /***/ 6643: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.transports = void 0;
      const polling_xhr_js_1 = __nccwpck_require__(1416);
      const websocket_js_1 = __nccwpck_require__(7627);
      exports.transports = {
        websocket: websocket_js_1.WS,
        polling: polling_xhr_js_1.XHR,
      };

      /***/
    },

    /***/ 1416: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      /* global attachEvent */
      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Request = exports.XHR = void 0;
      const xmlhttprequest_js_1 = __importDefault(__nccwpck_require__(7241));
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const globalThis_js_1 = __importDefault(__nccwpck_require__(1102));
      const util_js_1 = __nccwpck_require__(3571);
      const component_emitter_1 = __nccwpck_require__(1806);
      const polling_js_1 = __nccwpck_require__(1062);
      const debug = (0, debug_1.default)('engine.io-client:polling-xhr'); // debug()
      /**
       * Empty function
       */
      function empty() {}
      const hasXHR2 = (function () {
        const xhr = new xmlhttprequest_js_1.default({
          xdomain: false,
        });
        return null != xhr.responseType;
      })();
      class XHR extends polling_js_1.Polling {
        /**
         * XHR Polling constructor.
         *
         * @param {Object} opts
         * @api public
         */
        constructor(opts) {
          super(opts);
          if (typeof location !== 'undefined') {
            const isSSL = 'https:' === location.protocol;
            let port = location.port;
            // some user agents have empty `location.port`
            if (!port) {
              port = isSSL ? '443' : '80';
            }
            this.xd =
              (typeof location !== 'undefined' &&
                opts.hostname !== location.hostname) ||
              port !== opts.port;
            this.xs = opts.secure !== isSSL;
          }
          /**
           * XHR supports binary
           */
          const forceBase64 = opts && opts.forceBase64;
          this.supportsBinary = hasXHR2 && !forceBase64;
        }
        /**
         * Creates a request.
         *
         * @param {String} method
         * @api private
         */
        request(opts = {}) {
          Object.assign(opts, { xd: this.xd, xs: this.xs }, this.opts);
          return new Request(this.uri(), opts);
        }
        /**
         * Sends data.
         *
         * @param {String} data to send.
         * @param {Function} called upon flush.
         * @api private
         */
        doWrite(data, fn) {
          const req = this.request({
            method: 'POST',
            data: data,
          });
          req.on('success', fn);
          req.on('error', (err) => {
            this.onError('xhr post error', err);
          });
        }
        /**
         * Starts a poll cycle.
         *
         * @api private
         */
        doPoll() {
          debug('xhr poll');
          const req = this.request();
          req.on('data', this.onData.bind(this));
          req.on('error', (err) => {
            this.onError('xhr poll error', err);
          });
          this.pollXhr = req;
        }
      }
      exports.XHR = XHR;
      class Request extends component_emitter_1.Emitter {
        /**
         * Request constructor
         *
         * @param {Object} options
         * @api public
         */
        constructor(uri, opts) {
          super();
          (0, util_js_1.installTimerFunctions)(this, opts);
          this.opts = opts;
          this.method = opts.method || 'GET';
          this.uri = uri;
          this.async = false !== opts.async;
          this.data = undefined !== opts.data ? opts.data : null;
          this.create();
        }
        /**
         * Creates the XHR object and sends the request.
         *
         * @api private
         */
        create() {
          const opts = (0, util_js_1.pick)(
            this.opts,
            'agent',
            'pfx',
            'key',
            'passphrase',
            'cert',
            'ca',
            'ciphers',
            'rejectUnauthorized',
            'autoUnref',
          );
          opts.xdomain = !!this.opts.xd;
          opts.xscheme = !!this.opts.xs;
          const xhr = (this.xhr = new xmlhttprequest_js_1.default(opts));
          try {
            debug('xhr open %s: %s', this.method, this.uri);
            xhr.open(this.method, this.uri, this.async);
            try {
              if (this.opts.extraHeaders) {
                xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                for (let i in this.opts.extraHeaders) {
                  if (this.opts.extraHeaders.hasOwnProperty(i)) {
                    xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                  }
                }
              }
            } catch (e) {}
            if ('POST' === this.method) {
              try {
                xhr.setRequestHeader(
                  'Content-type',
                  'text/plain;charset=UTF-8',
                );
              } catch (e) {}
            }
            try {
              xhr.setRequestHeader('Accept', '*/*');
            } catch (e) {}
            // ie6 check
            if ('withCredentials' in xhr) {
              xhr.withCredentials = this.opts.withCredentials;
            }
            if (this.opts.requestTimeout) {
              xhr.timeout = this.opts.requestTimeout;
            }
            xhr.onreadystatechange = () => {
              if (4 !== xhr.readyState) return;
              if (200 === xhr.status || 1223 === xhr.status) {
                this.onLoad();
              } else {
                // make sure the `error` event handler that's user-set
                // does not throw in the same tick and gets caught here
                this.setTimeoutFn(() => {
                  this.onError(typeof xhr.status === 'number' ? xhr.status : 0);
                }, 0);
              }
            };
            debug('xhr data %s', this.data);
            xhr.send(this.data);
          } catch (e) {
            // Need to defer since .create() is called directly from the constructor
            // and thus the 'error' event can only be only bound *after* this exception
            // occurs.  Therefore, also, we cannot throw here at all.
            this.setTimeoutFn(() => {
              this.onError(e);
            }, 0);
            return;
          }
          if (typeof document !== 'undefined') {
            this.index = Request.requestsCount++;
            Request.requests[this.index] = this;
          }
        }
        /**
         * Called upon successful response.
         *
         * @api private
         */
        onSuccess() {
          this.emit('success');
          this.cleanup();
        }
        /**
         * Called if we have data.
         *
         * @api private
         */
        onData(data) {
          this.emit('data', data);
          this.onSuccess();
        }
        /**
         * Called upon error.
         *
         * @api private
         */
        onError(err) {
          this.emit('error', err);
          this.cleanup(true);
        }
        /**
         * Cleans up house.
         *
         * @api private
         */
        cleanup(fromError) {
          if ('undefined' === typeof this.xhr || null === this.xhr) {
            return;
          }
          this.xhr.onreadystatechange = empty;
          if (fromError) {
            try {
              this.xhr.abort();
            } catch (e) {}
          }
          if (typeof document !== 'undefined') {
            delete Request.requests[this.index];
          }
          this.xhr = null;
        }
        /**
         * Called upon load.
         *
         * @api private
         */
        onLoad() {
          const data = this.xhr.responseText;
          if (data !== null) {
            this.onData(data);
          }
        }
        /**
         * Aborts the request.
         *
         * @api public
         */
        abort() {
          this.cleanup();
        }
      }
      exports.Request = Request;
      Request.requestsCount = 0;
      Request.requests = {};
      /**
       * Aborts pending requests when unloading the window. This is needed to prevent
       * memory leaks (e.g. when using IE) and to ensure that no spurious error is
       * emitted.
       */
      if (typeof document !== 'undefined') {
        // @ts-ignore
        if (typeof attachEvent === 'function') {
          // @ts-ignore
          attachEvent('onunload', unloadHandler);
        } else if (typeof addEventListener === 'function') {
          const terminationEvent =
            'onpagehide' in globalThis_js_1.default ? 'pagehide' : 'unload';
          addEventListener(terminationEvent, unloadHandler, false);
        }
      }
      function unloadHandler() {
        for (let i in Request.requests) {
          if (Request.requests.hasOwnProperty(i)) {
            Request.requests[i].abort();
          }
        }
      }

      /***/
    },

    /***/ 1062: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Polling = void 0;
      const transport_js_1 = __nccwpck_require__(4733);
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const yeast_1 = __importDefault(__nccwpck_require__(6041));
      const parseqs_1 = __importDefault(__nccwpck_require__(2567));
      const engine_io_parser_1 = __nccwpck_require__(5643);
      const debug = (0, debug_1.default)('engine.io-client:polling'); // debug()
      class Polling extends transport_js_1.Transport {
        constructor() {
          super(...arguments);
          this.polling = false;
        }
        /**
         * Transport name.
         */
        get name() {
          return 'polling';
        }
        /**
         * Opens the socket (triggers polling). We write a PING message to determine
         * when the transport is open.
         *
         * @api private
         */
        doOpen() {
          this.poll();
        }
        /**
         * Pauses polling.
         *
         * @param {Function} callback upon buffers are flushed and transport is paused
         * @api private
         */
        pause(onPause) {
          this.readyState = 'pausing';
          const pause = () => {
            debug('paused');
            this.readyState = 'paused';
            onPause();
          };
          if (this.polling || !this.writable) {
            let total = 0;
            if (this.polling) {
              debug('we are currently polling - waiting to pause');
              total++;
              this.once('pollComplete', function () {
                debug('pre-pause polling complete');
                --total || pause();
              });
            }
            if (!this.writable) {
              debug('we are currently writing - waiting to pause');
              total++;
              this.once('drain', function () {
                debug('pre-pause writing complete');
                --total || pause();
              });
            }
          } else {
            pause();
          }
        }
        /**
         * Starts polling cycle.
         *
         * @api public
         */
        poll() {
          debug('polling');
          this.polling = true;
          this.doPoll();
          this.emit('poll');
        }
        /**
         * Overloads onData to detect payloads.
         *
         * @api private
         */
        onData(data) {
          debug('polling got data %s', data);
          const callback = (packet) => {
            // if its the first message we consider the transport open
            if ('opening' === this.readyState && packet.type === 'open') {
              this.onOpen();
            }
            // if its a close packet, we close the ongoing requests
            if ('close' === packet.type) {
              this.onClose();
              return false;
            }
            // otherwise bypass onData and handle the message
            this.onPacket(packet);
          };
          // decode payload
          (0, engine_io_parser_1.decodePayload)(
            data,
            this.socket.binaryType,
          ).forEach(callback);
          // if an event did not trigger closing
          if ('closed' !== this.readyState) {
            // if we got data we're not polling
            this.polling = false;
            this.emit('pollComplete');
            if ('open' === this.readyState) {
              this.poll();
            } else {
              debug('ignoring poll - transport state "%s"', this.readyState);
            }
          }
        }
        /**
         * For polling, send a close packet.
         *
         * @api private
         */
        doClose() {
          const close = () => {
            debug('writing close packet');
            this.write([{ type: 'close' }]);
          };
          if ('open' === this.readyState) {
            debug('transport open - closing');
            close();
          } else {
            // in case we're trying to close while
            // handshaking is in progress (GH-164)
            debug('transport not open - deferring close');
            this.once('open', close);
          }
        }
        /**
         * Writes a packets payload.
         *
         * @param {Array} data packets
         * @param {Function} drain callback
         * @api private
         */
        write(packets) {
          this.writable = false;
          (0, engine_io_parser_1.encodePayload)(packets, (data) => {
            this.doWrite(data, () => {
              this.writable = true;
              this.emit('drain');
            });
          });
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
          let query = this.query || {};
          const schema = this.opts.secure ? 'https' : 'http';
          let port = '';
          // cache busting is forced
          if (false !== this.opts.timestampRequests) {
            query[this.opts.timestampParam] = (0, yeast_1.default)();
          }
          if (!this.supportsBinary && !query.sid) {
            query.b64 = 1;
          }
          // avoid port if default for schema
          if (
            this.opts.port &&
            (('https' === schema && Number(this.opts.port) !== 443) ||
              ('http' === schema && Number(this.opts.port) !== 80))
          ) {
            port = ':' + this.opts.port;
          }
          const encodedQuery = parseqs_1.default.encode(query);
          const ipv6 = this.opts.hostname.indexOf(':') !== -1;
          return (
            schema +
            '://' +
            (ipv6 ? '[' + this.opts.hostname + ']' : this.opts.hostname) +
            port +
            this.opts.path +
            (encodedQuery.length ? '?' + encodedQuery : '')
          );
        }
      }
      exports.Polling = Polling;

      /***/
    },

    /***/ 8510: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.nextTick =
        exports.defaultBinaryType =
        exports.usingBrowserWebSocket =
        exports.WebSocket =
          void 0;
      const ws_1 = __importDefault(__nccwpck_require__(289));
      exports.WebSocket = ws_1.default;
      exports.usingBrowserWebSocket = false;
      exports.defaultBinaryType = 'nodebuffer';
      exports.nextTick = process.nextTick;

      /***/
    },

    /***/ 7627: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.WS = void 0;
      const transport_js_1 = __nccwpck_require__(4733);
      const parseqs_1 = __importDefault(__nccwpck_require__(2567));
      const yeast_1 = __importDefault(__nccwpck_require__(6041));
      const util_js_1 = __nccwpck_require__(3571);
      const websocket_constructor_js_1 = __nccwpck_require__(8510);
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const engine_io_parser_1 = __nccwpck_require__(5643);
      const debug = (0, debug_1.default)('engine.io-client:websocket'); // debug()
      // detect ReactNative environment
      const isReactNative =
        typeof navigator !== 'undefined' &&
        typeof navigator.product === 'string' &&
        navigator.product.toLowerCase() === 'reactnative';
      class WS extends transport_js_1.Transport {
        /**
         * WebSocket transport constructor.
         *
         * @api {Object} connection options
         * @api public
         */
        constructor(opts) {
          super(opts);
          this.supportsBinary = !opts.forceBase64;
        }
        /**
         * Transport name.
         *
         * @api public
         */
        get name() {
          return 'websocket';
        }
        /**
         * Opens socket.
         *
         * @api private
         */
        doOpen() {
          if (!this.check()) {
            // let probe timeout
            return;
          }
          const uri = this.uri();
          const protocols = this.opts.protocols;
          // React Native only supports the 'headers' option, and will print a warning if anything else is passed
          const opts = isReactNative
            ? {}
            : (0, util_js_1.pick)(
                this.opts,
                'agent',
                'perMessageDeflate',
                'pfx',
                'key',
                'passphrase',
                'cert',
                'ca',
                'ciphers',
                'rejectUnauthorized',
                'localAddress',
                'protocolVersion',
                'origin',
                'maxPayload',
                'family',
                'checkServerIdentity',
              );
          if (this.opts.extraHeaders) {
            opts.headers = this.opts.extraHeaders;
          }
          try {
            this.ws =
              websocket_constructor_js_1.usingBrowserWebSocket && !isReactNative
                ? protocols
                  ? new websocket_constructor_js_1.WebSocket(uri, protocols)
                  : new websocket_constructor_js_1.WebSocket(uri)
                : new websocket_constructor_js_1.WebSocket(
                    uri,
                    protocols,
                    opts,
                  );
          } catch (err) {
            return this.emit('error', err);
          }
          this.ws.binaryType =
            this.socket.binaryType ||
            websocket_constructor_js_1.defaultBinaryType;
          this.addEventListeners();
        }
        /**
         * Adds event listeners to the socket
         *
         * @api private
         */
        addEventListeners() {
          this.ws.onopen = () => {
            if (this.opts.autoUnref) {
              this.ws._socket.unref();
            }
            this.onOpen();
          };
          this.ws.onclose = this.onClose.bind(this);
          this.ws.onmessage = (ev) => this.onData(ev.data);
          this.ws.onerror = (e) => this.onError('websocket error', e);
        }
        /**
         * Writes data to socket.
         *
         * @param {Array} array of packets.
         * @api private
         */
        write(packets) {
          this.writable = false;
          // encodePacket efficient as it uses WS framing
          // no need for encodePayload
          for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            (0, engine_io_parser_1.encodePacket)(
              packet,
              this.supportsBinary,
              (data) => {
                // always create a new object (GH-437)
                const opts = {};
                if (!websocket_constructor_js_1.usingBrowserWebSocket) {
                  if (packet.options) {
                    opts.compress = packet.options.compress;
                  }
                  if (this.opts.perMessageDeflate) {
                    const len =
                      'string' === typeof data
                        ? Buffer.byteLength(data)
                        : data.length;
                    if (len < this.opts.perMessageDeflate.threshold) {
                      opts.compress = false;
                    }
                  }
                }
                // Sometimes the websocket has already been closed but the browser didn't
                // have a chance of informing us about it yet, in that case send will
                // throw an error
                try {
                  if (websocket_constructor_js_1.usingBrowserWebSocket) {
                    // TypeError is thrown when passing the second argument on Safari
                    this.ws.send(data);
                  } else {
                    this.ws.send(data, opts);
                  }
                } catch (e) {
                  debug('websocket closed before onclose event');
                }
                if (lastPacket) {
                  // fake drain
                  // defer to next tick to allow Socket to clear writeBuffer
                  (0, websocket_constructor_js_1.nextTick)(() => {
                    this.writable = true;
                    this.emit('drain');
                  }, this.setTimeoutFn);
                }
              },
            );
          }
        }
        /**
         * Closes socket.
         *
         * @api private
         */
        doClose() {
          if (typeof this.ws !== 'undefined') {
            this.ws.close();
            this.ws = null;
          }
        }
        /**
         * Generates uri for connection.
         *
         * @api private
         */
        uri() {
          let query = this.query || {};
          const schema = this.opts.secure ? 'wss' : 'ws';
          let port = '';
          // avoid port if default for schema
          if (
            this.opts.port &&
            (('wss' === schema && Number(this.opts.port) !== 443) ||
              ('ws' === schema && Number(this.opts.port) !== 80))
          ) {
            port = ':' + this.opts.port;
          }
          // append timestamp to URI
          if (this.opts.timestampRequests) {
            query[this.opts.timestampParam] = (0, yeast_1.default)();
          }
          // communicate binary support capabilities
          if (!this.supportsBinary) {
            query.b64 = 1;
          }
          const encodedQuery = parseqs_1.default.encode(query);
          const ipv6 = this.opts.hostname.indexOf(':') !== -1;
          return (
            schema +
            '://' +
            (ipv6 ? '[' + this.opts.hostname + ']' : this.opts.hostname) +
            port +
            this.opts.path +
            (encodedQuery.length ? '?' + encodedQuery : '')
          );
        }
        /**
         * Feature detection for WebSocket.
         *
         * @return {Boolean} whether this transport is available.
         * @api public
         */
        check() {
          return (
            !!websocket_constructor_js_1.WebSocket &&
            !(
              '__initialize' in websocket_constructor_js_1.WebSocket &&
              this.name === WS.prototype.name
            )
          );
        }
      }
      exports.WS = WS;

      /***/
    },

    /***/ 7241: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, 'default', {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o['default'] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (
                k !== 'default' &&
                Object.prototype.hasOwnProperty.call(mod, k)
              )
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      const XMLHttpRequestModule = __importStar(__nccwpck_require__(5530));
      const XMLHttpRequest =
        XMLHttpRequestModule.default || XMLHttpRequestModule;
      exports.default = XMLHttpRequest;

      /***/
    },

    /***/ 3571: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.installTimerFunctions = exports.pick = void 0;
      const globalThis_js_1 = __importDefault(__nccwpck_require__(1102));
      function pick(obj, ...attr) {
        return attr.reduce((acc, k) => {
          if (obj.hasOwnProperty(k)) {
            acc[k] = obj[k];
          }
          return acc;
        }, {});
      }
      exports.pick = pick;
      // Keep a reference to the real timeout functions so they can be used when overridden
      const NATIVE_SET_TIMEOUT = setTimeout;
      const NATIVE_CLEAR_TIMEOUT = clearTimeout;
      function installTimerFunctions(obj, opts) {
        if (opts.useNativeTimers) {
          obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThis_js_1.default);
          obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(
            globalThis_js_1.default,
          );
        } else {
          obj.setTimeoutFn = setTimeout.bind(globalThis_js_1.default);
          obj.clearTimeoutFn = clearTimeout.bind(globalThis_js_1.default);
        }
      }
      exports.installTimerFunctions = installTimerFunctions;

      /***/
    },

    /***/ 6256: /***/ (__unused_webpack_module, exports) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.ERROR_PACKET =
        exports.PACKET_TYPES_REVERSE =
        exports.PACKET_TYPES =
          void 0;
      const PACKET_TYPES = Object.create(null); // no Map = no polyfill
      exports.PACKET_TYPES = PACKET_TYPES;
      PACKET_TYPES['open'] = '0';
      PACKET_TYPES['close'] = '1';
      PACKET_TYPES['ping'] = '2';
      PACKET_TYPES['pong'] = '3';
      PACKET_TYPES['message'] = '4';
      PACKET_TYPES['upgrade'] = '5';
      PACKET_TYPES['noop'] = '6';
      const PACKET_TYPES_REVERSE = Object.create(null);
      exports.PACKET_TYPES_REVERSE = PACKET_TYPES_REVERSE;
      Object.keys(PACKET_TYPES).forEach((key) => {
        PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
      });
      const ERROR_PACKET = { type: 'error', data: 'parser error' };
      exports.ERROR_PACKET = ERROR_PACKET;

      /***/
    },

    /***/ 1059: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      const commons_js_1 = __nccwpck_require__(6256);
      const decodePacket = (encodedPacket, binaryType) => {
        if (typeof encodedPacket !== 'string') {
          return {
            type: 'message',
            data: mapBinary(encodedPacket, binaryType),
          };
        }
        const type = encodedPacket.charAt(0);
        if (type === 'b') {
          const buffer = Buffer.from(encodedPacket.substring(1), 'base64');
          return {
            type: 'message',
            data: mapBinary(buffer, binaryType),
          };
        }
        if (!commons_js_1.PACKET_TYPES_REVERSE[type]) {
          return commons_js_1.ERROR_PACKET;
        }
        return encodedPacket.length > 1
          ? {
              type: commons_js_1.PACKET_TYPES_REVERSE[type],
              data: encodedPacket.substring(1),
            }
          : {
              type: commons_js_1.PACKET_TYPES_REVERSE[type],
            };
      };
      const mapBinary = (data, binaryType) => {
        const isBuffer = Buffer.isBuffer(data);
        switch (binaryType) {
          case 'arraybuffer':
            return isBuffer ? toArrayBuffer(data) : data;
          case 'nodebuffer':
          default:
            return data; // assuming the data is already a Buffer
        }
      };
      const toArrayBuffer = (buffer) => {
        const arrayBuffer = new ArrayBuffer(buffer.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buffer.length; i++) {
          view[i] = buffer[i];
        }
        return arrayBuffer;
      };
      exports.default = decodePacket;

      /***/
    },

    /***/ 4786: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      const commons_js_1 = __nccwpck_require__(6256);
      const encodePacket = ({ type, data }, supportsBinary, callback) => {
        if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
          const buffer = toBuffer(data);
          return callback(encodeBuffer(buffer, supportsBinary));
        }
        // plain string
        return callback(commons_js_1.PACKET_TYPES[type] + (data || ''));
      };
      const toBuffer = (data) => {
        if (Buffer.isBuffer(data)) {
          return data;
        } else if (data instanceof ArrayBuffer) {
          return Buffer.from(data);
        } else {
          return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        }
      };
      // only 'message' packets can contain binary, so the type prefix is not needed
      const encodeBuffer = (data, supportsBinary) => {
        return supportsBinary ? data : 'b' + data.toString('base64');
      };
      exports.default = encodePacket;

      /***/
    },

    /***/ 5643: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.decodePayload =
        exports.decodePacket =
        exports.encodePayload =
        exports.encodePacket =
        exports.protocol =
          void 0;
      const encodePacket_js_1 = __nccwpck_require__(4786);
      exports.encodePacket = encodePacket_js_1.default;
      const decodePacket_js_1 = __nccwpck_require__(1059);
      exports.decodePacket = decodePacket_js_1.default;
      const SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
      const encodePayload = (packets, callback) => {
        // some packets may be added to the array while encoding, so the initial length must be saved
        const length = packets.length;
        const encodedPackets = new Array(length);
        let count = 0;
        packets.forEach((packet, i) => {
          // force base64 encoding for binary packets
          (0, encodePacket_js_1.default)(packet, false, (encodedPacket) => {
            encodedPackets[i] = encodedPacket;
            if (++count === length) {
              callback(encodedPackets.join(SEPARATOR));
            }
          });
        });
      };
      exports.encodePayload = encodePayload;
      const decodePayload = (encodedPayload, binaryType) => {
        const encodedPackets = encodedPayload.split(SEPARATOR);
        const packets = [];
        for (let i = 0; i < encodedPackets.length; i++) {
          const decodedPacket = (0, decodePacket_js_1.default)(
            encodedPackets[i],
            binaryType,
          );
          packets.push(decodedPacket);
          if (decodedPacket.type === 'error') {
            break;
          }
        }
        return packets;
      };
      exports.decodePayload = decodePayload;
      exports.protocol = 4;

      /***/
    },

    /***/ 1363: /***/ (module) => {
      /**
       * Helpers.
       */

      var s = 1000;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var w = d * 7;
      var y = d * 365.25;

      /**
       * Parse or format the given `val`.
       *
       * Options:
       *
       *  - `long` verbose formatting [false]
       *
       * @param {String|Number} val
       * @param {Object} [options]
       * @throws {Error} throw an error if val is not a non-empty string or a number
       * @return {String|Number}
       * @api public
       */

      module.exports = function (val, options) {
        options = options || {};
        var type = typeof val;
        if (type === 'string' && val.length > 0) {
          return parse(val);
        } else if (type === 'number' && isFinite(val)) {
          return options.long ? fmtLong(val) : fmtShort(val);
        }
        throw new Error(
          'val is not a non-empty string or a valid number. val=' +
            JSON.stringify(val),
        );
      };

      /**
       * Parse the given `str` and return milliseconds.
       *
       * @param {String} str
       * @return {Number}
       * @api private
       */

      function parse(str) {
        str = String(str);
        if (str.length > 100) {
          return;
        }
        var match =
          /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
            str,
          );
        if (!match) {
          return;
        }
        var n = parseFloat(match[1]);
        var type = (match[2] || 'ms').toLowerCase();
        switch (type) {
          case 'years':
          case 'year':
          case 'yrs':
          case 'yr':
          case 'y':
            return n * y;
          case 'weeks':
          case 'week':
          case 'w':
            return n * w;
          case 'days':
          case 'day':
          case 'd':
            return n * d;
          case 'hours':
          case 'hour':
          case 'hrs':
          case 'hr':
          case 'h':
            return n * h;
          case 'minutes':
          case 'minute':
          case 'mins':
          case 'min':
          case 'm':
            return n * m;
          case 'seconds':
          case 'second':
          case 'secs':
          case 'sec':
          case 's':
            return n * s;
          case 'milliseconds':
          case 'millisecond':
          case 'msecs':
          case 'msec':
          case 'ms':
            return n;
          default:
            return undefined;
        }
      }

      /**
       * Short format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtShort(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return Math.round(ms / d) + 'd';
        }
        if (msAbs >= h) {
          return Math.round(ms / h) + 'h';
        }
        if (msAbs >= m) {
          return Math.round(ms / m) + 'm';
        }
        if (msAbs >= s) {
          return Math.round(ms / s) + 's';
        }
        return ms + 'ms';
      }

      /**
       * Long format for `ms`.
       *
       * @param {Number} ms
       * @return {String}
       * @api private
       */

      function fmtLong(ms) {
        var msAbs = Math.abs(ms);
        if (msAbs >= d) {
          return plural(ms, msAbs, d, 'day');
        }
        if (msAbs >= h) {
          return plural(ms, msAbs, h, 'hour');
        }
        if (msAbs >= m) {
          return plural(ms, msAbs, m, 'minute');
        }
        if (msAbs >= s) {
          return plural(ms, msAbs, s, 'second');
        }
        return ms + ' ms';
      }

      /**
       * Pluralization helper.
       */

      function plural(ms, msAbs, n, name) {
        var isPlural = msAbs >= n * 1.5;
        return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
      }

      /***/
    },

    /***/ 2567: /***/ (__unused_webpack_module, exports) => {
      /**
       * Compiles a querystring
       * Returns string representation of the object
       *
       * @param {Object}
       * @api private
       */

      exports.encode = function (obj) {
        var str = '';

        for (var i in obj) {
          if (obj.hasOwnProperty(i)) {
            if (str.length) str += '&';
            str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
          }
        }

        return str;
      };

      /**
       * Parses a simple querystring into an object
       *
       * @param {String} qs
       * @api private
       */

      exports.decode = function (qs) {
        var qry = {};
        var pairs = qs.split('&');
        for (var i = 0, l = pairs.length; i < l; i++) {
          var pair = pairs[i].split('=');
          qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return qry;
      };

      /***/
    },

    /***/ 6795: /***/ (module) => {
      /**
       * Parses an URI
       *
       * @author Steven Levithan <stevenlevithan.com> (MIT license)
       * @api private
       */

      var re =
        /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

      var parts = [
        'source',
        'protocol',
        'authority',
        'userInfo',
        'user',
        'password',
        'host',
        'port',
        'relative',
        'path',
        'directory',
        'file',
        'query',
        'anchor',
      ];

      module.exports = function parseuri(str) {
        var src = str,
          b = str.indexOf('['),
          e = str.indexOf(']');

        if (b != -1 && e != -1) {
          str =
            str.substring(0, b) +
            str.substring(b, e).replace(/:/g, ';') +
            str.substring(e, str.length);
        }

        var m = re.exec(str || ''),
          uri = {},
          i = 14;

        while (i--) {
          uri[parts[i]] = m[i] || '';
        }

        if (b != -1 && e != -1) {
          uri.source = src;
          uri.host = uri.host
            .substring(1, uri.host.length - 1)
            .replace(/;/g, ':');
          uri.authority = uri.authority
            .replace('[', '')
            .replace(']', '')
            .replace(/;/g, ':');
          uri.ipv6uri = true;
        }

        uri.pathNames = pathNames(uri, uri['path']);
        uri.queryKey = queryKey(uri, uri['query']);

        return uri;
      };

      function pathNames(obj, path) {
        var regx = /\/{2,9}/g,
          names = path.replace(regx, '/').split('/');

        if (path.substr(0, 1) == '/' || path.length === 0) {
          names.splice(0, 1);
        }
        if (path.substr(path.length - 1, 1) == '/') {
          names.splice(names.length - 1, 1);
        }

        return names;
      }

      function queryKey(uri, query) {
        var data = {};

        query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
          if ($1) {
            data[$1] = $2;
          }
        });

        return data;
      }

      /***/
    },

    /***/ 7303: /***/ function (module, exports, __nccwpck_require__) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.default =
        exports.connect =
        exports.io =
        exports.Socket =
        exports.Manager =
        exports.protocol =
          void 0;
      const url_js_1 = __nccwpck_require__(2859);
      const manager_js_1 = __nccwpck_require__(6276);
      Object.defineProperty(exports, 'Manager', {
        enumerable: true,
        get: function () {
          return manager_js_1.Manager;
        },
      });
      const socket_js_1 = __nccwpck_require__(4603);
      Object.defineProperty(exports, 'Socket', {
        enumerable: true,
        get: function () {
          return socket_js_1.Socket;
        },
      });
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const debug = debug_1.default('socket.io-client'); // debug()
      /**
       * Managers cache.
       */
      const cache = {};
      function lookup(uri, opts) {
        if (typeof uri === 'object') {
          opts = uri;
          uri = undefined;
        }
        opts = opts || {};
        const parsed = url_js_1.url(uri, opts.path || '/socket.io');
        const source = parsed.source;
        const id = parsed.id;
        const path = parsed.path;
        const sameNamespace = cache[id] && path in cache[id]['nsps'];
        const newConnection =
          opts.forceNew ||
          opts['force new connection'] ||
          false === opts.multiplex ||
          sameNamespace;
        let io;
        if (newConnection) {
          debug('ignoring socket cache for %s', source);
          io = new manager_js_1.Manager(source, opts);
        } else {
          if (!cache[id]) {
            debug('new io instance for %s', source);
            cache[id] = new manager_js_1.Manager(source, opts);
          }
          io = cache[id];
        }
        if (parsed.query && !opts.query) {
          opts.query = parsed.queryKey;
        }
        return io.socket(parsed.path, opts);
      }
      exports.io = lookup;
      exports.connect = lookup;
      exports.default = lookup;
      // so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
      // namespace (e.g. `io.connect(...)`), for backward compatibility
      Object.assign(lookup, {
        Manager: manager_js_1.Manager,
        Socket: socket_js_1.Socket,
        io: lookup,
        connect: lookup,
      });
      /**
       * Protocol version.
       *
       * @public
       */
      var socket_io_parser_1 = __nccwpck_require__(5243);
      Object.defineProperty(exports, 'protocol', {
        enumerable: true,
        get: function () {
          return socket_io_parser_1.protocol;
        },
      });

      module.exports = lookup;

      /***/
    },

    /***/ 6276: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __createBinding =
        (this && this.__createBinding) ||
        (Object.create
          ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                enumerable: true,
                get: function () {
                  return m[k];
                },
              });
            }
          : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
            });
      var __setModuleDefault =
        (this && this.__setModuleDefault) ||
        (Object.create
          ? function (o, v) {
              Object.defineProperty(o, 'default', {
                enumerable: true,
                value: v,
              });
            }
          : function (o, v) {
              o['default'] = v;
            });
      var __importStar =
        (this && this.__importStar) ||
        function (mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null)
            for (var k in mod)
              if (
                k !== 'default' &&
                Object.prototype.hasOwnProperty.call(mod, k)
              )
                __createBinding(result, mod, k);
          __setModuleDefault(result, mod);
          return result;
        };
      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Manager = void 0;
      const engine_io_client_1 = __nccwpck_require__(4921);
      const socket_js_1 = __nccwpck_require__(4603);
      const parser = __importStar(__nccwpck_require__(5243));
      const on_js_1 = __nccwpck_require__(8030);
      const backo2_1 = __importDefault(__nccwpck_require__(2415));
      const component_emitter_1 = __nccwpck_require__(1806);
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const debug = debug_1.default('socket.io-client:manager'); // debug()
      class Manager extends component_emitter_1.Emitter {
        constructor(uri, opts) {
          var _a;
          super();
          this.nsps = {};
          this.subs = [];
          if (uri && 'object' === typeof uri) {
            opts = uri;
            uri = undefined;
          }
          opts = opts || {};
          opts.path = opts.path || '/socket.io';
          this.opts = opts;
          engine_io_client_1.installTimerFunctions(this, opts);
          this.reconnection(opts.reconnection !== false);
          this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
          this.reconnectionDelay(opts.reconnectionDelay || 1000);
          this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
          this.randomizationFactor(
            (_a = opts.randomizationFactor) !== null && _a !== void 0
              ? _a
              : 0.5,
          );
          this.backoff = new backo2_1.default({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor(),
          });
          this.timeout(null == opts.timeout ? 20000 : opts.timeout);
          this._readyState = 'closed';
          this.uri = uri;
          const _parser = opts.parser || parser;
          this.encoder = new _parser.Encoder();
          this.decoder = new _parser.Decoder();
          this._autoConnect = opts.autoConnect !== false;
          if (this._autoConnect) this.open();
        }
        reconnection(v) {
          if (!arguments.length) return this._reconnection;
          this._reconnection = !!v;
          return this;
        }
        reconnectionAttempts(v) {
          if (v === undefined) return this._reconnectionAttempts;
          this._reconnectionAttempts = v;
          return this;
        }
        reconnectionDelay(v) {
          var _a;
          if (v === undefined) return this._reconnectionDelay;
          this._reconnectionDelay = v;
          (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
          return this;
        }
        randomizationFactor(v) {
          var _a;
          if (v === undefined) return this._randomizationFactor;
          this._randomizationFactor = v;
          (_a = this.backoff) === null || _a === void 0
            ? void 0
            : _a.setJitter(v);
          return this;
        }
        reconnectionDelayMax(v) {
          var _a;
          if (v === undefined) return this._reconnectionDelayMax;
          this._reconnectionDelayMax = v;
          (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
          return this;
        }
        timeout(v) {
          if (!arguments.length) return this._timeout;
          this._timeout = v;
          return this;
        }
        /**
         * Starts trying to reconnect if reconnection is enabled and we have not
         * started reconnecting yet
         *
         * @private
         */
        maybeReconnectOnOpen() {
          // Only try to reconnect if it's the first time we're connecting
          if (
            !this._reconnecting &&
            this._reconnection &&
            this.backoff.attempts === 0
          ) {
            // keeps reconnection from firing twice for the same reconnection loop
            this.reconnect();
          }
        }
        /**
         * Sets the current transport `socket`.
         *
         * @param {Function} fn - optional, callback
         * @return self
         * @public
         */
        open(fn) {
          debug('readyState %s', this._readyState);
          if (~this._readyState.indexOf('open')) return this;
          debug('opening %s', this.uri);
          this.engine = new engine_io_client_1.Socket(this.uri, this.opts);
          const socket = this.engine;
          const self = this;
          this._readyState = 'opening';
          this.skipReconnect = false;
          // emit `open`
          const openSubDestroy = on_js_1.on(socket, 'open', function () {
            self.onopen();
            fn && fn();
          });
          // emit `error`
          const errorSub = on_js_1.on(socket, 'error', (err) => {
            debug('error');
            self.cleanup();
            self._readyState = 'closed';
            this.emitReserved('error', err);
            if (fn) {
              fn(err);
            } else {
              // Only do this if there is no fn to handle the error
              self.maybeReconnectOnOpen();
            }
          });
          if (false !== this._timeout) {
            const timeout = this._timeout;
            debug('connect attempt will timeout after %d', timeout);
            if (timeout === 0) {
              openSubDestroy(); // prevents a race condition with the 'open' event
            }
            // set timer
            const timer = this.setTimeoutFn(() => {
              debug('connect attempt timed out after %d', timeout);
              openSubDestroy();
              socket.close();
              // @ts-ignore
              socket.emit('error', new Error('timeout'));
            }, timeout);
            if (this.opts.autoUnref) {
              timer.unref();
            }
            this.subs.push(function subDestroy() {
              clearTimeout(timer);
            });
          }
          this.subs.push(openSubDestroy);
          this.subs.push(errorSub);
          return this;
        }
        /**
         * Alias for open()
         *
         * @return self
         * @public
         */
        connect(fn) {
          return this.open(fn);
        }
        /**
         * Called upon transport open.
         *
         * @private
         */
        onopen() {
          debug('open');
          // clear old subs
          this.cleanup();
          // mark as open
          this._readyState = 'open';
          this.emitReserved('open');
          // add new subs
          const socket = this.engine;
          this.subs.push(
            on_js_1.on(socket, 'ping', this.onping.bind(this)),
            on_js_1.on(socket, 'data', this.ondata.bind(this)),
            on_js_1.on(socket, 'error', this.onerror.bind(this)),
            on_js_1.on(socket, 'close', this.onclose.bind(this)),
            on_js_1.on(this.decoder, 'decoded', this.ondecoded.bind(this)),
          );
        }
        /**
         * Called upon a ping.
         *
         * @private
         */
        onping() {
          this.emitReserved('ping');
        }
        /**
         * Called with data.
         *
         * @private
         */
        ondata(data) {
          this.decoder.add(data);
        }
        /**
         * Called when parser fully decodes a packet.
         *
         * @private
         */
        ondecoded(packet) {
          this.emitReserved('packet', packet);
        }
        /**
         * Called upon socket error.
         *
         * @private
         */
        onerror(err) {
          debug('error', err);
          this.emitReserved('error', err);
        }
        /**
         * Creates a new socket for the given `nsp`.
         *
         * @return {Socket}
         * @public
         */
        socket(nsp, opts) {
          let socket = this.nsps[nsp];
          if (!socket) {
            socket = new socket_js_1.Socket(this, nsp, opts);
            this.nsps[nsp] = socket;
          }
          return socket;
        }
        /**
         * Called upon a socket close.
         *
         * @param socket
         * @private
         */
        _destroy(socket) {
          const nsps = Object.keys(this.nsps);
          for (const nsp of nsps) {
            const socket = this.nsps[nsp];
            if (socket.active) {
              debug('socket %s is still active, skipping close', nsp);
              return;
            }
          }
          this._close();
        }
        /**
         * Writes a packet.
         *
         * @param packet
         * @private
         */
        _packet(packet) {
          debug('writing packet %j', packet);
          const encodedPackets = this.encoder.encode(packet);
          for (let i = 0; i < encodedPackets.length; i++) {
            this.engine.write(encodedPackets[i], packet.options);
          }
        }
        /**
         * Clean up transport subscriptions and packet buffer.
         *
         * @private
         */
        cleanup() {
          debug('cleanup');
          this.subs.forEach((subDestroy) => subDestroy());
          this.subs.length = 0;
          this.decoder.destroy();
        }
        /**
         * Close the current socket.
         *
         * @private
         */
        _close() {
          debug('disconnect');
          this.skipReconnect = true;
          this._reconnecting = false;
          if ('opening' === this._readyState) {
            // `onclose` will not fire because
            // an open event never happened
            this.cleanup();
          }
          this.backoff.reset();
          this._readyState = 'closed';
          if (this.engine) this.engine.close();
        }
        /**
         * Alias for close()
         *
         * @private
         */
        disconnect() {
          return this._close();
        }
        /**
         * Called upon engine close.
         *
         * @private
         */
        onclose(reason) {
          debug('onclose');
          this.cleanup();
          this.backoff.reset();
          this._readyState = 'closed';
          this.emitReserved('close', reason);
          if (this._reconnection && !this.skipReconnect) {
            this.reconnect();
          }
        }
        /**
         * Attempt a reconnection.
         *
         * @private
         */
        reconnect() {
          if (this._reconnecting || this.skipReconnect) return this;
          const self = this;
          if (this.backoff.attempts >= this._reconnectionAttempts) {
            debug('reconnect failed');
            this.backoff.reset();
            this.emitReserved('reconnect_failed');
            this._reconnecting = false;
          } else {
            const delay = this.backoff.duration();
            debug('will wait %dms before reconnect attempt', delay);
            this._reconnecting = true;
            const timer = this.setTimeoutFn(() => {
              if (self.skipReconnect) return;
              debug('attempting reconnect');
              this.emitReserved('reconnect_attempt', self.backoff.attempts);
              // check again for the case socket closed in above events
              if (self.skipReconnect) return;
              self.open((err) => {
                if (err) {
                  debug('reconnect attempt error');
                  self._reconnecting = false;
                  self.reconnect();
                  this.emitReserved('reconnect_error', err);
                } else {
                  debug('reconnect success');
                  self.onreconnect();
                }
              });
            }, delay);
            if (this.opts.autoUnref) {
              timer.unref();
            }
            this.subs.push(function subDestroy() {
              clearTimeout(timer);
            });
          }
        }
        /**
         * Called upon successful reconnect.
         *
         * @private
         */
        onreconnect() {
          const attempt = this.backoff.attempts;
          this._reconnecting = false;
          this.backoff.reset();
          this.emitReserved('reconnect', attempt);
        }
      }
      exports.Manager = Manager;

      /***/
    },

    /***/ 8030: /***/ (__unused_webpack_module, exports) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.on = void 0;
      function on(obj, ev, fn) {
        obj.on(ev, fn);
        return function subDestroy() {
          obj.off(ev, fn);
        };
      }
      exports.on = on;

      /***/
    },

    /***/ 4603: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Socket = void 0;
      const socket_io_parser_1 = __nccwpck_require__(5243);
      const on_js_1 = __nccwpck_require__(8030);
      const component_emitter_1 = __nccwpck_require__(1806);
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const debug = debug_1.default('socket.io-client:socket'); // debug()
      /**
       * Internal events.
       * These events can't be emitted by the user.
       */
      const RESERVED_EVENTS = Object.freeze({
        connect: 1,
        connect_error: 1,
        disconnect: 1,
        disconnecting: 1,
        // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
        newListener: 1,
        removeListener: 1,
      });
      class Socket extends component_emitter_1.Emitter {
        /**
         * `Socket` constructor.
         *
         * @public
         */
        constructor(io, nsp, opts) {
          super();
          this.connected = false;
          this.disconnected = true;
          this.receiveBuffer = [];
          this.sendBuffer = [];
          this.ids = 0;
          this.acks = {};
          this.flags = {};
          this.io = io;
          this.nsp = nsp;
          if (opts && opts.auth) {
            this.auth = opts.auth;
          }
          if (this.io._autoConnect) this.open();
        }
        /**
         * Subscribe to open, close and packet events
         *
         * @private
         */
        subEvents() {
          if (this.subs) return;
          const io = this.io;
          this.subs = [
            on_js_1.on(io, 'open', this.onopen.bind(this)),
            on_js_1.on(io, 'packet', this.onpacket.bind(this)),
            on_js_1.on(io, 'error', this.onerror.bind(this)),
            on_js_1.on(io, 'close', this.onclose.bind(this)),
          ];
        }
        /**
         * Whether the Socket will try to reconnect when its Manager connects or reconnects
         */
        get active() {
          return !!this.subs;
        }
        /**
         * "Opens" the socket.
         *
         * @public
         */
        connect() {
          if (this.connected) return this;
          this.subEvents();
          if (!this.io['_reconnecting']) this.io.open(); // ensure open
          if ('open' === this.io._readyState) this.onopen();
          return this;
        }
        /**
         * Alias for connect()
         */
        open() {
          return this.connect();
        }
        /**
         * Sends a `message` event.
         *
         * @return self
         * @public
         */
        send(...args) {
          args.unshift('message');
          this.emit.apply(this, args);
          return this;
        }
        /**
         * Override `emit`.
         * If the event is in `events`, it's emitted normally.
         *
         * @return self
         * @public
         */
        emit(ev, ...args) {
          if (RESERVED_EVENTS.hasOwnProperty(ev)) {
            throw new Error('"' + ev + '" is a reserved event name');
          }
          args.unshift(ev);
          const packet = {
            type: socket_io_parser_1.PacketType.EVENT,
            data: args,
          };
          packet.options = {};
          packet.options.compress = this.flags.compress !== false;
          // event ack callback
          if ('function' === typeof args[args.length - 1]) {
            debug('emitting packet with ack id %d', this.ids);
            this.acks[this.ids] = args.pop();
            packet.id = this.ids++;
          }
          const isTransportWritable =
            this.io.engine &&
            this.io.engine.transport &&
            this.io.engine.transport.writable;
          const discardPacket =
            this.flags.volatile && (!isTransportWritable || !this.connected);
          if (discardPacket) {
            debug('discard packet as the transport is not currently writable');
          } else if (this.connected) {
            this.packet(packet);
          } else {
            this.sendBuffer.push(packet);
          }
          this.flags = {};
          return this;
        }
        /**
         * Sends a packet.
         *
         * @param packet
         * @private
         */
        packet(packet) {
          packet.nsp = this.nsp;
          this.io._packet(packet);
        }
        /**
         * Called upon engine `open`.
         *
         * @private
         */
        onopen() {
          debug('transport is open - connecting');
          if (typeof this.auth == 'function') {
            this.auth((data) => {
              this.packet({
                type: socket_io_parser_1.PacketType.CONNECT,
                data,
              });
            });
          } else {
            this.packet({
              type: socket_io_parser_1.PacketType.CONNECT,
              data: this.auth,
            });
          }
        }
        /**
         * Called upon engine or manager `error`.
         *
         * @param err
         * @private
         */
        onerror(err) {
          if (!this.connected) {
            this.emitReserved('connect_error', err);
          }
        }
        /**
         * Called upon engine `close`.
         *
         * @param reason
         * @private
         */
        onclose(reason) {
          debug('close (%s)', reason);
          this.connected = false;
          this.disconnected = true;
          delete this.id;
          this.emitReserved('disconnect', reason);
        }
        /**
         * Called with socket packet.
         *
         * @param packet
         * @private
         */
        onpacket(packet) {
          const sameNamespace = packet.nsp === this.nsp;
          if (!sameNamespace) return;
          switch (packet.type) {
            case socket_io_parser_1.PacketType.CONNECT:
              if (packet.data && packet.data.sid) {
                const id = packet.data.sid;
                this.onconnect(id);
              } else {
                this.emitReserved(
                  'connect_error',
                  new Error(
                    'It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)',
                  ),
                );
              }
              break;
            case socket_io_parser_1.PacketType.EVENT:
              this.onevent(packet);
              break;
            case socket_io_parser_1.PacketType.BINARY_EVENT:
              this.onevent(packet);
              break;
            case socket_io_parser_1.PacketType.ACK:
              this.onack(packet);
              break;
            case socket_io_parser_1.PacketType.BINARY_ACK:
              this.onack(packet);
              break;
            case socket_io_parser_1.PacketType.DISCONNECT:
              this.ondisconnect();
              break;
            case socket_io_parser_1.PacketType.CONNECT_ERROR:
              const err = new Error(packet.data.message);
              // @ts-ignore
              err.data = packet.data.data;
              this.emitReserved('connect_error', err);
              break;
          }
        }
        /**
         * Called upon a server event.
         *
         * @param packet
         * @private
         */
        onevent(packet) {
          const args = packet.data || [];
          debug('emitting event %j', args);
          if (null != packet.id) {
            debug('attaching ack callback to event');
            args.push(this.ack(packet.id));
          }
          if (this.connected) {
            this.emitEvent(args);
          } else {
            this.receiveBuffer.push(Object.freeze(args));
          }
        }
        emitEvent(args) {
          if (this._anyListeners && this._anyListeners.length) {
            const listeners = this._anyListeners.slice();
            for (const listener of listeners) {
              listener.apply(this, args);
            }
          }
          super.emit.apply(this, args);
        }
        /**
         * Produces an ack callback to emit with an event.
         *
         * @private
         */
        ack(id) {
          const self = this;
          let sent = false;
          return function (...args) {
            // prevent double callbacks
            if (sent) return;
            sent = true;
            debug('sending ack %j', args);
            self.packet({
              type: socket_io_parser_1.PacketType.ACK,
              id: id,
              data: args,
            });
          };
        }
        /**
         * Called upon a server acknowlegement.
         *
         * @param packet
         * @private
         */
        onack(packet) {
          const ack = this.acks[packet.id];
          if ('function' === typeof ack) {
            debug('calling ack %s with %j', packet.id, packet.data);
            ack.apply(this, packet.data);
            delete this.acks[packet.id];
          } else {
            debug('bad ack %s', packet.id);
          }
        }
        /**
         * Called upon server connect.
         *
         * @private
         */
        onconnect(id) {
          debug('socket connected with id %s', id);
          this.id = id;
          this.connected = true;
          this.disconnected = false;
          this.emitBuffered();
          this.emitReserved('connect');
        }
        /**
         * Emit buffered events (received and emitted).
         *
         * @private
         */
        emitBuffered() {
          this.receiveBuffer.forEach((args) => this.emitEvent(args));
          this.receiveBuffer = [];
          this.sendBuffer.forEach((packet) => this.packet(packet));
          this.sendBuffer = [];
        }
        /**
         * Called upon server disconnect.
         *
         * @private
         */
        ondisconnect() {
          debug('server disconnect (%s)', this.nsp);
          this.destroy();
          this.onclose('io server disconnect');
        }
        /**
         * Called upon forced client/server side disconnections,
         * this method ensures the manager stops tracking us and
         * that reconnections don't get triggered for this.
         *
         * @private
         */
        destroy() {
          if (this.subs) {
            // clean subscriptions to avoid reconnections
            this.subs.forEach((subDestroy) => subDestroy());
            this.subs = undefined;
          }
          this.io['_destroy'](this);
        }
        /**
         * Disconnects the socket manually.
         *
         * @return self
         * @public
         */
        disconnect() {
          if (this.connected) {
            debug('performing disconnect (%s)', this.nsp);
            this.packet({ type: socket_io_parser_1.PacketType.DISCONNECT });
          }
          // remove socket from pool
          this.destroy();
          if (this.connected) {
            // fire events
            this.onclose('io client disconnect');
          }
          return this;
        }
        /**
         * Alias for disconnect()
         *
         * @return self
         * @public
         */
        close() {
          return this.disconnect();
        }
        /**
         * Sets the compress flag.
         *
         * @param compress - if `true`, compresses the sending data
         * @return self
         * @public
         */
        compress(compress) {
          this.flags.compress = compress;
          return this;
        }
        /**
         * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
         * ready to send messages.
         *
         * @returns self
         * @public
         */
        get volatile() {
          this.flags.volatile = true;
          return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback.
         *
         * @param listener
         * @public
         */
        onAny(listener) {
          this._anyListeners = this._anyListeners || [];
          this._anyListeners.push(listener);
          return this;
        }
        /**
         * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
         * callback. The listener is added to the beginning of the listeners array.
         *
         * @param listener
         * @public
         */
        prependAny(listener) {
          this._anyListeners = this._anyListeners || [];
          this._anyListeners.unshift(listener);
          return this;
        }
        /**
         * Removes the listener that will be fired when any event is emitted.
         *
         * @param listener
         * @public
         */
        offAny(listener) {
          if (!this._anyListeners) {
            return this;
          }
          if (listener) {
            const listeners = this._anyListeners;
            for (let i = 0; i < listeners.length; i++) {
              if (listener === listeners[i]) {
                listeners.splice(i, 1);
                return this;
              }
            }
          } else {
            this._anyListeners = [];
          }
          return this;
        }
        /**
         * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
         * e.g. to remove listeners.
         *
         * @public
         */
        listenersAny() {
          return this._anyListeners || [];
        }
      }
      exports.Socket = Socket;

      /***/
    },

    /***/ 2859: /***/ function (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) {
      'use strict';

      var __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        };
      Object.defineProperty(exports, '__esModule', { value: true });
      exports.url = void 0;
      const parseuri_1 = __importDefault(__nccwpck_require__(6795));
      const debug_1 = __importDefault(__nccwpck_require__(8302)); // debug()
      const debug = debug_1.default('socket.io-client:url'); // debug()
      /**
       * URL parser.
       *
       * @param uri - url
       * @param path - the request path of the connection
       * @param loc - An object meant to mimic window.location.
       *        Defaults to window.location.
       * @public
       */
      function url(uri, path = '', loc) {
        let obj = uri;
        // default to window.location
        loc = loc || (typeof location !== 'undefined' && location);
        if (null == uri) uri = loc.protocol + '//' + loc.host;
        // relative path support
        if (typeof uri === 'string') {
          if ('/' === uri.charAt(0)) {
            if ('/' === uri.charAt(1)) {
              uri = loc.protocol + uri;
            } else {
              uri = loc.host + uri;
            }
          }
          if (!/^(https?|wss?):\/\//.test(uri)) {
            debug('protocol-less url %s', uri);
            if ('undefined' !== typeof loc) {
              uri = loc.protocol + '//' + uri;
            } else {
              uri = 'https://' + uri;
            }
          }
          // parse
          debug('parse %s', uri);
          obj = parseuri_1.default(uri);
        }
        // make sure we treat `localhost:80` and `localhost` equally
        if (!obj.port) {
          if (/^(http|ws)$/.test(obj.protocol)) {
            obj.port = '80';
          } else if (/^(http|ws)s$/.test(obj.protocol)) {
            obj.port = '443';
          }
        }
        obj.path = obj.path || '/';
        const ipv6 = obj.host.indexOf(':') !== -1;
        const host = ipv6 ? '[' + obj.host + ']' : obj.host;
        // define unique id
        obj.id = obj.protocol + '://' + host + ':' + obj.port + path;
        // define href
        obj.href =
          obj.protocol +
          '://' +
          host +
          (loc && loc.port === obj.port ? '' : ':' + obj.port);
        return obj;
      }
      exports.url = url;

      /***/
    },

    /***/ 4100: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.reconstructPacket = exports.deconstructPacket = void 0;
      const is_binary_js_1 = __nccwpck_require__(9401);
      /**
       * Replaces every Buffer | ArrayBuffer | Blob | File in packet with a numbered placeholder.
       *
       * @param {Object} packet - socket.io event packet
       * @return {Object} with deconstructed packet and list of buffers
       * @public
       */
      function deconstructPacket(packet) {
        const buffers = [];
        const packetData = packet.data;
        const pack = packet;
        pack.data = _deconstructPacket(packetData, buffers);
        pack.attachments = buffers.length; // number of binary 'attachments'
        return { packet: pack, buffers: buffers };
      }
      exports.deconstructPacket = deconstructPacket;
      function _deconstructPacket(data, buffers) {
        if (!data) return data;
        if (is_binary_js_1.isBinary(data)) {
          const placeholder = { _placeholder: true, num: buffers.length };
          buffers.push(data);
          return placeholder;
        } else if (Array.isArray(data)) {
          const newData = new Array(data.length);
          for (let i = 0; i < data.length; i++) {
            newData[i] = _deconstructPacket(data[i], buffers);
          }
          return newData;
        } else if (typeof data === 'object' && !(data instanceof Date)) {
          const newData = {};
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              newData[key] = _deconstructPacket(data[key], buffers);
            }
          }
          return newData;
        }
        return data;
      }
      /**
       * Reconstructs a binary packet from its placeholder packet and buffers
       *
       * @param {Object} packet - event packet with placeholders
       * @param {Array} buffers - binary buffers to put in placeholder positions
       * @return {Object} reconstructed packet
       * @public
       */
      function reconstructPacket(packet, buffers) {
        packet.data = _reconstructPacket(packet.data, buffers);
        packet.attachments = undefined; // no longer useful
        return packet;
      }
      exports.reconstructPacket = reconstructPacket;
      function _reconstructPacket(data, buffers) {
        if (!data) return data;
        if (data && data._placeholder) {
          return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        } else if (Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            data[i] = _reconstructPacket(data[i], buffers);
          }
        } else if (typeof data === 'object') {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              data[key] = _reconstructPacket(data[key], buffers);
            }
          }
        }
        return data;
      }

      /***/
    },

    /***/ 5243: /***/ (
      __unused_webpack_module,
      exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.Decoder =
        exports.Encoder =
        exports.PacketType =
        exports.protocol =
          void 0;
      const component_emitter_1 = __nccwpck_require__(1806);
      const binary_js_1 = __nccwpck_require__(4100);
      const is_binary_js_1 = __nccwpck_require__(9401);
      const debug_1 = __nccwpck_require__(8302); // debug()
      const debug = debug_1.default('socket.io-parser'); // debug()
      /**
       * Protocol version.
       *
       * @public
       */
      exports.protocol = 5;
      var PacketType;
      (function (PacketType) {
        PacketType[(PacketType['CONNECT'] = 0)] = 'CONNECT';
        PacketType[(PacketType['DISCONNECT'] = 1)] = 'DISCONNECT';
        PacketType[(PacketType['EVENT'] = 2)] = 'EVENT';
        PacketType[(PacketType['ACK'] = 3)] = 'ACK';
        PacketType[(PacketType['CONNECT_ERROR'] = 4)] = 'CONNECT_ERROR';
        PacketType[(PacketType['BINARY_EVENT'] = 5)] = 'BINARY_EVENT';
        PacketType[(PacketType['BINARY_ACK'] = 6)] = 'BINARY_ACK';
      })((PacketType = exports.PacketType || (exports.PacketType = {})));
      /**
       * A socket.io Encoder instance
       */
      class Encoder {
        /**
         * Encode a packet as a single string if non-binary, or as a
         * buffer sequence, depending on packet type.
         *
         * @param {Object} obj - packet object
         */
        encode(obj) {
          debug('encoding packet %j', obj);
          if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
            if (is_binary_js_1.hasBinary(obj)) {
              obj.type =
                obj.type === PacketType.EVENT
                  ? PacketType.BINARY_EVENT
                  : PacketType.BINARY_ACK;
              return this.encodeAsBinary(obj);
            }
          }
          return [this.encodeAsString(obj)];
        }
        /**
         * Encode packet as string.
         */
        encodeAsString(obj) {
          // first is type
          let str = '' + obj.type;
          // attachments if we have them
          if (
            obj.type === PacketType.BINARY_EVENT ||
            obj.type === PacketType.BINARY_ACK
          ) {
            str += obj.attachments + '-';
          }
          // if we have a namespace other than `/`
          // we append it followed by a comma `,`
          if (obj.nsp && '/' !== obj.nsp) {
            str += obj.nsp + ',';
          }
          // immediately followed by the id
          if (null != obj.id) {
            str += obj.id;
          }
          // json data
          if (null != obj.data) {
            str += JSON.stringify(obj.data);
          }
          debug('encoded %j as %s', obj, str);
          return str;
        }
        /**
         * Encode packet as 'buffer sequence' by removing blobs, and
         * deconstructing packet into object with placeholders and
         * a list of buffers.
         */
        encodeAsBinary(obj) {
          const deconstruction = binary_js_1.deconstructPacket(obj);
          const pack = this.encodeAsString(deconstruction.packet);
          const buffers = deconstruction.buffers;
          buffers.unshift(pack); // add packet info to beginning of data list
          return buffers; // write all the buffers
        }
      }
      exports.Encoder = Encoder;
      /**
       * A socket.io Decoder instance
       *
       * @return {Object} decoder
       */
      class Decoder extends component_emitter_1.Emitter {
        constructor() {
          super();
        }
        /**
         * Decodes an encoded packet string into packet JSON.
         *
         * @param {String} obj - encoded packet
         */
        add(obj) {
          let packet;
          if (typeof obj === 'string') {
            packet = this.decodeString(obj);
            if (
              packet.type === PacketType.BINARY_EVENT ||
              packet.type === PacketType.BINARY_ACK
            ) {
              // binary packet's json
              this.reconstructor = new BinaryReconstructor(packet);
              // no attachments, labeled binary but no binary data to follow
              if (packet.attachments === 0) {
                super.emitReserved('decoded', packet);
              }
            } else {
              // non-binary full packet
              super.emitReserved('decoded', packet);
            }
          } else if (is_binary_js_1.isBinary(obj) || obj.base64) {
            // raw binary data
            if (!this.reconstructor) {
              throw new Error(
                'got binary data when not reconstructing a packet',
              );
            } else {
              packet = this.reconstructor.takeBinaryData(obj);
              if (packet) {
                // received final buffer
                this.reconstructor = null;
                super.emitReserved('decoded', packet);
              }
            }
          } else {
            throw new Error('Unknown type: ' + obj);
          }
        }
        /**
         * Decode a packet String (JSON data)
         *
         * @param {String} str
         * @return {Object} packet
         */
        decodeString(str) {
          let i = 0;
          // look up type
          const p = {
            type: Number(str.charAt(0)),
          };
          if (PacketType[p.type] === undefined) {
            throw new Error('unknown packet type ' + p.type);
          }
          // look up attachments if type binary
          if (
            p.type === PacketType.BINARY_EVENT ||
            p.type === PacketType.BINARY_ACK
          ) {
            const start = i + 1;
            while (str.charAt(++i) !== '-' && i != str.length) {}
            const buf = str.substring(start, i);
            if (buf != Number(buf) || str.charAt(i) !== '-') {
              throw new Error('Illegal attachments');
            }
            p.attachments = Number(buf);
          }
          // look up namespace (if any)
          if ('/' === str.charAt(i + 1)) {
            const start = i + 1;
            while (++i) {
              const c = str.charAt(i);
              if (',' === c) break;
              if (i === str.length) break;
            }
            p.nsp = str.substring(start, i);
          } else {
            p.nsp = '/';
          }
          // look up id
          const next = str.charAt(i + 1);
          if ('' !== next && Number(next) == next) {
            const start = i + 1;
            while (++i) {
              const c = str.charAt(i);
              if (null == c || Number(c) != c) {
                --i;
                break;
              }
              if (i === str.length) break;
            }
            p.id = Number(str.substring(start, i + 1));
          }
          // look up json data
          if (str.charAt(++i)) {
            const payload = tryParse(str.substr(i));
            if (Decoder.isPayloadValid(p.type, payload)) {
              p.data = payload;
            } else {
              throw new Error('invalid payload');
            }
          }
          debug('decoded %s as %j', str, p);
          return p;
        }
        static isPayloadValid(type, payload) {
          switch (type) {
            case PacketType.CONNECT:
              return typeof payload === 'object';
            case PacketType.DISCONNECT:
              return payload === undefined;
            case PacketType.CONNECT_ERROR:
              return typeof payload === 'string' || typeof payload === 'object';
            case PacketType.EVENT:
            case PacketType.BINARY_EVENT:
              return Array.isArray(payload) && payload.length > 0;
            case PacketType.ACK:
            case PacketType.BINARY_ACK:
              return Array.isArray(payload);
          }
        }
        /**
         * Deallocates a parser's resources
         */
        destroy() {
          if (this.reconstructor) {
            this.reconstructor.finishedReconstruction();
          }
        }
      }
      exports.Decoder = Decoder;
      function tryParse(str) {
        try {
          return JSON.parse(str);
        } catch (e) {
          return false;
        }
      }
      /**
       * A manager of a binary event's 'buffer sequence'. Should
       * be constructed whenever a packet of type BINARY_EVENT is
       * decoded.
       *
       * @param {Object} packet
       * @return {BinaryReconstructor} initialized reconstructor
       */
      class BinaryReconstructor {
        constructor(packet) {
          this.packet = packet;
          this.buffers = [];
          this.reconPack = packet;
        }
        /**
         * Method to be called when binary data received from connection
         * after a BINARY_EVENT packet.
         *
         * @param {Buffer | ArrayBuffer} binData - the raw binary data received
         * @return {null | Object} returns null if more binary data is expected or
         *   a reconstructed packet object if all buffers have been received.
         */
        takeBinaryData(binData) {
          this.buffers.push(binData);
          if (this.buffers.length === this.reconPack.attachments) {
            // done with buffer list
            const packet = binary_js_1.reconstructPacket(
              this.reconPack,
              this.buffers,
            );
            this.finishedReconstruction();
            return packet;
          }
          return null;
        }
        /**
         * Cleans up binary packet reconstruction variables.
         */
        finishedReconstruction() {
          this.reconPack = null;
          this.buffers = [];
        }
      }

      /***/
    },

    /***/ 9401: /***/ (__unused_webpack_module, exports) => {
      'use strict';

      Object.defineProperty(exports, '__esModule', { value: true });
      exports.hasBinary = exports.isBinary = void 0;
      const withNativeArrayBuffer = typeof ArrayBuffer === 'function';
      const isView = (obj) => {
        return typeof ArrayBuffer.isView === 'function'
          ? ArrayBuffer.isView(obj)
          : obj.buffer instanceof ArrayBuffer;
      };
      const toString = Object.prototype.toString;
      const withNativeBlob =
        typeof Blob === 'function' ||
        (typeof Blob !== 'undefined' &&
          toString.call(Blob) === '[object BlobConstructor]');
      const withNativeFile =
        typeof File === 'function' ||
        (typeof File !== 'undefined' &&
          toString.call(File) === '[object FileConstructor]');
      /**
       * Returns true if obj is a Buffer, an ArrayBuffer, a Blob or a File.
       *
       * @private
       */
      function isBinary(obj) {
        return (
          (withNativeArrayBuffer &&
            (obj instanceof ArrayBuffer || isView(obj))) ||
          (withNativeBlob && obj instanceof Blob) ||
          (withNativeFile && obj instanceof File)
        );
      }
      exports.isBinary = isBinary;
      function hasBinary(obj, toJSON) {
        if (!obj || typeof obj !== 'object') {
          return false;
        }
        if (Array.isArray(obj)) {
          for (let i = 0, l = obj.length; i < l; i++) {
            if (hasBinary(obj[i])) {
              return true;
            }
          }
          return false;
        }
        if (isBinary(obj)) {
          return true;
        }
        if (
          obj.toJSON &&
          typeof obj.toJSON === 'function' &&
          arguments.length === 1
        ) {
          return hasBinary(obj.toJSON(), true);
        }
        for (const key in obj) {
          if (
            Object.prototype.hasOwnProperty.call(obj, key) &&
            hasBinary(obj[key])
          ) {
            return true;
          }
        }
        return false;
      }
      exports.hasBinary = hasBinary;

      /***/
    },

    /***/ 9892: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const os = __nccwpck_require__(2087);
      const tty = __nccwpck_require__(3867);
      const hasFlag = __nccwpck_require__(1397);

      const { env } = process;

      let forceColor;
      if (
        hasFlag('no-color') ||
        hasFlag('no-colors') ||
        hasFlag('color=false') ||
        hasFlag('color=never')
      ) {
        forceColor = 0;
      } else if (
        hasFlag('color') ||
        hasFlag('colors') ||
        hasFlag('color=true') ||
        hasFlag('color=always')
      ) {
        forceColor = 1;
      }

      if ('FORCE_COLOR' in env) {
        if (env.FORCE_COLOR === 'true') {
          forceColor = 1;
        } else if (env.FORCE_COLOR === 'false') {
          forceColor = 0;
        } else {
          forceColor =
            env.FORCE_COLOR.length === 0
              ? 1
              : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
        }
      }

      function translateLevel(level) {
        if (level === 0) {
          return false;
        }

        return {
          level,
          hasBasic: true,
          has256: level >= 2,
          has16m: level >= 3,
        };
      }

      function supportsColor(haveStream, streamIsTTY) {
        if (forceColor === 0) {
          return 0;
        }

        if (
          hasFlag('color=16m') ||
          hasFlag('color=full') ||
          hasFlag('color=truecolor')
        ) {
          return 3;
        }

        if (hasFlag('color=256')) {
          return 2;
        }

        if (haveStream && !streamIsTTY && forceColor === undefined) {
          return 0;
        }

        const min = forceColor || 0;

        if (env.TERM === 'dumb') {
          return min;
        }

        if (process.platform === 'win32') {
          // Windows 10 build 10586 is the first Windows release that supports 256 colors.
          // Windows 10 build 14931 is the first release that supports 16m/TrueColor.
          const osRelease = os.release().split('.');
          if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
          }

          return 1;
        }

        if ('CI' in env) {
          if (
            [
              'TRAVIS',
              'CIRCLECI',
              'APPVEYOR',
              'GITLAB_CI',
              'GITHUB_ACTIONS',
              'BUILDKITE',
            ].some((sign) => sign in env) ||
            env.CI_NAME === 'codeship'
          ) {
            return 1;
          }

          return min;
        }

        if ('TEAMCITY_VERSION' in env) {
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION)
            ? 1
            : 0;
        }

        if (env.COLORTERM === 'truecolor') {
          return 3;
        }

        if ('TERM_PROGRAM' in env) {
          const version = parseInt(
            (env.TERM_PROGRAM_VERSION || '').split('.')[0],
            10,
          );

          switch (env.TERM_PROGRAM) {
            case 'iTerm.app':
              return version >= 3 ? 3 : 2;
            case 'Apple_Terminal':
              return 2;
            // No default
          }
        }

        if (/-256(color)?$/i.test(env.TERM)) {
          return 2;
        }

        if (
          /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(
            env.TERM,
          )
        ) {
          return 1;
        }

        if ('COLORTERM' in env) {
          return 1;
        }

        return min;
      }

      function getSupportLevel(stream) {
        const level = supportsColor(stream, stream && stream.isTTY);
        return translateLevel(level);
      }

      module.exports = {
        supportsColor: getSupportLevel,
        stdout: translateLevel(supportsColor(true, tty.isatty(1))),
        stderr: translateLevel(supportsColor(true, tty.isatty(2))),
      };

      /***/
    },

    /***/ 1397: /***/ (module) => {
      'use strict';

      module.exports = (flag, argv = process.argv) => {
        const prefix = flag.startsWith('-')
          ? ''
          : flag.length === 1
          ? '-'
          : '--';
        const position = argv.indexOf(prefix + flag);
        const terminatorPosition = argv.indexOf('--');
        return (
          position !== -1 &&
          (terminatorPosition === -1 || position < terminatorPosition)
        );
      };

      /***/
    },

    /***/ 289: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const WebSocket = __nccwpck_require__(2880);

      WebSocket.createWebSocketStream = __nccwpck_require__(8351);
      WebSocket.Server = __nccwpck_require__(2937);
      WebSocket.Receiver = __nccwpck_require__(8988);
      WebSocket.Sender = __nccwpck_require__(1159);

      WebSocket.WebSocket = WebSocket;
      WebSocket.WebSocketServer = WebSocket.Server;

      module.exports = WebSocket;

      /***/
    },

    /***/ 8537: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const { EMPTY_BUFFER } = __nccwpck_require__(8868);

      /**
       * Merges an array of buffers into a new buffer.
       *
       * @param {Buffer[]} list The array of buffers to concat
       * @param {Number} totalLength The total length of buffers in the list
       * @return {Buffer} The resulting buffer
       * @public
       */
      function concat(list, totalLength) {
        if (list.length === 0) return EMPTY_BUFFER;
        if (list.length === 1) return list[0];

        const target = Buffer.allocUnsafe(totalLength);
        let offset = 0;

        for (let i = 0; i < list.length; i++) {
          const buf = list[i];
          target.set(buf, offset);
          offset += buf.length;
        }

        if (offset < totalLength) return target.slice(0, offset);

        return target;
      }

      /**
       * Masks a buffer using the given mask.
       *
       * @param {Buffer} source The buffer to mask
       * @param {Buffer} mask The mask to use
       * @param {Buffer} output The buffer where to store the result
       * @param {Number} offset The offset at which to start writing
       * @param {Number} length The number of bytes to mask.
       * @public
       */
      function _mask(source, mask, output, offset, length) {
        for (let i = 0; i < length; i++) {
          output[offset + i] = source[i] ^ mask[i & 3];
        }
      }

      /**
       * Unmasks a buffer using the given mask.
       *
       * @param {Buffer} buffer The buffer to unmask
       * @param {Buffer} mask The mask to use
       * @public
       */
      function _unmask(buffer, mask) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] ^= mask[i & 3];
        }
      }

      /**
       * Converts a buffer to an `ArrayBuffer`.
       *
       * @param {Buffer} buf The buffer to convert
       * @return {ArrayBuffer} Converted buffer
       * @public
       */
      function toArrayBuffer(buf) {
        if (buf.byteLength === buf.buffer.byteLength) {
          return buf.buffer;
        }

        return buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength,
        );
      }

      /**
       * Converts `data` to a `Buffer`.
       *
       * @param {*} data The data to convert
       * @return {Buffer} The buffer
       * @throws {TypeError}
       * @public
       */
      function toBuffer(data) {
        toBuffer.readOnly = true;

        if (Buffer.isBuffer(data)) return data;

        let buf;

        if (data instanceof ArrayBuffer) {
          buf = Buffer.from(data);
        } else if (ArrayBuffer.isView(data)) {
          buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        } else {
          buf = Buffer.from(data);
          toBuffer.readOnly = false;
        }

        return buf;
      }

      try {
        const bufferUtil = __nccwpck_require__(8966);

        module.exports = {
          concat,
          mask(source, mask, output, offset, length) {
            if (length < 48) _mask(source, mask, output, offset, length);
            else bufferUtil.mask(source, mask, output, offset, length);
          },
          toArrayBuffer,
          toBuffer,
          unmask(buffer, mask) {
            if (buffer.length < 32) _unmask(buffer, mask);
            else bufferUtil.unmask(buffer, mask);
          },
        };
      } catch (e) /* istanbul ignore next */ {
        module.exports = {
          concat,
          mask: _mask,
          toArrayBuffer,
          toBuffer,
          unmask: _unmask,
        };
      }

      /***/
    },

    /***/ 8868: /***/ (module) => {
      'use strict';

      module.exports = {
        BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
        EMPTY_BUFFER: Buffer.alloc(0),
        GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
        kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
        kListener: Symbol('kListener'),
        kStatusCode: Symbol('status-code'),
        kWebSocket: Symbol('websocket'),
        NOOP: () => {},
      };

      /***/
    },

    /***/ 9816: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const { kForOnEventAttribute, kListener } = __nccwpck_require__(8868);

      const kCode = Symbol('kCode');
      const kData = Symbol('kData');
      const kError = Symbol('kError');
      const kMessage = Symbol('kMessage');
      const kReason = Symbol('kReason');
      const kTarget = Symbol('kTarget');
      const kType = Symbol('kType');
      const kWasClean = Symbol('kWasClean');

      /**
       * Class representing an event.
       */
      class Event {
        /**
         * Create a new `Event`.
         *
         * @param {String} type The name of the event
         * @throws {TypeError} If the `type` argument is not specified
         */
        constructor(type) {
          this[kTarget] = null;
          this[kType] = type;
        }

        /**
         * @type {*}
         */
        get target() {
          return this[kTarget];
        }

        /**
         * @type {String}
         */
        get type() {
          return this[kType];
        }
      }

      Object.defineProperty(Event.prototype, 'target', { enumerable: true });
      Object.defineProperty(Event.prototype, 'type', { enumerable: true });

      /**
       * Class representing a close event.
       *
       * @extends Event
       */
      class CloseEvent extends Event {
        /**
         * Create a new `CloseEvent`.
         *
         * @param {String} type The name of the event
         * @param {Object} [options] A dictionary object that allows for setting
         *     attributes via object members of the same name
         * @param {Number} [options.code=0] The status code explaining why the
         *     connection was closed
         * @param {String} [options.reason=''] A human-readable string explaining why
         *     the connection was closed
         * @param {Boolean} [options.wasClean=false] Indicates whether or not the
         *     connection was cleanly closed
         */
        constructor(type, options = {}) {
          super(type);

          this[kCode] = options.code === undefined ? 0 : options.code;
          this[kReason] = options.reason === undefined ? '' : options.reason;
          this[kWasClean] =
            options.wasClean === undefined ? false : options.wasClean;
        }

        /**
         * @type {Number}
         */
        get code() {
          return this[kCode];
        }

        /**
         * @type {String}
         */
        get reason() {
          return this[kReason];
        }

        /**
         * @type {Boolean}
         */
        get wasClean() {
          return this[kWasClean];
        }
      }

      Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
      Object.defineProperty(CloseEvent.prototype, 'reason', {
        enumerable: true,
      });
      Object.defineProperty(CloseEvent.prototype, 'wasClean', {
        enumerable: true,
      });

      /**
       * Class representing an error event.
       *
       * @extends Event
       */
      class ErrorEvent extends Event {
        /**
         * Create a new `ErrorEvent`.
         *
         * @param {String} type The name of the event
         * @param {Object} [options] A dictionary object that allows for setting
         *     attributes via object members of the same name
         * @param {*} [options.error=null] The error that generated this event
         * @param {String} [options.message=''] The error message
         */
        constructor(type, options = {}) {
          super(type);

          this[kError] = options.error === undefined ? null : options.error;
          this[kMessage] = options.message === undefined ? '' : options.message;
        }

        /**
         * @type {*}
         */
        get error() {
          return this[kError];
        }

        /**
         * @type {String}
         */
        get message() {
          return this[kMessage];
        }
      }

      Object.defineProperty(ErrorEvent.prototype, 'error', {
        enumerable: true,
      });
      Object.defineProperty(ErrorEvent.prototype, 'message', {
        enumerable: true,
      });

      /**
       * Class representing a message event.
       *
       * @extends Event
       */
      class MessageEvent extends Event {
        /**
         * Create a new `MessageEvent`.
         *
         * @param {String} type The name of the event
         * @param {Object} [options] A dictionary object that allows for setting
         *     attributes via object members of the same name
         * @param {*} [options.data=null] The message content
         */
        constructor(type, options = {}) {
          super(type);

          this[kData] = options.data === undefined ? null : options.data;
        }

        /**
         * @type {*}
         */
        get data() {
          return this[kData];
        }
      }

      Object.defineProperty(MessageEvent.prototype, 'data', {
        enumerable: true,
      });

      /**
       * This provides methods for emulating the `EventTarget` interface. It's not
       * meant to be used directly.
       *
       * @mixin
       */
      const EventTarget = {
        /**
         * Register an event listener.
         *
         * @param {String} type A string representing the event type to listen for
         * @param {Function} listener The listener to add
         * @param {Object} [options] An options object specifies characteristics about
         *     the event listener
         * @param {Boolean} [options.once=false] A `Boolean` indicating that the
         *     listener should be invoked at most once after being added. If `true`,
         *     the listener would be automatically removed when invoked.
         * @public
         */
        addEventListener(type, listener, options = {}) {
          let wrapper;

          if (type === 'message') {
            wrapper = function onMessage(data, isBinary) {
              const event = new MessageEvent('message', {
                data: isBinary ? data : data.toString(),
              });

              event[kTarget] = this;
              listener.call(this, event);
            };
          } else if (type === 'close') {
            wrapper = function onClose(code, message) {
              const event = new CloseEvent('close', {
                code,
                reason: message.toString(),
                wasClean: this._closeFrameReceived && this._closeFrameSent,
              });

              event[kTarget] = this;
              listener.call(this, event);
            };
          } else if (type === 'error') {
            wrapper = function onError(error) {
              const event = new ErrorEvent('error', {
                error,
                message: error.message,
              });

              event[kTarget] = this;
              listener.call(this, event);
            };
          } else if (type === 'open') {
            wrapper = function onOpen() {
              const event = new Event('open');

              event[kTarget] = this;
              listener.call(this, event);
            };
          } else {
            return;
          }

          wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
          wrapper[kListener] = listener;

          if (options.once) {
            this.once(type, wrapper);
          } else {
            this.on(type, wrapper);
          }
        },

        /**
         * Remove an event listener.
         *
         * @param {String} type A string representing the event type to remove
         * @param {Function} handler The listener to remove
         * @public
         */
        removeEventListener(type, handler) {
          for (const listener of this.listeners(type)) {
            if (
              listener[kListener] === handler &&
              !listener[kForOnEventAttribute]
            ) {
              this.removeListener(type, listener);
              break;
            }
          }
        },
      };

      module.exports = {
        CloseEvent,
        ErrorEvent,
        Event,
        EventTarget,
        MessageEvent,
      };

      /***/
    },

    /***/ 2506: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const { tokenChars } = __nccwpck_require__(1525);

      /**
       * Adds an offer to the map of extension offers or a parameter to the map of
       * parameters.
       *
       * @param {Object} dest The map of extension offers or parameters
       * @param {String} name The extension or parameter name
       * @param {(Object|Boolean|String)} elem The extension parameters or the
       *     parameter value
       * @private
       */
      function push(dest, name, elem) {
        if (dest[name] === undefined) dest[name] = [elem];
        else dest[name].push(elem);
      }

      /**
       * Parses the `Sec-WebSocket-Extensions` header into an object.
       *
       * @param {String} header The field value of the header
       * @return {Object} The parsed object
       * @public
       */
      function parse(header) {
        const offers = Object.create(null);
        let params = Object.create(null);
        let mustUnescape = false;
        let isEscaping = false;
        let inQuotes = false;
        let extensionName;
        let paramName;
        let start = -1;
        let code = -1;
        let end = -1;
        let i = 0;

        for (; i < header.length; i++) {
          code = header.charCodeAt(i);

          if (extensionName === undefined) {
            if (end === -1 && tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (
              i !== 0 &&
              (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
            ) {
              if (end === -1 && start !== -1) end = i;
            } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
              if (start === -1) {
                throw new SyntaxError(`Unexpected character at index ${i}`);
              }

              if (end === -1) end = i;
              const name = header.slice(start, end);
              if (code === 0x2c) {
                push(offers, name, params);
                params = Object.create(null);
              } else {
                extensionName = name;
              }

              start = end = -1;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (paramName === undefined) {
            if (end === -1 && tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 0x20 || code === 0x09) {
              if (end === -1 && start !== -1) end = i;
            } else if (code === 0x3b || code === 0x2c) {
              if (start === -1) {
                throw new SyntaxError(`Unexpected character at index ${i}`);
              }

              if (end === -1) end = i;
              push(params, header.slice(start, end), true);
              if (code === 0x2c) {
                push(offers, extensionName, params);
                params = Object.create(null);
                extensionName = undefined;
              }

              start = end = -1;
            } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
              paramName = header.slice(start, i);
              start = end = -1;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else {
            //
            // The value of a quoted-string after unescaping must conform to the
            // token ABNF, so only token characters are valid.
            // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
            //
            if (isEscaping) {
              if (tokenChars[code] !== 1) {
                throw new SyntaxError(`Unexpected character at index ${i}`);
              }
              if (start === -1) start = i;
              else if (!mustUnescape) mustUnescape = true;
              isEscaping = false;
            } else if (inQuotes) {
              if (tokenChars[code] === 1) {
                if (start === -1) start = i;
              } else if (code === 0x22 /* '"' */ && start !== -1) {
                inQuotes = false;
                end = i;
              } else if (code === 0x5c /* '\' */) {
                isEscaping = true;
              } else {
                throw new SyntaxError(`Unexpected character at index ${i}`);
              }
            } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
              inQuotes = true;
            } else if (end === -1 && tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
              if (end === -1) end = i;
            } else if (code === 0x3b || code === 0x2c) {
              if (start === -1) {
                throw new SyntaxError(`Unexpected character at index ${i}`);
              }

              if (end === -1) end = i;
              let value = header.slice(start, end);
              if (mustUnescape) {
                value = value.replace(/\\/g, '');
                mustUnescape = false;
              }
              push(params, paramName, value);
              if (code === 0x2c) {
                push(offers, extensionName, params);
                params = Object.create(null);
                extensionName = undefined;
              }

              paramName = undefined;
              start = end = -1;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          }
        }

        if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
          throw new SyntaxError('Unexpected end of input');
        }

        if (end === -1) end = i;
        const token = header.slice(start, end);
        if (extensionName === undefined) {
          push(offers, token, params);
        } else {
          if (paramName === undefined) {
            push(params, token, true);
          } else if (mustUnescape) {
            push(params, paramName, token.replace(/\\/g, ''));
          } else {
            push(params, paramName, token);
          }
          push(offers, extensionName, params);
        }

        return offers;
      }

      /**
       * Builds the `Sec-WebSocket-Extensions` header field value.
       *
       * @param {Object} extensions The map of extensions and parameters to format
       * @return {String} A string representing the given object
       * @public
       */
      function format(extensions) {
        return Object.keys(extensions)
          .map((extension) => {
            let configurations = extensions[extension];
            if (!Array.isArray(configurations))
              configurations = [configurations];
            return configurations
              .map((params) => {
                return [extension]
                  .concat(
                    Object.keys(params).map((k) => {
                      let values = params[k];
                      if (!Array.isArray(values)) values = [values];
                      return values
                        .map((v) => (v === true ? k : `${k}=${v}`))
                        .join('; ');
                    }),
                  )
                  .join('; ');
              })
              .join(', ');
          })
          .join(', ');
      }

      module.exports = { format, parse };

      /***/
    },

    /***/ 9086: /***/ (module) => {
      'use strict';

      const kDone = Symbol('kDone');
      const kRun = Symbol('kRun');

      /**
       * A very simple job queue with adjustable concurrency. Adapted from
       * https://github.com/STRML/async-limiter
       */
      class Limiter {
        /**
         * Creates a new `Limiter`.
         *
         * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
         *     to run concurrently
         */
        constructor(concurrency) {
          this[kDone] = () => {
            this.pending--;
            this[kRun]();
          };
          this.concurrency = concurrency || Infinity;
          this.jobs = [];
          this.pending = 0;
        }

        /**
         * Adds a job to the queue.
         *
         * @param {Function} job The job to run
         * @public
         */
        add(job) {
          this.jobs.push(job);
          this[kRun]();
        }

        /**
         * Removes a job from the queue and runs it if possible.
         *
         * @private
         */
        [kRun]() {
          if (this.pending === this.concurrency) return;

          if (this.jobs.length) {
            const job = this.jobs.shift();

            this.pending++;
            job(this[kDone]);
          }
        }
      }

      module.exports = Limiter;

      /***/
    },

    /***/ 8192: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const zlib = __nccwpck_require__(8761);

      const bufferUtil = __nccwpck_require__(8537);
      const Limiter = __nccwpck_require__(9086);
      const { kStatusCode } = __nccwpck_require__(8868);

      const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
      const kPerMessageDeflate = Symbol('permessage-deflate');
      const kTotalLength = Symbol('total-length');
      const kCallback = Symbol('callback');
      const kBuffers = Symbol('buffers');
      const kError = Symbol('error');

      //
      // We limit zlib concurrency, which prevents severe memory fragmentation
      // as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
      // and https://github.com/websockets/ws/issues/1202
      //
      // Intentionally global; it's the global thread pool that's an issue.
      //
      let zlibLimiter;

      /**
       * permessage-deflate implementation.
       */
      class PerMessageDeflate {
        /**
         * Creates a PerMessageDeflate instance.
         *
         * @param {Object} [options] Configuration options
         * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
         *     for, or request, a custom client window size
         * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
         *     acknowledge disabling of client context takeover
         * @param {Number} [options.concurrencyLimit=10] The number of concurrent
         *     calls to zlib
         * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
         *     use of a custom server window size
         * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
         *     disabling of server context takeover
         * @param {Number} [options.threshold=1024] Size (in bytes) below which
         *     messages should not be compressed if context takeover is disabled
         * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
         *     deflate
         * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
         *     inflate
         * @param {Boolean} [isServer=false] Create the instance in either server or
         *     client mode
         * @param {Number} [maxPayload=0] The maximum allowed message length
         */
        constructor(options, isServer, maxPayload) {
          this._maxPayload = maxPayload | 0;
          this._options = options || {};
          this._threshold =
            this._options.threshold !== undefined
              ? this._options.threshold
              : 1024;
          this._isServer = !!isServer;
          this._deflate = null;
          this._inflate = null;

          this.params = null;

          if (!zlibLimiter) {
            const concurrency =
              this._options.concurrencyLimit !== undefined
                ? this._options.concurrencyLimit
                : 10;
            zlibLimiter = new Limiter(concurrency);
          }
        }

        /**
         * @type {String}
         */
        static get extensionName() {
          return 'permessage-deflate';
        }

        /**
         * Create an extension negotiation offer.
         *
         * @return {Object} Extension parameters
         * @public
         */
        offer() {
          const params = {};

          if (this._options.serverNoContextTakeover) {
            params.server_no_context_takeover = true;
          }
          if (this._options.clientNoContextTakeover) {
            params.client_no_context_takeover = true;
          }
          if (this._options.serverMaxWindowBits) {
            params.server_max_window_bits = this._options.serverMaxWindowBits;
          }
          if (this._options.clientMaxWindowBits) {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          } else if (this._options.clientMaxWindowBits == null) {
            params.client_max_window_bits = true;
          }

          return params;
        }

        /**
         * Accept an extension negotiation offer/response.
         *
         * @param {Array} configurations The extension negotiation offers/reponse
         * @return {Object} Accepted configuration
         * @public
         */
        accept(configurations) {
          configurations = this.normalizeParams(configurations);

          this.params = this._isServer
            ? this.acceptAsServer(configurations)
            : this.acceptAsClient(configurations);

          return this.params;
        }

        /**
         * Releases all resources used by the extension.
         *
         * @public
         */
        cleanup() {
          if (this._inflate) {
            this._inflate.close();
            this._inflate = null;
          }

          if (this._deflate) {
            const callback = this._deflate[kCallback];

            this._deflate.close();
            this._deflate = null;

            if (callback) {
              callback(
                new Error(
                  'The deflate stream was closed while data was being processed',
                ),
              );
            }
          }
        }

        /**
         *  Accept an extension negotiation offer.
         *
         * @param {Array} offers The extension negotiation offers
         * @return {Object} Accepted configuration
         * @private
         */
        acceptAsServer(offers) {
          const opts = this._options;
          const accepted = offers.find((params) => {
            if (
              (opts.serverNoContextTakeover === false &&
                params.server_no_context_takeover) ||
              (params.server_max_window_bits &&
                (opts.serverMaxWindowBits === false ||
                  (typeof opts.serverMaxWindowBits === 'number' &&
                    opts.serverMaxWindowBits >
                      params.server_max_window_bits))) ||
              (typeof opts.clientMaxWindowBits === 'number' &&
                !params.client_max_window_bits)
            ) {
              return false;
            }

            return true;
          });

          if (!accepted) {
            throw new Error('None of the extension offers can be accepted');
          }

          if (opts.serverNoContextTakeover) {
            accepted.server_no_context_takeover = true;
          }
          if (opts.clientNoContextTakeover) {
            accepted.client_no_context_takeover = true;
          }
          if (typeof opts.serverMaxWindowBits === 'number') {
            accepted.server_max_window_bits = opts.serverMaxWindowBits;
          }
          if (typeof opts.clientMaxWindowBits === 'number') {
            accepted.client_max_window_bits = opts.clientMaxWindowBits;
          } else if (
            accepted.client_max_window_bits === true ||
            opts.clientMaxWindowBits === false
          ) {
            delete accepted.client_max_window_bits;
          }

          return accepted;
        }

        /**
         * Accept the extension negotiation response.
         *
         * @param {Array} response The extension negotiation response
         * @return {Object} Accepted configuration
         * @private
         */
        acceptAsClient(response) {
          const params = response[0];

          if (
            this._options.clientNoContextTakeover === false &&
            params.client_no_context_takeover
          ) {
            throw new Error(
              'Unexpected parameter "client_no_context_takeover"',
            );
          }

          if (!params.client_max_window_bits) {
            if (typeof this._options.clientMaxWindowBits === 'number') {
              params.client_max_window_bits = this._options.clientMaxWindowBits;
            }
          } else if (
            this._options.clientMaxWindowBits === false ||
            (typeof this._options.clientMaxWindowBits === 'number' &&
              params.client_max_window_bits > this._options.clientMaxWindowBits)
          ) {
            throw new Error(
              'Unexpected or invalid parameter "client_max_window_bits"',
            );
          }

          return params;
        }

        /**
         * Normalize parameters.
         *
         * @param {Array} configurations The extension negotiation offers/reponse
         * @return {Array} The offers/response with normalized parameters
         * @private
         */
        normalizeParams(configurations) {
          configurations.forEach((params) => {
            Object.keys(params).forEach((key) => {
              let value = params[key];

              if (value.length > 1) {
                throw new Error(
                  `Parameter "${key}" must have only a single value`,
                );
              }

              value = value[0];

              if (key === 'client_max_window_bits') {
                if (value !== true) {
                  const num = +value;
                  if (!Number.isInteger(num) || num < 8 || num > 15) {
                    throw new TypeError(
                      `Invalid value for parameter "${key}": ${value}`,
                    );
                  }
                  value = num;
                } else if (!this._isServer) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`,
                  );
                }
              } else if (key === 'server_max_window_bits') {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`,
                  );
                }
                value = num;
              } else if (
                key === 'client_no_context_takeover' ||
                key === 'server_no_context_takeover'
              ) {
                if (value !== true) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`,
                  );
                }
              } else {
                throw new Error(`Unknown parameter "${key}"`);
              }

              params[key] = value;
            });
          });

          return configurations;
        }

        /**
         * Decompress data. Concurrency limited.
         *
         * @param {Buffer} data Compressed data
         * @param {Boolean} fin Specifies whether or not this is the last fragment
         * @param {Function} callback Callback
         * @public
         */
        decompress(data, fin, callback) {
          zlibLimiter.add((done) => {
            this._decompress(data, fin, (err, result) => {
              done();
              callback(err, result);
            });
          });
        }

        /**
         * Compress data. Concurrency limited.
         *
         * @param {Buffer} data Data to compress
         * @param {Boolean} fin Specifies whether or not this is the last fragment
         * @param {Function} callback Callback
         * @public
         */
        compress(data, fin, callback) {
          zlibLimiter.add((done) => {
            this._compress(data, fin, (err, result) => {
              done();
              callback(err, result);
            });
          });
        }

        /**
         * Decompress data.
         *
         * @param {Buffer} data Compressed data
         * @param {Boolean} fin Specifies whether or not this is the last fragment
         * @param {Function} callback Callback
         * @private
         */
        _decompress(data, fin, callback) {
          const endpoint = this._isServer ? 'client' : 'server';

          if (!this._inflate) {
            const key = `${endpoint}_max_window_bits`;
            const windowBits =
              typeof this.params[key] !== 'number'
                ? zlib.Z_DEFAULT_WINDOWBITS
                : this.params[key];

            this._inflate = zlib.createInflateRaw({
              ...this._options.zlibInflateOptions,
              windowBits,
            });
            this._inflate[kPerMessageDeflate] = this;
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            this._inflate.on('error', inflateOnError);
            this._inflate.on('data', inflateOnData);
          }

          this._inflate[kCallback] = callback;

          this._inflate.write(data);
          if (fin) this._inflate.write(TRAILER);

          this._inflate.flush(() => {
            const err = this._inflate[kError];

            if (err) {
              this._inflate.close();
              this._inflate = null;
              callback(err);
              return;
            }

            const data = bufferUtil.concat(
              this._inflate[kBuffers],
              this._inflate[kTotalLength],
            );

            if (this._inflate._readableState.endEmitted) {
              this._inflate.close();
              this._inflate = null;
            } else {
              this._inflate[kTotalLength] = 0;
              this._inflate[kBuffers] = [];

              if (fin && this.params[`${endpoint}_no_context_takeover`]) {
                this._inflate.reset();
              }
            }

            callback(null, data);
          });
        }

        /**
         * Compress data.
         *
         * @param {Buffer} data Data to compress
         * @param {Boolean} fin Specifies whether or not this is the last fragment
         * @param {Function} callback Callback
         * @private
         */
        _compress(data, fin, callback) {
          const endpoint = this._isServer ? 'server' : 'client';

          if (!this._deflate) {
            const key = `${endpoint}_max_window_bits`;
            const windowBits =
              typeof this.params[key] !== 'number'
                ? zlib.Z_DEFAULT_WINDOWBITS
                : this.params[key];

            this._deflate = zlib.createDeflateRaw({
              ...this._options.zlibDeflateOptions,
              windowBits,
            });

            this._deflate[kTotalLength] = 0;
            this._deflate[kBuffers] = [];

            this._deflate.on('data', deflateOnData);
          }

          this._deflate[kCallback] = callback;

          this._deflate.write(data);
          this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
            if (!this._deflate) {
              //
              // The deflate stream was closed while data was being processed.
              //
              return;
            }

            let data = bufferUtil.concat(
              this._deflate[kBuffers],
              this._deflate[kTotalLength],
            );

            if (fin) data = data.slice(0, data.length - 4);

            //
            // Ensure that the callback will not be called again in
            // `PerMessageDeflate#cleanup()`.
            //
            this._deflate[kCallback] = null;

            this._deflate[kTotalLength] = 0;
            this._deflate[kBuffers] = [];

            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._deflate.reset();
            }

            callback(null, data);
          });
        }
      }

      module.exports = PerMessageDeflate;

      /**
       * The listener of the `zlib.DeflateRaw` stream `'data'` event.
       *
       * @param {Buffer} chunk A chunk of data
       * @private
       */
      function deflateOnData(chunk) {
        this[kBuffers].push(chunk);
        this[kTotalLength] += chunk.length;
      }

      /**
       * The listener of the `zlib.InflateRaw` stream `'data'` event.
       *
       * @param {Buffer} chunk A chunk of data
       * @private
       */
      function inflateOnData(chunk) {
        this[kTotalLength] += chunk.length;

        if (
          this[kPerMessageDeflate]._maxPayload < 1 ||
          this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
        ) {
          this[kBuffers].push(chunk);
          return;
        }

        this[kError] = new RangeError('Max payload size exceeded');
        this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
        this[kError][kStatusCode] = 1009;
        this.removeListener('data', inflateOnData);
        this.reset();
      }

      /**
       * The listener of the `zlib.InflateRaw` stream `'error'` event.
       *
       * @param {Error} err The emitted error
       * @private
       */
      function inflateOnError(err) {
        //
        // There is no need to call `Zlib#close()` as the handle is automatically
        // closed when an error is emitted.
        //
        this[kPerMessageDeflate]._inflate = null;
        err[kStatusCode] = 1007;
        this[kCallback](err);
      }

      /***/
    },

    /***/ 8988: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const { Writable } = __nccwpck_require__(2413);

      const PerMessageDeflate = __nccwpck_require__(8192);
      const { BINARY_TYPES, EMPTY_BUFFER, kStatusCode, kWebSocket } =
        __nccwpck_require__(8868);
      const { concat, toArrayBuffer, unmask } = __nccwpck_require__(8537);
      const { isValidStatusCode, isValidUTF8 } = __nccwpck_require__(1525);

      const GET_INFO = 0;
      const GET_PAYLOAD_LENGTH_16 = 1;
      const GET_PAYLOAD_LENGTH_64 = 2;
      const GET_MASK = 3;
      const GET_DATA = 4;
      const INFLATING = 5;

      /**
       * HyBi Receiver implementation.
       *
       * @extends Writable
       */
      class Receiver extends Writable {
        /**
         * Creates a Receiver instance.
         *
         * @param {Object} [options] Options object
         * @param {String} [options.binaryType=nodebuffer] The type for binary data
         * @param {Object} [options.extensions] An object containing the negotiated
         *     extensions
         * @param {Boolean} [options.isServer=false] Specifies whether to operate in
         *     client or server mode
         * @param {Number} [options.maxPayload=0] The maximum allowed message length
         * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
         *     not to skip UTF-8 validation for text and close messages
         */
        constructor(options = {}) {
          super();

          this._binaryType = options.binaryType || BINARY_TYPES[0];
          this._extensions = options.extensions || {};
          this._isServer = !!options.isServer;
          this._maxPayload = options.maxPayload | 0;
          this._skipUTF8Validation = !!options.skipUTF8Validation;
          this[kWebSocket] = undefined;

          this._bufferedBytes = 0;
          this._buffers = [];

          this._compressed = false;
          this._payloadLength = 0;
          this._mask = undefined;
          this._fragmented = 0;
          this._masked = false;
          this._fin = false;
          this._opcode = 0;

          this._totalPayloadLength = 0;
          this._messageLength = 0;
          this._fragments = [];

          this._state = GET_INFO;
          this._loop = false;
        }

        /**
         * Implements `Writable.prototype._write()`.
         *
         * @param {Buffer} chunk The chunk of data to write
         * @param {String} encoding The character encoding of `chunk`
         * @param {Function} cb Callback
         * @private
         */
        _write(chunk, encoding, cb) {
          if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

          this._bufferedBytes += chunk.length;
          this._buffers.push(chunk);
          this.startLoop(cb);
        }

        /**
         * Consumes `n` bytes from the buffered data.
         *
         * @param {Number} n The number of bytes to consume
         * @return {Buffer} The consumed bytes
         * @private
         */
        consume(n) {
          this._bufferedBytes -= n;

          if (n === this._buffers[0].length) return this._buffers.shift();

          if (n < this._buffers[0].length) {
            const buf = this._buffers[0];
            this._buffers[0] = buf.slice(n);
            return buf.slice(0, n);
          }

          const dst = Buffer.allocUnsafe(n);

          do {
            const buf = this._buffers[0];
            const offset = dst.length - n;

            if (n >= buf.length) {
              dst.set(this._buffers.shift(), offset);
            } else {
              dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
              this._buffers[0] = buf.slice(n);
            }

            n -= buf.length;
          } while (n > 0);

          return dst;
        }

        /**
         * Starts the parsing loop.
         *
         * @param {Function} cb Callback
         * @private
         */
        startLoop(cb) {
          let err;
          this._loop = true;

          do {
            switch (this._state) {
              case GET_INFO:
                err = this.getInfo();
                break;
              case GET_PAYLOAD_LENGTH_16:
                err = this.getPayloadLength16();
                break;
              case GET_PAYLOAD_LENGTH_64:
                err = this.getPayloadLength64();
                break;
              case GET_MASK:
                this.getMask();
                break;
              case GET_DATA:
                err = this.getData(cb);
                break;
              default:
                // `INFLATING`
                this._loop = false;
                return;
            }
          } while (this._loop);

          cb(err);
        }

        /**
         * Reads the first two bytes of a frame.
         *
         * @return {(RangeError|undefined)} A possible error
         * @private
         */
        getInfo() {
          if (this._bufferedBytes < 2) {
            this._loop = false;
            return;
          }

          const buf = this.consume(2);

          if ((buf[0] & 0x30) !== 0x00) {
            this._loop = false;
            return error(
              RangeError,
              'RSV2 and RSV3 must be clear',
              true,
              1002,
              'WS_ERR_UNEXPECTED_RSV_2_3',
            );
          }

          const compressed = (buf[0] & 0x40) === 0x40;

          if (
            compressed &&
            !this._extensions[PerMessageDeflate.extensionName]
          ) {
            this._loop = false;
            return error(
              RangeError,
              'RSV1 must be clear',
              true,
              1002,
              'WS_ERR_UNEXPECTED_RSV_1',
            );
          }

          this._fin = (buf[0] & 0x80) === 0x80;
          this._opcode = buf[0] & 0x0f;
          this._payloadLength = buf[1] & 0x7f;

          if (this._opcode === 0x00) {
            if (compressed) {
              this._loop = false;
              return error(
                RangeError,
                'RSV1 must be clear',
                true,
                1002,
                'WS_ERR_UNEXPECTED_RSV_1',
              );
            }

            if (!this._fragmented) {
              this._loop = false;
              return error(
                RangeError,
                'invalid opcode 0',
                true,
                1002,
                'WS_ERR_INVALID_OPCODE',
              );
            }

            this._opcode = this._fragmented;
          } else if (this._opcode === 0x01 || this._opcode === 0x02) {
            if (this._fragmented) {
              this._loop = false;
              return error(
                RangeError,
                `invalid opcode ${this._opcode}`,
                true,
                1002,
                'WS_ERR_INVALID_OPCODE',
              );
            }

            this._compressed = compressed;
          } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
            if (!this._fin) {
              this._loop = false;
              return error(
                RangeError,
                'FIN must be set',
                true,
                1002,
                'WS_ERR_EXPECTED_FIN',
              );
            }

            if (compressed) {
              this._loop = false;
              return error(
                RangeError,
                'RSV1 must be clear',
                true,
                1002,
                'WS_ERR_UNEXPECTED_RSV_1',
              );
            }

            if (this._payloadLength > 0x7d) {
              this._loop = false;
              return error(
                RangeError,
                `invalid payload length ${this._payloadLength}`,
                true,
                1002,
                'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH',
              );
            }
          } else {
            this._loop = false;
            return error(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              'WS_ERR_INVALID_OPCODE',
            );
          }

          if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
          this._masked = (buf[1] & 0x80) === 0x80;

          if (this._isServer) {
            if (!this._masked) {
              this._loop = false;
              return error(
                RangeError,
                'MASK must be set',
                true,
                1002,
                'WS_ERR_EXPECTED_MASK',
              );
            }
          } else if (this._masked) {
            this._loop = false;
            return error(
              RangeError,
              'MASK must be clear',
              true,
              1002,
              'WS_ERR_UNEXPECTED_MASK',
            );
          }

          if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
          else if (this._payloadLength === 127)
            this._state = GET_PAYLOAD_LENGTH_64;
          else return this.haveLength();
        }

        /**
         * Gets extended payload length (7+16).
         *
         * @return {(RangeError|undefined)} A possible error
         * @private
         */
        getPayloadLength16() {
          if (this._bufferedBytes < 2) {
            this._loop = false;
            return;
          }

          this._payloadLength = this.consume(2).readUInt16BE(0);
          return this.haveLength();
        }

        /**
         * Gets extended payload length (7+64).
         *
         * @return {(RangeError|undefined)} A possible error
         * @private
         */
        getPayloadLength64() {
          if (this._bufferedBytes < 8) {
            this._loop = false;
            return;
          }

          const buf = this.consume(8);
          const num = buf.readUInt32BE(0);

          //
          // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
          // if payload length is greater than this number.
          //
          if (num > Math.pow(2, 53 - 32) - 1) {
            this._loop = false;
            return error(
              RangeError,
              'Unsupported WebSocket frame: payload length > 2^53 - 1',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH',
            );
          }

          this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
          return this.haveLength();
        }

        /**
         * Payload length has been read.
         *
         * @return {(RangeError|undefined)} A possible error
         * @private
         */
        haveLength() {
          if (this._payloadLength && this._opcode < 0x08) {
            this._totalPayloadLength += this._payloadLength;
            if (
              this._totalPayloadLength > this._maxPayload &&
              this._maxPayload > 0
            ) {
              this._loop = false;
              return error(
                RangeError,
                'Max payload size exceeded',
                false,
                1009,
                'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
              );
            }
          }

          if (this._masked) this._state = GET_MASK;
          else this._state = GET_DATA;
        }

        /**
         * Reads mask bytes.
         *
         * @private
         */
        getMask() {
          if (this._bufferedBytes < 4) {
            this._loop = false;
            return;
          }

          this._mask = this.consume(4);
          this._state = GET_DATA;
        }

        /**
         * Reads data bytes.
         *
         * @param {Function} cb Callback
         * @return {(Error|RangeError|undefined)} A possible error
         * @private
         */
        getData(cb) {
          let data = EMPTY_BUFFER;

          if (this._payloadLength) {
            if (this._bufferedBytes < this._payloadLength) {
              this._loop = false;
              return;
            }

            data = this.consume(this._payloadLength);
            if (this._masked) unmask(data, this._mask);
          }

          if (this._opcode > 0x07) return this.controlMessage(data);

          if (this._compressed) {
            this._state = INFLATING;
            this.decompress(data, cb);
            return;
          }

          if (data.length) {
            //
            // This message is not compressed so its length is the sum of the payload
            // length of all fragments.
            //
            this._messageLength = this._totalPayloadLength;
            this._fragments.push(data);
          }

          return this.dataMessage();
        }

        /**
         * Decompresses data.
         *
         * @param {Buffer} data Compressed data
         * @param {Function} cb Callback
         * @private
         */
        decompress(data, cb) {
          const perMessageDeflate =
            this._extensions[PerMessageDeflate.extensionName];

          perMessageDeflate.decompress(data, this._fin, (err, buf) => {
            if (err) return cb(err);

            if (buf.length) {
              this._messageLength += buf.length;
              if (
                this._messageLength > this._maxPayload &&
                this._maxPayload > 0
              ) {
                return cb(
                  error(
                    RangeError,
                    'Max payload size exceeded',
                    false,
                    1009,
                    'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH',
                  ),
                );
              }

              this._fragments.push(buf);
            }

            const er = this.dataMessage();
            if (er) return cb(er);

            this.startLoop(cb);
          });
        }

        /**
         * Handles a data message.
         *
         * @return {(Error|undefined)} A possible error
         * @private
         */
        dataMessage() {
          if (this._fin) {
            const messageLength = this._messageLength;
            const fragments = this._fragments;

            this._totalPayloadLength = 0;
            this._messageLength = 0;
            this._fragmented = 0;
            this._fragments = [];

            if (this._opcode === 2) {
              let data;

              if (this._binaryType === 'nodebuffer') {
                data = concat(fragments, messageLength);
              } else if (this._binaryType === 'arraybuffer') {
                data = toArrayBuffer(concat(fragments, messageLength));
              } else {
                data = fragments;
              }

              this.emit('message', data, true);
            } else {
              const buf = concat(fragments, messageLength);

              if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
                this._loop = false;
                return error(
                  Error,
                  'invalid UTF-8 sequence',
                  true,
                  1007,
                  'WS_ERR_INVALID_UTF8',
                );
              }

              this.emit('message', buf, false);
            }
          }

          this._state = GET_INFO;
        }

        /**
         * Handles a control message.
         *
         * @param {Buffer} data Data to handle
         * @return {(Error|RangeError|undefined)} A possible error
         * @private
         */
        controlMessage(data) {
          if (this._opcode === 0x08) {
            this._loop = false;

            if (data.length === 0) {
              this.emit('conclude', 1005, EMPTY_BUFFER);
              this.end();
            } else if (data.length === 1) {
              return error(
                RangeError,
                'invalid payload length 1',
                true,
                1002,
                'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH',
              );
            } else {
              const code = data.readUInt16BE(0);

              if (!isValidStatusCode(code)) {
                return error(
                  RangeError,
                  `invalid status code ${code}`,
                  true,
                  1002,
                  'WS_ERR_INVALID_CLOSE_CODE',
                );
              }

              const buf = data.slice(2);

              if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
                return error(
                  Error,
                  'invalid UTF-8 sequence',
                  true,
                  1007,
                  'WS_ERR_INVALID_UTF8',
                );
              }

              this.emit('conclude', code, buf);
              this.end();
            }
          } else if (this._opcode === 0x09) {
            this.emit('ping', data);
          } else {
            this.emit('pong', data);
          }

          this._state = GET_INFO;
        }
      }

      module.exports = Receiver;

      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      function error(ErrorCtor, message, prefix, statusCode, errorCode) {
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message,
        );

        Error.captureStackTrace(err, error);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }

      /***/
    },

    /***/ 1159: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls$" }] */

      const net = __nccwpck_require__(1631);
      const tls = __nccwpck_require__(4016);
      const { randomFillSync } = __nccwpck_require__(6417);

      const PerMessageDeflate = __nccwpck_require__(8192);
      const { EMPTY_BUFFER } = __nccwpck_require__(8868);
      const { isValidStatusCode } = __nccwpck_require__(1525);
      const { mask: applyMask, toBuffer } = __nccwpck_require__(8537);

      const mask = Buffer.alloc(4);

      /**
       * HyBi Sender implementation.
       */
      class Sender {
        /**
         * Creates a Sender instance.
         *
         * @param {(net.Socket|tls.Socket)} socket The connection socket
         * @param {Object} [extensions] An object containing the negotiated extensions
         */
        constructor(socket, extensions) {
          this._extensions = extensions || {};
          this._socket = socket;

          this._firstFragment = true;
          this._compress = false;

          this._bufferedBytes = 0;
          this._deflating = false;
          this._queue = [];
        }

        /**
         * Frames a piece of data according to the HyBi WebSocket protocol.
         *
         * @param {Buffer} data The data to frame
         * @param {Object} options Options object
         * @param {Boolean} [options.fin=false] Specifies whether or not to set the
         *     FIN bit
         * @param {Boolean} [options.mask=false] Specifies whether or not to mask
         *     `data`
         * @param {Number} options.opcode The opcode
         * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
         *     modified
         * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
         *     RSV1 bit
         * @return {Buffer[]} The framed data as a list of `Buffer` instances
         * @public
         */
        static frame(data, options) {
          const merge = options.mask && options.readOnly;
          let offset = options.mask ? 6 : 2;
          let payloadLength = data.length;

          if (data.length >= 65536) {
            offset += 8;
            payloadLength = 127;
          } else if (data.length > 125) {
            offset += 2;
            payloadLength = 126;
          }

          const target = Buffer.allocUnsafe(
            merge ? data.length + offset : offset,
          );

          target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
          if (options.rsv1) target[0] |= 0x40;

          target[1] = payloadLength;

          if (payloadLength === 126) {
            target.writeUInt16BE(data.length, 2);
          } else if (payloadLength === 127) {
            target.writeUInt32BE(0, 2);
            target.writeUInt32BE(data.length, 6);
          }

          if (!options.mask) return [target, data];

          randomFillSync(mask, 0, 4);

          target[1] |= 0x80;
          target[offset - 4] = mask[0];
          target[offset - 3] = mask[1];
          target[offset - 2] = mask[2];
          target[offset - 1] = mask[3];

          if (merge) {
            applyMask(data, mask, target, offset, data.length);
            return [target];
          }

          applyMask(data, mask, data, 0, data.length);
          return [target, data];
        }

        /**
         * Sends a close message to the other peer.
         *
         * @param {Number} [code] The status code component of the body
         * @param {(String|Buffer)} [data] The message component of the body
         * @param {Boolean} [mask=false] Specifies whether or not to mask the message
         * @param {Function} [cb] Callback
         * @public
         */
        close(code, data, mask, cb) {
          let buf;

          if (code === undefined) {
            buf = EMPTY_BUFFER;
          } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
            throw new TypeError(
              'First argument must be a valid error code number',
            );
          } else if (data === undefined || !data.length) {
            buf = Buffer.allocUnsafe(2);
            buf.writeUInt16BE(code, 0);
          } else {
            const length = Buffer.byteLength(data);

            if (length > 123) {
              throw new RangeError(
                'The message must not be greater than 123 bytes',
              );
            }

            buf = Buffer.allocUnsafe(2 + length);
            buf.writeUInt16BE(code, 0);

            if (typeof data === 'string') {
              buf.write(data, 2);
            } else {
              buf.set(data, 2);
            }
          }

          if (this._deflating) {
            this.enqueue([this.doClose, buf, mask, cb]);
          } else {
            this.doClose(buf, mask, cb);
          }
        }

        /**
         * Frames and sends a close message.
         *
         * @param {Buffer} data The message to send
         * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
         * @param {Function} [cb] Callback
         * @private
         */
        doClose(data, mask, cb) {
          this.sendFrame(
            Sender.frame(data, {
              fin: true,
              rsv1: false,
              opcode: 0x08,
              mask,
              readOnly: false,
            }),
            cb,
          );
        }

        /**
         * Sends a ping message to the other peer.
         *
         * @param {*} data The message to send
         * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
         * @param {Function} [cb] Callback
         * @public
         */
        ping(data, mask, cb) {
          const buf = toBuffer(data);

          if (buf.length > 125) {
            throw new RangeError(
              'The data size must not be greater than 125 bytes',
            );
          }

          if (this._deflating) {
            this.enqueue([this.doPing, buf, mask, toBuffer.readOnly, cb]);
          } else {
            this.doPing(buf, mask, toBuffer.readOnly, cb);
          }
        }

        /**
         * Frames and sends a ping message.
         *
         * @param {Buffer} data The message to send
         * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
         * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
         * @param {Function} [cb] Callback
         * @private
         */
        doPing(data, mask, readOnly, cb) {
          this.sendFrame(
            Sender.frame(data, {
              fin: true,
              rsv1: false,
              opcode: 0x09,
              mask,
              readOnly,
            }),
            cb,
          );
        }

        /**
         * Sends a pong message to the other peer.
         *
         * @param {*} data The message to send
         * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
         * @param {Function} [cb] Callback
         * @public
         */
        pong(data, mask, cb) {
          const buf = toBuffer(data);

          if (buf.length > 125) {
            throw new RangeError(
              'The data size must not be greater than 125 bytes',
            );
          }

          if (this._deflating) {
            this.enqueue([this.doPong, buf, mask, toBuffer.readOnly, cb]);
          } else {
            this.doPong(buf, mask, toBuffer.readOnly, cb);
          }
        }

        /**
         * Frames and sends a pong message.
         *
         * @param {Buffer} data The message to send
         * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
         * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
         * @param {Function} [cb] Callback
         * @private
         */
        doPong(data, mask, readOnly, cb) {
          this.sendFrame(
            Sender.frame(data, {
              fin: true,
              rsv1: false,
              opcode: 0x0a,
              mask,
              readOnly,
            }),
            cb,
          );
        }

        /**
         * Sends a data message to the other peer.
         *
         * @param {*} data The message to send
         * @param {Object} options Options object
         * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
         *     or text
         * @param {Boolean} [options.compress=false] Specifies whether or not to
         *     compress `data`
         * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
         *     last one
         * @param {Boolean} [options.mask=false] Specifies whether or not to mask
         *     `data`
         * @param {Function} [cb] Callback
         * @public
         */
        send(data, options, cb) {
          const buf = toBuffer(data);
          const perMessageDeflate =
            this._extensions[PerMessageDeflate.extensionName];
          let opcode = options.binary ? 2 : 1;
          let rsv1 = options.compress;

          if (this._firstFragment) {
            this._firstFragment = false;
            if (
              rsv1 &&
              perMessageDeflate &&
              perMessageDeflate.params[
                perMessageDeflate._isServer
                  ? 'server_no_context_takeover'
                  : 'client_no_context_takeover'
              ]
            ) {
              rsv1 = buf.length >= perMessageDeflate._threshold;
            }
            this._compress = rsv1;
          } else {
            rsv1 = false;
            opcode = 0;
          }

          if (options.fin) this._firstFragment = true;

          if (perMessageDeflate) {
            const opts = {
              fin: options.fin,
              rsv1,
              opcode,
              mask: options.mask,
              readOnly: toBuffer.readOnly,
            };

            if (this._deflating) {
              this.enqueue([this.dispatch, buf, this._compress, opts, cb]);
            } else {
              this.dispatch(buf, this._compress, opts, cb);
            }
          } else {
            this.sendFrame(
              Sender.frame(buf, {
                fin: options.fin,
                rsv1: false,
                opcode,
                mask: options.mask,
                readOnly: toBuffer.readOnly,
              }),
              cb,
            );
          }
        }

        /**
         * Dispatches a data message.
         *
         * @param {Buffer} data The message to send
         * @param {Boolean} [compress=false] Specifies whether or not to compress
         *     `data`
         * @param {Object} options Options object
         * @param {Number} options.opcode The opcode
         * @param {Boolean} [options.fin=false] Specifies whether or not to set the
         *     FIN bit
         * @param {Boolean} [options.mask=false] Specifies whether or not to mask
         *     `data`
         * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
         *     modified
         * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
         *     RSV1 bit
         * @param {Function} [cb] Callback
         * @private
         */
        dispatch(data, compress, options, cb) {
          if (!compress) {
            this.sendFrame(Sender.frame(data, options), cb);
            return;
          }

          const perMessageDeflate =
            this._extensions[PerMessageDeflate.extensionName];

          this._bufferedBytes += data.length;
          this._deflating = true;
          perMessageDeflate.compress(data, options.fin, (_, buf) => {
            if (this._socket.destroyed) {
              const err = new Error(
                'The socket was closed while data was being compressed',
              );

              if (typeof cb === 'function') cb(err);

              for (let i = 0; i < this._queue.length; i++) {
                const callback = this._queue[i][4];

                if (typeof callback === 'function') callback(err);
              }

              return;
            }

            this._bufferedBytes -= data.length;
            this._deflating = false;
            options.readOnly = false;
            this.sendFrame(Sender.frame(buf, options), cb);
            this.dequeue();
          });
        }

        /**
         * Executes queued send operations.
         *
         * @private
         */
        dequeue() {
          while (!this._deflating && this._queue.length) {
            const params = this._queue.shift();

            this._bufferedBytes -= params[1].length;
            Reflect.apply(params[0], this, params.slice(1));
          }
        }

        /**
         * Enqueues a send operation.
         *
         * @param {Array} params Send operation parameters.
         * @private
         */
        enqueue(params) {
          this._bufferedBytes += params[1].length;
          this._queue.push(params);
        }

        /**
         * Sends a frame.
         *
         * @param {Buffer[]} list The frame to send
         * @param {Function} [cb] Callback
         * @private
         */
        sendFrame(list, cb) {
          if (list.length === 2) {
            this._socket.cork();
            this._socket.write(list[0]);
            this._socket.write(list[1], cb);
            this._socket.uncork();
          } else {
            this._socket.write(list[0], cb);
          }
        }
      }

      module.exports = Sender;

      /***/
    },

    /***/ 8351: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const { Duplex } = __nccwpck_require__(2413);

      /**
       * Emits the `'close'` event on a stream.
       *
       * @param {Duplex} stream The stream.
       * @private
       */
      function emitClose(stream) {
        stream.emit('close');
      }

      /**
       * The listener of the `'end'` event.
       *
       * @private
       */
      function duplexOnEnd() {
        if (!this.destroyed && this._writableState.finished) {
          this.destroy();
        }
      }

      /**
       * The listener of the `'error'` event.
       *
       * @param {Error} err The error
       * @private
       */
      function duplexOnError(err) {
        this.removeListener('error', duplexOnError);
        this.destroy();
        if (this.listenerCount('error') === 0) {
          // Do not suppress the throwing behavior.
          this.emit('error', err);
        }
      }

      /**
       * Wraps a `WebSocket` in a duplex stream.
       *
       * @param {WebSocket} ws The `WebSocket` to wrap
       * @param {Object} [options] The options for the `Duplex` constructor
       * @return {Duplex} The duplex stream
       * @public
       */
      function createWebSocketStream(ws, options) {
        let resumeOnReceiverDrain = true;
        let terminateOnDestroy = true;

        function receiverOnDrain() {
          if (resumeOnReceiverDrain) ws._socket.resume();
        }

        if (ws.readyState === ws.CONNECTING) {
          ws.once('open', function open() {
            ws._receiver.removeAllListeners('drain');
            ws._receiver.on('drain', receiverOnDrain);
          });
        } else {
          ws._receiver.removeAllListeners('drain');
          ws._receiver.on('drain', receiverOnDrain);
        }

        const duplex = new Duplex({
          ...options,
          autoDestroy: false,
          emitClose: false,
          objectMode: false,
          writableObjectMode: false,
        });

        ws.on('message', function message(msg, isBinary) {
          const data =
            !isBinary && duplex._readableState.objectMode
              ? msg.toString()
              : msg;

          if (!duplex.push(data)) {
            resumeOnReceiverDrain = false;
            ws._socket.pause();
          }
        });

        ws.once('error', function error(err) {
          if (duplex.destroyed) return;

          // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
          //
          // - If the `'error'` event is emitted before the `'open'` event, then
          //   `ws.terminate()` is a noop as no socket is assigned.
          // - Otherwise, the error is re-emitted by the listener of the `'error'`
          //   event of the `Receiver` object. The listener already closes the
          //   connection by calling `ws.close()`. This allows a close frame to be
          //   sent to the other peer. If `ws.terminate()` is called right after this,
          //   then the close frame might not be sent.
          terminateOnDestroy = false;
          duplex.destroy(err);
        });

        ws.once('close', function close() {
          if (duplex.destroyed) return;

          duplex.push(null);
        });

        duplex._destroy = function (err, callback) {
          if (ws.readyState === ws.CLOSED) {
            callback(err);
            process.nextTick(emitClose, duplex);
            return;
          }

          let called = false;

          ws.once('error', function error(err) {
            called = true;
            callback(err);
          });

          ws.once('close', function close() {
            if (!called) callback(err);
            process.nextTick(emitClose, duplex);
          });

          if (terminateOnDestroy) ws.terminate();
        };

        duplex._final = function (callback) {
          if (ws.readyState === ws.CONNECTING) {
            ws.once('open', function open() {
              duplex._final(callback);
            });
            return;
          }

          // If the value of the `_socket` property is `null` it means that `ws` is a
          // client websocket and the handshake failed. In fact, when this happens, a
          // socket is never assigned to the websocket. Wait for the `'error'` event
          // that will be emitted by the websocket.
          if (ws._socket === null) return;

          if (ws._socket._writableState.finished) {
            callback();
            if (duplex._readableState.endEmitted) duplex.destroy();
          } else {
            ws._socket.once('finish', function finish() {
              // `duplex` is not destroyed here because the `'end'` event will be
              // emitted on `duplex` after this `'finish'` event. The EOF signaling
              // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
              callback();
            });
            ws.close();
          }
        };

        duplex._read = function () {
          if (ws.readyState === ws.OPEN && !resumeOnReceiverDrain) {
            resumeOnReceiverDrain = true;
            if (!ws._receiver._writableState.needDrain) ws._socket.resume();
          }
        };

        duplex._write = function (chunk, encoding, callback) {
          if (ws.readyState === ws.CONNECTING) {
            ws.once('open', function open() {
              duplex._write(chunk, encoding, callback);
            });
            return;
          }

          ws.send(chunk, callback);
        };

        duplex.on('end', duplexOnEnd);
        duplex.on('error', duplexOnError);
        return duplex;
      }

      module.exports = createWebSocketStream;

      /***/
    },

    /***/ 2074: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      const { tokenChars } = __nccwpck_require__(1525);

      /**
       * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
       *
       * @param {String} header The field value of the header
       * @return {Set} The subprotocol names
       * @public
       */
      function parse(header) {
        const protocols = new Set();
        let start = -1;
        let end = -1;
        let i = 0;

        for (i; i < header.length; i++) {
          const code = header.charCodeAt(i);

          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (
            i !== 0 &&
            (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
          ) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 0x2c /* ',' */) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }

            if (end === -1) end = i;

            const protocol = header.slice(start, end);

            if (protocols.has(protocol)) {
              throw new SyntaxError(
                `The "${protocol}" subprotocol is duplicated`,
              );
            }

            protocols.add(protocol);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }

        if (start === -1 || end !== -1) {
          throw new SyntaxError('Unexpected end of input');
        }

        const protocol = header.slice(start, i);

        if (protocols.has(protocol)) {
          throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
        }

        protocols.add(protocol);
        return protocols;
      }

      module.exports = { parse };

      /***/
    },

    /***/ 1525: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';

      //
      // Allowed token characters:
      //
      // '!', '#', '$', '%', '&', ''', '*', '+', '-',
      // '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
      //
      // tokenChars[32] === 0 // ' '
      // tokenChars[33] === 1 // '!'
      // tokenChars[34] === 0 // '"'
      // ...
      //
      // prettier-ignore
      const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

      /**
       * Checks if a status code is allowed in a close frame.
       *
       * @param {Number} code The status code
       * @return {Boolean} `true` if the status code is valid, else `false`
       * @public
       */
      function isValidStatusCode(code) {
        return (
          (code >= 1000 &&
            code <= 1014 &&
            code !== 1004 &&
            code !== 1005 &&
            code !== 1006) ||
          (code >= 3000 && code <= 4999)
        );
      }

      /**
       * Checks if a given buffer contains only correct UTF-8.
       * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
       * Markus Kuhn.
       *
       * @param {Buffer} buf The buffer to check
       * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
       * @public
       */
      function _isValidUTF8(buf) {
        const len = buf.length;
        let i = 0;

        while (i < len) {
          if ((buf[i] & 0x80) === 0) {
            // 0xxxxxxx
            i++;
          } else if ((buf[i] & 0xe0) === 0xc0) {
            // 110xxxxx 10xxxxxx
            if (
              i + 1 === len ||
              (buf[i + 1] & 0xc0) !== 0x80 ||
              (buf[i] & 0xfe) === 0xc0 // Overlong
            ) {
              return false;
            }

            i += 2;
          } else if ((buf[i] & 0xf0) === 0xe0) {
            // 1110xxxx 10xxxxxx 10xxxxxx
            if (
              i + 2 >= len ||
              (buf[i + 1] & 0xc0) !== 0x80 ||
              (buf[i + 2] & 0xc0) !== 0x80 ||
              (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
              (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
            ) {
              return false;
            }

            i += 3;
          } else if ((buf[i] & 0xf8) === 0xf0) {
            // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
            if (
              i + 3 >= len ||
              (buf[i + 1] & 0xc0) !== 0x80 ||
              (buf[i + 2] & 0xc0) !== 0x80 ||
              (buf[i + 3] & 0xc0) !== 0x80 ||
              (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
              (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
              buf[i] > 0xf4 // > U+10FFFF
            ) {
              return false;
            }

            i += 4;
          } else {
            return false;
          }
        }

        return true;
      }

      try {
        const isValidUTF8 = __nccwpck_require__(5013);

        module.exports = {
          isValidStatusCode,
          isValidUTF8(buf) {
            return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
          },
          tokenChars,
        };
      } catch (e) /* istanbul ignore next */ {
        module.exports = {
          isValidStatusCode,
          isValidUTF8: _isValidUTF8,
          tokenChars,
        };
      }

      /***/
    },

    /***/ 2937: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls|https$" }] */

      const EventEmitter = __nccwpck_require__(8614);
      const http = __nccwpck_require__(8605);
      const https = __nccwpck_require__(7211);
      const net = __nccwpck_require__(1631);
      const tls = __nccwpck_require__(4016);
      const { createHash } = __nccwpck_require__(6417);

      const extension = __nccwpck_require__(2506);
      const PerMessageDeflate = __nccwpck_require__(8192);
      const subprotocol = __nccwpck_require__(2074);
      const WebSocket = __nccwpck_require__(2880);
      const { GUID, kWebSocket } = __nccwpck_require__(8868);

      const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

      const RUNNING = 0;
      const CLOSING = 1;
      const CLOSED = 2;

      /**
       * Class representing a WebSocket server.
       *
       * @extends EventEmitter
       */
      class WebSocketServer extends EventEmitter {
        /**
         * Create a `WebSocketServer` instance.
         *
         * @param {Object} options Configuration options
         * @param {Number} [options.backlog=511] The maximum length of the queue of
         *     pending connections
         * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
         *     track clients
         * @param {Function} [options.handleProtocols] A hook to handle protocols
         * @param {String} [options.host] The hostname where to bind the server
         * @param {Number} [options.maxPayload=104857600] The maximum allowed message
         *     size
         * @param {Boolean} [options.noServer=false] Enable no server mode
         * @param {String} [options.path] Accept only connections matching this path
         * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
         *     permessage-deflate
         * @param {Number} [options.port] The port where to bind the server
         * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
         *     server to use
         * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
         *     not to skip UTF-8 validation for text and close messages
         * @param {Function} [options.verifyClient] A hook to reject connections
         * @param {Function} [callback] A listener for the `listening` event
         */
        constructor(options, callback) {
          super();

          options = {
            maxPayload: 100 * 1024 * 1024,
            skipUTF8Validation: false,
            perMessageDeflate: false,
            handleProtocols: null,
            clientTracking: true,
            verifyClient: null,
            noServer: false,
            backlog: null, // use default (511 as implemented in net.js)
            server: null,
            host: null,
            path: null,
            port: null,
            ...options,
          };

          if (
            (options.port == null && !options.server && !options.noServer) ||
            (options.port != null && (options.server || options.noServer)) ||
            (options.server && options.noServer)
          ) {
            throw new TypeError(
              'One and only one of the "port", "server", or "noServer" options ' +
                'must be specified',
            );
          }

          if (options.port != null) {
            this._server = http.createServer((req, res) => {
              const body = http.STATUS_CODES[426];

              res.writeHead(426, {
                'Content-Length': body.length,
                'Content-Type': 'text/plain',
              });
              res.end(body);
            });
            this._server.listen(
              options.port,
              options.host,
              options.backlog,
              callback,
            );
          } else if (options.server) {
            this._server = options.server;
          }

          if (this._server) {
            const emitConnection = this.emit.bind(this, 'connection');

            this._removeListeners = addListeners(this._server, {
              listening: this.emit.bind(this, 'listening'),
              error: this.emit.bind(this, 'error'),
              upgrade: (req, socket, head) => {
                this.handleUpgrade(req, socket, head, emitConnection);
              },
            });
          }

          if (options.perMessageDeflate === true)
            options.perMessageDeflate = {};
          if (options.clientTracking) {
            this.clients = new Set();
            this._shouldEmitClose = false;
          }

          this.options = options;
          this._state = RUNNING;
        }

        /**
         * Returns the bound address, the address family name, and port of the server
         * as reported by the operating system if listening on an IP socket.
         * If the server is listening on a pipe or UNIX domain socket, the name is
         * returned as a string.
         *
         * @return {(Object|String|null)} The address of the server
         * @public
         */
        address() {
          if (this.options.noServer) {
            throw new Error('The server is operating in "noServer" mode');
          }

          if (!this._server) return null;
          return this._server.address();
        }

        /**
         * Stop the server from accepting new connections and emit the `'close'` event
         * when all existing connections are closed.
         *
         * @param {Function} [cb] A one-time listener for the `'close'` event
         * @public
         */
        close(cb) {
          if (this._state === CLOSED) {
            if (cb) {
              this.once('close', () => {
                cb(new Error('The server is not running'));
              });
            }

            process.nextTick(emitClose, this);
            return;
          }

          if (cb) this.once('close', cb);

          if (this._state === CLOSING) return;
          this._state = CLOSING;

          if (this.options.noServer || this.options.server) {
            if (this._server) {
              this._removeListeners();
              this._removeListeners = this._server = null;
            }

            if (this.clients) {
              if (!this.clients.size) {
                process.nextTick(emitClose, this);
              } else {
                this._shouldEmitClose = true;
              }
            } else {
              process.nextTick(emitClose, this);
            }
          } else {
            const server = this._server;

            this._removeListeners();
            this._removeListeners = this._server = null;

            //
            // The HTTP/S server was created internally. Close it, and rely on its
            // `'close'` event.
            //
            server.close(() => {
              emitClose(this);
            });
          }
        }

        /**
         * See if a given request should be handled by this server instance.
         *
         * @param {http.IncomingMessage} req Request object to inspect
         * @return {Boolean} `true` if the request is valid, else `false`
         * @public
         */
        shouldHandle(req) {
          if (this.options.path) {
            const index = req.url.indexOf('?');
            const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

            if (pathname !== this.options.path) return false;
          }

          return true;
        }

        /**
         * Handle a HTTP Upgrade request.
         *
         * @param {http.IncomingMessage} req The request object
         * @param {(net.Socket|tls.Socket)} socket The network socket between the
         *     server and client
         * @param {Buffer} head The first packet of the upgraded stream
         * @param {Function} cb Callback
         * @public
         */
        handleUpgrade(req, socket, head, cb) {
          socket.on('error', socketOnError);

          const key =
            req.headers['sec-websocket-key'] !== undefined
              ? req.headers['sec-websocket-key']
              : false;
          const version = +req.headers['sec-websocket-version'];

          if (
            req.method !== 'GET' ||
            req.headers.upgrade.toLowerCase() !== 'websocket' ||
            !key ||
            !keyRegex.test(key) ||
            (version !== 8 && version !== 13) ||
            !this.shouldHandle(req)
          ) {
            return abortHandshake(socket, 400);
          }

          const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
          let protocols = new Set();

          if (secWebSocketProtocol !== undefined) {
            try {
              protocols = subprotocol.parse(secWebSocketProtocol);
            } catch (err) {
              return abortHandshake(socket, 400);
            }
          }

          const secWebSocketExtensions =
            req.headers['sec-websocket-extensions'];
          const extensions = {};

          if (
            this.options.perMessageDeflate &&
            secWebSocketExtensions !== undefined
          ) {
            const perMessageDeflate = new PerMessageDeflate(
              this.options.perMessageDeflate,
              true,
              this.options.maxPayload,
            );

            try {
              const offers = extension.parse(secWebSocketExtensions);

              if (offers[PerMessageDeflate.extensionName]) {
                perMessageDeflate.accept(
                  offers[PerMessageDeflate.extensionName],
                );
                extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
              }
            } catch (err) {
              return abortHandshake(socket, 400);
            }
          }

          //
          // Optionally call external client verification handler.
          //
          if (this.options.verifyClient) {
            const info = {
              origin:
                req.headers[
                  `${version === 8 ? 'sec-websocket-origin' : 'origin'}`
                ],
              secure: !!(req.socket.authorized || req.socket.encrypted),
              req,
            };

            if (this.options.verifyClient.length === 2) {
              this.options.verifyClient(
                info,
                (verified, code, message, headers) => {
                  if (!verified) {
                    return abortHandshake(
                      socket,
                      code || 401,
                      message,
                      headers,
                    );
                  }

                  this.completeUpgrade(
                    extensions,
                    key,
                    protocols,
                    req,
                    socket,
                    head,
                    cb,
                  );
                },
              );
              return;
            }

            if (!this.options.verifyClient(info))
              return abortHandshake(socket, 401);
          }

          this.completeUpgrade(
            extensions,
            key,
            protocols,
            req,
            socket,
            head,
            cb,
          );
        }

        /**
         * Upgrade the connection to WebSocket.
         *
         * @param {Object} extensions The accepted extensions
         * @param {String} key The value of the `Sec-WebSocket-Key` header
         * @param {Set} protocols The subprotocols
         * @param {http.IncomingMessage} req The request object
         * @param {(net.Socket|tls.Socket)} socket The network socket between the
         *     server and client
         * @param {Buffer} head The first packet of the upgraded stream
         * @param {Function} cb Callback
         * @throws {Error} If called more than once with the same socket
         * @private
         */
        completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
          //
          // Destroy the socket if the client has already sent a FIN packet.
          //
          if (!socket.readable || !socket.writable) return socket.destroy();

          if (socket[kWebSocket]) {
            throw new Error(
              'server.handleUpgrade() was called more than once with the same ' +
                'socket, possibly due to a misconfiguration',
            );
          }

          if (this._state > RUNNING) return abortHandshake(socket, 503);

          const digest = createHash('sha1')
            .update(key + GUID)
            .digest('base64');

          const headers = [
            'HTTP/1.1 101 Switching Protocols',
            'Upgrade: websocket',
            'Connection: Upgrade',
            `Sec-WebSocket-Accept: ${digest}`,
          ];

          const ws = new WebSocket(null);

          if (protocols.size) {
            //
            // Optionally call external protocol selection handler.
            //
            const protocol = this.options.handleProtocols
              ? this.options.handleProtocols(protocols, req)
              : protocols.values().next().value;

            if (protocol) {
              headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
              ws._protocol = protocol;
            }
          }

          if (extensions[PerMessageDeflate.extensionName]) {
            const params = extensions[PerMessageDeflate.extensionName].params;
            const value = extension.format({
              [PerMessageDeflate.extensionName]: [params],
            });
            headers.push(`Sec-WebSocket-Extensions: ${value}`);
            ws._extensions = extensions;
          }

          //
          // Allow external modification/inspection of handshake headers.
          //
          this.emit('headers', headers, req);

          socket.write(headers.concat('\r\n').join('\r\n'));
          socket.removeListener('error', socketOnError);

          ws.setSocket(socket, head, {
            maxPayload: this.options.maxPayload,
            skipUTF8Validation: this.options.skipUTF8Validation,
          });

          if (this.clients) {
            this.clients.add(ws);
            ws.on('close', () => {
              this.clients.delete(ws);

              if (this._shouldEmitClose && !this.clients.size) {
                process.nextTick(emitClose, this);
              }
            });
          }

          cb(ws, req);
        }
      }

      module.exports = WebSocketServer;

      /**
       * Add event listeners on an `EventEmitter` using a map of <event, listener>
       * pairs.
       *
       * @param {EventEmitter} server The event emitter
       * @param {Object.<String, Function>} map The listeners to add
       * @return {Function} A function that will remove the added listeners when
       *     called
       * @private
       */
      function addListeners(server, map) {
        for (const event of Object.keys(map)) server.on(event, map[event]);

        return function removeListeners() {
          for (const event of Object.keys(map)) {
            server.removeListener(event, map[event]);
          }
        };
      }

      /**
       * Emit a `'close'` event on an `EventEmitter`.
       *
       * @param {EventEmitter} server The event emitter
       * @private
       */
      function emitClose(server) {
        server._state = CLOSED;
        server.emit('close');
      }

      /**
       * Handle premature socket errors.
       *
       * @private
       */
      function socketOnError() {
        this.destroy();
      }

      /**
       * Close the connection when preconditions are not fulfilled.
       *
       * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
       * @param {Number} code The HTTP response status code
       * @param {String} [message] The HTTP response body
       * @param {Object} [headers] Additional HTTP response headers
       * @private
       */
      function abortHandshake(socket, code, message, headers) {
        if (socket.writable) {
          message = message || http.STATUS_CODES[code];
          headers = {
            Connection: 'close',
            'Content-Type': 'text/html',
            'Content-Length': Buffer.byteLength(message),
            ...headers,
          };

          socket.write(
            `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
              Object.keys(headers)
                .map((h) => `${h}: ${headers[h]}`)
                .join('\r\n') +
              '\r\n\r\n' +
              message,
          );
        }

        socket.removeListener('error', socketOnError);
        socket.destroy();
      }

      /***/
    },

    /***/ 2880: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      'use strict';
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Readable$" }] */

      const EventEmitter = __nccwpck_require__(8614);
      const https = __nccwpck_require__(7211);
      const http = __nccwpck_require__(8605);
      const net = __nccwpck_require__(1631);
      const tls = __nccwpck_require__(4016);
      const { randomBytes, createHash } = __nccwpck_require__(6417);
      const { Readable } = __nccwpck_require__(2413);
      const { URL } = __nccwpck_require__(8835);

      const PerMessageDeflate = __nccwpck_require__(8192);
      const Receiver = __nccwpck_require__(8988);
      const Sender = __nccwpck_require__(1159);
      const {
        BINARY_TYPES,
        EMPTY_BUFFER,
        GUID,
        kForOnEventAttribute,
        kListener,
        kStatusCode,
        kWebSocket,
        NOOP,
      } = __nccwpck_require__(8868);
      const {
        EventTarget: { addEventListener, removeEventListener },
      } = __nccwpck_require__(9816);
      const { format, parse } = __nccwpck_require__(2506);
      const { toBuffer } = __nccwpck_require__(8537);

      const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
      const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
      const protocolVersions = [8, 13];
      const closeTimeout = 30 * 1000;

      /**
       * Class representing a WebSocket.
       *
       * @extends EventEmitter
       */
      class WebSocket extends EventEmitter {
        /**
         * Create a new `WebSocket`.
         *
         * @param {(String|URL)} address The URL to which to connect
         * @param {(String|String[])} [protocols] The subprotocols
         * @param {Object} [options] Connection options
         */
        constructor(address, protocols, options) {
          super();

          this._binaryType = BINARY_TYPES[0];
          this._closeCode = 1006;
          this._closeFrameReceived = false;
          this._closeFrameSent = false;
          this._closeMessage = EMPTY_BUFFER;
          this._closeTimer = null;
          this._extensions = {};
          this._protocol = '';
          this._readyState = WebSocket.CONNECTING;
          this._receiver = null;
          this._sender = null;
          this._socket = null;

          if (address !== null) {
            this._bufferedAmount = 0;
            this._isServer = false;
            this._redirects = 0;

            if (protocols === undefined) {
              protocols = [];
            } else if (!Array.isArray(protocols)) {
              if (typeof protocols === 'object' && protocols !== null) {
                options = protocols;
                protocols = [];
              } else {
                protocols = [protocols];
              }
            }

            initAsClient(this, address, protocols, options);
          } else {
            this._isServer = true;
          }
        }

        /**
         * This deviates from the WHATWG interface since ws doesn't support the
         * required default "blob" type (instead we define a custom "nodebuffer"
         * type).
         *
         * @type {String}
         */
        get binaryType() {
          return this._binaryType;
        }

        set binaryType(type) {
          if (!BINARY_TYPES.includes(type)) return;

          this._binaryType = type;

          //
          // Allow to change `binaryType` on the fly.
          //
          if (this._receiver) this._receiver._binaryType = type;
        }

        /**
         * @type {Number}
         */
        get bufferedAmount() {
          if (!this._socket) return this._bufferedAmount;

          return (
            this._socket._writableState.length + this._sender._bufferedBytes
          );
        }

        /**
         * @type {String}
         */
        get extensions() {
          return Object.keys(this._extensions).join();
        }

        /**
         * @type {Function}
         */
        /* istanbul ignore next */
        get onclose() {
          return null;
        }

        /**
         * @type {Function}
         */
        /* istanbul ignore next */
        get onerror() {
          return null;
        }

        /**
         * @type {Function}
         */
        /* istanbul ignore next */
        get onopen() {
          return null;
        }

        /**
         * @type {Function}
         */
        /* istanbul ignore next */
        get onmessage() {
          return null;
        }

        /**
         * @type {String}
         */
        get protocol() {
          return this._protocol;
        }

        /**
         * @type {Number}
         */
        get readyState() {
          return this._readyState;
        }

        /**
         * @type {String}
         */
        get url() {
          return this._url;
        }

        /**
         * Set up the socket and the internal resources.
         *
         * @param {(net.Socket|tls.Socket)} socket The network socket between the
         *     server and client
         * @param {Buffer} head The first packet of the upgraded stream
         * @param {Object} options Options object
         * @param {Number} [options.maxPayload=0] The maximum allowed message size
         * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
         *     not to skip UTF-8 validation for text and close messages
         * @private
         */
        setSocket(socket, head, options) {
          const receiver = new Receiver({
            binaryType: this.binaryType,
            extensions: this._extensions,
            isServer: this._isServer,
            maxPayload: options.maxPayload,
            skipUTF8Validation: options.skipUTF8Validation,
          });

          this._sender = new Sender(socket, this._extensions);
          this._receiver = receiver;
          this._socket = socket;

          receiver[kWebSocket] = this;
          socket[kWebSocket] = this;

          receiver.on('conclude', receiverOnConclude);
          receiver.on('drain', receiverOnDrain);
          receiver.on('error', receiverOnError);
          receiver.on('message', receiverOnMessage);
          receiver.on('ping', receiverOnPing);
          receiver.on('pong', receiverOnPong);

          socket.setTimeout(0);
          socket.setNoDelay();

          if (head.length > 0) socket.unshift(head);

          socket.on('close', socketOnClose);
          socket.on('data', socketOnData);
          socket.on('end', socketOnEnd);
          socket.on('error', socketOnError);

          this._readyState = WebSocket.OPEN;
          this.emit('open');
        }

        /**
         * Emit the `'close'` event.
         *
         * @private
         */
        emitClose() {
          if (!this._socket) {
            this._readyState = WebSocket.CLOSED;
            this.emit('close', this._closeCode, this._closeMessage);
            return;
          }

          if (this._extensions[PerMessageDeflate.extensionName]) {
            this._extensions[PerMessageDeflate.extensionName].cleanup();
          }

          this._receiver.removeAllListeners();
          this._readyState = WebSocket.CLOSED;
          this.emit('close', this._closeCode, this._closeMessage);
        }

        /**
         * Start a closing handshake.
         *
         *          +----------+   +-----------+   +----------+
         *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
         *    |     +----------+   +-----------+   +----------+     |
         *          +----------+   +-----------+         |
         * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
         *          +----------+   +-----------+   |
         *    |           |                        |   +---+        |
         *                +------------------------+-->|fin| - - - -
         *    |         +---+                      |   +---+
         *     - - - - -|fin|<---------------------+
         *              +---+
         *
         * @param {Number} [code] Status code explaining why the connection is closing
         * @param {(String|Buffer)} [data] The reason why the connection is
         *     closing
         * @public
         */
        close(code, data) {
          if (this.readyState === WebSocket.CLOSED) return;
          if (this.readyState === WebSocket.CONNECTING) {
            const msg =
              'WebSocket was closed before the connection was established';
            return abortHandshake(this, this._req, msg);
          }

          if (this.readyState === WebSocket.CLOSING) {
            if (
              this._closeFrameSent &&
              (this._closeFrameReceived ||
                this._receiver._writableState.errorEmitted)
            ) {
              this._socket.end();
            }

            return;
          }

          this._readyState = WebSocket.CLOSING;
          this._sender.close(code, data, !this._isServer, (err) => {
            //
            // This error is handled by the `'error'` listener on the socket. We only
            // want to know if the close frame has been sent here.
            //
            if (err) return;

            this._closeFrameSent = true;

            if (
              this._closeFrameReceived ||
              this._receiver._writableState.errorEmitted
            ) {
              this._socket.end();
            }
          });

          //
          // Specify a timeout for the closing handshake to complete.
          //
          this._closeTimer = setTimeout(
            this._socket.destroy.bind(this._socket),
            closeTimeout,
          );
        }

        /**
         * Send a ping.
         *
         * @param {*} [data] The data to send
         * @param {Boolean} [mask] Indicates whether or not to mask `data`
         * @param {Function} [cb] Callback which is executed when the ping is sent
         * @public
         */
        ping(data, mask, cb) {
          if (this.readyState === WebSocket.CONNECTING) {
            throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
          }

          if (typeof data === 'function') {
            cb = data;
            data = mask = undefined;
          } else if (typeof mask === 'function') {
            cb = mask;
            mask = undefined;
          }

          if (typeof data === 'number') data = data.toString();

          if (this.readyState !== WebSocket.OPEN) {
            sendAfterClose(this, data, cb);
            return;
          }

          if (mask === undefined) mask = !this._isServer;
          this._sender.ping(data || EMPTY_BUFFER, mask, cb);
        }

        /**
         * Send a pong.
         *
         * @param {*} [data] The data to send
         * @param {Boolean} [mask] Indicates whether or not to mask `data`
         * @param {Function} [cb] Callback which is executed when the pong is sent
         * @public
         */
        pong(data, mask, cb) {
          if (this.readyState === WebSocket.CONNECTING) {
            throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
          }

          if (typeof data === 'function') {
            cb = data;
            data = mask = undefined;
          } else if (typeof mask === 'function') {
            cb = mask;
            mask = undefined;
          }

          if (typeof data === 'number') data = data.toString();

          if (this.readyState !== WebSocket.OPEN) {
            sendAfterClose(this, data, cb);
            return;
          }

          if (mask === undefined) mask = !this._isServer;
          this._sender.pong(data || EMPTY_BUFFER, mask, cb);
        }

        /**
         * Send a data message.
         *
         * @param {*} data The message to send
         * @param {Object} [options] Options object
         * @param {Boolean} [options.binary] Specifies whether `data` is binary or
         *     text
         * @param {Boolean} [options.compress] Specifies whether or not to compress
         *     `data`
         * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
         *     last one
         * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
         * @param {Function} [cb] Callback which is executed when data is written out
         * @public
         */
        send(data, options, cb) {
          if (this.readyState === WebSocket.CONNECTING) {
            throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
          }

          if (typeof options === 'function') {
            cb = options;
            options = {};
          }

          if (typeof data === 'number') data = data.toString();

          if (this.readyState !== WebSocket.OPEN) {
            sendAfterClose(this, data, cb);
            return;
          }

          const opts = {
            binary: typeof data !== 'string',
            mask: !this._isServer,
            compress: true,
            fin: true,
            ...options,
          };

          if (!this._extensions[PerMessageDeflate.extensionName]) {
            opts.compress = false;
          }

          this._sender.send(data || EMPTY_BUFFER, opts, cb);
        }

        /**
         * Forcibly close the connection.
         *
         * @public
         */
        terminate() {
          if (this.readyState === WebSocket.CLOSED) return;
          if (this.readyState === WebSocket.CONNECTING) {
            const msg =
              'WebSocket was closed before the connection was established';
            return abortHandshake(this, this._req, msg);
          }

          if (this._socket) {
            this._readyState = WebSocket.CLOSING;
            this._socket.destroy();
          }
        }
      }

      /**
       * @constant {Number} CONNECTING
       * @memberof WebSocket
       */
      Object.defineProperty(WebSocket, 'CONNECTING', {
        enumerable: true,
        value: readyStates.indexOf('CONNECTING'),
      });

      /**
       * @constant {Number} CONNECTING
       * @memberof WebSocket.prototype
       */
      Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
        enumerable: true,
        value: readyStates.indexOf('CONNECTING'),
      });

      /**
       * @constant {Number} OPEN
       * @memberof WebSocket
       */
      Object.defineProperty(WebSocket, 'OPEN', {
        enumerable: true,
        value: readyStates.indexOf('OPEN'),
      });

      /**
       * @constant {Number} OPEN
       * @memberof WebSocket.prototype
       */
      Object.defineProperty(WebSocket.prototype, 'OPEN', {
        enumerable: true,
        value: readyStates.indexOf('OPEN'),
      });

      /**
       * @constant {Number} CLOSING
       * @memberof WebSocket
       */
      Object.defineProperty(WebSocket, 'CLOSING', {
        enumerable: true,
        value: readyStates.indexOf('CLOSING'),
      });

      /**
       * @constant {Number} CLOSING
       * @memberof WebSocket.prototype
       */
      Object.defineProperty(WebSocket.prototype, 'CLOSING', {
        enumerable: true,
        value: readyStates.indexOf('CLOSING'),
      });

      /**
       * @constant {Number} CLOSED
       * @memberof WebSocket
       */
      Object.defineProperty(WebSocket, 'CLOSED', {
        enumerable: true,
        value: readyStates.indexOf('CLOSED'),
      });

      /**
       * @constant {Number} CLOSED
       * @memberof WebSocket.prototype
       */
      Object.defineProperty(WebSocket.prototype, 'CLOSED', {
        enumerable: true,
        value: readyStates.indexOf('CLOSED'),
      });

      [
        'binaryType',
        'bufferedAmount',
        'extensions',
        'protocol',
        'readyState',
        'url',
      ].forEach((property) => {
        Object.defineProperty(WebSocket.prototype, property, {
          enumerable: true,
        });
      });

      //
      // Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
      // See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
      //
      ['open', 'error', 'close', 'message'].forEach((method) => {
        Object.defineProperty(WebSocket.prototype, `on${method}`, {
          enumerable: true,
          get() {
            for (const listener of this.listeners(method)) {
              if (listener[kForOnEventAttribute]) return listener[kListener];
            }

            return null;
          },
          set(handler) {
            for (const listener of this.listeners(method)) {
              if (listener[kForOnEventAttribute]) {
                this.removeListener(method, listener);
                break;
              }
            }

            if (typeof handler !== 'function') return;

            this.addEventListener(method, handler, {
              [kForOnEventAttribute]: true,
            });
          },
        });
      });

      WebSocket.prototype.addEventListener = addEventListener;
      WebSocket.prototype.removeEventListener = removeEventListener;

      module.exports = WebSocket;

      /**
       * Initialize a WebSocket client.
       *
       * @param {WebSocket} websocket The client to initialize
       * @param {(String|URL)} address The URL to which to connect
       * @param {Array} protocols The subprotocols
       * @param {Object} [options] Connection options
       * @param {Boolean} [options.followRedirects=false] Whether or not to follow
       *     redirects
       * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
       *     handshake request
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Number} [options.maxRedirects=10] The maximum number of redirects
       *     allowed
       * @param {String} [options.origin] Value of the `Origin` or
       *     `Sec-WebSocket-Origin` header
       * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.protocolVersion=13] Value of the
       *     `Sec-WebSocket-Version` header
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      function initAsClient(websocket, address, protocols, options) {
        const opts = {
          protocolVersion: protocolVersions[1],
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: true,
          followRedirects: false,
          maxRedirects: 10,
          ...options,
          createConnection: undefined,
          socketPath: undefined,
          hostname: undefined,
          protocol: undefined,
          timeout: undefined,
          method: undefined,
          host: undefined,
          path: undefined,
          port: undefined,
        };

        if (!protocolVersions.includes(opts.protocolVersion)) {
          throw new RangeError(
            `Unsupported protocol version: ${opts.protocolVersion} ` +
              `(supported versions: ${protocolVersions.join(', ')})`,
          );
        }

        let parsedUrl;

        if (address instanceof URL) {
          parsedUrl = address;
          websocket._url = address.href;
        } else {
          try {
            parsedUrl = new URL(address);
          } catch (e) {
            throw new SyntaxError(`Invalid URL: ${address}`);
          }

          websocket._url = address;
        }

        const isSecure = parsedUrl.protocol === 'wss:';
        const isUnixSocket = parsedUrl.protocol === 'ws+unix:';

        if (parsedUrl.protocol !== 'ws:' && !isSecure && !isUnixSocket) {
          throw new SyntaxError(
            'The URL\'s protocol must be one of "ws:", "wss:", or "ws+unix:"',
          );
        }

        if (isUnixSocket && !parsedUrl.pathname) {
          throw new SyntaxError("The URL's pathname is empty");
        }

        if (parsedUrl.hash) {
          throw new SyntaxError('The URL contains a fragment identifier');
        }

        const defaultPort = isSecure ? 443 : 80;
        const key = randomBytes(16).toString('base64');
        const get = isSecure ? https.get : http.get;
        const protocolSet = new Set();
        let perMessageDeflate;

        opts.createConnection = isSecure ? tlsConnect : netConnect;
        opts.defaultPort = opts.defaultPort || defaultPort;
        opts.port = parsedUrl.port || defaultPort;
        opts.host = parsedUrl.hostname.startsWith('[')
          ? parsedUrl.hostname.slice(1, -1)
          : parsedUrl.hostname;
        opts.headers = {
          'Sec-WebSocket-Version': opts.protocolVersion,
          'Sec-WebSocket-Key': key,
          Connection: 'Upgrade',
          Upgrade: 'websocket',
          ...opts.headers,
        };
        opts.path = parsedUrl.pathname + parsedUrl.search;
        opts.timeout = opts.handshakeTimeout;

        if (opts.perMessageDeflate) {
          perMessageDeflate = new PerMessageDeflate(
            opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
            false,
            opts.maxPayload,
          );
          opts.headers['Sec-WebSocket-Extensions'] = format({
            [PerMessageDeflate.extensionName]: perMessageDeflate.offer(),
          });
        }
        if (protocols.length) {
          for (const protocol of protocols) {
            if (
              typeof protocol !== 'string' ||
              !subprotocolRegex.test(protocol) ||
              protocolSet.has(protocol)
            ) {
              throw new SyntaxError(
                'An invalid or duplicated subprotocol was specified',
              );
            }

            protocolSet.add(protocol);
          }

          opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
        }
        if (opts.origin) {
          if (opts.protocolVersion < 13) {
            opts.headers['Sec-WebSocket-Origin'] = opts.origin;
          } else {
            opts.headers.Origin = opts.origin;
          }
        }
        if (parsedUrl.username || parsedUrl.password) {
          opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
        }

        if (isUnixSocket) {
          const parts = opts.path.split(':');

          opts.socketPath = parts[0];
          opts.path = parts[1];
        }

        let req = (websocket._req = get(opts));

        if (opts.timeout) {
          req.on('timeout', () => {
            abortHandshake(websocket, req, 'Opening handshake has timed out');
          });
        }

        req.on('error', (err) => {
          if (req === null || req.aborted) return;

          req = websocket._req = null;
          websocket._readyState = WebSocket.CLOSING;
          websocket.emit('error', err);
          websocket.emitClose();
        });

        req.on('response', (res) => {
          const location = res.headers.location;
          const statusCode = res.statusCode;

          if (
            location &&
            opts.followRedirects &&
            statusCode >= 300 &&
            statusCode < 400
          ) {
            if (++websocket._redirects > opts.maxRedirects) {
              abortHandshake(websocket, req, 'Maximum redirects exceeded');
              return;
            }

            req.abort();

            const addr = new URL(location, address);

            initAsClient(websocket, addr, protocols, options);
          } else if (!websocket.emit('unexpected-response', req, res)) {
            abortHandshake(
              websocket,
              req,
              `Unexpected server response: ${res.statusCode}`,
            );
          }
        });

        req.on('upgrade', (res, socket, head) => {
          websocket.emit('upgrade', res);

          //
          // The user may have closed the connection from a listener of the `upgrade`
          // event.
          //
          if (websocket.readyState !== WebSocket.CONNECTING) return;

          req = websocket._req = null;

          const digest = createHash('sha1')
            .update(key + GUID)
            .digest('base64');

          if (res.headers['sec-websocket-accept'] !== digest) {
            abortHandshake(
              websocket,
              socket,
              'Invalid Sec-WebSocket-Accept header',
            );
            return;
          }

          const serverProt = res.headers['sec-websocket-protocol'];
          let protError;

          if (serverProt !== undefined) {
            if (!protocolSet.size) {
              protError = 'Server sent a subprotocol but none was requested';
            } else if (!protocolSet.has(serverProt)) {
              protError = 'Server sent an invalid subprotocol';
            }
          } else if (protocolSet.size) {
            protError = 'Server sent no subprotocol';
          }

          if (protError) {
            abortHandshake(websocket, socket, protError);
            return;
          }

          if (serverProt) websocket._protocol = serverProt;

          const secWebSocketExtensions =
            res.headers['sec-websocket-extensions'];

          if (secWebSocketExtensions !== undefined) {
            if (!perMessageDeflate) {
              const message =
                'Server sent a Sec-WebSocket-Extensions header but no extension ' +
                'was requested';
              abortHandshake(websocket, socket, message);
              return;
            }

            let extensions;

            try {
              extensions = parse(secWebSocketExtensions);
            } catch (err) {
              const message = 'Invalid Sec-WebSocket-Extensions header';
              abortHandshake(websocket, socket, message);
              return;
            }

            const extensionNames = Object.keys(extensions);

            if (
              extensionNames.length !== 1 ||
              extensionNames[0] !== PerMessageDeflate.extensionName
            ) {
              const message =
                'Server indicated an extension that was not requested';
              abortHandshake(websocket, socket, message);
              return;
            }

            try {
              perMessageDeflate.accept(
                extensions[PerMessageDeflate.extensionName],
              );
            } catch (err) {
              const message = 'Invalid Sec-WebSocket-Extensions header';
              abortHandshake(websocket, socket, message);
              return;
            }

            websocket._extensions[PerMessageDeflate.extensionName] =
              perMessageDeflate;
          }

          websocket.setSocket(socket, head, {
            maxPayload: opts.maxPayload,
            skipUTF8Validation: opts.skipUTF8Validation,
          });
        });
      }

      /**
       * Create a `net.Socket` and initiate a connection.
       *
       * @param {Object} options Connection options
       * @return {net.Socket} The newly created socket used to start the connection
       * @private
       */
      function netConnect(options) {
        options.path = options.socketPath;
        return net.connect(options);
      }

      /**
       * Create a `tls.TLSSocket` and initiate a connection.
       *
       * @param {Object} options Connection options
       * @return {tls.TLSSocket} The newly created socket used to start the connection
       * @private
       */
      function tlsConnect(options) {
        options.path = undefined;

        if (!options.servername && options.servername !== '') {
          options.servername = net.isIP(options.host) ? '' : options.host;
        }

        return tls.connect(options);
      }

      /**
       * Abort the handshake and emit an error.
       *
       * @param {WebSocket} websocket The WebSocket instance
       * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
       *     abort or the socket to destroy
       * @param {String} message The error message
       * @private
       */
      function abortHandshake(websocket, stream, message) {
        websocket._readyState = WebSocket.CLOSING;

        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshake);

        if (stream.setHeader) {
          stream.abort();

          if (stream.socket && !stream.socket.destroyed) {
            //
            // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
            // called after the request completed. See
            // https://github.com/websockets/ws/issues/1869.
            //
            stream.socket.destroy();
          }

          stream.once('abort', websocket.emitClose.bind(websocket));
          websocket.emit('error', err);
        } else {
          stream.destroy(err);
          stream.once('error', websocket.emit.bind(websocket, 'error'));
          stream.once('close', websocket.emitClose.bind(websocket));
        }
      }

      /**
       * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
       * when the `readyState` attribute is `CLOSING` or `CLOSED`.
       *
       * @param {WebSocket} websocket The WebSocket instance
       * @param {*} [data] The data to send
       * @param {Function} [cb] Callback
       * @private
       */
      function sendAfterClose(websocket, data, cb) {
        if (data) {
          const length = toBuffer(data).length;

          //
          // The `_bufferedAmount` property is used only when the peer is a client and
          // the opening handshake fails. Under these circumstances, in fact, the
          // `setSocket()` method is not called, so the `_socket` and `_sender`
          // properties are set to `null`.
          //
          if (websocket._socket) websocket._sender._bufferedBytes += length;
          else websocket._bufferedAmount += length;
        }

        if (cb) {
          const err = new Error(
            `WebSocket is not open: readyState ${websocket.readyState} ` +
              `(${readyStates[websocket.readyState]})`,
          );
          cb(err);
        }
      }

      /**
       * The listener of the `Receiver` `'conclude'` event.
       *
       * @param {Number} code The status code
       * @param {Buffer} reason The reason for closing
       * @private
       */
      function receiverOnConclude(code, reason) {
        const websocket = this[kWebSocket];

        websocket._closeFrameReceived = true;
        websocket._closeMessage = reason;
        websocket._closeCode = code;

        if (websocket._socket[kWebSocket] === undefined) return;

        websocket._socket.removeListener('data', socketOnData);
        process.nextTick(resume, websocket._socket);

        if (code === 1005) websocket.close();
        else websocket.close(code, reason);
      }

      /**
       * The listener of the `Receiver` `'drain'` event.
       *
       * @private
       */
      function receiverOnDrain() {
        this[kWebSocket]._socket.resume();
      }

      /**
       * The listener of the `Receiver` `'error'` event.
       *
       * @param {(RangeError|Error)} err The emitted error
       * @private
       */
      function receiverOnError(err) {
        const websocket = this[kWebSocket];

        if (websocket._socket[kWebSocket] !== undefined) {
          websocket._socket.removeListener('data', socketOnData);

          //
          // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
          // https://github.com/websockets/ws/issues/1940.
          //
          process.nextTick(resume, websocket._socket);

          websocket.close(err[kStatusCode]);
        }

        websocket.emit('error', err);
      }

      /**
       * The listener of the `Receiver` `'finish'` event.
       *
       * @private
       */
      function receiverOnFinish() {
        this[kWebSocket].emitClose();
      }

      /**
       * The listener of the `Receiver` `'message'` event.
       *
       * @param {Buffer|ArrayBuffer|Buffer[])} data The message
       * @param {Boolean} isBinary Specifies whether the message is binary or not
       * @private
       */
      function receiverOnMessage(data, isBinary) {
        this[kWebSocket].emit('message', data, isBinary);
      }

      /**
       * The listener of the `Receiver` `'ping'` event.
       *
       * @param {Buffer} data The data included in the ping frame
       * @private
       */
      function receiverOnPing(data) {
        const websocket = this[kWebSocket];

        websocket.pong(data, !websocket._isServer, NOOP);
        websocket.emit('ping', data);
      }

      /**
       * The listener of the `Receiver` `'pong'` event.
       *
       * @param {Buffer} data The data included in the pong frame
       * @private
       */
      function receiverOnPong(data) {
        this[kWebSocket].emit('pong', data);
      }

      /**
       * Resume a readable stream
       *
       * @param {Readable} stream The readable stream
       * @private
       */
      function resume(stream) {
        stream.resume();
      }

      /**
       * The listener of the `net.Socket` `'close'` event.
       *
       * @private
       */
      function socketOnClose() {
        const websocket = this[kWebSocket];

        this.removeListener('close', socketOnClose);
        this.removeListener('data', socketOnData);
        this.removeListener('end', socketOnEnd);

        websocket._readyState = WebSocket.CLOSING;

        let chunk;

        //
        // The close frame might not have been received or the `'end'` event emitted,
        // for example, if the socket was destroyed due to an error. Ensure that the
        // `receiver` stream is closed after writing any remaining buffered data to
        // it. If the readable side of the socket is in flowing mode then there is no
        // buffered data as everything has been already written and `readable.read()`
        // will return `null`. If instead, the socket is paused, any possible buffered
        // data will be read as a single chunk.
        //
        if (
          !this._readableState.endEmitted &&
          !websocket._closeFrameReceived &&
          !websocket._receiver._writableState.errorEmitted &&
          (chunk = websocket._socket.read()) !== null
        ) {
          websocket._receiver.write(chunk);
        }

        websocket._receiver.end();

        this[kWebSocket] = undefined;

        clearTimeout(websocket._closeTimer);

        if (
          websocket._receiver._writableState.finished ||
          websocket._receiver._writableState.errorEmitted
        ) {
          websocket.emitClose();
        } else {
          websocket._receiver.on('error', receiverOnFinish);
          websocket._receiver.on('finish', receiverOnFinish);
        }
      }

      /**
       * The listener of the `net.Socket` `'data'` event.
       *
       * @param {Buffer} chunk A chunk of data
       * @private
       */
      function socketOnData(chunk) {
        if (!this[kWebSocket]._receiver.write(chunk)) {
          this.pause();
        }
      }

      /**
       * The listener of the `net.Socket` `'end'` event.
       *
       * @private
       */
      function socketOnEnd() {
        const websocket = this[kWebSocket];

        websocket._readyState = WebSocket.CLOSING;
        websocket._receiver.end();
        this.end();
      }

      /**
       * The listener of the `net.Socket` `'error'` event.
       *
       * @private
       */
      function socketOnError() {
        const websocket = this[kWebSocket];

        this.removeListener('error', socketOnError);
        this.on('error', NOOP);

        if (websocket) {
          websocket._readyState = WebSocket.CLOSING;
          this.destroy();
        }
      }

      /***/
    },

    /***/ 5530: /***/ (
      module,
      __unused_webpack_exports,
      __nccwpck_require__,
    ) => {
      /**
       * Wrapper for built-in http.js to emulate the browser XMLHttpRequest object.
       *
       * This can be used with JS designed for browsers to improve reuse of code and
       * allow the use of existing libraries.
       *
       * Usage: include("XMLHttpRequest.js") and use XMLHttpRequest per W3C specs.
       *
       * @author Dan DeFelippi <dan@driverdan.com>
       * @contributor David Ellis <d.f.ellis@ieee.org>
       * @license MIT
       */

      var fs = __nccwpck_require__(5747);
      var Url = __nccwpck_require__(8835);
      var spawn = __nccwpck_require__(3129).spawn;

      /**
       * Module exports.
       */

      module.exports = XMLHttpRequest;

      // backwards-compat
      XMLHttpRequest.XMLHttpRequest = XMLHttpRequest;

      /**
       * `XMLHttpRequest` constructor.
       *
       * Supported options for the `opts` object are:
       *
       *  - `agent`: An http.Agent instance; http.globalAgent may be used; if 'undefined', agent usage is disabled
       *
       * @param {Object} opts optional "options" object
       */

      function XMLHttpRequest(opts) {
        'use strict';

        opts = opts || {};

        /**
         * Private variables
         */
        var self = this;
        var http = __nccwpck_require__(8605);
        var https = __nccwpck_require__(7211);

        // Holds http.js objects
        var request;
        var response;

        // Request settings
        var settings = {};

        // Disable header blacklist.
        // Not part of XHR specs.
        var disableHeaderCheck = false;

        // Set some default headers
        var defaultHeaders = {
          'User-Agent': 'node-XMLHttpRequest',
          Accept: '*/*',
        };

        var headers = Object.assign({}, defaultHeaders);

        // These headers are not user setable.
        // The following are allowed but banned in the spec:
        // * user-agent
        var forbiddenRequestHeaders = [
          'accept-charset',
          'accept-encoding',
          'access-control-request-headers',
          'access-control-request-method',
          'connection',
          'content-length',
          'content-transfer-encoding',
          'cookie',
          'cookie2',
          'date',
          'expect',
          'host',
          'keep-alive',
          'origin',
          'referer',
          'te',
          'trailer',
          'transfer-encoding',
          'upgrade',
          'via',
        ];

        // These request methods are not allowed
        var forbiddenRequestMethods = ['TRACE', 'TRACK', 'CONNECT'];

        // Send flag
        var sendFlag = false;
        // Error flag, used when errors occur or abort is called
        var errorFlag = false;
        var abortedFlag = false;

        // Event listeners
        var listeners = {};

        /**
         * Constants
         */

        this.UNSENT = 0;
        this.OPENED = 1;
        this.HEADERS_RECEIVED = 2;
        this.LOADING = 3;
        this.DONE = 4;

        /**
         * Public vars
         */

        // Current state
        this.readyState = this.UNSENT;

        // default ready state change handler in case one is not set or is set late
        this.onreadystatechange = null;

        // Result & response
        this.responseText = '';
        this.responseXML = '';
        this.status = null;
        this.statusText = null;

        /**
         * Private methods
         */

        /**
         * Check if the specified header is allowed.
         *
         * @param string header Header to validate
         * @return boolean False if not allowed, otherwise true
         */
        var isAllowedHttpHeader = function (header) {
          return (
            disableHeaderCheck ||
            (header &&
              forbiddenRequestHeaders.indexOf(header.toLowerCase()) === -1)
          );
        };

        /**
         * Check if the specified method is allowed.
         *
         * @param string method Request method to validate
         * @return boolean False if not allowed, otherwise true
         */
        var isAllowedHttpMethod = function (method) {
          return method && forbiddenRequestMethods.indexOf(method) === -1;
        };

        /**
         * Public methods
         */

        /**
         * Open the connection. Currently supports local server requests.
         *
         * @param string method Connection method (eg GET, POST)
         * @param string url URL for the connection.
         * @param boolean async Asynchronous connection. Default is true.
         * @param string user Username for basic authentication (optional)
         * @param string password Password for basic authentication (optional)
         */
        this.open = function (method, url, async, user, password) {
          this.abort();
          errorFlag = false;
          abortedFlag = false;

          // Check for valid request method
          if (!isAllowedHttpMethod(method)) {
            throw new Error('SecurityError: Request method not allowed');
          }

          settings = {
            method: method,
            url: url.toString(),
            async: typeof async !== 'boolean' ? true : async,
            user: user || null,
            password: password || null,
          };

          setState(this.OPENED);
        };

        /**
         * Disables or enables isAllowedHttpHeader() check the request. Enabled by default.
         * This does not conform to the W3C spec.
         *
         * @param boolean state Enable or disable header checking.
         */
        this.setDisableHeaderCheck = function (state) {
          disableHeaderCheck = state;
        };

        /**
         * Sets a header for the request.
         *
         * @param string header Header name
         * @param string value Header value
         * @return boolean Header added
         */
        this.setRequestHeader = function (header, value) {
          if (this.readyState != this.OPENED) {
            throw new Error(
              'INVALID_STATE_ERR: setRequestHeader can only be called when state is OPEN',
            );
          }
          if (!isAllowedHttpHeader(header)) {
            console.warn('Refused to set unsafe header "' + header + '"');
            return false;
          }
          if (sendFlag) {
            throw new Error('INVALID_STATE_ERR: send flag is true');
          }
          headers[header] = value;
          return true;
        };

        /**
         * Gets a header from the server response.
         *
         * @param string header Name of header to get.
         * @return string Text of the header or null if it doesn't exist.
         */
        this.getResponseHeader = function (header) {
          if (
            typeof header === 'string' &&
            this.readyState > this.OPENED &&
            response.headers[header.toLowerCase()] &&
            !errorFlag
          ) {
            return response.headers[header.toLowerCase()];
          }

          return null;
        };

        /**
         * Gets all the response headers.
         *
         * @return string A string with all response headers separated by CR+LF
         */
        this.getAllResponseHeaders = function () {
          if (this.readyState < this.HEADERS_RECEIVED || errorFlag) {
            return '';
          }
          var result = '';

          for (var i in response.headers) {
            // Cookie headers are excluded
            if (i !== 'set-cookie' && i !== 'set-cookie2') {
              result += i + ': ' + response.headers[i] + '\r\n';
            }
          }
          return result.substr(0, result.length - 2);
        };

        /**
         * Gets a request header
         *
         * @param string name Name of header to get
         * @return string Returns the request header or empty string if not set
         */
        this.getRequestHeader = function (name) {
          // @TODO Make this case insensitive
          if (typeof name === 'string' && headers[name]) {
            return headers[name];
          }

          return '';
        };

        /**
         * Sends the request to the server.
         *
         * @param string data Optional data to send as request body.
         */
        this.send = function (data) {
          if (this.readyState != this.OPENED) {
            throw new Error(
              'INVALID_STATE_ERR: connection must be opened before send() is called',
            );
          }

          if (sendFlag) {
            throw new Error('INVALID_STATE_ERR: send has already been called');
          }

          var ssl = false,
            local = false;
          var url = Url.parse(settings.url);
          var host;
          // Determine the server
          switch (url.protocol) {
            case 'https:':
              ssl = true;
            // SSL & non-SSL both need host, no break here.
            case 'http:':
              host = url.hostname;
              break;

            case 'file:':
              local = true;
              break;

            case undefined:
            case '':
              host = 'localhost';
              break;

            default:
              throw new Error('Protocol not supported.');
          }

          // Load files off the local filesystem (file://)
          if (local) {
            if (settings.method !== 'GET') {
              throw new Error('XMLHttpRequest: Only GET method is supported');
            }

            if (settings.async) {
              fs.readFile(
                unescape(url.pathname),
                'utf8',
                function (error, data) {
                  if (error) {
                    self.handleError(error, error.errno || -1);
                  } else {
                    self.status = 200;
                    self.responseText = data;
                    setState(self.DONE);
                  }
                },
              );
            } else {
              try {
                this.responseText = fs.readFileSync(
                  unescape(url.pathname),
                  'utf8',
                );
                this.status = 200;
                setState(self.DONE);
              } catch (e) {
                this.handleError(e, e.errno || -1);
              }
            }

            return;
          }

          // Default to port 80. If accessing localhost on another port be sure
          // to use http://localhost:port/path
          var port = url.port || (ssl ? 443 : 80);
          // Add query string if one is used
          var uri = url.pathname + (url.search ? url.search : '');

          // Set the Host header or the server may reject the request
          headers['Host'] = host;
          if (!((ssl && port === 443) || port === 80)) {
            headers['Host'] += ':' + url.port;
          }

          // Set Basic Auth if necessary
          if (settings.user) {
            if (typeof settings.password == 'undefined') {
              settings.password = '';
            }
            var authBuf = new Buffer(settings.user + ':' + settings.password);
            headers['Authorization'] = 'Basic ' + authBuf.toString('base64');
          }

          // Set content length header
          if (settings.method === 'GET' || settings.method === 'HEAD') {
            data = null;
          } else if (data) {
            headers['Content-Length'] = Buffer.isBuffer(data)
              ? data.length
              : Buffer.byteLength(data);

            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'text/plain;charset=UTF-8';
            }
          } else if (settings.method === 'POST') {
            // For a post with no data set Content-Length: 0.
            // This is required by buggy servers that don't meet the specs.
            headers['Content-Length'] = 0;
          }

          var agent = opts.agent || false;
          var options = {
            host: host,
            port: port,
            path: uri,
            method: settings.method,
            headers: headers,
            agent: agent,
          };

          if (ssl) {
            options.pfx = opts.pfx;
            options.key = opts.key;
            options.passphrase = opts.passphrase;
            options.cert = opts.cert;
            options.ca = opts.ca;
            options.ciphers = opts.ciphers;
            options.rejectUnauthorized =
              opts.rejectUnauthorized === false ? false : true;
          }

          // Reset error flag
          errorFlag = false;
          // Handle async requests
          if (settings.async) {
            // Use the proper protocol
            var doRequest = ssl ? https.request : http.request;

            // Request is being sent, set send flag
            sendFlag = true;

            // As per spec, this is called here for historical reasons.
            self.dispatchEvent('readystatechange');

            // Handler for the response
            var responseHandler = function (resp) {
              // Set response var to the response we got back
              // This is so it remains accessable outside this scope
              response = resp;
              // Check for redirect
              // @TODO Prevent looped redirects
              if (
                response.statusCode === 302 ||
                response.statusCode === 303 ||
                response.statusCode === 307
              ) {
                // Change URL to the redirect location
                settings.url = response.headers.location;
                var url = Url.parse(settings.url);
                // Set host var in case it's used later
                host = url.hostname;
                // Options for the new request
                var newOptions = {
                  hostname: url.hostname,
                  port: url.port,
                  path: url.path,
                  method: response.statusCode === 303 ? 'GET' : settings.method,
                  headers: headers,
                };

                if (ssl) {
                  newOptions.pfx = opts.pfx;
                  newOptions.key = opts.key;
                  newOptions.passphrase = opts.passphrase;
                  newOptions.cert = opts.cert;
                  newOptions.ca = opts.ca;
                  newOptions.ciphers = opts.ciphers;
                  newOptions.rejectUnauthorized =
                    opts.rejectUnauthorized === false ? false : true;
                }

                // Issue the new request
                request = doRequest(newOptions, responseHandler).on(
                  'error',
                  errorHandler,
                );
                request.end();
                // @TODO Check if an XHR event needs to be fired here
                return;
              }

              if (response && response.setEncoding) {
                response.setEncoding('utf8');
              }

              setState(self.HEADERS_RECEIVED);
              self.status = response.statusCode;

              response.on('data', function (chunk) {
                // Make sure there's some data
                if (chunk) {
                  self.responseText += chunk;
                }
                // Don't emit state changes if the connection has been aborted.
                if (sendFlag) {
                  setState(self.LOADING);
                }
              });

              response.on('end', function () {
                if (sendFlag) {
                  // The sendFlag needs to be set before setState is called.  Otherwise if we are chaining callbacks
                  // there can be a timing issue (the callback is called and a new call is made before the flag is reset).
                  sendFlag = false;
                  // Discard the 'end' event if the connection has been aborted
                  setState(self.DONE);
                }
              });

              response.on('error', function (error) {
                self.handleError(error);
              });
            };

            // Error handler for the request
            var errorHandler = function (error) {
              self.handleError(error);
            };

            // Create the request
            request = doRequest(options, responseHandler).on(
              'error',
              errorHandler,
            );

            if (opts.autoUnref) {
              request.on('socket', (socket) => {
                socket.unref();
              });
            }

            // Node 0.4 and later won't accept empty data. Make sure it's needed.
            if (data) {
              request.write(data);
            }

            request.end();

            self.dispatchEvent('loadstart');
          } else {
            // Synchronous
            // Create a temporary file for communication with the other Node process
            var contentFile = '.node-xmlhttprequest-content-' + process.pid;
            var syncFile = '.node-xmlhttprequest-sync-' + process.pid;
            fs.writeFileSync(syncFile, '', 'utf8');
            // The async request the other Node process executes
            var execString =
              "var http = require('http'), https = require('https'), fs = require('fs');" +
              'var doRequest = http' +
              (ssl ? 's' : '') +
              '.request;' +
              'var options = ' +
              JSON.stringify(options) +
              ';' +
              "var responseText = '';" +
              'var req = doRequest(options, function(response) {' +
              "response.setEncoding('utf8');" +
              "response.on('data', function(chunk) {" +
              '  responseText += chunk;' +
              '});' +
              "response.on('end', function() {" +
              "fs.writeFileSync('" +
              contentFile +
              "', 'NODE-XMLHTTPREQUEST-STATUS:' + response.statusCode + ',' + responseText, 'utf8');" +
              "fs.unlinkSync('" +
              syncFile +
              "');" +
              '});' +
              "response.on('error', function(error) {" +
              "fs.writeFileSync('" +
              contentFile +
              "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');" +
              "fs.unlinkSync('" +
              syncFile +
              "');" +
              '});' +
              "}).on('error', function(error) {" +
              "fs.writeFileSync('" +
              contentFile +
              "', 'NODE-XMLHTTPREQUEST-ERROR:' + JSON.stringify(error), 'utf8');" +
              "fs.unlinkSync('" +
              syncFile +
              "');" +
              '});' +
              (data
                ? "req.write('" +
                  JSON.stringify(data).slice(1, -1).replace(/'/g, "\\'") +
                  "');"
                : '') +
              'req.end();';
            // Start the other Node Process, executing this string
            var syncProc = spawn(process.argv[0], ['-e', execString]);
            var statusText;
            while (fs.existsSync(syncFile)) {
              // Wait while the sync file is empty
            }
            self.responseText = fs.readFileSync(contentFile, 'utf8');
            // Kill the child process once the file has data
            syncProc.stdin.end();
            // Remove the temporary file
            fs.unlinkSync(contentFile);
            if (self.responseText.match(/^NODE-XMLHTTPREQUEST-ERROR:/)) {
              // If the file returned an error, handle it
              var errorObj = self.responseText.replace(
                /^NODE-XMLHTTPREQUEST-ERROR:/,
                '',
              );
              self.handleError(errorObj, 503);
            } else {
              // If the file returned okay, parse its data and move to the DONE state
              self.status = self.responseText.replace(
                /^NODE-XMLHTTPREQUEST-STATUS:([0-9]*),.*/,
                '$1',
              );
              self.responseText = self.responseText.replace(
                /^NODE-XMLHTTPREQUEST-STATUS:[0-9]*,(.*)/,
                '$1',
              );
              setState(self.DONE);
            }
          }
        };

        /**
         * Called when an error is encountered to deal with it.
         * @param  status  {number}    HTTP status code to use rather than the default (0) for XHR errors.
         */
        this.handleError = function (error, status) {
          this.status = status || 0;
          this.statusText = error;
          this.responseText = error.stack;
          errorFlag = true;
          setState(this.DONE);
        };

        /**
         * Aborts a request.
         */
        this.abort = function () {
          if (request) {
            request.abort();
            request = null;
          }

          headers = Object.assign({}, defaultHeaders);
          this.responseText = '';
          this.responseXML = '';

          errorFlag = abortedFlag = true;
          if (
            this.readyState !== this.UNSENT &&
            (this.readyState !== this.OPENED || sendFlag) &&
            this.readyState !== this.DONE
          ) {
            sendFlag = false;
            setState(this.DONE);
          }
          this.readyState = this.UNSENT;
        };

        /**
         * Adds an event listener. Preferred method of binding to events.
         */
        this.addEventListener = function (event, callback) {
          if (!(event in listeners)) {
            listeners[event] = [];
          }
          // Currently allows duplicate callbacks. Should it?
          listeners[event].push(callback);
        };

        /**
         * Remove an event callback that has already been bound.
         * Only works on the matching funciton, cannot be a copy.
         */
        this.removeEventListener = function (event, callback) {
          if (event in listeners) {
            // Filter will return a new array with the callback removed
            listeners[event] = listeners[event].filter(function (ev) {
              return ev !== callback;
            });
          }
        };

        /**
         * Dispatch any events, including both "on" methods and events attached using addEventListener.
         */
        this.dispatchEvent = function (event) {
          if (typeof self['on' + event] === 'function') {
            if (this.readyState === this.DONE)
              setImmediate(function () {
                self['on' + event]();
              });
            else self['on' + event]();
          }
          if (event in listeners) {
            for (let i = 0, len = listeners[event].length; i < len; i++) {
              if (this.readyState === this.DONE)
                setImmediate(function () {
                  listeners[event][i].call(self);
                });
              else listeners[event][i].call(self);
            }
          }
        };

        /**
         * Changes readyState and calls onreadystatechange.
         *
         * @param int state New state
         */
        var setState = function (state) {
          if (
            self.readyState === state ||
            (self.readyState === self.UNSENT && abortedFlag)
          )
            return;

          self.readyState = state;

          if (
            settings.async ||
            self.readyState < self.OPENED ||
            self.readyState === self.DONE
          ) {
            self.dispatchEvent('readystatechange');
          }

          if (self.readyState === self.DONE) {
            let fire;

            if (abortedFlag) fire = 'abort';
            else if (errorFlag) fire = 'error';
            else fire = 'load';

            self.dispatchEvent(fire);

            // @TODO figure out InspectorInstrumentation::didLoadXHR(cookie)
            self.dispatchEvent('loadend');
          }
        };
      }

      /***/
    },

    /***/ 6041: /***/ (module) => {
      'use strict';

      var alphabet =
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(
            '',
          ),
        length = 64,
        map = {},
        seed = 0,
        i = 0,
        prev;

      /**
       * Return a string representing the specified number.
       *
       * @param {Number} num The number to convert.
       * @returns {String} The string representation of the number.
       * @api public
       */
      function encode(num) {
        var encoded = '';

        do {
          encoded = alphabet[num % length] + encoded;
          num = Math.floor(num / length);
        } while (num > 0);

        return encoded;
      }

      /**
       * Return the integer value specified by the given string.
       *
       * @param {String} str The string to convert.
       * @returns {Number} The integer value represented by the string.
       * @api public
       */
      function decode(str) {
        var decoded = 0;

        for (i = 0; i < str.length; i++) {
          decoded = decoded * length + map[str.charAt(i)];
        }

        return decoded;
      }

      /**
       * Yeast: A tiny growing id generator.
       *
       * @returns {String} A unique id.
       * @api public
       */
      function yeast() {
        var now = encode(+new Date());

        if (now !== prev) return (seed = 0), (prev = now);
        return now + '.' + encode(seed++);
      }

      //
      // Map each character to its index.
      //
      for (; i < length; i++) map[alphabet[i]] = i;

      //
      // Expose the `yeast`, `encode` and `decode` functions.
      //
      yeast.encode = encode;
      yeast.decode = decode;
      module.exports = yeast;

      /***/
    },

    /***/ 8966: /***/ (module) => {
      module.exports = eval('require')('bufferutil');

      /***/
    },

    /***/ 5013: /***/ (module) => {
      module.exports = eval('require')('utf-8-validate');

      /***/
    },

    /***/ 3129: /***/ (module) => {
      'use strict';
      module.exports = require('child_process');

      /***/
    },

    /***/ 6417: /***/ (module) => {
      'use strict';
      module.exports = require('crypto');

      /***/
    },

    /***/ 8614: /***/ (module) => {
      'use strict';
      module.exports = require('events');

      /***/
    },

    /***/ 5747: /***/ (module) => {
      'use strict';
      module.exports = require('fs');

      /***/
    },

    /***/ 8605: /***/ (module) => {
      'use strict';
      module.exports = require('http');

      /***/
    },

    /***/ 7211: /***/ (module) => {
      'use strict';
      module.exports = require('https');

      /***/
    },

    /***/ 1631: /***/ (module) => {
      'use strict';
      module.exports = require('net');

      /***/
    },

    /***/ 2087: /***/ (module) => {
      'use strict';
      module.exports = require('os');

      /***/
    },

    /***/ 2413: /***/ (module) => {
      'use strict';
      module.exports = require('stream');

      /***/
    },

    /***/ 4016: /***/ (module) => {
      'use strict';
      module.exports = require('tls');

      /***/
    },

    /***/ 3867: /***/ (module) => {
      'use strict';
      module.exports = require('tty');

      /***/
    },

    /***/ 8835: /***/ (module) => {
      'use strict';
      module.exports = require('url');

      /***/
    },

    /***/ 1669: /***/ (module) => {
      'use strict';
      module.exports = require('util');

      /***/
    },

    /***/ 8761: /***/ (module) => {
      'use strict';
      module.exports = require('zlib');

      /***/
    },

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __nccwpck_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ var threw = true;
    /******/ try {
      /******/ __webpack_modules__[moduleId].call(
        module.exports,
        module,
        module.exports,
        __nccwpck_require__,
      );
      /******/ threw = false;
      /******/
    } finally {
      /******/ if (threw) delete __webpack_module_cache__[moduleId];
      /******/
    }
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/compat */
  /******/
  /******/ if (typeof __nccwpck_require__ !== 'undefined')
    __nccwpck_require__.ab = __dirname + '/';
  /******/
  /************************************************************************/
  var __webpack_exports__ = {};
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  (() => {
    const { ipcRenderer } = require('electron');

    window.utools = utools;
    window.ipcRenderer = ipcRenderer;

    const io = __nccwpck_require__(7303);
    window.socketClient = io;
  })();

  module.exports = __webpack_exports__;
  /******/
})();
