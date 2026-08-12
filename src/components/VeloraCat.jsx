import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const placeholderAsset = require('../../assets/cat-bowl-hero-v2.png');
const metadata = require('../../assets/velora-cat/metadata.json');

export const getCatMood = (budgetPercentage) => {
  const value = Math.max(0, Math.min(100, Number(budgetPercentage ?? 0)));
  if (value <= 0) return 'empty';
  if (value < 25) return 'sad';
  if (value < 50) return 'worried';
  if (value < 75) return 'normal';
  return 'happy';
};

export const getFoodLevelKey = (budgetPercentage) => {
  const value = Math.max(0, Math.min(100, Number(budgetPercentage ?? 0)));
  if (value <= 0) return '0';
  if (value <= 10) return '10';
  if (value <= 25) return '25';
  if (value <= 50) return '50';
  if (value <= 75) return '75';
  return '100';
};

const hasGlbAsset = (assetMap) => assetMap?.glb != null && typeof assetMap?.glb === 'string';

export default function VeloraCat({
  budgetPercentage = 100,
  mood,
  foodLevel,
  assetMap,
  style,
}) {
  const effectiveMood = mood || getCatMood(budgetPercentage);
  const effectiveFoodLevel = foodLevel != null ? Number(foodLevel) : Number(budgetPercentage);
  const foodLevelKey = getFoodLevelKey(effectiveFoodLevel);

  const currentAssetMap = assetMap ?? metadata;
  const useGlb = hasGlbAsset(currentAssetMap);

  const displayMood = useMemo(() => effectiveMood, [effectiveMood]);
  const displayFoodLevel = useMemo(() => foodLevelKey, [foodLevelKey]);

  // Future GLB integration will render the model here.
  // For now, this fallback keeps the app functional until velora-cat.glb is added.
  return (
    <View style={[styles.stage, style]}>
      {useGlb ? (
        <View style={styles.glbPlaceholder}>
          <Text style={styles.placeholderText}>Velora Cat 3D ready</Text>
          <Text style={styles.placeholderSubtext}>{`Mood: ${displayMood} · Food: ${displayFoodLevel}%`}</Text>
        </View>
      ) : (
        <View style={styles.fallbackContainer}>
          <Image source={placeholderAsset} resizeMode="contain" style={styles.fallbackImage} />
          <View style={styles.fallbackLabel}>
            <Text style={styles.fallbackLabelText}>{`Mood: ${displayMood}`}</Text>
            <Text style={styles.fallbackLabelText}>{`Food: ${displayFoodLevel}%`}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 280,
    height: 232,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glbPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(24, 16, 11, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  placeholderText: {
    color: '#f1d0a0',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#d8c3a2',
    fontSize: 12,
    textAlign: 'center',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
  fallbackLabel: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  fallbackLabelText: {
    color: '#fff',
    fontSize: 11,
  },
});
