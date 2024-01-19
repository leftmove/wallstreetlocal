(() => {
var exports = {};
exports.id = 262;
exports.ids = [262];
exports.modules = {

/***/ 8559:
/***/ ((module) => {

// Exports
module.exports = {
	"header": "Top_header__MHU9D",
	"main-header": "Top_main-header__OVNBL",
	"description": "Top_description__cTpRb",
	"description-text": "Top_description-text__sUd1t",
	"description-link": "Top_description-link__Wkc_j",
	"table": "Top_table__I174W",
	"table-container": "Top_table-container__UFPAQ",
	"header-column": "Top_header-column__e84F2",
	"body-column": "Top_body-column__ID9UO",
	"column": "Top_column__6RxWO",
	"column-link": "Top_column-link__HxP_O",
	"column-highlighted": "Top_column-highlighted__65mn_",
	"column-dehighlighted": "Top_column-dehighlighted__yLjoz"
};


/***/ }),

/***/ 4529:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "getServerSideProps": () => (/* binding */ getServerSideProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8559);
/* harmony import */ var _styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(968);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(2167);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(4215);
/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_fonts__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _components_Filer_Info__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1380);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_components_Filer_Info__WEBPACK_IMPORTED_MODULE_4__]);
_components_Filer_Info__WEBPACK_IMPORTED_MODULE_4__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];







const headers = [
    {
        display: "Name",
        accessor: "name"
    },
    {
        display: "CIK",
        accessor: "cik"
    },
    {
        display: "Assets Under Management",
        accessor: "market_value"
    },
    {
        display: "Last Updated",
        accessor: "date"
    }
];
const Top = (props)=>{
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_head__WEBPACK_IMPORTED_MODULE_1___default()), {
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("title", {
                    children: "Top Filers"
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default().header),
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                    className: [
                        (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default()["main-header"]),
                        (_fonts__WEBPACK_IMPORTED_MODULE_6___default().className)
                    ].join(" "),
                    children: "Top Filers"
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default().description),
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                    className: [
                        (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default()["description-text"]),
                        (_fonts__WEBPACK_IMPORTED_MODULE_6___default().className)
                    ].join(" "),
                    children: [
                        "The following contains links and information for",
                        " ",
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                            className: (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default()["description-link"]),
                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {
                                href: "https://en.wikipedia.org/wiki/List_of_asset_management_firms",
                                target: "_blank",
                                children: "the top investing firms"
                            })
                        }),
                        " ",
                        "in America, sorted by market value. All filers may not have info readily available, or be sorted correctly."
                    ]
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default()["table-container"]),
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("table", {
                    className: (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default().table),
                    children: [
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("thead", {
                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("tr", {
                                children: headers.map((header)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("th", {
                                        className: [
                                            (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default().column),
                                            (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default()["header-column"]),
                                            (_fonts__WEBPACK_IMPORTED_MODULE_6___default().className)
                                        ].join(" "),
                                        children: header.display
                                    }))
                            })
                        }),
                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("tbody", {
                            children: props.filers.map((filer)=>{
                                return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("tr", {
                                    children: headers.map((header)=>{
                                        const accessor = header.accessor;
                                        let display = filer[accessor];
                                        switch(accessor){
                                            case "name":
                                                display = (0,_components_Filer_Info__WEBPACK_IMPORTED_MODULE_4__/* .convertTitle */ .o)(display);
                                                display = /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_2___default()), {
                                                    href: `/filers/${filer.cik}`,
                                                    className: (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default()["column-link"]),
                                                    children: display.replace(/(^\w|\s\w)/g, (m)=>m.toUpperCase())
                                                });
                                                break;
                                            case "cik":
                                                display = display.padStart(10, "0");
                                            case "date":
                                            case "market_value":
                                            default:
                                                break;
                                        }
                                        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("td", {
                                            className: [
                                                (_styles_Top_module_css__WEBPACK_IMPORTED_MODULE_5___default().column),
                                                (_fonts__WEBPACK_IMPORTED_MODULE_6___default().className)
                                            ].join(" "),
                                            children: display
                                        });
                                    })
                                }, filer.cik);
                            })
                        })
                    ]
                })
            })
        ]
    });
};
const server = "https://content.wallstreetlocal.com";
async function getServerSideProps() {
    const data = await axios__WEBPACK_IMPORTED_MODULE_3___default().get(server + "/filers/top").then((r)=>r.data).catch((e)=>console.log(e));
    const filers = data?.filers || [];
    return {
        props: {
            filers
        }
    };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Top);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 3831:
/***/ ((module) => {

"use strict";
module.exports = require("@dnd-kit/core");

/***/ }),

/***/ 8196:
/***/ ((module) => {

"use strict";
module.exports = require("@dnd-kit/sortable");

/***/ }),

/***/ 477:
/***/ ((module) => {

"use strict";
module.exports = require("@dnd-kit/utilities");

/***/ }),

/***/ 5184:
/***/ ((module) => {

"use strict";
module.exports = require("@reduxjs/toolkit");

/***/ }),

/***/ 2167:
/***/ ((module) => {

"use strict";
module.exports = require("axios");

/***/ }),

/***/ 5648:
/***/ ((module) => {

"use strict";
module.exports = require("next-redux-wrapper");

/***/ }),

/***/ 3280:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/app-router-context.js");

/***/ }),

/***/ 2796:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/head-manager-context.js");

/***/ }),

/***/ 4014:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/i18n/normalize-locale-path.js");

/***/ }),

/***/ 8524:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/is-plain-object.js");

/***/ }),

/***/ 8020:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/mitt.js");

/***/ }),

/***/ 4406:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/page-path/denormalize-page-path.js");

/***/ }),

/***/ 4964:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router-context.js");

/***/ }),

/***/ 1751:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/add-path-prefix.js");

/***/ }),

/***/ 6220:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/compare-states.js");

/***/ }),

/***/ 299:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/format-next-pathname-info.js");

/***/ }),

/***/ 3938:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/format-url.js");

/***/ }),

/***/ 9565:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-asset-path-from-route.js");

/***/ }),

/***/ 5789:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/get-next-pathname-info.js");

/***/ }),

/***/ 1897:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-bot.js");

/***/ }),

/***/ 1428:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/is-dynamic.js");

/***/ }),

/***/ 8854:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-path.js");

/***/ }),

/***/ 1292:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/parse-relative-url.js");

/***/ }),

/***/ 4567:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/path-has-prefix.js");

/***/ }),

/***/ 979:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/querystring.js");

/***/ }),

/***/ 3297:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/remove-trailing-slash.js");

/***/ }),

/***/ 6052:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/resolve-rewrites.js");

/***/ }),

/***/ 4226:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-matcher.js");

/***/ }),

/***/ 5052:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/router/utils/route-regex.js");

/***/ }),

/***/ 9232:
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/shared/lib/utils.js");

/***/ }),

/***/ 5566:
/***/ ((module) => {

"use strict";
module.exports = require("next/error");

/***/ }),

/***/ 968:
/***/ ((module) => {

"use strict";
module.exports = require("next/head");

/***/ }),

/***/ 6689:
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ 6405:
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ 6022:
/***/ ((module) => {

"use strict";
module.exports = require("react-redux");

/***/ }),

/***/ 997:
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 5941:
/***/ ((module) => {

"use strict";
module.exports = import("swr");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [210,676,588,380], () => (__webpack_exec__(4529)));
module.exports = __webpack_exports__;

})();