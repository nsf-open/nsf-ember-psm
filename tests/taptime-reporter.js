/* eslint-disable object-shorthand, prefer-template, no-var, vars-on-top */

// TAP formatted output with timing added
function TapTimeReporter(out, silent) {
  this.start = process.hrtime();
  this.last = process.hrtime();
  this.out = out || process.stdout;
  this.silent = silent;
  this.total = 0;
  this.pass = 0;
  this.current = 1;
}


TapTimeReporter.prototype = {
  report: function(prefix, data) {
    this.total += 1;

    if (data.passed) {
      this.pass += 1;
    }

    if (!this.silent) {
      data.time = this.getLastTimestamp();
      this.out.write(this.getHeadContent(prefix, data));
      this.out.write(this.getBodyContent(prefix, data));
    }

    this.current += 1;
  },


  finish: function() {
    if (this.silent) {
      return;
    }

    var results =
      '1..' + this.total + '\n' +
      '# tests ' + this.total + '\n' +
      '# pass  ' + this.pass + '\n' +
      '# fail  ' + (this.total - this.pass) + '\n' +
      '# time  ' + this.formatToSec(this.diffTimestamp(this.start));

    if (this.pass === this.total) {
      results += '\n\n# ok';
    }

    results += '\n';

    this.out.write(results);
  },

  getHeadContent: function(prefix, data) {
    var status = (data.passed) ? 'ok ' : 'not ok ';
    var count = this.current + ' ';
    var name = (data.name) ? data.name.trim() : '';
    prefix = (prefix) ? prefix + ' - ' : '';

    return status + count + prefix + name + '\n';
  },


  getBodyContent: function(prefix, data) {
    var self = this;
    var testLogs = [];
    var timeLogs = [];
    var failLogs = [];

    // General logs
    if (data.logs) {
      testLogs = data.logs.map(
        function(log) {
          return self.indent(String(log));
        }
      );

      testLogs.unshift('Log: |');
    }

    // Duration timestamp
    if (data.time) {
      timeLogs.push('duration_ms: ' + data.time);
    }

    // Error logs
    if (data.error) {
      failLogs = Object.keys(data.error)
        .filter(
          function(key) {
            return key !== 'passed'
          }
        ).map(
          function(key) {
            return key + ': >\n' + self.indent(String(data.error[key]));
          }
        );
    }

    return self.indent('---\n' + self.indent(failLogs.concat(testLogs).concat(timeLogs).join('\n')) + '\n...') + '\n';
  },


  getLastTimestamp: function() {
    var hrTime = this.diffTimestamp(this.last);
    this.last = process.hrtime();

    return this.formatToMs(hrTime);
  },


  diffTimestamp: function(stamp) {
    var diff = process.hrtime(stamp);
    return (diff[0] * 1e9) + stamp[1];
  },


  formatToMs: function(ns) {
    // From nanoseconds
    return (ns / 1e6).toFixed(3) + 'ms';
  },


  formatToSec: function(ns) {
    // From nanoseconds
    return (ns / 1e9).toFixed(3) + 'sec';
  },


  indent: function(text, width) {
    return text.split('\n').map(function(line) {
      return new Array((width || 4) + 1).join(' ') + line;
    }).join('\n')
  }
};


module.exports = TapTimeReporter;
