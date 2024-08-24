"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import styles from './GoogleMap.module.css'; // モーダルのスタイル用にCSSをインポート

const DISTANCE = 50;
export default function GoogleMap({ geojson_data }: { geojson_data: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false); // ローディング状態を管理するステート
  const [currentDistance, setCurrentDistance] = useState(false);

  function getCurrentPositionAsync() {
    return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            maximumAge: 0,
          }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }

function calcDistance(feature: any, currentLocation: any) {
    const coordinates = feature.getGeometry().get();
    const lat = coordinates.lat();
    const lng = coordinates.lng();


    const abs_lat = Math.abs(currentLocation.lat - lat);
    const abs_lng = Math.abs(currentLocation.lng - lng);
      //メートル換算処理
    const latDistance = abs_lat * 111320;
    const lngDistance = abs_lng * 111320 * Math.cos(currentLocation.lat * (Math.PI / 180));

    const distance = Math.sqrt(latDistance ** 2 + lngDistance ** 2);

    return distance;
}

  useEffect(() => {
    const initMap = async () => {
      const mapInstance = new (window as any).google.maps.Map(
        document.getElementById("map"),
        {
          center: {
            lat: geojson_data.geo_json.features[0].geometry.coordinates[1],
            lng: geojson_data.geo_json.features[0].geometry.coordinates[0],
          },
          zoom: 14,
        }
      );

      if (geojson_data && geojson_data.geo_json) {
        mapInstance.data.addGeoJson(geojson_data.geo_json);
      }

      const getIcon = (color: string) => {
        return {
          url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
        };
      };

      mapInstance.data.setStyle({
        icon: getIcon("red"),
      });

      mapInstance.data.addListener("click", async (event: any) => {
        setLoading(true); // ローディング状態をtrueに設定
        try {
            const feature = event.feature;
            const currentLocation = await getCurrentPositionAsync();
            const description = feature.getProperty("gx_media_links");
            const distance = calcDistance(feature, currentLocation);

            if(distance<DISTANCE){
                setCurrentDistance(true);
            }
            console.log("Distance in meters:", distance);

            if (description) {
                setModalImage(description);
                setModalOpen(true);
            }
            // マーカーの色を青に変更(ここは本当はスタンプが押された時の処理)
          mapInstance.data.overrideStyle(feature, { icon: getIcon("blue") });
        } catch (error) {
          console.error("Error getting location", error);
        } finally {
          setLoading(false); // ローディング状態をfalseに設定
        }
      });
    };

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

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            位置情報を取得しています...
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Description Image" className={styles.modalImage} />
            <button className={styles.closeButton} onClick={closeModal}>Close</button>
            {
                !currentDistance ? (
                    <div className={styles.distancealert}>
                    <p>有効範囲外です</p>
                    </div>
                ):( <div className={styles.distancealert}>
                    <p>スタンプをおす</p>
                    </div>)
            }
          </div>
        </div>
      )}
    </>
  );
}
