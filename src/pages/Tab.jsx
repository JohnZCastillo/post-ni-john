import { useDispatch, useSelector } from "react-redux";
import useFilename from "../hooks/useFilename";
import { closeAllTabs, closeAllTabsExceptActive, removeSelection, setSelection } from "../redux-slice/slice";
import { useRef, useState } from "react";
import ContextMenu from "../components/ContextMenu";

const METHOD_COLORS = {
    get: '#49cc90',
    post: '#fca130',
    put: '#61affe',
    patch: '#50e3c2',
    delete: '#f93e3e',
};

export default function Tab({ ids }) {
    const workSpace = useFilename(ids);
    const activeSelection = useSelector((state) => state.appState?.activeSelection);
    const [isHovered, setIsHovered] = useState(false);
    const dispatch = useDispatch();

    const isActive = activeSelection?.id == workSpace?.id;
    const methodColor = METHOD_COLORS[workSpace?.method] || 'var(--pm-text-muted)';

    const handleOnClick = () => dispatch(setSelection({ ids }));

    const handleOnDelete = (e) => {
        e.stopPropagation();
        dispatch(removeSelection({ id: workSpace?.id }));
    };

    const contextMenu = useRef();

    const options = [{
        title: 'Close All',
        action: () => {
            dispatch(closeAllTabs({ id: workSpace?.id }))
        }
    },
    {
        title: 'Close All Except Current',
        action: () => {
            dispatch(closeAllTabsExceptActive({ id: workSpace?.id }))
        }
    }];

    return (
        <div
            ref={contextMenu}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleOnClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 12px',
                height: '36px',
                cursor: 'pointer',
                borderRight: '1px solid var(--pm-border)',
                background: isActive ? 'var(--pm-surface)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--pm-accent)' : '2px solid transparent',
                color: isActive ? 'var(--pm-text)' : 'var(--pm-text-muted)',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                position: 'relative',
                transition: 'background 0.1s',
                minWidth: 0,
                maxWidth: '160px',
                flexShrink: 0
            }}
        >

            <ContextMenu options={options} ref={contextMenu} />


            {workSpace?.method && (
                <span style={{ color: methodColor, fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', flexShrink: 0 }}>
                    {workSpace.method}
                </span>
            )}

            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {workSpace?.name || workSpace?.url || 'Untitled'}
            </span>
            {isHovered && (
                <button
                    onClick={handleOnDelete}
                    type="button"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--pm-text-muted)',
                        cursor: 'pointer',
                        padding: '0',
                        marginLeft: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '3px',
                        flexShrink: 0
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f93e3e'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--pm-text-muted)'}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
}
