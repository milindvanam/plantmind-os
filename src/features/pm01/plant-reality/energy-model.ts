import type { Pm01EnergyConfiguration, Pm01EnergyState } from "../contracts/energy";

const SECONDS_PER_DAY = 86_400;

export function createEnergyConfiguration(
  overrides: Partial<Omit<Pm01EnergyConfiguration, "variableElectricityKwhPerTonne">> = {}
): Pm01EnergyConfiguration {
  const base = {
    healthyBaselineKwhEquivalentPerTonne: 410,
    idleElectricityKwhPerDay: 600,
    steamTonnesPerTonne: 0.25,
    steamKwhEquivalentPerTonne: 650,
    coolingKwhEquivalentPerTonne: 55,
    compressedAirNm3PerTonne: 100,
    compressedAirKwhPerNm3: 0.11,
    historySampleSeconds: 300,
    ...overrides
  };
  const variableElectricityKwhPerTonne =
    base.healthyBaselineKwhEquivalentPerTonne -
    base.idleElectricityKwhPerDay / 100 -
    base.steamTonnesPerTonne * base.steamKwhEquivalentPerTonne -
    base.coolingKwhEquivalentPerTonne -
    base.compressedAirNm3PerTonne * base.compressedAirKwhPerNm3;
  if (variableElectricityKwhPerTonne < 0)
    throw new Error("PM-01 energy baseline is lower than configured utility components");
  return { ...base, variableElectricityKwhPerTonne };
}

export const PM01_HEALTHY_ENERGY_CONFIGURATION = createEnergyConfiguration();

export function createEnergyState(): Pm01EnergyState {
  return {
    electricityKwh: 0,
    steamTonnes: 0,
    coolingKwhEquivalent: 0,
    compressedAirNm3: 0,
    compressedAirKwhEquivalent: 0,
    totalEnergyKwhEquivalent: 0,
    energyPerTonne: null
  };
}

export function accumulateEnergy(
  state: Pm01EnergyState,
  stepSeconds: number,
  reactorProductTonnes: number,
  finishedTonnes: number,
  packagedTonnes: number,
  cumulativeProductionTonnes: number,
  configuration: Pm01EnergyConfiguration = PM01_HEALTHY_ENERGY_CONFIGURATION
): Pm01EnergyState {
  const electricityKwh =
    state.electricityKwh +
    (configuration.idleElectricityKwhPerDay * stepSeconds) / SECONDS_PER_DAY +
    configuration.variableElectricityKwhPerTonne * reactorProductTonnes;
  const steamTonnes = state.steamTonnes + configuration.steamTonnesPerTonne * reactorProductTonnes;
  const coolingKwhEquivalent =
    state.coolingKwhEquivalent + configuration.coolingKwhEquivalentPerTonne * finishedTonnes;
  const compressedAirNm3 =
    state.compressedAirNm3 + configuration.compressedAirNm3PerTonne * packagedTonnes;
  const compressedAirKwhEquivalent = compressedAirNm3 * configuration.compressedAirKwhPerNm3;
  const totalEnergyKwhEquivalent =
    electricityKwh +
    steamTonnes * configuration.steamKwhEquivalentPerTonne +
    coolingKwhEquivalent +
    compressedAirKwhEquivalent;
  return {
    electricityKwh,
    steamTonnes,
    coolingKwhEquivalent,
    compressedAirNm3,
    compressedAirKwhEquivalent,
    totalEnergyKwhEquivalent,
    energyPerTonne:
      cumulativeProductionTonnes === 0
        ? null
        : totalEnergyKwhEquivalent / cumulativeProductionTonnes
  };
}
