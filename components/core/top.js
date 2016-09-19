/* eslint-disable */

// product-specific cuts-the-mustard test (customise for your needs)
window.cutsTheMustard = (typeof Function.prototype.bind !== 'undefined');

;(function(){

function add_script(src, async, defer, cb) {
    var script = document.createElement('script');
    script.src = src;
    script.async = !!async;
    if (defer) script.defer = !!defer;
    var oldScript = document.getElementsByTagName('script')[0];
    if (!cb && typeof defer === 'function') {
      cb = defer;
    }

    if (typeof cb === 'function') {
      if (script.hasOwnProperty('onreadystatechange')) {
        script.onreadystatechange = function() {
          if (script.readyState === 'loaded') {
            cb();
          }
        };
      } else {
        script.onload = cb;
      }
    }
    oldScript.parentNode.appendChild(script);
    return script;
}

function exec(script) {
  if (!window.cutsTheMustard) return;
  var s = typeof script;
  if (s === 'string') {
    try {
      add_script.apply(window, arguments);
    } catch(e) {}
  } else if (s === 'function') {
    try {
      script();
    } catch(e) {}
  } else if (script) {
    try{
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < script.length; i++) {
        exec.apply(window, [script[i]].concat(args));
      }
    } catch(e){}
  }
}

var queued_scripts = [];
var low_priority_queue = [];

function queue(src, cb, low_priority) {
  var args = [src, true, !!low_priority, cb];

  if (!queued_scripts) {
    exec.apply(window, args);
    return;
  }

  if (low_priority) {
    low_priority_queue.push(args);
  } else {
    queued_scripts.push(args);
  }
}

function empty_queue(q) {
  var arr = q.slice(0);
  for (var i = 0; i < arr.length; i++) {
    exec.apply(window, arr[i]);
  }
}

function clear_queue() {
  empty_queue(queued_scripts);
  queued_scripts = null;
  var callback = low_priority_queue.length
                        ? low_priority_queue[low_priority_queue.length - 1][3]
                        : null;

  var done = function () {
    document.documentElement.className = document.documentElement.className + ' js-success';
  }

  var onLoaded = typeof callback !== 'function' ? done : function() {
    callback();
    done();
  }

  if (low_priority_queue.length) {
    low_priority_queue[low_priority_queue.length - 1][3] = onLoaded;
  } else {
    setTimeout(function(){onLoaded()},1);
  }

  empty_queue(low_priority_queue);
  low_priority_queue = null;
}

window.queue = queue;
window.clear_queue = clear_queue;
window.exec = exec;

exec(function(){
  window.isNext = document.cookie.indexOf('FT_SITE=NEXT') !== -1;
  window.isLoggedIn = document.cookie.indexOf('FTSession=') !== -1;
  document.documentElement.className = document.documentElement.className.replace(/\bcore\b/g, [
    'enhanced',
    (window.isNext ? 'is-next' : 'is-falcon'),
    (window.isLoggedIn ? 'is-loggedin' : 'is-anonymous')
  ].join(' '));
});

// Load the polyfill service with custom features. Exclude big unneeded polyfills.
// and use ?callback= to clear the queue of scripts to load
var polyfill_features = [
  'default',
  'requestAnimationFrame',
  'Promise',
  'matchMedia',
  'HTMLPictureElement',
  'fetch|always|gated'
];

var polfill_url = 'https://cdn.polyfill.io/v2/polyfill.min.js?callback=clear_queue&features='
                    + polyfill_features.join(',')
                    + '&excludes=Symbol,Symbol.iterator,Symbol.species,Map,Set';

exec(polfill_url, true, true)

}());