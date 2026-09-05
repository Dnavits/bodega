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
          background: 'linear-gradient(135deg, #7E22CE 0%, #17141D 100%)',
          borderRadius: '40px',
          border: '4px solid #D8B4FE',
          color: '#FAF5FF',
          fontFamily: 'sans-serif'
        }}
      >
        <span style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2 }}>MA</span>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 6, marginTop: 4, color: '#D8B4FE' }}>ATELIER</span>
      </div>
    ),
    { ...size }
  );
}
