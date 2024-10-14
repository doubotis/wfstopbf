import axios from "axios";

export interface ESRIParameters {
    host: string;
    layer: string;
}

class EsriServer {
    params: ESRIParameters

    constructor(params: ESRIParameters) {
        this.params = params;
    }

    private _buildUrl = (tileZ: number, tileX: number, tileY: number) => {
        let url = this.params.host + `/${this.params.layer}/query?geometryType=esriGeometryEnvelope&inSR=3857&outSR=4326&outFields=*&f=geojson`;
        let bbox = this._tileToBBOX(tileZ, tileX, tileY);
        url += `&geometry=${bbox}`;
        console.log(url);
        return url;
    }

    private _tileToBBOX(tileZ: number, tileX: number, tileY: number) {
        const tileSize = 2 * 20037508.34 / Math.pow(2, tileZ);

        const minx = tileX * tileSize - 20037508.34;
        const maxx = (tileX + 1) * tileSize - 20037508.34;
        const miny = 20037508.34 - (tileY + 1) * tileSize;
        const maxy = 20037508.34 - tileY * tileSize;

        return [minx, miny, maxx, maxy];
    }

    queryTile = async (tileZ: number, tileX: number, tileY: number) => {
        const response = await axios.get(this._buildUrl(tileZ, tileX, tileY));
        return response.data;
    }
}

export default EsriServer;