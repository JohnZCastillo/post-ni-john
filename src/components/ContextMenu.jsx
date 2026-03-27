import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ContextMenu({ ref, options = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef();
    const menuPosition = useRef();

    const handleContextMenu = (e) => {
        e.preventDefault();
        menuPosition.current = { left: `${e.pageX}px`, top: `${e.pageY}px` };
        setIsOpen(true);
    };

    const handleOnBlur = (e) => { e.preventDefault(); setIsOpen(false); };

    useEffect(() => {
        ref.current?.addEventListener("contextmenu", handleContextMenu);
        ref.current?.addEventListener("blur", handleOnBlur);
        return () => {
            ref.current?.removeEventListener("contextmenu", handleContextMenu);
            ref.current?.removeEventListener("blur", handleOnBlur);
        };
    }, []);

    return createPortal(
        <>
            {isOpen && (
                <div
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false)
                    }}
                >
                    <div
                        ref={menuRef}
                        style={{
                            position: 'absolute',
                            background: 'var(--pm-surface-2)',
                            border: '1px solid var(--pm-border)',
                            borderRadius: '6px',
                            padding: '4px',
                            minWidth: '160px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                            ...menuPosition.current
                        }}
                    >
                        {options.map((option, i) => (
                            <div
                                key={i}
                                onClick={option.action}
                                style={{
                                    padding: '7px 12px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    color: option.title === 'Delete' ? '#f93e3e' : 'var(--pm-text)',
                                    fontSize: '12px',
                                    transition: 'background 0.1s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--pm-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {option.title}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>,
        document.body
    );
}
