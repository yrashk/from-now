import './moment-import.js';
/**
 * `from-now`
 * A polymer element that strategically updates its output based on the age
 * of `time`. The default output is the relative time (e.g. 8 hours ago).
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
Polymer({
  _template: Polymer.html`
[[output]]
`,

  is: 'from-now',

  properties: {
    /**
    * The time to measure to/from now.
    * Unix epoch time in milliseconds.
    */
    time: {
      type: Number,
    },
    /** @deprecated
    * Whether to allow the time to be in the future, e.g. "in 5 seconds".
    * When comparing client and server timestamps, past events can sometimes
    * appear to be in the future. By default future times are negated so
    * they are described as in the past.
    */
    allowFuture: {
      type: Boolean,
      value: false,
    },
    /**
    * Whether to disable updating the outputted time.
    */
    idle: {
      type: Boolean,
      value: false
    },
    /**
    * The relative time e.g. "8 hours ago"
    */
    relative: {
      type: String,
      notify: true,
      readOnly: true
    },
    /**
    * The absolute time e.g. "Today at 4:30 PM"
    */
    absolute: {
      type: String,
      notify: true,
      readOnly: true
    },
    /** @deprecated
    * The output of this element, either `relative` or `absolute`,
    * depending on `useAbsolute`.
    */
    output: {
      type: String,
      notify: true,
      readOnly: true
    },
    /** @deprecated
    * Whether to use the absolute value as the outout.
    */
    useAbsolute: {
      type: Boolean,
      value: false,
    },
    /**
    * The date format to use for the absolute time. If left empty,
    * a dynamic format is used, based on moment(time).calendar().
    *
    * See https://momentjs.com/docs/#/parsing/string-format/
    *
    * Examples:
    *   * YYYY-MM-DD HH:mm:ss
    *   * MM/DD/YYYY hh:mm a
    *   * Do of MMM, YYYY at hh:mm a
    */
    format: {
      type: String,
      value: ''
    }
  },

  observers: [
    '_inputsChanged(time, allowFuture, idle, format, useAbsolute)'
  ],

  _inputsChanged: function(time, allowFuture, idle, format, useAbsolute) {
    if (time) {
      var now = Date.now();
      if (idle) {
        clearTimeout(this._timeout);
      } else {
        this._addTimeout(Math.abs(now - time));
      }
      this._setProperty('relative', (allowFuture || time <= now) ? moment(time).fromNow() : moment(time).toNow());
      this._setProperty('absolute', format ? moment(time).format(format) : moment(time).calendar());
      this._setProperty('output', useAbsolute ? this.absolute : this.relative);
      this.setAttribute('title', useAbsolute ? this.relative : this.absolute);
    } else {
      this._setProperty('relative', '');
      this._setProperty('absolute', '');
      this._setProperty('output', '');
      this.setAttribute('title', '');
    }
  },

  _addTimeout: function(diff) {
    var timeout;
    if (diff < 60 * 1000) {                     // If less than one minute,
      timeout = 15 * 1000;                      // update every 15 seconds.
    } else if (diff < 60 * 60 * 1000) {         // If less than one hour,
      timeout = 60 * 1000;                      // update every minute.
    } else if (diff < 24 * 60 * 60 * 1000) {    // If less than one day,
      timeout = 60 * 60 * 1000;                 // update every hour.
    } else {                                    // Otherwise,
      timeout = 24 * 60 * 60 * 1000;            // update once per day.
    }
    this._timeout = setTimeout(() => {
      this._inputsChanged(this.time, this.allowFuture,
        this.idle, this.format, this.useAbsolute);
    }, timeout);
  }
});
