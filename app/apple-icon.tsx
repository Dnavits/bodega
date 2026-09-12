import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08304c',
          borderRadius: '40px',
          border: '4px solid #2563eb',
          color: '#ffffff',
          fontFamily: 'sans-serif'
        }}
      >
        <span style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2 }}>BD</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, marginTop: 4, color: '#60a5fa' }}>BODEGA DNAVITS</span>
      </div>
    ),
    { ...size }
  );
}
