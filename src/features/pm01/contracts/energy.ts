export type Pm01EnergyConfiguration = Readonly<{
  healthyBaselineKwhEquivalentPerTonne: number;
  idleElectricityKwhPerDay: number;
  variableElectricityKwhPerTonne: number;
  steamTonnesPerTonne: number;
  steamKwhEquivalentPerTonne: number;
  coolingKwhEquivalentPerTonne: number;
  compressedAirNm3PerTonne: number;
  compressedAirKwhPerNm3: number;
  historySampleSeconds: number;
}>;

export type Pm01EnergyState = Readonly<{
  electricityKwh: number;
  steamTonnes: number;
  coolingKwhEquivalent: number;
  compressedAirNm3: number;
  compressedAirKwhEquivalent: number;
  totalEnergyKwhEquivalent: number;
  energyPerTonne: number | null;
}>;

export type Pm01EnergyHistoryPoint = Readonly<{
  timestamp: string;
  electricityKwh: number;
  steamTonnes: number;
  coolingKwhEquivalent: number;
  compressedAirNm3: number;
  totalEnergyKwhEquivalent: number;
  energyPerTonne: number | null;
}>;
