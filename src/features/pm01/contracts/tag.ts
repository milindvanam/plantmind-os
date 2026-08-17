export type Pm01TagQuality = "GOOD" | "UNCERTAIN" | "BAD" | "STALE";
export type Pm01TagDataType = "number" | "boolean" | "state";

export type Pm01OperatingBand = Readonly<{
  minimum: number;
  maximum: number;
}>;

export type Pm01TagDefinition = Readonly<{
  id: string;
  assetId: string;
  name: string;
  description: string;
  measurement: string;
  engineeringUnit: string;
  dataType: Pm01TagDataType;
  normalRange: Pm01OperatingBand | null;
  warningRange: Pm01OperatingBand | null;
  alarmRange: Pm01OperatingBand | null;
  samplingIntervalSeconds: number;
}>;

export type Pm01ObservableTagValue = Readonly<{
  tagId: string;
  value: number | boolean | string;
  timestamp: string;
  quality: Pm01TagQuality;
}>;
