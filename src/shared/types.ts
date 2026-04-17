export type Vector3 = [number, number, number];

export type MarkerKind = "preset-hiro" | "image-tracking-unknown";

export type ContentItem = {
  id: string;
  title: string;
  description: string;
  markerAsset: string;
  markerKind: MarkerKind;
  modelUrl?: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
};

export type QuestArCapability = {
  hasNavigatorXR: boolean;
  supportsImmersiveAR: boolean | null;
  markerTrackingAvailable: boolean | null;
  notes: string[];
};
