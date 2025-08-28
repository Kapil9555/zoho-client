// components/WorldMap.js
"use client";
import dynamic from "next/dynamic";
const VectorMap = dynamic(() => import("@react-jvectormap/core").then(mod => mod.VectorMap), { ssr: false });
const worldMapData = dynamic(() => import("@react-jvectormap/world"), { ssr: false });

export default function WorldMap() {
  return (
    <div className="w-full h-80">
      <VectorMap
        map={"world_mill"}
        backgroundColor="transparent"
        zoomOnScroll={false}
        containerStyle={{ width: "100%", height: "100%" }}
        containerClassName="map"
        regionStyle={{
          initial: {
            fill: "#d1d5db",
          },
          hover: {
            fill: "#3E57A7",
          },
        }}
        series={{
          regions: [
            {
              values: {
                US: 298, IN: 200, CN: 180, RU: 150, DE: 100
              },
              scale: ["#e0f2fe", "#1d4ed8"],
              normalizeFunction: "polynomial",
            },
          ],
        }}
      />
    </div>
  );
}
