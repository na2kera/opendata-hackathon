"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import styles from './GoogleMap.module.css'; // モーダルのスタイル用にCSSをインポート

export default function GoogleMap({ geojson_data }: { geojson_data: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initMap = () => {
      const map = new (window as any).google.maps.Map(
        document.getElementById("map"),
        {
        center: { lat :geojson_data.geo_json.features[0].geometry.coordinates[1], lng: geojson_data.geo_json.features[0].geometry.coordinates[0] }, // Tokyo coordinates
          zoom: 14,
        }
      );
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          new (window as any).google.maps.Marker({
            position: pos,
            map: map,
            title: "Your location",
            icon: {
                url: "https://maps.google.com/mapfiles/ms/micons/woman.png", // カスタムアイコンのURL
                scaledSize: new (window as any).google.maps.Size(40, 40), // 必要に応じてサイズを調整
              },
          });
      });
      // GeoJSONデータを地図に追加
      if (geojson_data && geojson_data && geojson_data.geo_json) {
        map.data.addGeoJson(geojson_data.geo_json);
      }}

      // アイコンの色を設定する関数
    //   https://www.single-life.tokyo/google-maps%EF%BC%88%E3%82%B0%E3%83%BC%E3%82%B0%E3%83%AB%E3%83%9E%E3%83%83%E3%83%97%EF%BC%89%E3%81%A7%E4%BD%BF%E3%81%88%E3%82%8B%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3/
      const getIcon = (color: string) => {
        return {
          url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        };
      };
      map.data.setStyle({
                icon: getIcon("red"), // 初期色は青
              });
      // ピンがクリックされたときのイベントリスナーを追加
      map.data.addListener("click", (event: any) => {
        const feature = event.feature;
        const description = feature.getProperty("gx_media_links");
        const color = feature.getProperty("marker-color"); // `marlker-color` を `marker-color` に修正
        const isClicked = feature.getProperty("clicked");
        console.log(feature);
        if (description) {
          setModalImage(description); // モーダルに表示する画像を設定
          setModalOpen(true); // モーダルを開く
        }

        // if (isClicked) {
          map.data.overrideStyle(feature, { icon: getIcon("blue") }); // ここはgeojsonから取得する必要あり

        // }
      });
    };

    // Google Maps APIがロード済みかチェック
    if ((window as any).google && (window as any).google.maps) {
      initMap();
    } else {
      (window as any).initMap = initMap;
    }
  }, [geojson_data]);

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(undefined);
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
        async
        defer
        onLoad={() => {
          if ((window as any).initMap) {
            (window as any).initMap();
          }
        }}
      />
      <div id="map" style={{ width: "100%", height: "600px" }}></div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Description Image" className={styles.modalImage} />
            <button className={styles.closeButton} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
