"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function GoogleMap({ geojson_data }: { geojson_data: any }) {
  useEffect(() => {
    console.log(geojson_data[0].geo_json);
    const initMap = () => {
      const map = new (window as any).google.maps.Map(
        document.getElementById("map"),
        {
          center: { lat: 35.6812, lng: 139.7671 }, // Tokyo coordinates
          zoom: 8,
        }
      );

      // GeoJSONデータを地図に追加
      if (geojson_data && geojson_data[0] && geojson_data[0].geo_json) {
        map.data.addGeoJson(geojson_data[0].geo_json);
      }

      // スタイルを設定（オプション）
      map.data.setStyle({
        fillColor: "green",
        strokeWeight: 1,
      });
    };

    if ((window as any).google) {
      initMap();
    } else {
      (window as any).initMap = initMap;
    }
  }, [geojson_data]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`}
        async
        defer
      />
      <div id="map" style={{ width: "100%", height: "400px" }}></div>
    </>
  );
}
