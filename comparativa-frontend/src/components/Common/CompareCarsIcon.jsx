import React from 'react';

const CompareCarsIcon = ({ selected }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: 'auto' }}>
    <circle cx="12" cy="12" r="12" fill={selected ? 'var(--cherry-red)' : 'var(--racing-grey)'} />
    <rect x="6.5" y="10" width="11" height="5" rx="2" fill="white" stroke="white" strokeWidth="1.2" />
    <rect x="8.5" y="13.2" width="2.2" height="1.2" rx="0.6" fill={selected ? 'var(--cherry-red)' : 'var(--racing-grey)'} />
    <rect x="13.3" y="13.2" width="2.2" height="1.2" rx="0.6" fill={selected ? 'var(--cherry-red)' : 'var(--racing-grey)'} />
    <rect x="3.5" y="7" width="8" height="3.5" rx="1.5" fill="white" fillOpacity="0.7" stroke="white" strokeWidth="0.8" />
    <rect x="5.2" y="8.7" width="1.5" height="0.9" rx="0.45" fill={selected ? 'var(--cherry-red)' : 'var(--racing-grey)'} fillOpacity="0.7" />
    <rect x="8.1" y="8.7" width="1.5" height="0.9" rx="0.45" fill={selected ? 'var(--cherry-red)' : 'var(--racing-grey)'} fillOpacity="0.7" />
  </svg>
);

export default CompareCarsIcon; 