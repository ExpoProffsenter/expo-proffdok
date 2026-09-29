import React, { useEffect, useRef } from "react";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { BrowserMultiFormatReader } from "@zxing/browser";

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
        const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, BARCODE_FORMATS]]);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 250 });
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        // Tillatelsen kan bli gitt etter at brukeren allerede har lukket skanneren.
        if (finished) {
          cameraStream.getTracks().forEach((track) => track.stop());
          cameraStream = null;
          return;
        }
        const controls = await reader.decodeFromStream(
          cameraStream,
          video,
          (result, _error, callbackControls) => {
            if (finished || !result) return;
            const code = result.getText().trim();
            if (!/^\d{8,14}$/.test(code)) return;
            stop(callbackControls);
            onScan(code);
          }
        );
        if (finished) stopControls(controls);
        else scannerControls = controls;
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
  }, [onScan, onCancel, onError]);

  return (
    <div className="priceSearchScanner" aria-label="Strekkodeskanner">
      <video ref={videoRef} autoPlay muted playsInline aria-label="Kameravisning for strekkode" />
      <p>Hold strekkoden rolig innenfor kamerabildet.</p>
      <button type="button" className="secondary" onClick={onCancel}>Avbryt skanning</button>
    </div>
  );
}
