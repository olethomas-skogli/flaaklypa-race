# Il Tempo Gigante Grand Prix

A browser-based racing game inspired by the Norwegian classic animated film "Flåklypa Grand Prix" (The Pinchcliffe Grand Prix). Drive the legendary Il Tempo Gigante through challenging obstacles while collecting magical Aladdin Oil lamps.

## Game Story

Race as Il Tempo Gigante, the iconic vehicle from Flåklypa Grand Prix, in this thrilling endless runner. Avoid dangerous "blodstrupmoen" obstacles while collecting precious Aladdin Oil lamps to boost your score. The game features authentic Norwegian dialogue and character references from the beloved film.

## Features

- **Classic Racing Action**: Control Il Tempo Gigante with smooth arrow key controls
- **Obstacle Avoidance**: Dodge red "blodstrupmoen" obstacles that end your race
- **Collectible System**: Gather Aladdin Oil lamps for 10 points each
- **Milestone Celebrations**: Special messages from Ben Redic at score milestones (20, 40, 60, 80, 100 points)
- **Leaderboard**: Track top 5 high scores with player names (stored locally)
- **Authentic Assets**: Original character sprites and animations from the film
- **Time Tracking**: Monitor your racing duration alongside your score

## How to Play

### Setup
1. Open `index.html` in any modern web browser
2. Enter your name (or leave blank for "Anonymous")
3. Click "Start Game" to begin racing

### Controls
- **Arrow Keys**: Move Il Tempo Gigante in all directions
  - ↑ Up: Move forward
  - ↓ Down: Move backward  
  - ← Left: Steer left
  - → Right: Steer right

### Objectives
- **Survive**: Avoid hitting red "blodstrupmoen" obstacles
- **Collect**: Grab golden Aladdin Oil lamps (+10 points each)
- **Score**: Reach milestone scores to unlock special Ben Redic messages
- **Compete**: Aim for the top 5 on Emmanuel's Leaderboard

### Scoring System
- **Aladdin Oil Lamps**: 10 points each
- **Milestone Messages**:
  - 20 points: "Schwinge med schweiva!!"
  - 40 points: "Din bil, schenial!"
  - 60 points: "Kjøra, kjøra, farli' norsk hengebro!"
  - 80 points: "Ali! - !Ali -!Ali!"
  - 100 points: "Shalam - Shalam!"

### Game Over
- **Under 100 points**: "Game Over, Suppehua!" with Ben Redic
- **100+ points**: "Game Over, Ali-Ali do kjore bra!" with Ali-Ali

## Technical Details

- **Engine**: Vanilla JavaScript with HTML5 Canvas
- **Graphics**: PNG sprites and animated GIFs
- **Audio**: Howler.js library support (background music ready)
- **Storage**: Local leaderboard using localStorage
- **Performance**: 60 FPS game loop with smooth animations

## File Structure

```
il-tempo-gigante/
├── index.html              # Main game file
├── README.md               # This file
├── image.png               # Header logo
├── il-tempo-gigante.gif    # Animated car sprite
├── il-tempo-flame.png      # Player car sprite
├── blodstrupmoen.png       # Obstacle sprite
├── aladdin-oil-lamp.png    # Collectible sprite
├── ben-redic.png           # Game over character
├── ben-redic-message.png   # Milestone message sprite
├── ali-ali.png             # Victory character
├── emmanuel.png            # Leaderboard character
├── racing-down-the-mountain.mp3  # Background music
└── racing-down-the-mountain.ogg  # Background music (alternate)
```

## Cultural References

This game celebrates the Norwegian animated film "Flåklypa Grand Prix" (1975), featuring:
- **Il Tempo Gigante**: The legendary racing car
- **Ben Redic**: The enthusiastic mechanic and inventor
- **Emmanuel**: The philosophical and wise character
- **Ali-Ali**: The exotic racing rival
- **Norwegian Expressions**: Authentic dialogue from the film

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Credits

Inspired by "Flåklypa Grand Prix" by Ivo Caprino (1975). This is a fan-made tribute game celebrating the beloved Norwegian animated classic.

---

*"Schwinge med schweiva!" - Ben Redic*