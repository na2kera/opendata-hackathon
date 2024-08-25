"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import styles from "./GoogleMap.module.css"; // モーダルのスタイル用にCSSをインポート
import { createClient } from "@/utils/supabase/client";

type Props = {
  geojson_data: any;
  profileData: Profile;
};

const GoogleMap: React.FC<Props> = ({ geojson_data, profileData }) => {
  // console.log(geojson_data.geo_json.features[0].properties.title);
  console.log(profileData);
  const supabase = createClient();
  const DISTANCE = 50;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false); // ローディング状態を管理するステート
  const [currentDistance, setCurrentDistance] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  function getCurrentPositionAsync() {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
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
    const lngDistance =
      abs_lng * 111320 * Math.cos(currentLocation.lat * (Math.PI / 180));

    const distance = Math.sqrt(latDistance ** 2 + lngDistance ** 2);

    return distance;
  }

  const getIcon = (color: string) => {
    return {
      url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
    };
  };
  useEffect(() => {
    const initMap = async () => {
      const mapInstance = new (window as any).google.maps.Map(
        document.getElementById("map"),
        {
          center: {
            lat: geojson_data.geo_json.features[0].geometry.coordinates[1],
            lng: geojson_data.geo_json.features[0].geometry.coordinates[0],
          }, // Tokyo coordinates
          zoom: 14,
        }
      );

      if (geojson_data && geojson_data.geo_json) {
        // まず、GeoJSONを地図に追加
        mapInstance.data.addGeoJson(geojson_data.geo_json);

        // その後でスタイルを適用

        mapInstance.data.setStyle((feature: google.maps.Data.Feature) => {
          const featureTitle = feature.getProperty("title");

          // profileDataのtitleと一致するかチェック
          const matchingProfile = profileData.visited_pin_ids?.find(
            (profile) => profile === featureTitle
          );

          if (matchingProfile) {
            // 一致するtitleがあればアイコンを青に変更
            return { icon: getIcon("blue") };
          } else {
            // 一致しない場合はアイコンを赤に変更
            return { icon: getIcon("red") };
          }
        });
      }
      // アイコンの色を設定する関数
      //   https://www.single-life.tokyo/google-maps%EF%BC%88%E3%82%B0%E3%83%BC%E3%82%B0%E3%83%AB%E3%83%9E%E3%83%83%E3%83%97%EF%BC%89%E3%81%A7%E4%BD%BF%E3%81%88%E3%82%8B%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3/

      mapInstance.data.addListener("click", async (event: any) => {
        setLoading(true); // ローディング状態をtrueに設定
        try {
          const feature = event.feature;

          console.log("feature", feature.getProperty("title"));
          const color = feature.getProperty("marker-color"); // `marlker-color` を `marker-color` に修正
          const isClicked = feature.getProperty("clicked");
          const title = feature.getProperty("title");
          setTitle(title);
          const description = feature.getProperty("gx_media_links");
          if (
            profileData.visited_pin_ids?.find((visited) => visited === title)
          ) {
            setIsVisited(true);
          } else {
            setIsVisited(false);
            const currentLocation = await getCurrentPositionAsync();
            const distance = calcDistance(feature, currentLocation);
            if (distance < DISTANCE) {
              setCurrentDistance(true);
            } else {
              setCurrentDistance(false);
            }
            console.log("Distance in meters:", distance);
          }
          if (description) {
            setModalImage(description);
            setModalOpen(true);
          }

          //   mapInstance.data.overrideStyle(feature, { icon: getIcon("blue") });
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

  // スタンプ取得ボタンを押したときの処理
  const handleStamp = async () => {
    console.log("スタンプ取得！");
    console.log(title);

    // 既存のvisited_pin_idsに新しいtitleを追加
    const updatedVisitedPinIds = [
      ...(profileData.visited_pin_ids || []),
      title,
    ];

    //profileのvisited_pin_idsにtitleを追加
    const { data, error } = await supabase
      .from("profiles")
      .update({
        visited_pin_ids: updatedVisitedPinIds,
      })
      .eq("id", profileData.id);
    if (error) {
      console.error("更新エラー:", error);
    } else {
      console.log("スタンプ取得成功！");
      alert("スタンプ取得成功！");
      window.location.reload();
    }
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
      <div id="map" style={{ width: "100%", height: "99vh" }}></div>

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            位置情報を取得しています...
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Description Image"
              className={`${styles.modalImage} w-full h-auto max-h-[70vh] object-contain mb-4`}
            />
            <div className="flex justify-between items-center w-full">
              {isVisited ? (
                <p className="text-blue-500">スタンプ取得済み</p>
              ) : currentDistance ? (
                <button
                  onClick={handleStamp}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-4 transition duration-300 ease-in-out"
                >
                  スタンプ取得！
                </button>
              ) : (
                <p className="text-red-500">有効範囲外</p>
              )}
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleMap;
