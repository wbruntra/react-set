;(this.webpackJsonpclient = this.webpackJsonpclient || []).push([
  [0],
  {
    54: function(e, t, a) {
      e.exports = a.p + 'static/media/sad_trombone.baad2ca9.mp3'
    },
    55: function(e, t, a) {
      e.exports = a.p + 'static/media/applause.c2030d5b.mp3'
    },
    57: function(e, t, a) {
      e.exports = a(95)
    },
    62: function(e, t, a) {},
    72: function(e, t, a) {},
    95: function(e, t, a) {
      'use strict'
      a.r(t)
      var n = a(0),
        r = a.n(n),
        c = a(29),
        l = a.n(c),
        o = (a(62), a(5)),
        s = a(14),
        i = a(15),
        u = a(17),
        m = a(16),
        d = a(18),
        p = a(3),
        f = a(24),
        v = a(7),
        E = a(6),
        h = a(26),
        g = a(51),
        b = a(52),
        y = a(20),
        O = a.n(y)
      function j(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      function w(e) {
        for (var t = 1; t < arguments.length; t++) {
          var a = null != arguments[t] ? arguments[t] : {}
          t % 2
            ? j(a, !0).forEach(function(t) {
                Object(v.a)(e, t, a[t])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
            : j(a).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
              })
        }
        return e
      }
      var N = function(e) {
          return { type: 'UPDATE_USER', payload: e }
        },
        S = function() {
          return { type: 'LOGOUT' }
        },
        T = function(e) {
          return { type: 'UPDATE_NICKNAME', payload: e }
        },
        k = { loading: !0, user: {} },
        D = {
          user: function() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : k,
              t = arguments.length > 1 ? arguments[1] : void 0
            switch (t.type) {
              case 'UPDATE_USER':
                return w({}, e, {}, t.payload)
              case 'UPDATE_NICKNAME':
                var a = O()(e, { user: { nickname: { $set: t.payload } } })
                return a
              case 'LOGOUT':
                return { loading: !1, user: null }
              default:
                return e
            }
          },
        },
        F = Object(h.createStore)(
          Object(h.combineReducers)(D),
          Object(b.composeWithDevTools)(Object(h.applyMiddleware)(g.a)),
        ),
        P = a(8),
        C = a.n(P),
        I =
          (a(27),
          a(34),
          {
            apiKey: 'AIzaSyCLA_RFXrPvBdN_vrApCUlj28a82ownuzg',
            authDomain: 'fire-set.firebaseapp.com',
            databaseURL: 'https://fire-set.firebaseio.com',
            projectId: 'fire-set',
            storageBucket: 'fire-set.appspot.com',
            messagingSenderId: '958559518798',
            appId: '1:958559518798:web:ec451bbfb4ac03f30ec31f',
            measurementId: 'G-FCHHM3FEZE',
          })
      P.initializeApp(I)
      var x = P.firestore()
      var R = function() {
          var e = Object(E.c)(),
            t = Object(f.f)()
          return r.a.createElement(
            'div',
            { style: { cursor: 'pointer', marginBottom: '16px' } },
            r.a.createElement(
              'p',
              { className: 'right-align' },
              r.a.createElement(
                'a',
                {
                  onClick: function() {
                    C.a
                      .auth()
                      .signOut()
                      .then(function() {
                        e(S()), console.log('Signed out.'), t.push('/')
                      })
                  },
                },
                'Sign Out',
              ),
            ),
          )
        },
        M = a(2),
        G = a(12),
        A = function(e) {
          return Object(G.a)(Array(e).keys())
        },
        U = function(e) {
          var t,
            a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 3
          ;(t =
            4 === a
              ? A(3).map(function(t) {
                  return A(4)
                    .map(function(a) {
                      return e.includes(4 * t + a) ? 'x' : 'o'
                    })
                    .join('')
                })
              : A(4).map(function(t) {
                  return A(3)
                    .map(function(a) {
                      return e.includes(3 * t + a) ? 'x' : 'o'
                    })
                    .join('')
                })),
            console.log(t.join('\n'))
        },
        z = function(e) {
          for (
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
              a = t.debug,
              n = void 0 !== a && a,
              r = t.returnWhenFound,
              c = void 0 !== r && r,
              l = 0,
              o = [],
              s = 0;
            s < e.length - 2;
            s++
          )
            for (var i = s + 1; i < e.length - 1; i++)
              for (var u = i + 1; u < e.length; u++)
                if (((o = [e[s], e[i], e[u]]), B(o) && (n && U([s, i, u]), l++, c))) return l
          return l
        },
        _ = function() {
          var e = []
          return (
            A(3).forEach(function(t) {
              A(3).forEach(function(a) {
                A(3).forEach(function(n) {
                  A(3).forEach(function(r) {
                    var c = '' + t + n + a + r
                    e.push(c)
                  })
                })
              })
            }),
            e
          )
        },
        B = function(e) {
          if (3 !== e.length) return !1
          for (var t = Object(o.a)(e, 3), a = t[0], n = t[1], r = t[2], c = 0; c < 4; c++) {
            if ((Number(a[c]) + Number(n[c]) + Number(r[c])) % 3 !== 0) return !1
          }
          return !0
        },
        L = function(e, t) {
          for (var a = '', n = 0; n < 4; n++)
            e[n] === t[n] ? (a += e[n]) : (a += (3 - (Number(e[n]) + Number(t[n]))).toString())
          return a.trim()
        },
        V = function(e, t) {
          return t.includes(e)
            ? t.filter(function(t) {
                return t !== e
              })
            : [].concat(Object(G.a)(t), [e])
        },
        W = function(e) {
          for (
            var t = e.board,
              a = void 0 === t ? [] : t,
              n = e.deck,
              r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 12,
              c = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1,
              l = Object(M.shuffle)([].concat(Object(G.a)(a), Object(G.a)(n)));
            z(l.slice(0, r)) < c && z(l, { returnWhenFound: !0 }) > 0;

          )
            l = Object(M.shuffle)(l)
          return { deck: l.slice(r), board: l.slice(0, r) }
        },
        H = function(e) {
          var t = e.board,
            a = e.deck,
            n = e.selected,
            r = a.slice(0, 3),
            c = Object(G.a)(t),
            l = a.slice(3)
          for (
            n.forEach(function(e, t) {
              var a = c.indexOf(e)
              c[a] = r[t]
            });
            0 === z(c);

          ) {
            var o = W({ board: c, deck: l })
            ;(l = o.deck), (c = o.board)
          }
          return { deck: l, board: c, selected: [] }
        },
        K = function() {
          var e = new P.auth.GoogleAuthProvider()
          P.auth()
            .signInWithPopup(e)
            .then(function(e) {
              var t = e.credential.accessToken,
                a = e.user
              console.log(t, a)
            })
            .catch(function(e) {
              e.code, e.message, e.email, e.credential
            })
        },
        $ = function() {
          var e = new P.auth.GoogleAuthProvider()
          P.auth().signInWithRedirect(e)
        },
        J = (a(72), 120),
        Y = 200,
        q = 4,
        X = 25,
        Z = function(e) {
          var t = e.fill,
            a = e.color,
            n = q
          return r.a.createElement(
            'svg',
            { width: '120', height: '200', xmlns: 'http://www.w3.org/2000/svg' },
            r.a.createElement(
              'g',
              null,
              r.a.createElement('rect', {
                fill: '#fff',
                id: 'canvas_background',
                height: '202',
                width: '122',
                y: '-1',
                x: '-1',
              }),
              r.a.createElement(
                'g',
                {
                  display: 'none',
                  overflow: 'visible',
                  y: '0',
                  x: '0',
                  height: '100%',
                  width: '100%',
                  id: 'canvasGrid',
                },
                r.a.createElement('rect', {
                  fill: '#fff',
                  strokeWidth: '0',
                  y: '0',
                  x: '0',
                  height: '100%',
                  width: '100%',
                }),
              ),
            ),
            r.a.createElement(
              'g',
              null,
              r.a.createElement('path', {
                stroke: a,
                transform: ' rotate(270,58.8,98) scale(0.8 1) translate(10 0) ',
                id: 'svg_5',
                d:
                  ' m-17.49,66 c50.83,-35.45 101.7,35.45 152.5,0 c30,-10 30,43.8 0,63.8 c-50.8,35.45 -101.6,-35.45 -152.5,0 c-30,15 -30,-45 0,-63.59 z ',
                fillOpacity: 'null',
                strokeOpacity: 'null',
                strokeWidth: n,
                fill: t,
              }),
            ),
          )
        },
        Q = function(e) {
          var t = e.shape,
            a = e.fill,
            n = e.color,
            c = X,
            l = Y,
            o = J
          return '0' === t
            ? ((c += 1), r.a.createElement(Z, { fill: a, color: n }))
            : '1' === t
            ? r.a.createElement(
                'g',
                null,
                r.a.createElement('ellipse', {
                  stroke: n,
                  ry: (l - 2 * c) / 2,
                  rx: (o - 2 * c) / 2,
                  cy: l / 2,
                  cx: o / 2,
                  fillOpacity: 'null',
                  strokeOpacity: 'null',
                  strokeWidth: q,
                  fill: a,
                }),
              )
            : '2' === t
            ? r.a.createElement(
                'g',
                null,
                r.a.createElement('polygon', {
                  points: ''
                    .concat(c, ',')
                    .concat(l / 2, '\n          ')
                    .concat(o / 2, ',')
                    .concat(c, '\n          ')
                    .concat(o - c, ',')
                    .concat(l / 2, '\n          ')
                    .concat(o / 2, ',')
                    .concat(l - c),
                  style: { fill: a, stroke: n, strokeWidth: q },
                }),
              )
            : void 0
        },
        ee = (function(e) {
          function t() {
            var e, a
            Object(s.a)(this, t)
            for (var c = arguments.length, l = new Array(c), i = 0; i < c; i++) l[i] = arguments[i]
            return (
              ((a = Object(u.a)(
                this,
                (e = Object(m.a)(t)).call.apply(e, [this].concat(l)),
              )).colors = { 0: '#00A91D', 1: '#311b92', 2: '#FF0000', white: '#fff' }),
              (a.getFill = function(e, t) {
                return '1' === t
                  ? 'url(#card-'.concat(e, '-').concat(t, ')')
                  : '2' === t
                  ? a.colors[e]
                  : a.colors.white
              }),
              (a.drawShape = function() {
                var e = a.props.desc.split(''),
                  t = Object(o.a)(e, 4),
                  c = t[1],
                  l = t[2],
                  s = t[3]
                return r.a.createElement(
                  n.Fragment,
                  null,
                  r.a.createElement(
                    'g',
                    null,
                    r.a.createElement('title', null, 'background'),
                    r.a.createElement('rect', {
                      fill: a.colors.white,
                      id: 'canvas_background',
                      y: '-1',
                      x: '-1',
                    }),
                    r.a.createElement(
                      'g',
                      {
                        display: 'none',
                        overflow: 'visible',
                        y: '0',
                        x: '0',
                        height: '100%',
                        width: '100%',
                        id: 'canvasGrid',
                      },
                      r.a.createElement('rect', {
                        strokeWidth: '0',
                        y: '0',
                        x: '0',
                        height: '100%',
                        width: '100%',
                      }),
                    ),
                  ),
                  r.a.createElement(Q, { shape: l, fill: a.getFill(c, s), color: a.colors[c] }),
                )
              }),
              a
            )
          }
          return (
            Object(d.a)(t, e),
            Object(i.a)(t, [
              {
                key: 'render',
                value: function() {
                  var e = this,
                    t = this.props.desc.split(''),
                    a = Object(o.a)(t, 4),
                    n = a[0],
                    c = a[1],
                    l = a[3]
                  return r.a.createElement(
                    'div',
                    { className: 'game-card' },
                    r.a.createElement(
                      'svg',
                      { width: '0', height: '0' },
                      r.a.createElement(
                        'pattern',
                        {
                          id: 'card-'.concat(c, '-').concat(l),
                          width: 10,
                          height: '10',
                          patternTransform: 'rotate(45 0 0)',
                          patternUnits: 'userSpaceOnUse',
                        },
                        r.a.createElement('line', {
                          x1: '0',
                          y1: '0',
                          x2: '0',
                          y2: '10',
                          style: { stroke: this.colors[c], strokeWidth: '5' },
                        }),
                      ),
                    ),
                    A(Number(n) + 1).map(function(t) {
                      return r.a.createElement(
                        'svg',
                        {
                          key: t,
                          className: 'shape',
                          viewBox: '0 0 '.concat(J, ' ').concat(Y),
                          xmlns: 'http://www.w3.org/2000/svg',
                        },
                        e.drawShape(),
                      )
                    }),
                  )
                },
              },
            ]),
            t
          )
        })(n.Component),
        te = a(54),
        ae = a.n(te),
        ne = a(55),
        re = a.n(ne)
      var ce = function(e) {
          var t = e.gameOver,
            a = e.myName,
            n = e.solo,
            c = Object(E.d)(function(e) {
              return e.user
            }).user
          return r.a.createElement(
            'div',
            { className: 'deep-purple lighten-2', style: { height: '100vh' } },
            (function() {
              var e = t === a ? re.a : ae.a
              return r.a.createElement('audio', { src: e, autoPlay: !0 })
            })(),
            r.a.createElement(
              'div',
              { className: 'row center-align' },
              r.a.createElement(
                'div',
                {
                  className: 'card col s8 offset-s2 m6 offset-m3',
                  style: { marginTop: 0.2 * window.innerHeight },
                },
                r.a.createElement(
                  'div',
                  { className: 'card-content' },
                  r.a.createElement('span', { className: 'card-title' }, 'GAME OVER!'),
                  r.a.createElement('p', null, 'Winner: ', t, ' '),
                ),
                r.a.createElement(
                  'div',
                  { className: 'card-action' },
                  r.a.createElement(
                    'p',
                    null,
                    r.a.createElement(
                      p.b,
                      { to: '/', style: { marginRight: '48px' } },
                      'Main Menu',
                    ),
                    n &&
                      null !== c &&
                      r.a.createElement(
                        'span',
                        { className: 'right-align' },
                        r.a.createElement(p.b, { to: '/stats' }, 'View Stats'),
                      ),
                  ),
                ),
              ),
            ),
          )
        },
        le = [
          ' light-blue lighten-3',
          ' pink lighten-3',
          ' amber accent-2',
          ' purple darken-1',
          ' light-green lighten-1',
          ' orange accent-2',
        ],
        oe = function(e) {
          var t = Math.floor(e / 60),
            a = e - 60 * t
          return ''.concat(t, ':').concat(
            (function(e) {
              return ('00' + e).slice(-'00'.length)
            })(a),
          )
        }
      var se = function(e) {
        var t = e.gameMode,
          a = (e.deck, e.board),
          n = e.declarer,
          c = e.setsFound,
          l = (e.startTime, e.elapsedTime),
          o = z(a)
        switch (t) {
          case 'shared-device':
            return null
          case 'versus':
            return r.a.createElement(
              'div',
              { className: 'navbar-fixed' },
              r.a.createElement(
                'nav',
                { className: 'orange '.concat(n ? 'lighten-1' : 'darken-1') },
                r.a.createElement(
                  'div',
                  {
                    className: 'nav-wrapper',
                    style: { display: 'flex', justifyContent: 'space-between' },
                  },
                  r.a.createElement('div', null, 'Sets: ', o),
                  r.a.createElement(
                    'div',
                    null,
                    n && r.a.createElement(r.a.Fragment, null, 'SET! ', n),
                  ),
                ),
              ),
            )
          case 'puzzle':
            return r.a.createElement(
              'div',
              { className: 'navbar-fixed' },
              r.a.createElement(
                'nav',
                null,
                r.a.createElement(
                  'div',
                  {
                    className: 'nav-wrapper',
                    style: { display: 'flex', justifyContent: 'space-between' },
                  },
                  r.a.createElement('div', null, 'Total Sets: ', o),
                  r.a.createElement('div', null, 'Remaining: ', o - c.length),
                  r.a.createElement('div', null, 'Time: ', oe(l)),
                ),
              ),
            )
          default:
            return null
        }
      }
      function ie(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      var ue = function(e) {
        var t = Object(n.useState)(null),
          a = Object(o.a)(t, 2),
          c = (a[0], a[1]),
          l = Object(n.useState)(window.innerHeight),
          s = Object(o.a)(l, 2),
          i = (s[0], s[1]),
          u = e.board,
          m = e.selected,
          d = (e.deck, e.declarer),
          p = e.players,
          f = e.gameOver,
          E = e.myName,
          h = e.setFound,
          g = e.sharedDevice,
          b = e.solo,
          y = e.gameMode
        if (
          (Object(n.useEffect)(function() {
            var e = Object(M.debounce)(function() {
              i(window.innerHeight)
            }, 150)
            return (
              window.addEventListener('resize', e),
              function() {
                window.removeEventListener('resize', e)
              }
            )
          }, []),
          Object(n.useEffect)(
            function() {
              c(z(u, { debug: !1 }))
            },
            [u],
          ),
          Object(M.isEmpty)(p) || !Object.keys(p).includes(E))
        )
          return null
        var O = (function(e) {
          var t = e.declarer,
            a = e.players
          return t
            ? Object(M.get)(a, ''.concat(t, '.color'), '')
            : Object(M.get)(a, ''.concat(E, '.color'), '')
        })(e)
        if (f) return r.a.createElement(ce, { gameOver: f, myName: E, solo: b })
        var j = Object(M.map)(p, function(e, t) {
            return (function(e) {
              for (var t = 1; t < arguments.length; t++) {
                var a = null != arguments[t] ? arguments[t] : {}
                t % 2
                  ? ie(a, !0).forEach(function(t) {
                      Object(v.a)(e, t, a[t])
                    })
                  : Object.getOwnPropertyDescriptors
                  ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                  : ie(a).forEach(function(t) {
                      Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
                    })
              }
              return e
            })({ name: t }, e)
          }),
          w = Math.ceil(j.length / 2),
          N = j.slice(0, w),
          S = j.slice(w)
        return r.a.createElement(
          n.Fragment,
          null,
          r.a.createElement(se, e),
          g &&
            r.a.createElement(
              n.Fragment,
              null,
              r.a.createElement(
                'div',
                { className: 'player-buttons-container' },
                N.map(function(t) {
                  return r.a.createElement(
                    'div',
                    {
                      className: 'shared-player player-name '
                        .concat(t.color, ' ')
                        .concat(t.name == d ? 'active-player' : ''),
                      onClick: function() {
                        e.handlePlayerClick(t.name)
                      },
                      key: t.name,
                    },
                    r.a.createElement(
                      'p',
                      { className: 'center-align' },
                      t.name == d ? 'SET!' : t.score,
                    ),
                  )
                }),
                r.a.createElement(
                  'div',
                  { className: 'player-buttons-container bottom' },
                  S.map(function(t) {
                    return r.a.createElement(
                      'div',
                      {
                        className: 'shared-player player-name '
                          .concat(t.color, ' ')
                          .concat(t.name == d ? 'active-player' : ''),
                        onClick: function() {
                          e.handlePlayerClick(t.name)
                        },
                        key: t.name,
                      },
                      r.a.createElement(
                        'p',
                        { className: 'center-align' },
                        t.name == d ? 'SET!' : t.score,
                      ),
                    )
                  }),
                ),
              ),
            ),
          r.a.createElement(
            'div',
            { className: 'container', style: { maxWidth: window.innerHeight - 48 } },
            r.a.createElement(
              'div',
              { className: 'row' },
              u.map(function(t) {
                return r.a.createElement(
                  'div',
                  {
                    key: t,
                    className: 'col s4 '.concat(m.includes(t) ? O : ''),
                    onClick: function() {
                      e.handleCardClick(t)
                    },
                  },
                  r.a.createElement(
                    'div',
                    {
                      className: 'card '.concat(
                        h && 3 === m.length && !m.includes(t) ? 'blurry' : '',
                      ),
                    },
                    r.a.createElement(ee, { desc: t }),
                  ),
                )
              }),
            ),
            !g &&
              'puzzle' !== y &&
              r.a.createElement(
                'div',
                { className: 'row' },
                Object(M.map)(p, function(e, t) {
                  return r.a.createElement(
                    'div',
                    { key: t, className: 'col s4 m3' },
                    r.a.createElement(
                      'span',
                      { className: 'player-name '.concat(e.color) },
                      t,
                      ': ',
                      e.score,
                    ),
                  )
                }),
              ),
            e.handleRedeal &&
              r.a.createElement(
                'div',
                { className: 'row' },
                r.a.createElement(
                  'button',
                  { onClick: e.handleRedeal, className: 'btn' },
                  'Shuffle',
                ),
              ),
          ),
        )
      }
      var me = function(e) {
        var t = e.isHost,
          a = e.players,
          n = e.setState
        return (
          Object(M.findKey)(a, function(e) {
            return e.host
          }),
          r.a.createElement(
            'div',
            { className: 'container' },
            r.a.createElement('h4', null, 'Players:'),
            r.a.createElement(
              'ul',
              { className: 'collection' },
              Object(M.map)(a, function(e, t) {
                return r.a.createElement(
                  'li',
                  { key: t, className: 'collection-item' },
                  r.a.createElement(
                    'span',
                    { className: 'player-name' },
                    t,
                    ' ',
                    e.host && '(host)',
                  ),
                )
              }),
            ),
            t
              ? r.a.createElement(
                  'button',
                  {
                    className: 'btn',
                    onClick: function() {
                      n({ started: !0 })
                    },
                  },
                  'Start Game',
                )
              : r.a.createElement('p', null, 'Waiting for host to start game...'),
          )
        )
      }
      function de(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      function pe(e) {
        for (var t = 1; t < arguments.length; t++) {
          var a = null != arguments[t] ? arguments[t] : {}
          t % 2
            ? de(a, !0).forEach(function(t) {
                Object(v.a)(e, t, a[t])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
            : de(a).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
              })
        }
        return e
      }
      var fe = { turnTime: 5e3, colors: le, playingTo: 6 }
      var ve = function() {
          var e = Object(E.d)(function(e) {
              return e.user
            }),
            t = e.user,
            a = e.loading,
            c = Object(E.c)(),
            l = Object(n.useRef)({}).current,
            s = _(),
            i = pe({}, W({ deck: s.slice(12), board: s.slice(0, 12) }), { selected: [] }),
            u = Object(n.useState)(),
            m = Object(o.a)(u, 2),
            d = m[0],
            f = m[1],
            h = Object(n.useState)(!1),
            g = Object(o.a)(h, 2),
            b = g[0],
            y = g[1],
            j = Object(n.useState)(
              pe(
                {
                  players: {},
                  gameTitle: '',
                  created: !1,
                  started: !1,
                  myName: '',
                  inputName: '',
                  setFound: !1,
                  autoplay: !1,
                  declarer: null,
                  gameOver: !1,
                },
                i,
              ),
            ),
            w = Object(o.a)(j, 2),
            N = w[0],
            S = w[1],
            k = Object(n.useRef)(N)
          ;(k.current = N),
            Object(n.useEffect)(
              function() {
                Object(M.isEmpty)(t.uid) ||
                  x
                    .collection('games')
                    .where('creator_uid', '==', t.uid)
                    .get()
                    .then(function(e) {
                      e.forEach(function(e) {
                        f(pe({ gameTitle: e.id }, e.data()))
                      })
                    })
                    .catch(function(e) {
                      console.log('Error getting documents: ', e)
                    })
              },
              [t],
            )
          var D = function(e) {
              S(pe({}, k.current, {}, e))
            },
            F = function(e) {
              console.log(e)
              var t = Object(M.findKey)(e.players, function(e) {
                return e.host
              })
              !(function(e) {
                ;(l.game = x.collection('games').doc(e)),
                  (window.activeGameUpdater = window.setInterval(function() {
                    l.game.update({ lastUpdate: C.a.firestore.FieldValue.serverTimestamp() })
                  }, 3e4)),
                  (l.actions = l.game.collection('actions')),
                  l.actions.get().then(function(e) {
                    e.forEach(function(e) {
                      console.log(e.id, '=>', e.data())
                    })
                  }),
                  l.actions.onSnapshot(function(e) {
                    e.docChanges().forEach(function(e) {
                      if ('added' === e.type) {
                        var t = e.doc.data()
                        console.log(t), P(t), l.actions.doc(e.doc.id).delete()
                      }
                      'removed' === e.type && console.log('Removed action: ', e.doc.data())
                    })
                  })
              })(e.gameTitle),
                D(
                  pe({ myName: t, created: !0 }, e, {
                    lastUpdate: C.a.firestore.FieldValue.serverTimestamp(),
                  }),
                )
            },
            P = function(e) {
              var t = e.type,
                a = e.payload,
                n = k.current,
                r = n.players,
                c = n.declarer
              switch (t) {
                case 'join':
                  if (Object.keys(r).includes(a.name)) return
                  var l = pe(
                    {},
                    r,
                    Object(v.a)({}, a.name, {
                      host: !1,
                      uid: a.uid,
                      score: 0,
                      color: fe.colors[Object.keys(r).length],
                    }),
                  )
                  G({ players: l })
                  break
                case 'found':
                  c || A(a.selected, a.name)
                  break
                default:
                  return
              }
            },
            I = function(e, t) {
              if (B(e)) {
                var a = (function(e) {
                    if (!e) return {}
                    var t = k.current.players,
                      a = t[e].score + 1,
                      n = O()(t, Object(v.a)({}, e, { $merge: { score: a } })),
                      r = a >= fe.playingTo && e
                    return (
                      r &&
                        window.setTimeout(function() {
                          l.game.delete(), clearInterval(window.activeGameUpdater)
                        }, 3e3),
                      { players: n, gameOver: r }
                    )
                  })(t),
                  n = pe(
                    {},
                    k.current,
                    { setFound: !1, declarer: null, timeDeclared: null },
                    a,
                    {},
                    H(k.current),
                  )
                G(n)
              }
            },
            G = function(e) {
              D(e), l.game.update(e)
            },
            A = function(e, t) {
              for (var a = k.current.board, n = 0; n < e.length; n++)
                if (!a.includes(e[n])) return !1
              var r = { setFound: B(e), selected: e, declarer: t }
              return (
                G(r),
                r.setFound &&
                  setTimeout(function() {
                    I(e, t)
                  }, 4e3),
                !0
              )
            },
            U = N.board,
            z = N.deck,
            L = N.selected,
            K = N.declarer,
            J = N.players,
            Y = N.gameTitle,
            q = N.created,
            X = N.started,
            Z = N.myName
          return a
            ? 'Loading...'
            : Object(M.isEmpty)(t)
            ? r.a.createElement(
                'div',
                { className: 'container' },
                r.a.createElement('p', null, 'To host a game, sign in with your Google account.'),
                r.a.createElement(
                  'p',
                  null,
                  r.a.createElement('button', { onClick: $, className: 'btn' }, 'Sign in'),
                ),
              )
            : !d || b || N.created
            ? '' === Z
              ? r.a.createElement(
                  'div',
                  { className: 'container' },
                  r.a.createElement(R, null),
                  r.a.createElement('h4', null, 'Enter your nickname:'),
                  r.a.createElement(
                    'form',
                    {
                      onSubmit: function(e) {
                        e.preventDefault(),
                          D({
                            myName: t.nickname,
                            players: Object(v.a)({}, t.nickname, {
                              host: !0,
                              uid: t.uid,
                              score: 0,
                              color: fe.colors[0],
                            }),
                          })
                      },
                    },
                    r.a.createElement('input', {
                      autoFocus: !0,
                      placeholder: 'hostname',
                      value: t.nickname,
                      onChange: function(e) {
                        c(T(e.target.value)),
                          window.localStorage.setItem('nickname', e.target.value)
                      },
                    }),
                    r.a.createElement('button', { type: 'submit', className: 'btn' }, 'Submit'),
                  ),
                  r.a.createElement(
                    'div',
                    null,
                    r.a.createElement('p', null, r.a.createElement(p.b, { to: '/' }, 'Main Menu')),
                  ),
                )
              : q
              ? X
                ? r.a.createElement(ue, {
                    board: U,
                    deck: z,
                    selected: L,
                    declarer: K,
                    handleCardClick: function(e) {
                      var t = N.myName
                      if (!N.declarer) {
                        var a = V(e, N.selected)
                        B(a) && A(a, t), D({ selected: a })
                      }
                    },
                    handleRedeal: function() {
                      var e = W(N)
                      G(e)
                    },
                    players: J,
                    setFound: N.setFound,
                    gameOver: N.gameOver,
                    myName: N.myName,
                    gameMode: 'versus',
                  })
                : r.a.createElement(me, { isHost: !0, players: J, setState: G })
              : r.a.createElement(
                  'div',
                  { className: 'container' },
                  r.a.createElement('h4', null, 'Name your game:'),
                  r.a.createElement(
                    'form',
                    {
                      onSubmit: function(e) {
                        e.preventDefault()
                        var a = N.myName,
                          n = N.board,
                          r = N.deck,
                          c = N.selected,
                          o = N.players,
                          s = k.current.gameTitle
                        '' === s && (s = ''.concat(a, "'s game")),
                          (l.game = x.collection('games').doc(s)),
                          l.game.set({
                            creator_uid: t.uid,
                            players: o,
                            board: n,
                            deck: r,
                            selected: c,
                            lastUpdate: C.a.firestore.FieldValue.serverTimestamp(),
                          }),
                          (window.activeGameUpdater = window.setInterval(function() {
                            l.game.update({
                              lastUpdate: C.a.firestore.FieldValue.serverTimestamp(),
                            })
                          }, 3e4)),
                          (l.actions = l.game.collection('actions')),
                          l.actions.get().then(function(e) {
                            e.forEach(function(e) {
                              console.log(e.id, '=>', e.data())
                            })
                          }),
                          l.actions.onSnapshot(function(e) {
                            e.docChanges().forEach(function(e) {
                              if ('added' === e.type) {
                                var t = e.doc.data()
                                console.log(t), P(t), l.actions.doc(e.doc.id).delete()
                              }
                              'removed' === e.type && console.log('Removed action: ', e.doc.data())
                            })
                          }),
                          D({ created: !0 })
                      },
                    },
                    r.a.createElement('input', {
                      autoFocus: !0,
                      placeholder: ''.concat(Z, "'s game"),
                      onChange: function(e) {
                        D({ gameTitle: e.target.value })
                      },
                      value: Y,
                    }),
                    r.a.createElement('button', { type: 'submit', className: 'btn' }, 'Create'),
                  ),
                )
            : r.a.createElement(
                'div',
                { className: 'container' },
                r.a.createElement('p', null, 'You are already hosting a game. Return to it?'),
                r.a.createElement(
                  'button',
                  {
                    className: 'btn',
                    onClick: function() {
                      return F(d)
                    },
                  },
                  'YES!',
                ),
                r.a.createElement(
                  'button',
                  {
                    className: 'btn',
                    onClick: function() {
                      return y(!0)
                    },
                  },
                  'NO!',
                ),
              )
        },
        Ee = function(e) {
          var t = e.children,
            a = e.visible
          return r.a.createElement(
            'div',
            { className: 'modal popup-message', style: { display: a ? 'block' : 'none' } },
            r.a.createElement('div', { className: 'modal-content' }, t),
          )
        }
      function he(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      function ge(e) {
        for (var t = 1; t < arguments.length; t++) {
          var a = null != arguments[t] ? arguments[t] : {}
          t % 2
            ? he(a, !0).forEach(function(t) {
                Object(v.a)(e, t, a[t])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
            : he(a).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
              })
        }
        return e
      }
      var be = function(e) {
        var t = this,
          a = Object(E.d)(function(e) {
            return e.user
          }),
          c = a.user,
          l = (a.loading, Object(E.c)()),
          s = Object(n.useState)({
            popupVisible: !1,
            setFound: !1,
            displayAnimation: !1,
            animatedSet: [],
            declarer: '',
            deck: [],
            board: [],
            selected: [],
            pending: null,
            started: !1,
          }),
          i = Object(o.a)(s, 2),
          u = i[0],
          m = i[1],
          d = Object(n.useState)(''),
          f = Object(o.a)(d, 2),
          v = f[0],
          h = f[1],
          g = Object(n.useRef)({}).current,
          b = Object(n.useRef)(u)
        b.current = u
        var y = function(e) {
            m(ge({}, b.current, {}, e))
          },
          O = function(e) {
            g.actions
              .add(ge({}, e, { created: C.a.firestore.FieldValue.serverTimestamp() }))
              .then(function(t) {
                if ('found' === e.type) {
                  var a = t.id
                  console.log('Document written with ID: ', a), y({ pending: a })
                }
              })
          }
        Object(n.useEffect)(function() {
          var t = e.match.params.gameName
          g.game = x.collection('games').doc(t)
          var a = g.game.onSnapshot(function(e) {
            !(function(e) {
              var t = ge({}, e.data())
              Object(M.isEmpty)(t) ||
                (console.log('Updating', t), y(ge({}, t, { popupVisible: !1 })))
            })(e)
          })
          g.actions = g.game.collection('actions')
          var n = g.actions.onSnapshot(function(e) {
            e.docChanges().forEach(function(e) {
              'removed' === e.type &&
                b.current.pending === e.doc.id &&
                  (console.log('Pending action removed!'), y({ pending: null }))
            })
          })
          return function() {
            g.game && a(), g.actions && n()
          }
        }, [])
        var j = u.board,
          w = u.deck,
          N = u.selected,
          S = u.declarer,
          k = u.players,
          D = u.popupVisible,
          F = u.started
        return a.loading
          ? 'Loading profile...'
          : Object(M.isEmpty)(c)
          ? r.a.createElement(
              'div',
              { className: 'container' },
              r.a.createElement('p', null, 'To join a game, sign in with your Google account.'),
              r.a.createElement(
                'p',
                null,
                r.a.createElement('button', { onClick: K, className: 'btn' }, 'Sign in'),
              ),
              r.a.createElement('p', null, r.a.createElement(p.b, { to: '/lobby' }, 'Back')),
            )
          : v
          ? F
            ? r.a.createElement(
                r.a.Fragment,
                null,
                r.a.createElement(
                  Ee,
                  { visible: u.pending && D },
                  r.a.createElement('p', { className: 'flow-text center-align' }, 'SET!'),
                  r.a.createElement(
                    'div',
                    { className: 'progress' },
                    r.a.createElement('div', {
                      className: 'indeterminate',
                      style: { width: '30%' },
                    }),
                  ),
                ),
                r.a.createElement(ue, {
                  board: j,
                  deck: w,
                  selected: N,
                  declarer: S,
                  handleCardClick: function(e) {
                    var a = b.current,
                      n = a.declarer,
                      r = a.selected
                    if (!n) {
                      var c = V(e, r),
                        l = {}
                      if (3 === c.length)
                        if (B(c))
                          O({ type: 'found', payload: { selected: c, name: v } }),
                            (l.popupVisible = !0)
                        else
                          console.log('Bad set selected!'),
                            window.setTimeout(t.resetLocalSelected, 1e3)
                      y(ge({}, l, { selected: c }))
                    }
                  },
                  players: k,
                  setFound: u.setFound,
                  gameOver: u.gameOver,
                  myName: v,
                  gameMode: 'versus',
                }),
              )
            : r.a.createElement(me, { players: k, isHost: !1 })
          : r.a.createElement(
              'div',
              { className: 'container' },
              r.a.createElement(R, null),
              r.a.createElement('h4', null, 'Choose nickname'),
              r.a.createElement(
                'form',
                {
                  onSubmit: function(e) {
                    e.preventDefault()
                    var t = c.nickname
                    Object(M.isEmpty)(t) ||
                      (h(t), O({ type: 'join', payload: { name: t, uid: c.uid } }))
                  },
                },
                r.a.createElement('input', {
                  autoFocus: !0,
                  type: 'text',
                  placeholder: 'your name',
                  value: c.nickname,
                  onChange: function(e) {
                    l(T(e.target.value)), window.localStorage.setItem('nickname', e.target.value)
                  },
                }),
                r.a.createElement('input', { className: 'btn', type: 'submit', value: 'Join' }),
              ),
            )
      }
      function ye(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      var Oe = (function(e) {
          function t(e) {
            var a
            Object(s.a)(this, t),
              ((a = Object(u.a)(
                this,
                Object(m.a)(t).call(this, e),
              )).componentWillUnmount = function() {
                a.unsubscribe()
              })
            return (a.state = { name: '', newGame: 'baz', init: !1, games: [] }), a
          }
          return (
            Object(d.a)(t, e),
            Object(i.a)(t, [
              {
                key: 'componentDidMount',
                value: function() {
                  var e = this
                  ;(this.gamesRef = x.collection('games')),
                    (this.unsubscribe = this.gamesRef.onSnapshot(function(t) {
                      var a = []
                      t.forEach(function(e) {
                        a.push(
                          (function(e) {
                            for (var t = 1; t < arguments.length; t++) {
                              var a = null != arguments[t] ? arguments[t] : {}
                              t % 2
                                ? ye(a, !0).forEach(function(t) {
                                    Object(v.a)(e, t, a[t])
                                  })
                                : Object.getOwnPropertyDescriptors
                                ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
                                : ye(a).forEach(function(t) {
                                    Object.defineProperty(
                                      e,
                                      t,
                                      Object.getOwnPropertyDescriptor(a, t),
                                    )
                                  })
                            }
                            return e
                          })({ name: e.id }, e.data()),
                        )
                      }),
                        e.setState({ init: !0, games: a })
                    }))
                },
              },
              {
                key: 'render',
                value: function() {
                  var e = this.state,
                    t = e.games
                  if (!e.init) return null
                  var a = t.filter(function(e) {
                    var t = e.lastUpdate
                    if (!t) return !1
                    var a = t.toMillis(),
                      n = new Date().getTime()
                    return Math.round((n - a) / 1e3) < 40
                  })
                  return r.a.createElement(
                    'div',
                    { className: 'container', style: { height: '100vh' } },
                    0 === a.length
                      ? r.a.createElement(
                          n.Fragment,
                          null,
                          r.a.createElement(
                            'div',
                            { className: 'row' },
                            r.a.createElement(
                              'div',
                              { className: 'col s8 offset-s2 m6 offset-m3' },
                              r.a.createElement(
                                'div',
                                {
                                  className: 'card-panel teal',
                                  style: { marginTop: 0.2 * window.innerHeight },
                                },
                                r.a.createElement(
                                  'span',
                                  { className: 'white-text' },
                                  'There are currently no active games.',
                                ),
                              ),
                              r.a.createElement(
                                'p',
                                null,
                                'Click ',
                                r.a.createElement(p.b, { to: '/host' }, 'here'),
                                ' to host one',
                              ),
                              r.a.createElement(
                                'p',
                                null,
                                r.a.createElement(p.b, { to: '/' }, 'Back'),
                              ),
                            ),
                          ),
                        )
                      : r.a.createElement(
                          n.Fragment,
                          null,
                          r.a.createElement(
                            'h4',
                            { className: 'center-align' },
                            'Available games',
                          ),
                          r.a.createElement(
                            'div',
                            { className: 'row center-align' },
                            a.map(function(e, t) {
                              return r.a.createElement(
                                'div',
                                { className: 'col s6 m4', key: e.name },
                                r.a.createElement(
                                  p.b,
                                  { to: '/guest/'.concat(e.name) },
                                  r.a.createElement('div', { className: 'card-panel' }, e.name),
                                ),
                              )
                            }),
                            r.a.createElement(
                              'p',
                              null,
                              r.a.createElement(p.b, { to: '/' }, 'Back'),
                            ),
                          ),
                        ),
                  )
                },
              },
            ]),
            t
          )
        })(n.Component),
        je = a(31),
        we = a.n(je),
        Ne = a(23),
        Se = a.n(Ne)
      function Te(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      function ke(e) {
        for (var t = 1; t < arguments.length; t++) {
          var a = null != arguments[t] ? arguments[t] : {}
          t % 2
            ? Te(a, !0).forEach(function(t) {
                Object(v.a)(e, t, a[t])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
            : Te(a).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
              })
        }
        return e
      }
      var De = !1,
        Fe = { turnTime: 4e3, colors: le, playingTo: 6, cpuDelay: 1200 },
        Pe = function(e) {
          var t = Number(e)
          return Number.isNaN(t) && (t = 1), 24e3 / (5 * t)
        },
        Ce = function() {
          var e = _()
          return ke({}, W({ deck: e.slice(12), board: e.slice(0, 12) }), { selected: [] })
        },
        Ie = function() {
          var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : '',
            t = new Date(),
            a = (t.getTime() % Math.pow(10, 6)) / 1e3
          console.log(e, a.toFixed(1))
        },
        xe = {
          players: {
            you: { score: 0, color: Fe.colors[0] },
            cpu: { score: 0, color: Fe.colors[1] },
          },
          gameStarted: !1,
          name: 'you',
          setFound: !1,
          declarer: null,
          gameOver: !1,
          cpuTurnInterval: 1e3,
          startTime: new Date(),
        },
        Re = (function(e) {
          function t(e) {
            var a
            return (
              Object(s.a)(this, t),
              ((a = Object(u.a)(this, Object(m.a)(t).call(this, e))).handleStartGame = function(
                e,
              ) {
                e.preventDefault(),
                  a.setState({ gameStarted: !0, startTime: new Date() }),
                  console.log('Turns every '.concat(a.state.cpuTurnInterval, ' ms')),
                  setTimeout(function() {
                    var e = window.setInterval(a.cpuTurn, a.state.cpuTurnInterval)
                    a.setState({ cpuTimer: e })
                  }, Fe.cpuDelay)
              }),
              (a.componentDidMount = function() {
                var e = window.localStorage.getItem('soloDifficulty'),
                  t = e ? Number(e) : 2,
                  n = Pe(t)
                a.setState({ difficulty: t, cpuTurnInterval: n })
              }),
              (a.componentWillUnmount = function() {
                null !== a.state.cpuTimer && window.clearInterval(a.state.cpuTimer)
              }),
              (a.cpuTurn = function() {
                var e = a.state,
                  t = e.board,
                  n = e.declarer,
                  r = e.gameOver
                if (!n && !r) {
                  De && Ie('Guess')
                  var c = Object(M.shuffle)(t).slice(0, 2),
                    l = Object(o.a)(c, 2),
                    s = l[0],
                    i = l[1],
                    u = L(s, i)
                  t.includes(u) &&
                    (a.setState({
                      declarer: 'cpu',
                      selected: [s],
                      cpuFound: [i, u],
                      setFound: !0,
                    }),
                    null !== a.state.cpuTimer && clearInterval(a.state.cpuTimer),
                    a.setState({ cpuAnimation: window.setInterval(a.animateCpuChoice, 900) }))
                }
              }),
              (a.animateCpuChoice = function() {
                var e = a.state,
                  t = e.selected,
                  n = e.cpuFound,
                  r = Object(G.a)(n)
                if (0 !== r.length) {
                  var c = [].concat(Object(G.a)(t), [r.pop()])
                  a.setState({ cpuFound: r, selected: c }),
                    3 === c.length &&
                      (null !== a.state.cpuAnimation && clearInterval(a.state.cpuAnimation),
                      a.updateSelected(c, 'cpu'))
                }
              }),
              (a.updatePlayerScore = function(e, t) {
                var n = a.state.players,
                  r = n[e].score + t
                return [O()(n, Object(v.a)({}, e, { $merge: { score: r } })), r]
              }),
              (a.expireDeclare = function() {
                var e = a.state,
                  t = e.declarer,
                  n = e.selected
                if (t && !B(n)) {
                  var r = a.updatePlayerScore(t, -0.5),
                    c = Object(o.a)(r, 1)[0]
                  a.setState({ players: c, declarer: null, timeDeclared: void 0, selected: [] })
                }
              }),
              (a.markPointForDeclarer = function(e) {
                var t = a.updatePlayerScore(e, 1),
                  n = Object(o.a)(t, 2),
                  r = n[0],
                  c = n[1],
                  l = a.props.userReducer.user,
                  s = !!(c >= Fe.playingTo && e),
                  i = { players: r, gameOver: s }
                if (s) {
                  var u = (l && l.uid) || 'anonymous',
                    m = 'you' == e ? 1 : 0,
                    d = Math.round((new Date().getTime() - a.state.startTime.getTime()) / 1e3)
                  Se.a
                    .post('/api/game', {
                      uid: u,
                      total_time: d,
                      player_won: m,
                      difficulty_level: a.state.difficulty,
                      winning_score: c,
                    })
                    .then(function() {
                      console.log('Game sent')
                    })
                    .catch(function(e) {
                      console.log('Error sending game')
                    })
                }
                return a.setState(i), i
              }),
              (a.performDeclare = function(e) {
                if (!a.state.declarer) {
                  var t = { declarer: e, timeDeclared: new Date().getTime() }
                  a.setState(t),
                    a.setState({
                      undeclareId: window.setTimeout(function() {
                        a.expireDeclare()
                      }, Fe.turnTime),
                    })
                }
              }),
              (a.updateSelected = function(e, t) {
                var n = { setFound: B(e), selected: e, declarer: t }
                n.setFound &&
                  (a.state.undeclareId && clearTimeout(a.state.undeclareId),
                  setTimeout(function() {
                    a.removeSet()
                  }, 2e3)),
                  a.setState(n)
              }),
              (a.handleCardClick = function(e) {
                var t = a.state,
                  n = t.setFound,
                  r = t.declarer,
                  c = t.name
                if (!n && 'cpu' !== r) {
                  var l = V(e, a.state.selected)
                  r || a.performDeclare(c),
                    a.setState({ selected: l }),
                    B(l) && a.updateSelected(l, 'you')
                }
              }),
              (a.handleRedeal = function() {
                var e = W(a.state)
                a.setState(e)
              }),
              (a.removeSet = function() {
                var e = a.state,
                  t = e.declarer,
                  n = e.selected
                if (t && B(n)) {
                  console.log('Set found, removing'), a.markPointForDeclarer(t)
                  var r = ke({ setFound: !1, declarer: null, timeDeclared: void 0 }, H(a.state))
                  a.setState(r)
                }
                a.state.cpuTimer && clearInterval(a.state.cpuTimer),
                  setTimeout(function() {
                    var e = window.setInterval(a.cpuTurn, a.state.cpuTurnInterval)
                    a.setState({ cpuTimer: e })
                  }, Fe.cpuDelay)
              }),
              (a.resetGame = function() {
                a.state.cpuTimer && window.clearInterval(a.state.cpuTimer),
                  a.setState(ke({}, Object(M.cloneDeep)(xe), {}, Ce()))
              }),
              (a.state = ke({}, Object(M.cloneDeep)(xe), {}, Ce())),
              a
            )
          }
          return (
            Object(d.a)(t, e),
            Object(i.a)(t, [
              {
                key: 'render',
                value: function() {
                  var e = this,
                    t = this.state,
                    a = t.board,
                    c = t.deck,
                    l = t.selected,
                    o = t.declarer,
                    s = t.players,
                    i = t.gameStarted,
                    u = (t.setFound, this.props.userReducer),
                    m = u.user
                  return u.loading
                    ? 'Loading...'
                    : i
                    ? r.a.createElement(
                        r.a.Fragment,
                        null,
                        r.a.createElement(ue, {
                          board: a,
                          deck: c,
                          selected: l,
                          declarer: o,
                          handleCardClick: this.handleCardClick,
                          handleDeclare: function() {},
                          handleRedeal: this.handleRedeal,
                          players: s,
                          setFound: this.state.setFound,
                          gameOver: this.state.gameOver,
                          myName: this.state.name,
                          resetGame: this.resetGame,
                          solo: !0,
                          gameMode: 'versus',
                        }),
                      )
                    : r.a.createElement(
                        'div',
                        { className: 'container' },
                        null !== m && r.a.createElement(R, null),
                        r.a.createElement('h3', null, 'Solo Play vs. Computer'),
                        r.a.createElement(
                          'h4',
                          { className: 'orange-text text-darken-4' },
                          'Choose difficulty level:',
                        ),
                        r.a.createElement(
                          'div',
                          { className: 'row' },
                          r.a.createElement(
                            'div',
                            { className: 'col s8 m4' },
                            r.a.createElement(
                              'form',
                              { onSubmit: this.handleStartGame },
                              r.a.createElement(we.a, {
                                min: 1,
                                max: 5,
                                orientation: 'horizontal',
                                tooltip: !0,
                                value: Number(this.state.difficulty),
                                onChange: function(t) {
                                  var a = Pe(t)
                                  window.localStorage.setItem('soloDifficulty', t.toString()),
                                    e.setState({ cpuTurnInterval: a, difficulty: t })
                                },
                              }),
                              r.a.createElement('input', {
                                type: 'submit',
                                value: 'Start',
                                className: 'btn',
                              }),
                            ),
                            r.a.createElement(
                              'p',
                              { style: { marginTop: '24px' } },
                              'First to ',
                              Fe.playingTo,
                              ' points is the winner',
                            ),
                          ),
                          r.a.createElement(
                            'div',
                            { className: 'row' },
                            r.a.createElement(
                              'div',
                              { style: { marginTop: '48px' }, className: 'col s12' },
                              r.a.createElement(
                                'p',
                                null,
                                r.a.createElement(p.b, { to: '/local' }, 'Local Multiplayer'),
                              ),
                              r.a.createElement(
                                'p',
                                { style: { marginTop: '36px' } },
                                r.a.createElement(p.b, { to: '/' }, 'Back to Main Menu'),
                              ),
                              !m &&
                                r.a.createElement(
                                  n.Fragment,
                                  null,
                                  r.a.createElement('hr', null),
                                  r.a.createElement(
                                    'p',
                                    null,
                                    'To save your stats, sign in with your Google account.',
                                  ),
                                  r.a.createElement(
                                    'p',
                                    null,
                                    r.a.createElement(
                                      'button',
                                      { onClick: $, className: 'btn' },
                                      'Sign in',
                                    ),
                                  ),
                                ),
                            ),
                          ),
                        ),
                      )
                },
              },
            ]),
            t
          )
        })(n.Component),
        Me = Object(E.b)(function(e) {
          return { userReducer: e.user }
        })(Re)
      var Ge = function() {
        return r.a.createElement(
          'div',
          { className: 'container' },
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement('h2', { className: 'center-align' }, 'Main Menu'),
          ),
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement(
              'div',
              { className: 'col s8 offset-s2 m3 offset-m1' },
              r.a.createElement(
                p.b,
                { to: '/solo' },
                r.a.createElement(
                  'div',
                  { className: 'card' },
                  r.a.createElement(ee, { desc: '0012' }),
                ),
              ),
              r.a.createElement('p', { className: 'center-align' }, 'Solo/Local'),
            ),
            r.a.createElement(
              'div',
              { className: 'col s8 offset-s2 m3' },
              r.a.createElement(
                p.b,
                { to: '/lobby' },
                r.a.createElement(
                  'div',
                  { className: 'card' },
                  r.a.createElement(ee, { desc: '1121' }),
                ),
              ),
              r.a.createElement('p', { className: 'center-align' }, 'Join Game'),
            ),
            r.a.createElement(
              'div',
              { className: 'col s8 offset-s2 m3' },
              r.a.createElement(
                p.b,
                { to: '/host' },
                r.a.createElement(
                  'div',
                  { className: 'card' },
                  r.a.createElement(ee, { desc: '2200' }),
                ),
              ),
              r.a.createElement('p', { className: 'center-align' }, 'Host Game'),
            ),
          ),
        )
      }
      var Ae = function() {
        return r.a.createElement(
          'div',
          { className: 'rules container' },
          r.a.createElement('h2', null, 'Rules of the Game'),
          r.a.createElement(
            'p',
            null,
            'The object of the same is to find a sets of three cards that are either the same or different along each of four dimensions.',
          ),
          r.a.createElement(
            'p',
            null,
            'If that makes perfect sense to you, then go ahead and start playing. Otherwise, I will explain a bit more.',
          ),
          r.a.createElement(
            'p',
            null,
            'The game starts by laying out a board with twelve cards. Here are some example cards: ',
          ),
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '0000' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '1210' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '0022' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '2101' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '0120' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '2011' }),
              ),
            ),
          ),
          r.a.createElement(
            'p',
            null,
            "You'll notice that every card has four different characteristics:",
            r.a.createElement(
              'ul',
              { className: 'browser-default' },
              r.a.createElement('li', null, 'color'),
              r.a.createElement('li', null, 'number'),
              r.a.createElement('li', null, 'shape'),
              r.a.createElement('li', null, 'fill'),
            ),
            'and each of those characteristics has three different possibilities.',
          ),
          r.a.createElement(
            'p',
            null,
            'Three cards form a set if, for each of those four characteristics, the three cards are either ',
            r.a.createElement('em', null, 'all the same'),
            ' or ',
            r.a.createElement('em', null, 'all different.'),
          ),
          r.a.createElement(
            'p',
            null,
            'It is easier to understand with examples, so here is an example set:',
          ),
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '0112' }),
              ),
            ),
            ' ',
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '1111' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '2110' }),
              ),
            ),
          ),
          r.a.createElement(
            'p',
            null,
            'Which you can describe as follows:',
            r.a.createElement(
              'ul',
              { className: 'browser-default' },
              r.a.createElement('li', null, 'color - SAME'),
              r.a.createElement('li', null, 'shape - SAME'),
              r.a.createElement('li', null, 'number - DIFFERENT'),
              r.a.createElement('li', null, 'fill - DIFFERENT'),
            ),
            'Therefore, the three cards form a set.',
          ),
          r.a.createElement('p', null, 'Here is another set:'),
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '2022' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '1112' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '0202' }),
              ),
            ),
          ),
          r.a.createElement(
            'p',
            null,
            r.a.createElement(
              'ul',
              { className: 'browser-default' },
              r.a.createElement('li', null, 'color - DIFFERENT'),
              r.a.createElement('li', null, 'shape - DIFFERENT'),
              r.a.createElement('li', null, 'number - DIFFERENT'),
              r.a.createElement('li', null, 'fill - SAME'),
            ),
          ),
          r.a.createElement('p', null, 'This is not a set:'),
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '1220' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '1110' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '2000' }),
              ),
            ),
          ),
          r.a.createElement(
            'p',
            null,
            r.a.createElement(
              'ul',
              { className: 'browser-default' },
              r.a.createElement('li', null, 'fill - SAME'),
              r.a.createElement('li', null, 'color - DIFFERENT'),
              r.a.createElement('li', null, 'shape - DIFFERENT'),
              r.a.createElement('li', null, 'number - NOT THE SAME OR DIFFERENT!'),
            ),
            'Even though the cards have the same fill, different colors, and different shapes, the numbers are neither ',
            r.a.createElement('em', null, 'all the same'),
            ' nor ',
            r.a.createElement('em', null, 'all different'),
            ", so it's not a set.",
          ),
          r.a.createElement(
            'p',
            null,
            "It doesn't matter how many of the characteristics are the same, and how many are different, as long as for ",
            r.a.createElement('em', null, 'each'),
            " characteristic, the cards are all the same or all different. Here's one last example:",
          ),
          r.a.createElement(
            'div',
            { className: 'row' },
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '1122' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '0201' }),
              ),
            ),
            r.a.createElement(
              'div',
              { className: 'col s4' },
              r.a.createElement(
                'div',
                { className: 'card' },
                r.a.createElement(ee, { desc: '2010' }),
              ),
            ),
          ),
          r.a.createElement(
            'p',
            null,
            r.a.createElement(
              'ul',
              { className: 'browser-default' },
              r.a.createElement('li', null, 'color - DIFFERENT'),
              r.a.createElement('li', null, 'shape - DIFFERENT'),
              r.a.createElement('li', null, 'number - DIFFERENT'),
              r.a.createElement('li', null, 'fill - DIFFERENT'),
            ),
            'Each characteristic is different for all three cards, so this is a set.',
          ),
        )
      }
      var Ue = function(e) {
        var t = Object(E.d)(function(e) {
          return e.user
        })
        return (
          Object(n.useEffect)(function() {
            P.auth()
              .getRedirectResult()
              .then(function(e) {
                if (e.credential) var t = e.credential.accessToken
                var a = e.user
                console.log(t, a)
              })
              .catch(function(e) {
                e.code, e.message, e.email, e.credential
              })
          }, []),
          t
            ? r.a.createElement('div', { className: 'container' }, r.a.createElement(R, null))
            : r.a.createElement(
                'div',
                { className: 'container' },
                r.a.createElement('button', { onClick: $, className: 'btn' }, 'Sign in'),
              )
        )
      }
      function ze(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      function _e(e) {
        for (var t = 1; t < arguments.length; t++) {
          var a = null != arguments[t] ? arguments[t] : {}
          t % 2
            ? ze(a, !0).forEach(function(t) {
                Object(v.a)(e, t, a[t])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
            : ze(a).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
              })
        }
        return e
      }
      var Be = { declareTime: 5e3, colors: le, playingTo: 6, cpuDelay: 1200 },
        Le = function() {
          var e = _()
          return _e({}, W({ deck: e.slice(12), board: e.slice(0, 12) }), { selected: [] })
        },
        Ve = function(e) {
          for (var t = {}, a = 0; a < e; a++) t[a] = { score: 0, color: Be.colors[a] }
          return t
        },
        We = {
          numPlayers: null,
          players: Ve(2),
          gameStarted: !1,
          name: '1',
          setFound: !1,
          declarer: null,
          timeDeclared: null,
          gameOver: !1,
          difficulty: 2,
          cpuTurnInterval: 1e3,
          cpuFound: [],
        },
        He = (function(e) {
          function t(e) {
            var a
            return (
              Object(s.a)(this, t),
              ((a = Object(u.a)(this, Object(m.a)(t).call(this, e))).handleStartGame = function(
                e,
              ) {
                a.setState({ numPlayers: e, players: Ve(e) }), a.setState({ gameStarted: !0 })
              }),
              (a.updatePlayerScore = function(e, t) {
                var n = a.state.players,
                  r = n[e].score + t
                return [O()(n, Object(v.a)({}, e, { $merge: { score: r } })), r]
              }),
              (a.expireDeclare = function() {
                var e = a.state,
                  t = e.declarer,
                  n = e.selected
                if (!B(n)) {
                  var r = a.updatePlayerScore(t, -0.5),
                    c = Object(o.a)(r, 1)[0]
                  a.setState({ players: c, declarer: null, timeDeclared: null, selected: [] })
                }
              }),
              (a.markPointForDeclarer = function(e) {
                var t = a.updatePlayerScore(e, 1),
                  n = Object(o.a)(t, 2),
                  r = { players: n[0], gameOver: n[1] >= Be.playingTo && e }
                a.setState(r)
              }),
              (a.performDeclare = function(e) {
                if (!a.state.declarer) {
                  var t = { declarer: e, timeDeclared: new Date().getTime() }
                  a.setState(t),
                    (a.undeclareID = setTimeout(function() {
                      a.expireDeclare()
                    }, Be.declareTime))
                }
              }),
              (a.updateSelected = function(e, t) {
                var n = { setFound: B(e), selected: e, declarer: t }
                n.setFound &&
                  (clearTimeout(a.undeclareID),
                  setTimeout(function() {
                    a.removeSet()
                  }, 2e3)),
                  a.setState(n)
              }),
              (a.handleCardClick = function(e) {
                var t = a.state,
                  n = t.setFound,
                  r = t.declarer
                if (!n && null !== r) {
                  var c = V(e, a.state.selected)
                  a.setState({ selected: c }), B(c) && a.updateSelected(c, r)
                }
              }),
              (a.handlePlayerClick = function(e) {
                null === a.state.declarer && a.performDeclare(e)
              }),
              (a.handleRedeal = function() {
                var e = W(a.state)
                a.setState(e)
              }),
              (a.removeSet = function() {
                var e = a.state,
                  t = e.declarer,
                  n = e.selected
                if (B(n)) {
                  console.log('Set found, removing')
                  var r = _e(
                    {},
                    a.markPointForDeclarer(t),
                    { setFound: !1, declarer: null, timeDeclared: null },
                    H(a.state),
                  )
                  a.setState(r)
                }
                clearInterval(a.cpuTimer),
                  setTimeout(function() {
                    a.cpuTimer = setInterval(a.cpuTurn, a.state.cpuTurnInterval)
                  }, Be.cpuDelay)
              }),
              (a.resetGame = function() {
                clearInterval(a.cpuTimer), a.setState(_e({}, Object(M.cloneDeep)(We), {}, Le()))
              }),
              (a.state = _e({}, Object(M.cloneDeep)(We), {}, Le())),
              a
            )
          }
          return (
            Object(d.a)(t, e),
            Object(i.a)(t, [
              {
                key: 'render',
                value: function() {
                  var e = this,
                    t = this.state,
                    a = t.board,
                    n = t.deck,
                    c = t.selected,
                    l = t.declarer,
                    o = t.players,
                    s = t.numPlayers
                  t.setFound
                  return s
                    ? r.a.createElement(
                        r.a.Fragment,
                        null,
                        r.a.createElement(ue, {
                          board: a,
                          deck: n,
                          selected: c,
                          declarer: l,
                          handleCardClick: this.handleCardClick,
                          handlePlayerClick: this.handlePlayerClick,
                          handleDeclare: this.handleDeclare,
                          players: o,
                          setFound: this.state.setFound,
                          gameOver: this.state.gameOver,
                          myName: this.state.name,
                          resetGame: this.resetGame,
                          solo: !0,
                          sharedDevice: !0,
                          gameMode: 'shared-device',
                        }),
                      )
                    : r.a.createElement(
                        'div',
                        { className: 'container' },
                        r.a.createElement('h4', null, 'Choose Number of Players'),
                        r.a.createElement(
                          'div',
                          { className: 'row' },
                          r.a.createElement(
                            'div',
                            { className: 'col s12' },
                            Object(G.a)(Array(6).keys()).map(function(t) {
                              return r.a.createElement(
                                'div',
                                { key: 'players-'.concat(t), className: 'col s4 player-number' },
                                r.a.createElement(
                                  'div',
                                  {
                                    onClick: function() {
                                      e.handleStartGame(t + 1)
                                    },
                                    className: 'btn-large',
                                  },
                                  t + 1,
                                ),
                              )
                            }),
                          ),
                          r.a.createElement(
                            'div',
                            null,
                            r.a.createElement(
                              'p',
                              null,
                              r.a.createElement(p.b, { to: '/solo' }, 'Back'),
                            ),
                          ),
                        ),
                      )
                },
              },
            ]),
            t
          )
        })(n.Component),
        Ke = a(38),
        $e = a.n(Ke),
        Je = a(56)
      var Ye = function(e) {
        var t = Object(E.d)(function(e) {
            return e.user
          }),
          a = t.user,
          c = Object(n.useState)(null),
          l = Object(o.a)(c, 2),
          s = l[0],
          i = l[1]
        return (
          Object(E.c)(),
          Object(n.useEffect)(
            function() {
              var e = (function() {
                var e = Object(Je.a)(
                  $e.a.mark(function e() {
                    return $e.a.wrap(function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            Se.a.get('/api/user/stats/'.concat(a.uid)).then(function(e) {
                              i(e.data)
                            })
                          case 1:
                          case 'end':
                            return e.stop()
                        }
                    }, e)
                  }),
                )
                return function() {
                  return e.apply(this, arguments)
                }
              })()
              t.loading || null === a || e()
            },
            [t.loading],
          ),
          t.loading
            ? 'Loading...'
            : (console.log(s),
              null === a
                ? r.a.createElement('div', null, 'Sign in to view stats')
                : r.a.createElement(
                    'div',
                    { className: 'container' },
                    r.a.createElement('h3', null, 'Statistics'),
                    r.a.createElement(
                      'table',
                      { className: 'striped' },
                      r.a.createElement(
                        'thead',
                        null,
                        r.a.createElement(
                          'tr',
                          null,
                          r.a.createElement('th', null, 'Difficulty'),
                          r.a.createElement('th', null, 'Games Played'),
                          r.a.createElement('th', null, 'Winning Percentage'),
                        ),
                      ),
                      r.a.createElement(
                        'tbody',
                        null,
                        s &&
                          s.map(function(e, t) {
                            return r.a.createElement(
                              'tr',
                              { key: 'stats-'.concat(t) },
                              r.a.createElement('td', null, e.difficulty_level),
                              r.a.createElement('td', null, e.games_played),
                              r.a.createElement(
                                'td',
                                null,
                                Math.round((e.games_won / e.games_played) * 100),
                                '%',
                              ),
                            )
                          }),
                      ),
                    ),
                    r.a.createElement('p', null, r.a.createElement(p.b, { to: '/' }, 'Main Menu')),
                  ))
        )
      }
      function qe(e, t) {
        var a = Object.keys(e)
        if (Object.getOwnPropertySymbols) {
          var n = Object.getOwnPropertySymbols(e)
          t &&
            (n = n.filter(function(t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            a.push.apply(a, n)
        }
        return a
      }
      function Xe(e) {
        for (var t = 1; t < arguments.length; t++) {
          var a = null != arguments[t] ? arguments[t] : {}
          t % 2
            ? qe(a, !0).forEach(function(t) {
                Object(v.a)(e, t, a[t])
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(a))
            : qe(a).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(a, t))
              })
        }
        return e
      }
      var Ze = { turnTime: 4e3, colors: le, playingTo: 6, cpuDelay: 1200 },
        Qe = function(e) {
          var t = (function(e) {
              return Math.round((e - 3) / 3)
            })(e),
            a = _()
          return Xe({}, W({ deck: a }, { boardSize: e, minimumSets: t }), { selected: [] })
        },
        et = {
          players: { you: { score: 0, color: Ze.colors[0] } },
          gameStarted: !1,
          name: 'you',
          setFound: !1,
          gameOver: !1,
          startTime: null,
          elapsedTime: null,
          setsFound: [],
          setsOnBoard: null,
          cardsOnBoard: 12,
          popupVisible: !1,
          popUpText: 'SET!',
        },
        tt = (function(e) {
          function t(e) {
            var a
            return (
              Object(s.a)(this, t),
              ((a = Object(u.a)(this, Object(m.a)(t).call(this, e))).handleStartGame = function(
                e,
              ) {
                e.preventDefault()
                var t = a.state.cardsOnBoard,
                  n = Qe(t),
                  r = new Date()
                a.setState(
                  Xe({ gameStarted: !0, startTime: r, elapsedTime: 0 }, n, {
                    setsOnBoard: z(n.board),
                  }),
                ),
                  (window.timeId = setInterval(function() {
                    var e = Math.round((new Date().getTime() - r.getTime()) / 1e3)
                    a.setState({ elapsedTime: e })
                  }, 1e3))
              }),
              (a.componentDidMount = function() {}),
              (a.updatePlayerScore = function(e, t) {
                var n = a.state.players,
                  r = n[e].score + t
                return [O()(n, Object(v.a)({}, e, { $merge: { score: r } })), r]
              }),
              (a.performDeclare = function(e) {
                if (!a.state.declarer) {
                  var t = { declarer: e, timeDeclared: new Date().getTime() }
                  a.setState(t),
                    (a.undeclareID = setTimeout(function() {
                      a.expireDeclare()
                    }, Ze.turnTime))
                }
              }),
              (a.updateSelected = function(e, t) {
                var n = { setFound: B(e), selected: e, declarer: t }
                n.setFound &&
                  (clearTimeout(a.undeclareID),
                  setTimeout(function() {
                    a.removeSet()
                  }, 2e3)),
                  a.setState(n)
              }),
              (a.handleDeclare = function() {}),
              (a.resetLocalSelected = function() {
                var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0]
                a.setState(function(t) {
                  if (3 === t.selected.length && (e || !B(t.selected))) return { selected: [] }
                })
              }),
              (a.handleCardClick = function(e) {
                var t = V(e, a.state.selected)
                3 === t.length &&
                  (B(t)
                    ? (console.log('Set found'),
                      a.setState(function(e) {
                        window.setTimeout(function() {
                          a.setState({ popupVisible: !1 }), a.resetLocalSelected(!0)
                        }, 2e3)
                        var n = e.setsFound
                        return n
                          .map(function(e) {
                            return !Object(M.isEqual)(t.sort(), e)
                          })
                          .every(function(e) {
                            return e
                          })
                          ? {
                              setsFound: [].concat(Object(G.a)(n), [t.sort()]),
                              popupVisible: !0,
                              popUpText: 'SET!',
                            }
                          : { popupVisible: !0, popUpText: 'Already found!' }
                      }))
                    : (console.log('Bad set selected!'),
                      window.setTimeout(a.resetLocalSelected, 1200))),
                  a.setState(Xe({}, {}, { selected: t }))
              }),
              (a.handleRedeal = function() {}),
              (a.removeSet = function() {
                var e = a.state,
                  t = e.declarer,
                  n = e.selected
                if (B(n)) {
                  console.log('Set found, removing')
                  var r = Xe(
                    {},
                    a.markPointForDeclarer(t),
                    { setFound: !1, declarer: null, timeDeclared: null },
                    H(a.state),
                  )
                  a.setState(r)
                }
                clearInterval(a.cpuTimer),
                  setTimeout(function() {
                    a.cpuTimer = setInterval(a.cpuTurn, a.state.cpuTurnInterval)
                  }, Ze.cpuDelay)
              }),
              (a.resetGame = function() {
                clearInterval(a.cpuTimer), a.setState(Xe({}, Object(M.cloneDeep)(et), {}, Qe()))
              }),
              (a.state = Xe({}, Object(M.cloneDeep)(et))),
              a
            )
          }
          return (
            Object(d.a)(t, e),
            Object(i.a)(t, [
              {
                key: 'render',
                value: function() {
                  var e = this,
                    t = this.state,
                    a = t.board,
                    c = t.deck,
                    l = t.selected,
                    o = t.declarer,
                    s = t.players,
                    i = t.gameStarted,
                    u = (t.setFound, t.setsFound),
                    m = t.popupVisible,
                    d = this.props.userReducer,
                    f = d.user
                  return d.loading
                    ? 'Loading...'
                    : i
                    ? r.a.createElement(
                        r.a.Fragment,
                        null,
                        r.a.createElement(
                          Ee,
                          { visible: m },
                          r.a.createElement(
                            'p',
                            { className: 'flow-text center-align' },
                            this.state.popUpText,
                          ),
                        ),
                        r.a.createElement(ue, {
                          board: a,
                          deck: c,
                          selected: l,
                          declarer: o,
                          handleCardClick: this.handleCardClick,
                          handleDeclare: this.handleDeclare,
                          players: s,
                          setFound: this.state.setFound,
                          gameOver: this.state.gameOver,
                          myName: this.state.name,
                          resetGame: this.resetGame,
                          solo: !0,
                          gameMode: 'puzzle',
                          setsFound: u,
                          startTime: this.state.startTime,
                          elapsedTime: this.state.elapsedTime,
                        }),
                      )
                    : r.a.createElement(
                        'div',
                        { className: 'container' },
                        null !== f && r.a.createElement(R, null),
                        r.a.createElement('h3', null, 'Puzzle Mode'),
                        r.a.createElement('p', null, 'Find as many sets as you can'),
                        r.a.createElement(
                          'div',
                          { className: 'row' },
                          r.a.createElement(
                            'div',
                            { className: 'col s8 m4' },
                            r.a.createElement(we.a, {
                              ref: function(t) {
                                e.difficultyInput = t
                              },
                              min: 2,
                              max: 4,
                              orientation: 'horizontal',
                              tooltip: !0,
                              format: function(e) {
                                return 3 * e
                              },
                              value: Number(this.state.cardsOnBoard) / 3,
                              onChange: function(t) {
                                e.setState({ cardsOnBoard: 3 * t })
                              },
                            }),
                            r.a.createElement(
                              'form',
                              { onSubmit: this.handleStartGame },
                              r.a.createElement('input', {
                                type: 'submit',
                                value: 'Start',
                                className: 'btn',
                              }),
                            ),
                          ),
                          r.a.createElement(
                            'div',
                            { className: 'row' },
                            r.a.createElement(
                              'div',
                              { style: { marginTop: '48px' }, className: 'col s12' },
                              r.a.createElement(
                                'p',
                                { style: { marginTop: '36px' } },
                                r.a.createElement(p.b, { to: '/solo' }, 'Back to Solo Menu'),
                              ),
                              !f &&
                                r.a.createElement(
                                  n.Fragment,
                                  null,
                                  r.a.createElement('hr', null),
                                  r.a.createElement(
                                    'p',
                                    null,
                                    'To save your stats, sign in with your Google account.',
                                  ),
                                  r.a.createElement(
                                    'p',
                                    null,
                                    r.a.createElement(
                                      'button',
                                      { onClick: $, className: 'btn' },
                                      'Sign in',
                                    ),
                                  ),
                                ),
                            ),
                          ),
                        ),
                      )
                },
              },
            ]),
            t
          )
        })(n.Component),
        at = Object(E.b)(function(e) {
          return { userReducer: e.user }
        })(tt),
        nt = (function(e) {
          function t() {
            return Object(s.a)(this, t), Object(u.a)(this, Object(m.a)(t).apply(this, arguments))
          }
          return (
            Object(d.a)(t, e),
            Object(i.a)(t, [
              {
                key: 'render',
                value: function() {
                  return r.a.createElement(
                    n.Fragment,
                    null,
                    r.a.createElement(
                      p.a,
                      null,
                      r.a.createElement(
                        f.c,
                        null,
                        r.a.createElement(f.a, { exact: !0, path: '/', component: Ge }),
                        r.a.createElement(f.a, { path: '/host', component: ve }),
                        r.a.createElement(f.a, { path: '/lobby', component: Oe }),
                        r.a.createElement(f.a, { path: '/guest/:gameName', component: be }),
                        r.a.createElement(f.a, { path: '/solo', component: Me }),
                        r.a.createElement(f.a, { path: '/local', component: He }),
                        r.a.createElement(f.a, { path: '/rules', component: Ae }),
                        r.a.createElement(f.a, { path: '/login', component: Ue }),
                        r.a.createElement(f.a, { path: '/stats', component: Ye }),
                        r.a.createElement(f.a, { path: '/puzzle', component: at }),
                      ),
                    ),
                  )
                },
              },
            ]),
            t
          )
        })(n.Component)
      var rt = function(e) {
        var t = Object(n.useState)(null),
          a = Object(o.a)(t, 2),
          c = (a[0], a[1], Object(E.c)())
        return (
          Object(n.useEffect)(function() {
            C.a.auth().onAuthStateChanged(function(e) {
              if (e) {
                var t = window.localStorage.getItem('nickname') || e.displayName.split(' ')[0],
                  a = {
                    displayName: e.displayName,
                    email: e.email,
                    emailVerified: e.emailVerified,
                    photoURL: e.photoURL,
                    isAnonymous: e.isAnonymous,
                    uid: e.uid,
                    providerData: e.providerData,
                    nickname: t,
                  }
                c(N({ loading: !1, user: a })),
                  Se.a
                    .get('/api/user/'.concat(e.uid))
                    .then(function(e) {
                      console.log('User is registered')
                    })
                    .catch(function(t) {
                      t.response && 404 === t.response.status
                        ? (console.log('User not registered'),
                          Se.a
                            .post('/api/user', { uid: e.uid, info: a })
                            .then(function() {
                              console.log('User registered successfully')
                            })
                            .catch(function(e) {
                              console.log('Error registering user', e)
                            }))
                        : console.log('An error occurred trying to GET user info')
                    })
              } else console.log('Not signed in'), c(N({ loading: !1, user: null }))
            })
          }, []),
          r.a.createElement(nt, null)
        )
      }
      l.a.render(
        r.a.createElement(E.a, { store: F }, r.a.createElement(rt, null)),
        document.getElementById('root'),
      )
    },
  },
  [[57, 1, 2]],
])
//# sourceMappingURL=main.0c7315de.chunk.js.map
