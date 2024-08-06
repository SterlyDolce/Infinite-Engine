# Infinite Engine (IE)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Overview

**Infinite Engine (IE)** is an advanced game engine built using Three.js, designed to provide developers with powerful tools to create immersive 3D experiences. The engine includes its own scripting language, **Loom**, which offers flexibility and ease of use for game developers.
You can join our reddit if interested [Link](https://www.reddit.com/r/InfiniteEngineDev/)

**Contributors** please visit [The Contributor Page](https://github.com/SterlyDolce/Infinite-Engine/blob/main/CONTRIBUTING.md)

## Screenshots
- **Main Editor**
  [Main Editor](https://raw.githubusercontent.com/SterlyDolce/Infinite-Engine/main/Main%20Editor.png)
  When open the Engine, you're you greeting with a blank screen that gives you the option to create or open a project.
- **Level Editor**
  ![Level Editor](https://raw.githubusercontent.com/SterlyDolce/Infinite-Engine/main/Level%20Editor.png)
  The level editor is the first editor you will see after create of open an project, WARNING: if editor is close you will have to open the project again, Editor is still in perogress.
- **IUG Editor**
  ![IUG Editor](https://raw.githubusercontent.com/SterlyDolce/Infinite-Engine/main/IUG%20Editor.png)
  The IUG Editor is where you will create widget for your game, in the future you will have access to write to the main script or script from an Actor to ad the UI to the Play screen.

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

- **Keep in mind**
  The project is not yet finished or close to finish, I will keep working on it, push some changes overtime, in the mean while you can commit to make changes, or fork the project to create your own. goodluck :) and Thank You!
  
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
   
