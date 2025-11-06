const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      const scoreDisplay = document.getElementById("score");
      const scoreImage = document.getElementById("scoreImage");
      const gameTimeDisplay = document.getElementById("gameTime");
      const speedIndicator = document.getElementById("speedIndicator");
      const fpsCounter = document.getElementById("fpsCounter");
      const restartButton = document.getElementById("restartButton");
      const gameOverDialog = document.getElementById("gameOverDialog");
      const mobileGameOverDialog = document.getElementById("mobileGameOverDialog");
      const startScreen = document.getElementById("startScreen");
      const startButton = document.getElementById("startButton");
      const nameInput = document.getElementById("nameInput");
      // Leaderboard now integrated into gameOverDialog
      const leaderboardList = document.getElementById("leaderboardList");
      const leaderboardStatus = document.getElementById("leaderboardStatus");
      const startLeaderboardList = document.getElementById("startLeaderboardList");
      const startLeaderboardStatus = document.getElementById("startLeaderboardStatus");
      const countdownOverlay = document.getElementById("countdownOverlay");
      const countdownText = document.getElementById("countdownText");
      const f1Lights = document.querySelectorAll(".f1-light");
      const touchZoneLeft = document.getElementById("touchZoneLeft");
      const touchZoneRight = document.getElementById("touchZoneRight");

      // Initialize Firebase
      let firebaseApp, database;
      let firebaseEnabled = false;

      // Check if Firebase config is available and valid
      if (window.FIREBASE_CONFIG && 
          window.FIREBASE_CONFIG.apiKey && 
          window.FIREBASE_CONFIG.apiKey !== "your-api-key-here") {
        
        try {
          firebaseApp = firebase.initializeApp(window.FIREBASE_CONFIG);
          database = firebase.database();
          firebaseEnabled = true;
          console.log('✅ Firebase initialized successfully for online leaderboard');
          if (leaderboardStatus) {
            leaderboardStatus.innerHTML = '🌐 Online Leaderboard';
            leaderboardStatus.style.color = '#4caf50';
          }
          if (startLeaderboardStatus) {
            startLeaderboardStatus.innerHTML = '🌐 Online Leaderboard';
            startLeaderboardStatus.style.color = '#4caf50';
          }
        } catch (error) {
          console.warn('❌ Firebase initialization failed:', error);
          console.warn('📱 Falling back to localStorage for leaderboard');
          firebaseEnabled = false;
          if (leaderboardStatus) {
            leaderboardStatus.innerHTML = '📱 Local Leaderboard';
            leaderboardStatus.style.color = '#888';
          }
          if (startLeaderboardStatus) {
            startLeaderboardStatus.innerHTML = '📱 Local Leaderboard';
            startLeaderboardStatus.style.color = '#888';
          }
        }
      } else {
        console.log('📱 Firebase config not found or not configured, using localStorage for leaderboard');
        console.log('💡 To enable online leaderboard, edit firebase-config.js with your Firebase settings');
        firebaseEnabled = false;
        if (leaderboardStatus) {
          leaderboardStatus.innerHTML = '📱 Local Leaderboard';
          leaderboardStatus.style.color = '#888';
        }
        if (startLeaderboardStatus) {
          startLeaderboardStatus.innerHTML = '📱 Local Leaderboard';
          startLeaderboardStatus.style.color = '#888';
        }
      }

      // Car selection functionality
      const carData = {
        'il-tempo-gigante': 'il-tempo-from-above.png',
        'desperados-rolls-royce': 'desperados-rolls-royce.png',
        'boomerang-rapido': 'boomerang-rapido-above.png',
        'solan-propell-sykkel': 'solan-propell-sykkel-v1.png'
      };
      
      let selectedCar = localStorage.getItem('selectedCar') || 'il-tempo-gigante';
      
      // Load the selected car image
      const carImage = new Image();
      carImage.src = carData[selectedCar];
      let imageLoaded = false;
      carImage.onload = () => {
        imageLoaded = true;
      };
      
      // Multi-step start screen flow
      let currentStep = 1;
      let selectedCarName = '';
      let playerName = '';
      
      // Get step elements
      const carSelectionStep = document.getElementById('carSelectionStep');
      const nameInputStep = document.getElementById('nameInputStep');
      const startGameStep = document.getElementById('startGameStep');
      const confirmCarButton = document.getElementById('confirmCarButton');
      const confirmNameButton = document.getElementById('confirmNameButton');
      const selectedCarDisplay = document.getElementById('selectedCarDisplay');
      const selectedNameDisplay = document.getElementById('selectedNameDisplay');

      // Car selection event handlers
      function initCarSelection() {
        console.log('🚗 Initializing car selection...');
        const carOptions = document.querySelectorAll('.car-option');
        console.log('🚗 Found car options:', carOptions.length);
        
        if (carOptions.length === 0) {
          console.error('❌ No car options found! Check if DOM elements exist.');
          return;
        }
        
        // Add click handlers for car selection
        carOptions.forEach(option => {
          option.addEventListener('click', () => {
            // Remove selected class from all options
            carOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update selected car
            selectedCar = option.dataset.car;
            selectedCarName = option.querySelector('span').textContent;
            localStorage.setItem('selectedCar', selectedCar);
            
            // Load new car image
            carImage.src = carData[selectedCar];
            imageLoaded = false;
            carImage.onload = () => {
              imageLoaded = true;
            };
            
            // Update player dimensions for new car
            const newDimensions = getPlayerDimensions();
            player.width = newDimensions.width;
            player.height = newDimensions.height;
            
            // Enable confirm car button
            confirmCarButton.disabled = false;
          });
        });
        
        // Confirm car selection button
        if (confirmCarButton) {
          confirmCarButton.addEventListener('click', () => {
            goToStep(2);
          });
        } else {
          console.error('❌ confirmCarButton element not found!');
        }
        
        // Name input handling
        if (nameInput && confirmNameButton) {
          nameInput.addEventListener('input', () => {
            const name = nameInput.value.trim();
            confirmNameButton.disabled = name.length === 0;
          });
          
          // Confirm name button
          confirmNameButton.addEventListener('click', () => {
            playerName = nameInput.value.trim() || 'Anonymous';
            goToStep(3);
          });
        } else {
          console.error('❌ nameInput or confirmNameButton elements not found!');
        }
      }
      
      function goToStep(step) {
        // Hide all steps
        carSelectionStep.style.display = 'none';
        nameInputStep.style.display = 'none';
        startGameStep.style.display = 'none';
        
        // Show current step
        switch(step) {
          case 1:
            carSelectionStep.style.display = 'block';
            break;
          case 2:
            nameInputStep.style.display = 'block';
            nameInput.focus();
            break;
          case 3:
            startGameStep.style.display = 'block';
            selectedCarDisplay.textContent = `Car: ${selectedCarName}`;
            selectedNameDisplay.textContent = `Driver: ${playerName}`;
            break;
        }
        currentStep = step;
      }
      
      // Initialize car selection when DOM is loaded or immediately if already loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarSelection);
      } else {
        initCarSelection();
      }

      // Load the obstacle images
      const obstacleImage = new Image();
      obstacleImage.src = "blodstrupmoen.png"; // Path to your obstacle image
      let obstacleImageLoaded = false;
      obstacleImage.onload = () => {
        obstacleImageLoaded = true;
      };

      // Load the desperados obstacle image (for Solan car)
      const desperadosObstacleImage = new Image();
      desperadosObstacleImage.src = "desperados-obstacle-v01.png";
      let desperadosObstacleImageLoaded = false;
      desperadosObstacleImage.onload = () => {
        desperadosObstacleImageLoaded = true;
      };

      // Load the reodor obstacle image (for Boomerang Rapido car)
      const reodorObstacleImage = new Image();
      reodorObstacleImage.src = "reodor-obstacle.png";
      let reodorObstacleImageLoaded = false;
      reodorObstacleImage.onload = () => {
        reodorObstacleImageLoaded = true;
      };

      // Load the side obstacle images (outside track)
      const standLeftImage = new Image();
      standLeftImage.src = "stand-left.png";
      let standLeftImageLoaded = false;
      standLeftImage.onload = () => {
        standLeftImageLoaded = true;
      };

      const standRightImage = new Image();
      standRightImage.src = "stand-right.png";
      let standRightImageLoaded = false;
      standRightImage.onload = () => {
        standRightImageLoaded = true;
      };

      // Load the collectible image (aladdin oil lamp)
      const collectibleImage = new Image();
      collectibleImage.src = "aladdin-oil-lamp.png"; // Path to your collectible image
      let collectibleImageLoaded = false;
      collectibleImage.onload = () => {
        collectibleImageLoaded = true;
      };

      // Load the gold bar image
      const goldImage = new Image();
      goldImage.src = "gold.png"; // Path to gold bar image
      let goldImageLoaded = false;
      goldImage.onload = () => {
        goldImageLoaded = true;
      };

      // Load the Ludvig superpower image
      const ludvigImage = new Image();
      ludvigImage.src = "ludvig.png"; // Path to Ludvig superpower image
      let ludvigImageLoaded = false;
      ludvigImage.onload = () => {
        ludvigImageLoaded = true;
      };

      // Load the radar image
      const radarImage = new Image();
      radarImage.src = "radar.png"; // Path to radar image
      let radarImageLoaded = false;
      radarImage.onload = () => {
        radarImageLoaded = true;
      };

      // Load the milestone image
      const milestoneImage = new Image();
      milestoneImage.src = "ben-redic-message.png"; // Replace with your image path
      let milestoneImageLoaded = false;
      milestoneImage.onload = () => {
        milestoneImageLoaded = true;
        console.log("Milestone image loaded successfully");
      };
      milestoneImage.onerror = () => {
        console.error("Failed to load milestone image");
      };

      // Load the mist message image (mysil.png)
      const mistMessageImage = new Image();
      mistMessageImage.src = "mysil.png";
      let mistMessageImageLoaded = false;
      mistMessageImage.onload = () => {
        mistMessageImageLoaded = true;
        console.log("Mist message image loaded successfully");
      };
      mistMessageImage.onerror = () => {
        console.error("Failed to load mist message image");
      };

      // Load desert obstacle images
      const palmImage = new Image();
      palmImage.src = "palm.png";
      let palmImageLoaded = false;
      palmImage.onload = () => {
        palmImageLoaded = true;
        console.log("Palm image loaded successfully");
      };
      palmImage.onerror = () => {
        console.error("Failed to load palm image");
      };

      const camelImage = new Image();
      camelImage.src = "camel.png";
      let camelImageLoaded = false;
      camelImage.onload = () => {
        camelImageLoaded = true;
        console.log("Camel image loaded successfully");
      };
      camelImage.onerror = () => {
        console.error("Failed to load camel image");
      };

      // Load sand dunes image for desert scene background
      const sandDunesImage = new Image();
      sandDunesImage.src = "sand-dunes.png";
      let sandDunesImageLoaded = false;
      sandDunesImage.onload = () => {
        sandDunesImageLoaded = true;
        console.log("Sand dunes image loaded successfully");
      };
      sandDunesImage.onerror = () => {
        console.error("Failed to load sand dunes image");
      };

      // Load mountain image for normal scene sides
      const mountainImage = new Image();
      mountainImage.src = "mountain-tree.png";
      let mountainImageLoaded = false;
      mountainImage.onload = () => {
        mountainImageLoaded = true;
        console.log("Mountain image loaded successfully");
      };
      mountainImage.onerror = () => {
        console.error("Failed to load mountain image");
      };

      // Load tree image for normal scene sides
      const treeImage = new Image();
      treeImage.src = "tree.png";
      let treeImageLoaded = false;
      treeImage.onload = () => {
        treeImageLoaded = true;
        console.log("Tree image loaded successfully");
      };
      treeImage.onerror = () => {
        console.error("Failed to load tree image");
      };

      let isMoving = false;

      // Game state
      let score = 0;
      let gameOver = false;
      let lastTime = 0;
      let gameTime = 0;
      let frameCount = 0;
      let lastFpsTime = 0;
      let currentFps = 0;
      let countdownActive = false;
      let gameStarted = false;
      let showMessage = false;
      let messageTimer = 0;
      const messageDuration = 2000; // Display message for 2 seconds
      let lastMilestone = 0; // Track the last milestone reached
      const milestoneInterval = 20; // Trigger a message every 20 points

      // Mist effect variables
      let mistActive = false;
      let mistTimer = 0;
      const mistDuration = 8000; // 8 seconds in milliseconds
      let lastMistScore = 0; // Track the last score when mist was triggered
      let showMistMessage = false;
      let mistMessageTimer = 0;
      const mistMessageDuration = 2000; // Display mist message for 2 seconds
      
      // Time-based mist system (after first desert scene)
      let mistTimeBased = false; // Switch to time-based mist after first desert scene
      let lastMistTime = 0; // Track when last mist occurred for time intervals
      const mistTimeInterval = 8000; // 8 seconds between mists
      let radarSpawnedThisMist = false; // Track if radar was already spawned in current mist
      
      // Radar hint variables (shown when mist starts)
      let showRadarHint = false;
      let radarHintTimer = 0;
      const radarHintDuration = 3000; // Display radar hint for 3 seconds
      
      // Desert message variables
      let showDesertMessage = false;
      let desertMessageTimer = 0;
      const desertMessageDuration = 2000; // Display desert message for 2 seconds
      
      // Radar effect variables
      let radarActive = false;
      let radarTimer = 0;
      const radarDuration = 8000; // 8 seconds in milliseconds
      
      // Ludvig superpower effect variables
      let ludvigActive = false;
      let ludvigTimer = 0;
      const ludvigDuration = 6000; // 6 seconds in milliseconds
      let lastLudvigSpawn = 0; // Track when last Ludvig was spawned to prevent too frequent spawning
      const ludvigSpawnCooldown = 8000; // 8 seconds minimum between Ludvig spawns
      
      // Desert scene variables
      let desertSceneActive = false;
      let desertSceneTimer = 0;
      const desertSceneDuration = 8000; // 8 seconds in milliseconds
      let desertSoundStarted = false;
      let firstRadarCompleted = false;
      let preDesertTrackSpeed = 600; // Will be updated to current speed when desert scene starts
      let preDesertPlayerSpeed = 700; // Will be updated to current speed when desert scene starts
      
      // Desert obstacle spawning variables
      const desertObstacles = [];
      const desertObstacleFrequency = 750; // 2x more frequent than regular (1500/2)
      let lastDesertObstacleTime = 0;
      
      // Desert collectible spawning variables (more frequent due to gold bars)
      const desertCollectibleFrequency = 1200; // More frequent to accommodate gold bars (1500ms -> 1200ms)
      let lastDesertCollectibleTime = 0;
      
      // Solan car obstacle spawning counter
      let solanObstacleCounter = 0;
      
      // Track what caused game over
      let gameOverCause = 'default';
      
      // Side obstacle spawning pattern - alternating both sides with opposite flows
      const sidePattern = ['mountain', 'tree', 'tree', 'stand']; // 4-step repeating cycle
      let leftSidePatternIndex = 0; // Left side starts with mountain
      let rightSidePatternIndex = 2; // Right side starts with tree (offset for opposite pattern)
      const milestoneMessages = [
        "Schwinge med schweiva!!", // 20
        "Din bil, schenial!", // 40
        "Kjøra, kjøra, farli' norsk hengebro!", // 60
        "Ali! - !Ali -!Ali!", // 80
        "Shalam - Shalam!", // 100
      ]; // Array of messages for each milestone

      // Player name (now handled in multi-step flow above)

      // Leaderboard management
      const LEADERBOARD_KEY = "grandPrixLeaderboard";
      let leaderboard = [];
      
      // Firebase leaderboard reference
      let leaderboardRef = null;
      if (firebaseEnabled) {
        leaderboardRef = database.ref('leaderboard');
      }

      // Audio unlock state
      let audioUnlocked = false;
      
      // Function to unlock audio on user interaction (for Safari/iOS)
      function unlockAudio() {
        if (!audioUnlocked) {
          // Create a short silent audio to unlock the audio context
          const unlockSound = new Howl({
            src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmcfCU2X3/CMeS0GIXTy+dN5NQYa3/y7+9l0MwYf7q+x8Jd3+O8H5jmjnwx1K4TQ4cqHbR/dSS1lJC2jtNDJhGwb1sVl+5wF'],
            volume: 0,
          });
          unlockSound.play();
          audioUnlocked = true;
          console.log('Audio unlocked for browser compatibility');
        }
      }

      // Background music setup
      const backgroundMusic = new Howl({
        src: ["racing-down-the-mountain.mp3", "racing-down-the-mountain.ogg"], // Multiple formats for compatibility
        loop: true,
        volume: 0.2,
        autoplay: false,
        html5: false, // Use Web Audio for background music (better for looping)
        pool: 1, // Limit pool size to prevent exhaustion
        onloaderror: function(id, error) {
          console.warn('Background music failed to load:', error);
        },
        onplayerror: function(id, error) {
          console.warn('Background music failed to play:', error);
        }
      });

      // Countdown beep sound setup
      const countdownBeep = new Howl({
        src: ["short-beep-countdown.mp3", "notification-sound-effect.mp3"], // Fallback to working sound
        volume: 0.7,
        autoplay: false,
        html5: false, // Use Web Audio for better performance
        pool: 2, // Small pool to prevent exhaustion
        onloaderror: function(id, error) { 
          console.warn('Countdown beep failed to load:', error); 
        },
        onplayerror: function(id, error) { 
          console.warn('Countdown beep failed to play:', error); 
        }
      });

      // Milestone sound - mobile-friendly configuration
      const milestoneSound = new Howl({
        src: ["schwinge-i-sweiva.mp3", "notification-sound-effect.mp3"], // Use schwinge-i-sweiva with fallback
        volume: isMobile() ? 0.9 : 0.8, // Slightly louder on mobile
        loop: false,
        autoplay: false,
        html5: isMobile(), // Use HTML5 on mobile for better compatibility
        pool: 2, // Small pool to prevent exhaustion
        preload: true, // Preload for mobile
        onload: function() {
          console.log('✅ Milestone sound (schwinge-i-sweiva.mp3) loaded successfully');
        },
        onloaderror: function(id, error) { 
          console.warn('❌ Milestone sound failed to load:', error);
        },
        onplay: function() {
          console.log('🔊 Milestone sound (schwinge-i-sweiva) playing');
        },
        onplayerror: function(id, error) { 
          console.warn('❌ Milestone sound failed to play:', error); 
        }
      });

      // Salam-salam sound for specific milestones - optimized for performance
      const salamSalamSound = new Howl({
        src: ["salam-salam.mp3", "notification-sound-effect.mp3"], // Use salam-salam with fallback
        volume: isMobile() ? 0.8 : 0.7, // Optimized volume
        loop: false,
        autoplay: false,
        html5: false, // Use Web Audio for better performance
        pool: 1, // Single instance for better performance
        preload: true, // Preload for immediate playback
        format: ['mp3'], // Specify format for better loading
        onload: function() {
          console.log('✅ Salam-salam sound (salam-salam.mp3) loaded and ready');
        },
        onloaderror: function(id, error) { 
          console.warn('❌ Salam-salam sound failed to load:', error);
        },
        onplay: function() {
          console.log('🔊 Salam-salam sound playing');
        },
        onplayerror: function(id, error) { 
          console.warn('❌ Salam-salam sound failed to play:', error); 
        }
      });

      // Game over sounds - default and desperados
      let gameOverSound;
      let desperadosGameOverSound;
      
      try {
        gameOverSound = new Howl({
          src: ["suppehue.mp3"],
          volume: 0.8,
          loop: false,
          autoplay: false,
          html5: true, // Use HTML5 for this specific file (may work better)
          pool: 1, // Single instance for game over
          preload: true, // Preload to catch errors early
          onload: function() {
            console.log('Game over sound (suppehue.mp3) loaded successfully');
          },
          onloaderror: function(id, error) { 
            console.warn('Game over sound (suppehue.mp3) failed to load:', error);
            console.warn('Creating fallback game over sound');
            // Create fallback sound
            gameOverSound = new Howl({
              src: ["notification-sound-effect.mp3"],
              volume: 0.8,
              loop: false,
              autoplay: false,
              html5: false,
              pool: 1
            });
          },
          onplayerror: function(id, error) { 
            console.warn('Game over sound failed to play:', error); 
          }
        });
        
        // Desperados game over sound (for Solan car)
        desperadosGameOverSound = new Howl({
          src: ["desperados-kjefte.mp3"],
          volume: 0.8,
          loop: false,
          autoplay: false,
          html5: true,
          pool: 1,
          preload: true,
          onload: function() {
            console.log('Desperados game over sound loaded successfully');
          },
          onloaderror: function(id, error) { 
            console.warn('Desperados game over sound failed to load:', error);
          },
          onplayerror: function(id, error) { 
            console.warn('Desperados game over sound failed to play:', error); 
          }
        });
      } catch (e) {
        console.warn('Error creating game over sound, using fallback:', e);
        gameOverSound = new Howl({
          src: ["notification-sound-effect.mp3"],
          volume: 0.8,
          loop: false,
          autoplay: false,
          html5: false,
          pool: 1
        });
        desperadosGameOverSound = gameOverSound; // Use same fallback
      }

      // Point collection sound
      const pointSound = new Howl({
        src: ["notification-sound-effect.mp3"],
        volume: 0.6,
        loop: false,
        autoplay: false,
        html5: false, // Use Web Audio for better performance
        pool: 3, // Allow multiple simultaneous point sounds
        onloaderror: function(id, error) { 
          console.warn('Point sound failed to load:', error); 
        },
        onplayerror: function(id, error) { 
          console.warn('Point sound failed to play:', error); 
        }
      });

      // Radar sound - mobile-friendly configuration
      const radarSound = new Howl({
        src: ["radar.mp3", "notification-sound-effect.mp3"], // Use radar.mp3 with fallback
        volume: isMobile() ? 0.8 : 0.7, // Slightly louder on mobile
        loop: true, // Loop the radar sound during mist effect
        autoplay: false,
        html5: isMobile(), // Use HTML5 on mobile for better compatibility
        pool: 1, // Single instance for radar
        preload: true, // Preload for mobile
        onload: function() {
          console.log('✅ Radar sound loaded successfully');
        },
        onloaderror: function(id, error) { 
          console.warn('❌ Radar sound failed to load:', error);
        },
        onplay: function() {
          console.log('🔊 Radar sound started playing');
        },
        onplayerror: function(id, error) { 
          console.warn('❌ Radar sound failed to play:', error); 
        },
        onstop: function() {
          console.log('⏹️ Radar sound stopped');
        }
      });

      // Sabotage sound for mist effect
      let sabotageSound;
      try {
        sabotageSound = new Howl({
          src: ["sabotage-scene.mp3", "notification-sound-effect.mp3"], // Fixed filename with fallback
          volume: 1.0, // Maximum volume to be louder than background music
          loop: true, // Loop during mist effect
          autoplay: false,
          html5: true, // Use HTML5 for better compatibility
          pool: 1, // Single instance for sabotage
          preload: true, // Preload to catch errors early
          onload: function() {
            console.log('✅ Sabotage sound (sabotage-scene.mp3) loaded successfully');
          },
          onloaderror: function(id, error) { 
            console.error('❌ Sabotage sound failed to load:', error);
            console.log('🔄 Will try fallback sound when playing');
          },
          onplay: function() {
            console.log('🔊 Sabotage sound started playing successfully');
          },
          onplayerror: function(id, error) { 
            console.error('❌ Sabotage sound failed to play:', error); 
          },
          onstop: function() {
            console.log('⏹️ Sabotage sound stopped');
          }
        });
        console.log('Sabotage sound object created successfully');
      } catch (e) {
        console.error('❌ Error creating sabotage sound:', e);
        // Create a minimal fallback
        sabotageSound = {
          play: () => console.warn('Sabotage sound fallback - no audio'),
          stop: () => {},
          state: () => 'unloaded'
        };
      }

      // Desert scene sound
      let desertSound;
      let aladdinOilSound;
      try {
        desertSound = new Howl({
          src: ["flaklypa-stille-som-orken.mp3"],
          volume: 1.0, // Primary desert sound - maximum volume for full immersion
          loop: false,
          autoplay: false,
          html5: false, // Use Web Audio for better timing precision
          pool: 1,
          preload: true,
          onload: function() {
            console.log('✅ Desert sound (flaklypa-stille-som-orken.mp3) loaded successfully');
            console.log('🎵 Desert sound duration:', desertSound.duration(), 'seconds');
          },
          onloaderror: function(id, error) { 
            console.error('❌ Desert sound failed to load:', error);
          },
          onplay: function() {
            console.log('🔊 Desert sound started playing (primary audio)');
          },
          onplayerror: function(id, error) { 
            console.error('❌ Desert sound failed to play:', error); 
          },
          onstop: function() {
            console.log('⏹️ Desert sound stopped');
          },
          onend: function() {
            console.log('🔊 flaklypa-stille-som-orken.mp3 ended naturally');
          }
        });

        aladdinOilSound = new Howl({
          src: ["aladdin-oil.mp3"],
          volume: 0.15, // Background volume - very low so primary desert sound dominates
          loop: true, // Loop for continuous background atmosphere
          autoplay: false,
          html5: false, // Use Web Audio for better timing precision
          pool: 1,
          preload: true,
          onload: function() {
            console.log('✅ Aladdin oil sound (aladdin-oil.mp3) loaded successfully');
            console.log('🎵 Aladdin oil sound duration:', aladdinOilSound.duration(), 'seconds');
          },
          onloaderror: function(id, error) { 
            console.error('❌ Aladdin oil sound failed to load:', error);
          },
          onplay: function() {
            console.log('🔊 Aladdin oil sound started playing (background audio, volume 0.15)');
          },
          onplayerror: function(id, error) { 
            console.error('❌ Aladdin oil sound failed to play:', error); 
          },
          onstop: function() {
            console.log('⏹️ Aladdin oil sound stopped');
          },
          onend: function() {
            console.log('🔊 aladdin-oil.mp3 ended naturally (will loop)');
          }
        });
      } catch (e) {
        console.error('❌ Error creating desert sounds:', e);
        desertSound = {
          play: () => console.warn('Desert sound fallback - no audio'),
          stop: () => {},
          state: () => 'unloaded',
          playing: () => false,
          duration: () => 0
        };
        aladdinOilSound = {
          play: () => console.warn('Aladdin oil sound fallback - no audio'),
          stop: () => {},
          state: () => 'unloaded',
          playing: () => false,
          duration: () => 0
        };
      }

      // Function to check if desert sounds are ready
      function areDesertSoundsReady() {
        const desertReady = desertSound && desertSound.state() === 'loaded';
        const aladdinReady = aladdinOilSound && aladdinOilSound.state() === 'loaded';
        console.log('🎵 Desert sounds ready check - Desert:', desertReady, 'Aladdin:', aladdinReady);
        return desertReady && aladdinReady;
      }

      // Test sabotage sound function (for debugging)
      function testSabotageSound() {
        console.log('🧪 TESTING SABOTAGE SOUND');
        console.log('🔍 Sound state:', sabotageSound ? sabotageSound.state() : 'undefined');
        if (sabotageSound && typeof sabotageSound.play === 'function') {
          try {
            sabotageSound.play();
            console.log('✅ Test play initiated');
          } catch (e) {
            console.error('❌ Test play failed:', e);
          }
        } else {
          console.error('❌ Sabotage sound not available for testing');
        }
      }

      // Test milestone sound function (for debugging)
      function testMilestoneSound() {
        console.log('🧪 TESTING MILESTONE SOUND');
        console.log('🔍 Sound state:', milestoneSound ? milestoneSound.state() : 'undefined');
        if (milestoneSound && typeof milestoneSound.play === 'function') {
          try {
            milestoneSound.play();
            console.log('✅ Test milestone sound play initiated');
          } catch (e) {
            console.error('❌ Test milestone sound play failed:', e);
          }
        } else {
          console.error('❌ Milestone sound not available for testing');
        }
      }

      // Make test functions available globally for console debugging
      window.testSabotageSound = testSabotageSound;
      window.testMilestoneSound = testMilestoneSound;

      // Function to update the leaderboard display
      function updateLeaderboardDisplay() {
        updateLeaderboardList(leaderboardList);
        updateLeaderboardList(startLeaderboardList);
      }
      
      // Helper function to update a specific leaderboard list
      function updateLeaderboardList(listElement) {
        if (!listElement) return;
        
        listElement.innerHTML = "";
        
        if (leaderboard.length === 0) {
          const li = document.createElement("li");
          li.textContent = "Loading scores...";
          li.style.color = "#888";
          listElement.appendChild(li);
          return;
        }
        
        leaderboard.forEach((entry, index) => {
          const li = document.createElement("li");
          li.textContent = `${index + 1}. ${entry.name} (${entry.car}): ${entry.score}`;
          listElement.appendChild(li);
        });
      }

      // Function to add a score to the leaderboard
      function addToLeaderboard(name, score, car = selectedCarName) {
        const scoreEntry = {
          name: name,
          score: score,
          car: car,
          timestamp: Date.now(),
          date: new Date().toISOString()
        };

        if (firebaseEnabled && leaderboardRef) {
          // Add to Firebase
          leaderboardRef.push(scoreEntry)
            .then(() => {
              console.log('✅ Score saved to Firebase successfully');
            })
            .catch((error) => {
              console.error('❌ Error saving score to Firebase:', error);
              // Fallback to localStorage
              addToLocalLeaderboard(name, score, car);
            });
        } else {
          // Fallback to localStorage
          addToLocalLeaderboard(name, score, car);
        }
      }

      // Fallback localStorage function
      function addToLocalLeaderboard(name, score, car) {
        const localLeaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
        localLeaderboard.push({ name, score, car, timestamp: Date.now() });
        localLeaderboard.sort((a, b) => b.score - a.score);
        const topScores = localLeaderboard.slice(0, 10);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
        leaderboard = topScores;
        updateLeaderboardDisplay();
      }

      // Initialize Firebase real-time leaderboard listener
      function initializeLeaderboard() {
        console.log('🏆 Firebase enabled:', firebaseEnabled, 'leaderboardRef:', !!leaderboardRef);
        if (firebaseEnabled && leaderboardRef) {
          // Listen for real-time updates
          leaderboardRef.orderByChild('score').limitToLast(10).on('value', (snapshot) => {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
              scores.push(childSnapshot.val());
            });
            
            // Reverse to get highest scores first
            leaderboard = scores.reverse();
            updateLeaderboardDisplay();
          }, (error) => {
            console.error('❌ Error reading from Firebase:', error);
            // Load from localStorage as fallback
            loadLocalLeaderboard();
          });
        } else {
          // Load from localStorage
          loadLocalLeaderboard();
        }
      }

      // Load leaderboard from localStorage (fallback)
      function loadLocalLeaderboard() {
        console.log('🏆 Loading local leaderboard...');
        const localLeaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
        leaderboard = localLeaderboard.slice(0, 10);
        console.log('🏆 Local leaderboard loaded:', leaderboard.length, 'entries');
        updateLeaderboardDisplay();
      }

      // Initialize leaderboard display on page load
      console.log('🏆 Initializing leaderboard...');
      initializeLeaderboard();

      // Mobile-specific functions
      function isMobile() {
        return window.innerWidth <= 768 || "ontouchstart" in window;
      }

      function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Set canvas internal dimensions to match display size
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);

        // Reset player position for current canvas size
        if (gameStarted) {
          const canvasDisplayWidth = rect.width;
          const canvasDisplayHeight = rect.height;
          
          // Keep player within canvas boundaries (not just track)
          player.x = Math.max(0, Math.min(player.x, canvasDisplayWidth - player.width));
          player.y = Math.min(player.y, canvasDisplayHeight - player.height);

          // Ensure player stays within canvas
          if (player.x < 0) player.x = 0;
          if (player.y < 0) player.y = canvasDisplayHeight - player.height - 20;
        }
      }

      // Tap control variables for mobile (Flappy Bird style)
      let tapControls = {
        leftTap: false,
        rightTap: false,
      };

      // Haptic feedback function
      function hapticFeedback() {
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
      }

      // F1-Style Countdown Function
      function startF1Countdown() {
        countdownActive = true;
        gameStarted = false;

        // Show countdown overlay
        countdownOverlay.style.display = "flex";

        // Reset all lights
        f1Lights.forEach((light) => light.classList.remove("active"));
        countdownText.textContent = "";

        // Countdown sequence: 1-2-3-GO (perfectly synced with beep audio)
        setTimeout(() => {
          countdownBeep.play();
          f1Lights[0].classList.add("active");
          countdownText.textContent = "1";
        }, 1000);

        setTimeout(() => {
          countdownBeep.play();
          f1Lights[1].classList.add("active");
          countdownText.textContent = "2";
        }, 2000);

        setTimeout(() => {
          countdownBeep.play();
          f1Lights[2].classList.add("active");
          countdownText.textContent = "3";
        }, 3000);

        setTimeout(() => {
          countdownBeep.play();
          countdownText.innerHTML = '<div id="goText">GO!</div>';

          // All lights go OFF after brief moment (authentic F1 style)
          setTimeout(() => {
            countdownBeep.stop();
            f1Lights.forEach((light) => light.classList.remove("active"));

            // Start game immediately after lights go off
            countdownOverlay.style.display = "none";
            countdownActive = false;
            gameStarted = true;

            // Add game-active class to prevent touch interactions during gameplay
            document.body.classList.add("game-active");

            // Start background music and game loop
            backgroundMusic.play();

            // Reset music speed to normal for new game
            backgroundMusic.rate(1.0);

            // Reset timing variables properly for new game
            lastTime = performance.now();
            gameTime = 0;

            requestAnimationFrame(update);
          }, 300);
        }, 4000);
      }

      // Function to update background music speed based on milestones
      function updateMusicSpeed() {
        const milestonesReached = Math.floor(score / milestoneInterval);
        const speedIncrease = milestonesReached * 0.05; // 5% increase per milestone
        const maxSpeedIncrease = 0.25; // Cap at 25% faster (1.25x)
        const finalSpeedIncrease = Math.min(speedIncrease, maxSpeedIncrease);
        const newMusicRate = 1.0 + finalSpeedIncrease;

        // Apply new music speed
        if (backgroundMusic && backgroundMusic.playing()) {
          backgroundMusic.rate(newMusicRate);
        }
      }

      // Game speed constants (pixels per second for consistent speed across devices)
      const BASE_TRACK_SPEED = 600; // starting speed in pixels per second
      const BASE_PLAYER_SPEED = 700; // starting speed in pixels per second
      const SPEED_INCREASE_PER_POINT = 10; // pixels per second increase per point (aggressive difficulty scaling)
      const SPEED_INCREASE_PER_10_SECONDS = 8; // pixels per second increase every 10 seconds
      const MAX_SPEED_MULTIPLIER = 8; // maximum speed (8x base speed for extreme challenge)

      // Function to update game speed based on score and time
      function updateGameSpeed() {
        const pointSpeedIncrease = (score / 10) * SPEED_INCREASE_PER_POINT;
        const timeSpeedIncrease =
          Math.floor(gameTime / 10000) * SPEED_INCREASE_PER_10_SECONDS; // every 10 seconds
        
        // Add extra speed boost after 80 points
        let extraSpeedBoost = 0;
        if (score >= 80) {
          extraSpeedBoost = 200; // Significant speed increase after 80 points
        }
        
        const totalSpeedIncrease = pointSpeedIncrease + timeSpeedIncrease + extraSpeedBoost;

        const maxTrackSpeed = BASE_TRACK_SPEED * MAX_SPEED_MULTIPLIER;
        const maxPlayerSpeed = BASE_PLAYER_SPEED * MAX_SPEED_MULTIPLIER;

        currentTrackSpeed = Math.min(
          BASE_TRACK_SPEED + totalSpeedIncrease,
          maxTrackSpeed
        );
        currentPlayerSpeed = Math.min(
          BASE_PLAYER_SPEED + totalSpeedIncrease,
          maxPlayerSpeed
        );

        // Update player object speeds
        player.speedX = currentPlayerSpeed;
        player.speedY = currentPlayerSpeed;
      }

      // Dynamic speed variables
      let currentTrackSpeed = BASE_TRACK_SPEED;
      let currentPlayerSpeed = BASE_PLAYER_SPEED;

      // Il Tempo Gigante (player car) - initialized with mobile-friendly size
      const getPlayerDimensions = () => {
        if (selectedCar === 'solan-propell-sykkel') {
          return { width: 180, height: 100 }; // Landscape dimensions
        }
        return { width: 100, height: 180 }; // Portrait dimensions
      };
      
      const initialDimensions = getPlayerDimensions();
      
      // Initialize player with device-specific positioning
      function getInitialPlayerPosition() {
        const rect = canvas.getBoundingClientRect();
        const canvasDisplayWidth = rect.width || 800; // Fallback width
        const canvasDisplayHeight = rect.height || 600; // Fallback height
        
        const x = canvasDisplayWidth / 2 - initialDimensions.width / 2;
        let y;
        
        if (isMobile()) {
          // Mobile: 80% down from top
          y = (canvasDisplayHeight * 0.8) - initialDimensions.height / 2;
        } else {
          // Desktop: bottom center
          y = canvasDisplayHeight - initialDimensions.height - 20;
        }
        
        return { x, y };
      }
      
      const initialPosition = getInitialPlayerPosition();
      const player = {
        x: initialPosition.x,
        y: initialPosition.y,
        width: initialDimensions.width,
        height: initialDimensions.height,
        speedX: BASE_PLAYER_SPEED,
        speedY: BASE_PLAYER_SPEED,
        dx: 0,
        dy: 0,
      };

      // Track, obstacles, and collectibles
      let trackY = 0;
      const obstacles = [];
      const sideObstacles = []; // New array for side obstacles
      const mountainTrees = []; // Array for mountain trees on sides
      const collectibles = [];
      const obstacleFrequency = 1500;
      const collectibleFrequency = 2000;
      const sideObstacleFrequency = 500; // Side obstacles spawn much more frequently for closer spacing
      let lastObstacleTime = 0;
      let lastCollectibleTime = 0;
      let lastSideObstacleTime = 0;

      // Keyboard controls
      const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
      };
      document.addEventListener("keydown", (e) => {
        if (e.key in keys) {
          e.preventDefault(); // Prevent default scrolling behavior
          keys[e.key] = true;
        }
      });
      document.addEventListener("keyup", (e) => {
        if (e.key in keys) {
          e.preventDefault(); // Prevent default scrolling behavior
          keys[e.key] = false;
        }
      });

      // Add restart functionality with 'R' key during game over
      document.addEventListener("keydown", (e) => {
        if (gameOver && (e.key === 'r' || e.key === 'R')) {
          e.preventDefault();
          resetGame();
          console.log('Game restarted with R key');
        }
      });

      // Simple tap handlers for mobile (precise movement)
      function handleTap(side) {
        if (!gameStarted || gameOver) return;
        
        // Get current canvas boundaries
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        const canvasDisplayHeight = canvas.getBoundingClientRect().height;
        
        // Calculate precise tap movement distance (same perfect sensitivity)
        const tapDistance = isMobile() ? 30 : 50;
        
        // Apply immediate position change (not velocity)
        if (side === 'left' && player.x > 0) {
          player.x = Math.max(0, player.x - tapDistance);
        } else if (side === 'right' && player.x < canvasDisplayWidth - player.width) {
          player.x = Math.min(canvasDisplayWidth - player.width, player.x + tapDistance);
        } else if (side === 'up' && player.y > 0) {
          player.y = Math.max(0, player.y - tapDistance);
        } else if (side === 'down' && player.y < canvasDisplayHeight - player.height) {
          player.y = Math.min(canvasDisplayHeight - player.height, player.y + tapDistance);
        }
        
        // Provide haptic feedback
        hapticFeedback();
        
        console.log(`Tap ${side}: moved to x=${player.x}, y=${player.y}`);
      }

      // Enhanced touch zone tap events with 4-directional support
      function addTouchZoneEvents(element, direction) {
        element.addEventListener("touchstart", (e) => {
          e.preventDefault();
          element.classList.add("active");
          handleTap(direction);
        });

        element.addEventListener("touchend", (e) => {
          e.preventDefault();
          element.classList.remove("active");
        });

        element.addEventListener("touchcancel", (e) => {
          e.preventDefault();
          element.classList.remove("active");
        });
      }

      // Add canvas-wide tap detection for up/down
      canvas.addEventListener("touchstart", (e) => {
        if (!gameStarted || gameOver) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const canvasWidth = rect.width;
        const canvasHeight = rect.height;
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Divide screen into zones: left 1/3, right 1/3, top 1/3, bottom 1/3
        const leftThird = canvasWidth / 3;
        const rightThird = (canvasWidth * 2) / 3;
        const topThird = canvasHeight / 3;
        const bottomThird = (canvasHeight * 2) / 3;
        
        // Determine direction based on tap position
        if (x < leftThird) {
          handleTap('left');
        } else if (x > rightThird) {
          handleTap('right');
        } else if (y < topThird) {
          handleTap('up');
        } else if (y > bottomThird) {
          handleTap('down');
        }
        // Middle area does nothing (safe zone)
      });

      // Apply events to existing left/right zones (for backward compatibility)
      addTouchZoneEvents(touchZoneLeft, 'left');
      addTouchZoneEvents(touchZoneRight, 'right');

      // Prevent context menu on long press
      touchZoneLeft.addEventListener("contextmenu", (e) => e.preventDefault());
      touchZoneRight.addEventListener("contextmenu", (e) => e.preventDefault());

      // Create an obstacle
      function createObstacle() {
        let width = isMobile() ? 50 : 60;
        let height = isMobile() ? 50 : 60;
        
        // Determine obstacle type based on selected car
        let obstacleType = 'blodstrupmoen'; // default
        if (selectedCar === 'solan-propell-sykkel') {
          solanObstacleCounter++;
          // Every third obstacle should be blodstrupmoen, others are desperados
          if (solanObstacleCounter % 3 === 0) {
            obstacleType = 'blodstrupmoen';
          } else {
            obstacleType = 'desperados';
            // Make desperados obstacles wider
            width = isMobile() ? 80 : 100;
          }
        } else if (selectedCar === 'boomerang-rapido') {
          // Use reodor obstacles for Boomerang Rapido
          obstacleType = 'reodor';
        }
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        obstacles.push({ x, y: -50, width, height, type: obstacleType });
      }

      // Create elements on both sides following alternating patterns
      function createSideElements() {
        // Only spawn during normal scenes (not desert)
        if (desertSceneActive) return;
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Calculate track boundaries
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackRight = trackLeft + (canvasDisplayWidth * trackWidthRatio);
        
        // Helper function to check if a position collides with existing elements
        function checkCollision(x, y, width, height, side) {
          const buffer = 20; // Minimum distance between elements
          
          // Check against side obstacles (stands)
          for (let obstacle of sideObstacles) {
            if (obstacle.side === side && 
                obstacle.y > -obstacle.height - 100 && // Only check recent obstacles
                x < obstacle.x + obstacle.width + buffer &&
                x + width > obstacle.x - buffer &&
                y < obstacle.y + obstacle.height + buffer &&
                y + height > obstacle.y - buffer) {
              return true;
            }
          }
          
          // Check against mountain trees (mountains and trees)
          for (let tree of mountainTrees) {
            if (tree.side === side && 
                tree.y > -tree.height - 100 && // Only check recent elements
                x < tree.x + tree.width + buffer &&
                x + width > tree.x - buffer &&
                y < tree.y + tree.height + buffer &&
                y + height > tree.y - buffer) {
              return true;
            }
          }
          
          return false;
        }

        // Helper function to create an element on a specific side
        function createElement(side, elementType) {
          // Determine dimensions based on element type (made wider as requested)
          let width, height;
          const safetyMargin = 15; // Increased margin for wider elements
          
          if (elementType === 'mountain') {
            width = isMobile() ? 80 : 120; // Wider than before
            height = isMobile() ? 100 : 140;
          } else if (elementType === 'tree') {
            width = isMobile() ? 70 : 90; // Wider than before
            height = isMobile() ? 90 : 130;
          } else { // stand
            width = isMobile() ? 40 : 85; // Keep width smaller to avoid track overlap
            height = isMobile() ? 120 : 140; // Much taller base height
            const widthMultiplier = isMobile() ? 1.5 : 2; // Apply multiplier only to width
            const heightMultiplier = isMobile() ? 2 : 3; // Higher multiplier for height
            width *= widthMultiplier;
            height *= heightMultiplier;
          }
          
          // Calculate position with collision detection
          let x;
          const y = -height; // Starting Y position
          let attempts = 0;
          const maxAttempts = 10;
          let validPosition = false;
          
          while (!validPosition && attempts < maxAttempts) {
            if (side === 'left') {
              if (elementType === 'stand') {
                // For stands, ensure they're completely outside track with extra margin
                const extraMargin = 20; // Additional margin for large stands
                const availableSpace = trackLeft - width - safetyMargin - extraMargin;
                if (availableSpace > 0) {
                  x = Math.random() * availableSpace;
                } else {
                  // If no space, place at edge with minimum safe distance
                  x = Math.max(0, trackLeft - width - safetyMargin - extraMargin);
                }
              } else {
                // Mountains and trees use normal positioning
                const availableSpace = trackLeft - width - safetyMargin;
                x = availableSpace > 0 ? Math.random() * availableSpace : 0;
              }
            } else {
              if (elementType === 'stand') {
                // For stands, ensure they're completely outside track with extra margin
                const extraMargin = 20; // Additional margin for large stands
                const minX = trackRight + safetyMargin + extraMargin;
                const availableSpace = canvasDisplayWidth - minX - width;
                if (availableSpace > 0) {
                  x = minX + Math.random() * availableSpace;
                } else {
                  // If no space, place at minimum safe distance
                  x = minX;
                }
              } else {
                // Mountains and trees use normal positioning
                const availableSpace = canvasDisplayWidth - trackRight - width - safetyMargin;
                x = availableSpace > 0 ? trackRight + safetyMargin + Math.random() * availableSpace : trackRight + safetyMargin;
              }
            }
            
            // Check for collisions
            if (!checkCollision(x, y, width, height, side)) {
              validPosition = true;
            } else {
              attempts++;
            }
          }
          
          // If we couldn't find a valid position after max attempts, skip spawning this element
          if (!validPosition) {
            return;
          }
          
          // Add to appropriate array based on type
          if (elementType === 'mountain') {
            mountainTrees.push({ x, y, width, height, side, type: 'mountain' });
          } else if (elementType === 'tree') {
            mountainTrees.push({ x, y, width, height, side, type: 'tree' });
          } else { // stand
            sideObstacles.push({ x, y, width, height, side });
          }
        }
        
        // Create elements for both sides based on their current pattern
        const leftElementType = sidePattern[leftSidePatternIndex];
        const rightElementType = sidePattern[rightSidePatternIndex];
        
        createElement('left', leftElementType);
        createElement('right', rightElementType);
        
        // Advance pattern indices (cycle through 0, 1, 2, 3)
        leftSidePatternIndex = (leftSidePatternIndex + 1) % sidePattern.length;
        rightSidePatternIndex = (rightSidePatternIndex + 1) % sidePattern.length;
      }

      // Create a collectible
      function createCollectible() {
        const width = isMobile() ? 50 : 65;
        const height = isMobile() ? 40 : 45;
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        // Determine collectible type based on game state
        let isRadar = false;
        let type = 'oil';
        
        if (mistActive && !radarSpawnedThisMist && !radarActive) {
          // During mist, spawn radar (only once per mist and when radar is not already active)
          isRadar = true;
          type = 'radar';
          radarSpawnedThisMist = true; // Mark that radar has been spawned for this mist
        } else if (score >= 30 && gameTime - lastLudvigSpawn > ludvigSpawnCooldown && Math.random() < 0.15) {
          // Ludvig spawn: 15% chance, only after 30 points, with cooldown
          type = 'ludvig';
          lastLudvigSpawn = gameTime;
        } else {
          // Normal oil lamp
          type = 'oil';
        }
        
        collectibles.push({ x, y: -50, width, height, isRadar, type });
      }

      // Create a desert collectible (gold bars 4x more frequent than oil lamps)
      function createDesertCollectible() {
        const width = isMobile() ? 50 : 65;
        const height = isMobile() ? 40 : 45;
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        // Desert collectibles are never radar
        const isRadar = false;
        
        // 80% chance for gold bar, 20% chance for oil lamp (4:1 ratio)
        const type = Math.random() < 0.8 ? 'gold' : 'oil';
        
        collectibles.push({ x, y: -50, width, height, isRadar, type });
      }

      // Create a desert obstacle (palm or camel)
      function createDesertObstacle() {
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Randomly choose between palm and camel
        const type = Math.random() < 0.5 ? 'palm' : 'camel';
        
        let width, height;
        if (type === 'palm') {
          width = isMobile() ? 60 : 80;
          height = isMobile() ? 90 : 120;
        } else { // camel
          width = isMobile() ? 70 : 90;
          height = isMobile() ? 50 : 70;
        }
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        desertObstacles.push({ x, y: -50, width, height, type });
      }

      // Reset the game state
      function resetGame() {
        score = 0;
        gameOver = false;
        gameTime = 0;
        trackY = 0;
        lastObstacleTime = 0;
        lastCollectibleTime = 0;
        lastSideObstacleTime = 0;
        lastDesertObstacleTime = 0;
        lastDesertCollectibleTime = 0;
        showMessage = false;
        messageTimer = 0;
        showRadarHint = false;
        radarHintTimer = 0;
        obstacles.length = 0;
        sideObstacles.length = 0;
        mountainTrees.length = 0;
        collectibles.length = 0;
        desertObstacles.length = 0;

        // Reset player size and position for current device
        if (selectedCar === 'solan-propell-sykkel') {
          // Special dimensions for Solan (landscape image)
          player.width = 180;
          player.height = 100;
        } else {
          // Default dimensions for other cars (portrait images)
          player.width = 100;
          player.height = 180;
        }
        
        // Get current canvas dimensions
        const rect = canvas.getBoundingClientRect();
        const canvasDisplayWidth = rect.width;
        const canvasDisplayHeight = rect.height;
        
        // Position player based on device type
        player.x = canvasDisplayWidth / 2 - player.width / 2; // Always center horizontally
        
        if (isMobile()) {
          // Mobile: 80% down from top
          player.y = (canvasDisplayHeight * 0.8) - player.height / 2;
        } else {
          // Desktop: center bottom with margin
          player.y = canvasDisplayHeight - player.height - 20;
        }

        player.dx = 0;
        player.dy = 0;
        isMoving = false; // Reset movement state
        countdownActive = false;
        gameStarted = false;

        // Reset FPS counter variables
        frameCount = 0;
        lastFpsTime = 0;
        currentFps = 0;

        // Reset mist effect variables
        mistActive = false;
        mistTimer = 0;
        lastMistScore = 0;
        showMistMessage = false;
        mistMessageTimer = 0;
        mistTimeBased = false;
        lastMistTime = 0;
        radarSpawnedThisMist = false;
        
        // Reset desert message variables
        showDesertMessage = false;
        desertMessageTimer = 0;
        
        // Reset radar effect variables
        radarActive = false;
        radarTimer = 0;
        
        // Reset Ludvig superpower variables
        ludvigActive = false;
        ludvigTimer = 0;
        lastLudvigSpawn = 0;
        
        // Reset desert scene variables
        desertSceneActive = false;
        desertSceneTimer = 0;
        desertSoundStarted = false;
        firstRadarCompleted = false;
        preDesertTrackSpeed = BASE_TRACK_SPEED;
        preDesertPlayerSpeed = BASE_PLAYER_SPEED;
        
        // Reset Solan obstacle counter
        solanObstacleCounter = 0;
        
        // Reset game over cause
        gameOverCause = 'default';
        
        // Reset side element pattern indices
        leftSidePatternIndex = 0; // Left side starts with mountain
        rightSidePatternIndex = 2; // Right side starts with tree (offset for opposite pattern)

        // Reset speeds to base values
        currentTrackSpeed = BASE_TRACK_SPEED;
        currentPlayerSpeed = BASE_PLAYER_SPEED;
        player.speedX = BASE_PLAYER_SPEED;
        player.speedY = BASE_PLAYER_SPEED;
        gameOverDialog.style.display = "none"; // Hide the dialog on restart
        countdownOverlay.style.display = "none"; // Hide countdown overlay

        // Remove game-over and mist-active classes, add game-active class
        document.body.classList.remove("game-over", "mist-active");
        document.body.classList.add("game-active");

        // Start game immediately without countdown when restarting
        gameStarted = true;

        backgroundMusic.play();

        // Stop all game sounds in case they were playing
        try {
          radarSound.stop();
          sabotageSound.stop();
          
          // Stop desert sounds with state checking for better performance
          if (desertSound && desertSound.playing()) {
            desertSound.stop();
            console.log('⏹️ Desert sound stopped on reset');
          }
          if (aladdinOilSound && aladdinOilSound.playing()) {
            aladdinOilSound.stop();
            console.log('⏹️ Aladdin oil sound stopped on reset');
          }
          
          backgroundMusic.volume(0.2); // Restore original background music volume
          console.log('✅ All game sounds stopped - game reset (background music restored)');
        } catch (e) {
          console.warn('Error stopping game sounds on reset:', e);
        }

        // Reset music speed to normal
        backgroundMusic.rate(1.0);

        // Reset timing variables properly
        lastTime = performance.now();
        gameTime = 0;

        requestAnimationFrame(update);
      }

      // Game over elements
      const gameOverText = document.getElementById("gameOverText");
      const gameOverScore = document.getElementById("gameOverScore");

      // Update game state
      async function update(timestamp) {
        const gameOverImage = document.getElementById("gameOverImage");
        const startButton = document.getElementById("startButton");

        // Don't run game logic during countdown
        if (countdownActive || !gameStarted) {
          requestAnimationFrame(update);
          return;
        }

        if (gameOver) {
          let gameOverImageSrc, gameOverTextContent;
          
          if (gameOverCause === 'desperados') {
            // Special desperados game over
            gameOverImageSrc = "desperados-game-over.png";
            gameOverTextContent = "Game Over, shrablæblæblæblærabæla!";
          } else {
            // Default game over logic
            gameOverImageSrc = score >= 100 ? "ali-ali.png" : "suppehue.gif";
            gameOverTextContent = score >= 100 ? `Game Over, Ali-Ali do kjore bra!🧞` : `Game Over, Suppehua!😵‍💫`;
          }
          
          const gameOverScoreContent = `Final Score: ${score}`;
          
          // Update unified game over dialog elements
          gameOverImage.src = gameOverImageSrc;
          gameOverText.textContent = gameOverTextContent;
          gameOverScore.textContent = gameOverScoreContent;
          
          // Add score to leaderboard
          addToLeaderboard(playerName || "Anonymous", score);

          // Stop background music, radar sound, and sabotage sound on game over
          backgroundMusic.stop();
          radarSound.stop();
          try {
            sabotageSound.stop();
            console.log('Stopped sabotage sound - game over');
          } catch (e) {
            console.warn('Error stopping sabotage sound on game over:', e);
          }

          // Stop desert sounds if game over occurs during desert scene
          try {
            if (desertSound && typeof desertSound.stop === 'function') {
              desertSound.stop();
              console.log('Stopped desert sound - game over');
            }
          } catch (e) {
            console.warn('Error stopping desert sound on game over:', e);
          }
          try {
            if (aladdinOilSound && typeof aladdinOilSound.stop === 'function') {
              aladdinOilSound.stop();
              console.log('Stopped aladdin oil sound - game over');
            }
          } catch (e) {
            console.warn('Error stopping aladdin oil sound on game over:', e);
          }

          // Remove game-active and mist-active classes, add game-over class
          document.body.classList.remove("game-active", "mist-active");
          document.body.classList.add("game-over");

          // Show unified game over dialog for both desktop and mobile
          gameOverDialog.style.display = "flex";
          
          return;
        }

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // Calculate FPS for performance monitoring
        frameCount++;
        if (timestamp - lastFpsTime >= 1000) {
          currentFps = Math.round(
            (frameCount * 1000) / (timestamp - lastFpsTime)
          );
          frameCount = 0;
          lastFpsTime = timestamp;
        }

        // Update game time
        gameTime += deltaTime;
        const seconds = Math.floor(gameTime / 1000);

        // Update game speed continuously (for both time and score increases)
        // Skip speed updates during desert scene to maintain base speed
        if (!desertSceneActive) {
          updateGameSpeed();
        }

        // Update player movement (delta-time based for consistent speed)
        player.dx = 0;
        player.dy = 0;

        // Get canvas boundaries for player movement
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        const canvasDisplayHeight = canvas.getBoundingClientRect().height;

        // Handle keyboard controls - constrain to canvas only (not track)
        if (keys.ArrowLeft && player.x > 0) player.dx = -player.speedX;
        if (keys.ArrowRight && player.x < canvasDisplayWidth - player.width)
          player.dx = player.speedX;
        if (keys.ArrowUp && player.y > 0) player.dy = -player.speedY;
        if (keys.ArrowDown && player.y < canvasDisplayHeight - player.height)
          player.dy = player.speedY;

        // Mobile uses direct position changes via taps (no velocity needed)
        // Desktop still uses keyboard velocity-based movement

        player.x += player.dx * (deltaTime / 1000);
        player.y += player.dy * (deltaTime / 1000);

        // Check if the player is moving
        const wasMoving = isMoving;
        isMoving = player.dx !== 0 || player.dy !== 0; // Moving if dx or dy is non-zero

        // Update track scrolling (delta-time based for consistent speed)
        trackY += currentTrackSpeed * (deltaTime / 1000);
        if (trackY >= canvas.height) trackY = 0;

        // Create obstacles (pause spawning during desert scene)
        if (!desertSceneActive && timestamp - lastObstacleTime > obstacleFrequency) {
          createObstacle();
          lastObstacleTime = timestamp;
        }

        // Create collectibles (normal gameplay) - 3x more frequent during Ludvig effect
        const currentCollectibleFrequency = ludvigActive ? collectibleFrequency / 3 : collectibleFrequency;
        if (!desertSceneActive && timestamp - lastCollectibleTime > currentCollectibleFrequency) {
          createCollectible();
          lastCollectibleTime = timestamp;
        }

        // Create desert collectibles (during desert scene only)
        if (desertSceneActive && timestamp - lastDesertCollectibleTime > desertCollectibleFrequency) {
          createDesertCollectible();
          lastDesertCollectibleTime = timestamp;
        }

        // Create side elements with alternating patterns (pause spawning during desert scene)
        if (!desertSceneActive && timestamp - lastSideObstacleTime > sideObstacleFrequency) {
          createSideElements();
          lastSideObstacleTime = timestamp;
        }

        // Create desert obstacles (only during desert scene, 2x frequency)
        if (desertSceneActive && timestamp - lastDesertObstacleTime > desertObstacleFrequency) {
          createDesertObstacle();
          lastDesertObstacleTime = timestamp;
        }

        // Update obstacles (freeze movement during desert scene)
        if (!desertSceneActive) {
          obstacles.forEach((obstacle) => {
            obstacle.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen obstacles
          for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].y > canvas.height + obstacles[i].height) {
              obstacles.splice(i, 1);
            }
          }
        }

        // Update side obstacles (freeze movement during desert scene)
        if (!desertSceneActive) {
          sideObstacles.forEach((obstacle) => {
            obstacle.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen side obstacles
          for (let i = sideObstacles.length - 1; i >= 0; i--) {
            if (sideObstacles[i].y > canvas.height + sideObstacles[i].height) {
              sideObstacles.splice(i, 1);
            }
          }
        }

        // Update mountain trees (freeze movement during desert scene)
        if (!desertSceneActive) {
          mountainTrees.forEach((tree) => {
            tree.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen mountain trees
          for (let i = mountainTrees.length - 1; i >= 0; i--) {
            if (mountainTrees[i].y > canvas.height + mountainTrees[i].height) {
              mountainTrees.splice(i, 1);
            }
          }
        }

        // Update collectibles (use base speed during desert scene)
        collectibles.forEach((collectible) => {
          const speed = desertSceneActive ? BASE_TRACK_SPEED : currentTrackSpeed;
          collectible.y += speed * (deltaTime / 1000);
        });

        // Update desert obstacles (only move during desert scene)
        if (desertSceneActive) {
          desertObstacles.forEach((obstacle) => {
            obstacle.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen desert obstacles
          for (let i = desertObstacles.length - 1; i >= 0; i--) {
            if (desertObstacles[i].y > canvas.height + desertObstacles[i].height) {
              desertObstacles.splice(i, 1);
            }
          }
        }

        // Collectible collision detection
        collectibles.forEach((collectible, index) => {
          if (
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y
          ) {
            if (collectible.isRadar) {
              // Radar collected - activate green radar screen and clear mist
              radarActive = true;
              radarTimer = radarDuration;
              mistActive = false;
              mistTimer = 0;
              showMistMessage = false;
              mistMessageTimer = 0;
              radarSpawnedThisMist = false; // Reset flag when radar is collected
              
              // Remove mist-active class
              document.body.classList.remove("mist-active");
              
              // Stop sabotage sound when radar is collected and restore background music
              try {
                sabotageSound.stop();
                backgroundMusic.volume(0.2); // Restore original background music volume
                console.log('Stopped sabotage sound - radar collected (background music restored)');
              } catch (e) {
                console.warn('Error stopping sabotage sound:', e);
              }
              
              // Play radar sound when entering radar mode
              try {
                if (radarSound && radarSound.state() === 'loaded') {
                  radarSound.play();
                  console.log('Playing radar sound for radar mode');
                } else {
                  console.warn('Radar sound not ready, attempting to play anyway');
                  radarSound && radarSound.play();
                }
              } catch (e) {
                console.warn('Error playing radar sound:', e);
              }
            } else if (collectible.type === 'ludvig') {
              // Ludvig superpower collected - activate 2x points and 3x oil lamp frequency
              ludvigActive = true;
              ludvigTimer = ludvigDuration;
              
              // Trigger score animation
              scoreDisplay.classList.add("score-animate");
              scoreImage.classList.add("point-animate");

              // Remove animation classes after animation completes
              setTimeout(() => {
                scoreDisplay.classList.remove("score-animate");
                scoreImage.classList.remove("point-animate");
              }, 500);
            } else {
              // Regular collectible - different points based on type, with Ludvig multiplier
              let points = 10; // default for oil lamps
              if (collectible.type === 'gold') {
                points = 20; // gold bars give 20 points
              }
              
              // Apply Ludvig 2x multiplier if active
              if (ludvigActive) {
                points *= 2;
              }
              
              score += points;
              
              // Trigger score animation
              scoreDisplay.classList.add("score-animate");
              scoreImage.classList.add("point-animate");

              // Remove animation classes after animation completes
              setTimeout(() => {
                scoreDisplay.classList.remove("score-animate");
                scoreImage.classList.remove("point-animate");
              }, 500);
            }
            
            collectibles.splice(index, 1);

            // Play point collection sound
            pointSound.play();
          }
        });

        // Check if score reaches exactly 40 points to show radar hint
        if (score === 40 && !showRadarHint) {
          showRadarHint = true;
          radarHintTimer = radarHintDuration;
        }

        // Check for score milestones
        // Trigger a message every time the score is exactly a multiple of milestoneInterval
        // But skip milestone message if mist is active, mist message, desert message is active or if it's a mist trigger (multiples of 50)
        if (score > 0 && score % milestoneInterval === 0 && !showMessage && !showMistMessage && !showDesertMessage && !mistActive && score % 50 !== 0) {
          showMessage = true;
          messageTimer = messageDuration;

          // Play special sound for 20 points milestone
          if (score === 20) {
            try {
              if (milestoneSound && milestoneSound.state() === 'loaded') {
                milestoneSound.play();
                console.log('Playing milestone sound for 20 points');
              } else {
                console.warn('Milestone sound not ready, attempting to play anyway');
                milestoneSound && milestoneSound.play();
              }
            } catch (e) {
              console.warn('Error playing milestone sound:', e);
            }
          }

          // Update music speed for every milestone
          updateMusicSpeed();

          console.log(
            `Milestone reached: ${score}, Message: ${
              milestoneMessages[
                Math.min(
                  Math.floor(score / milestoneInterval) - 1,
                  milestoneMessages.length - 1
                )
              ]
            }`
          );
        }

        // Check for salam-salam milestones (100, 130, 160, 190, etc.)
        // Pattern: starting at 100, then every 30 points
        if (score >= 100 && (score - 100) % 30 === 0 && !desertSceneActive) {
          // Stop any currently playing salam-salam sound before playing new one
          try {
            if (salamSalamSound.playing()) {
              salamSalamSound.stop();
            }
            salamSalamSound.play();
            console.log(`Playing salam-salam sound for ${score} points milestone`);
          } catch (e) {
            console.warn('Error playing salam-salam sound:', e);
          }
        }

        // Update message timer
        if (showMessage) {
          messageTimer -= deltaTime;
          if (messageTimer <= 0) {
            showMessage = false;
          }
        }
        
        // Update radar hint timer
        if (showRadarHint) {
          radarHintTimer -= deltaTime;
          if (radarHintTimer <= 0) {
            showRadarHint = false;
          }
        }

        // Check for mist trigger - two systems: score-based (first mist) and time-based (after desert)
        let shouldTriggerMist = false;
        
        if (!mistTimeBased) {
          // Score-based system: first mist at exactly 50 points only
          if (score === 50 && lastMistScore < 50) {
            shouldTriggerMist = true;
            lastMistScore = score;
          }
        } else {
          // Time-based system: every 8 seconds after first desert scene
          if (gameTime - lastMistTime >= mistTimeInterval) {
            shouldTriggerMist = true;
            lastMistTime = gameTime;
          }
        }
        
        // Trigger mist if conditions are met and not already active or in desert
        if (shouldTriggerMist && !mistActive && !desertSceneActive) {
          mistActive = true;
          mistTimer = mistDuration;
          radarSpawnedThisMist = false; // Reset radar spawn flag for new mist

          // Show mist message with "Dirty tricks" for the full mist duration
          showMistMessage = true;
          mistMessageTimer = mistDuration;

          // Add mist-active class to show radar
          document.body.classList.add("mist-active");

          // Play sabotage sound during mist and lower background music
          console.log('🎵 MIST TRIGGERED - Attempting to play sabotage sound');
          console.log('🔍 Sabotage sound state:', sabotageSound ? sabotageSound.state() : 'undefined');
          
          try {
            // Lower background music volume first
            backgroundMusic.volume(0.05);
            console.log('🔇 Background music volume lowered to 0.05');
            
            if (sabotageSound && typeof sabotageSound.play === 'function') {
              if (sabotageSound.state() === 'loaded') {
                console.log('✅ Sabotage sound is loaded, playing now...');
                const playId = sabotageSound.play();
                console.log('🆔 Sabotage sound play ID:', playId);
                
                // Check if it's actually playing after a short delay
                setTimeout(() => {
                  if (sabotageSound.playing()) {
                    console.log('✅ Sabotage sound confirmed playing');
                  } else {
                    console.error('❌ Sabotage sound not playing despite play() call');
                  }
                }, 100);
              } else {
                console.warn('⚠️ Sabotage sound not loaded, state:', sabotageSound.state());
                console.log('🔄 Attempting to play anyway...');
                sabotageSound.play();
              }
            } else {
              console.error('❌ Sabotage sound object is invalid');
              console.log('🔧 Sabotage sound type:', typeof sabotageSound);
              console.log('🔧 Has play function:', sabotageSound && typeof sabotageSound.play);
            }
          } catch (e) {
            console.error('❌ Critical error playing sabotage sound:', e);
            console.log('📊 Error details:', {
              name: e.name,
              message: e.message,
              stack: e.stack
            });
          }
        }

        // Update mist timer
        if (mistActive) {
          mistTimer -= deltaTime;
          if (mistTimer <= 0) {
            mistActive = false;
            radarSpawnedThisMist = false; // Reset flag when mist ends naturally
            // Remove mist-active class to hide radar
            document.body.classList.remove("mist-active");
            // Stop sabotage sound when mist ends and restore background music
            try {
              sabotageSound.stop();
              backgroundMusic.volume(0.2); // Restore original background music volume
              console.log('Stopped sabotage sound - mist ended (background music restored)');
            } catch (e) {
              console.warn('Error stopping sabotage sound:', e);
            }
          }
        }

        // Update mist message timer
        if (showMistMessage) {
          mistMessageTimer -= deltaTime;
          if (mistMessageTimer <= 0) {
            showMistMessage = false;
          }
        }

        // Update desert message timer
        if (showDesertMessage) {
          desertMessageTimer -= deltaTime;
          if (desertMessageTimer <= 0) {
            showDesertMessage = false;
          }
        }

        // Update Ludvig timer
        if (ludvigActive) {
          ludvigTimer -= deltaTime;
          if (ludvigTimer <= 0) {
            ludvigActive = false;
            console.log('Ludvig superpower ended');
          }
        }

        // Update radar timer
        if (radarActive) {
          radarTimer -= deltaTime;
          if (radarTimer <= 0) {
            radarActive = false;
            // Stop radar sound when radar mode ends
            radarSound.stop();
            
            // Check if this is the first radar completion
            console.log('🧪 Radar ended - firstRadarCompleted:', firstRadarCompleted);
            if (!firstRadarCompleted) {
              firstRadarCompleted = true;
              // Trigger desert scene
              desertSceneActive = true;
              desertSceneTimer = desertSceneDuration;
              desertSoundStarted = false;
              
              // Store current speeds before resetting to base speeds
              preDesertTrackSpeed = currentTrackSpeed;
              preDesertPlayerSpeed = currentPlayerSpeed;
              
              // Reset speeds to base (starting game) speeds during desert scene
              currentTrackSpeed = BASE_TRACK_SPEED;
              currentPlayerSpeed = BASE_PLAYER_SPEED;
              player.speedX = BASE_PLAYER_SPEED;
              player.speedY = BASE_PLAYER_SPEED;
              
              // Clear normal obstacles to show only desert obstacles (palms/camels)
              obstacles.length = 0;
              sideObstacles.length = 0;
              
              console.log('🏜️ DESERT SCENE ACTIVATED - Speeds reset to base values, normal obstacles cleared');
              
              // Trigger desert scene message
              showDesertMessage = true;
              desertMessageTimer = desertMessageDuration;
              console.log('🏜️ Desert message triggered: "Her væra like stille som den ørken"');
              
              // Stop background music immediately but delay desert sound
              try {
                backgroundMusic.stop();
                console.log('🏜️ Desert scene activated - background music stopped');
              } catch (e) {
                console.warn('Error stopping background music for desert scene:', e);
              }
            } else {
              console.log('🏜️ First radar already completed, skipping desert scene');
            }
          }
        }

        // Update desert scene timer
        if (desertSceneActive) {
          desertSceneTimer -= deltaTime;
          
          // Start both desert sounds simultaneously after 0.5 seconds
          if (!desertSoundStarted && desertSceneTimer <= desertSceneDuration - 500) {
            desertSoundStarted = true;
            try {
              // Start primary desert sound (loud and clear)
              if (desertSound && desertSound.state() === 'loaded') {
                desertSound.play();
                console.log('🏜️ Primary desert sound started (0.5 second delay) - volume 1.0');
              } else {
                console.warn('⚠️ Primary desert sound not ready, state:', desertSound ? desertSound.state() : 'undefined');
                desertSound && desertSound.play();
              }
              
              // Start background aladdin sound (low volume)
              if (aladdinOilSound && aladdinOilSound.state() === 'loaded') {
                aladdinOilSound.play();
                console.log('🏜️ Background aladdin sound started (0.5 second delay) - volume 0.15');
              } else {
                console.warn('⚠️ Background aladdin sound not ready, state:', aladdinOilSound ? aladdinOilSound.state() : 'undefined');
                aladdinOilSound && aladdinOilSound.play();
              }
              
              // Preload background music for instant resumption after desert scene
              if (backgroundMusic && backgroundMusic.state() !== 'loaded') {
                console.log('🎵 Preloading background music during desert scene for instant resume');
                backgroundMusic.load();
              }
            } catch (e) {
              console.error('❌ Critical error starting desert sounds:', e);
              console.log('🔄 Attempting fallback desert audio initialization');
              // Fallback: try to play sounds individually with error isolation
              try {
                if (desertSound) {
                  desertSound.play();
                  console.log('✅ Fallback: Primary desert sound started');
                }
              } catch (fallbackError) {
                console.error('❌ Fallback failed for primary desert sound:', fallbackError);
              }
              try {
                if (aladdinOilSound) {
                  aladdinOilSound.play();
                  console.log('✅ Fallback: Background aladdin sound started');
                }
              } catch (fallbackError) {
                console.error('❌ Fallback failed for background aladdin sound:', fallbackError);
              }
            }
          }
          
          if (desertSceneTimer <= 0) {
            desertSceneActive = false;
            
            // Enable time-based mist system after first desert scene completion
            if (!mistTimeBased) {
              mistTimeBased = true;
              lastMistTime = gameTime; // Initialize timer for next mist
              console.log('Desert scene completed - switching to time-based mist system (every 8 seconds)');
            }
            
            // Clear desert obstacles
            desertObstacles.length = 0;
            
            // Restore original speeds from before desert scene
            currentTrackSpeed = preDesertTrackSpeed;
            currentPlayerSpeed = preDesertPlayerSpeed;
            player.speedX = preDesertPlayerSpeed;
            player.speedY = preDesertPlayerSpeed;
            
            console.log('🏜️ Desert scene ended - speeds restored to pre-desert values');
            
            // Restore normal game state
            try {
              // Stop desert sounds with state checking
              if (desertSound && desertSound.playing()) {
                desertSound.stop();
                console.log('⏹️ Desert sound stopped (was playing)');
              }
              if (aladdinOilSound && aladdinOilSound.playing()) {
                aladdinOilSound.stop();
                console.log('⏹️ Aladdin oil sound stopped (was playing)');
              }
              
              // Resume background music (should be preloaded for instant start)
              if (backgroundMusic) {
                if (backgroundMusic.state() === 'loaded') {
                  backgroundMusic.play();
                  console.log('🎵 Background music resumed instantly (preloaded) - state:', backgroundMusic.state());
                } else {
                  console.warn('⚠️ Background music not preloaded, attempting to load and play - state:', backgroundMusic.state());
                  backgroundMusic.once('load', () => {
                    backgroundMusic.play();
                    console.log('🎵 Background music started after loading');
                  });
                  backgroundMusic.load();
                  // Fallback immediate play attempt
                  backgroundMusic.play();
                }
              } else {
                console.error('❌ Background music object not available');
              }
              
              console.log('🏜️ Desert scene ended - all audio restored');
            } catch (e) {
              console.error('❌ Critical error restoring audio after desert scene:', e);
              console.log('🔄 Attempting fallback audio restoration');
              // Fallback: try each audio operation individually
              try {
                if (desertSound && typeof desertSound.stop === 'function') {
                  desertSound.stop();
                  console.log('✅ Fallback: Desert sound stopped');
                }
              } catch (fallbackError) {
                console.error('❌ Fallback failed stopping desert sound:', fallbackError);
              }
              try {
                if (aladdinOilSound && typeof aladdinOilSound.stop === 'function') {
                  aladdinOilSound.stop();
                  console.log('✅ Fallback: Aladdin sound stopped');
                }
              } catch (fallbackError) {
                console.error('❌ Fallback failed stopping aladdin sound:', fallbackError);
              }
              try {
                if (backgroundMusic && typeof backgroundMusic.play === 'function') {
                  backgroundMusic.play();
                  console.log('✅ Fallback: Background music started');
                }
              } catch (fallbackError) {
                console.error('❌ Fallback failed starting background music:', fallbackError);
              }
            }
          }
        }

        // Remove off-screen collectibles
        for (let i = collectibles.length - 1; i >= 0; i--) {
          if (collectibles[i].y > canvas.height + collectibles[i].height) {
            collectibles.splice(i, 1);
          }
        }

        // Obstacle collision detection with reduced collision area for better gameplay
        obstacles.forEach((obstacle) => {
          // Reduce collision area for more forgiving collision
          let collisionReduction = 0.3;
          
          // Extra forgiving collision on mobile with Solan car
          if (isMobile() && selectedCar === 'solan-propell-sykkel') {
            collisionReduction = 0.4; // Even more forgiving on mobile with Solan
          }
          const obstacleCollisionX = obstacle.x + (obstacle.width * collisionReduction / 2);
          const obstacleCollisionY = obstacle.y + (obstacle.height * collisionReduction / 2);
          const obstacleCollisionWidth = obstacle.width * (1 - collisionReduction);
          const obstacleCollisionHeight = obstacle.height * (1 - collisionReduction);
          
          // Adjust player collision area based on car type for more forgiving gameplay
          let playerCollisionReduction = 0.2;
          
          // Special handling for Solan car (landscape orientation)
          if (selectedCar === 'solan-propell-sykkel') {
            // Reduce collision area more for Solan since it's wider
            playerCollisionReduction = 0.35; // More forgiving for the wider car
          }
          
          const playerCollisionX = player.x + (player.width * playerCollisionReduction / 2);
          const playerCollisionY = player.y + (player.height * playerCollisionReduction / 2);
          const playerCollisionWidth = player.width * (1 - playerCollisionReduction);
          const playerCollisionHeight = player.height * (1 - playerCollisionReduction);
          
          if (
            playerCollisionX < obstacleCollisionX + obstacleCollisionWidth &&
            playerCollisionX + playerCollisionWidth > obstacleCollisionX &&
            playerCollisionY < obstacleCollisionY + obstacleCollisionHeight &&
            playerCollisionY + playerCollisionHeight > obstacleCollisionY
          ) {
            gameOver = true;
            
            // Track what caused the game over
            if (obstacle.type === 'desperados' && selectedCar === 'solan-propell-sykkel') {
              gameOverCause = 'desperados';
            } else {
              gameOverCause = 'default';
            }

            // Play appropriate game over sound based on obstacle type
            try {
              if (gameOverCause === 'desperados') {
                // Play desperados sound for desperados obstacles when using Solan car
                if (desperadosGameOverSound && desperadosGameOverSound.state() === 'loaded') {
                  desperadosGameOverSound.play();
                } else {
                  console.warn('Desperados game over sound not ready, attempting to play anyway');
                  desperadosGameOverSound && desperadosGameOverSound.play();
                }
              } else {
                // Play default game over sound
                if (gameOverSound && gameOverSound.state() === 'loaded') {
                  gameOverSound.play();
                } else {
                  console.warn('Game over sound not ready, attempting to play anyway');
                  gameOverSound && gameOverSound.play();
                }
              }
            } catch (e) {
              console.warn('Error playing game over sound:', e);
            }
          }
        });

        // Side obstacle collision detection
        sideObstacles.forEach((obstacle) => {
          // Much more forgiving collision for side obstacles since they're decorative
          let collisionReduction = 0.6; // Much smaller collision area
          
          // Even more forgiving collision on mobile
          if (isMobile()) {
            collisionReduction = 0.7;
          }
          
          // Extra forgiving for Solan car
          if (selectedCar === 'solan-propell-sykkel') {
            collisionReduction = 0.75;
          }
          
          const obstacleCollisionX = obstacle.x + (obstacle.width * collisionReduction / 2);
          const obstacleCollisionY = obstacle.y + (obstacle.height * collisionReduction / 2);
          const obstacleCollisionWidth = obstacle.width * (1 - collisionReduction);
          const obstacleCollisionHeight = obstacle.height * (1 - collisionReduction);
          
          // Adjust player collision area based on car type
          let playerCollisionReduction = 0.2;
          if (selectedCar === 'solan-propell-sykkel') {
            playerCollisionReduction = 0.35;
          }
          
          const playerCollisionX = player.x + (player.width * playerCollisionReduction / 2);
          const playerCollisionY = player.y + (player.height * playerCollisionReduction / 2);
          const playerCollisionWidth = player.width * (1 - playerCollisionReduction);
          const playerCollisionHeight = player.height * (1 - playerCollisionReduction);
          
          if (
            playerCollisionX < obstacleCollisionX + obstacleCollisionWidth &&
            playerCollisionX + playerCollisionWidth > obstacleCollisionX &&
            playerCollisionY < obstacleCollisionY + obstacleCollisionHeight &&
            playerCollisionY + playerCollisionHeight > obstacleCollisionY
          ) {
            gameOver = true;
            gameOverCause = 'default'; // Side obstacles use default game over
            
            // Play default game over sound for side obstacles
            try {
              if (gameOverSound && gameOverSound.state() === 'loaded') {
                gameOverSound.play();
              } else {
                console.warn('Game over sound not ready, attempting to play anyway');
                gameOverSound && gameOverSound.play();
              }
            } catch (e) {
              console.warn('Error playing game over sound:', e);
            }
          }
        });

        // Desert obstacle collision detection (only during desert scene)
        if (desertSceneActive) {
          desertObstacles.forEach((obstacle) => {
            // Standard collision for desert obstacles
            let collisionReduction = 0.3; // More forgiving than regular obstacles
            
            // More forgiving collision on mobile
            if (isMobile()) {
              collisionReduction = 0.4;
            }
            
            // Extra forgiving for Solan car
            if (selectedCar === 'solan-propell-sykkel') {
              collisionReduction = 0.5;
            }
            
            const obstacleCollisionX = obstacle.x + (obstacle.width * collisionReduction / 2);
            const obstacleCollisionY = obstacle.y + (obstacle.height * collisionReduction / 2);
            const obstacleCollisionWidth = obstacle.width * (1 - collisionReduction);
            const obstacleCollisionHeight = obstacle.height * (1 - collisionReduction);
            
            // Adjust player collision area based on car type
            let playerCollisionReduction = 0.2;
            if (selectedCar === 'solan-propell-sykkel') {
              playerCollisionReduction = 0.35;
            }
            
            const playerCollisionX = player.x + (player.width * playerCollisionReduction / 2);
            const playerCollisionY = player.y + (player.height * playerCollisionReduction / 2);
            const playerCollisionWidth = player.width * (1 - playerCollisionReduction);
            const playerCollisionHeight = player.height * (1 - playerCollisionReduction);
            
            if (
              playerCollisionX < obstacleCollisionX + obstacleCollisionWidth &&
              playerCollisionX + playerCollisionWidth > obstacleCollisionX &&
              playerCollisionY < obstacleCollisionY + obstacleCollisionHeight &&
              playerCollisionY + playerCollisionHeight > obstacleCollisionY
            ) {
              gameOver = true;
              gameOverCause = 'desert'; // Desert obstacles use desert game over
              
              // Play default game over sound for desert obstacles
              try {
                if (gameOverSound && gameOverSound.state() === 'loaded') {
                  gameOverSound.play();
                } else {
                  console.warn('Game over sound not ready, attempting to play anyway');
                  gameOverSound && gameOverSound.play();
                }
              } catch (e) {
                console.warn('Error playing game over sound:', e);
              }
            }
          });
        }

        // Update display - only show scoreboards when game is active
        if (gameStarted && !gameOver) {
          scoreDisplay.style.display = "block";
          gameTimeDisplay.style.display = "block";
          speedIndicator.style.display = "block";
          fpsCounter.style.display = "block";
          
          // Hide scoreImage on mobile, show on desktop
          if (isMobile()) {
            scoreImage.style.display = "none";
          } else {
            scoreImage.style.display = "block";
          }
        } else {
          // Hide scoreboards when game is not active (start menu, game over)
          scoreDisplay.style.display = "none";
          gameTimeDisplay.style.display = "none";
          speedIndicator.style.display = "none";
          fpsCounter.style.display = "none";
          scoreImage.style.display = "none";
        }
        scoreDisplay.textContent = `Score: ${score}`;
        gameTimeDisplay.textContent = `| Time: ${seconds}s`;
        const speedMultiplier = (currentTrackSpeed / BASE_TRACK_SPEED).toFixed(
          1
        );
        speedIndicator.textContent = `Speed: ${speedMultiplier}x`;
        fpsCounter.textContent = `FPS: ${currentFps}`;

        // Draw everything
        draw();

        requestAnimationFrame(update);
      }

      // Draw game elements
      function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get display dimensions for proper track positioning
        const displayWidth = canvas.getBoundingClientRect().width;
        const displayHeight = canvas.getBoundingClientRect().height;

        // Draw background (desert or grass based on scene)
        if (desertSceneActive) {
          // Desert background - sandy beige gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
          gradient.addColorStop(0, "#F4A460"); // Sandy brown
          gradient.addColorStop(0.5, "#DEB887"); // Burlywood
          gradient.addColorStop(1, "#D2B48C"); // Tan
          ctx.fillStyle = gradient;
        } else {
          // Normal grass background
          ctx.fillStyle = "#228B22"; // Forest green color for grass
        }
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Draw track (scrolling road) - using display dimensions
        if (desertSceneActive) {
          ctx.fillStyle = "#CD853F"; // Desert road color (sandy brown)
        } else {
          ctx.fillStyle = "gray"; // Normal road color
        }
        
        // Make track wider on mobile (70% vs 50% on desktop)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackStartX = displayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = displayWidth * trackWidthRatio;
        
        ctx.fillRect(trackStartX, 0, trackWidth, displayHeight);
        ctx.fillStyle = "white";
        for (let i = 0; i < displayHeight; i += 60) {
          ctx.fillRect(
            displayWidth / 2 - 10,
            (i + trackY) % displayHeight,
            20,
            40
          );
        }

        // Draw sand dunes on the sides during desert scene
        if (desertSceneActive && sandDunesImageLoaded) {
          // Draw sand dunes on the left side of the track
          const leftDunesX = 0;
          const leftDunesWidth = trackStartX + 20; // Overlap slightly with track edge
          ctx.drawImage(
            sandDunesImage,
            leftDunesX,
            0,
            leftDunesWidth,
            displayHeight
          );

          // Draw sand dunes on the right side of the track
          const rightDunesX = trackStartX + trackWidth - 20; // Overlap slightly with track edge
          const rightDunesWidth = displayWidth - rightDunesX;
          ctx.drawImage(
            sandDunesImage,
            rightDunesX,
            0,
            rightDunesWidth,
            displayHeight
          );
        }

        // Draw Il Tempo Gigante using the image
        if (imageLoaded) {
          ctx.drawImage(
            carImage,
            player.x,
            player.y,
            player.width,
            player.height
          );
        } else {
          ctx.fillStyle = "#B8860B";
          ctx.fillRect(player.x, player.y, player.width, player.height);
        }

        // Draw obstacles using the appropriate image with shadow
        obstacles.forEach((obstacle) => {
          // Draw shadow circle behind obstacle
          const shadowRadius = Math.max(obstacle.width, obstacle.height) / 2 + 5;
          const shadowCenterX = obstacle.x + obstacle.width / 2;
          const shadowCenterY = obstacle.y + obstacle.height / 2;
          
          // Create shadow gradient
          const shadowGradient = ctx.createRadialGradient(
            shadowCenterX, shadowCenterY, 0,
            shadowCenterX, shadowCenterY, shadowRadius
          );
          shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
          shadowGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.2)");
          shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          
          // Draw shadow circle
          ctx.fillStyle = shadowGradient;
          ctx.beginPath();
          ctx.arc(shadowCenterX, shadowCenterY, shadowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw the obstacle image on top of shadow
          if (obstacle.type === 'desperados' && desperadosObstacleImageLoaded) {
            // Draw desperados obstacle
            ctx.drawImage(
              desperadosObstacleImage,
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          } else if (obstacle.type === 'reodor' && reodorObstacleImageLoaded) {
            // Draw reodor obstacle
            ctx.drawImage(
              reodorObstacleImage,
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          } else if (obstacleImageLoaded) {
            // Draw blodstrupmoen obstacle (default)
            ctx.drawImage(
              obstacleImage,
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          } else {
            // Fallback for when images aren't loaded
            ctx.fillStyle = obstacle.type === 'desperados' ? "purple" : obstacle.type === 'reodor' ? "orange" : "red";
            ctx.fillRect(
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          }
        });

        // Draw side obstacles with shadow
        sideObstacles.forEach((obstacle) => {
          // Draw shadow circle behind obstacle
          const shadowRadius = Math.max(obstacle.width, obstacle.height) / 2 + 5;
          const shadowCenterX = obstacle.x + obstacle.width / 2;
          const shadowCenterY = obstacle.y + obstacle.height / 2;
          
          // Create shadow gradient
          const shadowGradient = ctx.createRadialGradient(
            shadowCenterX, shadowCenterY, 0,
            shadowCenterX, shadowCenterY, shadowRadius
          );
          shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.4)");
          shadowGradient.addColorStop(0.6, "rgba(0, 0, 0, 0.2)");
          shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          
          // Draw shadow circle
          ctx.fillStyle = shadowGradient;
          ctx.beginPath();
          ctx.arc(shadowCenterX, shadowCenterY, shadowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw the side obstacle image on top of shadow
          if (obstacle.side === 'left' && standLeftImageLoaded) {
            ctx.drawImage(
              standLeftImage,
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          } else if (obstacle.side === 'right' && standRightImageLoaded) {
            ctx.drawImage(
              standRightImage,
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          } else {
            // Fallback for when images aren't loaded
            ctx.fillStyle = obstacle.side === 'left' ? "blue" : "orange";
            ctx.fillRect(
              obstacle.x,
              obstacle.y,
              obstacle.width,
              obstacle.height
            );
          }
        });

        // Draw mountain trees on sides during normal scenes
        if (!desertSceneActive) {
          mountainTrees.forEach((element) => {
            if (element.type === 'mountain') {
              // Draw mountain elements using mountain-tree.png
              if (mountainImageLoaded) {
                ctx.drawImage(
                  mountainImage,
                  element.x,
                  element.y,
                  element.width,
                  element.height
                );
              } else {
                // Fallback - brown rectangle for mountain
                ctx.fillStyle = "#8B4513"; // Saddle brown
                ctx.fillRect(
                  element.x,
                  element.y,
                  element.width,
                  element.height
                );
              }
            } else if (element.type === 'tree') {
              // Draw tree elements using tree.png
              if (treeImageLoaded) {
                ctx.drawImage(
                  treeImage,
                  element.x,
                  element.y,
                  element.width,
                  element.height
                );
              } else {
                // Fallback - green rectangle for tree
                ctx.fillStyle = "#228B22"; // Forest green
                ctx.fillRect(
                  element.x,
                  element.y,
                  element.width,
                  element.height
                );
              }
            }
          });
        }

        // Draw dynamic desert obstacles during desert scene
        if (desertSceneActive) {
          desertObstacles.forEach((obstacle) => {
            // Draw shadow circle behind obstacle
            const shadowRadius = Math.max(obstacle.width, obstacle.height) / 2 + 8;
            const shadowCenterX = obstacle.x + obstacle.width / 2;
            const shadowCenterY = obstacle.y + obstacle.height;
            
            // Create shadow gradient
            const shadowGradient = ctx.createRadialGradient(
              shadowCenterX, shadowCenterY, 0,
              shadowCenterX, shadowCenterY, shadowRadius
            );
            shadowGradient.addColorStop(0, "rgba(139, 69, 19, 0.3)"); // Brown shadow
            shadowGradient.addColorStop(0.6, "rgba(139, 69, 19, 0.15)");
            shadowGradient.addColorStop(1, "rgba(139, 69, 19, 0)");
            
            // Draw shadow circle
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(shadowCenterX, shadowCenterY, shadowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw the desert obstacle image on top of shadow
            if (obstacle.type === 'palm' && palmImageLoaded) {
              ctx.drawImage(
                palmImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            } else if (obstacle.type === 'camel' && camelImageLoaded) {
              ctx.drawImage(
                camelImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            } else {
              // Fallback for when images aren't loaded
              ctx.fillStyle = obstacle.type === 'palm' ? "green" : "brown";
              ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            }
          });
        }

        // Draw regular collectibles (non-radar)
        collectibles.forEach((collectible) => {
          if (!collectible.isRadar) {
            // Draw collectible based on type
            if (collectible.type === 'gold') {
              // Draw gold bar
              if (goldImageLoaded) {
                ctx.drawImage(
                  goldImage,
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              } else {
                // Fallback for gold bar
                ctx.fillStyle = "gold";
                ctx.fillRect(
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              }
            } else if (collectible.type === 'ludvig') {
              // Draw Ludvig superpower with special glow effect
              ctx.shadowColor = "#FFD700"; // Golden glow
              ctx.shadowBlur = 15;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              
              if (ludvigImageLoaded) {
                ctx.drawImage(
                  ludvigImage,
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              } else {
                // Fallback for Ludvig
                ctx.fillStyle = "#FFD700";
                ctx.fillRect(
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              }
              
              // Reset shadow
              ctx.shadowColor = "transparent";
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
            } else {
              // Draw oil lamp (default)
              if (collectibleImageLoaded) {
                ctx.drawImage(
                  collectibleImage,
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              } else {
                // Fallback for oil lamp
                ctx.fillStyle = "green";
                ctx.beginPath();
                ctx.arc(
                  collectible.x + collectible.width / 2,
                  collectible.y + collectible.height / 2,
                  collectible.width / 2,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
              }
            }
          }
        });

        // Draw the milestone message and image if active (but not during desert scene or mist)
        if (showMessage && !desertSceneActive && !mistActive) {
          const currentMilestone =
            Math.floor(score / milestoneInterval) * milestoneInterval;
          const milestoneIndex = Math.min(
            Math.floor(currentMilestone / milestoneInterval) - 1,
            milestoneMessages.length - 1
          );

          // Define responsive image dimensions based on device type
          const isMobileDevice = isMobile();
          const displayWidth = canvas.getBoundingClientRect().width;
          const displayHeight = canvas.getBoundingClientRect().height;
          
          // Responsive image sizing: smaller on mobile, larger on desktop
          const imageWidth = isMobileDevice ? Math.min(80, displayWidth * 0.2) : 120;
          const imageHeight = isMobileDevice ? Math.min(80, displayHeight * 0.12) : 120;
          
          // Responsive font size: smaller on mobile, larger on desktop
          const fontSize = isMobileDevice ? Math.max(16, Math.min(24, displayWidth * 0.04)) : 38;
          ctx.font = `${fontSize}px Arial`;
          
          // Responsive gap between image and text
          const gap = isMobileDevice ? Math.max(10, displayWidth * 0.02) : 20;

          // Calculate positions with responsive values
          const textWidth = ctx.measureText(milestoneMessages[milestoneIndex]).width;
          const totalWidth = imageWidth + gap + textWidth;
          const startX = displayWidth / 2 - totalWidth / 2; // Start position to center the combined image and text
          const imageX = Math.max(10, startX); // Image on the left with minimum margin
          
          // Position based on device type: under scoreboards for mobile, top for desktop
          let imageY, textY;
          if (isMobileDevice) {
            // Mobile: position under scoreboards (assuming scoreboards are about 60-80px from top)
            const scoreboardHeight = 80; // Estimated height of scoreboards area
            const marginFromScoreboards = 10; // Small margin under scoreboards
            imageY = scoreboardHeight + marginFromScoreboards;
            textY = imageY + imageHeight / 2 + (fontSize * 0.3);
          } else {
            // Desktop: position at top
            imageY = 20;
            textY = 20 + imageHeight / 2 + (fontSize * 0.3);
          }
          
          const textX = imageX + imageWidth + gap; // Text to the right of the image

          // Draw the milestone image to the left
          if (milestoneImageLoaded) {
            ctx.drawImage(
              milestoneImage,
              imageX,
              imageY,
              imageWidth,
              imageHeight
            );
          } else {
            // Fallback if image fails to load
            ctx.fillStyle = "yellow";
            ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
          }

          // Draw the milestone text to the right of the image with yellow text and black border
          ctx.textAlign = "left"; // Align text to the left for precise positioning
          
          // Draw black border by drawing text multiple times with slight offsets
          ctx.fillStyle = "black";
          const borderWidth = 2;
          for (let x = -borderWidth; x <= borderWidth; x++) {
            for (let y = -borderWidth; y <= borderWidth; y++) {
              if (x !== 0 || y !== 0) {
                ctx.fillText(milestoneMessages[milestoneIndex], textX + x, textY + y);
              }
            }
          }
          
          // Draw the main yellow text on top
          ctx.fillStyle = "yellow";
          ctx.fillText(milestoneMessages[milestoneIndex], textX, textY);
        }


        // Draw desert message using ben-redic-message.png
        if (showDesertMessage) {
          // Define responsive image dimensions based on device type
          const isMobileDevice = isMobile();
          const displayWidth = canvas.getBoundingClientRect().width;
          const displayHeight = canvas.getBoundingClientRect().height;
          
          // Responsive image sizing: smaller on mobile, larger on desktop
          const imageWidth = isMobileDevice ? Math.min(80, displayWidth * 0.2) : 120;
          const imageHeight = isMobileDevice ? Math.min(80, displayHeight * 0.12) : 120;
          
          // Responsive font size: 1.5x smaller than other messages due to longer text
          const fontSize = isMobileDevice ? Math.max(13, Math.min(21, (displayWidth * 0.05) / 1.5)) : 32;
          ctx.font = `${fontSize}px Arial`;
          
          // Responsive gap between image and text
          const gap = isMobileDevice ? Math.max(10, displayWidth * 0.02) : 20;

          // Calculate positions with responsive values
          const desertMessageText = "Her væra like stille som den ørken";
          const textWidth = ctx.measureText(desertMessageText).width;
          const totalWidth = imageWidth + gap + textWidth;
          const startX = displayWidth / 2 - totalWidth / 2; // Start position to center the combined image and text
          const imageX = Math.max(10, startX); // Image on the left with minimum margin
          
          // Position based on device type: under scoreboards for mobile, top for desktop
          let imageY, textY;
          if (isMobileDevice) {
            // Mobile: position under scoreboards
            const scoreboardHeight = 80; // Estimated height of scoreboards area
            const marginFromScoreboards = 10; // Small margin under scoreboards
            imageY = scoreboardHeight + marginFromScoreboards;
            textY = imageY + imageHeight / 2 + (fontSize * 0.3);
          } else {
            // Desktop: position at top
            imageY = 20;
            textY = 20 + imageHeight / 2 + (fontSize * 0.3);
          }
          
          const textX = imageX + imageWidth + gap; // Text to the right of the image

          // Draw the desert message image (ben-redic-message.png) to the left
          if (milestoneImageLoaded) {
            ctx.drawImage(
              milestoneImage,
              imageX,
              imageY,
              imageWidth,
              imageHeight
            );
          } else {
            // Fallback if image fails to load
            ctx.fillStyle = "orange";
            ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
          }

          // Draw the desert message text to the right of the image
          ctx.fillStyle = "orange";
          ctx.textAlign = "left"; // Align text to the left for precise positioning
          
          // Add text shadow for better readability (both mobile and desktop)
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          
          ctx.fillText(desertMessageText, textX, textY);
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // Draw mist overlay if active
        if (mistActive) {
          // Calculate mist opacity based on remaining time
          const mistProgress = 1 - mistTimer / mistDuration;
          let mistOpacity;

          // Fade in for first 1 second, full opacity for 6 seconds, fade out for last 1 second
          if (mistTimer > mistDuration - 1000) {
            mistOpacity = ((mistDuration - mistTimer) / 1000) * 0.85; // Fade in - much denser
          } else if (mistTimer < 1000) {
            mistOpacity = (mistTimer / 1000) * 0.85; // Fade out - much denser
          } else {
            mistOpacity = 0.85; // Full mist - much denser
          }

          // Create animated mist particles
          const time = gameTime / 1000;
          ctx.globalAlpha = mistOpacity;

          // Draw optimized mist layers (reduced for better performance)
          const particlesPerLayer = isMobile() ? 8 : 12; // Fewer particles on mobile
          const layerCount = isMobile() ? 3 : 4; // Fewer layers on mobile
          
          for (let layer = 0; layer < layerCount; layer++) {
            const layerOffset = layer * 80;
            const layerSpeed = (layer + 1) * 0.4;

            for (let i = 0; i < particlesPerLayer; i++) {
              const x =
                ((i * 80 + Math.sin(time * layerSpeed + i) * 60 + layerOffset) %
                  (canvas.width + 300)) -
                150;
              const y =
                ((i * 60 + Math.cos(time * layerSpeed * 0.8 + i) * 40) %
                  (canvas.height + 150)) -
                75;

              // Create larger, denser radial gradient for each mist particle
              const gradient = ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                80 + layer * 25
              );
              gradient.addColorStop(
                0,
                `rgba(200, 200, 200, ${0.5 + layer * 0.15})`
              );
              gradient.addColorStop(
                0.7,
                `rgba(210, 210, 210, ${0.2 + layer * 0.08})`
              );
              gradient.addColorStop(1, "rgba(220, 220, 220, 0)");

              ctx.fillStyle = gradient;
              ctx.fillRect(
                x - 80 - layer * 25,
                y - 80 - layer * 25,
                160 + layer * 50,
                160 + layer * 50
              );
            }
          }

          // Add additional heavy fog overlay
          ctx.fillStyle = `rgba(230, 230, 230, ${mistOpacity * 0.3})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Reset global alpha
          ctx.globalAlpha = 1.0;
        }

        // Draw the mist message and image on top of mist overlay (so it's visible)
        if (showMistMessage) {
          // Define responsive image dimensions based on device type
          const isMobileDevice = isMobile();
          const displayWidth = canvas.getBoundingClientRect().width;
          const displayHeight = canvas.getBoundingClientRect().height;
          
          // Responsive image sizing: smaller on mobile, larger on desktop
          const imageWidth = isMobileDevice ? Math.min(80, displayWidth * 0.2) : 120;
          const imageHeight = isMobileDevice ? Math.min(80, displayHeight * 0.12) : 120;
          
          // Responsive font size: smaller on mobile, larger on desktop
          const fontSize = isMobileDevice ? Math.max(20, Math.min(32, displayWidth * 0.05)) : 48;
          ctx.font = `${fontSize}px Arial`;
          
          // Responsive gap between image and text
          const gap = isMobileDevice ? Math.max(10, displayWidth * 0.02) : 20;

          // Calculate positions with responsive values
          const mistMessageText = "Dirty tricks";
          const textWidth = ctx.measureText(mistMessageText).width;
          const totalWidth = imageWidth + gap + textWidth;
          const startX = displayWidth / 2 - totalWidth / 2; // Start position to center the combined image and text
          const imageX = Math.max(10, startX); // Image on the left with minimum margin
          
          // Position based on device type: under scoreboards for mobile, top for desktop
          let imageY, textY;
          if (isMobileDevice) {
            // Mobile: position under scoreboards (same as milestone message)
            const scoreboardHeight = 80; // Estimated height of scoreboards area
            const marginFromScoreboards = 10; // Small margin under scoreboards
            imageY = scoreboardHeight + marginFromScoreboards;
            textY = imageY + imageHeight / 2 + (fontSize * 0.3);
          } else {
            // Desktop: position at top
            imageY = 20;
            textY = 20 + imageHeight / 2 + (fontSize * 0.3);
          }
          
          const textX = imageX + imageWidth + gap; // Text to the right of the image

          // Draw the mist message image (mysil.png) to the left
          if (mistMessageImageLoaded) {
            ctx.drawImage(
              mistMessageImage,
              imageX,
              imageY,
              imageWidth,
              imageHeight
            );
          } else {
            // Fallback if image fails to load
            ctx.fillStyle = "purple";
            ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
          }

          // Draw the mist message text to the right of the image
          ctx.fillStyle = "red";
          ctx.textAlign = "left"; // Align text to the left for precise positioning
          
          // Add text shadow for better readability (both mobile and desktop)
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          
          ctx.fillText(mistMessageText, textX, textY);
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // Draw radar collectibles on top of mist (so they're visible through the fog)
        collectibles.forEach((collectible) => {
          if (collectible.isRadar) {
            // Draw radar collectible
            if (radarImageLoaded) {
              ctx.drawImage(
                radarImage,
                collectible.x,
                collectible.y,
                collectible.width,
                collectible.height
              );
            } else {
              ctx.fillStyle = "cyan";
              ctx.fillRect(
                collectible.x,
                collectible.y,
                collectible.width,
                collectible.height
              );
            }
          }
        });

        // Draw green radar screen overlay if active
        if (radarActive) {
          // Calculate radar opacity based on remaining time
          let radarOpacity;

          // Fade in for first 0.5 seconds, full opacity for middle, fade out for last 0.5 seconds
          if (radarTimer > radarDuration - 500) {
            radarOpacity = ((radarDuration - radarTimer) / 500) * 0.4; // Fade in
          } else if (radarTimer < 500) {
            radarOpacity = (radarTimer / 500) * 0.4; // Fade out
          } else {
            radarOpacity = 0.4; // Full radar screen
          }

          // Create green radar screen effect
          ctx.globalAlpha = radarOpacity;
          
          // Get display dimensions for proper centering
          const displayWidth = canvas.getBoundingClientRect().width;
          const displayHeight = canvas.getBoundingClientRect().height;
          
          // Draw green overlay
          ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
          ctx.fillRect(0, 0, displayWidth, displayHeight);
          
          // Add radar sweep lines for authentic radar effect
          const time = gameTime / 1000;
          ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
          ctx.lineWidth = 2;
          
          // Draw concentric circles centered on display
          const centerX = displayWidth / 2;
          const centerY = displayHeight / 2;
          const maxRadius = Math.max(displayWidth, displayHeight);
          
          for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (maxRadius / 5) * i, 0, Math.PI * 2);
            ctx.stroke();
          }
          
          // Draw radar sweep line
          const sweepAngle = (time * 2) % (Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(sweepAngle) * maxRadius,
            centerY + Math.sin(sweepAngle) * maxRadius
          );
          ctx.stroke();

          // Reset global alpha
          ctx.globalAlpha = 1.0;
        }
        
        // Draw Ludvig superpower status indicator when active
        if (ludvigActive) {
          // Use actual canvas dimensions
          const canvasWidth = canvas.width;
          
          // Position at top right corner
          const statusText = `Ludvig Superpower: ${Math.ceil(ludvigTimer / 1000)}s`;
          ctx.font = "bold 20px Arial";
          ctx.fillStyle = "#FFD700"; // Golden color
          ctx.textAlign = "right";
          
          // Add golden glow
          ctx.shadowColor = "#FFD700";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.fillText(statusText, canvasWidth - 20, 40);
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // Draw radar hint message at bottom of canvas when mist starts (outside of radarActive block)
        if (showRadarHint) {
          // Use actual canvas dimensions, not display dimensions
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          
          // Position with safe zone at bottom center
          const safeZone = 120; // Larger safe zone from bottom
          const hintY = canvasHeight - safeZone; // Much higher from bottom
          const hintX = canvasWidth / 2;
          
          // Draw hint text with mystical green shadow
          ctx.font = "bold 28px Arial"; // Slightly larger font
          ctx.fillStyle = "#FFFFFF"; // White text
          ctx.textAlign = "center";
          ctx.shadowColor = "#00FF00"; // Green text shadow
          ctx.shadowBlur = 15;
          ctx.fillText("Hint: Catch the radar", hintX, hintY);
          
          // Draw radar image AFTER text with enhanced green glow
          const imageSize = 45; // Larger image
          const textMetrics = ctx.measureText("Hint: Catch the radar");
          const textWidth = textMetrics.width;
          const imageX = hintX + textWidth / 2 + 25; // Position image to the right of text with more spacing
          const imageY = hintY - imageSize / 2 - 3; // Align with text center
          
          // Enhanced green glow for radar image
          ctx.shadowColor = "#00FF00"; // Bright green shadow
          ctx.shadowBlur = 25; // Stronger glow for image
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          if (radarImageLoaded) {
            ctx.drawImage(
              radarImage,
              imageX,
              imageY,
              imageSize,
              imageSize
            );
          } else {
            // Fallback: draw cyan circle with glow if image not loaded
            ctx.fillStyle = "cyan";
            ctx.fillRect(
              imageX,
              imageY,
              imageSize,
              imageSize
            );
          }
          
          // Reset shadow effects
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
      }

      // Add event listener for the unified restart button
      restartButton.addEventListener("click", resetGame);

      // Add event listener for the back button
      const backButton = document.getElementById("backButton");
      backButton.addEventListener("click", () => {
        // Hide game over dialog
        gameOverDialog.style.display = "none";
        
        // Hide canvas and show start screen
        canvas.style.display = "none";
        startScreen.style.display = "block";
        
        // Hide scoreboard
        scoreContainer.style.display = "none";
        
        // Reset body classes
        document.body.classList.remove("game-active", "game-over", "mist-active");
        
        // Stop all sounds
        backgroundMusic.stop();
        radarSound.stop();
        try {
          sabotageSound.stop();
        } catch (e) {
          console.warn('Error stopping sabotage sound:', e);
        }
        
        // Reset to step 1 of car selection
        goToStep(1);
      });

      // Add event listener for the start button
      startButton.addEventListener("click", async () => {
        // Unlock audio for browser compatibility (especially Safari/iOS)
        unlockAudio();
        
        // Test game over sound loading
        console.log('Testing game over sound state:', gameOverSound ? gameOverSound.state() : 'undefined');
        
        // Player name is already captured in the multi-step flow
        startScreen.style.display = "none"; // Hide the start screen
        canvas.style.display = "block"; // Show the canvas
        
        // Show scoreboard when game starts
        scoreContainer.style.display = "flex";
        scoreDisplay.style.display = "block";

        // Start F1 countdown instead of immediate game start
        startF1Countdown();
      });

      // Hide all scoreboard elements on start menu
      const scoreContainer = document.getElementById("scoreContainer");
      scoreContainer.style.display = "none";
      scoreDisplay.style.display = "none";
      gameTimeDisplay.style.display = "none";
      speedIndicator.style.display = "none";
      fpsCounter.style.display = "none";
      scoreImage.style.display = "none";

      // Initialize mobile features
      if (isMobile()) {
        // Add mobile class for scoreboard positioning
        document.body.classList.add('mobile-mode');
        
        // Touch zones are now controlled by CSS

        // Resize canvas for mobile
        resizeCanvas();

        // Add resize listener
        window.addEventListener("resize", () => {
          setTimeout(resizeCanvas, 100);
        });

        // Add orientation change listener
        window.addEventListener("orientationchange", () => {
          setTimeout(resizeCanvas, 300);
        });

        // Prevent pull-to-refresh during gameplay
        document.body.addEventListener(
          "touchmove",
          (e) => {
            if (gameStarted) {
              e.preventDefault();
            }
          },
          { passive: false }
        );

        // Wake lock to prevent screen sleep (if supported)
        if ("wakeLock" in navigator) {
          navigator.wakeLock.request("screen").catch(() => {
            // Wake lock not supported or failed
          });
        }
      } else {
        // Initialize desktop features
        // Ensure canvas has proper desktop dimensions with safe zone
        canvas.style.width = "800px";
        canvas.style.height = "calc(100vh - 250px)";
        canvas.style.maxHeight = "800px";
        canvas.style.minHeight = "400px";
        canvas.style.position = "static";
        canvas.style.transform = "none";
        
        // Desktop needs resize handling for viewport-based canvas
        function resizeDesktopCanvas() {
          const viewportHeight = window.innerHeight;
          const canvasHeight = Math.min(Math.max(viewportHeight - 250, 400), 600); // Safe zone with min/max
          canvas.style.height = `${canvasHeight}px`;
          canvas.height = canvasHeight;
        }
        
        // Initial resize and add listener
        resizeDesktopCanvas();
        window.addEventListener("resize", resizeDesktopCanvas);
      }
      // Touch zones are now hidden by default and shown only during gameplay via CSS