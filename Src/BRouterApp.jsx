import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const BRouterApp = () => {
  // ===== ÉTAT =====
  const [activeTab, setActiveTab] = useState('config');
  const [bikes, setBikes] = useState(() => {
    const saved = localStorage.getItem('brouter_bikes');
    return saved ? JSON.parse(saved) : getDefaultBikes();
  });
  const [selectedBike, setSelectedBike] = useState(() => {
    const saved = localStorage.getItem('brouter_selected_bike');
    return saved || 'vtt';
  });
  const [newBikeName, setNewBikeName] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeMetrics, setRouteMetrics] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [mapMode, setMapMode] = useState('select');
  const mapContainer = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  function getDefaultBikes() {
    return {
      vtt: {
        name: 'VTT',
        weight: 13,
        maxSpeed: 35,
        profile: 'trekking',
        description: 'Vélo tout terrain polyvalent'
      },
      gravel: {
        name: 'Gravel',
        weight: 11,
        maxSpeed: 40,
        profile: 'trekking',
        description: 'Gravel rapide et polyvalent'
      },
      route: {
        name: 'Route',
        weight: 8,
        maxSpeed: 45,
        profile: 'road',
        description: 'Vélo de route compétition'
      },
      cargo: {
        name: 'Cargo',
        weight: 25,
        maxSpeed: 30,
        profile: 'trekking',
        description: 'Vélo cargo lourd'
      },
      city: {
        name: 'City',
        weight: 16,
        maxSpeed: 35,
        profile: 'trekking',
        description: 'Vélo de ville confortable'
      },
      ebike: {
        name: 'E-Bike',
        weight: 24,
        maxSpeed: 45,
        profile: 'trekking',
        description: 'Vélo électrique'
      }
    };
  }

  const profiles = ['trekking', 'road', 'road-fast', 'trekking-fast', 'mtb', 'balance'];

  const saveBikes = (updatedBikes) => {
    setBikes(updatedBikes);
    localStorage.setItem('brouter_bikes', JSON.stringify(updatedBikes));
  };

  const addCustomBike = () => {
    if (!newBikeName.trim()) return;
    const id = newBikeName.toLowerCase().replace(/\s+/g, '-');
    const newBike = {
      [id]: {
        name: newBikeName,
        weight: 15,
        maxSpeed: 35,
        profile: 'trekking',
        description: 'Personnalisé'
      }
    };
    const updated = { ...bikes, ...newBike };
    saveBikes(updated);
    setSelectedBike(id);
    localStorage.setItem('brouter_selected_bike', id);
    setNewBikeName('');
  };

  const updateBike = (bikeId, field, value) => {
    const updated = {
      ...bikes,
      [bikeId]: { ...bikes[bikeId], [field]: value }
    };
    saveBikes(updated);
  };

  const deleteBike = (bikeId) => {
    if (Object.keys(bikes).length <= 1) {
      alert('Impossible de supprimer le dernier vélo');
      return;
    }
    const updated = { ...bikes };
    delete updated[bikeId];
    saveBikes(updated);
    if (selectedBike === bikeId) {
      const newSelected = Object.keys(updated)[0];
      setSelectedBike(newSelected);
      localStorage.setItem('brouter_selected_bike', newSelected);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || mapInstance) return;

    const map = L.map(mapContainer.current).setView([47.0, 2.0], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    L.tileLayer(
      'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=0e137e1cf23424d768cfb6be4ce97560',
      {
        attribution: '© Thunderforest, © OpenStreetMap',
        maxZoom: 19,
        opacity: 0.6
      }
    ).addTo(map);

    map.on('click', (e) => {
      if (mapMode !== 'select') return;
      const { lat, lng } = e.latlng;
      addWaypoint(lat, lng);
    });

    setMapInstance(map);

    return () => {
      map.remove();
    };
  }, []);

  const addWaypoint = (lat, lng) => {
    const newWaypoint = { lat, lng, id: Date.now() };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (id) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  const updateWaypoint = (id, lat, lng) => {
    setWaypoints(waypoints.map(w => (w.id === id ? { ...w, lat, lng } : w)));
  };

  useEffect(() => {
    if (!mapInstance) return;

    markersRef.current.forEach(m => mapInstance.removeLayer(m));
    markersRef.current = [];

    waypoints.forEach((wp, idx) => {
      const icon = L.divIcon({
        html: `<div style="
          background: ${idx === 0 ? '#22c55e' : idx === waypoints.length - 1 ? '#ef4444' : '#3b82f6'};
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${idx + 1}</div>`,
        iconSize: [32, 32]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon, draggable: true })
        .addTo(mapInstance)
        .on('drag', (e) => {
          const { lat, lng } = e.target.getLatLng();
          updateWaypoint(wp.id, lat, lng);
        });

      markersRef.current.push(marker);
    });

    if (waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints.map(w => [w.lat, w.lng]));
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapInstance, waypoints]);

  const calculateRoute = async () => {
    if (waypoints.length < 2) {
      alert('Au minimum 2 waypoints requis');
      return;
    }

    setIsRouting(true);
    try {
      const bike = bikes[selectedBike];
      const coords = waypoints.map(w => `${w.lng},${w.lat}`).join('|');
      const url = `https://brouter.de/brouter?lonlats=${coords}&profile=${bike.profile}&format=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        alert('Impossible de calculer la route');
        setIsRouting(false);
        return;
      }

      const feature = data.features[0];
      const coords_route = feature.geometry.coordinates;

      if (polylineRef.current) {
        mapInstance.removeLayer(polylineRef.current);
      }

      const polyline = L.polyline(
        coords_route.map(c => [c[1], c[0]]),
        { color: '#06b6d4', weight: 3, opacity: 0.8 }
      ).addTo(mapInstance);

      polylineRef.current = polyline;

      const distance = calculateDistance(coords_route);
      const duration = calculateDuration(distance, bike.maxSpeed);

      setRoute({ coordinates: coords_route, geojson: feature });
      setRouteMetrics({
        distance: distance.toFixed(1),
        duration: duration.toFixed(0)
      });

      setMapMode('view');
    } catch (error) {
      alert('Erreur: ' + error.message);
    } finally {
      setIsRouting(false);
    }
  };

  const calculateDistance = (coords) => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lng1, lat1] = coords[i - 1];
      const [lng2, lat2] = coords[i];
      total += haversine(lat1, lng1, lat2, lng2);
    }
    return total;
  };

  const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calculateDuration = (distance, speed) => {
    return (distance / speed) * 60;
  };

  const exportGPX = () => {
    if (!route) {
      alert('Aucune route à exporter');
      return;
    }

    const bike = bikes[selectedBike];
    const gpx = generateGPX(route.coordinates, waypoints, bike.name);
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brouter-${new Date().toISOString().split('T')[0]}.gpx`;
    a.click();
  };

  const generateGPX = (coords, waypoints, bikeName) => {
    const wpts = waypoints.map((w, i) =>
      `  <wpt lat="${w.lat}" lon="${w.lng}"><name>WP ${i + 1}</name></wpt>`
    ).join('\n');

    const trkpts = coords.map(c =>
      `    <trkpt lat="${c[1]}" lon="${c[0]}"><ele>0</ele></trkpt>`
    ).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BRouter App" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Route ${bikeName}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wpts}
  <trk>
    <name>Route ${bikeName}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
  };

  const resetRoute = () => {
    setRoute(null);
    setRouteMetrics(null);
    setWaypoints([]);
    if (polylineRef.current && mapInstance) {
      mapInstance.removeLayer(polylineRef.current);
    }
    markersRef.current.forEach(m => {
      if (mapInstance) mapInstance.removeLayer(m);
    });
    markersRef.current = [];
    setMapMode('select');
  };

  const currentBike = bikes[selectedBike] || {};

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚴 BRouter Mobile</h1>
        <div style={styles.tabs}>
          {['config', 'map', 'route'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {})
              }}
            >
              {tab === 'config' && '⚙️ Config'}
              {tab === 'map' && '🗺️ Carte'}
              {tab === 'route' && '📊 Route'}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'config' && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Configuration Vélo</h2>

            <div style={styles.section}>
              <label style={styles.label}>Vélo</label>
              <select
                value={selectedBike}
                onChange={(e) => {
                  setSelectedBike(e.target.value);
                  localStorage.setItem('brouter_selected_bike', e.target.value);
                }}
                style={styles.select}
              >
                {Object.entries(bikes).map(([id, bike]) => (
                  <option key={id} value={id}>{bike.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.bikeCard}>
              <h3 style={styles.bikeCardTitle}>{currentBike.name}</h3>
              <p style={styles.bikeCardDesc}>{currentBike.description}</p>

              <div style={styles.bikeGrid}>
                <div style={styles.bikeField}>
                  <label>Poids (kg)</label>
                  <input
                    type="number"
                    value={currentBike.weight}
                    onChange={(e) =>
                      updateBike(selectedBike, 'weight', parseFloat(e.target.value))
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.bikeField}>
                  <label>Vitesse max (km/h)</label>
                  <input
                    type="number"
                    value={currentBike.maxSpeed}
                    onChange={(e) =>
                      updateBike(selectedBike, 'maxSpeed', parseFloat(e.target.value))
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.bikeField}>
                <label>Profil BRouter</label>
                <select
                  value={currentBike.profile}
                  onChange={(e) => updateBike(selectedBike, 'profile', e.target.value)}
                  style={styles.select}
                >
                  {profiles.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div style={styles.bikeField}>
                <label>Description</label>
                <input
                  type="text"
                  value={currentBike.description}
                  onChange={(e) =>
                    updateBike(selectedBike, 'description', e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              {Object.keys(bikes).length > 1 && (
                <button
                  onClick={() => deleteBike(selectedBike)}
                  style={styles.btnDanger}
                >
                  Supprimer ce vélo
                </button>
              )}
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Ajouter un vélo</h3>
              <div style={styles.addBikeForm}>
                <input
                  type="text"
                  placeholder="Nom du vélo"
                  value={newBikeName}
                  onChange={(e) => setNewBikeName(e.target.value)}
                  style={styles.input}
                />
                <button onClick={addCustomBike} style={styles.btnPrimary}>
                  + Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div style={styles.mapPanel}>
            <div style={styles.mapHeader}>
              <h2 style={styles.panelTitle}>Sélection des waypoints</h2>
              <span style={{
                ...styles.badge,
                background: mapMode === 'select' ? '#22c55e' : '#3b82f6'
              }}>
                {mapMode === 'select' ? '+ Click' : 'Calculée'}
              </span>
            </div>

            <div ref={mapContainer} style={styles.map} />

            {waypoints.length > 0 && (
              <div style={styles.waypointsList}>
                <h3 style={styles.sectionTitle}>Waypoints ({waypoints.length})</h3>
                {waypoints.map((w, idx) => (
                  <div key={w.id} style={styles.waypointItem}>
                    <span style={{ fontWeight: 'bold' }}>#{idx + 1}</span>
                    <span style={{ fontSize: '0.85rem', color: '#999' }}>
                      {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                    </span>
                    <button onClick={() => removeWaypoint(w.id)} style={styles.btnSmall}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {waypoints.length >= 2 && (
              <div style={styles.actions}>
                <button
                  onClick={calculateRoute}
                  disabled={isRouting}
                  style={{...styles.btnPrimary, opacity: isRouting ? 0.6 : 1}}
                >
                  {isRouting ? '⏳ Calcul...' : '🗺️ Calculer'}
                </button>
                <button onClick={() => setWaypoints([])} style={styles.btnSecondary}>
                  Réinitialiser
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'route' && (
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Résumé Route</h2>

            {route && routeMetrics ? (
              <>
                <div style={styles.metricsGrid}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricValue}>{routeMetrics.distance}</div>
                    <div style={styles.metricLabel}>km</div>
                  </div>
                  <div style={styles.metricCard}>
                    <div style={styles.metricValue}>{Math.floor(routeMetrics.duration / 60)}</div>
                    <div style={styles.metricLabel}>min</div>
                  </div>
                  <div style={styles.metricCard}>
                    <div style={styles.metricValue}>{currentBike.weight}</div>
                    <div style={styles.metricLabel}>kg</div>
                  </div>
                </div>

                <div style={styles.summary}>
                  <p><strong>Vélo :</strong> {currentBike.name}</p>
                  <p><strong>Profil :</strong> {currentBike.profile}</p>
                  <p><strong>Vitesse moyenne :</strong> {(parseFloat(routeMetrics.distance) / (parseFloat(routeMetrics.duration) / 60)).toFixed(1)} km/h</p>
                  <p><strong>Waypoints :</strong> {waypoints.length}</p>
                </div>

                <div style={styles.actions}>
                  <button onClick={exportGPX} style={styles.btnSuccess}>
                    📥 Exporter GPX
                  </button>
                  <button onClick={resetRoute} style={styles.btnSecondary}>
                    Nouvelle route
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                <p>Aucune route calculée</p>
                <button onClick={() => setActiveTab('map')} style={styles.btnPrimary}>
                  Aller à la carte
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: '#f8fafc',
    color: '#1e293b'
  },
  header: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    color: 'white',
    padding: '16px',
    borderBottom: '2px solid #0284c7'
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  tabs: {
    display: 'flex',
    gap: '8px'
  },
  tabBtn: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  tabBtnActive: {
    background: 'rgba(255,255,255,0.9)',
    color: '#0ea5e9'
  },
  content: {
    flex: 1,
    overflow: 'auto'
  },
  panel: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  mapPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  mapHeader: {
    padding: '16px',
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  panelTitle: {
    margin: '0',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  map: {
    flex: 1,
    width: '100%'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '12px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
  },
  bikeCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '20px'
  },
  bikeCardTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  bikeCardDesc: {
    margin: '0 0 16px 0',
    fontSize: '13px',
    color: '#64748b'
  },
  bikeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px'
  },
  bikeField: {
    marginBottom: '12px'
  },
  addBikeForm: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px'
  },
  waypointsList: {
    background: 'white',
    padding: '16px',
    borderTop: '1px solid #e2e8f0',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  waypointItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    background: '#f1f5f9',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '13px'
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '16px',
    background: 'white',
    borderTop: '1px solid #e2e8f0'
  },
  btnPrimary: {
    padding: '12px 16px',
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  btnSecondary: {
    padding: '12px 16px',
    background: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  btnSuccess: {
    padding: '12px 16px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  btnDanger: {
    padding: '10px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '12px',
    fontWeight: '600'
  },
  btnSmall: {
    padding: '4px 8px',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  },
  metricCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0ea5e9'
  },
  metricLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  },
  summary: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b'
  }
};

export default BRouterApp;
