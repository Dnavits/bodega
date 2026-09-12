import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08304c',
          borderRadius: '8px',
          border: '1.5px solid #2563eb',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 900,
          fontFamily: 'sans-serif'
        }}
      >
        BD
      </div>
    ),
    { ...size }
  );
}
