"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import styles from "./GoogleMap.module.css"; // モーダルのスタイル用にCSSをインポート
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

type Props = {
  geojson_data: any;
  user: User;
};

const GoogleMap: React.FC<Props> = ({ geojson_data, user }) => {
  const supabase = createClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initMap = () => {
      const map = new (window as any).google.maps.Map(
        document.getElementById("map"),
        {
          center: {
            lat: geojson_data.geo_json.features[0].geometry.coordinates[1],
            lng: geojson_data.geo_json.features[0].geometry.coordinates[0],
          }, // Tokyo coordinates
          zoom: 14,
        }
      );

      // GeoJSONデータを地図に追加
      if (geojson_data && geojson_data && geojson_data.geo_json) {
        map.data.addGeoJson(geojson_data.geo_json);
      }

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
        const title = feature.getProperty("title");
        setTitle(title);

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

  // スタンプ取得ボタンを押したときの処理
  const handleStamp = async () => {
    console.log("スタンプ取得！");
    console.log(title);

    // プロフィールデータを取得
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("プロフィール取得エラー:", profileError);
      return;
    }

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
      <div id="map" style={{ width: "100%", height: "600px" }}></div>

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
              <button
                onClick={handleStamp}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-4 transition duration-300 ease-in-out"
              >
                スタンプ取得！
              </button>
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
