import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  HttpMethod,
  KeyValuePair,
  RequestConfig,
  ResponseData,
  HistoryItem,
  SavedCollection,
  ApiPreset,
  AuthConfig,
} from "@/types";
import { executeRequest } from "@/lib/sendRequest";

export const API_PRESETS: ApiPreset[] = [
  {
    id: "jp-posts",
    name: "JSONPlaceholder Posts",
    description: "Classic REST API returning a list of blog posts",
    category: "REST API",
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts",
  },
  {
    id: "dummy-products",
    name: "DummyJSON Products",
    description: "E-commerce product catalog with categories and ratings",
    category: "E-Commerce",
    method: "GET",
    url: "https://dummyjson.com/products?limit=8",
  },
  {
    id: "github-octocat",
    name: "GitHub Octocat Profile",
    description: "GitHub user endpoint with rich nested profile info",
    category: "Developer",
    method: "GET",
    url: "https://api.github.com/users/octocat",
  },
  {
    id: "poke-ditto",
    name: "PokéAPI Ditto",
    description: "Deeply nested abilities, stats, and sprites tree",
    category: "Gaming",
    method: "GET",
    url: "https://pokeapi.co/api/v2/pokemon/ditto",
  },
  {
    id: "jp-create-post",
    name: "Create Post (POST)",
    description: "Simulate creating a new resource with a JSON body",
    category: "Mutation",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: [{ id: "h1", key: "Content-Type", value: "application/json", enabled: true }],
    bodyContent: JSON.stringify(
      {
        title: "Building modern DevTools in Next.js",
        body: "A lightning-fast, zero-install in-browser API & JSON playground.",
        userId: 1,
      },
      null,
      2
    ),
  },
  {
    id: "httpbin-headers",
    name: "HTTPBin Headers Inspector",
    description: "Reflects incoming request headers and IP",
    category: "Debugging",
    method: "GET",
    url: "https://httpbin.org/headers",
  },
];

interface PlaygroundState {
  // Active Request
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: "json" | "none" | "raw";
  bodyContent: string;
  auth: AuthConfig;
  useProxy: boolean;
  requestTab: "params" | "headers" | "body" | "auth" | "settings";

  // Active Response
  response: ResponseData | null;
  isLoading: boolean;
  responseTab: "tree" | "raw" | "headers" | "preview";
  queryFilter: string;
  treeExpandAll: boolean;

  // History & Collections
  history: HistoryItem[];
  collections: SavedCollection[];
  isHistoryOpen: boolean;
  isSaveModalOpen: boolean;

  // Settings
  theme: "dark" | "light";
  isHydrated: boolean;

  // Actions
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setRequestTab: (tab: "params" | "headers" | "body" | "auth" | "settings") => void;
  setResponseTab: (tab: "tree" | "raw" | "headers" | "preview") => void;
  setQueryFilter: (query: string) => void;
  setTreeExpandAll: (expand: boolean) => void;
  setUseProxy: (useProxy: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
  setHistoryOpen: (open: boolean) => void;
  setSaveModalOpen: (open: boolean) => void;

  // Query Params Actions
  addQueryParam: () => void;
  updateQueryParam: (id: string, field: "key" | "value" | "enabled", val: any) => void;
  removeQueryParam: (id: string) => void;
  syncUrlWithParams: (newUrl: string) => void;

  // Headers Actions
  addHeader: () => void;
  updateHeader: (id: string, field: "key" | "value" | "enabled", val: any) => void;
  removeHeader: (id: string) => void;

  // Body & Auth
  setBodyContent: (content: string) => void;
  setBodyType: (type: "json" | "none" | "raw") => void;
  setAuth: (auth: Partial<AuthConfig>) => void;

  // Presets & Execution
  loadPreset: (preset: ApiPreset) => void;
  sendRequest: () => Promise<void>;
  retryWithProxy: () => Promise<void>;

  // History Actions
  loadHistoryItem: (item: HistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  toggleStarHistory: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => string;
  importHistory: (jsonString: string) => boolean;

  // Collections Actions
  saveToCollection: (collectionName: string, requestName: string) => void;
  deleteCollection: (id: string) => void;
  loadCollectionRequest: (req: RequestConfig) => void;

  setHydrated: (val: boolean) => void;
}

const DEFAULT_QUERY_PARAMS: KeyValuePair[] = [
  { id: "qp-1", key: "", value: "", enabled: true },
];

const DEFAULT_HEADERS: KeyValuePair[] = [
  { id: "hd-1", key: "Accept", value: "application/json", enabled: true },
];

export const useStore = create<PlaygroundState>()(
  persist(
    (set, get) => ({
      // Active Request Defaults
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/posts/1",
      queryParams: DEFAULT_QUERY_PARAMS,
      headers: DEFAULT_HEADERS,
      bodyType: "json",
      bodyContent: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}',
      auth: { type: "none" },
      useProxy: false,
      requestTab: "params",

      // Active Response Defaults
      response: null,
      isLoading: false,
      responseTab: "tree",
      queryFilter: "",
      treeExpandAll: true,

      // History & Collections
      history: [],
      collections: [
        {
          id: "col-starter",
          name: "Sample APIs",
          createdAt: Date.now(),
          requests: [
            {
              id: "req-col-1",
              name: "Get Single Post",
              method: "GET",
              url: "https://jsonplaceholder.typicode.com/posts/1",
              queryParams: [],
              headers: [{ id: "h1", key: "Accept", value: "application/json", enabled: true }],
              bodyType: "none",
              bodyContent: "",
              auth: { type: "none" },
              useProxy: false,
            },
          ],
        },
      ],
      isHistoryOpen: false,
      isSaveModalOpen: false,

      // Settings
      theme: "dark",
      isHydrated: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),
      setMethod: (method: HttpMethod) => set({ method }),
      setUrl: (url: string) => {
        set({ url });
        get().syncUrlWithParams(url);
      },
      setRequestTab: (requestTab) => set({ requestTab }),
      setResponseTab: (responseTab) => set({ responseTab }),
      setQueryFilter: (queryFilter) => set({ queryFilter }),
      setTreeExpandAll: (treeExpandAll) => set({ treeExpandAll }),
      setUseProxy: (useProxy) => set({ useProxy }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
      setHistoryOpen: (isHistoryOpen) => set({ isHistoryOpen }),
      setSaveModalOpen: (isSaveModalOpen) => set({ isSaveModalOpen }),

      // Sync URL query params with the key-value table
      syncUrlWithParams: (newUrl: string) => {
        try {
          if (!newUrl.includes("?")) return;
          const parsed = new URL(newUrl);
          const pairs: KeyValuePair[] = [];
          parsed.searchParams.forEach((value, key) => {
            pairs.push({
              id: "param-" + Math.random().toString(36).substring(2, 9),
              key,
              value,
              enabled: true,
            });
          });
          if (pairs.length > 0) {
            set({ queryParams: [...pairs, { id: "qp-new", key: "", value: "", enabled: true }] });
          }
        } catch {
          // invalid url ignored
        }
      },

      addQueryParam: () => {
        set((state) => ({
          queryParams: [
            ...state.queryParams,
            { id: "qp-" + Date.now(), key: "", value: "", enabled: true },
          ],
        }));
      },

      updateQueryParam: (id, field, val) => {
        set((state) => {
          const updated = state.queryParams.map((p) =>
            p.id === id ? { ...p, [field]: val } : p
          );
          // If editing the last empty row, auto append new row
          const last = updated[updated.length - 1];
          if (last && (last.key.trim() || last.value.trim())) {
            updated.push({ id: "qp-" + Date.now(), key: "", value: "", enabled: true });
          }
          return { queryParams: updated };
        });
      },

      removeQueryParam: (id) => {
        set((state) => {
          const filtered = state.queryParams.filter((p) => p.id !== id);
          return {
            queryParams:
              filtered.length === 0
                ? [{ id: "qp-1", key: "", value: "", enabled: true }]
                : filtered,
          };
        });
      },

      addHeader: () => {
        set((state) => ({
          headers: [
            ...state.headers,
            { id: "hd-" + Date.now(), key: "", value: "", enabled: true },
          ],
        }));
      },

      updateHeader: (id, field, val) => {
        set((state) => {
          const updated = state.headers.map((h) =>
            h.id === id ? { ...h, [field]: val } : h
          );
          const last = updated[updated.length - 1];
          if (last && (last.key.trim() || last.value.trim())) {
            updated.push({ id: "hd-" + Date.now(), key: "", value: "", enabled: true });
          }
          return { headers: updated };
        });
      },

      removeHeader: (id) => {
        set((state) => {
          const filtered = state.headers.filter((h) => h.id !== id);
          return {
            headers:
              filtered.length === 0
                ? [{ id: "hd-1", key: "", value: "", enabled: true }]
                : filtered,
          };
        });
      },

      setBodyContent: (bodyContent) => set({ bodyContent }),
      setBodyType: (bodyType) => set({ bodyType }),
      setAuth: (authUpdate) =>
        set((state) => ({ auth: { ...state.auth, ...authUpdate } })),

      loadPreset: (preset: ApiPreset) => {
        set({
          method: preset.method,
          url: preset.url,
          queryParams: [{ id: "qp-1", key: "", value: "", enabled: true }],
          headers: preset.headers || [
            { id: "hd-1", key: "Accept", value: "application/json", enabled: true },
          ],
          bodyContent: preset.bodyContent || "",
          bodyType: preset.bodyContent ? "json" : "none",
          requestTab: preset.bodyContent ? "body" : "params",
          queryFilter: "",
        });
      },

      sendRequest: async () => {
        const state = get();
        set({ isLoading: true, queryFilter: "" });

        const requestConfig: RequestConfig = {
          id: "req-" + Date.now(),
          name: state.url,
          method: state.method,
          url: state.url,
          queryParams: state.queryParams,
          headers: state.headers,
          bodyType: state.bodyType,
          bodyContent: state.bodyContent,
          auth: state.auth,
          useProxy: state.useProxy,
        };

        try {
          const res = await executeRequest(requestConfig);
          set({ response: res, isLoading: false });

          // Add to history
          const historyItem: HistoryItem = {
            id: "hist-" + Date.now(),
            timestamp: Date.now(),
            request: requestConfig,
            responseSummary: {
              status: res.status,
              statusText: res.statusText,
              timeMs: res.timeMs,
              sizeBytes: res.sizeBytes,
              isError: res.status === 0 || res.status >= 400,
            },
          };

          set((s) => ({
            history: [historyItem, ...s.history.slice(0, 49)], // keep last 50
          }));
        } catch (err: any) {
          const errorRes: ResponseData = {
            status: 0,
            statusText: "Execution Error",
            timeMs: 0,
            sizeBytes: 0,
            headers: {},
            data: null,
            rawBody: "",
            isJson: false,
            error: err.message || "Failed to dispatch request",
            timestamp: Date.now(),
          };
          set({ response: errorRes, isLoading: false });
        }
      },

      retryWithProxy: async () => {
        set({ useProxy: true });
        await get().sendRequest();
      },

      loadHistoryItem: (item: HistoryItem) => {
        const req = item.request;
        set({
          method: req.method,
          url: req.url,
          queryParams: req.queryParams.length ? req.queryParams : DEFAULT_QUERY_PARAMS,
          headers: req.headers.length ? req.headers : DEFAULT_HEADERS,
          bodyType: req.bodyType,
          bodyContent: req.bodyContent,
          auth: req.auth || { type: "none" },
          useProxy: req.useProxy ?? false,
          isHistoryOpen: false,
        });
      },

      deleteHistoryItem: (id: string) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      toggleStarHistory: (id: string) => {
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, isStarred: !h.isStarred } : h
          ),
        }));
      },

      clearHistory: () => set({ history: [] }),

      exportHistory: () => {
        const state = get();
        return JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            history: state.history,
            collections: state.collections,
          },
          null,
          2
        );
      },

      importHistory: (jsonString: string) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed.history)) {
            set((state) => ({
              history: [...parsed.history, ...state.history].slice(0, 50),
              collections: Array.isArray(parsed.collections)
                ? [...state.collections, ...parsed.collections]
                : state.collections,
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      saveToCollection: (collectionName: string, requestName: string) => {
        const state = get();
        const requestConfig: RequestConfig = {
          id: "req-" + Date.now(),
          name: requestName || state.url,
          method: state.method,
          url: state.url,
          queryParams: state.queryParams,
          headers: state.headers,
          bodyType: state.bodyType,
          bodyContent: state.bodyContent,
          auth: state.auth,
          useProxy: state.useProxy,
        };

        const existingIndex = state.collections.findIndex(
          (c) => c.name.toLowerCase() === collectionName.toLowerCase()
        );

        if (existingIndex >= 0) {
          const updated = [...state.collections];
          updated[existingIndex].requests.push(requestConfig);
          set({ collections: updated, isSaveModalOpen: false });
        } else {
          const newCollection: SavedCollection = {
            id: "col-" + Date.now(),
            name: collectionName,
            createdAt: Date.now(),
            requests: [requestConfig],
          };
          set((s) => ({
            collections: [...s.collections, newCollection],
            isSaveModalOpen: false,
          }));
        }
      },

      deleteCollection: (id: string) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));
      },

      loadCollectionRequest: (req: RequestConfig) => {
        set({
          method: req.method,
          url: req.url,
          queryParams: req.queryParams.length ? req.queryParams : DEFAULT_QUERY_PARAMS,
          headers: req.headers.length ? req.headers : DEFAULT_HEADERS,
          bodyType: req.bodyType,
          bodyContent: req.bodyContent,
          auth: req.auth || { type: "none" },
          useProxy: req.useProxy ?? false,
          isSaveModalOpen: false,
        });
      },
    }),
    {
      name: "json-playground-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        collections: state.collections,
        theme: state.theme,
        useProxy: state.useProxy,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
