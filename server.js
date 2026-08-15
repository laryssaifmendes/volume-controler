const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Detect which volume control system is available
function getVolumeCommand() {
  return new Promise((resolve) => {
    // Try pactl first (PulseAudio)
    exec('which pactl', (error) => {
      if (!error) {
        resolve('pactl');
        return;
      }
      // Fall back to amixer (ALSA)
      exec('which amixer', (error) => {
        if (!error) {
          resolve('amixer');
          return;
        }
        resolve(null);
      });
    });
  });
}

let volumeSystem = null;

// Initialize volume system on startup
(async () => {
  volumeSystem = await getVolumeCommand();
  if (volumeSystem) {
    console.log(`✓ Volume control system detected: ${volumeSystem}`);
  } else {
    console.warn('⚠ No volume control system found (pactl or amixer)');
  }
})();

// Get current volume
app.get('/api/volume', (req, res) => {
  if (!volumeSystem) {
    return res.status(503).json({ error: 'Volume control not available' });
  }

  if (volumeSystem === 'pactl') {
    exec("pactl get-sink-volume @DEFAULT_SINK@", (error, stdout) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to get volume' });
      }
      // Parse output like "Volume: front-left: 65536 / 100%   front-right: 65536 / 100%"
      const match = stdout.match(/(\d+)%/);
      const volume = match ? parseInt(match[1]) : 50;
      res.json({ volume });
    });
  } else if (volumeSystem === 'amixer') {
    exec("amixer get Master", (error, stdout) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to get volume' });
      }
      // Parse output like "[100%] [on]"
      const match = stdout.match(/\[(\d+)%\]/);
      const volume = match ? parseInt(match[1]) : 50;
      res.json({ volume });
    });
  }
});

// Set volume
app.post('/api/volume', (req, res) => {
  const { volume } = req.body;

  if (typeof volume !== 'number' || volume < 0 || volume > 100) {
    return res.status(400).json({ error: 'Volume must be between 0 and 100' });
  }

  if (!volumeSystem) {
    return res.status(503).json({ error: 'Volume control not available' });
  }

  if (volumeSystem === 'pactl') {
    exec(`pactl set-sink-volume @DEFAULT_SINK@ ${volume}%`, (error) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to set volume' });
      }
      res.json({ success: true, volume });
    });
  } else if (volumeSystem === 'amixer') {
    exec(`amixer set Master ${volume}%`, (error) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to set volume' });
      }
      res.json({ success: true, volume });
    });
  }
});

// Mute/Unmute
app.post('/api/mute', (req, res) => {
  const { mute } = req.body;

  if (!volumeSystem) {
    return res.status(503).json({ error: 'Volume control not available' });
  }

  const command = mute ? 'mute' : 'unmute';

  if (volumeSystem === 'pactl') {
    exec(`pactl set-sink-mute @DEFAULT_SINK@ ${command}`, (error) => {
      if (error) {
        return res.status(500).json({ error: `Failed to ${command}` });
      }
      res.json({ success: true, muted: mute });
    });
  } else if (volumeSystem === 'amixer') {
    const amixerCmd = mute ? 'off' : 'on';
    exec(`amixer set Master ${amixerCmd}`, (error) => {
      if (error) {
        return res.status(500).json({ error: `Failed to ${command}` });
      }
      res.json({ success: true, muted: mute });
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Volume Controller Server running at http://localhost:${PORT}`);
});
