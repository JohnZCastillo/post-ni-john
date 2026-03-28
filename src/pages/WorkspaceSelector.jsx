import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { setWorkspace } from '../redux-slice/slice';
import axios from 'axios';

const WS_PREFIX = 'ws:';

export const saveWorkspaceToken = (workspace, token) => {
    localStorage.setItem(`${WS_PREFIX}${workspace}`, token);
};

export const getWorkspaceToken = (workspace) => {
    return localStorage.getItem(`${WS_PREFIX}${workspace}`);
};

// Returns all saved workspaces that still have a token
const getSavedWorkspaces = () => {
    return Object.keys(localStorage)
        .filter(k => k.startsWith(WS_PREFIX))
        .map(k => k.slice(WS_PREFIX.length));
};

const inputStyle = {
    background: 'var(--pm-input-bg)',
    border: '1px solid var(--pm-border)',
    borderRadius: '6px',
    color: 'var(--pm-text)',
    padding: '9px 12px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
};

export default function WorkspaceSelector() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentWorkspaceId = useSelector(s => s.appState.workspaceId);
    const currentWorkspaceName = useSelector(s => s.appState.workspaceName);

    const [tab, setTab] = useState('saved');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const savedWorkspaces = getSavedWorkspaces();

    const switchNameRef = useRef();
    const switchPasswordRef = useRef();
    const createNameRef = useRef();
    const createPasswordRef = useRef();

    const baseUrl = import.meta.env.VITE_WEB_AGENT;

    const switchTo = (workspace) => {
        dispatch(setWorkspace({ workspaceId: workspace, workspaceName: workspace }));
        navigate('/');
    };

    const handleSwitch = async (e) => {
        e.preventDefault();
        const workspace = switchNameRef.current.value.trim();
        const password = switchPasswordRef.current.value.trim();
        if (!workspace || !password) return;

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${baseUrl}/sign`, { workspace, password });
            saveWorkspaceToken(workspace, res.data.token);
            switchTo(workspace);
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Invalid workspace or password');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const workspace = createNameRef.current.value.trim();
        const password = createPasswordRef.current.value.trim();
        if (!workspace || !password) return;

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${baseUrl}/workspace`, { workspace, password });
            saveWorkspaceToken(workspace, res.data.token);
            switchTo(workspace);
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Failed to create workspace');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { key: 'saved', label: 'Saved' },
        { key: 'switch', label: 'Sign In' },
        { key: 'create', label: 'New' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--pm-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                background: 'var(--pm-sidebar)',
                border: '1px solid var(--pm-border)',
                borderRadius: '10px',
                padding: '36px 40px',
                width: '100%',
                maxWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            }}>
                <div>
                    <div style={{ color: 'var(--pm-accent)', fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>API Client</div>
                    <div style={{ color: 'var(--pm-text-muted)', fontSize: '13px' }}>Manage your workspaces</div>
                </div>

                {/* Resume current */}
                {currentWorkspaceId && (
                    <button type="button" onClick={() => navigate('/')} style={{
                        background: 'var(--pm-surface-2)', border: '1px solid var(--pm-border)',
                        borderRadius: '6px', padding: '10px 14px', color: 'var(--pm-text)',
                        fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '10px',
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pm-accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--pm-border)'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pm-accent)" strokeWidth="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span style={{ flex: 1 }}>Continue with "{currentWorkspaceName ?? currentWorkspaceId}"</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}>
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--pm-border)' }}>
                    {tabs.map(t => (
                        <button key={t.key} type="button" onClick={() => { setTab(t.key); setError(null); }} style={{
                            background: 'transparent', border: 'none',
                            borderBottom: tab === t.key ? '2px solid var(--pm-accent)' : '2px solid transparent',
                            color: tab === t.key ? 'var(--pm-text)' : 'var(--pm-text-muted)',
                            padding: '8px 14px', fontSize: '12px', fontWeight: tab === t.key ? 600 : 400,
                            cursor: 'pointer', marginBottom: '-1px',
                        }}>{t.label}</button>
                    ))}
                </div>

                {/* Saved workspaces */}
                {tab === 'saved' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedWorkspaces.length === 0 ? (
                            <div style={{ color: 'var(--pm-text-muted)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
                                No saved workspaces yet
                            </div>
                        ) : (
                            savedWorkspaces.map(ws => (
                                <button key={ws} type="button" onClick={() => switchTo(ws)} style={{
                                    background: ws === currentWorkspaceId ? 'var(--pm-hover)' : 'var(--pm-surface-2)',
                                    border: `1px solid ${ws === currentWorkspaceId ? 'var(--pm-accent)' : 'var(--pm-border)'}`,
                                    borderRadius: '6px', padding: '10px 14px', color: 'var(--pm-text)',
                                    fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--pm-accent)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = ws === currentWorkspaceId ? 'var(--pm-accent)' : 'var(--pm-border)'}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span style={{ flex: 1 }}>{ws}</span>
                                    {ws === currentWorkspaceId && (
                                        <span style={{ fontSize: '10px', color: 'var(--pm-accent)', fontWeight: 600 }}>ACTIVE</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Sign in form */}
                {tab === 'switch' && (
                    <form onSubmit={handleSwitch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input ref={switchNameRef} placeholder="Workspace name" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--pm-accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--pm-border)'} />
                        <input ref={switchPasswordRef} type="password" placeholder="Password" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--pm-accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--pm-border)'} />
                        {error && <span style={{ color: '#f93e3e', fontSize: '12px' }}>{error}</span>}
                        <button type="submit" disabled={loading} style={{
                            background: 'var(--pm-accent)', color: '#fff', border: 'none',
                            borderRadius: '6px', padding: '9px', fontWeight: 600, fontSize: '13px',
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                        }}>{loading ? 'Signing in...' : 'Sign In'}</button>
                    </form>
                )}

                {/* Create form */}
                {tab === 'create' && (
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input ref={createNameRef} placeholder="Workspace name" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--pm-accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--pm-border)'} />
                        <input ref={createPasswordRef} type="password" placeholder="Password" style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--pm-accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--pm-border)'} />
                        {error && <span style={{ color: '#f93e3e', fontSize: '12px' }}>{error}</span>}
                        <button type="submit" disabled={loading} style={{
                            background: 'var(--pm-accent)', color: '#fff', border: 'none',
                            borderRadius: '6px', padding: '9px', fontWeight: 600, fontSize: '13px',
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                        }}>{loading ? 'Creating...' : 'Create & Open'}</button>
                    </form>
                )}
            </div>
        </div>
    );
}
