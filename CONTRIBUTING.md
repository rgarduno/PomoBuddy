# Contributing to PomoBuddy 🍅🐾

First of all, thank you for considering contributing to **PomoBuddy**! Whether you want to design a new pixel art companion, create a new ambient stage background, craft an 8-bit sound pack, or fix a bug, your help is warmly welcomed.

PomoBuddy is built with a minimalist, high-performance philosophy:
- **Zero runtime dependencies** in production.
- **0 KB external asset files** (all sprites and audio are procedurally generated in pure code).
- **Lightweight footprint** (< 60 KB packed extension size).
- **Sleep mode & crash resilient** delta clock.

---

## Table of Contents

1. [Development Setup](#-development-setup)
2. [Project Architecture](#-project-architecture)
3. [The Pixel Art Companion Engine](#-the-pixel-art-companion-engine)
4. [Companion Design Guidelines & Anatomy](#-companion-design-guidelines--anatomy)
5. [Step-by-Step Guide: Adding a New Companion](#-step-by-step-guide-adding-a-new-companion)
6. [Testing & Quality Assurance](#-testing--quality-assurance)
7. [Submitting a Pull Request](#-submitting-a-pull-request)
8. [Code of Conduct](#-code-of-conduct)

---

## 🛠️ Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) (v9.x or later)
- [Visual Studio Code](https://code.visualstudio.com/)

### Clone and Install

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/PomoBuddy.git
cd PomoBuddy

# 2. Install dependencies
npm install

# 3. Compile TypeScript
npm run compile

# 4. Run test suite
npm test
```

### Launching the Extension Locally

1. Open the PomoBuddy repository in VS Code.
2. Press `F5` (or go to **Run and Debug** -> **Run Extension**).
3. A new **Extension Development Host** window will open.
4. Click the tomato icon 🍅 in the Activity Bar or check the bottom panel tab to interact with your live changes.

---

## 🏛️ Project Architecture

```
PomoBuddy/
├── src/
│   ├── extension.ts           # Extension entrypoint, command registrations, lifecycle
│   ├── timerManager.ts        # Delta clock engine, round state machine, productivity stats
│   ├── statusBarManager.ts    # VS Code status bar item & dynamic avatar emoji
│   ├── pomoWebviewProvider.ts # Webview HTML provider, message router, modal templates
│   ├── ideEvents.ts           # VS Code diagnostics API & file save listener
│   └── types.ts               # Shared TypeScript interfaces, types & message protocols
├── media/
│   ├── main.js                # HTML5 Canvas game loop, pixel rendering, audio synth, HUD
│   ├── style.css              # Frosted glass styling, themes, grid layouts, animations
│   ├── banner.svg             # Vector art banner for README and documentation
│   └── icon.svg               # Extension logo
├── tests/
│   ├── __mocks__/vscode.ts    # Lightweight VS Code API mocks
│   ├── timerManager.test.ts   # State machine, sleep-mode resiliency, delta tests
│   └── statusBarManager.test.ts # Status bar formatting & emoji display tests
└── package.json               # Extension manifest, commands & user configuration schemas
```

---

## 🎨 The Pixel Art Companion Engine

Unlike traditional webviews that display `.gif` or `.png` spritesheets, PomoBuddy renders all characters **procedurally in pure JavaScript using HTML5 Canvas 2D**. This guarantees zero network requests, instant loading, perfect sub-pixel crispness, and full programmatic control over animations and color palettes.

### The Virtual Grid & Pixel Scale

- The canvas game loop runs at **60 FPS**.
- The display uses `PIXEL_SCALE = 4`. This means **1 virtual pixel = 4x4 physical screen pixels**.
- The canvas has CSS rule `image-rendering: pixelated;` to prevent anti-aliasing blur.
- Standard companion bounding box: approximately **16 to 20 virtual pixels wide** and **16 to 22 virtual pixels tall**.

### The Pixel Plotter Function: `p(vx, vy, color)`

In `media/main.js`, all drawing is performed via the helper function `p()`:

```javascript
p(vx, vy, color);
```

- `vx`: Virtual X position relative to the avatar origin.
- `vy`: Virtual Y position relative to the avatar origin.
- `color`: Hex color string (e.g., `'#ffb347'`) or color constant.
- **Automatic Horizontal Mirroring:** The `p()` function automatically mirrors coordinates when your companion turns left (`facingDir === -1`) relative to `currentAvatarOriginX`.
  > **Crucial Rule:** Always design your companion facing **right**! The engine will handle left-facing orientation automatically.

---

## 📐 Companion Design Guidelines & Anatomy

Every companion needs to express distinct emotions based on what the developer is experiencing in VS Code.

### 1. Spatial Anatomy (Origin & Layers)

When rendering, the base reference coordinates are:
- `xOffset = Math.round(avatarX + danceOffset)`
- `yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob))`

Recommended virtual Y distribution:
- **Head accessories (hats, ears, antennas):** `yOffset - 12` to `yOffset - 7`
- **Face & Eyes:** `yOffset - 6` to `yOffset - 2`
- **Snout / Beak / Mouth:** `yOffset - 3` to `yOffset - 1`
- **Body & Clothing:** `yOffset - 1` to `yOffset + 3`
- **Feet / Paws / Tracks:** `yOffset + 4` to `yOffset + 5`
- **Tail / Back accessory:** `xOffset - 4` to `xOffset - 8`

### 2. Required Emotional States & Moods

Your companion's drawing function receives 4 arguments:
```javascript
function drawMyBuddy(step, mood, walking, sitting) { ... }
```

| State / Mood | Triggers | Visual Expectations |
| :--- | :--- | :--- |
| **`WORK` (Focus Mode)** | Active countdown during work sessions | Calm, focused posture. Looking forward or typing on a mini-laptop. Subtle breathing bob: `Math.floor(Math.sin(step * 0.12))`. |
| **`DANCE` (Celebration)** | Break periods (Short/Long Break) | Party accessory (e.g. party sunglasses 😎, halo, disco gear), rhythmic vertical bouncing, dancing limbs. |
| **`ERROR` (Diagnostics)** | Active file has linter/syntax errors | Dizzy eyes (`X` eyes or spirals), concern marks, sweat bead (`#00d2d3`) dropping down the forehead. |
| **`SAVED` / `FIXED`** | User saves file (`Cmd+S`) or fixes errors | Joyous expression (`^ ^` eyes), thumb up 👍, sparkle or star particles. |
| **`walking`** | Companion moves across the floor | Alternate feet/paws using `Math.sin(step * 0.3)`. Body bobs up and down by 1-2 pixels. |
| **`sitting`** | Break time at the retro armchair | Companion sits down on the chair, feet resting on the floor, relaxing posture. |

### 3. Color Palette Recommendations

- Choose **4 to 8 distinct colors** per companion.
- Ensure strong contrast against dark editor themes, light themes, and all 5 ambient backgrounds (`winter`, `forest`, `cyberpunk`, `lofi`, `minimal`).
- Use descriptive constants at the top of your function:
  ```javascript
  const BODY = '#4a90e2';
  const BELLY = '#e8f4f8';
  const DARK = '#1a1a2e';
  const ACCENT = '#ff6b6b';
  ```

---

## 🚀 Step-by-Step Guide: Adding a New Companion

Let's walk through adding a new companion: **Sir Owl** (ID: `'owl'`, Emoji: `🦉`).

### Step 1: Register the Avatar ID in `src/types.ts`

Add your avatar's unique ID to `AvatarId`:

```typescript
// src/types.ts
export type AvatarId = 'neko' | 'wizard' | 'robot' | 'duck' | 'capy' | 'raccoon' | 'owl';
```

### Step 2: Register in `package.json`

Add the avatar option to the configuration schema so users can configure it in `settings.json`:

```json
"pomobuddy.avatar": {
  "type": "string",
  "enum": [
    "neko",
    "wizard",
    "robot",
    "duck",
    "capy",
    "raccoon",
    "owl"
  ],
  "enumDescriptions": [
    "NekoDev (Gatito Programador)",
    "CodeMage (Archimago del Código)",
    "PixelBot (Robot Retro)",
    "Sir Ducky (Pato de Goma Elegante)",
    "CapyDev (Capibara Zen Anti-Burnout)",
    "Byte (Mapache Hacker de Medianoche)",
    "Sir Owl (Búho Sabio de la Noche)"
  ],
  "default": "neko",
  "description": "Compañero pixel art activo en PomoBuddy."
}
```

### Step 3: Map the Status Bar Emoji in `src/statusBarManager.ts`

```typescript
// src/statusBarManager.ts
const AVATAR_EMOJIS: Record<AvatarId, string> = {
  neko: '🐱',
  wizard: '🧙‍♂️',
  robot: '🤖',
  duck: '🦆',
  capy: '☕',
  raccoon: '🦝',
  owl: '🦉',
};
```

### Step 4: Add the Selector Button in `src/pomoWebviewProvider.ts`

Inside the `#settingsModal` HTML template, add a `.avatar-btn`:

```html
<button class="avatar-btn ${config.avatar === 'owl' ? 'active' : ''}" data-avatar="owl" title="Sir Owl: Sabio y vigilante">
  <span class="avatar-icon">🦉</span>
  <span class="avatar-label">Sir Owl</span>
</button>
```

### Step 5: Add Quotes and Draw Function in `media/main.js`

1. **Add dialogue quotes to `quotesByAvatar`:**

```javascript
// media/main.js
const quotesByAvatar = {
  // ... existing companions
  owl: {
    work: [
      '¡Hoo-hoo! La noche es joven para programar 🌙',
      'Concentración total: 360 grados de visión 🦉',
      'Depurando con sabiduría milenaria 📜',
      'Silencio en la biblioteca: código en proceso ✨',
    ],
    dance: [
      '¡Hoo-hoo! ¡Aleteo disco en curso! 🕺',
      'Bailando en las ramas bajo las estrellas 🌟',
      '¡Pausa para un bocadillo nocturno! ☕',
    ],
    error: '¡Hoo! Detecto una anomalía en la sintaxis 😵‍💫',
    fixed: '¡Sabiduría restaurada! Código limpio ✨',
    saved: '¡Escrito en el pergamino sagrado! 👍',
  },
};
```

2. **Add companion name in `avatarNames`:**

```javascript
const avatarNames = {
  neko: 'NekoDev',
  wizard: 'CodeMage',
  robot: 'PixelBot',
  duck: 'Sir Ducky',
  capy: 'CapyDev',
  raccoon: 'Byte',
  owl: 'Sir Owl',
};
```

3. **Implement the drawing function `drawOwl(...)`:**

```javascript
function drawOwl(step, mood, walking, sitting) {
  const isDancing = mood === 'DANCE';
  const isError = mood === 'ERROR';

  let bob = walking ? Math.floor(Math.sin(step * 0.3) * 1.5) : Math.floor(Math.sin(step * 0.12));
  let danceOffset = isDancing ? Math.sin(step * 0.35) * 3 : 0;
  let xOffset = Math.round(avatarX + danceOffset);
  let yOffset = Math.round(18 + jumpY + (sitting ? 1 : bob));
  currentAvatarOriginX = xOffset;

  const FEATHER = '#8d6e63';
  const BELLY = '#d7ccc8';
  const EYES = '#ffeb3b';
  const PUPIL = '#212121';
  const BEAK = '#ff9800';

  // Body & Head (Rounded plumage)
  for (let x = -4; x <= 4; x++) {
    for (let y = -6; y <= 3; y++) {
      p(xOffset + x, yOffset + y, FEATHER);
    }
  }

  // Chest / Belly
  for (let x = -2; x <= 2; x++) {
    for (let y = -1; y <= 3; y++) {
      p(xOffset + x, yOffset + y, BELLY);
    }
  }

  // Eyes (Big expressive owl eyes)
  if (isError) {
    p(xOffset - 2, yOffset - 4, PUPIL);
    p(xOffset - 1, yOffset - 3, PUPIL);
    p(xOffset + 2, yOffset - 4, PUPIL);
    p(xOffset + 1, yOffset - 3, PUPIL);
  } else if (isDancing) {
    // Cool party sunglasses
    for (let g = -4; g <= 4; g++) p(xOffset + g, yOffset - 4, '#111111');
    p(xOffset - 2, yOffset - 3, '#00e5ff');
    p(xOffset + 2, yOffset - 3, '#00e5ff');
  } else {
    p(xOffset - 2, yOffset - 4, EYES);
    p(xOffset - 2, yOffset - 3, PUPIL);
    p(xOffset + 2, yOffset - 4, EYES);
    p(xOffset + 2, yOffset - 3, PUPIL);
  }

  // Beak
  p(xOffset, yOffset - 2, BEAK);

  // Feet / Talons
  let footStep = walking ? Math.round(Math.sin(step * 0.3) * 2) : 0;
  p(xOffset - 2, yOffset + 4 + footStep, BEAK);
  p(xOffset + 2, yOffset + 4 - footStep, BEAK);
}
```

### Step 6: Hook into `renderLoop`

In `media/main.js`, add your companion to the avatar switch:

```javascript
switch (currentAvatar) {
  case 'wizard':
    drawWizard(animTick, activeMood, isWalking, isSittingInChair);
    break;
  case 'robot':
    drawRobot(animTick, activeMood, isWalking, isSittingInChair);
    break;
  case 'duck':
    drawDuck(animTick, activeMood, isWalking, isSittingInChair);
    break;
  case 'capy':
    drawCapy(animTick, activeMood, isWalking, isSittingInChair);
    break;
  case 'raccoon':
    drawRaccoon(animTick, activeMood, isWalking, isSittingInChair);
    break;
  case 'owl':
    drawOwl(animTick, activeMood, isWalking, isSittingInChair);
    break;
  case 'neko':
  default:
    drawNeko(animTick, activeMood, isWalking, isSittingInChair);
    break;
}
```

### Step 7: Update Status Bar Unit Tests

In `tests/statusBarManager.test.ts`, add a test case verifying your companion's emoji is correctly formatted:

```typescript
it('should display owl avatar emoji in status bar', () => {
  const snapshot: TimerSnapshot = {
    mode: 'WORK',
    status: 'RUNNING',
    remainingSeconds: 25 * 60,
    totalSeconds: 25 * 60,
    currentRound: 1,
    totalRounds: 4,
    completedRounds: 0,
    avatar: 'owl',
  };

  statusBarManager.update(snapshot);
  expect(mockItem.text).toContain('🦉');
});
```

---

## 🧪 Testing & Quality Assurance

Before submitting your contribution, ensure all checks pass:

```bash
# 1. Typecheck TypeScript
npm run compile

# 2. Run unit tests
npm test

# 3. Check test coverage
npm run test:coverage

# 4. Verify extension packaging
npm run package
```

### Visual Verification Checklist
- [ ] Open the Settings modal and verify the avatar button looks crisp and selects cleanly.
- [ ] Verify walking animations: companion flips direction correctly at edges.
- [ ] Test the **`🎾` Ball Toy**: ensure the companion runs towards and kicks the ball.
- [ ] Test Break Mode: companion enters dance mode with party prop and sits down on the armchair.
- [ ] Test Linter Error: open a file with a deliberate syntax error and observe the dizzy expression.
- [ ] Test File Save: press `Cmd+S` / `Ctrl+S` and observe the positive reaction.
- [ ] Check high contrast against light (`.vscode-light`), dark (`.vscode-dark`), and all stage themes.

---

## 📤 Submitting a Pull Request

1. **Create a descriptive feature branch:**
   ```bash
   git checkout -b feature/avatar-owl
   ```
2. **Commit your changes using Conventional Commits:**
   ```bash
   git commit -m "feat(avatar): add Sir Owl companion with animations and dialogues"
   ```
3. **Push to your fork:**
   ```bash
   git push origin feature/avatar-owl
   ```
4. **Open a Pull Request:**
   - Include a clear title and description.
   - Attach a short GIF or screenshot demonstrating your companion in action (walking, dancing, reacting to errors).
   - Confirm all automated unit tests pass.

---

## 📜 Code of Conduct

PomoBuddy is an inclusive, welcoming open-source project. We expect all contributors and participants to:
- Be kind, respectful, and constructive in discussions and reviews.
- Encourage creativity and celebrate fellow developers' contributions.
- Keep discussions focused on improving the tool and supporting developer productivity.

Thank you for helping make PomoBuddy a delightful focus companion for developers around the world! 🍅✨
