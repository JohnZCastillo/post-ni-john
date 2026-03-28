import { useDispatch, useSelector } from 'react-redux';
import TestFolder from './Folder';
import RequestItem from './Request';
import { addRootFile, addRootFolder } from '../redux-slice/slice';
import { RefreshCw } from '@boxicons/react';
import Workspace from './Workspace';
import Tab from './Tab';
import { Allotment } from 'allotment';
import { useOutletContext, useNavigate } from 'react-router';
import LoadingBtn from '../components/LoadingBtn';
import DraggableItem from '../components/DraggableItem';
import { useRef } from 'react';

export default function Homepage() {

    const appState = useSelector((state) => state.appState);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const draggableBox = useRef();

    const renderer = (item, parentIds = []) => {
        if (item.type == 'file') {
            return (
                <RequestItem key={item?.id} type={item?.method} ids={[...parentIds, item.id]} />
            );
        }

        if (item.contents?.length <= 0) {
            return (
                <TestFolder key={item?.id} ids={[...parentIds, item.id]} />
            );
        }

        return (
            <TestFolder key={item?.id} ids={[...parentIds, item.id]}>
                {item.contents?.map(content => renderer(content, [...parentIds, item.id]))}
            </TestFolder>
        )
    }

    return (
        <div style={{ height: '100vh', background: 'var(--pm-bg)', display: 'flex', flexDirection: 'column' }}>
            {/* Top navbar */}
            <div style={{
                height: '40px',
                background: 'var(--pm-sidebar)',
                borderBottom: '1px solid var(--pm-border)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: '8px',
                flexShrink: 0
            }}>
                <span style={{ color: 'var(--pm-accent)', fontWeight: 700, fontSize: '15px', letterSpacing: '0.5px' }}>
                    API Client
                </span>
                <button
                    type="button"
                    onClick={() => navigate('/workspaces')}
                    title="Switch workspace"
                    style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: '1px solid var(--pm-border)',
                        borderRadius: '5px',
                        color: 'var(--pm-text-muted)',
                        cursor: 'pointer',
                        padding: '3px 10px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--pm-text)'; e.currentTarget.style.borderColor = 'var(--pm-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--pm-text-muted)'; e.currentTarget.style.borderColor = 'var(--pm-border)'; }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    {appState.workspaceName ?? 'Workspace'}
                </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Allotment>
                    <Allotment.Pane minSize={200} maxSize={400} preferredSize={260}>
                        {/* Sidebar */}
                        <aside style={{
                            height: '100%',
                            background: 'var(--pm-sidebar)',
                            borderRight: '1px solid var(--pm-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            {/* Sidebar header */}
                            <div style={{
                                padding: '8px 10px',
                                borderBottom: '1px solid var(--pm-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexShrink: 0
                            }}>
                                <span style={{ color: 'var(--pm-text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                    Collections
                                </span>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <SidebarBtn title="New Request" onClick={() => dispatch(addRootFile({ filename: 'New Request' }))}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </SidebarBtn>
                                    <SidebarBtn title="New Folder" onClick={() => dispatch(addRootFolder({ filename: 'New Folder' }))}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </SidebarBtn>
                                </div>
                            </div>

                            {/* Sidebar content */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                                {appState.content.length === 0 && (
                                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--pm-text-muted)', fontSize: '12px' }}>
                                        <div style={{ marginBottom: '8px', opacity: 0.5 }}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                            </svg>
                                        </div>
                                        No requests yet
                                    </div>
                                )}
                                <div ref={draggableBox}>
                                    {appState.content.map(content => renderer(content))}
                                </div>
                            </div>
                        </aside>
                    </Allotment.Pane>

                    {/* Main content */}
                    <section style={{
                        height: '100%',
                        background: 'var(--pm-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {appState?.activeSelection?.ids != null ? (
                            <>
                                {/* Tabs bar */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'var(--pm-sidebar)',
                                    borderBottom: '1px solid var(--pm-border)',
                                    overflowX: 'auto',
                                    flexShrink: 0,
                                    minHeight: '36px'
                                }}>
                                    {appState?.selections?.map(selection => (
                                        <Tab key={selection?.id} ids={selection?.ids} />
                                    ))}
                                </div>
                                {appState?.activeSelection?.ids && (
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <Workspace ids={appState?.activeSelection?.ids} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--pm-text-muted)'
                            }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.3 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: 'var(--pm-text)' }}>Select or create a request</p>
                                <p style={{ fontSize: '12px' }}>Choose from the sidebar or create a new one</p>
                            </div>
                        )}
                    </section>
                </Allotment>
            </div>
        </div>
    );
}

function SidebarBtn({ children, title, onClick }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--pm-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s, background 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--pm-text)'; e.currentTarget.style.background = 'var(--pm-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--pm-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
            {children}
        </button>
    );
}
