/*! Copyright (C) Social Suite (https://suite.id) - All Rights Reserved.
All information contained herein is, and remains the property of Social Suite.
The intellectual and technical concepts contained herein are proprietary to Social Suite.
Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Social Suite.

Parts of this code/file are provided under separate licenses, please see popup.js.LICENSE.txt */
(() => {
  var t = {
      4184: (t, e) => {
        var n;
        !(function () {
          "use strict";
          var i = {}.hasOwnProperty;
          function r() {
            for (var t = [], e = 0; e < arguments.length; e++) {
              var n = arguments[e];
              if (n) {
                var o = typeof n;
                if ("string" === o || "number" === o) t.push(n);
                else if (Array.isArray(n)) {
                  if (n.length) {
                    var _ = r.apply(null, n);
                    _ && t.push(_);
                  }
                } else if ("object" === o) {
                  if (
                    n.toString !== Object.prototype.toString &&
                    !n.toString.toString().includes("[native code]")
                  ) {
                    t.push(n.toString());
                    continue;
                  }
                  for (var s in n) i.call(n, s) && n[s] && t.push(s);
                }
              }
            }
            return t.join(" ");
          }
          t.exports
            ? ((r.default = r), (t.exports = r))
            : void 0 ===
                (n = function () {
                  return r;
                }.apply(e, [])) || (t.exports = n);
        })();
      },
    },
    e = {};
  function n(i) {
    var r = e[i];
    if (void 0 !== r) return r.exports;
    var o = (e[i] = { exports: {} });
    return t[i](o, o.exports, n), o.exports;
  }
  (n.n = (t) => {
    var e = t && t.__esModule ? () => t.default : () => t;
    return n.d(e, { a: e }), e;
  }),
    (n.d = (t, e) => {
      for (var i in e)
        n.o(e, i) &&
          !n.o(t, i) &&
          Object.defineProperty(t, i, { enumerable: !0, get: e[i] });
    }),
    (n.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
    (() => {
      "use strict";
      var t,
        e,
        i,
        r,
        o,
        _,
        s,
        l = {},
        u = [],
        a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
      function f(t, e) {
        for (var n in e) t[n] = e[n];
        return t;
      }
      function c(t) {
        var e = t.parentNode;
        e && e.removeChild(t);
      }
      function h(e, n, i) {
        var r,
          o,
          _,
          s = {};
        for (_ in n)
          "key" == _ ? (r = n[_]) : "ref" == _ ? (o = n[_]) : (s[_] = n[_]);
        if (
          (arguments.length > 2 &&
            (s.children = arguments.length > 3 ? t.call(arguments, 2) : i),
          "function" == typeof e && null != e.defaultProps)
        )
          for (_ in e.defaultProps)
            void 0 === s[_] && (s[_] = e.defaultProps[_]);
        return d(e, s, r, o, null);
      }
      function d(t, n, r, o, _) {
        var s = {
          type: t,
          props: n,
          key: r,
          ref: o,
          __k: null,
          __: null,
          __b: 0,
          __e: null,
          __d: void 0,
          __c: null,
          __h: null,
          constructor: void 0,
          __v: null == _ ? ++i : _,
        };
        return null == _ && null != e.vnode && e.vnode(s), s;
      }
      function v(t) {
        return t.children;
      }
      function p(t, e) {
        (this.props = t), (this.context = e);
      }
      function y(t, e) {
        if (null == e) return t.__ ? y(t.__, t.__.__k.indexOf(t) + 1) : null;
        for (var n; e < t.__k.length; e++)
          if (null != (n = t.__k[e]) && null != n.__e) return n.__e;
        return "function" == typeof t.type ? y(t) : null;
      }
      function m(t) {
        var e, n;
        if (null != (t = t.__) && null != t.__c) {
          for (t.__e = t.__c.base = null, e = 0; e < t.__k.length; e++)
            if (null != (n = t.__k[e]) && null != n.__e) {
              t.__e = t.__c.base = n.__e;
              break;
            }
          return m(t);
        }
      }
      function g(t) {
        ((!t.__d && (t.__d = !0) && r.push(t) && !b.__r++) ||
          o !== e.debounceRendering) &&
          ((o = e.debounceRendering) || _)(b);
      }
      function b() {
        var t, e, n, i, o, _, l, u;
        for (r.sort(s); (t = r.shift()); )
          t.__d &&
            ((e = r.length),
            (i = void 0),
            (o = void 0),
            (l = (_ = (n = t).__v).__e),
            (u = n.__P) &&
              ((i = []),
              ((o = f({}, _)).__v = _.__v + 1),
              U(
                u,
                _,
                o,
                n.__n,
                void 0 !== u.ownerSVGElement,
                null != _.__h ? [l] : null,
                i,
                null == l ? y(_) : l,
                _.__h
              ),
              C(i, _),
              _.__e != l && m(_)),
            r.length > e && r.sort(s));
        b.__r = 0;
      }
      function k(t, e, n, i, r, o, _, s, a, f) {
        var c,
          h,
          p,
          m,
          g,
          b,
          k,
          N = (i && i.__k) || u,
          P = N.length;
        for (n.__k = [], c = 0; c < e.length; c++)
          if (
            null !=
            (m = n.__k[c] =
              null == (m = e[c]) ||
              "boolean" == typeof m ||
              "function" == typeof m
                ? null
                : "string" == typeof m ||
                  "number" == typeof m ||
                  "bigint" == typeof m
                ? d(null, m, null, null, m)
                : Array.isArray(m)
                ? d(v, { children: m }, null, null, null)
                : m.__b > 0
                ? d(m.type, m.props, m.key, m.ref ? m.ref : null, m.__v)
                : m)
          ) {
            if (
              ((m.__ = n),
              (m.__b = n.__b + 1),
              null === (p = N[c]) || (p && m.key == p.key && m.type === p.type))
            )
              N[c] = void 0;
            else
              for (h = 0; h < P; h++) {
                if ((p = N[h]) && m.key == p.key && m.type === p.type) {
                  N[h] = void 0;
                  break;
                }
                p = null;
              }
            U(t, m, (p = p || l), r, o, _, s, a, f),
              (g = m.__e),
              (h = m.ref) &&
                p.ref != h &&
                (k || (k = []),
                p.ref && k.push(p.ref, null, m),
                k.push(h, m.__c || g, m)),
              null != g
                ? (null == b && (b = g),
                  "function" == typeof m.type && m.__k === p.__k
                    ? (m.__d = a = x(m, a, t))
                    : (a = w(t, m, p, N, g, a)),
                  "function" == typeof n.type && (n.__d = a))
                : a && p.__e == a && a.parentNode != t && (a = y(p));
          }
        for (n.__e = b, c = P; c--; )
          null != N[c] &&
            ("function" == typeof n.type &&
              null != N[c].__e &&
              N[c].__e == n.__d &&
              (n.__d = S(i).nextSibling),
            D(N[c], N[c]));
        if (k) for (c = 0; c < k.length; c++) A(k[c], k[++c], k[++c]);
      }
      function x(t, e, n) {
        for (var i, r = t.__k, o = 0; r && o < r.length; o++)
          (i = r[o]) &&
            ((i.__ = t),
            (e =
              "function" == typeof i.type
                ? x(i, e, n)
                : w(n, i, i, r, i.__e, e)));
        return e;
      }
      function w(t, e, n, i, r, o) {
        var _, s, l;
        if (void 0 !== e.__d) (_ = e.__d), (e.__d = void 0);
        else if (null == n || r != o || null == r.parentNode)
          t: if (null == o || o.parentNode !== t) t.appendChild(r), (_ = null);
          else {
            for (s = o, l = 0; (s = s.nextSibling) && l < i.length; l += 1)
              if (s == r) break t;
            t.insertBefore(r, o), (_ = o);
          }
        return void 0 !== _ ? _ : r.nextSibling;
      }
      function S(t) {
        var e, n, i;
        if (null == t.type || "string" == typeof t.type) return t.__e;
        if (t.__k)
          for (e = t.__k.length - 1; e >= 0; e--)
            if ((n = t.__k[e]) && (i = S(n))) return i;
        return null;
      }
      function N(t, e, n) {
        "-" === e[0]
          ? t.setProperty(e, null == n ? "" : n)
          : (t[e] =
              null == n
                ? ""
                : "number" != typeof n || a.test(e)
                ? n
                : n + "px");
      }
      function P(t, e, n, i, r) {
        var o;
        t: if ("style" === e)
          if ("string" == typeof n) t.style.cssText = n;
          else {
            if (("string" == typeof i && (t.style.cssText = i = ""), i))
              for (e in i) (n && e in n) || N(t.style, e, "");
            if (n) for (e in n) (i && n[e] === i[e]) || N(t.style, e, n[e]);
          }
        else if ("o" === e[0] && "n" === e[1])
          (o = e !== (e = e.replace(/Capture$/, ""))),
            (e = e.toLowerCase() in t ? e.toLowerCase().slice(2) : e.slice(2)),
            t.l || (t.l = {}),
            (t.l[e + o] = n),
            n
              ? i || t.addEventListener(e, o ? H : E, o)
              : t.removeEventListener(e, o ? H : E, o);
        else if ("dangerouslySetInnerHTML" !== e) {
          if (r) e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if (
            "width" !== e &&
            "height" !== e &&
            "href" !== e &&
            "list" !== e &&
            "form" !== e &&
            "tabIndex" !== e &&
            "download" !== e &&
            e in t
          )
            try {
              t[e] = null == n ? "" : n;
              break t;
            } catch (t) {}
          "function" == typeof n ||
            (null == n || (!1 === n && -1 == e.indexOf("-"))
              ? t.removeAttribute(e)
              : t.setAttribute(e, n));
        }
      }
      function E(t) {
        return this.l[t.type + !1](e.event ? e.event(t) : t);
      }
      function H(t) {
        return this.l[t.type + !0](e.event ? e.event(t) : t);
      }
      function U(t, n, i, r, o, _, s, l, u) {
        var a,
          c,
          h,
          d,
          y,
          m,
          g,
          b,
          x,
          w,
          S,
          N,
          P,
          E,
          H,
          U = n.type;
        if (void 0 !== n.constructor) return null;
        null != i.__h &&
          ((u = i.__h), (l = n.__e = i.__e), (n.__h = null), (_ = [l])),
          (a = e.__b) && a(n);
        try {
          t: if ("function" == typeof U) {
            if (
              ((b = n.props),
              (x = (a = U.contextType) && r[a.__c]),
              (w = a ? (x ? x.props.value : a.__) : r),
              i.__c
                ? (g = (c = n.__c = i.__c).__ = c.__E)
                : ("prototype" in U && U.prototype.render
                    ? (n.__c = c = new U(b, w))
                    : ((n.__c = c = new p(b, w)),
                      (c.constructor = U),
                      (c.render = T)),
                  x && x.sub(c),
                  (c.props = b),
                  c.state || (c.state = {}),
                  (c.context = w),
                  (c.__n = r),
                  (h = c.__d = !0),
                  (c.__h = []),
                  (c._sb = [])),
              null == c.__s && (c.__s = c.state),
              null != U.getDerivedStateFromProps &&
                (c.__s == c.state && (c.__s = f({}, c.__s)),
                f(c.__s, U.getDerivedStateFromProps(b, c.__s))),
              (d = c.props),
              (y = c.state),
              (c.__v = n),
              h)
            )
              null == U.getDerivedStateFromProps &&
                null != c.componentWillMount &&
                c.componentWillMount(),
                null != c.componentDidMount && c.__h.push(c.componentDidMount);
            else {
              if (
                (null == U.getDerivedStateFromProps &&
                  b !== d &&
                  null != c.componentWillReceiveProps &&
                  c.componentWillReceiveProps(b, w),
                (!c.__e &&
                  null != c.shouldComponentUpdate &&
                  !1 === c.shouldComponentUpdate(b, c.__s, w)) ||
                  n.__v === i.__v)
              ) {
                for (
                  n.__v !== i.__v &&
                    ((c.props = b), (c.state = c.__s), (c.__d = !1)),
                    c.__e = !1,
                    n.__e = i.__e,
                    n.__k = i.__k,
                    n.__k.forEach(function (t) {
                      t && (t.__ = n);
                    }),
                    S = 0;
                  S < c._sb.length;
                  S++
                )
                  c.__h.push(c._sb[S]);
                (c._sb = []), c.__h.length && s.push(c);
                break t;
              }
              null != c.componentWillUpdate &&
                c.componentWillUpdate(b, c.__s, w),
                null != c.componentDidUpdate &&
                  c.__h.push(function () {
                    c.componentDidUpdate(d, y, m);
                  });
            }
            if (
              ((c.context = w),
              (c.props = b),
              (c.__P = t),
              (N = e.__r),
              (P = 0),
              "prototype" in U && U.prototype.render)
            ) {
              for (
                c.state = c.__s,
                  c.__d = !1,
                  N && N(n),
                  a = c.render(c.props, c.state, c.context),
                  E = 0;
                E < c._sb.length;
                E++
              )
                c.__h.push(c._sb[E]);
              c._sb = [];
            } else
              do {
                (c.__d = !1),
                  N && N(n),
                  (a = c.render(c.props, c.state, c.context)),
                  (c.state = c.__s);
              } while (c.__d && ++P < 25);
            (c.state = c.__s),
              null != c.getChildContext &&
                (r = f(f({}, r), c.getChildContext())),
              h ||
                null == c.getSnapshotBeforeUpdate ||
                (m = c.getSnapshotBeforeUpdate(d, y)),
              (H =
                null != a && a.type === v && null == a.key
                  ? a.props.children
                  : a),
              k(t, Array.isArray(H) ? H : [H], n, i, r, o, _, s, l, u),
              (c.base = n.__e),
              (n.__h = null),
              c.__h.length && s.push(c),
              g && (c.__E = c.__ = null),
              (c.__e = !1);
          } else
            null == _ && n.__v === i.__v
              ? ((n.__k = i.__k), (n.__e = i.__e))
              : (n.__e = $(i.__e, n, i, r, o, _, s, u));
          (a = e.diffed) && a(n);
        } catch (t) {
          (n.__v = null),
            (u || null != _) &&
              ((n.__e = l), (n.__h = !!u), (_[_.indexOf(l)] = null)),
            e.__e(t, n, i);
        }
      }
      function C(t, n) {
        e.__c && e.__c(n, t),
          t.some(function (n) {
            try {
              (t = n.__h),
                (n.__h = []),
                t.some(function (t) {
                  t.call(n);
                });
            } catch (t) {
              e.__e(t, n.__v);
            }
          });
      }
      function $(e, n, i, r, o, _, s, u) {
        var a,
          f,
          h,
          d = i.props,
          v = n.props,
          p = n.type,
          m = 0;
        if (("svg" === p && (o = !0), null != _))
          for (; m < _.length; m++)
            if (
              (a = _[m]) &&
              "setAttribute" in a == !!p &&
              (p ? a.localName === p : 3 === a.nodeType)
            ) {
              (e = a), (_[m] = null);
              break;
            }
        if (null == e) {
          if (null === p) return document.createTextNode(v);
          (e = o
            ? document.createElementNS("http://www.w3.org/2000/svg", p)
            : document.createElement(p, v.is && v)),
            (_ = null),
            (u = !1);
        }
        if (null === p) d === v || (u && e.data === v) || (e.data = v);
        else {
          if (
            ((_ = _ && t.call(e.childNodes)),
            (f = (d = i.props || l).dangerouslySetInnerHTML),
            (h = v.dangerouslySetInnerHTML),
            !u)
          ) {
            if (null != _)
              for (d = {}, m = 0; m < e.attributes.length; m++)
                d[e.attributes[m].name] = e.attributes[m].value;
            (h || f) &&
              ((h &&
                ((f && h.__html == f.__html) || h.__html === e.innerHTML)) ||
                (e.innerHTML = (h && h.__html) || ""));
          }
          if (
            ((function (t, e, n, i, r) {
              var o;
              for (o in n)
                "children" === o ||
                  "key" === o ||
                  o in e ||
                  P(t, o, null, n[o], i);
              for (o in e)
                (r && "function" != typeof e[o]) ||
                  "children" === o ||
                  "key" === o ||
                  "value" === o ||
                  "checked" === o ||
                  n[o] === e[o] ||
                  P(t, o, e[o], n[o], i);
            })(e, v, d, o, u),
            h)
          )
            n.__k = [];
          else if (
            ((m = n.props.children),
            k(
              e,
              Array.isArray(m) ? m : [m],
              n,
              i,
              r,
              o && "foreignObject" !== p,
              _,
              s,
              _ ? _[0] : i.__k && y(i, 0),
              u
            ),
            null != _)
          )
            for (m = _.length; m--; ) null != _[m] && c(_[m]);
          u ||
            ("value" in v &&
              void 0 !== (m = v.value) &&
              (m !== e.value ||
                ("progress" === p && !m) ||
                ("option" === p && m !== d.value)) &&
              P(e, "value", m, d.value, !1),
            "checked" in v &&
              void 0 !== (m = v.checked) &&
              m !== e.checked &&
              P(e, "checked", m, d.checked, !1));
        }
        return e;
      }
      function A(t, n, i) {
        try {
          "function" == typeof t ? t(n) : (t.current = n);
        } catch (t) {
          e.__e(t, i);
        }
      }
      function D(t, n, i) {
        var r, o;
        if (
          (e.unmount && e.unmount(t),
          (r = t.ref) && ((r.current && r.current !== t.__e) || A(r, null, n)),
          null != (r = t.__c))
        ) {
          if (r.componentWillUnmount)
            try {
              r.componentWillUnmount();
            } catch (t) {
              e.__e(t, n);
            }
          (r.base = r.__P = null), (t.__c = void 0);
        }
        if ((r = t.__k))
          for (o = 0; o < r.length; o++)
            r[o] && D(r[o], n, i || "function" != typeof t.type);
        i || null == t.__e || c(t.__e), (t.__ = t.__e = t.__d = void 0);
      }
      function T(t, e, n) {
        return this.constructor(t, n);
      }
      function O(n, i, r) {
        var o, _, s;
        e.__ && e.__(n, i),
          (_ = (o = "function" == typeof r) ? null : (r && r.__k) || i.__k),
          (s = []),
          U(
            i,
            (n = ((!o && r) || i).__k = h(v, null, [n])),
            _ || l,
            l,
            void 0 !== i.ownerSVGElement,
            !o && r
              ? [r]
              : _
              ? null
              : i.firstChild
              ? t.call(i.childNodes)
              : null,
            s,
            !o && r ? r : _ ? _.__e : i.firstChild,
            o
          ),
          C(s, n);
      }
      (t = u.slice),
        (e = {
          __e: function (t, e, n, i) {
            for (var r, o, _; (e = e.__); )
              if ((r = e.__c) && !r.__)
                try {
                  if (
                    ((o = r.constructor) &&
                      null != o.getDerivedStateFromError &&
                      (r.setState(o.getDerivedStateFromError(t)), (_ = r.__d)),
                    null != r.componentDidCatch &&
                      (r.componentDidCatch(t, i || {}), (_ = r.__d)),
                    _)
                  )
                    return (r.__E = r);
                } catch (e) {
                  t = e;
                }
            throw t;
          },
        }),
        (i = 0),
        (p.prototype.setState = function (t, e) {
          var n;
          (n =
            null != this.__s && this.__s !== this.state
              ? this.__s
              : (this.__s = f({}, this.state))),
            "function" == typeof t && (t = t(f({}, n), this.props)),
            t && f(n, t),
            null != t && this.__v && (e && this._sb.push(e), g(this));
        }),
        (p.prototype.forceUpdate = function (t) {
          this.__v && ((this.__e = !0), t && this.__h.push(t), g(this));
        }),
        (p.prototype.render = v),
        (r = []),
        (_ =
          "function" == typeof Promise
            ? Promise.prototype.then.bind(Promise.resolve())
            : setTimeout),
        (s = function (t, e) {
          return t.__v.__b - e.__v.__b;
        }),
        (b.__r = 0);
      var j = function (t, e, n, i) {
          var r;
          e[0] = 0;
          for (var o = 1; o < e.length; o++) {
            var _ = e[o++],
              s = e[o] ? ((e[0] |= _ ? 1 : 2), n[e[o++]]) : e[++o];
            3 === _
              ? (i[0] = s)
              : 4 === _
              ? (i[1] = Object.assign(i[1] || {}, s))
              : 5 === _
              ? ((i[1] = i[1] || {})[e[++o]] = s)
              : 6 === _
              ? (i[1][e[++o]] += s + "")
              : _
              ? ((r = t.apply(s, j(t, s, n, ["", null]))),
                i.push(r),
                s[0] ? (e[0] |= 2) : ((e[o - 2] = 0), (e[o] = r)))
              : i.push(s);
          }
          return i;
        },
        M = new Map();
      var F = function (t) {
          var e = M.get(this);
          return (
            e || ((e = new Map()), M.set(this, e)),
            (e = j(
              this,
              e.get(t) ||
                (e.set(
                  t,
                  (e = (function (t) {
                    for (
                      var e,
                        n,
                        i = 1,
                        r = "",
                        o = "",
                        _ = [0],
                        s = function (t) {
                          1 === i &&
                          (t || (r = r.replace(/^\s*\n\s*|\s*\n\s*$/g, "")))
                            ? _.push(0, t, r)
                            : 3 === i && (t || r)
                            ? (_.push(3, t, r), (i = 2))
                            : 2 === i && "..." === r && t
                            ? _.push(4, t, 0)
                            : 2 === i && r && !t
                            ? _.push(5, 0, !0, r)
                            : i >= 5 &&
                              ((r || (!t && 5 === i)) &&
                                (_.push(i, 0, r, n), (i = 6)),
                              t && (_.push(i, t, 0, n), (i = 6))),
                            (r = "");
                        },
                        l = 0;
                      l < t.length;
                      l++
                    ) {
                      l && (1 === i && s(), s(l));
                      for (var u = 0; u < t[l].length; u++)
                        (e = t[l][u]),
                          1 === i
                            ? "<" === e
                              ? (s(), (_ = [_]), (i = 3))
                              : (r += e)
                            : 4 === i
                            ? "--" === r && ">" === e
                              ? ((i = 1), (r = ""))
                              : (r = e + r[0])
                            : o
                            ? e === o
                              ? (o = "")
                              : (r += e)
                            : '"' === e || "'" === e
                            ? (o = e)
                            : ">" === e
                            ? (s(), (i = 1))
                            : i &&
                              ("=" === e
                                ? ((i = 5), (n = r), (r = ""))
                                : "/" === e && (i < 5 || ">" === t[l][u + 1])
                                ? (s(),
                                  3 === i && (_ = _[0]),
                                  (i = _),
                                  (_ = _[0]).push(2, 0, i),
                                  (i = 0))
                                : " " === e ||
                                  "\t" === e ||
                                  "\n" === e ||
                                  "\r" === e
                                ? (s(), (i = 2))
                                : (r += e)),
                          3 === i && "!--" === r && ((i = 4), (_ = _[0]));
                    }
                    return s(), _;
                  })(t))
                ),
                e),
              arguments,
              []
            )).length > 1
              ? e
              : e[0]
          );
        }.bind(h),
        L = 0;
      function V(t, n, i, r, o, _) {
        var s,
          l,
          u = {};
        for (l in n) "ref" == l ? (s = n[l]) : (u[l] = n[l]);
        var a = {
          type: t,
          props: u,
          key: i,
          ref: s,
          __k: null,
          __: null,
          __b: 0,
          __e: null,
          __d: void 0,
          __c: null,
          __h: null,
          constructor: void 0,
          __v: --L,
          __source: o,
          __self: _,
        };
        if ("function" == typeof t && (s = t.defaultProps))
          for (l in s) void 0 === u[l] && (u[l] = s[l]);
        return e.vnode && e.vnode(a), a;
      }
      var W,
        B,
        I,
        q,
        R = n(4184),
        z = n.n(R),
        G = 0,
        K = [],
        Z = [],
        J = e.__b,
        Q = e.__r,
        X = e.diffed,
        Y = e.__c,
        tt = e.unmount;
      function et(t, n) {
        e.__h && e.__h(B, t, G || n), (G = 0);
        var i = B.__H || (B.__H = { __: [], __h: [] });
        return t >= i.__.length && i.__.push({ __V: Z }), i.__[t];
      }
      function nt(t, e) {
        var n = et(W++, 7);
        return lt(n.__H, e)
          ? ((n.__V = t()), (n.i = e), (n.__h = t), n.__V)
          : n.__;
      }
      function it() {
        for (var t; (t = K.shift()); )
          if (t.__P && t.__H)
            try {
              t.__H.__h.forEach(_t), t.__H.__h.forEach(st), (t.__H.__h = []);
            } catch (n) {
              (t.__H.__h = []), e.__e(n, t.__v);
            }
      }
      (e.__b = function (t) {
        (B = null), J && J(t);
      }),
        (e.__r = function (t) {
          Q && Q(t), (W = 0);
          var e = (B = t.__c).__H;
          e &&
            (I === B
              ? ((e.__h = []),
                (B.__h = []),
                e.__.forEach(function (t) {
                  t.__N && (t.__ = t.__N), (t.__V = Z), (t.__N = t.i = void 0);
                }))
              : (e.__h.forEach(_t), e.__h.forEach(st), (e.__h = []))),
            (I = B);
        }),
        (e.diffed = function (t) {
          X && X(t);
          var n = t.__c;
          n &&
            n.__H &&
            (n.__H.__h.length &&
              ((1 !== K.push(n) && q === e.requestAnimationFrame) ||
                ((q = e.requestAnimationFrame) || ot)(it)),
            n.__H.__.forEach(function (t) {
              t.i && (t.__H = t.i),
                t.__V !== Z && (t.__ = t.__V),
                (t.i = void 0),
                (t.__V = Z);
            })),
            (I = B = null);
        }),
        (e.__c = function (t, n) {
          n.some(function (t) {
            try {
              t.__h.forEach(_t),
                (t.__h = t.__h.filter(function (t) {
                  return !t.__ || st(t);
                }));
            } catch (i) {
              n.some(function (t) {
                t.__h && (t.__h = []);
              }),
                (n = []),
                e.__e(i, t.__v);
            }
          }),
            Y && Y(t, n);
        }),
        (e.unmount = function (t) {
          tt && tt(t);
          var n,
            i = t.__c;
          i &&
            i.__H &&
            (i.__H.__.forEach(function (t) {
              try {
                _t(t);
              } catch (t) {
                n = t;
              }
            }),
            (i.__H = void 0),
            n && e.__e(n, i.__v));
        });
      var rt = "function" == typeof requestAnimationFrame;
      function ot(t) {
        var e,
          n = function () {
            clearTimeout(i), rt && cancelAnimationFrame(e), setTimeout(t);
          },
          i = setTimeout(n, 100);
        rt && (e = requestAnimationFrame(n));
      }
      function _t(t) {
        var e = B,
          n = t.__c;
        "function" == typeof n && ((t.__c = void 0), n()), (B = e);
      }
      function st(t) {
        var e = B;
        (t.__c = t.__()), (B = e);
      }
      function lt(t, e) {
        return (
          !t ||
          t.length !== e.length ||
          e.some(function (e, n) {
            return e !== t[n];
          })
        );
      }
      function ut() {
        throw new Error("Cycle detected");
      }
      function at() {
        if (dt > 1) dt--;
        else {
          for (var t, e = !1; void 0 !== ht; ) {
            var n = ht;
            for (ht = void 0, vt++; void 0 !== n; ) {
              var i = n.o;
              if (((n.o = void 0), (n.f &= -3), !(8 & n.f) && bt(n)))
                try {
                  n.c();
                } catch (n) {
                  e || ((t = n), (e = !0));
                }
              n = i;
            }
          }
          if (((vt = 0), dt--, e)) throw t;
        }
      }
      var ft,
        ct = void 0,
        ht = void 0,
        dt = 0,
        vt = 0,
        pt = 0;
      function yt(t) {
        if (void 0 !== ct) {
          var e = t.n;
          if (void 0 === e || e.t !== ct)
            return (
              (e = {
                i: 0,
                S: t,
                p: ct.s,
                n: void 0,
                t: ct,
                e: void 0,
                x: void 0,
                r: e,
              }),
              void 0 !== ct.s && (ct.s.n = e),
              (ct.s = e),
              (t.n = e),
              32 & ct.f && t.S(e),
              e
            );
          if (-1 === e.i)
            return (
              (e.i = 0),
              void 0 !== e.n &&
                ((e.n.p = e.p),
                void 0 !== e.p && (e.p.n = e.n),
                (e.p = ct.s),
                (e.n = void 0),
                (ct.s.n = e),
                (ct.s = e)),
              e
            );
        }
      }
      function mt(t) {
        (this.v = t), (this.i = 0), (this.n = void 0), (this.t = void 0);
      }
      function gt(t) {
        return new mt(t);
      }
      function bt(t) {
        for (var e = t.s; void 0 !== e; e = e.n)
          if (e.S.i !== e.i || !e.S.h() || e.S.i !== e.i) return !0;
        return !1;
      }
      function kt(t) {
        for (var e = t.s; void 0 !== e; e = e.n) {
          var n = e.S.n;
          if (
            (void 0 !== n && (e.r = n), (e.S.n = e), (e.i = -1), void 0 === e.n)
          ) {
            t.s = e;
            break;
          }
        }
      }
      function xt(t) {
        for (var e = t.s, n = void 0; void 0 !== e; ) {
          var i = e.p;
          -1 === e.i
            ? (e.S.U(e),
              void 0 !== i && (i.n = e.n),
              void 0 !== e.n && (e.n.p = i))
            : (n = e),
            (e.S.n = e.r),
            void 0 !== e.r && (e.r = void 0),
            (e = i);
        }
        t.s = n;
      }
      function wt(t) {
        mt.call(this, void 0),
          (this.x = t),
          (this.s = void 0),
          (this.g = pt - 1),
          (this.f = 4);
      }
      function St(t) {
        var e = t.u;
        if (((t.u = void 0), "function" == typeof e)) {
          dt++;
          var n = ct;
          ct = void 0;
          try {
            e();
          } catch (e) {
            throw ((t.f &= -2), (t.f |= 8), Nt(t), e);
          } finally {
            (ct = n), at();
          }
        }
      }
      function Nt(t) {
        for (var e = t.s; void 0 !== e; e = e.n) e.S.U(e);
        (t.x = void 0), (t.s = void 0), St(t);
      }
      function Pt(t) {
        if (ct !== this) throw new Error("Out-of-order effect");
        xt(this), (ct = t), (this.f &= -2), 8 & this.f && Nt(this), at();
      }
      function Et(t) {
        (this.x = t),
          (this.u = void 0),
          (this.s = void 0),
          (this.o = void 0),
          (this.f = 32);
      }
      function Ht(t) {
        var e = new Et(t);
        try {
          e.c();
        } catch (t) {
          throw (e.d(), t);
        }
        return e.d.bind(e);
      }
      function Ut(t, n) {
        e[t] = n.bind(null, e[t] || function () {});
      }
      function Ct(t) {
        ft && ft(), (ft = t && t.S());
      }
      function $t(t) {
        var e = this,
          n = t.data,
          i = (function (t) {
            return nt(function () {
              return gt(t);
            }, []);
          })(n);
        i.value = n;
        var r = nt(function () {
          for (var t = e.__v; (t = t.__); )
            if (t.__c) {
              t.__c.__$f |= 4;
              break;
            }
          return (
            (e.__$u.c = function () {
              e.base.data = r.peek();
            }),
            (function (t) {
              return new wt(t);
            })(function () {
              var t = i.value.value;
              return 0 === t ? 0 : !0 === t ? "" : t || "";
            })
          );
        }, []);
        return r.value;
      }
      function At(t, e, n, i) {
        var r = e in t && void 0 === t.ownerSVGElement,
          o = gt(n);
        return {
          o: function (t, e) {
            (o.value = t), (i = e);
          },
          d: Ht(function () {
            var n = o.value.value;
            i[e] !== n &&
              ((i[e] = n),
              r ? (t[e] = n) : n ? t.setAttribute(e, n) : t.removeAttribute(e));
          }),
        };
      }
      (mt.prototype.h = function () {
        return !0;
      }),
        (mt.prototype.S = function (t) {
          this.t !== t &&
            void 0 === t.e &&
            ((t.x = this.t), void 0 !== this.t && (this.t.e = t), (this.t = t));
        }),
        (mt.prototype.U = function (t) {
          if (void 0 !== this.t) {
            var e = t.e,
              n = t.x;
            void 0 !== e && ((e.x = n), (t.e = void 0)),
              void 0 !== n && ((n.e = e), (t.x = void 0)),
              t === this.t && (this.t = n);
          }
        }),
        (mt.prototype.subscribe = function (t) {
          var e = this;
          return Ht(function () {
            var n = e.value,
              i = 32 & this.f;
            this.f &= -33;
            try {
              t(n);
            } finally {
              this.f |= i;
            }
          });
        }),
        (mt.prototype.valueOf = function () {
          return this.value;
        }),
        (mt.prototype.toString = function () {
          return this.value + "";
        }),
        (mt.prototype.peek = function () {
          return this.v;
        }),
        Object.defineProperty(mt.prototype, "value", {
          get: function () {
            var t = yt(this);
            return void 0 !== t && (t.i = this.i), this.v;
          },
          set: function (t) {
            if (t !== this.v) {
              vt > 100 && ut(), (this.v = t), this.i++, pt++, dt++;
              try {
                for (var e = this.t; void 0 !== e; e = e.x) e.t.N();
              } finally {
                at();
              }
            }
          },
        }),
        ((wt.prototype = new mt()).h = function () {
          if (((this.f &= -3), 1 & this.f)) return !1;
          if (32 == (36 & this.f)) return !0;
          if (((this.f &= -5), this.g === pt)) return !0;
          if (((this.g = pt), (this.f |= 1), this.i > 0 && !bt(this)))
            return (this.f &= -2), !0;
          var t = ct;
          try {
            kt(this), (ct = this);
            var e = this.x();
            (16 & this.f || this.v !== e || 0 === this.i) &&
              ((this.v = e), (this.f &= -17), this.i++);
          } catch (t) {
            (this.v = t), (this.f |= 16), this.i++;
          }
          return (ct = t), xt(this), (this.f &= -2), !0;
        }),
        (wt.prototype.S = function (t) {
          if (void 0 === this.t) {
            this.f |= 36;
            for (var e = this.s; void 0 !== e; e = e.n) e.S.S(e);
          }
          mt.prototype.S.call(this, t);
        }),
        (wt.prototype.U = function (t) {
          if (
            void 0 !== this.t &&
            (mt.prototype.U.call(this, t), void 0 === this.t)
          ) {
            this.f &= -33;
            for (var e = this.s; void 0 !== e; e = e.n) e.S.U(e);
          }
        }),
        (wt.prototype.N = function () {
          if (!(2 & this.f)) {
            this.f |= 6;
            for (var t = this.t; void 0 !== t; t = t.x) t.t.N();
          }
        }),
        (wt.prototype.peek = function () {
          if ((this.h() || ut(), 16 & this.f)) throw this.v;
          return this.v;
        }),
        Object.defineProperty(wt.prototype, "value", {
          get: function () {
            1 & this.f && ut();
            var t = yt(this);
            if ((this.h(), void 0 !== t && (t.i = this.i), 16 & this.f))
              throw this.v;
            return this.v;
          },
        }),
        (Et.prototype.c = function () {
          var t = this.S();
          try {
            8 & this.f || void 0 === this.x || (this.u = this.x());
          } finally {
            t();
          }
        }),
        (Et.prototype.S = function () {
          1 & this.f && ut(),
            (this.f |= 1),
            (this.f &= -9),
            St(this),
            kt(this),
            dt++;
          var t = ct;
          return (ct = this), Pt.bind(this, t);
        }),
        (Et.prototype.N = function () {
          2 & this.f || ((this.f |= 2), (this.o = ht), (ht = this));
        }),
        (Et.prototype.d = function () {
          (this.f |= 8), 1 & this.f || Nt(this);
        }),
        ($t.displayName = "_st"),
        Object.defineProperties(mt.prototype, {
          constructor: { configurable: !0, value: void 0 },
          type: { configurable: !0, value: $t },
          props: {
            configurable: !0,
            get: function () {
              return { data: this };
            },
          },
          __b: { configurable: !0, value: 1 },
        }),
        Ut("__b", function (t, e) {
          if ("string" == typeof e.type) {
            var n,
              i = e.props;
            for (var r in i)
              if ("children" !== r) {
                var o = i[r];
                o instanceof mt &&
                  (n || (e.__np = n = {}), (n[r] = o), (i[r] = o.peek()));
              }
          }
          t(e);
        }),
        Ut("__r", function (t, e) {
          Ct();
          var n,
            i = e.__c;
          i &&
            ((i.__$f &= -2),
            void 0 === (n = i.__$u) &&
              (i.__$u = n =
                (function (t) {
                  var e;
                  return (
                    Ht(function () {
                      e = this;
                    }),
                    (e.c = function () {
                      (i.__$f |= 1), i.setState({});
                    }),
                    e
                  );
                })())),
            i,
            Ct(n),
            t(e);
        }),
        Ut("__e", function (t, e, n, i) {
          Ct(), void 0, t(e, n, i);
        }),
        Ut("diffed", function (t, e) {
          var n;
          if ((Ct(), void 0, "string" == typeof e.type && (n = e.__e))) {
            var i = e.__np,
              r = e.props;
            if (i) {
              var o = n.U;
              if (o)
                for (var _ in o) {
                  var s = o[_];
                  void 0 === s || _ in i || (s.d(), (o[_] = void 0));
                }
              else n.U = o = {};
              for (var l in i) {
                var u = o[l],
                  a = i[l];
                void 0 === u ? ((u = At(n, l, a, r)), (o[l] = u)) : u.o(a, r);
              }
            }
          }
          t(e);
        }),
        Ut("unmount", function (t, e) {
          if ("string" == typeof e.type) {
            var n = e.__e;
            if (n) {
              var i = n.U;
              if (i)
                for (var r in ((n.U = void 0), i)) {
                  var o = i[r];
                  o && o.d();
                }
            }
          } else {
            var _ = e.__c;
            if (_) {
              var s = _.__$u;
              s && ((_.__$u = void 0), s.d());
            }
          }
          t(e);
        }),
        Ut("__h", function (t, e, n, i) {
          i < 3 && (e.__$f |= 2), t(e, n, i);
        }),
        (p.prototype.shouldComponentUpdate = function (t, e) {
          var n = this.__$u;
          if (!((n && void 0 !== n.s) || 4 & this.__$f)) return !0;
          if (3 & this.__$f) return !0;
          for (var i in e) return !0;
          for (var r in t)
            if ("__source" !== r && t[r] !== this.props[r]) return !0;
          for (var o in this.props) if (!(o in t)) return !0;
          return !1;
        });
      const Dt = {
        mode: {
          general: gt(!0),
          search: gt("auto"),
          shop: gt("manual"),
          category: gt("auto"),
          product: gt("auto"),
        },
      };
      !(function (t) {
        if (dt > 0) return t();
        dt++;
        try {
          t();
        } finally {
          at();
        }
      })(() => {
        chrome.storage.local.get((t) => {
          t.setting &&
            ((Dt.mode.general.value = t.setting.mode.general),
            (Dt.mode.search.value = t.setting.mode.search),
            (Dt.mode.shop.value = t.setting.mode.shop),
            (Dt.mode.category.value = t.setting.mode.category),
            (Dt.mode.product.value = t.setting.mode.product));
        }),
          Ht(() => {
            chrome.storage.local.set({
              setting: {
                mode: {
                  general: Dt.mode.general.value,
                  search: Dt.mode.search.value,
                  shop: Dt.mode.shop.value,
                  category: Dt.mode.category.value,
                  product: Dt.mode.product.value,
                },
              },
            });
          });
      });
      const Tt = {
        shop: "Data Toko",
        search: "Data Pencarian",
        product: "Data Produk",
        category: "Data Kategori",
      };
      O(
        F`<${(t) =>
          V(v, {
            children: [
              V("div", {
                className: "ts-header",
                children: [
                  V("div", { className: "ts-logo" }),
                  V("div", {
                    className: "ts-version",
                    children: ["v", t.version],
                  }),
                ],
              }),
              V("div", {
                className: "ts-body",
                children: V("ul", {
                  role: "list",
                  className: "ts-divide-y ts-divide-gray-200",
                  children: [
                    V(
                      "li",
                      {
                        className:
                          "ts-flex ts-justify-between ts-gap-x-6 ts-py-3",
                        children: [
                          V("div", {
                            className:
                              "ts-flex ts-min-w-0 ts-gap-x-4 ts-items-center",
                            children: V("div", {
                              className: "ts-min-w-0 ts-flex-auto",
                              children: V("p", {
                                className: "ts-text-sm/6 ts-text-gray-900",
                                children: "Data Tokpee",
                              }),
                            }),
                          }),
                          V("div", {
                            className:
                              "ts-shrink-0 ts-flex ts-flex-col ts-items-end",
                            children: V("button", {
                              type: "button",
                              className: z()(
                                "ts-relative ts-inline-flex ts-h-6 ts-w-11 ts-shrink-0 ts-cursor-pointer ts-rounded-full ts-border-2 ts-border-transparent ts-transition-colors ts-duration-200 ts-ease-in-out focus:outline-none",
                                {
                                  "ts-bg-gray-200": !Dt.mode.general.value,
                                  "ts-bg-orange-500": Dt.mode.general.value,
                                }
                              ),
                              role: "switch",
                              onClick: () => {
                                Dt.mode.general.value = !Dt.mode.general.value;
                              },
                              children: V("span", {
                                "aria-hidden": "true",
                                className: z()(
                                  "ts-pointer-events-none ts-inline-block ts-size-5 ts-transform ts-rounded-full ts-bg-white ts-shadow ts-ring-0 ts-transition ts-duration-200 ts-ease-in-out",
                                  {
                                    "ts-translate-x-0": !Dt.mode.general.value,
                                    "ts-translate-x-5": Dt.mode.general.value,
                                  }
                                ),
                              }),
                            }),
                          }),
                        ],
                      },
                      "general-option"
                    ),
                    Object.entries(Tt).map(([t, e], n) =>
                      V(
                        "li",
                        {
                          className: z()(
                            "ts-flex ts-justify-between ts-gap-x-6 ts-py-3",
                            { "ts-pl-4": 0 == n, "ts-ml-4": n > 0 }
                          ),
                          children: [
                            V("div", {
                              className:
                                "ts-flex ts-min-w-0 ts-gap-x-4 ts-items-center",
                              children: V("div", {
                                className: "ts-min-w-0 ts-flex-auto",
                                children: V("p", {
                                  className: "ts-text-sm/6 ts-text-gray-900",
                                  children: e,
                                }),
                              }),
                            }),
                            V("div", {
                              className: "ts-shrink-0 ts-items-end",
                              children: V("div", {
                                className: "ts-grid ts-grid-cols-1",
                                children: [
                                  V("select", {
                                    disabled: !Dt.mode.general.value,
                                    onChange: (e) => {
                                      return (
                                        (n = t),
                                        (i = e.currentTarget.value),
                                        void (Dt.mode[n].value = i)
                                      );
                                      var n, i;
                                    },
                                    className: z()(
                                      "ts-col-start-1 ts-row-start-1 ts-w-full ts-appearance-none ts-rounded-md ts-py-1.5 ts-pl-3 ts-pr-8 ts-text-gray-900 ts-outline ts-outline-1 ts--outline-offset-1 ts-outline-gray-300 ts-text-sm/6",
                                      {
                                        "ts-bg-white": Dt.mode.general.value,
                                        "ts-bg-gray-200":
                                          !Dt.mode.general.value,
                                      }
                                    ),
                                    children: [
                                      V("option", {
                                        value: "auto",
                                        selected: "auto" == Dt.mode[t].value,
                                        children: "Show",
                                      }),
                                      V("option", {
                                        value: "disabled",
                                        selected:
                                          "disabled" == Dt.mode[t].value,
                                        children: "Hide",
                                      }),
                                    ],
                                  }),
                                  V("svg", {
                                    className:
                                      "ts-pointer-events-none ts-col-start-1 ts-row-start-1 ts-mr-2 ts-self-center ts-justify-self-end ts-text-gray-500 ts-size-4",
                                    viewBox: "0 0 16 16",
                                    fill: "currentColor",
                                    "aria-hidden": "true",
                                    "data-slot": "icon",
                                    children: V("path", {
                                      "fill-rule": "evenodd",
                                      d: "M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z",
                                      "clip-rule": "evenodd",
                                    }),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        `${t}-option`
                      )
                    ),
                  ],
                }),
              }),
            ],
          })} version=${chrome.runtime.getManifest().version} />`,
        document.getElementById("content")
      );
    })();
})();
//# sourceMappingURL=popup.js.map
