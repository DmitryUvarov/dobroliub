(function (factory) {
    typeof define === 'function' && define.amd ? define('main', factory) :
    factory();
}((function () { 'use strict';

    /**
     * SSR Window 4.0.2
     * Better handling for window object in SSR environment
     * https://github.com/nolimits4web/ssr-window
     *
     * Copyright 2021, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: December 13, 2021
     */

    /* eslint-disable no-param-reassign */
    function isObject(obj) {
      return obj !== null && typeof obj === 'object' && 'constructor' in obj && obj.constructor === Object;
    }

    function extend(target = {}, src = {}) {
      Object.keys(src).forEach(key => {
        if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject(src[key]) && isObject(target[key]) && Object.keys(src[key]).length > 0) {
          extend(target[key], src[key]);
        }
      });
    }

    const ssrDocument = {
      body: {},

      addEventListener() {},

      removeEventListener() {},

      activeElement: {
        blur() {},

        nodeName: ''
      },

      querySelector() {
        return null;
      },

      querySelectorAll() {
        return [];
      },

      getElementById() {
        return null;
      },

      createEvent() {
        return {
          initEvent() {}

        };
      },

      createElement() {
        return {
          children: [],
          childNodes: [],
          style: {},

          setAttribute() {},

          getElementsByTagName() {
            return [];
          }

        };
      },

      createElementNS() {
        return {};
      },

      importNode() {
        return null;
      },

      location: {
        hash: '',
        host: '',
        hostname: '',
        href: '',
        origin: '',
        pathname: '',
        protocol: '',
        search: ''
      }
    };

    function getDocument() {
      const doc = typeof document !== 'undefined' ? document : {};
      extend(doc, ssrDocument);
      return doc;
    }

    const ssrWindow = {
      document: ssrDocument,
      navigator: {
        userAgent: ''
      },
      location: {
        hash: '',
        host: '',
        hostname: '',
        href: '',
        origin: '',
        pathname: '',
        protocol: '',
        search: ''
      },
      history: {
        replaceState() {},

        pushState() {},

        go() {},

        back() {}

      },
      CustomEvent: function CustomEvent() {
        return this;
      },

      addEventListener() {},

      removeEventListener() {},

      getComputedStyle() {
        return {
          getPropertyValue() {
            return '';
          }

        };
      },

      Image() {},

      Date() {},

      screen: {},

      setTimeout() {},

      clearTimeout() {},

      matchMedia() {
        return {};
      },

      requestAnimationFrame(callback) {
        if (typeof setTimeout === 'undefined') {
          callback();
          return null;
        }

        return setTimeout(callback, 0);
      },

      cancelAnimationFrame(id) {
        if (typeof setTimeout === 'undefined') {
          return;
        }

        clearTimeout(id);
      }

    };

    function getWindow() {
      const win = typeof window !== 'undefined' ? window : {};
      extend(win, ssrWindow);
      return win;
    }

    /**
     * Dom7 4.0.4
     * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
     * https://framework7.io/docs/dom7.html
     *
     * Copyright 2022, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: January 11, 2022
     */
    /* eslint-disable no-proto */

    function makeReactive(obj) {
      const proto = obj.__proto__;
      Object.defineProperty(obj, '__proto__', {
        get() {
          return proto;
        },

        set(value) {
          proto.__proto__ = value;
        }

      });
    }

    class Dom7 extends Array {
      constructor(items) {
        if (typeof items === 'number') {
          super(items);
        } else {
          super(...(items || []));
          makeReactive(this);
        }
      }

    }

    function arrayFlat(arr = []) {
      const res = [];
      arr.forEach(el => {
        if (Array.isArray(el)) {
          res.push(...arrayFlat(el));
        } else {
          res.push(el);
        }
      });
      return res;
    }

    function arrayFilter(arr, callback) {
      return Array.prototype.filter.call(arr, callback);
    }

    function arrayUnique(arr) {
      const uniqueArray = [];

      for (let i = 0; i < arr.length; i += 1) {
        if (uniqueArray.indexOf(arr[i]) === -1) uniqueArray.push(arr[i]);
      }

      return uniqueArray;
    }


    function qsa(selector, context) {
      if (typeof selector !== 'string') {
        return [selector];
      }

      const a = [];
      const res = context.querySelectorAll(selector);

      for (let i = 0; i < res.length; i += 1) {
        a.push(res[i]);
      }

      return a;
    }

    function $(selector, context) {
      const window = getWindow();
      const document = getDocument();
      let arr = [];

      if (!context && selector instanceof Dom7) {
        return selector;
      }

      if (!selector) {
        return new Dom7(arr);
      }

      if (typeof selector === 'string') {
        const html = selector.trim();

        if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
          let toCreate = 'div';
          if (html.indexOf('<li') === 0) toCreate = 'ul';
          if (html.indexOf('<tr') === 0) toCreate = 'tbody';
          if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
          if (html.indexOf('<tbody') === 0) toCreate = 'table';
          if (html.indexOf('<option') === 0) toCreate = 'select';
          const tempParent = document.createElement(toCreate);
          tempParent.innerHTML = html;

          for (let i = 0; i < tempParent.childNodes.length; i += 1) {
            arr.push(tempParent.childNodes[i]);
          }
        } else {
          arr = qsa(selector.trim(), context || document);
        } // arr = qsa(selector, document);

      } else if (selector.nodeType || selector === window || selector === document) {
        arr.push(selector);
      } else if (Array.isArray(selector)) {
        if (selector instanceof Dom7) return selector;
        arr = selector;
      }

      return new Dom7(arrayUnique(arr));
    }

    $.fn = Dom7.prototype; // eslint-disable-next-line

    function addClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      this.forEach(el => {
        el.classList.add(...classNames);
      });
      return this;
    }

    function removeClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      this.forEach(el => {
        el.classList.remove(...classNames);
      });
      return this;
    }

    function toggleClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      this.forEach(el => {
        classNames.forEach(className => {
          el.classList.toggle(className);
        });
      });
    }

    function hasClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      return arrayFilter(this, el => {
        return classNames.filter(className => el.classList.contains(className)).length > 0;
      }).length > 0;
    }

    function attr(attrs, value) {
      if (arguments.length === 1 && typeof attrs === 'string') {
        // Get attr
        if (this[0]) return this[0].getAttribute(attrs);
        return undefined;
      } // Set attrs


      for (let i = 0; i < this.length; i += 1) {
        if (arguments.length === 2) {
          // String
          this[i].setAttribute(attrs, value);
        } else {
          // Object
          for (const attrName in attrs) {
            this[i][attrName] = attrs[attrName];
            this[i].setAttribute(attrName, attrs[attrName]);
          }
        }
      }

      return this;
    }

    function removeAttr(attr) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].removeAttribute(attr);
      }

      return this;
    }

    function transform(transform) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].style.transform = transform;
      }

      return this;
    }

    function transition(duration) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].style.transitionDuration = typeof duration !== 'string' ? `${duration}ms` : duration;
      }

      return this;
    }

    function on(...args) {
      let [eventType, targetSelector, listener, capture] = args;

      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }

      if (!capture) capture = false;

      function handleLiveEvent(e) {
        const target = e.target;
        if (!target) return;
        const eventData = e.target.dom7EventData || [];

        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }

        if ($(target).is(targetSelector)) listener.apply(target, eventData);else {
          const parents = $(target).parents(); // eslint-disable-line

          for (let k = 0; k < parents.length; k += 1) {
            if ($(parents[k]).is(targetSelector)) listener.apply(parents[k], eventData);
          }
        }
      }

      function handleEvent(e) {
        const eventData = e && e.target ? e.target.dom7EventData || [] : [];

        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }

        listener.apply(this, eventData);
      }

      const events = eventType.split(' ');
      let j;

      for (let i = 0; i < this.length; i += 1) {
        const el = this[i];

        if (!targetSelector) {
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7Listeners) el.dom7Listeners = {};
            if (!el.dom7Listeners[event]) el.dom7Listeners[event] = [];
            el.dom7Listeners[event].push({
              listener,
              proxyListener: handleEvent
            });
            el.addEventListener(event, handleEvent, capture);
          }
        } else {
          // Live events
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7LiveListeners) el.dom7LiveListeners = {};
            if (!el.dom7LiveListeners[event]) el.dom7LiveListeners[event] = [];
            el.dom7LiveListeners[event].push({
              listener,
              proxyListener: handleLiveEvent
            });
            el.addEventListener(event, handleLiveEvent, capture);
          }
        }
      }

      return this;
    }

    function off(...args) {
      let [eventType, targetSelector, listener, capture] = args;

      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }

      if (!capture) capture = false;
      const events = eventType.split(' ');

      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];

        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];
          let handlers;

          if (!targetSelector && el.dom7Listeners) {
            handlers = el.dom7Listeners[event];
          } else if (targetSelector && el.dom7LiveListeners) {
            handlers = el.dom7LiveListeners[event];
          }

          if (handlers && handlers.length) {
            for (let k = handlers.length - 1; k >= 0; k -= 1) {
              const handler = handlers[k];

              if (listener && handler.listener === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (listener && handler.listener && handler.listener.dom7proxy && handler.listener.dom7proxy === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (!listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              }
            }
          }
        }
      }

      return this;
    }

    function trigger(...args) {
      const window = getWindow();
      const events = args[0].split(' ');
      const eventData = args[1];

      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];

        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];

          if (window.CustomEvent) {
            const evt = new window.CustomEvent(event, {
              detail: eventData,
              bubbles: true,
              cancelable: true
            });
            el.dom7EventData = args.filter((data, dataIndex) => dataIndex > 0);
            el.dispatchEvent(evt);
            el.dom7EventData = [];
            delete el.dom7EventData;
          }
        }
      }

      return this;
    }

    function transitionEnd(callback) {
      const dom = this;

      function fireCallBack(e) {
        if (e.target !== this) return;
        callback.call(this, e);
        dom.off('transitionend', fireCallBack);
      }

      if (callback) {
        dom.on('transitionend', fireCallBack);
      }

      return this;
    }

    function outerWidth(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          const styles = this.styles();
          return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
        }

        return this[0].offsetWidth;
      }

      return null;
    }

    function outerHeight(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          const styles = this.styles();
          return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
        }

        return this[0].offsetHeight;
      }

      return null;
    }

    function offset() {
      if (this.length > 0) {
        const window = getWindow();
        const document = getDocument();
        const el = this[0];
        const box = el.getBoundingClientRect();
        const body = document.body;
        const clientTop = el.clientTop || body.clientTop || 0;
        const clientLeft = el.clientLeft || body.clientLeft || 0;
        const scrollTop = el === window ? window.scrollY : el.scrollTop;
        const scrollLeft = el === window ? window.scrollX : el.scrollLeft;
        return {
          top: box.top + scrollTop - clientTop,
          left: box.left + scrollLeft - clientLeft
        };
      }

      return null;
    }

    function styles() {
      const window = getWindow();
      if (this[0]) return window.getComputedStyle(this[0], null);
      return {};
    }

    function css(props, value) {
      const window = getWindow();
      let i;

      if (arguments.length === 1) {
        if (typeof props === 'string') {
          // .css('width')
          if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
        } else {
          // .css({ width: '100px' })
          for (i = 0; i < this.length; i += 1) {
            for (const prop in props) {
              this[i].style[prop] = props[prop];
            }
          }

          return this;
        }
      }

      if (arguments.length === 2 && typeof props === 'string') {
        // .css('width', '100px')
        for (i = 0; i < this.length; i += 1) {
          this[i].style[props] = value;
        }

        return this;
      }

      return this;
    }

    function each(callback) {
      if (!callback) return this;
      this.forEach((el, index) => {
        callback.apply(el, [el, index]);
      });
      return this;
    }

    function filter(callback) {
      const result = arrayFilter(this, callback);
      return $(result);
    }

    function html(html) {
      if (typeof html === 'undefined') {
        return this[0] ? this[0].innerHTML : null;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].innerHTML = html;
      }

      return this;
    }

    function text(text) {
      if (typeof text === 'undefined') {
        return this[0] ? this[0].textContent.trim() : null;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].textContent = text;
      }

      return this;
    }

    function is(selector) {
      const window = getWindow();
      const document = getDocument();
      const el = this[0];
      let compareWith;
      let i;
      if (!el || typeof selector === 'undefined') return false;

      if (typeof selector === 'string') {
        if (el.matches) return el.matches(selector);
        if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
        if (el.msMatchesSelector) return el.msMatchesSelector(selector);
        compareWith = $(selector);

        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }

        return false;
      }

      if (selector === document) {
        return el === document;
      }

      if (selector === window) {
        return el === window;
      }

      if (selector.nodeType || selector instanceof Dom7) {
        compareWith = selector.nodeType ? [selector] : selector;

        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }

        return false;
      }

      return false;
    }

    function index() {
      let child = this[0];
      let i;

      if (child) {
        i = 0; // eslint-disable-next-line

        while ((child = child.previousSibling) !== null) {
          if (child.nodeType === 1) i += 1;
        }

        return i;
      }

      return undefined;
    }

    function eq(index) {
      if (typeof index === 'undefined') return this;
      const length = this.length;

      if (index > length - 1) {
        return $([]);
      }

      if (index < 0) {
        const returnIndex = length + index;
        if (returnIndex < 0) return $([]);
        return $([this[returnIndex]]);
      }

      return $([this[index]]);
    }

    function append(...els) {
      let newChild;
      const document = getDocument();

      for (let k = 0; k < els.length; k += 1) {
        newChild = els[k];

        for (let i = 0; i < this.length; i += 1) {
          if (typeof newChild === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newChild;

            while (tempDiv.firstChild) {
              this[i].appendChild(tempDiv.firstChild);
            }
          } else if (newChild instanceof Dom7) {
            for (let j = 0; j < newChild.length; j += 1) {
              this[i].appendChild(newChild[j]);
            }
          } else {
            this[i].appendChild(newChild);
          }
        }
      }

      return this;
    }

    function prepend(newChild) {
      const document = getDocument();
      let i;
      let j;

      for (i = 0; i < this.length; i += 1) {
        if (typeof newChild === 'string') {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newChild;

          for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
          }
        } else if (newChild instanceof Dom7) {
          for (j = 0; j < newChild.length; j += 1) {
            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
          }
        } else {
          this[i].insertBefore(newChild, this[i].childNodes[0]);
        }
      }

      return this;
    }

    function next(selector) {
      if (this.length > 0) {
        if (selector) {
          if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
            return $([this[0].nextElementSibling]);
          }

          return $([]);
        }

        if (this[0].nextElementSibling) return $([this[0].nextElementSibling]);
        return $([]);
      }

      return $([]);
    }

    function nextAll(selector) {
      const nextEls = [];
      let el = this[0];
      if (!el) return $([]);

      while (el.nextElementSibling) {
        const next = el.nextElementSibling; // eslint-disable-line

        if (selector) {
          if ($(next).is(selector)) nextEls.push(next);
        } else nextEls.push(next);

        el = next;
      }

      return $(nextEls);
    }

    function prev(selector) {
      if (this.length > 0) {
        const el = this[0];

        if (selector) {
          if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
            return $([el.previousElementSibling]);
          }

          return $([]);
        }

        if (el.previousElementSibling) return $([el.previousElementSibling]);
        return $([]);
      }

      return $([]);
    }

    function prevAll(selector) {
      const prevEls = [];
      let el = this[0];
      if (!el) return $([]);

      while (el.previousElementSibling) {
        const prev = el.previousElementSibling; // eslint-disable-line

        if (selector) {
          if ($(prev).is(selector)) prevEls.push(prev);
        } else prevEls.push(prev);

        el = prev;
      }

      return $(prevEls);
    }

    function parent(selector) {
      const parents = []; // eslint-disable-line

      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode !== null) {
          if (selector) {
            if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
          } else {
            parents.push(this[i].parentNode);
          }
        }
      }

      return $(parents);
    }

    function parents(selector) {
      const parents = []; // eslint-disable-line

      for (let i = 0; i < this.length; i += 1) {
        let parent = this[i].parentNode; // eslint-disable-line

        while (parent) {
          if (selector) {
            if ($(parent).is(selector)) parents.push(parent);
          } else {
            parents.push(parent);
          }

          parent = parent.parentNode;
        }
      }

      return $(parents);
    }

    function closest(selector) {
      let closest = this; // eslint-disable-line

      if (typeof selector === 'undefined') {
        return $([]);
      }

      if (!closest.is(selector)) {
        closest = closest.parents(selector).eq(0);
      }

      return closest;
    }

    function find(selector) {
      const foundElements = [];

      for (let i = 0; i < this.length; i += 1) {
        const found = this[i].querySelectorAll(selector);

        for (let j = 0; j < found.length; j += 1) {
          foundElements.push(found[j]);
        }
      }

      return $(foundElements);
    }

    function children(selector) {
      const children = []; // eslint-disable-line

      for (let i = 0; i < this.length; i += 1) {
        const childNodes = this[i].children;

        for (let j = 0; j < childNodes.length; j += 1) {
          if (!selector || $(childNodes[j]).is(selector)) {
            children.push(childNodes[j]);
          }
        }
      }

      return $(children);
    }

    function remove() {
      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
      }

      return this;
    }

    const Methods = {
      addClass,
      removeClass,
      hasClass,
      toggleClass,
      attr,
      removeAttr,
      transform,
      transition,
      on,
      off,
      trigger,
      transitionEnd,
      outerWidth,
      outerHeight,
      styles,
      offset,
      css,
      each,
      html,
      text,
      is,
      index,
      eq,
      append,
      prepend,
      next,
      nextAll,
      prev,
      prevAll,
      parent,
      parents,
      closest,
      find,
      children,
      filter,
      remove
    };
    Object.keys(Methods).forEach(methodName => {
      Object.defineProperty($.fn, methodName, {
        value: Methods[methodName],
        writable: true
      });
    });

    function deleteProps(obj) {
      const object = obj;
      Object.keys(object).forEach(key => {
        try {
          object[key] = null;
        } catch (e) {// no getter for object
        }

        try {
          delete object[key];
        } catch (e) {// something got wrong
        }
      });
    }

    function nextTick(callback, delay) {
      if (delay === void 0) {
        delay = 0;
      }

      return setTimeout(callback, delay);
    }

    function now() {
      return Date.now();
    }

    function getComputedStyle$1(el) {
      const window = getWindow();
      let style;

      if (window.getComputedStyle) {
        style = window.getComputedStyle(el, null);
      }

      if (!style && el.currentStyle) {
        style = el.currentStyle;
      }

      if (!style) {
        style = el.style;
      }

      return style;
    }

    function getTranslate(el, axis) {
      if (axis === void 0) {
        axis = 'x';
      }

      const window = getWindow();
      let matrix;
      let curTransform;
      let transformMatrix;
      const curStyle = getComputedStyle$1(el);

      if (window.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;

        if (curTransform.split(',').length > 6) {
          curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
        } // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case


        transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
      } else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
      }

      if (axis === 'x') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); // Normal Browsers
        else curTransform = parseFloat(matrix[4]);
      }

      if (axis === 'y') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); // Normal Browsers
        else curTransform = parseFloat(matrix[5]);
      }

      return curTransform || 0;
    }

    function isObject$1(o) {
      return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
    }

    function isNode(node) {
      // eslint-disable-next-line
      if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
        return node instanceof HTMLElement;
      }

      return node && (node.nodeType === 1 || node.nodeType === 11);
    }

    function extend$1() {
      const to = Object(arguments.length <= 0 ? undefined : arguments[0]);
      const noExtend = ['__proto__', 'constructor', 'prototype'];

      for (let i = 1; i < arguments.length; i += 1) {
        const nextSource = i < 0 || arguments.length <= i ? undefined : arguments[i];

        if (nextSource !== undefined && nextSource !== null && !isNode(nextSource)) {
          const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);

          for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            const nextKey = keysArray[nextIndex];
            const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

            if (desc !== undefined && desc.enumerable) {
              if (isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
                if (nextSource[nextKey].__swiper__) {
                  to[nextKey] = nextSource[nextKey];
                } else {
                  extend$1(to[nextKey], nextSource[nextKey]);
                }
              } else if (!isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
                to[nextKey] = {};

                if (nextSource[nextKey].__swiper__) {
                  to[nextKey] = nextSource[nextKey];
                } else {
                  extend$1(to[nextKey], nextSource[nextKey]);
                }
              } else {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
      }

      return to;
    }

    function setCSSProperty(el, varName, varValue) {
      el.style.setProperty(varName, varValue);
    }

    function animateCSSModeScroll(_ref) {
      let {
        swiper,
        targetPosition,
        side
      } = _ref;
      const window = getWindow();
      const startPosition = -swiper.translate;
      let startTime = null;
      let time;
      const duration = swiper.params.speed;
      swiper.wrapperEl.style.scrollSnapType = 'none';
      window.cancelAnimationFrame(swiper.cssModeFrameID);
      const dir = targetPosition > startPosition ? 'next' : 'prev';

      const isOutOfBound = (current, target) => {
        return dir === 'next' && current >= target || dir === 'prev' && current <= target;
      };

      const animate = () => {
        time = new Date().getTime();

        if (startTime === null) {
          startTime = time;
        }

        const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
        const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);

        if (isOutOfBound(currentPosition, targetPosition)) {
          currentPosition = targetPosition;
        }

        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });

        if (isOutOfBound(currentPosition, targetPosition)) {
          swiper.wrapperEl.style.overflow = 'hidden';
          swiper.wrapperEl.style.scrollSnapType = '';
          setTimeout(() => {
            swiper.wrapperEl.style.overflow = '';
            swiper.wrapperEl.scrollTo({
              [side]: currentPosition
            });
          });
          window.cancelAnimationFrame(swiper.cssModeFrameID);
          return;
        }

        swiper.cssModeFrameID = window.requestAnimationFrame(animate);
      };

      animate();
    }

    let support;

    function calcSupport() {
      const window = getWindow();
      const document = getDocument();
      return {
        smoothScroll: document.documentElement && 'scrollBehavior' in document.documentElement.style,
        touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch),
        passiveListener: function checkPassiveListener() {
          let supportsPassive = false;

          try {
            const opts = Object.defineProperty({}, 'passive', {
              // eslint-disable-next-line
              get() {
                supportsPassive = true;
              }

            });
            window.addEventListener('testPassiveListener', null, opts);
          } catch (e) {// No support
          }

          return supportsPassive;
        }(),
        gestures: function checkGestures() {
          return 'ongesturestart' in window;
        }()
      };
    }

    function getSupport() {
      if (!support) {
        support = calcSupport();
      }

      return support;
    }

    let deviceCached;

    function calcDevice(_temp) {
      let {
        userAgent
      } = _temp === void 0 ? {} : _temp;
      const support = getSupport();
      const window = getWindow();
      const platform = window.navigator.platform;
      const ua = userAgent || window.navigator.userAgent;
      const device = {
        ios: false,
        android: false
      };
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line

      let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
      const windows = platform === 'Win32';
      let macos = platform === 'MacIntel'; // iPadOs 13 fix

      const iPadScreens = ['1024x1366', '1366x1024', '834x1194', '1194x834', '834x1112', '1112x834', '768x1024', '1024x768', '820x1180', '1180x820', '810x1080', '1080x810'];

      if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
        ipad = ua.match(/(Version)\/([\d.]+)/);
        if (!ipad) ipad = [0, 1, '13_0_0'];
        macos = false;
      } // Android


      if (android && !windows) {
        device.os = 'android';
        device.android = true;
      }

      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      } // Export object


      return device;
    }

    function getDevice(overrides) {
      if (overrides === void 0) {
        overrides = {};
      }

      if (!deviceCached) {
        deviceCached = calcDevice(overrides);
      }

      return deviceCached;
    }

    let browser;

    function calcBrowser() {
      const window = getWindow();

      function isSafari() {
        const ua = window.navigator.userAgent.toLowerCase();
        return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
      }

      return {
        isSafari: isSafari(),
        isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent)
      };
    }

    function getBrowser() {
      if (!browser) {
        browser = calcBrowser();
      }

      return browser;
    }

    function Resize(_ref) {
      let {
        swiper,
        on,
        emit
      } = _ref;
      const window = getWindow();
      let observer = null;
      let animationFrame = null;

      const resizeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        emit('beforeResize');
        emit('resize');
      };

      const createObserver = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        observer = new ResizeObserver(entries => {
          animationFrame = window.requestAnimationFrame(() => {
            const {
              width,
              height
            } = swiper;
            let newWidth = width;
            let newHeight = height;
            entries.forEach(_ref2 => {
              let {
                contentBoxSize,
                contentRect,
                target
              } = _ref2;
              if (target && target !== swiper.el) return;
              newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
              newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
            });

            if (newWidth !== width || newHeight !== height) {
              resizeHandler();
            }
          });
        });
        observer.observe(swiper.el);
      };

      const removeObserver = () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }

        if (observer && observer.unobserve && swiper.el) {
          observer.unobserve(swiper.el);
          observer = null;
        }
      };

      const orientationChangeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        emit('orientationchange');
      };

      on('init', () => {
        if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
          createObserver();
          return;
        }

        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', orientationChangeHandler);
      });
      on('destroy', () => {
        removeObserver();
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('orientationchange', orientationChangeHandler);
      });
    }

    function Observer(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const observers = [];
      const window = getWindow();

      const attach = function (target, options) {
        if (options === void 0) {
          options = {};
        }

        const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
        const observer = new ObserverFunc(mutations => {
          // The observerUpdate event should only be triggered
          // once despite the number of mutations.  Additional
          // triggers are redundant and are very costly
          if (mutations.length === 1) {
            emit('observerUpdate', mutations[0]);
            return;
          }

          const observerUpdate = function observerUpdate() {
            emit('observerUpdate', mutations[0]);
          };

          if (window.requestAnimationFrame) {
            window.requestAnimationFrame(observerUpdate);
          } else {
            window.setTimeout(observerUpdate, 0);
          }
        });
        observer.observe(target, {
          attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
          childList: typeof options.childList === 'undefined' ? true : options.childList,
          characterData: typeof options.characterData === 'undefined' ? true : options.characterData
        });
        observers.push(observer);
      };

      const init = () => {
        if (!swiper.params.observer) return;

        if (swiper.params.observeParents) {
          const containerParents = swiper.$el.parents();

          for (let i = 0; i < containerParents.length; i += 1) {
            attach(containerParents[i]);
          }
        } // Observe container


        attach(swiper.$el[0], {
          childList: swiper.params.observeSlideChildren
        }); // Observe wrapper

        attach(swiper.$wrapperEl[0], {
          attributes: false
        });
      };

      const destroy = () => {
        observers.forEach(observer => {
          observer.disconnect();
        });
        observers.splice(0, observers.length);
      };

      extendParams({
        observer: false,
        observeParents: false,
        observeSlideChildren: false
      });
      on('init', init);
      on('destroy', destroy);
    }

    /* eslint-disable no-underscore-dangle */
    var eventsEmitter = {
      on(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';
        events.split(' ').forEach(event => {
          if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
          self.eventsListeners[event][method](handler);
        });
        return self;
      },

      once(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;

        function onceHandler() {
          self.off(events, onceHandler);

          if (onceHandler.__emitterProxy) {
            delete onceHandler.__emitterProxy;
          }

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          handler.apply(self, args);
        }

        onceHandler.__emitterProxy = handler;
        return self.on(events, onceHandler, priority);
      },

      onAny(handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';

        if (self.eventsAnyListeners.indexOf(handler) < 0) {
          self.eventsAnyListeners[method](handler);
        }

        return self;
      },

      offAny(handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsAnyListeners) return self;
        const index = self.eventsAnyListeners.indexOf(handler);

        if (index >= 0) {
          self.eventsAnyListeners.splice(index, 1);
        }

        return self;
      },

      off(events, handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsListeners) return self;
        events.split(' ').forEach(event => {
          if (typeof handler === 'undefined') {
            self.eventsListeners[event] = [];
          } else if (self.eventsListeners[event]) {
            self.eventsListeners[event].forEach((eventHandler, index) => {
              if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
                self.eventsListeners[event].splice(index, 1);
              }
            });
          }
        });
        return self;
      },

      emit() {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsListeners) return self;
        let events;
        let data;
        let context;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
          events = args[0];
          data = args.slice(1, args.length);
          context = self;
        } else {
          events = args[0].events;
          data = args[0].data;
          context = args[0].context || self;
        }

        data.unshift(context);
        const eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach(event => {
          if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
            self.eventsAnyListeners.forEach(eventHandler => {
              eventHandler.apply(context, [event, ...data]);
            });
          }

          if (self.eventsListeners && self.eventsListeners[event]) {
            self.eventsListeners[event].forEach(eventHandler => {
              eventHandler.apply(context, data);
            });
          }
        });
        return self;
      }

    };

    function updateSize() {
      const swiper = this;
      let width;
      let height;
      const $el = swiper.$el;

      if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
        width = swiper.params.width;
      } else {
        width = $el[0].clientWidth;
      }

      if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
        height = swiper.params.height;
      } else {
        height = $el[0].clientHeight;
      }

      if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
        return;
      } // Subtract paddings


      width = width - parseInt($el.css('padding-left') || 0, 10) - parseInt($el.css('padding-right') || 0, 10);
      height = height - parseInt($el.css('padding-top') || 0, 10) - parseInt($el.css('padding-bottom') || 0, 10);
      if (Number.isNaN(width)) width = 0;
      if (Number.isNaN(height)) height = 0;
      Object.assign(swiper, {
        width,
        height,
        size: swiper.isHorizontal() ? width : height
      });
    }

    function updateSlides() {
      const swiper = this;

      function getDirectionLabel(property) {
        if (swiper.isHorizontal()) {
          return property;
        } // prettier-ignore


        return {
          'width': 'height',
          'margin-top': 'margin-left',
          'margin-bottom ': 'margin-right',
          'margin-left': 'margin-top',
          'margin-right': 'margin-bottom',
          'padding-left': 'padding-top',
          'padding-right': 'padding-bottom',
          'marginRight': 'marginBottom'
        }[property];
      }

      function getDirectionPropertyValue(node, label) {
        return parseFloat(node.getPropertyValue(getDirectionLabel(label)) || 0);
      }

      const params = swiper.params;
      const {
        $wrapperEl,
        size: swiperSize,
        rtlTranslate: rtl,
        wrongRTL
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
      const slides = $wrapperEl.children(`.${swiper.params.slideClass}`);
      const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
      let snapGrid = [];
      const slidesGrid = [];
      const slidesSizesGrid = [];
      let offsetBefore = params.slidesOffsetBefore;

      if (typeof offsetBefore === 'function') {
        offsetBefore = params.slidesOffsetBefore.call(swiper);
      }

      let offsetAfter = params.slidesOffsetAfter;

      if (typeof offsetAfter === 'function') {
        offsetAfter = params.slidesOffsetAfter.call(swiper);
      }

      const previousSnapGridLength = swiper.snapGrid.length;
      const previousSlidesGridLength = swiper.slidesGrid.length;
      let spaceBetween = params.spaceBetween;
      let slidePosition = -offsetBefore;
      let prevSlideSize = 0;
      let index = 0;

      if (typeof swiperSize === 'undefined') {
        return;
      }

      if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
      }

      swiper.virtualSize = -spaceBetween; // reset margins

      if (rtl) slides.css({
        marginLeft: '',
        marginBottom: '',
        marginTop: ''
      });else slides.css({
        marginRight: '',
        marginBottom: '',
        marginTop: ''
      }); // reset cssMode offsets

      if (params.centeredSlides && params.cssMode) {
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-before', '');
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-after', '');
      }

      const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;

      if (gridEnabled) {
        swiper.grid.initSlides(slidesLength);
      } // Calc slides


      let slideSize;
      const shouldResetSlideSize = params.slidesPerView === 'auto' && params.breakpoints && Object.keys(params.breakpoints).filter(key => {
        return typeof params.breakpoints[key].slidesPerView !== 'undefined';
      }).length > 0;

      for (let i = 0; i < slidesLength; i += 1) {
        slideSize = 0;
        const slide = slides.eq(i);

        if (gridEnabled) {
          swiper.grid.updateSlide(i, slide, slidesLength, getDirectionLabel);
        }

        if (slide.css('display') === 'none') continue; // eslint-disable-line

        if (params.slidesPerView === 'auto') {
          if (shouldResetSlideSize) {
            slides[i].style[getDirectionLabel('width')] = ``;
          }

          const slideStyles = getComputedStyle(slide[0]);
          const currentTransform = slide[0].style.transform;
          const currentWebKitTransform = slide[0].style.webkitTransform;

          if (currentTransform) {
            slide[0].style.transform = 'none';
          }

          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = 'none';
          }

          if (params.roundLengths) {
            slideSize = swiper.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
          } else {
            // eslint-disable-next-line
            const width = getDirectionPropertyValue(slideStyles, 'width');
            const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
            const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
            const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
            const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
            const boxSizing = slideStyles.getPropertyValue('box-sizing');

            if (boxSizing && boxSizing === 'border-box') {
              slideSize = width + marginLeft + marginRight;
            } else {
              const {
                clientWidth,
                offsetWidth
              } = slide[0];
              slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
            }
          }

          if (currentTransform) {
            slide[0].style.transform = currentTransform;
          }

          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = currentWebKitTransform;
          }

          if (params.roundLengths) slideSize = Math.floor(slideSize);
        } else {
          slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
          if (params.roundLengths) slideSize = Math.floor(slideSize);

          if (slides[i]) {
            slides[i].style[getDirectionLabel('width')] = `${slideSize}px`;
          }
        }

        if (slides[i]) {
          slides[i].swiperSlideSize = slideSize;
        }

        slidesSizesGrid.push(slideSize);

        if (params.centeredSlides) {
          slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
          if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
          if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
          if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
        } else {
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
          slidePosition = slidePosition + slideSize + spaceBetween;
        }

        swiper.virtualSize += slideSize + spaceBetween;
        prevSlideSize = slideSize;
        index += 1;
      }

      swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;

      if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
        $wrapperEl.css({
          width: `${swiper.virtualSize + params.spaceBetween}px`
        });
      }

      if (params.setWrapperSize) {
        $wrapperEl.css({
          [getDirectionLabel('width')]: `${swiper.virtualSize + params.spaceBetween}px`
        });
      }

      if (gridEnabled) {
        swiper.grid.updateWrapperSize(slideSize, snapGrid, getDirectionLabel);
      } // Remove last grid elements depending on width


      if (!params.centeredSlides) {
        const newSlidesGrid = [];

        for (let i = 0; i < snapGrid.length; i += 1) {
          let slidesGridItem = snapGrid[i];
          if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);

          if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
            newSlidesGrid.push(slidesGridItem);
          }
        }

        snapGrid = newSlidesGrid;

        if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
          snapGrid.push(swiper.virtualSize - swiperSize);
        }
      }

      if (snapGrid.length === 0) snapGrid = [0];

      if (params.spaceBetween !== 0) {
        const key = swiper.isHorizontal() && rtl ? 'marginLeft' : getDirectionLabel('marginRight');
        slides.filter((_, slideIndex) => {
          if (!params.cssMode) return true;

          if (slideIndex === slides.length - 1) {
            return false;
          }

          return true;
        }).css({
          [key]: `${spaceBetween}px`
        });
      }

      if (params.centeredSlides && params.centeredSlidesBounds) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach(slideSizeValue => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;
        const maxSnap = allSlidesSize - swiperSize;
        snapGrid = snapGrid.map(snap => {
          if (snap < 0) return -offsetBefore;
          if (snap > maxSnap) return maxSnap + offsetAfter;
          return snap;
        });
      }

      if (params.centerInsufficientSlides) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach(slideSizeValue => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;

        if (allSlidesSize < swiperSize) {
          const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
          snapGrid.forEach((snap, snapIndex) => {
            snapGrid[snapIndex] = snap - allSlidesOffset;
          });
          slidesGrid.forEach((snap, snapIndex) => {
            slidesGrid[snapIndex] = snap + allSlidesOffset;
          });
        }
      }

      Object.assign(swiper, {
        slides,
        snapGrid,
        slidesGrid,
        slidesSizesGrid
      });

      if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
        const addToSnapGrid = -swiper.snapGrid[0];
        const addToSlidesGrid = -swiper.slidesGrid[0];
        swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
        swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
      }

      if (slidesLength !== previousSlidesLength) {
        swiper.emit('slidesLengthChange');
      }

      if (snapGrid.length !== previousSnapGridLength) {
        if (swiper.params.watchOverflow) swiper.checkOverflow();
        swiper.emit('snapGridLengthChange');
      }

      if (slidesGrid.length !== previousSlidesGridLength) {
        swiper.emit('slidesGridLengthChange');
      }

      if (params.watchSlidesProgress) {
        swiper.updateSlidesOffset();
      }

      if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
        const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
        const hasClassBackfaceClassAdded = swiper.$el.hasClass(backFaceHiddenClass);

        if (slidesLength <= params.maxBackfaceHiddenSlides) {
          if (!hasClassBackfaceClassAdded) swiper.$el.addClass(backFaceHiddenClass);
        } else if (hasClassBackfaceClassAdded) {
          swiper.$el.removeClass(backFaceHiddenClass);
        }
      }
    }

    function updateAutoHeight(speed) {
      const swiper = this;
      const activeSlides = [];
      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
      let newHeight = 0;
      let i;

      if (typeof speed === 'number') {
        swiper.setTransition(speed);
      } else if (speed === true) {
        swiper.setTransition(swiper.params.speed);
      }

      const getSlideByIndex = index => {
        if (isVirtual) {
          return swiper.slides.filter(el => parseInt(el.getAttribute('data-swiper-slide-index'), 10) === index)[0];
        }

        return swiper.slides.eq(index)[0];
      }; // Find slides currently in view


      if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
        if (swiper.params.centeredSlides) {
          (swiper.visibleSlides || $([])).each(slide => {
            activeSlides.push(slide);
          });
        } else {
          for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
          }
        }
      } else {
        activeSlides.push(getSlideByIndex(swiper.activeIndex));
      } // Find new height from highest slide in view


      for (i = 0; i < activeSlides.length; i += 1) {
        if (typeof activeSlides[i] !== 'undefined') {
          const height = activeSlides[i].offsetHeight;
          newHeight = height > newHeight ? height : newHeight;
        }
      } // Update Height


      if (newHeight || newHeight === 0) swiper.$wrapperEl.css('height', `${newHeight}px`);
    }

    function updateSlidesOffset() {
      const swiper = this;
      const slides = swiper.slides;

      for (let i = 0; i < slides.length; i += 1) {
        slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
      }
    }

    function updateSlidesProgress(translate) {
      if (translate === void 0) {
        translate = this && this.translate || 0;
      }

      const swiper = this;
      const params = swiper.params;
      const {
        slides,
        rtlTranslate: rtl,
        snapGrid
      } = swiper;
      if (slides.length === 0) return;
      if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();
      let offsetCenter = -translate;
      if (rtl) offsetCenter = translate; // Visible Slides

      slides.removeClass(params.slideVisibleClass);
      swiper.visibleSlidesIndexes = [];
      swiper.visibleSlides = [];

      for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        let slideOffset = slide.swiperSlideOffset;

        if (params.cssMode && params.centeredSlides) {
          slideOffset -= slides[0].swiperSlideOffset;
        }

        const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + params.spaceBetween);
        const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + params.spaceBetween);
        const slideBefore = -(offsetCenter - slideOffset);
        const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
        const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;

        if (isVisible) {
          swiper.visibleSlides.push(slide);
          swiper.visibleSlidesIndexes.push(i);
          slides.eq(i).addClass(params.slideVisibleClass);
        }

        slide.progress = rtl ? -slideProgress : slideProgress;
        slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
      }

      swiper.visibleSlides = $(swiper.visibleSlides);
    }

    function updateProgress(translate) {
      const swiper = this;

      if (typeof translate === 'undefined') {
        const multiplier = swiper.rtlTranslate ? -1 : 1; // eslint-disable-next-line

        translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
      }

      const params = swiper.params;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      let {
        progress,
        isBeginning,
        isEnd
      } = swiper;
      const wasBeginning = isBeginning;
      const wasEnd = isEnd;

      if (translatesDiff === 0) {
        progress = 0;
        isBeginning = true;
        isEnd = true;
      } else {
        progress = (translate - swiper.minTranslate()) / translatesDiff;
        isBeginning = progress <= 0;
        isEnd = progress >= 1;
      }

      Object.assign(swiper, {
        progress,
        isBeginning,
        isEnd
      });
      if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);

      if (isBeginning && !wasBeginning) {
        swiper.emit('reachBeginning toEdge');
      }

      if (isEnd && !wasEnd) {
        swiper.emit('reachEnd toEdge');
      }

      if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
        swiper.emit('fromEdge');
      }

      swiper.emit('progress', progress);
    }

    function updateSlidesClasses() {
      const swiper = this;
      const {
        slides,
        params,
        $wrapperEl,
        activeIndex,
        realIndex
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      slides.removeClass(`${params.slideActiveClass} ${params.slideNextClass} ${params.slidePrevClass} ${params.slideDuplicateActiveClass} ${params.slideDuplicateNextClass} ${params.slideDuplicatePrevClass}`);
      let activeSlide;

      if (isVirtual) {
        activeSlide = swiper.$wrapperEl.find(`.${params.slideClass}[data-swiper-slide-index="${activeIndex}"]`);
      } else {
        activeSlide = slides.eq(activeIndex);
      } // Active classes


      activeSlide.addClass(params.slideActiveClass);

      if (params.loop) {
        // Duplicate to all looped slides
        if (activeSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${realIndex}"]`).addClass(params.slideDuplicateActiveClass);
        } else {
          $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${realIndex}"]`).addClass(params.slideDuplicateActiveClass);
        }
      } // Next Slide


      let nextSlide = activeSlide.nextAll(`.${params.slideClass}`).eq(0).addClass(params.slideNextClass);

      if (params.loop && nextSlide.length === 0) {
        nextSlide = slides.eq(0);
        nextSlide.addClass(params.slideNextClass);
      } // Prev Slide


      let prevSlide = activeSlide.prevAll(`.${params.slideClass}`).eq(0).addClass(params.slidePrevClass);

      if (params.loop && prevSlide.length === 0) {
        prevSlide = slides.eq(-1);
        prevSlide.addClass(params.slidePrevClass);
      }

      if (params.loop) {
        // Duplicate to all looped slides
        if (nextSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicateNextClass);
        } else {
          $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicateNextClass);
        }

        if (prevSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicatePrevClass);
        } else {
          $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicatePrevClass);
        }
      }

      swiper.emitSlidesClasses();
    }

    function updateActiveIndex(newActiveIndex) {
      const swiper = this;
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      const {
        slidesGrid,
        snapGrid,
        params,
        activeIndex: previousIndex,
        realIndex: previousRealIndex,
        snapIndex: previousSnapIndex
      } = swiper;
      let activeIndex = newActiveIndex;
      let snapIndex;

      if (typeof activeIndex === 'undefined') {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
              activeIndex = i;
            } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
              activeIndex = i + 1;
            }
          } else if (translate >= slidesGrid[i]) {
            activeIndex = i;
          }
        } // Normalize slideIndex


        if (params.normalizeSlideIndex) {
          if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
        }
      }

      if (snapGrid.indexOf(translate) >= 0) {
        snapIndex = snapGrid.indexOf(translate);
      } else {
        const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
        snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
      }

      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

      if (activeIndex === previousIndex) {
        if (snapIndex !== previousSnapIndex) {
          swiper.snapIndex = snapIndex;
          swiper.emit('snapIndexChange');
        }

        return;
      } // Get real index


      const realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);
      Object.assign(swiper, {
        snapIndex,
        realIndex,
        previousIndex,
        activeIndex
      });
      swiper.emit('activeIndexChange');
      swiper.emit('snapIndexChange');

      if (previousRealIndex !== realIndex) {
        swiper.emit('realIndexChange');
      }

      if (swiper.initialized || swiper.params.runCallbacksOnInit) {
        swiper.emit('slideChange');
      }
    }

    function updateClickedSlide(e) {
      const swiper = this;
      const params = swiper.params;
      const slide = $(e).closest(`.${params.slideClass}`)[0];
      let slideFound = false;
      let slideIndex;

      if (slide) {
        for (let i = 0; i < swiper.slides.length; i += 1) {
          if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
          }
        }
      }

      if (slide && slideFound) {
        swiper.clickedSlide = slide;

        if (swiper.virtual && swiper.params.virtual.enabled) {
          swiper.clickedIndex = parseInt($(slide).attr('data-swiper-slide-index'), 10);
        } else {
          swiper.clickedIndex = slideIndex;
        }
      } else {
        swiper.clickedSlide = undefined;
        swiper.clickedIndex = undefined;
        return;
      }

      if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
        swiper.slideToClickedSlide();
      }
    }

    var update = {
      updateSize,
      updateSlides,
      updateAutoHeight,
      updateSlidesOffset,
      updateSlidesProgress,
      updateProgress,
      updateSlidesClasses,
      updateActiveIndex,
      updateClickedSlide
    };

    function getSwiperTranslate(axis) {
      if (axis === void 0) {
        axis = this.isHorizontal() ? 'x' : 'y';
      }

      const swiper = this;
      const {
        params,
        rtlTranslate: rtl,
        translate,
        $wrapperEl
      } = swiper;

      if (params.virtualTranslate) {
        return rtl ? -translate : translate;
      }

      if (params.cssMode) {
        return translate;
      }

      let currentTranslate = getTranslate($wrapperEl[0], axis);
      if (rtl) currentTranslate = -currentTranslate;
      return currentTranslate || 0;
    }

    function setTranslate(translate, byController) {
      const swiper = this;
      const {
        rtlTranslate: rtl,
        params,
        $wrapperEl,
        wrapperEl,
        progress
      } = swiper;
      let x = 0;
      let y = 0;
      const z = 0;

      if (swiper.isHorizontal()) {
        x = rtl ? -translate : translate;
      } else {
        y = translate;
      }

      if (params.roundLengths) {
        x = Math.floor(x);
        y = Math.floor(y);
      }

      if (params.cssMode) {
        wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
      } else if (!params.virtualTranslate) {
        $wrapperEl.transform(`translate3d(${x}px, ${y}px, ${z}px)`);
      }

      swiper.previousTranslate = swiper.translate;
      swiper.translate = swiper.isHorizontal() ? x : y; // Check if we need to update progress

      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();

      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (translate - swiper.minTranslate()) / translatesDiff;
      }

      if (newProgress !== progress) {
        swiper.updateProgress(translate);
      }

      swiper.emit('setTranslate', swiper.translate, byController);
    }

    function minTranslate() {
      return -this.snapGrid[0];
    }

    function maxTranslate() {
      return -this.snapGrid[this.snapGrid.length - 1];
    }

    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
      if (translate === void 0) {
        translate = 0;
      }

      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (translateBounds === void 0) {
        translateBounds = true;
      }

      const swiper = this;
      const {
        params,
        wrapperEl
      } = swiper;

      if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }

      const minTranslate = swiper.minTranslate();
      const maxTranslate = swiper.maxTranslate();
      let newTranslate;
      if (translateBounds && translate > minTranslate) newTranslate = minTranslate;else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;else newTranslate = translate; // Update progress

      swiper.updateProgress(newTranslate);

      if (params.cssMode) {
        const isH = swiper.isHorizontal();

        if (speed === 0) {
          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
        } else {
          if (!swiper.support.smoothScroll) {
            animateCSSModeScroll({
              swiper,
              targetPosition: -newTranslate,
              side: isH ? 'left' : 'top'
            });
            return true;
          }

          wrapperEl.scrollTo({
            [isH ? 'left' : 'top']: -newTranslate,
            behavior: 'smooth'
          });
        }

        return true;
      }

      if (speed === 0) {
        swiper.setTransition(0);
        swiper.setTranslate(newTranslate);

        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionEnd');
        }
      } else {
        swiper.setTransition(speed);
        swiper.setTranslate(newTranslate);

        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionStart');
        }

        if (!swiper.animating) {
          swiper.animating = true;

          if (!swiper.onTranslateToWrapperTransitionEnd) {
            swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
              if (!swiper || swiper.destroyed) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
              swiper.onTranslateToWrapperTransitionEnd = null;
              delete swiper.onTranslateToWrapperTransitionEnd;

              if (runCallbacks) {
                swiper.emit('transitionEnd');
              }
            };
          }

          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
        }
      }

      return true;
    }

    var translate = {
      getTranslate: getSwiperTranslate,
      setTranslate,
      minTranslate,
      maxTranslate,
      translateTo
    };

    function setTransition(duration, byController) {
      const swiper = this;

      if (!swiper.params.cssMode) {
        swiper.$wrapperEl.transition(duration);
      }

      swiper.emit('setTransition', duration, byController);
    }

    function transitionEmit(_ref) {
      let {
        swiper,
        runCallbacks,
        direction,
        step
      } = _ref;
      const {
        activeIndex,
        previousIndex
      } = swiper;
      let dir = direction;

      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';else if (activeIndex < previousIndex) dir = 'prev';else dir = 'reset';
      }

      swiper.emit(`transition${step}`);

      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit(`slideResetTransition${step}`);
          return;
        }

        swiper.emit(`slideChangeTransition${step}`);

        if (dir === 'next') {
          swiper.emit(`slideNextTransition${step}`);
        } else {
          swiper.emit(`slidePrevTransition${step}`);
        }
      }
    }

    function transitionStart(runCallbacks, direction) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        params
      } = swiper;
      if (params.cssMode) return;

      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }

      transitionEmit({
        swiper,
        runCallbacks,
        direction,
        step: 'Start'
      });
    }

    function transitionEnd$1(runCallbacks, direction) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        params
      } = swiper;
      swiper.animating = false;
      if (params.cssMode) return;
      swiper.setTransition(0);
      transitionEmit({
        swiper,
        runCallbacks,
        direction,
        step: 'End'
      });
    }

    var transition$1 = {
      setTransition,
      transitionStart,
      transitionEnd: transitionEnd$1
    };

    function slideTo(index, speed, runCallbacks, internal, initial) {
      if (index === void 0) {
        index = 0;
      }

      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (typeof index !== 'number' && typeof index !== 'string') {
        throw new Error(`The 'index' argument cannot have type other than 'number' or 'string'. [${typeof index}] given.`);
      }

      if (typeof index === 'string') {
        /**
         * The `index` argument converted from `string` to `number`.
         * @type {number}
         */
        const indexAsNumber = parseInt(index, 10);
        /**
         * Determines whether the `index` argument is a valid `number`
         * after being converted from the `string` type.
         * @type {boolean}
         */

        const isValidNumber = isFinite(indexAsNumber);

        if (!isValidNumber) {
          throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${index}] given.`);
        } // Knowing that the converted `index` is a valid number,
        // we can update the original argument's value.


        index = indexAsNumber;
      }

      const swiper = this;
      let slideIndex = index;
      if (slideIndex < 0) slideIndex = 0;
      const {
        params,
        snapGrid,
        slidesGrid,
        previousIndex,
        activeIndex,
        rtlTranslate: rtl,
        wrapperEl,
        enabled
      } = swiper;

      if (swiper.animating && params.preventInteractionOnTransition || !enabled && !internal && !initial) {
        return false;
      }

      const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
      let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

      if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
        swiper.emit('beforeSlideChangeStart');
      }

      const translate = -snapGrid[snapIndex]; // Update progress

      swiper.updateProgress(translate); // Normalize slideIndex

      if (params.normalizeSlideIndex) {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          const normalizedTranslate = -Math.floor(translate * 100);
          const normalizedGrid = Math.floor(slidesGrid[i] * 100);
          const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);

          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
              slideIndex = i;
            } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
              slideIndex = i + 1;
            }
          } else if (normalizedTranslate >= normalizedGrid) {
            slideIndex = i;
          }
        }
      } // Directions locks


      if (swiper.initialized && slideIndex !== activeIndex) {
        if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
          return false;
        }

        if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
          if ((activeIndex || 0) !== slideIndex) return false;
        }
      }

      let direction;
      if (slideIndex > activeIndex) direction = 'next';else if (slideIndex < activeIndex) direction = 'prev';else direction = 'reset'; // Update Index

      if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
        swiper.updateActiveIndex(slideIndex); // Update Height

        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }

        swiper.updateSlidesClasses();

        if (params.effect !== 'slide') {
          swiper.setTranslate(translate);
        }

        if (direction !== 'reset') {
          swiper.transitionStart(runCallbacks, direction);
          swiper.transitionEnd(runCallbacks, direction);
        }

        return false;
      }

      if (params.cssMode) {
        const isH = swiper.isHorizontal();
        const t = rtl ? translate : -translate;

        if (speed === 0) {
          const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

          if (isVirtual) {
            swiper.wrapperEl.style.scrollSnapType = 'none';
            swiper._immediateVirtual = true;
          }

          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;

          if (isVirtual) {
            requestAnimationFrame(() => {
              swiper.wrapperEl.style.scrollSnapType = '';
              swiper._swiperImmediateVirtual = false;
            });
          }
        } else {
          if (!swiper.support.smoothScroll) {
            animateCSSModeScroll({
              swiper,
              targetPosition: t,
              side: isH ? 'left' : 'top'
            });
            return true;
          }

          wrapperEl.scrollTo({
            [isH ? 'left' : 'top']: t,
            behavior: 'smooth'
          });
        }

        return true;
      }

      swiper.setTransition(speed);
      swiper.setTranslate(translate);
      swiper.updateActiveIndex(slideIndex);
      swiper.updateSlidesClasses();
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.transitionStart(runCallbacks, direction);

      if (speed === 0) {
        swiper.transitionEnd(runCallbacks, direction);
      } else if (!swiper.animating) {
        swiper.animating = true;

        if (!swiper.onSlideToWrapperTransitionEnd) {
          swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
            if (!swiper || swiper.destroyed) return;
            if (e.target !== this) return;
            swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
            swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
            swiper.onSlideToWrapperTransitionEnd = null;
            delete swiper.onSlideToWrapperTransitionEnd;
            swiper.transitionEnd(runCallbacks, direction);
          };
        }

        swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
        swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
      }

      return true;
    }

    function slideToLoop(index, speed, runCallbacks, internal) {
      if (index === void 0) {
        index = 0;
      }

      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (typeof index === 'string') {
        /**
         * The `index` argument converted from `string` to `number`.
         * @type {number}
         */
        const indexAsNumber = parseInt(index, 10);
        /**
         * Determines whether the `index` argument is a valid `number`
         * after being converted from the `string` type.
         * @type {boolean}
         */

        const isValidNumber = isFinite(indexAsNumber);

        if (!isValidNumber) {
          throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${index}] given.`);
        } // Knowing that the converted `index` is a valid number,
        // we can update the original argument's value.


        index = indexAsNumber;
      }

      const swiper = this;
      let newIndex = index;

      if (swiper.params.loop) {
        newIndex += swiper.loopedSlides;
      }

      return swiper.slideTo(newIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideNext(speed, runCallbacks, internal) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        animating,
        enabled,
        params
      } = swiper;
      if (!enabled) return swiper;
      let perGroup = params.slidesPerGroup;

      if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
        perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
      }

      const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;

      if (params.loop) {
        if (animating && params.loopPreventsSlide) return false;
        swiper.loopFix(); // eslint-disable-next-line

        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }

      if (params.rewind && swiper.isEnd) {
        return swiper.slideTo(0, speed, runCallbacks, internal);
      }

      return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slidePrev(speed, runCallbacks, internal) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        params,
        animating,
        snapGrid,
        slidesGrid,
        rtlTranslate,
        enabled
      } = swiper;
      if (!enabled) return swiper;

      if (params.loop) {
        if (animating && params.loopPreventsSlide) return false;
        swiper.loopFix(); // eslint-disable-next-line

        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }

      const translate = rtlTranslate ? swiper.translate : -swiper.translate;

      function normalize(val) {
        if (val < 0) return -Math.floor(Math.abs(val));
        return Math.floor(val);
      }

      const normalizedTranslate = normalize(translate);
      const normalizedSnapGrid = snapGrid.map(val => normalize(val));
      let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];

      if (typeof prevSnap === 'undefined' && params.cssMode) {
        let prevSnapIndex;
        snapGrid.forEach((snap, snapIndex) => {
          if (normalizedTranslate >= snap) {
            // prevSnap = snap;
            prevSnapIndex = snapIndex;
          }
        });

        if (typeof prevSnapIndex !== 'undefined') {
          prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
      }

      let prevIndex = 0;

      if (typeof prevSnap !== 'undefined') {
        prevIndex = slidesGrid.indexOf(prevSnap);
        if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;

        if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
          prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
          prevIndex = Math.max(prevIndex, 0);
        }
      }

      if (params.rewind && swiper.isBeginning) {
        const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
        return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
      }

      return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideReset(speed, runCallbacks, internal) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideToClosest(speed, runCallbacks, internal, threshold) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (threshold === void 0) {
        threshold = 0.5;
      }

      const swiper = this;
      let index = swiper.activeIndex;
      const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
      const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;

      if (translate >= swiper.snapGrid[snapIndex]) {
        // The current translate is on or after the current snap index, so the choice
        // is between the current index and the one after it.
        const currentSnap = swiper.snapGrid[snapIndex];
        const nextSnap = swiper.snapGrid[snapIndex + 1];

        if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
          index += swiper.params.slidesPerGroup;
        }
      } else {
        // The current translate is before the current snap index, so the choice
        // is between the current index and the one before it.
        const prevSnap = swiper.snapGrid[snapIndex - 1];
        const currentSnap = swiper.snapGrid[snapIndex];

        if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
          index -= swiper.params.slidesPerGroup;
        }
      }

      index = Math.max(index, 0);
      index = Math.min(index, swiper.slidesGrid.length - 1);
      return swiper.slideTo(index, speed, runCallbacks, internal);
    }

    function slideToClickedSlide() {
      const swiper = this;
      const {
        params,
        $wrapperEl
      } = swiper;
      const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
      let slideToIndex = swiper.clickedIndex;
      let realIndex;

      if (params.loop) {
        if (swiper.animating) return;
        realIndex = parseInt($(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);

        if (params.centeredSlides) {
          if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
            swiper.loopFix();
            slideToIndex = $wrapperEl.children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`).eq(0).index();
            nextTick(() => {
              swiper.slideTo(slideToIndex);
            });
          } else {
            swiper.slideTo(slideToIndex);
          }
        } else if (slideToIndex > swiper.slides.length - slidesPerView) {
          swiper.loopFix();
          slideToIndex = $wrapperEl.children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`).eq(0).index();
          nextTick(() => {
            swiper.slideTo(slideToIndex);
          });
        } else {
          swiper.slideTo(slideToIndex);
        }
      } else {
        swiper.slideTo(slideToIndex);
      }
    }

    var slide = {
      slideTo,
      slideToLoop,
      slideNext,
      slidePrev,
      slideReset,
      slideToClosest,
      slideToClickedSlide
    };

    function loopCreate() {
      const swiper = this;
      const document = getDocument();
      const {
        params,
        $wrapperEl
      } = swiper; // Remove duplicated slides

      const $selector = $wrapperEl.children().length > 0 ? $($wrapperEl.children()[0].parentNode) : $wrapperEl;
      $selector.children(`.${params.slideClass}.${params.slideDuplicateClass}`).remove();
      let slides = $selector.children(`.${params.slideClass}`);

      if (params.loopFillGroupWithBlank) {
        const blankSlidesNum = params.slidesPerGroup - slides.length % params.slidesPerGroup;

        if (blankSlidesNum !== params.slidesPerGroup) {
          for (let i = 0; i < blankSlidesNum; i += 1) {
            const blankNode = $(document.createElement('div')).addClass(`${params.slideClass} ${params.slideBlankClass}`);
            $selector.append(blankNode);
          }

          slides = $selector.children(`.${params.slideClass}`);
        }
      }

      if (params.slidesPerView === 'auto' && !params.loopedSlides) params.loopedSlides = slides.length;
      swiper.loopedSlides = Math.ceil(parseFloat(params.loopedSlides || params.slidesPerView, 10));
      swiper.loopedSlides += params.loopAdditionalSlides;

      if (swiper.loopedSlides > slides.length && swiper.params.loopedSlidesLimit) {
        swiper.loopedSlides = slides.length;
      }

      const prependSlides = [];
      const appendSlides = [];
      slides.each((el, index) => {
        $(el).attr('data-swiper-slide-index', index);
      });

      for (let i = 0; i < swiper.loopedSlides; i += 1) {
        const index = i - Math.floor(i / slides.length) * slides.length;
        appendSlides.push(slides.eq(index)[0]);
        prependSlides.unshift(slides.eq(slides.length - index - 1)[0]);
      }

      for (let i = 0; i < appendSlides.length; i += 1) {
        $selector.append($(appendSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }

      for (let i = prependSlides.length - 1; i >= 0; i -= 1) {
        $selector.prepend($(prependSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }
    }

    function loopFix() {
      const swiper = this;
      swiper.emit('beforeLoopFix');
      const {
        activeIndex,
        slides,
        loopedSlides,
        allowSlidePrev,
        allowSlideNext,
        snapGrid,
        rtlTranslate: rtl
      } = swiper;
      let newIndex;
      swiper.allowSlidePrev = true;
      swiper.allowSlideNext = true;
      const snapTranslate = -snapGrid[activeIndex];
      const diff = snapTranslate - swiper.getTranslate(); // Fix For Negative Oversliding

      if (activeIndex < loopedSlides) {
        newIndex = slides.length - loopedSlides * 3 + activeIndex;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);

        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      } else if (activeIndex >= slides.length - loopedSlides) {
        // Fix For Positive Oversliding
        newIndex = -slides.length + activeIndex + loopedSlides;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);

        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      }

      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;
      swiper.emit('loopFix');
    }

    function loopDestroy() {
      const swiper = this;
      const {
        $wrapperEl,
        params,
        slides
      } = swiper;
      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass},.${params.slideClass}.${params.slideBlankClass}`).remove();
      slides.removeAttr('data-swiper-slide-index');
    }

    var loop = {
      loopCreate,
      loopFix,
      loopDestroy
    };

    function setGrabCursor(moving) {
      const swiper = this;
      if (swiper.support.touch || !swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
      const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
      el.style.cursor = 'move';
      el.style.cursor = moving ? 'grabbing' : 'grab';
    }

    function unsetGrabCursor() {
      const swiper = this;

      if (swiper.support.touch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
        return;
      }

      swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
    }

    var grabCursor = {
      setGrabCursor,
      unsetGrabCursor
    };

    function closestElement(selector, base) {
      if (base === void 0) {
        base = this;
      }

      function __closestFrom(el) {
        if (!el || el === getDocument() || el === getWindow()) return null;
        if (el.assignedSlot) el = el.assignedSlot;
        const found = el.closest(selector);

        if (!found && !el.getRootNode) {
          return null;
        }

        return found || __closestFrom(el.getRootNode().host);
      }

      return __closestFrom(base);
    }

    function onTouchStart(event) {
      const swiper = this;
      const document = getDocument();
      const window = getWindow();
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        enabled
      } = swiper;
      if (!enabled) return;

      if (swiper.animating && params.preventInteractionOnTransition) {
        return;
      }

      if (!swiper.animating && params.cssMode && params.loop) {
        swiper.loopFix();
      }

      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      let $targetEl = $(e.target);

      if (params.touchEventsTarget === 'wrapper') {
        if (!$targetEl.closest(swiper.wrapperEl).length) return;
      }

      data.isTouchEvent = e.type === 'touchstart';
      if (!data.isTouchEvent && 'which' in e && e.which === 3) return;
      if (!data.isTouchEvent && 'button' in e && e.button > 0) return;
      if (data.isTouched && data.isMoved) return; // change target el for shadow root component

      const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';

      if (swipingClassHasValue && e.target && e.target.shadowRoot && event.path && event.path[0]) {
        $targetEl = $(event.path[0]);
      }

      const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
      const isTargetShadow = !!(e.target && e.target.shadowRoot); // use closestElement for shadow root element to get the actual closest for nested shadow root element

      if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, $targetEl[0]) : $targetEl.closest(noSwipingSelector)[0])) {
        swiper.allowClick = true;
        return;
      }

      if (params.swipeHandler) {
        if (!$targetEl.closest(params.swipeHandler)[0]) return;
      }

      touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      const startX = touches.currentX;
      const startY = touches.currentY; // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore

      const edgeSwipeDetection = params.edgeSwipeDetection || params.iOSEdgeSwipeDetection;
      const edgeSwipeThreshold = params.edgeSwipeThreshold || params.iOSEdgeSwipeThreshold;

      if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
        if (edgeSwipeDetection === 'prevent') {
          event.preventDefault();
        } else {
          return;
        }
      }

      Object.assign(data, {
        isTouched: true,
        isMoved: false,
        allowTouchCallbacks: true,
        isScrolling: undefined,
        startMoving: undefined
      });
      touches.startX = startX;
      touches.startY = startY;
      data.touchStartTime = now();
      swiper.allowClick = true;
      swiper.updateSize();
      swiper.swipeDirection = undefined;
      if (params.threshold > 0) data.allowThresholdMove = false;

      if (e.type !== 'touchstart') {
        let preventDefault = true;

        if ($targetEl.is(data.focusableElements)) {
          preventDefault = false;

          if ($targetEl[0].nodeName === 'SELECT') {
            data.isTouched = false;
          }
        }

        if (document.activeElement && $(document.activeElement).is(data.focusableElements) && document.activeElement !== $targetEl[0]) {
          document.activeElement.blur();
        }

        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;

        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !$targetEl[0].isContentEditable) {
          e.preventDefault();
        }
      }

      if (swiper.params.freeMode && swiper.params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
        swiper.freeMode.onTouchStart();
      }

      swiper.emit('touchStart', e);
    }

    function onTouchMove(event) {
      const document = getDocument();
      const swiper = this;
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        rtlTranslate: rtl,
        enabled
      } = swiper;
      if (!enabled) return;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;

      if (!data.isTouched) {
        if (data.startMoving && data.isScrolling) {
          swiper.emit('touchMoveOpposite', e);
        }

        return;
      }

      if (data.isTouchEvent && e.type !== 'touchmove') return;
      const targetTouch = e.type === 'touchmove' && e.targetTouches && (e.targetTouches[0] || e.changedTouches[0]);
      const pageX = e.type === 'touchmove' ? targetTouch.pageX : e.pageX;
      const pageY = e.type === 'touchmove' ? targetTouch.pageY : e.pageY;

      if (e.preventedByNestedSwiper) {
        touches.startX = pageX;
        touches.startY = pageY;
        return;
      }

      if (!swiper.allowTouchMove) {
        if (!$(e.target).is(data.focusableElements)) {
          swiper.allowClick = false;
        }

        if (data.isTouched) {
          Object.assign(touches, {
            startX: pageX,
            startY: pageY,
            currentX: pageX,
            currentY: pageY
          });
          data.touchStartTime = now();
        }

        return;
      }

      if (data.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
        if (swiper.isVertical()) {
          // Vertical
          if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
            data.isTouched = false;
            data.isMoved = false;
            return;
          }
        } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) {
          return;
        }
      }

      if (data.isTouchEvent && document.activeElement) {
        if (e.target === document.activeElement && $(e.target).is(data.focusableElements)) {
          data.isMoved = true;
          swiper.allowClick = false;
          return;
        }
      }

      if (data.allowTouchCallbacks) {
        swiper.emit('touchMove', e);
      }

      if (e.targetTouches && e.targetTouches.length > 1) return;
      touches.currentX = pageX;
      touches.currentY = pageY;
      const diffX = touches.currentX - touches.startX;
      const diffY = touches.currentY - touches.startY;
      if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;

      if (typeof data.isScrolling === 'undefined') {
        let touchAngle;

        if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
          data.isScrolling = false;
        } else {
          // eslint-disable-next-line
          if (diffX * diffX + diffY * diffY >= 25) {
            touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
            data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
          }
        }
      }

      if (data.isScrolling) {
        swiper.emit('touchMoveOpposite', e);
      }

      if (typeof data.startMoving === 'undefined') {
        if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
          data.startMoving = true;
        }
      }

      if (data.isScrolling) {
        data.isTouched = false;
        return;
      }

      if (!data.startMoving) {
        return;
      }

      swiper.allowClick = false;

      if (!params.cssMode && e.cancelable) {
        e.preventDefault();
      }

      if (params.touchMoveStopPropagation && !params.nested) {
        e.stopPropagation();
      }

      if (!data.isMoved) {
        if (params.loop && !params.cssMode) {
          swiper.loopFix();
        }

        data.startTranslate = swiper.getTranslate();
        swiper.setTransition(0);

        if (swiper.animating) {
          swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
        }

        data.allowMomentumBounce = false; // Grab Cursor

        if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
          swiper.setGrabCursor(true);
        }

        swiper.emit('sliderFirstMove', e);
      }

      swiper.emit('sliderMove', e);
      data.isMoved = true;
      let diff = swiper.isHorizontal() ? diffX : diffY;
      touches.diff = diff;
      diff *= params.touchRatio;
      if (rtl) diff = -diff;
      swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
      data.currentTranslate = diff + data.startTranslate;
      let disableParentSwiper = true;
      let resistanceRatio = params.resistanceRatio;

      if (params.touchReleaseOnEdges) {
        resistanceRatio = 0;
      }

      if (diff > 0 && data.currentTranslate > swiper.minTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      } else if (diff < 0 && data.currentTranslate < swiper.maxTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }

      if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
      } // Directions locks


      if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }

      if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }

      if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
        data.currentTranslate = data.startTranslate;
      } // Threshold


      if (params.threshold > 0) {
        if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
          if (!data.allowThresholdMove) {
            data.allowThresholdMove = true;
            touches.startX = touches.currentX;
            touches.startY = touches.currentY;
            data.currentTranslate = data.startTranslate;
            touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
            return;
          }
        } else {
          data.currentTranslate = data.startTranslate;
          return;
        }
      }

      if (!params.followFinger || params.cssMode) return; // Update active index in free mode

      if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }

      if (swiper.params.freeMode && params.freeMode.enabled && swiper.freeMode) {
        swiper.freeMode.onTouchMove();
      } // Update progress


      swiper.updateProgress(data.currentTranslate); // Update translate

      swiper.setTranslate(data.currentTranslate);
    }

    function onTouchEnd(event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        rtlTranslate: rtl,
        slidesGrid,
        enabled
      } = swiper;
      if (!enabled) return;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;

      if (data.allowTouchCallbacks) {
        swiper.emit('touchEnd', e);
      }

      data.allowTouchCallbacks = false;

      if (!data.isTouched) {
        if (data.isMoved && params.grabCursor) {
          swiper.setGrabCursor(false);
        }

        data.isMoved = false;
        data.startMoving = false;
        return;
      } // Return Grab Cursor


      if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(false);
      } // Time diff


      const touchEndTime = now();
      const timeDiff = touchEndTime - data.touchStartTime; // Tap, doubleTap, Click

      if (swiper.allowClick) {
        const pathTree = e.path || e.composedPath && e.composedPath();
        swiper.updateClickedSlide(pathTree && pathTree[0] || e.target);
        swiper.emit('tap click', e);

        if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
          swiper.emit('doubleTap doubleClick', e);
        }
      }

      data.lastClickTime = now();
      nextTick(() => {
        if (!swiper.destroyed) swiper.allowClick = true;
      });

      if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        return;
      }

      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;
      let currentPos;

      if (params.followFinger) {
        currentPos = rtl ? swiper.translate : -swiper.translate;
      } else {
        currentPos = -data.currentTranslate;
      }

      if (params.cssMode) {
        return;
      }

      if (swiper.params.freeMode && params.freeMode.enabled) {
        swiper.freeMode.onTouchEnd({
          currentPos
        });
        return;
      } // Find current slide


      let stopIndex = 0;
      let groupSize = swiper.slidesSizesGrid[0];

      for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
        const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;

        if (typeof slidesGrid[i + increment] !== 'undefined') {
          if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
            stopIndex = i;
            groupSize = slidesGrid[i + increment] - slidesGrid[i];
          }
        } else if (currentPos >= slidesGrid[i]) {
          stopIndex = i;
          groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
        }
      }

      let rewindFirstIndex = null;
      let rewindLastIndex = null;

      if (params.rewind) {
        if (swiper.isBeginning) {
          rewindLastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
        } else if (swiper.isEnd) {
          rewindFirstIndex = 0;
        }
      } // Find current slide size


      const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
      const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;

      if (timeDiff > params.longSwipesMs) {
        // Long touches
        if (!params.longSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }

        if (swiper.swipeDirection === 'next') {
          if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);else swiper.slideTo(stopIndex);
        }

        if (swiper.swipeDirection === 'prev') {
          if (ratio > 1 - params.longSwipesRatio) {
            swiper.slideTo(stopIndex + increment);
          } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
            swiper.slideTo(rewindLastIndex);
          } else {
            swiper.slideTo(stopIndex);
          }
        }
      } else {
        // Short swipes
        if (!params.shortSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }

        const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);

        if (!isNavButtonTarget) {
          if (swiper.swipeDirection === 'next') {
            swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
          }

          if (swiper.swipeDirection === 'prev') {
            swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
          }
        } else if (e.target === swiper.navigation.nextEl) {
          swiper.slideTo(stopIndex + increment);
        } else {
          swiper.slideTo(stopIndex);
        }
      }
    }

    function onResize() {
      const swiper = this;
      const {
        params,
        el
      } = swiper;
      if (el && el.offsetWidth === 0) return; // Breakpoints

      if (params.breakpoints) {
        swiper.setBreakpoint();
      } // Save locks


      const {
        allowSlideNext,
        allowSlidePrev,
        snapGrid
      } = swiper; // Disable locks on resize

      swiper.allowSlideNext = true;
      swiper.allowSlidePrev = true;
      swiper.updateSize();
      swiper.updateSlides();
      swiper.updateSlidesClasses();

      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides) {
        swiper.slideTo(swiper.slides.length - 1, 0, false, true);
      } else {
        swiper.slideTo(swiper.activeIndex, 0, false, true);
      }

      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.run();
      } // Return locks after resize


      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;

      if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
      }
    }

    function onClick(e) {
      const swiper = this;
      if (!swiper.enabled) return;

      if (!swiper.allowClick) {
        if (swiper.params.preventClicks) e.preventDefault();

        if (swiper.params.preventClicksPropagation && swiper.animating) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    }

    function onScroll() {
      const swiper = this;
      const {
        wrapperEl,
        rtlTranslate,
        enabled
      } = swiper;
      if (!enabled) return;
      swiper.previousTranslate = swiper.translate;

      if (swiper.isHorizontal()) {
        swiper.translate = -wrapperEl.scrollLeft;
      } else {
        swiper.translate = -wrapperEl.scrollTop;
      } // eslint-disable-next-line


      if (swiper.translate === 0) swiper.translate = 0;
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();

      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
      }

      if (newProgress !== swiper.progress) {
        swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
      }

      swiper.emit('setTranslate', swiper.translate, false);
    }

    let dummyEventAttached = false;

    function dummyEventListener() {}

    const events = (swiper, method) => {
      const document = getDocument();
      const {
        params,
        touchEvents,
        el,
        wrapperEl,
        device,
        support
      } = swiper;
      const capture = !!params.nested;
      const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
      const swiperMethod = method; // Touch Events

      if (!support.touch) {
        el[domMethod](touchEvents.start, swiper.onTouchStart, false);
        document[domMethod](touchEvents.move, swiper.onTouchMove, capture);
        document[domMethod](touchEvents.end, swiper.onTouchEnd, false);
      } else {
        const passiveListener = touchEvents.start === 'touchstart' && support.passiveListener && params.passiveListeners ? {
          passive: true,
          capture: false
        } : false;
        el[domMethod](touchEvents.start, swiper.onTouchStart, passiveListener);
        el[domMethod](touchEvents.move, swiper.onTouchMove, support.passiveListener ? {
          passive: false,
          capture
        } : capture);
        el[domMethod](touchEvents.end, swiper.onTouchEnd, passiveListener);

        if (touchEvents.cancel) {
          el[domMethod](touchEvents.cancel, swiper.onTouchEnd, passiveListener);
        }
      } // Prevent Links Clicks


      if (params.preventClicks || params.preventClicksPropagation) {
        el[domMethod]('click', swiper.onClick, true);
      }

      if (params.cssMode) {
        wrapperEl[domMethod]('scroll', swiper.onScroll);
      } // Resize handler


      if (params.updateOnWindowResize) {
        swiper[swiperMethod](device.ios || device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate', onResize, true);
      } else {
        swiper[swiperMethod]('observerUpdate', onResize, true);
      }
    };

    function attachEvents() {
      const swiper = this;
      const document = getDocument();
      const {
        params,
        support
      } = swiper;
      swiper.onTouchStart = onTouchStart.bind(swiper);
      swiper.onTouchMove = onTouchMove.bind(swiper);
      swiper.onTouchEnd = onTouchEnd.bind(swiper);

      if (params.cssMode) {
        swiper.onScroll = onScroll.bind(swiper);
      }

      swiper.onClick = onClick.bind(swiper);

      if (support.touch && !dummyEventAttached) {
        document.addEventListener('touchstart', dummyEventListener);
        dummyEventAttached = true;
      }

      events(swiper, 'on');
    }

    function detachEvents() {
      const swiper = this;
      events(swiper, 'off');
    }

    var events$1 = {
      attachEvents,
      detachEvents
    };

    const isGridEnabled = (swiper, params) => {
      return swiper.grid && params.grid && params.grid.rows > 1;
    };

    function setBreakpoint() {
      const swiper = this;
      const {
        activeIndex,
        initialized,
        loopedSlides = 0,
        params,
        $el
      } = swiper;
      const breakpoints = params.breakpoints;
      if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return; // Get breakpoint for window width and update parameters

      const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
      if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
      const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
      const breakpointParams = breakpointOnlyParams || swiper.originalParams;
      const wasMultiRow = isGridEnabled(swiper, params);
      const isMultiRow = isGridEnabled(swiper, breakpointParams);
      const wasEnabled = params.enabled;

      if (wasMultiRow && !isMultiRow) {
        $el.removeClass(`${params.containerModifierClass}grid ${params.containerModifierClass}grid-column`);
        swiper.emitContainerClasses();
      } else if (!wasMultiRow && isMultiRow) {
        $el.addClass(`${params.containerModifierClass}grid`);

        if (breakpointParams.grid.fill && breakpointParams.grid.fill === 'column' || !breakpointParams.grid.fill && params.grid.fill === 'column') {
          $el.addClass(`${params.containerModifierClass}grid-column`);
        }

        swiper.emitContainerClasses();
      } // Toggle navigation, pagination, scrollbar


      ['navigation', 'pagination', 'scrollbar'].forEach(prop => {
        const wasModuleEnabled = params[prop] && params[prop].enabled;
        const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;

        if (wasModuleEnabled && !isModuleEnabled) {
          swiper[prop].disable();
        }

        if (!wasModuleEnabled && isModuleEnabled) {
          swiper[prop].enable();
        }
      });
      const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
      const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);

      if (directionChanged && initialized) {
        swiper.changeDirection();
      }

      extend$1(swiper.params, breakpointParams);
      const isEnabled = swiper.params.enabled;
      Object.assign(swiper, {
        allowTouchMove: swiper.params.allowTouchMove,
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev
      });

      if (wasEnabled && !isEnabled) {
        swiper.disable();
      } else if (!wasEnabled && isEnabled) {
        swiper.enable();
      }

      swiper.currentBreakpoint = breakpoint;
      swiper.emit('_beforeBreakpoint', breakpointParams);

      if (needsReLoop && initialized) {
        swiper.loopDestroy();
        swiper.loopCreate();
        swiper.updateSlides();
        swiper.slideTo(activeIndex - loopedSlides + swiper.loopedSlides, 0, false);
      }

      swiper.emit('breakpoint', breakpointParams);
    }

    function getBreakpoint(breakpoints, base, containerEl) {
      if (base === void 0) {
        base = 'window';
      }

      if (!breakpoints || base === 'container' && !containerEl) return undefined;
      let breakpoint = false;
      const window = getWindow();
      const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
      const points = Object.keys(breakpoints).map(point => {
        if (typeof point === 'string' && point.indexOf('@') === 0) {
          const minRatio = parseFloat(point.substr(1));
          const value = currentHeight * minRatio;
          return {
            value,
            point
          };
        }

        return {
          value: point,
          point
        };
      });
      points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));

      for (let i = 0; i < points.length; i += 1) {
        const {
          point,
          value
        } = points[i];

        if (base === 'window') {
          if (window.matchMedia(`(min-width: ${value}px)`).matches) {
            breakpoint = point;
          }
        } else if (value <= containerEl.clientWidth) {
          breakpoint = point;
        }
      }

      return breakpoint || 'max';
    }

    var breakpoints = {
      setBreakpoint,
      getBreakpoint
    };

    function prepareClasses(entries, prefix) {
      const resultClasses = [];
      entries.forEach(item => {
        if (typeof item === 'object') {
          Object.keys(item).forEach(classNames => {
            if (item[classNames]) {
              resultClasses.push(prefix + classNames);
            }
          });
        } else if (typeof item === 'string') {
          resultClasses.push(prefix + item);
        }
      });
      return resultClasses;
    }

    function addClasses() {
      const swiper = this;
      const {
        classNames,
        params,
        rtl,
        $el,
        device,
        support
      } = swiper; // prettier-ignore

      const suffixes = prepareClasses(['initialized', params.direction, {
        'pointer-events': !support.touch
      }, {
        'free-mode': swiper.params.freeMode && params.freeMode.enabled
      }, {
        'autoheight': params.autoHeight
      }, {
        'rtl': rtl
      }, {
        'grid': params.grid && params.grid.rows > 1
      }, {
        'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column'
      }, {
        'android': device.android
      }, {
        'ios': device.ios
      }, {
        'css-mode': params.cssMode
      }, {
        'centered': params.cssMode && params.centeredSlides
      }, {
        'watch-progress': params.watchSlidesProgress
      }], params.containerModifierClass);
      classNames.push(...suffixes);
      $el.addClass([...classNames].join(' '));
      swiper.emitContainerClasses();
    }

    function removeClasses() {
      const swiper = this;
      const {
        $el,
        classNames
      } = swiper;
      $el.removeClass(classNames.join(' '));
      swiper.emitContainerClasses();
    }

    var classes = {
      addClasses,
      removeClasses
    };

    function loadImage(imageEl, src, srcset, sizes, checkForComplete, callback) {
      const window = getWindow();
      let image;

      function onReady() {
        if (callback) callback();
      }

      const isPicture = $(imageEl).parent('picture')[0];

      if (!isPicture && (!imageEl.complete || !checkForComplete)) {
        if (src) {
          image = new window.Image();
          image.onload = onReady;
          image.onerror = onReady;

          if (sizes) {
            image.sizes = sizes;
          }

          if (srcset) {
            image.srcset = srcset;
          }

          if (src) {
            image.src = src;
          }
        } else {
          onReady();
        }
      } else {
        // image already loaded...
        onReady();
      }
    }

    function preloadImages() {
      const swiper = this;
      swiper.imagesToLoad = swiper.$el.find('img');

      function onReady() {
        if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) return;
        if (swiper.imagesLoaded !== undefined) swiper.imagesLoaded += 1;

        if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
          if (swiper.params.updateOnImagesReady) swiper.update();
          swiper.emit('imagesReady');
        }
      }

      for (let i = 0; i < swiper.imagesToLoad.length; i += 1) {
        const imageEl = swiper.imagesToLoad[i];
        swiper.loadImage(imageEl, imageEl.currentSrc || imageEl.getAttribute('src'), imageEl.srcset || imageEl.getAttribute('srcset'), imageEl.sizes || imageEl.getAttribute('sizes'), true, onReady);
      }
    }

    var images = {
      loadImage,
      preloadImages
    };

    function checkOverflow() {
      const swiper = this;
      const {
        isLocked: wasLocked,
        params
      } = swiper;
      const {
        slidesOffsetBefore
      } = params;

      if (slidesOffsetBefore) {
        const lastSlideIndex = swiper.slides.length - 1;
        const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
        swiper.isLocked = swiper.size > lastSlideRightEdge;
      } else {
        swiper.isLocked = swiper.snapGrid.length === 1;
      }

      if (params.allowSlideNext === true) {
        swiper.allowSlideNext = !swiper.isLocked;
      }

      if (params.allowSlidePrev === true) {
        swiper.allowSlidePrev = !swiper.isLocked;
      }

      if (wasLocked && wasLocked !== swiper.isLocked) {
        swiper.isEnd = false;
      }

      if (wasLocked !== swiper.isLocked) {
        swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
      }
    }

    var checkOverflow$1 = {
      checkOverflow
    };

    var defaults = {
      init: true,
      direction: 'horizontal',
      touchEventsTarget: 'wrapper',
      initialSlide: 0,
      speed: 300,
      cssMode: false,
      updateOnWindowResize: true,
      resizeObserver: true,
      nested: false,
      createElements: false,
      enabled: true,
      focusableElements: 'input, select, option, textarea, button, video, label',
      // Overrides
      width: null,
      height: null,
      //
      preventInteractionOnTransition: false,
      // ssr
      userAgent: null,
      url: null,
      // To support iOS's swipe-to-go-back gesture (when being used in-app).
      edgeSwipeDetection: false,
      edgeSwipeThreshold: 20,
      // Autoheight
      autoHeight: false,
      // Set wrapper width
      setWrapperSize: false,
      // Virtual Translate
      virtualTranslate: false,
      // Effects
      effect: 'slide',
      // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
      // Breakpoints
      breakpoints: undefined,
      breakpointsBase: 'window',
      // Slides grid
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerGroup: 1,
      slidesPerGroupSkip: 0,
      slidesPerGroupAuto: false,
      centeredSlides: false,
      centeredSlidesBounds: false,
      slidesOffsetBefore: 0,
      // in px
      slidesOffsetAfter: 0,
      // in px
      normalizeSlideIndex: true,
      centerInsufficientSlides: false,
      // Disable swiper and hide navigation when container not overflow
      watchOverflow: true,
      // Round length
      roundLengths: false,
      // Touches
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      allowTouchMove: true,
      threshold: 0,
      touchMoveStopPropagation: false,
      touchStartPreventDefault: true,
      touchStartForcePreventDefault: false,
      touchReleaseOnEdges: false,
      // Unique Navigation Elements
      uniqueNavElements: true,
      // Resistance
      resistance: true,
      resistanceRatio: 0.85,
      // Progress
      watchSlidesProgress: false,
      // Cursor
      grabCursor: false,
      // Clicks
      preventClicks: true,
      preventClicksPropagation: true,
      slideToClickedSlide: false,
      // Images
      preloadImages: true,
      updateOnImagesReady: true,
      // loop
      loop: false,
      loopAdditionalSlides: 0,
      loopedSlides: null,
      loopedSlidesLimit: true,
      loopFillGroupWithBlank: false,
      loopPreventsSlide: true,
      // rewind
      rewind: false,
      // Swiping/no swiping
      allowSlidePrev: true,
      allowSlideNext: true,
      swipeHandler: null,
      // '.swipe-handler',
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      noSwipingSelector: null,
      // Passive Listeners
      passiveListeners: true,
      maxBackfaceHiddenSlides: 10,
      // NS
      containerModifierClass: 'swiper-',
      // NEW
      slideClass: 'swiper-slide',
      slideBlankClass: 'swiper-slide-invisible-blank',
      slideActiveClass: 'swiper-slide-active',
      slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
      slideVisibleClass: 'swiper-slide-visible',
      slideDuplicateClass: 'swiper-slide-duplicate',
      slideNextClass: 'swiper-slide-next',
      slideDuplicateNextClass: 'swiper-slide-duplicate-next',
      slidePrevClass: 'swiper-slide-prev',
      slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
      wrapperClass: 'swiper-wrapper',
      // Callbacks
      runCallbacksOnInit: true,
      // Internals
      _emitClasses: false
    };

    function moduleExtendParams(params, allModulesParams) {
      return function extendParams(obj) {
        if (obj === void 0) {
          obj = {};
        }

        const moduleParamName = Object.keys(obj)[0];
        const moduleParams = obj[moduleParamName];

        if (typeof moduleParams !== 'object' || moduleParams === null) {
          extend$1(allModulesParams, obj);
          return;
        }

        if (['navigation', 'pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 && params[moduleParamName] === true) {
          params[moduleParamName] = {
            auto: true
          };
        }

        if (!(moduleParamName in params && 'enabled' in moduleParams)) {
          extend$1(allModulesParams, obj);
          return;
        }

        if (params[moduleParamName] === true) {
          params[moduleParamName] = {
            enabled: true
          };
        }

        if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
          params[moduleParamName].enabled = true;
        }

        if (!params[moduleParamName]) params[moduleParamName] = {
          enabled: false
        };
        extend$1(allModulesParams, obj);
      };
    }

    /* eslint no-param-reassign: "off" */
    const prototypes = {
      eventsEmitter,
      update,
      translate,
      transition: transition$1,
      slide,
      loop,
      grabCursor,
      events: events$1,
      breakpoints,
      checkOverflow: checkOverflow$1,
      classes,
      images
    };
    const extendedDefaults = {};

    class Swiper {
      constructor() {
        let el;
        let params;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
          params = args[0];
        } else {
          [el, params] = args;
        }

        if (!params) params = {};
        params = extend$1({}, params);
        if (el && !params.el) params.el = el;

        if (params.el && $(params.el).length > 1) {
          const swipers = [];
          $(params.el).each(containerEl => {
            const newParams = extend$1({}, params, {
              el: containerEl
            });
            swipers.push(new Swiper(newParams));
          });
          return swipers;
        } // Swiper Instance


        const swiper = this;
        swiper.__swiper__ = true;
        swiper.support = getSupport();
        swiper.device = getDevice({
          userAgent: params.userAgent
        });
        swiper.browser = getBrowser();
        swiper.eventsListeners = {};
        swiper.eventsAnyListeners = [];
        swiper.modules = [...swiper.__modules__];

        if (params.modules && Array.isArray(params.modules)) {
          swiper.modules.push(...params.modules);
        }

        const allModulesParams = {};
        swiper.modules.forEach(mod => {
          mod({
            swiper,
            extendParams: moduleExtendParams(params, allModulesParams),
            on: swiper.on.bind(swiper),
            once: swiper.once.bind(swiper),
            off: swiper.off.bind(swiper),
            emit: swiper.emit.bind(swiper)
          });
        }); // Extend defaults with modules params

        const swiperParams = extend$1({}, defaults, allModulesParams); // Extend defaults with passed params

        swiper.params = extend$1({}, swiperParams, extendedDefaults, params);
        swiper.originalParams = extend$1({}, swiper.params);
        swiper.passedParams = extend$1({}, params); // add event listeners

        if (swiper.params && swiper.params.on) {
          Object.keys(swiper.params.on).forEach(eventName => {
            swiper.on(eventName, swiper.params.on[eventName]);
          });
        }

        if (swiper.params && swiper.params.onAny) {
          swiper.onAny(swiper.params.onAny);
        } // Save Dom lib


        swiper.$ = $; // Extend Swiper

        Object.assign(swiper, {
          enabled: swiper.params.enabled,
          el,
          // Classes
          classNames: [],
          // Slides
          slides: $(),
          slidesGrid: [],
          snapGrid: [],
          slidesSizesGrid: [],

          // isDirection
          isHorizontal() {
            return swiper.params.direction === 'horizontal';
          },

          isVertical() {
            return swiper.params.direction === 'vertical';
          },

          // Indexes
          activeIndex: 0,
          realIndex: 0,
          //
          isBeginning: true,
          isEnd: false,
          // Props
          translate: 0,
          previousTranslate: 0,
          progress: 0,
          velocity: 0,
          animating: false,
          // Locks
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,
          // Touch Events
          touchEvents: function touchEvents() {
            const touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
            const desktop = ['pointerdown', 'pointermove', 'pointerup'];
            swiper.touchEventsTouch = {
              start: touch[0],
              move: touch[1],
              end: touch[2],
              cancel: touch[3]
            };
            swiper.touchEventsDesktop = {
              start: desktop[0],
              move: desktop[1],
              end: desktop[2]
            };
            return swiper.support.touch || !swiper.params.simulateTouch ? swiper.touchEventsTouch : swiper.touchEventsDesktop;
          }(),
          touchEventsData: {
            isTouched: undefined,
            isMoved: undefined,
            allowTouchCallbacks: undefined,
            touchStartTime: undefined,
            isScrolling: undefined,
            currentTranslate: undefined,
            startTranslate: undefined,
            allowThresholdMove: undefined,
            // Form elements to match
            focusableElements: swiper.params.focusableElements,
            // Last click time
            lastClickTime: now(),
            clickTimeout: undefined,
            // Velocities
            velocities: [],
            allowMomentumBounce: undefined,
            isTouchEvent: undefined,
            startMoving: undefined
          },
          // Clicks
          allowClick: true,
          // Touches
          allowTouchMove: swiper.params.allowTouchMove,
          touches: {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
          },
          // Images
          imagesToLoad: [],
          imagesLoaded: 0
        });
        swiper.emit('_swiper'); // Init

        if (swiper.params.init) {
          swiper.init();
        } // Return app instance


        return swiper;
      }

      enable() {
        const swiper = this;
        if (swiper.enabled) return;
        swiper.enabled = true;

        if (swiper.params.grabCursor) {
          swiper.setGrabCursor();
        }

        swiper.emit('enable');
      }

      disable() {
        const swiper = this;
        if (!swiper.enabled) return;
        swiper.enabled = false;

        if (swiper.params.grabCursor) {
          swiper.unsetGrabCursor();
        }

        swiper.emit('disable');
      }

      setProgress(progress, speed) {
        const swiper = this;
        progress = Math.min(Math.max(progress, 0), 1);
        const min = swiper.minTranslate();
        const max = swiper.maxTranslate();
        const current = (max - min) * progress + min;
        swiper.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }

      emitContainerClasses() {
        const swiper = this;
        if (!swiper.params._emitClasses || !swiper.el) return;
        const cls = swiper.el.className.split(' ').filter(className => {
          return className.indexOf('swiper') === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
        });
        swiper.emit('_containerClasses', cls.join(' '));
      }

      getSlideClasses(slideEl) {
        const swiper = this;
        if (swiper.destroyed) return '';
        return slideEl.className.split(' ').filter(className => {
          return className.indexOf('swiper-slide') === 0 || className.indexOf(swiper.params.slideClass) === 0;
        }).join(' ');
      }

      emitSlidesClasses() {
        const swiper = this;
        if (!swiper.params._emitClasses || !swiper.el) return;
        const updates = [];
        swiper.slides.each(slideEl => {
          const classNames = swiper.getSlideClasses(slideEl);
          updates.push({
            slideEl,
            classNames
          });
          swiper.emit('_slideClass', slideEl, classNames);
        });
        swiper.emit('_slideClasses', updates);
      }

      slidesPerViewDynamic(view, exact) {
        if (view === void 0) {
          view = 'current';
        }

        if (exact === void 0) {
          exact = false;
        }

        const swiper = this;
        const {
          params,
          slides,
          slidesGrid,
          slidesSizesGrid,
          size: swiperSize,
          activeIndex
        } = swiper;
        let spv = 1;

        if (params.centeredSlides) {
          let slideSize = slides[activeIndex].swiperSlideSize;
          let breakLoop;

          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }

          for (let i = activeIndex - 1; i >= 0; i -= 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
        } else {
          // eslint-disable-next-line
          if (view === 'current') {
            for (let i = activeIndex + 1; i < slides.length; i += 1) {
              const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;

              if (slideInView) {
                spv += 1;
              }
            }
          } else {
            // previous
            for (let i = activeIndex - 1; i >= 0; i -= 1) {
              const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;

              if (slideInView) {
                spv += 1;
              }
            }
          }
        }

        return spv;
      }

      update() {
        const swiper = this;
        if (!swiper || swiper.destroyed) return;
        const {
          snapGrid,
          params
        } = swiper; // Breakpoints

        if (params.breakpoints) {
          swiper.setBreakpoint();
        }

        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();

        function setTranslate() {
          const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
          const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
          swiper.setTranslate(newTranslate);
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }

        let translated;

        if (swiper.params.freeMode && swiper.params.freeMode.enabled) {
          setTranslate();

          if (swiper.params.autoHeight) {
            swiper.updateAutoHeight();
          }
        } else {
          if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
            translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
          } else {
            translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
          }

          if (!translated) {
            setTranslate();
          }
        }

        if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
          swiper.checkOverflow();
        }

        swiper.emit('update');
      }

      changeDirection(newDirection, needUpdate) {
        if (needUpdate === void 0) {
          needUpdate = true;
        }

        const swiper = this;
        const currentDirection = swiper.params.direction;

        if (!newDirection) {
          // eslint-disable-next-line
          newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        }

        if (newDirection === currentDirection || newDirection !== 'horizontal' && newDirection !== 'vertical') {
          return swiper;
        }

        swiper.$el.removeClass(`${swiper.params.containerModifierClass}${currentDirection}`).addClass(`${swiper.params.containerModifierClass}${newDirection}`);
        swiper.emitContainerClasses();
        swiper.params.direction = newDirection;
        swiper.slides.each(slideEl => {
          if (newDirection === 'vertical') {
            slideEl.style.width = '';
          } else {
            slideEl.style.height = '';
          }
        });
        swiper.emit('changeDirection');
        if (needUpdate) swiper.update();
        return swiper;
      }

      changeLanguageDirection(direction) {
        const swiper = this;
        if (swiper.rtl && direction === 'rtl' || !swiper.rtl && direction === 'ltr') return;
        swiper.rtl = direction === 'rtl';
        swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;

        if (swiper.rtl) {
          swiper.$el.addClass(`${swiper.params.containerModifierClass}rtl`);
          swiper.el.dir = 'rtl';
        } else {
          swiper.$el.removeClass(`${swiper.params.containerModifierClass}rtl`);
          swiper.el.dir = 'ltr';
        }

        swiper.update();
      }

      mount(el) {
        const swiper = this;
        if (swiper.mounted) return true; // Find el

        const $el = $(el || swiper.params.el);
        el = $el[0];

        if (!el) {
          return false;
        }

        el.swiper = swiper;

        const getWrapperSelector = () => {
          return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
        };

        const getWrapper = () => {
          if (el && el.shadowRoot && el.shadowRoot.querySelector) {
            const res = $(el.shadowRoot.querySelector(getWrapperSelector())); // Children needs to return slot items

            res.children = options => $el.children(options);

            return res;
          }

          if (!$el.children) {
            return $($el).children(getWrapperSelector());
          }

          return $el.children(getWrapperSelector());
        }; // Find Wrapper


        let $wrapperEl = getWrapper();

        if ($wrapperEl.length === 0 && swiper.params.createElements) {
          const document = getDocument();
          const wrapper = document.createElement('div');
          $wrapperEl = $(wrapper);
          wrapper.className = swiper.params.wrapperClass;
          $el.append(wrapper);
          $el.children(`.${swiper.params.slideClass}`).each(slideEl => {
            $wrapperEl.append(slideEl);
          });
        }

        Object.assign(swiper, {
          $el,
          el,
          $wrapperEl,
          wrapperEl: $wrapperEl[0],
          mounted: true,
          // RTL
          rtl: el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl',
          rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
          wrongRTL: $wrapperEl.css('display') === '-webkit-box'
        });
        return true;
      }

      init(el) {
        const swiper = this;
        if (swiper.initialized) return swiper;
        const mounted = swiper.mount(el);
        if (mounted === false) return swiper;
        swiper.emit('beforeInit'); // Set breakpoint

        if (swiper.params.breakpoints) {
          swiper.setBreakpoint();
        } // Add Classes


        swiper.addClasses(); // Create loop

        if (swiper.params.loop) {
          swiper.loopCreate();
        } // Update size


        swiper.updateSize(); // Update slides

        swiper.updateSlides();

        if (swiper.params.watchOverflow) {
          swiper.checkOverflow();
        } // Set Grab Cursor


        if (swiper.params.grabCursor && swiper.enabled) {
          swiper.setGrabCursor();
        }

        if (swiper.params.preloadImages) {
          swiper.preloadImages();
        } // Slide To Initial Slide


        if (swiper.params.loop) {
          swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit, false, true);
        } else {
          swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
        } // Attach events


        swiper.attachEvents(); // Init Flag

        swiper.initialized = true; // Emit

        swiper.emit('init');
        swiper.emit('afterInit');
        return swiper;
      }

      destroy(deleteInstance, cleanStyles) {
        if (deleteInstance === void 0) {
          deleteInstance = true;
        }

        if (cleanStyles === void 0) {
          cleanStyles = true;
        }

        const swiper = this;
        const {
          params,
          $el,
          $wrapperEl,
          slides
        } = swiper;

        if (typeof swiper.params === 'undefined' || swiper.destroyed) {
          return null;
        }

        swiper.emit('beforeDestroy'); // Init Flag

        swiper.initialized = false; // Detach events

        swiper.detachEvents(); // Destroy loop

        if (params.loop) {
          swiper.loopDestroy();
        } // Cleanup styles


        if (cleanStyles) {
          swiper.removeClasses();
          $el.removeAttr('style');
          $wrapperEl.removeAttr('style');

          if (slides && slides.length) {
            slides.removeClass([params.slideVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass].join(' ')).removeAttr('style').removeAttr('data-swiper-slide-index');
          }
        }

        swiper.emit('destroy'); // Detach emitter events

        Object.keys(swiper.eventsListeners).forEach(eventName => {
          swiper.off(eventName);
        });

        if (deleteInstance !== false) {
          swiper.$el[0].swiper = null;
          deleteProps(swiper);
        }

        swiper.destroyed = true;
        return null;
      }

      static extendDefaults(newDefaults) {
        extend$1(extendedDefaults, newDefaults);
      }

      static get extendedDefaults() {
        return extendedDefaults;
      }

      static get defaults() {
        return defaults;
      }

      static installModule(mod) {
        if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
        const modules = Swiper.prototype.__modules__;

        if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
          modules.push(mod);
        }
      }

      static use(module) {
        if (Array.isArray(module)) {
          module.forEach(m => Swiper.installModule(m));
          return Swiper;
        }

        Swiper.installModule(module);
        return Swiper;
      }

    }

    Object.keys(prototypes).forEach(prototypeGroup => {
      Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
        Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
      });
    });
    Swiper.use([Resize, Observer]);

    function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
      const document = getDocument();

      if (swiper.params.createElements) {
        Object.keys(checkProps).forEach(key => {
          if (!params[key] && params.auto === true) {
            let element = swiper.$el.children(`.${checkProps[key]}`)[0];

            if (!element) {
              element = document.createElement('div');
              element.className = checkProps[key];
              swiper.$el.append(element);
            }

            params[key] = element;
            originalParams[key] = element;
          }
        });
      }

      return params;
    }

    function Navigation(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      extendParams({
        navigation: {
          nextEl: null,
          prevEl: null,
          hideOnClick: false,
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
          lockClass: 'swiper-button-lock',
          navigationDisabledClass: 'swiper-navigation-disabled'
        }
      });
      swiper.navigation = {
        nextEl: null,
        $nextEl: null,
        prevEl: null,
        $prevEl: null
      };

      function getEl(el) {
        let $el;

        if (el) {
          $el = $(el);

          if (swiper.params.uniqueNavElements && typeof el === 'string' && $el.length > 1 && swiper.$el.find(el).length === 1) {
            $el = swiper.$el.find(el);
          }
        }

        return $el;
      }

      function toggleEl($el, disabled) {
        const params = swiper.params.navigation;

        if ($el && $el.length > 0) {
          $el[disabled ? 'addClass' : 'removeClass'](params.disabledClass);
          if ($el[0] && $el[0].tagName === 'BUTTON') $el[0].disabled = disabled;

          if (swiper.params.watchOverflow && swiper.enabled) {
            $el[swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
          }
        }
      }

      function update() {
        // Update Navigation Buttons
        if (swiper.params.loop) return;
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;
        toggleEl($prevEl, swiper.isBeginning && !swiper.params.rewind);
        toggleEl($nextEl, swiper.isEnd && !swiper.params.rewind);
      }

      function onPrevClick(e) {
        e.preventDefault();
        if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
        swiper.slidePrev();
        emit('navigationPrev');
      }

      function onNextClick(e) {
        e.preventDefault();
        if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
        swiper.slideNext();
        emit('navigationNext');
      }

      function init() {
        const params = swiper.params.navigation;
        swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
          nextEl: 'swiper-button-next',
          prevEl: 'swiper-button-prev'
        });
        if (!(params.nextEl || params.prevEl)) return;
        const $nextEl = getEl(params.nextEl);
        const $prevEl = getEl(params.prevEl);

        if ($nextEl && $nextEl.length > 0) {
          $nextEl.on('click', onNextClick);
        }

        if ($prevEl && $prevEl.length > 0) {
          $prevEl.on('click', onPrevClick);
        }

        Object.assign(swiper.navigation, {
          $nextEl,
          nextEl: $nextEl && $nextEl[0],
          $prevEl,
          prevEl: $prevEl && $prevEl[0]
        });

        if (!swiper.enabled) {
          if ($nextEl) $nextEl.addClass(params.lockClass);
          if ($prevEl) $prevEl.addClass(params.lockClass);
        }
      }

      function destroy() {
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;

        if ($nextEl && $nextEl.length) {
          $nextEl.off('click', onNextClick);
          $nextEl.removeClass(swiper.params.navigation.disabledClass);
        }

        if ($prevEl && $prevEl.length) {
          $prevEl.off('click', onPrevClick);
          $prevEl.removeClass(swiper.params.navigation.disabledClass);
        }
      }

      on('init', () => {
        if (swiper.params.navigation.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          update();
        }
      });
      on('toEdge fromEdge lock unlock', () => {
        update();
      });
      on('destroy', () => {
        destroy();
      });
      on('enable disable', () => {
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;

        if ($nextEl) {
          $nextEl[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.navigation.lockClass);
        }

        if ($prevEl) {
          $prevEl[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.navigation.lockClass);
        }
      });
      on('click', (_s, e) => {
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;
        const targetEl = e.target;

        if (swiper.params.navigation.hideOnClick && !$(targetEl).is($prevEl) && !$(targetEl).is($nextEl)) {
          if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
          let isHidden;

          if ($nextEl) {
            isHidden = $nextEl.hasClass(swiper.params.navigation.hiddenClass);
          } else if ($prevEl) {
            isHidden = $prevEl.hasClass(swiper.params.navigation.hiddenClass);
          }

          if (isHidden === true) {
            emit('navigationShow');
          } else {
            emit('navigationHide');
          }

          if ($nextEl) {
            $nextEl.toggleClass(swiper.params.navigation.hiddenClass);
          }

          if ($prevEl) {
            $prevEl.toggleClass(swiper.params.navigation.hiddenClass);
          }
        }
      });

      const enable = () => {
        swiper.$el.removeClass(swiper.params.navigation.navigationDisabledClass);
        init();
        update();
      };

      const disable = () => {
        swiper.$el.addClass(swiper.params.navigation.navigationDisabledClass);
        destroy();
      };

      Object.assign(swiper.navigation, {
        enable,
        disable,
        update,
        init,
        destroy
      });
    }

    function classesToSelector(classes) {
      if (classes === void 0) {
        classes = '';
      }

      return `.${classes.trim().replace(/([\.:!\/])/g, '\\$1') // eslint-disable-line
  .replace(/ /g, '.')}`;
    }

    function Pagination(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const pfx = 'swiper-pagination';
      extendParams({
        pagination: {
          el: null,
          bulletElement: 'span',
          clickable: false,
          hideOnClick: false,
          renderBullet: null,
          renderProgressbar: null,
          renderFraction: null,
          renderCustom: null,
          progressbarOpposite: false,
          type: 'bullets',
          // 'bullets' or 'progressbar' or 'fraction' or 'custom'
          dynamicBullets: false,
          dynamicMainBullets: 1,
          formatFractionCurrent: number => number,
          formatFractionTotal: number => number,
          bulletClass: `${pfx}-bullet`,
          bulletActiveClass: `${pfx}-bullet-active`,
          modifierClass: `${pfx}-`,
          currentClass: `${pfx}-current`,
          totalClass: `${pfx}-total`,
          hiddenClass: `${pfx}-hidden`,
          progressbarFillClass: `${pfx}-progressbar-fill`,
          progressbarOppositeClass: `${pfx}-progressbar-opposite`,
          clickableClass: `${pfx}-clickable`,
          lockClass: `${pfx}-lock`,
          horizontalClass: `${pfx}-horizontal`,
          verticalClass: `${pfx}-vertical`,
          paginationDisabledClass: `${pfx}-disabled`
        }
      });
      swiper.pagination = {
        el: null,
        $el: null,
        bullets: []
      };
      let bulletSize;
      let dynamicBulletIndex = 0;

      function isPaginationDisabled() {
        return !swiper.params.pagination.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0;
      }

      function setSideBullets($bulletEl, position) {
        const {
          bulletActiveClass
        } = swiper.params.pagination;
        $bulletEl[position]().addClass(`${bulletActiveClass}-${position}`)[position]().addClass(`${bulletActiveClass}-${position}-${position}`);
      }

      function update() {
        // Render || Update Pagination bullets/items
        const rtl = swiper.rtl;
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const $el = swiper.pagination.$el; // Current/Total

        let current;
        const total = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;

        if (swiper.params.loop) {
          current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);

          if (current > slidesLength - 1 - swiper.loopedSlides * 2) {
            current -= slidesLength - swiper.loopedSlides * 2;
          }

          if (current > total - 1) current -= total;
          if (current < 0 && swiper.params.paginationType !== 'bullets') current = total + current;
        } else if (typeof swiper.snapIndex !== 'undefined') {
          current = swiper.snapIndex;
        } else {
          current = swiper.activeIndex || 0;
        } // Types


        if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
          const bullets = swiper.pagination.bullets;
          let firstIndex;
          let lastIndex;
          let midIndex;

          if (params.dynamicBullets) {
            bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
            $el.css(swiper.isHorizontal() ? 'width' : 'height', `${bulletSize * (params.dynamicMainBullets + 4)}px`);

            if (params.dynamicMainBullets > 1 && swiper.previousIndex !== undefined) {
              dynamicBulletIndex += current - (swiper.previousIndex - swiper.loopedSlides || 0);

              if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
                dynamicBulletIndex = params.dynamicMainBullets - 1;
              } else if (dynamicBulletIndex < 0) {
                dynamicBulletIndex = 0;
              }
            }

            firstIndex = Math.max(current - dynamicBulletIndex, 0);
            lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
            midIndex = (lastIndex + firstIndex) / 2;
          }

          bullets.removeClass(['', '-next', '-next-next', '-prev', '-prev-prev', '-main'].map(suffix => `${params.bulletActiveClass}${suffix}`).join(' '));

          if ($el.length > 1) {
            bullets.each(bullet => {
              const $bullet = $(bullet);
              const bulletIndex = $bullet.index();

              if (bulletIndex === current) {
                $bullet.addClass(params.bulletActiveClass);
              }

              if (params.dynamicBullets) {
                if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                  $bullet.addClass(`${params.bulletActiveClass}-main`);
                }

                if (bulletIndex === firstIndex) {
                  setSideBullets($bullet, 'prev');
                }

                if (bulletIndex === lastIndex) {
                  setSideBullets($bullet, 'next');
                }
              }
            });
          } else {
            const $bullet = bullets.eq(current);
            const bulletIndex = $bullet.index();
            $bullet.addClass(params.bulletActiveClass);

            if (params.dynamicBullets) {
              const $firstDisplayedBullet = bullets.eq(firstIndex);
              const $lastDisplayedBullet = bullets.eq(lastIndex);

              for (let i = firstIndex; i <= lastIndex; i += 1) {
                bullets.eq(i).addClass(`${params.bulletActiveClass}-main`);
              }

              if (swiper.params.loop) {
                if (bulletIndex >= bullets.length) {
                  for (let i = params.dynamicMainBullets; i >= 0; i -= 1) {
                    bullets.eq(bullets.length - i).addClass(`${params.bulletActiveClass}-main`);
                  }

                  bullets.eq(bullets.length - params.dynamicMainBullets - 1).addClass(`${params.bulletActiveClass}-prev`);
                } else {
                  setSideBullets($firstDisplayedBullet, 'prev');
                  setSideBullets($lastDisplayedBullet, 'next');
                }
              } else {
                setSideBullets($firstDisplayedBullet, 'prev');
                setSideBullets($lastDisplayedBullet, 'next');
              }
            }
          }

          if (params.dynamicBullets) {
            const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
            const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
            const offsetProp = rtl ? 'right' : 'left';
            bullets.css(swiper.isHorizontal() ? offsetProp : 'top', `${bulletsOffset}px`);
          }
        }

        if (params.type === 'fraction') {
          $el.find(classesToSelector(params.currentClass)).text(params.formatFractionCurrent(current + 1));
          $el.find(classesToSelector(params.totalClass)).text(params.formatFractionTotal(total));
        }

        if (params.type === 'progressbar') {
          let progressbarDirection;

          if (params.progressbarOpposite) {
            progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
          } else {
            progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
          }

          const scale = (current + 1) / total;
          let scaleX = 1;
          let scaleY = 1;

          if (progressbarDirection === 'horizontal') {
            scaleX = scale;
          } else {
            scaleY = scale;
          }

          $el.find(classesToSelector(params.progressbarFillClass)).transform(`translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`).transition(swiper.params.speed);
        }

        if (params.type === 'custom' && params.renderCustom) {
          $el.html(params.renderCustom(swiper, current + 1, total));
          emit('paginationRender', $el[0]);
        } else {
          emit('paginationUpdate', $el[0]);
        }

        if (swiper.params.watchOverflow && swiper.enabled) {
          $el[swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
        }
      }

      function render() {
        // Render Container
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const $el = swiper.pagination.$el;
        let paginationHTML = '';

        if (params.type === 'bullets') {
          let numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;

          if (swiper.params.freeMode && swiper.params.freeMode.enabled && !swiper.params.loop && numberOfBullets > slidesLength) {
            numberOfBullets = slidesLength;
          }

          for (let i = 0; i < numberOfBullets; i += 1) {
            if (params.renderBullet) {
              paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
            } else {
              paginationHTML += `<${params.bulletElement} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
          }

          $el.html(paginationHTML);
          swiper.pagination.bullets = $el.find(classesToSelector(params.bulletClass));
        }

        if (params.type === 'fraction') {
          if (params.renderFraction) {
            paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
          } else {
            paginationHTML = `<span class="${params.currentClass}"></span>` + ' / ' + `<span class="${params.totalClass}"></span>`;
          }

          $el.html(paginationHTML);
        }

        if (params.type === 'progressbar') {
          if (params.renderProgressbar) {
            paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
          } else {
            paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
          }

          $el.html(paginationHTML);
        }

        if (params.type !== 'custom') {
          emit('paginationRender', swiper.pagination.$el[0]);
        }
      }

      function init() {
        swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
          el: 'swiper-pagination'
        });
        const params = swiper.params.pagination;
        if (!params.el) return;
        let $el = $(params.el);
        if ($el.length === 0) return;

        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1) {
          $el = swiper.$el.find(params.el); // check if it belongs to another nested Swiper

          if ($el.length > 1) {
            $el = $el.filter(el => {
              if ($(el).parents('.swiper')[0] !== swiper.el) return false;
              return true;
            });
          }
        }

        if (params.type === 'bullets' && params.clickable) {
          $el.addClass(params.clickableClass);
        }

        $el.addClass(params.modifierClass + params.type);
        $el.addClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);

        if (params.type === 'bullets' && params.dynamicBullets) {
          $el.addClass(`${params.modifierClass}${params.type}-dynamic`);
          dynamicBulletIndex = 0;

          if (params.dynamicMainBullets < 1) {
            params.dynamicMainBullets = 1;
          }
        }

        if (params.type === 'progressbar' && params.progressbarOpposite) {
          $el.addClass(params.progressbarOppositeClass);
        }

        if (params.clickable) {
          $el.on('click', classesToSelector(params.bulletClass), function onClick(e) {
            e.preventDefault();
            let index = $(this).index() * swiper.params.slidesPerGroup;
            if (swiper.params.loop) index += swiper.loopedSlides;
            swiper.slideTo(index);
          });
        }

        Object.assign(swiper.pagination, {
          $el,
          el: $el[0]
        });

        if (!swiper.enabled) {
          $el.addClass(params.lockClass);
        }
      }

      function destroy() {
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const $el = swiper.pagination.$el;
        $el.removeClass(params.hiddenClass);
        $el.removeClass(params.modifierClass + params.type);
        $el.removeClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (swiper.pagination.bullets && swiper.pagination.bullets.removeClass) swiper.pagination.bullets.removeClass(params.bulletActiveClass);

        if (params.clickable) {
          $el.off('click', classesToSelector(params.bulletClass));
        }
      }

      on('init', () => {
        if (swiper.params.pagination.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          render();
          update();
        }
      });
      on('activeIndexChange', () => {
        if (swiper.params.loop) {
          update();
        } else if (typeof swiper.snapIndex === 'undefined') {
          update();
        }
      });
      on('snapIndexChange', () => {
        if (!swiper.params.loop) {
          update();
        }
      });
      on('slidesLengthChange', () => {
        if (swiper.params.loop) {
          render();
          update();
        }
      });
      on('snapGridLengthChange', () => {
        if (!swiper.params.loop) {
          render();
          update();
        }
      });
      on('destroy', () => {
        destroy();
      });
      on('enable disable', () => {
        const {
          $el
        } = swiper.pagination;

        if ($el) {
          $el[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.pagination.lockClass);
        }
      });
      on('lock unlock', () => {
        update();
      });
      on('click', (_s, e) => {
        const targetEl = e.target;
        const {
          $el
        } = swiper.pagination;

        if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && $el && $el.length > 0 && !$(targetEl).hasClass(swiper.params.pagination.bulletClass)) {
          if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
          const isHidden = $el.hasClass(swiper.params.pagination.hiddenClass);

          if (isHidden === true) {
            emit('paginationShow');
          } else {
            emit('paginationHide');
          }

          $el.toggleClass(swiper.params.pagination.hiddenClass);
        }
      });

      const enable = () => {
        swiper.$el.removeClass(swiper.params.pagination.paginationDisabledClass);

        if (swiper.pagination.$el) {
          swiper.pagination.$el.removeClass(swiper.params.pagination.paginationDisabledClass);
        }

        init();
        render();
        update();
      };

      const disable = () => {
        swiper.$el.addClass(swiper.params.pagination.paginationDisabledClass);

        if (swiper.pagination.$el) {
          swiper.pagination.$el.addClass(swiper.params.pagination.paginationDisabledClass);
        }

        destroy();
      };

      Object.assign(swiper.pagination, {
        enable,
        disable,
        render,
        update,
        init,
        destroy
      });
    }

    /* eslint no-underscore-dangle: "off" */
    function Autoplay(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      let timeout;
      swiper.autoplay = {
        running: false,
        paused: false
      };
      extendParams({
        autoplay: {
          enabled: false,
          delay: 3000,
          waitForTransition: true,
          disableOnInteraction: true,
          stopOnLastSlide: false,
          reverseDirection: false,
          pauseOnMouseEnter: false
        }
      });

      function run() {
        if (!swiper.size) {
          swiper.autoplay.running = false;
          swiper.autoplay.paused = false;
          return;
        }

        const $activeSlideEl = swiper.slides.eq(swiper.activeIndex);
        let delay = swiper.params.autoplay.delay;

        if ($activeSlideEl.attr('data-swiper-autoplay')) {
          delay = $activeSlideEl.attr('data-swiper-autoplay') || swiper.params.autoplay.delay;
        }

        clearTimeout(timeout);
        timeout = nextTick(() => {
          let autoplayResult;

          if (swiper.params.autoplay.reverseDirection) {
            if (swiper.params.loop) {
              swiper.loopFix();
              autoplayResult = swiper.slidePrev(swiper.params.speed, true, true);
              emit('autoplay');
            } else if (!swiper.isBeginning) {
              autoplayResult = swiper.slidePrev(swiper.params.speed, true, true);
              emit('autoplay');
            } else if (!swiper.params.autoplay.stopOnLastSlide) {
              autoplayResult = swiper.slideTo(swiper.slides.length - 1, swiper.params.speed, true, true);
              emit('autoplay');
            } else {
              stop();
            }
          } else if (swiper.params.loop) {
            swiper.loopFix();
            autoplayResult = swiper.slideNext(swiper.params.speed, true, true);
            emit('autoplay');
          } else if (!swiper.isEnd) {
            autoplayResult = swiper.slideNext(swiper.params.speed, true, true);
            emit('autoplay');
          } else if (!swiper.params.autoplay.stopOnLastSlide) {
            autoplayResult = swiper.slideTo(0, swiper.params.speed, true, true);
            emit('autoplay');
          } else {
            stop();
          }

          if (swiper.params.cssMode && swiper.autoplay.running) run();else if (autoplayResult === false) {
            run();
          }
        }, delay);
      }

      function start() {
        if (typeof timeout !== 'undefined') return false;
        if (swiper.autoplay.running) return false;
        swiper.autoplay.running = true;
        emit('autoplayStart');
        run();
        return true;
      }

      function stop() {
        if (!swiper.autoplay.running) return false;
        if (typeof timeout === 'undefined') return false;

        if (timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }

        swiper.autoplay.running = false;
        emit('autoplayStop');
        return true;
      }

      function pause(speed) {
        if (!swiper.autoplay.running) return;
        if (swiper.autoplay.paused) return;
        if (timeout) clearTimeout(timeout);
        swiper.autoplay.paused = true;

        if (speed === 0 || !swiper.params.autoplay.waitForTransition) {
          swiper.autoplay.paused = false;
          run();
        } else {
          ['transitionend', 'webkitTransitionEnd'].forEach(event => {
            swiper.$wrapperEl[0].addEventListener(event, onTransitionEnd);
          });
        }
      }

      function onVisibilityChange() {
        const document = getDocument();

        if (document.visibilityState === 'hidden' && swiper.autoplay.running) {
          pause();
        }

        if (document.visibilityState === 'visible' && swiper.autoplay.paused) {
          run();
          swiper.autoplay.paused = false;
        }
      }

      function onTransitionEnd(e) {
        if (!swiper || swiper.destroyed || !swiper.$wrapperEl) return;
        if (e.target !== swiper.$wrapperEl[0]) return;
        ['transitionend', 'webkitTransitionEnd'].forEach(event => {
          swiper.$wrapperEl[0].removeEventListener(event, onTransitionEnd);
        });
        swiper.autoplay.paused = false;

        if (!swiper.autoplay.running) {
          stop();
        } else {
          run();
        }
      }

      function onMouseEnter() {
        if (swiper.params.autoplay.disableOnInteraction) {
          stop();
        } else {
          emit('autoplayPause');
          pause();
        }

        ['transitionend', 'webkitTransitionEnd'].forEach(event => {
          swiper.$wrapperEl[0].removeEventListener(event, onTransitionEnd);
        });
      }

      function onMouseLeave() {
        if (swiper.params.autoplay.disableOnInteraction) {
          return;
        }

        swiper.autoplay.paused = false;
        emit('autoplayResume');
        run();
      }

      function attachMouseEvents() {
        if (swiper.params.autoplay.pauseOnMouseEnter) {
          swiper.$el.on('mouseenter', onMouseEnter);
          swiper.$el.on('mouseleave', onMouseLeave);
        }
      }

      function detachMouseEvents() {
        swiper.$el.off('mouseenter', onMouseEnter);
        swiper.$el.off('mouseleave', onMouseLeave);
      }

      on('init', () => {
        if (swiper.params.autoplay.enabled) {
          start();
          const document = getDocument();
          document.addEventListener('visibilitychange', onVisibilityChange);
          attachMouseEvents();
        }
      });
      on('beforeTransitionStart', (_s, speed, internal) => {
        if (swiper.autoplay.running) {
          if (internal || !swiper.params.autoplay.disableOnInteraction) {
            swiper.autoplay.pause(speed);
          } else {
            stop();
          }
        }
      });
      on('sliderFirstMove', () => {
        if (swiper.autoplay.running) {
          if (swiper.params.autoplay.disableOnInteraction) {
            stop();
          } else {
            pause();
          }
        }
      });
      on('touchEnd', () => {
        if (swiper.params.cssMode && swiper.autoplay.paused && !swiper.params.autoplay.disableOnInteraction) {
          run();
        }
      });
      on('destroy', () => {
        detachMouseEvents();

        if (swiper.autoplay.running) {
          stop();
        }

        const document = getDocument();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      });
      Object.assign(swiper.autoplay, {
        pause,
        run,
        start,
        stop
      });
    }

    function Thumb(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        thumbs: {
          swiper: null,
          multipleActiveThumbs: true,
          autoScrollOffset: 0,
          slideThumbActiveClass: 'swiper-slide-thumb-active',
          thumbsContainerClass: 'swiper-thumbs'
        }
      });
      let initialized = false;
      let swiperCreated = false;
      swiper.thumbs = {
        swiper: null
      };

      function onThumbClick() {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        const clickedIndex = thumbsSwiper.clickedIndex;
        const clickedSlide = thumbsSwiper.clickedSlide;
        if (clickedSlide && $(clickedSlide).hasClass(swiper.params.thumbs.slideThumbActiveClass)) return;
        if (typeof clickedIndex === 'undefined' || clickedIndex === null) return;
        let slideToIndex;

        if (thumbsSwiper.params.loop) {
          slideToIndex = parseInt($(thumbsSwiper.clickedSlide).attr('data-swiper-slide-index'), 10);
        } else {
          slideToIndex = clickedIndex;
        }

        if (swiper.params.loop) {
          let currentIndex = swiper.activeIndex;

          if (swiper.slides.eq(currentIndex).hasClass(swiper.params.slideDuplicateClass)) {
            swiper.loopFix(); // eslint-disable-next-line

            swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
            currentIndex = swiper.activeIndex;
          }

          const prevIndex = swiper.slides.eq(currentIndex).prevAll(`[data-swiper-slide-index="${slideToIndex}"]`).eq(0).index();
          const nextIndex = swiper.slides.eq(currentIndex).nextAll(`[data-swiper-slide-index="${slideToIndex}"]`).eq(0).index();
          if (typeof prevIndex === 'undefined') slideToIndex = nextIndex;else if (typeof nextIndex === 'undefined') slideToIndex = prevIndex;else if (nextIndex - currentIndex < currentIndex - prevIndex) slideToIndex = nextIndex;else slideToIndex = prevIndex;
        }

        swiper.slideTo(slideToIndex);
      }

      function init() {
        const {
          thumbs: thumbsParams
        } = swiper.params;
        if (initialized) return false;
        initialized = true;
        const SwiperClass = swiper.constructor;

        if (thumbsParams.swiper instanceof SwiperClass) {
          swiper.thumbs.swiper = thumbsParams.swiper;
          Object.assign(swiper.thumbs.swiper.originalParams, {
            watchSlidesProgress: true,
            slideToClickedSlide: false
          });
          Object.assign(swiper.thumbs.swiper.params, {
            watchSlidesProgress: true,
            slideToClickedSlide: false
          });
        } else if (isObject$1(thumbsParams.swiper)) {
          const thumbsSwiperParams = Object.assign({}, thumbsParams.swiper);
          Object.assign(thumbsSwiperParams, {
            watchSlidesProgress: true,
            slideToClickedSlide: false
          });
          swiper.thumbs.swiper = new SwiperClass(thumbsSwiperParams);
          swiperCreated = true;
        }

        swiper.thumbs.swiper.$el.addClass(swiper.params.thumbs.thumbsContainerClass);
        swiper.thumbs.swiper.on('tap', onThumbClick);
        return true;
      }

      function update(initial) {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        const slidesPerView = thumbsSwiper.params.slidesPerView === 'auto' ? thumbsSwiper.slidesPerViewDynamic() : thumbsSwiper.params.slidesPerView; // Activate thumbs

        let thumbsToActivate = 1;
        const thumbActiveClass = swiper.params.thumbs.slideThumbActiveClass;

        if (swiper.params.slidesPerView > 1 && !swiper.params.centeredSlides) {
          thumbsToActivate = swiper.params.slidesPerView;
        }

        if (!swiper.params.thumbs.multipleActiveThumbs) {
          thumbsToActivate = 1;
        }

        thumbsToActivate = Math.floor(thumbsToActivate);
        thumbsSwiper.slides.removeClass(thumbActiveClass);

        if (thumbsSwiper.params.loop || thumbsSwiper.params.virtual && thumbsSwiper.params.virtual.enabled) {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            thumbsSwiper.$wrapperEl.children(`[data-swiper-slide-index="${swiper.realIndex + i}"]`).addClass(thumbActiveClass);
          }
        } else {
          for (let i = 0; i < thumbsToActivate; i += 1) {
            thumbsSwiper.slides.eq(swiper.realIndex + i).addClass(thumbActiveClass);
          }
        }

        const autoScrollOffset = swiper.params.thumbs.autoScrollOffset;
        const useOffset = autoScrollOffset && !thumbsSwiper.params.loop;

        if (swiper.realIndex !== thumbsSwiper.realIndex || useOffset) {
          let currentThumbsIndex = thumbsSwiper.activeIndex;
          let newThumbsIndex;
          let direction;

          if (thumbsSwiper.params.loop) {
            if (thumbsSwiper.slides.eq(currentThumbsIndex).hasClass(thumbsSwiper.params.slideDuplicateClass)) {
              thumbsSwiper.loopFix(); // eslint-disable-next-line

              thumbsSwiper._clientLeft = thumbsSwiper.$wrapperEl[0].clientLeft;
              currentThumbsIndex = thumbsSwiper.activeIndex;
            } // Find actual thumbs index to slide to


            const prevThumbsIndex = thumbsSwiper.slides.eq(currentThumbsIndex).prevAll(`[data-swiper-slide-index="${swiper.realIndex}"]`).eq(0).index();
            const nextThumbsIndex = thumbsSwiper.slides.eq(currentThumbsIndex).nextAll(`[data-swiper-slide-index="${swiper.realIndex}"]`).eq(0).index();

            if (typeof prevThumbsIndex === 'undefined') {
              newThumbsIndex = nextThumbsIndex;
            } else if (typeof nextThumbsIndex === 'undefined') {
              newThumbsIndex = prevThumbsIndex;
            } else if (nextThumbsIndex - currentThumbsIndex === currentThumbsIndex - prevThumbsIndex) {
              newThumbsIndex = thumbsSwiper.params.slidesPerGroup > 1 ? nextThumbsIndex : currentThumbsIndex;
            } else if (nextThumbsIndex - currentThumbsIndex < currentThumbsIndex - prevThumbsIndex) {
              newThumbsIndex = nextThumbsIndex;
            } else {
              newThumbsIndex = prevThumbsIndex;
            }

            direction = swiper.activeIndex > swiper.previousIndex ? 'next' : 'prev';
          } else {
            newThumbsIndex = swiper.realIndex;
            direction = newThumbsIndex > swiper.previousIndex ? 'next' : 'prev';
          }

          if (useOffset) {
            newThumbsIndex += direction === 'next' ? autoScrollOffset : -1 * autoScrollOffset;
          }

          if (thumbsSwiper.visibleSlidesIndexes && thumbsSwiper.visibleSlidesIndexes.indexOf(newThumbsIndex) < 0) {
            if (thumbsSwiper.params.centeredSlides) {
              if (newThumbsIndex > currentThumbsIndex) {
                newThumbsIndex = newThumbsIndex - Math.floor(slidesPerView / 2) + 1;
              } else {
                newThumbsIndex = newThumbsIndex + Math.floor(slidesPerView / 2) - 1;
              }
            } else if (newThumbsIndex > currentThumbsIndex && thumbsSwiper.params.slidesPerGroup === 1) ;

            thumbsSwiper.slideTo(newThumbsIndex, initial ? 0 : undefined);
          }
        }
      }

      on('beforeInit', () => {
        const {
          thumbs
        } = swiper.params;
        if (!thumbs || !thumbs.swiper) return;
        init();
        update(true);
      });
      on('slideChange update resize observerUpdate', () => {
        update();
      });
      on('setTransition', (_s, duration) => {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;
        thumbsSwiper.setTransition(duration);
      });
      on('beforeDestroy', () => {
        const thumbsSwiper = swiper.thumbs.swiper;
        if (!thumbsSwiper || thumbsSwiper.destroyed) return;

        if (swiperCreated) {
          thumbsSwiper.destroy();
        }
      });
      Object.assign(swiper.thumbs, {
        init,
        update
      });
    }

    // @fancyapps/ui/Fancybox v4.0.31
    const t = t => "object" == typeof t && null !== t && t.constructor === Object && "[object Object]" === Object.prototype.toString.call(t),
          e = (...i) => {
      let s = !1;
      "boolean" == typeof i[0] && (s = i.shift());
      let o = i[0];
      if (!o || "object" != typeof o) throw new Error("extendee must be an object");
      const n = i.slice(1),
            a = n.length;

      for (let i = 0; i < a; i++) {
        const a = n[i];

        for (let i in a) if (a.hasOwnProperty(i)) {
          const n = a[i];

          if (s && (Array.isArray(n) || t(n))) {
            const t = Array.isArray(n) ? [] : {};
            o[i] = e(!0, o.hasOwnProperty(i) ? o[i] : t, n);
          } else o[i] = n;
        }
      }

      return o;
    },
          i = (t, e = 1e4) => (t = parseFloat(t) || 0, Math.round((t + Number.EPSILON) * e) / e),
          s = function (t) {
      return !!(t && "object" == typeof t && t instanceof Element && t !== document.body) && !t.__Panzoom && (function (t) {
        const e = getComputedStyle(t)["overflow-y"],
              i = getComputedStyle(t)["overflow-x"],
              s = ("scroll" === e || "auto" === e) && Math.abs(t.scrollHeight - t.clientHeight) > 1,
              o = ("scroll" === i || "auto" === i) && Math.abs(t.scrollWidth - t.clientWidth) > 1;
        return s || o;
      }(t) ? t : s(t.parentNode));
    },
          o = "undefined" != typeof window && window.ResizeObserver || class {
      constructor(t) {
        this.observables = [], this.boundCheck = this.check.bind(this), this.boundCheck(), this.callback = t;
      }

      observe(t) {
        if (this.observables.some(e => e.el === t)) return;
        const e = {
          el: t,
          size: {
            height: t.clientHeight,
            width: t.clientWidth
          }
        };
        this.observables.push(e);
      }

      unobserve(t) {
        this.observables = this.observables.filter(e => e.el !== t);
      }

      disconnect() {
        this.observables = [];
      }

      check() {
        const t = this.observables.filter(t => {
          const e = t.el.clientHeight,
                i = t.el.clientWidth;
          if (t.size.height !== e || t.size.width !== i) return t.size.height = e, t.size.width = i, !0;
        }).map(t => t.el);
        t.length > 0 && this.callback(t), window.requestAnimationFrame(this.boundCheck);
      }

    };

    class n {
      constructor(t) {
        this.id = self.Touch && t instanceof Touch ? t.identifier : -1, this.pageX = t.pageX, this.pageY = t.pageY, this.clientX = t.clientX, this.clientY = t.clientY;
      }

    }

    const a = (t, e) => e ? Math.sqrt((e.clientX - t.clientX) ** 2 + (e.clientY - t.clientY) ** 2) : 0,
          r = (t, e) => e ? {
      clientX: (t.clientX + e.clientX) / 2,
      clientY: (t.clientY + e.clientY) / 2
    } : t;

    class h {
      constructor(t, {
        start: e = () => !0,
        move: i = () => {},
        end: s = () => {}
      } = {}) {
        this._element = t, this.startPointers = [], this.currentPointers = [], this._pointerStart = t => {
          if (t.buttons > 0 && 0 !== t.button) return;
          const e = new n(t);
          this.currentPointers.some(t => t.id === e.id) || this._triggerPointerStart(e, t) && (window.addEventListener("mousemove", this._move), window.addEventListener("mouseup", this._pointerEnd));
        }, this._touchStart = t => {
          for (const e of Array.from(t.changedTouches || [])) this._triggerPointerStart(new n(e), t);
        }, this._move = t => {
          const e = this.currentPointers.slice(),
                i = (t => "changedTouches" in t)(t) ? Array.from(t.changedTouches).map(t => new n(t)) : [new n(t)];

          for (const t of i) {
            const e = this.currentPointers.findIndex(e => e.id === t.id);
            e < 0 || (this.currentPointers[e] = t);
          }

          this._moveCallback(e, this.currentPointers.slice(), t);
        }, this._triggerPointerEnd = (t, e) => {
          const i = this.currentPointers.findIndex(e => e.id === t.id);
          return !(i < 0) && (this.currentPointers.splice(i, 1), this.startPointers.splice(i, 1), this._endCallback(t, e), !0);
        }, this._pointerEnd = t => {
          t.buttons > 0 && 0 !== t.button || this._triggerPointerEnd(new n(t), t) && (window.removeEventListener("mousemove", this._move, {
            passive: !1
          }), window.removeEventListener("mouseup", this._pointerEnd, {
            passive: !1
          }));
        }, this._touchEnd = t => {
          for (const e of Array.from(t.changedTouches || [])) this._triggerPointerEnd(new n(e), t);
        }, this._startCallback = e, this._moveCallback = i, this._endCallback = s, this._element.addEventListener("mousedown", this._pointerStart, {
          passive: !1
        }), this._element.addEventListener("touchstart", this._touchStart, {
          passive: !1
        }), this._element.addEventListener("touchmove", this._move, {
          passive: !1
        }), this._element.addEventListener("touchend", this._touchEnd), this._element.addEventListener("touchcancel", this._touchEnd);
      }

      stop() {
        this._element.removeEventListener("mousedown", this._pointerStart, {
          passive: !1
        }), this._element.removeEventListener("touchstart", this._touchStart, {
          passive: !1
        }), this._element.removeEventListener("touchmove", this._move, {
          passive: !1
        }), this._element.removeEventListener("touchend", this._touchEnd), this._element.removeEventListener("touchcancel", this._touchEnd), window.removeEventListener("mousemove", this._move), window.removeEventListener("mouseup", this._pointerEnd);
      }

      _triggerPointerStart(t, e) {
        return !!this._startCallback(t, e) && (this.currentPointers.push(t), this.startPointers.push(t), !0);
      }

    }

    class l {
      constructor(t = {}) {
        this.options = e(!0, {}, t), this.plugins = [], this.events = {};

        for (const t of ["on", "once"]) for (const e of Object.entries(this.options[t] || {})) this[t](...e);
      }

      option(t, e, ...i) {
        t = String(t);
        let s = (o = t, n = this.options, o.split(".").reduce(function (t, e) {
          return t && t[e];
        }, n));
        var o, n;
        return "function" == typeof s && (s = s.call(this, this, ...i)), void 0 === s ? e : s;
      }

      localize(t, e = []) {
        return t = (t = String(t).replace(/\{\{(\w+).?(\w+)?\}\}/g, (t, i, s) => {
          let o = "";
          s ? o = this.option(`${i[0] + i.toLowerCase().substring(1)}.l10n.${s}`) : i && (o = this.option(`l10n.${i}`)), o || (o = t);

          for (let t = 0; t < e.length; t++) o = o.split(e[t][0]).join(e[t][1]);

          return o;
        })).replace(/\{\{(.*)\}\}/, (t, e) => e);
      }

      on(e, i) {
        if (t(e)) {
          for (const t of Object.entries(e)) this.on(...t);

          return this;
        }

        return String(e).split(" ").forEach(t => {
          const e = this.events[t] = this.events[t] || [];
          -1 == e.indexOf(i) && e.push(i);
        }), this;
      }

      once(e, i) {
        if (t(e)) {
          for (const t of Object.entries(e)) this.once(...t);

          return this;
        }

        return String(e).split(" ").forEach(t => {
          const e = (...s) => {
            this.off(t, e), i.call(this, this, ...s);
          };

          e._ = i, this.on(t, e);
        }), this;
      }

      off(e, i) {
        if (!t(e)) return e.split(" ").forEach(t => {
          const e = this.events[t];
          if (!e || !e.length) return this;
          let s = -1;

          for (let t = 0, o = e.length; t < o; t++) {
            const o = e[t];

            if (o && (o === i || o._ === i)) {
              s = t;
              break;
            }
          }

          -1 != s && e.splice(s, 1);
        }), this;

        for (const t of Object.entries(e)) this.off(...t);
      }

      trigger(t, ...e) {
        for (const i of [...(this.events[t] || [])].slice()) if (i && !1 === i.call(this, this, ...e)) return !1;

        for (const i of [...(this.events["*"] || [])].slice()) if (i && !1 === i.call(this, t, this, ...e)) return !1;

        return !0;
      }

      attachPlugins(t) {
        const i = {};

        for (const [s, o] of Object.entries(t || {})) !1 === this.options[s] || this.plugins[s] || (this.options[s] = e({}, o.defaults || {}, this.options[s]), i[s] = new o(this));

        for (const [t, e] of Object.entries(i)) e.attach(this);

        return this.plugins = Object.assign({}, this.plugins, i), this;
      }

      detachPlugins() {
        for (const t in this.plugins) {
          let e;
          (e = this.plugins[t]) && "function" == typeof e.detach && e.detach(this);
        }

        return this.plugins = {}, this;
      }

    }

    const c = {
      touch: !0,
      zoom: !0,
      pinchToZoom: !0,
      panOnlyZoomed: !1,
      lockAxis: !1,
      friction: .64,
      decelFriction: .88,
      zoomFriction: .74,
      bounceForce: .2,
      baseScale: 1,
      minScale: 1,
      maxScale: 2,
      step: .5,
      textSelection: !1,
      click: "toggleZoom",
      wheel: "zoom",
      wheelFactor: 42,
      wheelLimit: 5,
      draggableClass: "is-draggable",
      draggingClass: "is-dragging",
      ratio: 1
    };

    class d extends l {
      constructor(t, i = {}) {
        super(e(!0, {}, c, i)), this.state = "init", this.$container = t;

        for (const t of ["onLoad", "onWheel", "onClick"]) this[t] = this[t].bind(this);

        this.initLayout(), this.resetValues(), this.attachPlugins(d.Plugins), this.trigger("init"), this.updateMetrics(), this.attachEvents(), this.trigger("ready"), !1 === this.option("centerOnStart") ? this.state = "ready" : this.panTo({
          friction: 0
        }), t.__Panzoom = this;
      }

      initLayout() {
        const t = this.$container;
        if (!(t instanceof HTMLElement)) throw new Error("Panzoom: Container not found");
        const e = this.option("content") || t.querySelector(".panzoom__content");
        if (!e) throw new Error("Panzoom: Content not found");
        this.$content = e;
        let i = this.option("viewport") || t.querySelector(".panzoom__viewport");
        i || !1 === this.option("wrapInner") || (i = document.createElement("div"), i.classList.add("panzoom__viewport"), i.append(...t.childNodes), t.appendChild(i)), this.$viewport = i || e.parentNode;
      }

      resetValues() {
        this.updateRate = this.option("updateRate", /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 250 : 24), this.container = {
          width: 0,
          height: 0
        }, this.viewport = {
          width: 0,
          height: 0
        }, this.content = {
          origWidth: 0,
          origHeight: 0,
          width: 0,
          height: 0,
          x: this.option("x", 0),
          y: this.option("y", 0),
          scale: this.option("baseScale")
        }, this.transform = {
          x: 0,
          y: 0,
          scale: 1
        }, this.resetDragPosition();
      }

      onLoad(t) {
        this.updateMetrics(), this.panTo({
          scale: this.option("baseScale"),
          friction: 0
        }), this.trigger("load", t);
      }

      onClick(t) {
        if (t.defaultPrevented) return;
        if (document.activeElement && document.activeElement.closest("[contenteditable]")) return;
        if (this.option("textSelection") && window.getSelection().toString().length && (!t.target || !t.target.hasAttribute("data-fancybox-close"))) return void t.stopPropagation();
        const e = this.$content.getClientRects()[0];
        if ("ready" !== this.state && (this.dragPosition.midPoint || Math.abs(e.top - this.dragStart.rect.top) > 1 || Math.abs(e.left - this.dragStart.rect.left) > 1)) return t.preventDefault(), void t.stopPropagation();
        !1 !== this.trigger("click", t) && this.option("zoom") && "toggleZoom" === this.option("click") && (t.preventDefault(), t.stopPropagation(), this.zoomWithClick(t));
      }

      onWheel(t) {
        !1 !== this.trigger("wheel", t) && this.option("zoom") && this.option("wheel") && this.zoomWithWheel(t);
      }

      zoomWithWheel(t) {
        void 0 === this.changedDelta && (this.changedDelta = 0);
        const e = Math.max(-1, Math.min(1, -t.deltaY || -t.deltaX || t.wheelDelta || -t.detail)),
              i = this.content.scale;
        let s = i * (100 + e * this.option("wheelFactor")) / 100;
        if (e < 0 && Math.abs(i - this.option("minScale")) < .01 || e > 0 && Math.abs(i - this.option("maxScale")) < .01 ? (this.changedDelta += Math.abs(e), s = i) : (this.changedDelta = 0, s = Math.max(Math.min(s, this.option("maxScale")), this.option("minScale"))), this.changedDelta > this.option("wheelLimit")) return;
        if (t.preventDefault(), s === i) return;
        const o = this.$content.getBoundingClientRect(),
              n = t.clientX - o.left,
              a = t.clientY - o.top;
        this.zoomTo(s, {
          x: n,
          y: a
        });
      }

      zoomWithClick(t) {
        const e = this.$content.getClientRects()[0],
              i = t.clientX - e.left,
              s = t.clientY - e.top;
        this.toggleZoom({
          x: i,
          y: s
        });
      }

      attachEvents() {
        this.$content.addEventListener("load", this.onLoad), this.$container.addEventListener("wheel", this.onWheel, {
          passive: !1
        }), this.$container.addEventListener("click", this.onClick, {
          passive: !1
        }), this.initObserver();
        const t = new h(this.$container, {
          start: (e, i) => {
            if (!this.option("touch")) return !1;
            if (this.velocity.scale < 0) return !1;
            const o = i.composedPath()[0];

            if (!t.currentPointers.length) {
              if (-1 !== ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(o.nodeName)) return !1;
              if (this.option("textSelection") && ((t, e, i) => {
                const s = t.childNodes,
                      o = document.createRange();

                for (let t = 0; t < s.length; t++) {
                  const n = s[t];
                  if (n.nodeType !== Node.TEXT_NODE) continue;
                  o.selectNodeContents(n);
                  const a = o.getBoundingClientRect();
                  if (e >= a.left && i >= a.top && e <= a.right && i <= a.bottom) return n;
                }

                return !1;
              })(o, e.clientX, e.clientY)) return !1;
            }

            return !s(o) && !1 !== this.trigger("touchStart", i) && ("mousedown" === i.type && i.preventDefault(), this.state = "pointerdown", this.resetDragPosition(), this.dragPosition.midPoint = null, this.dragPosition.time = Date.now(), !0);
          },
          move: (e, i, s) => {
            if ("pointerdown" !== this.state) return;
            if (!1 === this.trigger("touchMove", s)) return void s.preventDefault();
            if (i.length < 2 && !0 === this.option("panOnlyZoomed") && this.content.width <= this.viewport.width && this.content.height <= this.viewport.height && this.transform.scale <= this.option("baseScale")) return;
            if (i.length > 1 && (!this.option("zoom") || !1 === this.option("pinchToZoom"))) return;
            const o = r(e[0], e[1]),
                  n = r(i[0], i[1]),
                  h = n.clientX - o.clientX,
                  l = n.clientY - o.clientY,
                  c = a(e[0], e[1]),
                  d = a(i[0], i[1]),
                  u = c && d ? d / c : 1;
            this.dragOffset.x += h, this.dragOffset.y += l, this.dragOffset.scale *= u, this.dragOffset.time = Date.now() - this.dragPosition.time;
            const f = 1 === this.dragStart.scale && this.option("lockAxis");

            if (f && !this.lockAxis) {
              if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6) return void s.preventDefault();
              const t = Math.abs(180 * Math.atan2(this.dragOffset.y, this.dragOffset.x) / Math.PI);
              this.lockAxis = t > 45 && t < 135 ? "y" : "x";
            }

            if ("xy" === f || "y" !== this.lockAxis) {
              if (s.preventDefault(), s.stopPropagation(), s.stopImmediatePropagation(), this.lockAxis && (this.dragOffset["x" === this.lockAxis ? "y" : "x"] = 0), this.$container.classList.add(this.option("draggingClass")), this.transform.scale === this.option("baseScale") && "y" === this.lockAxis || (this.dragPosition.x = this.dragStart.x + this.dragOffset.x), this.transform.scale === this.option("baseScale") && "x" === this.lockAxis || (this.dragPosition.y = this.dragStart.y + this.dragOffset.y), this.dragPosition.scale = this.dragStart.scale * this.dragOffset.scale, i.length > 1) {
                const e = r(t.startPointers[0], t.startPointers[1]),
                      i = e.clientX - this.dragStart.rect.x,
                      s = e.clientY - this.dragStart.rect.y,
                      {
                  deltaX: o,
                  deltaY: a
                } = this.getZoomDelta(this.content.scale * this.dragOffset.scale, i, s);
                this.dragPosition.x -= o, this.dragPosition.y -= a, this.dragPosition.midPoint = n;
              } else this.setDragResistance();

              this.transform = {
                x: this.dragPosition.x,
                y: this.dragPosition.y,
                scale: this.dragPosition.scale
              }, this.startAnimation();
            }
          },
          end: (e, i) => {
            if ("pointerdown" !== this.state) return;
            if (this._dragOffset = { ...this.dragOffset
            }, t.currentPointers.length) return void this.resetDragPosition();
            if (this.state = "decel", this.friction = this.option("decelFriction"), this.recalculateTransform(), this.$container.classList.remove(this.option("draggingClass")), !1 === this.trigger("touchEnd", i)) return;
            if ("decel" !== this.state) return;
            const s = this.option("minScale");
            if (this.transform.scale < s) return void this.zoomTo(s, {
              friction: .64
            });
            const o = this.option("maxScale");

            if (this.transform.scale - o > .01) {
              const t = this.dragPosition.midPoint || e,
                    i = this.$content.getClientRects()[0];
              this.zoomTo(o, {
                friction: .64,
                x: t.clientX - i.left,
                y: t.clientY - i.top
              });
            }
          }
        });
        this.pointerTracker = t;
      }

      initObserver() {
        this.resizeObserver || (this.resizeObserver = new o(() => {
          this.updateTimer || (this.updateTimer = setTimeout(() => {
            const t = this.$container.getBoundingClientRect();
            t.width && t.height ? ((Math.abs(t.width - this.container.width) > 1 || Math.abs(t.height - this.container.height) > 1) && (this.isAnimating() && this.endAnimation(!0), this.updateMetrics(), this.panTo({
              x: this.content.x,
              y: this.content.y,
              scale: this.option("baseScale"),
              friction: 0
            })), this.updateTimer = null) : this.updateTimer = null;
          }, this.updateRate));
        }), this.resizeObserver.observe(this.$container));
      }

      resetDragPosition() {
        this.lockAxis = null, this.friction = this.option("friction"), this.velocity = {
          x: 0,
          y: 0,
          scale: 0
        };
        const {
          x: t,
          y: e,
          scale: i
        } = this.content;
        this.dragStart = {
          rect: this.$content.getBoundingClientRect(),
          x: t,
          y: e,
          scale: i
        }, this.dragPosition = { ...this.dragPosition,
          x: t,
          y: e,
          scale: i
        }, this.dragOffset = {
          x: 0,
          y: 0,
          scale: 1,
          time: 0
        };
      }

      updateMetrics(t) {
        !0 !== t && this.trigger("beforeUpdate");
        const e = this.$container,
              s = this.$content,
              o = this.$viewport,
              n = s instanceof HTMLImageElement,
              a = this.option("zoom"),
              r = this.option("resizeParent", a);
        let h = this.option("width"),
            l = this.option("height"),
            c = h || (d = s, Math.max(parseFloat(d.naturalWidth || 0), parseFloat(d.width && d.width.baseVal && d.width.baseVal.value || 0), parseFloat(d.offsetWidth || 0), parseFloat(d.scrollWidth || 0)));
        var d;

        let u = l || (t => Math.max(parseFloat(t.naturalHeight || 0), parseFloat(t.height && t.height.baseVal && t.height.baseVal.value || 0), parseFloat(t.offsetHeight || 0), parseFloat(t.scrollHeight || 0)))(s);

        Object.assign(s.style, {
          width: h ? `${h}px` : "",
          height: l ? `${l}px` : "",
          maxWidth: "",
          maxHeight: ""
        }), r && Object.assign(o.style, {
          width: "",
          height: ""
        });
        const f = this.option("ratio");
        c = i(c * f), u = i(u * f), h = c, l = u;
        const g = s.getBoundingClientRect(),
              p = o.getBoundingClientRect(),
              m = o == e ? p : e.getBoundingClientRect();
        let y = Math.max(o.offsetWidth, i(p.width)),
            v = Math.max(o.offsetHeight, i(p.height)),
            b = window.getComputedStyle(o);

        if (y -= parseFloat(b.paddingLeft) + parseFloat(b.paddingRight), v -= parseFloat(b.paddingTop) + parseFloat(b.paddingBottom), this.viewport.width = y, this.viewport.height = v, a) {
          if (Math.abs(c - g.width) > .1 || Math.abs(u - g.height) > .1) {
            const t = ((t, e, i, s) => {
              const o = Math.min(i / t || 0, s / e);
              return {
                width: t * o || 0,
                height: e * o || 0
              };
            })(c, u, Math.min(c, g.width), Math.min(u, g.height));

            h = i(t.width), l = i(t.height);
          }

          Object.assign(s.style, {
            width: `${h}px`,
            height: `${l}px`,
            transform: ""
          });
        }

        if (r && (Object.assign(o.style, {
          width: `${h}px`,
          height: `${l}px`
        }), this.viewport = { ...this.viewport,
          width: h,
          height: l
        }), n && a && "function" != typeof this.options.maxScale) {
          const t = this.option("maxScale");

          this.options.maxScale = function () {
            return this.content.origWidth > 0 && this.content.fitWidth > 0 ? this.content.origWidth / this.content.fitWidth : t;
          };
        }

        this.content = { ...this.content,
          origWidth: c,
          origHeight: u,
          fitWidth: h,
          fitHeight: l,
          width: h,
          height: l,
          scale: 1,
          isZoomable: a
        }, this.container = {
          width: m.width,
          height: m.height
        }, !0 !== t && this.trigger("afterUpdate");
      }

      zoomIn(t) {
        this.zoomTo(this.content.scale + (t || this.option("step")));
      }

      zoomOut(t) {
        this.zoomTo(this.content.scale - (t || this.option("step")));
      }

      toggleZoom(t = {}) {
        const e = this.option("maxScale"),
              i = this.option("baseScale"),
              s = this.content.scale > i + .5 * (e - i) ? i : e;
        this.zoomTo(s, t);
      }

      zoomTo(t = this.option("baseScale"), {
        x: e = null,
        y: s = null
      } = {}) {
        t = Math.max(Math.min(t, this.option("maxScale")), this.option("minScale"));
        const o = i(this.content.scale / (this.content.width / this.content.fitWidth), 1e7);
        null === e && (e = this.content.width * o * .5), null === s && (s = this.content.height * o * .5);
        const {
          deltaX: n,
          deltaY: a
        } = this.getZoomDelta(t, e, s);
        e = this.content.x - n, s = this.content.y - a, this.panTo({
          x: e,
          y: s,
          scale: t,
          friction: this.option("zoomFriction")
        });
      }

      getZoomDelta(t, e = 0, i = 0) {
        const s = this.content.fitWidth * this.content.scale,
              o = this.content.fitHeight * this.content.scale,
              n = e > 0 && s ? e / s : 0,
              a = i > 0 && o ? i / o : 0;
        return {
          deltaX: (this.content.fitWidth * t - s) * n,
          deltaY: (this.content.fitHeight * t - o) * a
        };
      }

      panTo({
        x: t = this.content.x,
        y: e = this.content.y,
        scale: i,
        friction: s = this.option("friction"),
        ignoreBounds: o = !1
      } = {}) {
        if (i = i || this.content.scale || 1, !o) {
          const {
            boundX: s,
            boundY: o
          } = this.getBounds(i);
          s && (t = Math.max(Math.min(t, s.to), s.from)), o && (e = Math.max(Math.min(e, o.to), o.from));
        }

        this.friction = s, this.transform = { ...this.transform,
          x: t,
          y: e,
          scale: i
        }, s ? (this.state = "panning", this.velocity = {
          x: (1 / this.friction - 1) * (t - this.content.x),
          y: (1 / this.friction - 1) * (e - this.content.y),
          scale: (1 / this.friction - 1) * (i - this.content.scale)
        }, this.startAnimation()) : this.endAnimation();
      }

      startAnimation() {
        this.rAF ? cancelAnimationFrame(this.rAF) : this.trigger("startAnimation"), this.rAF = requestAnimationFrame(() => this.animate());
      }

      animate() {
        if (this.setEdgeForce(), this.setDragForce(), this.velocity.x *= this.friction, this.velocity.y *= this.friction, this.velocity.scale *= this.friction, this.content.x += this.velocity.x, this.content.y += this.velocity.y, this.content.scale += this.velocity.scale, this.isAnimating()) this.setTransform();else if ("pointerdown" !== this.state) return void this.endAnimation();
        this.rAF = requestAnimationFrame(() => this.animate());
      }

      getBounds(t) {
        let e = this.boundX,
            s = this.boundY;
        if (void 0 !== e && void 0 !== s) return {
          boundX: e,
          boundY: s
        };
        e = {
          from: 0,
          to: 0
        }, s = {
          from: 0,
          to: 0
        }, t = t || this.transform.scale;
        const o = this.content.fitWidth * t,
              n = this.content.fitHeight * t,
              a = this.viewport.width,
              r = this.viewport.height;

        if (o < a) {
          const t = i(.5 * (a - o));
          e.from = t, e.to = t;
        } else e.from = i(a - o);

        if (n < r) {
          const t = .5 * (r - n);
          s.from = t, s.to = t;
        } else s.from = i(r - n);

        return {
          boundX: e,
          boundY: s
        };
      }

      setEdgeForce() {
        if ("decel" !== this.state) return;
        const t = this.option("bounceForce"),
              {
          boundX: e,
          boundY: i
        } = this.getBounds(Math.max(this.transform.scale, this.content.scale));
        let s, o, n, a;

        if (e && (s = this.content.x < e.from, o = this.content.x > e.to), i && (n = this.content.y < i.from, a = this.content.y > i.to), s || o) {
          let i = ((s ? e.from : e.to) - this.content.x) * t;
          const o = this.content.x + (this.velocity.x + i) / this.friction;
          o >= e.from && o <= e.to && (i += this.velocity.x), this.velocity.x = i, this.recalculateTransform();
        }

        if (n || a) {
          let e = ((n ? i.from : i.to) - this.content.y) * t;
          const s = this.content.y + (e + this.velocity.y) / this.friction;
          s >= i.from && s <= i.to && (e += this.velocity.y), this.velocity.y = e, this.recalculateTransform();
        }
      }

      setDragResistance() {
        if ("pointerdown" !== this.state) return;
        const {
          boundX: t,
          boundY: e
        } = this.getBounds(this.dragPosition.scale);
        let i, s, o, n;

        if (t && (i = this.dragPosition.x < t.from, s = this.dragPosition.x > t.to), e && (o = this.dragPosition.y < e.from, n = this.dragPosition.y > e.to), (i || s) && (!i || !s)) {
          const e = i ? t.from : t.to,
                s = e - this.dragPosition.x;
          this.dragPosition.x = e - .3 * s;
        }

        if ((o || n) && (!o || !n)) {
          const t = o ? e.from : e.to,
                i = t - this.dragPosition.y;
          this.dragPosition.y = t - .3 * i;
        }
      }

      setDragForce() {
        "pointerdown" === this.state && (this.velocity.x = this.dragPosition.x - this.content.x, this.velocity.y = this.dragPosition.y - this.content.y, this.velocity.scale = this.dragPosition.scale - this.content.scale);
      }

      recalculateTransform() {
        this.transform.x = this.content.x + this.velocity.x / (1 / this.friction - 1), this.transform.y = this.content.y + this.velocity.y / (1 / this.friction - 1), this.transform.scale = this.content.scale + this.velocity.scale / (1 / this.friction - 1);
      }

      isAnimating() {
        return !(!this.friction || !(Math.abs(this.velocity.x) > .05 || Math.abs(this.velocity.y) > .05 || Math.abs(this.velocity.scale) > .05));
      }

      setTransform(t) {
        let e, s, o;

        if (t ? (e = i(this.transform.x), s = i(this.transform.y), o = this.transform.scale, this.content = { ...this.content,
          x: e,
          y: s,
          scale: o
        }) : (e = i(this.content.x), s = i(this.content.y), o = this.content.scale / (this.content.width / this.content.fitWidth), this.content = { ...this.content,
          x: e,
          y: s
        }), this.trigger("beforeTransform"), e = i(this.content.x), s = i(this.content.y), t && this.option("zoom")) {
          let t, n;
          t = i(this.content.fitWidth * o), n = i(this.content.fitHeight * o), this.content.width = t, this.content.height = n, this.transform = { ...this.transform,
            width: t,
            height: n,
            scale: o
          }, Object.assign(this.$content.style, {
            width: `${t}px`,
            height: `${n}px`,
            maxWidth: "none",
            maxHeight: "none",
            transform: `translate3d(${e}px, ${s}px, 0) scale(1)`
          });
        } else this.$content.style.transform = `translate3d(${e}px, ${s}px, 0) scale(${o})`;

        this.trigger("afterTransform");
      }

      endAnimation(t) {
        cancelAnimationFrame(this.rAF), this.rAF = null, this.velocity = {
          x: 0,
          y: 0,
          scale: 0
        }, this.setTransform(!0), this.state = "ready", this.handleCursor(), !0 !== t && this.trigger("endAnimation");
      }

      handleCursor() {
        const t = this.option("draggableClass");
        t && this.option("touch") && (1 == this.option("panOnlyZoomed") && this.content.width <= this.viewport.width && this.content.height <= this.viewport.height && this.transform.scale <= this.option("baseScale") ? this.$container.classList.remove(t) : this.$container.classList.add(t));
      }

      detachEvents() {
        this.$content.removeEventListener("load", this.onLoad), this.$container.removeEventListener("wheel", this.onWheel, {
          passive: !1
        }), this.$container.removeEventListener("click", this.onClick, {
          passive: !1
        }), this.pointerTracker && (this.pointerTracker.stop(), this.pointerTracker = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
      }

      destroy() {
        "destroy" !== this.state && (this.state = "destroy", clearTimeout(this.updateTimer), this.updateTimer = null, cancelAnimationFrame(this.rAF), this.rAF = null, this.detachEvents(), this.detachPlugins(), this.resetDragPosition());
      }

    }

    d.version = "4.0.31", d.Plugins = {};

    const u = (t, e) => {
      let i = 0;
      return function (...s) {
        const o = new Date().getTime();
        if (!(o - i < e)) return i = o, t(...s);
      };
    };

    class f {
      constructor(t) {
        this.$container = null, this.$prev = null, this.$next = null, this.carousel = t, this.onRefresh = this.onRefresh.bind(this);
      }

      option(t) {
        return this.carousel.option(`Navigation.${t}`);
      }

      createButton(t) {
        const e = document.createElement("button");
        e.setAttribute("title", this.carousel.localize(`{{${t.toUpperCase()}}}`));
        const i = this.option("classNames.button") + " " + this.option(`classNames.${t}`);
        return e.classList.add(...i.split(" ")), e.setAttribute("tabindex", "0"), e.innerHTML = this.carousel.localize(this.option(`${t}Tpl`)), e.addEventListener("click", e => {
          e.preventDefault(), e.stopPropagation(), this.carousel["slide" + ("next" === t ? "Next" : "Prev")]();
        }), e;
      }

      build() {
        this.$container || (this.$container = document.createElement("div"), this.$container.classList.add(...this.option("classNames.main").split(" ")), this.carousel.$container.appendChild(this.$container)), this.$next || (this.$next = this.createButton("next"), this.$container.appendChild(this.$next)), this.$prev || (this.$prev = this.createButton("prev"), this.$container.appendChild(this.$prev));
      }

      onRefresh() {
        const t = this.carousel.pages.length;
        t <= 1 || t > 1 && this.carousel.elemDimWidth < this.carousel.wrapDimWidth && !Number.isInteger(this.carousel.option("slidesPerPage")) ? this.cleanup() : (this.build(), this.$prev.removeAttribute("disabled"), this.$next.removeAttribute("disabled"), this.carousel.option("infiniteX", this.carousel.option("infinite")) || (this.carousel.page <= 0 && this.$prev.setAttribute("disabled", ""), this.carousel.page >= t - 1 && this.$next.setAttribute("disabled", "")));
      }

      cleanup() {
        this.$prev && this.$prev.remove(), this.$prev = null, this.$next && this.$next.remove(), this.$next = null, this.$container && this.$container.remove(), this.$container = null;
      }

      attach() {
        this.carousel.on("refresh change", this.onRefresh);
      }

      detach() {
        this.carousel.off("refresh change", this.onRefresh), this.cleanup();
      }

    }

    f.defaults = {
      prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
      nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
      classNames: {
        main: "carousel__nav",
        button: "carousel__button",
        next: "is-next",
        prev: "is-prev"
      }
    };

    class g {
      constructor(t) {
        this.carousel = t, this.selectedIndex = null, this.friction = 0, this.onNavReady = this.onNavReady.bind(this), this.onNavClick = this.onNavClick.bind(this), this.onNavCreateSlide = this.onNavCreateSlide.bind(this), this.onTargetChange = this.onTargetChange.bind(this);
      }

      addAsTargetFor(t) {
        this.target = this.carousel, this.nav = t, this.attachEvents();
      }

      addAsNavFor(t) {
        this.target = t, this.nav = this.carousel, this.attachEvents();
      }

      attachEvents() {
        this.nav.options.initialSlide = this.target.options.initialPage, this.nav.on("ready", this.onNavReady), this.nav.on("createSlide", this.onNavCreateSlide), this.nav.on("Panzoom.click", this.onNavClick), this.target.on("change", this.onTargetChange), this.target.on("Panzoom.afterUpdate", this.onTargetChange);
      }

      onNavReady() {
        this.onTargetChange(!0);
      }

      onNavClick(t, e, i) {
        const s = i.target.closest(".carousel__slide");
        if (!s) return;
        i.stopPropagation();
        const o = parseInt(s.dataset.index, 10),
              n = this.target.findPageForSlide(o);
        this.target.page !== n && this.target.slideTo(n, {
          friction: this.friction
        }), this.markSelectedSlide(o);
      }

      onNavCreateSlide(t, e) {
        e.index === this.selectedIndex && this.markSelectedSlide(e.index);
      }

      onTargetChange() {
        const t = this.target.pages[this.target.page].indexes[0],
              e = this.nav.findPageForSlide(t);
        this.nav.slideTo(e), this.markSelectedSlide(t);
      }

      markSelectedSlide(t) {
        this.selectedIndex = t, [...this.nav.slides].filter(t => t.$el && t.$el.classList.remove("is-nav-selected"));
        const e = this.nav.slides[t];
        e && e.$el && e.$el.classList.add("is-nav-selected");
      }

      attach(t) {
        const e = t.options.Sync;
        (e.target || e.nav) && (e.target ? this.addAsNavFor(e.target) : e.nav && this.addAsTargetFor(e.nav), this.friction = e.friction);
      }

      detach() {
        this.nav && (this.nav.off("ready", this.onNavReady), this.nav.off("Panzoom.click", this.onNavClick), this.nav.off("createSlide", this.onNavCreateSlide)), this.target && (this.target.off("Panzoom.afterUpdate", this.onTargetChange), this.target.off("change", this.onTargetChange));
      }

    }

    g.defaults = {
      friction: .92
    };
    const p = {
      Navigation: f,
      Dots: class {
        constructor(t) {
          this.carousel = t, this.$list = null, this.events = {
            change: this.onChange.bind(this),
            refresh: this.onRefresh.bind(this)
          };
        }

        buildList() {
          if (this.carousel.pages.length < this.carousel.option("Dots.minSlideCount")) return;
          const t = document.createElement("ol");
          return t.classList.add("carousel__dots"), t.addEventListener("click", t => {
            if (!("page" in t.target.dataset)) return;
            t.preventDefault(), t.stopPropagation();
            const e = parseInt(t.target.dataset.page, 10),
                  i = this.carousel;
            e !== i.page && (i.pages.length < 3 && i.option("infinite") ? i[0 == e ? "slidePrev" : "slideNext"]() : i.slideTo(e));
          }), this.$list = t, this.carousel.$container.appendChild(t), this.carousel.$container.classList.add("has-dots"), t;
        }

        removeList() {
          this.$list && (this.$list.parentNode.removeChild(this.$list), this.$list = null), this.carousel.$container.classList.remove("has-dots");
        }

        rebuildDots() {
          let t = this.$list;
          const e = !!t,
                i = this.carousel.pages.length;
          if (i < 2) return void (e && this.removeList());
          e || (t = this.buildList());
          const s = this.$list.children.length;
          if (s > i) for (let t = i; t < s; t++) this.$list.removeChild(this.$list.lastChild);else {
            for (let t = s; t < i; t++) {
              const e = document.createElement("li");
              e.classList.add("carousel__dot"), e.dataset.page = t, e.setAttribute("role", "button"), e.setAttribute("tabindex", "0"), e.setAttribute("title", this.carousel.localize("{{GOTO}}", [["%d", t + 1]])), e.addEventListener("keydown", t => {
                const i = t.code;
                let s;
                "Enter" === i || "NumpadEnter" === i ? s = e : "ArrowRight" === i ? s = e.nextSibling : "ArrowLeft" === i && (s = e.previousSibling), s && s.click();
              }), this.$list.appendChild(e);
            }

            this.setActiveDot();
          }
        }

        setActiveDot() {
          if (!this.$list) return;
          this.$list.childNodes.forEach(t => {
            t.classList.remove("is-selected");
          });
          const t = this.$list.childNodes[this.carousel.page];
          t && t.classList.add("is-selected");
        }

        onChange() {
          this.setActiveDot();
        }

        onRefresh() {
          this.rebuildDots();
        }

        attach() {
          this.carousel.on(this.events);
        }

        detach() {
          this.removeList(), this.carousel.off(this.events), this.carousel = null;
        }

      },
      Sync: g
    };
    const m = {
      slides: [],
      preload: 0,
      slidesPerPage: "auto",
      initialPage: null,
      initialSlide: null,
      friction: .92,
      center: !0,
      infinite: !0,
      fill: !0,
      dragFree: !1,
      prefix: "",
      classNames: {
        viewport: "carousel__viewport",
        track: "carousel__track",
        slide: "carousel__slide",
        slideSelected: "is-selected"
      },
      l10n: {
        NEXT: "Next slide",
        PREV: "Previous slide",
        GOTO: "Go to slide #%d"
      }
    };

    class y extends l {
      constructor(t, i = {}) {
        if (super(i = e(!0, {}, m, i)), this.state = "init", this.$container = t, !(this.$container instanceof HTMLElement)) throw new Error("No root element provided");
        this.slideNext = u(this.slideNext.bind(this), 250), this.slidePrev = u(this.slidePrev.bind(this), 250), this.init(), t.__Carousel = this;
      }

      init() {
        this.pages = [], this.page = this.pageIndex = null, this.prevPage = this.prevPageIndex = null, this.attachPlugins(y.Plugins), this.trigger("init"), this.initLayout(), this.initSlides(), this.updateMetrics(), this.$track && this.pages.length && (this.$track.style.transform = `translate3d(${-1 * this.pages[this.page].left}px, 0px, 0) scale(1)`), this.manageSlideVisiblity(), this.initPanzoom(), this.state = "ready", this.trigger("ready");
      }

      initLayout() {
        const t = this.option("prefix"),
              e = this.option("classNames");
        this.$viewport = this.option("viewport") || this.$container.querySelector(`.${t}${e.viewport}`), this.$viewport || (this.$viewport = document.createElement("div"), this.$viewport.classList.add(...(t + e.viewport).split(" ")), this.$viewport.append(...this.$container.childNodes), this.$container.appendChild(this.$viewport)), this.$track = this.option("track") || this.$container.querySelector(`.${t}${e.track}`), this.$track || (this.$track = document.createElement("div"), this.$track.classList.add(...(t + e.track).split(" ")), this.$track.append(...this.$viewport.childNodes), this.$viewport.appendChild(this.$track));
      }

      initSlides() {
        this.slides = [];
        this.$viewport.querySelectorAll(`.${this.option("prefix")}${this.option("classNames.slide")}`).forEach(t => {
          const e = {
            $el: t,
            isDom: !0
          };
          this.slides.push(e), this.trigger("createSlide", e, this.slides.length);
        }), Array.isArray(this.options.slides) && (this.slides = e(!0, [...this.slides], this.options.slides));
      }

      updateMetrics() {
        let t,
            e = 0,
            s = [];
        this.slides.forEach((i, o) => {
          const n = i.$el,
                a = i.isDom || !t ? this.getSlideMetrics(n) : t;
          i.index = o, i.width = a, i.left = e, t = a, e += a, s.push(o);
        });
        let o = Math.max(this.$track.offsetWidth, i(this.$track.getBoundingClientRect().width)),
            n = getComputedStyle(this.$track);
        o -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight), this.contentWidth = e, this.viewportWidth = o;
        const a = [],
              r = this.option("slidesPerPage");
        if (Number.isInteger(r) && e > o) for (let t = 0; t < this.slides.length; t += r) a.push({
          indexes: s.slice(t, t + r),
          slides: this.slides.slice(t, t + r)
        });else {
          let t = 0,
              e = 0;

          for (let i = 0; i < this.slides.length; i += 1) {
            let s = this.slides[i];
            (!a.length || e + s.width > o) && (a.push({
              indexes: [],
              slides: []
            }), t = a.length - 1, e = 0), e += s.width, a[t].indexes.push(i), a[t].slides.push(s);
          }
        }
        const h = this.option("center"),
              l = this.option("fill");
        a.forEach((t, i) => {
          t.index = i, t.width = t.slides.reduce((t, e) => t + e.width, 0), t.left = t.slides[0].left, h && (t.left += .5 * (o - t.width) * -1), l && !this.option("infiniteX", this.option("infinite")) && e > o && (t.left = Math.max(t.left, 0), t.left = Math.min(t.left, e - o));
        });
        const c = [];
        let d;
        a.forEach(t => {
          const e = { ...t
          };
          d && e.left === d.left ? (d.width += e.width, d.slides = [...d.slides, ...e.slides], d.indexes = [...d.indexes, ...e.indexes]) : (e.index = c.length, d = e, c.push(e));
        }), this.pages = c;
        let u = this.page;

        if (null === u) {
          const t = this.option("initialSlide");
          u = null !== t ? this.findPageForSlide(t) : parseInt(this.option("initialPage", 0), 10) || 0, c[u] || (u = c.length && u > c.length ? c[c.length - 1].index : 0), this.page = u, this.pageIndex = u;
        }

        this.updatePanzoom(), this.trigger("refresh");
      }

      getSlideMetrics(t) {
        if (!t) {
          const e = this.slides[0];
          (t = document.createElement("div")).dataset.isTestEl = 1, t.style.visibility = "hidden", t.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" ")), e.customClass && t.classList.add(...e.customClass.split(" ")), this.$track.prepend(t);
        }

        let e = Math.max(t.offsetWidth, i(t.getBoundingClientRect().width));
        const s = t.currentStyle || window.getComputedStyle(t);
        return e = e + (parseFloat(s.marginLeft) || 0) + (parseFloat(s.marginRight) || 0), t.dataset.isTestEl && t.remove(), e;
      }

      findPageForSlide(t) {
        t = parseInt(t, 10) || 0;
        const e = this.pages.find(e => e.indexes.indexOf(t) > -1);
        return e ? e.index : null;
      }

      slideNext() {
        this.slideTo(this.pageIndex + 1);
      }

      slidePrev() {
        this.slideTo(this.pageIndex - 1);
      }

      slideTo(t, e = {}) {
        const {
          x: i = -1 * this.setPage(t, !0),
          y: s = 0,
          friction: o = this.option("friction")
        } = e;
        this.Panzoom.content.x === i && !this.Panzoom.velocity.x && o || (this.Panzoom.panTo({
          x: i,
          y: s,
          friction: o,
          ignoreBounds: !0
        }), "ready" === this.state && "ready" === this.Panzoom.state && this.trigger("settle"));
      }

      initPanzoom() {
        this.Panzoom && this.Panzoom.destroy();
        const t = e(!0, {}, {
          content: this.$track,
          wrapInner: !1,
          resizeParent: !1,
          zoom: !1,
          click: !1,
          lockAxis: "x",
          x: this.pages.length ? -1 * this.pages[this.page].left : 0,
          centerOnStart: !1,
          textSelection: () => this.option("textSelection", !1),
          panOnlyZoomed: function () {
            return this.content.width <= this.viewport.width;
          }
        }, this.option("Panzoom"));
        this.Panzoom = new d(this.$container, t), this.Panzoom.on({
          "*": (t, ...e) => this.trigger(`Panzoom.${t}`, ...e),
          afterUpdate: () => {
            this.updatePage();
          },
          beforeTransform: this.onBeforeTransform.bind(this),
          touchEnd: this.onTouchEnd.bind(this),
          endAnimation: () => {
            this.trigger("settle");
          }
        }), this.updateMetrics(), this.manageSlideVisiblity();
      }

      updatePanzoom() {
        this.Panzoom && (this.Panzoom.content = { ...this.Panzoom.content,
          fitWidth: this.contentWidth,
          origWidth: this.contentWidth,
          width: this.contentWidth
        }, this.pages.length > 1 && this.option("infiniteX", this.option("infinite")) ? this.Panzoom.boundX = null : this.pages.length && (this.Panzoom.boundX = {
          from: -1 * this.pages[this.pages.length - 1].left,
          to: -1 * this.pages[0].left
        }), this.option("infiniteY", this.option("infinite")) ? this.Panzoom.boundY = null : this.Panzoom.boundY = {
          from: 0,
          to: 0
        }, this.Panzoom.handleCursor());
      }

      manageSlideVisiblity() {
        const t = this.contentWidth,
              e = this.viewportWidth;
        let i = this.Panzoom ? -1 * this.Panzoom.content.x : this.pages.length ? this.pages[this.page].left : 0;
        const s = this.option("preload"),
              o = this.option("infiniteX", this.option("infinite")),
              n = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-left")),
              a = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-right"));
        this.slides.forEach(r => {
          let h,
              l,
              c = 0;
          h = i - n, l = i + e + a, h -= s * (e + n + a), l += s * (e + n + a);
          const d = r.left + r.width > h && r.left < l;
          h = i + t - n, l = i + t + e + a, h -= s * (e + n + a);
          const u = o && r.left + r.width > h && r.left < l;
          h = i - t - n, l = i - t + e + a, h -= s * (e + n + a);
          const f = o && r.left + r.width > h && r.left < l;
          u || d || f ? (this.createSlideEl(r), d && (c = 0), u && (c = -1), f && (c = 1), r.left + r.width > i && r.left <= i + e + a && (c = 0)) : this.removeSlideEl(r), r.hasDiff = c;
        });
        let r = 0,
            h = 0;
        this.slides.forEach((e, i) => {
          let s = 0;
          e.$el ? (i !== r || e.hasDiff ? s = h + e.hasDiff * t : h = 0, e.$el.style.left = Math.abs(s) > .1 ? `${h + e.hasDiff * t}px` : "", r++) : h += e.width;
        }), this.markSelectedSlides();
      }

      createSlideEl(t) {
        if (!t) return;

        if (t.$el) {
          let e = t.$el.dataset.index;

          if (!e || parseInt(e, 10) !== t.index) {
            let e;
            t.$el.dataset.index = t.index, t.$el.querySelectorAll("[data-lazy-srcset]").forEach(t => {
              t.srcset = t.dataset.lazySrcset;
            }), t.$el.querySelectorAll("[data-lazy-src]").forEach(t => {
              let e = t.dataset.lazySrc;
              t instanceof HTMLImageElement ? t.src = e : t.style.backgroundImage = `url('${e}')`;
            }), (e = t.$el.dataset.lazySrc) && (t.$el.style.backgroundImage = `url('${e}')`), t.state = "ready";
          }

          return;
        }

        const e = document.createElement("div");
        e.dataset.index = t.index, e.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" ")), t.customClass && e.classList.add(...t.customClass.split(" ")), t.html && (e.innerHTML = t.html);
        const i = [];
        this.slides.forEach((t, e) => {
          t.$el && i.push(e);
        });
        const s = t.index;
        let o = null;

        if (i.length) {
          let t = i.reduce((t, e) => Math.abs(e - s) < Math.abs(t - s) ? e : t);
          o = this.slides[t];
        }

        return this.$track.insertBefore(e, o && o.$el ? o.index < t.index ? o.$el.nextSibling : o.$el : null), t.$el = e, this.trigger("createSlide", t, s), t;
      }

      removeSlideEl(t) {
        t.$el && !t.isDom && (this.trigger("removeSlide", t), t.$el.remove(), t.$el = null);
      }

      markSelectedSlides() {
        const t = this.option("classNames.slideSelected"),
              e = "aria-hidden";
        this.slides.forEach((i, s) => {
          const o = i.$el;
          if (!o) return;
          const n = this.pages[this.page];
          n && n.indexes && n.indexes.indexOf(s) > -1 ? (t && !o.classList.contains(t) && (o.classList.add(t), this.trigger("selectSlide", i)), o.removeAttribute(e)) : (t && o.classList.contains(t) && (o.classList.remove(t), this.trigger("unselectSlide", i)), o.setAttribute(e, !0));
        });
      }

      updatePage() {
        this.updateMetrics(), this.slideTo(this.page, {
          friction: 0
        });
      }

      onBeforeTransform() {
        this.option("infiniteX", this.option("infinite")) && this.manageInfiniteTrack(), this.manageSlideVisiblity();
      }

      manageInfiniteTrack() {
        const t = this.contentWidth,
              e = this.viewportWidth;
        if (!this.option("infiniteX", this.option("infinite")) || this.pages.length < 2 || t < e) return;
        const i = this.Panzoom;
        let s = !1;
        return i.content.x < -1 * (t - e) && (i.content.x += t, this.pageIndex = this.pageIndex - this.pages.length, s = !0), i.content.x > e && (i.content.x -= t, this.pageIndex = this.pageIndex + this.pages.length, s = !0), s && "pointerdown" === i.state && i.resetDragPosition(), s;
      }

      onTouchEnd(t, e) {
        const i = this.option("dragFree");
        if (!i && this.pages.length > 1 && t.dragOffset.time < 350 && Math.abs(t.dragOffset.y) < 1 && Math.abs(t.dragOffset.x) > 5) this[t.dragOffset.x < 0 ? "slideNext" : "slidePrev"]();else if (i) {
          const [, e] = this.getPageFromPosition(-1 * t.transform.x);
          this.setPage(e);
        } else this.slideToClosest();
      }

      slideToClosest(t = {}) {
        let [, e] = this.getPageFromPosition(-1 * this.Panzoom.content.x);
        this.slideTo(e, t);
      }

      getPageFromPosition(t) {
        const e = this.pages.length;
        this.option("center") && (t += .5 * this.viewportWidth);
        const i = Math.floor(t / this.contentWidth);
        t -= i * this.contentWidth;
        let s = this.slides.find(e => e.left <= t && e.left + e.width > t);

        if (s) {
          let t = this.findPageForSlide(s.index);
          return [t, t + i * e];
        }

        return [0, 0];
      }

      setPage(t, e) {
        let i = 0,
            s = parseInt(t, 10) || 0;
        const o = this.page,
              n = this.pageIndex,
              a = this.pages.length,
              r = this.contentWidth,
              h = this.viewportWidth;

        if (t = (s % a + a) % a, this.option("infiniteX", this.option("infinite")) && r > h) {
          const o = Math.floor(s / a) || 0,
                n = r;

          if (i = this.pages[t].left + o * n, !0 === e && a > 2) {
            let t = -1 * this.Panzoom.content.x;
            const e = i - n,
                  o = i + n,
                  r = Math.abs(t - i),
                  h = Math.abs(t - e),
                  l = Math.abs(t - o);
            l < r && l <= h ? (i = o, s += a) : h < r && h < l && (i = e, s -= a);
          }
        } else t = s = Math.max(0, Math.min(s, a - 1)), i = this.pages.length ? this.pages[t].left : 0;

        return this.page = t, this.pageIndex = s, null !== o && t !== o && (this.prevPage = o, this.prevPageIndex = n, this.trigger("change", t, o)), i;
      }

      destroy() {
        this.state = "destroy", this.slides.forEach(t => {
          this.removeSlideEl(t);
        }), this.slides = [], this.Panzoom.destroy(), this.detachPlugins();
      }

    }

    y.version = "4.0.31", y.Plugins = p;
    const v = !("undefined" == typeof window || !window.document || !window.document.createElement);
    let b = null;

    const x = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden])", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'],
          w = t => {
      if (t && v) {
        null === b && document.createElement("div").focus({
          get preventScroll() {
            return b = !0, !1;
          }

        });

        try {
          if (t.setActive) t.setActive();else if (b) t.focus({
            preventScroll: !0
          });else {
            const e = window.pageXOffset || document.body.scrollTop,
                  i = window.pageYOffset || document.body.scrollLeft;
            t.focus(), document.body.scrollTo({
              top: e,
              left: i,
              behavior: "auto"
            });
          }
        } catch (t) {}
      }
    };

    const $$1 = {
      minSlideCount: 2,
      minScreenHeight: 500,
      autoStart: !0,
      key: "t",
      Carousel: {},
      tpl: '<div class="fancybox__thumb" style="background-image:url(\'{{src}}\')"></div>'
    };

    class C {
      constructor(t) {
        this.fancybox = t, this.$container = null, this.state = "init";

        for (const t of ["onPrepare", "onClosing", "onKeydown"]) this[t] = this[t].bind(this);

        this.events = {
          prepare: this.onPrepare,
          closing: this.onClosing,
          keydown: this.onKeydown
        };
      }

      onPrepare() {
        this.getSlides().length < this.fancybox.option("Thumbs.minSlideCount") ? this.state = "disabled" : !0 === this.fancybox.option("Thumbs.autoStart") && this.fancybox.Carousel.Panzoom.content.height >= this.fancybox.option("Thumbs.minScreenHeight") && this.build();
      }

      onClosing() {
        this.Carousel && this.Carousel.Panzoom.detachEvents();
      }

      onKeydown(t, e) {
        e === t.option("Thumbs.key") && this.toggle();
      }

      build() {
        if (this.$container) return;
        const t = document.createElement("div");
        t.classList.add("fancybox__thumbs"), this.fancybox.$carousel.parentNode.insertBefore(t, this.fancybox.$carousel.nextSibling), this.Carousel = new y(t, e(!0, {
          Dots: !1,
          Navigation: !1,
          Sync: {
            friction: 0
          },
          infinite: !1,
          center: !0,
          fill: !0,
          dragFree: !0,
          slidesPerPage: 1,
          preload: 1
        }, this.fancybox.option("Thumbs.Carousel"), {
          Sync: {
            target: this.fancybox.Carousel
          },
          slides: this.getSlides()
        })), this.Carousel.Panzoom.on("wheel", (t, e) => {
          e.preventDefault(), this.fancybox[e.deltaY < 0 ? "prev" : "next"]();
        }), this.$container = t, this.state = "visible";
      }

      getSlides() {
        const t = [];

        for (const e of this.fancybox.items) {
          const i = e.thumb;
          i && t.push({
            html: this.fancybox.option("Thumbs.tpl").replace(/\{\{src\}\}/gi, i),
            customClass: `has-thumb has-${e.type || "image"}`
          });
        }

        return t;
      }

      toggle() {
        "visible" === this.state ? this.hide() : "hidden" === this.state ? this.show() : this.build();
      }

      show() {
        "hidden" === this.state && (this.$container.style.display = "", this.Carousel.Panzoom.attachEvents(), this.state = "visible");
      }

      hide() {
        "visible" === this.state && (this.Carousel.Panzoom.detachEvents(), this.$container.style.display = "none", this.state = "hidden");
      }

      cleanup() {
        this.Carousel && (this.Carousel.destroy(), this.Carousel = null), this.$container && (this.$container.remove(), this.$container = null), this.state = "init";
      }

      attach() {
        this.fancybox.on(this.events);
      }

      detach() {
        this.fancybox.off(this.events), this.cleanup();
      }

    }

    C.defaults = $$1;

    const S = (t, e) => {
      const i = new URL(t),
            s = new URLSearchParams(i.search);
      let o = new URLSearchParams();

      for (const [t, i] of [...s, ...Object.entries(e)]) "t" === t ? o.set("start", parseInt(i)) : o.set(t, i);

      o = o.toString();
      let n = t.match(/#t=((.*)?\d+s)/);
      return n && (o += `#t=${n[1]}`), o;
    },
          E = {
      video: {
        autoplay: !0,
        ratio: 16 / 9
      },
      youtube: {
        autohide: 1,
        fs: 1,
        rel: 0,
        hd: 1,
        wmode: "transparent",
        enablejsapi: 1,
        html5: 1
      },
      vimeo: {
        hd: 1,
        show_title: 1,
        show_byline: 1,
        show_portrait: 0,
        fullscreen: 1
      },
      html5video: {
        tpl: '<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">\n  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos.</video>',
        format: ""
      }
    };

    class P {
      constructor(t) {
        this.fancybox = t;

        for (const t of ["onInit", "onReady", "onCreateSlide", "onRemoveSlide", "onSelectSlide", "onUnselectSlide", "onRefresh", "onMessage"]) this[t] = this[t].bind(this);

        this.events = {
          init: this.onInit,
          ready: this.onReady,
          "Carousel.createSlide": this.onCreateSlide,
          "Carousel.removeSlide": this.onRemoveSlide,
          "Carousel.selectSlide": this.onSelectSlide,
          "Carousel.unselectSlide": this.onUnselectSlide,
          "Carousel.refresh": this.onRefresh
        };
      }

      onInit() {
        for (const t of this.fancybox.items) this.processType(t);
      }

      processType(t) {
        if (t.html) return t.src = t.html, t.type = "html", void delete t.html;
        const i = t.src || "";
        let s = t.type || this.fancybox.options.type,
            o = null;

        if (!i || "string" == typeof i) {
          if (o = i.match(/(?:youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i)) {
            const e = S(i, this.fancybox.option("Html.youtube")),
                  n = encodeURIComponent(o[1]);
            t.videoId = n, t.src = `https://www.youtube-nocookie.com/embed/${n}?${e}`, t.thumb = t.thumb || `https://i.ytimg.com/vi/${n}/mqdefault.jpg`, t.vendor = "youtube", s = "video";
          } else if (o = i.match(/^.+vimeo.com\/(?:\/)?([\d]+)(.*)?/)) {
            const e = S(i, this.fancybox.option("Html.vimeo")),
                  n = encodeURIComponent(o[1]);
            t.videoId = n, t.src = `https://player.vimeo.com/video/${n}?${e}`, t.vendor = "vimeo", s = "video";
          } else (o = i.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i)) ? (t.src = `//maps.google.${o[1]}/?ll=${(o[2] ? o[2] + "&z=" + Math.floor(o[3]) + (o[4] ? o[4].replace(/^\//, "&") : "") : o[4] + "").replace(/\?/, "&")}&output=${o[4] && o[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`, s = "map") : (o = i.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i)) && (t.src = `//maps.google.${o[1]}/maps?q=${o[2].replace("query=", "q=").replace("api=1", "")}&output=embed`, s = "map");

          s || ("#" === i.charAt(0) ? s = "inline" : (o = i.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (s = "html5video", t.format = t.format || "video/" + ("ogv" === o[1] ? "ogg" : o[1])) : i.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? s = "image" : i.match(/\.(pdf)((\?|#).*)?$/i) && (s = "pdf")), t.type = s || this.fancybox.option("defaultType", "image"), "html5video" !== s && "video" !== s || (t.video = e({}, this.fancybox.option("Html.video"), t.video), t._width && t._height ? t.ratio = parseFloat(t._width) / parseFloat(t._height) : t.ratio = t.ratio || t.video.ratio || E.video.ratio);
        }
      }

      onReady() {
        this.fancybox.Carousel.slides.forEach(t => {
          t.$el && (this.setContent(t), t.index === this.fancybox.getSlide().index && this.playVideo(t));
        });
      }

      onCreateSlide(t, e, i) {
        "ready" === this.fancybox.state && this.setContent(i);
      }

      loadInlineContent(t) {
        let e;
        if (t.src instanceof HTMLElement) e = t.src;else if ("string" == typeof t.src) {
          const i = t.src.split("#", 2),
                s = 2 === i.length && "" === i[0] ? i[1] : i[0];
          e = document.getElementById(s);
        }

        if (e) {
          if ("clone" === t.type || e.$placeHolder) {
            e = e.cloneNode(!0);
            let i = e.getAttribute("id");
            i = i ? `${i}--clone` : `clone-${this.fancybox.id}-${t.index}`, e.setAttribute("id", i);
          } else {
            const t = document.createElement("div");
            t.classList.add("fancybox-placeholder"), e.parentNode.insertBefore(t, e), e.$placeHolder = t;
          }

          this.fancybox.setContent(t, e);
        } else this.fancybox.setError(t, "{{ELEMENT_NOT_FOUND}}");
      }

      loadAjaxContent(t) {
        const e = this.fancybox,
              i = new XMLHttpRequest();
        e.showLoading(t), i.onreadystatechange = function () {
          i.readyState === XMLHttpRequest.DONE && "ready" === e.state && (e.hideLoading(t), 200 === i.status ? e.setContent(t, i.responseText) : e.setError(t, 404 === i.status ? "{{AJAX_NOT_FOUND}}" : "{{AJAX_FORBIDDEN}}"));
        };
        const s = t.ajax || null;
        i.open(s ? "POST" : "GET", t.src), i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), i.setRequestHeader("X-Requested-With", "XMLHttpRequest"), i.send(s), t.xhr = i;
      }

      loadIframeContent(t) {
        const e = this.fancybox,
              i = document.createElement("iframe");
        if (i.className = "fancybox__iframe", i.setAttribute("id", `fancybox__iframe_${e.id}_${t.index}`), i.setAttribute("allow", "autoplay; fullscreen"), i.setAttribute("scrolling", "auto"), t.$iframe = i, "iframe" !== t.type || !1 === t.preload) return i.setAttribute("src", t.src), this.fancybox.setContent(t, i), void this.resizeIframe(t);
        e.showLoading(t);
        const s = document.createElement("div");
        s.style.visibility = "hidden", this.fancybox.setContent(t, s), s.appendChild(i), i.onerror = () => {
          e.setError(t, "{{IFRAME_ERROR}}");
        }, i.onload = () => {
          e.hideLoading(t);
          let s = !1;
          i.isReady || (i.isReady = !0, s = !0), i.src.length && (i.parentNode.style.visibility = "", this.resizeIframe(t), s && e.revealContent(t));
        }, i.setAttribute("src", t.src);
      }

      setAspectRatio(t) {
        const e = t.$content,
              i = t.ratio;
        if (!e) return;
        let s = t._width,
            o = t._height;

        if (i || s && o) {
          Object.assign(e.style, {
            width: s && o ? "100%" : "",
            height: s && o ? "100%" : "",
            maxWidth: "",
            maxHeight: ""
          });
          let t = e.offsetWidth,
              n = e.offsetHeight;

          if (s = s || t, o = o || n, s > t || o > n) {
            let e = Math.min(t / s, n / o);
            s *= e, o *= e;
          }

          Math.abs(s / o - i) > .01 && (i < s / o ? s = o * i : o = s / i), Object.assign(e.style, {
            width: `${s}px`,
            height: `${o}px`
          });
        }
      }

      resizeIframe(t) {
        const e = t.$iframe;
        if (!e) return;
        let i = t._width || 0,
            s = t._height || 0;
        i && s && (t.autoSize = !1);
        const o = e.parentNode,
              n = o && o.style;
        if (!1 !== t.preload && !1 !== t.autoSize && n) try {
          const t = window.getComputedStyle(o),
                a = parseFloat(t.paddingLeft) + parseFloat(t.paddingRight),
                r = parseFloat(t.paddingTop) + parseFloat(t.paddingBottom),
                h = e.contentWindow.document,
                l = h.getElementsByTagName("html")[0],
                c = h.body;
          n.width = "", c.style.overflow = "hidden", i = i || l.scrollWidth + a, n.width = `${i}px`, c.style.overflow = "", n.flex = "0 0 auto", n.height = `${c.scrollHeight}px`, s = l.scrollHeight + r;
        } catch (t) {}

        if (i || s) {
          const t = {
            flex: "0 1 auto"
          };
          i && (t.width = `${i}px`), s && (t.height = `${s}px`), Object.assign(n, t);
        }
      }

      onRefresh(t, e) {
        e.slides.forEach(t => {
          t.$el && (t.$iframe && this.resizeIframe(t), t.ratio && this.setAspectRatio(t));
        });
      }

      setContent(t) {
        if (t && !t.isDom) {
          switch (t.type) {
            case "html":
              this.fancybox.setContent(t, t.src);
              break;

            case "html5video":
              this.fancybox.setContent(t, this.fancybox.option("Html.html5video.tpl").replace(/\{\{src\}\}/gi, t.src).replace("{{format}}", t.format || t.html5video && t.html5video.format || "").replace("{{poster}}", t.poster || t.thumb || ""));
              break;

            case "inline":
            case "clone":
              this.loadInlineContent(t);
              break;

            case "ajax":
              this.loadAjaxContent(t);
              break;

            case "pdf":
            case "video":
            case "map":
              t.preload = !1;

            case "iframe":
              this.loadIframeContent(t);
          }

          t.ratio && this.setAspectRatio(t);
        }
      }

      onSelectSlide(t, e, i) {
        "ready" === t.state && this.playVideo(i);
      }

      playVideo(t) {
        if ("html5video" === t.type && t.video.autoplay) try {
          const e = t.$el.querySelector("video");

          if (e) {
            const t = e.play();
            void 0 !== t && t.then(() => {}).catch(t => {
              e.muted = !0, e.play();
            });
          }
        } catch (t) {}
        if ("video" !== t.type || !t.$iframe || !t.$iframe.contentWindow) return;

        const e = () => {
          if ("done" === t.state && t.$iframe && t.$iframe.contentWindow) {
            let e;
            if (t.$iframe.isReady) return t.video && t.video.autoplay && (e = "youtube" == t.vendor ? {
              event: "command",
              func: "playVideo"
            } : {
              method: "play",
              value: "true"
            }), void (e && t.$iframe.contentWindow.postMessage(JSON.stringify(e), "*"));
            "youtube" === t.vendor && (e = {
              event: "listening",
              id: t.$iframe.getAttribute("id")
            }, t.$iframe.contentWindow.postMessage(JSON.stringify(e), "*"));
          }

          t.poller = setTimeout(e, 250);
        };

        e();
      }

      onUnselectSlide(t, e, i) {
        if ("html5video" === i.type) {
          try {
            i.$el.querySelector("video").pause();
          } catch (t) {}

          return;
        }

        let s = !1;
        "vimeo" == i.vendor ? s = {
          method: "pause",
          value: "true"
        } : "youtube" === i.vendor && (s = {
          event: "command",
          func: "pauseVideo"
        }), s && i.$iframe && i.$iframe.contentWindow && i.$iframe.contentWindow.postMessage(JSON.stringify(s), "*"), clearTimeout(i.poller);
      }

      onRemoveSlide(t, e, i) {
        i.xhr && (i.xhr.abort(), i.xhr = null), i.$iframe && (i.$iframe.onload = i.$iframe.onerror = null, i.$iframe.src = "//about:blank", i.$iframe = null);
        const s = i.$content;
        "inline" === i.type && s && (s.classList.remove("fancybox__content"), "none" !== s.style.display && (s.style.display = "none")), i.$closeButton && (i.$closeButton.remove(), i.$closeButton = null);
        const o = s && s.$placeHolder;
        o && (o.parentNode.insertBefore(s, o), o.remove(), s.$placeHolder = null);
      }

      onMessage(t) {
        try {
          let e = JSON.parse(t.data);

          if ("https://player.vimeo.com" === t.origin) {
            if ("ready" === e.event) for (let e of document.getElementsByClassName("fancybox__iframe")) e.contentWindow === t.source && (e.isReady = 1);
          } else "https://www.youtube-nocookie.com" === t.origin && "onReady" === e.event && (document.getElementById(e.id).isReady = 1);
        } catch (t) {}
      }

      attach() {
        this.fancybox.on(this.events), window.addEventListener("message", this.onMessage, !1);
      }

      detach() {
        this.fancybox.off(this.events), window.removeEventListener("message", this.onMessage, !1);
      }

    }

    P.defaults = E;

    class T {
      constructor(t) {
        this.fancybox = t;

        for (const t of ["onReady", "onClosing", "onDone", "onPageChange", "onCreateSlide", "onRemoveSlide", "onImageStatusChange"]) this[t] = this[t].bind(this);

        this.events = {
          ready: this.onReady,
          closing: this.onClosing,
          done: this.onDone,
          "Carousel.change": this.onPageChange,
          "Carousel.createSlide": this.onCreateSlide,
          "Carousel.removeSlide": this.onRemoveSlide
        };
      }

      onReady() {
        this.fancybox.Carousel.slides.forEach(t => {
          t.$el && this.setContent(t);
        });
      }

      onDone(t, e) {
        this.handleCursor(e);
      }

      onClosing(t) {
        clearTimeout(this.clickTimer), this.clickTimer = null, t.Carousel.slides.forEach(t => {
          t.$image && (t.state = "destroy"), t.Panzoom && t.Panzoom.detachEvents();
        }), "closing" === this.fancybox.state && this.canZoom(t.getSlide()) && this.zoomOut();
      }

      onCreateSlide(t, e, i) {
        "ready" === this.fancybox.state && this.setContent(i);
      }

      onRemoveSlide(t, e, i) {
        i.$image && (i.$el.classList.remove(t.option("Image.canZoomInClass")), i.$image.remove(), i.$image = null), i.Panzoom && (i.Panzoom.destroy(), i.Panzoom = null), i.$el && i.$el.dataset && delete i.$el.dataset.imageFit;
      }

      setContent(t) {
        if (t.isDom || t.html || t.type && "image" !== t.type) return;
        if (t.$image) return;
        t.type = "image", t.state = "loading";
        const e = document.createElement("div");
        e.style.visibility = "hidden";
        const i = document.createElement("img");
        i.addEventListener("load", e => {
          e.stopImmediatePropagation(), this.onImageStatusChange(t);
        }), i.addEventListener("error", () => {
          this.onImageStatusChange(t);
        }), i.src = t.src, i.alt = "", i.draggable = !1, i.classList.add("fancybox__image"), t.srcset && i.setAttribute("srcset", t.srcset), t.sizes && i.setAttribute("sizes", t.sizes), t.$image = i;
        const s = this.fancybox.option("Image.wrap");

        if (s) {
          const o = document.createElement("div");
          o.classList.add("string" == typeof s ? s : "fancybox__image-wrap"), o.appendChild(i), e.appendChild(o), t.$wrap = o;
        } else e.appendChild(i);

        t.$el.dataset.imageFit = this.fancybox.option("Image.fit"), this.fancybox.setContent(t, e), i.complete || i.error ? this.onImageStatusChange(t) : this.fancybox.showLoading(t);
      }

      onImageStatusChange(t) {
        const e = t.$image;
        e && "loading" === t.state && (e.complete && e.naturalWidth && e.naturalHeight ? (this.fancybox.hideLoading(t), "contain" === this.fancybox.option("Image.fit") && this.initSlidePanzoom(t), t.$el.addEventListener("wheel", e => this.onWheel(t, e), {
          passive: !1
        }), t.$content.addEventListener("click", e => this.onClick(t, e), {
          passive: !1
        }), this.revealContent(t)) : this.fancybox.setError(t, "{{IMAGE_ERROR}}"));
      }

      initSlidePanzoom(t) {
        t.Panzoom || (t.Panzoom = new d(t.$el, e(!0, this.fancybox.option("Image.Panzoom", {}), {
          viewport: t.$wrap,
          content: t.$image,
          width: t._width,
          height: t._height,
          wrapInner: !1,
          textSelection: !0,
          touch: this.fancybox.option("Image.touch"),
          panOnlyZoomed: !0,
          click: !1,
          wheel: !1
        })), t.Panzoom.on("startAnimation", () => {
          this.fancybox.trigger("Image.startAnimation", t);
        }), t.Panzoom.on("endAnimation", () => {
          "zoomIn" === t.state && this.fancybox.done(t), this.handleCursor(t), this.fancybox.trigger("Image.endAnimation", t);
        }), t.Panzoom.on("afterUpdate", () => {
          this.handleCursor(t), this.fancybox.trigger("Image.afterUpdate", t);
        }));
      }

      revealContent(t) {
        null === this.fancybox.Carousel.prevPage && t.index === this.fancybox.options.startIndex && this.canZoom(t) ? this.zoomIn() : this.fancybox.revealContent(t);
      }

      getZoomInfo(t) {
        const e = t.$thumb.getBoundingClientRect(),
              i = e.width,
              s = e.height,
              o = t.$content.getBoundingClientRect(),
              n = o.width,
              a = o.height,
              r = o.top - e.top,
              h = o.left - e.left;
        let l = this.fancybox.option("Image.zoomOpacity");
        return "auto" === l && (l = Math.abs(i / s - n / a) > .1), {
          top: r,
          left: h,
          scale: n && i ? i / n : 1,
          opacity: l
        };
      }

      canZoom(t) {
        const e = this.fancybox,
              i = e.$container;
        if (window.visualViewport && 1 !== window.visualViewport.scale) return !1;
        if (t.Panzoom && !t.Panzoom.content.width) return !1;
        if (!e.option("Image.zoom") || "contain" !== e.option("Image.fit")) return !1;
        const s = t.$thumb;
        if (!s || "loading" === t.state) return !1;
        i.classList.add("fancybox__no-click");
        const o = s.getBoundingClientRect();
        let n;

        if (this.fancybox.option("Image.ignoreCoveredThumbnail")) {
          const t = document.elementFromPoint(o.left + 1, o.top + 1) === s,
                e = document.elementFromPoint(o.right - 1, o.bottom - 1) === s;
          n = t && e;
        } else n = document.elementFromPoint(o.left + .5 * o.width, o.top + .5 * o.height) === s;

        return i.classList.remove("fancybox__no-click"), n;
      }

      zoomIn() {
        const t = this.fancybox,
              e = t.getSlide(),
              i = e.Panzoom,
              {
          top: s,
          left: o,
          scale: n,
          opacity: a
        } = this.getZoomInfo(e);
        t.trigger("reveal", e), i.panTo({
          x: -1 * o,
          y: -1 * s,
          scale: n,
          friction: 0,
          ignoreBounds: !0
        }), e.$content.style.visibility = "", e.state = "zoomIn", !0 === a && i.on("afterTransform", t => {
          "zoomIn" !== e.state && "zoomOut" !== e.state || (t.$content.style.opacity = Math.min(1, 1 - (1 - t.content.scale) / (1 - n)));
        }), i.panTo({
          x: 0,
          y: 0,
          scale: 1,
          friction: this.fancybox.option("Image.zoomFriction")
        });
      }

      zoomOut() {
        const t = this.fancybox,
              e = t.getSlide(),
              i = e.Panzoom;
        if (!i) return;
        e.state = "zoomOut", t.state = "customClosing", e.$caption && (e.$caption.style.visibility = "hidden");
        let s = this.fancybox.option("Image.zoomFriction");

        const o = t => {
          const {
            top: o,
            left: n,
            scale: a,
            opacity: r
          } = this.getZoomInfo(e);
          t || r || (s *= .82), i.panTo({
            x: -1 * n,
            y: -1 * o,
            scale: a,
            friction: s,
            ignoreBounds: !0
          }), s *= .98;
        };

        window.addEventListener("scroll", o), i.once("endAnimation", () => {
          window.removeEventListener("scroll", o), t.destroy();
        }), o();
      }

      handleCursor(t) {
        if ("image" !== t.type || !t.$el) return;
        const e = t.Panzoom,
              i = this.fancybox.option("Image.click", !1, t),
              s = this.fancybox.option("Image.touch"),
              o = t.$el.classList,
              n = this.fancybox.option("Image.canZoomInClass"),
              a = this.fancybox.option("Image.canZoomOutClass");

        if (o.remove(a), o.remove(n), e && "toggleZoom" === i) {
          e && 1 === e.content.scale && e.option("maxScale") - e.content.scale > .01 ? o.add(n) : e.content.scale > 1 && !s && o.add(a);
        } else "close" === i && o.add(a);
      }

      onWheel(t, e) {
        if ("ready" === this.fancybox.state && !1 !== this.fancybox.trigger("Image.wheel", e)) switch (this.fancybox.option("Image.wheel")) {
          case "zoom":
            "done" === t.state && t.Panzoom && t.Panzoom.zoomWithWheel(e);
            break;

          case "close":
            this.fancybox.close();
            break;

          case "slide":
            this.fancybox[e.deltaY < 0 ? "prev" : "next"]();
        }
      }

      onClick(t, e) {
        if ("ready" !== this.fancybox.state) return;
        const i = t.Panzoom;
        if (i && (i.dragPosition.midPoint || 0 !== i.dragOffset.x || 0 !== i.dragOffset.y || 1 !== i.dragOffset.scale)) return;
        if (this.fancybox.Carousel.Panzoom.lockAxis) return !1;

        const s = i => {
          switch (i) {
            case "toggleZoom":
              e.stopPropagation(), t.Panzoom && t.Panzoom.zoomWithClick(e);
              break;

            case "close":
              this.fancybox.close();
              break;

            case "next":
              e.stopPropagation(), this.fancybox.next();
          }
        },
              o = this.fancybox.option("Image.click"),
              n = this.fancybox.option("Image.doubleClick");

        n ? this.clickTimer ? (clearTimeout(this.clickTimer), this.clickTimer = null, s(n)) : this.clickTimer = setTimeout(() => {
          this.clickTimer = null, s(o);
        }, 300) : s(o);
      }

      onPageChange(t, e) {
        const i = t.getSlide();
        e.slides.forEach(t => {
          t.Panzoom && "done" === t.state && t.index !== i.index && t.Panzoom.panTo({
            x: 0,
            y: 0,
            scale: 1,
            friction: .8
          });
        });
      }

      attach() {
        this.fancybox.on(this.events);
      }

      detach() {
        this.fancybox.off(this.events);
      }

    }

    T.defaults = {
      canZoomInClass: "can-zoom_in",
      canZoomOutClass: "can-zoom_out",
      zoom: !0,
      zoomOpacity: "auto",
      zoomFriction: .82,
      ignoreCoveredThumbnail: !1,
      touch: !0,
      click: "toggleZoom",
      doubleClick: null,
      wheel: "zoom",
      fit: "contain",
      wrap: !1,
      Panzoom: {
        ratio: 1
      }
    };

    class L {
      constructor(t) {
        this.fancybox = t;

        for (const t of ["onChange", "onClosing"]) this[t] = this[t].bind(this);

        this.events = {
          initCarousel: this.onChange,
          "Carousel.change": this.onChange,
          closing: this.onClosing
        }, this.hasCreatedHistory = !1, this.origHash = "", this.timer = null;
      }

      onChange(t) {
        const e = t.Carousel;
        this.timer && clearTimeout(this.timer);
        const i = null === e.prevPage,
              s = t.getSlide(),
              o = new URL(document.URL).hash;
        let n = !1;
        if (s.slug) n = "#" + s.slug;else {
          const i = s.$trigger && s.$trigger.dataset,
                o = t.option("slug") || i && i.fancybox;
          o && o.length && "true" !== o && (n = "#" + o + (e.slides.length > 1 ? "-" + (s.index + 1) : ""));
        }
        i && (this.origHash = o !== n ? o : ""), n && o !== n && (this.timer = setTimeout(() => {
          try {
            window.history[i ? "pushState" : "replaceState"]({}, document.title, window.location.pathname + window.location.search + n), i && (this.hasCreatedHistory = !0);
          } catch (t) {}
        }, 300));
      }

      onClosing() {
        if (this.timer && clearTimeout(this.timer), !0 !== this.hasSilentClose) try {
          return void window.history.replaceState({}, document.title, window.location.pathname + window.location.search + (this.origHash || ""));
        } catch (t) {}
      }

      attach(t) {
        t.on(this.events);
      }

      detach(t) {
        t.off(this.events);
      }

      static startFromUrl() {
        const t = L.Fancybox;
        if (!t || t.getInstance() || !1 === t.defaults.Hash) return;
        const {
          hash: e,
          slug: i,
          index: s
        } = L.getParsedURL();
        if (!i) return;
        let o = document.querySelector(`[data-slug="${e}"]`);
        if (o && o.dispatchEvent(new CustomEvent("click", {
          bubbles: !0,
          cancelable: !0
        })), t.getInstance()) return;
        const n = document.querySelectorAll(`[data-fancybox="${i}"]`);
        n.length && (null === s && 1 === n.length ? o = n[0] : s && (o = n[s - 1]), o && o.dispatchEvent(new CustomEvent("click", {
          bubbles: !0,
          cancelable: !0
        })));
      }

      static onHashChange() {
        const {
          slug: t,
          index: e
        } = L.getParsedURL(),
              i = L.Fancybox,
              s = i && i.getInstance();

        if (s && s.plugins.Hash) {
          if (t) {
            const i = s.Carousel;
            if (t === s.option("slug")) return i.slideTo(e - 1);

            for (let e of i.slides) if (e.slug && e.slug === t) return i.slideTo(e.index);

            const o = s.getSlide(),
                  n = o.$trigger && o.$trigger.dataset;
            if (n && n.fancybox === t) return i.slideTo(e - 1);
          }

          s.plugins.Hash.hasSilentClose = !0, s.close();
        }

        L.startFromUrl();
      }

      static create(t) {
        function e() {
          window.addEventListener("hashchange", L.onHashChange, !1), L.startFromUrl();
        }

        L.Fancybox = t, v && window.requestAnimationFrame(() => {
          /complete|interactive|loaded/.test(document.readyState) ? e() : document.addEventListener("DOMContentLoaded", e);
        });
      }

      static destroy() {
        window.removeEventListener("hashchange", L.onHashChange, !1);
      }

      static getParsedURL() {
        const t = window.location.hash.substr(1),
              e = t.split("-"),
              i = e.length > 1 && /^\+?\d+$/.test(e[e.length - 1]) && parseInt(e.pop(-1), 10) || null;
        return {
          hash: t,
          slug: e.join("-"),
          index: i
        };
      }

    }

    const _ = {
      pageXOffset: 0,
      pageYOffset: 0,
      element: () => document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement,

      activate(t) {
        _.pageXOffset = window.pageXOffset, _.pageYOffset = window.pageYOffset, t.requestFullscreen ? t.requestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitRequestFullscreen ? t.webkitRequestFullscreen() : t.msRequestFullscreen && t.msRequestFullscreen();
      },

      deactivate() {
        document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
      }

    };

    class A {
      constructor(t) {
        this.fancybox = t, this.active = !1, this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      }

      isActive() {
        return this.active;
      }

      setTimer() {
        if (!this.active || this.timer) return;
        const t = this.fancybox.option("slideshow.delay", 3e3);
        this.timer = setTimeout(() => {
          this.timer = null, this.fancybox.option("infinite") || this.fancybox.getSlide().index !== this.fancybox.Carousel.slides.length - 1 ? this.fancybox.next() : this.fancybox.jumpTo(0, {
            friction: 0
          });
        }, t);
        let e = this.$progress;
        e || (e = document.createElement("div"), e.classList.add("fancybox__progress"), this.fancybox.$carousel.parentNode.insertBefore(e, this.fancybox.$carousel), this.$progress = e, e.offsetHeight), e.style.transitionDuration = `${t}ms`, e.style.transform = "scaleX(1)";
      }

      clearTimer() {
        clearTimeout(this.timer), this.timer = null, this.$progress && (this.$progress.style.transitionDuration = "", this.$progress.style.transform = "", this.$progress.offsetHeight);
      }

      activate() {
        this.active || (this.active = !0, this.fancybox.$container.classList.add("has-slideshow"), "done" === this.fancybox.getSlide().state && this.setTimer(), document.addEventListener("visibilitychange", this.handleVisibilityChange, !1));
      }

      handleVisibilityChange() {
        this.deactivate();
      }

      deactivate() {
        this.active = !1, this.clearTimer(), this.fancybox.$container.classList.remove("has-slideshow"), document.removeEventListener("visibilitychange", this.handleVisibilityChange, !1);
      }

      toggle() {
        this.active ? this.deactivate() : this.fancybox.Carousel.slides.length > 1 && this.activate();
      }

    }

    const z = {
      display: ["counter", "zoom", "slideshow", "fullscreen", "thumbs", "close"],
      autoEnable: !0,
      items: {
        counter: {
          position: "left",
          type: "div",
          class: "fancybox__counter",
          html: '<span data-fancybox-index=""></span>&nbsp;/&nbsp;<span data-fancybox-count=""></span>',
          attr: {
            tabindex: -1
          }
        },
        prev: {
          type: "button",
          class: "fancybox__button--prev",
          label: "PREV",
          html: '<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8"/></svg>',
          attr: {
            "data-fancybox-prev": ""
          }
        },
        next: {
          type: "button",
          class: "fancybox__button--next",
          label: "NEXT",
          html: '<svg viewBox="0 0 24 24"><path d="M8 4l8 8-8 8"/></svg>',
          attr: {
            "data-fancybox-next": ""
          }
        },
        fullscreen: {
          type: "button",
          class: "fancybox__button--fullscreen",
          label: "TOGGLE_FULLSCREEN",
          html: '<svg viewBox="0 0 24 24">\n                <g><path d="M3 8 V3h5"></path><path d="M21 8V3h-5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></g>\n                <g><path d="M7 2v5H2M17 2v5h5M2 17h5v5M22 17h-5v5"/></g>\n            </svg>',
          click: function (t) {
            t.preventDefault(), _.element() ? _.deactivate() : _.activate(this.fancybox.$container);
          }
        },
        slideshow: {
          type: "button",
          class: "fancybox__button--slideshow",
          label: "TOGGLE_SLIDESHOW",
          html: '<svg viewBox="0 0 24 24">\n                <g><path d="M6 4v16"/><path d="M20 12L6 20"/><path d="M20 12L6 4"/></g>\n                <g><path d="M7 4v15M17 4v15"/></g>\n            </svg>',
          click: function (t) {
            t.preventDefault(), this.Slideshow.toggle();
          }
        },
        zoom: {
          type: "button",
          class: "fancybox__button--zoom",
          label: "TOGGLE_ZOOM",
          html: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"></circle><path d="M16 16 L21 21"></svg>',
          click: function (t) {
            t.preventDefault();
            const e = this.fancybox.getSlide().Panzoom;
            e && e.toggleZoom();
          }
        },
        download: {
          type: "link",
          label: "DOWNLOAD",
          class: "fancybox__button--download",
          html: '<svg viewBox="0 0 24 24"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62 2.48A2 2 0 004.56 21h14.88a2 2 0 001.94-1.51L22 17"/></svg>',
          click: function (t) {
            t.stopPropagation();
          }
        },
        thumbs: {
          type: "button",
          label: "TOGGLE_THUMBS",
          class: "fancybox__button--thumbs",
          html: '<svg viewBox="0 0 24 24"><circle cx="4" cy="4" r="1" /><circle cx="12" cy="4" r="1" transform="rotate(90 12 4)"/><circle cx="20" cy="4" r="1" transform="rotate(90 20 4)"/><circle cx="4" cy="12" r="1" transform="rotate(90 4 12)"/><circle cx="12" cy="12" r="1" transform="rotate(90 12 12)"/><circle cx="20" cy="12" r="1" transform="rotate(90 20 12)"/><circle cx="4" cy="20" r="1" transform="rotate(90 4 20)"/><circle cx="12" cy="20" r="1" transform="rotate(90 12 20)"/><circle cx="20" cy="20" r="1" transform="rotate(90 20 20)"/></svg>',
          click: function (t) {
            t.stopPropagation();
            const e = this.fancybox.plugins.Thumbs;
            e && e.toggle();
          }
        },
        close: {
          type: "button",
          label: "CLOSE",
          class: "fancybox__button--close",
          html: '<svg viewBox="0 0 24 24"><path d="M20 20L4 4m16 0L4 20"></path></svg>',
          attr: {
            "data-fancybox-close": "",
            tabindex: 0
          }
        }
      }
    };

    class k {
      constructor(t) {
        this.fancybox = t, this.$container = null, this.state = "init";

        for (const t of ["onInit", "onPrepare", "onDone", "onKeydown", "onClosing", "onChange", "onSettle", "onRefresh"]) this[t] = this[t].bind(this);

        this.events = {
          init: this.onInit,
          prepare: this.onPrepare,
          done: this.onDone,
          keydown: this.onKeydown,
          closing: this.onClosing,
          "Carousel.change": this.onChange,
          "Carousel.settle": this.onSettle,
          "Carousel.Panzoom.touchStart": () => this.onRefresh(),
          "Image.startAnimation": (t, e) => this.onRefresh(e),
          "Image.afterUpdate": (t, e) => this.onRefresh(e)
        };
      }

      onInit() {
        if (this.fancybox.option("Toolbar.autoEnable")) {
          let t = !1;

          for (const e of this.fancybox.items) if ("image" === e.type) {
            t = !0;
            break;
          }

          if (!t) return void (this.state = "disabled");
        }

        for (const e of this.fancybox.option("Toolbar.display")) {
          if ("close" === (t(e) ? e.id : e)) {
            this.fancybox.options.closeButton = !1;
            break;
          }
        }
      }

      onPrepare() {
        const t = this.fancybox;
        if ("init" === this.state && (this.build(), this.update(), this.Slideshow = new A(t), !t.Carousel.prevPage && (t.option("slideshow.autoStart") && this.Slideshow.activate(), t.option("fullscreen.autoStart") && !_.element()))) try {
          _.activate(t.$container);
        } catch (t) {}
      }

      onFsChange() {
        window.scrollTo(_.pageXOffset, _.pageYOffset);
      }

      onSettle() {
        const t = this.fancybox,
              e = this.Slideshow;
        e && e.isActive() && (t.getSlide().index !== t.Carousel.slides.length - 1 || t.option("infinite") ? "done" === t.getSlide().state && e.setTimer() : e.deactivate());
      }

      onChange() {
        this.update(), this.Slideshow && this.Slideshow.isActive() && this.Slideshow.clearTimer();
      }

      onDone(t, e) {
        const i = this.Slideshow;
        e.index === t.getSlide().index && (this.update(), i && i.isActive() && (t.option("infinite") || e.index !== t.Carousel.slides.length - 1 ? i.setTimer() : i.deactivate()));
      }

      onRefresh(t) {
        t && t.index !== this.fancybox.getSlide().index || (this.update(), !this.Slideshow || !this.Slideshow.isActive() || t && "done" !== t.state || this.Slideshow.deactivate());
      }

      onKeydown(t, e, i) {
        " " === e && this.Slideshow && (this.Slideshow.toggle(), i.preventDefault());
      }

      onClosing() {
        this.Slideshow && this.Slideshow.deactivate(), document.removeEventListener("fullscreenchange", this.onFsChange);
      }

      createElement(t) {
        let e;
        "div" === t.type ? e = document.createElement("div") : (e = document.createElement("link" === t.type ? "a" : "button"), e.classList.add("carousel__button")), e.innerHTML = t.html, e.setAttribute("tabindex", t.tabindex || 0), t.class && e.classList.add(...t.class.split(" "));

        for (const i in t.attr) e.setAttribute(i, t.attr[i]);

        t.label && e.setAttribute("title", this.fancybox.localize(`{{${t.label}}}`)), t.click && e.addEventListener("click", t.click.bind(this)), "prev" === t.id && e.setAttribute("data-fancybox-prev", ""), "next" === t.id && e.setAttribute("data-fancybox-next", "");
        const i = e.querySelector("svg");
        return i && (i.setAttribute("role", "img"), i.setAttribute("tabindex", "-1"), i.setAttribute("xmlns", "http://www.w3.org/2000/svg")), e;
      }

      build() {
        this.cleanup();
        const i = this.fancybox.option("Toolbar.items"),
              s = [{
          position: "left",
          items: []
        }, {
          position: "center",
          items: []
        }, {
          position: "right",
          items: []
        }],
              o = this.fancybox.plugins.Thumbs;

        for (const n of this.fancybox.option("Toolbar.display")) {
          let a, r;
          if (t(n) ? (a = n.id, r = e({}, i[a], n)) : (a = n, r = i[a]), ["counter", "next", "prev", "slideshow"].includes(a) && this.fancybox.items.length < 2) continue;

          if ("fullscreen" === a) {
            if (!document.fullscreenEnabled || window.fullScreen) continue;
            document.addEventListener("fullscreenchange", this.onFsChange);
          }

          if ("thumbs" === a && (!o || "disabled" === o.state)) continue;
          if (!r) continue;
          let h = r.position || "right",
              l = s.find(t => t.position === h);
          l && l.items.push(r);
        }

        const n = document.createElement("div");
        n.classList.add("fancybox__toolbar");

        for (const t of s) if (t.items.length) {
          const e = document.createElement("div");
          e.classList.add("fancybox__toolbar__items"), e.classList.add(`fancybox__toolbar__items--${t.position}`);

          for (const i of t.items) e.appendChild(this.createElement(i));

          n.appendChild(e);
        }

        this.fancybox.$carousel.parentNode.insertBefore(n, this.fancybox.$carousel), this.$container = n;
      }

      update() {
        const t = this.fancybox.getSlide(),
              e = t.index,
              i = this.fancybox.items.length,
              s = t.downloadSrc || ("image" !== t.type || t.error ? null : t.src);

        for (const t of this.fancybox.$container.querySelectorAll("a.fancybox__button--download")) s ? (t.removeAttribute("disabled"), t.removeAttribute("tabindex"), t.setAttribute("href", s), t.setAttribute("download", s), t.setAttribute("target", "_blank")) : (t.setAttribute("disabled", ""), t.setAttribute("tabindex", -1), t.removeAttribute("href"), t.removeAttribute("download"));

        const o = t.Panzoom,
              n = o && o.option("maxScale") > o.option("baseScale");

        for (const t of this.fancybox.$container.querySelectorAll(".fancybox__button--zoom")) n ? t.removeAttribute("disabled") : t.setAttribute("disabled", "");

        for (const e of this.fancybox.$container.querySelectorAll("[data-fancybox-index]")) e.innerHTML = t.index + 1;

        for (const t of this.fancybox.$container.querySelectorAll("[data-fancybox-count]")) t.innerHTML = i;

        if (!this.fancybox.option("infinite")) {
          for (const t of this.fancybox.$container.querySelectorAll("[data-fancybox-prev]")) 0 === e ? t.setAttribute("disabled", "") : t.removeAttribute("disabled");

          for (const t of this.fancybox.$container.querySelectorAll("[data-fancybox-next]")) e === i - 1 ? t.setAttribute("disabled", "") : t.removeAttribute("disabled");
        }
      }

      cleanup() {
        this.Slideshow && this.Slideshow.isActive() && this.Slideshow.clearTimer(), this.$container && this.$container.remove(), this.$container = null;
      }

      attach() {
        this.fancybox.on(this.events);
      }

      detach() {
        this.fancybox.off(this.events), this.cleanup();
      }

    }

    k.defaults = z;
    const O = {
      ScrollLock: class {
        constructor(t) {
          this.fancybox = t, this.viewport = null, this.pendingUpdate = null;

          for (const t of ["onReady", "onResize", "onTouchstart", "onTouchmove"]) this[t] = this[t].bind(this);
        }

        onReady() {
          const t = window.visualViewport;
          t && (this.viewport = t, this.startY = 0, t.addEventListener("resize", this.onResize), this.updateViewport()), window.addEventListener("touchstart", this.onTouchstart, {
            passive: !1
          }), window.addEventListener("touchmove", this.onTouchmove, {
            passive: !1
          }), window.addEventListener("wheel", this.onWheel, {
            passive: !1
          });
        }

        onResize() {
          this.updateViewport();
        }

        updateViewport() {
          const t = this.fancybox,
                e = this.viewport,
                i = e.scale || 1,
                s = t.$container;
          if (!s) return;
          let o = "",
              n = "",
              a = "";
          i - 1 > .1 && (o = e.width * i + "px", n = e.height * i + "px", a = `translate3d(${e.offsetLeft}px, ${e.offsetTop}px, 0) scale(${1 / i})`), s.style.width = o, s.style.height = n, s.style.transform = a;
        }

        onTouchstart(t) {
          this.startY = t.touches ? t.touches[0].screenY : t.screenY;
        }

        onTouchmove(t) {
          const e = this.startY,
                i = window.innerWidth / window.document.documentElement.clientWidth;
          if (!t.cancelable) return;
          if (t.touches.length > 1 || 1 !== i) return;
          const o = s(t.composedPath()[0]);
          if (!o) return void t.preventDefault();
          const n = window.getComputedStyle(o),
                a = parseInt(n.getPropertyValue("height"), 10),
                r = t.touches ? t.touches[0].screenY : t.screenY,
                h = e <= r && 0 === o.scrollTop,
                l = e >= r && o.scrollHeight - o.scrollTop === a;
          (h || l) && t.preventDefault();
        }

        onWheel(t) {
          s(t.composedPath()[0]) || t.preventDefault();
        }

        cleanup() {
          this.pendingUpdate && (cancelAnimationFrame(this.pendingUpdate), this.pendingUpdate = null);
          const t = this.viewport;
          t && (t.removeEventListener("resize", this.onResize), this.viewport = null), window.removeEventListener("touchstart", this.onTouchstart, !1), window.removeEventListener("touchmove", this.onTouchmove, !1), window.removeEventListener("wheel", this.onWheel, {
            passive: !1
          });
        }

        attach() {
          this.fancybox.on("initLayout", this.onReady);
        }

        detach() {
          this.fancybox.off("initLayout", this.onReady), this.cleanup();
        }

      },
      Thumbs: C,
      Html: P,
      Toolbar: k,
      Image: T,
      Hash: L
    };
    const M = {
      startIndex: 0,
      preload: 1,
      infinite: !0,
      showClass: "fancybox-zoomInUp",
      hideClass: "fancybox-fadeOut",
      animated: !0,
      hideScrollbar: !0,
      parentEl: null,
      mainClass: null,
      autoFocus: !0,
      trapFocus: !0,
      placeFocusBack: !0,
      click: "close",
      closeButton: "inside",
      dragToClose: !0,
      keyboard: {
        Escape: "close",
        Delete: "close",
        Backspace: "close",
        PageUp: "next",
        PageDown: "prev",
        ArrowUp: "next",
        ArrowDown: "prev",
        ArrowRight: "next",
        ArrowLeft: "prev"
      },
      template: {
        closeButton: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg>',
        spinner: '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="25 25 50 50" tabindex="-1"><circle cx="50" cy="50" r="20"/></svg>',
        main: null
      },
      l10n: {
        CLOSE: "Close",
        NEXT: "Next",
        PREV: "Previous",
        MODAL: "You can close this modal content with the ESC key",
        ERROR: "Something Went Wrong, Please Try Again Later",
        IMAGE_ERROR: "Image Not Found",
        ELEMENT_NOT_FOUND: "HTML Element Not Found",
        AJAX_NOT_FOUND: "Error Loading AJAX : Not Found",
        AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden",
        IFRAME_ERROR: "Error Loading Page",
        TOGGLE_ZOOM: "Toggle zoom level",
        TOGGLE_THUMBS: "Toggle thumbnails",
        TOGGLE_SLIDESHOW: "Toggle slideshow",
        TOGGLE_FULLSCREEN: "Toggle full-screen mode",
        DOWNLOAD: "Download"
      }
    },
          I = new Map();
    let F = 0;

    class R extends l {
      constructor(t, i = {}) {
        t = t.map(t => (t.width && (t._width = t.width), t.height && (t._height = t.height), t)), super(e(!0, {}, M, i)), this.bindHandlers(), this.state = "init", this.setItems(t), this.attachPlugins(R.Plugins), this.trigger("init"), !0 === this.option("hideScrollbar") && this.hideScrollbar(), this.initLayout(), this.initCarousel(), this.attachEvents(), I.set(this.id, this), this.trigger("prepare"), this.state = "ready", this.trigger("ready"), this.$container.setAttribute("aria-hidden", "false"), this.option("trapFocus") && this.focus();
      }

      option(t, ...e) {
        const i = this.getSlide();
        let s = i ? i[t] : void 0;
        return void 0 !== s ? ("function" == typeof s && (s = s.call(this, this, ...e)), s) : super.option(t, ...e);
      }

      bindHandlers() {
        for (const t of ["onMousedown", "onKeydown", "onClick", "onFocus", "onCreateSlide", "onSettle", "onTouchMove", "onTouchEnd", "onTransform"]) this[t] = this[t].bind(this);
      }

      attachEvents() {
        document.addEventListener("mousedown", this.onMousedown), document.addEventListener("keydown", this.onKeydown, !0), this.option("trapFocus") && document.addEventListener("focus", this.onFocus, !0), this.$container.addEventListener("click", this.onClick);
      }

      detachEvents() {
        document.removeEventListener("mousedown", this.onMousedown), document.removeEventListener("keydown", this.onKeydown, !0), document.removeEventListener("focus", this.onFocus, !0), this.$container.removeEventListener("click", this.onClick);
      }

      initLayout() {
        this.$root = this.option("parentEl") || document.body;
        let t = this.option("template.main");
        t && (this.$root.insertAdjacentHTML("beforeend", this.localize(t)), this.$container = this.$root.querySelector(".fancybox__container")), this.$container || (this.$container = document.createElement("div"), this.$root.appendChild(this.$container)), this.$container.onscroll = () => (this.$container.scrollLeft = 0, !1), Object.entries({
          class: "fancybox__container",
          role: "dialog",
          tabIndex: "-1",
          "aria-modal": "true",
          "aria-hidden": "true",
          "aria-label": this.localize("{{MODAL}}")
        }).forEach(t => this.$container.setAttribute(...t)), this.option("animated") && this.$container.classList.add("is-animated"), this.$backdrop = this.$container.querySelector(".fancybox__backdrop"), this.$backdrop || (this.$backdrop = document.createElement("div"), this.$backdrop.classList.add("fancybox__backdrop"), this.$container.appendChild(this.$backdrop)), this.$carousel = this.$container.querySelector(".fancybox__carousel"), this.$carousel || (this.$carousel = document.createElement("div"), this.$carousel.classList.add("fancybox__carousel"), this.$container.appendChild(this.$carousel)), this.$container.Fancybox = this, this.id = this.$container.getAttribute("id"), this.id || (this.id = this.options.id || ++F, this.$container.setAttribute("id", "fancybox-" + this.id));
        const e = this.option("mainClass");
        return e && this.$container.classList.add(...e.split(" ")), document.documentElement.classList.add("with-fancybox"), this.trigger("initLayout"), this;
      }

      setItems(t) {
        const e = [];

        for (const i of t) {
          const t = i.$trigger;

          if (t) {
            const e = t.dataset || {};
            i.src = e.src || t.getAttribute("href") || i.src, i.type = e.type || i.type, !i.src && t instanceof HTMLImageElement && (i.src = t.currentSrc || i.$trigger.src);
          }

          let s = i.$thumb;

          if (!s) {
            let t = i.$trigger && i.$trigger.origTarget;
            t && (s = t instanceof HTMLImageElement ? t : t.querySelector("img:not([aria-hidden])")), !s && i.$trigger && (s = i.$trigger instanceof HTMLImageElement ? i.$trigger : i.$trigger.querySelector("img:not([aria-hidden])"));
          }

          i.$thumb = s || null;
          let o = i.thumb;
          !o && s && (o = s.currentSrc || s.src, !o && s.dataset && (o = s.dataset.lazySrc || s.dataset.src)), o || "image" !== i.type || (o = i.src), i.thumb = o || null, i.caption = i.caption || "", e.push(i);
        }

        this.items = e;
      }

      initCarousel() {
        return this.Carousel = new y(this.$carousel, e(!0, {}, {
          prefix: "",
          classNames: {
            viewport: "fancybox__viewport",
            track: "fancybox__track",
            slide: "fancybox__slide"
          },
          textSelection: !0,
          preload: this.option("preload"),
          friction: .88,
          slides: this.items,
          initialPage: this.options.startIndex,
          slidesPerPage: 1,
          infiniteX: this.option("infinite"),
          infiniteY: !0,
          l10n: this.option("l10n"),
          Dots: !1,
          Navigation: {
            classNames: {
              main: "fancybox__nav",
              button: "carousel__button",
              next: "is-next",
              prev: "is-prev"
            }
          },
          Panzoom: {
            textSelection: !0,
            panOnlyZoomed: () => this.Carousel && this.Carousel.pages && this.Carousel.pages.length < 2 && !this.option("dragToClose"),
            lockAxis: () => {
              if (this.Carousel) {
                let t = "x";
                return this.option("dragToClose") && (t += "y"), t;
              }
            }
          },
          on: {
            "*": (t, ...e) => this.trigger(`Carousel.${t}`, ...e),
            init: t => this.Carousel = t,
            createSlide: this.onCreateSlide,
            settle: this.onSettle
          }
        }, this.option("Carousel"))), this.option("dragToClose") && this.Carousel.Panzoom.on({
          touchMove: this.onTouchMove,
          afterTransform: this.onTransform,
          touchEnd: this.onTouchEnd
        }), this.trigger("initCarousel"), this;
      }

      onCreateSlide(t, e) {
        let i = e.caption || "";

        if ("function" == typeof this.options.caption && (i = this.options.caption.call(this, this, this.Carousel, e)), "string" == typeof i && i.length) {
          const t = document.createElement("div"),
                s = `fancybox__caption_${this.id}_${e.index}`;
          t.className = "fancybox__caption", t.innerHTML = i, t.setAttribute("id", s), e.$caption = e.$el.appendChild(t), e.$el.classList.add("has-caption"), e.$el.setAttribute("aria-labelledby", s);
        }
      }

      onSettle() {
        this.option("autoFocus") && this.focus();
      }

      onFocus(t) {
        this.isTopmost() && this.focus(t);
      }

      onClick(t) {
        if (t.defaultPrevented) return;
        let e = t.composedPath()[0];
        if (e.matches("[data-fancybox-close]")) return t.preventDefault(), void R.close(!1, t);
        if (e.matches("[data-fancybox-next]")) return t.preventDefault(), void R.next();
        if (e.matches("[data-fancybox-prev]")) return t.preventDefault(), void R.prev();
        const i = document.activeElement;

        if (i) {
          if (i.closest("[contenteditable]")) return;
          e.matches(x) || i.blur();
        }

        if (e.closest(".fancybox__content")) return;
        if (getSelection().toString().length) return;
        if (!1 === this.trigger("click", t)) return;

        switch (this.option("click")) {
          case "close":
            this.close();
            break;

          case "next":
            this.next();
        }
      }

      onTouchMove() {
        const t = this.getSlide().Panzoom;
        return !t || 1 === t.content.scale;
      }

      onTouchEnd(t) {
        const e = t.dragOffset.y;
        Math.abs(e) >= 150 || Math.abs(e) >= 35 && t.dragOffset.time < 350 ? (this.option("hideClass") && (this.getSlide().hideClass = "fancybox-throwOut" + (t.content.y < 0 ? "Up" : "Down")), this.close()) : "y" === t.lockAxis && t.panTo({
          y: 0
        });
      }

      onTransform(t) {
        if (this.$backdrop) {
          const e = Math.abs(t.content.y),
                i = e < 1 ? "" : Math.max(.33, Math.min(1, 1 - e / t.content.fitHeight * 1.5));
          this.$container.style.setProperty("--fancybox-ts", i ? "0s" : ""), this.$container.style.setProperty("--fancybox-opacity", i);
        }
      }

      onMousedown() {
        "ready" === this.state && document.body.classList.add("is-using-mouse");
      }

      onKeydown(t) {
        if (!this.isTopmost()) return;
        document.body.classList.remove("is-using-mouse");
        const e = t.key,
              i = this.option("keyboard");
        if (!i || t.ctrlKey || t.altKey || t.shiftKey) return;
        const s = t.composedPath()[0],
              o = document.activeElement && document.activeElement.classList,
              n = o && o.contains("carousel__button");

        if ("Escape" !== e && !n) {
          if (t.target.isContentEditable || -1 !== ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(s.nodeName)) return;
        }

        if (!1 === this.trigger("keydown", e, t)) return;
        const a = i[e];
        "function" == typeof this[a] && this[a]();
      }

      getSlide() {
        const t = this.Carousel;
        if (!t) return null;
        const e = null === t.page ? t.option("initialPage") : t.page,
              i = t.pages || [];
        return i.length && i[e] ? i[e].slides[0] : null;
      }

      focus(t) {
        if (R.ignoreFocusChange) return;
        if (["init", "closing", "customClosing", "destroy"].indexOf(this.state) > -1) return;
        const e = this.$container,
              i = this.getSlide(),
              s = "done" === i.state ? i.$el : null;
        if (s && s.contains(document.activeElement)) return;
        t && t.preventDefault(), R.ignoreFocusChange = !0;
        const o = Array.from(e.querySelectorAll(x));
        let n,
            a = [];

        for (let t of o) {
          const e = t.offsetParent,
                i = s && s.contains(t),
                o = !this.Carousel.$viewport.contains(t);
          e && (i || o) ? (a.push(t), void 0 !== t.dataset.origTabindex && (t.tabIndex = t.dataset.origTabindex, t.removeAttribute("data-orig-tabindex")), (t.hasAttribute("autoFocus") || !n && i && !t.classList.contains("carousel__button")) && (n = t)) : (t.dataset.origTabindex = void 0 === t.dataset.origTabindex ? t.getAttribute("tabindex") : t.dataset.origTabindex, t.tabIndex = -1);
        }

        t ? a.indexOf(t.target) > -1 ? this.lastFocus = t.target : this.lastFocus === e ? w(a[a.length - 1]) : w(e) : this.option("autoFocus") && n ? w(n) : a.indexOf(document.activeElement) < 0 && w(e), this.lastFocus = document.activeElement, R.ignoreFocusChange = !1;
      }

      hideScrollbar() {
        if (!v) return;
        const t = window.innerWidth - document.documentElement.getBoundingClientRect().width,
              e = "fancybox-style-noscroll";
        let i = document.getElementById(e);
        i || t > 0 && (i = document.createElement("style"), i.id = e, i.type = "text/css", i.innerHTML = `.compensate-for-scrollbar {padding-right: ${t}px;}`, document.getElementsByTagName("head")[0].appendChild(i), document.body.classList.add("compensate-for-scrollbar"));
      }

      revealScrollbar() {
        document.body.classList.remove("compensate-for-scrollbar");
        const t = document.getElementById("fancybox-style-noscroll");
        t && t.remove();
      }

      clearContent(t) {
        this.Carousel.trigger("removeSlide", t), t.$content && (t.$content.remove(), t.$content = null), t.$closeButton && (t.$closeButton.remove(), t.$closeButton = null), t._className && t.$el.classList.remove(t._className);
      }

      setContent(t, e, i = {}) {
        let s;
        const o = t.$el;
        if (e instanceof HTMLElement) ["img", "iframe", "video", "audio"].indexOf(e.nodeName.toLowerCase()) > -1 ? (s = document.createElement("div"), s.appendChild(e)) : s = e;else {
          const t = document.createRange().createContextualFragment(e);
          s = document.createElement("div"), s.appendChild(t);
        }
        if (t.filter && !t.error && (s = s.querySelector(t.filter)), s instanceof Element) return t._className = `has-${i.suffix || t.type || "unknown"}`, o.classList.add(t._className), s.classList.add("fancybox__content"), "none" !== s.style.display && "none" !== getComputedStyle(s).getPropertyValue("display") || (s.style.display = t.display || this.option("defaultDisplay") || "flex"), t.id && s.setAttribute("id", t.id), t.$content = s, o.prepend(s), this.manageCloseButton(t), "loading" !== t.state && this.revealContent(t), s;
        this.setError(t, "{{ELEMENT_NOT_FOUND}}");
      }

      manageCloseButton(t) {
        const e = void 0 === t.closeButton ? this.option("closeButton") : t.closeButton;
        if (!e || "top" === e && this.$closeButton) return;
        const i = document.createElement("button");
        i.classList.add("carousel__button", "is-close"), i.setAttribute("title", this.options.l10n.CLOSE), i.innerHTML = this.option("template.closeButton"), i.addEventListener("click", t => this.close(t)), "inside" === e ? (t.$closeButton && t.$closeButton.remove(), t.$closeButton = t.$content.appendChild(i)) : this.$closeButton = this.$container.insertBefore(i, this.$container.firstChild);
      }

      revealContent(t) {
        this.trigger("reveal", t), t.$content.style.visibility = "";
        let e = !1;
        t.error || "loading" === t.state || null !== this.Carousel.prevPage || t.index !== this.options.startIndex || (e = void 0 === t.showClass ? this.option("showClass") : t.showClass), e ? (t.state = "animating", this.animateCSS(t.$content, e, () => {
          this.done(t);
        })) : this.done(t);
      }

      animateCSS(t, e, i) {
        if (t && t.dispatchEvent(new CustomEvent("animationend", {
          bubbles: !0,
          cancelable: !0
        })), !t || !e) return void ("function" == typeof i && i());

        const s = function (o) {
          o.currentTarget === this && (t.removeEventListener("animationend", s), i && i(), t.classList.remove(e));
        };

        t.addEventListener("animationend", s), t.classList.add(e);
      }

      done(t) {
        t.state = "done", this.trigger("done", t);
        const e = this.getSlide();
        e && t.index === e.index && this.option("autoFocus") && this.focus();
      }

      setError(t, e) {
        t.error = e, this.hideLoading(t), this.clearContent(t);
        const i = document.createElement("div");
        i.classList.add("fancybox-error"), i.innerHTML = this.localize(e || "<p>{{ERROR}}</p>"), this.setContent(t, i, {
          suffix: "error"
        });
      }

      showLoading(t) {
        t.state = "loading", t.$el.classList.add("is-loading");
        let e = t.$el.querySelector(".fancybox__spinner");
        e || (e = document.createElement("div"), e.classList.add("fancybox__spinner"), e.innerHTML = this.option("template.spinner"), e.addEventListener("click", () => {
          this.Carousel.Panzoom.velocity || this.close();
        }), t.$el.prepend(e));
      }

      hideLoading(t) {
        const e = t.$el && t.$el.querySelector(".fancybox__spinner");
        e && (e.remove(), t.$el.classList.remove("is-loading")), "loading" === t.state && (this.trigger("load", t), t.state = "ready");
      }

      next() {
        const t = this.Carousel;
        t && t.pages.length > 1 && t.slideNext();
      }

      prev() {
        const t = this.Carousel;
        t && t.pages.length > 1 && t.slidePrev();
      }

      jumpTo(...t) {
        this.Carousel && this.Carousel.slideTo(...t);
      }

      isClosing() {
        return ["closing", "customClosing", "destroy"].includes(this.state);
      }

      isTopmost() {
        return R.getInstance().id == this.id;
      }

      close(t) {
        if (t && t.preventDefault(), this.isClosing()) return;
        if (!1 === this.trigger("shouldClose", t)) return;
        if (this.state = "closing", this.Carousel.Panzoom.destroy(), this.detachEvents(), this.trigger("closing", t), "destroy" === this.state) return;
        this.$container.setAttribute("aria-hidden", "true"), this.$container.classList.add("is-closing");
        const e = this.getSlide();

        if (this.Carousel.slides.forEach(t => {
          t.$content && t.index !== e.index && this.Carousel.trigger("removeSlide", t);
        }), "closing" === this.state) {
          const t = void 0 === e.hideClass ? this.option("hideClass") : e.hideClass;
          this.animateCSS(e.$content, t, () => {
            this.destroy();
          }, !0);
        }
      }

      destroy() {
        if ("destroy" === this.state) return;
        this.state = "destroy", this.trigger("destroy");
        const t = this.option("placeFocusBack") ? this.option("triggerTarget", this.getSlide().$trigger) : null;
        this.Carousel.destroy(), this.detachPlugins(), this.Carousel = null, this.options = {}, this.events = {}, this.$container.remove(), this.$container = this.$backdrop = this.$carousel = null, t && w(t), I.delete(this.id);
        const e = R.getInstance();
        e ? e.focus() : (document.documentElement.classList.remove("with-fancybox"), document.body.classList.remove("is-using-mouse"), this.revealScrollbar());
      }

      static show(t, e = {}) {
        return new R(t, e);
      }

      static fromEvent(t, e = {}) {
        if (t.defaultPrevented) return;
        if (t.button && 0 !== t.button) return;
        if (t.ctrlKey || t.metaKey || t.shiftKey) return;
        const i = t.composedPath()[0];
        let s,
            o,
            n,
            a = i;

        if ((a.matches("[data-fancybox-trigger]") || (a = a.closest("[data-fancybox-trigger]"))) && (e.triggerTarget = a, s = a && a.dataset && a.dataset.fancyboxTrigger), s) {
          const t = document.querySelectorAll(`[data-fancybox="${s}"]`),
                e = parseInt(a.dataset.fancyboxIndex, 10) || 0;
          a = t.length ? t[e] : a;
        }

        Array.from(R.openers.keys()).reverse().some(e => {
          n = a || i;
          let s = !1;

          try {
            n instanceof Element && ("string" == typeof e || e instanceof String) && (s = n.matches(e) || (n = n.closest(e)));
          } catch (t) {}

          return !!s && (t.preventDefault(), o = e, !0);
        });
        let r = !1;

        if (o) {
          e.event = t, e.target = n, n.origTarget = i, r = R.fromOpener(o, e);
          const s = R.getInstance();
          s && "ready" === s.state && t.detail && document.body.classList.add("is-using-mouse");
        }

        return r;
      }

      static fromOpener(t, i = {}) {
        let s = [],
            o = i.startIndex || 0,
            n = i.target || null;
        const a = void 0 !== (i = e({}, i, R.openers.get(t))).groupAll && i.groupAll,
              r = void 0 === i.groupAttr ? "data-fancybox" : i.groupAttr,
              h = r && n ? n.getAttribute(`${r}`) : "";

        if (!n || h || a) {
          const e = i.root || (n ? n.getRootNode() : document.body);
          s = [].slice.call(e.querySelectorAll(t));
        }

        if (n && !a && (s = h ? s.filter(t => t.getAttribute(`${r}`) === h) : [n]), !s.length) return !1;
        const l = R.getInstance();
        return !(l && s.indexOf(l.options.$trigger) > -1) && (o = n ? s.indexOf(n) : o, s = s.map(function (t) {
          const e = ["false", "0", "no", "null", "undefined"],
                i = ["true", "1", "yes"],
                s = Object.assign({}, t.dataset),
                o = {};

          for (let [t, n] of Object.entries(s)) if ("fancybox" !== t) if ("width" === t || "height" === t) o[`_${t}`] = n;else if ("string" == typeof n || n instanceof String) {
            if (e.indexOf(n) > -1) o[t] = !1;else if (i.indexOf(o[t]) > -1) o[t] = !0;else try {
              o[t] = JSON.parse(n);
            } catch (e) {
              o[t] = n;
            }
          } else o[t] = n;

          return t instanceof Element && (o.$trigger = t), o;
        }), new R(s, e({}, i, {
          startIndex: o,
          $trigger: n
        })));
      }

      static bind(t, e = {}) {
        function i() {
          document.body.addEventListener("click", R.fromEvent, !1);
        }

        v && (R.openers.size || (/complete|interactive|loaded/.test(document.readyState) ? i() : document.addEventListener("DOMContentLoaded", i)), R.openers.set(t, e));
      }

      static unbind(t) {
        R.openers.delete(t), R.openers.size || R.destroy();
      }

      static destroy() {
        let t;

        for (; t = R.getInstance();) t.destroy();

        R.openers = new Map(), document.body.removeEventListener("click", R.fromEvent, !1);
      }

      static getInstance(t) {
        if (t) return I.get(t);
        return Array.from(I.values()).reverse().find(t => !t.isClosing() && t) || null;
      }

      static close(t = !0, e) {
        if (t) for (const t of I.values()) t.close(e);else {
          const t = R.getInstance();
          t && t.close(e);
        }
      }

      static next() {
        const t = R.getInstance();
        t && t.next();
      }

      static prev() {
        const t = R.getInstance();
        t && t.prev();
      }

    }

    R.version = "4.0.31", R.defaults = M, R.openers = new Map(), R.Plugins = O, R.bind("[data-fancybox]");

    for (const [t, e] of Object.entries(R.Plugins || {})) "function" == typeof e.create && e.create(R);

    /*
    some comment
    */
    var wpcf7Elm = document.querySelector('.wpcf7');

    if (wpcf7Elm) {
      wpcf7Elm.addEventListener('wpcf7mailsent', function (event) {
         close();
      }, false);
      wpcf7Elm.addEventListener('wpcf7submit', function (event) {
        var self = this;
        console.log('submitted');
        console.log(event);
        console.log(self);
        window.setTimeout(function () {//			console.log($(self).find('div.wpcf7-response-output').html());
          //			var responseOutput = $(self).find('div.wpcf7-response-output').html();
          //			Fancybox.open(responseOutput);

          /*
          const fancybox = new Fancybox([
            {
          	src: "<p>Lorem ipsum dolor sit amet.</p>",
          	type: "html",
            },
          ]);
          */
        }, 100);
      }, false);
    }
    /*
    $(document).ready(function(){
    	$('.wpcf7').on('wpcf7mailsent',function(){
    		$.fancybox.close( true );
    	});
    	$('.wpcf7').on('wpcf7submit',function(event){
    		//console.log(event);
    		//console.log('some');
    		var self=this;
    		window.setTimeout(function(){
    		console.log($(self).find('div.wpcf7-response-output').html());
    		var responseOutput = $(self).find('div.wpcf7-response-output').html();
    				jQuery.fancybox.open(responseOutput);
    	},100);
    	});
    });

    */

    // import Swiper, { Parallax, Pagination, Autoplay, FreeMode, Mousewheel, Scrollbar, Navigation } from 'swiper';
    document.addEventListener("DOMContentLoaded", ready);

    function ready() {
      // burger
      let burgerBtns = [...document.querySelectorAll(".burger")];
      let body = document.querySelector("body");
      let html = document.querySelector("html");

      for (const burgerBtn of burgerBtns) {
        burgerBtn.addEventListener("click", function () {
          burgerBtn.classList.toggle("active");
          body.classList.toggle("active");
          html.classList.toggle("active");
        });
      } // burger end
      // sliders


      if (document.querySelector('.news-slider')) {
        let newsSlider = new Swiper(".news-slider", {
          modules: [Pagination, Navigation],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          pagination: {
            el: ".news-slider .pagination",
            clickable: true
          },
          navigation: {
            nextEl: ".news-slider .button-next",
            prevEl: ".news-slider .button-prev"
          },
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 15
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 45
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 45
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 45
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 67
            }
          }
        });
      }

      if (document.querySelector('.partners-slider')) {
        let partnersSlider = new Swiper(".partners-slider", {
          modules: [Autoplay],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          autoplay: {
            delay: 2000,
            disableOnInteraction: false
          },
          on: {
            init() {
              this.el.addEventListener('mouseenter', () => {
                this.autoplay.stop();
              });
              this.el.addEventListener('mouseleave', () => {
                this.autoplay.start();
              });
            }

          },
          breakpoints: {
            320: {
              slidesPerView: 2,
              spaceBetween: 25
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 25
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 35
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 45
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 60
            }
          }
        });
      }

      if (document.querySelector('.slider-rada')) {
        let partnersSlider = new Swiper(".slider-rada", {
          modules: [Navigation],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          navigation: {
            nextEl: ".slider-rada .button-next",
            prevEl: ".slider-rada .button-prev"
          },
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 15
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 25
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 35
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 45
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 150
            }
          }
        });
      }

      if (document.querySelector('.slider-foto-small')) {
        let fotoSmallSlider = new Swiper(".slider-foto-small", {
          modules: [],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          slidesPerView: 5,
          spaceBetween: 50,
          freeMode: true,
          breakpoints: {
            320: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 30
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 40
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 50
            }
          }
        });
        let fotoSlider = new Swiper(".slider-foto", {
          modules: [Navigation, Thumb],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          spaceBetween: 30,
          thumbs: {
            swiper: fotoSmallSlider
          },
          navigation: {
            nextEl: ".slider-foto .button-next",
            prevEl: ".slider-foto .button-prev"
          }
        });
      }

      if (document.querySelector('.news-program-slider')) {
        let fotoSmallSlider = new Swiper(".news-program-slider", {
          modules: [Navigation],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          navigation: {
            nextEl: ".news-program-slider .button-next",
            prevEl: ".news-program-slider .button-prev"
          },
          breakpoints: {
            320: {
              slidesPerView: 1,
              spaceBetween: 30
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 30
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 40
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 60
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 80
            }
          }
        });
      } // sliders end
      // spoler menu anim


      let menuItemHasChildren = document.querySelectorAll('.menu-item-has-children');
      let iter = 0;

      function visibleSubMenu() {
        if (window.innerWidth < 1279) {
          iter++;
          menuItemHasChildren.forEach(elem => {
            let counter = 0;
            let subMenu = elem.querySelector('.sub-menu');
            let elemHeight = subMenu.offsetHeight;
            subMenu.style.visibility = 'hidden';
            subMenu.style.maxHeight = 0 + 'px';
            subMenu.style.opacity = 0;
            elem.addEventListener('click', e => {
              let subMenu = elem.querySelector('.sub-menu');

              if (e.target.closest('.menu-item') && !e.target.closest('.sub-menu')) {
                if (counter == 0) {
                  subMenu.style.visibility = 'visible';
                  subMenu.style.maxHeight = elemHeight + 'px';
                  subMenu.style.opacity = 1;
                  counter++;
                } else {
                  subMenu.style.visibility = 'hidden';
                  subMenu.style.maxHeight = 0 + 'px';
                  subMenu.style.opacity = 0;
                  counter = 0;
                }
              }
            });
          });
        }
      }

      visibleSubMenu();
      window.addEventListener('resize', () => {
        if (window.innerWidth < 1279 && iter < 1) {
          visibleSubMenu();
        }

        if (window.innerWidth > 1280) {
          let subMenus = document.querySelectorAll('.sub-menu');
          subMenus.forEach(elem => {
            elem.removeAttribute('style');
          });
        }
      }); // spoler menu anim end
      // tabs

      const tabsBtn = document.querySelectorAll(".tabs__nav-btn");
      tabsBtn.forEach(onTabClick);

      function onTabClick(item) {
        item.addEventListener("click", function () {
          let currentBtn = item;
          let tabId = currentBtn.getAttribute("data-tab");
          let perentTab = currentBtn.closest('.tabs');
          let currentTab = perentTab.querySelector(tabId);
          let tabsBtn = perentTab.querySelectorAll(".tabs__nav-btn");
          let tabsItems = perentTab.querySelectorAll(".tabs__item");

          if (!currentBtn.classList.contains('active')) {
            tabsBtn.forEach(function (item) {
              item.classList.remove('active');
            });
            tabsItems.forEach(function (item) {
              item.classList.remove('active');
            });
            currentBtn.classList.add('active');
            currentTab.classList.add('active');
          }
        });
      }

      document.querySelector('.tabs__nav-btn'); // tabs end
      // Fancybox gallery

      R.bind('[data-fancybox="gallery"]', {
        Toolbar: {
          display: [{
            id: "counter",
            position: "left"
          }, "slideshow", "fullscreen", "close"]
        }
      }); // Fancybox gallery end
      // copy

      let copyTextBtns = document.querySelectorAll('[data-copy]');

      if (copyTextBtns) {
        copyTextBtns.forEach(copyBtn => {
          copyBtn.addEventListener('click', e => {
            let parentElement = e.target.closest('.donation-item');
            let copyText = parentElement.querySelector('[data-copy-text]');
            copyText.select();
            copyText.focus();

            try {
              var successful = document.execCommand('copy'); // window.getSelection().removeAllRanges();

              if (document.querySelector('button.copied[data-copy]')) {
                const copiedBtn = document.querySelector('button.copied[data-copy]');
                copiedBtn.classList.remove('copied');
              }

              let copyButton = parentElement.querySelector('button[data-copy]');
              copyButton.classList.add('copied');
            } catch (err) {
              console.log('Oops, unable to copy');
            }
          });
        });
      } // copy end

    }

})));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSgnbWFpbicsIGZhY3RvcnkpIDpcbiAgICBmYWN0b3J5KCk7XG59KChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICAgIC8qKlxuICAgICAqIFNTUiBXaW5kb3cgNC4wLjJcbiAgICAgKiBCZXR0ZXIgaGFuZGxpbmcgZm9yIHdpbmRvdyBvYmplY3QgaW4gU1NSIGVudmlyb25tZW50XG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL25vbGltaXRzNHdlYi9zc3Itd2luZG93XG4gICAgICpcbiAgICAgKiBDb3B5cmlnaHQgMjAyMSwgVmxhZGltaXIgS2hhcmxhbXBpZGlcbiAgICAgKlxuICAgICAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICAgICAqXG4gICAgICogUmVsZWFzZWQgb246IERlY2VtYmVyIDEzLCAyMDIxXG4gICAgICovXG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wYXJhbS1yZWFzc2lnbiAqL1xuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAnY29uc3RydWN0b3InIGluIG9iaiAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRlbmQodGFyZ2V0ID0ge30sIHNyYyA9IHt9KSB7XG4gICAgICBPYmplY3Qua2V5cyhzcmMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXRba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHRhcmdldFtrZXldID0gc3JjW2tleV07ZWxzZSBpZiAoaXNPYmplY3Qoc3JjW2tleV0pICYmIGlzT2JqZWN0KHRhcmdldFtrZXldKSAmJiBPYmplY3Qua2V5cyhzcmNba2V5XSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGV4dGVuZCh0YXJnZXRba2V5XSwgc3JjW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzc3JEb2N1bWVudCA9IHtcbiAgICAgIGJvZHk6IHt9LFxuXG4gICAgICBhZGRFdmVudExpc3RlbmVyKCkge30sXG5cbiAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoKSB7fSxcblxuICAgICAgYWN0aXZlRWxlbWVudDoge1xuICAgICAgICBibHVyKCkge30sXG5cbiAgICAgICAgbm9kZU5hbWU6ICcnXG4gICAgICB9LFxuXG4gICAgICBxdWVyeVNlbGVjdG9yKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG5cbiAgICAgIHF1ZXJ5U2VsZWN0b3JBbGwoKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0sXG5cbiAgICAgIGdldEVsZW1lbnRCeUlkKCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0sXG5cbiAgICAgIGNyZWF0ZUV2ZW50KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGluaXRFdmVudCgpIHt9XG5cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgIGNoaWxkTm9kZXM6IFtdLFxuICAgICAgICAgIHN0eWxlOiB7fSxcblxuICAgICAgICAgIHNldEF0dHJpYnV0ZSgpIHt9LFxuXG4gICAgICAgICAgZ2V0RWxlbWVudHNCeVRhZ05hbWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICBjcmVhdGVFbGVtZW50TlMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH0sXG5cbiAgICAgIGltcG9ydE5vZGUoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcblxuICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgaGFzaDogJycsXG4gICAgICAgIGhvc3Q6ICcnLFxuICAgICAgICBob3N0bmFtZTogJycsXG4gICAgICAgIGhyZWY6ICcnLFxuICAgICAgICBvcmlnaW46ICcnLFxuICAgICAgICBwYXRobmFtZTogJycsXG4gICAgICAgIHByb3RvY29sOiAnJyxcbiAgICAgICAgc2VhcmNoOiAnJ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXREb2N1bWVudCgpIHtcbiAgICAgIGNvbnN0IGRvYyA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudCA6IHt9O1xuICAgICAgZXh0ZW5kKGRvYywgc3NyRG9jdW1lbnQpO1xuICAgICAgcmV0dXJuIGRvYztcbiAgICB9XG5cbiAgICBjb25zdCBzc3JXaW5kb3cgPSB7XG4gICAgICBkb2N1bWVudDogc3NyRG9jdW1lbnQsXG4gICAgICBuYXZpZ2F0b3I6IHtcbiAgICAgICAgdXNlckFnZW50OiAnJ1xuICAgICAgfSxcbiAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgIGhhc2g6ICcnLFxuICAgICAgICBob3N0OiAnJyxcbiAgICAgICAgaG9zdG5hbWU6ICcnLFxuICAgICAgICBocmVmOiAnJyxcbiAgICAgICAgb3JpZ2luOiAnJyxcbiAgICAgICAgcGF0aG5hbWU6ICcnLFxuICAgICAgICBwcm90b2NvbDogJycsXG4gICAgICAgIHNlYXJjaDogJydcbiAgICAgIH0sXG4gICAgICBoaXN0b3J5OiB7XG4gICAgICAgIHJlcGxhY2VTdGF0ZSgpIHt9LFxuXG4gICAgICAgIHB1c2hTdGF0ZSgpIHt9LFxuXG4gICAgICAgIGdvKCkge30sXG5cbiAgICAgICAgYmFjaygpIHt9XG5cbiAgICAgIH0sXG4gICAgICBDdXN0b21FdmVudDogZnVuY3Rpb24gQ3VzdG9tRXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSxcblxuICAgICAgYWRkRXZlbnRMaXN0ZW5lcigpIHt9LFxuXG4gICAgICByZW1vdmVFdmVudExpc3RlbmVyKCkge30sXG5cbiAgICAgIGdldENvbXB1dGVkU3R5bGUoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2V0UHJvcGVydHlWYWx1ZSgpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIEltYWdlKCkge30sXG5cbiAgICAgIERhdGUoKSB7fSxcblxuICAgICAgc2NyZWVuOiB7fSxcblxuICAgICAgc2V0VGltZW91dCgpIHt9LFxuXG4gICAgICBjbGVhclRpbWVvdXQoKSB7fSxcblxuICAgICAgbWF0Y2hNZWRpYSgpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfSxcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoY2FsbGJhY2ssIDApO1xuICAgICAgfSxcblxuICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoaWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICB9XG5cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0V2luZG93KCkge1xuICAgICAgY29uc3Qgd2luID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fTtcbiAgICAgIGV4dGVuZCh3aW4sIHNzcldpbmRvdyk7XG4gICAgICByZXR1cm4gd2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERvbTcgNC4wLjRcbiAgICAgKiBNaW5pbWFsaXN0aWMgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBET00gbWFuaXB1bGF0aW9uLCB3aXRoIGEgalF1ZXJ5LWNvbXBhdGlibGUgQVBJXG4gICAgICogaHR0cHM6Ly9mcmFtZXdvcms3LmlvL2RvY3MvZG9tNy5odG1sXG4gICAgICpcbiAgICAgKiBDb3B5cmlnaHQgMjAyMiwgVmxhZGltaXIgS2hhcmxhbXBpZGlcbiAgICAgKlxuICAgICAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICAgICAqXG4gICAgICogUmVsZWFzZWQgb246IEphbnVhcnkgMTEsIDIwMjJcbiAgICAgKi9cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4gICAgZnVuY3Rpb24gbWFrZVJlYWN0aXZlKG9iaikge1xuICAgICAgY29uc3QgcHJvdG8gPSBvYmouX19wcm90b19fO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ19fcHJvdG9fXycsIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICBwcm90by5fX3Byb3RvX18gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGFzcyBEb203IGV4dGVuZHMgQXJyYXkge1xuICAgICAgY29uc3RydWN0b3IoaXRlbXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoLi4uKGl0ZW1zIHx8IFtdKSk7XG4gICAgICAgICAgbWFrZVJlYWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheUZsYXQoYXJyID0gW10pIHtcbiAgICAgIGNvbnN0IHJlcyA9IFtdO1xuICAgICAgYXJyLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbCkpIHtcbiAgICAgICAgICByZXMucHVzaCguLi5hcnJheUZsYXQoZWwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMucHVzaChlbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheUZpbHRlcihhcnIsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGFyciwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFycmF5VW5pcXVlKGFycikge1xuICAgICAgY29uc3QgdW5pcXVlQXJyYXkgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHVuaXF1ZUFycmF5LmluZGV4T2YoYXJyW2ldKSA9PT0gLTEpIHVuaXF1ZUFycmF5LnB1c2goYXJyW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuaXF1ZUFycmF5O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gcXNhKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gW3NlbGVjdG9yXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYSA9IFtdO1xuICAgICAgY29uc3QgcmVzID0gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYS5wdXNoKHJlc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgbGV0IGFyciA9IFtdO1xuXG4gICAgICBpZiAoIWNvbnRleHQgJiYgc2VsZWN0b3IgaW5zdGFuY2VvZiBEb203KSB7XG4gICAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gbmV3IERvbTcoYXJyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgaHRtbCA9IHNlbGVjdG9yLnRyaW0oKTtcblxuICAgICAgICBpZiAoaHRtbC5pbmRleE9mKCc8JykgPj0gMCAmJiBodG1sLmluZGV4T2YoJz4nKSA+PSAwKSB7XG4gICAgICAgICAgbGV0IHRvQ3JlYXRlID0gJ2Rpdic7XG4gICAgICAgICAgaWYgKGh0bWwuaW5kZXhPZignPGxpJykgPT09IDApIHRvQ3JlYXRlID0gJ3VsJztcbiAgICAgICAgICBpZiAoaHRtbC5pbmRleE9mKCc8dHInKSA9PT0gMCkgdG9DcmVhdGUgPSAndGJvZHknO1xuICAgICAgICAgIGlmIChodG1sLmluZGV4T2YoJzx0ZCcpID09PSAwIHx8IGh0bWwuaW5kZXhPZignPHRoJykgPT09IDApIHRvQ3JlYXRlID0gJ3RyJztcbiAgICAgICAgICBpZiAoaHRtbC5pbmRleE9mKCc8dGJvZHknKSA9PT0gMCkgdG9DcmVhdGUgPSAndGFibGUnO1xuICAgICAgICAgIGlmIChodG1sLmluZGV4T2YoJzxvcHRpb24nKSA9PT0gMCkgdG9DcmVhdGUgPSAnc2VsZWN0JztcbiAgICAgICAgICBjb25zdCB0ZW1wUGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0b0NyZWF0ZSk7XG4gICAgICAgICAgdGVtcFBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZW1wUGFyZW50LmNoaWxkTm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKHRlbXBQYXJlbnQuY2hpbGROb2Rlc1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyciA9IHFzYShzZWxlY3Rvci50cmltKCksIGNvbnRleHQgfHwgZG9jdW1lbnQpO1xuICAgICAgICB9IC8vIGFyciA9IHFzYShzZWxlY3RvciwgZG9jdW1lbnQpO1xuXG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yLm5vZGVUeXBlIHx8IHNlbGVjdG9yID09PSB3aW5kb3cgfHwgc2VsZWN0b3IgPT09IGRvY3VtZW50KSB7XG4gICAgICAgIGFyci5wdXNoKHNlbGVjdG9yKTtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RvcikpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgRG9tNykgcmV0dXJuIHNlbGVjdG9yO1xuICAgICAgICBhcnIgPSBzZWxlY3RvcjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBEb203KGFycmF5VW5pcXVlKGFycikpO1xuICAgIH1cblxuICAgICQuZm4gPSBEb203LnByb3RvdHlwZTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICBmdW5jdGlvbiBhZGRDbGFzcyguLi5jbGFzc2VzKSB7XG4gICAgICBjb25zdCBjbGFzc05hbWVzID0gYXJyYXlGbGF0KGNsYXNzZXMubWFwKGMgPT4gYy5zcGxpdCgnICcpKSk7XG4gICAgICB0aGlzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKC4uLmNsYXNzTmFtZXMpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVDbGFzcyguLi5jbGFzc2VzKSB7XG4gICAgICBjb25zdCBjbGFzc05hbWVzID0gYXJyYXlGbGF0KGNsYXNzZXMubWFwKGMgPT4gYy5zcGxpdCgnICcpKSk7XG4gICAgICB0aGlzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKC4uLmNsYXNzTmFtZXMpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVDbGFzcyguLi5jbGFzc2VzKSB7XG4gICAgICBjb25zdCBjbGFzc05hbWVzID0gYXJyYXlGbGF0KGNsYXNzZXMubWFwKGMgPT4gYy5zcGxpdCgnICcpKSk7XG4gICAgICB0aGlzLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBjbGFzc05hbWVzLmZvckVhY2goY2xhc3NOYW1lID0+IHtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKGNsYXNzTmFtZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzQ2xhc3MoLi4uY2xhc3Nlcykge1xuICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IGFycmF5RmxhdChjbGFzc2VzLm1hcChjID0+IGMuc3BsaXQoJyAnKSkpO1xuICAgICAgcmV0dXJuIGFycmF5RmlsdGVyKHRoaXMsIGVsID0+IHtcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZXMuZmlsdGVyKGNsYXNzTmFtZSA9PiBlbC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkubGVuZ3RoID4gMDtcbiAgICAgIH0pLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXR0cihhdHRycywgdmFsdWUpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmIHR5cGVvZiBhdHRycyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gR2V0IGF0dHJcbiAgICAgICAgaWYgKHRoaXNbMF0pIHJldHVybiB0aGlzWzBdLmdldEF0dHJpYnV0ZShhdHRycyk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IC8vIFNldCBhdHRyc1xuXG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIC8vIFN0cmluZ1xuICAgICAgICAgIHRoaXNbaV0uc2V0QXR0cmlidXRlKGF0dHJzLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT2JqZWN0XG4gICAgICAgICAgZm9yIChjb25zdCBhdHRyTmFtZSBpbiBhdHRycykge1xuICAgICAgICAgICAgdGhpc1tpXVthdHRyTmFtZV0gPSBhdHRyc1thdHRyTmFtZV07XG4gICAgICAgICAgICB0aGlzW2ldLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0cnNbYXR0ck5hbWVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQXR0cihhdHRyKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpc1tpXS5yZW1vdmVBdHRyaWJ1dGUoYXR0cik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzW2ldLnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNpdGlvbihkdXJhdGlvbikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXNbaV0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gdHlwZW9mIGR1cmF0aW9uICE9PSAnc3RyaW5nJyA/IGAke2R1cmF0aW9ufW1zYCA6IGR1cmF0aW9uO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbiguLi5hcmdzKSB7XG4gICAgICBsZXQgW2V2ZW50VHlwZSwgdGFyZ2V0U2VsZWN0b3IsIGxpc3RlbmVyLCBjYXB0dXJlXSA9IGFyZ3M7XG5cbiAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBbZXZlbnRUeXBlLCBsaXN0ZW5lciwgY2FwdHVyZV0gPSBhcmdzO1xuICAgICAgICB0YXJnZXRTZWxlY3RvciA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjYXB0dXJlKSBjYXB0dXJlID0gZmFsc2U7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUxpdmVFdmVudChlKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoIXRhcmdldCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBldmVudERhdGEgPSBlLnRhcmdldC5kb203RXZlbnREYXRhIHx8IFtdO1xuXG4gICAgICAgIGlmIChldmVudERhdGEuaW5kZXhPZihlKSA8IDApIHtcbiAgICAgICAgICBldmVudERhdGEudW5zaGlmdChlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkKHRhcmdldCkuaXModGFyZ2V0U2VsZWN0b3IpKSBsaXN0ZW5lci5hcHBseSh0YXJnZXQsIGV2ZW50RGF0YSk7ZWxzZSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50cyA9ICQodGFyZ2V0KS5wYXJlbnRzKCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcGFyZW50cy5sZW5ndGg7IGsgKz0gMSkge1xuICAgICAgICAgICAgaWYgKCQocGFyZW50c1trXSkuaXModGFyZ2V0U2VsZWN0b3IpKSBsaXN0ZW5lci5hcHBseShwYXJlbnRzW2tdLCBldmVudERhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFdmVudChlKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGUgJiYgZS50YXJnZXQgPyBlLnRhcmdldC5kb203RXZlbnREYXRhIHx8IFtdIDogW107XG5cbiAgICAgICAgaWYgKGV2ZW50RGF0YS5pbmRleE9mKGUpIDwgMCkge1xuICAgICAgICAgIGV2ZW50RGF0YS51bnNoaWZ0KGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgZXZlbnREYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXZlbnRzID0gZXZlbnRUeXBlLnNwbGl0KCcgJyk7XG4gICAgICBsZXQgajtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpc1tpXTtcblxuICAgICAgICBpZiAoIXRhcmdldFNlbGVjdG9yKSB7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGV2ZW50cy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBldmVudHNbal07XG4gICAgICAgICAgICBpZiAoIWVsLmRvbTdMaXN0ZW5lcnMpIGVsLmRvbTdMaXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgICAgIGlmICghZWwuZG9tN0xpc3RlbmVyc1tldmVudF0pIGVsLmRvbTdMaXN0ZW5lcnNbZXZlbnRdID0gW107XG4gICAgICAgICAgICBlbC5kb203TGlzdGVuZXJzW2V2ZW50XS5wdXNoKHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICAgIHByb3h5TGlzdGVuZXI6IGhhbmRsZUV2ZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZUV2ZW50LCBjYXB0dXJlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTGl2ZSBldmVudHNcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZXZlbnRzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgIGlmICghZWwuZG9tN0xpdmVMaXN0ZW5lcnMpIGVsLmRvbTdMaXZlTGlzdGVuZXJzID0ge307XG4gICAgICAgICAgICBpZiAoIWVsLmRvbTdMaXZlTGlzdGVuZXJzW2V2ZW50XSkgZWwuZG9tN0xpdmVMaXN0ZW5lcnNbZXZlbnRdID0gW107XG4gICAgICAgICAgICBlbC5kb203TGl2ZUxpc3RlbmVyc1tldmVudF0ucHVzaCh7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxuICAgICAgICAgICAgICBwcm94eUxpc3RlbmVyOiBoYW5kbGVMaXZlRXZlbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlTGl2ZUV2ZW50LCBjYXB0dXJlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb2ZmKC4uLmFyZ3MpIHtcbiAgICAgIGxldCBbZXZlbnRUeXBlLCB0YXJnZXRTZWxlY3RvciwgbGlzdGVuZXIsIGNhcHR1cmVdID0gYXJncztcblxuICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIFtldmVudFR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlXSA9IGFyZ3M7XG4gICAgICAgIHRhcmdldFNlbGVjdG9yID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNhcHR1cmUpIGNhcHR1cmUgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGV2ZW50cyA9IGV2ZW50VHlwZS5zcGxpdCgnICcpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBlbCA9IHRoaXNbal07XG4gICAgICAgICAgbGV0IGhhbmRsZXJzO1xuXG4gICAgICAgICAgaWYgKCF0YXJnZXRTZWxlY3RvciAmJiBlbC5kb203TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IGVsLmRvbTdMaXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0U2VsZWN0b3IgJiYgZWwuZG9tN0xpdmVMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gZWwuZG9tN0xpdmVMaXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChoYW5kbGVycyAmJiBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBrID49IDA7IGsgLT0gMSkge1xuICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNba107XG5cbiAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlci5wcm94eUxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVycy5zcGxpY2UoaywgMSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXIgJiYgaGFuZGxlci5saXN0ZW5lciAmJiBoYW5kbGVyLmxpc3RlbmVyLmRvbTdwcm94eSAmJiBoYW5kbGVyLmxpc3RlbmVyLmRvbTdwcm94eSA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLnByb3h5TGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShrLCAxKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLnByb3h5TGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShrLCAxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmlnZ2VyKC4uLmFyZ3MpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgZXZlbnRzID0gYXJnc1swXS5zcGxpdCgnICcpO1xuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXJnc1sxXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgZWwgPSB0aGlzW2pdO1xuXG4gICAgICAgICAgaWYgKHdpbmRvdy5DdXN0b21FdmVudCkge1xuICAgICAgICAgICAgY29uc3QgZXZ0ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudChldmVudCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IGV2ZW50RGF0YSxcbiAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbC5kb203RXZlbnREYXRhID0gYXJncy5maWx0ZXIoKGRhdGEsIGRhdGFJbmRleCkgPT4gZGF0YUluZGV4ID4gMCk7XG4gICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICAgICAgICBlbC5kb203RXZlbnREYXRhID0gW107XG4gICAgICAgICAgICBkZWxldGUgZWwuZG9tN0V2ZW50RGF0YTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZChjYWxsYmFjaykge1xuICAgICAgY29uc3QgZG9tID0gdGhpcztcblxuICAgICAgZnVuY3Rpb24gZmlyZUNhbGxCYWNrKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSB0aGlzKSByZXR1cm47XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZSk7XG4gICAgICAgIGRvbS5vZmYoJ3RyYW5zaXRpb25lbmQnLCBmaXJlQ2FsbEJhY2spO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgZG9tLm9uKCd0cmFuc2l0aW9uZW5kJywgZmlyZUNhbGxCYWNrKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb3V0ZXJXaWR0aChpbmNsdWRlTWFyZ2lucykge1xuICAgICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoaW5jbHVkZU1hcmdpbnMpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZXMgPSB0aGlzLnN0eWxlcygpO1xuICAgICAgICAgIHJldHVybiB0aGlzWzBdLm9mZnNldFdpZHRoICsgcGFyc2VGbG9hdChzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLXJpZ2h0JykpICsgcGFyc2VGbG9hdChzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLWxlZnQnKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpc1swXS5vZmZzZXRXaWR0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb3V0ZXJIZWlnaHQoaW5jbHVkZU1hcmdpbnMpIHtcbiAgICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGluY2x1ZGVNYXJnaW5zKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVzID0gdGhpcy5zdHlsZXMoKTtcbiAgICAgICAgICByZXR1cm4gdGhpc1swXS5vZmZzZXRIZWlnaHQgKyBwYXJzZUZsb2F0KHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdtYXJnaW4tdG9wJykpICsgcGFyc2VGbG9hdChzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnbWFyZ2luLWJvdHRvbScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzWzBdLm9mZnNldEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb2Zmc2V0KCkge1xuICAgICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcbiAgICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgICBjb25zdCBlbCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IGJveCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuYm9keTtcbiAgICAgICAgY29uc3QgY2xpZW50VG9wID0gZWwuY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDA7XG4gICAgICAgIGNvbnN0IGNsaWVudExlZnQgPSBlbC5jbGllbnRMZWZ0IHx8IGJvZHkuY2xpZW50TGVmdCB8fCAwO1xuICAgICAgICBjb25zdCBzY3JvbGxUb3AgPSBlbCA9PT0gd2luZG93ID8gd2luZG93LnNjcm9sbFkgOiBlbC5zY3JvbGxUb3A7XG4gICAgICAgIGNvbnN0IHNjcm9sbExlZnQgPSBlbCA9PT0gd2luZG93ID8gd2luZG93LnNjcm9sbFggOiBlbC5zY3JvbGxMZWZ0O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHRvcDogYm94LnRvcCArIHNjcm9sbFRvcCAtIGNsaWVudFRvcCxcbiAgICAgICAgICBsZWZ0OiBib3gubGVmdCArIHNjcm9sbExlZnQgLSBjbGllbnRMZWZ0XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0eWxlcygpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgaWYgKHRoaXNbMF0pIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzWzBdLCBudWxsKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjc3MocHJvcHMsIHZhbHVlKSB7XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcbiAgICAgIGxldCBpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAodHlwZW9mIHByb3BzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIC8vIC5jc3MoJ3dpZHRoJylcbiAgICAgICAgICBpZiAodGhpc1swXSkgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXNbMF0sIG51bGwpLmdldFByb3BlcnR5VmFsdWUocHJvcHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIC5jc3MoeyB3aWR0aDogJzEwMHB4JyB9KVxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgICAgdGhpc1tpXS5zdHlsZVtwcm9wXSA9IHByb3BzW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmIHR5cGVvZiBwcm9wcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gLmNzcygnd2lkdGgnLCAnMTAwcHgnKVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIHRoaXNbaV0uc3R5bGVbcHJvcHNdID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZWFjaChjYWxsYmFjaykge1xuICAgICAgaWYgKCFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgICB0aGlzLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgICBjYWxsYmFjay5hcHBseShlbCwgW2VsLCBpbmRleF0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaWx0ZXIoY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGFycmF5RmlsdGVyKHRoaXMsIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiAkKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaHRtbChodG1sKSB7XG4gICAgICBpZiAodHlwZW9mIGh0bWwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdID8gdGhpc1swXS5pbm5lckhUTUwgOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpc1tpXS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXh0KHRleHQpIHtcbiAgICAgIGlmICh0eXBlb2YgdGV4dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF0gPyB0aGlzWzBdLnRleHRDb250ZW50LnRyaW0oKSA6IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB0aGlzW2ldLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXMoc2VsZWN0b3IpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgY29uc3QgZWwgPSB0aGlzWzBdO1xuICAgICAgbGV0IGNvbXBhcmVXaXRoO1xuICAgICAgbGV0IGk7XG4gICAgICBpZiAoIWVsIHx8IHR5cGVvZiBzZWxlY3RvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGVsLm1hdGNoZXMpIHJldHVybiBlbC5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvcikgcmV0dXJuIGVsLndlYmtpdE1hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbC5tc01hdGNoZXNTZWxlY3RvcikgcmV0dXJuIGVsLm1zTWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgY29tcGFyZVdpdGggPSAkKHNlbGVjdG9yKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29tcGFyZVdpdGgubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBpZiAoY29tcGFyZVdpdGhbaV0gPT09IGVsKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGVjdG9yID09PSBkb2N1bWVudCkge1xuICAgICAgICByZXR1cm4gZWwgPT09IGRvY3VtZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZWN0b3IgPT09IHdpbmRvdykge1xuICAgICAgICByZXR1cm4gZWwgPT09IHdpbmRvdztcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGVjdG9yLm5vZGVUeXBlIHx8IHNlbGVjdG9yIGluc3RhbmNlb2YgRG9tNykge1xuICAgICAgICBjb21wYXJlV2l0aCA9IHNlbGVjdG9yLm5vZGVUeXBlID8gW3NlbGVjdG9yXSA6IHNlbGVjdG9yO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb21wYXJlV2l0aC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGlmIChjb21wYXJlV2l0aFtpXSA9PT0gZWwpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5kZXgoKSB7XG4gICAgICBsZXQgY2hpbGQgPSB0aGlzWzBdO1xuICAgICAgbGV0IGk7XG5cbiAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICBpID0gMDsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICAgICAgd2hpbGUgKChjaGlsZCA9IGNoaWxkLnByZXZpb3VzU2libGluZykgIT09IG51bGwpIHtcbiAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEpIGkgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVxKGluZGV4KSB7XG4gICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIHRoaXM7XG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgICAgaWYgKGluZGV4ID4gbGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gJChbXSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgY29uc3QgcmV0dXJuSW5kZXggPSBsZW5ndGggKyBpbmRleDtcbiAgICAgICAgaWYgKHJldHVybkluZGV4IDwgMCkgcmV0dXJuICQoW10pO1xuICAgICAgICByZXR1cm4gJChbdGhpc1tyZXR1cm5JbmRleF1dKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICQoW3RoaXNbaW5kZXhdXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwZW5kKC4uLmVscykge1xuICAgICAgbGV0IG5ld0NoaWxkO1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuXG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IGVscy5sZW5ndGg7IGsgKz0gMSkge1xuICAgICAgICBuZXdDaGlsZCA9IGVsc1trXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG5ld0NoaWxkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3QgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgdGVtcERpdi5pbm5lckhUTUwgPSBuZXdDaGlsZDtcblxuICAgICAgICAgICAgd2hpbGUgKHRlbXBEaXYuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICB0aGlzW2ldLmFwcGVuZENoaWxkKHRlbXBEaXYuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdDaGlsZCBpbnN0YW5jZW9mIERvbTcpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbmV3Q2hpbGQubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICAgICAgdGhpc1tpXS5hcHBlbmRDaGlsZChuZXdDaGlsZFtqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXNbaV0uYXBwZW5kQ2hpbGQobmV3Q2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmVwZW5kKG5ld0NoaWxkKSB7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICBsZXQgaTtcbiAgICAgIGxldCBqO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodHlwZW9mIG5ld0NoaWxkID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICB0ZW1wRGl2LmlubmVySFRNTCA9IG5ld0NoaWxkO1xuXG4gICAgICAgICAgZm9yIChqID0gdGVtcERpdi5jaGlsZE5vZGVzLmxlbmd0aCAtIDE7IGogPj0gMDsgaiAtPSAxKSB7XG4gICAgICAgICAgICB0aGlzW2ldLmluc2VydEJlZm9yZSh0ZW1wRGl2LmNoaWxkTm9kZXNbal0sIHRoaXNbaV0uY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkIGluc3RhbmNlb2YgRG9tNykge1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBuZXdDaGlsZC5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgdGhpc1tpXS5pbnNlcnRCZWZvcmUobmV3Q2hpbGRbal0sIHRoaXNbaV0uY2hpbGROb2Rlc1swXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXNbaV0uaW5zZXJ0QmVmb3JlKG5ld0NoaWxkLCB0aGlzW2ldLmNoaWxkTm9kZXNbMF0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHQoc2VsZWN0b3IpIHtcbiAgICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgaWYgKHRoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nICYmICQodGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmcpLmlzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgcmV0dXJuICQoW3RoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuICQoW10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nKSByZXR1cm4gJChbdGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmddKTtcbiAgICAgICAgcmV0dXJuICQoW10pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJChbXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dEFsbChzZWxlY3Rvcikge1xuICAgICAgY29uc3QgbmV4dEVscyA9IFtdO1xuICAgICAgbGV0IGVsID0gdGhpc1swXTtcbiAgICAgIGlmICghZWwpIHJldHVybiAkKFtdKTtcblxuICAgICAgd2hpbGUgKGVsLm5leHRFbGVtZW50U2libGluZykge1xuICAgICAgICBjb25zdCBuZXh0ID0gZWwubmV4dEVsZW1lbnRTaWJsaW5nOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgaWYgKCQobmV4dCkuaXMoc2VsZWN0b3IpKSBuZXh0RWxzLnB1c2gobmV4dCk7XG4gICAgICAgIH0gZWxzZSBuZXh0RWxzLnB1c2gobmV4dCk7XG5cbiAgICAgICAgZWwgPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJChuZXh0RWxzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmV2KHNlbGVjdG9yKSB7XG4gICAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpc1swXTtcblxuICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICBpZiAoZWwucHJldmlvdXNFbGVtZW50U2libGluZyAmJiAkKGVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpLmlzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgcmV0dXJuICQoW2VsLnByZXZpb3VzRWxlbWVudFNpYmxpbmddKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gJChbXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWwucHJldmlvdXNFbGVtZW50U2libGluZykgcmV0dXJuICQoW2VsLnByZXZpb3VzRWxlbWVudFNpYmxpbmddKTtcbiAgICAgICAgcmV0dXJuICQoW10pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJChbXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJldkFsbChzZWxlY3Rvcikge1xuICAgICAgY29uc3QgcHJldkVscyA9IFtdO1xuICAgICAgbGV0IGVsID0gdGhpc1swXTtcbiAgICAgIGlmICghZWwpIHJldHVybiAkKFtdKTtcblxuICAgICAgd2hpbGUgKGVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgY29uc3QgcHJldiA9IGVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICBpZiAoJChwcmV2KS5pcyhzZWxlY3RvcikpIHByZXZFbHMucHVzaChwcmV2KTtcbiAgICAgICAgfSBlbHNlIHByZXZFbHMucHVzaChwcmV2KTtcblxuICAgICAgICBlbCA9IHByZXY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkKHByZXZFbHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcmVudChzZWxlY3Rvcikge1xuICAgICAgY29uc3QgcGFyZW50cyA9IFtdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpc1tpXS5wYXJlbnROb2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzW2ldLnBhcmVudE5vZGUpLmlzKHNlbGVjdG9yKSkgcGFyZW50cy5wdXNoKHRoaXNbaV0ucGFyZW50Tm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudHMucHVzaCh0aGlzW2ldLnBhcmVudE5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gJChwYXJlbnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJlbnRzKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBwYXJlbnRzID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSB0aGlzW2ldLnBhcmVudE5vZGU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICBpZiAoJChwYXJlbnQpLmlzKHNlbGVjdG9yKSkgcGFyZW50cy5wdXNoKHBhcmVudCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudHMucHVzaChwYXJlbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkKHBhcmVudHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsb3Nlc3Qoc2VsZWN0b3IpIHtcbiAgICAgIGxldCBjbG9zZXN0ID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gJChbXSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghY2xvc2VzdC5pcyhzZWxlY3RvcikpIHtcbiAgICAgICAgY2xvc2VzdCA9IGNsb3Nlc3QucGFyZW50cyhzZWxlY3RvcikuZXEoMCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjbG9zZXN0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmQoc2VsZWN0b3IpIHtcbiAgICAgIGNvbnN0IGZvdW5kRWxlbWVudHMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gdGhpc1tpXS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGZvdW5kLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgZm91bmRFbGVtZW50cy5wdXNoKGZvdW5kW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gJChmb3VuZEVsZW1lbnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGlsZHJlbihzZWxlY3Rvcikge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbXTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3QgY2hpbGROb2RlcyA9IHRoaXNbaV0uY2hpbGRyZW47XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaGlsZE5vZGVzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgaWYgKCFzZWxlY3RvciB8fCAkKGNoaWxkTm9kZXNbal0pLmlzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChjaGlsZE5vZGVzW2pdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuICQoY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpc1tpXS5wYXJlbnROb2RlKSB0aGlzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IE1ldGhvZHMgPSB7XG4gICAgICBhZGRDbGFzcyxcbiAgICAgIHJlbW92ZUNsYXNzLFxuICAgICAgaGFzQ2xhc3MsXG4gICAgICB0b2dnbGVDbGFzcyxcbiAgICAgIGF0dHIsXG4gICAgICByZW1vdmVBdHRyLFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgdHJhbnNpdGlvbixcbiAgICAgIG9uLFxuICAgICAgb2ZmLFxuICAgICAgdHJpZ2dlcixcbiAgICAgIHRyYW5zaXRpb25FbmQsXG4gICAgICBvdXRlcldpZHRoLFxuICAgICAgb3V0ZXJIZWlnaHQsXG4gICAgICBzdHlsZXMsXG4gICAgICBvZmZzZXQsXG4gICAgICBjc3MsXG4gICAgICBlYWNoLFxuICAgICAgaHRtbCxcbiAgICAgIHRleHQsXG4gICAgICBpcyxcbiAgICAgIGluZGV4LFxuICAgICAgZXEsXG4gICAgICBhcHBlbmQsXG4gICAgICBwcmVwZW5kLFxuICAgICAgbmV4dCxcbiAgICAgIG5leHRBbGwsXG4gICAgICBwcmV2LFxuICAgICAgcHJldkFsbCxcbiAgICAgIHBhcmVudCxcbiAgICAgIHBhcmVudHMsXG4gICAgICBjbG9zZXN0LFxuICAgICAgZmluZCxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgZmlsdGVyLFxuICAgICAgcmVtb3ZlXG4gICAgfTtcbiAgICBPYmplY3Qua2V5cyhNZXRob2RzKS5mb3JFYWNoKG1ldGhvZE5hbWUgPT4ge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCQuZm4sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IE1ldGhvZHNbbWV0aG9kTmFtZV0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGRlbGV0ZVByb3BzKG9iaikge1xuICAgICAgY29uc3Qgb2JqZWN0ID0gb2JqO1xuICAgICAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgb2JqZWN0W2tleV0gPSBudWxsO1xuICAgICAgICB9IGNhdGNoIChlKSB7Ly8gbm8gZ2V0dGVyIGZvciBvYmplY3RcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGVsZXRlIG9iamVjdFtrZXldO1xuICAgICAgICB9IGNhdGNoIChlKSB7Ly8gc29tZXRoaW5nIGdvdCB3cm9uZ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBuZXh0VGljayhjYWxsYmFjaywgZGVsYXkpIHtcbiAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGRlbGF5ID0gMDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoY2FsbGJhY2ssIGRlbGF5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3coKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDb21wdXRlZFN0eWxlJDEoZWwpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgbGV0IHN0eWxlO1xuXG4gICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghc3R5bGUgJiYgZWwuY3VycmVudFN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZWwuY3VycmVudFN0eWxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZWwuc3R5bGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUcmFuc2xhdGUoZWwsIGF4aXMpIHtcbiAgICAgIGlmIChheGlzID09PSB2b2lkIDApIHtcbiAgICAgICAgYXhpcyA9ICd4JztcbiAgICAgIH1cblxuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBsZXQgbWF0cml4O1xuICAgICAgbGV0IGN1clRyYW5zZm9ybTtcbiAgICAgIGxldCB0cmFuc2Zvcm1NYXRyaXg7XG4gICAgICBjb25zdCBjdXJTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUkMShlbCk7XG5cbiAgICAgIGlmICh3aW5kb3cuV2ViS2l0Q1NTTWF0cml4KSB7XG4gICAgICAgIGN1clRyYW5zZm9ybSA9IGN1clN0eWxlLnRyYW5zZm9ybSB8fCBjdXJTdHlsZS53ZWJraXRUcmFuc2Zvcm07XG5cbiAgICAgICAgaWYgKGN1clRyYW5zZm9ybS5zcGxpdCgnLCcpLmxlbmd0aCA+IDYpIHtcbiAgICAgICAgICBjdXJUcmFuc2Zvcm0gPSBjdXJUcmFuc2Zvcm0uc3BsaXQoJywgJykubWFwKGEgPT4gYS5yZXBsYWNlKCcsJywgJy4nKSkuam9pbignLCAnKTtcbiAgICAgICAgfSAvLyBTb21lIG9sZCB2ZXJzaW9ucyBvZiBXZWJraXQgY2hva2Ugd2hlbiAnbm9uZScgaXMgcGFzc2VkOyBwYXNzXG4gICAgICAgIC8vIGVtcHR5IHN0cmluZyBpbnN0ZWFkIGluIHRoaXMgY2FzZVxuXG5cbiAgICAgICAgdHJhbnNmb3JtTWF0cml4ID0gbmV3IHdpbmRvdy5XZWJLaXRDU1NNYXRyaXgoY3VyVHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IGN1clRyYW5zZm9ybSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuc2Zvcm1NYXRyaXggPSBjdXJTdHlsZS5Nb3pUcmFuc2Zvcm0gfHwgY3VyU3R5bGUuT1RyYW5zZm9ybSB8fCBjdXJTdHlsZS5Nc1RyYW5zZm9ybSB8fCBjdXJTdHlsZS5tc1RyYW5zZm9ybSB8fCBjdXJTdHlsZS50cmFuc2Zvcm0gfHwgY3VyU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgndHJhbnNmb3JtJykucmVwbGFjZSgndHJhbnNsYXRlKCcsICdtYXRyaXgoMSwgMCwgMCwgMSwnKTtcbiAgICAgICAgbWF0cml4ID0gdHJhbnNmb3JtTWF0cml4LnRvU3RyaW5nKCkuc3BsaXQoJywnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF4aXMgPT09ICd4Jykge1xuICAgICAgICAvLyBMYXRlc3QgQ2hyb21lIGFuZCB3ZWJraXRzIEZpeFxuICAgICAgICBpZiAod2luZG93LldlYktpdENTU01hdHJpeCkgY3VyVHJhbnNmb3JtID0gdHJhbnNmb3JtTWF0cml4Lm00MTsgLy8gQ3JhenkgSUUxMCBNYXRyaXhcbiAgICAgICAgZWxzZSBpZiAobWF0cml4Lmxlbmd0aCA9PT0gMTYpIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzEyXSk7IC8vIE5vcm1hbCBCcm93c2Vyc1xuICAgICAgICBlbHNlIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzRdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF4aXMgPT09ICd5Jykge1xuICAgICAgICAvLyBMYXRlc3QgQ2hyb21lIGFuZCB3ZWJraXRzIEZpeFxuICAgICAgICBpZiAod2luZG93LldlYktpdENTU01hdHJpeCkgY3VyVHJhbnNmb3JtID0gdHJhbnNmb3JtTWF0cml4Lm00MjsgLy8gQ3JhenkgSUUxMCBNYXRyaXhcbiAgICAgICAgZWxzZSBpZiAobWF0cml4Lmxlbmd0aCA9PT0gMTYpIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzEzXSk7IC8vIE5vcm1hbCBCcm93c2Vyc1xuICAgICAgICBlbHNlIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzVdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGN1clRyYW5zZm9ybSB8fCAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzT2JqZWN0JDEobykge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBvICE9PSBudWxsICYmIG8uY29uc3RydWN0b3IgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKSA9PT0gJ09iamVjdCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNOb2RlKG5vZGUpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiB3aW5kb3cuSFRNTEVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBub2RlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlICYmIChub2RlLm5vZGVUeXBlID09PSAxIHx8IG5vZGUubm9kZVR5cGUgPT09IDExKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRlbmQkMSgpIHtcbiAgICAgIGNvbnN0IHRvID0gT2JqZWN0KGFyZ3VtZW50cy5sZW5ndGggPD0gMCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXSk7XG4gICAgICBjb25zdCBub0V4dGVuZCA9IFsnX19wcm90b19fJywgJ2NvbnN0cnVjdG9yJywgJ3Byb3RvdHlwZSddO1xuXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBuZXh0U291cmNlID0gaSA8IDAgfHwgYXJndW1lbnRzLmxlbmd0aCA8PSBpID8gdW5kZWZpbmVkIDogYXJndW1lbnRzW2ldO1xuXG4gICAgICAgIGlmIChuZXh0U291cmNlICE9PSB1bmRlZmluZWQgJiYgbmV4dFNvdXJjZSAhPT0gbnVsbCAmJiAhaXNOb2RlKG5leHRTb3VyY2UpKSB7XG4gICAgICAgICAgY29uc3Qga2V5c0FycmF5ID0gT2JqZWN0LmtleXMoT2JqZWN0KG5leHRTb3VyY2UpKS5maWx0ZXIoa2V5ID0+IG5vRXh0ZW5kLmluZGV4T2Yoa2V5KSA8IDApO1xuXG4gICAgICAgICAgZm9yIChsZXQgbmV4dEluZGV4ID0gMCwgbGVuID0ga2V5c0FycmF5Lmxlbmd0aDsgbmV4dEluZGV4IDwgbGVuOyBuZXh0SW5kZXggKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgbmV4dEtleSA9IGtleXNBcnJheVtuZXh0SW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG5cbiAgICAgICAgICAgIGlmIChkZXNjICE9PSB1bmRlZmluZWQgJiYgZGVzYy5lbnVtZXJhYmxlKSB7XG4gICAgICAgICAgICAgIGlmIChpc09iamVjdCQxKHRvW25leHRLZXldKSAmJiBpc09iamVjdCQxKG5leHRTb3VyY2VbbmV4dEtleV0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRTb3VyY2VbbmV4dEtleV0uX19zd2lwZXJfXykge1xuICAgICAgICAgICAgICAgICAgdG9bbmV4dEtleV0gPSBuZXh0U291cmNlW25leHRLZXldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBleHRlbmQkMSh0b1tuZXh0S2V5XSwgbmV4dFNvdXJjZVtuZXh0S2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc09iamVjdCQxKHRvW25leHRLZXldKSAmJiBpc09iamVjdCQxKG5leHRTb3VyY2VbbmV4dEtleV0pKSB7XG4gICAgICAgICAgICAgICAgdG9bbmV4dEtleV0gPSB7fTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXh0U291cmNlW25leHRLZXldLl9fc3dpcGVyX18pIHtcbiAgICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZXh0ZW5kJDEodG9bbmV4dEtleV0sIG5leHRTb3VyY2VbbmV4dEtleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRvO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldENTU1Byb3BlcnR5KGVsLCB2YXJOYW1lLCB2YXJWYWx1ZSkge1xuICAgICAgZWwuc3R5bGUuc2V0UHJvcGVydHkodmFyTmFtZSwgdmFyVmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFuaW1hdGVDU1NNb2RlU2Nyb2xsKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgdGFyZ2V0UG9zaXRpb24sXG4gICAgICAgIHNpZGVcbiAgICAgIH0gPSBfcmVmO1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBjb25zdCBzdGFydFBvc2l0aW9uID0gLXN3aXBlci50cmFuc2xhdGU7XG4gICAgICBsZXQgc3RhcnRUaW1lID0gbnVsbDtcbiAgICAgIGxldCB0aW1lO1xuICAgICAgY29uc3QgZHVyYXRpb24gPSBzd2lwZXIucGFyYW1zLnNwZWVkO1xuICAgICAgc3dpcGVyLndyYXBwZXJFbC5zdHlsZS5zY3JvbGxTbmFwVHlwZSA9ICdub25lJztcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShzd2lwZXIuY3NzTW9kZUZyYW1lSUQpO1xuICAgICAgY29uc3QgZGlyID0gdGFyZ2V0UG9zaXRpb24gPiBzdGFydFBvc2l0aW9uID8gJ25leHQnIDogJ3ByZXYnO1xuXG4gICAgICBjb25zdCBpc091dE9mQm91bmQgPSAoY3VycmVudCwgdGFyZ2V0KSA9PiB7XG4gICAgICAgIHJldHVybiBkaXIgPT09ICduZXh0JyAmJiBjdXJyZW50ID49IHRhcmdldCB8fCBkaXIgPT09ICdwcmV2JyAmJiBjdXJyZW50IDw9IHRhcmdldDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGFuaW1hdGUgPSAoKSA9PiB7XG4gICAgICAgIHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICBpZiAoc3RhcnRUaW1lID09PSBudWxsKSB7XG4gICAgICAgICAgc3RhcnRUaW1lID0gdGltZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb2dyZXNzID0gTWF0aC5tYXgoTWF0aC5taW4oKHRpbWUgLSBzdGFydFRpbWUpIC8gZHVyYXRpb24sIDEpLCAwKTtcbiAgICAgICAgY29uc3QgZWFzZVByb2dyZXNzID0gMC41IC0gTWF0aC5jb3MocHJvZ3Jlc3MgKiBNYXRoLlBJKSAvIDI7XG4gICAgICAgIGxldCBjdXJyZW50UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uICsgZWFzZVByb2dyZXNzICogKHRhcmdldFBvc2l0aW9uIC0gc3RhcnRQb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGlzT3V0T2ZCb3VuZChjdXJyZW50UG9zaXRpb24sIHRhcmdldFBvc2l0aW9uKSkge1xuICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbiA9IHRhcmdldFBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLndyYXBwZXJFbC5zY3JvbGxUbyh7XG4gICAgICAgICAgW3NpZGVdOiBjdXJyZW50UG9zaXRpb25cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGlzT3V0T2ZCb3VuZChjdXJyZW50UG9zaXRpb24sIHRhcmdldFBvc2l0aW9uKSkge1xuICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICBzd2lwZXIud3JhcHBlckVsLnN0eWxlLnNjcm9sbFNuYXBUeXBlID0gJyc7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBzd2lwZXIud3JhcHBlckVsLnN0eWxlLm92ZXJmbG93ID0gJyc7XG4gICAgICAgICAgICBzd2lwZXIud3JhcHBlckVsLnNjcm9sbFRvKHtcbiAgICAgICAgICAgICAgW3NpZGVdOiBjdXJyZW50UG9zaXRpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShzd2lwZXIuY3NzTW9kZUZyYW1lSUQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5jc3NNb2RlRnJhbWVJRCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgICB9O1xuXG4gICAgICBhbmltYXRlKCk7XG4gICAgfVxuXG4gICAgbGV0IHN1cHBvcnQ7XG5cbiAgICBmdW5jdGlvbiBjYWxjU3VwcG9ydCgpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc21vb3RoU2Nyb2xsOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ3Njcm9sbEJlaGF2aW9yJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUsXG4gICAgICAgIHRvdWNoOiAhISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgd2luZG93LkRvY3VtZW50VG91Y2ggJiYgZG9jdW1lbnQgaW5zdGFuY2VvZiB3aW5kb3cuRG9jdW1lbnRUb3VjaCksXG4gICAgICAgIHBhc3NpdmVMaXN0ZW5lcjogZnVuY3Rpb24gY2hlY2tQYXNzaXZlTGlzdGVuZXIoKSB7XG4gICAgICAgICAgbGV0IHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgIHN1cHBvcnRzUGFzc2l2ZSA9IHRydWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdFBhc3NpdmVMaXN0ZW5lcicsIG51bGwsIG9wdHMpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHsvLyBObyBzdXBwb3J0XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHN1cHBvcnRzUGFzc2l2ZTtcbiAgICAgICAgfSgpLFxuICAgICAgICBnZXN0dXJlczogZnVuY3Rpb24gY2hlY2tHZXN0dXJlcygpIHtcbiAgICAgICAgICByZXR1cm4gJ29uZ2VzdHVyZXN0YXJ0JyBpbiB3aW5kb3c7XG4gICAgICAgIH0oKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTdXBwb3J0KCkge1xuICAgICAgaWYgKCFzdXBwb3J0KSB7XG4gICAgICAgIHN1cHBvcnQgPSBjYWxjU3VwcG9ydCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3VwcG9ydDtcbiAgICB9XG5cbiAgICBsZXQgZGV2aWNlQ2FjaGVkO1xuXG4gICAgZnVuY3Rpb24gY2FsY0RldmljZShfdGVtcCkge1xuICAgICAgbGV0IHtcbiAgICAgICAgdXNlckFnZW50XG4gICAgICB9ID0gX3RlbXAgPT09IHZvaWQgMCA/IHt9IDogX3RlbXA7XG4gICAgICBjb25zdCBzdXBwb3J0ID0gZ2V0U3VwcG9ydCgpO1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBjb25zdCBwbGF0Zm9ybSA9IHdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm07XG4gICAgICBjb25zdCB1YSA9IHVzZXJBZ2VudCB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICAgIGNvbnN0IGRldmljZSA9IHtcbiAgICAgICAgaW9zOiBmYWxzZSxcbiAgICAgICAgYW5kcm9pZDogZmFsc2VcbiAgICAgIH07XG4gICAgICBjb25zdCBzY3JlZW5XaWR0aCA9IHdpbmRvdy5zY3JlZW4ud2lkdGg7XG4gICAgICBjb25zdCBzY3JlZW5IZWlnaHQgPSB3aW5kb3cuc2NyZWVuLmhlaWdodDtcbiAgICAgIGNvbnN0IGFuZHJvaWQgPSB1YS5tYXRjaCgvKEFuZHJvaWQpOz9bXFxzXFwvXSsoW1xcZC5dKyk/Lyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgbGV0IGlwYWQgPSB1YS5tYXRjaCgvKGlQYWQpLipPU1xccyhbXFxkX10rKS8pO1xuICAgICAgY29uc3QgaXBvZCA9IHVhLm1hdGNoKC8oaVBvZCkoLipPU1xccyhbXFxkX10rKSk/Lyk7XG4gICAgICBjb25zdCBpcGhvbmUgPSAhaXBhZCAmJiB1YS5tYXRjaCgvKGlQaG9uZVxcc09TfGlPUylcXHMoW1xcZF9dKykvKTtcbiAgICAgIGNvbnN0IHdpbmRvd3MgPSBwbGF0Zm9ybSA9PT0gJ1dpbjMyJztcbiAgICAgIGxldCBtYWNvcyA9IHBsYXRmb3JtID09PSAnTWFjSW50ZWwnOyAvLyBpUGFkT3MgMTMgZml4XG5cbiAgICAgIGNvbnN0IGlQYWRTY3JlZW5zID0gWycxMDI0eDEzNjYnLCAnMTM2NngxMDI0JywgJzgzNHgxMTk0JywgJzExOTR4ODM0JywgJzgzNHgxMTEyJywgJzExMTJ4ODM0JywgJzc2OHgxMDI0JywgJzEwMjR4NzY4JywgJzgyMHgxMTgwJywgJzExODB4ODIwJywgJzgxMHgxMDgwJywgJzEwODB4ODEwJ107XG5cbiAgICAgIGlmICghaXBhZCAmJiBtYWNvcyAmJiBzdXBwb3J0LnRvdWNoICYmIGlQYWRTY3JlZW5zLmluZGV4T2YoYCR7c2NyZWVuV2lkdGh9eCR7c2NyZWVuSGVpZ2h0fWApID49IDApIHtcbiAgICAgICAgaXBhZCA9IHVhLm1hdGNoKC8oVmVyc2lvbilcXC8oW1xcZC5dKykvKTtcbiAgICAgICAgaWYgKCFpcGFkKSBpcGFkID0gWzAsIDEsICcxM18wXzAnXTtcbiAgICAgICAgbWFjb3MgPSBmYWxzZTtcbiAgICAgIH0gLy8gQW5kcm9pZFxuXG5cbiAgICAgIGlmIChhbmRyb2lkICYmICF3aW5kb3dzKSB7XG4gICAgICAgIGRldmljZS5vcyA9ICdhbmRyb2lkJztcbiAgICAgICAgZGV2aWNlLmFuZHJvaWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXBhZCB8fCBpcGhvbmUgfHwgaXBvZCkge1xuICAgICAgICBkZXZpY2Uub3MgPSAnaW9zJztcbiAgICAgICAgZGV2aWNlLmlvcyA9IHRydWU7XG4gICAgICB9IC8vIEV4cG9ydCBvYmplY3RcblxuXG4gICAgICByZXR1cm4gZGV2aWNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldERldmljZShvdmVycmlkZXMpIHtcbiAgICAgIGlmIChvdmVycmlkZXMgPT09IHZvaWQgMCkge1xuICAgICAgICBvdmVycmlkZXMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFkZXZpY2VDYWNoZWQpIHtcbiAgICAgICAgZGV2aWNlQ2FjaGVkID0gY2FsY0RldmljZShvdmVycmlkZXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGV2aWNlQ2FjaGVkO1xuICAgIH1cblxuICAgIGxldCBicm93c2VyO1xuXG4gICAgZnVuY3Rpb24gY2FsY0Jyb3dzZXIoKSB7XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcblxuICAgICAgZnVuY3Rpb24gaXNTYWZhcmkoKSB7XG4gICAgICAgIGNvbnN0IHVhID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIHVhLmluZGV4T2YoJ3NhZmFyaScpID49IDAgJiYgdWEuaW5kZXhPZignY2hyb21lJykgPCAwICYmIHVhLmluZGV4T2YoJ2FuZHJvaWQnKSA8IDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlzU2FmYXJpOiBpc1NhZmFyaSgpLFxuICAgICAgICBpc1dlYlZpZXc6IC8oaVBob25lfGlQb2R8aVBhZCkuKkFwcGxlV2ViS2l0KD8hLipTYWZhcmkpL2kudGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QnJvd3NlcigpIHtcbiAgICAgIGlmICghYnJvd3Nlcikge1xuICAgICAgICBicm93c2VyID0gY2FsY0Jyb3dzZXIoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJyb3dzZXI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUmVzaXplKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgb24sXG4gICAgICAgIGVtaXRcbiAgICAgIH0gPSBfcmVmO1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBsZXQgb2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgbGV0IGFuaW1hdGlvbkZyYW1lID0gbnVsbDtcblxuICAgICAgY29uc3QgcmVzaXplSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCB8fCAhc3dpcGVyLmluaXRpYWxpemVkKSByZXR1cm47XG4gICAgICAgIGVtaXQoJ2JlZm9yZVJlc2l6ZScpO1xuICAgICAgICBlbWl0KCdyZXNpemUnKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGNyZWF0ZU9ic2VydmVyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkIHx8ICFzd2lwZXIuaW5pdGlhbGl6ZWQpIHJldHVybjtcbiAgICAgICAgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoZW50cmllcyA9PiB7XG4gICAgICAgICAgYW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgIGhlaWdodFxuICAgICAgICAgICAgfSA9IHN3aXBlcjtcbiAgICAgICAgICAgIGxldCBuZXdXaWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgbGV0IG5ld0hlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChfcmVmMiA9PiB7XG4gICAgICAgICAgICAgIGxldCB7XG4gICAgICAgICAgICAgICAgY29udGVudEJveFNpemUsXG4gICAgICAgICAgICAgICAgY29udGVudFJlY3QsXG4gICAgICAgICAgICAgICAgdGFyZ2V0XG4gICAgICAgICAgICAgIH0gPSBfcmVmMjtcbiAgICAgICAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQgIT09IHN3aXBlci5lbCkgcmV0dXJuO1xuICAgICAgICAgICAgICBuZXdXaWR0aCA9IGNvbnRlbnRSZWN0ID8gY29udGVudFJlY3Qud2lkdGggOiAoY29udGVudEJveFNpemVbMF0gfHwgY29udGVudEJveFNpemUpLmlubGluZVNpemU7XG4gICAgICAgICAgICAgIG5ld0hlaWdodCA9IGNvbnRlbnRSZWN0ID8gY29udGVudFJlY3QuaGVpZ2h0IDogKGNvbnRlbnRCb3hTaXplWzBdIHx8IGNvbnRlbnRCb3hTaXplKS5ibG9ja1NpemU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKG5ld1dpZHRoICE9PSB3aWR0aCB8fCBuZXdIZWlnaHQgIT09IGhlaWdodCkge1xuICAgICAgICAgICAgICByZXNpemVIYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHN3aXBlci5lbCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCByZW1vdmVPYnNlcnZlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYnNlcnZlciAmJiBvYnNlcnZlci51bm9ic2VydmUgJiYgc3dpcGVyLmVsKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIudW5vYnNlcnZlKHN3aXBlci5lbCk7XG4gICAgICAgICAgb2JzZXJ2ZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBvcmllbnRhdGlvbkNoYW5nZUhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQgfHwgIXN3aXBlci5pbml0aWFsaXplZCkgcmV0dXJuO1xuICAgICAgICBlbWl0KCdvcmllbnRhdGlvbmNoYW5nZScpO1xuICAgICAgfTtcblxuICAgICAgb24oJ2luaXQnLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLnJlc2l6ZU9ic2VydmVyICYmIHR5cGVvZiB3aW5kb3cuUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY3JlYXRlT2JzZXJ2ZXIoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplSGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIG9yaWVudGF0aW9uQ2hhbmdlSGFuZGxlcik7XG4gICAgICB9KTtcbiAgICAgIG9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICByZW1vdmVPYnNlcnZlcigpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplSGFuZGxlcik7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIG9yaWVudGF0aW9uQ2hhbmdlSGFuZGxlcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBPYnNlcnZlcihfcmVmKSB7XG4gICAgICBsZXQge1xuICAgICAgICBzd2lwZXIsXG4gICAgICAgIGV4dGVuZFBhcmFtcyxcbiAgICAgICAgb24sXG4gICAgICAgIGVtaXRcbiAgICAgIH0gPSBfcmVmO1xuICAgICAgY29uc3Qgb2JzZXJ2ZXJzID0gW107XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcblxuICAgICAgY29uc3QgYXR0YWNoID0gZnVuY3Rpb24gKHRhcmdldCwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucyA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgT2JzZXJ2ZXJGdW5jID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYmtpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE9ic2VydmVyRnVuYyhtdXRhdGlvbnMgPT4ge1xuICAgICAgICAgIC8vIFRoZSBvYnNlcnZlclVwZGF0ZSBldmVudCBzaG91bGQgb25seSBiZSB0cmlnZ2VyZWRcbiAgICAgICAgICAvLyBvbmNlIGRlc3BpdGUgdGhlIG51bWJlciBvZiBtdXRhdGlvbnMuICBBZGRpdGlvbmFsXG4gICAgICAgICAgLy8gdHJpZ2dlcnMgYXJlIHJlZHVuZGFudCBhbmQgYXJlIHZlcnkgY29zdGx5XG4gICAgICAgICAgaWYgKG11dGF0aW9ucy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIGVtaXQoJ29ic2VydmVyVXBkYXRlJywgbXV0YXRpb25zWzBdKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBvYnNlcnZlclVwZGF0ZSA9IGZ1bmN0aW9uIG9ic2VydmVyVXBkYXRlKCkge1xuICAgICAgICAgICAgZW1pdCgnb2JzZXJ2ZXJVcGRhdGUnLCBtdXRhdGlvbnNbMF0pO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShvYnNlcnZlclVwZGF0ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KG9ic2VydmVyVXBkYXRlLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCwge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IHR5cGVvZiBvcHRpb25zLmF0dHJpYnV0ZXMgPT09ICd1bmRlZmluZWQnID8gdHJ1ZSA6IG9wdGlvbnMuYXR0cmlidXRlcyxcbiAgICAgICAgICBjaGlsZExpc3Q6IHR5cGVvZiBvcHRpb25zLmNoaWxkTGlzdCA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogb3B0aW9ucy5jaGlsZExpc3QsXG4gICAgICAgICAgY2hhcmFjdGVyRGF0YTogdHlwZW9mIG9wdGlvbnMuY2hhcmFjdGVyRGF0YSA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogb3B0aW9ucy5jaGFyYWN0ZXJEYXRhXG4gICAgICAgIH0pO1xuICAgICAgICBvYnNlcnZlcnMucHVzaChvYnNlcnZlcik7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMub2JzZXJ2ZXIpIHJldHVybjtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5vYnNlcnZlUGFyZW50cykge1xuICAgICAgICAgIGNvbnN0IGNvbnRhaW5lclBhcmVudHMgPSBzd2lwZXIuJGVsLnBhcmVudHMoKTtcblxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGFpbmVyUGFyZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYXR0YWNoKGNvbnRhaW5lclBhcmVudHNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBPYnNlcnZlIGNvbnRhaW5lclxuXG5cbiAgICAgICAgYXR0YWNoKHN3aXBlci4kZWxbMF0sIHtcbiAgICAgICAgICBjaGlsZExpc3Q6IHN3aXBlci5wYXJhbXMub2JzZXJ2ZVNsaWRlQ2hpbGRyZW5cbiAgICAgICAgfSk7IC8vIE9ic2VydmUgd3JhcHBlclxuXG4gICAgICAgIGF0dGFjaChzd2lwZXIuJHdyYXBwZXJFbFswXSwge1xuICAgICAgICAgIGF0dHJpYnV0ZXM6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgZGVzdHJveSA9ICgpID0+IHtcbiAgICAgICAgb2JzZXJ2ZXJzLmZvckVhY2gob2JzZXJ2ZXIgPT4ge1xuICAgICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVycy5zcGxpY2UoMCwgb2JzZXJ2ZXJzLmxlbmd0aCk7XG4gICAgICB9O1xuXG4gICAgICBleHRlbmRQYXJhbXMoe1xuICAgICAgICBvYnNlcnZlcjogZmFsc2UsXG4gICAgICAgIG9ic2VydmVQYXJlbnRzOiBmYWxzZSxcbiAgICAgICAgb2JzZXJ2ZVNsaWRlQ2hpbGRyZW46IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIG9uKCdpbml0JywgaW5pdCk7XG4gICAgICBvbignZGVzdHJveScsIGRlc3Ryb3kpO1xuICAgIH1cblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVyc2NvcmUtZGFuZ2xlICovXG4gICAgdmFyIGV2ZW50c0VtaXR0ZXIgPSB7XG4gICAgICBvbihldmVudHMsIGhhbmRsZXIsIHByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzIHx8IHNlbGYuZGVzdHJveWVkKSByZXR1cm4gc2VsZjtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gc2VsZjtcbiAgICAgICAgY29uc3QgbWV0aG9kID0gcHJpb3JpdHkgPyAndW5zaGlmdCcgOiAncHVzaCc7XG4gICAgICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdKSBzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0gPSBbXTtcbiAgICAgICAgICBzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF1bbWV0aG9kXShoYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcblxuICAgICAgb25jZShldmVudHMsIGhhbmRsZXIsIHByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzIHx8IHNlbGYuZGVzdHJveWVkKSByZXR1cm4gc2VsZjtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gc2VsZjtcblxuICAgICAgICBmdW5jdGlvbiBvbmNlSGFuZGxlcigpIHtcbiAgICAgICAgICBzZWxmLm9mZihldmVudHMsIG9uY2VIYW5kbGVyKTtcblxuICAgICAgICAgIGlmIChvbmNlSGFuZGxlci5fX2VtaXR0ZXJQcm94eSkge1xuICAgICAgICAgICAgZGVsZXRlIG9uY2VIYW5kbGVyLl9fZW1pdHRlclByb3h5O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgb25jZUhhbmRsZXIuX19lbWl0dGVyUHJveHkgPSBoYW5kbGVyO1xuICAgICAgICByZXR1cm4gc2VsZi5vbihldmVudHMsIG9uY2VIYW5kbGVyLCBwcmlvcml0eSk7XG4gICAgICB9LFxuXG4gICAgICBvbkFueShoYW5kbGVyLCBwcmlvcml0eSkge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFzZWxmLmV2ZW50c0xpc3RlbmVycyB8fCBzZWxmLmRlc3Ryb3llZCkgcmV0dXJuIHNlbGY7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHNlbGY7XG4gICAgICAgIGNvbnN0IG1ldGhvZCA9IHByaW9yaXR5ID8gJ3Vuc2hpZnQnIDogJ3B1c2gnO1xuXG4gICAgICAgIGlmIChzZWxmLmV2ZW50c0FueUxpc3RlbmVycy5pbmRleE9mKGhhbmRsZXIpIDwgMCkge1xuICAgICAgICAgIHNlbGYuZXZlbnRzQW55TGlzdGVuZXJzW21ldGhvZF0oaGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0sXG5cbiAgICAgIG9mZkFueShoYW5kbGVyKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzIHx8IHNlbGYuZGVzdHJveWVkKSByZXR1cm4gc2VsZjtcbiAgICAgICAgaWYgKCFzZWxmLmV2ZW50c0FueUxpc3RlbmVycykgcmV0dXJuIHNlbGY7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gc2VsZi5ldmVudHNBbnlMaXN0ZW5lcnMuaW5kZXhPZihoYW5kbGVyKTtcblxuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIHNlbGYuZXZlbnRzQW55TGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0sXG5cbiAgICAgIG9mZihldmVudHMsIGhhbmRsZXIpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnMgfHwgc2VsZi5kZXN0cm95ZWQpIHJldHVybiBzZWxmO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzKSByZXR1cm4gc2VsZjtcbiAgICAgICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdID0gW107XG4gICAgICAgICAgfSBlbHNlIGlmIChzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0pIHtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XS5mb3JFYWNoKChldmVudEhhbmRsZXIsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChldmVudEhhbmRsZXIgPT09IGhhbmRsZXIgfHwgZXZlbnRIYW5kbGVyLl9fZW1pdHRlclByb3h5ICYmIGV2ZW50SGFuZGxlci5fX2VtaXR0ZXJQcm94eSA9PT0gaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0sXG5cbiAgICAgIGVtaXQoKSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzIHx8IHNlbGYuZGVzdHJveWVkKSByZXR1cm4gc2VsZjtcbiAgICAgICAgaWYgKCFzZWxmLmV2ZW50c0xpc3RlbmVycykgcmV0dXJuIHNlbGY7XG4gICAgICAgIGxldCBldmVudHM7XG4gICAgICAgIGxldCBkYXRhO1xuICAgICAgICBsZXQgY29udGV4dDtcblxuICAgICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgICBhcmdzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdzdHJpbmcnIHx8IEFycmF5LmlzQXJyYXkoYXJnc1swXSkpIHtcbiAgICAgICAgICBldmVudHMgPSBhcmdzWzBdO1xuICAgICAgICAgIGRhdGEgPSBhcmdzLnNsaWNlKDEsIGFyZ3MubGVuZ3RoKTtcbiAgICAgICAgICBjb250ZXh0ID0gc2VsZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmVudHMgPSBhcmdzWzBdLmV2ZW50cztcbiAgICAgICAgICBkYXRhID0gYXJnc1swXS5kYXRhO1xuICAgICAgICAgIGNvbnRleHQgPSBhcmdzWzBdLmNvbnRleHQgfHwgc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEudW5zaGlmdChjb250ZXh0KTtcbiAgICAgICAgY29uc3QgZXZlbnRzQXJyYXkgPSBBcnJheS5pc0FycmF5KGV2ZW50cykgPyBldmVudHMgOiBldmVudHMuc3BsaXQoJyAnKTtcbiAgICAgICAgZXZlbnRzQXJyYXkuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgICAgaWYgKHNlbGYuZXZlbnRzQW55TGlzdGVuZXJzICYmIHNlbGYuZXZlbnRzQW55TGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VsZi5ldmVudHNBbnlMaXN0ZW5lcnMuZm9yRWFjaChldmVudEhhbmRsZXIgPT4ge1xuICAgICAgICAgICAgICBldmVudEhhbmRsZXIuYXBwbHkoY29udGV4dCwgW2V2ZW50LCAuLi5kYXRhXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VsZi5ldmVudHNMaXN0ZW5lcnMgJiYgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgICAgICAgICBzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0uZm9yRWFjaChldmVudEhhbmRsZXIgPT4ge1xuICAgICAgICAgICAgICBldmVudEhhbmRsZXIuYXBwbHkoY29udGV4dCwgZGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgIH07XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTaXplKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGxldCB3aWR0aDtcbiAgICAgIGxldCBoZWlnaHQ7XG4gICAgICBjb25zdCAkZWwgPSBzd2lwZXIuJGVsO1xuXG4gICAgICBpZiAodHlwZW9mIHN3aXBlci5wYXJhbXMud2lkdGggIT09ICd1bmRlZmluZWQnICYmIHN3aXBlci5wYXJhbXMud2lkdGggIT09IG51bGwpIHtcbiAgICAgICAgd2lkdGggPSBzd2lwZXIucGFyYW1zLndpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkdGggPSAkZWxbMF0uY2xpZW50V2lkdGg7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygc3dpcGVyLnBhcmFtcy5oZWlnaHQgIT09ICd1bmRlZmluZWQnICYmIHN3aXBlci5wYXJhbXMuaGVpZ2h0ICE9PSBudWxsKSB7XG4gICAgICAgIGhlaWdodCA9IHN3aXBlci5wYXJhbXMuaGVpZ2h0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGVpZ2h0ID0gJGVsWzBdLmNsaWVudEhlaWdodDtcbiAgICAgIH1cblxuICAgICAgaWYgKHdpZHRoID09PSAwICYmIHN3aXBlci5pc0hvcml6b250YWwoKSB8fCBoZWlnaHQgPT09IDAgJiYgc3dpcGVyLmlzVmVydGljYWwoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIFN1YnRyYWN0IHBhZGRpbmdzXG5cblxuICAgICAgd2lkdGggPSB3aWR0aCAtIHBhcnNlSW50KCRlbC5jc3MoJ3BhZGRpbmctbGVmdCcpIHx8IDAsIDEwKSAtIHBhcnNlSW50KCRlbC5jc3MoJ3BhZGRpbmctcmlnaHQnKSB8fCAwLCAxMCk7XG4gICAgICBoZWlnaHQgPSBoZWlnaHQgLSBwYXJzZUludCgkZWwuY3NzKCdwYWRkaW5nLXRvcCcpIHx8IDAsIDEwKSAtIHBhcnNlSW50KCRlbC5jc3MoJ3BhZGRpbmctYm90dG9tJykgfHwgMCwgMTApO1xuICAgICAgaWYgKE51bWJlci5pc05hTih3aWR0aCkpIHdpZHRoID0gMDtcbiAgICAgIGlmIChOdW1iZXIuaXNOYU4oaGVpZ2h0KSkgaGVpZ2h0ID0gMDtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLCB7XG4gICAgICAgIHdpZHRoLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIHNpemU6IHN3aXBlci5pc0hvcml6b250YWwoKSA/IHdpZHRoIDogaGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTbGlkZXMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuXG4gICAgICBmdW5jdGlvbiBnZXREaXJlY3Rpb25MYWJlbChwcm9wZXJ0eSkge1xuICAgICAgICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgICAgICB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAnd2lkdGgnOiAnaGVpZ2h0JyxcbiAgICAgICAgICAnbWFyZ2luLXRvcCc6ICdtYXJnaW4tbGVmdCcsXG4gICAgICAgICAgJ21hcmdpbi1ib3R0b20gJzogJ21hcmdpbi1yaWdodCcsXG4gICAgICAgICAgJ21hcmdpbi1sZWZ0JzogJ21hcmdpbi10b3AnLFxuICAgICAgICAgICdtYXJnaW4tcmlnaHQnOiAnbWFyZ2luLWJvdHRvbScsXG4gICAgICAgICAgJ3BhZGRpbmctbGVmdCc6ICdwYWRkaW5nLXRvcCcsXG4gICAgICAgICAgJ3BhZGRpbmctcmlnaHQnOiAncGFkZGluZy1ib3R0b20nLFxuICAgICAgICAgICdtYXJnaW5SaWdodCc6ICdtYXJnaW5Cb3R0b20nXG4gICAgICAgIH1bcHJvcGVydHldO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnZXREaXJlY3Rpb25Qcm9wZXJ0eVZhbHVlKG5vZGUsIGxhYmVsKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KG5vZGUuZ2V0UHJvcGVydHlWYWx1ZShnZXREaXJlY3Rpb25MYWJlbChsYWJlbCkpIHx8IDApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICAgICAgY29uc3Qge1xuICAgICAgICAkd3JhcHBlckVsLFxuICAgICAgICBzaXplOiBzd2lwZXJTaXplLFxuICAgICAgICBydGxUcmFuc2xhdGU6IHJ0bCxcbiAgICAgICAgd3JvbmdSVExcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBjb25zdCBpc1ZpcnR1YWwgPSBzd2lwZXIudmlydHVhbCAmJiBwYXJhbXMudmlydHVhbC5lbmFibGVkO1xuICAgICAgY29uc3QgcHJldmlvdXNTbGlkZXNMZW5ndGggPSBpc1ZpcnR1YWwgPyBzd2lwZXIudmlydHVhbC5zbGlkZXMubGVuZ3RoIDogc3dpcGVyLnNsaWRlcy5sZW5ndGg7XG4gICAgICBjb25zdCBzbGlkZXMgPSAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtzd2lwZXIucGFyYW1zLnNsaWRlQ2xhc3N9YCk7XG4gICAgICBjb25zdCBzbGlkZXNMZW5ndGggPSBpc1ZpcnR1YWwgPyBzd2lwZXIudmlydHVhbC5zbGlkZXMubGVuZ3RoIDogc2xpZGVzLmxlbmd0aDtcbiAgICAgIGxldCBzbmFwR3JpZCA9IFtdO1xuICAgICAgY29uc3Qgc2xpZGVzR3JpZCA9IFtdO1xuICAgICAgY29uc3Qgc2xpZGVzU2l6ZXNHcmlkID0gW107XG4gICAgICBsZXQgb2Zmc2V0QmVmb3JlID0gcGFyYW1zLnNsaWRlc09mZnNldEJlZm9yZTtcblxuICAgICAgaWYgKHR5cGVvZiBvZmZzZXRCZWZvcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb2Zmc2V0QmVmb3JlID0gcGFyYW1zLnNsaWRlc09mZnNldEJlZm9yZS5jYWxsKHN3aXBlcik7XG4gICAgICB9XG5cbiAgICAgIGxldCBvZmZzZXRBZnRlciA9IHBhcmFtcy5zbGlkZXNPZmZzZXRBZnRlcjtcblxuICAgICAgaWYgKHR5cGVvZiBvZmZzZXRBZnRlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvZmZzZXRBZnRlciA9IHBhcmFtcy5zbGlkZXNPZmZzZXRBZnRlci5jYWxsKHN3aXBlcik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByZXZpb3VzU25hcEdyaWRMZW5ndGggPSBzd2lwZXIuc25hcEdyaWQubGVuZ3RoO1xuICAgICAgY29uc3QgcHJldmlvdXNTbGlkZXNHcmlkTGVuZ3RoID0gc3dpcGVyLnNsaWRlc0dyaWQubGVuZ3RoO1xuICAgICAgbGV0IHNwYWNlQmV0d2VlbiA9IHBhcmFtcy5zcGFjZUJldHdlZW47XG4gICAgICBsZXQgc2xpZGVQb3NpdGlvbiA9IC1vZmZzZXRCZWZvcmU7XG4gICAgICBsZXQgcHJldlNsaWRlU2l6ZSA9IDA7XG4gICAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgICBpZiAodHlwZW9mIHN3aXBlclNpemUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzcGFjZUJldHdlZW4gPT09ICdzdHJpbmcnICYmIHNwYWNlQmV0d2Vlbi5pbmRleE9mKCclJykgPj0gMCkge1xuICAgICAgICBzcGFjZUJldHdlZW4gPSBwYXJzZUZsb2F0KHNwYWNlQmV0d2Vlbi5yZXBsYWNlKCclJywgJycpKSAvIDEwMCAqIHN3aXBlclNpemU7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci52aXJ0dWFsU2l6ZSA9IC1zcGFjZUJldHdlZW47IC8vIHJlc2V0IG1hcmdpbnNcblxuICAgICAgaWYgKHJ0bCkgc2xpZGVzLmNzcyh7XG4gICAgICAgIG1hcmdpbkxlZnQ6ICcnLFxuICAgICAgICBtYXJnaW5Cb3R0b206ICcnLFxuICAgICAgICBtYXJnaW5Ub3A6ICcnXG4gICAgICB9KTtlbHNlIHNsaWRlcy5jc3Moe1xuICAgICAgICBtYXJnaW5SaWdodDogJycsXG4gICAgICAgIG1hcmdpbkJvdHRvbTogJycsXG4gICAgICAgIG1hcmdpblRvcDogJydcbiAgICAgIH0pOyAvLyByZXNldCBjc3NNb2RlIG9mZnNldHNcblxuICAgICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcyAmJiBwYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICBzZXRDU1NQcm9wZXJ0eShzd2lwZXIud3JhcHBlckVsLCAnLS1zd2lwZXItY2VudGVyZWQtb2Zmc2V0LWJlZm9yZScsICcnKTtcbiAgICAgICAgc2V0Q1NTUHJvcGVydHkoc3dpcGVyLndyYXBwZXJFbCwgJy0tc3dpcGVyLWNlbnRlcmVkLW9mZnNldC1hZnRlcicsICcnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZ3JpZEVuYWJsZWQgPSBwYXJhbXMuZ3JpZCAmJiBwYXJhbXMuZ3JpZC5yb3dzID4gMSAmJiBzd2lwZXIuZ3JpZDtcblxuICAgICAgaWYgKGdyaWRFbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5ncmlkLmluaXRTbGlkZXMoc2xpZGVzTGVuZ3RoKTtcbiAgICAgIH0gLy8gQ2FsYyBzbGlkZXNcblxuXG4gICAgICBsZXQgc2xpZGVTaXplO1xuICAgICAgY29uc3Qgc2hvdWxkUmVzZXRTbGlkZVNpemUgPSBwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nICYmIHBhcmFtcy5icmVha3BvaW50cyAmJiBPYmplY3Qua2V5cyhwYXJhbXMuYnJlYWtwb2ludHMpLmZpbHRlcihrZXkgPT4ge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHBhcmFtcy5icmVha3BvaW50c1trZXldLnNsaWRlc1BlclZpZXcgIT09ICd1bmRlZmluZWQnO1xuICAgICAgfSkubGVuZ3RoID4gMDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXNMZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzbGlkZVNpemUgPSAwO1xuICAgICAgICBjb25zdCBzbGlkZSA9IHNsaWRlcy5lcShpKTtcblxuICAgICAgICBpZiAoZ3JpZEVuYWJsZWQpIHtcbiAgICAgICAgICBzd2lwZXIuZ3JpZC51cGRhdGVTbGlkZShpLCBzbGlkZSwgc2xpZGVzTGVuZ3RoLCBnZXREaXJlY3Rpb25MYWJlbCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2xpZGUuY3NzKCdkaXNwbGF5JykgPT09ICdub25lJykgY29udGludWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgICBpZiAocGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJykge1xuICAgICAgICAgIGlmIChzaG91bGRSZXNldFNsaWRlU2l6ZSkge1xuICAgICAgICAgICAgc2xpZGVzW2ldLnN0eWxlW2dldERpcmVjdGlvbkxhYmVsKCd3aWR0aCcpXSA9IGBgO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHNsaWRlU3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZShzbGlkZVswXSk7XG4gICAgICAgICAgY29uc3QgY3VycmVudFRyYW5zZm9ybSA9IHNsaWRlWzBdLnN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgICBjb25zdCBjdXJyZW50V2ViS2l0VHJhbnNmb3JtID0gc2xpZGVbMF0uc3R5bGUud2Via2l0VHJhbnNmb3JtO1xuXG4gICAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHNsaWRlWzBdLnN0eWxlLnRyYW5zZm9ybSA9ICdub25lJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudFdlYktpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgc2xpZGVbMF0uc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ25vbmUnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXJhbXMucm91bmRMZW5ndGhzKSB7XG4gICAgICAgICAgICBzbGlkZVNpemUgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBzbGlkZS5vdXRlcldpZHRoKHRydWUpIDogc2xpZGUub3V0ZXJIZWlnaHQodHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBnZXREaXJlY3Rpb25Qcm9wZXJ0eVZhbHVlKHNsaWRlU3R5bGVzLCAnd2lkdGgnKTtcbiAgICAgICAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gZ2V0RGlyZWN0aW9uUHJvcGVydHlWYWx1ZShzbGlkZVN0eWxlcywgJ3BhZGRpbmctbGVmdCcpO1xuICAgICAgICAgICAgY29uc3QgcGFkZGluZ1JpZ2h0ID0gZ2V0RGlyZWN0aW9uUHJvcGVydHlWYWx1ZShzbGlkZVN0eWxlcywgJ3BhZGRpbmctcmlnaHQnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpbkxlZnQgPSBnZXREaXJlY3Rpb25Qcm9wZXJ0eVZhbHVlKHNsaWRlU3R5bGVzLCAnbWFyZ2luLWxlZnQnKTtcbiAgICAgICAgICAgIGNvbnN0IG1hcmdpblJpZ2h0ID0gZ2V0RGlyZWN0aW9uUHJvcGVydHlWYWx1ZShzbGlkZVN0eWxlcywgJ21hcmdpbi1yaWdodCcpO1xuICAgICAgICAgICAgY29uc3QgYm94U2l6aW5nID0gc2xpZGVTdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSgnYm94LXNpemluZycpO1xuXG4gICAgICAgICAgICBpZiAoYm94U2l6aW5nICYmIGJveFNpemluZyA9PT0gJ2JvcmRlci1ib3gnKSB7XG4gICAgICAgICAgICAgIHNsaWRlU2l6ZSA9IHdpZHRoICsgbWFyZ2luTGVmdCArIG1hcmdpblJpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICAgIGNsaWVudFdpZHRoLFxuICAgICAgICAgICAgICAgIG9mZnNldFdpZHRoXG4gICAgICAgICAgICAgIH0gPSBzbGlkZVswXTtcbiAgICAgICAgICAgICAgc2xpZGVTaXplID0gd2lkdGggKyBwYWRkaW5nTGVmdCArIHBhZGRpbmdSaWdodCArIG1hcmdpbkxlZnQgKyBtYXJnaW5SaWdodCArIChvZmZzZXRXaWR0aCAtIGNsaWVudFdpZHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgc2xpZGVbMF0uc3R5bGUudHJhbnNmb3JtID0gY3VycmVudFRyYW5zZm9ybTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudFdlYktpdFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgc2xpZGVbMF0uc3R5bGUud2Via2l0VHJhbnNmb3JtID0gY3VycmVudFdlYktpdFRyYW5zZm9ybTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyYW1zLnJvdW5kTGVuZ3Rocykgc2xpZGVTaXplID0gTWF0aC5mbG9vcihzbGlkZVNpemUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNsaWRlU2l6ZSA9IChzd2lwZXJTaXplIC0gKHBhcmFtcy5zbGlkZXNQZXJWaWV3IC0gMSkgKiBzcGFjZUJldHdlZW4pIC8gcGFyYW1zLnNsaWRlc1BlclZpZXc7XG4gICAgICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHNsaWRlU2l6ZSA9IE1hdGguZmxvb3Ioc2xpZGVTaXplKTtcblxuICAgICAgICAgIGlmIChzbGlkZXNbaV0pIHtcbiAgICAgICAgICAgIHNsaWRlc1tpXS5zdHlsZVtnZXREaXJlY3Rpb25MYWJlbCgnd2lkdGgnKV0gPSBgJHtzbGlkZVNpemV9cHhgO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzbGlkZXNbaV0pIHtcbiAgICAgICAgICBzbGlkZXNbaV0uc3dpcGVyU2xpZGVTaXplID0gc2xpZGVTaXplO1xuICAgICAgICB9XG5cbiAgICAgICAgc2xpZGVzU2l6ZXNHcmlkLnB1c2goc2xpZGVTaXplKTtcblxuICAgICAgICBpZiAocGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgICAgc2xpZGVQb3NpdGlvbiA9IHNsaWRlUG9zaXRpb24gKyBzbGlkZVNpemUgLyAyICsgcHJldlNsaWRlU2l6ZSAvIDIgKyBzcGFjZUJldHdlZW47XG4gICAgICAgICAgaWYgKHByZXZTbGlkZVNpemUgPT09IDAgJiYgaSAhPT0gMCkgc2xpZGVQb3NpdGlvbiA9IHNsaWRlUG9zaXRpb24gLSBzd2lwZXJTaXplIC8gMiAtIHNwYWNlQmV0d2VlbjtcbiAgICAgICAgICBpZiAoaSA9PT0gMCkgc2xpZGVQb3NpdGlvbiA9IHNsaWRlUG9zaXRpb24gLSBzd2lwZXJTaXplIC8gMiAtIHNwYWNlQmV0d2VlbjtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoc2xpZGVQb3NpdGlvbikgPCAxIC8gMTAwMCkgc2xpZGVQb3NpdGlvbiA9IDA7XG4gICAgICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHNsaWRlUG9zaXRpb24gPSBNYXRoLmZsb29yKHNsaWRlUG9zaXRpb24pO1xuICAgICAgICAgIGlmIChpbmRleCAlIHBhcmFtcy5zbGlkZXNQZXJHcm91cCA9PT0gMCkgc25hcEdyaWQucHVzaChzbGlkZVBvc2l0aW9uKTtcbiAgICAgICAgICBzbGlkZXNHcmlkLnB1c2goc2xpZGVQb3NpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHNsaWRlUG9zaXRpb24gPSBNYXRoLmZsb29yKHNsaWRlUG9zaXRpb24pO1xuICAgICAgICAgIGlmICgoaW5kZXggLSBNYXRoLm1pbihzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwU2tpcCwgaW5kZXgpKSAlIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXAgPT09IDApIHNuYXBHcmlkLnB1c2goc2xpZGVQb3NpdGlvbik7XG4gICAgICAgICAgc2xpZGVzR3JpZC5wdXNoKHNsaWRlUG9zaXRpb24pO1xuICAgICAgICAgIHNsaWRlUG9zaXRpb24gPSBzbGlkZVBvc2l0aW9uICsgc2xpZGVTaXplICsgc3BhY2VCZXR3ZWVuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLnZpcnR1YWxTaXplICs9IHNsaWRlU2l6ZSArIHNwYWNlQmV0d2VlbjtcbiAgICAgICAgcHJldlNsaWRlU2l6ZSA9IHNsaWRlU2l6ZTtcbiAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLnZpcnR1YWxTaXplID0gTWF0aC5tYXgoc3dpcGVyLnZpcnR1YWxTaXplLCBzd2lwZXJTaXplKSArIG9mZnNldEFmdGVyO1xuXG4gICAgICBpZiAocnRsICYmIHdyb25nUlRMICYmIChwYXJhbXMuZWZmZWN0ID09PSAnc2xpZGUnIHx8IHBhcmFtcy5lZmZlY3QgPT09ICdjb3ZlcmZsb3cnKSkge1xuICAgICAgICAkd3JhcHBlckVsLmNzcyh7XG4gICAgICAgICAgd2lkdGg6IGAke3N3aXBlci52aXJ0dWFsU2l6ZSArIHBhcmFtcy5zcGFjZUJldHdlZW59cHhgXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLnNldFdyYXBwZXJTaXplKSB7XG4gICAgICAgICR3cmFwcGVyRWwuY3NzKHtcbiAgICAgICAgICBbZ2V0RGlyZWN0aW9uTGFiZWwoJ3dpZHRoJyldOiBgJHtzd2lwZXIudmlydHVhbFNpemUgKyBwYXJhbXMuc3BhY2VCZXR3ZWVufXB4YFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGdyaWRFbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5ncmlkLnVwZGF0ZVdyYXBwZXJTaXplKHNsaWRlU2l6ZSwgc25hcEdyaWQsIGdldERpcmVjdGlvbkxhYmVsKTtcbiAgICAgIH0gLy8gUmVtb3ZlIGxhc3QgZ3JpZCBlbGVtZW50cyBkZXBlbmRpbmcgb24gd2lkdGhcblxuXG4gICAgICBpZiAoIXBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgICBjb25zdCBuZXdTbGlkZXNHcmlkID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbmFwR3JpZC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGxldCBzbGlkZXNHcmlkSXRlbSA9IHNuYXBHcmlkW2ldO1xuICAgICAgICAgIGlmIChwYXJhbXMucm91bmRMZW5ndGhzKSBzbGlkZXNHcmlkSXRlbSA9IE1hdGguZmxvb3Ioc2xpZGVzR3JpZEl0ZW0pO1xuXG4gICAgICAgICAgaWYgKHNuYXBHcmlkW2ldIDw9IHN3aXBlci52aXJ0dWFsU2l6ZSAtIHN3aXBlclNpemUpIHtcbiAgICAgICAgICAgIG5ld1NsaWRlc0dyaWQucHVzaChzbGlkZXNHcmlkSXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc25hcEdyaWQgPSBuZXdTbGlkZXNHcmlkO1xuXG4gICAgICAgIGlmIChNYXRoLmZsb29yKHN3aXBlci52aXJ0dWFsU2l6ZSAtIHN3aXBlclNpemUpIC0gTWF0aC5mbG9vcihzbmFwR3JpZFtzbmFwR3JpZC5sZW5ndGggLSAxXSkgPiAxKSB7XG4gICAgICAgICAgc25hcEdyaWQucHVzaChzd2lwZXIudmlydHVhbFNpemUgLSBzd2lwZXJTaXplKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc25hcEdyaWQubGVuZ3RoID09PSAwKSBzbmFwR3JpZCA9IFswXTtcblxuICAgICAgaWYgKHBhcmFtcy5zcGFjZUJldHdlZW4gIT09IDApIHtcbiAgICAgICAgY29uc3Qga2V5ID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpICYmIHJ0bCA/ICdtYXJnaW5MZWZ0JyA6IGdldERpcmVjdGlvbkxhYmVsKCdtYXJnaW5SaWdodCcpO1xuICAgICAgICBzbGlkZXMuZmlsdGVyKChfLCBzbGlkZUluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKCFwYXJhbXMuY3NzTW9kZSkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgICBpZiAoc2xpZGVJbmRleCA9PT0gc2xpZGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSkuY3NzKHtcbiAgICAgICAgICBba2V5XTogYCR7c3BhY2VCZXR3ZWVufXB4YFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcyAmJiBwYXJhbXMuY2VudGVyZWRTbGlkZXNCb3VuZHMpIHtcbiAgICAgICAgbGV0IGFsbFNsaWRlc1NpemUgPSAwO1xuICAgICAgICBzbGlkZXNTaXplc0dyaWQuZm9yRWFjaChzbGlkZVNpemVWYWx1ZSA9PiB7XG4gICAgICAgICAgYWxsU2xpZGVzU2l6ZSArPSBzbGlkZVNpemVWYWx1ZSArIChwYXJhbXMuc3BhY2VCZXR3ZWVuID8gcGFyYW1zLnNwYWNlQmV0d2VlbiA6IDApO1xuICAgICAgICB9KTtcbiAgICAgICAgYWxsU2xpZGVzU2l6ZSAtPSBwYXJhbXMuc3BhY2VCZXR3ZWVuO1xuICAgICAgICBjb25zdCBtYXhTbmFwID0gYWxsU2xpZGVzU2l6ZSAtIHN3aXBlclNpemU7XG4gICAgICAgIHNuYXBHcmlkID0gc25hcEdyaWQubWFwKHNuYXAgPT4ge1xuICAgICAgICAgIGlmIChzbmFwIDwgMCkgcmV0dXJuIC1vZmZzZXRCZWZvcmU7XG4gICAgICAgICAgaWYgKHNuYXAgPiBtYXhTbmFwKSByZXR1cm4gbWF4U25hcCArIG9mZnNldEFmdGVyO1xuICAgICAgICAgIHJldHVybiBzbmFwO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5jZW50ZXJJbnN1ZmZpY2llbnRTbGlkZXMpIHtcbiAgICAgICAgbGV0IGFsbFNsaWRlc1NpemUgPSAwO1xuICAgICAgICBzbGlkZXNTaXplc0dyaWQuZm9yRWFjaChzbGlkZVNpemVWYWx1ZSA9PiB7XG4gICAgICAgICAgYWxsU2xpZGVzU2l6ZSArPSBzbGlkZVNpemVWYWx1ZSArIChwYXJhbXMuc3BhY2VCZXR3ZWVuID8gcGFyYW1zLnNwYWNlQmV0d2VlbiA6IDApO1xuICAgICAgICB9KTtcbiAgICAgICAgYWxsU2xpZGVzU2l6ZSAtPSBwYXJhbXMuc3BhY2VCZXR3ZWVuO1xuXG4gICAgICAgIGlmIChhbGxTbGlkZXNTaXplIDwgc3dpcGVyU2l6ZSkge1xuICAgICAgICAgIGNvbnN0IGFsbFNsaWRlc09mZnNldCA9IChzd2lwZXJTaXplIC0gYWxsU2xpZGVzU2l6ZSkgLyAyO1xuICAgICAgICAgIHNuYXBHcmlkLmZvckVhY2goKHNuYXAsIHNuYXBJbmRleCkgPT4ge1xuICAgICAgICAgICAgc25hcEdyaWRbc25hcEluZGV4XSA9IHNuYXAgLSBhbGxTbGlkZXNPZmZzZXQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc2xpZGVzR3JpZC5mb3JFYWNoKChzbmFwLCBzbmFwSW5kZXgpID0+IHtcbiAgICAgICAgICAgIHNsaWRlc0dyaWRbc25hcEluZGV4XSA9IHNuYXAgKyBhbGxTbGlkZXNPZmZzZXQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIsIHtcbiAgICAgICAgc2xpZGVzLFxuICAgICAgICBzbmFwR3JpZCxcbiAgICAgICAgc2xpZGVzR3JpZCxcbiAgICAgICAgc2xpZGVzU2l6ZXNHcmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcyAmJiBwYXJhbXMuY3NzTW9kZSAmJiAhcGFyYW1zLmNlbnRlcmVkU2xpZGVzQm91bmRzKSB7XG4gICAgICAgIHNldENTU1Byb3BlcnR5KHN3aXBlci53cmFwcGVyRWwsICctLXN3aXBlci1jZW50ZXJlZC1vZmZzZXQtYmVmb3JlJywgYCR7LXNuYXBHcmlkWzBdfXB4YCk7XG4gICAgICAgIHNldENTU1Byb3BlcnR5KHN3aXBlci53cmFwcGVyRWwsICctLXN3aXBlci1jZW50ZXJlZC1vZmZzZXQtYWZ0ZXInLCBgJHtzd2lwZXIuc2l6ZSAvIDIgLSBzbGlkZXNTaXplc0dyaWRbc2xpZGVzU2l6ZXNHcmlkLmxlbmd0aCAtIDFdIC8gMn1weGApO1xuICAgICAgICBjb25zdCBhZGRUb1NuYXBHcmlkID0gLXN3aXBlci5zbmFwR3JpZFswXTtcbiAgICAgICAgY29uc3QgYWRkVG9TbGlkZXNHcmlkID0gLXN3aXBlci5zbGlkZXNHcmlkWzBdO1xuICAgICAgICBzd2lwZXIuc25hcEdyaWQgPSBzd2lwZXIuc25hcEdyaWQubWFwKHYgPT4gdiArIGFkZFRvU25hcEdyaWQpO1xuICAgICAgICBzd2lwZXIuc2xpZGVzR3JpZCA9IHN3aXBlci5zbGlkZXNHcmlkLm1hcCh2ID0+IHYgKyBhZGRUb1NsaWRlc0dyaWQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2xpZGVzTGVuZ3RoICE9PSBwcmV2aW91c1NsaWRlc0xlbmd0aCkge1xuICAgICAgICBzd2lwZXIuZW1pdCgnc2xpZGVzTGVuZ3RoQ2hhbmdlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzbmFwR3JpZC5sZW5ndGggIT09IHByZXZpb3VzU25hcEdyaWRMZW5ndGgpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMud2F0Y2hPdmVyZmxvdykgc3dpcGVyLmNoZWNrT3ZlcmZsb3coKTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3NuYXBHcmlkTGVuZ3RoQ2hhbmdlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzbGlkZXNHcmlkLmxlbmd0aCAhPT0gcHJldmlvdXNTbGlkZXNHcmlkTGVuZ3RoKSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCdzbGlkZXNHcmlkTGVuZ3RoQ2hhbmdlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMud2F0Y2hTbGlkZXNQcm9ncmVzcykge1xuICAgICAgICBzd2lwZXIudXBkYXRlU2xpZGVzT2Zmc2V0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNWaXJ0dWFsICYmICFwYXJhbXMuY3NzTW9kZSAmJiAocGFyYW1zLmVmZmVjdCA9PT0gJ3NsaWRlJyB8fCBwYXJhbXMuZWZmZWN0ID09PSAnZmFkZScpKSB7XG4gICAgICAgIGNvbnN0IGJhY2tGYWNlSGlkZGVuQ2xhc3MgPSBgJHtwYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc31iYWNrZmFjZS1oaWRkZW5gO1xuICAgICAgICBjb25zdCBoYXNDbGFzc0JhY2tmYWNlQ2xhc3NBZGRlZCA9IHN3aXBlci4kZWwuaGFzQ2xhc3MoYmFja0ZhY2VIaWRkZW5DbGFzcyk7XG5cbiAgICAgICAgaWYgKHNsaWRlc0xlbmd0aCA8PSBwYXJhbXMubWF4QmFja2ZhY2VIaWRkZW5TbGlkZXMpIHtcbiAgICAgICAgICBpZiAoIWhhc0NsYXNzQmFja2ZhY2VDbGFzc0FkZGVkKSBzd2lwZXIuJGVsLmFkZENsYXNzKGJhY2tGYWNlSGlkZGVuQ2xhc3MpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhc0NsYXNzQmFja2ZhY2VDbGFzc0FkZGVkKSB7XG4gICAgICAgICAgc3dpcGVyLiRlbC5yZW1vdmVDbGFzcyhiYWNrRmFjZUhpZGRlbkNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUF1dG9IZWlnaHQoc3BlZWQpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCBhY3RpdmVTbGlkZXMgPSBbXTtcbiAgICAgIGNvbnN0IGlzVmlydHVhbCA9IHN3aXBlci52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkO1xuICAgICAgbGV0IG5ld0hlaWdodCA9IDA7XG4gICAgICBsZXQgaTtcblxuICAgICAgaWYgKHR5cGVvZiBzcGVlZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24oc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gdHJ1ZSkge1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNpdGlvbihzd2lwZXIucGFyYW1zLnNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZ2V0U2xpZGVCeUluZGV4ID0gaW5kZXggPT4ge1xuICAgICAgICBpZiAoaXNWaXJ0dWFsKSB7XG4gICAgICAgICAgcmV0dXJuIHN3aXBlci5zbGlkZXMuZmlsdGVyKGVsID0+IHBhcnNlSW50KGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKSwgMTApID09PSBpbmRleClbMF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3dpcGVyLnNsaWRlcy5lcShpbmRleClbMF07XG4gICAgICB9OyAvLyBGaW5kIHNsaWRlcyBjdXJyZW50bHkgaW4gdmlld1xuXG5cbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcgIT09ICdhdXRvJyAmJiBzd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcgPiAxKSB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgICAgKHN3aXBlci52aXNpYmxlU2xpZGVzIHx8ICQoW10pKS5lYWNoKHNsaWRlID0+IHtcbiAgICAgICAgICAgIGFjdGl2ZVNsaWRlcy5wdXNoKHNsaWRlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgTWF0aC5jZWlsKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyk7IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBzd2lwZXIuYWN0aXZlSW5kZXggKyBpO1xuICAgICAgICAgICAgaWYgKGluZGV4ID4gc3dpcGVyLnNsaWRlcy5sZW5ndGggJiYgIWlzVmlydHVhbCkgYnJlYWs7XG4gICAgICAgICAgICBhY3RpdmVTbGlkZXMucHVzaChnZXRTbGlkZUJ5SW5kZXgoaW5kZXgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdGl2ZVNsaWRlcy5wdXNoKGdldFNsaWRlQnlJbmRleChzd2lwZXIuYWN0aXZlSW5kZXgpKTtcbiAgICAgIH0gLy8gRmluZCBuZXcgaGVpZ2h0IGZyb20gaGlnaGVzdCBzbGlkZSBpbiB2aWV3XG5cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGFjdGl2ZVNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGl2ZVNsaWRlc1tpXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjb25zdCBoZWlnaHQgPSBhY3RpdmVTbGlkZXNbaV0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgIG5ld0hlaWdodCA9IGhlaWdodCA+IG5ld0hlaWdodCA/IGhlaWdodCA6IG5ld0hlaWdodDtcbiAgICAgICAgfVxuICAgICAgfSAvLyBVcGRhdGUgSGVpZ2h0XG5cblxuICAgICAgaWYgKG5ld0hlaWdodCB8fCBuZXdIZWlnaHQgPT09IDApIHN3aXBlci4kd3JhcHBlckVsLmNzcygnaGVpZ2h0JywgYCR7bmV3SGVpZ2h0fXB4YCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2xpZGVzT2Zmc2V0KCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHNsaWRlcyA9IHN3aXBlci5zbGlkZXM7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHNsaWRlc1tpXS5zd2lwZXJTbGlkZU9mZnNldCA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/IHNsaWRlc1tpXS5vZmZzZXRMZWZ0IDogc2xpZGVzW2ldLm9mZnNldFRvcDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTbGlkZXNQcm9ncmVzcyh0cmFuc2xhdGUpIHtcbiAgICAgIGlmICh0cmFuc2xhdGUgPT09IHZvaWQgMCkge1xuICAgICAgICB0cmFuc2xhdGUgPSB0aGlzICYmIHRoaXMudHJhbnNsYXRlIHx8IDA7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zO1xuICAgICAgY29uc3Qge1xuICAgICAgICBzbGlkZXMsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICBzbmFwR3JpZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmIChzbGlkZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICBpZiAodHlwZW9mIHNsaWRlc1swXS5zd2lwZXJTbGlkZU9mZnNldCA9PT0gJ3VuZGVmaW5lZCcpIHN3aXBlci51cGRhdGVTbGlkZXNPZmZzZXQoKTtcbiAgICAgIGxldCBvZmZzZXRDZW50ZXIgPSAtdHJhbnNsYXRlO1xuICAgICAgaWYgKHJ0bCkgb2Zmc2V0Q2VudGVyID0gdHJhbnNsYXRlOyAvLyBWaXNpYmxlIFNsaWRlc1xuXG4gICAgICBzbGlkZXMucmVtb3ZlQ2xhc3MocGFyYW1zLnNsaWRlVmlzaWJsZUNsYXNzKTtcbiAgICAgIHN3aXBlci52aXNpYmxlU2xpZGVzSW5kZXhlcyA9IFtdO1xuICAgICAgc3dpcGVyLnZpc2libGVTbGlkZXMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgc2xpZGUgPSBzbGlkZXNbaV07XG4gICAgICAgIGxldCBzbGlkZU9mZnNldCA9IHNsaWRlLnN3aXBlclNsaWRlT2Zmc2V0O1xuXG4gICAgICAgIGlmIChwYXJhbXMuY3NzTW9kZSAmJiBwYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgICAgICBzbGlkZU9mZnNldCAtPSBzbGlkZXNbMF0uc3dpcGVyU2xpZGVPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzbGlkZVByb2dyZXNzID0gKG9mZnNldENlbnRlciArIChwYXJhbXMuY2VudGVyZWRTbGlkZXMgPyBzd2lwZXIubWluVHJhbnNsYXRlKCkgOiAwKSAtIHNsaWRlT2Zmc2V0KSAvIChzbGlkZS5zd2lwZXJTbGlkZVNpemUgKyBwYXJhbXMuc3BhY2VCZXR3ZWVuKTtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxTbGlkZVByb2dyZXNzID0gKG9mZnNldENlbnRlciAtIHNuYXBHcmlkWzBdICsgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcyA/IHN3aXBlci5taW5UcmFuc2xhdGUoKSA6IDApIC0gc2xpZGVPZmZzZXQpIC8gKHNsaWRlLnN3aXBlclNsaWRlU2l6ZSArIHBhcmFtcy5zcGFjZUJldHdlZW4pO1xuICAgICAgICBjb25zdCBzbGlkZUJlZm9yZSA9IC0ob2Zmc2V0Q2VudGVyIC0gc2xpZGVPZmZzZXQpO1xuICAgICAgICBjb25zdCBzbGlkZUFmdGVyID0gc2xpZGVCZWZvcmUgKyBzd2lwZXIuc2xpZGVzU2l6ZXNHcmlkW2ldO1xuICAgICAgICBjb25zdCBpc1Zpc2libGUgPSBzbGlkZUJlZm9yZSA+PSAwICYmIHNsaWRlQmVmb3JlIDwgc3dpcGVyLnNpemUgLSAxIHx8IHNsaWRlQWZ0ZXIgPiAxICYmIHNsaWRlQWZ0ZXIgPD0gc3dpcGVyLnNpemUgfHwgc2xpZGVCZWZvcmUgPD0gMCAmJiBzbGlkZUFmdGVyID49IHN3aXBlci5zaXplO1xuXG4gICAgICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgICBzd2lwZXIudmlzaWJsZVNsaWRlcy5wdXNoKHNsaWRlKTtcbiAgICAgICAgICBzd2lwZXIudmlzaWJsZVNsaWRlc0luZGV4ZXMucHVzaChpKTtcbiAgICAgICAgICBzbGlkZXMuZXEoaSkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlVmlzaWJsZUNsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNsaWRlLnByb2dyZXNzID0gcnRsID8gLXNsaWRlUHJvZ3Jlc3MgOiBzbGlkZVByb2dyZXNzO1xuICAgICAgICBzbGlkZS5vcmlnaW5hbFByb2dyZXNzID0gcnRsID8gLW9yaWdpbmFsU2xpZGVQcm9ncmVzcyA6IG9yaWdpbmFsU2xpZGVQcm9ncmVzcztcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLnZpc2libGVTbGlkZXMgPSAkKHN3aXBlci52aXNpYmxlU2xpZGVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcyh0cmFuc2xhdGUpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgdHJhbnNsYXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBtdWx0aXBsaWVyID0gc3dpcGVyLnJ0bFRyYW5zbGF0ZSA/IC0xIDogMTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICAgICAgdHJhbnNsYXRlID0gc3dpcGVyICYmIHN3aXBlci50cmFuc2xhdGUgJiYgc3dpcGVyLnRyYW5zbGF0ZSAqIG11bHRpcGxpZXIgfHwgMDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZXNEaWZmID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpO1xuICAgICAgbGV0IHtcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIGlzQmVnaW5uaW5nLFxuICAgICAgICBpc0VuZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGNvbnN0IHdhc0JlZ2lubmluZyA9IGlzQmVnaW5uaW5nO1xuICAgICAgY29uc3Qgd2FzRW5kID0gaXNFbmQ7XG5cbiAgICAgIGlmICh0cmFuc2xhdGVzRGlmZiA9PT0gMCkge1xuICAgICAgICBwcm9ncmVzcyA9IDA7XG4gICAgICAgIGlzQmVnaW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgaXNFbmQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAodHJhbnNsYXRlIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSAvIHRyYW5zbGF0ZXNEaWZmO1xuICAgICAgICBpc0JlZ2lubmluZyA9IHByb2dyZXNzIDw9IDA7XG4gICAgICAgIGlzRW5kID0gcHJvZ3Jlc3MgPj0gMTtcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIsIHtcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIGlzQmVnaW5uaW5nLFxuICAgICAgICBpc0VuZFxuICAgICAgfSk7XG4gICAgICBpZiAocGFyYW1zLndhdGNoU2xpZGVzUHJvZ3Jlc3MgfHwgcGFyYW1zLmNlbnRlcmVkU2xpZGVzICYmIHBhcmFtcy5hdXRvSGVpZ2h0KSBzd2lwZXIudXBkYXRlU2xpZGVzUHJvZ3Jlc3ModHJhbnNsYXRlKTtcblxuICAgICAgaWYgKGlzQmVnaW5uaW5nICYmICF3YXNCZWdpbm5pbmcpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3JlYWNoQmVnaW5uaW5nIHRvRWRnZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFbmQgJiYgIXdhc0VuZCkge1xuICAgICAgICBzd2lwZXIuZW1pdCgncmVhY2hFbmQgdG9FZGdlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh3YXNCZWdpbm5pbmcgJiYgIWlzQmVnaW5uaW5nIHx8IHdhc0VuZCAmJiAhaXNFbmQpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ2Zyb21FZGdlJyk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KCdwcm9ncmVzcycsIHByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTbGlkZXNDbGFzc2VzKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc2xpZGVzLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgIGFjdGl2ZUluZGV4LFxuICAgICAgICByZWFsSW5kZXhcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBjb25zdCBpc1ZpcnR1YWwgPSBzd2lwZXIudmlydHVhbCAmJiBwYXJhbXMudmlydHVhbC5lbmFibGVkO1xuICAgICAgc2xpZGVzLnJlbW92ZUNsYXNzKGAke3BhcmFtcy5zbGlkZUFjdGl2ZUNsYXNzfSAke3BhcmFtcy5zbGlkZU5leHRDbGFzc30gJHtwYXJhbXMuc2xpZGVQcmV2Q2xhc3N9ICR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQWN0aXZlQ2xhc3N9ICR7cGFyYW1zLnNsaWRlRHVwbGljYXRlTmV4dENsYXNzfSAke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZVByZXZDbGFzc31gKTtcbiAgICAgIGxldCBhY3RpdmVTbGlkZTtcblxuICAgICAgaWYgKGlzVmlydHVhbCkge1xuICAgICAgICBhY3RpdmVTbGlkZSA9IHN3aXBlci4kd3JhcHBlckVsLmZpbmQoYC4ke3BhcmFtcy5zbGlkZUNsYXNzfVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7YWN0aXZlSW5kZXh9XCJdYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3RpdmVTbGlkZSA9IHNsaWRlcy5lcShhY3RpdmVJbmRleCk7XG4gICAgICB9IC8vIEFjdGl2ZSBjbGFzc2VzXG5cblxuICAgICAgYWN0aXZlU2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlQWN0aXZlQ2xhc3MpO1xuXG4gICAgICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICAgICAgLy8gRHVwbGljYXRlIHRvIGFsbCBsb29wZWQgc2xpZGVzXG4gICAgICAgIGlmIChhY3RpdmVTbGlkZS5oYXNDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpIHtcbiAgICAgICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc306bm90KC4ke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzfSlbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke3JlYWxJbmRleH1cIl1gKS5hZGRDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVBY3RpdmVDbGFzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHdyYXBwZXJFbC5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9LiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9W2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtyZWFsSW5kZXh9XCJdYCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlQWN0aXZlQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9IC8vIE5leHQgU2xpZGVcblxuXG4gICAgICBsZXQgbmV4dFNsaWRlID0gYWN0aXZlU2xpZGUubmV4dEFsbChgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9YCkuZXEoMCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlTmV4dENsYXNzKTtcblxuICAgICAgaWYgKHBhcmFtcy5sb29wICYmIG5leHRTbGlkZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbmV4dFNsaWRlID0gc2xpZGVzLmVxKDApO1xuICAgICAgICBuZXh0U2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlTmV4dENsYXNzKTtcbiAgICAgIH0gLy8gUHJldiBTbGlkZVxuXG5cbiAgICAgIGxldCBwcmV2U2xpZGUgPSBhY3RpdmVTbGlkZS5wcmV2QWxsKGAuJHtwYXJhbXMuc2xpZGVDbGFzc31gKS5lcSgwKS5hZGRDbGFzcyhwYXJhbXMuc2xpZGVQcmV2Q2xhc3MpO1xuXG4gICAgICBpZiAocGFyYW1zLmxvb3AgJiYgcHJldlNsaWRlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwcmV2U2xpZGUgPSBzbGlkZXMuZXEoLTEpO1xuICAgICAgICBwcmV2U2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlUHJldkNsYXNzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICAgIC8vIER1cGxpY2F0ZSB0byBhbGwgbG9vcGVkIHNsaWRlc1xuICAgICAgICBpZiAobmV4dFNsaWRlLmhhc0NsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkge1xuICAgICAgICAgICR3cmFwcGVyRWwuY2hpbGRyZW4oYC4ke3BhcmFtcy5zbGlkZUNsYXNzfTpub3QoLiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9KVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7bmV4dFNsaWRlLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4Jyl9XCJdYCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlTmV4dENsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc30uJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc31bZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke25leHRTbGlkZS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpfVwiXWApLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZU5leHRDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldlNsaWRlLmhhc0NsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkge1xuICAgICAgICAgICR3cmFwcGVyRWwuY2hpbGRyZW4oYC4ke3BhcmFtcy5zbGlkZUNsYXNzfTpub3QoLiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9KVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7cHJldlNsaWRlLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4Jyl9XCJdYCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlUHJldkNsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc30uJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc31bZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke3ByZXZTbGlkZS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpfVwiXWApLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZVByZXZDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXRTbGlkZXNDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWN0aXZlSW5kZXgobmV3QWN0aXZlSW5kZXgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSBzd2lwZXIucnRsVHJhbnNsYXRlID8gc3dpcGVyLnRyYW5zbGF0ZSA6IC1zd2lwZXIudHJhbnNsYXRlO1xuICAgICAgY29uc3Qge1xuICAgICAgICBzbGlkZXNHcmlkLFxuICAgICAgICBzbmFwR3JpZCxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBhY3RpdmVJbmRleDogcHJldmlvdXNJbmRleCxcbiAgICAgICAgcmVhbEluZGV4OiBwcmV2aW91c1JlYWxJbmRleCxcbiAgICAgICAgc25hcEluZGV4OiBwcmV2aW91c1NuYXBJbmRleFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGxldCBhY3RpdmVJbmRleCA9IG5ld0FjdGl2ZUluZGV4O1xuICAgICAgbGV0IHNuYXBJbmRleDtcblxuICAgICAgaWYgKHR5cGVvZiBhY3RpdmVJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXNHcmlkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzbGlkZXNHcmlkW2kgKyAxXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGUgPj0gc2xpZGVzR3JpZFtpXSAmJiB0cmFuc2xhdGUgPCBzbGlkZXNHcmlkW2kgKyAxXSAtIChzbGlkZXNHcmlkW2kgKyAxXSAtIHNsaWRlc0dyaWRbaV0pIC8gMikge1xuICAgICAgICAgICAgICBhY3RpdmVJbmRleCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRyYW5zbGF0ZSA+PSBzbGlkZXNHcmlkW2ldICYmIHRyYW5zbGF0ZSA8IHNsaWRlc0dyaWRbaSArIDFdKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZUluZGV4ID0gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0cmFuc2xhdGUgPj0gc2xpZGVzR3JpZFtpXSkge1xuICAgICAgICAgICAgYWN0aXZlSW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBOb3JtYWxpemUgc2xpZGVJbmRleFxuXG5cbiAgICAgICAgaWYgKHBhcmFtcy5ub3JtYWxpemVTbGlkZUluZGV4KSB7XG4gICAgICAgICAgaWYgKGFjdGl2ZUluZGV4IDwgMCB8fCB0eXBlb2YgYWN0aXZlSW5kZXggPT09ICd1bmRlZmluZWQnKSBhY3RpdmVJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNuYXBHcmlkLmluZGV4T2YodHJhbnNsYXRlKSA+PSAwKSB7XG4gICAgICAgIHNuYXBJbmRleCA9IHNuYXBHcmlkLmluZGV4T2YodHJhbnNsYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNraXAgPSBNYXRoLm1pbihwYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwLCBhY3RpdmVJbmRleCk7XG4gICAgICAgIHNuYXBJbmRleCA9IHNraXAgKyBNYXRoLmZsb29yKChhY3RpdmVJbmRleCAtIHNraXApIC8gcGFyYW1zLnNsaWRlc1Blckdyb3VwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNuYXBJbmRleCA+PSBzbmFwR3JpZC5sZW5ndGgpIHNuYXBJbmRleCA9IHNuYXBHcmlkLmxlbmd0aCAtIDE7XG5cbiAgICAgIGlmIChhY3RpdmVJbmRleCA9PT0gcHJldmlvdXNJbmRleCkge1xuICAgICAgICBpZiAoc25hcEluZGV4ICE9PSBwcmV2aW91c1NuYXBJbmRleCkge1xuICAgICAgICAgIHN3aXBlci5zbmFwSW5kZXggPSBzbmFwSW5kZXg7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ3NuYXBJbmRleENoYW5nZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBHZXQgcmVhbCBpbmRleFxuXG5cbiAgICAgIGNvbnN0IHJlYWxJbmRleCA9IHBhcnNlSW50KHN3aXBlci5zbGlkZXMuZXEoYWN0aXZlSW5kZXgpLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JykgfHwgYWN0aXZlSW5kZXgsIDEwKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLCB7XG4gICAgICAgIHNuYXBJbmRleCxcbiAgICAgICAgcmVhbEluZGV4LFxuICAgICAgICBwcmV2aW91c0luZGV4LFxuICAgICAgICBhY3RpdmVJbmRleFxuICAgICAgfSk7XG4gICAgICBzd2lwZXIuZW1pdCgnYWN0aXZlSW5kZXhDaGFuZ2UnKTtcbiAgICAgIHN3aXBlci5lbWl0KCdzbmFwSW5kZXhDaGFuZ2UnKTtcblxuICAgICAgaWYgKHByZXZpb3VzUmVhbEluZGV4ICE9PSByZWFsSW5kZXgpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3JlYWxJbmRleENoYW5nZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3dpcGVyLmluaXRpYWxpemVkIHx8IHN3aXBlci5wYXJhbXMucnVuQ2FsbGJhY2tzT25Jbml0KSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCdzbGlkZUNoYW5nZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsaWNrZWRTbGlkZShlKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgICAgIGNvbnN0IHNsaWRlID0gJChlKS5jbG9zZXN0KGAuJHtwYXJhbXMuc2xpZGVDbGFzc31gKVswXTtcbiAgICAgIGxldCBzbGlkZUZvdW5kID0gZmFsc2U7XG4gICAgICBsZXQgc2xpZGVJbmRleDtcblxuICAgICAgaWYgKHNsaWRlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3dpcGVyLnNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGlmIChzd2lwZXIuc2xpZGVzW2ldID09PSBzbGlkZSkge1xuICAgICAgICAgICAgc2xpZGVGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc2xpZGUgJiYgc2xpZGVGb3VuZCkge1xuICAgICAgICBzd2lwZXIuY2xpY2tlZFNsaWRlID0gc2xpZGU7XG5cbiAgICAgICAgaWYgKHN3aXBlci52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkKSB7XG4gICAgICAgICAgc3dpcGVyLmNsaWNrZWRJbmRleCA9IHBhcnNlSW50KCQoc2xpZGUpLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JyksIDEwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuY2xpY2tlZEluZGV4ID0gc2xpZGVJbmRleDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLmNsaWNrZWRTbGlkZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3dpcGVyLmNsaWNrZWRJbmRleCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLnNsaWRlVG9DbGlja2VkU2xpZGUgJiYgc3dpcGVyLmNsaWNrZWRJbmRleCAhPT0gdW5kZWZpbmVkICYmIHN3aXBlci5jbGlja2VkSW5kZXggIT09IHN3aXBlci5hY3RpdmVJbmRleCkge1xuICAgICAgICBzd2lwZXIuc2xpZGVUb0NsaWNrZWRTbGlkZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciB1cGRhdGUgPSB7XG4gICAgICB1cGRhdGVTaXplLFxuICAgICAgdXBkYXRlU2xpZGVzLFxuICAgICAgdXBkYXRlQXV0b0hlaWdodCxcbiAgICAgIHVwZGF0ZVNsaWRlc09mZnNldCxcbiAgICAgIHVwZGF0ZVNsaWRlc1Byb2dyZXNzLFxuICAgICAgdXBkYXRlUHJvZ3Jlc3MsXG4gICAgICB1cGRhdGVTbGlkZXNDbGFzc2VzLFxuICAgICAgdXBkYXRlQWN0aXZlSW5kZXgsXG4gICAgICB1cGRhdGVDbGlja2VkU2xpZGVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0U3dpcGVyVHJhbnNsYXRlKGF4aXMpIHtcbiAgICAgIGlmIChheGlzID09PSB2b2lkIDApIHtcbiAgICAgICAgYXhpcyA9IHRoaXMuaXNIb3Jpem9udGFsKCkgPyAneCcgOiAneSc7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgcnRsVHJhbnNsYXRlOiBydGwsXG4gICAgICAgIHRyYW5zbGF0ZSxcbiAgICAgICAgJHdyYXBwZXJFbFxuICAgICAgfSA9IHN3aXBlcjtcblxuICAgICAgaWYgKHBhcmFtcy52aXJ0dWFsVHJhbnNsYXRlKSB7XG4gICAgICAgIHJldHVybiBydGwgPyAtdHJhbnNsYXRlIDogdHJhbnNsYXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IGN1cnJlbnRUcmFuc2xhdGUgPSBnZXRUcmFuc2xhdGUoJHdyYXBwZXJFbFswXSwgYXhpcyk7XG4gICAgICBpZiAocnRsKSBjdXJyZW50VHJhbnNsYXRlID0gLWN1cnJlbnRUcmFuc2xhdGU7XG4gICAgICByZXR1cm4gY3VycmVudFRyYW5zbGF0ZSB8fCAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSh0cmFuc2xhdGUsIGJ5Q29udHJvbGxlcikge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcnRsVHJhbnNsYXRlOiBydGwsXG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgJHdyYXBwZXJFbCxcbiAgICAgICAgd3JhcHBlckVsLFxuICAgICAgICBwcm9ncmVzc1xuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGxldCB4ID0gMDtcbiAgICAgIGxldCB5ID0gMDtcbiAgICAgIGNvbnN0IHogPSAwO1xuXG4gICAgICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgIHggPSBydGwgPyAtdHJhbnNsYXRlIDogdHJhbnNsYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeSA9IHRyYW5zbGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHtcbiAgICAgICAgeCA9IE1hdGguZmxvb3IoeCk7XG4gICAgICAgIHkgPSBNYXRoLmZsb29yKHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgd3JhcHBlckVsW3N3aXBlci5pc0hvcml6b250YWwoKSA/ICdzY3JvbGxMZWZ0JyA6ICdzY3JvbGxUb3AnXSA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/IC14IDogLXk7XG4gICAgICB9IGVsc2UgaWYgKCFwYXJhbXMudmlydHVhbFRyYW5zbGF0ZSkge1xuICAgICAgICAkd3JhcHBlckVsLnRyYW5zZm9ybShgdHJhbnNsYXRlM2QoJHt4fXB4LCAke3l9cHgsICR7en1weClgKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLnByZXZpb3VzVHJhbnNsYXRlID0gc3dpcGVyLnRyYW5zbGF0ZTtcbiAgICAgIHN3aXBlci50cmFuc2xhdGUgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyB4IDogeTsgLy8gQ2hlY2sgaWYgd2UgbmVlZCB0byB1cGRhdGUgcHJvZ3Jlc3NcblxuICAgICAgbGV0IG5ld1Byb2dyZXNzO1xuICAgICAgY29uc3QgdHJhbnNsYXRlc0RpZmYgPSBzd2lwZXIubWF4VHJhbnNsYXRlKCkgLSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG5cbiAgICAgIGlmICh0cmFuc2xhdGVzRGlmZiA9PT0gMCkge1xuICAgICAgICBuZXdQcm9ncmVzcyA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdQcm9ncmVzcyA9ICh0cmFuc2xhdGUgLSBzd2lwZXIubWluVHJhbnNsYXRlKCkpIC8gdHJhbnNsYXRlc0RpZmY7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdQcm9ncmVzcyAhPT0gcHJvZ3Jlc3MpIHtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKHRyYW5zbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KCdzZXRUcmFuc2xhdGUnLCBzd2lwZXIudHJhbnNsYXRlLCBieUNvbnRyb2xsZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pblRyYW5zbGF0ZSgpIHtcbiAgICAgIHJldHVybiAtdGhpcy5zbmFwR3JpZFswXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXhUcmFuc2xhdGUoKSB7XG4gICAgICByZXR1cm4gLXRoaXMuc25hcEdyaWRbdGhpcy5zbmFwR3JpZC5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGVUbyh0cmFuc2xhdGUsIHNwZWVkLCBydW5DYWxsYmFja3MsIHRyYW5zbGF0ZUJvdW5kcywgaW50ZXJuYWwpIHtcbiAgICAgIGlmICh0cmFuc2xhdGUgPT09IHZvaWQgMCkge1xuICAgICAgICB0cmFuc2xhdGUgPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICAgICAgfVxuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzID09PSB2b2lkIDApIHtcbiAgICAgICAgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRyYW5zbGF0ZUJvdW5kcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRyYW5zbGF0ZUJvdW5kcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgd3JhcHBlckVsXG4gICAgICB9ID0gc3dpcGVyO1xuXG4gICAgICBpZiAoc3dpcGVyLmFuaW1hdGluZyAmJiBwYXJhbXMucHJldmVudEludGVyYWN0aW9uT25UcmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWluVHJhbnNsYXRlID0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpO1xuICAgICAgY29uc3QgbWF4VHJhbnNsYXRlID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpO1xuICAgICAgbGV0IG5ld1RyYW5zbGF0ZTtcbiAgICAgIGlmICh0cmFuc2xhdGVCb3VuZHMgJiYgdHJhbnNsYXRlID4gbWluVHJhbnNsYXRlKSBuZXdUcmFuc2xhdGUgPSBtaW5UcmFuc2xhdGU7ZWxzZSBpZiAodHJhbnNsYXRlQm91bmRzICYmIHRyYW5zbGF0ZSA8IG1heFRyYW5zbGF0ZSkgbmV3VHJhbnNsYXRlID0gbWF4VHJhbnNsYXRlO2Vsc2UgbmV3VHJhbnNsYXRlID0gdHJhbnNsYXRlOyAvLyBVcGRhdGUgcHJvZ3Jlc3NcblxuICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKG5ld1RyYW5zbGF0ZSk7XG5cbiAgICAgIGlmIChwYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICBjb25zdCBpc0ggPSBzd2lwZXIuaXNIb3Jpem9udGFsKCk7XG5cbiAgICAgICAgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgICAgd3JhcHBlckVsW2lzSCA/ICdzY3JvbGxMZWZ0JyA6ICdzY3JvbGxUb3AnXSA9IC1uZXdUcmFuc2xhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFzd2lwZXIuc3VwcG9ydC5zbW9vdGhTY3JvbGwpIHtcbiAgICAgICAgICAgIGFuaW1hdGVDU1NNb2RlU2Nyb2xsKHtcbiAgICAgICAgICAgICAgc3dpcGVyLFxuICAgICAgICAgICAgICB0YXJnZXRQb3NpdGlvbjogLW5ld1RyYW5zbGF0ZSxcbiAgICAgICAgICAgICAgc2lkZTogaXNIID8gJ2xlZnQnIDogJ3RvcCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JhcHBlckVsLnNjcm9sbFRvKHtcbiAgICAgICAgICAgIFtpc0ggPyAnbGVmdCcgOiAndG9wJ106IC1uZXdUcmFuc2xhdGUsXG4gICAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24oMCk7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUobmV3VHJhbnNsYXRlKTtcblxuICAgICAgICBpZiAocnVuQ2FsbGJhY2tzKSB7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ2JlZm9yZVRyYW5zaXRpb25TdGFydCcsIHNwZWVkLCBpbnRlcm5hbCk7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ3RyYW5zaXRpb25FbmQnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24oc3BlZWQpO1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1RyYW5zbGF0ZSk7XG5cbiAgICAgICAgaWYgKHJ1bkNhbGxiYWNrcykge1xuICAgICAgICAgIHN3aXBlci5lbWl0KCdiZWZvcmVUcmFuc2l0aW9uU3RhcnQnLCBzcGVlZCwgaW50ZXJuYWwpO1xuICAgICAgICAgIHN3aXBlci5lbWl0KCd0cmFuc2l0aW9uU3RhcnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3dpcGVyLmFuaW1hdGluZykge1xuICAgICAgICAgIHN3aXBlci5hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKCFzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKSB7XG4gICAgICAgICAgICBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gdHJhbnNpdGlvbkVuZChlKSB7XG4gICAgICAgICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSB0aGlzKSByZXR1cm47XG4gICAgICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWxbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0VHJhbnNpdGlvbkVuZCcsIHN3aXBlci5vblRyYW5zbGF0ZVRvV3JhcHBlclRyYW5zaXRpb25FbmQpO1xuICAgICAgICAgICAgICBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kID0gbnVsbDtcbiAgICAgICAgICAgICAgZGVsZXRlIHN3aXBlci5vblRyYW5zbGF0ZVRvV3JhcHBlclRyYW5zaXRpb25FbmQ7XG5cbiAgICAgICAgICAgICAgaWYgKHJ1bkNhbGxiYWNrcykge1xuICAgICAgICAgICAgICAgIHN3aXBlci5lbWl0KCd0cmFuc2l0aW9uRW5kJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWxbMF0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHN3aXBlci5vblRyYW5zbGF0ZVRvV3JhcHBlclRyYW5zaXRpb25FbmQpO1xuICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNsYXRlID0ge1xuICAgICAgZ2V0VHJhbnNsYXRlOiBnZXRTd2lwZXJUcmFuc2xhdGUsXG4gICAgICBzZXRUcmFuc2xhdGUsXG4gICAgICBtaW5UcmFuc2xhdGUsXG4gICAgICBtYXhUcmFuc2xhdGUsXG4gICAgICB0cmFuc2xhdGVUb1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uLCBieUNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG5cbiAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHN3aXBlci4kd3JhcHBlckVsLnRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuZW1pdCgnc2V0VHJhbnNpdGlvbicsIGR1cmF0aW9uLCBieUNvbnRyb2xsZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zaXRpb25FbWl0KF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgcnVuQ2FsbGJhY2tzLFxuICAgICAgICBkaXJlY3Rpb24sXG4gICAgICAgIHN0ZXBcbiAgICAgIH0gPSBfcmVmO1xuICAgICAgY29uc3Qge1xuICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgcHJldmlvdXNJbmRleFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGxldCBkaXIgPSBkaXJlY3Rpb247XG5cbiAgICAgIGlmICghZGlyKSB7XG4gICAgICAgIGlmIChhY3RpdmVJbmRleCA+IHByZXZpb3VzSW5kZXgpIGRpciA9ICduZXh0JztlbHNlIGlmIChhY3RpdmVJbmRleCA8IHByZXZpb3VzSW5kZXgpIGRpciA9ICdwcmV2JztlbHNlIGRpciA9ICdyZXNldCc7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KGB0cmFuc2l0aW9uJHtzdGVwfWApO1xuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzICYmIGFjdGl2ZUluZGV4ICE9PSBwcmV2aW91c0luZGV4KSB7XG4gICAgICAgIGlmIChkaXIgPT09ICdyZXNldCcpIHtcbiAgICAgICAgICBzd2lwZXIuZW1pdChgc2xpZGVSZXNldFRyYW5zaXRpb24ke3N0ZXB9YCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmVtaXQoYHNsaWRlQ2hhbmdlVHJhbnNpdGlvbiR7c3RlcH1gKTtcblxuICAgICAgICBpZiAoZGlyID09PSAnbmV4dCcpIHtcbiAgICAgICAgICBzd2lwZXIuZW1pdChgc2xpZGVOZXh0VHJhbnNpdGlvbiR7c3RlcH1gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuZW1pdChgc2xpZGVQcmV2VHJhbnNpdGlvbiR7c3RlcH1gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zaXRpb25TdGFydChydW5DYWxsYmFja3MsIGRpcmVjdGlvbikge1xuICAgICAgaWYgKHJ1bkNhbGxiYWNrcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtc1xuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmIChwYXJhbXMuY3NzTW9kZSkgcmV0dXJuO1xuXG4gICAgICBpZiAocGFyYW1zLmF1dG9IZWlnaHQpIHtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZUF1dG9IZWlnaHQoKTtcbiAgICAgIH1cblxuICAgICAgdHJhbnNpdGlvbkVtaXQoe1xuICAgICAgICBzd2lwZXIsXG4gICAgICAgIHJ1bkNhbGxiYWNrcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICBzdGVwOiAnU3RhcnQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kJDEocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pIHtcbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBzd2lwZXIuYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHJldHVybjtcbiAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKDApO1xuICAgICAgdHJhbnNpdGlvbkVtaXQoe1xuICAgICAgICBzd2lwZXIsXG4gICAgICAgIHJ1bkNhbGxiYWNrcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICBzdGVwOiAnRW5kJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zaXRpb24kMSA9IHtcbiAgICAgIHNldFRyYW5zaXRpb24sXG4gICAgICB0cmFuc2l0aW9uU3RhcnQsXG4gICAgICB0cmFuc2l0aW9uRW5kOiB0cmFuc2l0aW9uRW5kJDFcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2xpZGVUbyhpbmRleCwgc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwsIGluaXRpYWwpIHtcbiAgICAgIGlmIChpbmRleCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNwZWVkID09PSB2b2lkIDApIHtcbiAgICAgICAgc3BlZWQgPSB0aGlzLnBhcmFtcy5zcGVlZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJ1bkNhbGxiYWNrcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInICYmIHR5cGVvZiBpbmRleCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgJ2luZGV4JyBhcmd1bWVudCBjYW5ub3QgaGF2ZSB0eXBlIG90aGVyIHRoYW4gJ251bWJlcicgb3IgJ3N0cmluZycuIFske3R5cGVvZiBpbmRleH1dIGdpdmVuLmApO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAnc3RyaW5nJykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGBpbmRleGAgYXJndW1lbnQgY29udmVydGVkIGZyb20gYHN0cmluZ2AgdG8gYG51bWJlcmAuXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpbmRleEFzTnVtYmVyID0gcGFyc2VJbnQoaW5kZXgsIDEwKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERldGVybWluZXMgd2hldGhlciB0aGUgYGluZGV4YCBhcmd1bWVudCBpcyBhIHZhbGlkIGBudW1iZXJgXG4gICAgICAgICAqIGFmdGVyIGJlaW5nIGNvbnZlcnRlZCBmcm9tIHRoZSBgc3RyaW5nYCB0eXBlLlxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3QgaXNWYWxpZE51bWJlciA9IGlzRmluaXRlKGluZGV4QXNOdW1iZXIpO1xuXG4gICAgICAgIGlmICghaXNWYWxpZE51bWJlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHBhc3NlZC1pbiAnaW5kZXgnIChzdHJpbmcpIGNvdWxkbid0IGJlIGNvbnZlcnRlZCB0byAnbnVtYmVyJy4gWyR7aW5kZXh9XSBnaXZlbi5gKTtcbiAgICAgICAgfSAvLyBLbm93aW5nIHRoYXQgdGhlIGNvbnZlcnRlZCBgaW5kZXhgIGlzIGEgdmFsaWQgbnVtYmVyLFxuICAgICAgICAvLyB3ZSBjYW4gdXBkYXRlIHRoZSBvcmlnaW5hbCBhcmd1bWVudCdzIHZhbHVlLlxuXG5cbiAgICAgICAgaW5kZXggPSBpbmRleEFzTnVtYmVyO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgbGV0IHNsaWRlSW5kZXggPSBpbmRleDtcbiAgICAgIGlmIChzbGlkZUluZGV4IDwgMCkgc2xpZGVJbmRleCA9IDA7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgc25hcEdyaWQsXG4gICAgICAgIHNsaWRlc0dyaWQsXG4gICAgICAgIHByZXZpb3VzSW5kZXgsXG4gICAgICAgIGFjdGl2ZUluZGV4LFxuICAgICAgICBydGxUcmFuc2xhdGU6IHJ0bCxcbiAgICAgICAgd3JhcHBlckVsLFxuICAgICAgICBlbmFibGVkXG4gICAgICB9ID0gc3dpcGVyO1xuXG4gICAgICBpZiAoc3dpcGVyLmFuaW1hdGluZyAmJiBwYXJhbXMucHJldmVudEludGVyYWN0aW9uT25UcmFuc2l0aW9uIHx8ICFlbmFibGVkICYmICFpbnRlcm5hbCAmJiAhaW5pdGlhbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNraXAgPSBNYXRoLm1pbihzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwU2tpcCwgc2xpZGVJbmRleCk7XG4gICAgICBsZXQgc25hcEluZGV4ID0gc2tpcCArIE1hdGguZmxvb3IoKHNsaWRlSW5kZXggLSBza2lwKSAvIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXApO1xuICAgICAgaWYgKHNuYXBJbmRleCA+PSBzbmFwR3JpZC5sZW5ndGgpIHNuYXBJbmRleCA9IHNuYXBHcmlkLmxlbmd0aCAtIDE7XG5cbiAgICAgIGlmICgoYWN0aXZlSW5kZXggfHwgcGFyYW1zLmluaXRpYWxTbGlkZSB8fCAwKSA9PT0gKHByZXZpb3VzSW5kZXggfHwgMCkgJiYgcnVuQ2FsbGJhY2tzKSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCdiZWZvcmVTbGlkZUNoYW5nZVN0YXJ0Jyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRyYW5zbGF0ZSA9IC1zbmFwR3JpZFtzbmFwSW5kZXhdOyAvLyBVcGRhdGUgcHJvZ3Jlc3NcblxuICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKHRyYW5zbGF0ZSk7IC8vIE5vcm1hbGl6ZSBzbGlkZUluZGV4XG5cbiAgICAgIGlmIChwYXJhbXMubm9ybWFsaXplU2xpZGVJbmRleCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNsaWRlc0dyaWQubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkVHJhbnNsYXRlID0gLU1hdGguZmxvb3IodHJhbnNsYXRlICogMTAwKTtcbiAgICAgICAgICBjb25zdCBub3JtYWxpemVkR3JpZCA9IE1hdGguZmxvb3Ioc2xpZGVzR3JpZFtpXSAqIDEwMCk7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZEdyaWROZXh0ID0gTWF0aC5mbG9vcihzbGlkZXNHcmlkW2kgKyAxXSAqIDEwMCk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHNsaWRlc0dyaWRbaSArIDFdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUcmFuc2xhdGUgPj0gbm9ybWFsaXplZEdyaWQgJiYgbm9ybWFsaXplZFRyYW5zbGF0ZSA8IG5vcm1hbGl6ZWRHcmlkTmV4dCAtIChub3JtYWxpemVkR3JpZE5leHQgLSBub3JtYWxpemVkR3JpZCkgLyAyKSB7XG4gICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChub3JtYWxpemVkVHJhbnNsYXRlID49IG5vcm1hbGl6ZWRHcmlkICYmIG5vcm1hbGl6ZWRUcmFuc2xhdGUgPCBub3JtYWxpemVkR3JpZE5leHQpIHtcbiAgICAgICAgICAgICAgc2xpZGVJbmRleCA9IGkgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFRyYW5zbGF0ZSA+PSBub3JtYWxpemVkR3JpZCkge1xuICAgICAgICAgICAgc2xpZGVJbmRleCA9IGk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IC8vIERpcmVjdGlvbnMgbG9ja3NcblxuXG4gICAgICBpZiAoc3dpcGVyLmluaXRpYWxpemVkICYmIHNsaWRlSW5kZXggIT09IGFjdGl2ZUluZGV4KSB7XG4gICAgICAgIGlmICghc3dpcGVyLmFsbG93U2xpZGVOZXh0ICYmIHRyYW5zbGF0ZSA8IHN3aXBlci50cmFuc2xhdGUgJiYgdHJhbnNsYXRlIDwgc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzd2lwZXIuYWxsb3dTbGlkZVByZXYgJiYgdHJhbnNsYXRlID4gc3dpcGVyLnRyYW5zbGF0ZSAmJiB0cmFuc2xhdGUgPiBzd2lwZXIubWF4VHJhbnNsYXRlKCkpIHtcbiAgICAgICAgICBpZiAoKGFjdGl2ZUluZGV4IHx8IDApICE9PSBzbGlkZUluZGV4KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IGRpcmVjdGlvbjtcbiAgICAgIGlmIChzbGlkZUluZGV4ID4gYWN0aXZlSW5kZXgpIGRpcmVjdGlvbiA9ICduZXh0JztlbHNlIGlmIChzbGlkZUluZGV4IDwgYWN0aXZlSW5kZXgpIGRpcmVjdGlvbiA9ICdwcmV2JztlbHNlIGRpcmVjdGlvbiA9ICdyZXNldCc7IC8vIFVwZGF0ZSBJbmRleFxuXG4gICAgICBpZiAocnRsICYmIC10cmFuc2xhdGUgPT09IHN3aXBlci50cmFuc2xhdGUgfHwgIXJ0bCAmJiB0cmFuc2xhdGUgPT09IHN3aXBlci50cmFuc2xhdGUpIHtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KHNsaWRlSW5kZXgpOyAvLyBVcGRhdGUgSGVpZ2h0XG5cbiAgICAgICAgaWYgKHBhcmFtcy5hdXRvSGVpZ2h0KSB7XG4gICAgICAgICAgc3dpcGVyLnVwZGF0ZUF1dG9IZWlnaHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5lZmZlY3QgIT09ICdzbGlkZScpIHtcbiAgICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKHRyYW5zbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGlyZWN0aW9uICE9PSAncmVzZXQnKSB7XG4gICAgICAgICAgc3dpcGVyLnRyYW5zaXRpb25TdGFydChydW5DYWxsYmFja3MsIGRpcmVjdGlvbik7XG4gICAgICAgICAgc3dpcGVyLnRyYW5zaXRpb25FbmQocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgY29uc3QgaXNIID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpO1xuICAgICAgICBjb25zdCB0ID0gcnRsID8gdHJhbnNsYXRlIDogLXRyYW5zbGF0ZTtcblxuICAgICAgICBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgICBjb25zdCBpc1ZpcnR1YWwgPSBzd2lwZXIudmlydHVhbCAmJiBzd2lwZXIucGFyYW1zLnZpcnR1YWwuZW5hYmxlZDtcblxuICAgICAgICAgIGlmIChpc1ZpcnR1YWwpIHtcbiAgICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwuc3R5bGUuc2Nyb2xsU25hcFR5cGUgPSAnbm9uZSc7XG4gICAgICAgICAgICBzd2lwZXIuX2ltbWVkaWF0ZVZpcnR1YWwgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdyYXBwZXJFbFtpc0ggPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ10gPSB0O1xuXG4gICAgICAgICAgaWYgKGlzVmlydHVhbCkge1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgc3dpcGVyLndyYXBwZXJFbC5zdHlsZS5zY3JvbGxTbmFwVHlwZSA9ICcnO1xuICAgICAgICAgICAgICBzd2lwZXIuX3N3aXBlckltbWVkaWF0ZVZpcnR1YWwgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIXN3aXBlci5zdXBwb3J0LnNtb290aFNjcm9sbCkge1xuICAgICAgICAgICAgYW5pbWF0ZUNTU01vZGVTY3JvbGwoe1xuICAgICAgICAgICAgICBzd2lwZXIsXG4gICAgICAgICAgICAgIHRhcmdldFBvc2l0aW9uOiB0LFxuICAgICAgICAgICAgICBzaWRlOiBpc0ggPyAnbGVmdCcgOiAndG9wJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3cmFwcGVyRWwuc2Nyb2xsVG8oe1xuICAgICAgICAgICAgW2lzSCA/ICdsZWZ0JyA6ICd0b3AnXTogdCxcbiAgICAgICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKHNwZWVkKTtcbiAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUodHJhbnNsYXRlKTtcbiAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleChzbGlkZUluZGV4KTtcbiAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICBzd2lwZXIuZW1pdCgnYmVmb3JlVHJhbnNpdGlvblN0YXJ0Jywgc3BlZWQsIGludGVybmFsKTtcbiAgICAgIHN3aXBlci50cmFuc2l0aW9uU3RhcnQocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pO1xuXG4gICAgICBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgc3dpcGVyLnRyYW5zaXRpb25FbmQocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pO1xuICAgICAgfSBlbHNlIGlmICghc3dpcGVyLmFuaW1hdGluZykge1xuICAgICAgICBzd2lwZXIuYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICBpZiAoIXN3aXBlci5vblNsaWRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCkge1xuICAgICAgICAgIHN3aXBlci5vblNsaWRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoZSkge1xuICAgICAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSB0aGlzKSByZXR1cm47XG4gICAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgc3dpcGVyLm9uU2xpZGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCBzd2lwZXIub25TbGlkZVRvV3JhcHBlclRyYW5zaXRpb25FbmQpO1xuICAgICAgICAgICAgc3dpcGVyLm9uU2xpZGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kID0gbnVsbDtcbiAgICAgICAgICAgIGRlbGV0ZSBzd2lwZXIub25TbGlkZVRvV3JhcHBlclRyYW5zaXRpb25FbmQ7XG4gICAgICAgICAgICBzd2lwZXIudHJhbnNpdGlvbkVuZChydW5DYWxsYmFja3MsIGRpcmVjdGlvbik7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBzd2lwZXIub25TbGlkZVRvV3JhcHBlclRyYW5zaXRpb25FbmQpO1xuICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRUcmFuc2l0aW9uRW5kJywgc3dpcGVyLm9uU2xpZGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2xpZGVUb0xvb3AoaW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKSB7XG4gICAgICBpZiAoaW5kZXggPT09IHZvaWQgMCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcGVlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHNwZWVkID0gdGhpcy5wYXJhbXMuc3BlZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAnc3RyaW5nJykge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGBpbmRleGAgYXJndW1lbnQgY29udmVydGVkIGZyb20gYHN0cmluZ2AgdG8gYG51bWJlcmAuXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBpbmRleEFzTnVtYmVyID0gcGFyc2VJbnQoaW5kZXgsIDEwKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERldGVybWluZXMgd2hldGhlciB0aGUgYGluZGV4YCBhcmd1bWVudCBpcyBhIHZhbGlkIGBudW1iZXJgXG4gICAgICAgICAqIGFmdGVyIGJlaW5nIGNvbnZlcnRlZCBmcm9tIHRoZSBgc3RyaW5nYCB0eXBlLlxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICovXG5cbiAgICAgICAgY29uc3QgaXNWYWxpZE51bWJlciA9IGlzRmluaXRlKGluZGV4QXNOdW1iZXIpO1xuXG4gICAgICAgIGlmICghaXNWYWxpZE51bWJlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHBhc3NlZC1pbiAnaW5kZXgnIChzdHJpbmcpIGNvdWxkbid0IGJlIGNvbnZlcnRlZCB0byAnbnVtYmVyJy4gWyR7aW5kZXh9XSBnaXZlbi5gKTtcbiAgICAgICAgfSAvLyBLbm93aW5nIHRoYXQgdGhlIGNvbnZlcnRlZCBgaW5kZXhgIGlzIGEgdmFsaWQgbnVtYmVyLFxuICAgICAgICAvLyB3ZSBjYW4gdXBkYXRlIHRoZSBvcmlnaW5hbCBhcmd1bWVudCdzIHZhbHVlLlxuXG5cbiAgICAgICAgaW5kZXggPSBpbmRleEFzTnVtYmVyO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgbGV0IG5ld0luZGV4ID0gaW5kZXg7XG5cbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgbmV3SW5kZXggKz0gc3dpcGVyLmxvb3BlZFNsaWRlcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN3aXBlci5zbGlkZVRvKG5ld0luZGV4LCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50IG5vLXVudXNlZC12YXJzOiBcIm9mZlwiICovXG4gICAgZnVuY3Rpb24gc2xpZGVOZXh0KHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKSB7XG4gICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICAgICAgfVxuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzID09PSB2b2lkIDApIHtcbiAgICAgICAgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYW5pbWF0aW5nLFxuICAgICAgICBlbmFibGVkLFxuICAgICAgICBwYXJhbXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBpZiAoIWVuYWJsZWQpIHJldHVybiBzd2lwZXI7XG4gICAgICBsZXQgcGVyR3JvdXAgPSBwYXJhbXMuc2xpZGVzUGVyR3JvdXA7XG5cbiAgICAgIGlmIChwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nICYmIHBhcmFtcy5zbGlkZXNQZXJHcm91cCA9PT0gMSAmJiBwYXJhbXMuc2xpZGVzUGVyR3JvdXBBdXRvKSB7XG4gICAgICAgIHBlckdyb3VwID0gTWF0aC5tYXgoc3dpcGVyLnNsaWRlc1BlclZpZXdEeW5hbWljKCdjdXJyZW50JywgdHJ1ZSksIDEpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmNyZW1lbnQgPSBzd2lwZXIuYWN0aXZlSW5kZXggPCBwYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwID8gMSA6IHBlckdyb3VwO1xuXG4gICAgICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICAgICAgaWYgKGFuaW1hdGluZyAmJiBwYXJhbXMubG9vcFByZXZlbnRzU2xpZGUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3dpcGVyLmxvb3BGaXgoKTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICAgICAgc3dpcGVyLl9jbGllbnRMZWZ0ID0gc3dpcGVyLiR3cmFwcGVyRWxbMF0uY2xpZW50TGVmdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5yZXdpbmQgJiYgc3dpcGVyLmlzRW5kKSB7XG4gICAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbygwLCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXggKyBpbmNyZW1lbnQsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IFwib2ZmXCIgKi9cbiAgICBmdW5jdGlvbiBzbGlkZVByZXYoc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpIHtcbiAgICAgIGlmIChzcGVlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHNwZWVkID0gdGhpcy5wYXJhbXMuc3BlZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIGFuaW1hdGluZyxcbiAgICAgICAgc25hcEdyaWQsXG4gICAgICAgIHNsaWRlc0dyaWQsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZSxcbiAgICAgICAgZW5hYmxlZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmICghZW5hYmxlZCkgcmV0dXJuIHN3aXBlcjtcblxuICAgICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICAgIGlmIChhbmltYXRpbmcgJiYgcGFyYW1zLmxvb3BQcmV2ZW50c1NsaWRlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHN3aXBlci5sb29wRml4KCk7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuXG4gICAgICAgIHN3aXBlci5fY2xpZW50TGVmdCA9IHN3aXBlci4kd3JhcHBlckVsWzBdLmNsaWVudExlZnQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRyYW5zbGF0ZSA9IHJ0bFRyYW5zbGF0ZSA/IHN3aXBlci50cmFuc2xhdGUgOiAtc3dpcGVyLnRyYW5zbGF0ZTtcblxuICAgICAgZnVuY3Rpb24gbm9ybWFsaXplKHZhbCkge1xuICAgICAgICBpZiAodmFsIDwgMCkgcmV0dXJuIC1NYXRoLmZsb29yKE1hdGguYWJzKHZhbCkpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih2YWwpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBub3JtYWxpemVkVHJhbnNsYXRlID0gbm9ybWFsaXplKHRyYW5zbGF0ZSk7XG4gICAgICBjb25zdCBub3JtYWxpemVkU25hcEdyaWQgPSBzbmFwR3JpZC5tYXAodmFsID0+IG5vcm1hbGl6ZSh2YWwpKTtcbiAgICAgIGxldCBwcmV2U25hcCA9IHNuYXBHcmlkW25vcm1hbGl6ZWRTbmFwR3JpZC5pbmRleE9mKG5vcm1hbGl6ZWRUcmFuc2xhdGUpIC0gMV07XG5cbiAgICAgIGlmICh0eXBlb2YgcHJldlNuYXAgPT09ICd1bmRlZmluZWQnICYmIHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIGxldCBwcmV2U25hcEluZGV4O1xuICAgICAgICBzbmFwR3JpZC5mb3JFYWNoKChzbmFwLCBzbmFwSW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAobm9ybWFsaXplZFRyYW5zbGF0ZSA+PSBzbmFwKSB7XG4gICAgICAgICAgICAvLyBwcmV2U25hcCA9IHNuYXA7XG4gICAgICAgICAgICBwcmV2U25hcEluZGV4ID0gc25hcEluZGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwcmV2U25hcEluZGV4ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHByZXZTbmFwID0gc25hcEdyaWRbcHJldlNuYXBJbmRleCA+IDAgPyBwcmV2U25hcEluZGV4IC0gMSA6IHByZXZTbmFwSW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBwcmV2SW5kZXggPSAwO1xuXG4gICAgICBpZiAodHlwZW9mIHByZXZTbmFwICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwcmV2SW5kZXggPSBzbGlkZXNHcmlkLmluZGV4T2YocHJldlNuYXApO1xuICAgICAgICBpZiAocHJldkluZGV4IDwgMCkgcHJldkluZGV4ID0gc3dpcGVyLmFjdGl2ZUluZGV4IC0gMTtcblxuICAgICAgICBpZiAocGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyAmJiBwYXJhbXMuc2xpZGVzUGVyR3JvdXAgPT09IDEgJiYgcGFyYW1zLnNsaWRlc1Blckdyb3VwQXV0bykge1xuICAgICAgICAgIHByZXZJbmRleCA9IHByZXZJbmRleCAtIHN3aXBlci5zbGlkZXNQZXJWaWV3RHluYW1pYygncHJldmlvdXMnLCB0cnVlKSArIDE7XG4gICAgICAgICAgcHJldkluZGV4ID0gTWF0aC5tYXgocHJldkluZGV4LCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLnJld2luZCAmJiBzd2lwZXIuaXNCZWdpbm5pbmcpIHtcbiAgICAgICAgY29uc3QgbGFzdEluZGV4ID0gc3dpcGVyLnBhcmFtcy52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkICYmIHN3aXBlci52aXJ0dWFsID8gc3dpcGVyLnZpcnR1YWwuc2xpZGVzLmxlbmd0aCAtIDEgOiBzd2lwZXIuc2xpZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbyhsYXN0SW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN3aXBlci5zbGlkZVRvKHByZXZJbmRleCwgc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpO1xuICAgIH1cblxuICAgIC8qIGVzbGludCBuby11bnVzZWQtdmFyczogXCJvZmZcIiAqL1xuICAgIGZ1bmN0aW9uIHNsaWRlUmVzZXQoc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpIHtcbiAgICAgIGlmIChzcGVlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHNwZWVkID0gdGhpcy5wYXJhbXMuc3BlZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgcmV0dXJuIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCwgc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpO1xuICAgIH1cblxuICAgIC8qIGVzbGludCBuby11bnVzZWQtdmFyczogXCJvZmZcIiAqL1xuICAgIGZ1bmN0aW9uIHNsaWRlVG9DbG9zZXN0KHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsLCB0aHJlc2hvbGQpIHtcbiAgICAgIGlmIChzcGVlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHNwZWVkID0gdGhpcy5wYXJhbXMuc3BlZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhyZXNob2xkID09PSB2b2lkIDApIHtcbiAgICAgICAgdGhyZXNob2xkID0gMC41O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgbGV0IGluZGV4ID0gc3dpcGVyLmFjdGl2ZUluZGV4O1xuICAgICAgY29uc3Qgc2tpcCA9IE1hdGgubWluKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwLCBpbmRleCk7XG4gICAgICBjb25zdCBzbmFwSW5kZXggPSBza2lwICsgTWF0aC5mbG9vcigoaW5kZXggLSBza2lwKSAvIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXApO1xuICAgICAgY29uc3QgdHJhbnNsYXRlID0gc3dpcGVyLnJ0bFRyYW5zbGF0ZSA/IHN3aXBlci50cmFuc2xhdGUgOiAtc3dpcGVyLnRyYW5zbGF0ZTtcblxuICAgICAgaWYgKHRyYW5zbGF0ZSA+PSBzd2lwZXIuc25hcEdyaWRbc25hcEluZGV4XSkge1xuICAgICAgICAvLyBUaGUgY3VycmVudCB0cmFuc2xhdGUgaXMgb24gb3IgYWZ0ZXIgdGhlIGN1cnJlbnQgc25hcCBpbmRleCwgc28gdGhlIGNob2ljZVxuICAgICAgICAvLyBpcyBiZXR3ZWVuIHRoZSBjdXJyZW50IGluZGV4IGFuZCB0aGUgb25lIGFmdGVyIGl0LlxuICAgICAgICBjb25zdCBjdXJyZW50U25hcCA9IHN3aXBlci5zbmFwR3JpZFtzbmFwSW5kZXhdO1xuICAgICAgICBjb25zdCBuZXh0U25hcCA9IHN3aXBlci5zbmFwR3JpZFtzbmFwSW5kZXggKyAxXTtcblxuICAgICAgICBpZiAodHJhbnNsYXRlIC0gY3VycmVudFNuYXAgPiAobmV4dFNuYXAgLSBjdXJyZW50U25hcCkgKiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICBpbmRleCArPSBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGUgY3VycmVudCB0cmFuc2xhdGUgaXMgYmVmb3JlIHRoZSBjdXJyZW50IHNuYXAgaW5kZXgsIHNvIHRoZSBjaG9pY2VcbiAgICAgICAgLy8gaXMgYmV0d2VlbiB0aGUgY3VycmVudCBpbmRleCBhbmQgdGhlIG9uZSBiZWZvcmUgaXQuXG4gICAgICAgIGNvbnN0IHByZXZTbmFwID0gc3dpcGVyLnNuYXBHcmlkW3NuYXBJbmRleCAtIDFdO1xuICAgICAgICBjb25zdCBjdXJyZW50U25hcCA9IHN3aXBlci5zbmFwR3JpZFtzbmFwSW5kZXhdO1xuXG4gICAgICAgIGlmICh0cmFuc2xhdGUgLSBwcmV2U25hcCA8PSAoY3VycmVudFNuYXAgLSBwcmV2U25hcCkgKiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICBpbmRleCAtPSBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGluZGV4ID0gTWF0aC5tYXgoaW5kZXgsIDApO1xuICAgICAgaW5kZXggPSBNYXRoLm1pbihpbmRleCwgc3dpcGVyLnNsaWRlc0dyaWQubGVuZ3RoIC0gMSk7XG4gICAgICByZXR1cm4gc3dpcGVyLnNsaWRlVG8oaW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzbGlkZVRvQ2xpY2tlZFNsaWRlKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICAkd3JhcHBlckVsXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgY29uc3Qgc2xpZGVzUGVyVmlldyA9IHBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgPyBzd2lwZXIuc2xpZGVzUGVyVmlld0R5bmFtaWMoKSA6IHBhcmFtcy5zbGlkZXNQZXJWaWV3O1xuICAgICAgbGV0IHNsaWRlVG9JbmRleCA9IHN3aXBlci5jbGlja2VkSW5kZXg7XG4gICAgICBsZXQgcmVhbEluZGV4O1xuXG4gICAgICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICAgICAgaWYgKHN3aXBlci5hbmltYXRpbmcpIHJldHVybjtcbiAgICAgICAgcmVhbEluZGV4ID0gcGFyc2VJbnQoJChzd2lwZXIuY2xpY2tlZFNsaWRlKS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgICAgIGlmIChzbGlkZVRvSW5kZXggPCBzd2lwZXIubG9vcGVkU2xpZGVzIC0gc2xpZGVzUGVyVmlldyAvIDIgfHwgc2xpZGVUb0luZGV4ID4gc3dpcGVyLnNsaWRlcy5sZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzICsgc2xpZGVzUGVyVmlldyAvIDIpIHtcbiAgICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgICBzbGlkZVRvSW5kZXggPSAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc31bZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke3JlYWxJbmRleH1cIl06bm90KC4ke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzfSlgKS5lcSgwKS5pbmRleCgpO1xuICAgICAgICAgICAgbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzbGlkZVRvSW5kZXgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNsaWRlVG9JbmRleCA+IHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gc2xpZGVzUGVyVmlldykge1xuICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgc2xpZGVUb0luZGV4ID0gJHdyYXBwZXJFbC5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9W2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtyZWFsSW5kZXh9XCJdOm5vdCguJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc30pYCkuZXEoMCkuaW5kZXgoKTtcbiAgICAgICAgICBuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzbGlkZVRvSW5kZXgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNsaWRlID0ge1xuICAgICAgc2xpZGVUbyxcbiAgICAgIHNsaWRlVG9Mb29wLFxuICAgICAgc2xpZGVOZXh0LFxuICAgICAgc2xpZGVQcmV2LFxuICAgICAgc2xpZGVSZXNldCxcbiAgICAgIHNsaWRlVG9DbG9zZXN0LFxuICAgICAgc2xpZGVUb0NsaWNrZWRTbGlkZVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsb29wQ3JlYXRlKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICAkd3JhcHBlckVsXG4gICAgICB9ID0gc3dpcGVyOyAvLyBSZW1vdmUgZHVwbGljYXRlZCBzbGlkZXNcblxuICAgICAgY29uc3QgJHNlbGVjdG9yID0gJHdyYXBwZXJFbC5jaGlsZHJlbigpLmxlbmd0aCA+IDAgPyAkKCR3cmFwcGVyRWwuY2hpbGRyZW4oKVswXS5wYXJlbnROb2RlKSA6ICR3cmFwcGVyRWw7XG4gICAgICAkc2VsZWN0b3IuY2hpbGRyZW4oYC4ke3BhcmFtcy5zbGlkZUNsYXNzfS4ke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzfWApLnJlbW92ZSgpO1xuICAgICAgbGV0IHNsaWRlcyA9ICRzZWxlY3Rvci5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9YCk7XG5cbiAgICAgIGlmIChwYXJhbXMubG9vcEZpbGxHcm91cFdpdGhCbGFuaykge1xuICAgICAgICBjb25zdCBibGFua1NsaWRlc051bSA9IHBhcmFtcy5zbGlkZXNQZXJHcm91cCAtIHNsaWRlcy5sZW5ndGggJSBwYXJhbXMuc2xpZGVzUGVyR3JvdXA7XG5cbiAgICAgICAgaWYgKGJsYW5rU2xpZGVzTnVtICE9PSBwYXJhbXMuc2xpZGVzUGVyR3JvdXApIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJsYW5rU2xpZGVzTnVtOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGJsYW5rTm9kZSA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLmFkZENsYXNzKGAke3BhcmFtcy5zbGlkZUNsYXNzfSAke3BhcmFtcy5zbGlkZUJsYW5rQ2xhc3N9YCk7XG4gICAgICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKGJsYW5rTm9kZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2xpZGVzID0gJHNlbGVjdG9yLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc31gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyAmJiAhcGFyYW1zLmxvb3BlZFNsaWRlcykgcGFyYW1zLmxvb3BlZFNsaWRlcyA9IHNsaWRlcy5sZW5ndGg7XG4gICAgICBzd2lwZXIubG9vcGVkU2xpZGVzID0gTWF0aC5jZWlsKHBhcnNlRmxvYXQocGFyYW1zLmxvb3BlZFNsaWRlcyB8fCBwYXJhbXMuc2xpZGVzUGVyVmlldywgMTApKTtcbiAgICAgIHN3aXBlci5sb29wZWRTbGlkZXMgKz0gcGFyYW1zLmxvb3BBZGRpdGlvbmFsU2xpZGVzO1xuXG4gICAgICBpZiAoc3dpcGVyLmxvb3BlZFNsaWRlcyA+IHNsaWRlcy5sZW5ndGggJiYgc3dpcGVyLnBhcmFtcy5sb29wZWRTbGlkZXNMaW1pdCkge1xuICAgICAgICBzd2lwZXIubG9vcGVkU2xpZGVzID0gc2xpZGVzLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJlcGVuZFNsaWRlcyA9IFtdO1xuICAgICAgY29uc3QgYXBwZW5kU2xpZGVzID0gW107XG4gICAgICBzbGlkZXMuZWFjaCgoZWwsIGluZGV4KSA9PiB7XG4gICAgICAgICQoZWwpLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JywgaW5kZXgpO1xuICAgICAgfSk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3dpcGVyLmxvb3BlZFNsaWRlczsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaSAtIE1hdGguZmxvb3IoaSAvIHNsaWRlcy5sZW5ndGgpICogc2xpZGVzLmxlbmd0aDtcbiAgICAgICAgYXBwZW5kU2xpZGVzLnB1c2goc2xpZGVzLmVxKGluZGV4KVswXSk7XG4gICAgICAgIHByZXBlbmRTbGlkZXMudW5zaGlmdChzbGlkZXMuZXEoc2xpZGVzLmxlbmd0aCAtIGluZGV4IC0gMSlbMF0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFwcGVuZFNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCQoYXBwZW5kU2xpZGVzW2ldLmNsb25lTm9kZSh0cnVlKSkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3MpKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgaSA9IHByZXBlbmRTbGlkZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgJHNlbGVjdG9yLnByZXBlbmQoJChwcmVwZW5kU2xpZGVzW2ldLmNsb25lTm9kZSh0cnVlKSkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3MpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb29wRml4KCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIHN3aXBlci5lbWl0KCdiZWZvcmVMb29wRml4Jyk7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFjdGl2ZUluZGV4LFxuICAgICAgICBzbGlkZXMsXG4gICAgICAgIGxvb3BlZFNsaWRlcyxcbiAgICAgICAgYWxsb3dTbGlkZVByZXYsXG4gICAgICAgIGFsbG93U2xpZGVOZXh0LFxuICAgICAgICBzbmFwR3JpZCxcbiAgICAgICAgcnRsVHJhbnNsYXRlOiBydGxcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBsZXQgbmV3SW5kZXg7XG4gICAgICBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPSB0cnVlO1xuICAgICAgc3dpcGVyLmFsbG93U2xpZGVOZXh0ID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHNuYXBUcmFuc2xhdGUgPSAtc25hcEdyaWRbYWN0aXZlSW5kZXhdO1xuICAgICAgY29uc3QgZGlmZiA9IHNuYXBUcmFuc2xhdGUgLSBzd2lwZXIuZ2V0VHJhbnNsYXRlKCk7IC8vIEZpeCBGb3IgTmVnYXRpdmUgT3ZlcnNsaWRpbmdcblxuICAgICAgaWYgKGFjdGl2ZUluZGV4IDwgbG9vcGVkU2xpZGVzKSB7XG4gICAgICAgIG5ld0luZGV4ID0gc2xpZGVzLmxlbmd0aCAtIGxvb3BlZFNsaWRlcyAqIDMgKyBhY3RpdmVJbmRleDtcbiAgICAgICAgbmV3SW5kZXggKz0gbG9vcGVkU2xpZGVzO1xuICAgICAgICBjb25zdCBzbGlkZUNoYW5nZWQgPSBzd2lwZXIuc2xpZGVUbyhuZXdJbmRleCwgMCwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIGlmIChzbGlkZUNoYW5nZWQgJiYgZGlmZiAhPT0gMCkge1xuICAgICAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUoKHJ0bCA/IC1zd2lwZXIudHJhbnNsYXRlIDogc3dpcGVyLnRyYW5zbGF0ZSkgLSBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhY3RpdmVJbmRleCA+PSBzbGlkZXMubGVuZ3RoIC0gbG9vcGVkU2xpZGVzKSB7XG4gICAgICAgIC8vIEZpeCBGb3IgUG9zaXRpdmUgT3ZlcnNsaWRpbmdcbiAgICAgICAgbmV3SW5kZXggPSAtc2xpZGVzLmxlbmd0aCArIGFjdGl2ZUluZGV4ICsgbG9vcGVkU2xpZGVzO1xuICAgICAgICBuZXdJbmRleCArPSBsb29wZWRTbGlkZXM7XG4gICAgICAgIGNvbnN0IHNsaWRlQ2hhbmdlZCA9IHN3aXBlci5zbGlkZVRvKG5ld0luZGV4LCAwLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKHNsaWRlQ2hhbmdlZCAmJiBkaWZmICE9PSAwKSB7XG4gICAgICAgICAgc3dpcGVyLnNldFRyYW5zbGF0ZSgocnRsID8gLXN3aXBlci50cmFuc2xhdGUgOiBzd2lwZXIudHJhbnNsYXRlKSAtIGRpZmYpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlUHJldiA9IGFsbG93U2xpZGVQcmV2O1xuICAgICAgc3dpcGVyLmFsbG93U2xpZGVOZXh0ID0gYWxsb3dTbGlkZU5leHQ7XG4gICAgICBzd2lwZXIuZW1pdCgnbG9vcEZpeCcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvb3BEZXN0cm95KCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgJHdyYXBwZXJFbCxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBzbGlkZXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc30uJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc30sLiR7cGFyYW1zLnNsaWRlQ2xhc3N9LiR7cGFyYW1zLnNsaWRlQmxhbmtDbGFzc31gKS5yZW1vdmUoKTtcbiAgICAgIHNsaWRlcy5yZW1vdmVBdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpO1xuICAgIH1cblxuICAgIHZhciBsb29wID0ge1xuICAgICAgbG9vcENyZWF0ZSxcbiAgICAgIGxvb3BGaXgsXG4gICAgICBsb29wRGVzdHJveVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXRHcmFiQ3Vyc29yKG1vdmluZykge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmIChzd2lwZXIuc3VwcG9ydC50b3VjaCB8fCAhc3dpcGVyLnBhcmFtcy5zaW11bGF0ZVRvdWNoIHx8IHN3aXBlci5wYXJhbXMud2F0Y2hPdmVyZmxvdyAmJiBzd2lwZXIuaXNMb2NrZWQgfHwgc3dpcGVyLnBhcmFtcy5jc3NNb2RlKSByZXR1cm47XG4gICAgICBjb25zdCBlbCA9IHN3aXBlci5wYXJhbXMudG91Y2hFdmVudHNUYXJnZXQgPT09ICdjb250YWluZXInID8gc3dpcGVyLmVsIDogc3dpcGVyLndyYXBwZXJFbDtcbiAgICAgIGVsLnN0eWxlLmN1cnNvciA9ICdtb3ZlJztcbiAgICAgIGVsLnN0eWxlLmN1cnNvciA9IG1vdmluZyA/ICdncmFiYmluZycgOiAnZ3JhYic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5zZXRHcmFiQ3Vyc29yKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcblxuICAgICAgaWYgKHN3aXBlci5zdXBwb3J0LnRvdWNoIHx8IHN3aXBlci5wYXJhbXMud2F0Y2hPdmVyZmxvdyAmJiBzd2lwZXIuaXNMb2NrZWQgfHwgc3dpcGVyLnBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyW3N3aXBlci5wYXJhbXMudG91Y2hFdmVudHNUYXJnZXQgPT09ICdjb250YWluZXInID8gJ2VsJyA6ICd3cmFwcGVyRWwnXS5zdHlsZS5jdXJzb3IgPSAnJztcbiAgICB9XG5cbiAgICB2YXIgZ3JhYkN1cnNvciA9IHtcbiAgICAgIHNldEdyYWJDdXJzb3IsXG4gICAgICB1bnNldEdyYWJDdXJzb3JcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY2xvc2VzdEVsZW1lbnQoc2VsZWN0b3IsIGJhc2UpIHtcbiAgICAgIGlmIChiYXNlID09PSB2b2lkIDApIHtcbiAgICAgICAgYmFzZSA9IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF9fY2xvc2VzdEZyb20oZWwpIHtcbiAgICAgICAgaWYgKCFlbCB8fCBlbCA9PT0gZ2V0RG9jdW1lbnQoKSB8fCBlbCA9PT0gZ2V0V2luZG93KCkpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoZWwuYXNzaWduZWRTbG90KSBlbCA9IGVsLmFzc2lnbmVkU2xvdDtcbiAgICAgICAgY29uc3QgZm91bmQgPSBlbC5jbG9zZXN0KHNlbGVjdG9yKTtcblxuICAgICAgICBpZiAoIWZvdW5kICYmICFlbC5nZXRSb290Tm9kZSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvdW5kIHx8IF9fY2xvc2VzdEZyb20oZWwuZ2V0Um9vdE5vZGUoKS5ob3N0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIF9fY2xvc2VzdEZyb20oYmFzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGV2ZW50KSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBjb25zdCBkYXRhID0gc3dpcGVyLnRvdWNoRXZlbnRzRGF0YTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICB0b3VjaGVzLFxuICAgICAgICBlbmFibGVkXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICAgIGlmIChzd2lwZXIuYW5pbWF0aW5nICYmIHBhcmFtcy5wcmV2ZW50SW50ZXJhY3Rpb25PblRyYW5zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXN3aXBlci5hbmltYXRpbmcgJiYgcGFyYW1zLmNzc01vZGUgJiYgcGFyYW1zLmxvb3ApIHtcbiAgICAgICAgc3dpcGVyLmxvb3BGaXgoKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGUgPSBldmVudDtcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQpIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XG4gICAgICBsZXQgJHRhcmdldEVsID0gJChlLnRhcmdldCk7XG5cbiAgICAgIGlmIChwYXJhbXMudG91Y2hFdmVudHNUYXJnZXQgPT09ICd3cmFwcGVyJykge1xuICAgICAgICBpZiAoISR0YXJnZXRFbC5jbG9zZXN0KHN3aXBlci53cmFwcGVyRWwpLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmlzVG91Y2hFdmVudCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hFdmVudCAmJiAnd2hpY2gnIGluIGUgJiYgZS53aGljaCA9PT0gMykgcmV0dXJuO1xuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hFdmVudCAmJiAnYnV0dG9uJyBpbiBlICYmIGUuYnV0dG9uID4gMCkgcmV0dXJuO1xuICAgICAgaWYgKGRhdGEuaXNUb3VjaGVkICYmIGRhdGEuaXNNb3ZlZCkgcmV0dXJuOyAvLyBjaGFuZ2UgdGFyZ2V0IGVsIGZvciBzaGFkb3cgcm9vdCBjb21wb25lbnRcblxuICAgICAgY29uc3Qgc3dpcGluZ0NsYXNzSGFzVmFsdWUgPSAhIXBhcmFtcy5ub1N3aXBpbmdDbGFzcyAmJiBwYXJhbXMubm9Td2lwaW5nQ2xhc3MgIT09ICcnO1xuXG4gICAgICBpZiAoc3dpcGluZ0NsYXNzSGFzVmFsdWUgJiYgZS50YXJnZXQgJiYgZS50YXJnZXQuc2hhZG93Um9vdCAmJiBldmVudC5wYXRoICYmIGV2ZW50LnBhdGhbMF0pIHtcbiAgICAgICAgJHRhcmdldEVsID0gJChldmVudC5wYXRoWzBdKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgbm9Td2lwaW5nU2VsZWN0b3IgPSBwYXJhbXMubm9Td2lwaW5nU2VsZWN0b3IgPyBwYXJhbXMubm9Td2lwaW5nU2VsZWN0b3IgOiBgLiR7cGFyYW1zLm5vU3dpcGluZ0NsYXNzfWA7XG4gICAgICBjb25zdCBpc1RhcmdldFNoYWRvdyA9ICEhKGUudGFyZ2V0ICYmIGUudGFyZ2V0LnNoYWRvd1Jvb3QpOyAvLyB1c2UgY2xvc2VzdEVsZW1lbnQgZm9yIHNoYWRvdyByb290IGVsZW1lbnQgdG8gZ2V0IHRoZSBhY3R1YWwgY2xvc2VzdCBmb3IgbmVzdGVkIHNoYWRvdyByb290IGVsZW1lbnRcblxuICAgICAgaWYgKHBhcmFtcy5ub1N3aXBpbmcgJiYgKGlzVGFyZ2V0U2hhZG93ID8gY2xvc2VzdEVsZW1lbnQobm9Td2lwaW5nU2VsZWN0b3IsICR0YXJnZXRFbFswXSkgOiAkdGFyZ2V0RWwuY2xvc2VzdChub1N3aXBpbmdTZWxlY3RvcilbMF0pKSB7XG4gICAgICAgIHN3aXBlci5hbGxvd0NsaWNrID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLnN3aXBlSGFuZGxlcikge1xuICAgICAgICBpZiAoISR0YXJnZXRFbC5jbG9zZXN0KHBhcmFtcy5zd2lwZUhhbmRsZXIpWzBdKSByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRvdWNoZXMuY3VycmVudFggPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyA/IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVg7XG4gICAgICB0b3VjaGVzLmN1cnJlbnRZID0gZS50eXBlID09PSAndG91Y2hzdGFydCcgPyBlLnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZO1xuICAgICAgY29uc3Qgc3RhcnRYID0gdG91Y2hlcy5jdXJyZW50WDtcbiAgICAgIGNvbnN0IHN0YXJ0WSA9IHRvdWNoZXMuY3VycmVudFk7IC8vIERvIE5PVCBzdGFydCBpZiBpT1MgZWRnZSBzd2lwZSBpcyBkZXRlY3RlZC4gT3RoZXJ3aXNlIGlPUyBhcHAgY2Fubm90IHN3aXBlLXRvLWdvLWJhY2sgYW55bW9yZVxuXG4gICAgICBjb25zdCBlZGdlU3dpcGVEZXRlY3Rpb24gPSBwYXJhbXMuZWRnZVN3aXBlRGV0ZWN0aW9uIHx8IHBhcmFtcy5pT1NFZGdlU3dpcGVEZXRlY3Rpb247XG4gICAgICBjb25zdCBlZGdlU3dpcGVUaHJlc2hvbGQgPSBwYXJhbXMuZWRnZVN3aXBlVGhyZXNob2xkIHx8IHBhcmFtcy5pT1NFZGdlU3dpcGVUaHJlc2hvbGQ7XG5cbiAgICAgIGlmIChlZGdlU3dpcGVEZXRlY3Rpb24gJiYgKHN0YXJ0WCA8PSBlZGdlU3dpcGVUaHJlc2hvbGQgfHwgc3RhcnRYID49IHdpbmRvdy5pbm5lcldpZHRoIC0gZWRnZVN3aXBlVGhyZXNob2xkKSkge1xuICAgICAgICBpZiAoZWRnZVN3aXBlRGV0ZWN0aW9uID09PSAncHJldmVudCcpIHtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuYXNzaWduKGRhdGEsIHtcbiAgICAgICAgaXNUb3VjaGVkOiB0cnVlLFxuICAgICAgICBpc01vdmVkOiBmYWxzZSxcbiAgICAgICAgYWxsb3dUb3VjaENhbGxiYWNrczogdHJ1ZSxcbiAgICAgICAgaXNTY3JvbGxpbmc6IHVuZGVmaW5lZCxcbiAgICAgICAgc3RhcnRNb3Zpbmc6IHVuZGVmaW5lZFxuICAgICAgfSk7XG4gICAgICB0b3VjaGVzLnN0YXJ0WCA9IHN0YXJ0WDtcbiAgICAgIHRvdWNoZXMuc3RhcnRZID0gc3RhcnRZO1xuICAgICAgZGF0YS50b3VjaFN0YXJ0VGltZSA9IG5vdygpO1xuICAgICAgc3dpcGVyLmFsbG93Q2xpY2sgPSB0cnVlO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNpemUoKTtcbiAgICAgIHN3aXBlci5zd2lwZURpcmVjdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgIGlmIChwYXJhbXMudGhyZXNob2xkID4gMCkgZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUgPSBmYWxzZTtcblxuICAgICAgaWYgKGUudHlwZSAhPT0gJ3RvdWNoc3RhcnQnKSB7XG4gICAgICAgIGxldCBwcmV2ZW50RGVmYXVsdCA9IHRydWU7XG5cbiAgICAgICAgaWYgKCR0YXJnZXRFbC5pcyhkYXRhLmZvY3VzYWJsZUVsZW1lbnRzKSkge1xuICAgICAgICAgIHByZXZlbnREZWZhdWx0ID0gZmFsc2U7XG5cbiAgICAgICAgICBpZiAoJHRhcmdldEVsWzBdLm5vZGVOYW1lID09PSAnU0VMRUNUJykge1xuICAgICAgICAgICAgZGF0YS5pc1RvdWNoZWQgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpLmlzKGRhdGEuZm9jdXNhYmxlRWxlbWVudHMpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09ICR0YXJnZXRFbFswXSkge1xuICAgICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hvdWxkUHJldmVudERlZmF1bHQgPSBwcmV2ZW50RGVmYXVsdCAmJiBzd2lwZXIuYWxsb3dUb3VjaE1vdmUgJiYgcGFyYW1zLnRvdWNoU3RhcnRQcmV2ZW50RGVmYXVsdDtcblxuICAgICAgICBpZiAoKHBhcmFtcy50b3VjaFN0YXJ0Rm9yY2VQcmV2ZW50RGVmYXVsdCB8fCBzaG91bGRQcmV2ZW50RGVmYXVsdCkgJiYgISR0YXJnZXRFbFswXS5pc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5mcmVlTW9kZSAmJiBzd2lwZXIucGFyYW1zLmZyZWVNb2RlLmVuYWJsZWQgJiYgc3dpcGVyLmZyZWVNb2RlICYmIHN3aXBlci5hbmltYXRpbmcgJiYgIXBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHN3aXBlci5mcmVlTW9kZS5vblRvdWNoU3RhcnQoKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXQoJ3RvdWNoU3RhcnQnLCBlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblRvdWNoTW92ZShldmVudCkge1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGRhdGEgPSBzd2lwZXIudG91Y2hFdmVudHNEYXRhO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHRvdWNoZXMsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICBlbmFibGVkXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG4gICAgICBsZXQgZSA9IGV2ZW50O1xuICAgICAgaWYgKGUub3JpZ2luYWxFdmVudCkgZSA9IGUub3JpZ2luYWxFdmVudDtcblxuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hlZCkge1xuICAgICAgICBpZiAoZGF0YS5zdGFydE1vdmluZyAmJiBkYXRhLmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ3RvdWNoTW92ZU9wcG9zaXRlJywgZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmlzVG91Y2hFdmVudCAmJiBlLnR5cGUgIT09ICd0b3VjaG1vdmUnKSByZXR1cm47XG4gICAgICBjb25zdCB0YXJnZXRUb3VjaCA9IGUudHlwZSA9PT0gJ3RvdWNobW92ZScgJiYgZS50YXJnZXRUb3VjaGVzICYmIChlLnRhcmdldFRvdWNoZXNbMF0gfHwgZS5jaGFuZ2VkVG91Y2hlc1swXSk7XG4gICAgICBjb25zdCBwYWdlWCA9IGUudHlwZSA9PT0gJ3RvdWNobW92ZScgPyB0YXJnZXRUb3VjaC5wYWdlWCA6IGUucGFnZVg7XG4gICAgICBjb25zdCBwYWdlWSA9IGUudHlwZSA9PT0gJ3RvdWNobW92ZScgPyB0YXJnZXRUb3VjaC5wYWdlWSA6IGUucGFnZVk7XG5cbiAgICAgIGlmIChlLnByZXZlbnRlZEJ5TmVzdGVkU3dpcGVyKSB7XG4gICAgICAgIHRvdWNoZXMuc3RhcnRYID0gcGFnZVg7XG4gICAgICAgIHRvdWNoZXMuc3RhcnRZID0gcGFnZVk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzd2lwZXIuYWxsb3dUb3VjaE1vdmUpIHtcbiAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5pcyhkYXRhLmZvY3VzYWJsZUVsZW1lbnRzKSkge1xuICAgICAgICAgIHN3aXBlci5hbGxvd0NsaWNrID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5pc1RvdWNoZWQpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHRvdWNoZXMsIHtcbiAgICAgICAgICAgIHN0YXJ0WDogcGFnZVgsXG4gICAgICAgICAgICBzdGFydFk6IHBhZ2VZLFxuICAgICAgICAgICAgY3VycmVudFg6IHBhZ2VYLFxuICAgICAgICAgICAgY3VycmVudFk6IHBhZ2VZXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZGF0YS50b3VjaFN0YXJ0VGltZSA9IG5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5pc1RvdWNoRXZlbnQgJiYgcGFyYW1zLnRvdWNoUmVsZWFzZU9uRWRnZXMgJiYgIXBhcmFtcy5sb29wKSB7XG4gICAgICAgIGlmIChzd2lwZXIuaXNWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgLy8gVmVydGljYWxcbiAgICAgICAgICBpZiAocGFnZVkgPCB0b3VjaGVzLnN0YXJ0WSAmJiBzd2lwZXIudHJhbnNsYXRlIDw9IHN3aXBlci5tYXhUcmFuc2xhdGUoKSB8fCBwYWdlWSA+IHRvdWNoZXMuc3RhcnRZICYmIHN3aXBlci50cmFuc2xhdGUgPj0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgICAgICAgICBkYXRhLmlzVG91Y2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZGF0YS5pc01vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBhZ2VYIDwgdG91Y2hlcy5zdGFydFggJiYgc3dpcGVyLnRyYW5zbGF0ZSA8PSBzd2lwZXIubWF4VHJhbnNsYXRlKCkgfHwgcGFnZVggPiB0b3VjaGVzLnN0YXJ0WCAmJiBzd2lwZXIudHJhbnNsYXRlID49IHN3aXBlci5taW5UcmFuc2xhdGUoKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5pc1RvdWNoRXZlbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgJChlLnRhcmdldCkuaXMoZGF0YS5mb2N1c2FibGVFbGVtZW50cykpIHtcbiAgICAgICAgICBkYXRhLmlzTW92ZWQgPSB0cnVlO1xuICAgICAgICAgIHN3aXBlci5hbGxvd0NsaWNrID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmFsbG93VG91Y2hDYWxsYmFja3MpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3RvdWNoTW92ZScsIGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47XG4gICAgICB0b3VjaGVzLmN1cnJlbnRYID0gcGFnZVg7XG4gICAgICB0b3VjaGVzLmN1cnJlbnRZID0gcGFnZVk7XG4gICAgICBjb25zdCBkaWZmWCA9IHRvdWNoZXMuY3VycmVudFggLSB0b3VjaGVzLnN0YXJ0WDtcbiAgICAgIGNvbnN0IGRpZmZZID0gdG91Y2hlcy5jdXJyZW50WSAtIHRvdWNoZXMuc3RhcnRZO1xuICAgICAgaWYgKHN3aXBlci5wYXJhbXMudGhyZXNob2xkICYmIE1hdGguc3FydChkaWZmWCAqKiAyICsgZGlmZlkgKiogMikgPCBzd2lwZXIucGFyYW1zLnRocmVzaG9sZCkgcmV0dXJuO1xuXG4gICAgICBpZiAodHlwZW9mIGRhdGEuaXNTY3JvbGxpbmcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGxldCB0b3VjaEFuZ2xlO1xuXG4gICAgICAgIGlmIChzd2lwZXIuaXNIb3Jpem9udGFsKCkgJiYgdG91Y2hlcy5jdXJyZW50WSA9PT0gdG91Y2hlcy5zdGFydFkgfHwgc3dpcGVyLmlzVmVydGljYWwoKSAmJiB0b3VjaGVzLmN1cnJlbnRYID09PSB0b3VjaGVzLnN0YXJ0WCkge1xuICAgICAgICAgIGRhdGEuaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICBpZiAoZGlmZlggKiBkaWZmWCArIGRpZmZZICogZGlmZlkgPj0gMjUpIHtcbiAgICAgICAgICAgIHRvdWNoQW5nbGUgPSBNYXRoLmF0YW4yKE1hdGguYWJzKGRpZmZZKSwgTWF0aC5hYnMoZGlmZlgpKSAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgICAgICBkYXRhLmlzU2Nyb2xsaW5nID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gdG91Y2hBbmdsZSA+IHBhcmFtcy50b3VjaEFuZ2xlIDogOTAgLSB0b3VjaEFuZ2xlID4gcGFyYW1zLnRvdWNoQW5nbGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCd0b3VjaE1vdmVPcHBvc2l0ZScsIGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGRhdGEuc3RhcnRNb3ZpbmcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0b3VjaGVzLmN1cnJlbnRYICE9PSB0b3VjaGVzLnN0YXJ0WCB8fCB0b3VjaGVzLmN1cnJlbnRZICE9PSB0b3VjaGVzLnN0YXJ0WSkge1xuICAgICAgICAgIGRhdGEuc3RhcnRNb3ZpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhLmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgIGRhdGEuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFkYXRhLnN0YXJ0TW92aW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmFsbG93Q2xpY2sgPSBmYWxzZTtcblxuICAgICAgaWYgKCFwYXJhbXMuY3NzTW9kZSAmJiBlLmNhbmNlbGFibGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLnRvdWNoTW92ZVN0b3BQcm9wYWdhdGlvbiAmJiAhcGFyYW1zLm5lc3RlZCkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRhdGEuaXNNb3ZlZCkge1xuICAgICAgICBpZiAocGFyYW1zLmxvb3AgJiYgIXBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgICAgc3dpcGVyLmxvb3BGaXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuc3RhcnRUcmFuc2xhdGUgPSBzd2lwZXIuZ2V0VHJhbnNsYXRlKCk7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKDApO1xuXG4gICAgICAgIGlmIChzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWwudHJpZ2dlcignd2Via2l0VHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kJyk7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLmFsbG93TW9tZW50dW1Cb3VuY2UgPSBmYWxzZTsgLy8gR3JhYiBDdXJzb3JcblxuICAgICAgICBpZiAocGFyYW1zLmdyYWJDdXJzb3IgJiYgKHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9PT0gdHJ1ZSB8fCBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPT09IHRydWUpKSB7XG4gICAgICAgICAgc3dpcGVyLnNldEdyYWJDdXJzb3IodHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuZW1pdCgnc2xpZGVyRmlyc3RNb3ZlJywgZSk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KCdzbGlkZXJNb3ZlJywgZSk7XG4gICAgICBkYXRhLmlzTW92ZWQgPSB0cnVlO1xuICAgICAgbGV0IGRpZmYgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBkaWZmWCA6IGRpZmZZO1xuICAgICAgdG91Y2hlcy5kaWZmID0gZGlmZjtcbiAgICAgIGRpZmYgKj0gcGFyYW1zLnRvdWNoUmF0aW87XG4gICAgICBpZiAocnRsKSBkaWZmID0gLWRpZmY7XG4gICAgICBzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPSBkaWZmID4gMCA/ICdwcmV2JyA6ICduZXh0JztcbiAgICAgIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRpZmYgKyBkYXRhLnN0YXJ0VHJhbnNsYXRlO1xuICAgICAgbGV0IGRpc2FibGVQYXJlbnRTd2lwZXIgPSB0cnVlO1xuICAgICAgbGV0IHJlc2lzdGFuY2VSYXRpbyA9IHBhcmFtcy5yZXNpc3RhbmNlUmF0aW87XG5cbiAgICAgIGlmIChwYXJhbXMudG91Y2hSZWxlYXNlT25FZGdlcykge1xuICAgICAgICByZXNpc3RhbmNlUmF0aW8gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlmZiA+IDAgJiYgZGF0YS5jdXJyZW50VHJhbnNsYXRlID4gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgICAgIGRpc2FibGVQYXJlbnRTd2lwZXIgPSBmYWxzZTtcbiAgICAgICAgaWYgKHBhcmFtcy5yZXNpc3RhbmNlKSBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPSBzd2lwZXIubWluVHJhbnNsYXRlKCkgLSAxICsgKC1zd2lwZXIubWluVHJhbnNsYXRlKCkgKyBkYXRhLnN0YXJ0VHJhbnNsYXRlICsgZGlmZikgKiogcmVzaXN0YW5jZVJhdGlvO1xuICAgICAgfSBlbHNlIGlmIChkaWZmIDwgMCAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPCBzd2lwZXIubWF4VHJhbnNsYXRlKCkpIHtcbiAgICAgICAgZGlzYWJsZVBhcmVudFN3aXBlciA9IGZhbHNlO1xuICAgICAgICBpZiAocGFyYW1zLnJlc2lzdGFuY2UpIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKSArIDEgLSAoc3dpcGVyLm1heFRyYW5zbGF0ZSgpIC0gZGF0YS5zdGFydFRyYW5zbGF0ZSAtIGRpZmYpICoqIHJlc2lzdGFuY2VSYXRpbztcbiAgICAgIH1cblxuICAgICAgaWYgKGRpc2FibGVQYXJlbnRTd2lwZXIpIHtcbiAgICAgICAgZS5wcmV2ZW50ZWRCeU5lc3RlZFN3aXBlciA9IHRydWU7XG4gICAgICB9IC8vIERpcmVjdGlvbnMgbG9ja3NcblxuXG4gICAgICBpZiAoIXN3aXBlci5hbGxvd1NsaWRlTmV4dCAmJiBzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICduZXh0JyAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPCBkYXRhLnN0YXJ0VHJhbnNsYXRlKSB7XG4gICAgICAgIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRhdGEuc3RhcnRUcmFuc2xhdGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghc3dpcGVyLmFsbG93U2xpZGVQcmV2ICYmIHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ3ByZXYnICYmIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA+IGRhdGEuc3RhcnRUcmFuc2xhdGUpIHtcbiAgICAgICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzd2lwZXIuYWxsb3dTbGlkZVByZXYgJiYgIXN3aXBlci5hbGxvd1NsaWRlTmV4dCkge1xuICAgICAgICBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPSBkYXRhLnN0YXJ0VHJhbnNsYXRlO1xuICAgICAgfSAvLyBUaHJlc2hvbGRcblxuXG4gICAgICBpZiAocGFyYW1zLnRocmVzaG9sZCA+IDApIHtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRpZmYpID4gcGFyYW1zLnRocmVzaG9sZCB8fCBkYXRhLmFsbG93VGhyZXNob2xkTW92ZSkge1xuICAgICAgICAgIGlmICghZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUpIHtcbiAgICAgICAgICAgIGRhdGEuYWxsb3dUaHJlc2hvbGRNb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRvdWNoZXMuc3RhcnRYID0gdG91Y2hlcy5jdXJyZW50WDtcbiAgICAgICAgICAgIHRvdWNoZXMuc3RhcnRZID0gdG91Y2hlcy5jdXJyZW50WTtcbiAgICAgICAgICAgIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRhdGEuc3RhcnRUcmFuc2xhdGU7XG4gICAgICAgICAgICB0b3VjaGVzLmRpZmYgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyB0b3VjaGVzLmN1cnJlbnRYIC0gdG91Y2hlcy5zdGFydFggOiB0b3VjaGVzLmN1cnJlbnRZIC0gdG91Y2hlcy5zdGFydFk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRhdGEuc3RhcnRUcmFuc2xhdGU7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghcGFyYW1zLmZvbGxvd0ZpbmdlciB8fCBwYXJhbXMuY3NzTW9kZSkgcmV0dXJuOyAvLyBVcGRhdGUgYWN0aXZlIGluZGV4IGluIGZyZWUgbW9kZVxuXG4gICAgICBpZiAocGFyYW1zLmZyZWVNb2RlICYmIHBhcmFtcy5mcmVlTW9kZS5lbmFibGVkICYmIHN3aXBlci5mcmVlTW9kZSB8fCBwYXJhbXMud2F0Y2hTbGlkZXNQcm9ncmVzcykge1xuICAgICAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZnJlZU1vZGUgJiYgcGFyYW1zLmZyZWVNb2RlLmVuYWJsZWQgJiYgc3dpcGVyLmZyZWVNb2RlKSB7XG4gICAgICAgIHN3aXBlci5mcmVlTW9kZS5vblRvdWNoTW92ZSgpO1xuICAgICAgfSAvLyBVcGRhdGUgcHJvZ3Jlc3NcblxuXG4gICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoZGF0YS5jdXJyZW50VHJhbnNsYXRlKTsgLy8gVXBkYXRlIHRyYW5zbGF0ZVxuXG4gICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKGRhdGEuY3VycmVudFRyYW5zbGF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Ub3VjaEVuZChldmVudCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGRhdGEgPSBzd2lwZXIudG91Y2hFdmVudHNEYXRhO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHRvdWNoZXMsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICBzbGlkZXNHcmlkLFxuICAgICAgICBlbmFibGVkXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG4gICAgICBsZXQgZSA9IGV2ZW50O1xuICAgICAgaWYgKGUub3JpZ2luYWxFdmVudCkgZSA9IGUub3JpZ2luYWxFdmVudDtcblxuICAgICAgaWYgKGRhdGEuYWxsb3dUb3VjaENhbGxiYWNrcykge1xuICAgICAgICBzd2lwZXIuZW1pdCgndG91Y2hFbmQnLCBlKTtcbiAgICAgIH1cblxuICAgICAgZGF0YS5hbGxvd1RvdWNoQ2FsbGJhY2tzID0gZmFsc2U7XG5cbiAgICAgIGlmICghZGF0YS5pc1RvdWNoZWQpIHtcbiAgICAgICAgaWYgKGRhdGEuaXNNb3ZlZCAmJiBwYXJhbXMuZ3JhYkN1cnNvcikge1xuICAgICAgICAgIHN3aXBlci5zZXRHcmFiQ3Vyc29yKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuaXNNb3ZlZCA9IGZhbHNlO1xuICAgICAgICBkYXRhLnN0YXJ0TW92aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gUmV0dXJuIEdyYWIgQ3Vyc29yXG5cblxuICAgICAgaWYgKHBhcmFtcy5ncmFiQ3Vyc29yICYmIGRhdGEuaXNNb3ZlZCAmJiBkYXRhLmlzVG91Y2hlZCAmJiAoc3dpcGVyLmFsbG93U2xpZGVOZXh0ID09PSB0cnVlIHx8IHN3aXBlci5hbGxvd1NsaWRlUHJldiA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgc3dpcGVyLnNldEdyYWJDdXJzb3IoZmFsc2UpO1xuICAgICAgfSAvLyBUaW1lIGRpZmZcblxuXG4gICAgICBjb25zdCB0b3VjaEVuZFRpbWUgPSBub3coKTtcbiAgICAgIGNvbnN0IHRpbWVEaWZmID0gdG91Y2hFbmRUaW1lIC0gZGF0YS50b3VjaFN0YXJ0VGltZTsgLy8gVGFwLCBkb3VibGVUYXAsIENsaWNrXG5cbiAgICAgIGlmIChzd2lwZXIuYWxsb3dDbGljaykge1xuICAgICAgICBjb25zdCBwYXRoVHJlZSA9IGUucGF0aCB8fCBlLmNvbXBvc2VkUGF0aCAmJiBlLmNvbXBvc2VkUGF0aCgpO1xuICAgICAgICBzd2lwZXIudXBkYXRlQ2xpY2tlZFNsaWRlKHBhdGhUcmVlICYmIHBhdGhUcmVlWzBdIHx8IGUudGFyZ2V0KTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3RhcCBjbGljaycsIGUpO1xuXG4gICAgICAgIGlmICh0aW1lRGlmZiA8IDMwMCAmJiB0b3VjaEVuZFRpbWUgLSBkYXRhLmxhc3RDbGlja1RpbWUgPCAzMDApIHtcbiAgICAgICAgICBzd2lwZXIuZW1pdCgnZG91YmxlVGFwIGRvdWJsZUNsaWNrJywgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZGF0YS5sYXN0Q2xpY2tUaW1lID0gbm93KCk7XG4gICAgICBuZXh0VGljaygoKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyLmRlc3Ryb3llZCkgc3dpcGVyLmFsbG93Q2xpY2sgPSB0cnVlO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghZGF0YS5pc1RvdWNoZWQgfHwgIWRhdGEuaXNNb3ZlZCB8fCAhc3dpcGVyLnN3aXBlRGlyZWN0aW9uIHx8IHRvdWNoZXMuZGlmZiA9PT0gMCB8fCBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPT09IGRhdGEuc3RhcnRUcmFuc2xhdGUpIHtcbiAgICAgICAgZGF0YS5pc1RvdWNoZWQgPSBmYWxzZTtcbiAgICAgICAgZGF0YS5pc01vdmVkID0gZmFsc2U7XG4gICAgICAgIGRhdGEuc3RhcnRNb3ZpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmlzVG91Y2hlZCA9IGZhbHNlO1xuICAgICAgZGF0YS5pc01vdmVkID0gZmFsc2U7XG4gICAgICBkYXRhLnN0YXJ0TW92aW5nID0gZmFsc2U7XG4gICAgICBsZXQgY3VycmVudFBvcztcblxuICAgICAgaWYgKHBhcmFtcy5mb2xsb3dGaW5nZXIpIHtcbiAgICAgICAgY3VycmVudFBvcyA9IHJ0bCA/IHN3aXBlci50cmFuc2xhdGUgOiAtc3dpcGVyLnRyYW5zbGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnRQb3MgPSAtZGF0YS5jdXJyZW50VHJhbnNsYXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5mcmVlTW9kZSAmJiBwYXJhbXMuZnJlZU1vZGUuZW5hYmxlZCkge1xuICAgICAgICBzd2lwZXIuZnJlZU1vZGUub25Ub3VjaEVuZCh7XG4gICAgICAgICAgY3VycmVudFBvc1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBGaW5kIGN1cnJlbnQgc2xpZGVcblxuXG4gICAgICBsZXQgc3RvcEluZGV4ID0gMDtcbiAgICAgIGxldCBncm91cFNpemUgPSBzd2lwZXIuc2xpZGVzU2l6ZXNHcmlkWzBdO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNsaWRlc0dyaWQubGVuZ3RoOyBpICs9IGkgPCBwYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwID8gMSA6IHBhcmFtcy5zbGlkZXNQZXJHcm91cCkge1xuICAgICAgICBjb25zdCBpbmNyZW1lbnQgPSBpIDwgcGFyYW1zLnNsaWRlc1Blckdyb3VwU2tpcCAtIDEgPyAxIDogcGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc2xpZGVzR3JpZFtpICsgaW5jcmVtZW50XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBpZiAoY3VycmVudFBvcyA+PSBzbGlkZXNHcmlkW2ldICYmIGN1cnJlbnRQb3MgPCBzbGlkZXNHcmlkW2kgKyBpbmNyZW1lbnRdKSB7XG4gICAgICAgICAgICBzdG9wSW5kZXggPSBpO1xuICAgICAgICAgICAgZ3JvdXBTaXplID0gc2xpZGVzR3JpZFtpICsgaW5jcmVtZW50XSAtIHNsaWRlc0dyaWRbaV07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQb3MgPj0gc2xpZGVzR3JpZFtpXSkge1xuICAgICAgICAgIHN0b3BJbmRleCA9IGk7XG4gICAgICAgICAgZ3JvdXBTaXplID0gc2xpZGVzR3JpZFtzbGlkZXNHcmlkLmxlbmd0aCAtIDFdIC0gc2xpZGVzR3JpZFtzbGlkZXNHcmlkLmxlbmd0aCAtIDJdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCByZXdpbmRGaXJzdEluZGV4ID0gbnVsbDtcbiAgICAgIGxldCByZXdpbmRMYXN0SW5kZXggPSBudWxsO1xuXG4gICAgICBpZiAocGFyYW1zLnJld2luZCkge1xuICAgICAgICBpZiAoc3dpcGVyLmlzQmVnaW5uaW5nKSB7XG4gICAgICAgICAgcmV3aW5kTGFzdEluZGV4ID0gc3dpcGVyLnBhcmFtcy52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkICYmIHN3aXBlci52aXJ0dWFsID8gc3dpcGVyLnZpcnR1YWwuc2xpZGVzLmxlbmd0aCAtIDEgOiBzd2lwZXIuc2xpZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH0gZWxzZSBpZiAoc3dpcGVyLmlzRW5kKSB7XG4gICAgICAgICAgcmV3aW5kRmlyc3RJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gRmluZCBjdXJyZW50IHNsaWRlIHNpemVcblxuXG4gICAgICBjb25zdCByYXRpbyA9IChjdXJyZW50UG9zIC0gc2xpZGVzR3JpZFtzdG9wSW5kZXhdKSAvIGdyb3VwU2l6ZTtcbiAgICAgIGNvbnN0IGluY3JlbWVudCA9IHN0b3BJbmRleCA8IHBhcmFtcy5zbGlkZXNQZXJHcm91cFNraXAgLSAxID8gMSA6IHBhcmFtcy5zbGlkZXNQZXJHcm91cDtcblxuICAgICAgaWYgKHRpbWVEaWZmID4gcGFyYW1zLmxvbmdTd2lwZXNNcykge1xuICAgICAgICAvLyBMb25nIHRvdWNoZXNcbiAgICAgICAgaWYgKCFwYXJhbXMubG9uZ1N3aXBlcykge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG4gICAgICAgICAgaWYgKHJhdGlvID49IHBhcmFtcy5sb25nU3dpcGVzUmF0aW8pIHN3aXBlci5zbGlkZVRvKHBhcmFtcy5yZXdpbmQgJiYgc3dpcGVyLmlzRW5kID8gcmV3aW5kRmlyc3RJbmRleCA6IHN0b3BJbmRleCArIGluY3JlbWVudCk7ZWxzZSBzd2lwZXIuc2xpZGVUbyhzdG9wSW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ3ByZXYnKSB7XG4gICAgICAgICAgaWYgKHJhdGlvID4gMSAtIHBhcmFtcy5sb25nU3dpcGVzUmF0aW8pIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN0b3BJbmRleCArIGluY3JlbWVudCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXdpbmRMYXN0SW5kZXggIT09IG51bGwgJiYgcmF0aW8gPCAwICYmIE1hdGguYWJzKHJhdGlvKSA+IHBhcmFtcy5sb25nU3dpcGVzUmF0aW8pIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHJld2luZExhc3RJbmRleCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN0b3BJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTaG9ydCBzd2lwZXNcbiAgICAgICAgaWYgKCFwYXJhbXMuc2hvcnRTd2lwZXMpIHtcbiAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzTmF2QnV0dG9uVGFyZ2V0ID0gc3dpcGVyLm5hdmlnYXRpb24gJiYgKGUudGFyZ2V0ID09PSBzd2lwZXIubmF2aWdhdGlvbi5uZXh0RWwgfHwgZS50YXJnZXQgPT09IHN3aXBlci5uYXZpZ2F0aW9uLnByZXZFbCk7XG5cbiAgICAgICAgaWYgKCFpc05hdkJ1dHRvblRhcmdldCkge1xuICAgICAgICAgIGlmIChzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICduZXh0Jykge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8ocmV3aW5kRmlyc3RJbmRleCAhPT0gbnVsbCA/IHJld2luZEZpcnN0SW5kZXggOiBzdG9wSW5kZXggKyBpbmNyZW1lbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICdwcmV2Jykge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8ocmV3aW5kTGFzdEluZGV4ICE9PSBudWxsID8gcmV3aW5kTGFzdEluZGV4IDogc3RvcEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZS50YXJnZXQgPT09IHN3aXBlci5uYXZpZ2F0aW9uLm5leHRFbCkge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN0b3BJbmRleCArIGluY3JlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uUmVzaXplKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBlbFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmIChlbCAmJiBlbC5vZmZzZXRXaWR0aCA9PT0gMCkgcmV0dXJuOyAvLyBCcmVha3BvaW50c1xuXG4gICAgICBpZiAocGFyYW1zLmJyZWFrcG9pbnRzKSB7XG4gICAgICAgIHN3aXBlci5zZXRCcmVha3BvaW50KCk7XG4gICAgICB9IC8vIFNhdmUgbG9ja3NcblxuXG4gICAgICBjb25zdCB7XG4gICAgICAgIGFsbG93U2xpZGVOZXh0LFxuICAgICAgICBhbGxvd1NsaWRlUHJldixcbiAgICAgICAgc25hcEdyaWRcbiAgICAgIH0gPSBzd2lwZXI7IC8vIERpc2FibGUgbG9ja3Mgb24gcmVzaXplXG5cbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9IHRydWU7XG4gICAgICBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPSB0cnVlO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNpemUoKTtcbiAgICAgIHN3aXBlci51cGRhdGVTbGlkZXMoKTtcbiAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG5cbiAgICAgIGlmICgocGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyB8fCBwYXJhbXMuc2xpZGVzUGVyVmlldyA+IDEpICYmIHN3aXBlci5pc0VuZCAmJiAhc3dpcGVyLmlzQmVnaW5uaW5nICYmICFzd2lwZXIucGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gMSwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLmFjdGl2ZUluZGV4LCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzd2lwZXIuYXV0b3BsYXkgJiYgc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcgJiYgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCkge1xuICAgICAgICBzd2lwZXIuYXV0b3BsYXkucnVuKCk7XG4gICAgICB9IC8vIFJldHVybiBsb2NrcyBhZnRlciByZXNpemVcblxuXG4gICAgICBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPSBhbGxvd1NsaWRlUHJldjtcbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9IGFsbG93U2xpZGVOZXh0O1xuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy53YXRjaE92ZXJmbG93ICYmIHNuYXBHcmlkICE9PSBzd2lwZXIuc25hcEdyaWQpIHtcbiAgICAgICAgc3dpcGVyLmNoZWNrT3ZlcmZsb3coKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkNsaWNrKGUpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoIXN3aXBlci5lbmFibGVkKSByZXR1cm47XG5cbiAgICAgIGlmICghc3dpcGVyLmFsbG93Q2xpY2spIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMucHJldmVudENsaWNrcykgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLnByZXZlbnRDbGlja3NQcm9wYWdhdGlvbiAmJiBzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25TY3JvbGwoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICB3cmFwcGVyRWwsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZSxcbiAgICAgICAgZW5hYmxlZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmICghZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgc3dpcGVyLnByZXZpb3VzVHJhbnNsYXRlID0gc3dpcGVyLnRyYW5zbGF0ZTtcblxuICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICBzd2lwZXIudHJhbnNsYXRlID0gLXdyYXBwZXJFbC5zY3JvbGxMZWZ0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLnRyYW5zbGF0ZSA9IC13cmFwcGVyRWwuc2Nyb2xsVG9wO1xuICAgICAgfSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcblxuXG4gICAgICBpZiAoc3dpcGVyLnRyYW5zbGF0ZSA9PT0gMCkgc3dpcGVyLnRyYW5zbGF0ZSA9IDA7XG4gICAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICBsZXQgbmV3UHJvZ3Jlc3M7XG4gICAgICBjb25zdCB0cmFuc2xhdGVzRGlmZiA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKTtcblxuICAgICAgaWYgKHRyYW5zbGF0ZXNEaWZmID09PSAwKSB7XG4gICAgICAgIG5ld1Byb2dyZXNzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1Byb2dyZXNzID0gKHN3aXBlci50cmFuc2xhdGUgLSBzd2lwZXIubWluVHJhbnNsYXRlKCkpIC8gdHJhbnNsYXRlc0RpZmY7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdQcm9ncmVzcyAhPT0gc3dpcGVyLnByb2dyZXNzKSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyhydGxUcmFuc2xhdGUgPyAtc3dpcGVyLnRyYW5zbGF0ZSA6IHN3aXBlci50cmFuc2xhdGUpO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuZW1pdCgnc2V0VHJhbnNsYXRlJywgc3dpcGVyLnRyYW5zbGF0ZSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGxldCBkdW1teUV2ZW50QXR0YWNoZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGR1bW15RXZlbnRMaXN0ZW5lcigpIHt9XG5cbiAgICBjb25zdCBldmVudHMgPSAoc3dpcGVyLCBtZXRob2QpID0+IHtcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICB0b3VjaEV2ZW50cyxcbiAgICAgICAgZWwsXG4gICAgICAgIHdyYXBwZXJFbCxcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICBzdXBwb3J0XG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgY29uc3QgY2FwdHVyZSA9ICEhcGFyYW1zLm5lc3RlZDtcbiAgICAgIGNvbnN0IGRvbU1ldGhvZCA9IG1ldGhvZCA9PT0gJ29uJyA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgICAgIGNvbnN0IHN3aXBlck1ldGhvZCA9IG1ldGhvZDsgLy8gVG91Y2ggRXZlbnRzXG5cbiAgICAgIGlmICghc3VwcG9ydC50b3VjaCkge1xuICAgICAgICBlbFtkb21NZXRob2RdKHRvdWNoRXZlbnRzLnN0YXJ0LCBzd2lwZXIub25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gICAgICAgIGRvY3VtZW50W2RvbU1ldGhvZF0odG91Y2hFdmVudHMubW92ZSwgc3dpcGVyLm9uVG91Y2hNb3ZlLCBjYXB0dXJlKTtcbiAgICAgICAgZG9jdW1lbnRbZG9tTWV0aG9kXSh0b3VjaEV2ZW50cy5lbmQsIHN3aXBlci5vblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwYXNzaXZlTGlzdGVuZXIgPSB0b3VjaEV2ZW50cy5zdGFydCA9PT0gJ3RvdWNoc3RhcnQnICYmIHN1cHBvcnQucGFzc2l2ZUxpc3RlbmVyICYmIHBhcmFtcy5wYXNzaXZlTGlzdGVuZXJzID8ge1xuICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgICAgY2FwdHVyZTogZmFsc2VcbiAgICAgICAgfSA6IGZhbHNlO1xuICAgICAgICBlbFtkb21NZXRob2RdKHRvdWNoRXZlbnRzLnN0YXJ0LCBzd2lwZXIub25Ub3VjaFN0YXJ0LCBwYXNzaXZlTGlzdGVuZXIpO1xuICAgICAgICBlbFtkb21NZXRob2RdKHRvdWNoRXZlbnRzLm1vdmUsIHN3aXBlci5vblRvdWNoTW92ZSwgc3VwcG9ydC5wYXNzaXZlTGlzdGVuZXIgPyB7XG4gICAgICAgICAgcGFzc2l2ZTogZmFsc2UsXG4gICAgICAgICAgY2FwdHVyZVxuICAgICAgICB9IDogY2FwdHVyZSk7XG4gICAgICAgIGVsW2RvbU1ldGhvZF0odG91Y2hFdmVudHMuZW5kLCBzd2lwZXIub25Ub3VjaEVuZCwgcGFzc2l2ZUxpc3RlbmVyKTtcblxuICAgICAgICBpZiAodG91Y2hFdmVudHMuY2FuY2VsKSB7XG4gICAgICAgICAgZWxbZG9tTWV0aG9kXSh0b3VjaEV2ZW50cy5jYW5jZWwsIHN3aXBlci5vblRvdWNoRW5kLCBwYXNzaXZlTGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICB9IC8vIFByZXZlbnQgTGlua3MgQ2xpY2tzXG5cblxuICAgICAgaWYgKHBhcmFtcy5wcmV2ZW50Q2xpY2tzIHx8IHBhcmFtcy5wcmV2ZW50Q2xpY2tzUHJvcGFnYXRpb24pIHtcbiAgICAgICAgZWxbZG9tTWV0aG9kXSgnY2xpY2snLCBzd2lwZXIub25DbGljaywgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICB3cmFwcGVyRWxbZG9tTWV0aG9kXSgnc2Nyb2xsJywgc3dpcGVyLm9uU2Nyb2xsKTtcbiAgICAgIH0gLy8gUmVzaXplIGhhbmRsZXJcblxuXG4gICAgICBpZiAocGFyYW1zLnVwZGF0ZU9uV2luZG93UmVzaXplKSB7XG4gICAgICAgIHN3aXBlcltzd2lwZXJNZXRob2RdKGRldmljZS5pb3MgfHwgZGV2aWNlLmFuZHJvaWQgPyAncmVzaXplIG9yaWVudGF0aW9uY2hhbmdlIG9ic2VydmVyVXBkYXRlJyA6ICdyZXNpemUgb2JzZXJ2ZXJVcGRhdGUnLCBvblJlc2l6ZSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2lwZXJbc3dpcGVyTWV0aG9kXSgnb2JzZXJ2ZXJVcGRhdGUnLCBvblJlc2l6ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGF0dGFjaEV2ZW50cygpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgc3VwcG9ydFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIHN3aXBlci5vblRvdWNoU3RhcnQgPSBvblRvdWNoU3RhcnQuYmluZChzd2lwZXIpO1xuICAgICAgc3dpcGVyLm9uVG91Y2hNb3ZlID0gb25Ub3VjaE1vdmUuYmluZChzd2lwZXIpO1xuICAgICAgc3dpcGVyLm9uVG91Y2hFbmQgPSBvblRvdWNoRW5kLmJpbmQoc3dpcGVyKTtcblxuICAgICAgaWYgKHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHN3aXBlci5vblNjcm9sbCA9IG9uU2Nyb2xsLmJpbmQoc3dpcGVyKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLm9uQ2xpY2sgPSBvbkNsaWNrLmJpbmQoc3dpcGVyKTtcblxuICAgICAgaWYgKHN1cHBvcnQudG91Y2ggJiYgIWR1bW15RXZlbnRBdHRhY2hlZCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZHVtbXlFdmVudExpc3RlbmVyKTtcbiAgICAgICAgZHVtbXlFdmVudEF0dGFjaGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZXZlbnRzKHN3aXBlciwgJ29uJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGV0YWNoRXZlbnRzKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGV2ZW50cyhzd2lwZXIsICdvZmYnKTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRzJDEgPSB7XG4gICAgICBhdHRhY2hFdmVudHMsXG4gICAgICBkZXRhY2hFdmVudHNcbiAgICB9O1xuXG4gICAgY29uc3QgaXNHcmlkRW5hYmxlZCA9IChzd2lwZXIsIHBhcmFtcykgPT4ge1xuICAgICAgcmV0dXJuIHN3aXBlci5ncmlkICYmIHBhcmFtcy5ncmlkICYmIHBhcmFtcy5ncmlkLnJvd3MgPiAxO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXRCcmVha3BvaW50KCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWN0aXZlSW5kZXgsXG4gICAgICAgIGluaXRpYWxpemVkLFxuICAgICAgICBsb29wZWRTbGlkZXMgPSAwLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgICRlbFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGNvbnN0IGJyZWFrcG9pbnRzID0gcGFyYW1zLmJyZWFrcG9pbnRzO1xuICAgICAgaWYgKCFicmVha3BvaW50cyB8fCBicmVha3BvaW50cyAmJiBPYmplY3Qua2V5cyhicmVha3BvaW50cykubGVuZ3RoID09PSAwKSByZXR1cm47IC8vIEdldCBicmVha3BvaW50IGZvciB3aW5kb3cgd2lkdGggYW5kIHVwZGF0ZSBwYXJhbWV0ZXJzXG5cbiAgICAgIGNvbnN0IGJyZWFrcG9pbnQgPSBzd2lwZXIuZ2V0QnJlYWtwb2ludChicmVha3BvaW50cywgc3dpcGVyLnBhcmFtcy5icmVha3BvaW50c0Jhc2UsIHN3aXBlci5lbCk7XG4gICAgICBpZiAoIWJyZWFrcG9pbnQgfHwgc3dpcGVyLmN1cnJlbnRCcmVha3BvaW50ID09PSBicmVha3BvaW50KSByZXR1cm47XG4gICAgICBjb25zdCBicmVha3BvaW50T25seVBhcmFtcyA9IGJyZWFrcG9pbnQgaW4gYnJlYWtwb2ludHMgPyBicmVha3BvaW50c1ticmVha3BvaW50XSA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IGJyZWFrcG9pbnRQYXJhbXMgPSBicmVha3BvaW50T25seVBhcmFtcyB8fCBzd2lwZXIub3JpZ2luYWxQYXJhbXM7XG4gICAgICBjb25zdCB3YXNNdWx0aVJvdyA9IGlzR3JpZEVuYWJsZWQoc3dpcGVyLCBwYXJhbXMpO1xuICAgICAgY29uc3QgaXNNdWx0aVJvdyA9IGlzR3JpZEVuYWJsZWQoc3dpcGVyLCBicmVha3BvaW50UGFyYW1zKTtcbiAgICAgIGNvbnN0IHdhc0VuYWJsZWQgPSBwYXJhbXMuZW5hYmxlZDtcblxuICAgICAgaWYgKHdhc011bHRpUm93ICYmICFpc011bHRpUm93KSB7XG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyhgJHtwYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc31ncmlkICR7cGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3N9Z3JpZC1jb2x1bW5gKTtcbiAgICAgICAgc3dpcGVyLmVtaXRDb250YWluZXJDbGFzc2VzKCk7XG4gICAgICB9IGVsc2UgaWYgKCF3YXNNdWx0aVJvdyAmJiBpc011bHRpUm93KSB7XG4gICAgICAgICRlbC5hZGRDbGFzcyhgJHtwYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc31ncmlkYCk7XG5cbiAgICAgICAgaWYgKGJyZWFrcG9pbnRQYXJhbXMuZ3JpZC5maWxsICYmIGJyZWFrcG9pbnRQYXJhbXMuZ3JpZC5maWxsID09PSAnY29sdW1uJyB8fCAhYnJlYWtwb2ludFBhcmFtcy5ncmlkLmZpbGwgJiYgcGFyYW1zLmdyaWQuZmlsbCA9PT0gJ2NvbHVtbicpIHtcbiAgICAgICAgICAkZWwuYWRkQ2xhc3MoYCR7cGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3N9Z3JpZC1jb2x1bW5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5lbWl0Q29udGFpbmVyQ2xhc3NlcygpO1xuICAgICAgfSAvLyBUb2dnbGUgbmF2aWdhdGlvbiwgcGFnaW5hdGlvbiwgc2Nyb2xsYmFyXG5cblxuICAgICAgWyduYXZpZ2F0aW9uJywgJ3BhZ2luYXRpb24nLCAnc2Nyb2xsYmFyJ10uZm9yRWFjaChwcm9wID0+IHtcbiAgICAgICAgY29uc3Qgd2FzTW9kdWxlRW5hYmxlZCA9IHBhcmFtc1twcm9wXSAmJiBwYXJhbXNbcHJvcF0uZW5hYmxlZDtcbiAgICAgICAgY29uc3QgaXNNb2R1bGVFbmFibGVkID0gYnJlYWtwb2ludFBhcmFtc1twcm9wXSAmJiBicmVha3BvaW50UGFyYW1zW3Byb3BdLmVuYWJsZWQ7XG5cbiAgICAgICAgaWYgKHdhc01vZHVsZUVuYWJsZWQgJiYgIWlzTW9kdWxlRW5hYmxlZCkge1xuICAgICAgICAgIHN3aXBlcltwcm9wXS5kaXNhYmxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdhc01vZHVsZUVuYWJsZWQgJiYgaXNNb2R1bGVFbmFibGVkKSB7XG4gICAgICAgICAgc3dpcGVyW3Byb3BdLmVuYWJsZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRpcmVjdGlvbkNoYW5nZWQgPSBicmVha3BvaW50UGFyYW1zLmRpcmVjdGlvbiAmJiBicmVha3BvaW50UGFyYW1zLmRpcmVjdGlvbiAhPT0gcGFyYW1zLmRpcmVjdGlvbjtcbiAgICAgIGNvbnN0IG5lZWRzUmVMb29wID0gcGFyYW1zLmxvb3AgJiYgKGJyZWFrcG9pbnRQYXJhbXMuc2xpZGVzUGVyVmlldyAhPT0gcGFyYW1zLnNsaWRlc1BlclZpZXcgfHwgZGlyZWN0aW9uQ2hhbmdlZCk7XG5cbiAgICAgIGlmIChkaXJlY3Rpb25DaGFuZ2VkICYmIGluaXRpYWxpemVkKSB7XG4gICAgICAgIHN3aXBlci5jaGFuZ2VEaXJlY3Rpb24oKTtcbiAgICAgIH1cblxuICAgICAgZXh0ZW5kJDEoc3dpcGVyLnBhcmFtcywgYnJlYWtwb2ludFBhcmFtcyk7XG4gICAgICBjb25zdCBpc0VuYWJsZWQgPSBzd2lwZXIucGFyYW1zLmVuYWJsZWQ7XG4gICAgICBPYmplY3QuYXNzaWduKHN3aXBlciwge1xuICAgICAgICBhbGxvd1RvdWNoTW92ZTogc3dpcGVyLnBhcmFtcy5hbGxvd1RvdWNoTW92ZSxcbiAgICAgICAgYWxsb3dTbGlkZU5leHQ6IHN3aXBlci5wYXJhbXMuYWxsb3dTbGlkZU5leHQsXG4gICAgICAgIGFsbG93U2xpZGVQcmV2OiBzd2lwZXIucGFyYW1zLmFsbG93U2xpZGVQcmV2XG4gICAgICB9KTtcblxuICAgICAgaWYgKHdhc0VuYWJsZWQgJiYgIWlzRW5hYmxlZCkge1xuICAgICAgICBzd2lwZXIuZGlzYWJsZSgpO1xuICAgICAgfSBlbHNlIGlmICghd2FzRW5hYmxlZCAmJiBpc0VuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLmVuYWJsZSgpO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuY3VycmVudEJyZWFrcG9pbnQgPSBicmVha3BvaW50O1xuICAgICAgc3dpcGVyLmVtaXQoJ19iZWZvcmVCcmVha3BvaW50JywgYnJlYWtwb2ludFBhcmFtcyk7XG5cbiAgICAgIGlmIChuZWVkc1JlTG9vcCAmJiBpbml0aWFsaXplZCkge1xuICAgICAgICBzd2lwZXIubG9vcERlc3Ryb3koKTtcbiAgICAgICAgc3dpcGVyLmxvb3BDcmVhdGUoKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlcygpO1xuICAgICAgICBzd2lwZXIuc2xpZGVUbyhhY3RpdmVJbmRleCAtIGxvb3BlZFNsaWRlcyArIHN3aXBlci5sb29wZWRTbGlkZXMsIDAsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXQoJ2JyZWFrcG9pbnQnLCBicmVha3BvaW50UGFyYW1zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCcmVha3BvaW50KGJyZWFrcG9pbnRzLCBiYXNlLCBjb250YWluZXJFbCkge1xuICAgICAgaWYgKGJhc2UgPT09IHZvaWQgMCkge1xuICAgICAgICBiYXNlID0gJ3dpbmRvdyc7XG4gICAgICB9XG5cbiAgICAgIGlmICghYnJlYWtwb2ludHMgfHwgYmFzZSA9PT0gJ2NvbnRhaW5lcicgJiYgIWNvbnRhaW5lckVsKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgbGV0IGJyZWFrcG9pbnQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGJhc2UgPT09ICd3aW5kb3cnID8gd2luZG93LmlubmVySGVpZ2h0IDogY29udGFpbmVyRWwuY2xpZW50SGVpZ2h0O1xuICAgICAgY29uc3QgcG9pbnRzID0gT2JqZWN0LmtleXMoYnJlYWtwb2ludHMpLm1hcChwb2ludCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcG9pbnQgPT09ICdzdHJpbmcnICYmIHBvaW50LmluZGV4T2YoJ0AnKSA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IG1pblJhdGlvID0gcGFyc2VGbG9hdChwb2ludC5zdWJzdHIoMSkpO1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3VycmVudEhlaWdodCAqIG1pblJhdGlvO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHBvaW50XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IHBvaW50LFxuICAgICAgICAgIHBvaW50XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIHBvaW50cy5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhLnZhbHVlLCAxMCkgLSBwYXJzZUludChiLnZhbHVlLCAxMCkpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgcG9pbnQsXG4gICAgICAgICAgdmFsdWVcbiAgICAgICAgfSA9IHBvaW50c1tpXTtcblxuICAgICAgICBpZiAoYmFzZSA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoYChtaW4td2lkdGg6ICR7dmFsdWV9cHgpYCkubWF0Y2hlcykge1xuICAgICAgICAgICAgYnJlYWtwb2ludCA9IHBvaW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8PSBjb250YWluZXJFbC5jbGllbnRXaWR0aCkge1xuICAgICAgICAgIGJyZWFrcG9pbnQgPSBwb2ludDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYnJlYWtwb2ludCB8fCAnbWF4JztcbiAgICB9XG5cbiAgICB2YXIgYnJlYWtwb2ludHMgPSB7XG4gICAgICBzZXRCcmVha3BvaW50LFxuICAgICAgZ2V0QnJlYWtwb2ludFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ2xhc3NlcyhlbnRyaWVzLCBwcmVmaXgpIHtcbiAgICAgIGNvbnN0IHJlc3VsdENsYXNzZXMgPSBbXTtcbiAgICAgIGVudHJpZXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIE9iamVjdC5rZXlzKGl0ZW0pLmZvckVhY2goY2xhc3NOYW1lcyA9PiB7XG4gICAgICAgICAgICBpZiAoaXRlbVtjbGFzc05hbWVzXSkge1xuICAgICAgICAgICAgICByZXN1bHRDbGFzc2VzLnB1c2gocHJlZml4ICsgY2xhc3NOYW1lcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmVzdWx0Q2xhc3Nlcy5wdXNoKHByZWZpeCArIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHRDbGFzc2VzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZENsYXNzZXMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBjbGFzc05hbWVzLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHJ0bCxcbiAgICAgICAgJGVsLFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHN1cHBvcnRcbiAgICAgIH0gPSBzd2lwZXI7IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gICAgICBjb25zdCBzdWZmaXhlcyA9IHByZXBhcmVDbGFzc2VzKFsnaW5pdGlhbGl6ZWQnLCBwYXJhbXMuZGlyZWN0aW9uLCB7XG4gICAgICAgICdwb2ludGVyLWV2ZW50cyc6ICFzdXBwb3J0LnRvdWNoXG4gICAgICB9LCB7XG4gICAgICAgICdmcmVlLW1vZGUnOiBzd2lwZXIucGFyYW1zLmZyZWVNb2RlICYmIHBhcmFtcy5mcmVlTW9kZS5lbmFibGVkXG4gICAgICB9LCB7XG4gICAgICAgICdhdXRvaGVpZ2h0JzogcGFyYW1zLmF1dG9IZWlnaHRcbiAgICAgIH0sIHtcbiAgICAgICAgJ3J0bCc6IHJ0bFxuICAgICAgfSwge1xuICAgICAgICAnZ3JpZCc6IHBhcmFtcy5ncmlkICYmIHBhcmFtcy5ncmlkLnJvd3MgPiAxXG4gICAgICB9LCB7XG4gICAgICAgICdncmlkLWNvbHVtbic6IHBhcmFtcy5ncmlkICYmIHBhcmFtcy5ncmlkLnJvd3MgPiAxICYmIHBhcmFtcy5ncmlkLmZpbGwgPT09ICdjb2x1bW4nXG4gICAgICB9LCB7XG4gICAgICAgICdhbmRyb2lkJzogZGV2aWNlLmFuZHJvaWRcbiAgICAgIH0sIHtcbiAgICAgICAgJ2lvcyc6IGRldmljZS5pb3NcbiAgICAgIH0sIHtcbiAgICAgICAgJ2Nzcy1tb2RlJzogcGFyYW1zLmNzc01vZGVcbiAgICAgIH0sIHtcbiAgICAgICAgJ2NlbnRlcmVkJzogcGFyYW1zLmNzc01vZGUgJiYgcGFyYW1zLmNlbnRlcmVkU2xpZGVzXG4gICAgICB9LCB7XG4gICAgICAgICd3YXRjaC1wcm9ncmVzcyc6IHBhcmFtcy53YXRjaFNsaWRlc1Byb2dyZXNzXG4gICAgICB9XSwgcGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3MpO1xuICAgICAgY2xhc3NOYW1lcy5wdXNoKC4uLnN1ZmZpeGVzKTtcbiAgICAgICRlbC5hZGRDbGFzcyhbLi4uY2xhc3NOYW1lc10uam9pbignICcpKTtcbiAgICAgIHN3aXBlci5lbWl0Q29udGFpbmVyQ2xhc3NlcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUNsYXNzZXMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICAkZWwsXG4gICAgICAgIGNsYXNzTmFtZXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAkZWwucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lcy5qb2luKCcgJykpO1xuICAgICAgc3dpcGVyLmVtaXRDb250YWluZXJDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICBhZGRDbGFzc2VzLFxuICAgICAgcmVtb3ZlQ2xhc3Nlc1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsb2FkSW1hZ2UoaW1hZ2VFbCwgc3JjLCBzcmNzZXQsIHNpemVzLCBjaGVja0ZvckNvbXBsZXRlLCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBsZXQgaW1hZ2U7XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVhZHkoKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNQaWN0dXJlID0gJChpbWFnZUVsKS5wYXJlbnQoJ3BpY3R1cmUnKVswXTtcblxuICAgICAgaWYgKCFpc1BpY3R1cmUgJiYgKCFpbWFnZUVsLmNvbXBsZXRlIHx8ICFjaGVja0ZvckNvbXBsZXRlKSkge1xuICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgaW1hZ2UgPSBuZXcgd2luZG93LkltYWdlKCk7XG4gICAgICAgICAgaW1hZ2Uub25sb2FkID0gb25SZWFkeTtcbiAgICAgICAgICBpbWFnZS5vbmVycm9yID0gb25SZWFkeTtcblxuICAgICAgICAgIGlmIChzaXplcykge1xuICAgICAgICAgICAgaW1hZ2Uuc2l6ZXMgPSBzaXplcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3Jjc2V0KSB7XG4gICAgICAgICAgICBpbWFnZS5zcmNzZXQgPSBzcmNzZXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gc3JjO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvblJlYWR5KCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGltYWdlIGFscmVhZHkgbG9hZGVkLi4uXG4gICAgICAgIG9uUmVhZHkoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmVsb2FkSW1hZ2VzKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIHN3aXBlci5pbWFnZXNUb0xvYWQgPSBzd2lwZXIuJGVsLmZpbmQoJ2ltZycpO1xuXG4gICAgICBmdW5jdGlvbiBvblJlYWR5KCkge1xuICAgICAgICBpZiAodHlwZW9mIHN3aXBlciA9PT0gJ3VuZGVmaW5lZCcgfHwgc3dpcGVyID09PSBudWxsIHx8ICFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCkgcmV0dXJuO1xuICAgICAgICBpZiAoc3dpcGVyLmltYWdlc0xvYWRlZCAhPT0gdW5kZWZpbmVkKSBzd2lwZXIuaW1hZ2VzTG9hZGVkICs9IDE7XG5cbiAgICAgICAgaWYgKHN3aXBlci5pbWFnZXNMb2FkZWQgPT09IHN3aXBlci5pbWFnZXNUb0xvYWQubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMudXBkYXRlT25JbWFnZXNSZWFkeSkgc3dpcGVyLnVwZGF0ZSgpO1xuICAgICAgICAgIHN3aXBlci5lbWl0KCdpbWFnZXNSZWFkeScpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3dpcGVyLmltYWdlc1RvTG9hZC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBpbWFnZUVsID0gc3dpcGVyLmltYWdlc1RvTG9hZFtpXTtcbiAgICAgICAgc3dpcGVyLmxvYWRJbWFnZShpbWFnZUVsLCBpbWFnZUVsLmN1cnJlbnRTcmMgfHwgaW1hZ2VFbC5nZXRBdHRyaWJ1dGUoJ3NyYycpLCBpbWFnZUVsLnNyY3NldCB8fCBpbWFnZUVsLmdldEF0dHJpYnV0ZSgnc3Jjc2V0JyksIGltYWdlRWwuc2l6ZXMgfHwgaW1hZ2VFbC5nZXRBdHRyaWJ1dGUoJ3NpemVzJyksIHRydWUsIG9uUmVhZHkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbWFnZXMgPSB7XG4gICAgICBsb2FkSW1hZ2UsXG4gICAgICBwcmVsb2FkSW1hZ2VzXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNoZWNrT3ZlcmZsb3coKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc0xvY2tlZDogd2FzTG9ja2VkLFxuICAgICAgICBwYXJhbXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHNsaWRlc09mZnNldEJlZm9yZVxuICAgICAgfSA9IHBhcmFtcztcblxuICAgICAgaWYgKHNsaWRlc09mZnNldEJlZm9yZSkge1xuICAgICAgICBjb25zdCBsYXN0U2xpZGVJbmRleCA9IHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgY29uc3QgbGFzdFNsaWRlUmlnaHRFZGdlID0gc3dpcGVyLnNsaWRlc0dyaWRbbGFzdFNsaWRlSW5kZXhdICsgc3dpcGVyLnNsaWRlc1NpemVzR3JpZFtsYXN0U2xpZGVJbmRleF0gKyBzbGlkZXNPZmZzZXRCZWZvcmUgKiAyO1xuICAgICAgICBzd2lwZXIuaXNMb2NrZWQgPSBzd2lwZXIuc2l6ZSA+IGxhc3RTbGlkZVJpZ2h0RWRnZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5pc0xvY2tlZCA9IHN3aXBlci5zbmFwR3JpZC5sZW5ndGggPT09IDE7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuYWxsb3dTbGlkZU5leHQgPT09IHRydWUpIHtcbiAgICAgICAgc3dpcGVyLmFsbG93U2xpZGVOZXh0ID0gIXN3aXBlci5pc0xvY2tlZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5hbGxvd1NsaWRlUHJldiA9PT0gdHJ1ZSkge1xuICAgICAgICBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPSAhc3dpcGVyLmlzTG9ja2VkO1xuICAgICAgfVxuXG4gICAgICBpZiAod2FzTG9ja2VkICYmIHdhc0xvY2tlZCAhPT0gc3dpcGVyLmlzTG9ja2VkKSB7XG4gICAgICAgIHN3aXBlci5pc0VuZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAod2FzTG9ja2VkICE9PSBzd2lwZXIuaXNMb2NrZWQpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoc3dpcGVyLmlzTG9ja2VkID8gJ2xvY2snIDogJ3VubG9jaycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjaGVja092ZXJmbG93JDEgPSB7XG4gICAgICBjaGVja092ZXJmbG93XG4gICAgfTtcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIGluaXQ6IHRydWUsXG4gICAgICBkaXJlY3Rpb246ICdob3Jpem9udGFsJyxcbiAgICAgIHRvdWNoRXZlbnRzVGFyZ2V0OiAnd3JhcHBlcicsXG4gICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICBzcGVlZDogMzAwLFxuICAgICAgY3NzTW9kZTogZmFsc2UsXG4gICAgICB1cGRhdGVPbldpbmRvd1Jlc2l6ZTogdHJ1ZSxcbiAgICAgIHJlc2l6ZU9ic2VydmVyOiB0cnVlLFxuICAgICAgbmVzdGVkOiBmYWxzZSxcbiAgICAgIGNyZWF0ZUVsZW1lbnRzOiBmYWxzZSxcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBmb2N1c2FibGVFbGVtZW50czogJ2lucHV0LCBzZWxlY3QsIG9wdGlvbiwgdGV4dGFyZWEsIGJ1dHRvbiwgdmlkZW8sIGxhYmVsJyxcbiAgICAgIC8vIE92ZXJyaWRlc1xuICAgICAgd2lkdGg6IG51bGwsXG4gICAgICBoZWlnaHQ6IG51bGwsXG4gICAgICAvL1xuICAgICAgcHJldmVudEludGVyYWN0aW9uT25UcmFuc2l0aW9uOiBmYWxzZSxcbiAgICAgIC8vIHNzclxuICAgICAgdXNlckFnZW50OiBudWxsLFxuICAgICAgdXJsOiBudWxsLFxuICAgICAgLy8gVG8gc3VwcG9ydCBpT1MncyBzd2lwZS10by1nby1iYWNrIGdlc3R1cmUgKHdoZW4gYmVpbmcgdXNlZCBpbi1hcHApLlxuICAgICAgZWRnZVN3aXBlRGV0ZWN0aW9uOiBmYWxzZSxcbiAgICAgIGVkZ2VTd2lwZVRocmVzaG9sZDogMjAsXG4gICAgICAvLyBBdXRvaGVpZ2h0XG4gICAgICBhdXRvSGVpZ2h0OiBmYWxzZSxcbiAgICAgIC8vIFNldCB3cmFwcGVyIHdpZHRoXG4gICAgICBzZXRXcmFwcGVyU2l6ZTogZmFsc2UsXG4gICAgICAvLyBWaXJ0dWFsIFRyYW5zbGF0ZVxuICAgICAgdmlydHVhbFRyYW5zbGF0ZTogZmFsc2UsXG4gICAgICAvLyBFZmZlY3RzXG4gICAgICBlZmZlY3Q6ICdzbGlkZScsXG4gICAgICAvLyAnc2xpZGUnIG9yICdmYWRlJyBvciAnY3ViZScgb3IgJ2NvdmVyZmxvdycgb3IgJ2ZsaXAnXG4gICAgICAvLyBCcmVha3BvaW50c1xuICAgICAgYnJlYWtwb2ludHM6IHVuZGVmaW5lZCxcbiAgICAgIGJyZWFrcG9pbnRzQmFzZTogJ3dpbmRvdycsXG4gICAgICAvLyBTbGlkZXMgZ3JpZFxuICAgICAgc3BhY2VCZXR3ZWVuOiAwLFxuICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgIHNsaWRlc1Blckdyb3VwOiAxLFxuICAgICAgc2xpZGVzUGVyR3JvdXBTa2lwOiAwLFxuICAgICAgc2xpZGVzUGVyR3JvdXBBdXRvOiBmYWxzZSxcbiAgICAgIGNlbnRlcmVkU2xpZGVzOiBmYWxzZSxcbiAgICAgIGNlbnRlcmVkU2xpZGVzQm91bmRzOiBmYWxzZSxcbiAgICAgIHNsaWRlc09mZnNldEJlZm9yZTogMCxcbiAgICAgIC8vIGluIHB4XG4gICAgICBzbGlkZXNPZmZzZXRBZnRlcjogMCxcbiAgICAgIC8vIGluIHB4XG4gICAgICBub3JtYWxpemVTbGlkZUluZGV4OiB0cnVlLFxuICAgICAgY2VudGVySW5zdWZmaWNpZW50U2xpZGVzOiBmYWxzZSxcbiAgICAgIC8vIERpc2FibGUgc3dpcGVyIGFuZCBoaWRlIG5hdmlnYXRpb24gd2hlbiBjb250YWluZXIgbm90IG92ZXJmbG93XG4gICAgICB3YXRjaE92ZXJmbG93OiB0cnVlLFxuICAgICAgLy8gUm91bmQgbGVuZ3RoXG4gICAgICByb3VuZExlbmd0aHM6IGZhbHNlLFxuICAgICAgLy8gVG91Y2hlc1xuICAgICAgdG91Y2hSYXRpbzogMSxcbiAgICAgIHRvdWNoQW5nbGU6IDQ1LFxuICAgICAgc2ltdWxhdGVUb3VjaDogdHJ1ZSxcbiAgICAgIHNob3J0U3dpcGVzOiB0cnVlLFxuICAgICAgbG9uZ1N3aXBlczogdHJ1ZSxcbiAgICAgIGxvbmdTd2lwZXNSYXRpbzogMC41LFxuICAgICAgbG9uZ1N3aXBlc01zOiAzMDAsXG4gICAgICBmb2xsb3dGaW5nZXI6IHRydWUsXG4gICAgICBhbGxvd1RvdWNoTW92ZTogdHJ1ZSxcbiAgICAgIHRocmVzaG9sZDogMCxcbiAgICAgIHRvdWNoTW92ZVN0b3BQcm9wYWdhdGlvbjogZmFsc2UsXG4gICAgICB0b3VjaFN0YXJ0UHJldmVudERlZmF1bHQ6IHRydWUsXG4gICAgICB0b3VjaFN0YXJ0Rm9yY2VQcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgICB0b3VjaFJlbGVhc2VPbkVkZ2VzOiBmYWxzZSxcbiAgICAgIC8vIFVuaXF1ZSBOYXZpZ2F0aW9uIEVsZW1lbnRzXG4gICAgICB1bmlxdWVOYXZFbGVtZW50czogdHJ1ZSxcbiAgICAgIC8vIFJlc2lzdGFuY2VcbiAgICAgIHJlc2lzdGFuY2U6IHRydWUsXG4gICAgICByZXNpc3RhbmNlUmF0aW86IDAuODUsXG4gICAgICAvLyBQcm9ncmVzc1xuICAgICAgd2F0Y2hTbGlkZXNQcm9ncmVzczogZmFsc2UsXG4gICAgICAvLyBDdXJzb3JcbiAgICAgIGdyYWJDdXJzb3I6IGZhbHNlLFxuICAgICAgLy8gQ2xpY2tzXG4gICAgICBwcmV2ZW50Q2xpY2tzOiB0cnVlLFxuICAgICAgcHJldmVudENsaWNrc1Byb3BhZ2F0aW9uOiB0cnVlLFxuICAgICAgc2xpZGVUb0NsaWNrZWRTbGlkZTogZmFsc2UsXG4gICAgICAvLyBJbWFnZXNcbiAgICAgIHByZWxvYWRJbWFnZXM6IHRydWUsXG4gICAgICB1cGRhdGVPbkltYWdlc1JlYWR5OiB0cnVlLFxuICAgICAgLy8gbG9vcFxuICAgICAgbG9vcDogZmFsc2UsXG4gICAgICBsb29wQWRkaXRpb25hbFNsaWRlczogMCxcbiAgICAgIGxvb3BlZFNsaWRlczogbnVsbCxcbiAgICAgIGxvb3BlZFNsaWRlc0xpbWl0OiB0cnVlLFxuICAgICAgbG9vcEZpbGxHcm91cFdpdGhCbGFuazogZmFsc2UsXG4gICAgICBsb29wUHJldmVudHNTbGlkZTogdHJ1ZSxcbiAgICAgIC8vIHJld2luZFxuICAgICAgcmV3aW5kOiBmYWxzZSxcbiAgICAgIC8vIFN3aXBpbmcvbm8gc3dpcGluZ1xuICAgICAgYWxsb3dTbGlkZVByZXY6IHRydWUsXG4gICAgICBhbGxvd1NsaWRlTmV4dDogdHJ1ZSxcbiAgICAgIHN3aXBlSGFuZGxlcjogbnVsbCxcbiAgICAgIC8vICcuc3dpcGUtaGFuZGxlcicsXG4gICAgICBub1N3aXBpbmc6IHRydWUsXG4gICAgICBub1N3aXBpbmdDbGFzczogJ3N3aXBlci1uby1zd2lwaW5nJyxcbiAgICAgIG5vU3dpcGluZ1NlbGVjdG9yOiBudWxsLFxuICAgICAgLy8gUGFzc2l2ZSBMaXN0ZW5lcnNcbiAgICAgIHBhc3NpdmVMaXN0ZW5lcnM6IHRydWUsXG4gICAgICBtYXhCYWNrZmFjZUhpZGRlblNsaWRlczogMTAsXG4gICAgICAvLyBOU1xuICAgICAgY29udGFpbmVyTW9kaWZpZXJDbGFzczogJ3N3aXBlci0nLFxuICAgICAgLy8gTkVXXG4gICAgICBzbGlkZUNsYXNzOiAnc3dpcGVyLXNsaWRlJyxcbiAgICAgIHNsaWRlQmxhbmtDbGFzczogJ3N3aXBlci1zbGlkZS1pbnZpc2libGUtYmxhbmsnLFxuICAgICAgc2xpZGVBY3RpdmVDbGFzczogJ3N3aXBlci1zbGlkZS1hY3RpdmUnLFxuICAgICAgc2xpZGVEdXBsaWNhdGVBY3RpdmVDbGFzczogJ3N3aXBlci1zbGlkZS1kdXBsaWNhdGUtYWN0aXZlJyxcbiAgICAgIHNsaWRlVmlzaWJsZUNsYXNzOiAnc3dpcGVyLXNsaWRlLXZpc2libGUnLFxuICAgICAgc2xpZGVEdXBsaWNhdGVDbGFzczogJ3N3aXBlci1zbGlkZS1kdXBsaWNhdGUnLFxuICAgICAgc2xpZGVOZXh0Q2xhc3M6ICdzd2lwZXItc2xpZGUtbmV4dCcsXG4gICAgICBzbGlkZUR1cGxpY2F0ZU5leHRDbGFzczogJ3N3aXBlci1zbGlkZS1kdXBsaWNhdGUtbmV4dCcsXG4gICAgICBzbGlkZVByZXZDbGFzczogJ3N3aXBlci1zbGlkZS1wcmV2JyxcbiAgICAgIHNsaWRlRHVwbGljYXRlUHJldkNsYXNzOiAnc3dpcGVyLXNsaWRlLWR1cGxpY2F0ZS1wcmV2JyxcbiAgICAgIHdyYXBwZXJDbGFzczogJ3N3aXBlci13cmFwcGVyJyxcbiAgICAgIC8vIENhbGxiYWNrc1xuICAgICAgcnVuQ2FsbGJhY2tzT25Jbml0OiB0cnVlLFxuICAgICAgLy8gSW50ZXJuYWxzXG4gICAgICBfZW1pdENsYXNzZXM6IGZhbHNlXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1vZHVsZUV4dGVuZFBhcmFtcyhwYXJhbXMsIGFsbE1vZHVsZXNQYXJhbXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBleHRlbmRQYXJhbXMob2JqKSB7XG4gICAgICAgIGlmIChvYmogPT09IHZvaWQgMCkge1xuICAgICAgICAgIG9iaiA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kdWxlUGFyYW1OYW1lID0gT2JqZWN0LmtleXMob2JqKVswXTtcbiAgICAgICAgY29uc3QgbW9kdWxlUGFyYW1zID0gb2JqW21vZHVsZVBhcmFtTmFtZV07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGVQYXJhbXMgIT09ICdvYmplY3QnIHx8IG1vZHVsZVBhcmFtcyA9PT0gbnVsbCkge1xuICAgICAgICAgIGV4dGVuZCQxKGFsbE1vZHVsZXNQYXJhbXMsIG9iaik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFsnbmF2aWdhdGlvbicsICdwYWdpbmF0aW9uJywgJ3Njcm9sbGJhciddLmluZGV4T2YobW9kdWxlUGFyYW1OYW1lKSA+PSAwICYmIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID09PSB0cnVlKSB7XG4gICAgICAgICAgcGFyYW1zW21vZHVsZVBhcmFtTmFtZV0gPSB7XG4gICAgICAgICAgICBhdXRvOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKG1vZHVsZVBhcmFtTmFtZSBpbiBwYXJhbXMgJiYgJ2VuYWJsZWQnIGluIG1vZHVsZVBhcmFtcykpIHtcbiAgICAgICAgICBleHRlbmQkMShhbGxNb2R1bGVzUGFyYW1zLCBvYmopO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID0ge1xuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID09PSAnb2JqZWN0JyAmJiAhKCdlbmFibGVkJyBpbiBwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXSkpIHtcbiAgICAgICAgICBwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXS5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zW21vZHVsZVBhcmFtTmFtZV0pIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID0ge1xuICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIGV4dGVuZCQxKGFsbE1vZHVsZXNQYXJhbXMsIG9iaik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qIGVzbGludCBuby1wYXJhbS1yZWFzc2lnbjogXCJvZmZcIiAqL1xuICAgIGNvbnN0IHByb3RvdHlwZXMgPSB7XG4gICAgICBldmVudHNFbWl0dGVyLFxuICAgICAgdXBkYXRlLFxuICAgICAgdHJhbnNsYXRlLFxuICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbiQxLFxuICAgICAgc2xpZGUsXG4gICAgICBsb29wLFxuICAgICAgZ3JhYkN1cnNvcixcbiAgICAgIGV2ZW50czogZXZlbnRzJDEsXG4gICAgICBicmVha3BvaW50cyxcbiAgICAgIGNoZWNrT3ZlcmZsb3c6IGNoZWNrT3ZlcmZsb3ckMSxcbiAgICAgIGNsYXNzZXMsXG4gICAgICBpbWFnZXNcbiAgICB9O1xuICAgIGNvbnN0IGV4dGVuZGVkRGVmYXVsdHMgPSB7fTtcblxuICAgIGNsYXNzIFN3aXBlciB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgbGV0IGVsO1xuICAgICAgICBsZXQgcGFyYW1zO1xuXG4gICAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgYXJnc1swXS5jb25zdHJ1Y3RvciAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnc1swXSkuc2xpY2UoOCwgLTEpID09PSAnT2JqZWN0Jykge1xuICAgICAgICAgIHBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgW2VsLCBwYXJhbXNdID0gYXJncztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcbiAgICAgICAgcGFyYW1zID0gZXh0ZW5kJDEoe30sIHBhcmFtcyk7XG4gICAgICAgIGlmIChlbCAmJiAhcGFyYW1zLmVsKSBwYXJhbXMuZWwgPSBlbDtcblxuICAgICAgICBpZiAocGFyYW1zLmVsICYmICQocGFyYW1zLmVsKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc3Qgc3dpcGVycyA9IFtdO1xuICAgICAgICAgICQocGFyYW1zLmVsKS5lYWNoKGNvbnRhaW5lckVsID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1BhcmFtcyA9IGV4dGVuZCQxKHt9LCBwYXJhbXMsIHtcbiAgICAgICAgICAgICAgZWw6IGNvbnRhaW5lckVsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN3aXBlcnMucHVzaChuZXcgU3dpcGVyKG5ld1BhcmFtcykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBzd2lwZXJzO1xuICAgICAgICB9IC8vIFN3aXBlciBJbnN0YW5jZVxuXG5cbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgc3dpcGVyLl9fc3dpcGVyX18gPSB0cnVlO1xuICAgICAgICBzd2lwZXIuc3VwcG9ydCA9IGdldFN1cHBvcnQoKTtcbiAgICAgICAgc3dpcGVyLmRldmljZSA9IGdldERldmljZSh7XG4gICAgICAgICAgdXNlckFnZW50OiBwYXJhbXMudXNlckFnZW50XG4gICAgICAgIH0pO1xuICAgICAgICBzd2lwZXIuYnJvd3NlciA9IGdldEJyb3dzZXIoKTtcbiAgICAgICAgc3dpcGVyLmV2ZW50c0xpc3RlbmVycyA9IHt9O1xuICAgICAgICBzd2lwZXIuZXZlbnRzQW55TGlzdGVuZXJzID0gW107XG4gICAgICAgIHN3aXBlci5tb2R1bGVzID0gWy4uLnN3aXBlci5fX21vZHVsZXNfX107XG5cbiAgICAgICAgaWYgKHBhcmFtcy5tb2R1bGVzICYmIEFycmF5LmlzQXJyYXkocGFyYW1zLm1vZHVsZXMpKSB7XG4gICAgICAgICAgc3dpcGVyLm1vZHVsZXMucHVzaCguLi5wYXJhbXMubW9kdWxlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbGxNb2R1bGVzUGFyYW1zID0ge307XG4gICAgICAgIHN3aXBlci5tb2R1bGVzLmZvckVhY2gobW9kID0+IHtcbiAgICAgICAgICBtb2Qoe1xuICAgICAgICAgICAgc3dpcGVyLFxuICAgICAgICAgICAgZXh0ZW5kUGFyYW1zOiBtb2R1bGVFeHRlbmRQYXJhbXMocGFyYW1zLCBhbGxNb2R1bGVzUGFyYW1zKSxcbiAgICAgICAgICAgIG9uOiBzd2lwZXIub24uYmluZChzd2lwZXIpLFxuICAgICAgICAgICAgb25jZTogc3dpcGVyLm9uY2UuYmluZChzd2lwZXIpLFxuICAgICAgICAgICAgb2ZmOiBzd2lwZXIub2ZmLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgICAgIGVtaXQ6IHN3aXBlci5lbWl0LmJpbmQoc3dpcGVyKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTsgLy8gRXh0ZW5kIGRlZmF1bHRzIHdpdGggbW9kdWxlcyBwYXJhbXNcblxuICAgICAgICBjb25zdCBzd2lwZXJQYXJhbXMgPSBleHRlbmQkMSh7fSwgZGVmYXVsdHMsIGFsbE1vZHVsZXNQYXJhbXMpOyAvLyBFeHRlbmQgZGVmYXVsdHMgd2l0aCBwYXNzZWQgcGFyYW1zXG5cbiAgICAgICAgc3dpcGVyLnBhcmFtcyA9IGV4dGVuZCQxKHt9LCBzd2lwZXJQYXJhbXMsIGV4dGVuZGVkRGVmYXVsdHMsIHBhcmFtcyk7XG4gICAgICAgIHN3aXBlci5vcmlnaW5hbFBhcmFtcyA9IGV4dGVuZCQxKHt9LCBzd2lwZXIucGFyYW1zKTtcbiAgICAgICAgc3dpcGVyLnBhc3NlZFBhcmFtcyA9IGV4dGVuZCQxKHt9LCBwYXJhbXMpOyAvLyBhZGQgZXZlbnQgbGlzdGVuZXJzXG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMgJiYgc3dpcGVyLnBhcmFtcy5vbikge1xuICAgICAgICAgIE9iamVjdC5rZXlzKHN3aXBlci5wYXJhbXMub24pLmZvckVhY2goZXZlbnROYW1lID0+IHtcbiAgICAgICAgICAgIHN3aXBlci5vbihldmVudE5hbWUsIHN3aXBlci5wYXJhbXMub25bZXZlbnROYW1lXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcyAmJiBzd2lwZXIucGFyYW1zLm9uQW55KSB7XG4gICAgICAgICAgc3dpcGVyLm9uQW55KHN3aXBlci5wYXJhbXMub25BbnkpO1xuICAgICAgICB9IC8vIFNhdmUgRG9tIGxpYlxuXG5cbiAgICAgICAgc3dpcGVyLiQgPSAkOyAvLyBFeHRlbmQgU3dpcGVyXG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIsIHtcbiAgICAgICAgICBlbmFibGVkOiBzd2lwZXIucGFyYW1zLmVuYWJsZWQsXG4gICAgICAgICAgZWwsXG4gICAgICAgICAgLy8gQ2xhc3Nlc1xuICAgICAgICAgIGNsYXNzTmFtZXM6IFtdLFxuICAgICAgICAgIC8vIFNsaWRlc1xuICAgICAgICAgIHNsaWRlczogJCgpLFxuICAgICAgICAgIHNsaWRlc0dyaWQ6IFtdLFxuICAgICAgICAgIHNuYXBHcmlkOiBbXSxcbiAgICAgICAgICBzbGlkZXNTaXplc0dyaWQ6IFtdLFxuXG4gICAgICAgICAgLy8gaXNEaXJlY3Rpb25cbiAgICAgICAgICBpc0hvcml6b250YWwoKSB7XG4gICAgICAgICAgICByZXR1cm4gc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgaXNWZXJ0aWNhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBzd2lwZXIucGFyYW1zLmRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJztcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLy8gSW5kZXhlc1xuICAgICAgICAgIGFjdGl2ZUluZGV4OiAwLFxuICAgICAgICAgIHJlYWxJbmRleDogMCxcbiAgICAgICAgICAvL1xuICAgICAgICAgIGlzQmVnaW5uaW5nOiB0cnVlLFxuICAgICAgICAgIGlzRW5kOiBmYWxzZSxcbiAgICAgICAgICAvLyBQcm9wc1xuICAgICAgICAgIHRyYW5zbGF0ZTogMCxcbiAgICAgICAgICBwcmV2aW91c1RyYW5zbGF0ZTogMCxcbiAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICB2ZWxvY2l0eTogMCxcbiAgICAgICAgICBhbmltYXRpbmc6IGZhbHNlLFxuICAgICAgICAgIC8vIExvY2tzXG4gICAgICAgICAgYWxsb3dTbGlkZU5leHQ6IHN3aXBlci5wYXJhbXMuYWxsb3dTbGlkZU5leHQsXG4gICAgICAgICAgYWxsb3dTbGlkZVByZXY6IHN3aXBlci5wYXJhbXMuYWxsb3dTbGlkZVByZXYsXG4gICAgICAgICAgLy8gVG91Y2ggRXZlbnRzXG4gICAgICAgICAgdG91Y2hFdmVudHM6IGZ1bmN0aW9uIHRvdWNoRXZlbnRzKCkge1xuICAgICAgICAgICAgY29uc3QgdG91Y2ggPSBbJ3RvdWNoc3RhcnQnLCAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJ107XG4gICAgICAgICAgICBjb25zdCBkZXNrdG9wID0gWydwb2ludGVyZG93bicsICdwb2ludGVybW92ZScsICdwb2ludGVydXAnXTtcbiAgICAgICAgICAgIHN3aXBlci50b3VjaEV2ZW50c1RvdWNoID0ge1xuICAgICAgICAgICAgICBzdGFydDogdG91Y2hbMF0sXG4gICAgICAgICAgICAgIG1vdmU6IHRvdWNoWzFdLFxuICAgICAgICAgICAgICBlbmQ6IHRvdWNoWzJdLFxuICAgICAgICAgICAgICBjYW5jZWw6IHRvdWNoWzNdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc3dpcGVyLnRvdWNoRXZlbnRzRGVza3RvcCA9IHtcbiAgICAgICAgICAgICAgc3RhcnQ6IGRlc2t0b3BbMF0sXG4gICAgICAgICAgICAgIG1vdmU6IGRlc2t0b3BbMV0sXG4gICAgICAgICAgICAgIGVuZDogZGVza3RvcFsyXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBzd2lwZXIuc3VwcG9ydC50b3VjaCB8fCAhc3dpcGVyLnBhcmFtcy5zaW11bGF0ZVRvdWNoID8gc3dpcGVyLnRvdWNoRXZlbnRzVG91Y2ggOiBzd2lwZXIudG91Y2hFdmVudHNEZXNrdG9wO1xuICAgICAgICAgIH0oKSxcbiAgICAgICAgICB0b3VjaEV2ZW50c0RhdGE6IHtcbiAgICAgICAgICAgIGlzVG91Y2hlZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaXNNb3ZlZDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgYWxsb3dUb3VjaENhbGxiYWNrczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgdG91Y2hTdGFydFRpbWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGlzU2Nyb2xsaW5nOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBjdXJyZW50VHJhbnNsYXRlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBzdGFydFRyYW5zbGF0ZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgYWxsb3dUaHJlc2hvbGRNb3ZlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAvLyBGb3JtIGVsZW1lbnRzIHRvIG1hdGNoXG4gICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50czogc3dpcGVyLnBhcmFtcy5mb2N1c2FibGVFbGVtZW50cyxcbiAgICAgICAgICAgIC8vIExhc3QgY2xpY2sgdGltZVxuICAgICAgICAgICAgbGFzdENsaWNrVGltZTogbm93KCksXG4gICAgICAgICAgICBjbGlja1RpbWVvdXQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIFZlbG9jaXRpZXNcbiAgICAgICAgICAgIHZlbG9jaXRpZXM6IFtdLFxuICAgICAgICAgICAgYWxsb3dNb21lbnR1bUJvdW5jZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaXNUb3VjaEV2ZW50OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBzdGFydE1vdmluZzogdW5kZWZpbmVkXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBDbGlja3NcbiAgICAgICAgICBhbGxvd0NsaWNrOiB0cnVlLFxuICAgICAgICAgIC8vIFRvdWNoZXNcbiAgICAgICAgICBhbGxvd1RvdWNoTW92ZTogc3dpcGVyLnBhcmFtcy5hbGxvd1RvdWNoTW92ZSxcbiAgICAgICAgICB0b3VjaGVzOiB7XG4gICAgICAgICAgICBzdGFydFg6IDAsXG4gICAgICAgICAgICBzdGFydFk6IDAsXG4gICAgICAgICAgICBjdXJyZW50WDogMCxcbiAgICAgICAgICAgIGN1cnJlbnRZOiAwLFxuICAgICAgICAgICAgZGlmZjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgLy8gSW1hZ2VzXG4gICAgICAgICAgaW1hZ2VzVG9Mb2FkOiBbXSxcbiAgICAgICAgICBpbWFnZXNMb2FkZWQ6IDBcbiAgICAgICAgfSk7XG4gICAgICAgIHN3aXBlci5lbWl0KCdfc3dpcGVyJyk7IC8vIEluaXRcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5pbml0KSB7XG4gICAgICAgICAgc3dpcGVyLmluaXQoKTtcbiAgICAgICAgfSAvLyBSZXR1cm4gYXBwIGluc3RhbmNlXG5cblxuICAgICAgICByZXR1cm4gc3dpcGVyO1xuICAgICAgfVxuXG4gICAgICBlbmFibGUoKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmIChzd2lwZXIuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzd2lwZXIuZW5hYmxlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZ3JhYkN1cnNvcikge1xuICAgICAgICAgIHN3aXBlci5zZXRHcmFiQ3Vyc29yKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuZW1pdCgnZW5hYmxlJyk7XG4gICAgICB9XG5cbiAgICAgIGRpc2FibGUoKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmICghc3dpcGVyLmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgc3dpcGVyLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5ncmFiQ3Vyc29yKSB7XG4gICAgICAgICAgc3dpcGVyLnVuc2V0R3JhYkN1cnNvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmVtaXQoJ2Rpc2FibGUnKTtcbiAgICAgIH1cblxuICAgICAgc2V0UHJvZ3Jlc3MocHJvZ3Jlc3MsIHNwZWVkKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIHByb2dyZXNzID0gTWF0aC5taW4oTWF0aC5tYXgocHJvZ3Jlc3MsIDApLCAxKTtcbiAgICAgICAgY29uc3QgbWluID0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpO1xuICAgICAgICBjb25zdCBtYXggPSBzd2lwZXIubWF4VHJhbnNsYXRlKCk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSAobWF4IC0gbWluKSAqIHByb2dyZXNzICsgbWluO1xuICAgICAgICBzd2lwZXIudHJhbnNsYXRlVG8oY3VycmVudCwgdHlwZW9mIHNwZWVkID09PSAndW5kZWZpbmVkJyA/IDAgOiBzcGVlZCk7XG4gICAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgICAgfVxuXG4gICAgICBlbWl0Q29udGFpbmVyQ2xhc3NlcygpIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLl9lbWl0Q2xhc3NlcyB8fCAhc3dpcGVyLmVsKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGNscyA9IHN3aXBlci5lbC5jbGFzc05hbWUuc3BsaXQoJyAnKS5maWx0ZXIoY2xhc3NOYW1lID0+IHtcbiAgICAgICAgICByZXR1cm4gY2xhc3NOYW1lLmluZGV4T2YoJ3N3aXBlcicpID09PSAwIHx8IGNsYXNzTmFtZS5pbmRleE9mKHN3aXBlci5wYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzcykgPT09IDA7XG4gICAgICAgIH0pO1xuICAgICAgICBzd2lwZXIuZW1pdCgnX2NvbnRhaW5lckNsYXNzZXMnLCBjbHMuam9pbignICcpKTtcbiAgICAgIH1cblxuICAgICAgZ2V0U2xpZGVDbGFzc2VzKHNsaWRlRWwpIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgaWYgKHN3aXBlci5kZXN0cm95ZWQpIHJldHVybiAnJztcbiAgICAgICAgcmV0dXJuIHNsaWRlRWwuY2xhc3NOYW1lLnNwbGl0KCcgJykuZmlsdGVyKGNsYXNzTmFtZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGNsYXNzTmFtZS5pbmRleE9mKCdzd2lwZXItc2xpZGUnKSA9PT0gMCB8fCBjbGFzc05hbWUuaW5kZXhPZihzd2lwZXIucGFyYW1zLnNsaWRlQ2xhc3MpID09PSAwO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgICB9XG5cbiAgICAgIGVtaXRTbGlkZXNDbGFzc2VzKCkge1xuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMuX2VtaXRDbGFzc2VzIHx8ICFzd2lwZXIuZWwpIHJldHVybjtcbiAgICAgICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgICAgICBzd2lwZXIuc2xpZGVzLmVhY2goc2xpZGVFbCA9PiB7XG4gICAgICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IHN3aXBlci5nZXRTbGlkZUNsYXNzZXMoc2xpZGVFbCk7XG4gICAgICAgICAgdXBkYXRlcy5wdXNoKHtcbiAgICAgICAgICAgIHNsaWRlRWwsXG4gICAgICAgICAgICBjbGFzc05hbWVzXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ19zbGlkZUNsYXNzJywgc2xpZGVFbCwgY2xhc3NOYW1lcyk7XG4gICAgICAgIH0pO1xuICAgICAgICBzd2lwZXIuZW1pdCgnX3NsaWRlQ2xhc3NlcycsIHVwZGF0ZXMpO1xuICAgICAgfVxuXG4gICAgICBzbGlkZXNQZXJWaWV3RHluYW1pYyh2aWV3LCBleGFjdCkge1xuICAgICAgICBpZiAodmlldyA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgdmlldyA9ICdjdXJyZW50JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChleGFjdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgZXhhY3QgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgc2xpZGVzLFxuICAgICAgICAgIHNsaWRlc0dyaWQsXG4gICAgICAgICAgc2xpZGVzU2l6ZXNHcmlkLFxuICAgICAgICAgIHNpemU6IHN3aXBlclNpemUsXG4gICAgICAgICAgYWN0aXZlSW5kZXhcbiAgICAgICAgfSA9IHN3aXBlcjtcbiAgICAgICAgbGV0IHNwdiA9IDE7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgICAgIGxldCBzbGlkZVNpemUgPSBzbGlkZXNbYWN0aXZlSW5kZXhdLnN3aXBlclNsaWRlU2l6ZTtcbiAgICAgICAgICBsZXQgYnJlYWtMb29wO1xuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IGFjdGl2ZUluZGV4ICsgMTsgaSA8IHNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHNsaWRlc1tpXSAmJiAhYnJlYWtMb29wKSB7XG4gICAgICAgICAgICAgIHNsaWRlU2l6ZSArPSBzbGlkZXNbaV0uc3dpcGVyU2xpZGVTaXplO1xuICAgICAgICAgICAgICBzcHYgKz0gMTtcbiAgICAgICAgICAgICAgaWYgKHNsaWRlU2l6ZSA+IHN3aXBlclNpemUpIGJyZWFrTG9vcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IGFjdGl2ZUluZGV4IC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIGlmIChzbGlkZXNbaV0gJiYgIWJyZWFrTG9vcCkge1xuICAgICAgICAgICAgICBzbGlkZVNpemUgKz0gc2xpZGVzW2ldLnN3aXBlclNsaWRlU2l6ZTtcbiAgICAgICAgICAgICAgc3B2ICs9IDE7XG4gICAgICAgICAgICAgIGlmIChzbGlkZVNpemUgPiBzd2lwZXJTaXplKSBicmVha0xvb3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICBpZiAodmlldyA9PT0gJ2N1cnJlbnQnKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gYWN0aXZlSW5kZXggKyAxOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHNsaWRlSW5WaWV3ID0gZXhhY3QgPyBzbGlkZXNHcmlkW2ldICsgc2xpZGVzU2l6ZXNHcmlkW2ldIC0gc2xpZGVzR3JpZFthY3RpdmVJbmRleF0gPCBzd2lwZXJTaXplIDogc2xpZGVzR3JpZFtpXSAtIHNsaWRlc0dyaWRbYWN0aXZlSW5kZXhdIDwgc3dpcGVyU2l6ZTtcblxuICAgICAgICAgICAgICBpZiAoc2xpZGVJblZpZXcpIHtcbiAgICAgICAgICAgICAgICBzcHYgKz0gMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBwcmV2aW91c1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGFjdGl2ZUluZGV4IC0gMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgICAgY29uc3Qgc2xpZGVJblZpZXcgPSBzbGlkZXNHcmlkW2FjdGl2ZUluZGV4XSAtIHNsaWRlc0dyaWRbaV0gPCBzd2lwZXJTaXplO1xuXG4gICAgICAgICAgICAgIGlmIChzbGlkZUluVmlldykge1xuICAgICAgICAgICAgICAgIHNwdiArPSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNwdjtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlKCkge1xuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBzbmFwR3JpZCxcbiAgICAgICAgICBwYXJhbXNcbiAgICAgICAgfSA9IHN3aXBlcjsgLy8gQnJlYWtwb2ludHNcblxuICAgICAgICBpZiAocGFyYW1zLmJyZWFrcG9pbnRzKSB7XG4gICAgICAgICAgc3dpcGVyLnNldEJyZWFrcG9pbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci51cGRhdGVTaXplKCk7XG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXMoKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKCk7XG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0VHJhbnNsYXRlKCkge1xuICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVZhbHVlID0gc3dpcGVyLnJ0bFRyYW5zbGF0ZSA/IHN3aXBlci50cmFuc2xhdGUgKiAtMSA6IHN3aXBlci50cmFuc2xhdGU7XG4gICAgICAgICAgY29uc3QgbmV3VHJhbnNsYXRlID0gTWF0aC5taW4oTWF0aC5tYXgodHJhbnNsYXRlVmFsdWUsIHN3aXBlci5tYXhUcmFuc2xhdGUoKSksIHN3aXBlci5taW5UcmFuc2xhdGUoKSk7XG4gICAgICAgICAgc3dpcGVyLnNldFRyYW5zbGF0ZShuZXdUcmFuc2xhdGUpO1xuICAgICAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdHJhbnNsYXRlZDtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5mcmVlTW9kZSAmJiBzd2lwZXIucGFyYW1zLmZyZWVNb2RlLmVuYWJsZWQpIHtcbiAgICAgICAgICBzZXRUcmFuc2xhdGUoKTtcblxuICAgICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmF1dG9IZWlnaHQpIHtcbiAgICAgICAgICAgIHN3aXBlci51cGRhdGVBdXRvSGVpZ2h0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICgoc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgfHwgc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJWaWV3ID4gMSkgJiYgc3dpcGVyLmlzRW5kICYmICFzd2lwZXIucGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgICAgICB0cmFuc2xhdGVkID0gc3dpcGVyLnNsaWRlVG8oc3dpcGVyLnNsaWRlcy5sZW5ndGggLSAxLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZWQgPSBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXgsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXRyYW5zbGF0ZWQpIHtcbiAgICAgICAgICAgIHNldFRyYW5zbGF0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMud2F0Y2hPdmVyZmxvdyAmJiBzbmFwR3JpZCAhPT0gc3dpcGVyLnNuYXBHcmlkKSB7XG4gICAgICAgICAgc3dpcGVyLmNoZWNrT3ZlcmZsb3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5lbWl0KCd1cGRhdGUnKTtcbiAgICAgIH1cblxuICAgICAgY2hhbmdlRGlyZWN0aW9uKG5ld0RpcmVjdGlvbiwgbmVlZFVwZGF0ZSkge1xuICAgICAgICBpZiAobmVlZFVwZGF0ZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgbmVlZFVwZGF0ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBjb25zdCBjdXJyZW50RGlyZWN0aW9uID0gc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb247XG5cbiAgICAgICAgaWYgKCFuZXdEaXJlY3Rpb24pIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICBuZXdEaXJlY3Rpb24gPSBjdXJyZW50RGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld0RpcmVjdGlvbiA9PT0gY3VycmVudERpcmVjdGlvbiB8fCBuZXdEaXJlY3Rpb24gIT09ICdob3Jpem9udGFsJyAmJiBuZXdEaXJlY3Rpb24gIT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgICByZXR1cm4gc3dpcGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLiRlbC5yZW1vdmVDbGFzcyhgJHtzd2lwZXIucGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3N9JHtjdXJyZW50RGlyZWN0aW9ufWApLmFkZENsYXNzKGAke3N3aXBlci5wYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc30ke25ld0RpcmVjdGlvbn1gKTtcbiAgICAgICAgc3dpcGVyLmVtaXRDb250YWluZXJDbGFzc2VzKCk7XG4gICAgICAgIHN3aXBlci5wYXJhbXMuZGlyZWN0aW9uID0gbmV3RGlyZWN0aW9uO1xuICAgICAgICBzd2lwZXIuc2xpZGVzLmVhY2goc2xpZGVFbCA9PiB7XG4gICAgICAgICAgaWYgKG5ld0RpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgc2xpZGVFbC5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzbGlkZUVsLnN0eWxlLmhlaWdodCA9ICcnO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHN3aXBlci5lbWl0KCdjaGFuZ2VEaXJlY3Rpb24nKTtcbiAgICAgICAgaWYgKG5lZWRVcGRhdGUpIHN3aXBlci51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHN3aXBlcjtcbiAgICAgIH1cblxuICAgICAgY2hhbmdlTGFuZ3VhZ2VEaXJlY3Rpb24oZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmIChzd2lwZXIucnRsICYmIGRpcmVjdGlvbiA9PT0gJ3J0bCcgfHwgIXN3aXBlci5ydGwgJiYgZGlyZWN0aW9uID09PSAnbHRyJykgcmV0dXJuO1xuICAgICAgICBzd2lwZXIucnRsID0gZGlyZWN0aW9uID09PSAncnRsJztcbiAgICAgICAgc3dpcGVyLnJ0bFRyYW5zbGF0ZSA9IHN3aXBlci5wYXJhbXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgJiYgc3dpcGVyLnJ0bDtcblxuICAgICAgICBpZiAoc3dpcGVyLnJ0bCkge1xuICAgICAgICAgIHN3aXBlci4kZWwuYWRkQ2xhc3MoYCR7c3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzfXJ0bGApO1xuICAgICAgICAgIHN3aXBlci5lbC5kaXIgPSAncnRsJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuJGVsLnJlbW92ZUNsYXNzKGAke3N3aXBlci5wYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc31ydGxgKTtcbiAgICAgICAgICBzd2lwZXIuZWwuZGlyID0gJ2x0cic7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIudXBkYXRlKCk7XG4gICAgICB9XG5cbiAgICAgIG1vdW50KGVsKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmIChzd2lwZXIubW91bnRlZCkgcmV0dXJuIHRydWU7IC8vIEZpbmQgZWxcblxuICAgICAgICBjb25zdCAkZWwgPSAkKGVsIHx8IHN3aXBlci5wYXJhbXMuZWwpO1xuICAgICAgICBlbCA9ICRlbFswXTtcblxuICAgICAgICBpZiAoIWVsKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuc3dpcGVyID0gc3dpcGVyO1xuXG4gICAgICAgIGNvbnN0IGdldFdyYXBwZXJTZWxlY3RvciA9ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gYC4keyhzd2lwZXIucGFyYW1zLndyYXBwZXJDbGFzcyB8fCAnJykudHJpbSgpLnNwbGl0KCcgJykuam9pbignLicpfWA7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZ2V0V3JhcHBlciA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoZWwgJiYgZWwuc2hhZG93Um9vdCAmJiBlbC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9ICQoZWwuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKGdldFdyYXBwZXJTZWxlY3RvcigpKSk7IC8vIENoaWxkcmVuIG5lZWRzIHRvIHJldHVybiBzbG90IGl0ZW1zXG5cbiAgICAgICAgICAgIHJlcy5jaGlsZHJlbiA9IG9wdGlvbnMgPT4gJGVsLmNoaWxkcmVuKG9wdGlvbnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghJGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICByZXR1cm4gJCgkZWwpLmNoaWxkcmVuKGdldFdyYXBwZXJTZWxlY3RvcigpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gJGVsLmNoaWxkcmVuKGdldFdyYXBwZXJTZWxlY3RvcigpKTtcbiAgICAgICAgfTsgLy8gRmluZCBXcmFwcGVyXG5cblxuICAgICAgICBsZXQgJHdyYXBwZXJFbCA9IGdldFdyYXBwZXIoKTtcblxuICAgICAgICBpZiAoJHdyYXBwZXJFbC5sZW5ndGggPT09IDAgJiYgc3dpcGVyLnBhcmFtcy5jcmVhdGVFbGVtZW50cykge1xuICAgICAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgJHdyYXBwZXJFbCA9ICQod3JhcHBlcik7XG4gICAgICAgICAgd3JhcHBlci5jbGFzc05hbWUgPSBzd2lwZXIucGFyYW1zLndyYXBwZXJDbGFzcztcbiAgICAgICAgICAkZWwuYXBwZW5kKHdyYXBwZXIpO1xuICAgICAgICAgICRlbC5jaGlsZHJlbihgLiR7c3dpcGVyLnBhcmFtcy5zbGlkZUNsYXNzfWApLmVhY2goc2xpZGVFbCA9PiB7XG4gICAgICAgICAgICAkd3JhcHBlckVsLmFwcGVuZChzbGlkZUVsKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLCB7XG4gICAgICAgICAgJGVsLFxuICAgICAgICAgIGVsLFxuICAgICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgICAgd3JhcHBlckVsOiAkd3JhcHBlckVsWzBdLFxuICAgICAgICAgIG1vdW50ZWQ6IHRydWUsXG4gICAgICAgICAgLy8gUlRMXG4gICAgICAgICAgcnRsOiBlbC5kaXIudG9Mb3dlckNhc2UoKSA9PT0gJ3J0bCcgfHwgJGVsLmNzcygnZGlyZWN0aW9uJykgPT09ICdydGwnLFxuICAgICAgICAgIHJ0bFRyYW5zbGF0ZTogc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyAmJiAoZWwuZGlyLnRvTG93ZXJDYXNlKCkgPT09ICdydGwnIHx8ICRlbC5jc3MoJ2RpcmVjdGlvbicpID09PSAncnRsJyksXG4gICAgICAgICAgd3JvbmdSVEw6ICR3cmFwcGVyRWwuY3NzKCdkaXNwbGF5JykgPT09ICctd2Via2l0LWJveCdcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpbml0KGVsKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmIChzd2lwZXIuaW5pdGlhbGl6ZWQpIHJldHVybiBzd2lwZXI7XG4gICAgICAgIGNvbnN0IG1vdW50ZWQgPSBzd2lwZXIubW91bnQoZWwpO1xuICAgICAgICBpZiAobW91bnRlZCA9PT0gZmFsc2UpIHJldHVybiBzd2lwZXI7XG4gICAgICAgIHN3aXBlci5lbWl0KCdiZWZvcmVJbml0Jyk7IC8vIFNldCBicmVha3BvaW50XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYnJlYWtwb2ludHMpIHtcbiAgICAgICAgICBzd2lwZXIuc2V0QnJlYWtwb2ludCgpO1xuICAgICAgICB9IC8vIEFkZCBDbGFzc2VzXG5cblxuICAgICAgICBzd2lwZXIuYWRkQ2xhc3NlcygpOyAvLyBDcmVhdGUgbG9vcFxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgICBzd2lwZXIubG9vcENyZWF0ZSgpO1xuICAgICAgICB9IC8vIFVwZGF0ZSBzaXplXG5cblxuICAgICAgICBzd2lwZXIudXBkYXRlU2l6ZSgpOyAvLyBVcGRhdGUgc2xpZGVzXG5cbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlcygpO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLndhdGNoT3ZlcmZsb3cpIHtcbiAgICAgICAgICBzd2lwZXIuY2hlY2tPdmVyZmxvdygpO1xuICAgICAgICB9IC8vIFNldCBHcmFiIEN1cnNvclxuXG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZ3JhYkN1cnNvciAmJiBzd2lwZXIuZW5hYmxlZCkge1xuICAgICAgICAgIHN3aXBlci5zZXRHcmFiQ3Vyc29yKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5wcmVsb2FkSW1hZ2VzKSB7XG4gICAgICAgICAgc3dpcGVyLnByZWxvYWRJbWFnZXMoKTtcbiAgICAgICAgfSAvLyBTbGlkZSBUbyBJbml0aWFsIFNsaWRlXG5cblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLnBhcmFtcy5pbml0aWFsU2xpZGUgKyBzd2lwZXIubG9vcGVkU2xpZGVzLCAwLCBzd2lwZXIucGFyYW1zLnJ1bkNhbGxiYWNrc09uSW5pdCwgZmFsc2UsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5wYXJhbXMuaW5pdGlhbFNsaWRlLCAwLCBzd2lwZXIucGFyYW1zLnJ1bkNhbGxiYWNrc09uSW5pdCwgZmFsc2UsIHRydWUpO1xuICAgICAgICB9IC8vIEF0dGFjaCBldmVudHNcblxuXG4gICAgICAgIHN3aXBlci5hdHRhY2hFdmVudHMoKTsgLy8gSW5pdCBGbGFnXG5cbiAgICAgICAgc3dpcGVyLmluaXRpYWxpemVkID0gdHJ1ZTsgLy8gRW1pdFxuXG4gICAgICAgIHN3aXBlci5lbWl0KCdpbml0Jyk7XG4gICAgICAgIHN3aXBlci5lbWl0KCdhZnRlckluaXQnKTtcbiAgICAgICAgcmV0dXJuIHN3aXBlcjtcbiAgICAgIH1cblxuICAgICAgZGVzdHJveShkZWxldGVJbnN0YW5jZSwgY2xlYW5TdHlsZXMpIHtcbiAgICAgICAgaWYgKGRlbGV0ZUluc3RhbmNlID09PSB2b2lkIDApIHtcbiAgICAgICAgICBkZWxldGVJbnN0YW5jZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2xlYW5TdHlsZXMgPT09IHZvaWQgMCkge1xuICAgICAgICAgIGNsZWFuU3R5bGVzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgJGVsLFxuICAgICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgICAgc2xpZGVzXG4gICAgICAgIH0gPSBzd2lwZXI7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzd2lwZXIucGFyYW1zID09PSAndW5kZWZpbmVkJyB8fCBzd2lwZXIuZGVzdHJveWVkKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuZW1pdCgnYmVmb3JlRGVzdHJveScpOyAvLyBJbml0IEZsYWdcblxuICAgICAgICBzd2lwZXIuaW5pdGlhbGl6ZWQgPSBmYWxzZTsgLy8gRGV0YWNoIGV2ZW50c1xuXG4gICAgICAgIHN3aXBlci5kZXRhY2hFdmVudHMoKTsgLy8gRGVzdHJveSBsb29wXG5cbiAgICAgICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgc3dpcGVyLmxvb3BEZXN0cm95KCk7XG4gICAgICAgIH0gLy8gQ2xlYW51cCBzdHlsZXNcblxuXG4gICAgICAgIGlmIChjbGVhblN0eWxlcykge1xuICAgICAgICAgIHN3aXBlci5yZW1vdmVDbGFzc2VzKCk7XG4gICAgICAgICAgJGVsLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgJHdyYXBwZXJFbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXG4gICAgICAgICAgaWYgKHNsaWRlcyAmJiBzbGlkZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzbGlkZXMucmVtb3ZlQ2xhc3MoW3BhcmFtcy5zbGlkZVZpc2libGVDbGFzcywgcGFyYW1zLnNsaWRlQWN0aXZlQ2xhc3MsIHBhcmFtcy5zbGlkZU5leHRDbGFzcywgcGFyYW1zLnNsaWRlUHJldkNsYXNzXS5qb2luKCcgJykpLnJlbW92ZUF0dHIoJ3N0eWxlJykucmVtb3ZlQXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuZW1pdCgnZGVzdHJveScpOyAvLyBEZXRhY2ggZW1pdHRlciBldmVudHNcblxuICAgICAgICBPYmplY3Qua2V5cyhzd2lwZXIuZXZlbnRzTGlzdGVuZXJzKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgICAgc3dpcGVyLm9mZihldmVudE5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGVsZXRlSW5zdGFuY2UgIT09IGZhbHNlKSB7XG4gICAgICAgICAgc3dpcGVyLiRlbFswXS5zd2lwZXIgPSBudWxsO1xuICAgICAgICAgIGRlbGV0ZVByb3BzKHN3aXBlcik7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBleHRlbmREZWZhdWx0cyhuZXdEZWZhdWx0cykge1xuICAgICAgICBleHRlbmQkMShleHRlbmRlZERlZmF1bHRzLCBuZXdEZWZhdWx0cyk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBnZXQgZXh0ZW5kZWREZWZhdWx0cygpIHtcbiAgICAgICAgcmV0dXJuIGV4dGVuZGVkRGVmYXVsdHM7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0cztcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGluc3RhbGxNb2R1bGUobW9kKSB7XG4gICAgICAgIGlmICghU3dpcGVyLnByb3RvdHlwZS5fX21vZHVsZXNfXykgU3dpcGVyLnByb3RvdHlwZS5fX21vZHVsZXNfXyA9IFtdO1xuICAgICAgICBjb25zdCBtb2R1bGVzID0gU3dpcGVyLnByb3RvdHlwZS5fX21vZHVsZXNfXztcblxuICAgICAgICBpZiAodHlwZW9mIG1vZCA9PT0gJ2Z1bmN0aW9uJyAmJiBtb2R1bGVzLmluZGV4T2YobW9kKSA8IDApIHtcbiAgICAgICAgICBtb2R1bGVzLnB1c2gobW9kKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdGF0aWMgdXNlKG1vZHVsZSkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShtb2R1bGUpKSB7XG4gICAgICAgICAgbW9kdWxlLmZvckVhY2gobSA9PiBTd2lwZXIuaW5zdGFsbE1vZHVsZShtKSk7XG4gICAgICAgICAgcmV0dXJuIFN3aXBlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIFN3aXBlci5pbnN0YWxsTW9kdWxlKG1vZHVsZSk7XG4gICAgICAgIHJldHVybiBTd2lwZXI7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhwcm90b3R5cGVzKS5mb3JFYWNoKHByb3RvdHlwZUdyb3VwID0+IHtcbiAgICAgIE9iamVjdC5rZXlzKHByb3RvdHlwZXNbcHJvdG90eXBlR3JvdXBdKS5mb3JFYWNoKHByb3RvTWV0aG9kID0+IHtcbiAgICAgICAgU3dpcGVyLnByb3RvdHlwZVtwcm90b01ldGhvZF0gPSBwcm90b3R5cGVzW3Byb3RvdHlwZUdyb3VwXVtwcm90b01ldGhvZF07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBTd2lwZXIudXNlKFtSZXNpemUsIE9ic2VydmVyXSk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50SWZOb3REZWZpbmVkKHN3aXBlciwgb3JpZ2luYWxQYXJhbXMsIHBhcmFtcywgY2hlY2tQcm9wcykge1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5jcmVhdGVFbGVtZW50cykge1xuICAgICAgICBPYmplY3Qua2V5cyhjaGVja1Byb3BzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgaWYgKCFwYXJhbXNba2V5XSAmJiBwYXJhbXMuYXV0byA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzd2lwZXIuJGVsLmNoaWxkcmVuKGAuJHtjaGVja1Byb3BzW2tleV19YClbMF07XG5cbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY2hlY2tQcm9wc1trZXldO1xuICAgICAgICAgICAgICBzd2lwZXIuJGVsLmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGFyYW1zW2tleV0gPSBlbGVtZW50O1xuICAgICAgICAgICAgb3JpZ2luYWxQYXJhbXNba2V5XSA9IGVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBOYXZpZ2F0aW9uKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgZXh0ZW5kUGFyYW1zLFxuICAgICAgICBvbixcbiAgICAgICAgZW1pdFxuICAgICAgfSA9IF9yZWY7XG4gICAgICBleHRlbmRQYXJhbXMoe1xuICAgICAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICAgICAgbmV4dEVsOiBudWxsLFxuICAgICAgICAgIHByZXZFbDogbnVsbCxcbiAgICAgICAgICBoaWRlT25DbGljazogZmFsc2UsXG4gICAgICAgICAgZGlzYWJsZWRDbGFzczogJ3N3aXBlci1idXR0b24tZGlzYWJsZWQnLFxuICAgICAgICAgIGhpZGRlbkNsYXNzOiAnc3dpcGVyLWJ1dHRvbi1oaWRkZW4nLFxuICAgICAgICAgIGxvY2tDbGFzczogJ3N3aXBlci1idXR0b24tbG9jaycsXG4gICAgICAgICAgbmF2aWdhdGlvbkRpc2FibGVkQ2xhc3M6ICdzd2lwZXItbmF2aWdhdGlvbi1kaXNhYmxlZCdcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzd2lwZXIubmF2aWdhdGlvbiA9IHtcbiAgICAgICAgbmV4dEVsOiBudWxsLFxuICAgICAgICAkbmV4dEVsOiBudWxsLFxuICAgICAgICBwcmV2RWw6IG51bGwsXG4gICAgICAgICRwcmV2RWw6IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGdldEVsKGVsKSB7XG4gICAgICAgIGxldCAkZWw7XG5cbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgJGVsID0gJChlbCk7XG5cbiAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy51bmlxdWVOYXZFbGVtZW50cyAmJiB0eXBlb2YgZWwgPT09ICdzdHJpbmcnICYmICRlbC5sZW5ndGggPiAxICYmIHN3aXBlci4kZWwuZmluZChlbCkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAkZWwgPSBzd2lwZXIuJGVsLmZpbmQoZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkZWw7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZUVsKCRlbCwgZGlzYWJsZWQpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uO1xuXG4gICAgICAgIGlmICgkZWwgJiYgJGVsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAkZWxbZGlzYWJsZWQgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10ocGFyYW1zLmRpc2FibGVkQ2xhc3MpO1xuICAgICAgICAgIGlmICgkZWxbMF0gJiYgJGVsWzBdLnRhZ05hbWUgPT09ICdCVVRUT04nKSAkZWxbMF0uZGlzYWJsZWQgPSBkaXNhYmxlZDtcblxuICAgICAgICAgIGlmIChzd2lwZXIucGFyYW1zLndhdGNoT3ZlcmZsb3cgJiYgc3dpcGVyLmVuYWJsZWQpIHtcbiAgICAgICAgICAgICRlbFtzd2lwZXIuaXNMb2NrZWQgPyAnYWRkQ2xhc3MnIDogJ3JlbW92ZUNsYXNzJ10ocGFyYW1zLmxvY2tDbGFzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gVXBkYXRlIE5hdmlnYXRpb24gQnV0dG9uc1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkbmV4dEVsLFxuICAgICAgICAgICRwcmV2RWxcbiAgICAgICAgfSA9IHN3aXBlci5uYXZpZ2F0aW9uO1xuICAgICAgICB0b2dnbGVFbCgkcHJldkVsLCBzd2lwZXIuaXNCZWdpbm5pbmcgJiYgIXN3aXBlci5wYXJhbXMucmV3aW5kKTtcbiAgICAgICAgdG9nZ2xlRWwoJG5leHRFbCwgc3dpcGVyLmlzRW5kICYmICFzd2lwZXIucGFyYW1zLnJld2luZCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUHJldkNsaWNrKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAoc3dpcGVyLmlzQmVnaW5uaW5nICYmICFzd2lwZXIucGFyYW1zLmxvb3AgJiYgIXN3aXBlci5wYXJhbXMucmV3aW5kKSByZXR1cm47XG4gICAgICAgIHN3aXBlci5zbGlkZVByZXYoKTtcbiAgICAgICAgZW1pdCgnbmF2aWdhdGlvblByZXYnKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25OZXh0Q2xpY2soZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzd2lwZXIuaXNFbmQgJiYgIXN3aXBlci5wYXJhbXMubG9vcCAmJiAhc3dpcGVyLnBhcmFtcy5yZXdpbmQpIHJldHVybjtcbiAgICAgICAgc3dpcGVyLnNsaWRlTmV4dCgpO1xuICAgICAgICBlbWl0KCduYXZpZ2F0aW9uTmV4dCcpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLm5hdmlnYXRpb247XG4gICAgICAgIHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbiA9IGNyZWF0ZUVsZW1lbnRJZk5vdERlZmluZWQoc3dpcGVyLCBzd2lwZXIub3JpZ2luYWxQYXJhbXMubmF2aWdhdGlvbiwgc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLCB7XG4gICAgICAgICAgbmV4dEVsOiAnc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgICAgICBwcmV2RWw6ICdzd2lwZXItYnV0dG9uLXByZXYnXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIShwYXJhbXMubmV4dEVsIHx8IHBhcmFtcy5wcmV2RWwpKSByZXR1cm47XG4gICAgICAgIGNvbnN0ICRuZXh0RWwgPSBnZXRFbChwYXJhbXMubmV4dEVsKTtcbiAgICAgICAgY29uc3QgJHByZXZFbCA9IGdldEVsKHBhcmFtcy5wcmV2RWwpO1xuXG4gICAgICAgIGlmICgkbmV4dEVsICYmICRuZXh0RWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICRuZXh0RWwub24oJ2NsaWNrJywgb25OZXh0Q2xpY2spO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRwcmV2RWwgJiYgJHByZXZFbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgJHByZXZFbC5vbignY2xpY2snLCBvblByZXZDbGljayk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHN3aXBlci5uYXZpZ2F0aW9uLCB7XG4gICAgICAgICAgJG5leHRFbCxcbiAgICAgICAgICBuZXh0RWw6ICRuZXh0RWwgJiYgJG5leHRFbFswXSxcbiAgICAgICAgICAkcHJldkVsLFxuICAgICAgICAgIHByZXZFbDogJHByZXZFbCAmJiAkcHJldkVsWzBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc3dpcGVyLmVuYWJsZWQpIHtcbiAgICAgICAgICBpZiAoJG5leHRFbCkgJG5leHRFbC5hZGRDbGFzcyhwYXJhbXMubG9ja0NsYXNzKTtcbiAgICAgICAgICBpZiAoJHByZXZFbCkgJHByZXZFbC5hZGRDbGFzcyhwYXJhbXMubG9ja0NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJG5leHRFbCxcbiAgICAgICAgICAkcHJldkVsXG4gICAgICAgIH0gPSBzd2lwZXIubmF2aWdhdGlvbjtcblxuICAgICAgICBpZiAoJG5leHRFbCAmJiAkbmV4dEVsLmxlbmd0aCkge1xuICAgICAgICAgICRuZXh0RWwub2ZmKCdjbGljaycsIG9uTmV4dENsaWNrKTtcbiAgICAgICAgICAkbmV4dEVsLnJlbW92ZUNsYXNzKHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5kaXNhYmxlZENsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkcHJldkVsICYmICRwcmV2RWwubGVuZ3RoKSB7XG4gICAgICAgICAgJHByZXZFbC5vZmYoJ2NsaWNrJywgb25QcmV2Q2xpY2spO1xuICAgICAgICAgICRwcmV2RWwucmVtb3ZlQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmRpc2FibGVkQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG9uKCdpbml0JywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmVuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgZGlzYWJsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbigndG9FZGdlIGZyb21FZGdlIGxvY2sgdW5sb2NrJywgKCkgPT4ge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIGRlc3Ryb3koKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ2VuYWJsZSBkaXNhYmxlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJG5leHRFbCxcbiAgICAgICAgICAkcHJldkVsXG4gICAgICAgIH0gPSBzd2lwZXIubmF2aWdhdGlvbjtcblxuICAgICAgICBpZiAoJG5leHRFbCkge1xuICAgICAgICAgICRuZXh0RWxbc3dpcGVyLmVuYWJsZWQgPyAncmVtb3ZlQ2xhc3MnIDogJ2FkZENsYXNzJ10oc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmxvY2tDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJHByZXZFbCkge1xuICAgICAgICAgICRwcmV2RWxbc3dpcGVyLmVuYWJsZWQgPyAncmVtb3ZlQ2xhc3MnIDogJ2FkZENsYXNzJ10oc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmxvY2tDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ2NsaWNrJywgKF9zLCBlKSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkbmV4dEVsLFxuICAgICAgICAgICRwcmV2RWxcbiAgICAgICAgfSA9IHN3aXBlci5uYXZpZ2F0aW9uO1xuICAgICAgICBjb25zdCB0YXJnZXRFbCA9IGUudGFyZ2V0O1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24uaGlkZU9uQ2xpY2sgJiYgISQodGFyZ2V0RWwpLmlzKCRwcmV2RWwpICYmICEkKHRhcmdldEVsKS5pcygkbmV4dEVsKSkge1xuICAgICAgICAgIGlmIChzd2lwZXIucGFnaW5hdGlvbiAmJiBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24gJiYgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmNsaWNrYWJsZSAmJiAoc3dpcGVyLnBhZ2luYXRpb24uZWwgPT09IHRhcmdldEVsIHx8IHN3aXBlci5wYWdpbmF0aW9uLmVsLmNvbnRhaW5zKHRhcmdldEVsKSkpIHJldHVybjtcbiAgICAgICAgICBsZXQgaXNIaWRkZW47XG5cbiAgICAgICAgICBpZiAoJG5leHRFbCkge1xuICAgICAgICAgICAgaXNIaWRkZW4gPSAkbmV4dEVsLmhhc0NsYXNzKHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5oaWRkZW5DbGFzcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkcHJldkVsKSB7XG4gICAgICAgICAgICBpc0hpZGRlbiA9ICRwcmV2RWwuaGFzQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmhpZGRlbkNsYXNzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNIaWRkZW4gPT09IHRydWUpIHtcbiAgICAgICAgICAgIGVtaXQoJ25hdmlnYXRpb25TaG93Jyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVtaXQoJ25hdmlnYXRpb25IaWRlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCRuZXh0RWwpIHtcbiAgICAgICAgICAgICRuZXh0RWwudG9nZ2xlQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmhpZGRlbkNsYXNzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoJHByZXZFbCkge1xuICAgICAgICAgICAgJHByZXZFbC50b2dnbGVDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24uaGlkZGVuQ2xhc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVuYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5yZW1vdmVDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24ubmF2aWdhdGlvbkRpc2FibGVkQ2xhc3MpO1xuICAgICAgICBpbml0KCk7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgZGlzYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5hZGRDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24ubmF2aWdhdGlvbkRpc2FibGVkQ2xhc3MpO1xuICAgICAgICBkZXN0cm95KCk7XG4gICAgICB9O1xuXG4gICAgICBPYmplY3QuYXNzaWduKHN3aXBlci5uYXZpZ2F0aW9uLCB7XG4gICAgICAgIGVuYWJsZSxcbiAgICAgICAgZGlzYWJsZSxcbiAgICAgICAgdXBkYXRlLFxuICAgICAgICBpbml0LFxuICAgICAgICBkZXN0cm95XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGFzc2VzVG9TZWxlY3RvcihjbGFzc2VzKSB7XG4gICAgICBpZiAoY2xhc3NlcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGNsYXNzZXMgPSAnJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGAuJHtjbGFzc2VzLnRyaW0oKS5yZXBsYWNlKC8oW1xcLjohXFwvXSkvZywgJ1xcXFwkMScpIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgLnJlcGxhY2UoLyAvZywgJy4nKX1gO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFBhZ2luYXRpb24oX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBleHRlbmRQYXJhbXMsXG4gICAgICAgIG9uLFxuICAgICAgICBlbWl0XG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGNvbnN0IHBmeCA9ICdzd2lwZXItcGFnaW5hdGlvbic7XG4gICAgICBleHRlbmRQYXJhbXMoe1xuICAgICAgICBwYWdpbmF0aW9uOiB7XG4gICAgICAgICAgZWw6IG51bGwsXG4gICAgICAgICAgYnVsbGV0RWxlbWVudDogJ3NwYW4nLFxuICAgICAgICAgIGNsaWNrYWJsZTogZmFsc2UsXG4gICAgICAgICAgaGlkZU9uQ2xpY2s6IGZhbHNlLFxuICAgICAgICAgIHJlbmRlckJ1bGxldDogbnVsbCxcbiAgICAgICAgICByZW5kZXJQcm9ncmVzc2JhcjogbnVsbCxcbiAgICAgICAgICByZW5kZXJGcmFjdGlvbjogbnVsbCxcbiAgICAgICAgICByZW5kZXJDdXN0b206IG51bGwsXG4gICAgICAgICAgcHJvZ3Jlc3NiYXJPcHBvc2l0ZTogZmFsc2UsXG4gICAgICAgICAgdHlwZTogJ2J1bGxldHMnLFxuICAgICAgICAgIC8vICdidWxsZXRzJyBvciAncHJvZ3Jlc3NiYXInIG9yICdmcmFjdGlvbicgb3IgJ2N1c3RvbSdcbiAgICAgICAgICBkeW5hbWljQnVsbGV0czogZmFsc2UsXG4gICAgICAgICAgZHluYW1pY01haW5CdWxsZXRzOiAxLFxuICAgICAgICAgIGZvcm1hdEZyYWN0aW9uQ3VycmVudDogbnVtYmVyID0+IG51bWJlcixcbiAgICAgICAgICBmb3JtYXRGcmFjdGlvblRvdGFsOiBudW1iZXIgPT4gbnVtYmVyLFxuICAgICAgICAgIGJ1bGxldENsYXNzOiBgJHtwZnh9LWJ1bGxldGAsXG4gICAgICAgICAgYnVsbGV0QWN0aXZlQ2xhc3M6IGAke3BmeH0tYnVsbGV0LWFjdGl2ZWAsXG4gICAgICAgICAgbW9kaWZpZXJDbGFzczogYCR7cGZ4fS1gLFxuICAgICAgICAgIGN1cnJlbnRDbGFzczogYCR7cGZ4fS1jdXJyZW50YCxcbiAgICAgICAgICB0b3RhbENsYXNzOiBgJHtwZnh9LXRvdGFsYCxcbiAgICAgICAgICBoaWRkZW5DbGFzczogYCR7cGZ4fS1oaWRkZW5gLFxuICAgICAgICAgIHByb2dyZXNzYmFyRmlsbENsYXNzOiBgJHtwZnh9LXByb2dyZXNzYmFyLWZpbGxgLFxuICAgICAgICAgIHByb2dyZXNzYmFyT3Bwb3NpdGVDbGFzczogYCR7cGZ4fS1wcm9ncmVzc2Jhci1vcHBvc2l0ZWAsXG4gICAgICAgICAgY2xpY2thYmxlQ2xhc3M6IGAke3BmeH0tY2xpY2thYmxlYCxcbiAgICAgICAgICBsb2NrQ2xhc3M6IGAke3BmeH0tbG9ja2AsXG4gICAgICAgICAgaG9yaXpvbnRhbENsYXNzOiBgJHtwZnh9LWhvcml6b250YWxgLFxuICAgICAgICAgIHZlcnRpY2FsQ2xhc3M6IGAke3BmeH0tdmVydGljYWxgLFxuICAgICAgICAgIHBhZ2luYXRpb25EaXNhYmxlZENsYXNzOiBgJHtwZnh9LWRpc2FibGVkYFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN3aXBlci5wYWdpbmF0aW9uID0ge1xuICAgICAgICBlbDogbnVsbCxcbiAgICAgICAgJGVsOiBudWxsLFxuICAgICAgICBidWxsZXRzOiBbXVxuICAgICAgfTtcbiAgICAgIGxldCBidWxsZXRTaXplO1xuICAgICAgbGV0IGR5bmFtaWNCdWxsZXRJbmRleCA9IDA7XG5cbiAgICAgIGZ1bmN0aW9uIGlzUGFnaW5hdGlvbkRpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gIXN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5lbCB8fCAhc3dpcGVyLnBhZ2luYXRpb24uZWwgfHwgIXN3aXBlci5wYWdpbmF0aW9uLiRlbCB8fCBzd2lwZXIucGFnaW5hdGlvbi4kZWwubGVuZ3RoID09PSAwO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRTaWRlQnVsbGV0cygkYnVsbGV0RWwsIHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBidWxsZXRBY3RpdmVDbGFzc1xuICAgICAgICB9ID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICAkYnVsbGV0RWxbcG9zaXRpb25dKCkuYWRkQ2xhc3MoYCR7YnVsbGV0QWN0aXZlQ2xhc3N9LSR7cG9zaXRpb259YClbcG9zaXRpb25dKCkuYWRkQ2xhc3MoYCR7YnVsbGV0QWN0aXZlQ2xhc3N9LSR7cG9zaXRpb259LSR7cG9zaXRpb259YCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gUmVuZGVyIHx8IFVwZGF0ZSBQYWdpbmF0aW9uIGJ1bGxldHMvaXRlbXNcbiAgICAgICAgY29uc3QgcnRsID0gc3dpcGVyLnJ0bDtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICBpZiAoaXNQYWdpbmF0aW9uRGlzYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzbGlkZXNMZW5ndGggPSBzd2lwZXIudmlydHVhbCAmJiBzd2lwZXIucGFyYW1zLnZpcnR1YWwuZW5hYmxlZCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggOiBzd2lwZXIuc2xpZGVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgJGVsID0gc3dpcGVyLnBhZ2luYXRpb24uJGVsOyAvLyBDdXJyZW50L1RvdGFsXG5cbiAgICAgICAgbGV0IGN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gc3dpcGVyLnBhcmFtcy5sb29wID8gTWF0aC5jZWlsKChzbGlkZXNMZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzICogMikgLyBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwKSA6IHN3aXBlci5zbmFwR3JpZC5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgIGN1cnJlbnQgPSBNYXRoLmNlaWwoKHN3aXBlci5hY3RpdmVJbmRleCAtIHN3aXBlci5sb29wZWRTbGlkZXMpIC8gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCk7XG5cbiAgICAgICAgICBpZiAoY3VycmVudCA+IHNsaWRlc0xlbmd0aCAtIDEgLSBzd2lwZXIubG9vcGVkU2xpZGVzICogMikge1xuICAgICAgICAgICAgY3VycmVudCAtPSBzbGlkZXNMZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzICogMjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudCA+IHRvdGFsIC0gMSkgY3VycmVudCAtPSB0b3RhbDtcbiAgICAgICAgICBpZiAoY3VycmVudCA8IDAgJiYgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uVHlwZSAhPT0gJ2J1bGxldHMnKSBjdXJyZW50ID0gdG90YWwgKyBjdXJyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzd2lwZXIuc25hcEluZGV4ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGN1cnJlbnQgPSBzd2lwZXIuc25hcEluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1cnJlbnQgPSBzd2lwZXIuYWN0aXZlSW5kZXggfHwgMDtcbiAgICAgICAgfSAvLyBUeXBlc1xuXG5cbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnYnVsbGV0cycgJiYgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cyAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBidWxsZXRzID0gc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cztcbiAgICAgICAgICBsZXQgZmlyc3RJbmRleDtcbiAgICAgICAgICBsZXQgbGFzdEluZGV4O1xuICAgICAgICAgIGxldCBtaWRJbmRleDtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY0J1bGxldHMpIHtcbiAgICAgICAgICAgIGJ1bGxldFNpemUgPSBidWxsZXRzLmVxKDApW3N3aXBlci5pc0hvcml6b250YWwoKSA/ICdvdXRlcldpZHRoJyA6ICdvdXRlckhlaWdodCddKHRydWUpO1xuICAgICAgICAgICAgJGVsLmNzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnd2lkdGgnIDogJ2hlaWdodCcsIGAke2J1bGxldFNpemUgKiAocGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyArIDQpfXB4YCk7XG5cbiAgICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzID4gMSAmJiBzd2lwZXIucHJldmlvdXNJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGR5bmFtaWNCdWxsZXRJbmRleCArPSBjdXJyZW50IC0gKHN3aXBlci5wcmV2aW91c0luZGV4IC0gc3dpcGVyLmxvb3BlZFNsaWRlcyB8fCAwKTtcblxuICAgICAgICAgICAgICBpZiAoZHluYW1pY0J1bGxldEluZGV4ID4gcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyAtIDEpIHtcbiAgICAgICAgICAgICAgICBkeW5hbWljQnVsbGV0SW5kZXggPSBwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzIC0gMTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChkeW5hbWljQnVsbGV0SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgZHluYW1pY0J1bGxldEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdEluZGV4ID0gTWF0aC5tYXgoY3VycmVudCAtIGR5bmFtaWNCdWxsZXRJbmRleCwgMCk7XG4gICAgICAgICAgICBsYXN0SW5kZXggPSBmaXJzdEluZGV4ICsgKE1hdGgubWluKGJ1bGxldHMubGVuZ3RoLCBwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzKSAtIDEpO1xuICAgICAgICAgICAgbWlkSW5kZXggPSAobGFzdEluZGV4ICsgZmlyc3RJbmRleCkgLyAyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJ1bGxldHMucmVtb3ZlQ2xhc3MoWycnLCAnLW5leHQnLCAnLW5leHQtbmV4dCcsICctcHJldicsICctcHJldi1wcmV2JywgJy1tYWluJ10ubWFwKHN1ZmZpeCA9PiBgJHtwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3N9JHtzdWZmaXh9YCkuam9pbignICcpKTtcblxuICAgICAgICAgIGlmICgkZWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgYnVsbGV0cy5lYWNoKGJ1bGxldCA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0ICRidWxsZXQgPSAkKGJ1bGxldCk7XG4gICAgICAgICAgICAgIGNvbnN0IGJ1bGxldEluZGV4ID0gJGJ1bGxldC5pbmRleCgpO1xuXG4gICAgICAgICAgICAgIGlmIChidWxsZXRJbmRleCA9PT0gY3VycmVudCkge1xuICAgICAgICAgICAgICAgICRidWxsZXQuYWRkQ2xhc3MocGFyYW1zLmJ1bGxldEFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY0J1bGxldHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnVsbGV0SW5kZXggPj0gZmlyc3RJbmRleCAmJiBidWxsZXRJbmRleCA8PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICRidWxsZXQuYWRkQ2xhc3MoYCR7cGFyYW1zLmJ1bGxldEFjdGl2ZUNsYXNzfS1tYWluYCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJ1bGxldEluZGV4ID09PSBmaXJzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBzZXRTaWRlQnVsbGV0cygkYnVsbGV0LCAncHJldicpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChidWxsZXRJbmRleCA9PT0gbGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICBzZXRTaWRlQnVsbGV0cygkYnVsbGV0LCAnbmV4dCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0ICRidWxsZXQgPSBidWxsZXRzLmVxKGN1cnJlbnQpO1xuICAgICAgICAgICAgY29uc3QgYnVsbGV0SW5kZXggPSAkYnVsbGV0LmluZGV4KCk7XG4gICAgICAgICAgICAkYnVsbGV0LmFkZENsYXNzKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcyk7XG5cbiAgICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY0J1bGxldHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgJGZpcnN0RGlzcGxheWVkQnVsbGV0ID0gYnVsbGV0cy5lcShmaXJzdEluZGV4KTtcbiAgICAgICAgICAgICAgY29uc3QgJGxhc3REaXNwbGF5ZWRCdWxsZXQgPSBidWxsZXRzLmVxKGxhc3RJbmRleCk7XG5cbiAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGZpcnN0SW5kZXg7IGkgPD0gbGFzdEluZGV4OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidWxsZXRzLmVxKGkpLmFkZENsYXNzKGAke3BhcmFtcy5idWxsZXRBY3RpdmVDbGFzc30tbWFpbmApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgICAgICAgIGlmIChidWxsZXRJbmRleCA+PSBidWxsZXRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IHBhcmFtcy5keW5hbWljTWFpbkJ1bGxldHM7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1bGxldHMuZXEoYnVsbGV0cy5sZW5ndGggLSBpKS5hZGRDbGFzcyhgJHtwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3N9LW1haW5gKTtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgYnVsbGV0cy5lcShidWxsZXRzLmxlbmd0aCAtIHBhcmFtcy5keW5hbWljTWFpbkJ1bGxldHMgLSAxKS5hZGRDbGFzcyhgJHtwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3N9LXByZXZgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc2V0U2lkZUJ1bGxldHMoJGZpcnN0RGlzcGxheWVkQnVsbGV0LCAncHJldicpO1xuICAgICAgICAgICAgICAgICAgc2V0U2lkZUJ1bGxldHMoJGxhc3REaXNwbGF5ZWRCdWxsZXQsICduZXh0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFNpZGVCdWxsZXRzKCRmaXJzdERpc3BsYXllZEJ1bGxldCwgJ3ByZXYnKTtcbiAgICAgICAgICAgICAgICBzZXRTaWRlQnVsbGV0cygkbGFzdERpc3BsYXllZEJ1bGxldCwgJ25leHQnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY0J1bGxldHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGR5bmFtaWNCdWxsZXRzTGVuZ3RoID0gTWF0aC5taW4oYnVsbGV0cy5sZW5ndGgsIHBhcmFtcy5keW5hbWljTWFpbkJ1bGxldHMgKyA0KTtcbiAgICAgICAgICAgIGNvbnN0IGJ1bGxldHNPZmZzZXQgPSAoYnVsbGV0U2l6ZSAqIGR5bmFtaWNCdWxsZXRzTGVuZ3RoIC0gYnVsbGV0U2l6ZSkgLyAyIC0gbWlkSW5kZXggKiBidWxsZXRTaXplO1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0UHJvcCA9IHJ0bCA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgICAgICAgICBidWxsZXRzLmNzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBvZmZzZXRQcm9wIDogJ3RvcCcsIGAke2J1bGxldHNPZmZzZXR9cHhgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdmcmFjdGlvbicpIHtcbiAgICAgICAgICAkZWwuZmluZChjbGFzc2VzVG9TZWxlY3RvcihwYXJhbXMuY3VycmVudENsYXNzKSkudGV4dChwYXJhbXMuZm9ybWF0RnJhY3Rpb25DdXJyZW50KGN1cnJlbnQgKyAxKSk7XG4gICAgICAgICAgJGVsLmZpbmQoY2xhc3Nlc1RvU2VsZWN0b3IocGFyYW1zLnRvdGFsQ2xhc3MpKS50ZXh0KHBhcmFtcy5mb3JtYXRGcmFjdGlvblRvdGFsKHRvdGFsKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdwcm9ncmVzc2JhcicpIHtcbiAgICAgICAgICBsZXQgcHJvZ3Jlc3NiYXJEaXJlY3Rpb247XG5cbiAgICAgICAgICBpZiAocGFyYW1zLnByb2dyZXNzYmFyT3Bwb3NpdGUpIHtcbiAgICAgICAgICAgIHByb2dyZXNzYmFyRGlyZWN0aW9uID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ3ZlcnRpY2FsJyA6ICdob3Jpem9udGFsJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvZ3Jlc3NiYXJEaXJlY3Rpb24gPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnaG9yaXpvbnRhbCcgOiAndmVydGljYWwnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHNjYWxlID0gKGN1cnJlbnQgKyAxKSAvIHRvdGFsO1xuICAgICAgICAgIGxldCBzY2FsZVggPSAxO1xuICAgICAgICAgIGxldCBzY2FsZVkgPSAxO1xuXG4gICAgICAgICAgaWYgKHByb2dyZXNzYmFyRGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgIHNjYWxlWCA9IHNjYWxlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY2FsZVkgPSBzY2FsZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkZWwuZmluZChjbGFzc2VzVG9TZWxlY3RvcihwYXJhbXMucHJvZ3Jlc3NiYXJGaWxsQ2xhc3MpKS50cmFuc2Zvcm0oYHRyYW5zbGF0ZTNkKDAsMCwwKSBzY2FsZVgoJHtzY2FsZVh9KSBzY2FsZVkoJHtzY2FsZVl9KWApLnRyYW5zaXRpb24oc3dpcGVyLnBhcmFtcy5zcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdjdXN0b20nICYmIHBhcmFtcy5yZW5kZXJDdXN0b20pIHtcbiAgICAgICAgICAkZWwuaHRtbChwYXJhbXMucmVuZGVyQ3VzdG9tKHN3aXBlciwgY3VycmVudCArIDEsIHRvdGFsKSk7XG4gICAgICAgICAgZW1pdCgncGFnaW5hdGlvblJlbmRlcicsICRlbFswXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW1pdCgncGFnaW5hdGlvblVwZGF0ZScsICRlbFswXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy53YXRjaE92ZXJmbG93ICYmIHN3aXBlci5lbmFibGVkKSB7XG4gICAgICAgICAgJGVsW3N3aXBlci5pc0xvY2tlZCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShwYXJhbXMubG9ja0NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIC8vIFJlbmRlciBDb250YWluZXJcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICBpZiAoaXNQYWdpbmF0aW9uRGlzYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzbGlkZXNMZW5ndGggPSBzd2lwZXIudmlydHVhbCAmJiBzd2lwZXIucGFyYW1zLnZpcnR1YWwuZW5hYmxlZCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggOiBzd2lwZXIuc2xpZGVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgJGVsID0gc3dpcGVyLnBhZ2luYXRpb24uJGVsO1xuICAgICAgICBsZXQgcGFnaW5hdGlvbkhUTUwgPSAnJztcblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdidWxsZXRzJykge1xuICAgICAgICAgIGxldCBudW1iZXJPZkJ1bGxldHMgPSBzd2lwZXIucGFyYW1zLmxvb3AgPyBNYXRoLmNlaWwoKHNsaWRlc0xlbmd0aCAtIHN3aXBlci5sb29wZWRTbGlkZXMgKiAyKSAvIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXApIDogc3dpcGVyLnNuYXBHcmlkLmxlbmd0aDtcblxuICAgICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmZyZWVNb2RlICYmIHN3aXBlci5wYXJhbXMuZnJlZU1vZGUuZW5hYmxlZCAmJiAhc3dpcGVyLnBhcmFtcy5sb29wICYmIG51bWJlck9mQnVsbGV0cyA+IHNsaWRlc0xlbmd0aCkge1xuICAgICAgICAgICAgbnVtYmVyT2ZCdWxsZXRzID0gc2xpZGVzTGVuZ3RoO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZCdWxsZXRzOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChwYXJhbXMucmVuZGVyQnVsbGV0KSB7XG4gICAgICAgICAgICAgIHBhZ2luYXRpb25IVE1MICs9IHBhcmFtcy5yZW5kZXJCdWxsZXQuY2FsbChzd2lwZXIsIGksIHBhcmFtcy5idWxsZXRDbGFzcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBwYWdpbmF0aW9uSFRNTCArPSBgPCR7cGFyYW1zLmJ1bGxldEVsZW1lbnR9IGNsYXNzPVwiJHtwYXJhbXMuYnVsbGV0Q2xhc3N9XCI+PC8ke3BhcmFtcy5idWxsZXRFbGVtZW50fT5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgICRlbC5odG1sKHBhZ2luYXRpb25IVE1MKTtcbiAgICAgICAgICBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzID0gJGVsLmZpbmQoY2xhc3Nlc1RvU2VsZWN0b3IocGFyYW1zLmJ1bGxldENsYXNzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdmcmFjdGlvbicpIHtcbiAgICAgICAgICBpZiAocGFyYW1zLnJlbmRlckZyYWN0aW9uKSB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uSFRNTCA9IHBhcmFtcy5yZW5kZXJGcmFjdGlvbi5jYWxsKHN3aXBlciwgcGFyYW1zLmN1cnJlbnRDbGFzcywgcGFyYW1zLnRvdGFsQ2xhc3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uSFRNTCA9IGA8c3BhbiBjbGFzcz1cIiR7cGFyYW1zLmN1cnJlbnRDbGFzc31cIj48L3NwYW4+YCArICcgLyAnICsgYDxzcGFuIGNsYXNzPVwiJHtwYXJhbXMudG90YWxDbGFzc31cIj48L3NwYW4+YDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkZWwuaHRtbChwYWdpbmF0aW9uSFRNTCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdwcm9ncmVzc2JhcicpIHtcbiAgICAgICAgICBpZiAocGFyYW1zLnJlbmRlclByb2dyZXNzYmFyKSB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uSFRNTCA9IHBhcmFtcy5yZW5kZXJQcm9ncmVzc2Jhci5jYWxsKHN3aXBlciwgcGFyYW1zLnByb2dyZXNzYmFyRmlsbENsYXNzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFnaW5hdGlvbkhUTUwgPSBgPHNwYW4gY2xhc3M9XCIke3BhcmFtcy5wcm9ncmVzc2JhckZpbGxDbGFzc31cIj48L3NwYW4+YDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkZWwuaHRtbChwYWdpbmF0aW9uSFRNTCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgIT09ICdjdXN0b20nKSB7XG4gICAgICAgICAgZW1pdCgncGFnaW5hdGlvblJlbmRlcicsIHN3aXBlci5wYWdpbmF0aW9uLiRlbFswXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uID0gY3JlYXRlRWxlbWVudElmTm90RGVmaW5lZChzd2lwZXIsIHN3aXBlci5vcmlnaW5hbFBhcmFtcy5wYWdpbmF0aW9uLCBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24sIHtcbiAgICAgICAgICBlbDogJ3N3aXBlci1wYWdpbmF0aW9uJ1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICBpZiAoIXBhcmFtcy5lbCkgcmV0dXJuO1xuICAgICAgICBsZXQgJGVsID0gJChwYXJhbXMuZWwpO1xuICAgICAgICBpZiAoJGVsLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLnVuaXF1ZU5hdkVsZW1lbnRzICYmIHR5cGVvZiBwYXJhbXMuZWwgPT09ICdzdHJpbmcnICYmICRlbC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgJGVsID0gc3dpcGVyLiRlbC5maW5kKHBhcmFtcy5lbCk7IC8vIGNoZWNrIGlmIGl0IGJlbG9uZ3MgdG8gYW5vdGhlciBuZXN0ZWQgU3dpcGVyXG5cbiAgICAgICAgICBpZiAoJGVsLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICRlbCA9ICRlbC5maWx0ZXIoZWwgPT4ge1xuICAgICAgICAgICAgICBpZiAoJChlbCkucGFyZW50cygnLnN3aXBlcicpWzBdICE9PSBzd2lwZXIuZWwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdidWxsZXRzJyAmJiBwYXJhbXMuY2xpY2thYmxlKSB7XG4gICAgICAgICAgJGVsLmFkZENsYXNzKHBhcmFtcy5jbGlja2FibGVDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWwuYWRkQ2xhc3MocGFyYW1zLm1vZGlmaWVyQ2xhc3MgKyBwYXJhbXMudHlwZSk7XG4gICAgICAgICRlbC5hZGRDbGFzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBwYXJhbXMuaG9yaXpvbnRhbENsYXNzIDogcGFyYW1zLnZlcnRpY2FsQ2xhc3MpO1xuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2J1bGxldHMnICYmIHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgICAgICRlbC5hZGRDbGFzcyhgJHtwYXJhbXMubW9kaWZpZXJDbGFzc30ke3BhcmFtcy50eXBlfS1keW5hbWljYCk7XG4gICAgICAgICAgZHluYW1pY0J1bGxldEluZGV4ID0gMDtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzIDwgMSkge1xuICAgICAgICAgICAgcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAncHJvZ3Jlc3NiYXInICYmIHBhcmFtcy5wcm9ncmVzc2Jhck9wcG9zaXRlKSB7XG4gICAgICAgICAgJGVsLmFkZENsYXNzKHBhcmFtcy5wcm9ncmVzc2Jhck9wcG9zaXRlQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jbGlja2FibGUpIHtcbiAgICAgICAgICAkZWwub24oJ2NsaWNrJywgY2xhc3Nlc1RvU2VsZWN0b3IocGFyYW1zLmJ1bGxldENsYXNzKSwgZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkKHRoaXMpLmluZGV4KCkgKiBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuICAgICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkgaW5kZXggKz0gc3dpcGVyLmxvb3BlZFNsaWRlcztcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKGluZGV4KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLnBhZ2luYXRpb24sIHtcbiAgICAgICAgICAkZWwsXG4gICAgICAgICAgZWw6ICRlbFswXVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXN3aXBlci5lbmFibGVkKSB7XG4gICAgICAgICAgJGVsLmFkZENsYXNzKHBhcmFtcy5sb2NrQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbjtcbiAgICAgICAgaWYgKGlzUGFnaW5hdGlvbkRpc2FibGVkKCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgJGVsID0gc3dpcGVyLnBhZ2luYXRpb24uJGVsO1xuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MocGFyYW1zLmhpZGRlbkNsYXNzKTtcbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKHBhcmFtcy5tb2RpZmllckNsYXNzICsgcGFyYW1zLnR5cGUpO1xuICAgICAgICAkZWwucmVtb3ZlQ2xhc3Moc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gcGFyYW1zLmhvcml6b250YWxDbGFzcyA6IHBhcmFtcy52ZXJ0aWNhbENsYXNzKTtcbiAgICAgICAgaWYgKHN3aXBlci5wYWdpbmF0aW9uLmJ1bGxldHMgJiYgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cy5yZW1vdmVDbGFzcykgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cy5yZW1vdmVDbGFzcyhwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpO1xuXG4gICAgICAgIGlmIChwYXJhbXMuY2xpY2thYmxlKSB7XG4gICAgICAgICAgJGVsLm9mZignY2xpY2snLCBjbGFzc2VzVG9TZWxlY3RvcihwYXJhbXMuYnVsbGV0Q2xhc3MpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvbignaW5pdCcsICgpID0+IHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5lbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgIGRpc2FibGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ2FjdGl2ZUluZGV4Q2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHN3aXBlci5zbmFwSW5kZXggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ3NuYXBJbmRleENoYW5nZScsICgpID0+IHtcbiAgICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignc2xpZGVzTGVuZ3RoQ2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ3NuYXBHcmlkTGVuZ3RoQ2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgIHJlbmRlcigpO1xuICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICBkZXN0cm95KCk7XG4gICAgICB9KTtcbiAgICAgIG9uKCdlbmFibGUgZGlzYWJsZScsICgpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICRlbFxuICAgICAgICB9ID0gc3dpcGVyLnBhZ2luYXRpb247XG5cbiAgICAgICAgaWYgKCRlbCkge1xuICAgICAgICAgICRlbFtzd2lwZXIuZW5hYmxlZCA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnXShzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24ubG9ja0NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignbG9jayB1bmxvY2snLCAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgICBvbignY2xpY2snLCAoX3MsIGUpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0RWwgPSBlLnRhcmdldDtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICRlbFxuICAgICAgICB9ID0gc3dpcGVyLnBhZ2luYXRpb247XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5lbCAmJiBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24uaGlkZU9uQ2xpY2sgJiYgJGVsICYmICRlbC5sZW5ndGggPiAwICYmICEkKHRhcmdldEVsKS5oYXNDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24uYnVsbGV0Q2xhc3MpKSB7XG4gICAgICAgICAgaWYgKHN3aXBlci5uYXZpZ2F0aW9uICYmIChzd2lwZXIubmF2aWdhdGlvbi5uZXh0RWwgJiYgdGFyZ2V0RWwgPT09IHN3aXBlci5uYXZpZ2F0aW9uLm5leHRFbCB8fCBzd2lwZXIubmF2aWdhdGlvbi5wcmV2RWwgJiYgdGFyZ2V0RWwgPT09IHN3aXBlci5uYXZpZ2F0aW9uLnByZXZFbCkpIHJldHVybjtcbiAgICAgICAgICBjb25zdCBpc0hpZGRlbiA9ICRlbC5oYXNDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24uaGlkZGVuQ2xhc3MpO1xuXG4gICAgICAgICAgaWYgKGlzSGlkZGVuID09PSB0cnVlKSB7XG4gICAgICAgICAgICBlbWl0KCdwYWdpbmF0aW9uU2hvdycpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbWl0KCdwYWdpbmF0aW9uSGlkZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRlbC50b2dnbGVDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24uaGlkZGVuQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZW5hYmxlID0gKCkgPT4ge1xuICAgICAgICBzd2lwZXIuJGVsLnJlbW92ZUNsYXNzKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5wYWdpbmF0aW9uRGlzYWJsZWRDbGFzcyk7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYWdpbmF0aW9uLiRlbCkge1xuICAgICAgICAgIHN3aXBlci5wYWdpbmF0aW9uLiRlbC5yZW1vdmVDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24ucGFnaW5hdGlvbkRpc2FibGVkQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdCgpO1xuICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBkaXNhYmxlID0gKCkgPT4ge1xuICAgICAgICBzd2lwZXIuJGVsLmFkZENsYXNzKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5wYWdpbmF0aW9uRGlzYWJsZWRDbGFzcyk7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYWdpbmF0aW9uLiRlbCkge1xuICAgICAgICAgIHN3aXBlci5wYWdpbmF0aW9uLiRlbC5hZGRDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24ucGFnaW5hdGlvbkRpc2FibGVkQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVzdHJveSgpO1xuICAgICAgfTtcblxuICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIucGFnaW5hdGlvbiwge1xuICAgICAgICBlbmFibGUsXG4gICAgICAgIGRpc2FibGUsXG4gICAgICAgIHJlbmRlcixcbiAgICAgICAgdXBkYXRlLFxuICAgICAgICBpbml0LFxuICAgICAgICBkZXN0cm95XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQgbm8tdW5kZXJzY29yZS1kYW5nbGU6IFwib2ZmXCIgKi9cbiAgICBmdW5jdGlvbiBBdXRvcGxheShfcmVmKSB7XG4gICAgICBsZXQge1xuICAgICAgICBzd2lwZXIsXG4gICAgICAgIGV4dGVuZFBhcmFtcyxcbiAgICAgICAgb24sXG4gICAgICAgIGVtaXRcbiAgICAgIH0gPSBfcmVmO1xuICAgICAgbGV0IHRpbWVvdXQ7XG4gICAgICBzd2lwZXIuYXV0b3BsYXkgPSB7XG4gICAgICAgIHJ1bm5pbmc6IGZhbHNlLFxuICAgICAgICBwYXVzZWQ6IGZhbHNlXG4gICAgICB9O1xuICAgICAgZXh0ZW5kUGFyYW1zKHtcbiAgICAgICAgYXV0b3BsYXk6IHtcbiAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICBkZWxheTogMzAwMCxcbiAgICAgICAgICB3YWl0Rm9yVHJhbnNpdGlvbjogdHJ1ZSxcbiAgICAgICAgICBkaXNhYmxlT25JbnRlcmFjdGlvbjogdHJ1ZSxcbiAgICAgICAgICBzdG9wT25MYXN0U2xpZGU6IGZhbHNlLFxuICAgICAgICAgIHJldmVyc2VEaXJlY3Rpb246IGZhbHNlLFxuICAgICAgICAgIHBhdXNlT25Nb3VzZUVudGVyOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICBpZiAoIXN3aXBlci5zaXplKSB7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgJGFjdGl2ZVNsaWRlRWwgPSBzd2lwZXIuc2xpZGVzLmVxKHN3aXBlci5hY3RpdmVJbmRleCk7XG4gICAgICAgIGxldCBkZWxheSA9IHN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGVsYXk7XG5cbiAgICAgICAgaWYgKCRhY3RpdmVTbGlkZUVsLmF0dHIoJ2RhdGEtc3dpcGVyLWF1dG9wbGF5JykpIHtcbiAgICAgICAgICBkZWxheSA9ICRhY3RpdmVTbGlkZUVsLmF0dHIoJ2RhdGEtc3dpcGVyLWF1dG9wbGF5JykgfHwgc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5kZWxheTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICBsZXQgYXV0b3BsYXlSZXN1bHQ7XG5cbiAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5yZXZlcnNlRGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgICAgIGF1dG9wbGF5UmVzdWx0ID0gc3dpcGVyLnNsaWRlUHJldihzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgICAgZW1pdCgnYXV0b3BsYXknKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXN3aXBlci5pc0JlZ2lubmluZykge1xuICAgICAgICAgICAgICBhdXRvcGxheVJlc3VsdCA9IHN3aXBlci5zbGlkZVByZXYoc3dpcGVyLnBhcmFtcy5zcGVlZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIGVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LnN0b3BPbkxhc3RTbGlkZSkge1xuICAgICAgICAgICAgICBhdXRvcGxheVJlc3VsdCA9IHN3aXBlci5zbGlkZVRvKHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gMSwgc3dpcGVyLnBhcmFtcy5zcGVlZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIGVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgICBhdXRvcGxheVJlc3VsdCA9IHN3aXBlci5zbGlkZU5leHQoc3dpcGVyLnBhcmFtcy5zcGVlZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbWl0KCdhdXRvcGxheScpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXN3aXBlci5pc0VuZCkge1xuICAgICAgICAgICAgYXV0b3BsYXlSZXN1bHQgPSBzd2lwZXIuc2xpZGVOZXh0KHN3aXBlci5wYXJhbXMuc3BlZWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgZW1pdCgnYXV0b3BsYXknKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LnN0b3BPbkxhc3RTbGlkZSkge1xuICAgICAgICAgICAgYXV0b3BsYXlSZXN1bHQgPSBzd2lwZXIuc2xpZGVUbygwLCBzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIGVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5jc3NNb2RlICYmIHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSBydW4oKTtlbHNlIGlmIChhdXRvcGxheVJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJ1bigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lb3V0ICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBlbWl0KCdhdXRvcGxheVN0YXJ0Jyk7XG4gICAgICAgIHJ1bigpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIuYXV0b3BsYXkucnVubmluZykgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAodHlwZW9mIHRpbWVvdXQgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5hdXRvcGxheS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIGVtaXQoJ2F1dG9wbGF5U3RvcCcpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcGF1c2Uoc3BlZWQpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIuYXV0b3BsYXkucnVubmluZykgcmV0dXJuO1xuICAgICAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCkgcmV0dXJuO1xuICAgICAgICBpZiAodGltZW91dCkgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2VkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoc3BlZWQgPT09IDAgfHwgIXN3aXBlci5wYXJhbXMuYXV0b3BsYXkud2FpdEZvclRyYW5zaXRpb24pIHtcbiAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgcnVuKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgWyd0cmFuc2l0aW9uZW5kJywgJ3dlYmtpdFRyYW5zaXRpb25FbmQnXS5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25WaXNpYmlsaXR5Q2hhbmdlKCkge1xuICAgICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSA9PT0gJ2hpZGRlbicgJiYgc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHtcbiAgICAgICAgICBwYXVzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSA9PT0gJ3Zpc2libGUnICYmIHN3aXBlci5hdXRvcGxheS5wYXVzZWQpIHtcbiAgICAgICAgICBydW4oKTtcbiAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25UcmFuc2l0aW9uRW5kKGUpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCB8fCAhc3dpcGVyLiR3cmFwcGVyRWwpIHJldHVybjtcbiAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSBzd2lwZXIuJHdyYXBwZXJFbFswXSkgcmV0dXJuO1xuICAgICAgICBbJ3RyYW5zaXRpb25lbmQnLCAnd2Via2l0VHJhbnNpdGlvbkVuZCddLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgIH0pO1xuICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2VkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFzd2lwZXIuYXV0b3BsYXkucnVubmluZykge1xuICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBydW4oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvbk1vdXNlRW50ZXIoKSB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRpc2FibGVPbkludGVyYWN0aW9uKSB7XG4gICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVtaXQoJ2F1dG9wbGF5UGF1c2UnKTtcbiAgICAgICAgICBwYXVzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgWyd0cmFuc2l0aW9uZW5kJywgJ3dlYmtpdFRyYW5zaXRpb25FbmQnXS5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvblRyYW5zaXRpb25FbmQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25Nb3VzZUxlYXZlKCkge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5kaXNhYmxlT25JbnRlcmFjdGlvbikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5hdXRvcGxheS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgZW1pdCgnYXV0b3BsYXlSZXN1bWUnKTtcbiAgICAgICAgcnVuKCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGF0dGFjaE1vdXNlRXZlbnRzKCkge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5wYXVzZU9uTW91c2VFbnRlcikge1xuICAgICAgICAgIHN3aXBlci4kZWwub24oJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpO1xuICAgICAgICAgIHN3aXBlci4kZWwub24oJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRldGFjaE1vdXNlRXZlbnRzKCkge1xuICAgICAgICBzd2lwZXIuJGVsLm9mZignbW91c2VlbnRlcicsIG9uTW91c2VFbnRlcik7XG4gICAgICAgIHN3aXBlci4kZWwub2ZmKCdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKTtcbiAgICAgIH1cblxuICAgICAgb24oJ2luaXQnLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmVuYWJsZWQpIHtcbiAgICAgICAgICBzdGFydCgpO1xuICAgICAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgb25WaXNpYmlsaXR5Q2hhbmdlKTtcbiAgICAgICAgICBhdHRhY2hNb3VzZUV2ZW50cygpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCdiZWZvcmVUcmFuc2l0aW9uU3RhcnQnLCAoX3MsIHNwZWVkLCBpbnRlcm5hbCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHtcbiAgICAgICAgICBpZiAoaW50ZXJuYWwgfHwgIXN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGlzYWJsZU9uSW50ZXJhY3Rpb24pIHtcbiAgICAgICAgICAgIHN3aXBlci5hdXRvcGxheS5wYXVzZShzcGVlZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ3NsaWRlckZpcnN0TW92ZScsICgpID0+IHtcbiAgICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGlzYWJsZU9uSW50ZXJhY3Rpb24pIHtcbiAgICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGF1c2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ3RvdWNoRW5kJywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5jc3NNb2RlICYmIHN3aXBlci5hdXRvcGxheS5wYXVzZWQgJiYgIXN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGlzYWJsZU9uSW50ZXJhY3Rpb24pIHtcbiAgICAgICAgICBydW4oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgZGV0YWNoTW91c2VFdmVudHMoKTtcblxuICAgICAgICBpZiAoc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHtcbiAgICAgICAgICBzdG9wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Zpc2liaWxpdHljaGFuZ2UnLCBvblZpc2liaWxpdHlDaGFuZ2UpO1xuICAgICAgfSk7XG4gICAgICBPYmplY3QuYXNzaWduKHN3aXBlci5hdXRvcGxheSwge1xuICAgICAgICBwYXVzZSxcbiAgICAgICAgcnVuLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgc3RvcFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gVGh1bWIoX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBleHRlbmRQYXJhbXMsXG4gICAgICAgIG9uXG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGV4dGVuZFBhcmFtcyh7XG4gICAgICAgIHRodW1iczoge1xuICAgICAgICAgIHN3aXBlcjogbnVsbCxcbiAgICAgICAgICBtdWx0aXBsZUFjdGl2ZVRodW1iczogdHJ1ZSxcbiAgICAgICAgICBhdXRvU2Nyb2xsT2Zmc2V0OiAwLFxuICAgICAgICAgIHNsaWRlVGh1bWJBY3RpdmVDbGFzczogJ3N3aXBlci1zbGlkZS10aHVtYi1hY3RpdmUnLFxuICAgICAgICAgIHRodW1ic0NvbnRhaW5lckNsYXNzOiAnc3dpcGVyLXRodW1icydcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIGxldCBzd2lwZXJDcmVhdGVkID0gZmFsc2U7XG4gICAgICBzd2lwZXIudGh1bWJzID0ge1xuICAgICAgICBzd2lwZXI6IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIG9uVGh1bWJDbGljaygpIHtcbiAgICAgICAgY29uc3QgdGh1bWJzU3dpcGVyID0gc3dpcGVyLnRodW1icy5zd2lwZXI7XG4gICAgICAgIGlmICghdGh1bWJzU3dpcGVyIHx8IHRodW1ic1N3aXBlci5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2xpY2tlZEluZGV4ID0gdGh1bWJzU3dpcGVyLmNsaWNrZWRJbmRleDtcbiAgICAgICAgY29uc3QgY2xpY2tlZFNsaWRlID0gdGh1bWJzU3dpcGVyLmNsaWNrZWRTbGlkZTtcbiAgICAgICAgaWYgKGNsaWNrZWRTbGlkZSAmJiAkKGNsaWNrZWRTbGlkZSkuaGFzQ2xhc3Moc3dpcGVyLnBhcmFtcy50aHVtYnMuc2xpZGVUaHVtYkFjdGl2ZUNsYXNzKSkgcmV0dXJuO1xuICAgICAgICBpZiAodHlwZW9mIGNsaWNrZWRJbmRleCA9PT0gJ3VuZGVmaW5lZCcgfHwgY2xpY2tlZEluZGV4ID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGxldCBzbGlkZVRvSW5kZXg7XG5cbiAgICAgICAgaWYgKHRodW1ic1N3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgIHNsaWRlVG9JbmRleCA9IHBhcnNlSW50KCQodGh1bWJzU3dpcGVyLmNsaWNrZWRTbGlkZSkuYXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKSwgMTApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNsaWRlVG9JbmRleCA9IGNsaWNrZWRJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgICBsZXQgY3VycmVudEluZGV4ID0gc3dpcGVyLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgaWYgKHN3aXBlci5zbGlkZXMuZXEoY3VycmVudEluZGV4KS5oYXNDbGFzcyhzd2lwZXIucGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3MpKSB7XG4gICAgICAgICAgICBzd2lwZXIubG9vcEZpeCgpOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcblxuICAgICAgICAgICAgc3dpcGVyLl9jbGllbnRMZWZ0ID0gc3dpcGVyLiR3cmFwcGVyRWxbMF0uY2xpZW50TGVmdDtcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBwcmV2SW5kZXggPSBzd2lwZXIuc2xpZGVzLmVxKGN1cnJlbnRJbmRleCkucHJldkFsbChgW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtzbGlkZVRvSW5kZXh9XCJdYCkuZXEoMCkuaW5kZXgoKTtcbiAgICAgICAgICBjb25zdCBuZXh0SW5kZXggPSBzd2lwZXIuc2xpZGVzLmVxKGN1cnJlbnRJbmRleCkubmV4dEFsbChgW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtzbGlkZVRvSW5kZXh9XCJdYCkuZXEoMCkuaW5kZXgoKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHByZXZJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHNsaWRlVG9JbmRleCA9IG5leHRJbmRleDtlbHNlIGlmICh0eXBlb2YgbmV4dEluZGV4ID09PSAndW5kZWZpbmVkJykgc2xpZGVUb0luZGV4ID0gcHJldkluZGV4O2Vsc2UgaWYgKG5leHRJbmRleCAtIGN1cnJlbnRJbmRleCA8IGN1cnJlbnRJbmRleCAtIHByZXZJbmRleCkgc2xpZGVUb0luZGV4ID0gbmV4dEluZGV4O2Vsc2Ugc2xpZGVUb0luZGV4ID0gcHJldkluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLnNsaWRlVG8oc2xpZGVUb0luZGV4KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHRodW1iczogdGh1bWJzUGFyYW1zXG4gICAgICAgIH0gPSBzd2lwZXIucGFyYW1zO1xuICAgICAgICBpZiAoaW5pdGlhbGl6ZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBTd2lwZXJDbGFzcyA9IHN3aXBlci5jb25zdHJ1Y3RvcjtcblxuICAgICAgICBpZiAodGh1bWJzUGFyYW1zLnN3aXBlciBpbnN0YW5jZW9mIFN3aXBlckNsYXNzKSB7XG4gICAgICAgICAgc3dpcGVyLnRodW1icy5zd2lwZXIgPSB0aHVtYnNQYXJhbXMuc3dpcGVyO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLnRodW1icy5zd2lwZXIub3JpZ2luYWxQYXJhbXMsIHtcbiAgICAgICAgICAgIHdhdGNoU2xpZGVzUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICBzbGlkZVRvQ2xpY2tlZFNsaWRlOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLnRodW1icy5zd2lwZXIucGFyYW1zLCB7XG4gICAgICAgICAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICAgICAgc2xpZGVUb0NsaWNrZWRTbGlkZTogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdCQxKHRodW1ic1BhcmFtcy5zd2lwZXIpKSB7XG4gICAgICAgICAgY29uc3QgdGh1bWJzU3dpcGVyUGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgdGh1bWJzUGFyYW1zLnN3aXBlcik7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih0aHVtYnNTd2lwZXJQYXJhbXMsIHtcbiAgICAgICAgICAgIHdhdGNoU2xpZGVzUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICBzbGlkZVRvQ2xpY2tlZFNsaWRlOiBmYWxzZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHN3aXBlci50aHVtYnMuc3dpcGVyID0gbmV3IFN3aXBlckNsYXNzKHRodW1ic1N3aXBlclBhcmFtcyk7XG4gICAgICAgICAgc3dpcGVyQ3JlYXRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIudGh1bWJzLnN3aXBlci4kZWwuYWRkQ2xhc3Moc3dpcGVyLnBhcmFtcy50aHVtYnMudGh1bWJzQ29udGFpbmVyQ2xhc3MpO1xuICAgICAgICBzd2lwZXIudGh1bWJzLnN3aXBlci5vbigndGFwJywgb25UaHVtYkNsaWNrKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZShpbml0aWFsKSB7XG4gICAgICAgIGNvbnN0IHRodW1ic1N3aXBlciA9IHN3aXBlci50aHVtYnMuc3dpcGVyO1xuICAgICAgICBpZiAoIXRodW1ic1N3aXBlciB8fCB0aHVtYnNTd2lwZXIuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNsaWRlc1BlclZpZXcgPSB0aHVtYnNTd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyA/IHRodW1ic1N3aXBlci5zbGlkZXNQZXJWaWV3RHluYW1pYygpIDogdGh1bWJzU3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJWaWV3OyAvLyBBY3RpdmF0ZSB0aHVtYnNcblxuICAgICAgICBsZXQgdGh1bWJzVG9BY3RpdmF0ZSA9IDE7XG4gICAgICAgIGNvbnN0IHRodW1iQWN0aXZlQ2xhc3MgPSBzd2lwZXIucGFyYW1zLnRodW1icy5zbGlkZVRodW1iQWN0aXZlQ2xhc3M7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyA+IDEgJiYgIXN3aXBlci5wYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgICAgICB0aHVtYnNUb0FjdGl2YXRlID0gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJWaWV3O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLnRodW1icy5tdWx0aXBsZUFjdGl2ZVRodW1icykge1xuICAgICAgICAgIHRodW1ic1RvQWN0aXZhdGUgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdGh1bWJzVG9BY3RpdmF0ZSA9IE1hdGguZmxvb3IodGh1bWJzVG9BY3RpdmF0ZSk7XG4gICAgICAgIHRodW1ic1N3aXBlci5zbGlkZXMucmVtb3ZlQ2xhc3ModGh1bWJBY3RpdmVDbGFzcyk7XG5cbiAgICAgICAgaWYgKHRodW1ic1N3aXBlci5wYXJhbXMubG9vcCB8fCB0aHVtYnNTd2lwZXIucGFyYW1zLnZpcnR1YWwgJiYgdGh1bWJzU3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRodW1ic1RvQWN0aXZhdGU7IGkgKz0gMSkge1xuICAgICAgICAgICAgdGh1bWJzU3dpcGVyLiR3cmFwcGVyRWwuY2hpbGRyZW4oYFtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7c3dpcGVyLnJlYWxJbmRleCArIGl9XCJdYCkuYWRkQ2xhc3ModGh1bWJBY3RpdmVDbGFzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGh1bWJzVG9BY3RpdmF0ZTsgaSArPSAxKSB7XG4gICAgICAgICAgICB0aHVtYnNTd2lwZXIuc2xpZGVzLmVxKHN3aXBlci5yZWFsSW5kZXggKyBpKS5hZGRDbGFzcyh0aHVtYkFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdXRvU2Nyb2xsT2Zmc2V0ID0gc3dpcGVyLnBhcmFtcy50aHVtYnMuYXV0b1Njcm9sbE9mZnNldDtcbiAgICAgICAgY29uc3QgdXNlT2Zmc2V0ID0gYXV0b1Njcm9sbE9mZnNldCAmJiAhdGh1bWJzU3dpcGVyLnBhcmFtcy5sb29wO1xuXG4gICAgICAgIGlmIChzd2lwZXIucmVhbEluZGV4ICE9PSB0aHVtYnNTd2lwZXIucmVhbEluZGV4IHx8IHVzZU9mZnNldCkge1xuICAgICAgICAgIGxldCBjdXJyZW50VGh1bWJzSW5kZXggPSB0aHVtYnNTd2lwZXIuYWN0aXZlSW5kZXg7XG4gICAgICAgICAgbGV0IG5ld1RodW1ic0luZGV4O1xuICAgICAgICAgIGxldCBkaXJlY3Rpb247XG5cbiAgICAgICAgICBpZiAodGh1bWJzU3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgICBpZiAodGh1bWJzU3dpcGVyLnNsaWRlcy5lcShjdXJyZW50VGh1bWJzSW5kZXgpLmhhc0NsYXNzKHRodW1ic1N3aXBlci5wYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpIHtcbiAgICAgICAgICAgICAgdGh1bWJzU3dpcGVyLmxvb3BGaXgoKTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICAgICAgICAgICAgdGh1bWJzU3dpcGVyLl9jbGllbnRMZWZ0ID0gdGh1bWJzU3dpcGVyLiR3cmFwcGVyRWxbMF0uY2xpZW50TGVmdDtcbiAgICAgICAgICAgICAgY3VycmVudFRodW1ic0luZGV4ID0gdGh1bWJzU3dpcGVyLmFjdGl2ZUluZGV4O1xuICAgICAgICAgICAgfSAvLyBGaW5kIGFjdHVhbCB0aHVtYnMgaW5kZXggdG8gc2xpZGUgdG9cblxuXG4gICAgICAgICAgICBjb25zdCBwcmV2VGh1bWJzSW5kZXggPSB0aHVtYnNTd2lwZXIuc2xpZGVzLmVxKGN1cnJlbnRUaHVtYnNJbmRleCkucHJldkFsbChgW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtzd2lwZXIucmVhbEluZGV4fVwiXWApLmVxKDApLmluZGV4KCk7XG4gICAgICAgICAgICBjb25zdCBuZXh0VGh1bWJzSW5kZXggPSB0aHVtYnNTd2lwZXIuc2xpZGVzLmVxKGN1cnJlbnRUaHVtYnNJbmRleCkubmV4dEFsbChgW2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtzd2lwZXIucmVhbEluZGV4fVwiXWApLmVxKDApLmluZGV4KCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJldlRodW1ic0luZGV4ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICBuZXdUaHVtYnNJbmRleCA9IG5leHRUaHVtYnNJbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG5leHRUaHVtYnNJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgbmV3VGh1bWJzSW5kZXggPSBwcmV2VGh1bWJzSW5kZXg7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRUaHVtYnNJbmRleCAtIGN1cnJlbnRUaHVtYnNJbmRleCA9PT0gY3VycmVudFRodW1ic0luZGV4IC0gcHJldlRodW1ic0luZGV4KSB7XG4gICAgICAgICAgICAgIG5ld1RodW1ic0luZGV4ID0gdGh1bWJzU3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCA+IDEgPyBuZXh0VGh1bWJzSW5kZXggOiBjdXJyZW50VGh1bWJzSW5kZXg7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5leHRUaHVtYnNJbmRleCAtIGN1cnJlbnRUaHVtYnNJbmRleCA8IGN1cnJlbnRUaHVtYnNJbmRleCAtIHByZXZUaHVtYnNJbmRleCkge1xuICAgICAgICAgICAgICBuZXdUaHVtYnNJbmRleCA9IG5leHRUaHVtYnNJbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG5ld1RodW1ic0luZGV4ID0gcHJldlRodW1ic0luZGV4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXJlY3Rpb24gPSBzd2lwZXIuYWN0aXZlSW5kZXggPiBzd2lwZXIucHJldmlvdXNJbmRleCA/ICduZXh0JyA6ICdwcmV2JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3VGh1bWJzSW5kZXggPSBzd2lwZXIucmVhbEluZGV4O1xuICAgICAgICAgICAgZGlyZWN0aW9uID0gbmV3VGh1bWJzSW5kZXggPiBzd2lwZXIucHJldmlvdXNJbmRleCA/ICduZXh0JyA6ICdwcmV2JztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXNlT2Zmc2V0KSB7XG4gICAgICAgICAgICBuZXdUaHVtYnNJbmRleCArPSBkaXJlY3Rpb24gPT09ICduZXh0JyA/IGF1dG9TY3JvbGxPZmZzZXQgOiAtMSAqIGF1dG9TY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHRodW1ic1N3aXBlci52aXNpYmxlU2xpZGVzSW5kZXhlcyAmJiB0aHVtYnNTd2lwZXIudmlzaWJsZVNsaWRlc0luZGV4ZXMuaW5kZXhPZihuZXdUaHVtYnNJbmRleCkgPCAwKSB7XG4gICAgICAgICAgICBpZiAodGh1bWJzU3dpcGVyLnBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgICAgICAgICBpZiAobmV3VGh1bWJzSW5kZXggPiBjdXJyZW50VGh1bWJzSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBuZXdUaHVtYnNJbmRleCA9IG5ld1RodW1ic0luZGV4IC0gTWF0aC5mbG9vcihzbGlkZXNQZXJWaWV3IC8gMikgKyAxO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1RodW1ic0luZGV4ID0gbmV3VGh1bWJzSW5kZXggKyBNYXRoLmZsb29yKHNsaWRlc1BlclZpZXcgLyAyKSAtIDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmV3VGh1bWJzSW5kZXggPiBjdXJyZW50VGh1bWJzSW5kZXggJiYgdGh1bWJzU3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCA9PT0gMSkgO1xuXG4gICAgICAgICAgICB0aHVtYnNTd2lwZXIuc2xpZGVUbyhuZXdUaHVtYnNJbmRleCwgaW5pdGlhbCA/IDAgOiB1bmRlZmluZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvbignYmVmb3JlSW5pdCcsICgpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHRodW1ic1xuICAgICAgICB9ID0gc3dpcGVyLnBhcmFtcztcbiAgICAgICAgaWYgKCF0aHVtYnMgfHwgIXRodW1icy5zd2lwZXIpIHJldHVybjtcbiAgICAgICAgaW5pdCgpO1xuICAgICAgICB1cGRhdGUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICAgIG9uKCdzbGlkZUNoYW5nZSB1cGRhdGUgcmVzaXplIG9ic2VydmVyVXBkYXRlJywgKCkgPT4ge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ3NldFRyYW5zaXRpb24nLCAoX3MsIGR1cmF0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHRodW1ic1N3aXBlciA9IHN3aXBlci50aHVtYnMuc3dpcGVyO1xuICAgICAgICBpZiAoIXRodW1ic1N3aXBlciB8fCB0aHVtYnNTd2lwZXIuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIHRodW1ic1N3aXBlci5zZXRUcmFuc2l0aW9uKGR1cmF0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ2JlZm9yZURlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRodW1ic1N3aXBlciA9IHN3aXBlci50aHVtYnMuc3dpcGVyO1xuICAgICAgICBpZiAoIXRodW1ic1N3aXBlciB8fCB0aHVtYnNTd2lwZXIuZGVzdHJveWVkKSByZXR1cm47XG5cbiAgICAgICAgaWYgKHN3aXBlckNyZWF0ZWQpIHtcbiAgICAgICAgICB0aHVtYnNTd2lwZXIuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLnRodW1icywge1xuICAgICAgICBpbml0LFxuICAgICAgICB1cGRhdGVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEBmYW5jeWFwcHMvdWkvRmFuY3lib3ggdjQuMC4zMVxuICAgIGNvbnN0IHQgPSB0ID0+IFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgbnVsbCAhPT0gdCAmJiB0LmNvbnN0cnVjdG9yID09PSBPYmplY3QgJiYgXCJbb2JqZWN0IE9iamVjdF1cIiA9PT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpLFxuICAgICAgICAgIGUgPSAoLi4uaSkgPT4ge1xuICAgICAgbGV0IHMgPSAhMTtcbiAgICAgIFwiYm9vbGVhblwiID09IHR5cGVvZiBpWzBdICYmIChzID0gaS5zaGlmdCgpKTtcbiAgICAgIGxldCBvID0gaVswXTtcbiAgICAgIGlmICghbyB8fCBcIm9iamVjdFwiICE9IHR5cGVvZiBvKSB0aHJvdyBuZXcgRXJyb3IoXCJleHRlbmRlZSBtdXN0IGJlIGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnN0IG4gPSBpLnNsaWNlKDEpLFxuICAgICAgICAgICAgYSA9IG4ubGVuZ3RoO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGE7IGkrKykge1xuICAgICAgICBjb25zdCBhID0gbltpXTtcblxuICAgICAgICBmb3IgKGxldCBpIGluIGEpIGlmIChhLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgY29uc3QgbiA9IGFbaV07XG5cbiAgICAgICAgICBpZiAocyAmJiAoQXJyYXkuaXNBcnJheShuKSB8fCB0KG4pKSkge1xuICAgICAgICAgICAgY29uc3QgdCA9IEFycmF5LmlzQXJyYXkobikgPyBbXSA6IHt9O1xuICAgICAgICAgICAgb1tpXSA9IGUoITAsIG8uaGFzT3duUHJvcGVydHkoaSkgPyBvW2ldIDogdCwgbik7XG4gICAgICAgICAgfSBlbHNlIG9baV0gPSBuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvO1xuICAgIH0sXG4gICAgICAgICAgaSA9ICh0LCBlID0gMWU0KSA9PiAodCA9IHBhcnNlRmxvYXQodCkgfHwgMCwgTWF0aC5yb3VuZCgodCArIE51bWJlci5FUFNJTE9OKSAqIGUpIC8gZSksXG4gICAgICAgICAgcyA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gISEodCAmJiBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIHQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIHQgIT09IGRvY3VtZW50LmJvZHkpICYmICF0Ll9fUGFuem9vbSAmJiAoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IGdldENvbXB1dGVkU3R5bGUodClbXCJvdmVyZmxvdy15XCJdLFxuICAgICAgICAgICAgICBpID0gZ2V0Q29tcHV0ZWRTdHlsZSh0KVtcIm92ZXJmbG93LXhcIl0sXG4gICAgICAgICAgICAgIHMgPSAoXCJzY3JvbGxcIiA9PT0gZSB8fCBcImF1dG9cIiA9PT0gZSkgJiYgTWF0aC5hYnModC5zY3JvbGxIZWlnaHQgLSB0LmNsaWVudEhlaWdodCkgPiAxLFxuICAgICAgICAgICAgICBvID0gKFwic2Nyb2xsXCIgPT09IGkgfHwgXCJhdXRvXCIgPT09IGkpICYmIE1hdGguYWJzKHQuc2Nyb2xsV2lkdGggLSB0LmNsaWVudFdpZHRoKSA+IDE7XG4gICAgICAgIHJldHVybiBzIHx8IG87XG4gICAgICB9KHQpID8gdCA6IHModC5wYXJlbnROb2RlKSk7XG4gICAgfSxcbiAgICAgICAgICBvID0gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygd2luZG93ICYmIHdpbmRvdy5SZXNpemVPYnNlcnZlciB8fCBjbGFzcyB7XG4gICAgICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZXMgPSBbXSwgdGhpcy5ib3VuZENoZWNrID0gdGhpcy5jaGVjay5iaW5kKHRoaXMpLCB0aGlzLmJvdW5kQ2hlY2soKSwgdGhpcy5jYWxsYmFjayA9IHQ7XG4gICAgICB9XG5cbiAgICAgIG9ic2VydmUodCkge1xuICAgICAgICBpZiAodGhpcy5vYnNlcnZhYmxlcy5zb21lKGUgPT4gZS5lbCA9PT0gdCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgZSA9IHtcbiAgICAgICAgICBlbDogdCxcbiAgICAgICAgICBzaXplOiB7XG4gICAgICAgICAgICBoZWlnaHQ6IHQuY2xpZW50SGVpZ2h0LFxuICAgICAgICAgICAgd2lkdGg6IHQuY2xpZW50V2lkdGhcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZXMucHVzaChlKTtcbiAgICAgIH1cblxuICAgICAgdW5vYnNlcnZlKHQpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlcyA9IHRoaXMub2JzZXJ2YWJsZXMuZmlsdGVyKGUgPT4gZS5lbCAhPT0gdCk7XG4gICAgICB9XG5cbiAgICAgIGRpc2Nvbm5lY3QoKSB7XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgY2hlY2soKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm9ic2VydmFibGVzLmZpbHRlcih0ID0+IHtcbiAgICAgICAgICBjb25zdCBlID0gdC5lbC5jbGllbnRIZWlnaHQsXG4gICAgICAgICAgICAgICAgaSA9IHQuZWwuY2xpZW50V2lkdGg7XG4gICAgICAgICAgaWYgKHQuc2l6ZS5oZWlnaHQgIT09IGUgfHwgdC5zaXplLndpZHRoICE9PSBpKSByZXR1cm4gdC5zaXplLmhlaWdodCA9IGUsIHQuc2l6ZS53aWR0aCA9IGksICEwO1xuICAgICAgICB9KS5tYXAodCA9PiB0LmVsKTtcbiAgICAgICAgdC5sZW5ndGggPiAwICYmIHRoaXMuY2FsbGJhY2sodCksIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ib3VuZENoZWNrKTtcbiAgICAgIH1cblxuICAgIH07XG5cbiAgICBjbGFzcyBuIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5pZCA9IHNlbGYuVG91Y2ggJiYgdCBpbnN0YW5jZW9mIFRvdWNoID8gdC5pZGVudGlmaWVyIDogLTEsIHRoaXMucGFnZVggPSB0LnBhZ2VYLCB0aGlzLnBhZ2VZID0gdC5wYWdlWSwgdGhpcy5jbGllbnRYID0gdC5jbGllbnRYLCB0aGlzLmNsaWVudFkgPSB0LmNsaWVudFk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBhID0gKHQsIGUpID0+IGUgPyBNYXRoLnNxcnQoKGUuY2xpZW50WCAtIHQuY2xpZW50WCkgKiogMiArIChlLmNsaWVudFkgLSB0LmNsaWVudFkpICoqIDIpIDogMCxcbiAgICAgICAgICByID0gKHQsIGUpID0+IGUgPyB7XG4gICAgICBjbGllbnRYOiAodC5jbGllbnRYICsgZS5jbGllbnRYKSAvIDIsXG4gICAgICBjbGllbnRZOiAodC5jbGllbnRZICsgZS5jbGllbnRZKSAvIDJcbiAgICB9IDogdDtcblxuICAgIGNsYXNzIGgge1xuICAgICAgY29uc3RydWN0b3IodCwge1xuICAgICAgICBzdGFydDogZSA9ICgpID0+ICEwLFxuICAgICAgICBtb3ZlOiBpID0gKCkgPT4ge30sXG4gICAgICAgIGVuZDogcyA9ICgpID0+IHt9XG4gICAgICB9ID0ge30pIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IHQsIHRoaXMuc3RhcnRQb2ludGVycyA9IFtdLCB0aGlzLmN1cnJlbnRQb2ludGVycyA9IFtdLCB0aGlzLl9wb2ludGVyU3RhcnQgPSB0ID0+IHtcbiAgICAgICAgICBpZiAodC5idXR0b25zID4gMCAmJiAwICE9PSB0LmJ1dHRvbikgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IGUgPSBuZXcgbih0KTtcbiAgICAgICAgICB0aGlzLmN1cnJlbnRQb2ludGVycy5zb21lKHQgPT4gdC5pZCA9PT0gZS5pZCkgfHwgdGhpcy5fdHJpZ2dlclBvaW50ZXJTdGFydChlLCB0KSAmJiAod2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5fbW92ZSksIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLl9wb2ludGVyRW5kKSk7XG4gICAgICAgIH0sIHRoaXMuX3RvdWNoU3RhcnQgPSB0ID0+IHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGUgb2YgQXJyYXkuZnJvbSh0LmNoYW5nZWRUb3VjaGVzIHx8IFtdKSkgdGhpcy5fdHJpZ2dlclBvaW50ZXJTdGFydChuZXcgbihlKSwgdCk7XG4gICAgICAgIH0sIHRoaXMuX21vdmUgPSB0ID0+IHtcbiAgICAgICAgICBjb25zdCBlID0gdGhpcy5jdXJyZW50UG9pbnRlcnMuc2xpY2UoKSxcbiAgICAgICAgICAgICAgICBpID0gKHQgPT4gXCJjaGFuZ2VkVG91Y2hlc1wiIGluIHQpKHQpID8gQXJyYXkuZnJvbSh0LmNoYW5nZWRUb3VjaGVzKS5tYXAodCA9PiBuZXcgbih0KSkgOiBbbmV3IG4odCldO1xuXG4gICAgICAgICAgZm9yIChjb25zdCB0IG9mIGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmN1cnJlbnRQb2ludGVycy5maW5kSW5kZXgoZSA9PiBlLmlkID09PSB0LmlkKTtcbiAgICAgICAgICAgIGUgPCAwIHx8ICh0aGlzLmN1cnJlbnRQb2ludGVyc1tlXSA9IHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX21vdmVDYWxsYmFjayhlLCB0aGlzLmN1cnJlbnRQb2ludGVycy5zbGljZSgpLCB0KTtcbiAgICAgICAgfSwgdGhpcy5fdHJpZ2dlclBvaW50ZXJFbmQgPSAodCwgZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLmN1cnJlbnRQb2ludGVycy5maW5kSW5kZXgoZSA9PiBlLmlkID09PSB0LmlkKTtcbiAgICAgICAgICByZXR1cm4gIShpIDwgMCkgJiYgKHRoaXMuY3VycmVudFBvaW50ZXJzLnNwbGljZShpLCAxKSwgdGhpcy5zdGFydFBvaW50ZXJzLnNwbGljZShpLCAxKSwgdGhpcy5fZW5kQ2FsbGJhY2sodCwgZSksICEwKTtcbiAgICAgICAgfSwgdGhpcy5fcG9pbnRlckVuZCA9IHQgPT4ge1xuICAgICAgICAgIHQuYnV0dG9ucyA+IDAgJiYgMCAhPT0gdC5idXR0b24gfHwgdGhpcy5fdHJpZ2dlclBvaW50ZXJFbmQobmV3IG4odCksIHQpICYmICh3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLl9tb3ZlLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICAgIH0pLCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5fcG9pbnRlckVuZCwge1xuICAgICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIHRoaXMuX3RvdWNoRW5kID0gdCA9PiB7XG4gICAgICAgICAgZm9yIChjb25zdCBlIG9mIEFycmF5LmZyb20odC5jaGFuZ2VkVG91Y2hlcyB8fCBbXSkpIHRoaXMuX3RyaWdnZXJQb2ludGVyRW5kKG5ldyBuKGUpLCB0KTtcbiAgICAgICAgfSwgdGhpcy5fc3RhcnRDYWxsYmFjayA9IGUsIHRoaXMuX21vdmVDYWxsYmFjayA9IGksIHRoaXMuX2VuZENhbGxiYWNrID0gcywgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuX3BvaW50ZXJTdGFydCwge1xuICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgIH0pLCB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRoaXMuX3RvdWNoU3RhcnQsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRoaXMuX21vdmUsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5fZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGhpcy5fdG91Y2hFbmQpLCB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGNhbmNlbFwiLCB0aGlzLl90b3VjaEVuZCk7XG4gICAgICB9XG5cbiAgICAgIHN0b3AoKSB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLl9wb2ludGVyU3RhcnQsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLl90b3VjaFN0YXJ0LCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHRoaXMuX2VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCB0aGlzLl9tb3ZlLCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHRoaXMuX2VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIHRoaXMuX3RvdWNoRW5kKSwgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hjYW5jZWxcIiwgdGhpcy5fdG91Y2hFbmQpLCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLl9tb3ZlKSwgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMuX3BvaW50ZXJFbmQpO1xuICAgICAgfVxuXG4gICAgICBfdHJpZ2dlclBvaW50ZXJTdGFydCh0LCBlKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuX3N0YXJ0Q2FsbGJhY2sodCwgZSkgJiYgKHRoaXMuY3VycmVudFBvaW50ZXJzLnB1c2godCksIHRoaXMuc3RhcnRQb2ludGVycy5wdXNoKHQpLCAhMCk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBjbGFzcyBsIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQgPSB7fSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBlKCEwLCB7fSwgdCksIHRoaXMucGx1Z2lucyA9IFtdLCB0aGlzLmV2ZW50cyA9IHt9O1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiBbXCJvblwiLCBcIm9uY2VcIl0pIGZvciAoY29uc3QgZSBvZiBPYmplY3QuZW50cmllcyh0aGlzLm9wdGlvbnNbdF0gfHwge30pKSB0aGlzW3RdKC4uLmUpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb24odCwgZSwgLi4uaSkge1xuICAgICAgICB0ID0gU3RyaW5nKHQpO1xuICAgICAgICBsZXQgcyA9IChvID0gdCwgbiA9IHRoaXMub3B0aW9ucywgby5zcGxpdChcIi5cIikucmVkdWNlKGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgICAgICAgcmV0dXJuIHQgJiYgdFtlXTtcbiAgICAgICAgfSwgbikpO1xuICAgICAgICB2YXIgbywgbjtcbiAgICAgICAgcmV0dXJuIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgcyAmJiAocyA9IHMuY2FsbCh0aGlzLCB0aGlzLCAuLi5pKSksIHZvaWQgMCA9PT0gcyA/IGUgOiBzO1xuICAgICAgfVxuXG4gICAgICBsb2NhbGl6ZSh0LCBlID0gW10pIHtcbiAgICAgICAgcmV0dXJuIHQgPSAodCA9IFN0cmluZyh0KS5yZXBsYWNlKC9cXHtcXHsoXFx3KykuPyhcXHcrKT9cXH1cXH0vZywgKHQsIGksIHMpID0+IHtcbiAgICAgICAgICBsZXQgbyA9IFwiXCI7XG4gICAgICAgICAgcyA/IG8gPSB0aGlzLm9wdGlvbihgJHtpWzBdICsgaS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygxKX0ubDEwbi4ke3N9YCkgOiBpICYmIChvID0gdGhpcy5vcHRpb24oYGwxMG4uJHtpfWApKSwgbyB8fCAobyA9IHQpO1xuXG4gICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBlLmxlbmd0aDsgdCsrKSBvID0gby5zcGxpdChlW3RdWzBdKS5qb2luKGVbdF1bMV0pO1xuXG4gICAgICAgICAgcmV0dXJuIG87XG4gICAgICAgIH0pKS5yZXBsYWNlKC9cXHtcXHsoLiopXFx9XFx9LywgKHQsIGUpID0+IGUpO1xuICAgICAgfVxuXG4gICAgICBvbihlLCBpKSB7XG4gICAgICAgIGlmICh0KGUpKSB7XG4gICAgICAgICAgZm9yIChjb25zdCB0IG9mIE9iamVjdC5lbnRyaWVzKGUpKSB0aGlzLm9uKC4uLnQpO1xuXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gU3RyaW5nKGUpLnNwbGl0KFwiIFwiKS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmV2ZW50c1t0XSA9IHRoaXMuZXZlbnRzW3RdIHx8IFtdO1xuICAgICAgICAgIC0xID09IGUuaW5kZXhPZihpKSAmJiBlLnB1c2goaSk7XG4gICAgICAgIH0pLCB0aGlzO1xuICAgICAgfVxuXG4gICAgICBvbmNlKGUsIGkpIHtcbiAgICAgICAgaWYgKHQoZSkpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmVudHJpZXMoZSkpIHRoaXMub25jZSguLi50KTtcblxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFN0cmluZyhlKS5zcGxpdChcIiBcIikuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICBjb25zdCBlID0gKC4uLnMpID0+IHtcbiAgICAgICAgICAgIHRoaXMub2ZmKHQsIGUpLCBpLmNhbGwodGhpcywgdGhpcywgLi4ucyk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGUuXyA9IGksIHRoaXMub24odCwgZSk7XG4gICAgICAgIH0pLCB0aGlzO1xuICAgICAgfVxuXG4gICAgICBvZmYoZSwgaSkge1xuICAgICAgICBpZiAoIXQoZSkpIHJldHVybiBlLnNwbGl0KFwiIFwiKS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmV2ZW50c1t0XTtcbiAgICAgICAgICBpZiAoIWUgfHwgIWUubGVuZ3RoKSByZXR1cm4gdGhpcztcbiAgICAgICAgICBsZXQgcyA9IC0xO1xuXG4gICAgICAgICAgZm9yIChsZXQgdCA9IDAsIG8gPSBlLmxlbmd0aDsgdCA8IG87IHQrKykge1xuICAgICAgICAgICAgY29uc3QgbyA9IGVbdF07XG5cbiAgICAgICAgICAgIGlmIChvICYmIChvID09PSBpIHx8IG8uXyA9PT0gaSkpIHtcbiAgICAgICAgICAgICAgcyA9IHQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC0xICE9IHMgJiYgZS5zcGxpY2UocywgMSk7XG4gICAgICAgIH0pLCB0aGlzO1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiBPYmplY3QuZW50cmllcyhlKSkgdGhpcy5vZmYoLi4udCk7XG4gICAgICB9XG5cbiAgICAgIHRyaWdnZXIodCwgLi4uZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGkgb2YgWy4uLih0aGlzLmV2ZW50c1t0XSB8fCBbXSldLnNsaWNlKCkpIGlmIChpICYmICExID09PSBpLmNhbGwodGhpcywgdGhpcywgLi4uZSkpIHJldHVybiAhMTtcblxuICAgICAgICBmb3IgKGNvbnN0IGkgb2YgWy4uLih0aGlzLmV2ZW50c1tcIipcIl0gfHwgW10pXS5zbGljZSgpKSBpZiAoaSAmJiAhMSA9PT0gaS5jYWxsKHRoaXMsIHQsIHRoaXMsIC4uLmUpKSByZXR1cm4gITE7XG5cbiAgICAgICAgcmV0dXJuICEwO1xuICAgICAgfVxuXG4gICAgICBhdHRhY2hQbHVnaW5zKHQpIHtcbiAgICAgICAgY29uc3QgaSA9IHt9O1xuXG4gICAgICAgIGZvciAoY29uc3QgW3MsIG9dIG9mIE9iamVjdC5lbnRyaWVzKHQgfHwge30pKSAhMSA9PT0gdGhpcy5vcHRpb25zW3NdIHx8IHRoaXMucGx1Z2luc1tzXSB8fCAodGhpcy5vcHRpb25zW3NdID0gZSh7fSwgby5kZWZhdWx0cyB8fCB7fSwgdGhpcy5vcHRpb25zW3NdKSwgaVtzXSA9IG5ldyBvKHRoaXMpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFt0LCBlXSBvZiBPYmplY3QuZW50cmllcyhpKSkgZS5hdHRhY2godGhpcyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2lucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucGx1Z2lucywgaSksIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGRldGFjaFBsdWdpbnMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgdCBpbiB0aGlzLnBsdWdpbnMpIHtcbiAgICAgICAgICBsZXQgZTtcbiAgICAgICAgICAoZSA9IHRoaXMucGx1Z2luc1t0XSkgJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBlLmRldGFjaCAmJiBlLmRldGFjaCh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnBsdWdpbnMgPSB7fSwgdGhpcztcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IGMgPSB7XG4gICAgICB0b3VjaDogITAsXG4gICAgICB6b29tOiAhMCxcbiAgICAgIHBpbmNoVG9ab29tOiAhMCxcbiAgICAgIHBhbk9ubHlab29tZWQ6ICExLFxuICAgICAgbG9ja0F4aXM6ICExLFxuICAgICAgZnJpY3Rpb246IC42NCxcbiAgICAgIGRlY2VsRnJpY3Rpb246IC44OCxcbiAgICAgIHpvb21GcmljdGlvbjogLjc0LFxuICAgICAgYm91bmNlRm9yY2U6IC4yLFxuICAgICAgYmFzZVNjYWxlOiAxLFxuICAgICAgbWluU2NhbGU6IDEsXG4gICAgICBtYXhTY2FsZTogMixcbiAgICAgIHN0ZXA6IC41LFxuICAgICAgdGV4dFNlbGVjdGlvbjogITEsXG4gICAgICBjbGljazogXCJ0b2dnbGVab29tXCIsXG4gICAgICB3aGVlbDogXCJ6b29tXCIsXG4gICAgICB3aGVlbEZhY3RvcjogNDIsXG4gICAgICB3aGVlbExpbWl0OiA1LFxuICAgICAgZHJhZ2dhYmxlQ2xhc3M6IFwiaXMtZHJhZ2dhYmxlXCIsXG4gICAgICBkcmFnZ2luZ0NsYXNzOiBcImlzLWRyYWdnaW5nXCIsXG4gICAgICByYXRpbzogMVxuICAgIH07XG5cbiAgICBjbGFzcyBkIGV4dGVuZHMgbCB7XG4gICAgICBjb25zdHJ1Y3Rvcih0LCBpID0ge30pIHtcbiAgICAgICAgc3VwZXIoZSghMCwge30sIGMsIGkpKSwgdGhpcy5zdGF0ZSA9IFwiaW5pdFwiLCB0aGlzLiRjb250YWluZXIgPSB0O1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiBbXCJvbkxvYWRcIiwgXCJvbldoZWVsXCIsIFwib25DbGlja1wiXSkgdGhpc1t0XSA9IHRoaXNbdF0uYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmluaXRMYXlvdXQoKSwgdGhpcy5yZXNldFZhbHVlcygpLCB0aGlzLmF0dGFjaFBsdWdpbnMoZC5QbHVnaW5zKSwgdGhpcy50cmlnZ2VyKFwiaW5pdFwiKSwgdGhpcy51cGRhdGVNZXRyaWNzKCksIHRoaXMuYXR0YWNoRXZlbnRzKCksIHRoaXMudHJpZ2dlcihcInJlYWR5XCIpLCAhMSA9PT0gdGhpcy5vcHRpb24oXCJjZW50ZXJPblN0YXJ0XCIpID8gdGhpcy5zdGF0ZSA9IFwicmVhZHlcIiA6IHRoaXMucGFuVG8oe1xuICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgIH0pLCB0Ll9fUGFuem9vbSA9IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGluaXRMYXlvdXQoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLiRjb250YWluZXI7XG4gICAgICAgIGlmICghKHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHRocm93IG5ldyBFcnJvcihcIlBhbnpvb206IENvbnRhaW5lciBub3QgZm91bmRcIik7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLm9wdGlvbihcImNvbnRlbnRcIikgfHwgdC5xdWVyeVNlbGVjdG9yKFwiLnBhbnpvb21fX2NvbnRlbnRcIik7XG4gICAgICAgIGlmICghZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFuem9vbTogQ29udGVudCBub3QgZm91bmRcIik7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQgPSBlO1xuICAgICAgICBsZXQgaSA9IHRoaXMub3B0aW9uKFwidmlld3BvcnRcIikgfHwgdC5xdWVyeVNlbGVjdG9yKFwiLnBhbnpvb21fX3ZpZXdwb3J0XCIpO1xuICAgICAgICBpIHx8ICExID09PSB0aGlzLm9wdGlvbihcIndyYXBJbm5lclwiKSB8fCAoaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIGkuY2xhc3NMaXN0LmFkZChcInBhbnpvb21fX3ZpZXdwb3J0XCIpLCBpLmFwcGVuZCguLi50LmNoaWxkTm9kZXMpLCB0LmFwcGVuZENoaWxkKGkpKSwgdGhpcy4kdmlld3BvcnQgPSBpIHx8IGUucGFyZW50Tm9kZTtcbiAgICAgIH1cblxuICAgICAgcmVzZXRWYWx1ZXMoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlUmF0ZSA9IHRoaXMub3B0aW9uKFwidXBkYXRlUmF0ZVwiLCAvaVBob25lfGlQYWR8aVBvZHxBbmRyb2lkL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSA/IDI1MCA6IDI0KSwgdGhpcy5jb250YWluZXIgPSB7XG4gICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH0sIHRoaXMudmlld3BvcnQgPSB7XG4gICAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH0sIHRoaXMuY29udGVudCA9IHtcbiAgICAgICAgICBvcmlnV2lkdGg6IDAsXG4gICAgICAgICAgb3JpZ0hlaWdodDogMCxcbiAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgeDogdGhpcy5vcHRpb24oXCJ4XCIsIDApLFxuICAgICAgICAgIHk6IHRoaXMub3B0aW9uKFwieVwiLCAwKSxcbiAgICAgICAgICBzY2FsZTogdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIilcbiAgICAgICAgfSwgdGhpcy50cmFuc2Zvcm0gPSB7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIHNjYWxlOiAxXG4gICAgICAgIH0sIHRoaXMucmVzZXREcmFnUG9zaXRpb24oKTtcbiAgICAgIH1cblxuICAgICAgb25Mb2FkKHQpIHtcbiAgICAgICAgdGhpcy51cGRhdGVNZXRyaWNzKCksIHRoaXMucGFuVG8oe1xuICAgICAgICAgIHNjYWxlOiB0aGlzLm9wdGlvbihcImJhc2VTY2FsZVwiKSxcbiAgICAgICAgICBmcmljdGlvbjogMFxuICAgICAgICB9KSwgdGhpcy50cmlnZ2VyKFwibG9hZFwiLCB0KTtcbiAgICAgIH1cblxuICAgICAgb25DbGljayh0KSB7XG4gICAgICAgIGlmICh0LmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcbiAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jbG9zZXN0KFwiW2NvbnRlbnRlZGl0YWJsZV1cIikpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uKFwidGV4dFNlbGVjdGlvblwiKSAmJiB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKS5sZW5ndGggJiYgKCF0LnRhcmdldCB8fCAhdC50YXJnZXQuaGFzQXR0cmlidXRlKFwiZGF0YS1mYW5jeWJveC1jbG9zZVwiKSkpIHJldHVybiB2b2lkIHQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLiRjb250ZW50LmdldENsaWVudFJlY3RzKClbMF07XG4gICAgICAgIGlmIChcInJlYWR5XCIgIT09IHRoaXMuc3RhdGUgJiYgKHRoaXMuZHJhZ1Bvc2l0aW9uLm1pZFBvaW50IHx8IE1hdGguYWJzKGUudG9wIC0gdGhpcy5kcmFnU3RhcnQucmVjdC50b3ApID4gMSB8fCBNYXRoLmFicyhlLmxlZnQgLSB0aGlzLmRyYWdTdGFydC5yZWN0LmxlZnQpID4gMSkpIHJldHVybiB0LnByZXZlbnREZWZhdWx0KCksIHZvaWQgdC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgITEgIT09IHRoaXMudHJpZ2dlcihcImNsaWNrXCIsIHQpICYmIHRoaXMub3B0aW9uKFwiem9vbVwiKSAmJiBcInRvZ2dsZVpvb21cIiA9PT0gdGhpcy5vcHRpb24oXCJjbGlja1wiKSAmJiAodC5wcmV2ZW50RGVmYXVsdCgpLCB0LnN0b3BQcm9wYWdhdGlvbigpLCB0aGlzLnpvb21XaXRoQ2xpY2sodCkpO1xuICAgICAgfVxuXG4gICAgICBvbldoZWVsKHQpIHtcbiAgICAgICAgITEgIT09IHRoaXMudHJpZ2dlcihcIndoZWVsXCIsIHQpICYmIHRoaXMub3B0aW9uKFwiem9vbVwiKSAmJiB0aGlzLm9wdGlvbihcIndoZWVsXCIpICYmIHRoaXMuem9vbVdpdGhXaGVlbCh0KTtcbiAgICAgIH1cblxuICAgICAgem9vbVdpdGhXaGVlbCh0KSB7XG4gICAgICAgIHZvaWQgMCA9PT0gdGhpcy5jaGFuZ2VkRGVsdGEgJiYgKHRoaXMuY2hhbmdlZERlbHRhID0gMCk7XG4gICAgICAgIGNvbnN0IGUgPSBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgLXQuZGVsdGFZIHx8IC10LmRlbHRhWCB8fCB0LndoZWVsRGVsdGEgfHwgLXQuZGV0YWlsKSksXG4gICAgICAgICAgICAgIGkgPSB0aGlzLmNvbnRlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzID0gaSAqICgxMDAgKyBlICogdGhpcy5vcHRpb24oXCJ3aGVlbEZhY3RvclwiKSkgLyAxMDA7XG4gICAgICAgIGlmIChlIDwgMCAmJiBNYXRoLmFicyhpIC0gdGhpcy5vcHRpb24oXCJtaW5TY2FsZVwiKSkgPCAuMDEgfHwgZSA+IDAgJiYgTWF0aC5hYnMoaSAtIHRoaXMub3B0aW9uKFwibWF4U2NhbGVcIikpIDwgLjAxID8gKHRoaXMuY2hhbmdlZERlbHRhICs9IE1hdGguYWJzKGUpLCBzID0gaSkgOiAodGhpcy5jaGFuZ2VkRGVsdGEgPSAwLCBzID0gTWF0aC5tYXgoTWF0aC5taW4ocywgdGhpcy5vcHRpb24oXCJtYXhTY2FsZVwiKSksIHRoaXMub3B0aW9uKFwibWluU2NhbGVcIikpKSwgdGhpcy5jaGFuZ2VkRGVsdGEgPiB0aGlzLm9wdGlvbihcIndoZWVsTGltaXRcIikpIHJldHVybjtcbiAgICAgICAgaWYgKHQucHJldmVudERlZmF1bHQoKSwgcyA9PT0gaSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBvID0gdGhpcy4kY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgbiA9IHQuY2xpZW50WCAtIG8ubGVmdCxcbiAgICAgICAgICAgICAgYSA9IHQuY2xpZW50WSAtIG8udG9wO1xuICAgICAgICB0aGlzLnpvb21UbyhzLCB7XG4gICAgICAgICAgeDogbixcbiAgICAgICAgICB5OiBhXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB6b29tV2l0aENsaWNrKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuJGNvbnRlbnQuZ2V0Q2xpZW50UmVjdHMoKVswXSxcbiAgICAgICAgICAgICAgaSA9IHQuY2xpZW50WCAtIGUubGVmdCxcbiAgICAgICAgICAgICAgcyA9IHQuY2xpZW50WSAtIGUudG9wO1xuICAgICAgICB0aGlzLnRvZ2dsZVpvb20oe1xuICAgICAgICAgIHg6IGksXG4gICAgICAgICAgeTogc1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoRXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRjb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHRoaXMub25Mb2FkKSwgdGhpcy4kY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCB0aGlzLm9uV2hlZWwsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy4kY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm9uQ2xpY2ssIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5pbml0T2JzZXJ2ZXIoKTtcbiAgICAgICAgY29uc3QgdCA9IG5ldyBoKHRoaXMuJGNvbnRhaW5lciwge1xuICAgICAgICAgIHN0YXJ0OiAoZSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbihcInRvdWNoXCIpKSByZXR1cm4gITE7XG4gICAgICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS5zY2FsZSA8IDApIHJldHVybiAhMTtcbiAgICAgICAgICAgIGNvbnN0IG8gPSBpLmNvbXBvc2VkUGF0aCgpWzBdO1xuXG4gICAgICAgICAgICBpZiAoIXQuY3VycmVudFBvaW50ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBpZiAoLTEgIT09IFtcIkJVVFRPTlwiLCBcIlRFWFRBUkVBXCIsIFwiT1BUSU9OXCIsIFwiSU5QVVRcIiwgXCJTRUxFQ1RcIiwgXCJWSURFT1wiXS5pbmRleE9mKG8ubm9kZU5hbWUpKSByZXR1cm4gITE7XG4gICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbihcInRleHRTZWxlY3Rpb25cIikgJiYgKCh0LCBlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcyA9IHQuY2hpbGROb2RlcyxcbiAgICAgICAgICAgICAgICAgICAgICBvID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IHQgPSAwOyB0IDwgcy5sZW5ndGg7IHQrKykge1xuICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHNbdF07XG4gICAgICAgICAgICAgICAgICBpZiAobi5ub2RlVHlwZSAhPT0gTm9kZS5URVhUX05PREUpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgby5zZWxlY3ROb2RlQ29udGVudHMobik7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhID0gby5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICAgIGlmIChlID49IGEubGVmdCAmJiBpID49IGEudG9wICYmIGUgPD0gYS5yaWdodCAmJiBpIDw9IGEuYm90dG9tKSByZXR1cm4gbjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gITE7XG4gICAgICAgICAgICAgIH0pKG8sIGUuY2xpZW50WCwgZS5jbGllbnRZKSkgcmV0dXJuICExO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gIXMobykgJiYgITEgIT09IHRoaXMudHJpZ2dlcihcInRvdWNoU3RhcnRcIiwgaSkgJiYgKFwibW91c2Vkb3duXCIgPT09IGkudHlwZSAmJiBpLnByZXZlbnREZWZhdWx0KCksIHRoaXMuc3RhdGUgPSBcInBvaW50ZXJkb3duXCIsIHRoaXMucmVzZXREcmFnUG9zaXRpb24oKSwgdGhpcy5kcmFnUG9zaXRpb24ubWlkUG9pbnQgPSBudWxsLCB0aGlzLmRyYWdQb3NpdGlvbi50aW1lID0gRGF0ZS5ub3coKSwgITApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgbW92ZTogKGUsIGksIHMpID0+IHtcbiAgICAgICAgICAgIGlmIChcInBvaW50ZXJkb3duXCIgIT09IHRoaXMuc3RhdGUpIHJldHVybjtcbiAgICAgICAgICAgIGlmICghMSA9PT0gdGhpcy50cmlnZ2VyKFwidG91Y2hNb3ZlXCIsIHMpKSByZXR1cm4gdm9pZCBzLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBpZiAoaS5sZW5ndGggPCAyICYmICEwID09PSB0aGlzLm9wdGlvbihcInBhbk9ubHlab29tZWRcIikgJiYgdGhpcy5jb250ZW50LndpZHRoIDw9IHRoaXMudmlld3BvcnQud2lkdGggJiYgdGhpcy5jb250ZW50LmhlaWdodCA8PSB0aGlzLnZpZXdwb3J0LmhlaWdodCAmJiB0aGlzLnRyYW5zZm9ybS5zY2FsZSA8PSB0aGlzLm9wdGlvbihcImJhc2VTY2FsZVwiKSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGkubGVuZ3RoID4gMSAmJiAoIXRoaXMub3B0aW9uKFwiem9vbVwiKSB8fCAhMSA9PT0gdGhpcy5vcHRpb24oXCJwaW5jaFRvWm9vbVwiKSkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IG8gPSByKGVbMF0sIGVbMV0pLFxuICAgICAgICAgICAgICAgICAgbiA9IHIoaVswXSwgaVsxXSksXG4gICAgICAgICAgICAgICAgICBoID0gbi5jbGllbnRYIC0gby5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgbCA9IG4uY2xpZW50WSAtIG8uY2xpZW50WSxcbiAgICAgICAgICAgICAgICAgIGMgPSBhKGVbMF0sIGVbMV0pLFxuICAgICAgICAgICAgICAgICAgZCA9IGEoaVswXSwgaVsxXSksXG4gICAgICAgICAgICAgICAgICB1ID0gYyAmJiBkID8gZCAvIGMgOiAxO1xuICAgICAgICAgICAgdGhpcy5kcmFnT2Zmc2V0LnggKz0gaCwgdGhpcy5kcmFnT2Zmc2V0LnkgKz0gbCwgdGhpcy5kcmFnT2Zmc2V0LnNjYWxlICo9IHUsIHRoaXMuZHJhZ09mZnNldC50aW1lID0gRGF0ZS5ub3coKSAtIHRoaXMuZHJhZ1Bvc2l0aW9uLnRpbWU7XG4gICAgICAgICAgICBjb25zdCBmID0gMSA9PT0gdGhpcy5kcmFnU3RhcnQuc2NhbGUgJiYgdGhpcy5vcHRpb24oXCJsb2NrQXhpc1wiKTtcblxuICAgICAgICAgICAgaWYgKGYgJiYgIXRoaXMubG9ja0F4aXMpIHtcbiAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMuZHJhZ09mZnNldC54KSA8IDYgJiYgTWF0aC5hYnModGhpcy5kcmFnT2Zmc2V0LnkpIDwgNikgcmV0dXJuIHZvaWQgcy5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBjb25zdCB0ID0gTWF0aC5hYnMoMTgwICogTWF0aC5hdGFuMih0aGlzLmRyYWdPZmZzZXQueSwgdGhpcy5kcmFnT2Zmc2V0LngpIC8gTWF0aC5QSSk7XG4gICAgICAgICAgICAgIHRoaXMubG9ja0F4aXMgPSB0ID4gNDUgJiYgdCA8IDEzNSA/IFwieVwiIDogXCJ4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcInh5XCIgPT09IGYgfHwgXCJ5XCIgIT09IHRoaXMubG9ja0F4aXMpIHtcbiAgICAgICAgICAgICAgaWYgKHMucHJldmVudERlZmF1bHQoKSwgcy5zdG9wUHJvcGFnYXRpb24oKSwgcy5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwgdGhpcy5sb2NrQXhpcyAmJiAodGhpcy5kcmFnT2Zmc2V0W1wieFwiID09PSB0aGlzLmxvY2tBeGlzID8gXCJ5XCIgOiBcInhcIl0gPSAwKSwgdGhpcy4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQodGhpcy5vcHRpb24oXCJkcmFnZ2luZ0NsYXNzXCIpKSwgdGhpcy50cmFuc2Zvcm0uc2NhbGUgPT09IHRoaXMub3B0aW9uKFwiYmFzZVNjYWxlXCIpICYmIFwieVwiID09PSB0aGlzLmxvY2tBeGlzIHx8ICh0aGlzLmRyYWdQb3NpdGlvbi54ID0gdGhpcy5kcmFnU3RhcnQueCArIHRoaXMuZHJhZ09mZnNldC54KSwgdGhpcy50cmFuc2Zvcm0uc2NhbGUgPT09IHRoaXMub3B0aW9uKFwiYmFzZVNjYWxlXCIpICYmIFwieFwiID09PSB0aGlzLmxvY2tBeGlzIHx8ICh0aGlzLmRyYWdQb3NpdGlvbi55ID0gdGhpcy5kcmFnU3RhcnQueSArIHRoaXMuZHJhZ09mZnNldC55KSwgdGhpcy5kcmFnUG9zaXRpb24uc2NhbGUgPSB0aGlzLmRyYWdTdGFydC5zY2FsZSAqIHRoaXMuZHJhZ09mZnNldC5zY2FsZSwgaS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IHIodC5zdGFydFBvaW50ZXJzWzBdLCB0LnN0YXJ0UG9pbnRlcnNbMV0pLFxuICAgICAgICAgICAgICAgICAgICAgIGkgPSBlLmNsaWVudFggLSB0aGlzLmRyYWdTdGFydC5yZWN0LngsXG4gICAgICAgICAgICAgICAgICAgICAgcyA9IGUuY2xpZW50WSAtIHRoaXMuZHJhZ1N0YXJ0LnJlY3QueSxcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBkZWx0YVg6IG8sXG4gICAgICAgICAgICAgICAgICBkZWx0YVk6IGFcbiAgICAgICAgICAgICAgICB9ID0gdGhpcy5nZXRab29tRGVsdGEodGhpcy5jb250ZW50LnNjYWxlICogdGhpcy5kcmFnT2Zmc2V0LnNjYWxlLCBpLCBzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdQb3NpdGlvbi54IC09IG8sIHRoaXMuZHJhZ1Bvc2l0aW9uLnkgLT0gYSwgdGhpcy5kcmFnUG9zaXRpb24ubWlkUG9pbnQgPSBuO1xuICAgICAgICAgICAgICB9IGVsc2UgdGhpcy5zZXREcmFnUmVzaXN0YW5jZSgpO1xuXG4gICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuZHJhZ1Bvc2l0aW9uLngsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5kcmFnUG9zaXRpb24ueSxcbiAgICAgICAgICAgICAgICBzY2FsZTogdGhpcy5kcmFnUG9zaXRpb24uc2NhbGVcbiAgICAgICAgICAgICAgfSwgdGhpcy5zdGFydEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZW5kOiAoZSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKFwicG9pbnRlcmRvd25cIiAhPT0gdGhpcy5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2RyYWdPZmZzZXQgPSB7IC4uLnRoaXMuZHJhZ09mZnNldFxuICAgICAgICAgICAgfSwgdC5jdXJyZW50UG9pbnRlcnMubGVuZ3RoKSByZXR1cm4gdm9pZCB0aGlzLnJlc2V0RHJhZ1Bvc2l0aW9uKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZSA9IFwiZGVjZWxcIiwgdGhpcy5mcmljdGlvbiA9IHRoaXMub3B0aW9uKFwiZGVjZWxGcmljdGlvblwiKSwgdGhpcy5yZWNhbGN1bGF0ZVRyYW5zZm9ybSgpLCB0aGlzLiRjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLm9wdGlvbihcImRyYWdnaW5nQ2xhc3NcIikpLCAhMSA9PT0gdGhpcy50cmlnZ2VyKFwidG91Y2hFbmRcIiwgaSkpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChcImRlY2VsXCIgIT09IHRoaXMuc3RhdGUpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLm9wdGlvbihcIm1pblNjYWxlXCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNmb3JtLnNjYWxlIDwgcykgcmV0dXJuIHZvaWQgdGhpcy56b29tVG8ocywge1xuICAgICAgICAgICAgICBmcmljdGlvbjogLjY0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IG8gPSB0aGlzLm9wdGlvbihcIm1heFNjYWxlXCIpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy50cmFuc2Zvcm0uc2NhbGUgLSBvID4gLjAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLmRyYWdQb3NpdGlvbi5taWRQb2ludCB8fCBlLFxuICAgICAgICAgICAgICAgICAgICBpID0gdGhpcy4kY29udGVudC5nZXRDbGllbnRSZWN0cygpWzBdO1xuICAgICAgICAgICAgICB0aGlzLnpvb21UbyhvLCB7XG4gICAgICAgICAgICAgICAgZnJpY3Rpb246IC42NCxcbiAgICAgICAgICAgICAgICB4OiB0LmNsaWVudFggLSBpLmxlZnQsXG4gICAgICAgICAgICAgICAgeTogdC5jbGllbnRZIC0gaS50b3BcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wb2ludGVyVHJhY2tlciA9IHQ7XG4gICAgICB9XG5cbiAgICAgIGluaXRPYnNlcnZlcigpIHtcbiAgICAgICAgdGhpcy5yZXNpemVPYnNlcnZlciB8fCAodGhpcy5yZXNpemVPYnNlcnZlciA9IG5ldyBvKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVRpbWVyIHx8ICh0aGlzLnVwZGF0ZVRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ID0gdGhpcy4kY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgdC53aWR0aCAmJiB0LmhlaWdodCA/ICgoTWF0aC5hYnModC53aWR0aCAtIHRoaXMuY29udGFpbmVyLndpZHRoKSA+IDEgfHwgTWF0aC5hYnModC5oZWlnaHQgLSB0aGlzLmNvbnRhaW5lci5oZWlnaHQpID4gMSkgJiYgKHRoaXMuaXNBbmltYXRpbmcoKSAmJiB0aGlzLmVuZEFuaW1hdGlvbighMCksIHRoaXMudXBkYXRlTWV0cmljcygpLCB0aGlzLnBhblRvKHtcbiAgICAgICAgICAgICAgeDogdGhpcy5jb250ZW50LngsXG4gICAgICAgICAgICAgIHk6IHRoaXMuY29udGVudC55LFxuICAgICAgICAgICAgICBzY2FsZTogdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIiksXG4gICAgICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgICAgICB9KSksIHRoaXMudXBkYXRlVGltZXIgPSBudWxsKSA6IHRoaXMudXBkYXRlVGltZXIgPSBudWxsO1xuICAgICAgICAgIH0sIHRoaXMudXBkYXRlUmF0ZSkpO1xuICAgICAgICB9KSwgdGhpcy5yZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMuJGNvbnRhaW5lcikpO1xuICAgICAgfVxuXG4gICAgICByZXNldERyYWdQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5sb2NrQXhpcyA9IG51bGwsIHRoaXMuZnJpY3Rpb24gPSB0aGlzLm9wdGlvbihcImZyaWN0aW9uXCIpLCB0aGlzLnZlbG9jaXR5ID0ge1xuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBzY2FsZTogMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgeDogdCxcbiAgICAgICAgICB5OiBlLFxuICAgICAgICAgIHNjYWxlOiBpXG4gICAgICAgIH0gPSB0aGlzLmNvbnRlbnQ7XG4gICAgICAgIHRoaXMuZHJhZ1N0YXJ0ID0ge1xuICAgICAgICAgIHJlY3Q6IHRoaXMuJGNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgeDogdCxcbiAgICAgICAgICB5OiBlLFxuICAgICAgICAgIHNjYWxlOiBpXG4gICAgICAgIH0sIHRoaXMuZHJhZ1Bvc2l0aW9uID0geyAuLi50aGlzLmRyYWdQb3NpdGlvbixcbiAgICAgICAgICB4OiB0LFxuICAgICAgICAgIHk6IGUsXG4gICAgICAgICAgc2NhbGU6IGlcbiAgICAgICAgfSwgdGhpcy5kcmFnT2Zmc2V0ID0ge1xuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICB0aW1lOiAwXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZU1ldHJpY3ModCkge1xuICAgICAgICAhMCAhPT0gdCAmJiB0aGlzLnRyaWdnZXIoXCJiZWZvcmVVcGRhdGVcIik7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLiRjb250YWluZXIsXG4gICAgICAgICAgICAgIHMgPSB0aGlzLiRjb250ZW50LFxuICAgICAgICAgICAgICBvID0gdGhpcy4kdmlld3BvcnQsXG4gICAgICAgICAgICAgIG4gPSBzIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCxcbiAgICAgICAgICAgICAgYSA9IHRoaXMub3B0aW9uKFwiem9vbVwiKSxcbiAgICAgICAgICAgICAgciA9IHRoaXMub3B0aW9uKFwicmVzaXplUGFyZW50XCIsIGEpO1xuICAgICAgICBsZXQgaCA9IHRoaXMub3B0aW9uKFwid2lkdGhcIiksXG4gICAgICAgICAgICBsID0gdGhpcy5vcHRpb24oXCJoZWlnaHRcIiksXG4gICAgICAgICAgICBjID0gaCB8fCAoZCA9IHMsIE1hdGgubWF4KHBhcnNlRmxvYXQoZC5uYXR1cmFsV2lkdGggfHwgMCksIHBhcnNlRmxvYXQoZC53aWR0aCAmJiBkLndpZHRoLmJhc2VWYWwgJiYgZC53aWR0aC5iYXNlVmFsLnZhbHVlIHx8IDApLCBwYXJzZUZsb2F0KGQub2Zmc2V0V2lkdGggfHwgMCksIHBhcnNlRmxvYXQoZC5zY3JvbGxXaWR0aCB8fCAwKSkpO1xuICAgICAgICB2YXIgZDtcblxuICAgICAgICBsZXQgdSA9IGwgfHwgKHQgPT4gTWF0aC5tYXgocGFyc2VGbG9hdCh0Lm5hdHVyYWxIZWlnaHQgfHwgMCksIHBhcnNlRmxvYXQodC5oZWlnaHQgJiYgdC5oZWlnaHQuYmFzZVZhbCAmJiB0LmhlaWdodC5iYXNlVmFsLnZhbHVlIHx8IDApLCBwYXJzZUZsb2F0KHQub2Zmc2V0SGVpZ2h0IHx8IDApLCBwYXJzZUZsb2F0KHQuc2Nyb2xsSGVpZ2h0IHx8IDApKSkocyk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihzLnN0eWxlLCB7XG4gICAgICAgICAgd2lkdGg6IGggPyBgJHtofXB4YCA6IFwiXCIsXG4gICAgICAgICAgaGVpZ2h0OiBsID8gYCR7bH1weGAgOiBcIlwiLFxuICAgICAgICAgIG1heFdpZHRoOiBcIlwiLFxuICAgICAgICAgIG1heEhlaWdodDogXCJcIlxuICAgICAgICB9KSwgciAmJiBPYmplY3QuYXNzaWduKG8uc3R5bGUsIHtcbiAgICAgICAgICB3aWR0aDogXCJcIixcbiAgICAgICAgICBoZWlnaHQ6IFwiXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGYgPSB0aGlzLm9wdGlvbihcInJhdGlvXCIpO1xuICAgICAgICBjID0gaShjICogZiksIHUgPSBpKHUgKiBmKSwgaCA9IGMsIGwgPSB1O1xuICAgICAgICBjb25zdCBnID0gcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgcCA9IG8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgIG0gPSBvID09IGUgPyBwIDogZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHkgPSBNYXRoLm1heChvLm9mZnNldFdpZHRoLCBpKHAud2lkdGgpKSxcbiAgICAgICAgICAgIHYgPSBNYXRoLm1heChvLm9mZnNldEhlaWdodCwgaShwLmhlaWdodCkpLFxuICAgICAgICAgICAgYiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pO1xuXG4gICAgICAgIGlmICh5IC09IHBhcnNlRmxvYXQoYi5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KGIucGFkZGluZ1JpZ2h0KSwgdiAtPSBwYXJzZUZsb2F0KGIucGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KGIucGFkZGluZ0JvdHRvbSksIHRoaXMudmlld3BvcnQud2lkdGggPSB5LCB0aGlzLnZpZXdwb3J0LmhlaWdodCA9IHYsIGEpIHtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoYyAtIGcud2lkdGgpID4gLjEgfHwgTWF0aC5hYnModSAtIGcuaGVpZ2h0KSA+IC4xKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gKCh0LCBlLCBpLCBzKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IG8gPSBNYXRoLm1pbihpIC8gdCB8fCAwLCBzIC8gZSk7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHQgKiBvIHx8IDAsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBlICogbyB8fCAwXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KShjLCB1LCBNYXRoLm1pbihjLCBnLndpZHRoKSwgTWF0aC5taW4odSwgZy5oZWlnaHQpKTtcblxuICAgICAgICAgICAgaCA9IGkodC53aWR0aCksIGwgPSBpKHQuaGVpZ2h0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBPYmplY3QuYXNzaWduKHMuc3R5bGUsIHtcbiAgICAgICAgICAgIHdpZHRoOiBgJHtofXB4YCxcbiAgICAgICAgICAgIGhlaWdodDogYCR7bH1weGAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwiXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyICYmIChPYmplY3QuYXNzaWduKG8uc3R5bGUsIHtcbiAgICAgICAgICB3aWR0aDogYCR7aH1weGAsXG4gICAgICAgICAgaGVpZ2h0OiBgJHtsfXB4YFxuICAgICAgICB9KSwgdGhpcy52aWV3cG9ydCA9IHsgLi4udGhpcy52aWV3cG9ydCxcbiAgICAgICAgICB3aWR0aDogaCxcbiAgICAgICAgICBoZWlnaHQ6IGxcbiAgICAgICAgfSksIG4gJiYgYSAmJiBcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIHRoaXMub3B0aW9ucy5tYXhTY2FsZSkge1xuICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLm9wdGlvbihcIm1heFNjYWxlXCIpO1xuXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm1heFNjYWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudC5vcmlnV2lkdGggPiAwICYmIHRoaXMuY29udGVudC5maXRXaWR0aCA+IDAgPyB0aGlzLmNvbnRlbnQub3JpZ1dpZHRoIC8gdGhpcy5jb250ZW50LmZpdFdpZHRoIDogdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb250ZW50ID0geyAuLi50aGlzLmNvbnRlbnQsXG4gICAgICAgICAgb3JpZ1dpZHRoOiBjLFxuICAgICAgICAgIG9yaWdIZWlnaHQ6IHUsXG4gICAgICAgICAgZml0V2lkdGg6IGgsXG4gICAgICAgICAgZml0SGVpZ2h0OiBsLFxuICAgICAgICAgIHdpZHRoOiBoLFxuICAgICAgICAgIGhlaWdodDogbCxcbiAgICAgICAgICBzY2FsZTogMSxcbiAgICAgICAgICBpc1pvb21hYmxlOiBhXG4gICAgICAgIH0sIHRoaXMuY29udGFpbmVyID0ge1xuICAgICAgICAgIHdpZHRoOiBtLndpZHRoLFxuICAgICAgICAgIGhlaWdodDogbS5oZWlnaHRcbiAgICAgICAgfSwgITAgIT09IHQgJiYgdGhpcy50cmlnZ2VyKFwiYWZ0ZXJVcGRhdGVcIik7XG4gICAgICB9XG5cbiAgICAgIHpvb21Jbih0KSB7XG4gICAgICAgIHRoaXMuem9vbVRvKHRoaXMuY29udGVudC5zY2FsZSArICh0IHx8IHRoaXMub3B0aW9uKFwic3RlcFwiKSkpO1xuICAgICAgfVxuXG4gICAgICB6b29tT3V0KHQpIHtcbiAgICAgICAgdGhpcy56b29tVG8odGhpcy5jb250ZW50LnNjYWxlIC0gKHQgfHwgdGhpcy5vcHRpb24oXCJzdGVwXCIpKSk7XG4gICAgICB9XG5cbiAgICAgIHRvZ2dsZVpvb20odCA9IHt9KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLm9wdGlvbihcIm1heFNjYWxlXCIpLFxuICAgICAgICAgICAgICBpID0gdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIiksXG4gICAgICAgICAgICAgIHMgPSB0aGlzLmNvbnRlbnQuc2NhbGUgPiBpICsgLjUgKiAoZSAtIGkpID8gaSA6IGU7XG4gICAgICAgIHRoaXMuem9vbVRvKHMsIHQpO1xuICAgICAgfVxuXG4gICAgICB6b29tVG8odCA9IHRoaXMub3B0aW9uKFwiYmFzZVNjYWxlXCIpLCB7XG4gICAgICAgIHg6IGUgPSBudWxsLFxuICAgICAgICB5OiBzID0gbnVsbFxuICAgICAgfSA9IHt9KSB7XG4gICAgICAgIHQgPSBNYXRoLm1heChNYXRoLm1pbih0LCB0aGlzLm9wdGlvbihcIm1heFNjYWxlXCIpKSwgdGhpcy5vcHRpb24oXCJtaW5TY2FsZVwiKSk7XG4gICAgICAgIGNvbnN0IG8gPSBpKHRoaXMuY29udGVudC5zY2FsZSAvICh0aGlzLmNvbnRlbnQud2lkdGggLyB0aGlzLmNvbnRlbnQuZml0V2lkdGgpLCAxZTcpO1xuICAgICAgICBudWxsID09PSBlICYmIChlID0gdGhpcy5jb250ZW50LndpZHRoICogbyAqIC41KSwgbnVsbCA9PT0gcyAmJiAocyA9IHRoaXMuY29udGVudC5oZWlnaHQgKiBvICogLjUpO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgZGVsdGFYOiBuLFxuICAgICAgICAgIGRlbHRhWTogYVxuICAgICAgICB9ID0gdGhpcy5nZXRab29tRGVsdGEodCwgZSwgcyk7XG4gICAgICAgIGUgPSB0aGlzLmNvbnRlbnQueCAtIG4sIHMgPSB0aGlzLmNvbnRlbnQueSAtIGEsIHRoaXMucGFuVG8oe1xuICAgICAgICAgIHg6IGUsXG4gICAgICAgICAgeTogcyxcbiAgICAgICAgICBzY2FsZTogdCxcbiAgICAgICAgICBmcmljdGlvbjogdGhpcy5vcHRpb24oXCJ6b29tRnJpY3Rpb25cIilcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldFpvb21EZWx0YSh0LCBlID0gMCwgaSA9IDApIHtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuY29udGVudC5maXRXaWR0aCAqIHRoaXMuY29udGVudC5zY2FsZSxcbiAgICAgICAgICAgICAgbyA9IHRoaXMuY29udGVudC5maXRIZWlnaHQgKiB0aGlzLmNvbnRlbnQuc2NhbGUsXG4gICAgICAgICAgICAgIG4gPSBlID4gMCAmJiBzID8gZSAvIHMgOiAwLFxuICAgICAgICAgICAgICBhID0gaSA+IDAgJiYgbyA/IGkgLyBvIDogMDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBkZWx0YVg6ICh0aGlzLmNvbnRlbnQuZml0V2lkdGggKiB0IC0gcykgKiBuLFxuICAgICAgICAgIGRlbHRhWTogKHRoaXMuY29udGVudC5maXRIZWlnaHQgKiB0IC0gbykgKiBhXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHBhblRvKHtcbiAgICAgICAgeDogdCA9IHRoaXMuY29udGVudC54LFxuICAgICAgICB5OiBlID0gdGhpcy5jb250ZW50LnksXG4gICAgICAgIHNjYWxlOiBpLFxuICAgICAgICBmcmljdGlvbjogcyA9IHRoaXMub3B0aW9uKFwiZnJpY3Rpb25cIiksXG4gICAgICAgIGlnbm9yZUJvdW5kczogbyA9ICExXG4gICAgICB9ID0ge30pIHtcbiAgICAgICAgaWYgKGkgPSBpIHx8IHRoaXMuY29udGVudC5zY2FsZSB8fCAxLCAhbykge1xuICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIGJvdW5kWDogcyxcbiAgICAgICAgICAgIGJvdW5kWTogb1xuICAgICAgICAgIH0gPSB0aGlzLmdldEJvdW5kcyhpKTtcbiAgICAgICAgICBzICYmICh0ID0gTWF0aC5tYXgoTWF0aC5taW4odCwgcy50byksIHMuZnJvbSkpLCBvICYmIChlID0gTWF0aC5tYXgoTWF0aC5taW4oZSwgby50byksIG8uZnJvbSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IHMsIHRoaXMudHJhbnNmb3JtID0geyAuLi50aGlzLnRyYW5zZm9ybSxcbiAgICAgICAgICB4OiB0LFxuICAgICAgICAgIHk6IGUsXG4gICAgICAgICAgc2NhbGU6IGlcbiAgICAgICAgfSwgcyA/ICh0aGlzLnN0YXRlID0gXCJwYW5uaW5nXCIsIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgICAgICAgeDogKDEgLyB0aGlzLmZyaWN0aW9uIC0gMSkgKiAodCAtIHRoaXMuY29udGVudC54KSxcbiAgICAgICAgICB5OiAoMSAvIHRoaXMuZnJpY3Rpb24gLSAxKSAqIChlIC0gdGhpcy5jb250ZW50LnkpLFxuICAgICAgICAgIHNjYWxlOiAoMSAvIHRoaXMuZnJpY3Rpb24gLSAxKSAqIChpIC0gdGhpcy5jb250ZW50LnNjYWxlKVxuICAgICAgICB9LCB0aGlzLnN0YXJ0QW5pbWF0aW9uKCkpIDogdGhpcy5lbmRBbmltYXRpb24oKTtcbiAgICAgIH1cblxuICAgICAgc3RhcnRBbmltYXRpb24oKSB7XG4gICAgICAgIHRoaXMuckFGID8gY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yQUYpIDogdGhpcy50cmlnZ2VyKFwic3RhcnRBbmltYXRpb25cIiksIHRoaXMuckFGID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuYW5pbWF0ZSgpKTtcbiAgICAgIH1cblxuICAgICAgYW5pbWF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2V0RWRnZUZvcmNlKCksIHRoaXMuc2V0RHJhZ0ZvcmNlKCksIHRoaXMudmVsb2NpdHkueCAqPSB0aGlzLmZyaWN0aW9uLCB0aGlzLnZlbG9jaXR5LnkgKj0gdGhpcy5mcmljdGlvbiwgdGhpcy52ZWxvY2l0eS5zY2FsZSAqPSB0aGlzLmZyaWN0aW9uLCB0aGlzLmNvbnRlbnQueCArPSB0aGlzLnZlbG9jaXR5LngsIHRoaXMuY29udGVudC55ICs9IHRoaXMudmVsb2NpdHkueSwgdGhpcy5jb250ZW50LnNjYWxlICs9IHRoaXMudmVsb2NpdHkuc2NhbGUsIHRoaXMuaXNBbmltYXRpbmcoKSkgdGhpcy5zZXRUcmFuc2Zvcm0oKTtlbHNlIGlmIChcInBvaW50ZXJkb3duXCIgIT09IHRoaXMuc3RhdGUpIHJldHVybiB2b2lkIHRoaXMuZW5kQW5pbWF0aW9uKCk7XG4gICAgICAgIHRoaXMuckFGID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuYW5pbWF0ZSgpKTtcbiAgICAgIH1cblxuICAgICAgZ2V0Qm91bmRzKHQpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLmJvdW5kWCxcbiAgICAgICAgICAgIHMgPSB0aGlzLmJvdW5kWTtcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZSAmJiB2b2lkIDAgIT09IHMpIHJldHVybiB7XG4gICAgICAgICAgYm91bmRYOiBlLFxuICAgICAgICAgIGJvdW5kWTogc1xuICAgICAgICB9O1xuICAgICAgICBlID0ge1xuICAgICAgICAgIGZyb206IDAsXG4gICAgICAgICAgdG86IDBcbiAgICAgICAgfSwgcyA9IHtcbiAgICAgICAgICBmcm9tOiAwLFxuICAgICAgICAgIHRvOiAwXG4gICAgICAgIH0sIHQgPSB0IHx8IHRoaXMudHJhbnNmb3JtLnNjYWxlO1xuICAgICAgICBjb25zdCBvID0gdGhpcy5jb250ZW50LmZpdFdpZHRoICogdCxcbiAgICAgICAgICAgICAgbiA9IHRoaXMuY29udGVudC5maXRIZWlnaHQgKiB0LFxuICAgICAgICAgICAgICBhID0gdGhpcy52aWV3cG9ydC53aWR0aCxcbiAgICAgICAgICAgICAgciA9IHRoaXMudmlld3BvcnQuaGVpZ2h0O1xuXG4gICAgICAgIGlmIChvIDwgYSkge1xuICAgICAgICAgIGNvbnN0IHQgPSBpKC41ICogKGEgLSBvKSk7XG4gICAgICAgICAgZS5mcm9tID0gdCwgZS50byA9IHQ7XG4gICAgICAgIH0gZWxzZSBlLmZyb20gPSBpKGEgLSBvKTtcblxuICAgICAgICBpZiAobiA8IHIpIHtcbiAgICAgICAgICBjb25zdCB0ID0gLjUgKiAociAtIG4pO1xuICAgICAgICAgIHMuZnJvbSA9IHQsIHMudG8gPSB0O1xuICAgICAgICB9IGVsc2Ugcy5mcm9tID0gaShyIC0gbik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBib3VuZFg6IGUsXG4gICAgICAgICAgYm91bmRZOiBzXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHNldEVkZ2VGb3JjZSgpIHtcbiAgICAgICAgaWYgKFwiZGVjZWxcIiAhPT0gdGhpcy5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5vcHRpb24oXCJib3VuY2VGb3JjZVwiKSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgIGJvdW5kWDogZSxcbiAgICAgICAgICBib3VuZFk6IGlcbiAgICAgICAgfSA9IHRoaXMuZ2V0Qm91bmRzKE1hdGgubWF4KHRoaXMudHJhbnNmb3JtLnNjYWxlLCB0aGlzLmNvbnRlbnQuc2NhbGUpKTtcbiAgICAgICAgbGV0IHMsIG8sIG4sIGE7XG5cbiAgICAgICAgaWYgKGUgJiYgKHMgPSB0aGlzLmNvbnRlbnQueCA8IGUuZnJvbSwgbyA9IHRoaXMuY29udGVudC54ID4gZS50byksIGkgJiYgKG4gPSB0aGlzLmNvbnRlbnQueSA8IGkuZnJvbSwgYSA9IHRoaXMuY29udGVudC55ID4gaS50byksIHMgfHwgbykge1xuICAgICAgICAgIGxldCBpID0gKChzID8gZS5mcm9tIDogZS50bykgLSB0aGlzLmNvbnRlbnQueCkgKiB0O1xuICAgICAgICAgIGNvbnN0IG8gPSB0aGlzLmNvbnRlbnQueCArICh0aGlzLnZlbG9jaXR5LnggKyBpKSAvIHRoaXMuZnJpY3Rpb247XG4gICAgICAgICAgbyA+PSBlLmZyb20gJiYgbyA8PSBlLnRvICYmIChpICs9IHRoaXMudmVsb2NpdHkueCksIHRoaXMudmVsb2NpdHkueCA9IGksIHRoaXMucmVjYWxjdWxhdGVUcmFuc2Zvcm0oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuIHx8IGEpIHtcbiAgICAgICAgICBsZXQgZSA9ICgobiA/IGkuZnJvbSA6IGkudG8pIC0gdGhpcy5jb250ZW50LnkpICogdDtcbiAgICAgICAgICBjb25zdCBzID0gdGhpcy5jb250ZW50LnkgKyAoZSArIHRoaXMudmVsb2NpdHkueSkgLyB0aGlzLmZyaWN0aW9uO1xuICAgICAgICAgIHMgPj0gaS5mcm9tICYmIHMgPD0gaS50byAmJiAoZSArPSB0aGlzLnZlbG9jaXR5LnkpLCB0aGlzLnZlbG9jaXR5LnkgPSBlLCB0aGlzLnJlY2FsY3VsYXRlVHJhbnNmb3JtKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2V0RHJhZ1Jlc2lzdGFuY2UoKSB7XG4gICAgICAgIGlmIChcInBvaW50ZXJkb3duXCIgIT09IHRoaXMuc3RhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGJvdW5kWDogdCxcbiAgICAgICAgICBib3VuZFk6IGVcbiAgICAgICAgfSA9IHRoaXMuZ2V0Qm91bmRzKHRoaXMuZHJhZ1Bvc2l0aW9uLnNjYWxlKTtcbiAgICAgICAgbGV0IGksIHMsIG8sIG47XG5cbiAgICAgICAgaWYgKHQgJiYgKGkgPSB0aGlzLmRyYWdQb3NpdGlvbi54IDwgdC5mcm9tLCBzID0gdGhpcy5kcmFnUG9zaXRpb24ueCA+IHQudG8pLCBlICYmIChvID0gdGhpcy5kcmFnUG9zaXRpb24ueSA8IGUuZnJvbSwgbiA9IHRoaXMuZHJhZ1Bvc2l0aW9uLnkgPiBlLnRvKSwgKGkgfHwgcykgJiYgKCFpIHx8ICFzKSkge1xuICAgICAgICAgIGNvbnN0IGUgPSBpID8gdC5mcm9tIDogdC50byxcbiAgICAgICAgICAgICAgICBzID0gZSAtIHRoaXMuZHJhZ1Bvc2l0aW9uLng7XG4gICAgICAgICAgdGhpcy5kcmFnUG9zaXRpb24ueCA9IGUgLSAuMyAqIHM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKG8gfHwgbikgJiYgKCFvIHx8ICFuKSkge1xuICAgICAgICAgIGNvbnN0IHQgPSBvID8gZS5mcm9tIDogZS50byxcbiAgICAgICAgICAgICAgICBpID0gdCAtIHRoaXMuZHJhZ1Bvc2l0aW9uLnk7XG4gICAgICAgICAgdGhpcy5kcmFnUG9zaXRpb24ueSA9IHQgLSAuMyAqIGk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2V0RHJhZ0ZvcmNlKCkge1xuICAgICAgICBcInBvaW50ZXJkb3duXCIgPT09IHRoaXMuc3RhdGUgJiYgKHRoaXMudmVsb2NpdHkueCA9IHRoaXMuZHJhZ1Bvc2l0aW9uLnggLSB0aGlzLmNvbnRlbnQueCwgdGhpcy52ZWxvY2l0eS55ID0gdGhpcy5kcmFnUG9zaXRpb24ueSAtIHRoaXMuY29udGVudC55LCB0aGlzLnZlbG9jaXR5LnNjYWxlID0gdGhpcy5kcmFnUG9zaXRpb24uc2NhbGUgLSB0aGlzLmNvbnRlbnQuc2NhbGUpO1xuICAgICAgfVxuXG4gICAgICByZWNhbGN1bGF0ZVRyYW5zZm9ybSgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0ueCA9IHRoaXMuY29udGVudC54ICsgdGhpcy52ZWxvY2l0eS54IC8gKDEgLyB0aGlzLmZyaWN0aW9uIC0gMSksIHRoaXMudHJhbnNmb3JtLnkgPSB0aGlzLmNvbnRlbnQueSArIHRoaXMudmVsb2NpdHkueSAvICgxIC8gdGhpcy5mcmljdGlvbiAtIDEpLCB0aGlzLnRyYW5zZm9ybS5zY2FsZSA9IHRoaXMuY29udGVudC5zY2FsZSArIHRoaXMudmVsb2NpdHkuc2NhbGUgLyAoMSAvIHRoaXMuZnJpY3Rpb24gLSAxKTtcbiAgICAgIH1cblxuICAgICAgaXNBbmltYXRpbmcoKSB7XG4gICAgICAgIHJldHVybiAhKCF0aGlzLmZyaWN0aW9uIHx8ICEoTWF0aC5hYnModGhpcy52ZWxvY2l0eS54KSA+IC4wNSB8fCBNYXRoLmFicyh0aGlzLnZlbG9jaXR5LnkpID4gLjA1IHx8IE1hdGguYWJzKHRoaXMudmVsb2NpdHkuc2NhbGUpID4gLjA1KSk7XG4gICAgICB9XG5cbiAgICAgIHNldFRyYW5zZm9ybSh0KSB7XG4gICAgICAgIGxldCBlLCBzLCBvO1xuXG4gICAgICAgIGlmICh0ID8gKGUgPSBpKHRoaXMudHJhbnNmb3JtLngpLCBzID0gaSh0aGlzLnRyYW5zZm9ybS55KSwgbyA9IHRoaXMudHJhbnNmb3JtLnNjYWxlLCB0aGlzLmNvbnRlbnQgPSB7IC4uLnRoaXMuY29udGVudCxcbiAgICAgICAgICB4OiBlLFxuICAgICAgICAgIHk6IHMsXG4gICAgICAgICAgc2NhbGU6IG9cbiAgICAgICAgfSkgOiAoZSA9IGkodGhpcy5jb250ZW50LngpLCBzID0gaSh0aGlzLmNvbnRlbnQueSksIG8gPSB0aGlzLmNvbnRlbnQuc2NhbGUgLyAodGhpcy5jb250ZW50LndpZHRoIC8gdGhpcy5jb250ZW50LmZpdFdpZHRoKSwgdGhpcy5jb250ZW50ID0geyAuLi50aGlzLmNvbnRlbnQsXG4gICAgICAgICAgeDogZSxcbiAgICAgICAgICB5OiBzXG4gICAgICAgIH0pLCB0aGlzLnRyaWdnZXIoXCJiZWZvcmVUcmFuc2Zvcm1cIiksIGUgPSBpKHRoaXMuY29udGVudC54KSwgcyA9IGkodGhpcy5jb250ZW50LnkpLCB0ICYmIHRoaXMub3B0aW9uKFwiem9vbVwiKSkge1xuICAgICAgICAgIGxldCB0LCBuO1xuICAgICAgICAgIHQgPSBpKHRoaXMuY29udGVudC5maXRXaWR0aCAqIG8pLCBuID0gaSh0aGlzLmNvbnRlbnQuZml0SGVpZ2h0ICogbyksIHRoaXMuY29udGVudC53aWR0aCA9IHQsIHRoaXMuY29udGVudC5oZWlnaHQgPSBuLCB0aGlzLnRyYW5zZm9ybSA9IHsgLi4udGhpcy50cmFuc2Zvcm0sXG4gICAgICAgICAgICB3aWR0aDogdCxcbiAgICAgICAgICAgIGhlaWdodDogbixcbiAgICAgICAgICAgIHNjYWxlOiBvXG4gICAgICAgICAgfSwgT2JqZWN0LmFzc2lnbih0aGlzLiRjb250ZW50LnN0eWxlLCB7XG4gICAgICAgICAgICB3aWR0aDogYCR7dH1weGAsXG4gICAgICAgICAgICBoZWlnaHQ6IGAke259cHhgLFxuICAgICAgICAgICAgbWF4V2lkdGg6IFwibm9uZVwiLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiBcIm5vbmVcIixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZTNkKCR7ZX1weCwgJHtzfXB4LCAwKSBzY2FsZSgxKWBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHRoaXMuJGNvbnRlbnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZTNkKCR7ZX1weCwgJHtzfXB4LCAwKSBzY2FsZSgke299KWA7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKFwiYWZ0ZXJUcmFuc2Zvcm1cIik7XG4gICAgICB9XG5cbiAgICAgIGVuZEFuaW1hdGlvbih0KSB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuckFGKSwgdGhpcy5yQUYgPSBudWxsLCB0aGlzLnZlbG9jaXR5ID0ge1xuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBzY2FsZTogMFxuICAgICAgICB9LCB0aGlzLnNldFRyYW5zZm9ybSghMCksIHRoaXMuc3RhdGUgPSBcInJlYWR5XCIsIHRoaXMuaGFuZGxlQ3Vyc29yKCksICEwICE9PSB0ICYmIHRoaXMudHJpZ2dlcihcImVuZEFuaW1hdGlvblwiKTtcbiAgICAgIH1cblxuICAgICAgaGFuZGxlQ3Vyc29yKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5vcHRpb24oXCJkcmFnZ2FibGVDbGFzc1wiKTtcbiAgICAgICAgdCAmJiB0aGlzLm9wdGlvbihcInRvdWNoXCIpICYmICgxID09IHRoaXMub3B0aW9uKFwicGFuT25seVpvb21lZFwiKSAmJiB0aGlzLmNvbnRlbnQud2lkdGggPD0gdGhpcy52aWV3cG9ydC53aWR0aCAmJiB0aGlzLmNvbnRlbnQuaGVpZ2h0IDw9IHRoaXMudmlld3BvcnQuaGVpZ2h0ICYmIHRoaXMudHJhbnNmb3JtLnNjYWxlIDw9IHRoaXMub3B0aW9uKFwiYmFzZVNjYWxlXCIpID8gdGhpcy4kY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUodCkgOiB0aGlzLiRjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0KSk7XG4gICAgICB9XG5cbiAgICAgIGRldGFjaEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy4kY29udGVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCB0aGlzLm9uTG9hZCksIHRoaXMuJGNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgdGhpcy5vbldoZWVsLCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHRoaXMuJGNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5vbkNsaWNrLCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHRoaXMucG9pbnRlclRyYWNrZXIgJiYgKHRoaXMucG9pbnRlclRyYWNrZXIuc3RvcCgpLCB0aGlzLnBvaW50ZXJUcmFja2VyID0gbnVsbCksIHRoaXMucmVzaXplT2JzZXJ2ZXIgJiYgKHRoaXMucmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpLCB0aGlzLnJlc2l6ZU9ic2VydmVyID0gbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIFwiZGVzdHJveVwiICE9PSB0aGlzLnN0YXRlICYmICh0aGlzLnN0YXRlID0gXCJkZXN0cm95XCIsIGNsZWFyVGltZW91dCh0aGlzLnVwZGF0ZVRpbWVyKSwgdGhpcy51cGRhdGVUaW1lciA9IG51bGwsIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuckFGKSwgdGhpcy5yQUYgPSBudWxsLCB0aGlzLmRldGFjaEV2ZW50cygpLCB0aGlzLmRldGFjaFBsdWdpbnMoKSwgdGhpcy5yZXNldERyYWdQb3NpdGlvbigpKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGQudmVyc2lvbiA9IFwiNC4wLjMxXCIsIGQuUGx1Z2lucyA9IHt9O1xuXG4gICAgY29uc3QgdSA9ICh0LCBlKSA9PiB7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLnMpIHtcbiAgICAgICAgY29uc3QgbyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICBpZiAoIShvIC0gaSA8IGUpKSByZXR1cm4gaSA9IG8sIHQoLi4ucyk7XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjbGFzcyBmIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gbnVsbCwgdGhpcy4kcHJldiA9IG51bGwsIHRoaXMuJG5leHQgPSBudWxsLCB0aGlzLmNhcm91c2VsID0gdCwgdGhpcy5vblJlZnJlc2ggPSB0aGlzLm9uUmVmcmVzaC5iaW5kKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb24odCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYXJvdXNlbC5vcHRpb24oYE5hdmlnYXRpb24uJHt0fWApO1xuICAgICAgfVxuXG4gICAgICBjcmVhdGVCdXR0b24odCkge1xuICAgICAgICBjb25zdCBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgZS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCB0aGlzLmNhcm91c2VsLmxvY2FsaXplKGB7eyR7dC50b1VwcGVyQ2FzZSgpfX19YCkpO1xuICAgICAgICBjb25zdCBpID0gdGhpcy5vcHRpb24oXCJjbGFzc05hbWVzLmJ1dHRvblwiKSArIFwiIFwiICsgdGhpcy5vcHRpb24oYGNsYXNzTmFtZXMuJHt0fWApO1xuICAgICAgICByZXR1cm4gZS5jbGFzc0xpc3QuYWRkKC4uLmkuc3BsaXQoXCIgXCIpKSwgZS5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIjBcIiksIGUuaW5uZXJIVE1MID0gdGhpcy5jYXJvdXNlbC5sb2NhbGl6ZSh0aGlzLm9wdGlvbihgJHt0fVRwbGApKSwgZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpLCBlLnN0b3BQcm9wYWdhdGlvbigpLCB0aGlzLmNhcm91c2VsW1wic2xpZGVcIiArIChcIm5leHRcIiA9PT0gdCA/IFwiTmV4dFwiIDogXCJQcmV2XCIpXSgpO1xuICAgICAgICB9KSwgZTtcbiAgICAgIH1cblxuICAgICAgYnVpbGQoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciB8fCAodGhpcy4kY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgdGhpcy4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoLi4udGhpcy5vcHRpb24oXCJjbGFzc05hbWVzLm1haW5cIikuc3BsaXQoXCIgXCIpKSwgdGhpcy5jYXJvdXNlbC4kY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuJGNvbnRhaW5lcikpLCB0aGlzLiRuZXh0IHx8ICh0aGlzLiRuZXh0ID0gdGhpcy5jcmVhdGVCdXR0b24oXCJuZXh0XCIpLCB0aGlzLiRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy4kbmV4dCkpLCB0aGlzLiRwcmV2IHx8ICh0aGlzLiRwcmV2ID0gdGhpcy5jcmVhdGVCdXR0b24oXCJwcmV2XCIpLCB0aGlzLiRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy4kcHJldikpO1xuICAgICAgfVxuXG4gICAgICBvblJlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmNhcm91c2VsLnBhZ2VzLmxlbmd0aDtcbiAgICAgICAgdCA8PSAxIHx8IHQgPiAxICYmIHRoaXMuY2Fyb3VzZWwuZWxlbURpbVdpZHRoIDwgdGhpcy5jYXJvdXNlbC53cmFwRGltV2lkdGggJiYgIU51bWJlci5pc0ludGVnZXIodGhpcy5jYXJvdXNlbC5vcHRpb24oXCJzbGlkZXNQZXJQYWdlXCIpKSA/IHRoaXMuY2xlYW51cCgpIDogKHRoaXMuYnVpbGQoKSwgdGhpcy4kcHJldi5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSwgdGhpcy4kbmV4dC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSwgdGhpcy5jYXJvdXNlbC5vcHRpb24oXCJpbmZpbml0ZVhcIiwgdGhpcy5jYXJvdXNlbC5vcHRpb24oXCJpbmZpbml0ZVwiKSkgfHwgKHRoaXMuY2Fyb3VzZWwucGFnZSA8PSAwICYmIHRoaXMuJHByZXYuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJcIiksIHRoaXMuY2Fyb3VzZWwucGFnZSA+PSB0IC0gMSAmJiB0aGlzLiRuZXh0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiXCIpKSk7XG4gICAgICB9XG5cbiAgICAgIGNsZWFudXAoKSB7XG4gICAgICAgIHRoaXMuJHByZXYgJiYgdGhpcy4kcHJldi5yZW1vdmUoKSwgdGhpcy4kcHJldiA9IG51bGwsIHRoaXMuJG5leHQgJiYgdGhpcy4kbmV4dC5yZW1vdmUoKSwgdGhpcy4kbmV4dCA9IG51bGwsIHRoaXMuJGNvbnRhaW5lciAmJiB0aGlzLiRjb250YWluZXIucmVtb3ZlKCksIHRoaXMuJGNvbnRhaW5lciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGF0dGFjaCgpIHtcbiAgICAgICAgdGhpcy5jYXJvdXNlbC5vbihcInJlZnJlc2ggY2hhbmdlXCIsIHRoaXMub25SZWZyZXNoKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKCkge1xuICAgICAgICB0aGlzLmNhcm91c2VsLm9mZihcInJlZnJlc2ggY2hhbmdlXCIsIHRoaXMub25SZWZyZXNoKSwgdGhpcy5jbGVhbnVwKCk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBmLmRlZmF1bHRzID0ge1xuICAgICAgcHJldlRwbDogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB0YWJpbmRleD1cIi0xXCI+PHBhdGggZD1cIk0xNSAzbC05IDkgOSA5XCIvPjwvc3ZnPicsXG4gICAgICBuZXh0VHBsOiAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHRhYmluZGV4PVwiLTFcIj48cGF0aCBkPVwiTTkgM2w5IDktOSA5XCIvPjwvc3ZnPicsXG4gICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgIG1haW46IFwiY2Fyb3VzZWxfX25hdlwiLFxuICAgICAgICBidXR0b246IFwiY2Fyb3VzZWxfX2J1dHRvblwiLFxuICAgICAgICBuZXh0OiBcImlzLW5leHRcIixcbiAgICAgICAgcHJldjogXCJpcy1wcmV2XCJcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY2xhc3MgZyB7XG4gICAgICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgICAgIHRoaXMuY2Fyb3VzZWwgPSB0LCB0aGlzLnNlbGVjdGVkSW5kZXggPSBudWxsLCB0aGlzLmZyaWN0aW9uID0gMCwgdGhpcy5vbk5hdlJlYWR5ID0gdGhpcy5vbk5hdlJlYWR5LmJpbmQodGhpcyksIHRoaXMub25OYXZDbGljayA9IHRoaXMub25OYXZDbGljay5iaW5kKHRoaXMpLCB0aGlzLm9uTmF2Q3JlYXRlU2xpZGUgPSB0aGlzLm9uTmF2Q3JlYXRlU2xpZGUuYmluZCh0aGlzKSwgdGhpcy5vblRhcmdldENoYW5nZSA9IHRoaXMub25UYXJnZXRDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgYWRkQXNUYXJnZXRGb3IodCkge1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMuY2Fyb3VzZWwsIHRoaXMubmF2ID0gdCwgdGhpcy5hdHRhY2hFdmVudHMoKTtcbiAgICAgIH1cblxuICAgICAgYWRkQXNOYXZGb3IodCkge1xuICAgICAgICB0aGlzLnRhcmdldCA9IHQsIHRoaXMubmF2ID0gdGhpcy5jYXJvdXNlbCwgdGhpcy5hdHRhY2hFdmVudHMoKTtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoRXZlbnRzKCkge1xuICAgICAgICB0aGlzLm5hdi5vcHRpb25zLmluaXRpYWxTbGlkZSA9IHRoaXMudGFyZ2V0Lm9wdGlvbnMuaW5pdGlhbFBhZ2UsIHRoaXMubmF2Lm9uKFwicmVhZHlcIiwgdGhpcy5vbk5hdlJlYWR5KSwgdGhpcy5uYXYub24oXCJjcmVhdGVTbGlkZVwiLCB0aGlzLm9uTmF2Q3JlYXRlU2xpZGUpLCB0aGlzLm5hdi5vbihcIlBhbnpvb20uY2xpY2tcIiwgdGhpcy5vbk5hdkNsaWNrKSwgdGhpcy50YXJnZXQub24oXCJjaGFuZ2VcIiwgdGhpcy5vblRhcmdldENoYW5nZSksIHRoaXMudGFyZ2V0Lm9uKFwiUGFuem9vbS5hZnRlclVwZGF0ZVwiLCB0aGlzLm9uVGFyZ2V0Q2hhbmdlKTtcbiAgICAgIH1cblxuICAgICAgb25OYXZSZWFkeSgpIHtcbiAgICAgICAgdGhpcy5vblRhcmdldENoYW5nZSghMCk7XG4gICAgICB9XG5cbiAgICAgIG9uTmF2Q2xpY2sodCwgZSwgaSkge1xuICAgICAgICBjb25zdCBzID0gaS50YXJnZXQuY2xvc2VzdChcIi5jYXJvdXNlbF9fc2xpZGVcIik7XG4gICAgICAgIGlmICghcykgcmV0dXJuO1xuICAgICAgICBpLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCBvID0gcGFyc2VJbnQocy5kYXRhc2V0LmluZGV4LCAxMCksXG4gICAgICAgICAgICAgIG4gPSB0aGlzLnRhcmdldC5maW5kUGFnZUZvclNsaWRlKG8pO1xuICAgICAgICB0aGlzLnRhcmdldC5wYWdlICE9PSBuICYmIHRoaXMudGFyZ2V0LnNsaWRlVG8obiwge1xuICAgICAgICAgIGZyaWN0aW9uOiB0aGlzLmZyaWN0aW9uXG4gICAgICAgIH0pLCB0aGlzLm1hcmtTZWxlY3RlZFNsaWRlKG8pO1xuICAgICAgfVxuXG4gICAgICBvbk5hdkNyZWF0ZVNsaWRlKHQsIGUpIHtcbiAgICAgICAgZS5pbmRleCA9PT0gdGhpcy5zZWxlY3RlZEluZGV4ICYmIHRoaXMubWFya1NlbGVjdGVkU2xpZGUoZS5pbmRleCk7XG4gICAgICB9XG5cbiAgICAgIG9uVGFyZ2V0Q2hhbmdlKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy50YXJnZXQucGFnZXNbdGhpcy50YXJnZXQucGFnZV0uaW5kZXhlc1swXSxcbiAgICAgICAgICAgICAgZSA9IHRoaXMubmF2LmZpbmRQYWdlRm9yU2xpZGUodCk7XG4gICAgICAgIHRoaXMubmF2LnNsaWRlVG8oZSksIHRoaXMubWFya1NlbGVjdGVkU2xpZGUodCk7XG4gICAgICB9XG5cbiAgICAgIG1hcmtTZWxlY3RlZFNsaWRlKHQpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdCwgWy4uLnRoaXMubmF2LnNsaWRlc10uZmlsdGVyKHQgPT4gdC4kZWwgJiYgdC4kZWwuY2xhc3NMaXN0LnJlbW92ZShcImlzLW5hdi1zZWxlY3RlZFwiKSk7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLm5hdi5zbGlkZXNbdF07XG4gICAgICAgIGUgJiYgZS4kZWwgJiYgZS4kZWwuY2xhc3NMaXN0LmFkZChcImlzLW5hdi1zZWxlY3RlZFwiKTtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHQub3B0aW9ucy5TeW5jO1xuICAgICAgICAoZS50YXJnZXQgfHwgZS5uYXYpICYmIChlLnRhcmdldCA/IHRoaXMuYWRkQXNOYXZGb3IoZS50YXJnZXQpIDogZS5uYXYgJiYgdGhpcy5hZGRBc1RhcmdldEZvcihlLm5hdiksIHRoaXMuZnJpY3Rpb24gPSBlLmZyaWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKCkge1xuICAgICAgICB0aGlzLm5hdiAmJiAodGhpcy5uYXYub2ZmKFwicmVhZHlcIiwgdGhpcy5vbk5hdlJlYWR5KSwgdGhpcy5uYXYub2ZmKFwiUGFuem9vbS5jbGlja1wiLCB0aGlzLm9uTmF2Q2xpY2spLCB0aGlzLm5hdi5vZmYoXCJjcmVhdGVTbGlkZVwiLCB0aGlzLm9uTmF2Q3JlYXRlU2xpZGUpKSwgdGhpcy50YXJnZXQgJiYgKHRoaXMudGFyZ2V0Lm9mZihcIlBhbnpvb20uYWZ0ZXJVcGRhdGVcIiwgdGhpcy5vblRhcmdldENoYW5nZSksIHRoaXMudGFyZ2V0Lm9mZihcImNoYW5nZVwiLCB0aGlzLm9uVGFyZ2V0Q2hhbmdlKSk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBnLmRlZmF1bHRzID0ge1xuICAgICAgZnJpY3Rpb246IC45MlxuICAgIH07XG4gICAgY29uc3QgcCA9IHtcbiAgICAgIE5hdmlnYXRpb246IGYsXG4gICAgICBEb3RzOiBjbGFzcyB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgICB0aGlzLmNhcm91c2VsID0gdCwgdGhpcy4kbGlzdCA9IG51bGwsIHRoaXMuZXZlbnRzID0ge1xuICAgICAgICAgICAgY2hhbmdlOiB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICByZWZyZXNoOiB0aGlzLm9uUmVmcmVzaC5iaW5kKHRoaXMpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJ1aWxkTGlzdCgpIHtcbiAgICAgICAgICBpZiAodGhpcy5jYXJvdXNlbC5wYWdlcy5sZW5ndGggPCB0aGlzLmNhcm91c2VsLm9wdGlvbihcIkRvdHMubWluU2xpZGVDb3VudFwiKSkgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIik7XG4gICAgICAgICAgcmV0dXJuIHQuY2xhc3NMaXN0LmFkZChcImNhcm91c2VsX19kb3RzXCIpLCB0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0ID0+IHtcbiAgICAgICAgICAgIGlmICghKFwicGFnZVwiIGluIHQudGFyZ2V0LmRhdGFzZXQpKSByZXR1cm47XG4gICAgICAgICAgICB0LnByZXZlbnREZWZhdWx0KCksIHQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBlID0gcGFyc2VJbnQodC50YXJnZXQuZGF0YXNldC5wYWdlLCAxMCksXG4gICAgICAgICAgICAgICAgICBpID0gdGhpcy5jYXJvdXNlbDtcbiAgICAgICAgICAgIGUgIT09IGkucGFnZSAmJiAoaS5wYWdlcy5sZW5ndGggPCAzICYmIGkub3B0aW9uKFwiaW5maW5pdGVcIikgPyBpWzAgPT0gZSA/IFwic2xpZGVQcmV2XCIgOiBcInNsaWRlTmV4dFwiXSgpIDogaS5zbGlkZVRvKGUpKTtcbiAgICAgICAgICB9KSwgdGhpcy4kbGlzdCA9IHQsIHRoaXMuY2Fyb3VzZWwuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0KSwgdGhpcy5jYXJvdXNlbC4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoYXMtZG90c1wiKSwgdDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZUxpc3QoKSB7XG4gICAgICAgICAgdGhpcy4kbGlzdCAmJiAodGhpcy4kbGlzdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuJGxpc3QpLCB0aGlzLiRsaXN0ID0gbnVsbCksIHRoaXMuY2Fyb3VzZWwuJGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGFzLWRvdHNcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZWJ1aWxkRG90cygpIHtcbiAgICAgICAgICBsZXQgdCA9IHRoaXMuJGxpc3Q7XG4gICAgICAgICAgY29uc3QgZSA9ICEhdCxcbiAgICAgICAgICAgICAgICBpID0gdGhpcy5jYXJvdXNlbC5wYWdlcy5sZW5ndGg7XG4gICAgICAgICAgaWYgKGkgPCAyKSByZXR1cm4gdm9pZCAoZSAmJiB0aGlzLnJlbW92ZUxpc3QoKSk7XG4gICAgICAgICAgZSB8fCAodCA9IHRoaXMuYnVpbGRMaXN0KCkpO1xuICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLiRsaXN0LmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgICBpZiAocyA+IGkpIGZvciAobGV0IHQgPSBpOyB0IDwgczsgdCsrKSB0aGlzLiRsaXN0LnJlbW92ZUNoaWxkKHRoaXMuJGxpc3QubGFzdENoaWxkKTtlbHNlIHtcbiAgICAgICAgICAgIGZvciAobGV0IHQgPSBzOyB0IDwgaTsgdCsrKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZChcImNhcm91c2VsX19kb3RcIiksIGUuZGF0YXNldC5wYWdlID0gdCwgZS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwiYnV0dG9uXCIpLCBlLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiMFwiKSwgZS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCB0aGlzLmNhcm91c2VsLmxvY2FsaXplKFwie3tHT1RPfX1cIiwgW1tcIiVkXCIsIHQgKyAxXV0pKSwgZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpID0gdC5jb2RlO1xuICAgICAgICAgICAgICAgIGxldCBzO1xuICAgICAgICAgICAgICAgIFwiRW50ZXJcIiA9PT0gaSB8fCBcIk51bXBhZEVudGVyXCIgPT09IGkgPyBzID0gZSA6IFwiQXJyb3dSaWdodFwiID09PSBpID8gcyA9IGUubmV4dFNpYmxpbmcgOiBcIkFycm93TGVmdFwiID09PSBpICYmIChzID0gZS5wcmV2aW91c1NpYmxpbmcpLCBzICYmIHMuY2xpY2soKTtcbiAgICAgICAgICAgICAgfSksIHRoaXMuJGxpc3QuYXBwZW5kQ2hpbGQoZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRG90KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2V0QWN0aXZlRG90KCkge1xuICAgICAgICAgIGlmICghdGhpcy4kbGlzdCkgcmV0dXJuO1xuICAgICAgICAgIHRoaXMuJGxpc3QuY2hpbGROb2Rlcy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgdC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtc2VsZWN0ZWRcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgdCA9IHRoaXMuJGxpc3QuY2hpbGROb2Rlc1t0aGlzLmNhcm91c2VsLnBhZ2VdO1xuICAgICAgICAgIHQgJiYgdC5jbGFzc0xpc3QuYWRkKFwiaXMtc2VsZWN0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgICB0aGlzLnNldEFjdGl2ZURvdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgb25SZWZyZXNoKCkge1xuICAgICAgICAgIHRoaXMucmVidWlsZERvdHMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGF0dGFjaCgpIHtcbiAgICAgICAgICB0aGlzLmNhcm91c2VsLm9uKHRoaXMuZXZlbnRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRldGFjaCgpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3QoKSwgdGhpcy5jYXJvdXNlbC5vZmYodGhpcy5ldmVudHMpLCB0aGlzLmNhcm91c2VsID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgU3luYzogZ1xuICAgIH07XG4gICAgY29uc3QgbSA9IHtcbiAgICAgIHNsaWRlczogW10sXG4gICAgICBwcmVsb2FkOiAwLFxuICAgICAgc2xpZGVzUGVyUGFnZTogXCJhdXRvXCIsXG4gICAgICBpbml0aWFsUGFnZTogbnVsbCxcbiAgICAgIGluaXRpYWxTbGlkZTogbnVsbCxcbiAgICAgIGZyaWN0aW9uOiAuOTIsXG4gICAgICBjZW50ZXI6ICEwLFxuICAgICAgaW5maW5pdGU6ICEwLFxuICAgICAgZmlsbDogITAsXG4gICAgICBkcmFnRnJlZTogITEsXG4gICAgICBwcmVmaXg6IFwiXCIsXG4gICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgIHZpZXdwb3J0OiBcImNhcm91c2VsX192aWV3cG9ydFwiLFxuICAgICAgICB0cmFjazogXCJjYXJvdXNlbF9fdHJhY2tcIixcbiAgICAgICAgc2xpZGU6IFwiY2Fyb3VzZWxfX3NsaWRlXCIsXG4gICAgICAgIHNsaWRlU2VsZWN0ZWQ6IFwiaXMtc2VsZWN0ZWRcIlxuICAgICAgfSxcbiAgICAgIGwxMG46IHtcbiAgICAgICAgTkVYVDogXCJOZXh0IHNsaWRlXCIsXG4gICAgICAgIFBSRVY6IFwiUHJldmlvdXMgc2xpZGVcIixcbiAgICAgICAgR09UTzogXCJHbyB0byBzbGlkZSAjJWRcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICBjbGFzcyB5IGV4dGVuZHMgbCB7XG4gICAgICBjb25zdHJ1Y3Rvcih0LCBpID0ge30pIHtcbiAgICAgICAgaWYgKHN1cGVyKGkgPSBlKCEwLCB7fSwgbSwgaSkpLCB0aGlzLnN0YXRlID0gXCJpbml0XCIsIHRoaXMuJGNvbnRhaW5lciA9IHQsICEodGhpcy4kY29udGFpbmVyIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB0aHJvdyBuZXcgRXJyb3IoXCJObyByb290IGVsZW1lbnQgcHJvdmlkZWRcIik7XG4gICAgICAgIHRoaXMuc2xpZGVOZXh0ID0gdSh0aGlzLnNsaWRlTmV4dC5iaW5kKHRoaXMpLCAyNTApLCB0aGlzLnNsaWRlUHJldiA9IHUodGhpcy5zbGlkZVByZXYuYmluZCh0aGlzKSwgMjUwKSwgdGhpcy5pbml0KCksIHQuX19DYXJvdXNlbCA9IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMucGFnZXMgPSBbXSwgdGhpcy5wYWdlID0gdGhpcy5wYWdlSW5kZXggPSBudWxsLCB0aGlzLnByZXZQYWdlID0gdGhpcy5wcmV2UGFnZUluZGV4ID0gbnVsbCwgdGhpcy5hdHRhY2hQbHVnaW5zKHkuUGx1Z2lucyksIHRoaXMudHJpZ2dlcihcImluaXRcIiksIHRoaXMuaW5pdExheW91dCgpLCB0aGlzLmluaXRTbGlkZXMoKSwgdGhpcy51cGRhdGVNZXRyaWNzKCksIHRoaXMuJHRyYWNrICYmIHRoaXMucGFnZXMubGVuZ3RoICYmICh0aGlzLiR0cmFjay5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoJHstMSAqIHRoaXMucGFnZXNbdGhpcy5wYWdlXS5sZWZ0fXB4LCAwcHgsIDApIHNjYWxlKDEpYCksIHRoaXMubWFuYWdlU2xpZGVWaXNpYmxpdHkoKSwgdGhpcy5pbml0UGFuem9vbSgpLCB0aGlzLnN0YXRlID0gXCJyZWFkeVwiLCB0aGlzLnRyaWdnZXIoXCJyZWFkeVwiKTtcbiAgICAgIH1cblxuICAgICAgaW5pdExheW91dCgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMub3B0aW9uKFwicHJlZml4XCIpLFxuICAgICAgICAgICAgICBlID0gdGhpcy5vcHRpb24oXCJjbGFzc05hbWVzXCIpO1xuICAgICAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMub3B0aW9uKFwidmlld3BvcnRcIikgfHwgdGhpcy4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYC4ke3R9JHtlLnZpZXdwb3J0fWApLCB0aGlzLiR2aWV3cG9ydCB8fCAodGhpcy4kdmlld3BvcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCB0aGlzLiR2aWV3cG9ydC5jbGFzc0xpc3QuYWRkKC4uLih0ICsgZS52aWV3cG9ydCkuc3BsaXQoXCIgXCIpKSwgdGhpcy4kdmlld3BvcnQuYXBwZW5kKC4uLnRoaXMuJGNvbnRhaW5lci5jaGlsZE5vZGVzKSwgdGhpcy4kY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuJHZpZXdwb3J0KSksIHRoaXMuJHRyYWNrID0gdGhpcy5vcHRpb24oXCJ0cmFja1wiKSB8fCB0aGlzLiRjb250YWluZXIucXVlcnlTZWxlY3RvcihgLiR7dH0ke2UudHJhY2t9YCksIHRoaXMuJHRyYWNrIHx8ICh0aGlzLiR0cmFjayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHRoaXMuJHRyYWNrLmNsYXNzTGlzdC5hZGQoLi4uKHQgKyBlLnRyYWNrKS5zcGxpdChcIiBcIikpLCB0aGlzLiR0cmFjay5hcHBlbmQoLi4udGhpcy4kdmlld3BvcnQuY2hpbGROb2RlcyksIHRoaXMuJHZpZXdwb3J0LmFwcGVuZENoaWxkKHRoaXMuJHRyYWNrKSk7XG4gICAgICB9XG5cbiAgICAgIGluaXRTbGlkZXMoKSB7XG4gICAgICAgIHRoaXMuc2xpZGVzID0gW107XG4gICAgICAgIHRoaXMuJHZpZXdwb3J0LnF1ZXJ5U2VsZWN0b3JBbGwoYC4ke3RoaXMub3B0aW9uKFwicHJlZml4XCIpfSR7dGhpcy5vcHRpb24oXCJjbGFzc05hbWVzLnNsaWRlXCIpfWApLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgY29uc3QgZSA9IHtcbiAgICAgICAgICAgICRlbDogdCxcbiAgICAgICAgICAgIGlzRG9tOiAhMFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5zbGlkZXMucHVzaChlKSwgdGhpcy50cmlnZ2VyKFwiY3JlYXRlU2xpZGVcIiwgZSwgdGhpcy5zbGlkZXMubGVuZ3RoKTtcbiAgICAgICAgfSksIEFycmF5LmlzQXJyYXkodGhpcy5vcHRpb25zLnNsaWRlcykgJiYgKHRoaXMuc2xpZGVzID0gZSghMCwgWy4uLnRoaXMuc2xpZGVzXSwgdGhpcy5vcHRpb25zLnNsaWRlcykpO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGVNZXRyaWNzKCkge1xuICAgICAgICBsZXQgdCxcbiAgICAgICAgICAgIGUgPSAwLFxuICAgICAgICAgICAgcyA9IFtdO1xuICAgICAgICB0aGlzLnNsaWRlcy5mb3JFYWNoKChpLCBvKSA9PiB7XG4gICAgICAgICAgY29uc3QgbiA9IGkuJGVsLFxuICAgICAgICAgICAgICAgIGEgPSBpLmlzRG9tIHx8ICF0ID8gdGhpcy5nZXRTbGlkZU1ldHJpY3MobikgOiB0O1xuICAgICAgICAgIGkuaW5kZXggPSBvLCBpLndpZHRoID0gYSwgaS5sZWZ0ID0gZSwgdCA9IGEsIGUgKz0gYSwgcy5wdXNoKG8pO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IG8gPSBNYXRoLm1heCh0aGlzLiR0cmFjay5vZmZzZXRXaWR0aCwgaSh0aGlzLiR0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCkpLFxuICAgICAgICAgICAgbiA9IGdldENvbXB1dGVkU3R5bGUodGhpcy4kdHJhY2spO1xuICAgICAgICBvIC09IHBhcnNlRmxvYXQobi5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KG4ucGFkZGluZ1JpZ2h0KSwgdGhpcy5jb250ZW50V2lkdGggPSBlLCB0aGlzLnZpZXdwb3J0V2lkdGggPSBvO1xuICAgICAgICBjb25zdCBhID0gW10sXG4gICAgICAgICAgICAgIHIgPSB0aGlzLm9wdGlvbihcInNsaWRlc1BlclBhZ2VcIik7XG4gICAgICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHIpICYmIGUgPiBvKSBmb3IgKGxldCB0ID0gMDsgdCA8IHRoaXMuc2xpZGVzLmxlbmd0aDsgdCArPSByKSBhLnB1c2goe1xuICAgICAgICAgIGluZGV4ZXM6IHMuc2xpY2UodCwgdCArIHIpLFxuICAgICAgICAgIHNsaWRlczogdGhpcy5zbGlkZXMuc2xpY2UodCwgdCArIHIpXG4gICAgICAgIH0pO2Vsc2Uge1xuICAgICAgICAgIGxldCB0ID0gMCxcbiAgICAgICAgICAgICAgZSA9IDA7XG5cbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBsZXQgcyA9IHRoaXMuc2xpZGVzW2ldO1xuICAgICAgICAgICAgKCFhLmxlbmd0aCB8fCBlICsgcy53aWR0aCA+IG8pICYmIChhLnB1c2goe1xuICAgICAgICAgICAgICBpbmRleGVzOiBbXSxcbiAgICAgICAgICAgICAgc2xpZGVzOiBbXVxuICAgICAgICAgICAgfSksIHQgPSBhLmxlbmd0aCAtIDEsIGUgPSAwKSwgZSArPSBzLndpZHRoLCBhW3RdLmluZGV4ZXMucHVzaChpKSwgYVt0XS5zbGlkZXMucHVzaChzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaCA9IHRoaXMub3B0aW9uKFwiY2VudGVyXCIpLFxuICAgICAgICAgICAgICBsID0gdGhpcy5vcHRpb24oXCJmaWxsXCIpO1xuICAgICAgICBhLmZvckVhY2goKHQsIGkpID0+IHtcbiAgICAgICAgICB0LmluZGV4ID0gaSwgdC53aWR0aCA9IHQuc2xpZGVzLnJlZHVjZSgodCwgZSkgPT4gdCArIGUud2lkdGgsIDApLCB0LmxlZnQgPSB0LnNsaWRlc1swXS5sZWZ0LCBoICYmICh0LmxlZnQgKz0gLjUgKiAobyAtIHQud2lkdGgpICogLTEpLCBsICYmICF0aGlzLm9wdGlvbihcImluZmluaXRlWFwiLCB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpKSAmJiBlID4gbyAmJiAodC5sZWZ0ID0gTWF0aC5tYXgodC5sZWZ0LCAwKSwgdC5sZWZ0ID0gTWF0aC5taW4odC5sZWZ0LCBlIC0gbykpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYyA9IFtdO1xuICAgICAgICBsZXQgZDtcbiAgICAgICAgYS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGUgPSB7IC4uLnRcbiAgICAgICAgICB9O1xuICAgICAgICAgIGQgJiYgZS5sZWZ0ID09PSBkLmxlZnQgPyAoZC53aWR0aCArPSBlLndpZHRoLCBkLnNsaWRlcyA9IFsuLi5kLnNsaWRlcywgLi4uZS5zbGlkZXNdLCBkLmluZGV4ZXMgPSBbLi4uZC5pbmRleGVzLCAuLi5lLmluZGV4ZXNdKSA6IChlLmluZGV4ID0gYy5sZW5ndGgsIGQgPSBlLCBjLnB1c2goZSkpO1xuICAgICAgICB9KSwgdGhpcy5wYWdlcyA9IGM7XG4gICAgICAgIGxldCB1ID0gdGhpcy5wYWdlO1xuXG4gICAgICAgIGlmIChudWxsID09PSB1KSB7XG4gICAgICAgICAgY29uc3QgdCA9IHRoaXMub3B0aW9uKFwiaW5pdGlhbFNsaWRlXCIpO1xuICAgICAgICAgIHUgPSBudWxsICE9PSB0ID8gdGhpcy5maW5kUGFnZUZvclNsaWRlKHQpIDogcGFyc2VJbnQodGhpcy5vcHRpb24oXCJpbml0aWFsUGFnZVwiLCAwKSwgMTApIHx8IDAsIGNbdV0gfHwgKHUgPSBjLmxlbmd0aCAmJiB1ID4gYy5sZW5ndGggPyBjW2MubGVuZ3RoIC0gMV0uaW5kZXggOiAwKSwgdGhpcy5wYWdlID0gdSwgdGhpcy5wYWdlSW5kZXggPSB1O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVQYW56b29tKCksIHRoaXMudHJpZ2dlcihcInJlZnJlc2hcIik7XG4gICAgICB9XG5cbiAgICAgIGdldFNsaWRlTWV0cmljcyh0KSB7XG4gICAgICAgIGlmICghdCkge1xuICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLnNsaWRlc1swXTtcbiAgICAgICAgICAodCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpLmRhdGFzZXQuaXNUZXN0RWwgPSAxLCB0LnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiLCB0LmNsYXNzTGlzdC5hZGQoLi4uKHRoaXMub3B0aW9uKFwicHJlZml4XCIpICsgdGhpcy5vcHRpb24oXCJjbGFzc05hbWVzLnNsaWRlXCIpKS5zcGxpdChcIiBcIikpLCBlLmN1c3RvbUNsYXNzICYmIHQuY2xhc3NMaXN0LmFkZCguLi5lLmN1c3RvbUNsYXNzLnNwbGl0KFwiIFwiKSksIHRoaXMuJHRyYWNrLnByZXBlbmQodCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZSA9IE1hdGgubWF4KHQub2Zmc2V0V2lkdGgsIGkodC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCkpO1xuICAgICAgICBjb25zdCBzID0gdC5jdXJyZW50U3R5bGUgfHwgd2luZG93LmdldENvbXB1dGVkU3R5bGUodCk7XG4gICAgICAgIHJldHVybiBlID0gZSArIChwYXJzZUZsb2F0KHMubWFyZ2luTGVmdCkgfHwgMCkgKyAocGFyc2VGbG9hdChzLm1hcmdpblJpZ2h0KSB8fCAwKSwgdC5kYXRhc2V0LmlzVGVzdEVsICYmIHQucmVtb3ZlKCksIGU7XG4gICAgICB9XG5cbiAgICAgIGZpbmRQYWdlRm9yU2xpZGUodCkge1xuICAgICAgICB0ID0gcGFyc2VJbnQodCwgMTApIHx8IDA7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLnBhZ2VzLmZpbmQoZSA9PiBlLmluZGV4ZXMuaW5kZXhPZih0KSA+IC0xKTtcbiAgICAgICAgcmV0dXJuIGUgPyBlLmluZGV4IDogbnVsbDtcbiAgICAgIH1cblxuICAgICAgc2xpZGVOZXh0KCkge1xuICAgICAgICB0aGlzLnNsaWRlVG8odGhpcy5wYWdlSW5kZXggKyAxKTtcbiAgICAgIH1cblxuICAgICAgc2xpZGVQcmV2KCkge1xuICAgICAgICB0aGlzLnNsaWRlVG8odGhpcy5wYWdlSW5kZXggLSAxKTtcbiAgICAgIH1cblxuICAgICAgc2xpZGVUbyh0LCBlID0ge30pIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHg6IGkgPSAtMSAqIHRoaXMuc2V0UGFnZSh0LCAhMCksXG4gICAgICAgICAgeTogcyA9IDAsXG4gICAgICAgICAgZnJpY3Rpb246IG8gPSB0aGlzLm9wdGlvbihcImZyaWN0aW9uXCIpXG4gICAgICAgIH0gPSBlO1xuICAgICAgICB0aGlzLlBhbnpvb20uY29udGVudC54ID09PSBpICYmICF0aGlzLlBhbnpvb20udmVsb2NpdHkueCAmJiBvIHx8ICh0aGlzLlBhbnpvb20ucGFuVG8oe1xuICAgICAgICAgIHg6IGksXG4gICAgICAgICAgeTogcyxcbiAgICAgICAgICBmcmljdGlvbjogbyxcbiAgICAgICAgICBpZ25vcmVCb3VuZHM6ICEwXG4gICAgICAgIH0pLCBcInJlYWR5XCIgPT09IHRoaXMuc3RhdGUgJiYgXCJyZWFkeVwiID09PSB0aGlzLlBhbnpvb20uc3RhdGUgJiYgdGhpcy50cmlnZ2VyKFwic2V0dGxlXCIpKTtcbiAgICAgIH1cblxuICAgICAgaW5pdFBhbnpvb20oKSB7XG4gICAgICAgIHRoaXMuUGFuem9vbSAmJiB0aGlzLlBhbnpvb20uZGVzdHJveSgpO1xuICAgICAgICBjb25zdCB0ID0gZSghMCwge30sIHtcbiAgICAgICAgICBjb250ZW50OiB0aGlzLiR0cmFjayxcbiAgICAgICAgICB3cmFwSW5uZXI6ICExLFxuICAgICAgICAgIHJlc2l6ZVBhcmVudDogITEsXG4gICAgICAgICAgem9vbTogITEsXG4gICAgICAgICAgY2xpY2s6ICExLFxuICAgICAgICAgIGxvY2tBeGlzOiBcInhcIixcbiAgICAgICAgICB4OiB0aGlzLnBhZ2VzLmxlbmd0aCA/IC0xICogdGhpcy5wYWdlc1t0aGlzLnBhZ2VdLmxlZnQgOiAwLFxuICAgICAgICAgIGNlbnRlck9uU3RhcnQ6ICExLFxuICAgICAgICAgIHRleHRTZWxlY3Rpb246ICgpID0+IHRoaXMub3B0aW9uKFwidGV4dFNlbGVjdGlvblwiLCAhMSksXG4gICAgICAgICAgcGFuT25seVpvb21lZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudC53aWR0aCA8PSB0aGlzLnZpZXdwb3J0LndpZHRoO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5vcHRpb24oXCJQYW56b29tXCIpKTtcbiAgICAgICAgdGhpcy5QYW56b29tID0gbmV3IGQodGhpcy4kY29udGFpbmVyLCB0KSwgdGhpcy5QYW56b29tLm9uKHtcbiAgICAgICAgICBcIipcIjogKHQsIC4uLmUpID0+IHRoaXMudHJpZ2dlcihgUGFuem9vbS4ke3R9YCwgLi4uZSksXG4gICAgICAgICAgYWZ0ZXJVcGRhdGU6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUGFnZSgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYmVmb3JlVHJhbnNmb3JtOiB0aGlzLm9uQmVmb3JlVHJhbnNmb3JtLmJpbmQodGhpcyksXG4gICAgICAgICAgdG91Y2hFbmQ6IHRoaXMub25Ub3VjaEVuZC5iaW5kKHRoaXMpLFxuICAgICAgICAgIGVuZEFuaW1hdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50cmlnZ2VyKFwic2V0dGxlXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSksIHRoaXMudXBkYXRlTWV0cmljcygpLCB0aGlzLm1hbmFnZVNsaWRlVmlzaWJsaXR5KCk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZVBhbnpvb20oKSB7XG4gICAgICAgIHRoaXMuUGFuem9vbSAmJiAodGhpcy5QYW56b29tLmNvbnRlbnQgPSB7IC4uLnRoaXMuUGFuem9vbS5jb250ZW50LFxuICAgICAgICAgIGZpdFdpZHRoOiB0aGlzLmNvbnRlbnRXaWR0aCxcbiAgICAgICAgICBvcmlnV2lkdGg6IHRoaXMuY29udGVudFdpZHRoLFxuICAgICAgICAgIHdpZHRoOiB0aGlzLmNvbnRlbnRXaWR0aFxuICAgICAgICB9LCB0aGlzLnBhZ2VzLmxlbmd0aCA+IDEgJiYgdGhpcy5vcHRpb24oXCJpbmZpbml0ZVhcIiwgdGhpcy5vcHRpb24oXCJpbmZpbml0ZVwiKSkgPyB0aGlzLlBhbnpvb20uYm91bmRYID0gbnVsbCA6IHRoaXMucGFnZXMubGVuZ3RoICYmICh0aGlzLlBhbnpvb20uYm91bmRYID0ge1xuICAgICAgICAgIGZyb206IC0xICogdGhpcy5wYWdlc1t0aGlzLnBhZ2VzLmxlbmd0aCAtIDFdLmxlZnQsXG4gICAgICAgICAgdG86IC0xICogdGhpcy5wYWdlc1swXS5sZWZ0XG4gICAgICAgIH0pLCB0aGlzLm9wdGlvbihcImluZmluaXRlWVwiLCB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpKSA/IHRoaXMuUGFuem9vbS5ib3VuZFkgPSBudWxsIDogdGhpcy5QYW56b29tLmJvdW5kWSA9IHtcbiAgICAgICAgICBmcm9tOiAwLFxuICAgICAgICAgIHRvOiAwXG4gICAgICAgIH0sIHRoaXMuUGFuem9vbS5oYW5kbGVDdXJzb3IoKSk7XG4gICAgICB9XG5cbiAgICAgIG1hbmFnZVNsaWRlVmlzaWJsaXR5KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5jb250ZW50V2lkdGgsXG4gICAgICAgICAgICAgIGUgPSB0aGlzLnZpZXdwb3J0V2lkdGg7XG4gICAgICAgIGxldCBpID0gdGhpcy5QYW56b29tID8gLTEgKiB0aGlzLlBhbnpvb20uY29udGVudC54IDogdGhpcy5wYWdlcy5sZW5ndGggPyB0aGlzLnBhZ2VzW3RoaXMucGFnZV0ubGVmdCA6IDA7XG4gICAgICAgIGNvbnN0IHMgPSB0aGlzLm9wdGlvbihcInByZWxvYWRcIiksXG4gICAgICAgICAgICAgIG8gPSB0aGlzLm9wdGlvbihcImluZmluaXRlWFwiLCB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpKSxcbiAgICAgICAgICAgICAgbiA9IHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLiR2aWV3cG9ydCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcInBhZGRpbmctbGVmdFwiKSksXG4gICAgICAgICAgICAgIGEgPSBwYXJzZUZsb2F0KGdldENvbXB1dGVkU3R5bGUodGhpcy4kdmlld3BvcnQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJwYWRkaW5nLXJpZ2h0XCIpKTtcbiAgICAgICAgdGhpcy5zbGlkZXMuZm9yRWFjaChyID0+IHtcbiAgICAgICAgICBsZXQgaCxcbiAgICAgICAgICAgICAgbCxcbiAgICAgICAgICAgICAgYyA9IDA7XG4gICAgICAgICAgaCA9IGkgLSBuLCBsID0gaSArIGUgKyBhLCBoIC09IHMgKiAoZSArIG4gKyBhKSwgbCArPSBzICogKGUgKyBuICsgYSk7XG4gICAgICAgICAgY29uc3QgZCA9IHIubGVmdCArIHIud2lkdGggPiBoICYmIHIubGVmdCA8IGw7XG4gICAgICAgICAgaCA9IGkgKyB0IC0gbiwgbCA9IGkgKyB0ICsgZSArIGEsIGggLT0gcyAqIChlICsgbiArIGEpO1xuICAgICAgICAgIGNvbnN0IHUgPSBvICYmIHIubGVmdCArIHIud2lkdGggPiBoICYmIHIubGVmdCA8IGw7XG4gICAgICAgICAgaCA9IGkgLSB0IC0gbiwgbCA9IGkgLSB0ICsgZSArIGEsIGggLT0gcyAqIChlICsgbiArIGEpO1xuICAgICAgICAgIGNvbnN0IGYgPSBvICYmIHIubGVmdCArIHIud2lkdGggPiBoICYmIHIubGVmdCA8IGw7XG4gICAgICAgICAgdSB8fCBkIHx8IGYgPyAodGhpcy5jcmVhdGVTbGlkZUVsKHIpLCBkICYmIChjID0gMCksIHUgJiYgKGMgPSAtMSksIGYgJiYgKGMgPSAxKSwgci5sZWZ0ICsgci53aWR0aCA+IGkgJiYgci5sZWZ0IDw9IGkgKyBlICsgYSAmJiAoYyA9IDApKSA6IHRoaXMucmVtb3ZlU2xpZGVFbChyKSwgci5oYXNEaWZmID0gYztcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByID0gMCxcbiAgICAgICAgICAgIGggPSAwO1xuICAgICAgICB0aGlzLnNsaWRlcy5mb3JFYWNoKChlLCBpKSA9PiB7XG4gICAgICAgICAgbGV0IHMgPSAwO1xuICAgICAgICAgIGUuJGVsID8gKGkgIT09IHIgfHwgZS5oYXNEaWZmID8gcyA9IGggKyBlLmhhc0RpZmYgKiB0IDogaCA9IDAsIGUuJGVsLnN0eWxlLmxlZnQgPSBNYXRoLmFicyhzKSA+IC4xID8gYCR7aCArIGUuaGFzRGlmZiAqIHR9cHhgIDogXCJcIiwgcisrKSA6IGggKz0gZS53aWR0aDtcbiAgICAgICAgfSksIHRoaXMubWFya1NlbGVjdGVkU2xpZGVzKCk7XG4gICAgICB9XG5cbiAgICAgIGNyZWF0ZVNsaWRlRWwodCkge1xuICAgICAgICBpZiAoIXQpIHJldHVybjtcblxuICAgICAgICBpZiAodC4kZWwpIHtcbiAgICAgICAgICBsZXQgZSA9IHQuJGVsLmRhdGFzZXQuaW5kZXg7XG5cbiAgICAgICAgICBpZiAoIWUgfHwgcGFyc2VJbnQoZSwgMTApICE9PSB0LmluZGV4KSB7XG4gICAgICAgICAgICBsZXQgZTtcbiAgICAgICAgICAgIHQuJGVsLmRhdGFzZXQuaW5kZXggPSB0LmluZGV4LCB0LiRlbC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbGF6eS1zcmNzZXRdXCIpLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgICAgIHQuc3Jjc2V0ID0gdC5kYXRhc2V0LmxhenlTcmNzZXQ7XG4gICAgICAgICAgICB9KSwgdC4kZWwucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWxhenktc3JjXVwiKS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgICBsZXQgZSA9IHQuZGF0YXNldC5sYXp5U3JjO1xuICAgICAgICAgICAgICB0IGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCA/IHQuc3JjID0gZSA6IHQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgnJHtlfScpYDtcbiAgICAgICAgICAgIH0pLCAoZSA9IHQuJGVsLmRhdGFzZXQubGF6eVNyYykgJiYgKHQuJGVsLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoJyR7ZX0nKWApLCB0LnN0YXRlID0gXCJyZWFkeVwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBlLmRhdGFzZXQuaW5kZXggPSB0LmluZGV4LCBlLmNsYXNzTGlzdC5hZGQoLi4uKHRoaXMub3B0aW9uKFwicHJlZml4XCIpICsgdGhpcy5vcHRpb24oXCJjbGFzc05hbWVzLnNsaWRlXCIpKS5zcGxpdChcIiBcIikpLCB0LmN1c3RvbUNsYXNzICYmIGUuY2xhc3NMaXN0LmFkZCguLi50LmN1c3RvbUNsYXNzLnNwbGl0KFwiIFwiKSksIHQuaHRtbCAmJiAoZS5pbm5lckhUTUwgPSB0Lmh0bWwpO1xuICAgICAgICBjb25zdCBpID0gW107XG4gICAgICAgIHRoaXMuc2xpZGVzLmZvckVhY2goKHQsIGUpID0+IHtcbiAgICAgICAgICB0LiRlbCAmJiBpLnB1c2goZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBzID0gdC5pbmRleDtcbiAgICAgICAgbGV0IG8gPSBudWxsO1xuXG4gICAgICAgIGlmIChpLmxlbmd0aCkge1xuICAgICAgICAgIGxldCB0ID0gaS5yZWR1Y2UoKHQsIGUpID0+IE1hdGguYWJzKGUgLSBzKSA8IE1hdGguYWJzKHQgLSBzKSA/IGUgOiB0KTtcbiAgICAgICAgICBvID0gdGhpcy5zbGlkZXNbdF07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy4kdHJhY2suaW5zZXJ0QmVmb3JlKGUsIG8gJiYgby4kZWwgPyBvLmluZGV4IDwgdC5pbmRleCA/IG8uJGVsLm5leHRTaWJsaW5nIDogby4kZWwgOiBudWxsKSwgdC4kZWwgPSBlLCB0aGlzLnRyaWdnZXIoXCJjcmVhdGVTbGlkZVwiLCB0LCBzKSwgdDtcbiAgICAgIH1cblxuICAgICAgcmVtb3ZlU2xpZGVFbCh0KSB7XG4gICAgICAgIHQuJGVsICYmICF0LmlzRG9tICYmICh0aGlzLnRyaWdnZXIoXCJyZW1vdmVTbGlkZVwiLCB0KSwgdC4kZWwucmVtb3ZlKCksIHQuJGVsID0gbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIG1hcmtTZWxlY3RlZFNsaWRlcygpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMub3B0aW9uKFwiY2xhc3NOYW1lcy5zbGlkZVNlbGVjdGVkXCIpLFxuICAgICAgICAgICAgICBlID0gXCJhcmlhLWhpZGRlblwiO1xuICAgICAgICB0aGlzLnNsaWRlcy5mb3JFYWNoKChpLCBzKSA9PiB7XG4gICAgICAgICAgY29uc3QgbyA9IGkuJGVsO1xuICAgICAgICAgIGlmICghbykgcmV0dXJuO1xuICAgICAgICAgIGNvbnN0IG4gPSB0aGlzLnBhZ2VzW3RoaXMucGFnZV07XG4gICAgICAgICAgbiAmJiBuLmluZGV4ZXMgJiYgbi5pbmRleGVzLmluZGV4T2YocykgPiAtMSA/ICh0ICYmICFvLmNsYXNzTGlzdC5jb250YWlucyh0KSAmJiAoby5jbGFzc0xpc3QuYWRkKHQpLCB0aGlzLnRyaWdnZXIoXCJzZWxlY3RTbGlkZVwiLCBpKSksIG8ucmVtb3ZlQXR0cmlidXRlKGUpKSA6ICh0ICYmIG8uY2xhc3NMaXN0LmNvbnRhaW5zKHQpICYmIChvLmNsYXNzTGlzdC5yZW1vdmUodCksIHRoaXMudHJpZ2dlcihcInVuc2VsZWN0U2xpZGVcIiwgaSkpLCBvLnNldEF0dHJpYnV0ZShlLCAhMCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlUGFnZSgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVNZXRyaWNzKCksIHRoaXMuc2xpZGVUbyh0aGlzLnBhZ2UsIHtcbiAgICAgICAgICBmcmljdGlvbjogMFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgb25CZWZvcmVUcmFuc2Zvcm0oKSB7XG4gICAgICAgIHRoaXMub3B0aW9uKFwiaW5maW5pdGVYXCIsIHRoaXMub3B0aW9uKFwiaW5maW5pdGVcIikpICYmIHRoaXMubWFuYWdlSW5maW5pdGVUcmFjaygpLCB0aGlzLm1hbmFnZVNsaWRlVmlzaWJsaXR5KCk7XG4gICAgICB9XG5cbiAgICAgIG1hbmFnZUluZmluaXRlVHJhY2soKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmNvbnRlbnRXaWR0aCxcbiAgICAgICAgICAgICAgZSA9IHRoaXMudmlld3BvcnRXaWR0aDtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbihcImluZmluaXRlWFwiLCB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpKSB8fCB0aGlzLnBhZ2VzLmxlbmd0aCA8IDIgfHwgdCA8IGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuUGFuem9vbTtcbiAgICAgICAgbGV0IHMgPSAhMTtcbiAgICAgICAgcmV0dXJuIGkuY29udGVudC54IDwgLTEgKiAodCAtIGUpICYmIChpLmNvbnRlbnQueCArPSB0LCB0aGlzLnBhZ2VJbmRleCA9IHRoaXMucGFnZUluZGV4IC0gdGhpcy5wYWdlcy5sZW5ndGgsIHMgPSAhMCksIGkuY29udGVudC54ID4gZSAmJiAoaS5jb250ZW50LnggLT0gdCwgdGhpcy5wYWdlSW5kZXggPSB0aGlzLnBhZ2VJbmRleCArIHRoaXMucGFnZXMubGVuZ3RoLCBzID0gITApLCBzICYmIFwicG9pbnRlcmRvd25cIiA9PT0gaS5zdGF0ZSAmJiBpLnJlc2V0RHJhZ1Bvc2l0aW9uKCksIHM7XG4gICAgICB9XG5cbiAgICAgIG9uVG91Y2hFbmQodCwgZSkge1xuICAgICAgICBjb25zdCBpID0gdGhpcy5vcHRpb24oXCJkcmFnRnJlZVwiKTtcbiAgICAgICAgaWYgKCFpICYmIHRoaXMucGFnZXMubGVuZ3RoID4gMSAmJiB0LmRyYWdPZmZzZXQudGltZSA8IDM1MCAmJiBNYXRoLmFicyh0LmRyYWdPZmZzZXQueSkgPCAxICYmIE1hdGguYWJzKHQuZHJhZ09mZnNldC54KSA+IDUpIHRoaXNbdC5kcmFnT2Zmc2V0LnggPCAwID8gXCJzbGlkZU5leHRcIiA6IFwic2xpZGVQcmV2XCJdKCk7ZWxzZSBpZiAoaSkge1xuICAgICAgICAgIGNvbnN0IFssIGVdID0gdGhpcy5nZXRQYWdlRnJvbVBvc2l0aW9uKC0xICogdC50cmFuc2Zvcm0ueCk7XG4gICAgICAgICAgdGhpcy5zZXRQYWdlKGUpO1xuICAgICAgICB9IGVsc2UgdGhpcy5zbGlkZVRvQ2xvc2VzdCgpO1xuICAgICAgfVxuXG4gICAgICBzbGlkZVRvQ2xvc2VzdCh0ID0ge30pIHtcbiAgICAgICAgbGV0IFssIGVdID0gdGhpcy5nZXRQYWdlRnJvbVBvc2l0aW9uKC0xICogdGhpcy5QYW56b29tLmNvbnRlbnQueCk7XG4gICAgICAgIHRoaXMuc2xpZGVUbyhlLCB0KTtcbiAgICAgIH1cblxuICAgICAgZ2V0UGFnZUZyb21Qb3NpdGlvbih0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLnBhZ2VzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5vcHRpb24oXCJjZW50ZXJcIikgJiYgKHQgKz0gLjUgKiB0aGlzLnZpZXdwb3J0V2lkdGgpO1xuICAgICAgICBjb25zdCBpID0gTWF0aC5mbG9vcih0IC8gdGhpcy5jb250ZW50V2lkdGgpO1xuICAgICAgICB0IC09IGkgKiB0aGlzLmNvbnRlbnRXaWR0aDtcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNsaWRlcy5maW5kKGUgPT4gZS5sZWZ0IDw9IHQgJiYgZS5sZWZ0ICsgZS53aWR0aCA+IHQpO1xuXG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgbGV0IHQgPSB0aGlzLmZpbmRQYWdlRm9yU2xpZGUocy5pbmRleCk7XG4gICAgICAgICAgcmV0dXJuIFt0LCB0ICsgaSAqIGVdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFswLCAwXTtcbiAgICAgIH1cblxuICAgICAgc2V0UGFnZSh0LCBlKSB7XG4gICAgICAgIGxldCBpID0gMCxcbiAgICAgICAgICAgIHMgPSBwYXJzZUludCh0LCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgbyA9IHRoaXMucGFnZSxcbiAgICAgICAgICAgICAgbiA9IHRoaXMucGFnZUluZGV4LFxuICAgICAgICAgICAgICBhID0gdGhpcy5wYWdlcy5sZW5ndGgsXG4gICAgICAgICAgICAgIHIgPSB0aGlzLmNvbnRlbnRXaWR0aCxcbiAgICAgICAgICAgICAgaCA9IHRoaXMudmlld3BvcnRXaWR0aDtcblxuICAgICAgICBpZiAodCA9IChzICUgYSArIGEpICUgYSwgdGhpcy5vcHRpb24oXCJpbmZpbml0ZVhcIiwgdGhpcy5vcHRpb24oXCJpbmZpbml0ZVwiKSkgJiYgciA+IGgpIHtcbiAgICAgICAgICBjb25zdCBvID0gTWF0aC5mbG9vcihzIC8gYSkgfHwgMCxcbiAgICAgICAgICAgICAgICBuID0gcjtcblxuICAgICAgICAgIGlmIChpID0gdGhpcy5wYWdlc1t0XS5sZWZ0ICsgbyAqIG4sICEwID09PSBlICYmIGEgPiAyKSB7XG4gICAgICAgICAgICBsZXQgdCA9IC0xICogdGhpcy5QYW56b29tLmNvbnRlbnQueDtcbiAgICAgICAgICAgIGNvbnN0IGUgPSBpIC0gbixcbiAgICAgICAgICAgICAgICAgIG8gPSBpICsgbixcbiAgICAgICAgICAgICAgICAgIHIgPSBNYXRoLmFicyh0IC0gaSksXG4gICAgICAgICAgICAgICAgICBoID0gTWF0aC5hYnModCAtIGUpLFxuICAgICAgICAgICAgICAgICAgbCA9IE1hdGguYWJzKHQgLSBvKTtcbiAgICAgICAgICAgIGwgPCByICYmIGwgPD0gaCA/IChpID0gbywgcyArPSBhKSA6IGggPCByICYmIGggPCBsICYmIChpID0gZSwgcyAtPSBhKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB0ID0gcyA9IE1hdGgubWF4KDAsIE1hdGgubWluKHMsIGEgLSAxKSksIGkgPSB0aGlzLnBhZ2VzLmxlbmd0aCA/IHRoaXMucGFnZXNbdF0ubGVmdCA6IDA7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGFnZSA9IHQsIHRoaXMucGFnZUluZGV4ID0gcywgbnVsbCAhPT0gbyAmJiB0ICE9PSBvICYmICh0aGlzLnByZXZQYWdlID0gbywgdGhpcy5wcmV2UGFnZUluZGV4ID0gbiwgdGhpcy50cmlnZ2VyKFwiY2hhbmdlXCIsIHQsIG8pKSwgaTtcbiAgICAgIH1cblxuICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiZGVzdHJveVwiLCB0aGlzLnNsaWRlcy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIHRoaXMucmVtb3ZlU2xpZGVFbCh0KTtcbiAgICAgICAgfSksIHRoaXMuc2xpZGVzID0gW10sIHRoaXMuUGFuem9vbS5kZXN0cm95KCksIHRoaXMuZGV0YWNoUGx1Z2lucygpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgeS52ZXJzaW9uID0gXCI0LjAuMzFcIiwgeS5QbHVnaW5zID0gcDtcbiAgICBjb25zdCB2ID0gIShcInVuZGVmaW5lZFwiID09IHR5cGVvZiB3aW5kb3cgfHwgIXdpbmRvdy5kb2N1bWVudCB8fCAhd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xuICAgIGxldCBiID0gbnVsbDtcblxuICAgIGNvbnN0IHggPSBbXCJhW2hyZWZdXCIsIFwiYXJlYVtocmVmXVwiLCAnaW5wdXQ6bm90KFtkaXNhYmxlZF0pOm5vdChbdHlwZT1cImhpZGRlblwiXSk6bm90KFthcmlhLWhpZGRlbl0pJywgXCJzZWxlY3Q6bm90KFtkaXNhYmxlZF0pOm5vdChbYXJpYS1oaWRkZW5dKVwiLCBcInRleHRhcmVhOm5vdChbZGlzYWJsZWRdKTpub3QoW2FyaWEtaGlkZGVuXSlcIiwgXCJidXR0b246bm90KFtkaXNhYmxlZF0pOm5vdChbYXJpYS1oaWRkZW5dKVwiLCBcImlmcmFtZVwiLCBcIm9iamVjdFwiLCBcImVtYmVkXCIsIFwidmlkZW9cIiwgXCJhdWRpb1wiLCBcIltjb250ZW50ZWRpdGFibGVdXCIsICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXhePVwiLVwiXSk6bm90KFtkaXNhYmxlZF0pOm5vdChbYXJpYS1oaWRkZW5dKSddLFxuICAgICAgICAgIHcgPSB0ID0+IHtcbiAgICAgIGlmICh0ICYmIHYpIHtcbiAgICAgICAgbnVsbCA9PT0gYiAmJiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLmZvY3VzKHtcbiAgICAgICAgICBnZXQgcHJldmVudFNjcm9sbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBiID0gITAsICExO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh0LnNldEFjdGl2ZSkgdC5zZXRBY3RpdmUoKTtlbHNlIGlmIChiKSB0LmZvY3VzKHtcbiAgICAgICAgICAgIHByZXZlbnRTY3JvbGw6ICEwXG4gICAgICAgICAgfSk7ZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlID0gd2luZG93LnBhZ2VYT2Zmc2V0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgICAgICAgaSA9IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG4gICAgICAgICAgICB0LmZvY3VzKCksIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG8oe1xuICAgICAgICAgICAgICB0b3A6IGUsXG4gICAgICAgICAgICAgIGxlZnQ6IGksXG4gICAgICAgICAgICAgIGJlaGF2aW9yOiBcImF1dG9cIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh0KSB7fVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCAkJDEgPSB7XG4gICAgICBtaW5TbGlkZUNvdW50OiAyLFxuICAgICAgbWluU2NyZWVuSGVpZ2h0OiA1MDAsXG4gICAgICBhdXRvU3RhcnQ6ICEwLFxuICAgICAga2V5OiBcInRcIixcbiAgICAgIENhcm91c2VsOiB7fSxcbiAgICAgIHRwbDogJzxkaXYgY2xhc3M9XCJmYW5jeWJveF9fdGh1bWJcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6dXJsKFxcJ3t7c3JjfX1cXCcpXCI+PC9kaXY+J1xuICAgIH07XG5cbiAgICBjbGFzcyBDIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveCA9IHQsIHRoaXMuJGNvbnRhaW5lciA9IG51bGwsIHRoaXMuc3RhdGUgPSBcImluaXRcIjtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgW1wib25QcmVwYXJlXCIsIFwib25DbG9zaW5nXCIsIFwib25LZXlkb3duXCJdKSB0aGlzW3RdID0gdGhpc1t0XS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xuICAgICAgICAgIHByZXBhcmU6IHRoaXMub25QcmVwYXJlLFxuICAgICAgICAgIGNsb3Npbmc6IHRoaXMub25DbG9zaW5nLFxuICAgICAgICAgIGtleWRvd246IHRoaXMub25LZXlkb3duXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9uUHJlcGFyZSgpIHtcbiAgICAgICAgdGhpcy5nZXRTbGlkZXMoKS5sZW5ndGggPCB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIlRodW1icy5taW5TbGlkZUNvdW50XCIpID8gdGhpcy5zdGF0ZSA9IFwiZGlzYWJsZWRcIiA6ICEwID09PSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIlRodW1icy5hdXRvU3RhcnRcIikgJiYgdGhpcy5mYW5jeWJveC5DYXJvdXNlbC5QYW56b29tLmNvbnRlbnQuaGVpZ2h0ID49IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVGh1bWJzLm1pblNjcmVlbkhlaWdodFwiKSAmJiB0aGlzLmJ1aWxkKCk7XG4gICAgICB9XG5cbiAgICAgIG9uQ2xvc2luZygpIHtcbiAgICAgICAgdGhpcy5DYXJvdXNlbCAmJiB0aGlzLkNhcm91c2VsLlBhbnpvb20uZGV0YWNoRXZlbnRzKCk7XG4gICAgICB9XG5cbiAgICAgIG9uS2V5ZG93bih0LCBlKSB7XG4gICAgICAgIGUgPT09IHQub3B0aW9uKFwiVGh1bWJzLmtleVwiKSAmJiB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfVxuXG4gICAgICBidWlsZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuJGNvbnRhaW5lcikgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdC5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX3RodW1ic1wiKSwgdGhpcy5mYW5jeWJveC4kY2Fyb3VzZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCwgdGhpcy5mYW5jeWJveC4kY2Fyb3VzZWwubmV4dFNpYmxpbmcpLCB0aGlzLkNhcm91c2VsID0gbmV3IHkodCwgZSghMCwge1xuICAgICAgICAgIERvdHM6ICExLFxuICAgICAgICAgIE5hdmlnYXRpb246ICExLFxuICAgICAgICAgIFN5bmM6IHtcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbmZpbml0ZTogITEsXG4gICAgICAgICAgY2VudGVyOiAhMCxcbiAgICAgICAgICBmaWxsOiAhMCxcbiAgICAgICAgICBkcmFnRnJlZTogITAsXG4gICAgICAgICAgc2xpZGVzUGVyUGFnZTogMSxcbiAgICAgICAgICBwcmVsb2FkOiAxXG4gICAgICAgIH0sIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVGh1bWJzLkNhcm91c2VsXCIpLCB7XG4gICAgICAgICAgU3luYzoge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLmZhbmN5Ym94LkNhcm91c2VsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzbGlkZXM6IHRoaXMuZ2V0U2xpZGVzKClcbiAgICAgICAgfSkpLCB0aGlzLkNhcm91c2VsLlBhbnpvb20ub24oXCJ3aGVlbFwiLCAodCwgZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKSwgdGhpcy5mYW5jeWJveFtlLmRlbHRhWSA8IDAgPyBcInByZXZcIiA6IFwibmV4dFwiXSgpO1xuICAgICAgICB9KSwgdGhpcy4kY29udGFpbmVyID0gdCwgdGhpcy5zdGF0ZSA9IFwidmlzaWJsZVwiO1xuICAgICAgfVxuXG4gICAgICBnZXRTbGlkZXMoKSB7XG4gICAgICAgIGNvbnN0IHQgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgdGhpcy5mYW5jeWJveC5pdGVtcykge1xuICAgICAgICAgIGNvbnN0IGkgPSBlLnRodW1iO1xuICAgICAgICAgIGkgJiYgdC5wdXNoKHtcbiAgICAgICAgICAgIGh0bWw6IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVGh1bWJzLnRwbFwiKS5yZXBsYWNlKC9cXHtcXHtzcmNcXH1cXH0vZ2ksIGkpLFxuICAgICAgICAgICAgY3VzdG9tQ2xhc3M6IGBoYXMtdGh1bWIgaGFzLSR7ZS50eXBlIHx8IFwiaW1hZ2VcIn1gXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdDtcbiAgICAgIH1cblxuICAgICAgdG9nZ2xlKCkge1xuICAgICAgICBcInZpc2libGVcIiA9PT0gdGhpcy5zdGF0ZSA/IHRoaXMuaGlkZSgpIDogXCJoaWRkZW5cIiA9PT0gdGhpcy5zdGF0ZSA/IHRoaXMuc2hvdygpIDogdGhpcy5idWlsZCgpO1xuICAgICAgfVxuXG4gICAgICBzaG93KCkge1xuICAgICAgICBcImhpZGRlblwiID09PSB0aGlzLnN0YXRlICYmICh0aGlzLiRjb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiXCIsIHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS5hdHRhY2hFdmVudHMoKSwgdGhpcy5zdGF0ZSA9IFwidmlzaWJsZVwiKTtcbiAgICAgIH1cblxuICAgICAgaGlkZSgpIHtcbiAgICAgICAgXCJ2aXNpYmxlXCIgPT09IHRoaXMuc3RhdGUgJiYgKHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS5kZXRhY2hFdmVudHMoKSwgdGhpcy4kY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIiwgdGhpcy5zdGF0ZSA9IFwiaGlkZGVuXCIpO1xuICAgICAgfVxuXG4gICAgICBjbGVhbnVwKCkge1xuICAgICAgICB0aGlzLkNhcm91c2VsICYmICh0aGlzLkNhcm91c2VsLmRlc3Ryb3koKSwgdGhpcy5DYXJvdXNlbCA9IG51bGwpLCB0aGlzLiRjb250YWluZXIgJiYgKHRoaXMuJGNvbnRhaW5lci5yZW1vdmUoKSwgdGhpcy4kY29udGFpbmVyID0gbnVsbCksIHRoaXMuc3RhdGUgPSBcImluaXRcIjtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9uKHRoaXMuZXZlbnRzKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9mZih0aGlzLmV2ZW50cyksIHRoaXMuY2xlYW51cCgpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgQy5kZWZhdWx0cyA9ICQkMTtcblxuICAgIGNvbnN0IFMgPSAodCwgZSkgPT4ge1xuICAgICAgY29uc3QgaSA9IG5ldyBVUkwodCksXG4gICAgICAgICAgICBzID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhpLnNlYXJjaCk7XG4gICAgICBsZXQgbyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKTtcblxuICAgICAgZm9yIChjb25zdCBbdCwgaV0gb2YgWy4uLnMsIC4uLk9iamVjdC5lbnRyaWVzKGUpXSkgXCJ0XCIgPT09IHQgPyBvLnNldChcInN0YXJ0XCIsIHBhcnNlSW50KGkpKSA6IG8uc2V0KHQsIGkpO1xuXG4gICAgICBvID0gby50b1N0cmluZygpO1xuICAgICAgbGV0IG4gPSB0Lm1hdGNoKC8jdD0oKC4qKT9cXGQrcykvKTtcbiAgICAgIHJldHVybiBuICYmIChvICs9IGAjdD0ke25bMV19YCksIG87XG4gICAgfSxcbiAgICAgICAgICBFID0ge1xuICAgICAgdmlkZW86IHtcbiAgICAgICAgYXV0b3BsYXk6ICEwLFxuICAgICAgICByYXRpbzogMTYgLyA5XG4gICAgICB9LFxuICAgICAgeW91dHViZToge1xuICAgICAgICBhdXRvaGlkZTogMSxcbiAgICAgICAgZnM6IDEsXG4gICAgICAgIHJlbDogMCxcbiAgICAgICAgaGQ6IDEsXG4gICAgICAgIHdtb2RlOiBcInRyYW5zcGFyZW50XCIsXG4gICAgICAgIGVuYWJsZWpzYXBpOiAxLFxuICAgICAgICBodG1sNTogMVxuICAgICAgfSxcbiAgICAgIHZpbWVvOiB7XG4gICAgICAgIGhkOiAxLFxuICAgICAgICBzaG93X3RpdGxlOiAxLFxuICAgICAgICBzaG93X2J5bGluZTogMSxcbiAgICAgICAgc2hvd19wb3J0cmFpdDogMCxcbiAgICAgICAgZnVsbHNjcmVlbjogMVxuICAgICAgfSxcbiAgICAgIGh0bWw1dmlkZW86IHtcbiAgICAgICAgdHBsOiAnPHZpZGVvIGNsYXNzPVwiZmFuY3lib3hfX2h0bWw1dmlkZW9cIiBwbGF5c2lubGluZSBjb250cm9scyBjb250cm9sc0xpc3Q9XCJub2Rvd25sb2FkXCIgcG9zdGVyPVwie3twb3N0ZXJ9fVwiPlxcbiAgPHNvdXJjZSBzcmM9XCJ7e3NyY319XCIgdHlwZT1cInt7Zm9ybWF0fX1cIiAvPlNvcnJ5LCB5b3VyIGJyb3dzZXIgZG9lc25cXCd0IHN1cHBvcnQgZW1iZWRkZWQgdmlkZW9zLjwvdmlkZW8+JyxcbiAgICAgICAgZm9ybWF0OiBcIlwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNsYXNzIFAge1xuICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94ID0gdDtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgW1wib25Jbml0XCIsIFwib25SZWFkeVwiLCBcIm9uQ3JlYXRlU2xpZGVcIiwgXCJvblJlbW92ZVNsaWRlXCIsIFwib25TZWxlY3RTbGlkZVwiLCBcIm9uVW5zZWxlY3RTbGlkZVwiLCBcIm9uUmVmcmVzaFwiLCBcIm9uTWVzc2FnZVwiXSkgdGhpc1t0XSA9IHRoaXNbdF0uYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmV2ZW50cyA9IHtcbiAgICAgICAgICBpbml0OiB0aGlzLm9uSW5pdCxcbiAgICAgICAgICByZWFkeTogdGhpcy5vblJlYWR5LFxuICAgICAgICAgIFwiQ2Fyb3VzZWwuY3JlYXRlU2xpZGVcIjogdGhpcy5vbkNyZWF0ZVNsaWRlLFxuICAgICAgICAgIFwiQ2Fyb3VzZWwucmVtb3ZlU2xpZGVcIjogdGhpcy5vblJlbW92ZVNsaWRlLFxuICAgICAgICAgIFwiQ2Fyb3VzZWwuc2VsZWN0U2xpZGVcIjogdGhpcy5vblNlbGVjdFNsaWRlLFxuICAgICAgICAgIFwiQ2Fyb3VzZWwudW5zZWxlY3RTbGlkZVwiOiB0aGlzLm9uVW5zZWxlY3RTbGlkZSxcbiAgICAgICAgICBcIkNhcm91c2VsLnJlZnJlc2hcIjogdGhpcy5vblJlZnJlc2hcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb25Jbml0KCkge1xuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgdGhpcy5mYW5jeWJveC5pdGVtcykgdGhpcy5wcm9jZXNzVHlwZSh0KTtcbiAgICAgIH1cblxuICAgICAgcHJvY2Vzc1R5cGUodCkge1xuICAgICAgICBpZiAodC5odG1sKSByZXR1cm4gdC5zcmMgPSB0Lmh0bWwsIHQudHlwZSA9IFwiaHRtbFwiLCB2b2lkIGRlbGV0ZSB0Lmh0bWw7XG4gICAgICAgIGNvbnN0IGkgPSB0LnNyYyB8fCBcIlwiO1xuICAgICAgICBsZXQgcyA9IHQudHlwZSB8fCB0aGlzLmZhbmN5Ym94Lm9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgIG8gPSBudWxsO1xuXG4gICAgICAgIGlmICghaSB8fCBcInN0cmluZ1wiID09IHR5cGVvZiBpKSB7XG4gICAgICAgICAgaWYgKG8gPSBpLm1hdGNoKC8oPzp5b3V0dWJlXFwuY29tfHlvdXR1XFwuYmV8eW91dHViZVxcLW5vY29va2llXFwuY29tKVxcLyg/OndhdGNoXFw/KD86LiomKT92PXx2XFwvfHVcXC98ZW1iZWRcXC8/KT8odmlkZW9zZXJpZXNcXD9saXN0PSg/Oi4qKXxbXFx3LV17MTF9fFxcP2xpc3RUeXBlPSg/Oi4qKSZsaXN0PSg/Oi4qKSkoPzouKikvaSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGUgPSBTKGksIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSHRtbC55b3V0dWJlXCIpKSxcbiAgICAgICAgICAgICAgICAgIG4gPSBlbmNvZGVVUklDb21wb25lbnQob1sxXSk7XG4gICAgICAgICAgICB0LnZpZGVvSWQgPSBuLCB0LnNyYyA9IGBodHRwczovL3d3dy55b3V0dWJlLW5vY29va2llLmNvbS9lbWJlZC8ke259PyR7ZX1gLCB0LnRodW1iID0gdC50aHVtYiB8fCBgaHR0cHM6Ly9pLnl0aW1nLmNvbS92aS8ke259L21xZGVmYXVsdC5qcGdgLCB0LnZlbmRvciA9IFwieW91dHViZVwiLCBzID0gXCJ2aWRlb1wiO1xuICAgICAgICAgIH0gZWxzZSBpZiAobyA9IGkubWF0Y2goL14uK3ZpbWVvLmNvbVxcLyg/OlxcLyk/KFtcXGRdKykoLiopPy8pKSB7XG4gICAgICAgICAgICBjb25zdCBlID0gUyhpLCB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkh0bWwudmltZW9cIikpLFxuICAgICAgICAgICAgICAgICAgbiA9IGVuY29kZVVSSUNvbXBvbmVudChvWzFdKTtcbiAgICAgICAgICAgIHQudmlkZW9JZCA9IG4sIHQuc3JjID0gYGh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby8ke259PyR7ZX1gLCB0LnZlbmRvciA9IFwidmltZW9cIiwgcyA9IFwidmlkZW9cIjtcbiAgICAgICAgICB9IGVsc2UgKG8gPSBpLm1hdGNoKC8oPzptYXBzXFwuKT9nb29nbGVcXC4oW2Etel17MiwzfSg/OlxcLlthLXpdezJ9KT8pXFwvKD86KD86KD86bWFwc1xcLyg/OnBsYWNlXFwvKD86LiopXFwvKT9cXEAoLiopLChcXGQrLj9cXGQrPyl6KSl8KD86XFw/bGw9KSkoLiopPy9pKSkgPyAodC5zcmMgPSBgLy9tYXBzLmdvb2dsZS4ke29bMV19Lz9sbD0keyhvWzJdID8gb1syXSArIFwiJno9XCIgKyBNYXRoLmZsb29yKG9bM10pICsgKG9bNF0gPyBvWzRdLnJlcGxhY2UoL15cXC8vLCBcIiZcIikgOiBcIlwiKSA6IG9bNF0gKyBcIlwiKS5yZXBsYWNlKC9cXD8vLCBcIiZcIil9Jm91dHB1dD0ke29bNF0gJiYgb1s0XS5pbmRleE9mKFwibGF5ZXI9Y1wiKSA+IDAgPyBcInN2ZW1iZWRcIiA6IFwiZW1iZWRcIn1gLCBzID0gXCJtYXBcIikgOiAobyA9IGkubWF0Y2goLyg/Om1hcHNcXC4pP2dvb2dsZVxcLihbYS16XXsyLDN9KD86XFwuW2Etel17Mn0pPylcXC8oPzptYXBzXFwvc2VhcmNoXFwvKSguKikvaSkpICYmICh0LnNyYyA9IGAvL21hcHMuZ29vZ2xlLiR7b1sxXX0vbWFwcz9xPSR7b1syXS5yZXBsYWNlKFwicXVlcnk9XCIsIFwicT1cIikucmVwbGFjZShcImFwaT0xXCIsIFwiXCIpfSZvdXRwdXQ9ZW1iZWRgLCBzID0gXCJtYXBcIik7XG5cbiAgICAgICAgICBzIHx8IChcIiNcIiA9PT0gaS5jaGFyQXQoMCkgPyBzID0gXCJpbmxpbmVcIiA6IChvID0gaS5tYXRjaCgvXFwuKG1wNHxtb3Z8b2d2fHdlYm0pKChcXD98IykuKik/JC9pKSkgPyAocyA9IFwiaHRtbDV2aWRlb1wiLCB0LmZvcm1hdCA9IHQuZm9ybWF0IHx8IFwidmlkZW8vXCIgKyAoXCJvZ3ZcIiA9PT0gb1sxXSA/IFwib2dnXCIgOiBvWzFdKSkgOiBpLm1hdGNoKC8oXmRhdGE6aW1hZ2VcXC9bYS16MC05K1xcLz1dKiwpfChcXC4oanAoZXxnfGVnKXxnaWZ8cG5nfGJtcHx3ZWJwfHN2Z3xpY28pKChcXD98IykuKik/JCkvaSkgPyBzID0gXCJpbWFnZVwiIDogaS5tYXRjaCgvXFwuKHBkZikoKFxcP3wjKS4qKT8kL2kpICYmIChzID0gXCJwZGZcIikpLCB0LnR5cGUgPSBzIHx8IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiZGVmYXVsdFR5cGVcIiwgXCJpbWFnZVwiKSwgXCJodG1sNXZpZGVvXCIgIT09IHMgJiYgXCJ2aWRlb1wiICE9PSBzIHx8ICh0LnZpZGVvID0gZSh7fSwgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJIdG1sLnZpZGVvXCIpLCB0LnZpZGVvKSwgdC5fd2lkdGggJiYgdC5faGVpZ2h0ID8gdC5yYXRpbyA9IHBhcnNlRmxvYXQodC5fd2lkdGgpIC8gcGFyc2VGbG9hdCh0Ll9oZWlnaHQpIDogdC5yYXRpbyA9IHQucmF0aW8gfHwgdC52aWRlby5yYXRpbyB8fCBFLnZpZGVvLnJhdGlvKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvblJlYWR5KCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94LkNhcm91c2VsLnNsaWRlcy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIHQuJGVsICYmICh0aGlzLnNldENvbnRlbnQodCksIHQuaW5kZXggPT09IHRoaXMuZmFuY3lib3guZ2V0U2xpZGUoKS5pbmRleCAmJiB0aGlzLnBsYXlWaWRlbyh0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBvbkNyZWF0ZVNsaWRlKHQsIGUsIGkpIHtcbiAgICAgICAgXCJyZWFkeVwiID09PSB0aGlzLmZhbmN5Ym94LnN0YXRlICYmIHRoaXMuc2V0Q29udGVudChpKTtcbiAgICAgIH1cblxuICAgICAgbG9hZElubGluZUNvbnRlbnQodCkge1xuICAgICAgICBsZXQgZTtcbiAgICAgICAgaWYgKHQuc3JjIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIGUgPSB0LnNyYztlbHNlIGlmIChcInN0cmluZ1wiID09IHR5cGVvZiB0LnNyYykge1xuICAgICAgICAgIGNvbnN0IGkgPSB0LnNyYy5zcGxpdChcIiNcIiwgMiksXG4gICAgICAgICAgICAgICAgcyA9IDIgPT09IGkubGVuZ3RoICYmIFwiXCIgPT09IGlbMF0gPyBpWzFdIDogaVswXTtcbiAgICAgICAgICBlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZSkge1xuICAgICAgICAgIGlmIChcImNsb25lXCIgPT09IHQudHlwZSB8fCBlLiRwbGFjZUhvbGRlcikge1xuICAgICAgICAgICAgZSA9IGUuY2xvbmVOb2RlKCEwKTtcbiAgICAgICAgICAgIGxldCBpID0gZS5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgIGkgPSBpID8gYCR7aX0tLWNsb25lYCA6IGBjbG9uZS0ke3RoaXMuZmFuY3lib3guaWR9LSR7dC5pbmRleH1gLCBlLnNldEF0dHJpYnV0ZShcImlkXCIsIGkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIHQuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94LXBsYWNlaG9sZGVyXCIpLCBlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHQsIGUpLCBlLiRwbGFjZUhvbGRlciA9IHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5mYW5jeWJveC5zZXRDb250ZW50KHQsIGUpO1xuICAgICAgICB9IGVsc2UgdGhpcy5mYW5jeWJveC5zZXRFcnJvcih0LCBcInt7RUxFTUVOVF9OT1RfRk9VTkR9fVwiKTtcbiAgICAgIH1cblxuICAgICAgbG9hZEFqYXhDb250ZW50KHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgIGkgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgZS5zaG93TG9hZGluZyh0KSwgaS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaS5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FICYmIFwicmVhZHlcIiA9PT0gZS5zdGF0ZSAmJiAoZS5oaWRlTG9hZGluZyh0KSwgMjAwID09PSBpLnN0YXR1cyA/IGUuc2V0Q29udGVudCh0LCBpLnJlc3BvbnNlVGV4dCkgOiBlLnNldEVycm9yKHQsIDQwNCA9PT0gaS5zdGF0dXMgPyBcInt7QUpBWF9OT1RfRk9VTkR9fVwiIDogXCJ7e0FKQVhfRk9SQklEREVOfX1cIikpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzID0gdC5hamF4IHx8IG51bGw7XG4gICAgICAgIGkub3BlbihzID8gXCJQT1NUXCIgOiBcIkdFVFwiLCB0LnNyYyksIGkuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiKSwgaS5zZXRSZXF1ZXN0SGVhZGVyKFwiWC1SZXF1ZXN0ZWQtV2l0aFwiLCBcIlhNTEh0dHBSZXF1ZXN0XCIpLCBpLnNlbmQocyksIHQueGhyID0gaTtcbiAgICAgIH1cblxuICAgICAgbG9hZElmcmFtZUNvbnRlbnQodCkge1xuICAgICAgICBjb25zdCBlID0gdGhpcy5mYW5jeWJveCxcbiAgICAgICAgICAgICAgaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7XG4gICAgICAgIGlmIChpLmNsYXNzTmFtZSA9IFwiZmFuY3lib3hfX2lmcmFtZVwiLCBpLnNldEF0dHJpYnV0ZShcImlkXCIsIGBmYW5jeWJveF9faWZyYW1lXyR7ZS5pZH1fJHt0LmluZGV4fWApLCBpLnNldEF0dHJpYnV0ZShcImFsbG93XCIsIFwiYXV0b3BsYXk7IGZ1bGxzY3JlZW5cIiksIGkuc2V0QXR0cmlidXRlKFwic2Nyb2xsaW5nXCIsIFwiYXV0b1wiKSwgdC4kaWZyYW1lID0gaSwgXCJpZnJhbWVcIiAhPT0gdC50eXBlIHx8ICExID09PSB0LnByZWxvYWQpIHJldHVybiBpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB0LnNyYyksIHRoaXMuZmFuY3lib3guc2V0Q29udGVudCh0LCBpKSwgdm9pZCB0aGlzLnJlc2l6ZUlmcmFtZSh0KTtcbiAgICAgICAgZS5zaG93TG9hZGluZyh0KTtcbiAgICAgICAgY29uc3QgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHMuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCIsIHRoaXMuZmFuY3lib3guc2V0Q29udGVudCh0LCBzKSwgcy5hcHBlbmRDaGlsZChpKSwgaS5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgICAgIGUuc2V0RXJyb3IodCwgXCJ7e0lGUkFNRV9FUlJPUn19XCIpO1xuICAgICAgICB9LCBpLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICBlLmhpZGVMb2FkaW5nKHQpO1xuICAgICAgICAgIGxldCBzID0gITE7XG4gICAgICAgICAgaS5pc1JlYWR5IHx8IChpLmlzUmVhZHkgPSAhMCwgcyA9ICEwKSwgaS5zcmMubGVuZ3RoICYmIChpLnBhcmVudE5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IFwiXCIsIHRoaXMucmVzaXplSWZyYW1lKHQpLCBzICYmIGUucmV2ZWFsQ29udGVudCh0KSk7XG4gICAgICAgIH0sIGkuc2V0QXR0cmlidXRlKFwic3JjXCIsIHQuc3JjKTtcbiAgICAgIH1cblxuICAgICAgc2V0QXNwZWN0UmF0aW8odCkge1xuICAgICAgICBjb25zdCBlID0gdC4kY29udGVudCxcbiAgICAgICAgICAgICAgaSA9IHQucmF0aW87XG4gICAgICAgIGlmICghZSkgcmV0dXJuO1xuICAgICAgICBsZXQgcyA9IHQuX3dpZHRoLFxuICAgICAgICAgICAgbyA9IHQuX2hlaWdodDtcblxuICAgICAgICBpZiAoaSB8fCBzICYmIG8pIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGUuc3R5bGUsIHtcbiAgICAgICAgICAgIHdpZHRoOiBzICYmIG8gPyBcIjEwMCVcIiA6IFwiXCIsXG4gICAgICAgICAgICBoZWlnaHQ6IHMgJiYgbyA/IFwiMTAwJVwiIDogXCJcIixcbiAgICAgICAgICAgIG1heFdpZHRoOiBcIlwiLFxuICAgICAgICAgICAgbWF4SGVpZ2h0OiBcIlwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGV0IHQgPSBlLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgICBuID0gZS5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgICBpZiAocyA9IHMgfHwgdCwgbyA9IG8gfHwgbiwgcyA+IHQgfHwgbyA+IG4pIHtcbiAgICAgICAgICAgIGxldCBlID0gTWF0aC5taW4odCAvIHMsIG4gLyBvKTtcbiAgICAgICAgICAgIHMgKj0gZSwgbyAqPSBlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1hdGguYWJzKHMgLyBvIC0gaSkgPiAuMDEgJiYgKGkgPCBzIC8gbyA/IHMgPSBvICogaSA6IG8gPSBzIC8gaSksIE9iamVjdC5hc3NpZ24oZS5zdHlsZSwge1xuICAgICAgICAgICAgd2lkdGg6IGAke3N9cHhgLFxuICAgICAgICAgICAgaGVpZ2h0OiBgJHtvfXB4YFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlc2l6ZUlmcmFtZSh0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0LiRpZnJhbWU7XG4gICAgICAgIGlmICghZSkgcmV0dXJuO1xuICAgICAgICBsZXQgaSA9IHQuX3dpZHRoIHx8IDAsXG4gICAgICAgICAgICBzID0gdC5faGVpZ2h0IHx8IDA7XG4gICAgICAgIGkgJiYgcyAmJiAodC5hdXRvU2l6ZSA9ICExKTtcbiAgICAgICAgY29uc3QgbyA9IGUucGFyZW50Tm9kZSxcbiAgICAgICAgICAgICAgbiA9IG8gJiYgby5zdHlsZTtcbiAgICAgICAgaWYgKCExICE9PSB0LnByZWxvYWQgJiYgITEgIT09IHQuYXV0b1NpemUgJiYgbikgdHJ5IHtcbiAgICAgICAgICBjb25zdCB0ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobyksXG4gICAgICAgICAgICAgICAgYSA9IHBhcnNlRmxvYXQodC5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHQucGFkZGluZ1JpZ2h0KSxcbiAgICAgICAgICAgICAgICByID0gcGFyc2VGbG9hdCh0LnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdCh0LnBhZGRpbmdCb3R0b20pLFxuICAgICAgICAgICAgICAgIGggPSBlLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgbCA9IGguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJodG1sXCIpWzBdLFxuICAgICAgICAgICAgICAgIGMgPSBoLmJvZHk7XG4gICAgICAgICAgbi53aWR0aCA9IFwiXCIsIGMuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiLCBpID0gaSB8fCBsLnNjcm9sbFdpZHRoICsgYSwgbi53aWR0aCA9IGAke2l9cHhgLCBjLnN0eWxlLm92ZXJmbG93ID0gXCJcIiwgbi5mbGV4ID0gXCIwIDAgYXV0b1wiLCBuLmhlaWdodCA9IGAke2Muc2Nyb2xsSGVpZ2h0fXB4YCwgcyA9IGwuc2Nyb2xsSGVpZ2h0ICsgcjtcbiAgICAgICAgfSBjYXRjaCAodCkge31cblxuICAgICAgICBpZiAoaSB8fCBzKSB7XG4gICAgICAgICAgY29uc3QgdCA9IHtcbiAgICAgICAgICAgIGZsZXg6IFwiMCAxIGF1dG9cIlxuICAgICAgICAgIH07XG4gICAgICAgICAgaSAmJiAodC53aWR0aCA9IGAke2l9cHhgKSwgcyAmJiAodC5oZWlnaHQgPSBgJHtzfXB4YCksIE9iamVjdC5hc3NpZ24obiwgdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25SZWZyZXNoKHQsIGUpIHtcbiAgICAgICAgZS5zbGlkZXMuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICB0LiRlbCAmJiAodC4kaWZyYW1lICYmIHRoaXMucmVzaXplSWZyYW1lKHQpLCB0LnJhdGlvICYmIHRoaXMuc2V0QXNwZWN0UmF0aW8odCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc2V0Q29udGVudCh0KSB7XG4gICAgICAgIGlmICh0ICYmICF0LmlzRG9tKSB7XG4gICAgICAgICAgc3dpdGNoICh0LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJodG1sXCI6XG4gICAgICAgICAgICAgIHRoaXMuZmFuY3lib3guc2V0Q29udGVudCh0LCB0LnNyYyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiaHRtbDV2aWRlb1wiOlxuICAgICAgICAgICAgICB0aGlzLmZhbmN5Ym94LnNldENvbnRlbnQodCwgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJIdG1sLmh0bWw1dmlkZW8udHBsXCIpLnJlcGxhY2UoL1xce1xce3NyY1xcfVxcfS9naSwgdC5zcmMpLnJlcGxhY2UoXCJ7e2Zvcm1hdH19XCIsIHQuZm9ybWF0IHx8IHQuaHRtbDV2aWRlbyAmJiB0Lmh0bWw1dmlkZW8uZm9ybWF0IHx8IFwiXCIpLnJlcGxhY2UoXCJ7e3Bvc3Rlcn19XCIsIHQucG9zdGVyIHx8IHQudGh1bWIgfHwgXCJcIikpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcImlubGluZVwiOlxuICAgICAgICAgICAgY2FzZSBcImNsb25lXCI6XG4gICAgICAgICAgICAgIHRoaXMubG9hZElubGluZUNvbnRlbnQodCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiYWpheFwiOlxuICAgICAgICAgICAgICB0aGlzLmxvYWRBamF4Q29udGVudCh0KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJwZGZcIjpcbiAgICAgICAgICAgIGNhc2UgXCJ2aWRlb1wiOlxuICAgICAgICAgICAgY2FzZSBcIm1hcFwiOlxuICAgICAgICAgICAgICB0LnByZWxvYWQgPSAhMTtcblxuICAgICAgICAgICAgY2FzZSBcImlmcmFtZVwiOlxuICAgICAgICAgICAgICB0aGlzLmxvYWRJZnJhbWVDb250ZW50KHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHQucmF0aW8gJiYgdGhpcy5zZXRBc3BlY3RSYXRpbyh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvblNlbGVjdFNsaWRlKHQsIGUsIGkpIHtcbiAgICAgICAgXCJyZWFkeVwiID09PSB0LnN0YXRlICYmIHRoaXMucGxheVZpZGVvKGkpO1xuICAgICAgfVxuXG4gICAgICBwbGF5VmlkZW8odCkge1xuICAgICAgICBpZiAoXCJodG1sNXZpZGVvXCIgPT09IHQudHlwZSAmJiB0LnZpZGVvLmF1dG9wbGF5KSB0cnkge1xuICAgICAgICAgIGNvbnN0IGUgPSB0LiRlbC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIik7XG5cbiAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgY29uc3QgdCA9IGUucGxheSgpO1xuICAgICAgICAgICAgdm9pZCAwICE9PSB0ICYmIHQudGhlbigoKSA9PiB7fSkuY2F0Y2godCA9PiB7XG4gICAgICAgICAgICAgIGUubXV0ZWQgPSAhMCwgZS5wbGF5KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKHQpIHt9XG4gICAgICAgIGlmIChcInZpZGVvXCIgIT09IHQudHlwZSB8fCAhdC4kaWZyYW1lIHx8ICF0LiRpZnJhbWUuY29udGVudFdpbmRvdykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGUgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKFwiZG9uZVwiID09PSB0LnN0YXRlICYmIHQuJGlmcmFtZSAmJiB0LiRpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgbGV0IGU7XG4gICAgICAgICAgICBpZiAodC4kaWZyYW1lLmlzUmVhZHkpIHJldHVybiB0LnZpZGVvICYmIHQudmlkZW8uYXV0b3BsYXkgJiYgKGUgPSBcInlvdXR1YmVcIiA9PSB0LnZlbmRvciA/IHtcbiAgICAgICAgICAgICAgZXZlbnQ6IFwiY29tbWFuZFwiLFxuICAgICAgICAgICAgICBmdW5jOiBcInBsYXlWaWRlb1wiXG4gICAgICAgICAgICB9IDoge1xuICAgICAgICAgICAgICBtZXRob2Q6IFwicGxheVwiLFxuICAgICAgICAgICAgICB2YWx1ZTogXCJ0cnVlXCJcbiAgICAgICAgICAgIH0pLCB2b2lkIChlICYmIHQuJGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KGUpLCBcIipcIikpO1xuICAgICAgICAgICAgXCJ5b3V0dWJlXCIgPT09IHQudmVuZG9yICYmIChlID0ge1xuICAgICAgICAgICAgICBldmVudDogXCJsaXN0ZW5pbmdcIixcbiAgICAgICAgICAgICAgaWQ6IHQuJGlmcmFtZS5nZXRBdHRyaWJ1dGUoXCJpZFwiKVxuICAgICAgICAgICAgfSwgdC4kaWZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoZSksIFwiKlwiKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdC5wb2xsZXIgPSBzZXRUaW1lb3V0KGUsIDI1MCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZSgpO1xuICAgICAgfVxuXG4gICAgICBvblVuc2VsZWN0U2xpZGUodCwgZSwgaSkge1xuICAgICAgICBpZiAoXCJodG1sNXZpZGVvXCIgPT09IGkudHlwZSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpLiRlbC5xdWVyeVNlbGVjdG9yKFwidmlkZW9cIikucGF1c2UoKTtcbiAgICAgICAgICB9IGNhdGNoICh0KSB7fVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHMgPSAhMTtcbiAgICAgICAgXCJ2aW1lb1wiID09IGkudmVuZG9yID8gcyA9IHtcbiAgICAgICAgICBtZXRob2Q6IFwicGF1c2VcIixcbiAgICAgICAgICB2YWx1ZTogXCJ0cnVlXCJcbiAgICAgICAgfSA6IFwieW91dHViZVwiID09PSBpLnZlbmRvciAmJiAocyA9IHtcbiAgICAgICAgICBldmVudDogXCJjb21tYW5kXCIsXG4gICAgICAgICAgZnVuYzogXCJwYXVzZVZpZGVvXCJcbiAgICAgICAgfSksIHMgJiYgaS4kaWZyYW1lICYmIGkuJGlmcmFtZS5jb250ZW50V2luZG93ICYmIGkuJGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHMpLCBcIipcIiksIGNsZWFyVGltZW91dChpLnBvbGxlcik7XG4gICAgICB9XG5cbiAgICAgIG9uUmVtb3ZlU2xpZGUodCwgZSwgaSkge1xuICAgICAgICBpLnhociAmJiAoaS54aHIuYWJvcnQoKSwgaS54aHIgPSBudWxsKSwgaS4kaWZyYW1lICYmIChpLiRpZnJhbWUub25sb2FkID0gaS4kaWZyYW1lLm9uZXJyb3IgPSBudWxsLCBpLiRpZnJhbWUuc3JjID0gXCIvL2Fib3V0OmJsYW5rXCIsIGkuJGlmcmFtZSA9IG51bGwpO1xuICAgICAgICBjb25zdCBzID0gaS4kY29udGVudDtcbiAgICAgICAgXCJpbmxpbmVcIiA9PT0gaS50eXBlICYmIHMgJiYgKHMuY2xhc3NMaXN0LnJlbW92ZShcImZhbmN5Ym94X19jb250ZW50XCIpLCBcIm5vbmVcIiAhPT0gcy5zdHlsZS5kaXNwbGF5ICYmIChzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIikpLCBpLiRjbG9zZUJ1dHRvbiAmJiAoaS4kY2xvc2VCdXR0b24ucmVtb3ZlKCksIGkuJGNsb3NlQnV0dG9uID0gbnVsbCk7XG4gICAgICAgIGNvbnN0IG8gPSBzICYmIHMuJHBsYWNlSG9sZGVyO1xuICAgICAgICBvICYmIChvLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHMsIG8pLCBvLnJlbW92ZSgpLCBzLiRwbGFjZUhvbGRlciA9IG51bGwpO1xuICAgICAgfVxuXG4gICAgICBvbk1lc3NhZ2UodCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBlID0gSlNPTi5wYXJzZSh0LmRhdGEpO1xuXG4gICAgICAgICAgaWYgKFwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tXCIgPT09IHQub3JpZ2luKSB7XG4gICAgICAgICAgICBpZiAoXCJyZWFkeVwiID09PSBlLmV2ZW50KSBmb3IgKGxldCBlIG9mIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmYW5jeWJveF9faWZyYW1lXCIpKSBlLmNvbnRlbnRXaW5kb3cgPT09IHQuc291cmNlICYmIChlLmlzUmVhZHkgPSAxKTtcbiAgICAgICAgICB9IGVsc2UgXCJodHRwczovL3d3dy55b3V0dWJlLW5vY29va2llLmNvbVwiID09PSB0Lm9yaWdpbiAmJiBcIm9uUmVhZHlcIiA9PT0gZS5ldmVudCAmJiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZS5pZCkuaXNSZWFkeSA9IDEpO1xuICAgICAgICB9IGNhdGNoICh0KSB7fVxuICAgICAgfVxuXG4gICAgICBhdHRhY2goKSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3gub24odGhpcy5ldmVudHMpLCB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5vbk1lc3NhZ2UsICExKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9mZih0aGlzLmV2ZW50cyksIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm9uTWVzc2FnZSwgITEpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgUC5kZWZhdWx0cyA9IEU7XG5cbiAgICBjbGFzcyBUIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveCA9IHQ7XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIFtcIm9uUmVhZHlcIiwgXCJvbkNsb3NpbmdcIiwgXCJvbkRvbmVcIiwgXCJvblBhZ2VDaGFuZ2VcIiwgXCJvbkNyZWF0ZVNsaWRlXCIsIFwib25SZW1vdmVTbGlkZVwiLCBcIm9uSW1hZ2VTdGF0dXNDaGFuZ2VcIl0pIHRoaXNbdF0gPSB0aGlzW3RdLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XG4gICAgICAgICAgcmVhZHk6IHRoaXMub25SZWFkeSxcbiAgICAgICAgICBjbG9zaW5nOiB0aGlzLm9uQ2xvc2luZyxcbiAgICAgICAgICBkb25lOiB0aGlzLm9uRG9uZSxcbiAgICAgICAgICBcIkNhcm91c2VsLmNoYW5nZVwiOiB0aGlzLm9uUGFnZUNoYW5nZSxcbiAgICAgICAgICBcIkNhcm91c2VsLmNyZWF0ZVNsaWRlXCI6IHRoaXMub25DcmVhdGVTbGlkZSxcbiAgICAgICAgICBcIkNhcm91c2VsLnJlbW92ZVNsaWRlXCI6IHRoaXMub25SZW1vdmVTbGlkZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvblJlYWR5KCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94LkNhcm91c2VsLnNsaWRlcy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIHQuJGVsICYmIHRoaXMuc2V0Q29udGVudCh0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIG9uRG9uZSh0LCBlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlQ3Vyc29yKGUpO1xuICAgICAgfVxuXG4gICAgICBvbkNsb3NpbmcodCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5jbGlja1RpbWVyKSwgdGhpcy5jbGlja1RpbWVyID0gbnVsbCwgdC5DYXJvdXNlbC5zbGlkZXMuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICB0LiRpbWFnZSAmJiAodC5zdGF0ZSA9IFwiZGVzdHJveVwiKSwgdC5QYW56b29tICYmIHQuUGFuem9vbS5kZXRhY2hFdmVudHMoKTtcbiAgICAgICAgfSksIFwiY2xvc2luZ1wiID09PSB0aGlzLmZhbmN5Ym94LnN0YXRlICYmIHRoaXMuY2FuWm9vbSh0LmdldFNsaWRlKCkpICYmIHRoaXMuem9vbU91dCgpO1xuICAgICAgfVxuXG4gICAgICBvbkNyZWF0ZVNsaWRlKHQsIGUsIGkpIHtcbiAgICAgICAgXCJyZWFkeVwiID09PSB0aGlzLmZhbmN5Ym94LnN0YXRlICYmIHRoaXMuc2V0Q29udGVudChpKTtcbiAgICAgIH1cblxuICAgICAgb25SZW1vdmVTbGlkZSh0LCBlLCBpKSB7XG4gICAgICAgIGkuJGltYWdlICYmIChpLiRlbC5jbGFzc0xpc3QucmVtb3ZlKHQub3B0aW9uKFwiSW1hZ2UuY2FuWm9vbUluQ2xhc3NcIikpLCBpLiRpbWFnZS5yZW1vdmUoKSwgaS4kaW1hZ2UgPSBudWxsKSwgaS5QYW56b29tICYmIChpLlBhbnpvb20uZGVzdHJveSgpLCBpLlBhbnpvb20gPSBudWxsKSwgaS4kZWwgJiYgaS4kZWwuZGF0YXNldCAmJiBkZWxldGUgaS4kZWwuZGF0YXNldC5pbWFnZUZpdDtcbiAgICAgIH1cblxuICAgICAgc2V0Q29udGVudCh0KSB7XG4gICAgICAgIGlmICh0LmlzRG9tIHx8IHQuaHRtbCB8fCB0LnR5cGUgJiYgXCJpbWFnZVwiICE9PSB0LnR5cGUpIHJldHVybjtcbiAgICAgICAgaWYgKHQuJGltYWdlKSByZXR1cm47XG4gICAgICAgIHQudHlwZSA9IFwiaW1hZ2VcIiwgdC5zdGF0ZSA9IFwibG9hZGluZ1wiO1xuICAgICAgICBjb25zdCBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgY29uc3QgaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGkuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZSA9PiB7XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSwgdGhpcy5vbkltYWdlU3RhdHVzQ2hhbmdlKHQpO1xuICAgICAgICB9KSwgaS5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMub25JbWFnZVN0YXR1c0NoYW5nZSh0KTtcbiAgICAgICAgfSksIGkuc3JjID0gdC5zcmMsIGkuYWx0ID0gXCJcIiwgaS5kcmFnZ2FibGUgPSAhMSwgaS5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX2ltYWdlXCIpLCB0LnNyY3NldCAmJiBpLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLCB0LnNyY3NldCksIHQuc2l6ZXMgJiYgaS5zZXRBdHRyaWJ1dGUoXCJzaXplc1wiLCB0LnNpemVzKSwgdC4kaW1hZ2UgPSBpO1xuICAgICAgICBjb25zdCBzID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS53cmFwXCIpO1xuXG4gICAgICAgIGlmIChzKSB7XG4gICAgICAgICAgY29uc3QgbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgby5jbGFzc0xpc3QuYWRkKFwic3RyaW5nXCIgPT0gdHlwZW9mIHMgPyBzIDogXCJmYW5jeWJveF9faW1hZ2Utd3JhcFwiKSwgby5hcHBlbmRDaGlsZChpKSwgZS5hcHBlbmRDaGlsZChvKSwgdC4kd3JhcCA9IG87XG4gICAgICAgIH0gZWxzZSBlLmFwcGVuZENoaWxkKGkpO1xuXG4gICAgICAgIHQuJGVsLmRhdGFzZXQuaW1hZ2VGaXQgPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLmZpdFwiKSwgdGhpcy5mYW5jeWJveC5zZXRDb250ZW50KHQsIGUpLCBpLmNvbXBsZXRlIHx8IGkuZXJyb3IgPyB0aGlzLm9uSW1hZ2VTdGF0dXNDaGFuZ2UodCkgOiB0aGlzLmZhbmN5Ym94LnNob3dMb2FkaW5nKHQpO1xuICAgICAgfVxuXG4gICAgICBvbkltYWdlU3RhdHVzQ2hhbmdlKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHQuJGltYWdlO1xuICAgICAgICBlICYmIFwibG9hZGluZ1wiID09PSB0LnN0YXRlICYmIChlLmNvbXBsZXRlICYmIGUubmF0dXJhbFdpZHRoICYmIGUubmF0dXJhbEhlaWdodCA/ICh0aGlzLmZhbmN5Ym94LmhpZGVMb2FkaW5nKHQpLCBcImNvbnRhaW5cIiA9PT0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5maXRcIikgJiYgdGhpcy5pbml0U2xpZGVQYW56b29tKHQpLCB0LiRlbC5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgZSA9PiB0aGlzLm9uV2hlZWwodCwgZSksIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdC4kY29udGVudC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZSA9PiB0aGlzLm9uQ2xpY2sodCwgZSksIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5yZXZlYWxDb250ZW50KHQpKSA6IHRoaXMuZmFuY3lib3guc2V0RXJyb3IodCwgXCJ7e0lNQUdFX0VSUk9SfX1cIikpO1xuICAgICAgfVxuXG4gICAgICBpbml0U2xpZGVQYW56b29tKHQpIHtcbiAgICAgICAgdC5QYW56b29tIHx8ICh0LlBhbnpvb20gPSBuZXcgZCh0LiRlbCwgZSghMCwgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5QYW56b29tXCIsIHt9KSwge1xuICAgICAgICAgIHZpZXdwb3J0OiB0LiR3cmFwLFxuICAgICAgICAgIGNvbnRlbnQ6IHQuJGltYWdlLFxuICAgICAgICAgIHdpZHRoOiB0Ll93aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IHQuX2hlaWdodCxcbiAgICAgICAgICB3cmFwSW5uZXI6ICExLFxuICAgICAgICAgIHRleHRTZWxlY3Rpb246ICEwLFxuICAgICAgICAgIHRvdWNoOiB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLnRvdWNoXCIpLFxuICAgICAgICAgIHBhbk9ubHlab29tZWQ6ICEwLFxuICAgICAgICAgIGNsaWNrOiAhMSxcbiAgICAgICAgICB3aGVlbDogITFcbiAgICAgICAgfSkpLCB0LlBhbnpvb20ub24oXCJzdGFydEFuaW1hdGlvblwiLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5mYW5jeWJveC50cmlnZ2VyKFwiSW1hZ2Uuc3RhcnRBbmltYXRpb25cIiwgdCk7XG4gICAgICAgIH0pLCB0LlBhbnpvb20ub24oXCJlbmRBbmltYXRpb25cIiwgKCkgPT4ge1xuICAgICAgICAgIFwiem9vbUluXCIgPT09IHQuc3RhdGUgJiYgdGhpcy5mYW5jeWJveC5kb25lKHQpLCB0aGlzLmhhbmRsZUN1cnNvcih0KSwgdGhpcy5mYW5jeWJveC50cmlnZ2VyKFwiSW1hZ2UuZW5kQW5pbWF0aW9uXCIsIHQpO1xuICAgICAgICB9KSwgdC5QYW56b29tLm9uKFwiYWZ0ZXJVcGRhdGVcIiwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaGFuZGxlQ3Vyc29yKHQpLCB0aGlzLmZhbmN5Ym94LnRyaWdnZXIoXCJJbWFnZS5hZnRlclVwZGF0ZVwiLCB0KTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICByZXZlYWxDb250ZW50KHQpIHtcbiAgICAgICAgbnVsbCA9PT0gdGhpcy5mYW5jeWJveC5DYXJvdXNlbC5wcmV2UGFnZSAmJiB0LmluZGV4ID09PSB0aGlzLmZhbmN5Ym94Lm9wdGlvbnMuc3RhcnRJbmRleCAmJiB0aGlzLmNhblpvb20odCkgPyB0aGlzLnpvb21JbigpIDogdGhpcy5mYW5jeWJveC5yZXZlYWxDb250ZW50KHQpO1xuICAgICAgfVxuXG4gICAgICBnZXRab29tSW5mbyh0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0LiR0aHVtYi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgaSA9IGUud2lkdGgsXG4gICAgICAgICAgICAgIHMgPSBlLmhlaWdodCxcbiAgICAgICAgICAgICAgbyA9IHQuJGNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgIG4gPSBvLndpZHRoLFxuICAgICAgICAgICAgICBhID0gby5oZWlnaHQsXG4gICAgICAgICAgICAgIHIgPSBvLnRvcCAtIGUudG9wLFxuICAgICAgICAgICAgICBoID0gby5sZWZ0IC0gZS5sZWZ0O1xuICAgICAgICBsZXQgbCA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2Uuem9vbU9wYWNpdHlcIik7XG4gICAgICAgIHJldHVybiBcImF1dG9cIiA9PT0gbCAmJiAobCA9IE1hdGguYWJzKGkgLyBzIC0gbiAvIGEpID4gLjEpLCB7XG4gICAgICAgICAgdG9wOiByLFxuICAgICAgICAgIGxlZnQ6IGgsXG4gICAgICAgICAgc2NhbGU6IG4gJiYgaSA/IGkgLyBuIDogMSxcbiAgICAgICAgICBvcGFjaXR5OiBsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGNhblpvb20odCkge1xuICAgICAgICBjb25zdCBlID0gdGhpcy5mYW5jeWJveCxcbiAgICAgICAgICAgICAgaSA9IGUuJGNvbnRhaW5lcjtcbiAgICAgICAgaWYgKHdpbmRvdy52aXN1YWxWaWV3cG9ydCAmJiAxICE9PSB3aW5kb3cudmlzdWFsVmlld3BvcnQuc2NhbGUpIHJldHVybiAhMTtcbiAgICAgICAgaWYgKHQuUGFuem9vbSAmJiAhdC5QYW56b29tLmNvbnRlbnQud2lkdGgpIHJldHVybiAhMTtcbiAgICAgICAgaWYgKCFlLm9wdGlvbihcIkltYWdlLnpvb21cIikgfHwgXCJjb250YWluXCIgIT09IGUub3B0aW9uKFwiSW1hZ2UuZml0XCIpKSByZXR1cm4gITE7XG4gICAgICAgIGNvbnN0IHMgPSB0LiR0aHVtYjtcbiAgICAgICAgaWYgKCFzIHx8IFwibG9hZGluZ1wiID09PSB0LnN0YXRlKSByZXR1cm4gITE7XG4gICAgICAgIGkuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94X19uby1jbGlja1wiKTtcbiAgICAgICAgY29uc3QgbyA9IHMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBuO1xuXG4gICAgICAgIGlmICh0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLmlnbm9yZUNvdmVyZWRUaHVtYm5haWxcIikpIHtcbiAgICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChvLmxlZnQgKyAxLCBvLnRvcCArIDEpID09PSBzLFxuICAgICAgICAgICAgICAgIGUgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KG8ucmlnaHQgLSAxLCBvLmJvdHRvbSAtIDEpID09PSBzO1xuICAgICAgICAgIG4gPSB0ICYmIGU7XG4gICAgICAgIH0gZWxzZSBuID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChvLmxlZnQgKyAuNSAqIG8ud2lkdGgsIG8udG9wICsgLjUgKiBvLmhlaWdodCkgPT09IHM7XG5cbiAgICAgICAgcmV0dXJuIGkuY2xhc3NMaXN0LnJlbW92ZShcImZhbmN5Ym94X19uby1jbGlja1wiKSwgbjtcbiAgICAgIH1cblxuICAgICAgem9vbUluKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5mYW5jeWJveCxcbiAgICAgICAgICAgICAgZSA9IHQuZ2V0U2xpZGUoKSxcbiAgICAgICAgICAgICAgaSA9IGUuUGFuem9vbSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgIHRvcDogcyxcbiAgICAgICAgICBsZWZ0OiBvLFxuICAgICAgICAgIHNjYWxlOiBuLFxuICAgICAgICAgIG9wYWNpdHk6IGFcbiAgICAgICAgfSA9IHRoaXMuZ2V0Wm9vbUluZm8oZSk7XG4gICAgICAgIHQudHJpZ2dlcihcInJldmVhbFwiLCBlKSwgaS5wYW5Ubyh7XG4gICAgICAgICAgeDogLTEgKiBvLFxuICAgICAgICAgIHk6IC0xICogcyxcbiAgICAgICAgICBzY2FsZTogbixcbiAgICAgICAgICBmcmljdGlvbjogMCxcbiAgICAgICAgICBpZ25vcmVCb3VuZHM6ICEwXG4gICAgICAgIH0pLCBlLiRjb250ZW50LnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiLCBlLnN0YXRlID0gXCJ6b29tSW5cIiwgITAgPT09IGEgJiYgaS5vbihcImFmdGVyVHJhbnNmb3JtXCIsIHQgPT4ge1xuICAgICAgICAgIFwiem9vbUluXCIgIT09IGUuc3RhdGUgJiYgXCJ6b29tT3V0XCIgIT09IGUuc3RhdGUgfHwgKHQuJGNvbnRlbnQuc3R5bGUub3BhY2l0eSA9IE1hdGgubWluKDEsIDEgLSAoMSAtIHQuY29udGVudC5zY2FsZSkgLyAoMSAtIG4pKSk7XG4gICAgICAgIH0pLCBpLnBhblRvKHtcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgc2NhbGU6IDEsXG4gICAgICAgICAgZnJpY3Rpb246IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2Uuem9vbUZyaWN0aW9uXCIpXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB6b29tT3V0KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5mYW5jeWJveCxcbiAgICAgICAgICAgICAgZSA9IHQuZ2V0U2xpZGUoKSxcbiAgICAgICAgICAgICAgaSA9IGUuUGFuem9vbTtcbiAgICAgICAgaWYgKCFpKSByZXR1cm47XG4gICAgICAgIGUuc3RhdGUgPSBcInpvb21PdXRcIiwgdC5zdGF0ZSA9IFwiY3VzdG9tQ2xvc2luZ1wiLCBlLiRjYXB0aW9uICYmIChlLiRjYXB0aW9uLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiKTtcbiAgICAgICAgbGV0IHMgPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLnpvb21GcmljdGlvblwiKTtcblxuICAgICAgICBjb25zdCBvID0gdCA9PiB7XG4gICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgdG9wOiBvLFxuICAgICAgICAgICAgbGVmdDogbixcbiAgICAgICAgICAgIHNjYWxlOiBhLFxuICAgICAgICAgICAgb3BhY2l0eTogclxuICAgICAgICAgIH0gPSB0aGlzLmdldFpvb21JbmZvKGUpO1xuICAgICAgICAgIHQgfHwgciB8fCAocyAqPSAuODIpLCBpLnBhblRvKHtcbiAgICAgICAgICAgIHg6IC0xICogbixcbiAgICAgICAgICAgIHk6IC0xICogbyxcbiAgICAgICAgICAgIHNjYWxlOiBhLFxuICAgICAgICAgICAgZnJpY3Rpb246IHMsXG4gICAgICAgICAgICBpZ25vcmVCb3VuZHM6ICEwXG4gICAgICAgICAgfSksIHMgKj0gLjk4O1xuICAgICAgICB9O1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIG8pLCBpLm9uY2UoXCJlbmRBbmltYXRpb25cIiwgKCkgPT4ge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIG8pLCB0LmRlc3Ryb3koKTtcbiAgICAgICAgfSksIG8oKTtcbiAgICAgIH1cblxuICAgICAgaGFuZGxlQ3Vyc29yKHQpIHtcbiAgICAgICAgaWYgKFwiaW1hZ2VcIiAhPT0gdC50eXBlIHx8ICF0LiRlbCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBlID0gdC5QYW56b29tLFxuICAgICAgICAgICAgICBpID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5jbGlja1wiLCAhMSwgdCksXG4gICAgICAgICAgICAgIHMgPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLnRvdWNoXCIpLFxuICAgICAgICAgICAgICBvID0gdC4kZWwuY2xhc3NMaXN0LFxuICAgICAgICAgICAgICBuID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5jYW5ab29tSW5DbGFzc1wiKSxcbiAgICAgICAgICAgICAgYSA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2UuY2FuWm9vbU91dENsYXNzXCIpO1xuXG4gICAgICAgIGlmIChvLnJlbW92ZShhKSwgby5yZW1vdmUobiksIGUgJiYgXCJ0b2dnbGVab29tXCIgPT09IGkpIHtcbiAgICAgICAgICBlICYmIDEgPT09IGUuY29udGVudC5zY2FsZSAmJiBlLm9wdGlvbihcIm1heFNjYWxlXCIpIC0gZS5jb250ZW50LnNjYWxlID4gLjAxID8gby5hZGQobikgOiBlLmNvbnRlbnQuc2NhbGUgPiAxICYmICFzICYmIG8uYWRkKGEpO1xuICAgICAgICB9IGVsc2UgXCJjbG9zZVwiID09PSBpICYmIG8uYWRkKGEpO1xuICAgICAgfVxuXG4gICAgICBvbldoZWVsKHQsIGUpIHtcbiAgICAgICAgaWYgKFwicmVhZHlcIiA9PT0gdGhpcy5mYW5jeWJveC5zdGF0ZSAmJiAhMSAhPT0gdGhpcy5mYW5jeWJveC50cmlnZ2VyKFwiSW1hZ2Uud2hlZWxcIiwgZSkpIHN3aXRjaCAodGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS53aGVlbFwiKSkge1xuICAgICAgICAgIGNhc2UgXCJ6b29tXCI6XG4gICAgICAgICAgICBcImRvbmVcIiA9PT0gdC5zdGF0ZSAmJiB0LlBhbnpvb20gJiYgdC5QYW56b29tLnpvb21XaXRoV2hlZWwoZSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJjbG9zZVwiOlxuICAgICAgICAgICAgdGhpcy5mYW5jeWJveC5jbG9zZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwic2xpZGVcIjpcbiAgICAgICAgICAgIHRoaXMuZmFuY3lib3hbZS5kZWx0YVkgPCAwID8gXCJwcmV2XCIgOiBcIm5leHRcIl0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvbkNsaWNrKHQsIGUpIHtcbiAgICAgICAgaWYgKFwicmVhZHlcIiAhPT0gdGhpcy5mYW5jeWJveC5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gdC5QYW56b29tO1xuICAgICAgICBpZiAoaSAmJiAoaS5kcmFnUG9zaXRpb24ubWlkUG9pbnQgfHwgMCAhPT0gaS5kcmFnT2Zmc2V0LnggfHwgMCAhPT0gaS5kcmFnT2Zmc2V0LnkgfHwgMSAhPT0gaS5kcmFnT2Zmc2V0LnNjYWxlKSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5mYW5jeWJveC5DYXJvdXNlbC5QYW56b29tLmxvY2tBeGlzKSByZXR1cm4gITE7XG5cbiAgICAgICAgY29uc3QgcyA9IGkgPT4ge1xuICAgICAgICAgIHN3aXRjaCAoaSkge1xuICAgICAgICAgICAgY2FzZSBcInRvZ2dsZVpvb21cIjpcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKSwgdC5QYW56b29tICYmIHQuUGFuem9vbS56b29tV2l0aENsaWNrKGUpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcImNsb3NlXCI6XG4gICAgICAgICAgICAgIHRoaXMuZmFuY3lib3guY2xvc2UoKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJuZXh0XCI6XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCksIHRoaXMuZmFuY3lib3gubmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgICAgICAgbyA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2UuY2xpY2tcIiksXG4gICAgICAgICAgICAgIG4gPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLmRvdWJsZUNsaWNrXCIpO1xuXG4gICAgICAgIG4gPyB0aGlzLmNsaWNrVGltZXIgPyAoY2xlYXJUaW1lb3V0KHRoaXMuY2xpY2tUaW1lciksIHRoaXMuY2xpY2tUaW1lciA9IG51bGwsIHMobikpIDogdGhpcy5jbGlja1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jbGlja1RpbWVyID0gbnVsbCwgcyhvKTtcbiAgICAgICAgfSwgMzAwKSA6IHMobyk7XG4gICAgICB9XG5cbiAgICAgIG9uUGFnZUNoYW5nZSh0LCBlKSB7XG4gICAgICAgIGNvbnN0IGkgPSB0LmdldFNsaWRlKCk7XG4gICAgICAgIGUuc2xpZGVzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgdC5QYW56b29tICYmIFwiZG9uZVwiID09PSB0LnN0YXRlICYmIHQuaW5kZXggIT09IGkuaW5kZXggJiYgdC5QYW56b29tLnBhblRvKHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgc2NhbGU6IDEsXG4gICAgICAgICAgICBmcmljdGlvbjogLjhcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGF0dGFjaCgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5vbih0aGlzLmV2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIGRldGFjaCgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5vZmYodGhpcy5ldmVudHMpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgVC5kZWZhdWx0cyA9IHtcbiAgICAgIGNhblpvb21JbkNsYXNzOiBcImNhbi16b29tX2luXCIsXG4gICAgICBjYW5ab29tT3V0Q2xhc3M6IFwiY2FuLXpvb21fb3V0XCIsXG4gICAgICB6b29tOiAhMCxcbiAgICAgIHpvb21PcGFjaXR5OiBcImF1dG9cIixcbiAgICAgIHpvb21GcmljdGlvbjogLjgyLFxuICAgICAgaWdub3JlQ292ZXJlZFRodW1ibmFpbDogITEsXG4gICAgICB0b3VjaDogITAsXG4gICAgICBjbGljazogXCJ0b2dnbGVab29tXCIsXG4gICAgICBkb3VibGVDbGljazogbnVsbCxcbiAgICAgIHdoZWVsOiBcInpvb21cIixcbiAgICAgIGZpdDogXCJjb250YWluXCIsXG4gICAgICB3cmFwOiAhMSxcbiAgICAgIFBhbnpvb206IHtcbiAgICAgICAgcmF0aW86IDFcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY2xhc3MgTCB7XG4gICAgICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3ggPSB0O1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiBbXCJvbkNoYW5nZVwiLCBcIm9uQ2xvc2luZ1wiXSkgdGhpc1t0XSA9IHRoaXNbdF0uYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmV2ZW50cyA9IHtcbiAgICAgICAgICBpbml0Q2Fyb3VzZWw6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgXCJDYXJvdXNlbC5jaGFuZ2VcIjogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICBjbG9zaW5nOiB0aGlzLm9uQ2xvc2luZ1xuICAgICAgICB9LCB0aGlzLmhhc0NyZWF0ZWRIaXN0b3J5ID0gITEsIHRoaXMub3JpZ0hhc2ggPSBcIlwiLCB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgb25DaGFuZ2UodCkge1xuICAgICAgICBjb25zdCBlID0gdC5DYXJvdXNlbDtcbiAgICAgICAgdGhpcy50aW1lciAmJiBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gICAgICAgIGNvbnN0IGkgPSBudWxsID09PSBlLnByZXZQYWdlLFxuICAgICAgICAgICAgICBzID0gdC5nZXRTbGlkZSgpLFxuICAgICAgICAgICAgICBvID0gbmV3IFVSTChkb2N1bWVudC5VUkwpLmhhc2g7XG4gICAgICAgIGxldCBuID0gITE7XG4gICAgICAgIGlmIChzLnNsdWcpIG4gPSBcIiNcIiArIHMuc2x1ZztlbHNlIHtcbiAgICAgICAgICBjb25zdCBpID0gcy4kdHJpZ2dlciAmJiBzLiR0cmlnZ2VyLmRhdGFzZXQsXG4gICAgICAgICAgICAgICAgbyA9IHQub3B0aW9uKFwic2x1Z1wiKSB8fCBpICYmIGkuZmFuY3lib3g7XG4gICAgICAgICAgbyAmJiBvLmxlbmd0aCAmJiBcInRydWVcIiAhPT0gbyAmJiAobiA9IFwiI1wiICsgbyArIChlLnNsaWRlcy5sZW5ndGggPiAxID8gXCItXCIgKyAocy5pbmRleCArIDEpIDogXCJcIikpO1xuICAgICAgICB9XG4gICAgICAgIGkgJiYgKHRoaXMub3JpZ0hhc2ggPSBvICE9PSBuID8gbyA6IFwiXCIpLCBuICYmIG8gIT09IG4gJiYgKHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2luZG93Lmhpc3RvcnlbaSA/IFwicHVzaFN0YXRlXCIgOiBcInJlcGxhY2VTdGF0ZVwiXSh7fSwgZG9jdW1lbnQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKyBuKSwgaSAmJiAodGhpcy5oYXNDcmVhdGVkSGlzdG9yeSA9ICEwKTtcbiAgICAgICAgICB9IGNhdGNoICh0KSB7fVxuICAgICAgICB9LCAzMDApKTtcbiAgICAgIH1cblxuICAgICAgb25DbG9zaW5nKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lciAmJiBjbGVhclRpbWVvdXQodGhpcy50aW1lciksICEwICE9PSB0aGlzLmhhc1NpbGVudENsb3NlKSB0cnkge1xuICAgICAgICAgIHJldHVybiB2b2lkIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgZG9jdW1lbnQudGl0bGUsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKyAodGhpcy5vcmlnSGFzaCB8fCBcIlwiKSk7XG4gICAgICAgIH0gY2F0Y2ggKHQpIHt9XG4gICAgICB9XG5cbiAgICAgIGF0dGFjaCh0KSB7XG4gICAgICAgIHQub24odGhpcy5ldmVudHMpO1xuICAgICAgfVxuXG4gICAgICBkZXRhY2godCkge1xuICAgICAgICB0Lm9mZih0aGlzLmV2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBzdGFydEZyb21VcmwoKSB7XG4gICAgICAgIGNvbnN0IHQgPSBMLkZhbmN5Ym94O1xuICAgICAgICBpZiAoIXQgfHwgdC5nZXRJbnN0YW5jZSgpIHx8ICExID09PSB0LmRlZmF1bHRzLkhhc2gpIHJldHVybjtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIGhhc2g6IGUsXG4gICAgICAgICAgc2x1ZzogaSxcbiAgICAgICAgICBpbmRleDogc1xuICAgICAgICB9ID0gTC5nZXRQYXJzZWRVUkwoKTtcbiAgICAgICAgaWYgKCFpKSByZXR1cm47XG4gICAgICAgIGxldCBvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2x1Zz1cIiR7ZX1cIl1gKTtcbiAgICAgICAgaWYgKG8gJiYgby5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImNsaWNrXCIsIHtcbiAgICAgICAgICBidWJibGVzOiAhMCxcbiAgICAgICAgICBjYW5jZWxhYmxlOiAhMFxuICAgICAgICB9KSksIHQuZ2V0SW5zdGFuY2UoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtZmFuY3lib3g9XCIke2l9XCJdYCk7XG4gICAgICAgIG4ubGVuZ3RoICYmIChudWxsID09PSBzICYmIDEgPT09IG4ubGVuZ3RoID8gbyA9IG5bMF0gOiBzICYmIChvID0gbltzIC0gMV0pLCBvICYmIG8uZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJjbGlja1wiLCB7XG4gICAgICAgICAgYnViYmxlczogITAsXG4gICAgICAgICAgY2FuY2VsYWJsZTogITBcbiAgICAgICAgfSkpKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIG9uSGFzaENoYW5nZSgpIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHNsdWc6IHQsXG4gICAgICAgICAgaW5kZXg6IGVcbiAgICAgICAgfSA9IEwuZ2V0UGFyc2VkVVJMKCksXG4gICAgICAgICAgICAgIGkgPSBMLkZhbmN5Ym94LFxuICAgICAgICAgICAgICBzID0gaSAmJiBpLmdldEluc3RhbmNlKCk7XG5cbiAgICAgICAgaWYgKHMgJiYgcy5wbHVnaW5zLkhhc2gpIHtcbiAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgY29uc3QgaSA9IHMuQ2Fyb3VzZWw7XG4gICAgICAgICAgICBpZiAodCA9PT0gcy5vcHRpb24oXCJzbHVnXCIpKSByZXR1cm4gaS5zbGlkZVRvKGUgLSAxKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBpLnNsaWRlcykgaWYgKGUuc2x1ZyAmJiBlLnNsdWcgPT09IHQpIHJldHVybiBpLnNsaWRlVG8oZS5pbmRleCk7XG5cbiAgICAgICAgICAgIGNvbnN0IG8gPSBzLmdldFNsaWRlKCksXG4gICAgICAgICAgICAgICAgICBuID0gby4kdHJpZ2dlciAmJiBvLiR0cmlnZ2VyLmRhdGFzZXQ7XG4gICAgICAgICAgICBpZiAobiAmJiBuLmZhbmN5Ym94ID09PSB0KSByZXR1cm4gaS5zbGlkZVRvKGUgLSAxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzLnBsdWdpbnMuSGFzaC5oYXNTaWxlbnRDbG9zZSA9ICEwLCBzLmNsb3NlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBMLnN0YXJ0RnJvbVVybCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgY3JlYXRlKHQpIHtcbiAgICAgICAgZnVuY3Rpb24gZSgpIHtcbiAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgTC5vbkhhc2hDaGFuZ2UsICExKSwgTC5zdGFydEZyb21VcmwoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEwuRmFuY3lib3ggPSB0LCB2ICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgIC9jb21wbGV0ZXxpbnRlcmFjdGl2ZXxsb2FkZWQvLnRlc3QoZG9jdW1lbnQucmVhZHlTdGF0ZSkgPyBlKCkgOiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBkZXN0cm95KCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImhhc2hjaGFuZ2VcIiwgTC5vbkhhc2hDaGFuZ2UsICExKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGdldFBhcnNlZFVSTCgpIHtcbiAgICAgICAgY29uc3QgdCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKSxcbiAgICAgICAgICAgICAgZSA9IHQuc3BsaXQoXCItXCIpLFxuICAgICAgICAgICAgICBpID0gZS5sZW5ndGggPiAxICYmIC9eXFwrP1xcZCskLy50ZXN0KGVbZS5sZW5ndGggLSAxXSkgJiYgcGFyc2VJbnQoZS5wb3AoLTEpLCAxMCkgfHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBoYXNoOiB0LFxuICAgICAgICAgIHNsdWc6IGUuam9pbihcIi1cIiksXG4gICAgICAgICAgaW5kZXg6IGlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IF8gPSB7XG4gICAgICBwYWdlWE9mZnNldDogMCxcbiAgICAgIHBhZ2VZT2Zmc2V0OiAwLFxuICAgICAgZWxlbWVudDogKCkgPT4gZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQubW96RnVsbFNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQsXG5cbiAgICAgIGFjdGl2YXRlKHQpIHtcbiAgICAgICAgXy5wYWdlWE9mZnNldCA9IHdpbmRvdy5wYWdlWE9mZnNldCwgXy5wYWdlWU9mZnNldCA9IHdpbmRvdy5wYWdlWU9mZnNldCwgdC5yZXF1ZXN0RnVsbHNjcmVlbiA/IHQucmVxdWVzdEZ1bGxzY3JlZW4oKSA6IHQubW96UmVxdWVzdEZ1bGxTY3JlZW4gPyB0Lm1velJlcXVlc3RGdWxsU2NyZWVuKCkgOiB0LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuID8gdC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbigpIDogdC5tc1JlcXVlc3RGdWxsc2NyZWVuICYmIHQubXNSZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgfSxcblxuICAgICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gPyBkb2N1bWVudC5leGl0RnVsbHNjcmVlbigpIDogZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbiA/IGRvY3VtZW50Lm1vekNhbmNlbEZ1bGxTY3JlZW4oKSA6IGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuICYmIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICB9XG5cbiAgICB9O1xuXG4gICAgY2xhc3MgQSB7XG4gICAgICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3ggPSB0LCB0aGlzLmFjdGl2ZSA9ICExLCB0aGlzLmhhbmRsZVZpc2liaWxpdHlDaGFuZ2UgPSB0aGlzLmhhbmRsZVZpc2liaWxpdHlDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgaXNBY3RpdmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgICAgIH1cblxuICAgICAgc2V0VGltZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5hY3RpdmUgfHwgdGhpcy50aW1lcikgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJzbGlkZXNob3cuZGVsYXlcIiwgM2UzKTtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMudGltZXIgPSBudWxsLCB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcImluZmluaXRlXCIpIHx8IHRoaXMuZmFuY3lib3guZ2V0U2xpZGUoKS5pbmRleCAhPT0gdGhpcy5mYW5jeWJveC5DYXJvdXNlbC5zbGlkZXMubGVuZ3RoIC0gMSA/IHRoaXMuZmFuY3lib3gubmV4dCgpIDogdGhpcy5mYW5jeWJveC5qdW1wVG8oMCwge1xuICAgICAgICAgICAgZnJpY3Rpb246IDBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgdCk7XG4gICAgICAgIGxldCBlID0gdGhpcy4kcHJvZ3Jlc3M7XG4gICAgICAgIGUgfHwgKGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCBlLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveF9fcHJvZ3Jlc3NcIiksIHRoaXMuZmFuY3lib3guJGNhcm91c2VsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGUsIHRoaXMuZmFuY3lib3guJGNhcm91c2VsKSwgdGhpcy4kcHJvZ3Jlc3MgPSBlLCBlLm9mZnNldEhlaWdodCksIGUuc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gYCR7dH1tc2AsIGUuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZVgoMSlcIjtcbiAgICAgIH1cblxuICAgICAgY2xlYXJUaW1lcigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLCB0aGlzLnRpbWVyID0gbnVsbCwgdGhpcy4kcHJvZ3Jlc3MgJiYgKHRoaXMuJHByb2dyZXNzLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IFwiXCIsIHRoaXMuJHByb2dyZXNzLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCIsIHRoaXMuJHByb2dyZXNzLm9mZnNldEhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIGFjdGl2YXRlKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZSB8fCAodGhpcy5hY3RpdmUgPSAhMCwgdGhpcy5mYW5jeWJveC4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJoYXMtc2xpZGVzaG93XCIpLCBcImRvbmVcIiA9PT0gdGhpcy5mYW5jeWJveC5nZXRTbGlkZSgpLnN0YXRlICYmIHRoaXMuc2V0VGltZXIoKSwgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgdGhpcy5oYW5kbGVWaXNpYmlsaXR5Q2hhbmdlLCAhMSkpO1xuICAgICAgfVxuXG4gICAgICBoYW5kbGVWaXNpYmlsaXR5Q2hhbmdlKCkge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgICAgIH1cblxuICAgICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSAhMSwgdGhpcy5jbGVhclRpbWVyKCksIHRoaXMuZmFuY3lib3guJGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwiaGFzLXNsaWRlc2hvd1wiKSwgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgdGhpcy5oYW5kbGVWaXNpYmlsaXR5Q2hhbmdlLCAhMSk7XG4gICAgICB9XG5cbiAgICAgIHRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgPyB0aGlzLmRlYWN0aXZhdGUoKSA6IHRoaXMuZmFuY3lib3guQ2Fyb3VzZWwuc2xpZGVzLmxlbmd0aCA+IDEgJiYgdGhpcy5hY3RpdmF0ZSgpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgY29uc3QgeiA9IHtcbiAgICAgIGRpc3BsYXk6IFtcImNvdW50ZXJcIiwgXCJ6b29tXCIsIFwic2xpZGVzaG93XCIsIFwiZnVsbHNjcmVlblwiLCBcInRodW1ic1wiLCBcImNsb3NlXCJdLFxuICAgICAgYXV0b0VuYWJsZTogITAsXG4gICAgICBpdGVtczoge1xuICAgICAgICBjb3VudGVyOiB7XG4gICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgIHR5cGU6IFwiZGl2XCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2NvdW50ZXJcIixcbiAgICAgICAgICBodG1sOiAnPHNwYW4gZGF0YS1mYW5jeWJveC1pbmRleD1cIlwiPjwvc3Bhbj4mbmJzcDsvJm5ic3A7PHNwYW4gZGF0YS1mYW5jeWJveC1jb3VudD1cIlwiPjwvc3Bhbj4nLFxuICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgIHRhYmluZGV4OiAtMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcHJldjoge1xuICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tcHJldlwiLFxuICAgICAgICAgIGxhYmVsOiBcIlBSRVZcIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PHBhdGggZD1cIk0xNSA0bC04IDggOCA4XCIvPjwvc3ZnPicsXG4gICAgICAgICAgYXR0cjoge1xuICAgICAgICAgICAgXCJkYXRhLWZhbmN5Ym94LXByZXZcIjogXCJcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbmV4dDoge1xuICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tbmV4dFwiLFxuICAgICAgICAgIGxhYmVsOiBcIk5FWFRcIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PHBhdGggZD1cIk04IDRsOCA4LTggOFwiLz48L3N2Zz4nLFxuICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgIFwiZGF0YS1mYW5jeWJveC1uZXh0XCI6IFwiXCJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bGxzY3JlZW46IHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19idXR0b24tLWZ1bGxzY3JlZW5cIixcbiAgICAgICAgICBsYWJlbDogXCJUT0dHTEVfRlVMTFNDUkVFTlwiLFxuICAgICAgICAgIGh0bWw6ICc8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cXG4gICAgICAgICAgICAgICAgPGc+PHBhdGggZD1cIk0zIDggVjNoNVwiPjwvcGF0aD48cGF0aCBkPVwiTTIxIDhWM2gtNVwiPjwvcGF0aD48cGF0aCBkPVwiTTggMjFIM3YtNVwiPjwvcGF0aD48cGF0aCBkPVwiTTE2IDIxaDV2LTVcIj48L3BhdGg+PC9nPlxcbiAgICAgICAgICAgICAgICA8Zz48cGF0aCBkPVwiTTcgMnY1SDJNMTcgMnY1aDVNMiAxN2g1djVNMjIgMTdoLTV2NVwiLz48L2c+XFxuICAgICAgICAgICAgPC9zdmc+JyxcbiAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHQucHJldmVudERlZmF1bHQoKSwgXy5lbGVtZW50KCkgPyBfLmRlYWN0aXZhdGUoKSA6IF8uYWN0aXZhdGUodGhpcy5mYW5jeWJveC4kY29udGFpbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNsaWRlc2hvdzoge1xuICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tc2xpZGVzaG93XCIsXG4gICAgICAgICAgbGFiZWw6IFwiVE9HR0xFX1NMSURFU0hPV1wiLFxuICAgICAgICAgIGh0bWw6ICc8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cXG4gICAgICAgICAgICAgICAgPGc+PHBhdGggZD1cIk02IDR2MTZcIi8+PHBhdGggZD1cIk0yMCAxMkw2IDIwXCIvPjxwYXRoIGQ9XCJNMjAgMTJMNiA0XCIvPjwvZz5cXG4gICAgICAgICAgICAgICAgPGc+PHBhdGggZD1cIk03IDR2MTVNMTcgNHYxNVwiLz48L2c+XFxuICAgICAgICAgICAgPC9zdmc+JyxcbiAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHQucHJldmVudERlZmF1bHQoKSwgdGhpcy5TbGlkZXNob3cudG9nZ2xlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB6b29tOiB7XG4gICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICBjbGFzczogXCJmYW5jeWJveF9fYnV0dG9uLS16b29tXCIsXG4gICAgICAgICAgbGFiZWw6IFwiVE9HR0xFX1pPT01cIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCI3XCI+PC9jaXJjbGU+PHBhdGggZD1cIk0xNiAxNiBMMjEgMjFcIj48L3N2Zz4nLFxuICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY29uc3QgZSA9IHRoaXMuZmFuY3lib3guZ2V0U2xpZGUoKS5QYW56b29tO1xuICAgICAgICAgICAgZSAmJiBlLnRvZ2dsZVpvb20oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRvd25sb2FkOiB7XG4gICAgICAgICAgdHlwZTogXCJsaW5rXCIsXG4gICAgICAgICAgbGFiZWw6IFwiRE9XTkxPQURcIixcbiAgICAgICAgICBjbGFzczogXCJmYW5jeWJveF9fYnV0dG9uLS1kb3dubG9hZFwiLFxuICAgICAgICAgIGh0bWw6ICc8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj48cGF0aCBkPVwiTTEyIDE1VjNtMCAxMmwtNC00bTQgNGw0LTRNMiAxN2wuNjIgMi40OEEyIDIgMCAwMDQuNTYgMjFoMTQuODhhMiAyIDAgMDAxLjk0LTEuNTFMMjIgMTdcIi8+PC9zdmc+JyxcbiAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB0aHVtYnM6IHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGxhYmVsOiBcIlRPR0dMRV9USFVNQlNcIixcbiAgICAgICAgICBjbGFzczogXCJmYW5jeWJveF9fYnV0dG9uLS10aHVtYnNcIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PGNpcmNsZSBjeD1cIjRcIiBjeT1cIjRcIiByPVwiMVwiIC8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCI0XCIgcj1cIjFcIiB0cmFuc2Zvcm09XCJyb3RhdGUoOTAgMTIgNClcIi8+PGNpcmNsZSBjeD1cIjIwXCIgY3k9XCI0XCIgcj1cIjFcIiB0cmFuc2Zvcm09XCJyb3RhdGUoOTAgMjAgNClcIi8+PGNpcmNsZSBjeD1cIjRcIiBjeT1cIjEyXCIgcj1cIjFcIiB0cmFuc2Zvcm09XCJyb3RhdGUoOTAgNCAxMilcIi8+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDEyIDEyKVwiLz48Y2lyY2xlIGN4PVwiMjBcIiBjeT1cIjEyXCIgcj1cIjFcIiB0cmFuc2Zvcm09XCJyb3RhdGUoOTAgMjAgMTIpXCIvPjxjaXJjbGUgY3g9XCI0XCIgY3k9XCIyMFwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDQgMjApXCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMjBcIiByPVwiMVwiIHRyYW5zZm9ybT1cInJvdGF0ZSg5MCAxMiAyMClcIi8+PGNpcmNsZSBjeD1cIjIwXCIgY3k9XCIyMFwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDIwIDIwKVwiLz48L3N2Zz4nLFxuICAgICAgICAgIGNsaWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgdC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmZhbmN5Ym94LnBsdWdpbnMuVGh1bWJzO1xuICAgICAgICAgICAgZSAmJiBlLnRvZ2dsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGxhYmVsOiBcIkNMT1NFXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tY2xvc2VcIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PHBhdGggZD1cIk0yMCAyMEw0IDRtMTYgMEw0IDIwXCI+PC9wYXRoPjwvc3ZnPicsXG4gICAgICAgICAgYXR0cjoge1xuICAgICAgICAgICAgXCJkYXRhLWZhbmN5Ym94LWNsb3NlXCI6IFwiXCIsXG4gICAgICAgICAgICB0YWJpbmRleDogMFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBjbGFzcyBrIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveCA9IHQsIHRoaXMuJGNvbnRhaW5lciA9IG51bGwsIHRoaXMuc3RhdGUgPSBcImluaXRcIjtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgW1wib25Jbml0XCIsIFwib25QcmVwYXJlXCIsIFwib25Eb25lXCIsIFwib25LZXlkb3duXCIsIFwib25DbG9zaW5nXCIsIFwib25DaGFuZ2VcIiwgXCJvblNldHRsZVwiLCBcIm9uUmVmcmVzaFwiXSkgdGhpc1t0XSA9IHRoaXNbdF0uYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmV2ZW50cyA9IHtcbiAgICAgICAgICBpbml0OiB0aGlzLm9uSW5pdCxcbiAgICAgICAgICBwcmVwYXJlOiB0aGlzLm9uUHJlcGFyZSxcbiAgICAgICAgICBkb25lOiB0aGlzLm9uRG9uZSxcbiAgICAgICAgICBrZXlkb3duOiB0aGlzLm9uS2V5ZG93bixcbiAgICAgICAgICBjbG9zaW5nOiB0aGlzLm9uQ2xvc2luZyxcbiAgICAgICAgICBcIkNhcm91c2VsLmNoYW5nZVwiOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIFwiQ2Fyb3VzZWwuc2V0dGxlXCI6IHRoaXMub25TZXR0bGUsXG4gICAgICAgICAgXCJDYXJvdXNlbC5QYW56b29tLnRvdWNoU3RhcnRcIjogKCkgPT4gdGhpcy5vblJlZnJlc2goKSxcbiAgICAgICAgICBcIkltYWdlLnN0YXJ0QW5pbWF0aW9uXCI6ICh0LCBlKSA9PiB0aGlzLm9uUmVmcmVzaChlKSxcbiAgICAgICAgICBcIkltYWdlLmFmdGVyVXBkYXRlXCI6ICh0LCBlKSA9PiB0aGlzLm9uUmVmcmVzaChlKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvbkluaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIlRvb2xiYXIuYXV0b0VuYWJsZVwiKSkge1xuICAgICAgICAgIGxldCB0ID0gITE7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IGUgb2YgdGhpcy5mYW5jeWJveC5pdGVtcykgaWYgKFwiaW1hZ2VcIiA9PT0gZS50eXBlKSB7XG4gICAgICAgICAgICB0ID0gITA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXQpIHJldHVybiB2b2lkICh0aGlzLnN0YXRlID0gXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgZSBvZiB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIlRvb2xiYXIuZGlzcGxheVwiKSkge1xuICAgICAgICAgIGlmIChcImNsb3NlXCIgPT09ICh0KGUpID8gZS5pZCA6IGUpKSB7XG4gICAgICAgICAgICB0aGlzLmZhbmN5Ym94Lm9wdGlvbnMuY2xvc2VCdXR0b24gPSAhMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvblByZXBhcmUoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmZhbmN5Ym94O1xuICAgICAgICBpZiAoXCJpbml0XCIgPT09IHRoaXMuc3RhdGUgJiYgKHRoaXMuYnVpbGQoKSwgdGhpcy51cGRhdGUoKSwgdGhpcy5TbGlkZXNob3cgPSBuZXcgQSh0KSwgIXQuQ2Fyb3VzZWwucHJldlBhZ2UgJiYgKHQub3B0aW9uKFwic2xpZGVzaG93LmF1dG9TdGFydFwiKSAmJiB0aGlzLlNsaWRlc2hvdy5hY3RpdmF0ZSgpLCB0Lm9wdGlvbihcImZ1bGxzY3JlZW4uYXV0b1N0YXJ0XCIpICYmICFfLmVsZW1lbnQoKSkpKSB0cnkge1xuICAgICAgICAgIF8uYWN0aXZhdGUodC4kY29udGFpbmVyKTtcbiAgICAgICAgfSBjYXRjaCAodCkge31cbiAgICAgIH1cblxuICAgICAgb25Gc0NoYW5nZSgpIHtcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKF8ucGFnZVhPZmZzZXQsIF8ucGFnZVlPZmZzZXQpO1xuICAgICAgfVxuXG4gICAgICBvblNldHRsZSgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgIGUgPSB0aGlzLlNsaWRlc2hvdztcbiAgICAgICAgZSAmJiBlLmlzQWN0aXZlKCkgJiYgKHQuZ2V0U2xpZGUoKS5pbmRleCAhPT0gdC5DYXJvdXNlbC5zbGlkZXMubGVuZ3RoIC0gMSB8fCB0Lm9wdGlvbihcImluZmluaXRlXCIpID8gXCJkb25lXCIgPT09IHQuZ2V0U2xpZGUoKS5zdGF0ZSAmJiBlLnNldFRpbWVyKCkgOiBlLmRlYWN0aXZhdGUoKSk7XG4gICAgICB9XG5cbiAgICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpLCB0aGlzLlNsaWRlc2hvdyAmJiB0aGlzLlNsaWRlc2hvdy5pc0FjdGl2ZSgpICYmIHRoaXMuU2xpZGVzaG93LmNsZWFyVGltZXIoKTtcbiAgICAgIH1cblxuICAgICAgb25Eb25lKHQsIGUpIHtcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuU2xpZGVzaG93O1xuICAgICAgICBlLmluZGV4ID09PSB0LmdldFNsaWRlKCkuaW5kZXggJiYgKHRoaXMudXBkYXRlKCksIGkgJiYgaS5pc0FjdGl2ZSgpICYmICh0Lm9wdGlvbihcImluZmluaXRlXCIpIHx8IGUuaW5kZXggIT09IHQuQ2Fyb3VzZWwuc2xpZGVzLmxlbmd0aCAtIDEgPyBpLnNldFRpbWVyKCkgOiBpLmRlYWN0aXZhdGUoKSkpO1xuICAgICAgfVxuXG4gICAgICBvblJlZnJlc2godCkge1xuICAgICAgICB0ICYmIHQuaW5kZXggIT09IHRoaXMuZmFuY3lib3guZ2V0U2xpZGUoKS5pbmRleCB8fCAodGhpcy51cGRhdGUoKSwgIXRoaXMuU2xpZGVzaG93IHx8ICF0aGlzLlNsaWRlc2hvdy5pc0FjdGl2ZSgpIHx8IHQgJiYgXCJkb25lXCIgIT09IHQuc3RhdGUgfHwgdGhpcy5TbGlkZXNob3cuZGVhY3RpdmF0ZSgpKTtcbiAgICAgIH1cblxuICAgICAgb25LZXlkb3duKHQsIGUsIGkpIHtcbiAgICAgICAgXCIgXCIgPT09IGUgJiYgdGhpcy5TbGlkZXNob3cgJiYgKHRoaXMuU2xpZGVzaG93LnRvZ2dsZSgpLCBpLnByZXZlbnREZWZhdWx0KCkpO1xuICAgICAgfVxuXG4gICAgICBvbkNsb3NpbmcoKSB7XG4gICAgICAgIHRoaXMuU2xpZGVzaG93ICYmIHRoaXMuU2xpZGVzaG93LmRlYWN0aXZhdGUoKSwgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZ1bGxzY3JlZW5jaGFuZ2VcIiwgdGhpcy5vbkZzQ2hhbmdlKTtcbiAgICAgIH1cblxuICAgICAgY3JlYXRlRWxlbWVudCh0KSB7XG4gICAgICAgIGxldCBlO1xuICAgICAgICBcImRpdlwiID09PSB0LnR5cGUgPyBlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSA6IChlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIiA9PT0gdC50eXBlID8gXCJhXCIgOiBcImJ1dHRvblwiKSwgZS5jbGFzc0xpc3QuYWRkKFwiY2Fyb3VzZWxfX2J1dHRvblwiKSksIGUuaW5uZXJIVE1MID0gdC5odG1sLCBlLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIHQudGFiaW5kZXggfHwgMCksIHQuY2xhc3MgJiYgZS5jbGFzc0xpc3QuYWRkKC4uLnQuY2xhc3Muc3BsaXQoXCIgXCIpKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gdC5hdHRyKSBlLnNldEF0dHJpYnV0ZShpLCB0LmF0dHJbaV0pO1xuXG4gICAgICAgIHQubGFiZWwgJiYgZS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCB0aGlzLmZhbmN5Ym94LmxvY2FsaXplKGB7eyR7dC5sYWJlbH19fWApKSwgdC5jbGljayAmJiBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0LmNsaWNrLmJpbmQodGhpcykpLCBcInByZXZcIiA9PT0gdC5pZCAmJiBlLnNldEF0dHJpYnV0ZShcImRhdGEtZmFuY3lib3gtcHJldlwiLCBcIlwiKSwgXCJuZXh0XCIgPT09IHQuaWQgJiYgZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWZhbmN5Ym94LW5leHRcIiwgXCJcIik7XG4gICAgICAgIGNvbnN0IGkgPSBlLnF1ZXJ5U2VsZWN0b3IoXCJzdmdcIik7XG4gICAgICAgIHJldHVybiBpICYmIChpLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJpbWdcIiksIGkuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCItMVwiKSwgaS5zZXRBdHRyaWJ1dGUoXCJ4bWxuc1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIpKSwgZTtcbiAgICAgIH1cblxuICAgICAgYnVpbGQoKSB7XG4gICAgICAgIHRoaXMuY2xlYW51cCgpO1xuICAgICAgICBjb25zdCBpID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJUb29sYmFyLml0ZW1zXCIpLFxuICAgICAgICAgICAgICBzID0gW3tcbiAgICAgICAgICBwb3NpdGlvbjogXCJsZWZ0XCIsXG4gICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBwb3NpdGlvbjogXCJjZW50ZXJcIixcbiAgICAgICAgICBpdGVtczogW11cbiAgICAgICAgfSwge1xuICAgICAgICAgIHBvc2l0aW9uOiBcInJpZ2h0XCIsXG4gICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgIH1dLFxuICAgICAgICAgICAgICBvID0gdGhpcy5mYW5jeWJveC5wbHVnaW5zLlRodW1icztcblxuICAgICAgICBmb3IgKGNvbnN0IG4gb2YgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJUb29sYmFyLmRpc3BsYXlcIikpIHtcbiAgICAgICAgICBsZXQgYSwgcjtcbiAgICAgICAgICBpZiAodChuKSA/IChhID0gbi5pZCwgciA9IGUoe30sIGlbYV0sIG4pKSA6IChhID0gbiwgciA9IGlbYV0pLCBbXCJjb3VudGVyXCIsIFwibmV4dFwiLCBcInByZXZcIiwgXCJzbGlkZXNob3dcIl0uaW5jbHVkZXMoYSkgJiYgdGhpcy5mYW5jeWJveC5pdGVtcy5sZW5ndGggPCAyKSBjb250aW51ZTtcblxuICAgICAgICAgIGlmIChcImZ1bGxzY3JlZW5cIiA9PT0gYSkge1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5mdWxsc2NyZWVuRW5hYmxlZCB8fCB3aW5kb3cuZnVsbFNjcmVlbikgY29udGludWU7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZnVsbHNjcmVlbmNoYW5nZVwiLCB0aGlzLm9uRnNDaGFuZ2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChcInRodW1ic1wiID09PSBhICYmICghbyB8fCBcImRpc2FibGVkXCIgPT09IG8uc3RhdGUpKSBjb250aW51ZTtcbiAgICAgICAgICBpZiAoIXIpIGNvbnRpbnVlO1xuICAgICAgICAgIGxldCBoID0gci5wb3NpdGlvbiB8fCBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgIGwgPSBzLmZpbmQodCA9PiB0LnBvc2l0aW9uID09PSBoKTtcbiAgICAgICAgICBsICYmIGwuaXRlbXMucHVzaChyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBuLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveF9fdG9vbGJhclwiKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgcykgaWYgKHQuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgZS5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX3Rvb2xiYXJfX2l0ZW1zXCIpLCBlLmNsYXNzTGlzdC5hZGQoYGZhbmN5Ym94X190b29sYmFyX19pdGVtcy0tJHt0LnBvc2l0aW9ufWApO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBpIG9mIHQuaXRlbXMpIGUuYXBwZW5kQ2hpbGQodGhpcy5jcmVhdGVFbGVtZW50KGkpKTtcblxuICAgICAgICAgIG4uYXBwZW5kQ2hpbGQoZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZhbmN5Ym94LiRjYXJvdXNlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShuLCB0aGlzLmZhbmN5Ym94LiRjYXJvdXNlbCksIHRoaXMuJGNvbnRhaW5lciA9IG47XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuZmFuY3lib3guZ2V0U2xpZGUoKSxcbiAgICAgICAgICAgICAgZSA9IHQuaW5kZXgsXG4gICAgICAgICAgICAgIGkgPSB0aGlzLmZhbmN5Ym94Lml0ZW1zLmxlbmd0aCxcbiAgICAgICAgICAgICAgcyA9IHQuZG93bmxvYWRTcmMgfHwgKFwiaW1hZ2VcIiAhPT0gdC50eXBlIHx8IHQuZXJyb3IgPyBudWxsIDogdC5zcmMpO1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiB0aGlzLmZhbmN5Ym94LiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcImEuZmFuY3lib3hfX2J1dHRvbi0tZG93bmxvYWRcIikpIHMgPyAodC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSwgdC5yZW1vdmVBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiKSwgdC5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHMpLCB0LnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIHMpLCB0LnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKSkgOiAodC5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcIlwiKSwgdC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCAtMSksIHQucmVtb3ZlQXR0cmlidXRlKFwiaHJlZlwiKSwgdC5yZW1vdmVBdHRyaWJ1dGUoXCJkb3dubG9hZFwiKSk7XG5cbiAgICAgICAgY29uc3QgbyA9IHQuUGFuem9vbSxcbiAgICAgICAgICAgICAgbiA9IG8gJiYgby5vcHRpb24oXCJtYXhTY2FsZVwiKSA+IG8ub3B0aW9uKFwiYmFzZVNjYWxlXCIpO1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiB0aGlzLmZhbmN5Ym94LiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIi5mYW5jeWJveF9fYnV0dG9uLS16b29tXCIpKSBuID8gdC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSA6IHQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJcIik7XG5cbiAgICAgICAgZm9yIChjb25zdCBlIG9mIHRoaXMuZmFuY3lib3guJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZmFuY3lib3gtaW5kZXhdXCIpKSBlLmlubmVySFRNTCA9IHQuaW5kZXggKyAxO1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiB0aGlzLmZhbmN5Ym94LiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWZhbmN5Ym94LWNvdW50XVwiKSkgdC5pbm5lckhUTUwgPSBpO1xuXG4gICAgICAgIGlmICghdGhpcy5mYW5jeWJveC5vcHRpb24oXCJpbmZpbml0ZVwiKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgdCBvZiB0aGlzLmZhbmN5Ym94LiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWZhbmN5Ym94LXByZXZdXCIpKSAwID09PSBlID8gdC5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcIlwiKSA6IHQucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHQgb2YgdGhpcy5mYW5jeWJveC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1mYW5jeWJveC1uZXh0XVwiKSkgZSA9PT0gaSAtIDEgPyB0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiXCIpIDogdC5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjbGVhbnVwKCkge1xuICAgICAgICB0aGlzLlNsaWRlc2hvdyAmJiB0aGlzLlNsaWRlc2hvdy5pc0FjdGl2ZSgpICYmIHRoaXMuU2xpZGVzaG93LmNsZWFyVGltZXIoKSwgdGhpcy4kY29udGFpbmVyICYmIHRoaXMuJGNvbnRhaW5lci5yZW1vdmUoKSwgdGhpcy4kY29udGFpbmVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9uKHRoaXMuZXZlbnRzKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9mZih0aGlzLmV2ZW50cyksIHRoaXMuY2xlYW51cCgpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgay5kZWZhdWx0cyA9IHo7XG4gICAgY29uc3QgTyA9IHtcbiAgICAgIFNjcm9sbExvY2s6IGNsYXNzIHtcbiAgICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICAgIHRoaXMuZmFuY3lib3ggPSB0LCB0aGlzLnZpZXdwb3J0ID0gbnVsbCwgdGhpcy5wZW5kaW5nVXBkYXRlID0gbnVsbDtcblxuICAgICAgICAgIGZvciAoY29uc3QgdCBvZiBbXCJvblJlYWR5XCIsIFwib25SZXNpemVcIiwgXCJvblRvdWNoc3RhcnRcIiwgXCJvblRvdWNobW92ZVwiXSkgdGhpc1t0XSA9IHRoaXNbdF0uYmluZCh0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uUmVhZHkoKSB7XG4gICAgICAgICAgY29uc3QgdCA9IHdpbmRvdy52aXN1YWxWaWV3cG9ydDtcbiAgICAgICAgICB0ICYmICh0aGlzLnZpZXdwb3J0ID0gdCwgdGhpcy5zdGFydFkgPSAwLCB0LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5vblJlc2l6ZSksIHRoaXMudXBkYXRlVmlld3BvcnQoKSksIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLm9uVG91Y2hzdGFydCwge1xuICAgICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgICB9KSwgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgdGhpcy5vblRvdWNobW92ZSwge1xuICAgICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgICB9KSwgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCB0aGlzLm9uV2hlZWwsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBvblJlc2l6ZSgpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXdwb3J0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGVWaWV3cG9ydCgpIHtcbiAgICAgICAgICBjb25zdCB0ID0gdGhpcy5mYW5jeWJveCxcbiAgICAgICAgICAgICAgICBlID0gdGhpcy52aWV3cG9ydCxcbiAgICAgICAgICAgICAgICBpID0gZS5zY2FsZSB8fCAxLFxuICAgICAgICAgICAgICAgIHMgPSB0LiRjb250YWluZXI7XG4gICAgICAgICAgaWYgKCFzKSByZXR1cm47XG4gICAgICAgICAgbGV0IG8gPSBcIlwiLFxuICAgICAgICAgICAgICBuID0gXCJcIixcbiAgICAgICAgICAgICAgYSA9IFwiXCI7XG4gICAgICAgICAgaSAtIDEgPiAuMSAmJiAobyA9IGUud2lkdGggKiBpICsgXCJweFwiLCBuID0gZS5oZWlnaHQgKiBpICsgXCJweFwiLCBhID0gYHRyYW5zbGF0ZTNkKCR7ZS5vZmZzZXRMZWZ0fXB4LCAke2Uub2Zmc2V0VG9wfXB4LCAwKSBzY2FsZSgkezEgLyBpfSlgKSwgcy5zdHlsZS53aWR0aCA9IG8sIHMuc3R5bGUuaGVpZ2h0ID0gbiwgcy5zdHlsZS50cmFuc2Zvcm0gPSBhO1xuICAgICAgICB9XG5cbiAgICAgICAgb25Ub3VjaHN0YXJ0KHQpIHtcbiAgICAgICAgICB0aGlzLnN0YXJ0WSA9IHQudG91Y2hlcyA/IHQudG91Y2hlc1swXS5zY3JlZW5ZIDogdC5zY3JlZW5ZO1xuICAgICAgICB9XG5cbiAgICAgICAgb25Ub3VjaG1vdmUodCkge1xuICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLnN0YXJ0WSxcbiAgICAgICAgICAgICAgICBpID0gd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICAgIGlmICghdC5jYW5jZWxhYmxlKSByZXR1cm47XG4gICAgICAgICAgaWYgKHQudG91Y2hlcy5sZW5ndGggPiAxIHx8IDEgIT09IGkpIHJldHVybjtcbiAgICAgICAgICBjb25zdCBvID0gcyh0LmNvbXBvc2VkUGF0aCgpWzBdKTtcbiAgICAgICAgICBpZiAoIW8pIHJldHVybiB2b2lkIHQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBjb25zdCBuID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobyksXG4gICAgICAgICAgICAgICAgYSA9IHBhcnNlSW50KG4uZ2V0UHJvcGVydHlWYWx1ZShcImhlaWdodFwiKSwgMTApLFxuICAgICAgICAgICAgICAgIHIgPSB0LnRvdWNoZXMgPyB0LnRvdWNoZXNbMF0uc2NyZWVuWSA6IHQuc2NyZWVuWSxcbiAgICAgICAgICAgICAgICBoID0gZSA8PSByICYmIDAgPT09IG8uc2Nyb2xsVG9wLFxuICAgICAgICAgICAgICAgIGwgPSBlID49IHIgJiYgby5zY3JvbGxIZWlnaHQgLSBvLnNjcm9sbFRvcCA9PT0gYTtcbiAgICAgICAgICAoaCB8fCBsKSAmJiB0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBvbldoZWVsKHQpIHtcbiAgICAgICAgICBzKHQuY29tcG9zZWRQYXRoKClbMF0pIHx8IHQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFudXAoKSB7XG4gICAgICAgICAgdGhpcy5wZW5kaW5nVXBkYXRlICYmIChjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnBlbmRpbmdVcGRhdGUpLCB0aGlzLnBlbmRpbmdVcGRhdGUgPSBudWxsKTtcbiAgICAgICAgICBjb25zdCB0ID0gdGhpcy52aWV3cG9ydDtcbiAgICAgICAgICB0ICYmICh0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5vblJlc2l6ZSksIHRoaXMudmlld3BvcnQgPSBudWxsKSwgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRoaXMub25Ub3VjaHN0YXJ0LCAhMSksIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRoaXMub25Ub3VjaG1vdmUsICExKSwgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCB0aGlzLm9uV2hlZWwsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhdHRhY2goKSB7XG4gICAgICAgICAgdGhpcy5mYW5jeWJveC5vbihcImluaXRMYXlvdXRcIiwgdGhpcy5vblJlYWR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRldGFjaCgpIHtcbiAgICAgICAgICB0aGlzLmZhbmN5Ym94Lm9mZihcImluaXRMYXlvdXRcIiwgdGhpcy5vblJlYWR5KSwgdGhpcy5jbGVhbnVwKCk7XG4gICAgICAgIH1cblxuICAgICAgfSxcbiAgICAgIFRodW1iczogQyxcbiAgICAgIEh0bWw6IFAsXG4gICAgICBUb29sYmFyOiBrLFxuICAgICAgSW1hZ2U6IFQsXG4gICAgICBIYXNoOiBMXG4gICAgfTtcbiAgICBjb25zdCBNID0ge1xuICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgIHByZWxvYWQ6IDEsXG4gICAgICBpbmZpbml0ZTogITAsXG4gICAgICBzaG93Q2xhc3M6IFwiZmFuY3lib3gtem9vbUluVXBcIixcbiAgICAgIGhpZGVDbGFzczogXCJmYW5jeWJveC1mYWRlT3V0XCIsXG4gICAgICBhbmltYXRlZDogITAsXG4gICAgICBoaWRlU2Nyb2xsYmFyOiAhMCxcbiAgICAgIHBhcmVudEVsOiBudWxsLFxuICAgICAgbWFpbkNsYXNzOiBudWxsLFxuICAgICAgYXV0b0ZvY3VzOiAhMCxcbiAgICAgIHRyYXBGb2N1czogITAsXG4gICAgICBwbGFjZUZvY3VzQmFjazogITAsXG4gICAgICBjbGljazogXCJjbG9zZVwiLFxuICAgICAgY2xvc2VCdXR0b246IFwiaW5zaWRlXCIsXG4gICAgICBkcmFnVG9DbG9zZTogITAsXG4gICAgICBrZXlib2FyZDoge1xuICAgICAgICBFc2NhcGU6IFwiY2xvc2VcIixcbiAgICAgICAgRGVsZXRlOiBcImNsb3NlXCIsXG4gICAgICAgIEJhY2tzcGFjZTogXCJjbG9zZVwiLFxuICAgICAgICBQYWdlVXA6IFwibmV4dFwiLFxuICAgICAgICBQYWdlRG93bjogXCJwcmV2XCIsXG4gICAgICAgIEFycm93VXA6IFwibmV4dFwiLFxuICAgICAgICBBcnJvd0Rvd246IFwicHJldlwiLFxuICAgICAgICBBcnJvd1JpZ2h0OiBcIm5leHRcIixcbiAgICAgICAgQXJyb3dMZWZ0OiBcInByZXZcIlxuICAgICAgfSxcbiAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgIGNsb3NlQnV0dG9uOiAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHRhYmluZGV4PVwiLTFcIj48cGF0aCBkPVwiTTIwIDIwTDQgNG0xNiAwTDQgMjBcIi8+PC9zdmc+JyxcbiAgICAgICAgc3Bpbm5lcjogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiNTBcIiBoZWlnaHQ9XCI1MFwiIHZpZXdCb3g9XCIyNSAyNSA1MCA1MFwiIHRhYmluZGV4PVwiLTFcIj48Y2lyY2xlIGN4PVwiNTBcIiBjeT1cIjUwXCIgcj1cIjIwXCIvPjwvc3ZnPicsXG4gICAgICAgIG1haW46IG51bGxcbiAgICAgIH0sXG4gICAgICBsMTBuOiB7XG4gICAgICAgIENMT1NFOiBcIkNsb3NlXCIsXG4gICAgICAgIE5FWFQ6IFwiTmV4dFwiLFxuICAgICAgICBQUkVWOiBcIlByZXZpb3VzXCIsXG4gICAgICAgIE1PREFMOiBcIllvdSBjYW4gY2xvc2UgdGhpcyBtb2RhbCBjb250ZW50IHdpdGggdGhlIEVTQyBrZXlcIixcbiAgICAgICAgRVJST1I6IFwiU29tZXRoaW5nIFdlbnQgV3JvbmcsIFBsZWFzZSBUcnkgQWdhaW4gTGF0ZXJcIixcbiAgICAgICAgSU1BR0VfRVJST1I6IFwiSW1hZ2UgTm90IEZvdW5kXCIsXG4gICAgICAgIEVMRU1FTlRfTk9UX0ZPVU5EOiBcIkhUTUwgRWxlbWVudCBOb3QgRm91bmRcIixcbiAgICAgICAgQUpBWF9OT1RfRk9VTkQ6IFwiRXJyb3IgTG9hZGluZyBBSkFYIDogTm90IEZvdW5kXCIsXG4gICAgICAgIEFKQVhfRk9SQklEREVOOiBcIkVycm9yIExvYWRpbmcgQUpBWCA6IEZvcmJpZGRlblwiLFxuICAgICAgICBJRlJBTUVfRVJST1I6IFwiRXJyb3IgTG9hZGluZyBQYWdlXCIsXG4gICAgICAgIFRPR0dMRV9aT09NOiBcIlRvZ2dsZSB6b29tIGxldmVsXCIsXG4gICAgICAgIFRPR0dMRV9USFVNQlM6IFwiVG9nZ2xlIHRodW1ibmFpbHNcIixcbiAgICAgICAgVE9HR0xFX1NMSURFU0hPVzogXCJUb2dnbGUgc2xpZGVzaG93XCIsXG4gICAgICAgIFRPR0dMRV9GVUxMU0NSRUVOOiBcIlRvZ2dsZSBmdWxsLXNjcmVlbiBtb2RlXCIsXG4gICAgICAgIERPV05MT0FEOiBcIkRvd25sb2FkXCJcbiAgICAgIH1cbiAgICB9LFxuICAgICAgICAgIEkgPSBuZXcgTWFwKCk7XG4gICAgbGV0IEYgPSAwO1xuXG4gICAgY2xhc3MgUiBleHRlbmRzIGwge1xuICAgICAgY29uc3RydWN0b3IodCwgaSA9IHt9KSB7XG4gICAgICAgIHQgPSB0Lm1hcCh0ID0+ICh0LndpZHRoICYmICh0Ll93aWR0aCA9IHQud2lkdGgpLCB0LmhlaWdodCAmJiAodC5faGVpZ2h0ID0gdC5oZWlnaHQpLCB0KSksIHN1cGVyKGUoITAsIHt9LCBNLCBpKSksIHRoaXMuYmluZEhhbmRsZXJzKCksIHRoaXMuc3RhdGUgPSBcImluaXRcIiwgdGhpcy5zZXRJdGVtcyh0KSwgdGhpcy5hdHRhY2hQbHVnaW5zKFIuUGx1Z2lucyksIHRoaXMudHJpZ2dlcihcImluaXRcIiksICEwID09PSB0aGlzLm9wdGlvbihcImhpZGVTY3JvbGxiYXJcIikgJiYgdGhpcy5oaWRlU2Nyb2xsYmFyKCksIHRoaXMuaW5pdExheW91dCgpLCB0aGlzLmluaXRDYXJvdXNlbCgpLCB0aGlzLmF0dGFjaEV2ZW50cygpLCBJLnNldCh0aGlzLmlkLCB0aGlzKSwgdGhpcy50cmlnZ2VyKFwicHJlcGFyZVwiKSwgdGhpcy5zdGF0ZSA9IFwicmVhZHlcIiwgdGhpcy50cmlnZ2VyKFwicmVhZHlcIiksIHRoaXMuJGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcImZhbHNlXCIpLCB0aGlzLm9wdGlvbihcInRyYXBGb2N1c1wiKSAmJiB0aGlzLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbih0LCAuLi5lKSB7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLmdldFNsaWRlKCk7XG4gICAgICAgIGxldCBzID0gaSA/IGlbdF0gOiB2b2lkIDA7XG4gICAgICAgIHJldHVybiB2b2lkIDAgIT09IHMgPyAoXCJmdW5jdGlvblwiID09IHR5cGVvZiBzICYmIChzID0gcy5jYWxsKHRoaXMsIHRoaXMsIC4uLmUpKSwgcykgOiBzdXBlci5vcHRpb24odCwgLi4uZSk7XG4gICAgICB9XG5cbiAgICAgIGJpbmRIYW5kbGVycygpIHtcbiAgICAgICAgZm9yIChjb25zdCB0IG9mIFtcIm9uTW91c2Vkb3duXCIsIFwib25LZXlkb3duXCIsIFwib25DbGlja1wiLCBcIm9uRm9jdXNcIiwgXCJvbkNyZWF0ZVNsaWRlXCIsIFwib25TZXR0bGVcIiwgXCJvblRvdWNoTW92ZVwiLCBcIm9uVG91Y2hFbmRcIiwgXCJvblRyYW5zZm9ybVwiXSkgdGhpc1t0XSA9IHRoaXNbdF0uYmluZCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoRXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMub25Nb3VzZWRvd24pLCBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uS2V5ZG93biwgITApLCB0aGlzLm9wdGlvbihcInRyYXBGb2N1c1wiKSAmJiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy5vbkZvY3VzLCAhMCksIHRoaXMuJGNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5vbkNsaWNrKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoRXZlbnRzKCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMub25Nb3VzZWRvd24pLCBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLm9uS2V5ZG93biwgITApLCBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgdGhpcy5vbkZvY3VzLCAhMCksIHRoaXMuJGNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5vbkNsaWNrKTtcbiAgICAgIH1cblxuICAgICAgaW5pdExheW91dCgpIHtcbiAgICAgICAgdGhpcy4kcm9vdCA9IHRoaXMub3B0aW9uKFwicGFyZW50RWxcIikgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgbGV0IHQgPSB0aGlzLm9wdGlvbihcInRlbXBsYXRlLm1haW5cIik7XG4gICAgICAgIHQgJiYgKHRoaXMuJHJvb3QuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlZW5kXCIsIHRoaXMubG9jYWxpemUodCkpLCB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRyb290LnF1ZXJ5U2VsZWN0b3IoXCIuZmFuY3lib3hfX2NvbnRhaW5lclwiKSksIHRoaXMuJGNvbnRhaW5lciB8fCAodGhpcy4kY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgdGhpcy4kcm9vdC5hcHBlbmRDaGlsZCh0aGlzLiRjb250YWluZXIpKSwgdGhpcy4kY29udGFpbmVyLm9uc2Nyb2xsID0gKCkgPT4gKHRoaXMuJGNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMCwgITEpLCBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2NvbnRhaW5lclwiLFxuICAgICAgICAgIHJvbGU6IFwiZGlhbG9nXCIsXG4gICAgICAgICAgdGFiSW5kZXg6IFwiLTFcIixcbiAgICAgICAgICBcImFyaWEtbW9kYWxcIjogXCJ0cnVlXCIsXG4gICAgICAgICAgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIixcbiAgICAgICAgICBcImFyaWEtbGFiZWxcIjogdGhpcy5sb2NhbGl6ZShcInt7TU9EQUx9fVwiKVxuICAgICAgICB9KS5mb3JFYWNoKHQgPT4gdGhpcy4kY29udGFpbmVyLnNldEF0dHJpYnV0ZSguLi50KSksIHRoaXMub3B0aW9uKFwiYW5pbWF0ZWRcIikgJiYgdGhpcy4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJpcy1hbmltYXRlZFwiKSwgdGhpcy4kYmFja2Ryb3AgPSB0aGlzLiRjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5mYW5jeWJveF9fYmFja2Ryb3BcIiksIHRoaXMuJGJhY2tkcm9wIHx8ICh0aGlzLiRiYWNrZHJvcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHRoaXMuJGJhY2tkcm9wLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveF9fYmFja2Ryb3BcIiksIHRoaXMuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLiRiYWNrZHJvcCkpLCB0aGlzLiRjYXJvdXNlbCA9IHRoaXMuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmZhbmN5Ym94X19jYXJvdXNlbFwiKSwgdGhpcy4kY2Fyb3VzZWwgfHwgKHRoaXMuJGNhcm91c2VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgdGhpcy4kY2Fyb3VzZWwuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94X19jYXJvdXNlbFwiKSwgdGhpcy4kY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuJGNhcm91c2VsKSksIHRoaXMuJGNvbnRhaW5lci5GYW5jeWJveCA9IHRoaXMsIHRoaXMuaWQgPSB0aGlzLiRjb250YWluZXIuZ2V0QXR0cmlidXRlKFwiaWRcIiksIHRoaXMuaWQgfHwgKHRoaXMuaWQgPSB0aGlzLm9wdGlvbnMuaWQgfHwgKytGLCB0aGlzLiRjb250YWluZXIuc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJmYW5jeWJveC1cIiArIHRoaXMuaWQpKTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMub3B0aW9uKFwibWFpbkNsYXNzXCIpO1xuICAgICAgICByZXR1cm4gZSAmJiB0aGlzLiRjb250YWluZXIuY2xhc3NMaXN0LmFkZCguLi5lLnNwbGl0KFwiIFwiKSksIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2l0aC1mYW5jeWJveFwiKSwgdGhpcy50cmlnZ2VyKFwiaW5pdExheW91dFwiKSwgdGhpcztcbiAgICAgIH1cblxuICAgICAgc2V0SXRlbXModCkge1xuICAgICAgICBjb25zdCBlID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBpIG9mIHQpIHtcbiAgICAgICAgICBjb25zdCB0ID0gaS4kdHJpZ2dlcjtcblxuICAgICAgICAgIGlmICh0KSB7XG4gICAgICAgICAgICBjb25zdCBlID0gdC5kYXRhc2V0IHx8IHt9O1xuICAgICAgICAgICAgaS5zcmMgPSBlLnNyYyB8fCB0LmdldEF0dHJpYnV0ZShcImhyZWZcIikgfHwgaS5zcmMsIGkudHlwZSA9IGUudHlwZSB8fCBpLnR5cGUsICFpLnNyYyAmJiB0IGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCAmJiAoaS5zcmMgPSB0LmN1cnJlbnRTcmMgfHwgaS4kdHJpZ2dlci5zcmMpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBzID0gaS4kdGh1bWI7XG5cbiAgICAgICAgICBpZiAoIXMpIHtcbiAgICAgICAgICAgIGxldCB0ID0gaS4kdHJpZ2dlciAmJiBpLiR0cmlnZ2VyLm9yaWdUYXJnZXQ7XG4gICAgICAgICAgICB0ICYmIChzID0gdCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgPyB0IDogdC5xdWVyeVNlbGVjdG9yKFwiaW1nOm5vdChbYXJpYS1oaWRkZW5dKVwiKSksICFzICYmIGkuJHRyaWdnZXIgJiYgKHMgPSBpLiR0cmlnZ2VyIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCA/IGkuJHRyaWdnZXIgOiBpLiR0cmlnZ2VyLnF1ZXJ5U2VsZWN0b3IoXCJpbWc6bm90KFthcmlhLWhpZGRlbl0pXCIpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpLiR0aHVtYiA9IHMgfHwgbnVsbDtcbiAgICAgICAgICBsZXQgbyA9IGkudGh1bWI7XG4gICAgICAgICAgIW8gJiYgcyAmJiAobyA9IHMuY3VycmVudFNyYyB8fCBzLnNyYywgIW8gJiYgcy5kYXRhc2V0ICYmIChvID0gcy5kYXRhc2V0LmxhenlTcmMgfHwgcy5kYXRhc2V0LnNyYykpLCBvIHx8IFwiaW1hZ2VcIiAhPT0gaS50eXBlIHx8IChvID0gaS5zcmMpLCBpLnRodW1iID0gbyB8fCBudWxsLCBpLmNhcHRpb24gPSBpLmNhcHRpb24gfHwgXCJcIiwgZS5wdXNoKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5pdGVtcyA9IGU7XG4gICAgICB9XG5cbiAgICAgIGluaXRDYXJvdXNlbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuQ2Fyb3VzZWwgPSBuZXcgeSh0aGlzLiRjYXJvdXNlbCwgZSghMCwge30sIHtcbiAgICAgICAgICBwcmVmaXg6IFwiXCIsXG4gICAgICAgICAgY2xhc3NOYW1lczoge1xuICAgICAgICAgICAgdmlld3BvcnQ6IFwiZmFuY3lib3hfX3ZpZXdwb3J0XCIsXG4gICAgICAgICAgICB0cmFjazogXCJmYW5jeWJveF9fdHJhY2tcIixcbiAgICAgICAgICAgIHNsaWRlOiBcImZhbmN5Ym94X19zbGlkZVwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0ZXh0U2VsZWN0aW9uOiAhMCxcbiAgICAgICAgICBwcmVsb2FkOiB0aGlzLm9wdGlvbihcInByZWxvYWRcIiksXG4gICAgICAgICAgZnJpY3Rpb246IC44OCxcbiAgICAgICAgICBzbGlkZXM6IHRoaXMuaXRlbXMsXG4gICAgICAgICAgaW5pdGlhbFBhZ2U6IHRoaXMub3B0aW9ucy5zdGFydEluZGV4LFxuICAgICAgICAgIHNsaWRlc1BlclBhZ2U6IDEsXG4gICAgICAgICAgaW5maW5pdGVYOiB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpLFxuICAgICAgICAgIGluZmluaXRlWTogITAsXG4gICAgICAgICAgbDEwbjogdGhpcy5vcHRpb24oXCJsMTBuXCIpLFxuICAgICAgICAgIERvdHM6ICExLFxuICAgICAgICAgIE5hdmlnYXRpb246IHtcbiAgICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgICAgbWFpbjogXCJmYW5jeWJveF9fbmF2XCIsXG4gICAgICAgICAgICAgIGJ1dHRvbjogXCJjYXJvdXNlbF9fYnV0dG9uXCIsXG4gICAgICAgICAgICAgIG5leHQ6IFwiaXMtbmV4dFwiLFxuICAgICAgICAgICAgICBwcmV2OiBcImlzLXByZXZcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgUGFuem9vbToge1xuICAgICAgICAgICAgdGV4dFNlbGVjdGlvbjogITAsXG4gICAgICAgICAgICBwYW5Pbmx5Wm9vbWVkOiAoKSA9PiB0aGlzLkNhcm91c2VsICYmIHRoaXMuQ2Fyb3VzZWwucGFnZXMgJiYgdGhpcy5DYXJvdXNlbC5wYWdlcy5sZW5ndGggPCAyICYmICF0aGlzLm9wdGlvbihcImRyYWdUb0Nsb3NlXCIpLFxuICAgICAgICAgICAgbG9ja0F4aXM6ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuQ2Fyb3VzZWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgdCA9IFwieFwiO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbihcImRyYWdUb0Nsb3NlXCIpICYmICh0ICs9IFwieVwiKSwgdDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgb246IHtcbiAgICAgICAgICAgIFwiKlwiOiAodCwgLi4uZSkgPT4gdGhpcy50cmlnZ2VyKGBDYXJvdXNlbC4ke3R9YCwgLi4uZSksXG4gICAgICAgICAgICBpbml0OiB0ID0+IHRoaXMuQ2Fyb3VzZWwgPSB0LFxuICAgICAgICAgICAgY3JlYXRlU2xpZGU6IHRoaXMub25DcmVhdGVTbGlkZSxcbiAgICAgICAgICAgIHNldHRsZTogdGhpcy5vblNldHRsZVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcy5vcHRpb24oXCJDYXJvdXNlbFwiKSkpLCB0aGlzLm9wdGlvbihcImRyYWdUb0Nsb3NlXCIpICYmIHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS5vbih7XG4gICAgICAgICAgdG91Y2hNb3ZlOiB0aGlzLm9uVG91Y2hNb3ZlLFxuICAgICAgICAgIGFmdGVyVHJhbnNmb3JtOiB0aGlzLm9uVHJhbnNmb3JtLFxuICAgICAgICAgIHRvdWNoRW5kOiB0aGlzLm9uVG91Y2hFbmRcbiAgICAgICAgfSksIHRoaXMudHJpZ2dlcihcImluaXRDYXJvdXNlbFwiKSwgdGhpcztcbiAgICAgIH1cblxuICAgICAgb25DcmVhdGVTbGlkZSh0LCBlKSB7XG4gICAgICAgIGxldCBpID0gZS5jYXB0aW9uIHx8IFwiXCI7XG5cbiAgICAgICAgaWYgKFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgdGhpcy5vcHRpb25zLmNhcHRpb24gJiYgKGkgPSB0aGlzLm9wdGlvbnMuY2FwdGlvbi5jYWxsKHRoaXMsIHRoaXMsIHRoaXMuQ2Fyb3VzZWwsIGUpKSwgXCJzdHJpbmdcIiA9PSB0eXBlb2YgaSAmJiBpLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxuICAgICAgICAgICAgICAgIHMgPSBgZmFuY3lib3hfX2NhcHRpb25fJHt0aGlzLmlkfV8ke2UuaW5kZXh9YDtcbiAgICAgICAgICB0LmNsYXNzTmFtZSA9IFwiZmFuY3lib3hfX2NhcHRpb25cIiwgdC5pbm5lckhUTUwgPSBpLCB0LnNldEF0dHJpYnV0ZShcImlkXCIsIHMpLCBlLiRjYXB0aW9uID0gZS4kZWwuYXBwZW5kQ2hpbGQodCksIGUuJGVsLmNsYXNzTGlzdC5hZGQoXCJoYXMtY2FwdGlvblwiKSwgZS4kZWwuc2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbGxlZGJ5XCIsIHMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG9uU2V0dGxlKCkge1xuICAgICAgICB0aGlzLm9wdGlvbihcImF1dG9Gb2N1c1wiKSAmJiB0aGlzLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIG9uRm9jdXModCkge1xuICAgICAgICB0aGlzLmlzVG9wbW9zdCgpICYmIHRoaXMuZm9jdXModCk7XG4gICAgICB9XG5cbiAgICAgIG9uQ2xpY2sodCkge1xuICAgICAgICBpZiAodC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG4gICAgICAgIGxldCBlID0gdC5jb21wb3NlZFBhdGgoKVswXTtcbiAgICAgICAgaWYgKGUubWF0Y2hlcyhcIltkYXRhLWZhbmN5Ym94LWNsb3NlXVwiKSkgcmV0dXJuIHQucHJldmVudERlZmF1bHQoKSwgdm9pZCBSLmNsb3NlKCExLCB0KTtcbiAgICAgICAgaWYgKGUubWF0Y2hlcyhcIltkYXRhLWZhbmN5Ym94LW5leHRdXCIpKSByZXR1cm4gdC5wcmV2ZW50RGVmYXVsdCgpLCB2b2lkIFIubmV4dCgpO1xuICAgICAgICBpZiAoZS5tYXRjaGVzKFwiW2RhdGEtZmFuY3lib3gtcHJldl1cIikpIHJldHVybiB0LnByZXZlbnREZWZhdWx0KCksIHZvaWQgUi5wcmV2KCk7XG4gICAgICAgIGNvbnN0IGkgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gICAgICAgIGlmIChpKSB7XG4gICAgICAgICAgaWYgKGkuY2xvc2VzdChcIltjb250ZW50ZWRpdGFibGVdXCIpKSByZXR1cm47XG4gICAgICAgICAgZS5tYXRjaGVzKHgpIHx8IGkuYmx1cigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUuY2xvc2VzdChcIi5mYW5jeWJveF9fY29udGVudFwiKSkgcmV0dXJuO1xuICAgICAgICBpZiAoZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKS5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgaWYgKCExID09PSB0aGlzLnRyaWdnZXIoXCJjbGlja1wiLCB0KSkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5vcHRpb24oXCJjbGlja1wiKSkge1xuICAgICAgICAgIGNhc2UgXCJjbG9zZVwiOlxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwibmV4dFwiOlxuICAgICAgICAgICAgdGhpcy5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25Ub3VjaE1vdmUoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmdldFNsaWRlKCkuUGFuem9vbTtcbiAgICAgICAgcmV0dXJuICF0IHx8IDEgPT09IHQuY29udGVudC5zY2FsZTtcbiAgICAgIH1cblxuICAgICAgb25Ub3VjaEVuZCh0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0LmRyYWdPZmZzZXQueTtcbiAgICAgICAgTWF0aC5hYnMoZSkgPj0gMTUwIHx8IE1hdGguYWJzKGUpID49IDM1ICYmIHQuZHJhZ09mZnNldC50aW1lIDwgMzUwID8gKHRoaXMub3B0aW9uKFwiaGlkZUNsYXNzXCIpICYmICh0aGlzLmdldFNsaWRlKCkuaGlkZUNsYXNzID0gXCJmYW5jeWJveC10aHJvd091dFwiICsgKHQuY29udGVudC55IDwgMCA/IFwiVXBcIiA6IFwiRG93blwiKSksIHRoaXMuY2xvc2UoKSkgOiBcInlcIiA9PT0gdC5sb2NrQXhpcyAmJiB0LnBhblRvKHtcbiAgICAgICAgICB5OiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBvblRyYW5zZm9ybSh0KSB7XG4gICAgICAgIGlmICh0aGlzLiRiYWNrZHJvcCkge1xuICAgICAgICAgIGNvbnN0IGUgPSBNYXRoLmFicyh0LmNvbnRlbnQueSksXG4gICAgICAgICAgICAgICAgaSA9IGUgPCAxID8gXCJcIiA6IE1hdGgubWF4KC4zMywgTWF0aC5taW4oMSwgMSAtIGUgLyB0LmNvbnRlbnQuZml0SGVpZ2h0ICogMS41KSk7XG4gICAgICAgICAgdGhpcy4kY29udGFpbmVyLnN0eWxlLnNldFByb3BlcnR5KFwiLS1mYW5jeWJveC10c1wiLCBpID8gXCIwc1wiIDogXCJcIiksIHRoaXMuJGNvbnRhaW5lci5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tZmFuY3lib3gtb3BhY2l0eVwiLCBpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvbk1vdXNlZG93bigpIHtcbiAgICAgICAgXCJyZWFkeVwiID09PSB0aGlzLnN0YXRlICYmIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcImlzLXVzaW5nLW1vdXNlXCIpO1xuICAgICAgfVxuXG4gICAgICBvbktleWRvd24odCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNUb3Btb3N0KCkpIHJldHVybjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtdXNpbmctbW91c2VcIik7XG4gICAgICAgIGNvbnN0IGUgPSB0LmtleSxcbiAgICAgICAgICAgICAgaSA9IHRoaXMub3B0aW9uKFwia2V5Ym9hcmRcIik7XG4gICAgICAgIGlmICghaSB8fCB0LmN0cmxLZXkgfHwgdC5hbHRLZXkgfHwgdC5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzID0gdC5jb21wb3NlZFBhdGgoKVswXSxcbiAgICAgICAgICAgICAgbyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jbGFzc0xpc3QsXG4gICAgICAgICAgICAgIG4gPSBvICYmIG8uY29udGFpbnMoXCJjYXJvdXNlbF9fYnV0dG9uXCIpO1xuXG4gICAgICAgIGlmIChcIkVzY2FwZVwiICE9PSBlICYmICFuKSB7XG4gICAgICAgICAgaWYgKHQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlIHx8IC0xICE9PSBbXCJCVVRUT05cIiwgXCJURVhUQVJFQVwiLCBcIk9QVElPTlwiLCBcIklOUFVUXCIsIFwiU0VMRUNUXCIsIFwiVklERU9cIl0uaW5kZXhPZihzLm5vZGVOYW1lKSkgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCExID09PSB0aGlzLnRyaWdnZXIoXCJrZXlkb3duXCIsIGUsIHQpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGEgPSBpW2VdO1xuICAgICAgICBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHRoaXNbYV0gJiYgdGhpc1thXSgpO1xuICAgICAgfVxuXG4gICAgICBnZXRTbGlkZSgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuQ2Fyb3VzZWw7XG4gICAgICAgIGlmICghdCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGUgPSBudWxsID09PSB0LnBhZ2UgPyB0Lm9wdGlvbihcImluaXRpYWxQYWdlXCIpIDogdC5wYWdlLFxuICAgICAgICAgICAgICBpID0gdC5wYWdlcyB8fCBbXTtcbiAgICAgICAgcmV0dXJuIGkubGVuZ3RoICYmIGlbZV0gPyBpW2VdLnNsaWRlc1swXSA6IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGZvY3VzKHQpIHtcbiAgICAgICAgaWYgKFIuaWdub3JlRm9jdXNDaGFuZ2UpIHJldHVybjtcbiAgICAgICAgaWYgKFtcImluaXRcIiwgXCJjbG9zaW5nXCIsIFwiY3VzdG9tQ2xvc2luZ1wiLCBcImRlc3Ryb3lcIl0uaW5kZXhPZih0aGlzLnN0YXRlKSA+IC0xKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLiRjb250YWluZXIsXG4gICAgICAgICAgICAgIGkgPSB0aGlzLmdldFNsaWRlKCksXG4gICAgICAgICAgICAgIHMgPSBcImRvbmVcIiA9PT0gaS5zdGF0ZSA/IGkuJGVsIDogbnVsbDtcbiAgICAgICAgaWYgKHMgJiYgcy5jb250YWlucyhkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkgcmV0dXJuO1xuICAgICAgICB0ICYmIHQucHJldmVudERlZmF1bHQoKSwgUi5pZ25vcmVGb2N1c0NoYW5nZSA9ICEwO1xuICAgICAgICBjb25zdCBvID0gQXJyYXkuZnJvbShlLnF1ZXJ5U2VsZWN0b3JBbGwoeCkpO1xuICAgICAgICBsZXQgbixcbiAgICAgICAgICAgIGEgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCB0IG9mIG8pIHtcbiAgICAgICAgICBjb25zdCBlID0gdC5vZmZzZXRQYXJlbnQsXG4gICAgICAgICAgICAgICAgaSA9IHMgJiYgcy5jb250YWlucyh0KSxcbiAgICAgICAgICAgICAgICBvID0gIXRoaXMuQ2Fyb3VzZWwuJHZpZXdwb3J0LmNvbnRhaW5zKHQpO1xuICAgICAgICAgIGUgJiYgKGkgfHwgbykgPyAoYS5wdXNoKHQpLCB2b2lkIDAgIT09IHQuZGF0YXNldC5vcmlnVGFiaW5kZXggJiYgKHQudGFiSW5kZXggPSB0LmRhdGFzZXQub3JpZ1RhYmluZGV4LCB0LnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtb3JpZy10YWJpbmRleFwiKSksICh0Lmhhc0F0dHJpYnV0ZShcImF1dG9Gb2N1c1wiKSB8fCAhbiAmJiBpICYmICF0LmNsYXNzTGlzdC5jb250YWlucyhcImNhcm91c2VsX19idXR0b25cIikpICYmIChuID0gdCkpIDogKHQuZGF0YXNldC5vcmlnVGFiaW5kZXggPSB2b2lkIDAgPT09IHQuZGF0YXNldC5vcmlnVGFiaW5kZXggPyB0LmdldEF0dHJpYnV0ZShcInRhYmluZGV4XCIpIDogdC5kYXRhc2V0Lm9yaWdUYWJpbmRleCwgdC50YWJJbmRleCA9IC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHQgPyBhLmluZGV4T2YodC50YXJnZXQpID4gLTEgPyB0aGlzLmxhc3RGb2N1cyA9IHQudGFyZ2V0IDogdGhpcy5sYXN0Rm9jdXMgPT09IGUgPyB3KGFbYS5sZW5ndGggLSAxXSkgOiB3KGUpIDogdGhpcy5vcHRpb24oXCJhdXRvRm9jdXNcIikgJiYgbiA/IHcobikgOiBhLmluZGV4T2YoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkgPCAwICYmIHcoZSksIHRoaXMubGFzdEZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCwgUi5pZ25vcmVGb2N1c0NoYW5nZSA9ICExO1xuICAgICAgfVxuXG4gICAgICBoaWRlU2Nyb2xsYmFyKCkge1xuICAgICAgICBpZiAoIXYpIHJldHVybjtcbiAgICAgICAgY29uc3QgdCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoLFxuICAgICAgICAgICAgICBlID0gXCJmYW5jeWJveC1zdHlsZS1ub3Njcm9sbFwiO1xuICAgICAgICBsZXQgaSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGUpO1xuICAgICAgICBpIHx8IHQgPiAwICYmIChpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpLCBpLmlkID0gZSwgaS50eXBlID0gXCJ0ZXh0L2Nzc1wiLCBpLmlubmVySFRNTCA9IGAuY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFyIHtwYWRkaW5nLXJpZ2h0OiAke3R9cHg7fWAsIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXS5hcHBlbmRDaGlsZChpKSwgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwiY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFyXCIpKTtcbiAgICAgIH1cblxuICAgICAgcmV2ZWFsU2Nyb2xsYmFyKCkge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJjb21wZW5zYXRlLWZvci1zY3JvbGxiYXJcIik7XG4gICAgICAgIGNvbnN0IHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZhbmN5Ym94LXN0eWxlLW5vc2Nyb2xsXCIpO1xuICAgICAgICB0ICYmIHQucmVtb3ZlKCk7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyQ29udGVudCh0KSB7XG4gICAgICAgIHRoaXMuQ2Fyb3VzZWwudHJpZ2dlcihcInJlbW92ZVNsaWRlXCIsIHQpLCB0LiRjb250ZW50ICYmICh0LiRjb250ZW50LnJlbW92ZSgpLCB0LiRjb250ZW50ID0gbnVsbCksIHQuJGNsb3NlQnV0dG9uICYmICh0LiRjbG9zZUJ1dHRvbi5yZW1vdmUoKSwgdC4kY2xvc2VCdXR0b24gPSBudWxsKSwgdC5fY2xhc3NOYW1lICYmIHQuJGVsLmNsYXNzTGlzdC5yZW1vdmUodC5fY2xhc3NOYW1lKTtcbiAgICAgIH1cblxuICAgICAgc2V0Q29udGVudCh0LCBlLCBpID0ge30pIHtcbiAgICAgICAgbGV0IHM7XG4gICAgICAgIGNvbnN0IG8gPSB0LiRlbDtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgW1wiaW1nXCIsIFwiaWZyYW1lXCIsIFwidmlkZW9cIiwgXCJhdWRpb1wiXS5pbmRleE9mKGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPiAtMSA/IChzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgcy5hcHBlbmRDaGlsZChlKSkgOiBzID0gZTtlbHNlIHtcbiAgICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoZSk7XG4gICAgICAgICAgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHMuYXBwZW5kQ2hpbGQodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQuZmlsdGVyICYmICF0LmVycm9yICYmIChzID0gcy5xdWVyeVNlbGVjdG9yKHQuZmlsdGVyKSksIHMgaW5zdGFuY2VvZiBFbGVtZW50KSByZXR1cm4gdC5fY2xhc3NOYW1lID0gYGhhcy0ke2kuc3VmZml4IHx8IHQudHlwZSB8fCBcInVua25vd25cIn1gLCBvLmNsYXNzTGlzdC5hZGQodC5fY2xhc3NOYW1lKSwgcy5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX2NvbnRlbnRcIiksIFwibm9uZVwiICE9PSBzLnN0eWxlLmRpc3BsYXkgJiYgXCJub25lXCIgIT09IGdldENvbXB1dGVkU3R5bGUocykuZ2V0UHJvcGVydHlWYWx1ZShcImRpc3BsYXlcIikgfHwgKHMuc3R5bGUuZGlzcGxheSA9IHQuZGlzcGxheSB8fCB0aGlzLm9wdGlvbihcImRlZmF1bHREaXNwbGF5XCIpIHx8IFwiZmxleFwiKSwgdC5pZCAmJiBzLnNldEF0dHJpYnV0ZShcImlkXCIsIHQuaWQpLCB0LiRjb250ZW50ID0gcywgby5wcmVwZW5kKHMpLCB0aGlzLm1hbmFnZUNsb3NlQnV0dG9uKHQpLCBcImxvYWRpbmdcIiAhPT0gdC5zdGF0ZSAmJiB0aGlzLnJldmVhbENvbnRlbnQodCksIHM7XG4gICAgICAgIHRoaXMuc2V0RXJyb3IodCwgXCJ7e0VMRU1FTlRfTk9UX0ZPVU5EfX1cIik7XG4gICAgICB9XG5cbiAgICAgIG1hbmFnZUNsb3NlQnV0dG9uKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHZvaWQgMCA9PT0gdC5jbG9zZUJ1dHRvbiA/IHRoaXMub3B0aW9uKFwiY2xvc2VCdXR0b25cIikgOiB0LmNsb3NlQnV0dG9uO1xuICAgICAgICBpZiAoIWUgfHwgXCJ0b3BcIiA9PT0gZSAmJiB0aGlzLiRjbG9zZUJ1dHRvbikgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJ1dHRvblwiKTtcbiAgICAgICAgaS5jbGFzc0xpc3QuYWRkKFwiY2Fyb3VzZWxfX2J1dHRvblwiLCBcImlzLWNsb3NlXCIpLCBpLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIHRoaXMub3B0aW9ucy5sMTBuLkNMT1NFKSwgaS5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbihcInRlbXBsYXRlLmNsb3NlQnV0dG9uXCIpLCBpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0ID0+IHRoaXMuY2xvc2UodCkpLCBcImluc2lkZVwiID09PSBlID8gKHQuJGNsb3NlQnV0dG9uICYmIHQuJGNsb3NlQnV0dG9uLnJlbW92ZSgpLCB0LiRjbG9zZUJ1dHRvbiA9IHQuJGNvbnRlbnQuYXBwZW5kQ2hpbGQoaSkpIDogdGhpcy4kY2xvc2VCdXR0b24gPSB0aGlzLiRjb250YWluZXIuaW5zZXJ0QmVmb3JlKGksIHRoaXMuJGNvbnRhaW5lci5maXJzdENoaWxkKTtcbiAgICAgIH1cblxuICAgICAgcmV2ZWFsQ29udGVudCh0KSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcihcInJldmVhbFwiLCB0KSwgdC4kY29udGVudC5zdHlsZS52aXNpYmlsaXR5ID0gXCJcIjtcbiAgICAgICAgbGV0IGUgPSAhMTtcbiAgICAgICAgdC5lcnJvciB8fCBcImxvYWRpbmdcIiA9PT0gdC5zdGF0ZSB8fCBudWxsICE9PSB0aGlzLkNhcm91c2VsLnByZXZQYWdlIHx8IHQuaW5kZXggIT09IHRoaXMub3B0aW9ucy5zdGFydEluZGV4IHx8IChlID0gdm9pZCAwID09PSB0LnNob3dDbGFzcyA/IHRoaXMub3B0aW9uKFwic2hvd0NsYXNzXCIpIDogdC5zaG93Q2xhc3MpLCBlID8gKHQuc3RhdGUgPSBcImFuaW1hdGluZ1wiLCB0aGlzLmFuaW1hdGVDU1ModC4kY29udGVudCwgZSwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9uZSh0KTtcbiAgICAgICAgfSkpIDogdGhpcy5kb25lKHQpO1xuICAgICAgfVxuXG4gICAgICBhbmltYXRlQ1NTKHQsIGUsIGkpIHtcbiAgICAgICAgaWYgKHQgJiYgdC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImFuaW1hdGlvbmVuZFwiLCB7XG4gICAgICAgICAgYnViYmxlczogITAsXG4gICAgICAgICAgY2FuY2VsYWJsZTogITBcbiAgICAgICAgfSkpLCAhdCB8fCAhZSkgcmV0dXJuIHZvaWQgKFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgaSAmJiBpKCkpO1xuXG4gICAgICAgIGNvbnN0IHMgPSBmdW5jdGlvbiAobykge1xuICAgICAgICAgIG8uY3VycmVudFRhcmdldCA9PT0gdGhpcyAmJiAodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYW5pbWF0aW9uZW5kXCIsIHMpLCBpICYmIGkoKSwgdC5jbGFzc0xpc3QucmVtb3ZlKGUpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0LmFkZEV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwgcyksIHQuY2xhc3NMaXN0LmFkZChlKTtcbiAgICAgIH1cblxuICAgICAgZG9uZSh0KSB7XG4gICAgICAgIHQuc3RhdGUgPSBcImRvbmVcIiwgdGhpcy50cmlnZ2VyKFwiZG9uZVwiLCB0KTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZ2V0U2xpZGUoKTtcbiAgICAgICAgZSAmJiB0LmluZGV4ID09PSBlLmluZGV4ICYmIHRoaXMub3B0aW9uKFwiYXV0b0ZvY3VzXCIpICYmIHRoaXMuZm9jdXMoKTtcbiAgICAgIH1cblxuICAgICAgc2V0RXJyb3IodCwgZSkge1xuICAgICAgICB0LmVycm9yID0gZSwgdGhpcy5oaWRlTG9hZGluZyh0KSwgdGhpcy5jbGVhckNvbnRlbnQodCk7XG4gICAgICAgIGNvbnN0IGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBpLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveC1lcnJvclwiKSwgaS5pbm5lckhUTUwgPSB0aGlzLmxvY2FsaXplKGUgfHwgXCI8cD57e0VSUk9SfX08L3A+XCIpLCB0aGlzLnNldENvbnRlbnQodCwgaSwge1xuICAgICAgICAgIHN1ZmZpeDogXCJlcnJvclwiXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzaG93TG9hZGluZyh0KSB7XG4gICAgICAgIHQuc3RhdGUgPSBcImxvYWRpbmdcIiwgdC4kZWwuY2xhc3NMaXN0LmFkZChcImlzLWxvYWRpbmdcIik7XG4gICAgICAgIGxldCBlID0gdC4kZWwucXVlcnlTZWxlY3RvcihcIi5mYW5jeWJveF9fc3Bpbm5lclwiKTtcbiAgICAgICAgZSB8fCAoZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIGUuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94X19zcGlubmVyXCIpLCBlLmlubmVySFRNTCA9IHRoaXMub3B0aW9uKFwidGVtcGxhdGUuc3Bpbm5lclwiKSwgZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS52ZWxvY2l0eSB8fCB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH0pLCB0LiRlbC5wcmVwZW5kKGUpKTtcbiAgICAgIH1cblxuICAgICAgaGlkZUxvYWRpbmcodCkge1xuICAgICAgICBjb25zdCBlID0gdC4kZWwgJiYgdC4kZWwucXVlcnlTZWxlY3RvcihcIi5mYW5jeWJveF9fc3Bpbm5lclwiKTtcbiAgICAgICAgZSAmJiAoZS5yZW1vdmUoKSwgdC4kZWwuY2xhc3NMaXN0LnJlbW92ZShcImlzLWxvYWRpbmdcIikpLCBcImxvYWRpbmdcIiA9PT0gdC5zdGF0ZSAmJiAodGhpcy50cmlnZ2VyKFwibG9hZFwiLCB0KSwgdC5zdGF0ZSA9IFwicmVhZHlcIik7XG4gICAgICB9XG5cbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLkNhcm91c2VsO1xuICAgICAgICB0ICYmIHQucGFnZXMubGVuZ3RoID4gMSAmJiB0LnNsaWRlTmV4dCgpO1xuICAgICAgfVxuXG4gICAgICBwcmV2KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5DYXJvdXNlbDtcbiAgICAgICAgdCAmJiB0LnBhZ2VzLmxlbmd0aCA+IDEgJiYgdC5zbGlkZVByZXYoKTtcbiAgICAgIH1cblxuICAgICAganVtcFRvKC4uLnQpIHtcbiAgICAgICAgdGhpcy5DYXJvdXNlbCAmJiB0aGlzLkNhcm91c2VsLnNsaWRlVG8oLi4udCk7XG4gICAgICB9XG5cbiAgICAgIGlzQ2xvc2luZygpIHtcbiAgICAgICAgcmV0dXJuIFtcImNsb3NpbmdcIiwgXCJjdXN0b21DbG9zaW5nXCIsIFwiZGVzdHJveVwiXS5pbmNsdWRlcyh0aGlzLnN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgaXNUb3Btb3N0KCkge1xuICAgICAgICByZXR1cm4gUi5nZXRJbnN0YW5jZSgpLmlkID09IHRoaXMuaWQ7XG4gICAgICB9XG5cbiAgICAgIGNsb3NlKHQpIHtcbiAgICAgICAgaWYgKHQgJiYgdC5wcmV2ZW50RGVmYXVsdCgpLCB0aGlzLmlzQ2xvc2luZygpKSByZXR1cm47XG4gICAgICAgIGlmICghMSA9PT0gdGhpcy50cmlnZ2VyKFwic2hvdWxkQ2xvc2VcIiwgdCkpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPSBcImNsb3NpbmdcIiwgdGhpcy5DYXJvdXNlbC5QYW56b29tLmRlc3Ryb3koKSwgdGhpcy5kZXRhY2hFdmVudHMoKSwgdGhpcy50cmlnZ2VyKFwiY2xvc2luZ1wiLCB0KSwgXCJkZXN0cm95XCIgPT09IHRoaXMuc3RhdGUpIHJldHVybjtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKSwgdGhpcy4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJpcy1jbG9zaW5nXCIpO1xuICAgICAgICBjb25zdCBlID0gdGhpcy5nZXRTbGlkZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLkNhcm91c2VsLnNsaWRlcy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIHQuJGNvbnRlbnQgJiYgdC5pbmRleCAhPT0gZS5pbmRleCAmJiB0aGlzLkNhcm91c2VsLnRyaWdnZXIoXCJyZW1vdmVTbGlkZVwiLCB0KTtcbiAgICAgICAgfSksIFwiY2xvc2luZ1wiID09PSB0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgY29uc3QgdCA9IHZvaWQgMCA9PT0gZS5oaWRlQ2xhc3MgPyB0aGlzLm9wdGlvbihcImhpZGVDbGFzc1wiKSA6IGUuaGlkZUNsYXNzO1xuICAgICAgICAgIHRoaXMuYW5pbWF0ZUNTUyhlLiRjb250ZW50LCB0LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICAgICAgICB9LCAhMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgaWYgKFwiZGVzdHJveVwiID09PSB0aGlzLnN0YXRlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImRlc3Ryb3lcIiwgdGhpcy50cmlnZ2VyKFwiZGVzdHJveVwiKTtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMub3B0aW9uKFwicGxhY2VGb2N1c0JhY2tcIikgPyB0aGlzLm9wdGlvbihcInRyaWdnZXJUYXJnZXRcIiwgdGhpcy5nZXRTbGlkZSgpLiR0cmlnZ2VyKSA6IG51bGw7XG4gICAgICAgIHRoaXMuQ2Fyb3VzZWwuZGVzdHJveSgpLCB0aGlzLmRldGFjaFBsdWdpbnMoKSwgdGhpcy5DYXJvdXNlbCA9IG51bGwsIHRoaXMub3B0aW9ucyA9IHt9LCB0aGlzLmV2ZW50cyA9IHt9LCB0aGlzLiRjb250YWluZXIucmVtb3ZlKCksIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJGJhY2tkcm9wID0gdGhpcy4kY2Fyb3VzZWwgPSBudWxsLCB0ICYmIHcodCksIEkuZGVsZXRlKHRoaXMuaWQpO1xuICAgICAgICBjb25zdCBlID0gUi5nZXRJbnN0YW5jZSgpO1xuICAgICAgICBlID8gZS5mb2N1cygpIDogKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwid2l0aC1mYW5jeWJveFwiKSwgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtdXNpbmctbW91c2VcIiksIHRoaXMucmV2ZWFsU2Nyb2xsYmFyKCkpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgc2hvdyh0LCBlID0ge30pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSKHQsIGUpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZnJvbUV2ZW50KHQsIGUgPSB7fSkge1xuICAgICAgICBpZiAodC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG4gICAgICAgIGlmICh0LmJ1dHRvbiAmJiAwICE9PSB0LmJ1dHRvbikgcmV0dXJuO1xuICAgICAgICBpZiAodC5jdHJsS2V5IHx8IHQubWV0YUtleSB8fCB0LnNoaWZ0S2V5KSByZXR1cm47XG4gICAgICAgIGNvbnN0IGkgPSB0LmNvbXBvc2VkUGF0aCgpWzBdO1xuICAgICAgICBsZXQgcyxcbiAgICAgICAgICAgIG8sXG4gICAgICAgICAgICBuLFxuICAgICAgICAgICAgYSA9IGk7XG5cbiAgICAgICAgaWYgKChhLm1hdGNoZXMoXCJbZGF0YS1mYW5jeWJveC10cmlnZ2VyXVwiKSB8fCAoYSA9IGEuY2xvc2VzdChcIltkYXRhLWZhbmN5Ym94LXRyaWdnZXJdXCIpKSkgJiYgKGUudHJpZ2dlclRhcmdldCA9IGEsIHMgPSBhICYmIGEuZGF0YXNldCAmJiBhLmRhdGFzZXQuZmFuY3lib3hUcmlnZ2VyKSwgcykge1xuICAgICAgICAgIGNvbnN0IHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1mYW5jeWJveD1cIiR7c31cIl1gKSxcbiAgICAgICAgICAgICAgICBlID0gcGFyc2VJbnQoYS5kYXRhc2V0LmZhbmN5Ym94SW5kZXgsIDEwKSB8fCAwO1xuICAgICAgICAgIGEgPSB0Lmxlbmd0aCA/IHRbZV0gOiBhO1xuICAgICAgICB9XG5cbiAgICAgICAgQXJyYXkuZnJvbShSLm9wZW5lcnMua2V5cygpKS5yZXZlcnNlKCkuc29tZShlID0+IHtcbiAgICAgICAgICBuID0gYSB8fCBpO1xuICAgICAgICAgIGxldCBzID0gITE7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbiBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgKFwic3RyaW5nXCIgPT0gdHlwZW9mIGUgfHwgZSBpbnN0YW5jZW9mIFN0cmluZykgJiYgKHMgPSBuLm1hdGNoZXMoZSkgfHwgKG4gPSBuLmNsb3Nlc3QoZSkpKTtcbiAgICAgICAgICB9IGNhdGNoICh0KSB7fVxuXG4gICAgICAgICAgcmV0dXJuICEhcyAmJiAodC5wcmV2ZW50RGVmYXVsdCgpLCBvID0gZSwgITApO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHIgPSAhMTtcblxuICAgICAgICBpZiAobykge1xuICAgICAgICAgIGUuZXZlbnQgPSB0LCBlLnRhcmdldCA9IG4sIG4ub3JpZ1RhcmdldCA9IGksIHIgPSBSLmZyb21PcGVuZXIobywgZSk7XG4gICAgICAgICAgY29uc3QgcyA9IFIuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICBzICYmIFwicmVhZHlcIiA9PT0gcy5zdGF0ZSAmJiB0LmRldGFpbCAmJiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJpcy11c2luZy1tb3VzZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZnJvbU9wZW5lcih0LCBpID0ge30pIHtcbiAgICAgICAgbGV0IHMgPSBbXSxcbiAgICAgICAgICAgIG8gPSBpLnN0YXJ0SW5kZXggfHwgMCxcbiAgICAgICAgICAgIG4gPSBpLnRhcmdldCB8fCBudWxsO1xuICAgICAgICBjb25zdCBhID0gdm9pZCAwICE9PSAoaSA9IGUoe30sIGksIFIub3BlbmVycy5nZXQodCkpKS5ncm91cEFsbCAmJiBpLmdyb3VwQWxsLFxuICAgICAgICAgICAgICByID0gdm9pZCAwID09PSBpLmdyb3VwQXR0ciA/IFwiZGF0YS1mYW5jeWJveFwiIDogaS5ncm91cEF0dHIsXG4gICAgICAgICAgICAgIGggPSByICYmIG4gPyBuLmdldEF0dHJpYnV0ZShgJHtyfWApIDogXCJcIjtcblxuICAgICAgICBpZiAoIW4gfHwgaCB8fCBhKSB7XG4gICAgICAgICAgY29uc3QgZSA9IGkucm9vdCB8fCAobiA/IG4uZ2V0Um9vdE5vZGUoKSA6IGRvY3VtZW50LmJvZHkpO1xuICAgICAgICAgIHMgPSBbXS5zbGljZS5jYWxsKGUucXVlcnlTZWxlY3RvckFsbCh0KSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobiAmJiAhYSAmJiAocyA9IGggPyBzLmZpbHRlcih0ID0+IHQuZ2V0QXR0cmlidXRlKGAke3J9YCkgPT09IGgpIDogW25dKSwgIXMubGVuZ3RoKSByZXR1cm4gITE7XG4gICAgICAgIGNvbnN0IGwgPSBSLmdldEluc3RhbmNlKCk7XG4gICAgICAgIHJldHVybiAhKGwgJiYgcy5pbmRleE9mKGwub3B0aW9ucy4kdHJpZ2dlcikgPiAtMSkgJiYgKG8gPSBuID8gcy5pbmRleE9mKG4pIDogbywgcyA9IHMubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgY29uc3QgZSA9IFtcImZhbHNlXCIsIFwiMFwiLCBcIm5vXCIsIFwibnVsbFwiLCBcInVuZGVmaW5lZFwiXSxcbiAgICAgICAgICAgICAgICBpID0gW1widHJ1ZVwiLCBcIjFcIiwgXCJ5ZXNcIl0sXG4gICAgICAgICAgICAgICAgcyA9IE9iamVjdC5hc3NpZ24oe30sIHQuZGF0YXNldCksXG4gICAgICAgICAgICAgICAgbyA9IHt9O1xuXG4gICAgICAgICAgZm9yIChsZXQgW3QsIG5dIG9mIE9iamVjdC5lbnRyaWVzKHMpKSBpZiAoXCJmYW5jeWJveFwiICE9PSB0KSBpZiAoXCJ3aWR0aFwiID09PSB0IHx8IFwiaGVpZ2h0XCIgPT09IHQpIG9bYF8ke3R9YF0gPSBuO2Vsc2UgaWYgKFwic3RyaW5nXCIgPT0gdHlwZW9mIG4gfHwgbiBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihuKSA+IC0xKSBvW3RdID0gITE7ZWxzZSBpZiAoaS5pbmRleE9mKG9bdF0pID4gLTEpIG9bdF0gPSAhMDtlbHNlIHRyeSB7XG4gICAgICAgICAgICAgIG9bdF0gPSBKU09OLnBhcnNlKG4pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBvW3RdID0gbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Ugb1t0XSA9IG47XG5cbiAgICAgICAgICByZXR1cm4gdCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgKG8uJHRyaWdnZXIgPSB0KSwgbztcbiAgICAgICAgfSksIG5ldyBSKHMsIGUoe30sIGksIHtcbiAgICAgICAgICBzdGFydEluZGV4OiBvLFxuICAgICAgICAgICR0cmlnZ2VyOiBuXG4gICAgICAgIH0pKSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBiaW5kKHQsIGUgPSB7fSkge1xuICAgICAgICBmdW5jdGlvbiBpKCkge1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIFIuZnJvbUV2ZW50LCAhMSk7XG4gICAgICAgIH1cblxuICAgICAgICB2ICYmIChSLm9wZW5lcnMuc2l6ZSB8fCAoL2NvbXBsZXRlfGludGVyYWN0aXZlfGxvYWRlZC8udGVzdChkb2N1bWVudC5yZWFkeVN0YXRlKSA/IGkoKSA6IGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGkpKSwgUi5vcGVuZXJzLnNldCh0LCBlKSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyB1bmJpbmQodCkge1xuICAgICAgICBSLm9wZW5lcnMuZGVsZXRlKHQpLCBSLm9wZW5lcnMuc2l6ZSB8fCBSLmRlc3Ryb3koKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGRlc3Ryb3koKSB7XG4gICAgICAgIGxldCB0O1xuXG4gICAgICAgIGZvciAoOyB0ID0gUi5nZXRJbnN0YW5jZSgpOykgdC5kZXN0cm95KCk7XG5cbiAgICAgICAgUi5vcGVuZXJzID0gbmV3IE1hcCgpLCBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBSLmZyb21FdmVudCwgITEpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZ2V0SW5zdGFuY2UodCkge1xuICAgICAgICBpZiAodCkgcmV0dXJuIEkuZ2V0KHQpO1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShJLnZhbHVlcygpKS5yZXZlcnNlKCkuZmluZCh0ID0+ICF0LmlzQ2xvc2luZygpICYmIHQpIHx8IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBjbG9zZSh0ID0gITAsIGUpIHtcbiAgICAgICAgaWYgKHQpIGZvciAoY29uc3QgdCBvZiBJLnZhbHVlcygpKSB0LmNsb3NlKGUpO2Vsc2Uge1xuICAgICAgICAgIGNvbnN0IHQgPSBSLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgdCAmJiB0LmNsb3NlKGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBuZXh0KCkge1xuICAgICAgICBjb25zdCB0ID0gUi5nZXRJbnN0YW5jZSgpO1xuICAgICAgICB0ICYmIHQubmV4dCgpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgcHJldigpIHtcbiAgICAgICAgY29uc3QgdCA9IFIuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdCAmJiB0LnByZXYoKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIFIudmVyc2lvbiA9IFwiNC4wLjMxXCIsIFIuZGVmYXVsdHMgPSBNLCBSLm9wZW5lcnMgPSBuZXcgTWFwKCksIFIuUGx1Z2lucyA9IE8sIFIuYmluZChcIltkYXRhLWZhbmN5Ym94XVwiKTtcblxuICAgIGZvciAoY29uc3QgW3QsIGVdIG9mIE9iamVjdC5lbnRyaWVzKFIuUGx1Z2lucyB8fCB7fSkpIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZS5jcmVhdGUgJiYgZS5jcmVhdGUoUik7XG5cbiAgICAvKlxyXG4gICAgc29tZSBjb21tZW50XHJcbiAgICAqL1xuICAgIHZhciB3cGNmN0VsbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53cGNmNycpO1xuXG4gICAgaWYgKHdwY2Y3RWxtKSB7XG4gICAgICB3cGNmN0VsbS5hZGRFdmVudExpc3RlbmVyKCd3cGNmN21haWxzZW50JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICBjbG9zZSgpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgICAgd3BjZjdFbG0uYWRkRXZlbnRMaXN0ZW5lcignd3BjZjdzdWJtaXQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zb2xlLmxvZygnc3VibWl0dGVkJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsvL1x0XHRcdGNvbnNvbGUubG9nKCQoc2VsZikuZmluZCgnZGl2LndwY2Y3LXJlc3BvbnNlLW91dHB1dCcpLmh0bWwoKSk7XG4gICAgICAgICAgLy9cdFx0XHR2YXIgcmVzcG9uc2VPdXRwdXQgPSAkKHNlbGYpLmZpbmQoJ2Rpdi53cGNmNy1yZXNwb25zZS1vdXRwdXQnKS5odG1sKCk7XG4gICAgICAgICAgLy9cdFx0XHRGYW5jeWJveC5vcGVuKHJlc3BvbnNlT3V0cHV0KTtcblxuICAgICAgICAgIC8qXHJcbiAgICAgICAgICBjb25zdCBmYW5jeWJveCA9IG5ldyBGYW5jeWJveChbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgIFx0c3JjOiBcIjxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LjwvcD5cIixcclxuICAgICAgICAgIFx0dHlwZTogXCJodG1sXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICBdKTtcclxuICAgICAgICAgICovXG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuICAgIC8qXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4gICAgXHQkKCcud3BjZjcnKS5vbignd3BjZjdtYWlsc2VudCcsZnVuY3Rpb24oKXtcclxuICAgIFx0XHQkLmZhbmN5Ym94LmNsb3NlKCB0cnVlICk7XHJcbiAgICBcdH0pO1xyXG4gICAgXHQkKCcud3BjZjcnKS5vbignd3BjZjdzdWJtaXQnLGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgIFx0XHQvL2NvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgIFx0XHQvL2NvbnNvbGUubG9nKCdzb21lJyk7XHJcbiAgICBcdFx0dmFyIHNlbGY9dGhpcztcclxuICAgIFx0XHR3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgXHRcdGNvbnNvbGUubG9nKCQoc2VsZikuZmluZCgnZGl2LndwY2Y3LXJlc3BvbnNlLW91dHB1dCcpLmh0bWwoKSk7XHJcbiAgICBcdFx0dmFyIHJlc3BvbnNlT3V0cHV0ID0gJChzZWxmKS5maW5kKCdkaXYud3BjZjctcmVzcG9uc2Utb3V0cHV0JykuaHRtbCgpO1xyXG4gICAgXHRcdFx0XHRqUXVlcnkuZmFuY3lib3gub3BlbihyZXNwb25zZU91dHB1dCk7XHJcbiAgICBcdH0sMTAwKTtcclxuICAgIFx0fSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAqL1xuXG4gICAgLy8gaW1wb3J0IFN3aXBlciwgeyBQYXJhbGxheCwgUGFnaW5hdGlvbiwgQXV0b3BsYXksIEZyZWVNb2RlLCBNb3VzZXdoZWVsLCBTY3JvbGxiYXIsIE5hdmlnYXRpb24gfSBmcm9tICdzd2lwZXInO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHJlYWR5KTtcblxuICAgIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgICAgLy8gYnVyZ2VyXG4gICAgICBsZXQgYnVyZ2VyQnRucyA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ1cmdlclwiKV07XG4gICAgICBsZXQgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpO1xuICAgICAgbGV0IGh0bWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiaHRtbFwiKTtcblxuICAgICAgZm9yIChjb25zdCBidXJnZXJCdG4gb2YgYnVyZ2VyQnRucykge1xuICAgICAgICBidXJnZXJCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBidXJnZXJCdG4uY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICBib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgaHRtbC5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH0gLy8gYnVyZ2VyIGVuZFxuICAgICAgLy8gc2xpZGVyc1xuXG5cbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmV3cy1zbGlkZXInKSkge1xuICAgICAgICBsZXQgbmV3c1NsaWRlciA9IG5ldyBTd2lwZXIoXCIubmV3cy1zbGlkZXJcIiwge1xuICAgICAgICAgIG1vZHVsZXM6IFtQYWdpbmF0aW9uLCBOYXZpZ2F0aW9uXSxcbiAgICAgICAgICB3YXRjaE92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIHNwZWVkOiA4MDAsXG4gICAgICAgICAgb2JzZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVBhcmVudHM6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVNsaWRlQ2hpbGRyZW46IHRydWUsXG4gICAgICAgICAgcGFnaW5hdGlvbjoge1xuICAgICAgICAgICAgZWw6IFwiLm5ld3Mtc2xpZGVyIC5wYWdpbmF0aW9uXCIsXG4gICAgICAgICAgICBjbGlja2FibGU6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIG5hdmlnYXRpb246IHtcbiAgICAgICAgICAgIG5leHRFbDogXCIubmV3cy1zbGlkZXIgLmJ1dHRvbi1uZXh0XCIsXG4gICAgICAgICAgICBwcmV2RWw6IFwiLm5ld3Mtc2xpZGVyIC5idXR0b24tcHJldlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBicmVha3BvaW50czoge1xuICAgICAgICAgICAgMzIwOiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogMTVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA2NDA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiA0NVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDc2ODoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDQ1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTAyNDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDQ1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTI4MDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiA0LFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDY3XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYXJ0bmVycy1zbGlkZXInKSkge1xuICAgICAgICBsZXQgcGFydG5lcnNTbGlkZXIgPSBuZXcgU3dpcGVyKFwiLnBhcnRuZXJzLXNsaWRlclwiLCB7XG4gICAgICAgICAgbW9kdWxlczogW0F1dG9wbGF5XSxcbiAgICAgICAgICB3YXRjaE92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIHNwZWVkOiA4MDAsXG4gICAgICAgICAgb2JzZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVBhcmVudHM6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVNsaWRlQ2hpbGRyZW46IHRydWUsXG4gICAgICAgICAgYXV0b3BsYXk6IHtcbiAgICAgICAgICAgIGRlbGF5OiAyMDAwLFxuICAgICAgICAgICAgZGlzYWJsZU9uSW50ZXJhY3Rpb246IGZhbHNlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b3BsYXkuc3RvcCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b3BsYXkuc3RhcnQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9LFxuICAgICAgICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICAgICAgICAzMjA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAyNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDY0MDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDI1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgNzY4OiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogMzVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAxMDI0OiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogNDVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAxMjgwOiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDQsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogNjBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlci1yYWRhJykpIHtcbiAgICAgICAgbGV0IHBhcnRuZXJzU2xpZGVyID0gbmV3IFN3aXBlcihcIi5zbGlkZXItcmFkYVwiLCB7XG4gICAgICAgICAgbW9kdWxlczogW05hdmlnYXRpb25dLFxuICAgICAgICAgIHdhdGNoT3ZlcmZsb3c6IHRydWUsXG4gICAgICAgICAgc3BlZWQ6IDgwMCxcbiAgICAgICAgICBvYnNlcnZlcjogdHJ1ZSxcbiAgICAgICAgICBvYnNlcnZlUGFyZW50czogdHJ1ZSxcbiAgICAgICAgICBvYnNlcnZlU2xpZGVDaGlsZHJlbjogdHJ1ZSxcbiAgICAgICAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICAgICAgICBuZXh0RWw6IFwiLnNsaWRlci1yYWRhIC5idXR0b24tbmV4dFwiLFxuICAgICAgICAgICAgcHJldkVsOiBcIi5zbGlkZXItcmFkYSAuYnV0dG9uLXByZXZcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnJlYWtwb2ludHM6IHtcbiAgICAgICAgICAgIDMyMDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDE1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgNjQwOiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA3Njg6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAzNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDEwMjQ6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiA0NVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDEyODA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAxNTBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlci1mb3RvLXNtYWxsJykpIHtcbiAgICAgICAgbGV0IGZvdG9TbWFsbFNsaWRlciA9IG5ldyBTd2lwZXIoXCIuc2xpZGVyLWZvdG8tc21hbGxcIiwge1xuICAgICAgICAgIG1vZHVsZXM6IFtdLFxuICAgICAgICAgIHdhdGNoT3ZlcmZsb3c6IHRydWUsXG4gICAgICAgICAgc3BlZWQ6IDgwMCxcbiAgICAgICAgICBvYnNlcnZlcjogdHJ1ZSxcbiAgICAgICAgICBvYnNlcnZlUGFyZW50czogdHJ1ZSxcbiAgICAgICAgICBvYnNlcnZlU2xpZGVDaGlsZHJlbjogdHJ1ZSxcbiAgICAgICAgICBzbGlkZXNQZXJWaWV3OiA1LFxuICAgICAgICAgIHNwYWNlQmV0d2VlbjogNTAsXG4gICAgICAgICAgZnJlZU1vZGU6IHRydWUsXG4gICAgICAgICAgYnJlYWtwb2ludHM6IHtcbiAgICAgICAgICAgIDMyMDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDMwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgNjQwOiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogMzBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA3Njg6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAzMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDEwMjQ6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogNCxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiA0MFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDEyODA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogNSxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiA1MFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGxldCBmb3RvU2xpZGVyID0gbmV3IFN3aXBlcihcIi5zbGlkZXItZm90b1wiLCB7XG4gICAgICAgICAgbW9kdWxlczogW05hdmlnYXRpb24sIFRodW1iXSxcbiAgICAgICAgICB3YXRjaE92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIHNwZWVkOiA4MDAsXG4gICAgICAgICAgb2JzZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVBhcmVudHM6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVNsaWRlQ2hpbGRyZW46IHRydWUsXG4gICAgICAgICAgc3BhY2VCZXR3ZWVuOiAzMCxcbiAgICAgICAgICB0aHVtYnM6IHtcbiAgICAgICAgICAgIHN3aXBlcjogZm90b1NtYWxsU2xpZGVyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICAgICAgICBuZXh0RWw6IFwiLnNsaWRlci1mb3RvIC5idXR0b24tbmV4dFwiLFxuICAgICAgICAgICAgcHJldkVsOiBcIi5zbGlkZXItZm90byAuYnV0dG9uLXByZXZcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmV3cy1wcm9ncmFtLXNsaWRlcicpKSB7XG4gICAgICAgIGxldCBmb3RvU21hbGxTbGlkZXIgPSBuZXcgU3dpcGVyKFwiLm5ld3MtcHJvZ3JhbS1zbGlkZXJcIiwge1xuICAgICAgICAgIG1vZHVsZXM6IFtOYXZpZ2F0aW9uXSxcbiAgICAgICAgICB3YXRjaE92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIHNwZWVkOiA4MDAsXG4gICAgICAgICAgb2JzZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVBhcmVudHM6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVNsaWRlQ2hpbGRyZW46IHRydWUsXG4gICAgICAgICAgbmF2aWdhdGlvbjoge1xuICAgICAgICAgICAgbmV4dEVsOiBcIi5uZXdzLXByb2dyYW0tc2xpZGVyIC5idXR0b24tbmV4dFwiLFxuICAgICAgICAgICAgcHJldkVsOiBcIi5uZXdzLXByb2dyYW0tc2xpZGVyIC5idXR0b24tcHJldlwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBicmVha3BvaW50czoge1xuICAgICAgICAgICAgMzIwOiB7XG4gICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDEsXG4gICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogMzBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA2NDA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAzMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDc2ODoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDQwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTAyNDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDYwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTI4MDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDgwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gLy8gc2xpZGVycyBlbmRcbiAgICAgIC8vIHNwb2xlciBtZW51IGFuaW1cblxuXG4gICAgICBsZXQgbWVudUl0ZW1IYXNDaGlsZHJlbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tZW51LWl0ZW0taGFzLWNoaWxkcmVuJyk7XG4gICAgICBsZXQgaXRlciA9IDA7XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2libGVTdWJNZW51KCkge1xuICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMjc5KSB7XG4gICAgICAgICAgaXRlcisrO1xuICAgICAgICAgIG1lbnVJdGVtSGFzQ2hpbGRyZW4uZm9yRWFjaChlbGVtID0+IHtcbiAgICAgICAgICAgIGxldCBjb3VudGVyID0gMDtcbiAgICAgICAgICAgIGxldCBzdWJNZW51ID0gZWxlbS5xdWVyeVNlbGVjdG9yKCcuc3ViLW1lbnUnKTtcbiAgICAgICAgICAgIGxldCBlbGVtSGVpZ2h0ID0gc3ViTWVudS5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgICBzdWJNZW51LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICAgICAgICAgIHN1Yk1lbnUuc3R5bGUubWF4SGVpZ2h0ID0gMCArICdweCc7XG4gICAgICAgICAgICBzdWJNZW51LnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgICBsZXQgc3ViTWVudSA9IGVsZW0ucXVlcnlTZWxlY3RvcignLnN1Yi1tZW51Jyk7XG5cbiAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoJy5tZW51LWl0ZW0nKSAmJiAhZS50YXJnZXQuY2xvc2VzdCgnLnN1Yi1tZW51JykpIHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICBzdWJNZW51LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICAgICAgICAgICAgICBzdWJNZW51LnN0eWxlLm1heEhlaWdodCA9IGVsZW1IZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgc3ViTWVudS5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgICAgICAgICAgIGNvdW50ZXIrKztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgc3ViTWVudS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICAgICAgICBzdWJNZW51LnN0eWxlLm1heEhlaWdodCA9IDAgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgc3ViTWVudS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmlzaWJsZVN1Yk1lbnUoKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PiB7XG4gICAgICAgIGlmICh3aW5kb3cuaW5uZXJXaWR0aCA8IDEyNzkgJiYgaXRlciA8IDEpIHtcbiAgICAgICAgICB2aXNpYmxlU3ViTWVudSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMTI4MCkge1xuICAgICAgICAgIGxldCBzdWJNZW51cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zdWItbWVudScpO1xuICAgICAgICAgIHN1Yk1lbnVzLmZvckVhY2goZWxlbSA9PiB7XG4gICAgICAgICAgICBlbGVtLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7IC8vIHNwb2xlciBtZW51IGFuaW0gZW5kXG4gICAgICAvLyB0YWJzXG5cbiAgICAgIGNvbnN0IHRhYnNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhYnNfX25hdi1idG5cIik7XG4gICAgICB0YWJzQnRuLmZvckVhY2gob25UYWJDbGljayk7XG5cbiAgICAgIGZ1bmN0aW9uIG9uVGFiQ2xpY2soaXRlbSkge1xuICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbGV0IGN1cnJlbnRCdG4gPSBpdGVtO1xuICAgICAgICAgIGxldCB0YWJJZCA9IGN1cnJlbnRCdG4uZ2V0QXR0cmlidXRlKFwiZGF0YS10YWJcIik7XG4gICAgICAgICAgbGV0IHBlcmVudFRhYiA9IGN1cnJlbnRCdG4uY2xvc2VzdCgnLnRhYnMnKTtcbiAgICAgICAgICBsZXQgY3VycmVudFRhYiA9IHBlcmVudFRhYi5xdWVyeVNlbGVjdG9yKHRhYklkKTtcbiAgICAgICAgICBsZXQgdGFic0J0biA9IHBlcmVudFRhYi5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhYnNfX25hdi1idG5cIik7XG4gICAgICAgICAgbGV0IHRhYnNJdGVtcyA9IHBlcmVudFRhYi5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhYnNfX2l0ZW1cIik7XG5cbiAgICAgICAgICBpZiAoIWN1cnJlbnRCdG4uY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgICAgICAgICAgdGFic0J0bi5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRhYnNJdGVtcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGN1cnJlbnRCdG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICAgICAgICBjdXJyZW50VGFiLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50YWJzX19uYXYtYnRuJyk7IC8vIHRhYnMgZW5kXG4gICAgICAvLyBGYW5jeWJveCBnYWxsZXJ5XG5cbiAgICAgIFIuYmluZCgnW2RhdGEtZmFuY3lib3g9XCJnYWxsZXJ5XCJdJywge1xuICAgICAgICBUb29sYmFyOiB7XG4gICAgICAgICAgZGlzcGxheTogW3tcbiAgICAgICAgICAgIGlkOiBcImNvdW50ZXJcIixcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIlxuICAgICAgICAgIH0sIFwic2xpZGVzaG93XCIsIFwiZnVsbHNjcmVlblwiLCBcImNsb3NlXCJdXG4gICAgICAgIH1cbiAgICAgIH0pOyAvLyBGYW5jeWJveCBnYWxsZXJ5IGVuZFxuICAgICAgLy8gY29weVxuXG4gICAgICBsZXQgY29weVRleHRCdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtY29weV0nKTtcblxuICAgICAgaWYgKGNvcHlUZXh0QnRucykge1xuICAgICAgICBjb3B5VGV4dEJ0bnMuZm9yRWFjaChjb3B5QnRuID0+IHtcbiAgICAgICAgICBjb3B5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyZW50RWxlbWVudCA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5kb25hdGlvbi1pdGVtJyk7XG4gICAgICAgICAgICBsZXQgY29weVRleHQgPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvcHktdGV4dF0nKTtcbiAgICAgICAgICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgICAgICAgICAgY29weVRleHQuZm9jdXMoKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3NmdWwgPSBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpOyAvLyB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cbiAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbi5jb3BpZWRbZGF0YS1jb3B5XScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29waWVkQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLmNvcGllZFtkYXRhLWNvcHldJyk7XG4gICAgICAgICAgICAgICAgY29waWVkQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2NvcGllZCcpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgbGV0IGNvcHlCdXR0b24gPSBwYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbltkYXRhLWNvcHldJyk7XG4gICAgICAgICAgICAgIGNvcHlCdXR0b24uY2xhc3NMaXN0LmFkZCgnY29waWVkJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ09vcHMsIHVuYWJsZSB0byBjb3B5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSAvLyBjb3B5IGVuZFxuXG4gICAgfVxuXG59KSkpO1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
