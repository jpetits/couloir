import L from "leaflet";

export const startLeafletIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg">                    
    <circle cx="12" cy="12" r="12" fill="#3b82f6"/>      
    <polygon points="8.5,7 18.5,12 8.5,17" fill="white"/>    
  </svg>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export const stopLeafletIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg">                    
    <circle cx="12" cy="12" r="12" fill="red"/>      
    <rect x="8" y="8" width="8" height="8" fill="white"/>    
  </svg>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const summitLeafletIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg">                    
    <circle cx="12" cy="12" r="12" fill="#fbbf24"/>      
    <polygon points="12,6 16,14 8,14" fill="white"/>    
  </svg>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
