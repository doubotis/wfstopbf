import proj4 from 'proj4';
proj4.defs('EPSG:3812', '+proj=lcc +lat_0=50.797815 +lon_0=4.35921583333333 +lat_1=49.8333333333333 +lat_2=51.1666666666667 +x_0=649328 +y_0=665262 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');


// Fonction pour convertir les coordonnées selon le type de géométrie
function convertCoordinates(coords: number[] | number[][], fromCRS: string): number[] | number[][] {
    if (typeof coords[0] === 'number') {
        // Point : [x, y]
        return proj4(fromCRS, 'EPSG:4326', coords as number[]);
    } else {
        // Ligne ou polygone : liste de coordonnées ou liste de listes de coordonnées
        return (coords as number[][]).map(coord => convertCoordinates(coord, fromCRS) as number[]);
    }
}

// Fonction pour traiter chaque géométrie du GeoJSON
function convertGeometry(geometry: any, fromCRS: string) {
    switch (geometry.type) {
        case 'Point':
        case 'LineString':
        case 'Polygon':
            geometry.coordinates = convertCoordinates(geometry.coordinates, fromCRS);
            break;
        case 'MultiPoint':
        case 'MultiLineString':
        case 'MultiPolygon':
            geometry.coordinates = geometry.coordinates.map((coords: number[] | number[][]) =>
                convertCoordinates(coords, fromCRS)
            );
            break;
        case 'GeometryCollection':
            geometry.geometries.forEach(convertGeometry);
            break;
        default:
            console.error(`Type de géométrie non pris en charge: ${geometry.type}`);
    }
}

// Fonction pour convertir toutes les géométries d'un GeoJSON
function convertGeoJSON(geojson: any, fromCRS: string) {
    geojson.crs.properties.name = 'urn:ogc:def:crs:EPSG::4326';
    geojson.features.forEach((feature: { geometry: any; }) => {
        convertGeometry(feature.geometry, fromCRS);
    });
    return geojson;
}

export {
    convertGeoJSON
}