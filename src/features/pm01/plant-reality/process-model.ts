import type {
  Pm01MaterialBalance,
  Pm01MaterialVector,
  Pm01ProcessConstraints,
  Pm01ProcessStageId,
  Pm01ProcessState,
  Pm01StageInventory
} from "../contracts/material";
import {
  addMaterial,
  materialVector,
  scaleMaterial,
  subtractMaterial,
  totalMaterialTonnes
} from "./material-vector";

const SECONDS_PER_DAY = 86_400;
const NOMINAL_PRODUCT_RATE_TONNES_PER_SECOND = 100 / SECONDS_PER_DAY;
export const PM01_PACKAGING_CAPACITY_TONNES_PER_HOUR = 5;

/** Recipe basis per nominal tonne of ASC-100 before defined process recovery losses. */
export const PM01_ASC100_RECIPE = materialVector({
  "RM-A": 0.62,
  "RM-B": 0.28,
  "RM-C": 0.12,
  CATALYST: 0.015,
  "PROCESS-WATER": 0.08
});

export const PM01_PROCESS_RECOVERY = {
  reaction: 0.89,
  separation: 0.995,
  finishing: 0.998
} as const;

export const PM01_HEALTHY_PROCESS_CONSTRAINTS: Pm01ProcessConstraints = {
  feedAvailability: 1,
  reactorCapacityFactor: 1,
  separationCapacityFactor: 1,
  finishingCapacityFactor: 1,
  packagingCapacityFactor: 1,
  dispatchDemandFactor: 1
};

const STAGE_CAPACITIES: Readonly<Record<Pm01ProcessStageId, number>> = {
  receiving: 1_200,
  "raw-material-storage": 3_000,
  "feed-preparation": 80,
  reaction: 80,
  separation: 60,
  finishing: 50,
  "intermediate-storage": 300,
  "released-product-storage": 300,
  packaging: 40,
  "finished-goods-storage": 500
};

function stage(stageId: Pm01ProcessStageId, material: Pm01MaterialVector): Pm01StageInventory {
  return { stageId, material, capacityTonnes: STAGE_CAPACITIES[stageId] };
}

function updateStage(
  state: Pm01ProcessState,
  stageId: Pm01ProcessStageId,
  material: Pm01MaterialVector
) {
  return {
    ...state.stages,
    [stageId]: stage(stageId, material)
  } satisfies Pm01ProcessState["stages"];
}

function availableCapacity(stageInventory: Pm01StageInventory) {
  return Math.max(0, stageInventory.capacityTonnes - totalMaterialTonnes(stageInventory.material));
}

function clampConstraint(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new Error(`PM-01 ${name} must be between 0 and 1`);
  return value;
}

function validateConstraints(constraints: Pm01ProcessConstraints) {
  for (const [name, value] of Object.entries(constraints)) clampConstraint(value, name);
  return constraints;
}

function transferAsc100(
  state: Pm01ProcessState,
  from: Pm01ProcessStageId,
  to: Pm01ProcessStageId,
  requestedTonnes: number
) {
  const source = state.stages[from];
  const destination = state.stages[to];
  const tonnes = Math.max(
    0,
    Math.min(requestedTonnes, source.material["ASC-100"], availableCapacity(destination))
  );
  const moved = materialVector({ "ASC-100": tonnes });
  const stages = updateStage(state, from, subtractMaterial(source.material, moved));
  return {
    tonnes,
    state: {
      ...state,
      stages: {
        ...stages,
        [to]: stage(to, addMaterial(destination.material, moved))
      }
    } satisfies Pm01ProcessState
  };
}

function transferRecipeToFeed(state: Pm01ProcessState, recipeUnits: number) {
  const source = state.stages["raw-material-storage"];
  const destination = state.stages["feed-preparation"];
  const recipeMass = totalMaterialTonnes(PM01_ASC100_RECIPE);
  const inventoryLimit = Math.min(
    ...Object.entries(PM01_ASC100_RECIPE)
      .filter(([, required]) => required > 0)
      .map(
        ([materialId, required]) =>
          source.material[materialId as keyof Pm01MaterialVector] / required
      )
  );
  const units = Math.max(
    0,
    Math.min(recipeUnits, inventoryLimit, availableCapacity(destination) / recipeMass)
  );
  const moved = scaleMaterial(PM01_ASC100_RECIPE, units);
  const stages = updateStage(
    state,
    "raw-material-storage",
    subtractMaterial(source.material, moved)
  );
  return {
    tonnes: totalMaterialTonnes(moved),
    material: moved,
    state: {
      ...state,
      stages: {
        ...stages,
        "feed-preparation": stage("feed-preparation", addMaterial(destination.material, moved))
      }
    } satisfies Pm01ProcessState
  };
}

function transferFeedToReactor(state: Pm01ProcessState, requestedTonnes: number) {
  const source = state.stages["feed-preparation"];
  const destination = state.stages.reaction;
  const available = totalMaterialTonnes(source.material);
  const tonnes = Math.max(0, Math.min(requestedTonnes, available, availableCapacity(destination)));
  const fraction = available === 0 ? 0 : tonnes / available;
  const moved = scaleMaterial(source.material, fraction);
  const stages = updateStage(state, "feed-preparation", subtractMaterial(source.material, moved));
  return {
    tonnes,
    state: {
      ...state,
      stages: {
        ...stages,
        reaction: stage("reaction", addMaterial(destination.material, moved))
      }
    } satisfies Pm01ProcessState
  };
}

function reactMaterial(state: Pm01ProcessState, requestedFeedTonnes: number) {
  const reactor = state.stages.reaction;
  const available = totalMaterialTonnes(reactor.material);
  const feedTonnes = Math.max(0, Math.min(requestedFeedTonnes, available));
  const separationCapacity = availableCapacity(state.stages.separation);
  const maximumFeedForDestination = separationCapacity / PM01_PROCESS_RECOVERY.reaction;
  const consumedTonnes = Math.min(feedTonnes, maximumFeedForDestination);
  if (consumedTonnes === 0) return { state, productTonnes: 0, lossTonnes: 0 };
  const consumed = scaleMaterial(reactor.material, consumedTonnes / available);
  const productTonnes = consumedTonnes * PM01_PROCESS_RECOVERY.reaction;
  const lossTonnes = consumedTonnes - productTonnes;
  const stages = updateStage(state, "reaction", subtractMaterial(reactor.material, consumed));
  return {
    productTonnes,
    lossTonnes,
    state: {
      ...state,
      stages: {
        ...stages,
        separation: stage(
          "separation",
          addMaterial(
            state.stages.separation.material,
            materialVector({ "ASC-100": productTonnes })
          )
        )
      }
    } satisfies Pm01ProcessState
  };
}

function moveReceivingToStorage(state: Pm01ProcessState, elapsedSeconds: number) {
  const receiving = state.stages.receiving;
  const storage = state.stages["raw-material-storage"];
  const maximumTonnes = (240 / 3600) * elapsedSeconds;
  const available = totalMaterialTonnes(receiving.material);
  const tonnes = Math.min(maximumTonnes, available, availableCapacity(storage));
  const moved = scaleMaterial(receiving.material, available === 0 ? 0 : tonnes / available);
  const stages = updateStage(state, "receiving", subtractMaterial(receiving.material, moved));
  return {
    ...state,
    stages: {
      ...stages,
      "raw-material-storage": stage("raw-material-storage", addMaterial(storage.material, moved))
    }
  } satisfies Pm01ProcessState;
}

function processWithRecovery(
  state: Pm01ProcessState,
  from: "separation" | "finishing",
  to: "finishing" | "intermediate-storage",
  requestedTonnes: number,
  recovery: number
) {
  const destinationCapacity = availableCapacity(state.stages[to]);
  const inputTonnes = Math.min(
    requestedTonnes,
    state.stages[from].material["ASC-100"],
    destinationCapacity / recovery
  );
  const outputTonnes = inputTonnes * recovery;
  const lossTonnes = inputTonnes - outputTonnes;
  const removed = materialVector({ "ASC-100": inputTonnes });
  const stages = updateStage(state, from, subtractMaterial(state.stages[from].material, removed));
  return {
    outputTonnes,
    lossTonnes,
    state: {
      ...state,
      stages: {
        ...stages,
        [to]: stage(
          to,
          addMaterial(state.stages[to].material, materialVector({ "ASC-100": outputTonnes }))
        )
      }
    } satisfies Pm01ProcessState
  };
}

export function createInitialProcessState(): Pm01ProcessState {
  const stages = {
    receiving: stage(
      "receiving",
      materialVector({
        "RM-A": 160,
        "RM-B": 75,
        "RM-C": 32,
        CATALYST: 4,
        "PROCESS-WATER": 25
      })
    ),
    "raw-material-storage": stage(
      "raw-material-storage",
      materialVector({
        "RM-A": 620,
        "RM-B": 280,
        "RM-C": 120,
        CATALYST: 15,
        "PROCESS-WATER": 80
      })
    ),
    "feed-preparation": stage("feed-preparation", scaleMaterial(PM01_ASC100_RECIPE, 20)),
    reaction: stage("reaction", scaleMaterial(PM01_ASC100_RECIPE, 20)),
    separation: stage("separation", materialVector({ "ASC-100": 20 })),
    finishing: stage("finishing", materialVector({ "ASC-100": 15 })),
    "intermediate-storage": stage("intermediate-storage", materialVector({ "ASC-100": 40 })),
    "released-product-storage": stage(
      "released-product-storage",
      materialVector({ "ASC-100": 35 })
    ),
    packaging: stage("packaging", materialVector({ "ASC-100": 10 })),
    "finished-goods-storage": stage("finished-goods-storage", materialVector({ "ASC-100": 50 }))
  } satisfies Pm01ProcessState["stages"];
  const openingInventoryTonnes = Object.values(stages).reduce(
    (total, inventory) => total + totalMaterialTonnes(inventory.material),
    0
  );
  return {
    elapsedSeconds: 0,
    stages,
    ledger: {
      openingInventoryTonnes,
      receivedTonnes: 0,
      dispatchedTonnes: 0,
      processLossTonnes: 0
    },
    lastTick: {
      feedPreparedMaterial: materialVector(),
      feedPreparedTonnes: 0,
      reactorProductTonnes: 0,
      reactionLossTonnes: 0,
      separatedTonnes: 0,
      separationLossTonnes: 0,
      finishedTonnes: 0,
      finishingLossTonnes: 0,
      packagedTonnes: 0,
      dispatchedTonnes: 0,
      processLossTonnes: 0
    }
  };
}

/** Add an explicit external receipt; this is the only way new mass enters after initialization. */
export function receiveMaterial(state: Pm01ProcessState, receipt: Pm01MaterialVector) {
  const tonnes = totalMaterialTonnes(receipt);
  if (tonnes > availableCapacity(state.stages.receiving))
    throw new Error("PM-01 receiving capacity exceeded");
  return {
    ...state,
    stages: updateStage(state, "receiving", addMaterial(state.stages.receiving.material, receipt)),
    ledger: { ...state.ledger, receivedTonnes: state.ledger.receivedTonnes + tonnes }
  } satisfies Pm01ProcessState;
}

export function advanceProcessState(
  state: Pm01ProcessState,
  elapsedSeconds: number,
  constraints: Pm01ProcessConstraints = PM01_HEALTHY_PROCESS_CONSTRAINTS
): Pm01ProcessState {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0)
    throw new Error("PM-01 process step must be a positive number of seconds");
  validateConstraints(constraints);
  const nominalProduct = NOMINAL_PRODUCT_RATE_TONNES_PER_SECOND * elapsedSeconds;
  let next = state;

  const dispatchTonnes = Math.min(
    nominalProduct * constraints.dispatchDemandFactor,
    next.stages["finished-goods-storage"].material["ASC-100"]
  );
  next = {
    ...next,
    stages: updateStage(
      next,
      "finished-goods-storage",
      subtractMaterial(
        next.stages["finished-goods-storage"].material,
        materialVector({ "ASC-100": dispatchTonnes })
      )
    )
  };

  const packaged = transferAsc100(
    next,
    "packaging",
    "finished-goods-storage",
    Math.min(
      nominalProduct * 1.2,
      (PM01_PACKAGING_CAPACITY_TONNES_PER_HOUR / 3600) * elapsedSeconds
    ) * constraints.packagingCapacityFactor
  );
  next = packaged.state;
  const toPackaging = transferAsc100(
    next,
    "released-product-storage",
    "packaging",
    nominalProduct * 1.05 * constraints.packagingCapacityFactor
  );
  next = toPackaging.state;
  const released = transferAsc100(
    next,
    "intermediate-storage",
    "released-product-storage",
    nominalProduct * 1.05
  );
  next = released.state;

  const finished = processWithRecovery(
    next,
    "finishing",
    "intermediate-storage",
    nominalProduct * constraints.finishingCapacityFactor,
    PM01_PROCESS_RECOVERY.finishing
  );
  next = finished.state;
  const separated = processWithRecovery(
    next,
    "separation",
    "finishing",
    nominalProduct * constraints.separationCapacityFactor,
    PM01_PROCESS_RECOVERY.separation
  );
  next = separated.state;

  const recipeMass = totalMaterialTonnes(PM01_ASC100_RECIPE);
  const reactorFeedRequest =
    (nominalProduct / PM01_PROCESS_RECOVERY.reaction) * constraints.reactorCapacityFactor;
  const reacted = reactMaterial(next, reactorFeedRequest);
  next = reacted.state;
  const reactorFeed = transferFeedToReactor(next, reactorFeedRequest);
  next = reactorFeed.state;
  const feed = transferRecipeToFeed(
    next,
    (reactorFeedRequest / recipeMass) * constraints.feedAvailability
  );
  next = moveReceivingToStorage(feed.state, elapsedSeconds);

  const tickLoss = reacted.lossTonnes + separated.lossTonnes + finished.lossTonnes;
  return {
    ...next,
    elapsedSeconds: state.elapsedSeconds + elapsedSeconds,
    ledger: {
      ...next.ledger,
      dispatchedTonnes: next.ledger.dispatchedTonnes + dispatchTonnes,
      processLossTonnes: next.ledger.processLossTonnes + tickLoss
    },
    lastTick: {
      feedPreparedMaterial: feed.material,
      feedPreparedTonnes: feed.tonnes,
      reactorProductTonnes: reacted.productTonnes,
      reactionLossTonnes: reacted.lossTonnes,
      separatedTonnes: separated.outputTonnes,
      separationLossTonnes: separated.lossTonnes,
      finishedTonnes: finished.outputTonnes,
      finishingLossTonnes: finished.lossTonnes,
      packagedTonnes: packaged.tonnes,
      dispatchedTonnes: dispatchTonnes,
      processLossTonnes: tickLoss
    }
  };
}

export function advanceProcessByTicks(
  state: Pm01ProcessState,
  ticks: number,
  stepSeconds: number,
  constraints: Pm01ProcessConstraints = PM01_HEALTHY_PROCESS_CONSTRAINTS
) {
  if (!Number.isInteger(ticks) || ticks < 0) throw new Error("PM-01 ticks must be non-negative");
  let next = state;
  for (let tick = 0; tick < ticks; tick += 1)
    next = advanceProcessState(next, stepSeconds, constraints);
  return next;
}

export function calculateMaterialBalance(
  state: Pm01ProcessState,
  toleranceTonnes = 1e-7
): Pm01MaterialBalance {
  const currentInventory = Object.values(state.stages).reduce(
    (total, inventory) => total + totalMaterialTonnes(inventory.material),
    0
  );
  const expectedTonnes = state.ledger.openingInventoryTonnes + state.ledger.receivedTonnes;
  const accountedTonnes =
    currentInventory + state.ledger.dispatchedTonnes + state.ledger.processLossTonnes;
  const imbalanceTonnes = expectedTonnes - accountedTonnes;
  return {
    expectedTonnes,
    accountedTonnes,
    imbalanceTonnes,
    isBalanced: Math.abs(imbalanceTonnes) <= toleranceTonnes
  };
}

export function getDerivedFactoryOutput(state: Pm01ProcessState) {
  return {
    dispatchedTonnes: state.ledger.dispatchedTonnes,
    finishedGoodsTonnes: state.stages["finished-goods-storage"].material["ASC-100"],
    packagedTonnes: state.stages.packaging.material["ASC-100"],
    releasedProductTonnes: state.stages["released-product-storage"].material["ASC-100"],
    intermediateProductTonnes: state.stages["intermediate-storage"].material["ASC-100"],
    workInProcessTonnes: ["feed-preparation", "reaction", "separation", "finishing"].reduce(
      (total, stageId) =>
        total + totalMaterialTonnes(state.stages[stageId as Pm01ProcessStageId].material),
      0
    )
  } as const;
}
