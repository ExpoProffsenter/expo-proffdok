import React, { useEffect, useRef, useState } from "react";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { applyCameraZoom, clampZoom, isSearchableBarcode, usableZoomRange } from "./barcodeCameraSettings.mjs";

const BARCODE_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.CODE_128,
];

function cameraErrorMessage(error) {
  if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
    return "Kameratilgang ble avvist. Tillat kamera i nettleseren, eller skriv EAN/GTIN manuelt.";
  }
  if (error?.name === "NotFoundError" || error?.name === "OverconstrainedError") {
    return "Fant ikke et tilgjengelig kamera. Skriv EAN/GTIN manuelt.";
  }
  if (error?.name === "NotReadableError") {
    return "Kameraet er opptatt av en annen app. Lukk den, eller skriv EAN/GTIN manuelt.";
  }
  return "Kunne ikke starte kameraet. Skriv EAN/GTIN manuelt.";
}

function stopControls(controls) {
  try {
    const pending = controls?.stop?.();
    if (pending && typeof pending.catch === "function") pending.catch(() => {});
  } catch {
    // Frigjør videosporet direkte nedenfor også dersom biblioteket kaster.
  }
}

export default function PriceSearchBarcodeScanner({ onScan, onCancel, onError }) {
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [activeDeviceId, setActiveDeviceId] = useState("");
  const [cameras, setCameras] = useState([]);
  const [zoomRange, setZoomRange] = useState(null);
  const [zoomValue, setZoomValue] = useState(1);
  const [zoomMessage, setZoomMessage] = useState("");

  const changeZoom = async (event) => {
    const value = Number(event.target.value);
    const track = trackRef.current;
    if (!track || track.readyState !== "live") return;
    try {
      await applyCameraZoom(track, value);
      if (trackRef.current === track) {
        setZoomValue(value);
        setZoomMessage("");
      }
    } catch {
      if (trackRef.current === track) {
        setZoomRange(null);
        setZoomMessage("Kamerazoom er ikke tilgjengelig her. Hold litt større avstand og skriv koden manuelt ved behov.");
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    let finished = false;
    let scannerControls = null;
    let cameraStream = null;

    const stop = (callbackControls = null) => {
      finished = true;
      stopControls(callbackControls);
      if (scannerControls !== callbackControls) stopControls(scannerControls);
      scannerControls = null;
      if (trackRef.current === cameraStream?.getVideoTracks?.()[0]) trackRef.current = null;
      cameraStream?.getTracks?.().forEach((track) => track.stop());
      cameraStream = null;
      const stream = video?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };

    const cancelOnBackground = () => {
      stop();
      onCancel();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") cancelOnBackground();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", cancelOnBackground);

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API unavailable");
        }
        const hints = new Map([
          [DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS],
          [DecodeHintType.TRY_HARDER, true],
        ]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 250 });
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        // Tillatelsen kan bli gitt etter at brukeren allerede har lukket skanneren.
        if (finished) {
          cameraStream.getTracks().forEach((track) => track.stop());
          cameraStream = null;
          return;
        }
        const track = cameraStream.getVideoTracks()[0];
        trackRef.current = track;
        setActiveDeviceId(track.getSettings?.().deviceId || "");
        setZoomRange(null);
        setZoomMessage("");
        const range = usableZoomRange(track);
        if (range) {
          const initialZoom = clampZoom(2, range);
          try {
            await applyCameraZoom(track, initialZoom);
            if (finished) return;
            setZoomRange(range);
            setZoomValue(initialZoom);
          } catch {
            if (!finished) setZoomMessage("Kamerazoom er ikke tilgjengelig her. Hold litt større avstand og skriv koden manuelt ved behov.");
          }
        }
        const controls = await reader.decodeFromStream(
          cameraStream,
          video,
          (result, _error, callbackControls) => {
            if (finished || !result) return;
            const code = result.getText().trim();
            if (!isSearchableBarcode(code)) return;
            stop(callbackControls);
            onScan(code);
          }
        );
        if (finished) stopControls(controls);
        else {
          scannerControls = controls;
          try {
            const devices = await navigator.mediaDevices.enumerateDevices?.();
            if (!finished) setCameras((devices || []).filter((device) => device.kind === "videoinput" && device.deviceId));
          } catch {
            // Skanning med det aktive kameraet fungerer også uten kameravalg.
          }
        }
      } catch (error) {
        if (finished) return;
        stop();
        onError(cameraErrorMessage(error));
      }
    };

    void start();
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", cancelOnBackground);
      stop();
    };
  }, [onScan, onCancel, onError, selectedDeviceId]);

  return (
    <div className="priceSearchScanner" aria-label="Strekkodeskanner">
      <video ref={videoRef} autoPlay muted playsInline aria-label="Kameravisning for strekkode" />
      <p>Hold telefonen på avstand der strekene er skarpe. Bruk zoom for små koder og godt lys uten gjenskinn.</p>
      {cameras.length > 1 ? (
        <label className="priceSearchCameraChoice">
          Kamera
          <select value={selectedDeviceId || activeDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)}>
            {cameras.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Kamera ${index + 1}`}</option>
            ))}
          </select>
        </label>
      ) : null}
      {zoomRange ? (
        <label className="priceSearchZoomChoice">
          Zoom {zoomValue.toFixed(1)}×
          <input type="range" min={zoomRange.min} max={zoomRange.max} step={zoomRange.step} value={zoomValue} onChange={changeZoom} aria-label="Kamerazoom" />
        </label>
      ) : null}
      {zoomMessage ? <p role="status">{zoomMessage}</p> : null}
      <button type="button" className="secondary" onClick={onCancel}>Avbryt skanning</button>
    </div>
  );
}
