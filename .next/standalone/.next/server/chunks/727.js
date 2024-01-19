exports.id = 727;
exports.ids = [727];
exports.modules = {

/***/ 3835:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var SvgSearch = function SvgSearch(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    height: "1em",
    fill: "currentColor",
    viewBox: "0 0 512 512"
  }, props), _path || (_path = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", {
    d: "M416 208c0 45.9-14.9 88.3-40 122.7l126.6 126.7c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
  })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SvgSearch);

/***/ }),

/***/ 9443:
/***/ ((module) => {

// Exports
module.exports = {
	"footer": "Footer_footer__1IwEk",
	"logo-text": "Footer_logo-text__IN4F3",
	"whale": "Footer_whale__xyIQl",
	"market": "Footer_market__1oiOA"
};


/***/ }),

/***/ 3364:
/***/ ((module) => {

// Exports
module.exports = {
	"nav": "Navbar_nav__UT9G1",
	"logo": "Navbar_logo__UtQCO",
	"logo-title": "Navbar_logo-title__N_RHF",
	"logo-text": "Navbar_logo-text__avjxK",
	"whale": "Navbar_whale__h4Zw_",
	"market": "Navbar_market__9j8Im",
	"search": "Navbar_search__MHLsF",
	"about": "Navbar_about__6AEQI",
	"item": "Navbar_item__d6MSm"
};


/***/ }),

/***/ 2601:
/***/ ((module) => {

// Exports
module.exports = {
	"search-button": "Search_search-button__b6FvP",
	"search-svg": "Search_search-svg__uGEwX",
	"search-show": "Search_search-show__Swj4B",
	"search-background": "Search_search-background__B0weg",
	"search": "Search_search__NXAuv",
	"search-input": "Search_search-input__3CCOZ",
	"result-list": "Search_result-list__oSeW6",
	"result": "Search_result__BAiuB"
};


/***/ }),

/***/ 6043:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var nprogress__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(808);
/* harmony import */ var nprogress__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(nprogress__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/**
 *
 * NProgress
 *
 */ 



const NextNProgress = ({ color ="var(--primary-dark)" , displaySpinner =false , startPosition =0.3 , stopDelayMs =200 , height =3 , showOnShallow =true , options , nonce , transformCSS =(css)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("style", {
        nonce: nonce,
        jsx: true,
        global: true,
        children: css
    })  })=>{
    let timer = null;
    react__WEBPACK_IMPORTED_MODULE_3__.useEffect(()=>{
        if (options) {
            nprogress__WEBPACK_IMPORTED_MODULE_2__.configure(options);
        }
        next_router__WEBPACK_IMPORTED_MODULE_1___default().events.on("routeChangeStart", routeChangeStart);
        next_router__WEBPACK_IMPORTED_MODULE_1___default().events.on("routeChangeComplete", routeChangeEnd);
        next_router__WEBPACK_IMPORTED_MODULE_1___default().events.on("routeChangeError", routeChangeError);
        return ()=>{
            next_router__WEBPACK_IMPORTED_MODULE_1___default().events.off("routeChangeStart", routeChangeStart);
            next_router__WEBPACK_IMPORTED_MODULE_1___default().events.off("routeChangeComplete", routeChangeEnd);
            next_router__WEBPACK_IMPORTED_MODULE_1___default().events.off("routeChangeError", routeChangeError);
        };
    }, []);
    const routeChangeStart = (_, { shallow  })=>{
        if (!shallow || showOnShallow) {
            nprogress__WEBPACK_IMPORTED_MODULE_2__.set(startPosition);
            nprogress__WEBPACK_IMPORTED_MODULE_2__.start();
        }
    };
    const routeChangeEnd = (_, { shallow  })=>{
        if (!shallow || showOnShallow) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                nprogress__WEBPACK_IMPORTED_MODULE_2__.done(true);
            }, stopDelayMs);
        }
    };
    const routeChangeError = (_err, _url, { shallow  })=>{
        if (!shallow || showOnShallow) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(()=>{
                nprogress__WEBPACK_IMPORTED_MODULE_2__.done(true);
            }, stopDelayMs);
        }
    };
    return transformCSS(`
    #nprogress {
      pointer-events: none;
    }
    #nprogress .bar {
      background: ${color};
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: ${height}px;
    }
    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
      opacity: 1;
      -webkit-transform: rotate(3deg) translate(0px, -4px);
      -ms-transform: rotate(3deg) translate(0px, -4px);
      transform: rotate(3deg) translate(0px, -4px);
    }
    #nprogress .spinner {
      display: ${displaySpinner ? "block" : "none"};
      position: fixed;
      z-index: 1031;
      top: 15px;
      right: 15px;
    }
    #nprogress .spinner-icon {
      width: 18px;
      height: 18px;
      box-sizing: border-box;
      border: solid 2px transparent;
      border-top-color: ${color};
      border-left-color: ${color};
      border-radius: 50%;
      -webkit-animation: nprogresss-spinner 400ms linear infinite;
      animation: nprogress-spinner 400ms linear infinite;
    }
    .nprogress-custom-parent {
      overflow: hidden;
      position: relative;
    }
    .nprogress-custom-parent #nprogress .spinner,
    .nprogress-custom-parent #nprogress .bar {
      position: absolute;
    }
    @-webkit-keyframes nprogress-spinner {
      0% {
        -webkit-transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
      }
    }
    @keyframes nprogress-spinner {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3__.memo(NextNProgress));


/***/ }),

/***/ 8505:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Footer_module_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9443);
/* harmony import */ var _Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_Footer_module_css__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4215);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_fonts__WEBPACK_IMPORTED_MODULE_3__);




const Footer = ()=>{
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: (_Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default().footer),
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: (_Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default().logo),
            children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                href: "/",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                        className: (_Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default()["logo-text"]) + " " + (_fonts__WEBPACK_IMPORTED_MODULE_3___default().className),
                        id: (_Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default().whale),
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("i", {
                            children: "wallstreet"
                        })
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                        className: (_Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default()["logo-text"]) + " " + (_fonts__WEBPACK_IMPORTED_MODULE_3___default().className),
                        id: (_Footer_module_css__WEBPACK_IMPORTED_MODULE_2___default().market),
                        children: [
                            " ",
                            "local"
                        ]
                    })
                ]
            })
        })
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Footer);


/***/ }),

/***/ 9468:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Navbar_module_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3364);
/* harmony import */ var _Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4215);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_fonts__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_Search_Button_Search__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8217);
/* harmony import */ var _components_Bar_Bar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6043);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_Search_Button_Search__WEBPACK_IMPORTED_MODULE_2__]);
_components_Search_Button_Search__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];






const Item = ({ link , text , tab  })=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
        className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default().item) + " " + (_fonts__WEBPACK_IMPORTED_MODULE_5___default().className),
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
            href: link,
            target: tab ? "_blank" : null,
            children: text
        })
    });
const Navbar = (props)=>{
    const variant = props.variant || null;
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_Bar_Bar__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {}),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("nav", {
                className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default().nav),
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default().logo),
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default()["logo-title"]),
                                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)((next_link__WEBPACK_IMPORTED_MODULE_1___default()), {
                                    href: "/",
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                            className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default()["logo-text"]) + " " + (_fonts__WEBPACK_IMPORTED_MODULE_5___default().className),
                                            id: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default().whale),
                                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("i", {
                                                children: "wallstreet"
                                            })
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                            className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default()["logo-text"]) + " " + (_fonts__WEBPACK_IMPORTED_MODULE_5___default().className),
                                            id: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default().market),
                                            children: [
                                                " ",
                                                "local"
                                            ]
                                        })
                                    ]
                                })
                            }),
                            variant === "home" ? null : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_Search_Button_Search__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {})
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("ul", {
                            className: (_Navbar_module_css__WEBPACK_IMPORTED_MODULE_4___default().about),
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Item, {
                                    link: "/recommended/top",
                                    text: "Top Filers"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Item, {
                                    link: "/recommended/searched",
                                    text: "Popular Filers"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Item, {
                                    link: "/about/resources",
                                    text: "Resources"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Item, {
                                    link: "https://github.com/bruhbruhroblox",
                                    text: "Contact",
                                    tab: true
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(Item, {
                                    link: "https://github.com/bruhbruhroblox/wallstreetlocal",
                                    text: "Source",
                                    tab: true
                                })
                            ]
                        })
                    })
                ]
            })
        ]
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Navbar);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8217:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Search_module_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2601);
/* harmony import */ var _Search_module_css__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_Search_module_css__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2167);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var swr__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5941);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(4215);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_fonts__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _public_static_search_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3835);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([swr__WEBPACK_IMPORTED_MODULE_3__]);
swr__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];








const server = "https://content.wallstreetlocal.com";
const fetcher = (url, query, limit)=>axios__WEBPACK_IMPORTED_MODULE_2___default().get(url, {
        params: {
            q: query,
            limit
        }
    }).then((res)=>res.data).catch((e)=>console.error(e));
const Search = ()=>{
    const [input, setInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useReducer)((prev, next)=>{
        return {
            ...prev,
            ...next
        };
    }, {
        results: [],
        search: "",
        focus: false
    });
    const [show, setShow] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const limit = 10;
    const { data  } = (0,swr__WEBPACK_IMPORTED_MODULE_3__["default"])(input.search ? [
        server + "/filers/search",
        input.search,
        limit
    ] : null, ([url, query, limit])=>fetcher(url, query, limit), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (data) {
            setInput({
                results: data.results
            });
        } else {
            setInput({
                results: []
            });
        }
    }, [
        data
    ]);
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                className: [
                    (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default()["search-button"]),
                    show ? (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default()["search-show"]) : ""
                ].join(" "),
                onClick: ()=>setShow(true),
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_public_static_search_svg__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z, {
                    className: (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default()["search-svg"])
                })
            }),
            show ? /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default()["search-background"]),
                        onClick: ()=>setShow(false)
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default().search),
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                            type: "text",
                            className: [
                                (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default()["search-input"]),
                                (_fonts__WEBPACK_IMPORTED_MODULE_7___default().className)
                            ].join(" "),
                            value: input.search,
                            placeholder: input.focus ? "" : "Start Typing...",
                            onChange: (e)=>setInput({
                                    search: e.target.value
                                }),
                            onFocus: ()=>setInput({
                                    focus: true
                                }),
                            onBlur: ()=>setInput({
                                    focus: false
                                }),
                            autoFocus: true
                        })
                    }),
                    input.search && input.results.length ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                        className: (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default()["result-list"]),
                        children: input.results.map((result)=>{
                            return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("li", {
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_4___default()), {
                                    href: `/filers/${result.cik}`,
                                    onClick: ()=>setShow(false),
                                    children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: (_Search_module_css__WEBPACK_IMPORTED_MODULE_6___default().result),
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                className: (_fonts__WEBPACK_IMPORTED_MODULE_7___default().className),
                                                children: [
                                                    result.name.toUpperCase(),
                                                    " ",
                                                    result.tickers.length == 0 ? "" : `(${result.tickers.join(", ")})`
                                                ]
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                                className: (_fonts__WEBPACK_IMPORTED_MODULE_7___default().className),
                                                children: [
                                                    "CIK",
                                                    result.cik.padStart(10, "0")
                                                ]
                                            })
                                        ]
                                    })
                                })
                            }, result.cik);
                        })
                    }) : null
                ]
            }) : null
        ]
    });
// return (
//   <div
//     className={[
//       styles["search"],
//       isFocused ? styles["search-expand"] : "",
//     ].join(" ")}
//   >
//     <div className={styles["search-box"]}>
//       <input
//         type="text"
//         className={[styles["search-input"], font.className].join(" ")}
//         value={searchInput}
//         placeholder={isFocused ? "" : "Search..."}
//         onChange={(e) => setSearchInput(e.target.value)}
//         onFocus={() => setIsFocused(true)}
//         onBlur={() => setIsFocused(false)}
//       />
//     </div>
//     <div className={[styles["results"]].join(" ")}>
//       {
//         <ul className={styles["result-list"]}>
//           {results.map((result) => {
//             return (
//               <li key={result.cik}>
//                 <Link href={`/filers/${result.cik}`}>
//                   <div className={styles["result"]}>
//                     <span className={font.className}>
//                       {result.name.toUpperCase()}{" "}
//                       {result.tickers.length == 0
//                         ? ""
//                         : `(${result.tickers.join(", ")})`}
//                     </span>
//                     <span className={font.className}>
//                       CIK{result.cik.padStart(10, "0")}
//                     </span>
//                   </div>
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>
//       }
//     </div>
//   </div>
// );
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Search);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;