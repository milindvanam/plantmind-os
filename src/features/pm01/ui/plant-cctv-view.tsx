"use client";

import Image from "next/image";
import { Camera, Circle, Grid2X2, MapPin, Radio, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { Pm01FactoryView } from "../contracts/visualization";

const CAMERAS = [
  {
    id: "CAM-01",
    label: "Receiving gate",
    location: "Raw-material unloading",
    image: "/plant-panoramas/chemical/01-receiving.png",
    nodeId: "receiving"
  },
  {
    id: "CAM-04",
    label: "Tank farm",
    location: "Bulk storage perimeter",
    image: "/plant-panoramas/chemical/02-storage.png",
    nodeId: "tank-farm"
  },
  {
    id: "CAM-09",
    label: "Reactor bay",
    location: "Production process area",
    image: "/plant-panoramas/chemical/03-production.png",
    nodeId: "reaction"
  },
  {
    id: "CAM-16",
    label: "Dispatch dock",
    location: "Warehouse loading ledge",
    image: "/plant-panoramas/chemical/07-loading-dock.png",
    nodeId: "dispatch"
  }
] as const;

function display(value: number, digits = 1) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(value);
}

export function PlantCctvView({ view }: { view: Pm01FactoryView }) {
  const [cameraId, setCameraId] = useState<(typeof CAMERAS)[number]["id"]>("CAM-09");
  const activeCamera = CAMERAS.find((camera) => camera.id === cameraId) ?? CAMERAS[0];
  const node = view.processNodes.find((item) => item.id === activeCamera.nodeId);
  const relatedAsset = useMemo(
    () => view.assets.find((asset) => node?.assetIds.includes(asset.id)),
    [node, view.assets]
  );
  const timestamp = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(new Date(view.run.timestamp));

  return (
    <section className="pm-cctv" aria-label="CCTV plant capture demonstration">
      <header>
        <div>
          <span>
            <Camera size={14} /> CCTV OPERATIONS VIEW · REPRESENTATION
          </span>
          <h2>Plant visual surveillance</h2>
          <p>Representative camera captures with observable PM-01 context overlaid.</p>
        </div>
        <div className="pm-cctv-health">
          <ShieldCheck size={15} /> 16 / 16 cameras available
        </div>
      </header>

      <div className="pm-cctv-layout">
        <div className="pm-cctv-primary">
          <Image
            src={activeCamera.image}
            alt={`${activeCamera.label} CCTV representation`}
            fill
            priority
            sizes="75vw"
          />
          <div className="pm-cctv-rec">
            <Circle size={8} fill="currentColor" /> REC · REPRESENTATION
          </div>
          <time>{timestamp} IST</time>
          <div className="pm-cctv-camera-name">
            <strong>
              {activeCamera.id} · {activeCamera.label}
            </strong>
            <span>
              <MapPin size={11} /> {activeCamera.location}
            </span>
          </div>
          <aside aria-label="Current CCTV equipment context">
            <span>OBSERVABLE PROCESS CONTEXT</span>
            <strong>{relatedAsset?.id ?? node?.title ?? "Area view"}</strong>
            <div>
              <article>
                <small>Status</small>
                <b>{node?.status ?? "OFFLINE"}</b>
              </article>
              <article>
                <small>Throughput</small>
                <b>{display(node?.throughputTonnesPerHour ?? 0, 2)} T/h</b>
              </article>
              <article>
                <small>Inventory / WIP</small>
                <b>{display(node?.inventoryTonnes ?? 0)} T</b>
              </article>
              <article>
                <small>Plant rate</small>
                <b>{display(view.kpis.productionRateTonnesPerDay)} T/day</b>
              </article>
            </div>
          </aside>
        </div>

        <nav aria-label="CCTV camera selector">
          <div>
            <Grid2X2 size={14} /> Camera wall
          </div>
          {CAMERAS.map((camera) => (
            <button
              key={camera.id}
              className={camera.id === activeCamera.id ? "active" : ""}
              onClick={() => setCameraId(camera.id)}
              aria-pressed={camera.id === activeCamera.id}
            >
              <span className="pm-cctv-thumb">
                <Image src={camera.image} alt="" fill sizes="180px" />
              </span>
              <span>
                <strong>
                  {camera.id} · {camera.label}
                </strong>
                <small>
                  <Radio size={9} /> Available · demo feed
                </small>
              </span>
            </button>
          ))}
        </nav>
      </div>
      <p className="pm-cctv-boundary">
        Representative imagery and simulated observable data. No live CCTV stream, computer vision
        inference or hidden simulation ground truth.
      </p>
    </section>
  );
}
