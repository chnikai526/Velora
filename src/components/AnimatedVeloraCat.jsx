import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

const AG = Animated.createAnimatedComponent(G);
const ACircle = Animated.createAnimatedComponent(Circle);

const moodRanges = [
  { name: 'empty', min: 0, max: 0 },
  { name: 'sad', min: 1, max: 24 },
  { name: 'worried', min: 25, max: 49 },
  { name: 'normal', min: 50, max: 74 },
  { name: 'happy', min: 75, max: 100 },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const moodConfig = {
  happy: { blinkInterval: 3600, breathDuration: 2400, tailRange: 12, headTilt: 1.8, earLift: -6, pawLift: 1.8, bodyCurve: 0.95, color: '#d8b48f' },
  normal: { blinkInterval: 4200, breathDuration: 2800, tailRange: 9, headTilt: 1.2, earLift: -4, pawLift: 1.3, bodyCurve: 0.92, color: '#d0a17b' },
  worried: { blinkInterval: 5200, breathDuration: 3200, tailRange: 6, headTilt: 0.7, earLift: -2, pawLift: 0.8, bodyCurve: 0.88, color: '#c59166' },
  sad: { blinkInterval: 6200, breathDuration: 3800, tailRange: 4, headTilt: 0.3, earLift: 0, pawLift: 0.4, bodyCurve: 0.84, color: '#b27d5d' },
  empty: { blinkInterval: 6800, breathDuration: 4200, tailRange: 2.5, headTilt: 0.1, earLift: 1.5, pawLift: 0.1, bodyCurve: 0.8, color: '#a87652' },
};

const getMood = (budgetPercentage) => {
  const value = clamp(Math.round(Number(budgetPercentage ?? 0)), 0, 100);
  return moodRanges.find((range) => value >= range.min && value <= range.max)?.name || 'happy';
};

const getFoodLevel = (budgetPercentage) => {
  const pct = clamp(Math.round(Number(budgetPercentage ?? 0)), 0, 100);
  if (pct <= 0) return 0;
  if (pct <= 10) return 10;
  if (pct <= 25) return 25;
  if (pct <= 50) return 50;
  if (pct <= 75) return 75;
  return 100;
};

const FOOD_PIECES = [
  { x: 125, y: 170, r: 6, rot: -8 },
  { x: 146, y: 162, r: 5, rot: 14 },
  { x: 167, y: 176, r: 5, rot: -10 },
  { x: 104, y: 182, r: 6, rot: 12 },
  { x: 137, y: 186, r: 4.5, rot: -12 },
  { x: 118, y: 160, r: 5.5, rot: 6 },
  { x: 156, y: 182, r: 5, rot: 8 },
  { x: 180, y: 170, r: 5.2, rot: -7 },
  { x: 148, y: 195, r: 4.8, rot: 10 },
  { x: 168, y: 192, r: 4.7, rot: -6 },
  { x: 115, y: 193, r: 5.3, rot: 9 },
  { x: 136, y: 200, r: 4.2, rot: -8 },
  { x: 155, y: 204, r: 4.6, rot: 5 },
  { x: 175, y: 201, r: 4.9, rot: -10 },
];

const getFoodOpacity = (level, index) => {
  const thresholds = [100, 90, 80, 70, 60, 50, 40, 30, 20, 15, 10, 5, 2, 1];
  return Math.min(1, Math.max(0, (level - thresholds[index]) / 18));
};

export default function AnimatedVeloraCat({ budgetPercentage = 100, mood, foodLevel, style }) {
  const currentMood = mood || getMood(budgetPercentage);
  const currentFoodLevel = foodLevel != null ? getFoodLevel(foodLevel) : getFoodLevel(budgetPercentage);
  const config = moodConfig[currentMood] || moodConfig.normal;

  const breath = useSharedValue(0);
  const blink = useSharedValue(1);
  const earMotion = useSharedValue(0);
  const tailMotion = useSharedValue(0);
  const headMotion = useSharedValue(0);
  const pawMotion = useSharedValue(0);
  const fillMotion = useSharedValue(currentFoodLevel);

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: config.breathDuration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: config.breathDuration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    blink.value = withRepeat(
      withSequence(
        withTiming(1, { duration: config.blinkInterval - 140, easing: Easing.linear }),
        withTiming(0.08, { duration: 80, easing: Easing.linear }),
        withTiming(1, { duration: 110, easing: Easing.linear })
      ),
      -1,
      false
    );

    earMotion.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2100, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    tailMotion.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    headMotion.value = withRepeat(
      withSequence(
        withTiming(1, { duration: config.breathDuration + 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: config.breathDuration + 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    pawMotion.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 3600, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [breath, blink, earMotion, headMotion, pawMotion, tailMotion, config.breathDuration, config.blinkInterval]);

  useEffect(() => {
    fillMotion.value = withTiming(currentFoodLevel, { duration: 650, easing: Easing.inOut(Easing.cubic) });
  }, [currentFoodLevel, fillMotion]);

  const headProps = useAnimatedProps(() => {
    const translateY = -2 + headMotion.value * -3 + config.headTilt * 0.2;
    const rotate = -config.headTilt + headMotion.value * config.headTilt * 0.6;
    return { transform: `translate(0 ${translateY}) rotate(${rotate})` };
  });

  const earLeftProps = useAnimatedProps(() => {
    const rotate = -10 + earMotion.value * -config.earLift;
    return { transform: `translate(0 0) rotate(${rotate} 78 44)` };
  });

  const earRightProps = useAnimatedProps(() => {
    const rotate = 10 + earMotion.value * config.earLift;
    return { transform: `translate(0 0) rotate(${rotate} 172 44)` };
  });

  const tailProps = useAnimatedProps(() => {
    const rotate = -14 + tailMotion.value * config.tailRange;
    return { transform: `translate(0 0) rotate(${rotate} 196 144)` };
  });

  const bodyProps = useAnimatedProps(() => {
    const scaleY = 1 + breath.value * 0.02;
    const translateY = breath.value * -1.8;
    return { transform: `translate(0 ${translateY}) scale(1 ${scaleY})` };
  });

  const pawProps = useAnimatedProps(() => {
    const translateY = pawMotion.value * -3 * config.pawLift;
    return { transform: `translate(0 ${translateY})` };
  });

  const eyeProps = useAnimatedProps(() => {
    const close = blink.value < 0.2 ? 0.08 : 1;
    return { transform: `translate(0 ${close * 2}) scale(1 ${close})` };
  });

  const foodProps = useAnimatedProps(() => {
    const heightOffset = 20 - fillMotion.value * 0.18;
    return { transform: `translate(0 ${heightOffset})` };
  });

  const baseColor = config.color;

  const foodPieces = useMemo(
    () => FOOD_PIECES.map((piece, index) => ({
      ...piece,
      opacity: getFoodOpacity(currentFoodLevel, index),
    })),
    [currentFoodLevel]
  );

  return (
    <View style={[styles.stage, style]}>
      <Svg width={260} height={220} viewBox="0 0 260 220">
        <Defs>
          <LinearGradient id="bowlOuter" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#dfcab8" />
            <Stop offset="1" stopColor="#b08a6a" />
          </LinearGradient>
          <LinearGradient id="bowlInner" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#f6e6d8" />
            <Stop offset="1" stopColor="#bc936f" />
          </LinearGradient>
          <LinearGradient id="catBody" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={baseColor} />
            <Stop offset="1" stopColor="#8f6a4f" />
          </LinearGradient>
          <RadialGradient id="headGlow" cx="50%" cy="40%" r="60%">
            <Stop offset="0" stopColor="#ffe8c9" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#c59167" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="earGlow" cx="50%" cy="50%" r="90%">
            <Stop offset="0" stopColor="#ffe1c4" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#a36c4d" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="eyeShade" cx="50%" cy="50%" r="60%">
            <Stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#000" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <G>
          <Ellipse cx="130" cy="198" rx="88" ry="18" fill="#1c0d04" opacity="0.28" />

          <Path
            d="M48 178 C43 148 90 122 130 122 C170 122 217 148 212 178 C176 214 84 214 48 178 Z"
            fill="url(#bowlOuter)"
          />
          <Path
            d="M60 170 C65 142 92 128 130 128 C168 128 195 142 200 170 C168 190 92 190 60 170 Z"
            fill="url(#bowlInner)"
          />
          <Path
            d="M60 170 C80 155 180 155 200 170"
            stroke="#fff7e4"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.65"
          />
          <Path
            d="M70 172 C90 160 170 160 190 172"
            stroke="#88614d"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.35"
          />

          <AG animatedProps={foodProps}>
            <Path
              d="M68 164 C80 146 93 138 130 138 C167 138 180 146 192 164 C190 180 175 190 132 190 C90 190 74 180 68 164 Z"
              fill="#8b572b"
              opacity="0.96"
            />
            {foodPieces.map((piece, index) => (
              <ACircle
                key={`food-${index}`}
                cx={piece.x}
                cy={piece.y}
                r={piece.r}
                fill={index % 2 === 0 ? '#c8934a' : '#ad6f35'}
                opacity={piece.opacity}
                transform={`rotate(${piece.rot} ${piece.x} ${piece.y})`}
              />
            ))}
          </AG>

          <AG animatedProps={bodyProps}>
            <Path
              d="M84 150 C72 128 68 96 92 82 C108 73 132 76 150 86 C170 96 178 120 170 142 C162 165 120 178 96 179 C88 179 88 161 84 150 Z"
              fill="url(#catBody)"
              opacity="0.96"
            />
            <Path
              d="M92 82 C116 70 144 74 152 90"
              stroke="#fff5da"
              strokeWidth="5"
              fill="none"
              opacity="0.3"
            />
            <Path
              d="M85 150 C90 142 108 135 128 138 C148 141 160 148 164 155"
              stroke="#8c684f"
              strokeWidth="4"
              fill="none"
              opacity="0.12"
            />
          </AG>

          <AG animatedProps={headProps}>
            <Ellipse cx="130" cy="88" rx="58" ry="50" fill={baseColor} />
            <Ellipse cx="130" cy="82" rx="45" ry="38" fill="url(#headGlow)" />
            <Path
              d="M78 84 C82 45 116 32 136 44 C158 58 156 88 146 106 C142 114 118 112 108 106 C100 100 74 96 78 84 Z"
              fill="#e7cab2"
              opacity="0.15"
            />

            <AG animatedProps={earLeftProps}>
              <Path
                d="M88 44 L72 12 C70 10 74 6 78 10 L96 38 C98 40 96 44 88 44 Z"
                fill="#e8c7a8"
              />
              <Path
                d="M88 44 L75 10 C72 14 76 18 80 20 L92 42"
                fill="url(#earGlow)"
              />
            </AG>

            <AG animatedProps={earRightProps}>
              <Path
                d="M176 46 L192 14 C194 12 190 8 186 12 L168 40 C166 42 168 46 176 46 Z"
                fill="#e8c7a8"
              />
              <Path
                d="M176 46 L189 12 C192 16 188 20 184 22 L172 44"
                fill="url(#earGlow)"
              />
            </AG>

            <G>
              <Path
                d="M100 96 C108 74 120 65 134 68 C148 71 158 82 162 96"
                stroke="#4b3226"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M89 92 C101 78 111 72 124 75 C137 78 146 88 150 100"
                stroke="#2b1a13"
                strokeWidth="3"
                fill="none"
                opacity="0.6"
              />
            </G>

            <G>
              <Path
                d="M97 108 C102 122 117 124 124 118 C131 124 146 122 151 108"
                stroke="#5c3e2e"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M110 101 C111 106 126 107 129 101"
                stroke="#3d2416"
                strokeWidth="3"
                fill="none"
                opacity="0.75"
              />
            </G>

            <AG animatedProps={eyeProps}>
              <Path
                d="M106 88 C112 80 124 80 131 88"
                stroke="#231809"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d="M144 88 C150 80 162 80 168 88"
                stroke="#231809"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            </AG>

            <Path
              d="M120 116 C118 124 132 124 130 116"
              stroke="#3a2112"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </AG>

          <AG animatedProps={tailProps}>
            <Path
              d="M190 138 C220 132 232 118 236 104 C238 94 232 90 224 92 C214 95 206 110 196 118"
              stroke={baseColor}
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M190 138 C220 132 232 118 236 104"
              stroke="#8c6a4f"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
          </AG>

          <AG animatedProps={pawProps}>
            <Path
              d="M88 163 C84 152 90 142 100 144 C108 146 114 158 110 168 C104 180 94 178 88 163 Z"
              fill="#d4aa86"
            />
            <Path
              d="M128 168 C124 154 130 144 138 146 C146 148 152 160 148 168 C142 178 132 176 128 168 Z"
              fill="#d4aa86"
            />
          </AG>

          <Path
            d="M76 110 C55 112 45 126 46 142"
            stroke="#4a2f24"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />
          <Path
            d="M184 116 C203 118 214 132 212 148"
            stroke="#4a2f24"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />

          <Path
            d="M116 110 C99 114 84 124 80 136"
            stroke="#382314"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.26"
          />
          <Path
            d="M148 110 C165 114 180 124 184 136"
            stroke="#382314"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.26"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 240,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
