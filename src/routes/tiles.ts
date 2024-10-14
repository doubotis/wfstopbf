import {Request, Response, NextFunction} from "express";
//import vtpbf from 'vt-pbf';
import WFSServer from "../logic/wfs-server";
import geojsonvt from 'geojson-vt';
import vtpbf from 'vt-pbf';
import EsriServer from "../logic/esri-server";

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:z/:x/:y.pbf', async function(req: Request, res: Response, next: NextFunction) {
  const { z, x, y } = req.params;
  /*const wfsServer = new WFSServer({
    host: "https://ccff02.minfin.fgov.be/geoservices/arcgis/services/WMS/Cadastral_LayersWFS/MapServer/WFSServer",
    version: '2.0.0',
    layers: ['CL:District']
  });*/

  const esriServer = new EsriServer({
    host: "https://geoservices.wallonie.be/arcgis/rest/services/PLAN_REGLEMENT/CADMAP_PARCELLES/MapServer",
    layer: "0"
  });
  const geojson = await esriServer.queryTile(parseInt(z), parseInt(x), parseInt(y));
  if (geojson == null) {
    res.status(404).send();
    return;
  }

  //console.log(JSON.stringify(geojson));
  const tileIndex = geojsonvt(geojson, {
    maxZoom: 20,   // Niveau de zoom maximum
    extent: 4096,  // Taille de l'espace de chaque tuile
    buffer: 64,    // Tampon autour des tuiles
    tolerance: 3,  // Tolérance pour simplifier les géométries
  });
  //res.send(geojson);
  const tile = tileIndex.getTile(parseInt(z), parseInt(x), parseInt(y));
  if (!tile) {
    console.error(tileIndex);
    res.status(404).send(); // Aucun contenu (pas de tuile pour ce niveau de zoom)
    return;
  }

  const buff = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile });
  res.setHeader('Content-Type', 'application/x-protobuf');
  res.send(Buffer.from(buff));
});

module.exports = router;
