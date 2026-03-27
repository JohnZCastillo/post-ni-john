import { useState } from "react";

export default function LoadingBtn({ onClick, children }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleOnClick = async () => {
        setIsLoading(true);
        await onClick();
        setTimeout(() => setIsLoading(false), 500);
    };

    return (
        <button
            onClick={handleOnClick}
            type="button"
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
            <span style={{ display: 'flex', alignItems: 'center', animation: isLoading ? 'spin 1s linear infinite' : 'none' }}>
                {children}
            </span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
    );
}
