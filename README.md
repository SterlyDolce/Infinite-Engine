# Infinite Engine (IE)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

**Infinite Engine (IE)** is an advanced game engine built using Three.js, designed to provide developers with powerful tools to create immersive 3D experiences. The engine includes its own scripting language, **Loom**, which offers flexibility and ease of use for game developers.

## Screenshots
- **Level Editor**
  ([Level Editor]([Screen Shot 2024-07-28 at 2.32.43 AM.png](https://raw.githubusercontent.com/SterlyDolce/Infinite-Engine/main/Screen%20Shot%202024-07-28%20at%202.33.20%20AM.png))
- **IUG Editor**
  [IUG Editor]([Screen Shot 2024-07-28 at 2.32.43 AM.png](https://raw.githubusercontent.com/SterlyDolce/Infinite-Engine/main/Screen%20Shot%202024-07-28%20at%202.37.41%20AM.png))

**More Editors are in progress**
## Features

- **Three.js Integration**: Leverage the power of Three.js for stunning 3D graphics.
- **Loom Scripting Language**: A custom scripting language designed for efficient and easy game logic implementation.
- ```loom
  # Player Actor
  
  var scope = self

  class Health:
     var amount = 100
     constructor():
        set scope.health = self
        return self

     gainHealth(amount):
        var current_amount = self.amount
        set self.amount = current_amount + amount

  var health = Health()

  Event KeyQ:
     health.gainHealth(20)
  
  ```
     
- **Infinite UI Graphics (IUG)**: An in-game UI editor for real-time interface design and customization.
- **Cross-Platform Compatibility**: Develop once, deploy across multiple platforms.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.15.0 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SterlyDolce/Infinite-Engine.git
   cd Infinite-Engine
   ```
2. Install Dependencies:
   ```bash
   npm install electron
   ```
3. Launch Infinite Engine:
   ```bash
   npm start
   ```
   
