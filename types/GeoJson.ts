type Coordinate = [number, number, number];

type GeoJsonGeometryPoint = {
  type: "Point";
  coordinates: Coordinate;
};

type GeoJsonGeometryLineString = {
  type: "LineString";
  coordinates: Coordinate[];
};

type GeoJsonGeometry = GeoJsonGeometryPoint | GeoJsonGeometryLineString;

type GeoJsonFeatureProperties = {
  Name: string;
  description?: string;
  tessellate: number;
  extrude: number;
  visibility: number;
  gx_media_links?: string;
};

type GeoJsonFeature = {
  type: "Feature";
  properties: GeoJsonFeatureProperties;
  geometry: GeoJsonGeometry;
};

type GeoJsonCrs = {
  type: string;
  properties: {
    name: string;
  };
};

type GeoJson = {
  type: "FeatureCollection";
  name: string;
  crs: GeoJsonCrs;
  features: GeoJsonFeature[];
};

type Course = {
  id: number;
  created_at: string;
  geo_json: GeoJson;
  title: string;
  ward: string;
};
