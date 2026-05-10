(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://rdoywpzkfddvrxrwmvsc.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb3l3cHprZmRkdnJ4cndtdnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDIyNzUsImV4cCI6MjA3NTY3ODI3NX0.CxlF8rihbLEOSef4ItWelqoCVIgr7JL03uGdpWNKGIU");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/context/DataContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DataProvider",
    ()=>DataProvider,
    "useData",
    ()=>useData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const DataContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    ideas: [],
    categories: [],
    cities: [],
    reviews: [],
    ideaRatings: {},
    tripHistories: [],
    loading: false,
    loadAllData: async ()=>{},
    loadReviews: async ()=>{}
});
function computeRatings(list) {
    const map = {};
    list.forEach((r)=>{
        if (!r.idea_id) return;
        if (!map[r.idea_id]) map[r.idea_id] = {
            total: 0,
            count: 0
        };
        map[r.idea_id].total += r.rating || 0;
        map[r.idea_id].count += 1;
    });
    const out = {};
    for(const id in map){
        out[id] = {
            average: (map[id].total / map[id].count).toFixed(1),
            count: map[id].count
        };
    }
    return out;
}
function DataProvider({ children }) {
    _s();
    const [ideas, setIdeas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [categories, setCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [cities, setCities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [reviews, setReviews] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [ideaRatings, setIdeaRatings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [tripHistories, setTripHistories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const loadingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const loadAllData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[loadAllData]": async ()=>{
            if (loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            try {
                const [citiesRes, catsRes, ideasRes, reviewsRes, tripHistRes] = await Promise.all([
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('cities').select('*').order('display_order', {
                        ascending: true
                    }),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_categories').select('*'),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_ideas_v2').select('*, idea_categories(category, subtype, icon, photo_url)').order('created_at', {
                        ascending: false
                    }),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_reviews').select('*'),
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('trip_history').select('id, trip_date, trip_day')
                ]);
                setCities(citiesRes.data || []);
                setCategories(catsRes.data || []);
                setTripHistories(tripHistRes.data || []);
                const mapped = (ideasRes.data || []).map({
                    "DataProvider.useCallback[loadAllData].mapped": (i)=>({
                            ...i,
                            category_name: i.idea_categories?.category,
                            subtype_name: i.idea_categories?.subtype,
                            icon: i.idea_categories?.icon,
                            photo_url_category: i.idea_categories?.photo_url
                        })
                }["DataProvider.useCallback[loadAllData].mapped"]);
                const unique = new Map();
                mapped.forEach({
                    "DataProvider.useCallback[loadAllData]": (i)=>{
                        const key = i.idea_name ? `${i.type_key}_${i.idea_name.toLowerCase().trim()}` : i.id;
                        if (!unique.has(key)) unique.set(key, i);
                    }
                }["DataProvider.useCallback[loadAllData]"]);
                setIdeas(Array.from(unique.values()));
                const r = reviewsRes.data || [];
                setReviews(r);
                setIdeaRatings(computeRatings(r));
            } finally{
                setLoading(false);
                loadingRef.current = false;
            }
        }
    }["DataProvider.useCallback[loadAllData]"], []);
    const loadReviews = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DataProvider.useCallback[loadReviews]": async ()=>{
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('idea_reviews').select('*');
            const r = data || [];
            setReviews(r);
            setIdeaRatings(computeRatings(r));
        }
    }["DataProvider.useCallback[loadReviews]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DataContext.Provider, {
        value: {
            ideas,
            categories,
            cities,
            reviews,
            ideaRatings,
            tripHistories,
            loading,
            loadAllData,
            loadReviews
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/context/DataContext.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
}
_s(DataProvider, "bSX3bwUkDXNpwTl1zT2clRgLax4=");
_c = DataProvider;
const useData = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DataContext);
};
_s1(useData, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "DataProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_734cd088._.js.map