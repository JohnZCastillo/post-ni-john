import { useDispatch } from "react-redux"
import { updateFileDetails } from "../redux-slice/slice";
import useFilename from "../hooks/useFilename";
import { v4 } from 'uuid';
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Editor, { useMonaco } from '@monaco-editor/react';
import useKeyValue from "../hooks/useKeyValue";
import { Allotment } from "allotment";
import { useDebouncedCallback } from "use-debounce";

const METHOD_COLORS = {
    get: '#49cc90', post: '#fca130', put: '#61affe', patch: '#50e3c2', delete: '#f93e3e'
};

const EDITOR_THEME = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'string.key.json', foreground: '61affe' },
        { token: 'string.value.json', foreground: '49cc90' },
        { token: 'number', foreground: 'fca130' },
        { token: 'keyword', foreground: 'ff6c37' },
    ],
    colors: {
        'editor.background': '#1a1a2a',
        'editor.foreground': '#e0e0e0',
        'editorLineNumber.foreground': '#4a4a6a',
        'editorLineNumber.activeForeground': '#8888aa',
        'editor.lineHighlightBackground': '#252535',
        'editor.selectionBackground': '#ff6c3733',
        'editor.inactiveSelectionBackground': '#ff6c3722',
        'editorCursor.foreground': '#ff6c37',
        'editorWidget.background': '#1e1e2e',
        'editorWidget.border': '#3a3a4e',
        'scrollbarSlider.background': '#3a3a4e88',
        'scrollbarSlider.hoverBackground': '#3a3a4ecc',
        'scrollbarSlider.activeBackground': '#ff6c3766',
        'editorGutter.background': '#1a1a2a',
    }
};

const EDITOR_OPTIONS = {
    minimap: { enabled: false },
    fontSize: 12,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    renderLineHighlight: 'line',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontLigatures: true,
    padding: { top: 8, bottom: 8 },
    scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
};

const kvInputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'var(--pm-text)',
    padding: '7px 12px',
    fontSize: '12px',
    outline: 'none',
};

function DeleteBtn({ onClick }) {
    return (
        <button type="button" onClick={onClick}
            style={{ background: 'transparent', border: 'none', color: 'var(--pm-text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '3px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f93e3e'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--pm-text-muted)'}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
        </button>
    );
}

const METHODS = ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'];

function MethodPicker({ method, onChange }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef();
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const handler = (e) => {
            if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        const rect = btnRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 4, left: rect.left });
        setOpen(p => !p);
    };

    const select = (m) => {
        onChange({ target: { value: m.toLowerCase() } });
        setOpen(false);
    };

    return (
        <div ref={btnRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
                type="button"
                onClick={handleOpen}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'transparent', border: 'none',
                    borderRight: '1px solid var(--pm-border)',
                    color: METHOD_COLORS[method] ?? 'var(--pm-text)',
                    fontWeight: 700, fontSize: '12px',
                    padding: '8px 10px', cursor: 'pointer',
                    minWidth: '80px', textTransform: 'uppercase',
                }}
            >
                {method?.toUpperCase() ?? 'GET'}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && createPortal(
                <div style={{
                    position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
                    background: 'var(--pm-surface-2)', border: '1px solid var(--pm-border)',
                    borderRadius: '6px', padding: '4px', minWidth: '100px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                    {METHODS.map(m => (
                        <div key={m}
                            onMouseDown={(e) => { e.preventDefault(); select(m); }}
                            style={{
                                padding: '7px 12px', cursor: 'pointer', borderRadius: '4px',
                                color: METHOD_COLORS[m.toLowerCase()],
                                fontWeight: 700, fontSize: '12px',
                                background: method?.toUpperCase() === m ? 'var(--pm-hover)' : 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--pm-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = method?.toUpperCase() === m ? 'var(--pm-hover)' : 'transparent'}
                        >{m}</div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

function ThemedEditor({ value, defaultValue, onChange, readOnly = false, height = '200px' }) {
    const monaco = useMonaco();

    useEffect(() => {
        if (!monaco) return;
        monaco.editor.defineTheme('postman-dark', EDITOR_THEME);
        monaco.editor.setTheme('postman-dark');
    }, [monaco]);

    return (
        <Editor
            height={height}
            defaultLanguage="json"
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            theme="postman-dark"
            options={{ ...EDITOR_OPTIONS, readOnly }}
        />
    );
}

export default function Workspace({ ids }) {

    const trafficController = useRef();
    const dispatch = useDispatch();

    const request = useFilename(ids);

    const [search, setSearch] = useState(request?.url ?? '');

    const debounced = useDebouncedCallback((value) => {
        dispatch(updateFileDetails({ url: value, ids }))
    }, 1000);

    useEffect(() => {
        setSearch(request?.url);
    }, [request?.url]);

    const {
        contents: headers,
        getContent: getHeader,
        deleteContent: deleteHeader,
        updateContent: udpateHeader,
        setContents: setHeaders
    } = useKeyValue({
        initialContents: [{ id: '', key: '', value: '' }],
        addOnEmpty: true
    });

    const [toolBar, setToolBar] = useState({
        activateTool: null,
        tools: [
            'Params',
            'Authorization',
            'Headers',
            'Body'
        ]
    });

    const [fetchDetails, setFetchDetails] = useState({
        isFetching: false,
        status: null,
        statusText: null,
        data: null,
        responseHeaders: null,
        isError: false,
    });

    const [responseTab, setResponseTab] = useState('json');

    const startFetching = () => setFetchDetails(prev => ({ ...prev, isFetching: true }));

    const setFetchResult = (res, isError = false) => {
        setFetchDetails({
            isFetching: false,
            status: res?.status ?? null,
            statusText: res?.statusText ?? null,
            data: res?.data ?? res ?? null,
            responseHeaders: res?.headers ? Object.entries(res.headers) : null,
            isError,
        });
    };

    const endFetch = () => setFetchDetails(prev => ({ ...prev, isFetching: false }));

    const [params, setParams] = useState([])

    useEffect(() => {
        trafficController.current = 'initial'
    }, [])

    useEffect(() => {
        dispatch(updateFileDetails({ ids, headers }))
    }, [headers])

    const handleOnChangeMethod = (e) => {
        dispatch(updateFileDetails({ method: e.target.value, ids }))
    }

    const handleOnChangeUrl = (e) => {

        trafficController.current = 'search';

        const search = e.target.value.trim();

        setSearch(search);
        debounced(search);
    }

    const fetch = () => {

        let option = {};

        let { method, url: targetUrl, bearerToken, headers: requestHeaders, body } = request;

        let url = new URL('agent', import.meta.env.VITE_WEB_AGENT);

        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'http://' + targetUrl;
        }

        const loopBackUrl = new URL(targetUrl);
        const isLoopBack = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(loopBackUrl.hostname);

        if (isLoopBack) { url = loopBackUrl; }
        else { url.searchParams.append('targetUrl', targetUrl); }

        if (method == null) return;

        if (bearerToken != null) option['Authorization'] = bearerToken;

        if (requestHeaders != null && requestHeaders.length >= 1) {
            requestHeaders.forEach(header => {
                if (header?.key?.length > 0) option[header.key] = header.value;
            });
        }

        const options = { headers: option };

        const onSuccess = (res) => setFetchResult(res);
        const onError = (err) => setFetchResult(err.response ?? { status: null, statusText: 'Network Error', data: err.message, headers: {} }, true);

        startFetching();

        const calls = {
            get: () => axios.get(url, options),
            post: () => axios.post(url, body, options),
            put: () => axios.put(url, body, options),
            patch: () => axios.patch(url, body, options),
            delete: () => axios.delete(url, options),
        };

        calls[method]?.()
            .then(onSuccess)
            .catch(onError)
            .finally(endFetch);
    }

    const getParam = (id) => {
        return params.find(input => input.id == id)
    }

    const deleteParam = (id) => {

        trafficController.current = 'delete';

        if (params.length <= 1) {
            setParams([
                {
                    id: v4(),
                    key: '',
                    value: '',
                }
            ])
        } else {
            setParams(prev => {
                return prev.filter(input => input.id !== id)
            })
        }
    }

    const updateParams = (values) => {

        const { id, index } = values;

        trafficController.current = 'inputs';

        setParams(prev => {
            return prev.map(data => {
                if (data.id == id) {
                    return { ...data, ...values }
                }
                return data
            })
        })

        // Add another row below if change is from last index
        if (index === params.length - 1) {
            setParams(prev => ([
                ...prev,
                {
                    id: v4(),
                    key: '',
                    value: '',
                }
            ]))
        }
    }

    const handleOnChangeToken = (e) => {
        dispatch(updateFileDetails({ ids, bearerToken: `Bearer ${e.target.value}` }))
    }

    useEffect(() => {

        trafficController.current = 'initial';

        setParams([
            {
                id: v4(),
                key: '',
                value: '',
            }
        ]);

        setFetchDetails({
            isFetching: false,
            status: null,
            statusText: null,
            data: null,
            responseHeaders: null,
            isError: false,
        });

        setResponseTab('json');

        setHeaders(request?.headers ?? [{ id: '', key: '', value: '' }]);

    }, [ids])

    useEffect(() => {

        if (trafficController.current != 'search' && trafficController.current != 'initial') {
            return;
        }

        if (request?.url == null || request?.url.length <= 0) {
            return;
        }

        const url = URL.parse(request.url);

        if (url?.searchParams?.entries == null) {
            return;
        }

        const values = [];

        for (const [key, value] of url.searchParams.entries()) {
            values.push({
                id: v4(),
                key: key,
                value: value
            })
        }

        if (values.length <= 1) {
            setParams([...values, {
                id: v4(),
                key: '',
                value: ''
            }])
        } else {
            setParams(values)
        }

    }, [request])

    useEffect(() => {

        if (trafficController.current != 'inputs' && trafficController.current != 'delete') {
            return
        }

        if (request?.url == null || request?.url?.length <= 0) {
            return;
        }

        if (request.url.slice(-1) == '&') {
            return;
        }

        const url1 = URL.parse(request.url);
        const url2 = URL.parse(url1.href.split('?')[0]);

        let url = null;

        if (trafficController.current == 'delete') {
            url = url2;
        } else {
            url = url1
        }

        params.forEach(input => {

            if (input.value.length <= 0 || input.key.length <= 0) {
                return
            }

            if (url.searchParams.has(input.key)) {
                url.searchParams.set(input.key, input.value)
            } else {
                url.searchParams.append(input.key, input.value)
            }
        })

        trafficController.current = 'inputs';

        dispatch(updateFileDetails({ url: decodeURIComponent(url), ids }))

    }, [params])

    return <>
        <div className="h-screen">
            <Allotment vertical={true}>
                <section className="w-full">

                    <form onSubmit={(e) => { e.preventDefault(); fetch(); }}>
                        <div style={{ display: 'flex', gap: '8px', padding: '10px 16px' }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--pm-input-bg)', border: '1px solid var(--pm-border)', borderRadius: '6px', overflow: 'hidden' }}>
                                <MethodPicker method={request?.method} onChange={handleOnChangeMethod} />
                                <input
                                    onChange={handleOnChangeUrl}
                                    value={search ?? ''}
                                    placeholder="Enter request URL"
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--pm-text)', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{ background: 'var(--pm-accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--pm-accent-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--pm-accent)'}
                            >
                                Send
                            </button>
                        </div>
                    </form>

                    {/* Toolbar tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--pm-border)', padding: '0 16px', flexShrink: 0 }}>
                        {toolBar?.tools.map(tool => {
                            const isActive = toolBar.activateTool == tool;
                            return (
                                <button
                                    key={tool}
                                    type="button"
                                    onClick={() => setToolBar(prev => ({ ...prev, activateTool: isActive ? null : tool }))}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: isActive ? '2px solid var(--pm-accent)' : '2px solid transparent',
                                        color: isActive ? 'var(--pm-text)' : 'var(--pm-text-muted)',
                                        padding: '8px 14px',
                                        fontSize: '12px',
                                        fontWeight: isActive ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'color 0.1s, border-color 0.1s',
                                        marginBottom: '-1px',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--pm-text)'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--pm-text-muted)'; }}
                                >
                                    {tool}
                                </button>
                            );
                        })}
                    </div>

                    {/* Params panel */}
                    {toolBar.activateTool == 'Params' && (
                        <div style={{ overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Key', 'Value', ''].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '7px 12px', color: 'var(--pm-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--pm-border)', background: 'var(--pm-surface-2)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {params.map((input, index) => (
                                        <tr key={input.id} style={{ borderBottom: '1px solid var(--pm-border)' }}>
                                            <td style={{ padding: '0 4px' }}>
                                                <input value={getParam(input.id)?.key} onChange={(e) => updateParams({ id: input.id, key: e.target.value, index })} placeholder="Key" style={kvInputStyle} />
                                            </td>
                                            <td style={{ padding: '0 4px', borderLeft: '1px solid var(--pm-border)' }}>
                                                <input value={getParam(input.id)?.value} onChange={(e) => updateParams({ id: input.id, value: e.target.value, index })} placeholder="Value" style={kvInputStyle} />
                                            </td>
                                            <td style={{ padding: '0 8px', borderLeft: '1px solid var(--pm-border)', width: '36px' }}>
                                                <DeleteBtn onClick={() => deleteParam(input.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Headers panel */}
                    {toolBar.activateTool == 'Headers' && (
                        <div style={{ overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Key', 'Value', ''].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '7px 12px', color: 'var(--pm-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--pm-border)', background: 'var(--pm-surface-2)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {headers.map((input, index) => (
                                        <tr key={input.id} style={{ borderBottom: '1px solid var(--pm-border)' }}>
                                            <td style={{ padding: '0 4px' }}>
                                                <input value={getHeader(input.id)?.key} onChange={(e) => udpateHeader({ id: input.id, key: e.target.value, index })} placeholder="Key" style={kvInputStyle} />
                                            </td>
                                            <td style={{ padding: '0 4px', borderLeft: '1px solid var(--pm-border)' }}>
                                                <input value={getHeader(input.id)?.value} onChange={(e) => udpateHeader({ id: input.id, value: e.target.value, index })} placeholder="Value" style={kvInputStyle} />
                                            </td>
                                            <td style={{ padding: '0 8px', borderLeft: '1px solid var(--pm-border)', width: '36px' }}>
                                                <DeleteBtn onClick={() => deleteHeader(input.id)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Authorization panel */}
                    {toolBar.activateTool == 'Authorization' && (
                        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '0' }}>
                            <div style={{ background: 'var(--pm-surface-2)', border: '1px solid var(--pm-border)', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '8px 14px', color: 'var(--pm-text-muted)', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                Bearer Token
                            </div>
                            <input
                                onChange={handleOnChangeToken}
                                value={request?.bearerToken?.replace('Bearer ', '') || ''}
                                placeholder="Enter token..."
                                style={{ flex: 1, background: 'var(--pm-input-bg)', border: '1px solid var(--pm-border)', borderRadius: '0 6px 6px 0', color: 'var(--pm-text)', padding: '8px 12px', fontSize: '12px', outline: 'none' }}
                            />
                        </div>
                    )}

                    {/* Body panel */}
                    {toolBar.activateTool == 'Body' && (
                        <ThemedEditor
                            height="40vh"
                            defaultValue={JSON.stringify(request?.body, null, 2)}
                            onChange={(value) => { try { dispatch(updateFileDetails({ ids, body: JSON.parse(value) })) } catch (e) { } }}
                        />
                    )}

                </section>
                <Allotment.Pane minSize={200} maxSize={600}>
                    <section style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--pm-surface)', overflow: 'hidden' }}>

                        {/* Response status bar */}
                        <div style={{ padding: '0 16px', borderBottom: '1px solid var(--pm-border)', display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0 }}>
                            {/* Response view tabs */}
                            {['json', 'headers', 'preview'].map(tab => {
                                const isActive = responseTab === tab;
                                return (
                                    <button key={tab} type="button"
                                        onClick={() => setResponseTab(tab)}
                                        style={{
                                            background: 'transparent', border: 'none',
                                            borderBottom: isActive ? '2px solid var(--pm-accent)' : '2px solid transparent',
                                            color: isActive ? 'var(--pm-text)' : 'var(--pm-text-muted)',
                                            padding: '8px 14px', fontSize: '12px',
                                            fontWeight: isActive ? 600 : 400,
                                            cursor: 'pointer', textTransform: 'capitalize',
                                            marginBottom: '-1px',
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--pm-text)'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--pm-text-muted)'; }}
                                    >{tab}</button>
                                );
                            })}

                            {/* Status badge + meta */}
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {fetchDetails.isFetching && (
                                    <span style={{ color: 'var(--pm-text-muted)', fontSize: '12px' }}>Sending...</span>
                                )}
                                {fetchDetails.status && (
                                    <>
                                        <span style={{
                                            color: fetchDetails.status >= 200 && fetchDetails.status < 300 ? '#49cc90' : '#f93e3e',
                                            fontSize: '12px', fontWeight: 700,
                                            background: (fetchDetails.status >= 200 && fetchDetails.status < 300 ? '#49cc90' : '#f93e3e') + '22',
                                            padding: '2px 8px', borderRadius: '4px',
                                        }}>
                                            {fetchDetails.status} {fetchDetails.statusText}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Response body */}
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            {fetchDetails.isFetching && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--pm-text-muted)', fontSize: '13px' }}>
                                    Waiting for response...
                                </div>
                            )}

                            {!fetchDetails.isFetching && fetchDetails.status == null && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--pm-text-muted)', gap: '8px' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.3 }}>
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    <span style={{ fontSize: '13px' }}>Hit Send to get a response</span>
                                </div>
                            )}

                            {/* JSON tab */}
                            {!fetchDetails.isFetching && fetchDetails.status != null && responseTab === 'json' && (
                                <ThemedEditor
                                    readOnly={true}
                                    height="100%"
                                    value={JSON.stringify(fetchDetails.data, null, 2)}
                                />
                            )}

                            {/* Headers tab */}
                            {!fetchDetails.isFetching && fetchDetails.status != null && responseTab === 'headers' && (
                                <div style={{ overflowY: 'auto', height: '100%' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                {['Key', 'Value'].map(h => (
                                                    <th key={h} style={{ textAlign: 'left', padding: '7px 16px', color: 'var(--pm-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--pm-border)', background: 'var(--pm-surface-2)' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(fetchDetails.responseHeaders ?? []).map(([key, val], i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--pm-border)' }}>
                                                    <td style={{ padding: '7px 16px', fontSize: '12px', color: '#61affe', fontFamily: 'monospace', width: '40%' }}>{key}</td>
                                                    <td style={{ padding: '7px 16px', fontSize: '12px', color: 'var(--pm-text)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{val}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Preview tab */}
                            {!fetchDetails.isFetching && fetchDetails.status != null && responseTab === 'preview' && (
                                <div style={{ height: '100%', overflow: 'hidden' }}>
                                    {(() => {
                                        const ct = (fetchDetails.responseHeaders ?? []).find(([k]) => k.toLowerCase() === 'content-type')?.[1] ?? '';
                                        const isHtml = ct.includes('text/html');
                                        if (isHtml) {
                                            return (
                                                <iframe
                                                    srcDoc={typeof fetchDetails.data === 'string' ? fetchDetails.data : JSON.stringify(fetchDetails.data, null, 2)}
                                                    style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                                                    sandbox="allow-same-origin"
                                                    title="preview"
                                                />
                                            );
                                        }
                                        return (
                                            <div style={{ padding: '24px', color: 'var(--pm-text-muted)', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowY: 'auto', height: '100%' }}>
                                                {typeof fetchDetails.data === 'string' ? fetchDetails.data : JSON.stringify(fetchDetails.data, null, 2)}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                    </section>
                </Allotment.Pane>
            </Allotment>
        </div>
    </>
}