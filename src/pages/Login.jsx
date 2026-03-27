export default function Login() {
    return (
        <div style={{
            height: '100vh',
            background: 'var(--pm-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                background: 'var(--pm-surface)',
                border: '1px solid var(--pm-border)',
                borderRadius: '8px',
                padding: '40px',
                width: '360px'
            }}>
                <h1 style={{ color: 'var(--pm-accent)', fontWeight: 700, fontSize: '20px', marginBottom: '24px', textAlign: 'center' }}>
                    API Client
                </h1>
                <p style={{ color: 'var(--pm-text-muted)', textAlign: 'center', fontSize: '13px' }}>Login</p>
            </div>
        </div>
    );
}
