# Velora Cat Asset Pipeline

## Recommended pipeline

Best option for this Expo React Native app:

- **Real-time 3D model exported from Blender**
- Format: **glTF 2.0 (.glb preferred)**
- Load in Expo using **expo-gl** + **expo-three** (or `@react-three/fiber` if preferred)
- Support multiple Blender animation clips for mood states
- Use a separate bowl/food mesh or animated morphs for food level

This is the best fit because it gives:

1. Realistic appearance from Blender rendering and PBR textures
2. Smooth GPU-driven animation on iPhone
3. Seamless mood switching inside one model file
4. A single asset package instead of huge frame sprite libraries
5. A future-proof architecture for Blender-created character animation

## Export guidance from Blender

### Primary export file

- `cat.glb` or `velora-cat.glb`
- Include:
  - cat body mesh
  - cat rig / armature
  - facial controls/shape keys if used
  - bowl mesh
  - food mesh inside bowl
  - textures for base color, normal, roughness, metallic, ambient occlusion
  - all animation actions as named clips

### Animation clips

Include these clips:

- `idle` (base loop with breathing, blinking, head/ear/tail micro-movements)
- `happy` (brighter eyes, relaxed posture, subtle happiness motion)
- `normal` (calm relaxed idle)
- `worried` (slow, lower energy, ears slightly down)
- `sad` (droopy posture, slower breathing, minimal tail movement)
- `empty` (reacts to empty bowl, looks down, unhappy/tired)

### Bowl / food level

The bowl fill should be separate from the cat mood.

Best options:

- Separate **food mesh** with 6 discrete states: `100%`, `75%`, `50%`, `25%`, `10%`, `0%`
- Or one animated food mesh with 6 visibility states or morph targets
- The visible food must appear physically inside the bowl and respect the bowl shape
- Do not use 2D progress bar overlays

### Texture resolution

For mobile iPhone, use a conservative texture budget:

- **1024×1024** for main cat albedo base color
- **1024×1024** for detail textures if needed
- Use **512×512** or **256×256** for secondary or low-detail maps
- Keep total asset size under **10–12 MB** if possible

## Folder structure

Recommended folder layout in `assets/velora-cat`:

```
assets/velora-cat/
  README.md
  velora-cat.glb
  textures/
    cat-basecolor.png
    cat-normal.png
    cat-roughness.png
    bowl-basecolor.png
  animations/
    idle.json   <-- optional helper export metadata
  states/
    food-100.glb  <-- optional separate mesh states
    food-75.glb
    food-50.glb
    food-25.glb
    food-10.glb
    food-0.glb
```

## Integration architecture

### `src/components/VeloraCat.js`

This component is the integration point.
It should accept:

```js
<VeloraCat
  budgetPercentage={percentageRemaining}
  mood={catMood}
  foodLevel={percentageRemaining}
  assetMap={assetMap}
/>
```

The component will:

- compute mood from percentage
- compute food level bucket from percentage
- select the correct animation clip
- select the correct food/bowl state
- crossfade between assets smoothly

## Notes

- Do not change the Home Screen layout yet.
- Keep the existing `src/components/SpendingCat.js` and `src/screens/HomeScreen.js` intact until the Blender asset is ready.
- This readme is the source of truth for the Blender artist and export pipeline.
