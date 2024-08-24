// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import { Loader } from '@googlemaps/js-api-loader';

// export default function GoogleMap({ geojson_data }: { geojson_data: any }) {
//   useEffect(() => {
//     const initMap = () => {
//       const map = new (window as any).google.maps.Map(
//         document.getElementById("map"),
//         {
//           center: { lat: 35.706248, lng: 139.683761 }, // Tokyo coordinates
//           zoom: 15,
//         }
//       );

//       // デフォルトのピンに似たカスタムアイコンを設定する関数
//       const getIcon = (color: string) => {
//         return {
//           url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`, //ここについては任意に設定可能
//           scale: 10,
//         };
//       };

//       // GeoJSONデータを地図に追加
//       if (geojson_data && geojson_data[0] && geojson_data[0].geo_json) {
//         map.data.addGeoJson(geojson_data[0].geo_json);
//       }
//       // 初期スタイルを設定（デフォルトのピンアイコンに似せたカスタムアイコンを使用）
//       map.data.setStyle({
//         icon: getIcon("red"), // 初期色は青
//       });

//       // ピンがクリックされたときのイベントリスナーを追加
//       map.data.addListener("click", (event: any) => {
//         const feature = event.feature;
//         const isClicked = feature.getProperty("clicked");

//         if (isClicked) {
//             console.log(feature)
//           feature.setProperty("clicked", false);
//           map.data.overrideStyle(feature, { icon: getIcon("red") }); 
//         } else {
//           feature.setProperty("clicked", true);
//           map.data.overrideStyle(feature, { icon: getIcon("blue") });
//         }
//       });
//     };

//     // Google Maps APIがロード済みかチェック
//     if ((window as any).google && (window as any).google.maps) {
//       initMap();
//     } else {
//       (window as any).initMap = initMap;
//     }
//   }, [geojson_data]);

//   return (
//     <>
//       <Script
//         src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
//         async
//         defer
//         onLoad={() => {
//           if ((window as any).initMap) {
//             (window as any).initMap();
//           }
//         }}
//       />
//       <div id="map" style={{ width: "100%", height: "600px" }}></div>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import styles from './GoogleMap.module.css'; // モーダルのスタイル用にCSSをインポート
import { getTextOfJSDocComment } from "typescript";

export default function GoogleMap({ geojson_data }: { geojson_data: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const initMap = () => {
      const map = new (window as any).google.maps.Map(
        document.getElementById("map"),
        {
          center: { lat: 35.706248, lng: 139.683761 }, // Tokyo coordinates
          zoom: 15,
        }
      );

      // GeoJSONデータを地図に追加
      if (geojson_data && geojson_data[6] && geojson_data[6].geo_json) {
        map.data.addGeoJson(geojson_data[6].geo_json);
      }
      console.log(geojson_data)

        const getIcon = (color: string) => {
            return{
                url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
            }
        }
      // ピンがクリックされたときのイベントリスナーを追加
      map.data.addListener("click", (event: any) => {
        const feature = event.feature;
        const description = feature.getProperty("gx_media_links");
        const color = feature.getProperty("marlker-color");
        const isClicked = feature.getProperty("clicked");
        console.log(feature)
        if (description) {
            // console.log(description)
          setModalImage(description); // モーダルに表示する画像を設定
          setModalOpen(true); // モーダルを開く
          map.data.overrideStyle(feature, { icon: getIcon(color) });
        }
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
    setModalImage(null);
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
