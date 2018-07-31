LOGIN_STATE_NOT_LOGIN = 0, LOGIN_STATE_LOGINING = 1, LOGIN_STATE_LOGINED = 2, LOGIN_STATE_RECONNECTING = 3, SIGNALING_SDK_VERSION = "1.3.0", SIGNALING_SDK_VERSION_INT = 10103e5, Signal_ = function (e) {
    function n(e) {
        var n, t, i;
        for (i = e.length; i; i--) n = Math.floor(Math.random() * i), t = e[i - 1], e[i - 1] = e[n], e[n] = t
    }

    function t(e, n) {
        var t = new XMLHttpRequest;
        t.open("POST", e, !0), t.setRequestHeader("Content-type", "application/json; charset=utf-8"), t.send(JSON.stringify(n))
    }
    this.getSDKVersion = function () {
        return SIGNALING_SDK_VERSION
    }, this.getSDKVersion_int = function () {
        return SIGNALING_SDK_VERSION_INT
    }, this.lbs_url1 = ["https://lbs-1-sig.agora.io", "https://lbs-2-sig.agora.io"], this.lbs_url2 = ["https://lbs-3-sig.agora.io", "https://lbs-4-sig.agora.io"], this.rp_url = "http:///wsrp.sig.agora.io:8080/", this.vid = e, this.appid = e;
    var i = this;

    function o(e, n, t) {
        var i = e.split(n, t),
            o = 0;
        for (var s in i) o += n.length + i[s].length;
        return i.push(e.substr(o)), i
    }
    i.server_urls = [], i.setup_debugging = function (e, n) {
        if ("ap" === e) i.server_urls.push([n, 8001]), i.debugging = !0;
        else {
            if ("env" !== e) return;
            "lbs100" === n && (i.lbs_url1 = ["https://lbs100-1-sig.agora.io", "https://lbs100-2-sig.agora.io"], i.lbs_url2 = ["https://lbs100-3-sig.agora.io", "https://lbs100-4-sig.agora.io"])
        }
    };
    var s = function (s, a) {
        this.onLoginSuccess = "", this.onLoginFailed = "", this.onLogout = "", this.onInviteReceived = "", this.onMessageInstantReceive = "", this.account = s, this.config_msg_set = 0, this.config_inst_msg_with_msgid = 0, this.debugging = i.debugging, this.m_msgid = 0, this.state = LOGIN_STATE_LOGINING, this.line = "", this.uid = 0, this.dbg = !1, this.alive_conn = 2;
        var r = this;
        r.lbs_state = "requesting";
        var l = i.server_urls.slice();
        n(l), r.idx = 0, this.login_start_time = null, this.login_end_time = null, this.lbs_start_time = null, this.lbs_end_time = null, this.ap_start_time = null, this.ap_end_time = null, r.browser = null;
        try {
            r.browser = navigator.userAgent
        } catch (e) {
            console.log("This browser does not support navigator.userAgent")
        }
        r.login_data = {
            event: "login",
            now: "",
            time: "",
            duration: "",
            key: "",
            seq: "",
            result: "",
            account: "",
            browser: r.browser,
            sdk_version: i.getSDKVersion_int(),
            rmc: "",
            rmt: "",
            h1i1: "",
            h1t1: "",
            i2: "",
            i3: "",
            i3_0: "",
            i3_0_ip: "",
            i3_0_port: "",
            i3_1_ip: "",
            step: "",
            t2: "",
            t4: ""
        }, r.v3_msg_set = new Map, setTimeout(function () {
            var e = Date.now();
            for (var n of r.v3_msg_set.keys())
                if (r.v3_msg_set[n]) {
                    if (!(e - r.v3_msg_set[n] > 3e5)) break;
                    r.v3_msg_set.delete(n)
                }
        }, 2e3), r.socket = null;
        var c = function () {
                if (r.dbg) {
                    var e = [];
                    for (var n in arguments) e.push(arguments[n]);
                    console.log.apply(null, ["Agora sig dbg :"].concat(e))
                }
            },
            _ = function (e) {
                c("Updating the session state to " + e), r.state = e
            };
        r.logout = function () {
            r.state === LOGIN_STATE_LOGINED && r.onLogout ? r.call2("user_logout", {
                line: r.line
            }, function (e, n) {
                r.fire_logout(101), r.socket.close()
            }) : r.state === LOGIN_STATE_LOGINING && (_(LOGIN_STATE_NOT_LOGIN), r.fire_logout(101))
        }, r.fire_login_failed = function (e) {
            try {
                r.state === LOGIN_STATE_LOGINING && r.onLoginFailed && r.onLoginFailed(e)
            } catch (e) {
                console.error(e)
            } finally {
                _(LOGIN_STATE_NOT_LOGIN)
            }
        }, r.fire_logout = function (e) {
            e || (e = 0);
            try {
                r.state === LOGIN_STATE_LOGINED && r.onLogout && r.onLogout(e)
            } catch (e) {
                console.error(e)
            } finally {
                _(LOGIN_STATE_NOT_LOGIN)
            }
        }, r.getStatus = function () {
            return r.state
        };
        var g = function (n, t, i) {
                "requesting" == r.lbs_state && function (e, n, t) {
                    var i = new XMLHttpRequest,
                        o = !1,
                        s = setTimeout(function () {
                            o = !0, i.abort(), t("timeout", "")
                        }, n);
                    i.open("GET", e), i.onreadystatechange = function () {
                        4 === i.readyState && (o || (clearTimeout(s), 200 === i.status && t("", i.responseText)))
                    }, i.send(null)
                }(t[i] + "/getaddr?vid=" + e, 5e3, function (e, o) {
                    if (e) n - 1 > 0 ? g(n - 1, t, (i + 1) % t.length) : r.fire_login_failed(201);
                    else {
                        if ("requesting" != r.lbs_state) return;
                        r.lbs_state = "completed", l = JSON.parse(o).web, u(), u()
                    }
                })
            },
            u = function () {
                if (r.state === LOGIN_STATE_LOGINING) var n = new function () {
                    var e, t = "wss://" + (e = l[r.idx])[0].replace(/\./g, "-") + "-sig-web.agora.io:" + (e[1] + 1) + "/";
                    console.log(t), r.idx = (r.idx + 1) % l.length;
                    var i = new WebSocket(t);
                    i.state = "CONNECTING", setTimeout(function () {
                        i.readyState !== i.CONNECTING || i.close()
                    }, 6e3), i.onopen = function (e) {
                        if (r.state === LOGIN_STATE_NOT_LOGIN) i.close();
                        else if (r.state === LOGIN_STATE_LOGINING && null === r.socket)
                            for (var t in r.socket = n, i.state = "OPEN", c("on conn open"), r.go_login(), a) i.send(JSON.stringify(a[t]));
                        else i.close()
                    }, i.onclose = function (e) {
                        "OPEN" === i.state && r.state === LOGIN_STATE_LOGINED ? (s("_close", ""), c("on conn close")) : r.state === LOGIN_STATE_LOGINING ? 2 === r.alive_conn ? r.alive_conn -= 1 : 1 === r.alive_conn && r.onLoginFailed && r.fire_login_failed(201) : "CONNECTING" === i.state && u()
                    }, i.onmessage = function (e) {
                        var n = e.data;
                        c("Received message ", n);
                        var t = JSON.parse(n);
                        "close" === t[0] && r.state === LOGIN_STATE_LOGINING ? r.onLoginFailed && r.fire_login_failed(201) : s(t[0], t[1])
                    }, i.onerror = function (e) {
                        i.state = "CLOSED", r.idx < l.length && e.target.readyState === e.target.CLOSED ? u() : (c("on conn error"), r.state === LOGIN_STATE_LOGINED && r.socket === n ? r.fire_logout(102) : r.state === LOGIN_STATE_LOGINING && r.socket == n && r.fire_login_failed(201))
                    };
                    var o = {},
                        s = function (e, n) {
                            e in o && o[e](n)
                        },
                        a = [];
                    this.on = function (e, n) {
                        o[e] = n
                    }, this.emit = function (e, n) {
                        0 !== i.readyState ? (c("Sending ", [e, n]), i.send(JSON.stringify([e, n]))) : a.push([e, n])
                    }, this.close = function () {
                        i.close()
                    }
                };
                var g = 0,
                    h = function () {
                        setTimeout(function () {
                            r.state == LOGIN_STATE_LOGINED && (c("send ping", ++g), r.socket.emit("ping", g), h())
                        }, 1e4)
                    };
                r.go_login = function () {
                    "" === r.line ? (r.socket.emit("login", {
                        vid: e,
                        account: s,
                        uid: 0,
                        token: a,
                        device: "websdk",
                        ip: ""
                    }), r.login_data.account = s, r.login_data.vid = e, r.login_data.key = a, r.socket.on("login_ret", function (e) {
                        var n = e[0],
                            o = JSON.parse(e[1]);
                        if (r.login_data.duration = Date.now() - r.login_data.time, c("login ret", n, o), n || "ok" !== o.result) {
                            "" === n && (n = o.reason), r.login_data.now = Date.now(), r.login_data.result = "failed";
                            try {
                                if (r.onLoginFailed) {
                                    var s = "kick" === n ? 207 : "TokenErrorExpired" === n ? 204 : n.startsWith("TokenError") ? 206 : "wrong account" === n ? 209 : 201;
                                    r.fire_login_failed(s)
                                }
                            } catch (e) {
                                console.error(e)
                            } finally {
                                t(i.rp_url, r.login_data)
                            }
                        } else {
                            r.config_msg_set = o.config_msg_set || 0, r.config_inst_msg_with_msgid = o.config_inst_msg_with_msgid || 0, r.uid = o.uid, r.line = o.line, _(LOGIN_STATE_LOGINED), c("send ping", ++g), r.socket.emit("ping", g), h(), b();
                            try {
                                r.login_data.now = Date.now(), r.login_data.result = "success", r.onLoginSuccess && r.onLoginSuccess(r.uid)
                            } catch (s) {
                                console.error(s)
                            } finally {
                                t(i.rp_url, r.login_data), G()
                            }
                        }
                    })) : r.socket.emit("line_login", {
                        line: r.line
                    });
                    var n = 0,
                        l = {},
                        u = {};
                    r.call2 = function (e, t, i) {
                        l[++n] = [e, t, i], c("call ", [e, n, t]), r.socket.emit("call2", [e, n, t])
                    }, r.socket.on("call2-ret", function (e) {
                        var n = e[0],
                            t = e[1],
                            i = e[2];
                        if (n in l) {
                            var o = l[n][2];
                            if ("" === t) try {
                                "ok" != (i = JSON.parse(i)).result && (t = i.data.result)
                            } catch (e) {
                                t = "wrong resp:" + i
                            }
                            o && o(t, i)
                        }
                    });
                    var f, v = function (e, n) {
                            return "" === e
                        },
                        d = function (e) {
                            if (e.startsWith("msg-v2 ")) {
                                if (7 === (n = o(e, " ", 6)).length) return [n[1], n[4], n[6]]
                            } else if (e.startsWith("msg-v3 ")) {
                                var n;
                                if (8 === (n = o(e, " ", 7)).length) return r.v3_msg_set.get(n[1]) ? null : (r.v3_msg_set.set(n[1], Date.now()), [n[2], n[5], n[7]])
                            }
                            return null
                        };
                    r.socket.on("pong", function (e) {
                        c("recv pong")
                    }), r.socket.on("close", function (e) {
                        r.fire_logout(102), r.socket.close()
                    }), r.socket.on("_close", function (e) {
                        r.fire_logout(102)
                    });
                    var m = function (e) {
                            if (e) {
                                var n = e,
                                    t = n[0],
                                    i = n[1],
                                    o = n[2];
                                if ("instant" === i) try {
                                    r.onMessageInstantReceive && r.onMessageInstantReceive(t, 0, o)
                                } catch (e) {
                                    console.error(e)
                                }
                                if (i.startsWith("voip_")) {
                                    var s, a = JSON.parse(o),
                                        l = a.channel,
                                        c = a.peer,
                                        _ = a.extra;
                                    if ("voip_invite" === i) s = new A(l, c, _), r.call2("voip_invite_ack", {
                                        line: r.line,
                                        channelName: l,
                                        peer: c,
                                        extra: ""
                                    });
                                    else if (!(s = u[l + c])) return;
                                    if ("voip_invite" === i) try {
                                        r.onInviteReceived && r.onInviteReceived(s)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                    if ("voip_invite_ack" === i) try {
                                        s.onInviteReceivedByPeer && s.onInviteReceivedByPeer(_)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                    if ("voip_invite_accept" === i) try {
                                        s.onInviteAcceptedByPeer && s.onInviteAcceptedByPeer(_)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                    if ("voip_invite_refuse" === i) try {
                                        s.onInviteRefusedByPeer && s.onInviteRefusedByPeer(_)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                    if ("voip_invite_failed" === i) try {
                                        s.onInviteFailed && s.onInviteFailed(_)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                    if ("voip_invite_bye" === i) try {
                                        s.onInviteEndByPeer && s.onInviteEndByPeer(_)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                    if ("voip_invite_msg" === i) try {
                                        s.onInviteMsg && s.onInviteMsg(_)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                }
                            }
                        },
                        I = function () {
                            return Date.now()
                        },
                        N = 0,
                        p = 0,
                        L = 0,
                        O = 0,
                        T = !1,
                        S = [],
                        y = 0,
                        G = function () {
                            T || (T = !0, y = 0, 0 === r.config_msg_set ? r.call2("user_getmsg", {
                                line: r.line,
                                ver_clear: N,
                                max: 30
                            }, function (e, n) {
                                if ("" === e) {
                                    var t = n,
                                        i = N;
                                    for (var o in L = parseInt(t.ver_clear), N = Math.max(L, i), t.msgs) {
                                        var s = t.msgs[o][0],
                                            a = t.msgs[o][1];
                                        s >= N + 1 && (m(d(a)), N = s)
                                    }(30 === t.msgs.length || N < p) && G(), I()
                                }
                                T = !1, O = I()
                            }) : 1 === r.config_msg_set && r.call2("user_getmsg2", {
                                line: r.line,
                                clear_msgs: S,
                                max: 30
                            }, function (e, n) {
                                if ("" === e) {
                                    for (var t in S = [], n.msgs) {
                                        n.msgs[t][0];
                                        var i = n.msgs[t][1];
                                        m(d(i))
                                    }
                                    n.msgs.length >= 30 && G(), I()
                                }
                                T = !1, O = I()
                            }))
                        },
                        E = function () {
                            0 === r.config_msg_set ? O = I() : 1 === r.config_msg_set && 0 === y && (y = I() + 500)
                        },
                        b = function () {
                            setTimeout(function () {
                                if (r.state !== LOGIN_STATE_NOT_LOGIN) {
                                    if (r.state === LOGIN_STATE_LOGINED) {
                                        var e = I();
                                        0 === r.config_msg_set ? L < N && e - O > 1e3 ? G() : e - O >= 6e4 && G() : 1 === r.config_msg_set && S.length > 0 && e > y && y > 0 && G()
                                    }
                                    b()
                                }
                            }, 100)
                        };
                    r.socket.on("notify", function (e) {
                        c("recv notify ", e), "string" == typeof e && (e = (e = o(e, " ", 2)).slice(1));
                        var n = e[0];
                        if ("channel2" === n) {
                            var t = e[1],
                                i = e[2];
                            if (0 === r.config_msg_set && 0 !== f.m_channel_msgid && f.m_channel_msgid + 1 > i) return void c("ignore channel msg", t, i, f.m_channel_msgid);
                            f.m_channel_msgid = i;
                            var s = d(e[3]);
                            if (s) {
                                s[0];
                                var a = s[1],
                                    l = s[2],
                                    _ = JSON.parse(l);
                                if ("channel_msg" === a) try {
                                    f.onMessageChannelReceive && f.onMessageChannelReceive(_.account, _.uid, _.msg)
                                } catch (e) {
                                    console.error(e)
                                }
                                if ("channel_user_join" === a) try {
                                    f.onChannelUserJoined && f.onChannelUserJoined(_.account, _.uid)
                                } catch (e) {
                                    console.error(e)
                                }
                                if ("channel_user_leave" === a) try {
                                    f.onChannelUserLeaved && f.onChannelUserLeaved(_.account, _.uid)
                                } catch (e) {
                                    console.error(e)
                                }
                                if ("channel_attr_update" === a) try {
                                    f.onChannelAttrUpdated && f.onChannelAttrUpdated(_.name, _.value, _.type)
                                } catch (e) {
                                    console.error(e)
                                }
                            }
                        }
                        if ("msg" === n && (p = e[1], G()), "recvmsg" === n) {
                            var g = JSON.parse(e[1]),
                                u = g[0],
                                h = g[1];
                            u === N + 1 ? (m(d(h)), N = u, E()) : (p = u, G())
                        }
                        if ("recvmsg_by_msgid" === n) {
                            i = o(e[1], " ", 7)[1];
                            S.push(i), m(d(e[1])), E()
                        }
                    }), r.messageInstantSend = function (e, n, t) {
                        var i = {
                            line: r.line,
                            peer: e,
                            flag: "v1:E:3600",
                            t: "instant",
                            content: n
                        };
                        if (1 === r.config_inst_msg_with_msgid) {
                            var o = null;
                            "string" == typeof n && (o = JSON.parse(n).msgid), i.messageID = o || I() % 1e6 + r.m_msgid++ % 1e6
                        }
                        r.call2("user_sendmsg", i, function (e, n) {
                            t && t(!v(e))
                        })
                    }, r.invoke = function (e, n, t) {
                        if (e.startsWith("io.agora.signal.")) {
                            var i = e.split(".")[3];
                            n.line = r.line, r.call2(i, n, function (e, n) {
                                t && t(e, n)
                            })
                        }
                    };
                    var A = function (e, n, t) {
                        this.onInviteReceivedByPeer = "", this.onInviteAcceptedByPeer = "", this.onInviteRefusedByPeer = "", this.onInviteFailed = "", this.onInviteEndByPeer = "", this.onInviteEndByMyself = "", this.onInviteMsg = "";
                        var i = this;
                        this.channelName = e, this.peer = n, this.extra = t, u[e + n] = i, this.channelInviteUser2 = function () {
                            t = t || "", r.call2("voip_invite", {
                                line: r.line,
                                channelName: e,
                                peer: n,
                                extra: t
                            }, function (e, n) {
                                if (v(e));
                                else try {
                                    i.onInviteFailed(e)
                                } catch (e) {
                                    console.error(e)
                                }
                            })
                        }, this.channelInviteAccept = function (t) {
                            t = t || "", r.call2("voip_invite_accept", {
                                line: r.line,
                                channelName: e,
                                peer: n,
                                extra: t
                            })
                        }, this.channelInviteRefuse = function (t) {
                            t = t || "", r.call2("voip_invite_refuse", {
                                line: r.line,
                                channelName: e,
                                peer: n,
                                extra: t
                            })
                        }, this.channelInviteDTMF = function (t) {
                            r.call2("voip_invite_msg", {
                                line: r.line,
                                channelName: e,
                                peer: n,
                                extra: JSON.stringify({
                                    msgtype: "dtmf",
                                    msgdata: t
                                })
                            })
                        }, this.channelInviteEnd = function (t) {
                            t = t || "", r.call2("voip_invite_bye", {
                                line: r.line,
                                channelName: e,
                                peer: n,
                                extra: t
                            });
                            try {
                                i.onInviteEndByMyself && i.onInviteEndByMyself("")
                            } catch (e) {
                                console.error(e)
                            }
                        }
                    };
                    r.channelInviteUser2 = function (e, n, t) {
                        var i = new A(e, n, t);
                        return i.channelInviteUser2(), i
                    }, r.channelJoin = function (e) {
                        if (r.state == LOGIN_STATE_LOGINED) return f = new function () {
                            this.onChannelJoined = "", this.onChannelJoinFailed = "", this.onChannelLeaved = "", this.onChannelUserList = "", this.onChannelUserJoined = "", this.onChannelUserLeaved = "", this.onChannelUserList = "", this.onChannelAttrUpdated = "", this.onMessageChannelReceive = "", this.name = e, this.state = "joining", this.m_channel_msgid = 0, this.messageChannelSend = function (n, t) {
                                var i = {
                                    line: r.line,
                                    name: e,
                                    msg: n
                                };
                                if (1 === r.config_inst_msg_with_msgid) {
                                    var o = null;
                                    "string" == typeof n && (o = JSON.parse(n).msgid), i.msgID = o || I() % 1e6 + r.m_msgid++ % 1e6
                                }
                                r.call2("channel_sendmsg", i, function (e, n) {
                                    t && t()
                                })
                            }, this.channelLeave = function (n) {
                                r.call2("channel_leave", {
                                    line: r.line,
                                    name: e
                                }, function (e, t) {
                                    if (f.state = "leaved", n) n();
                                    else try {
                                        f.onChannelLeaved && f.onChannelLeaved(0)
                                    } catch (e) {
                                        console.error(e)
                                    }
                                })
                            }, this.channelSetAttr = function (n, t, i) {
                                r.call2("channel_set_attr", {
                                    line: r.line,
                                    channel: e,
                                    name: n,
                                    value: t
                                }, function (e, n) {
                                    i && i()
                                })
                            }, this.channelDelAttr = function (n, t) {
                                r.call2("channel_del_attr", {
                                    line: r.line,
                                    channel: e,
                                    name: n
                                }, function (e, n) {
                                    t && t()
                                })
                            }, this.channelClearAttr = function (n) {
                                r.call2("channel_clear_attr", {
                                    line: r.line,
                                    channel: e
                                }, function (e, t) {
                                    n && n()
                                })
                            }
                        }, r.call2("channel_join", {
                            line: r.line,
                            name: e
                        }, function (e, n) {
                            if ("" === e) {
                                f.state = "joined";
                                try {
                                    f.onChannelJoined && f.onChannelJoined()
                                } catch (e) {
                                    console.error(e)
                                }
                                var t = n;
                                try {
                                    f.onChannelUserList && f.onChannelUserList(t.list)
                                } catch (e) {
                                    console.error(e)
                                }
                                try {
                                    if (f.onChannelAttrUpdated)
                                        for (var i in t.attrs) f.onChannelAttrUpdated(i, t.attrs[i], "update")
                                } catch (e) {
                                    console.error(e)
                                }
                            } else try {
                                f.onChannelJoinFailed && f.onChannelJoinFailed(e)
                            } catch (e) {
                                console.error(e)
                            }
                        }), f;
                        c("You should log in first.")
                    }
                }
            };
        r.socket = null, r.debugging ? (r.lbs_state = "completed", r.login_data.time = Date.now(), u()) : (n(i.lbs_url1), n(i.lbs_url2), g(2, i.lbs_url1, 0), g(2, i.lbs_url2, 0))
    };
    this.login = function (e, n) {
        return new s(e, n)
    }
}, Signal = function (e) {
    return new Signal_(e)
};