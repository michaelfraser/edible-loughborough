import params from '@params';

window.addEventListener('load', function () {
    // Initialize the map centered on Loughborough
    const map = L.map('map').setView([52.7684, -1.2047], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(map);

    const locations = params.locations.map(g => ({
        lat: g.lat,
        lng: g.lng,
        title: g.title
    }));

    // Add markers to the map
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        marker.bindPopup(`<b>${location.title}</b>`);
    });

    // Optional: Fit map to show all markers
    const group = L.featureGroup(locations.map(loc => L.marker([loc.lat, loc.lng])));
    map.fitBounds(group.getBounds().pad(0.1));
});