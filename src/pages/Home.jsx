import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#050505', minHeight: '100vh', position: 'relative' }}>

      {/* HERO */}
      <section style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex',
        alignItems: 'center',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '80px 48px 0',
        gap: 80,
      }}>

        {/* LEFT */}
        <div style={{ flex: '1.1' }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
          }}>
            <div style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: '#d4a843',
            }} />
            <span style={{
              fontSize: 11,
              color: '#52525b',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}>
              WebAssembly-powered · Privacy-first
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: 20,
            color: '#fffbf5',
          }}>
            Convert any file.<br />
            <span style={{
              background: 'linear-gradient(90deg, #d4a843, #f0c96b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Upload nothing.
            </span>
          </h1>

          {/* Body */}
          <p style={{
            fontSize: 15,
            color: '#52525b',
            lineHeight: 1.7,
            maxWidth: 400,
            marginBottom: 40,
          }}>
            FFmpeg, Tesseract, and LibreOffice run directly
            in your browser. 200+ formats. Zero uploads.
            Your files never touch a server.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/convert')}
              style={{
                padding: '12px 24px',
                background: '#d4a843',
                color: '#050505',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e0b854'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#d4a843'; }}
            >
              Start converting
            </button>
            <button
              onClick={() => navigate('/ocr')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#52525b',
                border: '1px solid #1e1e1e',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(212,168,67,0.3)';
                e.currentTarget.style.color = '#fffbf5';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1e1e1e';
                e.currentTarget.style.color = '#52525b';
              }}
            >
              Extract text
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: 0,
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid #1e1e1e',
          }}>
            {[
              { value: '200+', label: 'Formats' },
              { value: '0', label: 'Uploads' },
              { value: '100%', label: 'Private' },
            ].map((stat, i) => (
              <div key={i} style={{
                paddingRight: 32,
                marginRight: 32,
                borderRight: i < 2 ? '1px solid #1e1e1e' : 'none',
              }}>
                <div style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#d4a843',
                  letterSpacing: '-0.02em',
                }}>{stat.value}</div>
                <div style={{
                  fontSize: 11,
                  color: '#52525b',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Product card */}
        <div style={{ flex: '0.9', display: 'flex', justifyContent: 'center' }}
          className="hidden lg:flex"
        >
          <div style={{
            width: 380,
            background: '#0f0f0f',
            border: '1px solid #1e1e1e',
            borderRadius: 16,
            overflow: 'hidden',
          }}>

            {/* Titlebar */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {['#3a1515','#3a3015','#153a15'].map((c, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
              ))}
              <span style={{
                marginLeft: 10,
                fontSize: 11,
                color: '#2a2a2a',
                fontFamily: 'monospace',
              }}>covet — converter</span>
            </div>

            {/* File row */}
            <div style={{ padding: '20px 20px 0' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: '#141414',
                border: '1px solid #1e1e1e',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#fffbf5',
                    fontFamily: 'monospace',
                  }}>presentation.mp4</div>
                  <div style={{ fontSize: 11, color: '#52525b', marginTop: 2 }}>
                    128.4 MB · Video
                  </div>
                </div>
              </div>
            </div>

            {/* Format pills */}
            <div style={{ padding: '16px 20px 0' }}>
              <div style={{
                fontSize: 10,
                color: '#2a2a2a',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>Convert to</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['MP3','WAV','FLAC','AAC','OGG'].map((f, i) => (
                  <div key={f} style={{
                    padding: '5px 10px',
                    borderRadius: 5,
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    background: i === 0 ? 'rgba(212,168,67,0.12)' : '#141414',
                    border: i === 0 ? '1px solid rgba(212,168,67,0.35)' : '1px solid #1e1e1e',
                    color: i === 0 ? '#d4a843' : '#52525b',
                  }}>{f}</div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#1a1a1a', margin: '16px 0' }} />

            {/* Progress */}
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace' }}>
                  FFmpeg.wasm
                </span>
                <span style={{ fontSize: 11, color: '#d4a843', fontFamily: 'monospace' }}>
                  72%
                </span>
              </div>
              <div style={{
                height: 3,
                background: '#1e1e1e',
                borderRadius: 99,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: '72%',
                  background: 'linear-gradient(90deg, #a07c2e, #d4a843)',
                  borderRadius: 99,
                }} />
              </div>
              <div style={{
                marginTop: 12,
                fontSize: 11,
                color: '#2a2a2a',
                fontFamily: 'monospace',
              }}>✓ running locally · zero uploads</div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMATS GRID */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '120px 48px 80px',
      }}>
        <div style={{
          fontSize: 11,
          color: '#2a2a2a',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>Supported formats</div>
        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#fffbf5',
          letterSpacing: '-0.02em',
          marginBottom: 40,
        }}>Everything you need</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          border: '1px solid #1e1e1e',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {[
            { icon: '🎵', name: 'Audio', formats: ['MP3','WAV','FLAC','AAC'] },
            { icon: '🎬', name: 'Video', formats: ['MP4','WebM','AVI','MOV'] },
            { icon: '🖼️', name: 'Image', formats: ['JPG','PNG','WEBP','BMP'] },
            { icon: '📄', name: 'Document', formats: ['DOCX','PDF','TXT','HTML'] },
            { icon: '📊', name: 'Spreadsheet', formats: ['XLSX','CSV','JSON'] },
            { icon: '🔡', name: 'Data', formats: ['JSON','XML','YAML','CSV'] },
            { icon: '🔍', name: 'OCR', formats: ['JPG','PNG','TIFF','PDF'] },
          ].map((cat, i, arr) => (
            <div key={cat.name}
              style={{
                padding: '24px 20px',
                background: '#050505',
                borderRight: i < arr.length - 1 ? '1px solid #1e1e1e' : 'none',
                transition: 'background 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0f0f0f'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#050505'; }}
            >
              <div style={{ fontSize: 20, marginBottom: 14 }}>{cat.icon}</div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fffbf5',
                marginBottom: 10,
              }}>{cat.name}</div>
              <div style={{
                fontSize: 11,
                color: '#2a2a2a',
                fontFamily: 'monospace',
                lineHeight: 2,
              }}>
                {cat.formats.map(f => (
                  <div key={f}>{f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #1e1e1e',
        padding: '24px 48px',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fffbf5' }}>Covet</span>
        <span style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'monospace' }}>
          Files never leave your browser
        </span>
        <span style={{ fontSize: 11, color: '#2a2a2a' }}>Open Source</span>
      </footer>
    </div>
  );
}
