(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const P = '#03254c', S = '#c4e8ff';
const MAIN_ITEMS = [
    {
        href: '/',
        label: 'Home',
        icon: '🏠'
    },
    {
        href: '/statistics',
        label: 'Statistics',
        icon: '📊'
    },
    {
        href: '/watch-party',
        label: 'Watch Party',
        icon: '🍿'
    },
    {
        href: '/gallery',
        label: 'Gallery',
        icon: '📸'
    },
    {
        href: '/history',
        label: 'History',
        icon: '📖'
    },
    {
        href: '/games',
        label: 'Games',
        icon: '🎮'
    }
];
const SETTINGS = {
    href: '/settings',
    label: 'Settings',
    icon: '⚙️'
};
const ALL_ITEMS = [
    ...MAIN_ITEMS,
    SETTINGS
];
function Navbar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "nav-desktop",
                style: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    background: P,
                    borderBottom: `1px solid rgba(196,232,255,0.12)`,
                    boxShadow: '0 2px 20px rgba(3,37,76,0.2)',
                    display: 'none'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        maxWidth: 1100,
                        margin: '0 auto',
                        height: 60,
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            style: {
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                flexShrink: 0,
                                marginRight: 8
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: 30,
                                        height: 30,
                                        borderRadius: 8,
                                        background: 'rgba(196,232,255,0.18)',
                                        border: '1.5px solid rgba(196,232,255,0.28)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9em'
                                    },
                                    children: "💕"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 42,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: 900,
                                        fontSize: '1.1em',
                                        color: 'white',
                                        letterSpacing: '-0.3px'
                                    },
                                    children: "TripLove"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 49,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/Navbar.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 1,
                                height: 28,
                                background: 'rgba(196,232,255,0.15)',
                                flexShrink: 0
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/ui/Navbar.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flex: 1
                            },
                            children: MAIN_ITEMS.map(({ href, label, icon })=>{
                                const active = pathname === href;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: href,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '6px 11px',
                                        borderRadius: 8,
                                        textDecoration: 'none',
                                        fontWeight: active ? 700 : 500,
                                        fontSize: '0.83em',
                                        letterSpacing: '0.01em',
                                        whiteSpace: 'nowrap',
                                        color: active ? P : 'rgba(255,255,255,0.7)',
                                        background: active ? S : 'transparent',
                                        transition: 'all 0.15s'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '0.95em'
                                            },
                                            children: icon
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/Navbar.tsx",
                                            lineNumber: 74,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/Navbar.tsx",
                                            lineNumber: 75,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, href, true, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 62,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/ui/Navbar.tsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: SETTINGS.href,
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '6px 11px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                flexShrink: 0,
                                fontWeight: pathname === SETTINGS.href ? 700 : 500,
                                fontSize: '0.83em',
                                color: pathname === SETTINGS.href ? P : 'rgba(255,255,255,0.7)',
                                background: pathname === SETTINGS.href ? S : 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(196,232,255,0.12)',
                                transition: 'all 0.15s'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: SETTINGS.icon
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: SETTINGS.label
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/Navbar.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/Navbar.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/Navbar.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "nav-mobile-top",
                style: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 40,
                    background: P,
                    boxShadow: '0 2px 12px rgba(3,37,76,0.2)',
                    display: 'none'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        height: 52,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        style: {
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "💕"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/Navbar.tsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: 900,
                                    fontSize: '1.08em',
                                    color: 'white',
                                    letterSpacing: '-0.3px'
                                },
                                children: "TripLove"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/Navbar.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/Navbar.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/Navbar.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/Navbar.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "nav-mobile-bottom",
                style: {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 40,
                    background: P,
                    boxShadow: '0 -2px 16px rgba(3,37,76,0.18)',
                    padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
                    display: 'none'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center'
                    },
                    children: ALL_ITEMS.map(({ href, label, icon })=>{
                        const active = pathname === href;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: href,
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3,
                                padding: '4px 6px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                flex: 1,
                                minWidth: 0,
                                position: 'relative'
                            },
                            children: [
                                active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: 'absolute',
                                        top: 0,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 24,
                                        height: 2,
                                        borderRadius: 1,
                                        background: S
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 133,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '1.15em',
                                        lineHeight: 1,
                                        opacity: active ? 1 : 0.5,
                                        transition: 'opacity 0.15s'
                                    },
                                    children: icon
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "nav-label",
                                    style: {
                                        fontSize: '0.51em',
                                        fontWeight: active ? 700 : 500,
                                        color: active ? 'white' : 'rgba(255,255,255,0.45)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '100%',
                                        textAlign: 'center'
                                    },
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/Navbar.tsx",
                                    lineNumber: 145,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, href, true, {
                            fileName: "[project]/components/ui/Navbar.tsx",
                            lineNumber: 126,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/components/ui/Navbar.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/Navbar.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `
        .nav-desktop { display: block !important; }
        .nav-mobile-top, .nav-mobile-bottom { display: none !important; }

        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-top { display: block !important; }
          .nav-mobile-bottom { display: flex !important; }
        }
        @media (max-width: 360px) {
          .nav-label { display: none !important; }
        }
      `
                }
            }, void 0, false, {
                fileName: "[project]/components/ui/Navbar.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Navbar, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createTripInvitation",
    ()=>createTripInvitation,
    "formatTanggalIndonesia",
    ()=>formatTanggalIndonesia,
    "formatUrl",
    ()=>formatUrl,
    "generateInvitationToken",
    ()=>generateInvitationToken,
    "getPublicImageUrl",
    ()=>getPublicImageUrl,
    "getPublicVideoUrl",
    ()=>getPublicVideoUrl,
    "incrementInvitationUse",
    ()=>incrementInvitationUse,
    "sortAlphabetically",
    ()=>sortAlphabetically,
    "uploadImage",
    ()=>uploadImage,
    "uploadImages",
    ()=>uploadImages,
    "uploadVideo",
    ()=>uploadVideo,
    "validateInvitationToken",
    ()=>validateInvitationToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
const IMAGE_BUCKET = 'trip-ideas-images';
const VIDEO_BUCKET = 'trip-videos';
function getPublicImageUrl(photoUrl) {
    let urlToProcess = Array.isArray(photoUrl) ? photoUrl[0] : photoUrl;
    if (!urlToProcess) return '/placeholder.jpg';
    if (urlToProcess.startsWith('http')) return urlToProcess;
    try {
        const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].storage.from(IMAGE_BUCKET).getPublicUrl(urlToProcess);
        return data.publicUrl || '/placeholder.jpg';
    } catch  {
        return '/placeholder.jpg';
    }
}
function getPublicVideoUrl(videoUrl) {
    if (!videoUrl) return null;
    if (videoUrl.startsWith('http')) return videoUrl;
    try {
        const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].storage.from(VIDEO_BUCKET).getPublicUrl(videoUrl);
        return data.publicUrl || null;
    } catch  {
        return null;
    }
}
async function uploadImage(file, userId = 'anon', subfolder = '') {
    if (!file) return null;
    const folderPath = subfolder ? `${userId}/${subfolder}` : userId;
    const path = `${folderPath}/${Date.now()}_${file.name}`;
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].storage.from(IMAGE_BUCKET).upload(path, file);
    if (error) {
        console.error('Upload image error:', error);
        return null;
    }
    const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}
async function uploadImages(files, userId = 'anon', subfolder = 'review') {
    const urls = [];
    for (const file of Array.from(files).slice(0, 5)){
        const url = await uploadImage(file, userId, subfolder);
        if (url) urls.push(url);
    }
    return urls;
}
async function uploadVideo(file, userId = 'anon', subfolder = 'review') {
    if (!file) return null;
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Video terlalu besar! Maksimal 50MB.');
        return null;
    }
    const allowedTypes = [
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'video/x-m4v'
    ];
    if (!allowedTypes.includes(file.type)) {
        alert('Format tidak didukung! Gunakan MP4, MOV, atau WEBM.');
        return null;
    }
    const path = `${userId}/${subfolder}/${Date.now()}_${file.name}`;
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].storage.from(VIDEO_BUCKET).upload(path, file);
    if (error) {
        console.error('Upload video error:', error);
        return null;
    }
    const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].storage.from(VIDEO_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}
function formatTanggalIndonesia(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
function formatUrl(url) {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
function sortAlphabetically(arr, key) {
    return [
        ...arr
    ].sort((a, b)=>String(a[key] || '').localeCompare(String(b[key] || ''), 'id-ID'));
}
function generateInvitationToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({
        length: 12
    }, ()=>chars[Math.floor(Math.random() * chars.length)]).join('');
}
async function validateInvitationToken(token) {
    try {
        const { data: invitation, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_invitations').select('*').eq('token', token).single();
        if (error || !invitation) return {
            valid: false,
            error: 'Invalid invitation link'
        };
        if (invitation.status === 'expired') return {
            valid: false,
            error: 'This invitation has expired'
        };
        if (new Date() > new Date(invitation.expires_at)) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_invitations').update({
                status: 'expired'
            }).eq('id', invitation.id);
            return {
                valid: false,
                error: 'This invitation has expired'
            };
        }
        if (invitation.use_count >= invitation.max_uses) return {
            valid: false,
            error: 'Invitation has reached maximum uses'
        };
        const { data: trip, error: tripError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_history').select('*').eq('id', invitation.trip_id).single();
        if (tripError || !trip) return {
            valid: false,
            error: 'Trip not found'
        };
        return {
            valid: true,
            invitation,
            trip
        };
    } catch (error) {
        return {
            valid: false,
            error: error.message
        };
    }
}
async function incrementInvitationUse(invitationId) {
    try {
        const { data: inv } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_invitations').select('use_count, max_uses').eq('id', invitationId).single();
        if (!inv) return false;
        const newUseCount = inv.use_count + 1;
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_invitations').update({
            use_count: newUseCount,
            status: newUseCount >= inv.max_uses ? 'used' : 'pending',
            used_at: new Date().toISOString()
        }).eq('id', invitationId);
        return true;
    } catch  {
        return false;
    }
}
async function createTripInvitation({ tripId, inviterName, invitedEmail = null, message = null, maxUses = 1, expiryDays = 30 }) {
    try {
        let token = generateInvitationToken();
        for(let i = 0; i < 5; i++){
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_invitations').select('id').eq('token', token).single();
            if (!data) break;
            token = generateInvitationToken();
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);
        const { data: invitation, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_invitations').insert([
            {
                trip_id: tripId,
                token,
                invited_email: invitedEmail,
                inviter_name: inviterName,
                invitation_message: message,
                expires_at: expiresAt.toISOString(),
                max_uses: maxUses,
                status: 'pending'
            }
        ]).select().single();
        if (error) throw error;
        const baseUrl = ("TURBOPACK compile-time truthy", 1) ? window.location.hostname === 'localhost' ? window.location.origin : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_APP_URL || window.location.origin : "TURBOPACK unreachable";
        return {
            success: true,
            token,
            invitationUrl: `${baseUrl}/review?token=${token}`,
            invitation
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/IdeaCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IdeaCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const T = {
    navy: '#03254c',
    navyMid: '#1a4d7a',
    sky: '#c4e8ff',
    skyMid: '#a8d8f0',
    white: '#ffffff',
    muted: '#6b8cae'
};
function IdeaCard({ idea, isSelected, rating, onToggle, onViewDetail }) {
    _s();
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-ideaid": idea.id,
        onClick: ()=>onToggle(idea.id),
        onMouseEnter: ()=>setHovered(true),
        onMouseLeave: ()=>setHovered(false),
        style: {
            position: 'relative',
            cursor: 'pointer',
            borderRadius: 16,
            border: `2.5px solid ${isSelected ? T.navy : hovered ? T.skyMid : T.sky}`,
            overflow: 'hidden',
            height: 170,
            boxShadow: isSelected ? '0 6px 20px rgba(3,37,76,.28)' : hovered ? '0 4px 14px rgba(3,37,76,.14)' : '0 2px 6px rgba(3,37,76,.07)',
            transform: isSelected ? 'translateY(-4px) scale(1.02)' : hovered ? 'translateY(-2px)' : 'none',
            transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    inset: 0,
                    background: T.sky
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPublicImageUrl"])(idea.photo_url),
                    alt: idea.idea_name,
                    fill: true,
                    style: {
                        objectFit: 'cover',
                        transition: 'transform .3s ease',
                        transform: hovered ? 'scale(1.04)' : 'scale(1)'
                    },
                    unoptimized: true
                }, void 0, false, {
                    fileName: "[project]/components/home/IdeaCard.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/home/IdeaCard.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    inset: 0,
                    background: isSelected ? 'linear-gradient(to top, rgba(3,37,76,.88) 0%, rgba(3,37,76,.3) 55%, rgba(3,37,76,.15) 100%)' : 'linear-gradient(to top, rgba(3,37,76,.75) 0%, rgba(3,37,76,.15) 55%, transparent 100%)',
                    transition: 'background .18s'
                }
            }, void 0, false, {
                fileName: "[project]/components/home/IdeaCard.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 10,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: T.white,
                    color: T.navy,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7em',
                    fontWeight: 900,
                    boxShadow: '0 2px 8px rgba(0,0,0,.25)'
                },
                children: "✓"
            }, void 0, false, {
                fileName: "[project]/components/home/IdeaCard.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: (e)=>{
                    e.stopPropagation();
                    onViewDetail(idea.id);
                },
                style: {
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    zIndex: 10,
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    borderRadius: 999,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72em',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                    opacity: hovered || isSelected ? 1 : 0.7,
                    transition: 'opacity .15s'
                },
                children: "👁️"
            }, void 0, false, {
                fileName: "[project]/components/home/IdeaCard.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '10px 11px 10px',
                    zIndex: 5
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontWeight: 700,
                            color: T.white,
                            fontSize: '0.82em',
                            lineHeight: 1.3,
                            margin: '0 0 4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textShadow: '0 1px 3px rgba(0,0,0,.3)'
                        },
                        children: idea.idea_name
                    }, void 0, false, {
                        fileName: "[project]/components/home/IdeaCard.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 4
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '0.68em',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontWeight: 500
                                },
                                children: idea.subtype_name
                            }, void 0, false, {
                                fileName: "[project]/components/home/IdeaCard.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            rating && rating.count > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: '#fbbf24',
                                            fontSize: '0.7em'
                                        },
                                        children: "★"
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/IdeaCard.tsx",
                                        lineNumber: 111,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: 'rgba(255,255,255,.85)',
                                            fontSize: '0.68em',
                                            fontWeight: 600
                                        },
                                        children: rating.average
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/IdeaCard.tsx",
                                        lineNumber: 112,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/IdeaCard.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '0.62em',
                                    color: 'rgba(255,255,255,0.4)',
                                    fontStyle: 'italic'
                                },
                                children: "no review"
                            }, void 0, false, {
                                fileName: "[project]/components/home/IdeaCard.tsx",
                                lineNumber: 115,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/IdeaCard.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/IdeaCard.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/IdeaCard.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(IdeaCard, "V8YbV+gTZxGliGj1g0fftBlvsq4=");
_c = IdeaCard;
var _c;
__turbopack_context__.k.register(_c, "IdeaCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/ActivityArea.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActivityArea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$IdeaCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/IdeaCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const T = {
    navy: '#03254c',
    navyMid: '#1a4d7a',
    sky: '#c4e8ff',
    skyLight: '#e1f3ff',
    skyMid: '#a8d8f0',
    bg: '#d0efff',
    white: '#ffffff',
    muted: '#6b8cae'
};
function ActivityArea({ ideas, categories, cities, ideaRatings, selectedIds, searchQuery, tripDate, onToggle, onViewDetail }) {
    _s();
    // ✅ Semua hooks di atas — tidak ada early return sebelum ini
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityArea.useMemo[filtered]": ()=>{
            if (!searchQuery.trim()) return ideas;
            const q = searchQuery.toLowerCase();
            return ideas.filter({
                "ActivityArea.useMemo[filtered]": (i)=>i.idea_name?.toLowerCase().includes(q) || i.category_name?.toLowerCase().includes(q) || i.subtype_name?.toLowerCase().includes(q)
            }["ActivityArea.useMemo[filtered]"]);
        }
    }["ActivityArea.useMemo[filtered]"], [
        ideas,
        searchQuery
    ]);
    const grouped = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ActivityArea.useMemo[grouped]": ()=>{
            const cityMap = {};
            filtered.forEach({
                "ActivityArea.useMemo[grouped]": (idea)=>{
                    const cityId = idea.city_id || '__none__';
                    const city = cities.find({
                        "ActivityArea.useMemo[grouped]": (c)=>c.id === cityId
                    }["ActivityArea.useMemo[grouped]"]) || null;
                    const catName = idea.category_name || 'Lainnya';
                    const subtype = idea.subtype_name || 'Umum';
                    if (!cityMap[cityId]) cityMap[cityId] = {
                        city,
                        cats: {}
                    };
                    if (!cityMap[cityId].cats[catName]) cityMap[cityId].cats[catName] = {
                        cat: catName,
                        subtypes: {}
                    };
                    if (!cityMap[cityId].cats[catName].subtypes[subtype]) cityMap[cityId].cats[catName].subtypes[subtype] = [];
                    cityMap[cityId].cats[catName].subtypes[subtype].push(idea);
                }
            }["ActivityArea.useMemo[grouped]"]);
            return Object.values(cityMap).sort({
                "ActivityArea.useMemo[grouped]": (a, b)=>{
                    if (!a.city) return 1;
                    if (!b.city) return -1;
                    return (a.city.display_order || 0) - (b.city.display_order || 0);
                }
            }["ActivityArea.useMemo[grouped]"]);
        }
    }["ActivityArea.useMemo[grouped]"], [
        filtered,
        cities
    ]);
    // ✅ Early returns SETELAH semua hooks
    if (!tripDate) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            textAlign: 'center',
            padding: '56px 24px',
            borderRadius: 20,
            background: T.white,
            border: `2px dashed ${T.skyMid}`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: '2.5em',
                    margin: '0 0 12px'
                },
                children: "🗓️"
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontWeight: 700,
                    color: T.navy,
                    margin: '0 0 5px',
                    fontSize: '0.95em'
                },
                children: "Pilih tanggal trip dulu yuk!"
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: T.muted,
                    fontSize: '0.82em',
                    margin: 0
                },
                children: "Isi tanggal di atas untuk mulai pilih aktivitas"
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/ActivityArea.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
    if (filtered.length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            textAlign: 'center',
            padding: '56px 24px',
            borderRadius: 20,
            background: T.white,
            border: `2px dashed ${T.skyMid}`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    fontSize: '2em',
                    margin: '0 0 8px'
                },
                children: "🔍"
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: T.navy,
                    fontWeight: 700,
                    margin: 0,
                    fontSize: '0.93em'
                },
                children: "Tidak ada hasil"
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    color: T.muted,
                    fontSize: '0.8em',
                    margin: '5px 0 0'
                },
                children: "Coba kata kunci lain"
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/ActivityArea.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        .hscroll::-webkit-scrollbar { height: 4px; }
        .hscroll::-webkit-scrollbar-track { background: transparent; }
        .hscroll::-webkit-scrollbar-thumb { background: ${T.skyMid}; border-radius: 99px; }
        .cat-header:hover { background: ${T.skyLight} !important; }
        details[open] > summary .cat-arrow { transform: rotate(90deg); }
        .cat-arrow { transition: transform .18s; display: inline-block; }
      `
            }, void 0, false, {
                fileName: "[project]/components/home/ActivityArea.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            grouped.map(({ city, cats })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                margin: '10px 0 6px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        height: 1.5,
                                        background: `linear-gradient(to right, ${T.skyMid}, transparent)`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/home/ActivityArea.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: 800,
                                        color: T.navy,
                                        fontSize: '0.82em',
                                        padding: '5px 16px',
                                        background: T.white,
                                        borderRadius: 999,
                                        border: `1.5px solid ${T.skyMid}`,
                                        boxShadow: '0 1px 8px rgba(3,37,76,.08)',
                                        letterSpacing: 0.2
                                    },
                                    children: [
                                        "📍 ",
                                        city?.name || 'Tanpa Kota'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/ActivityArea.tsx",
                                    lineNumber: 85,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        height: 1.5,
                                        background: `linear-gradient(to left, ${T.skyMid}, transparent)`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/home/ActivityArea.tsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/ActivityArea.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        Object.values(cats).map(({ cat, subtypes })=>{
                            const totalSelected = Object.values(subtypes).flat().filter((i)=>selectedIds.has(i.id)).length;
                            const totalIdeas = Object.values(subtypes).flat().length;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                open: true,
                                style: {
                                    marginBottom: 6
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        className: "cat-header",
                                        style: {
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            borderRadius: 14,
                                            background: T.white,
                                            border: `1.5px solid ${T.sky}`,
                                            fontWeight: 700,
                                            color: T.navy,
                                            fontSize: '0.87em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            listStyle: 'none',
                                            transition: 'background .15s',
                                            marginBottom: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "cat-arrow",
                                                style: {
                                                    color: T.muted,
                                                    fontSize: '0.75em'
                                                },
                                                children: "▶"
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                lineNumber: 116,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    flex: 1
                                                },
                                                children: cat
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                lineNumber: 117,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: T.muted,
                                                    fontSize: '0.72em',
                                                    fontWeight: 500
                                                },
                                                children: [
                                                    totalIdeas,
                                                    " tempat"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                lineNumber: 118,
                                                columnNumber: 19
                                            }, this),
                                            totalSelected > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
                                                    color: T.white,
                                                    borderRadius: 999,
                                                    padding: '2px 10px',
                                                    fontSize: '0.72em',
                                                    fontWeight: 800
                                                },
                                                children: [
                                                    totalSelected,
                                                    " dipilih"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                lineNumber: 120,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/ActivityArea.tsx",
                                        lineNumber: 104,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: T.skyLight,
                                            borderRadius: '0 0 14px 14px',
                                            border: `1.5px solid ${T.sky}`,
                                            borderTop: 'none',
                                            padding: '10px 0 4px'
                                        },
                                        children: Object.entries(subtypes).map(([sub, subIdeas])=>{
                                            const subSelected = subIdeas.filter((i)=>selectedIds.has(i.id)).length;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginBottom: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 7,
                                                            padding: '0 14px',
                                                            marginBottom: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    width: 3,
                                                                    height: 12,
                                                                    borderRadius: 99,
                                                                    background: T.skyMid,
                                                                    flexShrink: 0
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                                lineNumber: 142,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '0.7em',
                                                                    fontWeight: 700,
                                                                    color: T.muted,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: 0.8
                                                                },
                                                                children: sub
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                                lineNumber: 143,
                                                                columnNumber: 27
                                                            }, this),
                                                            subSelected > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    background: T.sky,
                                                                    color: T.navy,
                                                                    borderRadius: 999,
                                                                    padding: '1px 8px',
                                                                    fontSize: '0.68em',
                                                                    fontWeight: 800,
                                                                    border: `1px solid ${T.skyMid}`
                                                                },
                                                                children: [
                                                                    subSelected,
                                                                    " dipilih"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                                lineNumber: 145,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/ActivityArea.tsx",
                                                        lineNumber: 141,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "hscroll",
                                                        style: {
                                                            display: 'flex',
                                                            gap: 10,
                                                            overflowX: 'auto',
                                                            paddingLeft: 14,
                                                            paddingRight: 14,
                                                            paddingBottom: 6,
                                                            scrollSnapType: 'x mandatory'
                                                        },
                                                        children: subIdeas.map((idea)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    scrollSnapAlign: 'start',
                                                                    flexShrink: 0,
                                                                    width: 150
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$IdeaCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                    idea: idea,
                                                                    isSelected: selectedIds.has(idea.id),
                                                                    rating: ideaRatings[idea.id],
                                                                    onToggle: onToggle,
                                                                    onViewDetail: onViewDetail
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/home/ActivityArea.tsx",
                                                                    lineNumber: 161,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, idea.id, false, {
                                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                                lineNumber: 160,
                                                                columnNumber: 29
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/ActivityArea.tsx",
                                                        lineNumber: 152,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, sub, true, {
                                                fileName: "[project]/components/home/ActivityArea.tsx",
                                                lineNumber: 139,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/ActivityArea.tsx",
                                        lineNumber: 129,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, cat, true, {
                                fileName: "[project]/components/home/ActivityArea.tsx",
                                lineNumber: 103,
                                columnNumber: 15
                            }, this);
                        })
                    ]
                }, city?.id || '__none__', true, {
                    fileName: "[project]/components/home/ActivityArea.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/ActivityArea.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_s(ActivityArea, "BHRl1FuopDkO9pjx27R81bOkVxw=");
_c = ActivityArea;
var _c;
__turbopack_context__.k.register(_c, "ActivityArea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/SelectedPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SelectedPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
'use client';
;
function SelectedPanel({ selections, onRemove, onClearAll, onLocate }) {
    if (selections.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 20,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #e1f3ff, #c4e8ff)',
            border: '2px solid #c4e8ff'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: 800,
                            color: '#03254c',
                            fontSize: '0.95em'
                        },
                        children: [
                            "💜 ",
                            selections.length,
                            " aktivitas terpilih"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/SelectedPanel.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClearAll,
                        style: {
                            background: 'none',
                            border: 'none',
                            color: '#1a7aa8',
                            fontSize: '0.82em',
                            fontWeight: 700,
                            cursor: 'pointer'
                        },
                        children: "Hapus semua"
                    }, void 0, false, {
                        fileName: "[project]/components/home/SelectedPanel.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/SelectedPanel.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                },
                children: selections.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            borderRadius: 12,
                            background: 'white',
                            border: '1.5px solid #c4e8ff'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: 0,
                                            fontWeight: 700,
                                            fontSize: '0.88em',
                                            color: '#03254c',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        },
                                        children: s.name
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/SelectedPanel.tsx",
                                        lineNumber: 28,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: 0,
                                            fontSize: '0.75em',
                                            color: '#9ca3af'
                                        },
                                        children: s.subtype
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/SelectedPanel.tsx",
                                        lineNumber: 29,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/SelectedPanel.tsx",
                                lineNumber: 27,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onLocate(s.ideaId),
                                style: {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1em'
                                },
                                title: "Cari di list",
                                children: "📍"
                            }, void 0, false, {
                                fileName: "[project]/components/home/SelectedPanel.tsx",
                                lineNumber: 31,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onRemove(s.ideaId),
                                style: {
                                    background: '#fff1f2',
                                    border: 'none',
                                    borderRadius: 8,
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#f43f5e',
                                    fontWeight: 800,
                                    fontSize: '0.85em'
                                },
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/components/home/SelectedPanel.tsx",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this)
                        ]
                    }, s.ideaId, true, {
                        fileName: "[project]/components/home/SelectedPanel.tsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/home/SelectedPanel.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/SelectedPanel.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = SelectedPanel;
var _c;
__turbopack_context__.k.register(_c, "SelectedPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/IdeaDetailModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>IdeaDetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const P = '#03254c', PL = '#e1f3ff', PB = '#c4e8ff', TEXT = '#03254c', MUTED = '#9ca3af';
const inp = {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #c4e8ff',
    borderRadius: 12,
    fontSize: '0.93em',
    color: TEXT,
    background: 'white',
    outline: 'none',
    boxSizing: 'border-box'
};
function IdeaDetailModal({ idea, reviews, rating, tripDates, onClose, onEditInfo, onReviewSaved }) {
    _s();
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rvRating, setRvRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [rvText, setRvText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [rvName, setRvName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "IdeaDetailModal.useState": ()=>("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('lastReviewerName') || '' : "TURBOPACK unreachable"
    }["IdeaDetailModal.useState"]);
    const [photos, setPhotos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [video, setVideo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sorted = [
        ...reviews
    ].sort((a, b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const handleSave = async ()=>{
        if (rvRating === 0) return setStatus('⚠️ Beri minimal 1 bintang!');
        if (!rvName.trim()) return setStatus('⚠️ Masukkan nama kamu!');
        setSaving(true);
        setStatus('⏳ Menyimpan...');
        let photoUrls = [];
        if (photos?.length) photoUrls = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadImages"])(photos, 'anon', 'review');
        let videoUrl = null;
        if (video) {
            setStatus('🎬 Upload video...');
            videoUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadVideo"])(video, 'anon', 'review');
            if (!videoUrl) {
                setStatus('❌ Gagal upload video');
                setSaving(false);
                return;
            }
        }
        const payload = {
            idea_id: idea.id,
            trip_id: null,
            user_id: 'anon',
            reviewer_name: rvName.trim(),
            rating: rvRating,
            review_text: rvText || null,
            photo_url: photoUrls.length ? photoUrls : null,
            video_url: videoUrl
        };
        const { data: ex } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_reviews').select('id').eq('idea_id', idea.id).eq('reviewer_name', rvName.trim()).maybeSingle();
        const { error } = ex ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_reviews').update(payload).eq('id', ex.id) : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_reviews').insert([
            payload
        ]);
        if (error) {
            setStatus('❌ Gagal: ' + error.message);
            setSaving(false);
            return;
        }
        localStorage.setItem('lastReviewerName', rvName.trim());
        setStatus('✅ Review tersimpan!');
        setSaving(false);
        setShowForm(false);
        setRvRating(0);
        setRvText('');
        onReviewSaved();
    };
    const locs = idea.locations?.length ? idea.locations : idea.address || idea.maps_url ? [
        {
            name: 'Lokasi Utama',
            address: idea.address,
            maps_url: idea.maps_url,
            phone: idea.phone,
            opening_hours: idea.opening_hours,
            price_range: idea.price_range,
            website: idea.website,
            notes: idea.notes
        }
    ] : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(30,27,75,0.4)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '20px 16px',
            overflowY: 'auto'
        },
        onClick: (e)=>{
            if (e.target === e.currentTarget) onClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: 'white',
                borderRadius: 24,
                border: '2px solid #c4e8ff',
                boxShadow: '0 16px 48px rgba(168,85,247,0.2)',
                width: '100%',
                maxWidth: 640,
                margin: 'auto'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        position: 'relative',
                        height: 200,
                        background: '#c4e8ff',
                        borderRadius: '22px 22px 0 0',
                        overflow: 'hidden'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPublicImageUrl"])(idea.photo_url),
                            alt: idea.idea_name,
                            fill: true,
                            style: {
                                objectFit: 'cover'
                            },
                            unoptimized: true
                        }, void 0, false, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(30,27,75,0.5), transparent)'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                background: 'rgba(255,255,255,0.9)',
                                border: 'none',
                                borderRadius: 999,
                                padding: '4px 12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: TEXT,
                                fontSize: '0.88em'
                            },
                            children: "✕ Tutup"
                        }, void 0, false, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'absolute',
                                bottom: 14,
                                left: 18,
                                right: 18
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '1.3em',
                                        margin: '0 0 2px',
                                        textShadow: '0 1px 4px rgba(0,0,0,0.3)'
                                    },
                                    children: idea.idea_name
                                }, void 0, false, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 56,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '0.82em',
                                        margin: 0
                                    },
                                    children: [
                                        idea.category_name,
                                        " · ",
                                        idea.subtype_name
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 57,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20
                    },
                    children: [
                        rating && rating.count > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 16px',
                                borderRadius: 14,
                                background: PL,
                                border: '1.5px solid #a8d8f0'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '1.5em'
                                    },
                                    children: "⭐"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 66,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 800,
                                                color: P,
                                                fontSize: '1.1em'
                                            },
                                            children: rating.average
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: MUTED,
                                                fontSize: '0.82em',
                                                marginLeft: 6
                                            },
                                            children: [
                                                "dari ",
                                                rating.count,
                                                " review"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 69,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 67,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this),
                        locs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                padding: '20px',
                                border: '2px dashed #a8d8f0',
                                borderRadius: 14
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        color: MUTED,
                                        fontSize: '0.9em',
                                        margin: '0 0 10px'
                                    },
                                    children: "💡 Info lokasi belum ditambahkan"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 77,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onEditInfo(idea.id),
                                    style: {
                                        padding: '7px 18px',
                                        borderRadius: 999,
                                        background: PL,
                                        color: P,
                                        border: '2px solid #a8d8f0',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: '0.85em'
                                    },
                                    children: "✏️ Tambah Lokasi"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 10
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                color: P,
                                                fontWeight: 700,
                                                margin: 0,
                                                fontSize: '0.95em'
                                            },
                                            children: [
                                                "📍 Lokasi (",
                                                locs.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 83,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>onEditInfo(idea.id),
                                            style: {
                                                background: PL,
                                                border: '1.5px solid #a8d8f0',
                                                borderRadius: 999,
                                                padding: '5px 12px',
                                                color: P,
                                                fontWeight: 700,
                                                fontSize: '0.8em',
                                                cursor: 'pointer'
                                            },
                                            children: "✏️ Kelola"
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 84,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 82,
                                    columnNumber: 15
                                }, this),
                                locs.map((loc, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                        open: i === 0,
                                        style: {
                                            borderRadius: 12,
                                            border: '1.5px solid #c4e8ff',
                                            marginBottom: 8,
                                            overflow: 'hidden'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                                style: {
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.88em',
                                                    color: P,
                                                    background: PL,
                                                    userSelect: 'none'
                                                },
                                                children: loc.name || 'Lokasi ' + (i + 1)
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                lineNumber: 88,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '12px 14px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 5,
                                                    fontSize: '0.85em',
                                                    color: TEXT
                                                },
                                                children: [
                                                    loc.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: [
                                                            "📍 ",
                                                            loc.address
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 90,
                                                        columnNumber: 37
                                                    }, this),
                                                    loc.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: [
                                                            "📞 ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: 'tel:' + loc.phone,
                                                                style: {
                                                                    color: '#03254c'
                                                                },
                                                                children: loc.phone
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                                lineNumber: 91,
                                                                columnNumber: 62
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 91,
                                                        columnNumber: 35
                                                    }, this),
                                                    loc.opening_hours && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: [
                                                            "🕐 ",
                                                            loc.opening_hours
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 92,
                                                        columnNumber: 43
                                                    }, this),
                                                    loc.price_range && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: [
                                                            "💰 ",
                                                            loc.price_range
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 93,
                                                        columnNumber: 41
                                                    }, this),
                                                    loc.website && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: [
                                                            "🌐 ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                href: loc.website,
                                                                target: "_blank",
                                                                rel: "noreferrer",
                                                                style: {
                                                                    color: '#03254c'
                                                                },
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatUrl"])(loc.website)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                                lineNumber: 94,
                                                                columnNumber: 64
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 94,
                                                        columnNumber: 37
                                                    }, this),
                                                    loc.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        style: {
                                                            margin: 0
                                                        },
                                                        children: [
                                                            "📝 ",
                                                            loc.notes
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 95,
                                                        columnNumber: 35
                                                    }, this),
                                                    loc.maps_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: loc.maps_url,
                                                        target: "_blank",
                                                        rel: "noreferrer",
                                                        style: {
                                                            display: 'inline-block',
                                                            marginTop: 6,
                                                            padding: '6px 16px',
                                                            borderRadius: 999,
                                                            background: 'linear-gradient(135deg,#03254c,#1a4d7a)',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            fontSize: '0.83em',
                                                            textDecoration: 'none'
                                                        },
                                                        children: "🗺️ Buka Google Maps"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                        lineNumber: 96,
                                                        columnNumber: 38
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                lineNumber: 89,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                        lineNumber: 87,
                                        columnNumber: 17
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 81,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 14
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                color: P,
                                                fontWeight: 700,
                                                margin: 0,
                                                fontSize: '0.95em'
                                            },
                                            children: "📝 Reviews"
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 106,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowForm((p)=>!p),
                                            style: {
                                                padding: '7px 16px',
                                                borderRadius: 999,
                                                background: showForm ? '#fff1f2' : PL,
                                                color: showForm ? '#f43f5e' : P,
                                                border: '2px solid ' + (showForm ? '#fda4af' : '#a8d8f0'),
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                fontSize: '0.83em'
                                            },
                                            children: showForm ? '✕ Tutup' : '+ Tulis Review'
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 107,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                showForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginBottom: 18,
                                        padding: 18,
                                        borderRadius: 16,
                                        background: PL,
                                        border: '2px solid #a8d8f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 12
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: 12
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                fontSize: '0.78em',
                                                                fontWeight: 700,
                                                                color: MUTED,
                                                                display: 'block',
                                                                marginBottom: 5
                                                            },
                                                            children: "Nama"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 115,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            value: rvName,
                                                            onChange: (e)=>setRvName(e.target.value),
                                                            style: inp
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 115,
                                                            columnNumber: 135
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 115,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                fontSize: '0.78em',
                                                                fontWeight: 700,
                                                                color: MUTED,
                                                                display: 'block',
                                                                marginBottom: 5
                                                            },
                                                            children: "Rating"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 116,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: 4,
                                                                paddingTop: 4
                                                            },
                                                            children: [
                                                                1,
                                                                2,
                                                                3,
                                                                4,
                                                                5
                                                            ].map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    onClick: ()=>setRvRating(s),
                                                                    style: {
                                                                        fontSize: '1.6em',
                                                                        cursor: 'pointer',
                                                                        color: s <= rvRating ? '#f59e0b' : '#e5e7eb'
                                                                    },
                                                                    children: "★"
                                                                }, s, false, {
                                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                                    lineNumber: 116,
                                                                    columnNumber: 210
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 116,
                                                            columnNumber: 137
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 116,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 114,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        fontSize: '0.78em',
                                                        fontWeight: 700,
                                                        color: MUTED,
                                                        display: 'block',
                                                        marginBottom: 5
                                                    },
                                                    children: "Ulasan"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 118,
                                                    columnNumber: 22
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    value: rvText,
                                                    onChange: (e)=>setRvText(e.target.value),
                                                    placeholder: "Gimana pengalamannya?",
                                                    rows: 2,
                                                    style: {
                                                        ...inp,
                                                        resize: 'vertical'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 118,
                                                    columnNumber: 135
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 118,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: 12
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                fontSize: '0.78em',
                                                                fontWeight: 700,
                                                                color: MUTED,
                                                                display: 'block',
                                                                marginBottom: 5
                                                            },
                                                            children: "📷 Foto"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "file",
                                                            accept: "image/*",
                                                            multiple: true,
                                                            onChange: (e)=>setPhotos(e.target.files),
                                                            style: {
                                                                fontSize: '0.82em'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 120,
                                                            columnNumber: 138
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 120,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                fontSize: '0.78em',
                                                                fontWeight: 700,
                                                                color: MUTED,
                                                                display: 'block',
                                                                marginBottom: 5
                                                            },
                                                            children: "🎬 Video"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 121,
                                                            columnNumber: 24
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "file",
                                                            accept: "video/*",
                                                            onChange: (e)=>setVideo(e.target.files?.[0] || null),
                                                            style: {
                                                                fontSize: '0.82em'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 121,
                                                            columnNumber: 139
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 119,
                                            columnNumber: 17
                                        }, this),
                                        status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: 0,
                                                fontSize: '0.85em',
                                                fontWeight: 600,
                                                color: status.startsWith('❌') ? '#f43f5e' : P
                                            },
                                            children: status
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 123,
                                            columnNumber: 28
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleSave,
                                            disabled: saving,
                                            style: {
                                                padding: '12px',
                                                borderRadius: 999,
                                                background: saving ? '#a8d8f0' : 'linear-gradient(135deg,#03254c,#1a4d7a)',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: 800,
                                                cursor: saving ? 'not-allowed' : 'pointer',
                                                boxShadow: saving ? 'none' : '0 4px 14px rgba(168,85,247,0.35)'
                                            },
                                            children: saving ? '⏳ Menyimpan...' : '💾 Simpan Review'
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 124,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 113,
                                    columnNumber: 15
                                }, this),
                                sorted.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: MUTED,
                                        fontSize: '0.9em',
                                        border: '2px dashed #c4e8ff',
                                        borderRadius: 14
                                    },
                                    children: "Belum ada review. Jadilah yang pertama! 🌟"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 129,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10
                                    },
                                    children: sorted.map((rv)=>{
                                        const vurl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPublicVideoUrl"])(rv.video_url);
                                        const pics = Array.isArray(rv.photo_url) ? rv.photo_url : rv.photo_url ? [
                                            rv.photo_url
                                        ] : [];
                                        const td = rv.trip_id ? tripDates[rv.trip_id] : undefined;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: 14,
                                                borderRadius: 14,
                                                border: '1.5px solid #c4e8ff',
                                                background: PL
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: 6,
                                                        marginBottom: 8
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 8
                                                            },
                                                            children: [
                                                                rv.reviewer_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        padding: '3px 12px',
                                                                        borderRadius: 999,
                                                                        background: 'white',
                                                                        border: '1.5px solid #a8d8f0',
                                                                        fontSize: '0.8em',
                                                                        fontWeight: 700,
                                                                        color: P
                                                                    },
                                                                    children: [
                                                                        "👤 ",
                                                                        rv.reviewer_name
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                                    lineNumber: 140,
                                                                    columnNumber: 48
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        color: '#f59e0b',
                                                                        fontSize: '0.95em'
                                                                    },
                                                                    children: '★'.repeat(rv.rating || 0)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                                    lineNumber: 141,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 139,
                                                            columnNumber: 25
                                                        }, this),
                                                        td && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: MUTED,
                                                                fontSize: '0.78em'
                                                            },
                                                            children: [
                                                                "📅 ",
                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTanggalIndonesia"])(td.trip_date)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 143,
                                                            columnNumber: 32
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 23
                                                }, this),
                                                rv.review_text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        margin: '0 0 8px',
                                                        fontSize: '0.88em',
                                                        color: TEXT,
                                                        fontStyle: 'italic',
                                                        lineHeight: 1.5
                                                    },
                                                    children: [
                                                        '"',
                                                        rv.review_text,
                                                        '"'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 42
                                                }, this),
                                                pics.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 8,
                                                        marginTop: 8
                                                    },
                                                    children: pics.map((url, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                position: 'relative',
                                                                width: 80,
                                                                height: 80,
                                                                borderRadius: 10,
                                                                overflow: 'hidden',
                                                                border: '2px solid #c4e8ff'
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPublicImageUrl"])(url),
                                                                alt: "foto",
                                                                fill: true,
                                                                style: {
                                                                    objectFit: 'cover'
                                                                },
                                                                unoptimized: true
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                                lineNumber: 146,
                                                                columnNumber: 263
                                                            }, this)
                                                        }, i, false, {
                                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                            lineNumber: 146,
                                                            columnNumber: 133
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 146,
                                                    columnNumber: 43
                                                }, this),
                                                vurl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                                    src: vurl,
                                                    controls: true,
                                                    style: {
                                                        width: '100%',
                                                        maxWidth: 320,
                                                        borderRadius: 12,
                                                        marginTop: 8
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 32
                                                }, this)
                                            ]
                                        }, rv.id, true, {
                                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                            lineNumber: 137,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                                    lineNumber: 131,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/IdeaDetailModal.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/home/IdeaDetailModal.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/home/IdeaDetailModal.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/home/IdeaDetailModal.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(IdeaDetailModal, "vMOfjvUa1uEWHc+G2kWPs0kmF5M=");
_c = IdeaDetailModal;
var _c;
__turbopack_context__.k.register(_c, "IdeaDetailModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/EditLocationModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditLocationModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const P = '#03254c', PL = '#e1f3ff', PB = '#c4e8ff', MUTED = '#9ca3af';
const inp = {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid #c4e8ff',
    borderRadius: 12,
    fontSize: '0.93em',
    color: P,
    background: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
};
function emptyLoc() {
    return {
        name: '',
        address: null,
        maps_url: null,
        phone: null,
        opening_hours: null,
        price_range: null,
        website: null,
        notes: null
    };
}
function EditLocationModal({ idea, onClose, onSaved }) {
    _s();
    const initLocs = ()=>{
        if (idea.locations?.length) return idea.locations.map((l)=>({
                ...l
            }));
        if (idea.address || idea.maps_url) return [
            {
                name: 'Lokasi Utama',
                address: idea.address || null,
                maps_url: idea.maps_url || null,
                phone: idea.phone || null,
                opening_hours: idea.opening_hours || null,
                price_range: idea.price_range || null,
                website: idea.website || null,
                notes: idea.notes || null
            }
        ];
        return [
            emptyLoc()
        ];
    };
    const [locs, setLocs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initLocs);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    function updateLoc(i, key, val) {
        setLocs((prev)=>prev.map((l, idx)=>idx === i ? {
                    ...l,
                    [key]: val || null
                } : l));
    }
    function addLoc() {
        setLocs((prev)=>[
                ...prev,
                emptyLoc()
            ]);
    }
    function removeLoc(i) {
        setLocs((prev)=>prev.filter((_, idx)=>idx !== i));
    }
    async function handleSave() {
        const valid = locs.filter((l)=>l.name?.trim());
        if (valid.length === 0) {
            setStatus('⚠️ Minimal isi nama lokasi!');
            return;
        }
        setSaving(true);
        setStatus('⏳ Menyimpan...');
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_ideas_v2').update({
            locations: valid
        }).eq('id', idea.id);
        if (error) {
            setStatus('❌ Gagal: ' + error.message);
            setSaving(false);
            return;
        }
        setStatus('✅ Tersimpan!');
        setSaving(false);
        setTimeout(()=>{
            onSaved();
            onClose();
        }, 600);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(3,37,76,0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
        },
        onClick: (e)=>{
            if (e.target === e.currentTarget) onClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: 'white',
                borderRadius: '24px 24px 0 0',
                border: '2px solid #c4e8ff',
                borderBottom: 'none',
                width: '100%',
                maxWidth: 600,
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '24px 24px 40px',
                boxShadow: '0 -8px 40px rgba(3,37,76,0.2)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        width: 40,
                        height: 4,
                        borderRadius: 99,
                        background: '#a8d8f0',
                        margin: '0 auto 20px'
                    }
                }, void 0, false, {
                    fileName: "[project]/components/home/EditLocationModal.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        fontWeight: 800,
                                        color: P,
                                        margin: '0 0 2px',
                                        fontSize: '1.05em'
                                    },
                                    children: "📍 Kelola Lokasi"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/EditLocationModal.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        fontSize: '0.78em',
                                        color: MUTED
                                    },
                                    children: idea.idea_name
                                }, void 0, false, {
                                    fileName: "[project]/components/home/EditLocationModal.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/EditLocationModal.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                background: PL,
                                border: '1.5px solid #a8d8f0',
                                borderRadius: 999,
                                padding: '4px 12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: P,
                                fontFamily: 'inherit'
                            },
                            children: "✕ Tutup"
                        }, void 0, false, {
                            fileName: "[project]/components/home/EditLocationModal.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/home/EditLocationModal.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16
                    },
                    children: [
                        locs.map((loc, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderRadius: 16,
                                    border: '1.5px solid #c4e8ff',
                                    overflow: 'hidden'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '10px 14px',
                                            background: PL,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: 700,
                                                    color: P,
                                                    fontSize: '0.88em'
                                                },
                                                children: [
                                                    "Lokasi ",
                                                    i + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 104,
                                                columnNumber: 17
                                            }, this),
                                            locs.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>removeLoc(i),
                                                style: {
                                                    background: '#fff1f2',
                                                    border: '1px solid #fda4af',
                                                    borderRadius: 999,
                                                    padding: '2px 10px',
                                                    color: '#f43f5e',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    fontSize: '0.78em',
                                                    fontFamily: 'inherit'
                                                },
                                                children: "🗑️ Hapus"
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 106,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                        lineNumber: 103,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            padding: '14px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 10
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: '0.72em',
                                                            fontWeight: 700,
                                                            color: MUTED,
                                                            display: 'block',
                                                            marginBottom: 4
                                                        },
                                                        children: "Nama Lokasi *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: loc.name || '',
                                                        onChange: (e)=>updateLoc(i, 'name', e.target.value),
                                                        placeholder: "misal: Outlet Utama",
                                                        style: inp
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 115,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: '0.72em',
                                                            fontWeight: 700,
                                                            color: MUTED,
                                                            display: 'block',
                                                            marginBottom: 4
                                                        },
                                                        children: "Alamat"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 120,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        value: loc.address || '',
                                                        onChange: (e)=>updateLoc(i, 'address', e.target.value),
                                                        placeholder: "Alamat lengkap...",
                                                        rows: 2,
                                                        style: {
                                                            ...inp,
                                                            resize: 'vertical'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 121,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 119,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontSize: '0.72em',
                                                                    fontWeight: 700,
                                                                    color: MUTED,
                                                                    display: 'block',
                                                                    marginBottom: 4
                                                                },
                                                                children: "No. Telepon"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 125,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: loc.phone || '',
                                                                onChange: (e)=>updateLoc(i, 'phone', e.target.value),
                                                                placeholder: "08xx...",
                                                                style: inp
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 126,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 124,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontSize: '0.72em',
                                                                    fontWeight: 700,
                                                                    color: MUTED,
                                                                    display: 'block',
                                                                    marginBottom: 4
                                                                },
                                                                children: "Jam Buka"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 129,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: loc.opening_hours || '',
                                                                onChange: (e)=>updateLoc(i, 'opening_hours', e.target.value),
                                                                placeholder: "10:00 - 22:00",
                                                                style: inp
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 130,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 128,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 123,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 10
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontSize: '0.72em',
                                                                    fontWeight: 700,
                                                                    color: MUTED,
                                                                    display: 'block',
                                                                    marginBottom: 4
                                                                },
                                                                children: "Kisaran Harga"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 135,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: loc.price_range || '',
                                                                onChange: (e)=>updateLoc(i, 'price_range', e.target.value),
                                                                placeholder: "Rp 50.000 - 100.000",
                                                                style: inp
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 136,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 134,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                style: {
                                                                    fontSize: '0.72em',
                                                                    fontWeight: 700,
                                                                    color: MUTED,
                                                                    display: 'block',
                                                                    marginBottom: 4
                                                                },
                                                                children: "Website"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 139,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                value: loc.website || '',
                                                                onChange: (e)=>updateLoc(i, 'website', e.target.value),
                                                                placeholder: "https://...",
                                                                style: inp
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                                lineNumber: 140,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 138,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 133,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: '0.72em',
                                                            fontWeight: 700,
                                                            color: MUTED,
                                                            display: 'block',
                                                            marginBottom: 4
                                                        },
                                                        children: "Link Google Maps"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 144,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        value: loc.maps_url || '',
                                                        onChange: (e)=>updateLoc(i, 'maps_url', e.target.value),
                                                        placeholder: "https://maps.google.com/...",
                                                        style: inp
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 145,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 143,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            fontSize: '0.72em',
                                                            fontWeight: 700,
                                                            color: MUTED,
                                                            display: 'block',
                                                            marginBottom: 4
                                                        },
                                                        children: "Catatan"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 148,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        value: loc.notes || '',
                                                        onChange: (e)=>updateLoc(i, 'notes', e.target.value),
                                                        placeholder: "Tips, info tambahan...",
                                                        rows: 2,
                                                        style: {
                                                            ...inp,
                                                            resize: 'vertical'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                                        lineNumber: 149,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                                lineNumber: 147,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/EditLocationModal.tsx",
                                        lineNumber: 114,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/components/home/EditLocationModal.tsx",
                                lineNumber: 101,
                                columnNumber: 13
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: addLoc,
                            style: {
                                padding: '10px',
                                borderRadius: 12,
                                background: PL,
                                border: '1.5px dashed #a8d8f0',
                                color: P,
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.85em',
                                fontFamily: 'inherit'
                            },
                            children: "➕ Tambah Lokasi Lain"
                        }, void 0, false, {
                            fileName: "[project]/components/home/EditLocationModal.tsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this),
                        status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                margin: 0,
                                fontSize: '0.85em',
                                fontWeight: 600,
                                color: status.startsWith('❌') ? '#f43f5e' : status.startsWith('⚠️') ? '#f59e0b' : P
                            },
                            children: status
                        }, void 0, false, {
                            fileName: "[project]/components/home/EditLocationModal.tsx",
                            lineNumber: 167,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSave,
                            disabled: saving,
                            style: {
                                padding: '13px',
                                borderRadius: 14,
                                background: saving ? '#a8d8f0' : 'linear-gradient(135deg, #03254c, #1a4d7a)',
                                color: 'white',
                                border: 'none',
                                fontWeight: 800,
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.95em',
                                fontFamily: 'inherit',
                                boxShadow: saving ? 'none' : '0 4px 14px rgba(3,37,76,0.3)'
                            },
                            children: saving ? '⏳ Menyimpan...' : '💾 Simpan Semua'
                        }, void 0, false, {
                            fileName: "[project]/components/home/EditLocationModal.tsx",
                            lineNumber: 172,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/home/EditLocationModal.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/home/EditLocationModal.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/home/EditLocationModal.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
_s(EditLocationModal, "3xgdwuRBE35SMMwzvobOpVba3OQ=");
_c = EditLocationModal;
var _c;
__turbopack_context__.k.register(_c, "EditLocationModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/AddIdeaModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AddIdeaModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const T = {
    navy: '#03254c',
    navyMid: '#1a4d7a',
    navyLight: '#2563a8',
    sky: '#c4e8ff',
    skyLight: '#e1f3ff',
    skyMid: '#a8d8f0',
    white: '#ffffff',
    muted: '#6b8cae',
    mutedLight: '#a0bcd4'
};
const inp = {
    width: '100%',
    padding: '9px 12px',
    border: `1.5px solid ${T.sky}`,
    borderRadius: 10,
    fontSize: '0.87em',
    color: T.navy,
    background: T.white,
    outline: 'none',
    boxSizing: 'border-box'
};
const label = {
    fontSize: '0.7em',
    fontWeight: 700,
    color: T.muted,
    display: 'block',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5
};
const emptyLocation = ()=>({
        name: '',
        address: '',
        phone: '',
        opening_hours: '',
        price_range: '',
        website: '',
        maps_url: '',
        notes: ''
    });
function AddIdeaModal({ categories, cities, onClose, onSaved, onToast }) {
    _s();
    const [name, setName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [cat, setCat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [catCustom, setCatCustom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sub, setSub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [subCustom, setSubCustom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [city, setCity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showLoc, setShowLoc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [locations, setLocations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        emptyLocation()
    ]);
    const uniqueCats = [
        ...new Set(categories.map((c)=>c.category))
    ];
    const subtypesForCat = categories.filter((c)=>c.category === cat);
    const updateLoc = (idx, field, val)=>{
        setLocations((prev)=>prev.map((l, i)=>i === idx ? {
                    ...l,
                    [field]: val
                } : l));
    };
    const addLoc = ()=>setLocations((prev)=>[
                ...prev,
                emptyLocation()
            ]);
    const removeLoc = (idx)=>setLocations((prev)=>prev.filter((_, i)=>i !== idx));
    const handleSave = async ()=>{
        const finalName = name.trim();
        const finalCat = cat === '__custom__' ? catCustom.trim() : cat;
        const finalSub = sub === '__custom__' ? subCustom.trim() : sub;
        if (!finalName) return onToast('Nama tidak boleh kosong!', 'warn');
        if (!finalCat) return onToast('Pilih atau isi kategori!', 'warn');
        if (!finalSub) return onToast('Pilih atau isi sub-tipe!', 'warn');
        setSaving(true);
        try {
            let imageUrl = null;
            if (file) imageUrl = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadImage"])(file, 'anon');
            if (cat === '__custom__' || sub === '__custom__') {
                const tk = finalSub.toLowerCase().replace(/\s+/g, '_');
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_categories').upsert([
                    {
                        category: finalCat,
                        subtype: finalSub,
                        type_key: tk,
                        icon: '📍',
                        photo_url: null
                    }
                ], {
                    onConflict: 'type_key'
                });
            }
            const typeKey = sub === '__custom__' ? finalSub.toLowerCase().replace(/\s+/g, '_') : sub;
            // Build locations array — only include if user toggled location section
            const locPayload = showLoc ? locations.filter((l)=>l.name.trim() || l.address.trim()) : null;
            // Use first location's fields as top-level columns too (for backward compat)
            const firstLoc = locPayload?.[0];
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_ideas_v2').insert([
                {
                    idea_name: finalName,
                    type_key: typeKey,
                    day_of_week: '',
                    photo_url: imageUrl,
                    city_id: city || null,
                    locations: locPayload && locPayload.length > 0 ? locPayload : null,
                    // top-level columns from first location
                    address: firstLoc?.address || null,
                    maps_url: firstLoc?.maps_url || null,
                    phone: firstLoc?.phone || null,
                    opening_hours: firstLoc?.opening_hours || null,
                    price_range: firstLoc?.price_range || null,
                    website: firstLoc?.website || null,
                    notes: firstLoc?.notes || null
                }
            ]);
            if (error) throw error;
            onSaved();
            onToast('Ide berhasil ditambahkan! 🎉', 'success');
        } catch  {
            onToast('Gagal menyimpan. Coba lagi.', 'error');
        } finally{
            setSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(3,37,76,0.38)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '24px 16px',
            overflowY: 'auto'
        },
        onClick: (e)=>{
            if (e.target === e.currentTarget) onClose();
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                background: T.white,
                borderRadius: 20,
                border: `1.5px solid ${T.sky}`,
                boxShadow: '0 20px 60px rgba(3,37,76,.2)',
                width: '100%',
                maxWidth: 480,
                margin: 'auto'
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: '20px 22px 24px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 18
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: T.navy,
                                    fontWeight: 800,
                                    margin: 0,
                                    fontSize: '1.02em'
                                },
                                children: "➕ Tambah Ide Baru"
                            }, void 0, false, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onClose,
                                style: {
                                    background: T.skyLight,
                                    border: `1px solid ${T.sky}`,
                                    borderRadius: 999,
                                    width: 28,
                                    height: 28,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: T.navy,
                                    fontWeight: 700,
                                    fontSize: '0.8em'
                                },
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 144,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                        lineNumber: 142,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 11
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: label,
                                        children: "Nama Tempat *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: name,
                                        onChange: (e)=>setName(e.target.value),
                                        placeholder: "misal: Braga Permai",
                                        style: inp
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 152,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 150,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: label,
                                        children: "Kategori *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: cat,
                                        onChange: (e)=>{
                                            setCat(e.target.value);
                                            setSub('');
                                        },
                                        style: inp,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Pilih..."
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this),
                                            uniqueCats.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c,
                                                    children: c
                                                }, c, false, {
                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 38
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "__custom__",
                                                children: "➕ Tambah baru..."
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 158,
                                        columnNumber: 15
                                    }, this),
                                    cat === '__custom__' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: catCustom,
                                        onChange: (e)=>setCatCustom(e.target.value),
                                        placeholder: "Nama kategori baru",
                                        style: {
                                            ...inp,
                                            marginTop: 7
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 164,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: label,
                                        children: "Sub-tipe *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: sub,
                                        onChange: (e)=>setSub(e.target.value),
                                        disabled: !cat,
                                        style: {
                                            ...inp,
                                            opacity: !cat ? 0.5 : 1
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Pilih..."
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 172,
                                                columnNumber: 17
                                            }, this),
                                            cat !== '__custom__' && subtypesForCat.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: s.type_key,
                                                    children: s.subtype
                                                }, s.type_key, false, {
                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 66
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "__custom__",
                                                children: "➕ Tambah baru..."
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 174,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    sub === '__custom__' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: subCustom,
                                        onChange: (e)=>setSubCustom(e.target.value),
                                        placeholder: "Nama sub-tipe baru",
                                        style: {
                                            ...inp,
                                            marginTop: 7
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 177,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: label,
                                        children: "Kota"
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 183,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: city,
                                        onChange: (e)=>setCity(e.target.value),
                                        style: inp,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Tanpa Kota"
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 185,
                                                columnNumber: 17
                                            }, this),
                                            cities.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: c.id,
                                                    children: c.name
                                                }, c.id, false, {
                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                    lineNumber: 186,
                                                    columnNumber: 34
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        style: label,
                                        children: "Foto (Opsional)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: "image/*",
                                        onChange: (e)=>setFile(e.target.files?.[0] || null),
                                        style: {
                                            fontSize: '0.8em',
                                            color: T.navy,
                                            width: '100%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 193,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 191,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: `1.5px dashed ${T.sky}`,
                                    paddingTop: 12,
                                    marginTop: 2
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowLoc((v)=>!v),
                                        style: {
                                            width: '100%',
                                            padding: '9px 14px',
                                            borderRadius: 10,
                                            background: showLoc ? T.skyLight : T.white,
                                            border: `1.5px solid ${T.sky}`,
                                            color: T.navy,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            fontSize: '0.84em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "📍 Detail Lokasi (Opsional)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 208,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '0.75em',
                                                    color: T.muted
                                                },
                                                children: showLoc ? '▲ Sembunyikan' : '▼ Tampilkan'
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 209,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 198,
                                        columnNumber: 15
                                    }, this),
                                    showLoc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 10,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 14
                                        },
                                        children: [
                                            locations.map((loc, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        background: T.skyLight,
                                                        borderRadius: 12,
                                                        border: `1.5px solid ${T.sky}`,
                                                        padding: '14px 14px 10px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: 10
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontWeight: 700,
                                                                        color: T.navy,
                                                                        fontSize: '0.82em'
                                                                    },
                                                                    children: [
                                                                        "Lokasi ",
                                                                        idx + 1
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 219,
                                                                    columnNumber: 25
                                                                }, this),
                                                                locations.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>removeLoc(idx),
                                                                    style: {
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        color: '#ef4444',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.8em',
                                                                        fontWeight: 700
                                                                    },
                                                                    children: "✕ Hapus"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 221,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                            lineNumber: 218,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: 8
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: label,
                                                                            children: "Nama Lokasi *"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 227,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            value: loc.name,
                                                                            onChange: (e)=>updateLoc(idx, 'name', e.target.value),
                                                                            placeholder: "misal: Lokasi Utama",
                                                                            style: inp
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 228,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 226,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: label,
                                                                            children: "Alamat"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 231,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            value: loc.address,
                                                                            onChange: (e)=>updateLoc(idx, 'address', e.target.value),
                                                                            placeholder: "Jl. ...",
                                                                            rows: 2,
                                                                            style: {
                                                                                ...inp,
                                                                                resize: 'vertical',
                                                                                fontFamily: 'inherit'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 232,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 230,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: 'grid',
                                                                        gridTemplateColumns: '1fr 1fr',
                                                                        gap: 8
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    style: label,
                                                                                    children: "No. Telepon"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 237,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    value: loc.phone,
                                                                                    onChange: (e)=>updateLoc(idx, 'phone', e.target.value),
                                                                                    placeholder: "08xx...",
                                                                                    style: inp
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 238,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 236,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    style: label,
                                                                                    children: "Jam Buka"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 241,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    value: loc.opening_hours,
                                                                                    onChange: (e)=>updateLoc(idx, 'opening_hours', e.target.value),
                                                                                    placeholder: "10:00 - 22:00",
                                                                                    style: inp
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 242,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 240,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    style: label,
                                                                                    children: "Kisaran Harga"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 245,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    value: loc.price_range,
                                                                                    onChange: (e)=>updateLoc(idx, 'price_range', e.target.value),
                                                                                    placeholder: "25.000 - 200.000",
                                                                                    style: inp
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 246,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 244,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    style: label,
                                                                                    children: "Website"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 249,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                    value: loc.website,
                                                                                    onChange: (e)=>updateLoc(idx, 'website', e.target.value),
                                                                                    placeholder: "https://...",
                                                                                    style: inp
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                                    lineNumber: 250,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 248,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 235,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: label,
                                                                            children: "Link Google Maps"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 254,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            value: loc.maps_url,
                                                                            onChange: (e)=>updateLoc(idx, 'maps_url', e.target.value),
                                                                            placeholder: "https://maps.app.goo.gl/...",
                                                                            style: inp
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 255,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 253,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            style: label,
                                                                            children: "Catatan"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 258,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                                            value: loc.notes,
                                                                            onChange: (e)=>updateLoc(idx, 'notes', e.target.value),
                                                                            placeholder: "Tips, info tambahan...",
                                                                            rows: 2,
                                                                            style: {
                                                                                ...inp,
                                                                                resize: 'vertical',
                                                                                fontFamily: 'inherit'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                            lineNumber: 259,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                                    lineNumber: 257,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                            lineNumber: 225,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 21
                                                }, this)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: addLoc,
                                                style: {
                                                    padding: '8px 14px',
                                                    borderRadius: 10,
                                                    background: T.white,
                                                    border: `1.5px dashed ${T.skyMid}`,
                                                    color: T.muted,
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontSize: '0.82em',
                                                    width: '100%'
                                                },
                                                children: "➕ Tambah Lokasi Lain"
                                            }, void 0, false, {
                                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                                lineNumber: 267,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                                        lineNumber: 213,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/home/AddIdeaModal.tsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleSave,
                        disabled: saving,
                        style: {
                            width: '100%',
                            marginTop: 16,
                            padding: '12px',
                            borderRadius: 11,
                            background: saving ? T.sky : `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
                            color: saving ? T.muted : T.white,
                            border: 'none',
                            fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: '0.9em',
                            boxShadow: saving ? 'none' : '0 4px 14px rgba(3,37,76,.2)',
                            transition: 'all .15s'
                        },
                        children: saving ? '⏳ Menyimpan...' : '💾 Simpan Ide'
                    }, void 0, false, {
                        fileName: "[project]/components/home/AddIdeaModal.tsx",
                        lineNumber: 282,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/AddIdeaModal.tsx",
                lineNumber: 139,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/home/AddIdeaModal.tsx",
            lineNumber: 138,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/home/AddIdeaModal.tsx",
        lineNumber: 134,
        columnNumber: 5
    }, this);
}
_s(AddIdeaModal, "HY/uhAlymxdl2UOuvrqrqh3jup4=");
_c = AddIdeaModal;
var _c;
__turbopack_context__.k.register(_c, "AddIdeaModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/Countdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Countdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const T = {
    navy: '#03254c',
    navyMid: '#1a4d7a',
    sky: '#c4e8ff',
    skyLight: '#e1f3ff',
    skyMid: '#a8d8f0',
    white: '#ffffff',
    muted: '#6b8cae'
};
function Countdown({ tripDate }) {
    _s();
    const [time, setTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        passed: false
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Countdown.useEffect": ()=>{
            function calc() {
                const diff = new Date(tripDate + 'T00:00:00').getTime() - Date.now();
                if (diff <= 0) {
                    setTime({
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                        passed: true
                    });
                    return;
                }
                setTime({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor(diff % 86400000 / 3600000),
                    minutes: Math.floor(diff % 3600000 / 60000),
                    seconds: Math.floor(diff % 60000 / 1000),
                    passed: false
                });
            }
            calc();
            const t = setInterval(calc, 1000);
            return ({
                "Countdown.useEffect": ()=>clearInterval(t)
            })["Countdown.useEffect"];
        }
    }["Countdown.useEffect"], [
        tripDate
    ]);
    if (time.passed) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '11px 18px',
            borderRadius: 12,
            background: T.white,
            border: `1.5px solid ${T.sky}`,
            fontWeight: 700,
            color: T.navy,
            fontSize: '0.88em',
            textAlign: 'center',
            boxShadow: '0 1px 8px rgba(3,37,76,.07)'
        },
        children: "🎉 Trip sudah dimulai! Selamat bersenang-senang!"
    }, void 0, false, {
        fileName: "[project]/components/home/Countdown.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
    const Num = ({ v, l })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        minWidth: 46,
                        height: 46,
                        borderRadius: 11,
                        background: `linear-gradient(135deg, ${T.navy}, ${T.navyMid})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2em',
                        fontWeight: 800,
                        color: T.white,
                        boxShadow: '0 3px 10px rgba(3,37,76,.22)',
                        letterSpacing: -0.5
                    },
                    children: String(v).padStart(2, '0')
                }, void 0, false, {
                    fileName: "[project]/components/home/Countdown.tsx",
                    lineNumber: 44,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '0.6em',
                        color: T.muted,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8
                    },
                    children: l
                }, void 0, false, {
                    fileName: "[project]/components/home/Countdown.tsx",
                    lineNumber: 52,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/home/Countdown.tsx",
            lineNumber: 43,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '12px 16px',
            borderRadius: 14,
            background: T.white,
            border: `1.5px solid ${T.sky}`,
            boxShadow: '0 1px 10px rgba(3,37,76,.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: '0.8em',
                    fontWeight: 700,
                    color: T.muted,
                    whiteSpace: 'nowrap'
                },
                children: [
                    "✨ Hitung mundur trip",
                    time.days <= 7 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: T.navy,
                            marginLeft: 6
                        },
                        children: [
                            "— ",
                            time.days === 0 ? 'Hari ini!' : `${time.days} hari lagi!`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 67,
                        columnNumber: 28
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/Countdown.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Num, {
                        v: time.days,
                        l: "Hari"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: T.skyMid,
                            fontWeight: 800,
                            fontSize: '1.1em',
                            marginBottom: 16
                        },
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 72,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Num, {
                        v: time.hours,
                        l: "Jam"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: T.skyMid,
                            fontWeight: 800,
                            fontSize: '1.1em',
                            marginBottom: 16
                        },
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 74,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Num, {
                        v: time.minutes,
                        l: "Menit"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: T.skyMid,
                            fontWeight: 800,
                            fontSize: '1.1em',
                            marginBottom: 16
                        },
                        children: ":"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Num, {
                        v: time.seconds,
                        l: "Detik"
                    }, void 0, false, {
                        fileName: "[project]/components/home/Countdown.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/Countdown.tsx",
                lineNumber: 70,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/Countdown.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_s(Countdown, "zSkw4gb7B8oyWqDbk9mNiTkX0Tk=");
_c = Countdown;
var _c;
__turbopack_context__.k.register(_c, "Countdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/Toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Toast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const cfg = {
    success: {
        bg: '#ecfdf5',
        border: '#6ee7b7',
        color: '#065f46',
        icon: '✅'
    },
    error: {
        bg: '#fff1f2',
        border: '#fda4af',
        color: '#9f1239',
        icon: '❌'
    },
    warn: {
        bg: '#fffbeb',
        border: '#fcd34d',
        color: '#92400e',
        icon: '⚠️'
    },
    info: {
        bg: '#f0f9ff',
        border: '#7dd3fc',
        color: '#0c4a6e',
        icon: '💬'
    }
};
function Toast({ message, type = 'info', onClose, duration = 3500 }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Toast.useEffect": ()=>{
            const t = setTimeout(onClose, duration);
            return ({
                "Toast.useEffect": ()=>clearTimeout(t)
            })["Toast.useEffect"];
        }
    }["Toast.useEffect"], []);
    const s = cfg[type];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: onClose,
        style: {
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            cursor: 'pointer',
            background: s.bg,
            border: `2px solid ${s.border}`,
            color: s.color,
            borderRadius: 999,
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '0.88em',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            maxWidth: '90vw',
            whiteSpace: 'nowrap'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: s.icon
            }, void 0, false, {
                fileName: "[project]/components/ui/Toast.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: message
            }, void 0, false, {
                fileName: "[project]/components/ui/Toast.tsx",
                lineNumber: 27,
                columnNumber: 28
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/Toast.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_s(Toast, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = Toast;
var _c;
__turbopack_context__.k.register(_c, "Toast");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/HomePage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Navbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/DataContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$ActivityArea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/ActivityArea.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$SelectedPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/SelectedPanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$IdeaDetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/IdeaDetailModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$EditLocationModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/EditLocationModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$AddIdeaModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/AddIdeaModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$Countdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/Countdown.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/Toast.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
const T = {
    navy: '#03254c',
    navyMid: '#1a4d7a',
    navyLight: '#2563a8',
    sky: '#c4e8ff',
    skyLight: '#e1f3ff',
    skyMid: '#a8d8f0',
    bg: '#d0efff',
    white: '#ffffff',
    muted: '#6b8cae',
    mutedLight: '#a0bcd4'
};
const inp = {
    width: '100%',
    padding: '9px 12px',
    border: `1.5px solid ${T.sky}`,
    borderRadius: 10,
    fontSize: '0.87em',
    color: T.navy,
    background: T.white,
    outline: 'none',
    boxSizing: 'border-box'
};
function HomePage() {
    _s();
    const { ideas, categories, cities, reviews, ideaRatings, loading, loadAllData, loadReviews } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useData"])();
    const [tripDate, setTripDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [secretMsg, setSecretMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [selections, setSelections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [detailIdeaId, setDetailIdeaId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [detailReviews, setDetailReviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tripDates, setTripDates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [editLocIdeaId, setEditLocIdeaId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showAdd, setShowAdd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isEditMode, setIsEditMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const ideasLoaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            loadAllData();
            setTripDate(localStorage.getItem('tripDate') || '');
            setSecretMsg(localStorage.getItem('secretMessage') || '');
            setIsEditMode(localStorage.getItem('editMode') === 'true');
            const raw = localStorage.getItem('tripSelections');
            if (!raw) return;
            try {
                const parsed = JSON.parse(raw);
                const deduped = parsed.filter({
                    "HomePage.useEffect.deduped": (s, i, a)=>a.findIndex({
                            "HomePage.useEffect.deduped": (x)=>x.ideaId === s.ideaId
                        }["HomePage.useEffect.deduped"]) === i
                }["HomePage.useEffect.deduped"]);
                setSelections(deduped);
                setSelectedIds(new Set(deduped.map({
                    "HomePage.useEffect": (s)=>s.ideaId
                }["HomePage.useEffect"])));
            } catch  {
                localStorage.removeItem('tripSelections');
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["HomePage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            if (ideas.length > 0) ideasLoaded.current = true;
        }
    }["HomePage.useEffect"], [
        ideas
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            localStorage.setItem('tripSelections', JSON.stringify(selections));
            localStorage.setItem('tripDate', tripDate);
            localStorage.setItem('secretMessage', secretMsg);
        }
    }["HomePage.useEffect"], [
        selections,
        tripDate,
        secretMsg
    ]);
    const handleToggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleToggle]": (ideaId)=>{
            if (!ideasLoaded.current) return;
            const isCurrentlySelected = selectedIds.has(ideaId);
            if (isCurrentlySelected) {
                setSelectedIds({
                    "HomePage.useCallback[handleToggle]": (prev)=>{
                        const n = new Set(prev);
                        n.delete(ideaId);
                        return n;
                    }
                }["HomePage.useCallback[handleToggle]"]);
                setSelections({
                    "HomePage.useCallback[handleToggle]": (prev)=>prev.filter({
                            "HomePage.useCallback[handleToggle]": (s)=>s.ideaId !== ideaId
                        }["HomePage.useCallback[handleToggle]"])
                }["HomePage.useCallback[handleToggle]"]);
            } else {
                const idea = ideas.find({
                    "HomePage.useCallback[handleToggle].idea": (i)=>i.id === ideaId
                }["HomePage.useCallback[handleToggle].idea"]);
                if (!idea) return;
                setSelectedIds({
                    "HomePage.useCallback[handleToggle]": (prev)=>{
                        const n = new Set(prev);
                        n.add(ideaId);
                        return n;
                    }
                }["HomePage.useCallback[handleToggle]"]);
                setSelections({
                    "HomePage.useCallback[handleToggle]": (prev)=>{
                        if (prev.some({
                            "HomePage.useCallback[handleToggle]": (s)=>s.ideaId === ideaId
                        }["HomePage.useCallback[handleToggle]"])) return prev;
                        return [
                            ...prev,
                            {
                                ideaId: idea.id,
                                name: idea.idea_name,
                                cat: idea.category_name || '',
                                subtype: idea.subtype_name || ''
                            }
                        ];
                    }
                }["HomePage.useCallback[handleToggle]"]);
            }
        }
    }["HomePage.useCallback[handleToggle]"], [
        ideas,
        selectedIds
    ]);
    const handleRemove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HomePage.useCallback[handleRemove]": (ideaId)=>{
            setSelectedIds({
                "HomePage.useCallback[handleRemove]": (prev)=>{
                    const n = new Set(prev);
                    n.delete(ideaId);
                    return n;
                }
            }["HomePage.useCallback[handleRemove]"]);
            setSelections({
                "HomePage.useCallback[handleRemove]": (prev)=>prev.filter({
                        "HomePage.useCallback[handleRemove]": (s)=>s.ideaId !== ideaId
                    }["HomePage.useCallback[handleRemove]"])
            }["HomePage.useCallback[handleRemove]"]);
        }
    }["HomePage.useCallback[handleRemove]"], []);
    const handleViewDetail = async (ideaId)=>{
        const ideaReviews = reviews.filter((r)=>r.idea_id === ideaId);
        const tripIds = [
            ...new Set(ideaReviews.map((r)=>r.trip_id).filter(Boolean))
        ];
        if (tripIds.length > 0) {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_history').select('id,trip_date,trip_day').in('id', tripIds);
            const map = {};
            (data || []).forEach((t)=>{
                map[t.id] = t;
            });
            setTripDates(map);
        }
        setDetailReviews(ideaReviews);
        setDetailIdeaId(ideaId);
    };
    const handleGenerate = ()=>{
        if (!tripDate) return setToast({
            msg: 'Pilih tanggal trip dulu!',
            type: 'warn'
        });
        if (selections.length === 0) return setToast({
            msg: 'Pilih minimal 1 aktivitas!',
            type: 'warn'
        });
        window.location.href = '/summary';
    };
    const detailIdea = detailIdeaId ? ideas.find((i)=>i.id === detailIdeaId) : null;
    const editLocIdea = editLocIdeaId ? ideas.find((i)=>i.id === editLocIdeaId) : null;
    const canGenerate = tripDate && selections.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            minHeight: '100vh',
            background: T.bg,
            fontFamily: "'DM Sans', sans-serif"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: ${T.navyLight} !important; outline: none; box-shadow: 0 0 0 3px ${T.skyMid}66; }
        input[type='date']::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
        .sticky-bar { transition: box-shadow .2s; }
      `
            }, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            toast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Toast$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                message: toast.msg,
                type: toast.type,
                onClose: ()=>setToast(null)
            }, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 125,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$Navbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky-bar",
                style: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    background: 'rgba(208,239,255,0.95)',
                    backdropFilter: 'blur(14px)',
                    borderBottom: `1.5px solid ${T.skyMid}`,
                    padding: '10px 16px 10px',
                    boxShadow: '0 2px 16px rgba(3,37,76,.08)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        maxWidth: 960,
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                    },
                    children: [
                        isEditMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: '#fffbeb',
                                border: '1.5px solid #fcd34d',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: 600,
                                        color: '#92400e',
                                        fontSize: '0.8em'
                                    },
                                    children: "✏️ Mode edit trip aktif"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 141,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>{
                                        localStorage.removeItem('editMode');
                                        localStorage.removeItem('editTripId');
                                        localStorage.removeItem('tripSelections');
                                        localStorage.removeItem('tripDate');
                                        setIsEditMode(false);
                                        setSelections([]);
                                        setSelectedIds(new Set());
                                    },
                                    style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#f59e0b',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: '0.78em'
                                    },
                                    children: "✕ Batal"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 142,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/HomePage.tsx",
                            lineNumber: 140,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center',
                                flexWrap: 'wrap'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    value: tripDate,
                                    onChange: (e)=>setTripDate(e.target.value),
                                    style: {
                                        ...inp,
                                        width: 158,
                                        flexShrink: 0
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 158,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        minWidth: 160,
                                        position: 'relative'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: secretMsg,
                                            onChange: (e)=>setSecretMsg(e.target.value),
                                            placeholder: "💌 Pesan rahasia...",
                                            style: {
                                                ...inp,
                                                width: '100%',
                                                paddingRight: secretMsg ? 30 : 12
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/HomePage.tsx",
                                            lineNumber: 162,
                                            columnNumber: 15
                                        }, this),
                                        secretMsg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                position: 'absolute',
                                                right: 9,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '0.8em',
                                                pointerEvents: 'none'
                                            },
                                            children: "✨"
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/HomePage.tsx",
                                            lineNumber: 165,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 161,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowAdd(true),
                                    style: {
                                        padding: '9px 14px',
                                        borderRadius: 10,
                                        background: T.white,
                                        color: T.navy,
                                        border: `1.5px solid ${T.sky}`,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.82em',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 1px 4px rgba(3,37,76,.07)'
                                    },
                                    children: "➕ Tambah Ide"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 168,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleGenerate,
                                    disabled: !canGenerate,
                                    style: {
                                        padding: '9px 18px',
                                        borderRadius: 10,
                                        background: canGenerate ? `linear-gradient(135deg, ${T.navy}, ${T.navyMid})` : T.skyMid,
                                        color: canGenerate ? T.white : T.mutedLight,
                                        border: 'none',
                                        fontWeight: 700,
                                        cursor: canGenerate ? 'pointer' : 'not-allowed',
                                        fontSize: '0.84em',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        boxShadow: canGenerate ? '0 2px 12px rgba(3,37,76,.28)' : 'none',
                                        transition: 'all .15s'
                                    },
                                    children: [
                                        isEditMode ? '🔄 Update' : '🎫 Generate',
                                        selections.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                background: 'rgba(255,255,255,0.22)',
                                                borderRadius: 999,
                                                padding: '1px 7px',
                                                fontSize: '0.78em'
                                            },
                                            children: selections.length
                                        }, void 0, false, {
                                            fileName: "[project]/components/home/HomePage.tsx",
                                            lineNumber: 188,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 176,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/HomePage.tsx",
                            lineNumber: 157,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        position: 'absolute',
                                        left: 11,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: T.mutedLight,
                                        fontSize: '0.82em',
                                        pointerEvents: 'none'
                                    },
                                    children: "🔍"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 196,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: search,
                                    onChange: (e)=>setSearch(e.target.value),
                                    placeholder: "Cari tempat atau kategori...",
                                    style: {
                                        ...inp,
                                        width: '100%',
                                        paddingLeft: 32,
                                        paddingRight: search ? 32 : 12
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 197,
                                    columnNumber: 13
                                }, this),
                                search && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSearch(''),
                                    style: {
                                        position: 'absolute',
                                        right: 9,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: T.mutedLight,
                                        fontSize: '0.85em'
                                    },
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/HomePage.tsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/HomePage.tsx",
                            lineNumber: 195,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/home/HomePage.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                style: {
                    maxWidth: 960,
                    margin: '0 auto',
                    padding: '14px 16px 80px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                },
                children: [
                    tripDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$Countdown$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        tripDate: tripDate
                    }, void 0, false, {
                        fileName: "[project]/components/home/HomePage.tsx",
                        lineNumber: 209,
                        columnNumber: 22
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$SelectedPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        selections: selections,
                        onRemove: handleRemove,
                        onClearAll: ()=>{
                            setSelectedIds(new Set());
                            setSelections([]);
                            setToast({
                                msg: 'Semua dihapus',
                                type: 'info'
                            });
                        },
                        onLocate: (id)=>document.querySelector('[data-ideaid="' + id + '"]')?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            })
                    }, void 0, false, {
                        fileName: "[project]/components/home/HomePage.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '60px 0'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: 34,
                                height: 34,
                                border: `3px solid ${T.sky}`,
                                borderTopColor: T.navy,
                                borderRadius: '50%',
                                animation: 'spin 0.85s linear infinite'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/home/HomePage.tsx",
                            lineNumber: 220,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/home/HomePage.tsx",
                        lineNumber: 219,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$ActivityArea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        ideas: ideas,
                        categories: categories,
                        cities: cities,
                        ideaRatings: ideaRatings,
                        selectedIds: selectedIds,
                        searchQuery: search,
                        tripDate: tripDate,
                        onToggle: handleToggle,
                        onViewDetail: handleViewDetail
                    }, void 0, false, {
                        fileName: "[project]/components/home/HomePage.tsx",
                        lineNumber: 223,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            detailIdea && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$IdeaDetailModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                idea: detailIdea,
                reviews: detailReviews,
                rating: ideaRatings[detailIdea.id],
                tripDates: tripDates,
                onClose: ()=>setDetailIdeaId(null),
                onEditInfo: (id)=>{
                    setDetailIdeaId(null);
                    setEditLocIdeaId(id);
                },
                onReviewSaved: ()=>{
                    loadReviews();
                    handleViewDetail(detailIdea.id);
                }
            }, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 234,
                columnNumber: 9
            }, this),
            editLocIdea && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$EditLocationModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                idea: editLocIdea,
                onClose: ()=>setEditLocIdeaId(null),
                onSaved: ()=>{
                    loadAllData();
                    setEditLocIdeaId(null);
                }
            }, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 244,
                columnNumber: 9
            }, this),
            showAdd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$AddIdeaModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                categories: categories,
                cities: cities,
                onClose: ()=>setShowAdd(false),
                onSaved: ()=>{
                    loadAllData();
                    setShowAdd(false);
                },
                onToast: (msg, type)=>setToast({
                        msg,
                        type
                    })
            }, void 0, false, {
                fileName: "[project]/components/home/HomePage.tsx",
                lineNumber: 252,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/HomePage.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
_s(HomePage, "4TsNyWeWve9OavbFzG59jDZKDc0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$DataContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useData"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_8347cf05._.js.map