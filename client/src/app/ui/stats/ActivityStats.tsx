"use client";

import { Activity } from "@/lib/schema";
import { memo, useCallback, useEffect, useState } from "react";
import DataChart from "../activity/DataChart";
import { enrichedPointList, getClosestPoint } from "@/lib/utils";
import { MapContainer } from "react-leaflet/MapContainer";
import { Marker } from "react-leaflet/Marker";
import { TileLayer } from "react-leaflet/TileLayer";
import { CircleMarker, Polyline, ScaleControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useBounds, useFitBounds, useZoom } from "@/app/hooks/useLeaflet";
import { PointStats } from "@/types/activity";
import { fetchActivitiesWithPointsInBounds } from "@/lib/dataClient";
import { useApi } from "@/app/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ZOOM_THRESHOLD = 10;
type EnrichedActivity = Omit<Activity, "points"> & { points: PointStats[] };
type HoverStatus = "hovered" | "dimmed" | "idle";

type HeatMapField = {
  field: keyof Pick<PointStats, "speed" | "elevation" | "heartrate">;
  unit: string;
};

const HEATMAP_OPTIONS: HeatMapField[] = [
  { field: "speed", unit: "km/h" },
  { field: "elevation", unit: "m" },
  { field: "heartrate", unit: "bpm" },
];

function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  useFitBounds(points);
  return null;
}

const ActivityPolylines = memo(
  ({
    points,
    status,
    heatMapField,
  }: {
    points: PointStats[];
    status: HoverStatus;
    heatMapField: { field: keyof PointStats; unit: string };
  }) => {
    return (
      <>
        {points.map((point, i) =>
          i > 0 ? (
            <Polyline
              key={point.id}
              positions={[
                [points[i - 1]!.lat, points[i - 1]!.lng],
                [point.lat, point.lng],
              ]}
              weight={status === "dimmed" ? 2 : 4}
              pathOptions={{
                opacity: status === "dimmed" ? 0.1 : 1,
                color:
                  status === "dimmed"
                    ? "gray"
                    : String(
                        point[
                          (heatMapField.field + "Color") as keyof PointStats
                        ],
                      ),
              }}
            />
          ) : null,
        )}
      </>
    );
  },
);

function MapContent({
  activityList,
  handleHover,
  hoveredActivity,
  heatMapField,
}: {
  activityList: Activity[];
  handleHover: (point: PointStats | null, activity?: Activity | null) => void;
  hoveredActivity: Activity | null;
  heatMapField: { field: keyof PointStats; unit: string };
}) {
  const [activityListInBounds, setActivityListInBounds] = useState<
    EnrichedActivity[]
  >([]);
  const apiFetch = useApi();
  const zoom = useZoom();
  const bounds = useBounds();

  useEffect(() => {
    if (zoom >= ZOOM_THRESHOLD) {
      fetchActivitiesWithPointsInBounds(apiFetch, {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }).then((activities) =>
        setActivityListInBounds(
          activities.map((activity) => ({
            ...activity,
            points: enrichedPointList(activity.points!),
          })),
        ),
      );
    }
  }, [zoom, bounds]);

  console.log("Activities in bounds:", activityListInBounds);

  return (
    <>
      {zoom < ZOOM_THRESHOLD ? (
        <MarkerClusterGroup showCoverageOnHover={false}>
          {activityList.map(
            (a) =>
              a.startLat &&
              a.startLng && (
                <Marker key={a.id} position={[a.startLat, a.startLng]} />
              ),
          )}
        </MarkerClusterGroup>
      ) : (
        activityListInBounds.length &&
        activityListInBounds.map((activity) => (
          <div key={activity.id}>
            <ActivityPolylines
              points={activity.points}
              heatMapField={heatMapField}
              status={
                hoveredActivity === null
                  ? "idle"
                  : hoveredActivity.id === activity.id
                    ? "hovered"
                    : "dimmed"
              }
            />
            <Polyline
              positions={activity.points}
              color="transparent"
              weight={20}
              eventHandlers={{
                mousemove: (e) => {
                  handleHover(
                    getClosestPoint(
                      e.latlng.lat,
                      e.latlng.lng,
                      activity.points,
                    ),
                    activity,
                  );
                },
              }}
            />
          </div>
        ))
      )}
    </>
  );
}

export default function ActivityStats({
  activityList,
}: {
  activityList: Activity[];
}) {
  const [heatMapField, setHeatMapField] = useState<{
    field: keyof PointStats;
    unit: string;
  }>({ field: "speed", unit: "km/h" });
  const [hoveredPoint, setHoveredPoint] = useState<PointStats | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);
  const handleHover = useCallback(
    (point: PointStats | null, activity?: Activity | null) => {
      setHoveredPoint(point);
      if (activity) {
        setHoveredActivity(activity);
      }
    },
    [],
  );

  return (
    <div className="flex flex-col gap-1 mt-3">
      <div className="flex gap-2">
        {HEATMAP_OPTIONS.map(({ field, unit }) => (
          <Button
            key={field}
            variant={heatMapField.field === field ? "default" : "outline"}
            className="cursor-pointer"
            size="sm"
            onClick={() => setHeatMapField({ field, unit })}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Button>
        ))}
      </div>

      <div className="relative">
        {hoveredActivity && (
          <div className="absolute bottom-8 left-2 z-[1000] pointer-events-none">
            <Card className="p-3 shadow-lg text-sm min-w-48">
              <p className="font-semibold">{hoveredActivity.name}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {hoveredActivity.date} ·{" "}
                {(hoveredActivity.distance / 1000).toFixed(1)} km ·{" "}
                {hoveredActivity.elevationGain} m d+
              </p>
            </Card>
          </div>
        )}
        <MapContainer
          className="markercluster-map"
          center={[51.0, 19.0]}
          zoom={4}
          maxZoom={18}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <FitBounds
            points={activityList.flatMap((a) => [
              { lat: a.startLat, lng: a.startLng },
            ])}
          />

          <MapContent
            activityList={activityList}
            handleHover={handleHover}
            hoveredActivity={hoveredActivity}
            heatMapField={heatMapField}
          />

          {hoveredPoint && (
            <CircleMarker
              center={[hoveredPoint.lat, hoveredPoint.lng]}
              radius={8}
              pathOptions={{
                color: "#fff",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          )}

          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>
      </div>

      <DataChart
        pointList={(hoveredActivity?.points ?? []) as PointStats[]}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="elevation"
        unit="m"
      />
    </div>
  );
}
