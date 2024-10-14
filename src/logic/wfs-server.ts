import axios from 'axios';
import proj4 from 'proj4';
import {convertGeoJSON} from "../utils/geojson-reproject";

export interface WFSParameters {
    host: string;
    layers: string[];
    version: string;
}

class WFSServer {
    params: WFSParameters

    constructor(params: WFSParameters) {
        this.params = params;
    }

    private _buildUrl = (tileZ: number, tileX: number, tileY: number) => {
        let url = this.params.host + `?service=WFS&request=GetFeature&version=${this.params.version}&typeNames=${this.params.layers.join(",")}&outputFormat=geojson&SRSNAME=urn:ogc:def:crs:EPSG::3812`;
        let mercatorBBOX = this._tileMercatorToBBOX(tileZ, tileX, tileY);
        let projectedBBOX = this._projectBBOXToCRS(mercatorBBOX, "EPSG:3812");
        url += `&bbox=${projectedBBOX},urn:ogc:def:crs:EPSG::3812`;
        console.log(url);
        return url;
    }

    private _tileMercatorToBBOX(tileZ: number, tileX: number, tileY: number) {
        const tileSize = 2 * 20037508.34 / Math.pow(2, tileZ);

        const minx = tileX * tileSize - 20037508.34;
        const maxx = (tileX + 1) * tileSize - 20037508.34;
        const miny = 20037508.34 - (tileY + 1) * tileSize;
        const maxy = 20037508.34 - tileY * tileSize;

        return [minx, miny, maxx, maxy];
    }

    private _projectBBOXToCRS(bbox: number[], crs: string) {
        proj4.defs('EPSG:3812', '+proj=lcc +lat_0=50.797815 +lon_0=4.35921583333333 +lat_1=49.8333333333333 +lat_2=51.1666666666667 +x_0=649328 +y_0=665262 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
        const minX = bbox[0];
        const minY = bbox[1];
        const maxX = bbox[2];
        const maxY = bbox[3];
        const [minLon, minLat] = proj4('EPSG:3857', crs, [minX, minY]);
        const [maxLon, maxLat] = proj4('EPSG:3857', crs, [maxX, maxY]);

        return [minLon, minLat, maxLon, maxLat];
    }

    private _projectGeoJSONFromCRS(geojson: any, crs: string) {
        convertGeoJSON(geojson, crs);
        return geojson;
    }

    queryTile = async (tileZ: number, tileX: number, tileY: number) => {
        try {
            const response = await axios.get(this._buildUrl(tileZ, tileX, tileY));
            let data = response.data;

            // Now we need to convert to Mercator projection.
            this._projectGeoJSONFromCRS(data, 'EPSG:3812');
            console.log("get " + data.features.length + " features");
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

export default WFSServer;