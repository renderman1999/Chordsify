
interface ChordChartProps {
  chord: string;
}

// A simplified mapping of common chords to finger positions
const chordMappings: Record<string, (number | 'x')[]> = {
  'C': [0, 1, 0, 2, 3, 0],
  'G': [3, 2, 0, 0, 0, 3],
  'D': ['x', 'x', 0, 2, 3, 2],
  'A': ['x', 0, 2, 2, 2, 0],
  'E': [0, 2, 2, 1, 0, 0],
  'Am': ['x', 0, 2, 2, 1, 0],
  'Em': [0, 2, 2, 0, 0, 0],
  'F': [1, 3, 3, 2, 1, 1],
  'Dm': ['x', 'x', 0, 2, 3, 1],
  'G7': [3, 2, 0, 0, 0, 1],
  'C7': [0, 1, 3, 2, 3, 0],
  'B7': ['x', 2, 1, 2, 0, 2],
  'Bm': ['x', 2, 4, 4, 3, 2],
  'A#': ['x', 1, 3, 3, 3, 1],
  'A#m': ['x', 1, 3, 3, 2, 1],
  'C#': ['x', 4, 6, 6, 6, 4],
  'C#m': ['x', 4, 6, 6, 5, 4],
  'D#': ['x', 'x', 1, 3, 4, 3],
  'D#m': ['x', 'x', 1, 3, 4, 2],
  'F#': [2, 4, 4, 3, 2, 2],
  'F#m': [2, 4, 4, 2, 2, 2],
  'G#': [4, 6, 6, 5, 4, 4],
  'G#m': [4, 6, 6, 4, 4, 4],
};

export function ChordChart({ chord }: ChordChartProps) {
  // Default to C chord if the chord is not in our mappings
  const positions = chordMappings[chord] || chordMappings['C'];
  
  return (
    <div className="chord-chart bg-music-surface p-4 rounded-lg">
      <svg width="100" height="120" viewBox="0 0 100 120">
        {/* Fretboard */}
        <rect x="10" y="10" width="80" height="100" fill="none" stroke="#71717A" strokeWidth="1" />
        
        {/* Frets */}
        {[0, 1, 2, 3, 4].map((fret) => (
          <line 
            key={`fret-${fret}`}
            x1="10" 
            y1={30 + fret * 20} 
            x2="90" 
            y2={30 + fret * 20} 
            stroke="#71717A" 
            strokeWidth="1" 
          />
        ))}
        
        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map((string) => (
          <line 
            key={`string-${string}`}
            x1={20 + string * 14} 
            y1="10" 
            x2={20 + string * 14} 
            y2="110" 
            stroke="#FFFFFF" 
            strokeWidth="1" 
          />
        ))}
        
        {/* Positions */}
        {positions.map((pos, idx) => {
          const x = 20 + idx * 14;
          
          if (pos === 'x') {
            return (
              <g key={`pos-${idx}`}>
                <line x1={x-5} y1={5} x2={x+5} y2={15} stroke="#71717A" strokeWidth="2" />
                <line x1={x+5} y1={5} x2={x-5} y2={15} stroke="#71717A" strokeWidth="2" />
              </g>
            );
          } else if (pos === 0) {
            return (
              <circle 
                key={`pos-${idx}`} 
                cx={x} 
                cy={20} 
                r="5" 
                fill="none" 
                stroke="#71717A" 
                strokeWidth="1.5" 
              />
            );
          } else {
            return (
              <circle 
                key={`pos-${idx}`} 
                cx={x} 
                cy={20 + pos * 20} 
                r="6" 
                fill="#8B5CF6" 
              />
            );
          }
        })}
      </svg>
    </div>
  );
}
