// The closed list of fields the owner may turn on as controls, per slice. Signed by the owner on 2026-10-31. Studio plane: no imports.
// Each is held by a product of its slice. The fields that are controls in every slice (brand, price, stock) are not here:
// they live in the picklist document itself, in its alwaysOn list.
// The all-products list (the /products page) offers the three slice lists together, once each. Nothing else is signed for it.
// Proof: tests/product-filtering/picklistRealData.test.ts holds the same lists written by hand and says NO when they differ.

const SLICES = {
  headphones: [
    "wearingStyle", "acousticDesign", "connectivity", "portable", "soundSignature", "impedanceOhms", "sensitivityDbMw",
    "freqResponseHz.min", "freqResponseHz.max", "microphone", "cableTermination", "detachableCable", "cableLengthM",
    "foldable", "ipxRating", "bluetoothCodecs", "anc", "batteryLifeHours.ancOff", "batteryLifeHours.ancOn", "driverType",
  ],
  audioElectronics: [
    "deviceType", "formFactor", "deviceConnectivity", "inputs", "outputs", "amplification", "balancedOutput",
    "powerOutputPerChannelW", "channelCount", "phonoStageBuiltIn", "trigger12v", "remoteControlIncluded",
    "maxSampleRateBitDepth", "dsdSupport", "dacChipsetFamily", "hiResCertification", "streamingPlatformSupport",
    "voiceAssistant", "multiroomSupport", "rackMountable19", "condition",
  ],
  accessories: [
    "accessoryType", "compatibleProductType", "cableFunction", "connectorTermination", "lengthM", "conductorMaterial",
    "balancedUnbalanced", "partType", "material", "weightCapacityKg", "adapterFunction",
  ],
};

export const PICKABLE = { ...SLICES, allProducts: Object.values(SLICES).flat() };
