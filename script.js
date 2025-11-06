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

      // Load snow image for winter scene obstacles
      const snowImage = new Image();
      snowImage.src = "snow.png";
      let snowImageLoaded = false;
      snowImage.onload = () => {
        snowImageLoaded = true;
        console.log("Snow image loaded successfully");
      };
      snowImage.onerror = () => {
        console.error("Failed to load snow image");
      };

      // Load kjelke image for winter scene collectibles
      const kjelkeImage = new Image();
      kjelkeImage.src = "kjelke.png";
      let kjelkeImageLoaded = false;
      kjelkeImage.onload = () => {
        kjelkeImageLoaded = true;
        console.log("Kjelke image loaded successfully");
      };
      kjelkeImage.onerror = () => {
        console.error("Failed to load kjelke image");
      };

      // Load wrench image for spring phase collectibles
      const wrenchImage = new Image();
      wrenchImage.src = "wrench.png";
      let wrenchImageLoaded = false;
      wrenchImage.onload = () => {
        wrenchImageLoaded = true;
        console.log("Wrench image loaded successfully");
      };
      wrenchImage.onerror = () => {
        console.error("Failed to load wrench image");
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
      
      // Speed-based radar spawning system
      let lastRadarSpawnTime = 0; // Track when last radar was spawned in current mist
      let radarSpawnCount = 0; // Track how many radars spawned in current mist
      
      // Radar hint variables (shown when mist starts)
      let showRadarHint = false;
      let radarHintTimer = 0;
      const radarHintDuration = 3000; // Display radar hint for 3 seconds
      
      // Desert message variables
      let showDesertMessage = false;
      let desertMessageTimer = 0;
      const desertMessageDuration = 2000; // Display desert message for 2 seconds
      
      // Winter hint message variables
      let showWinterHint = false;
      let winterHintTimer = 0;
      const winterHintDuration = 3000; // Display winter hint for 3 seconds
      
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
      let firstRadarCollected = false; // Track if first radar has been collected
      let missedRadarAttempts = 0; // Count mist cycles where radar wasn't collected
      const maxMissedRadarAttempts = 3; // Trigger desert scene after 3 missed attempts
      let preDesertTrackSpeed = 600; // Will be updated to current speed when desert scene starts
      let preDesertPlayerSpeed = 700; // Will be updated to current speed when desert scene starts
      
      // Desert obstacle spawning variables
      const desertObstacles = [];
      const desertObstacleFrequency = 750; // 2x more frequent than regular (1500/2)
      let lastDesertObstacleTime = 0;
      let desertDesperadosCount = 0; // Track desperados spawned in current desert scene (max 2)
      
      // Desert collectible spawning variables (more frequent due to gold bars)
      const desertCollectibleFrequency = 1200; // More frequent to accommodate gold bars (1500ms -> 1200ms)
      let lastDesertCollectibleTime = 0;
      
      // Desert side obstacle spawning variables
      const desertSideObstacles = [];
      const desertSideObstacleFrequency = 600; // Frequent spawning for immersive desert experience
      let lastDesertSideObstacleTime = 0;
      
      // Winter scene variables
      let winterSceneActive = false;
      let winterSceneTimer = 0;
      const winterSceneDuration = 15000; // 15 seconds in milliseconds
      const winterVisualDelay = 5000; // 5 seconds delay before winter visuals appear
      let winterSoundStarted = false;
      let firstWinterCompleted = false;
      let preWinterTrackSpeed = 600; // Will be updated to current speed when winter scene starts
      let preWinterPlayerSpeed = 700; // Will be updated to current speed when winter scene starts
      
      // Winter obstacle spawning variables
      const winterObstacles = [];
      const winterObstacleFrequency = 1200; // Snow obstacles frequency (more spaced than normal)
      let lastWinterObstacleTime = 0;
      
      // Winter collectible spawning variables (kjelke with 15 points)
      const winterCollectibleFrequency = 1800; // Kjelke spawning frequency
      let lastWinterCollectibleTime = 0;
      
      // Winter side obstacle spawning variables (mountains)
      const winterSideObstacles = [];
      const winterSideObstacleFrequency = 700; // Mountain obstacles on sides
      let lastWinterSideObstacleTime = 0;
      
      // Winter obstacle spawn delay (5 seconds after winter scene starts)
      const winterObstacleSpawnDelay = 5000; // 5 seconds in milliseconds
      let winterObstacleSpawnStartTime = 0;
      
      // Winter fog effect variables
      let winterFogActive = false;
      
      // Seasonal phase variables (winter scene divided into 3 seasons)
      let currentSeasonPhase = 'winter'; // 'winter', 'spring', 'summer'
      const winterPhaseDuration = 7000; // 7 seconds for winter phase
      const springPhaseDuration = 7000; // 7 seconds for spring/autumn phase  
      const summerPhaseDuration = 6000; // 6 seconds for summer phase (total 20 seconds)
      
      // Wrench collectible variables (for spring phase)
      const wrenchCollectibleFrequency = 1800; // Same as kjelke frequency
      let lastWrenchCollectibleTime = 0;
      
      // Pre-winter warning variables (2-second speed decrease before winter scene)
      let preWinterWarningActive = false;
      const preWinterWarningDuration = 2000; // 2 seconds in milliseconds
      let preWinterWarningTimer = 0;
      let preWinterOriginalPlayerSpeed = 700; // Store original speed for gradual decrease
      let preWinterOriginalTrackSpeed = 600; // Store original track speed for gradual decrease
      
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

      // Winter scene sound
      let winterSound;
      try {
        winterSound = new Howl({
          src: ["de-bygger-il-tempo.mp3"],
          volume: 0.8, // Winter background music volume
          loop: true, // Loop for continuous winter atmosphere
          autoplay: false,
          html5: false, // Use Web Audio for better timing precision
          pool: 1,
          preload: true,
          onload: function() {
            console.log('✅ Winter sound (de-bygger-il-tempo.mp3) loaded successfully');
            console.log('🎵 Winter sound duration:', winterSound.duration(), 'seconds');
          },
          onloaderror: function(id, error) { 
            console.error('❌ Winter sound failed to load:', error);
          },
          onplay: function() {
            console.log('🔊 Winter sound started playing - volume 0.8');
          },
          onplayerror: function(id, error) { 
            console.error('❌ Winter sound failed to play:', error); 
          },
          onstop: function() {
            console.log('⏹️ Winter sound stopped');
          },
          onend: function() {
            console.log('🔊 de-bygger-il-tempo.mp3 ended naturally (will loop)');
          }
        });
      } catch (e) {
        console.error('❌ Error creating winter sound:', e);
        winterSound = {
          play: () => console.warn('Winter sound fallback - no audio'),
          stop: () => {},
          state: () => 'unloaded',
          playing: () => false,
          duration: () => 0
        };
      }

      // Function to check if winter sound is ready
      function isWinterSoundReady() {
        const winterReady = winterSound && winterSound.state() === 'loaded';
        console.log('🎵 Winter sound ready check - Winter:', winterReady);
        return winterReady;
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

      // Device detection functions with clean responsive breakpoints
      function isTablet() {
        const width = window.innerWidth;
        const hasTouch = "ontouchstart" in window;
        
        // Tablet: 480px - 768px with touch support (adjusted for better mobile detection)
        if (hasTouch && width >= 480 && width <= 768) {
          console.log(`🎯 TABLET DETECTED: ${width}px - Responsive tablet range`);
          return true;
        }
        
        return false;
      }
      
      function isMobile() {
        const width = window.innerWidth;
        const hasTouch = "ontouchstart" in window;
        
        // Mobile/Smartphone: < 480px with touch support (includes 445px)
        if (hasTouch && width < 480) {
          console.log(`📱 MOBILE DETECTED: ${width}px - Smartphone range`);
          return true;
        }
        
        return false;
      }
      
      function isDesktop() {
        const width = window.innerWidth;
        const hasTouch = "ontouchstart" in window;
        
        // Desktop: > 768px without touch, or any device without touch
        return !hasTouch || width > 768;
      }
      
      // Device-specific size multipliers for professional scaling
      function getDeviceSizeMultiplier() {
        if (isTablet()) return 1.5;
        if (isMobile()) return 1.0;
        return 1.0; // desktop
      }
      
      function getObstacleSizeMultiplier() {
        if (isTablet()) return 1.2; // Tablet: 20% larger obstacles
        if (isMobile()) return 1.8; // Mobile/Smartphone: 80% larger for much better visibility
        return 1.0; // Desktop: normal size
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
      
      // Winter scene speed constants
      const WINTER_GAME_SPEED = 0.5; // Very slow game speed during winter
      const WINTER_PLAYER_MOVEMENT_SPEED = 1400; // 2x faster navigation (700 * 2) for responsive winter controls

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
        
        // Calculate precise tap movement distance (more sensitive on desktop during winter)
        let tapDistance = isMobile() ? 30 : 50;
        
        // Make navigation more sensitive on desktop during winter scene (snowy conditions)
        if (!isMobile() && winterSceneActive) {
          tapDistance = 35; // Reduced from 50 to 35 for more sensitive winter navigation
        }
        
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
        // Responsive base sizes: Mobile=40, Tablet=80, Desktop=60
        let width, height;
        if (isTablet()) {
          width = 80;
          height = 80;
        } else if (isMobile()) {
          width = 40; // Perfect 40px base size for smartphones
          height = 40;
        } else {
          width = 60; // Desktop
          height = 60;
        }
        
        // Determine obstacle type based on selected car
        let obstacleType = 'blodstrupmoen'; // default
        if (selectedCar === 'solan-propell-sykkel') {
          solanObstacleCounter++;
          // Every third obstacle should be blodstrupmoen, others are desperados
          if (solanObstacleCounter % 3 === 0) {
            obstacleType = 'blodstrupmoen';
          } else {
            obstacleType = 'desperados';
            // Make desperados obstacles wider based on device
            if (isTablet()) {
              width = 120; // Much larger base for tablets
            } else if (isMobile()) {
              width = 55; // Good size base for smartphones
            } else {
              width = 100; // Desktop
            }
          }
        } else if (selectedCar === 'boomerang-rapido') {
          // Use reodor obstacles for Boomerang Rapido
          obstacleType = 'reodor';
        }
        
        // Apply tablet scaling (2x size for main track obstacles)
        const obstacleSizeMultiplier = getObstacleSizeMultiplier();
        width *= obstacleSizeMultiplier;
        height *= obstacleSizeMultiplier;
        
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
          // Determine dimensions based on element type (device-specific sizing)
          let width, height;
          const safetyMargin = 15;
          let sideObstacleMultiplier;
          if (isTablet()) {
            sideObstacleMultiplier = 1.5; // 50% bigger on tablets
          } else if (isMobile()) {
            sideObstacleMultiplier = 0.88; // 10% larger than before (0.8 × 1.1) for better visibility
          } else {
            sideObstacleMultiplier = 1.0; // normal size on desktop
          }
          
          if (elementType === 'mountain') {
            // Responsive base sizes: Mobile, Tablet, Desktop
            if (isMobile()) {
              width = 60 * sideObstacleMultiplier;  // Smaller base for smartphones
              height = 80 * sideObstacleMultiplier;
            } else if (isTablet()) {
              width = 100 * sideObstacleMultiplier; // Medium base for tablets  
              height = 120 * sideObstacleMultiplier;
            } else {
              width = 120 * sideObstacleMultiplier; // Desktop
              height = 140 * sideObstacleMultiplier;
            }
          } else if (elementType === 'tree') {
            if (isMobile()) {
              width = 50 * sideObstacleMultiplier;  // Smaller base for smartphones
              height = 70 * sideObstacleMultiplier;
            } else if (isTablet()) {
              width = 80 * sideObstacleMultiplier;  // Medium base for tablets
              height = 110 * sideObstacleMultiplier;
            } else {
              width = 90 * sideObstacleMultiplier;  // Desktop
              height = 130 * sideObstacleMultiplier;
            }
          } else { // stand
            if (isMobile()) {
              width = 30 * sideObstacleMultiplier;  // Smaller base for smartphones
              height = 100 * sideObstacleMultiplier;
            } else if (isTablet()) {
              width = 60 * sideObstacleMultiplier;  // Medium base for tablets
              height = 130 * sideObstacleMultiplier;
            } else {
              width = 85 * sideObstacleMultiplier;  // Desktop
              height = 140 * sideObstacleMultiplier;
            }
            const widthMultiplier = isMobile() ? 1.3 : (isTablet() ? 1.4 : 2);
            const heightMultiplier = isMobile() ? 1.8 : (isTablet() ? 2.2 : 3);
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

      // Create radar collectible immediately when mist starts
      function createRadarOnMistStart() {
        // Only create if radar should spawn and isn't already spawned this mist
        if (!radarSpawnedThisMist && !radarActive) {
          // Before desert: spawn radar until first collected, After desert: spawn in every mist
          if (!firstRadarCompleted || (firstRadarCompleted && mistTimeBased)) {
            spawnSingleRadar();
            radarSpawnedThisMist = true; // Mark that radar has been spawned for this mist
            radarSpawnCount = 1; // Initialize count
            lastRadarSpawnTime = gameTime; // Track timing for speed-based spawning
            console.log('🎯 Radar spawned immediately on mist start');
          }
        }
      }

      // Helper function to spawn a single radar (used by multiple spawning systems)
      function spawnSingleRadar() {
        const width = isMobile() ? 50 : 65;
        const height = isMobile() ? 40 : 45;
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        // Create radar collectible
        collectibles.push({ x, y: -50, width, height, isRadar: true, type: 'radar' });
      }

      // Speed-based radar spawning during mist (professional implementation)
      function handleSpeedBasedRadarSpawning() {
        if (mistActive && !radarActive) {
          // Calculate speed-based radar spawn interval
          const speedMultiplier = currentTrackSpeed / BASE_TRACK_SPEED;
          
          // Base interval: 3000ms (3 seconds), but decreases with speed
          // At 1x speed: 3000ms, at 2x speed: 1500ms, at 4x speed: 750ms, etc.
          const baseRadarInterval = 3000;
          const speedAdjustedInterval = baseRadarInterval / Math.max(speedMultiplier, 1);
          const minInterval = 800; // Minimum 800ms between radars (prevent spam)
          const finalInterval = Math.max(speedAdjustedInterval, minInterval);
          
          // Check if enough time has passed since last radar spawn
          if (gameTime - lastRadarSpawnTime >= finalInterval) {
            // Only spawn if we should have radar and current radar conditions are met
            if (!firstRadarCompleted || (firstRadarCompleted && mistTimeBased)) {
              // Don't spawn too many radars (max 4 radars per mist cycle)
              const maxRadarsPerMist = Math.min(4, Math.floor(speedMultiplier) + 1);
              
              if (radarSpawnCount < maxRadarsPerMist) {
                spawnSingleRadar();
                radarSpawnCount++;
                lastRadarSpawnTime = gameTime;
                console.log(`🚀 Speed-based radar spawn #${radarSpawnCount} (Speed: ${speedMultiplier.toFixed(1)}x, Interval: ${finalInterval.toFixed(0)}ms)`);
              }
            }
          }
        }
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
        
        // Determine collectible type based on game state (radar now handled by immediate spawn)
        let isRadar = false;
        let type = 'oil';
        
        if (score >= 30 && gameTime - lastLudvigSpawn > ludvigSpawnCooldown && Math.random() < 0.15) {
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

      // Create a desert obstacle (palm, camel, or desperados)
      function createDesertObstacle() {
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Choose obstacle type with desperados limit (max 2 per desert scene)
        const rand = Math.random();
        let type;
        
        if (desertDesperadosCount >= 2) {
          // No more desperados allowed - only palm and camel (50% each)
          if (rand < 0.5) {
            type = 'palm';
          } else {
            type = 'camel';
          }
        } else {
          // Normal distribution: palm, camel, desperados (33% each)
          if (rand < 0.33) {
            type = 'palm';
          } else if (rand < 0.66) {
            type = 'camel';
          } else {
            type = 'desperados';
            desertDesperadosCount++; // Increment counter when desperados is selected
          }
        }
        
        let width, height;
        if (type === 'palm') {
          if (isTablet()) {
            width = 80;    // Same as desktop size
            height = 120;
          } else if (isMobile()) {
            width = 50;    // 10% larger (45 × 1.1) for better visibility
            height = 77;   // 10% larger (70 × 1.1) for better visibility
          } else {
            width = 80;    // Desktop
            height = 120;
          }
        } else if (type === 'camel') {
          if (isTablet()) {
            width = 90;    // Same as desktop size
            height = 70;
          } else if (isMobile()) {
            width = 55;    // 10% larger (50 × 1.1) for better visibility
            height = 39;   // 10% larger (35 × 1.1) for better visibility
          } else {
            width = 90;    // Desktop
            height = 70;
          }
        } else { // desperados
          if (isTablet()) {
            width = 102;   // Reduced by 8px (was 110)
            height = 72;   // Reduced by 8px (was 80)
          } else if (isMobile()) {
            width = 52;    // Reduced by 8px (was 60)
            height = 42;   // Reduced by 8px (was 50)
          } else {
            width = 102;   // Desktop - reduced by 8px (was 110)
            height = 72;   // Reduced by 8px (was 80)
          }
        }
        
        // Apply tablet scaling (2x size for desert track obstacles)
        const obstacleSizeMultiplier = getObstacleSizeMultiplier();
        width *= obstacleSizeMultiplier;
        height *= obstacleSizeMultiplier;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        desertObstacles.push({ x, y: -50, width, height, type });
      }

      // Create desert side obstacles (palm, camel, or desperados on sides)
      function createDesertSideObstacles() {
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Calculate track boundaries to position obstacles on sides
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackRight = trackLeft + (canvasDisplayWidth * trackWidthRatio);
        
        // Create obstacles for both sides
        for (let side of ['left', 'right']) {
          // Randomly choose obstacle type (33% each: palm, camel, desperados)
          const rand = Math.random();
          let type;
          if (rand < 0.33) {
            type = 'palm';
          } else if (rand < 0.66) {
            type = 'camel';
          } else {
            type = 'desperados';
          }
          
          let width, height;
          let sideObstacleMultiplier;
          if (isTablet()) {
            sideObstacleMultiplier = 1.5; // 50% bigger on tablets
          } else if (isMobile()) {
            sideObstacleMultiplier = 0.88; // 10% larger than before (0.8 × 1.1) for better visibility
          } else {
            sideObstacleMultiplier = 1.0; // normal size on desktop
          }
          
          if (type === 'palm') {
            if (isMobile()) {
              width = 40 * sideObstacleMultiplier;  // Smaller base for smartphones
              height = 65 * sideObstacleMultiplier;
            } else if (isTablet()) {
              width = 60 * sideObstacleMultiplier;  // Medium base for tablets
              height = 90 * sideObstacleMultiplier;
            } else {
              width = 70 * sideObstacleMultiplier;  // Desktop
              height = 100 * sideObstacleMultiplier;
            }
          } else if (type === 'camel') {
            if (isMobile()) {
              width = 45 * sideObstacleMultiplier;  // Smaller base for smartphones
              height = 30 * sideObstacleMultiplier;
            } else if (isTablet()) {
              width = 70 * sideObstacleMultiplier;  // Medium base for tablets
              height = 50 * sideObstacleMultiplier;
            } else {
              width = 80 * sideObstacleMultiplier;  // Desktop
              height = 60 * sideObstacleMultiplier;
            }
          } else { // desperados
            if (isMobile()) {
              width = 47 * sideObstacleMultiplier;  // Reduced by 8px (was 55)
              height = 47 * sideObstacleMultiplier;
            } else if (isTablet()) {
              width = 72 * sideObstacleMultiplier;  // Reduced by 8px (was 80)
              height = 72 * sideObstacleMultiplier;
            } else {
              width = 82 * sideObstacleMultiplier;  // Desktop - reduced by 8px (was 90)
              height = 82 * sideObstacleMultiplier;
            }
          }
          
          let x;
          if (side === 'left') {
            // Position on left side, extending into track slightly for danger
            x = trackLeft - width + (width * 0.3); // 30% overlaps into track
          } else {
            // Position on right side, extending into track slightly for danger
            x = trackRight - (width * 0.3); // 30% overlaps into track
          }
          
          desertSideObstacles.push({ x, y: -50, width, height, type, side });
        }
      }

      // Create a winter obstacle (snow)
      function createWinterObstacle() {
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Winter obstacles are snow - simple single type
        const type = 'snow';
        
        let width, height;
        // Snow obstacle sizes (reduced by ~25% for better navigation)
        if (isTablet()) {
          width = 52;    // Tablet size (was 70)
          height = 52;
        } else if (isMobile()) {
          width = 35;    // Mobile size (was 45)
          height = 35;
        } else {
          width = 45;    // Desktop size (was 60)
          height = 45;
        }
        
        // Apply tablet scaling
        const obstacleSizeMultiplier = getObstacleSizeMultiplier();
        width *= obstacleSizeMultiplier;
        height *= obstacleSizeMultiplier;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        winterObstacles.push({ x, y: -50, width, height, type });
      }

      // Create winter side obstacles (mountains)
      function createWinterSideObstacles() {
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Calculate track boundaries to position obstacles on sides
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackRight = trackLeft + (canvasDisplayWidth * trackWidthRatio);
        
        // Create mountain obstacles for both sides
        for (let side of ['left', 'right']) {
          // Winter side obstacles are always mountains
          const type = 'mountain';
          
          let width, height;
          let sideObstacleMultiplier;
          if (isTablet()) {
            sideObstacleMultiplier = 1.5; // 50% bigger on tablets
          } else if (isMobile()) {
            sideObstacleMultiplier = 0.9; // Good size for mobile
          } else {
            sideObstacleMultiplier = 1.2; // Slightly bigger on desktop
          }
          
          // Mountain obstacle sizes
          if (isMobile()) {
            width = 50 * sideObstacleMultiplier;  // Base for smartphones
            height = 75 * sideObstacleMultiplier;
          } else if (isTablet()) {
            width = 70 * sideObstacleMultiplier;  // Medium base for tablets
            height = 100 * sideObstacleMultiplier;
          } else {
            width = 80 * sideObstacleMultiplier;  // Desktop
            height = 110 * sideObstacleMultiplier;
          }
          
          let x;
          const safetyMargin = 10; // Margin from track edge
          
          if (side === 'left') {
            // Place on left side with margin
            const availableSpace = trackLeft - safetyMargin - width;
            x = availableSpace > 0 ? Math.random() * availableSpace : safetyMargin;
          } else {
            // Place on right side with margin
            const availableSpace = canvasDisplayWidth - trackRight - width - safetyMargin;
            x = availableSpace > 0 ? trackRight + safetyMargin + Math.random() * availableSpace : trackRight + safetyMargin;
          }
          
          winterSideObstacles.push({ x, y: -50, width, height, type, side });
        }
      }

      // Create a winter collectible (kjelke with 15 points)
      function createWinterCollectible() {
        const width = isMobile() ? 50 : 65;
        const height = isMobile() ? 40 : 45;
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        // Winter collectibles are always kjelke with 15 points
        const type = 'kjelke';
        const points = 15;
        
        collectibles.push({ x, y: -50, width, height, type, points });
      }

      // Create a wrench collectible (spring phase)
      function createWrenchCollectible() {
        const width = isMobile() ? 50 : 65;
        const height = isMobile() ? 40 : 45;
        
        // Get current canvas display width
        const canvasDisplayWidth = canvas.getBoundingClientRect().width;
        
        // Spawn within track boundaries (mobile: 70%, desktop: 50%)
        const trackWidthRatio = isMobile() ? 0.7 : 0.5;
        const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
        const trackWidth = canvasDisplayWidth * trackWidthRatio;
        const x = trackLeft + Math.random() * (trackWidth - width);
        
        // Wrench collectibles have 15 points (same as kjelke)
        const type = 'wrench';
        const points = 15;
        
        collectibles.push({ x, y: -50, width, height, type, points });
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
        lastWinterObstacleTime = 0;
        lastWinterCollectibleTime = 0;
        lastWinterSideObstacleTime = 0;
        showMessage = false;
        messageTimer = 0;
        showRadarHint = false;
        radarHintTimer = 0;
        obstacles.length = 0;
        sideObstacles.length = 0;
        mountainTrees.length = 0;
        collectibles.length = 0;
        desertObstacles.length = 0;
        desertSideObstacles.length = 0;
        winterObstacles.length = 0;
        winterSideObstacles.length = 0;

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
        lastRadarSpawnTime = 0;
        radarSpawnCount = 0;
        
        // Reset desert message variables
        showDesertMessage = false;
        desertMessageTimer = 0;
        
        // Reset winter hint message variables
        showWinterHint = false;
        winterHintTimer = 0;
        
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
        firstRadarCollected = false;
        missedRadarAttempts = 0;
        preDesertTrackSpeed = BASE_TRACK_SPEED;
        preDesertPlayerSpeed = BASE_PLAYER_SPEED;
        
        // Reset winter scene variables
        winterSceneActive = false;
        winterSceneTimer = 0;
        winterSoundStarted = false;
        firstWinterCompleted = false;
        preWinterTrackSpeed = BASE_TRACK_SPEED;
        preWinterPlayerSpeed = BASE_PLAYER_SPEED;
        winterFogActive = false;
        winterObstacleSpawnStartTime = 0;
        
        // Reset seasonal phase variables
        currentSeasonPhase = 'winter';
        lastWrenchCollectibleTime = 0;
        
        // Reset pre-winter warning variables
        preWinterWarningActive = false;
        preWinterWarningTimer = 0;
        preWinterOriginalPlayerSpeed = BASE_PLAYER_SPEED;
        preWinterOriginalTrackSpeed = BASE_TRACK_SPEED;
        
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

          // Stop winter sounds if game over occurs during winter scene
          try {
            if (winterSound && typeof winterSound.stop === 'function') {
              winterSound.stop();
              console.log('Stopped winter sound - game over');
            }
          } catch (e) {
            console.warn('Error stopping winter sound on game over:', e);
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
        // Skip speed updates during desert scene and winter scenes to maintain controlled speeds
        if (!desertSceneActive && !preWinterWarningActive && !winterSceneActive) {
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

        // Create obstacles (pause spawning during desert scene and entire winter scene)
        if (!desertSceneActive && !winterSceneActive && timestamp - lastObstacleTime > obstacleFrequency) {
          createObstacle();
          lastObstacleTime = timestamp;
        }

        // Create collectibles (normal gameplay) - 3x more frequent during Ludvig effect
        // Pause during desert scene and entire winter scene
        const currentCollectibleFrequency = ludvigActive ? collectibleFrequency / 3 : collectibleFrequency;
        if (!desertSceneActive && !winterSceneActive && timestamp - lastCollectibleTime > currentCollectibleFrequency) {
          createCollectible();
          lastCollectibleTime = timestamp;
        }

        // Create desert collectibles (during desert scene only)
        if (desertSceneActive && timestamp - lastDesertCollectibleTime > desertCollectibleFrequency) {
          createDesertCollectible();
          lastDesertCollectibleTime = timestamp;
        }

        // Create side elements with alternating patterns (pause spawning during desert scene and winter transition period only)
        if (!desertSceneActive && !(winterSceneActive && !winterFogActive) && timestamp - lastSideObstacleTime > sideObstacleFrequency) {
          createSideElements();
          lastSideObstacleTime = timestamp;
        }

        // Create desert obstacles (only during desert scene, 2x frequency)
        if (desertSceneActive && timestamp - lastDesertObstacleTime > desertObstacleFrequency) {
          createDesertObstacle();
          lastDesertObstacleTime = timestamp;
        }

        // Create desert side obstacles (only during desert scene, frequent spawning)
        if (desertSceneActive && timestamp - lastDesertSideObstacleTime > desertSideObstacleFrequency) {
          createDesertSideObstacles();
          lastDesertSideObstacleTime = timestamp;
        }

        // Create winter obstacles (only after visual delay AND 3-second obstacle spawn delay)
        const obstacleSpawnReady = winterObstacleSpawnStartTime > 0 && (Date.now() - winterObstacleSpawnStartTime) >= winterObstacleSpawnDelay;
        if (winterSceneActive && winterFogActive && obstacleSpawnReady && timestamp - lastWinterObstacleTime > winterObstacleFrequency) {
          createWinterObstacle();
          lastWinterObstacleTime = timestamp;
        }

        // Create winter collectibles (only after visual delay AND 3-second obstacle spawn delay)
        if (winterSceneActive && winterFogActive && obstacleSpawnReady && currentSeasonPhase === 'winter' && timestamp - lastWinterCollectibleTime > winterCollectibleFrequency) {
          createWinterCollectible();
          lastWinterCollectibleTime = timestamp;
        }

        // Create wrench collectibles during spring phase (only after visual delay AND 3-second obstacle spawn delay)
        if (winterSceneActive && winterFogActive && obstacleSpawnReady && currentSeasonPhase === 'spring' && timestamp - lastWrenchCollectibleTime > wrenchCollectibleFrequency) {
          createWrenchCollectible();
          lastWrenchCollectibleTime = timestamp;
        }

        // Create winter side obstacles (only after visual delay - no obstacle spawn delay for side elements)
        if (winterSceneActive && winterFogActive && timestamp - lastWinterSideObstacleTime > winterSideObstacleFrequency) {
          createWinterSideObstacles();
          lastWinterSideObstacleTime = timestamp;
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
          
          // Update desert side obstacles
          desertSideObstacles.forEach((obstacle) => {
            obstacle.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen desert side obstacles
          for (let i = desertSideObstacles.length - 1; i >= 0; i--) {
            if (desertSideObstacles[i].y > canvas.height + desertSideObstacles[i].height) {
              desertSideObstacles.splice(i, 1);
            }
          }
        }

        // Update winter obstacles (only move during winter scene)
        if (winterSceneActive) {
          winterObstacles.forEach((obstacle) => {
            obstacle.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen winter obstacles
          for (let i = winterObstacles.length - 1; i >= 0; i--) {
            if (winterObstacles[i].y > canvas.height + winterObstacles[i].height) {
              winterObstacles.splice(i, 1);
            }
          }
          
          // Update winter side obstacles
          winterSideObstacles.forEach((obstacle) => {
            obstacle.y += currentTrackSpeed * (deltaTime / 1000);
          });
          // Remove off-screen winter side obstacles
          for (let i = winterSideObstacles.length - 1; i >= 0; i--) {
            if (winterSideObstacles[i].y > canvas.height + winterSideObstacles[i].height) {
              winterSideObstacles.splice(i, 1);
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
              firstRadarCollected = true; // Mark first radar as collected
              mistActive = false;
              mistTimer = 0;
              showMistMessage = false;
              mistMessageTimer = 0;
              radarSpawnedThisMist = false; // Reset flag when radar is collected
              radarSpawnCount = 0; // Reset radar spawn count when radar is collected
              
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
              } else if (collectible.type === 'kjelke') {
                points = 15; // kjelke gives 15 points
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
          // Score-based system: first mist at 50 points or higher
          if (score >= 50 && lastMistScore < 50) {
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

          // Immediately spawn radar when mist starts (professional timing)
          createRadarOnMistStart();

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
          
          // Handle speed-based radar spawning during mist
          handleSpeedBasedRadarSpawning();
          
          if (mistTimer <= 0) {
            mistActive = false;
            
            // If radar wasn't collected during this mist, increment missed attempts counter
            if (!firstRadarCollected) {
              missedRadarAttempts++;
              console.log(`Mist ended without radar collection - missed attempts: ${missedRadarAttempts}/${maxMissedRadarAttempts}`);
            }
            
            radarSpawnedThisMist = false; // Reset flag when mist ends naturally
            radarSpawnCount = 0; // Reset radar spawn count for next mist
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

        // Update winter hint timer
        if (showWinterHint) {
          winterHintTimer -= deltaTime;
          if (winterHintTimer <= 0) {
            showWinterHint = false;
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
              desertDesperadosCount = 0; // Reset desperados counter for new desert scene
              
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

        // Alternative desert scene trigger - if player missed too many radar attempts
        if (!firstRadarCompleted && !desertSceneActive && missedRadarAttempts >= maxMissedRadarAttempts) {
          console.log(`🏜️ Alternative desert scene trigger - player missed ${missedRadarAttempts} radar attempts`);
          firstRadarCompleted = true; // Mark as completed to prevent future triggers
          firstRadarCollected = true; // Also mark as collected to prevent further radar spawning
          
          // Trigger desert scene
          desertSceneActive = true;
          desertSceneTimer = desertSceneDuration;
          desertSoundStarted = false;
          desertDesperadosCount = 0; // Reset desperados counter for new desert scene
          
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
          
          console.log('🏜️ ALTERNATIVE DESERT SCENE ACTIVATED - helping player progress');
          
          // Trigger desert scene message
          showDesertMessage = true;
          desertMessageTimer = desertMessageDuration;
          console.log('🏜️ Desert message triggered: "Her væra like stille som den ørken"');
          
          // Stop background music immediately but delay desert sound
          try {
            backgroundMusic.stop();
            console.log('🏜️ Alternative desert scene activated - background music stopped');
          } catch (e) {
            console.warn('Error stopping background music for alternative desert scene:', e);
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
              lastMistTime = gameTime - mistTimeInterval; // Set timer so mist triggers immediately
              console.log('Desert scene completed - switching to time-based mist system (mist will start immediately, then every 8 seconds)');
            }
            
            // Clear desert obstacles
            desertObstacles.length = 0;
            desertSideObstacles.length = 0;
            
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

        // Check for winter scene trigger - after desert completed and first radar/mist cycle ended
        // Alternative trigger: 36 seconds and 180 points reached
        if (!winterSceneActive && !firstWinterCompleted) {
          let shouldTriggerWinter = false;
          
          // Primary trigger: after desert scene completion AND not in mist/radar
          if (firstRadarCompleted && !mistActive && !radarActive && !desertSceneActive) {
            shouldTriggerWinter = true;
            console.log('❄️ Winter scene trigger - Primary: after desert completion, no mist/radar active');
          }
          
          // Alternative trigger: 36 seconds + 180 points
          if (gameTime >= 36000 && score >= 180) { // 36 seconds = 36000ms
            shouldTriggerWinter = true;
            console.log('❄️ Winter scene trigger - Alternative: 36 seconds + 180 points reached');
          }
          
          if (shouldTriggerWinter) {
            // Start pre-winter warning (2-second speed decrease before winter scene)
            preWinterWarningActive = true;
            preWinterWarningTimer = preWinterWarningDuration; // 2 seconds countdown
            firstWinterCompleted = true; // Mark as completed to prevent future triggers
            
            // Store current speeds for gradual decrease during warning period
            preWinterOriginalPlayerSpeed = currentPlayerSpeed;
            preWinterOriginalTrackSpeed = currentTrackSpeed;
            
            console.log('⚠️ PRE-WINTER WARNING ACTIVATED - Starting 2-second speed decrease');
          }
        }
        
        // Handle pre-winter warning period (2-second speed decrease)
        if (preWinterWarningActive) {
          preWinterWarningTimer -= deltaTime;
          
          // Calculate gradual speed decrease over 2 seconds
          const warningProgress = 1 - (preWinterWarningTimer / preWinterWarningDuration); // 0 to 1
          const targetPlayerSpeed = WINTER_GAME_SPEED; // 0.5 for very slow winter experience
          const targetTrackSpeed = BASE_TRACK_SPEED;
          
          // Interpolate speeds (works even during radar)
          currentPlayerSpeed = preWinterOriginalPlayerSpeed - (preWinterOriginalPlayerSpeed - targetPlayerSpeed) * warningProgress;
          currentTrackSpeed = preWinterOriginalTrackSpeed - (preWinterOriginalTrackSpeed - targetTrackSpeed) * warningProgress;
          
          // Update player object speeds (use movement speed for keyboard responsiveness)
          player.speedX = WINTER_PLAYER_MOVEMENT_SPEED;
          player.speedY = WINTER_PLAYER_MOVEMENT_SPEED;
          
          // When warning period ends, activate full winter scene
          if (preWinterWarningTimer <= 0) {
            preWinterWarningActive = false;
            
            // Now activate the full winter scene
            winterSceneActive = true;
            winterSceneTimer = winterSceneDuration + winterVisualDelay; // Add delay to total duration
            winterSoundStarted = false;
            winterFogActive = false; // Don't activate fog immediately - wait for delay
            
            // Store current speeds (should now be close to target speeds)
            preWinterTrackSpeed = currentTrackSpeed;
            preWinterPlayerSpeed = currentPlayerSpeed;
            
            // Ensure final speeds are exactly what we want
            currentTrackSpeed = BASE_TRACK_SPEED;
            currentPlayerSpeed = WINTER_GAME_SPEED; // 0.5 for very slow winter experience
            player.speedX = WINTER_PLAYER_MOVEMENT_SPEED; // 200 for responsive keyboard controls
            player.speedY = WINTER_PLAYER_MOVEMENT_SPEED;
            
            // Set the start time for obstacle spawn delay (5 seconds from now)
            winterObstacleSpawnStartTime = Date.now();
            
            // Initialize seasonal phase system
            currentSeasonPhase = 'winter';
            lastWrenchCollectibleTime = 0;
            
            // Trigger winter hint message
            showWinterHint = true;
            winterHintTimer = winterHintDuration;
            
            console.log('❄️ WINTER SCENE ACTIVATED - Speeds now at target values, normal obstacles continue');
            
            // Stop current background music and mist sounds immediately
            try {
              if (backgroundMusic && backgroundMusic.playing()) {
                backgroundMusic.stop();
                console.log('❄️ Background music stopped immediately for winter scene');
              }
              if (radarSound && radarSound.playing()) {
                radarSound.stop();
                console.log('❄️ Radar sound stopped for winter scene');
              }
            } catch (e) {
              console.warn('Error stopping sounds for winter scene:', e);
            }
            
            // Start winter music immediately when scene begins
            winterSoundStarted = true; // Mark as started
            try {
              if (winterSound && winterSound.state() === 'loaded') {
                winterSound.play();
                console.log('❄️ Winter music started immediately');
              } else {
                console.warn('⚠️ Winter sound not ready, state:', winterSound ? winterSound.state() : 'undefined');
                winterSound && winterSound.play();
              }
            } catch (e) {
              console.error('❌ Error starting winter music immediately:', e);
            }
          }
        }

        // Update winter scene timer
        if (winterSceneActive) {
          winterSceneTimer -= deltaTime;
          
          // Activate winter visual effects after 5-second delay
          if (!winterFogActive && winterSceneTimer <= winterSceneDuration) {
            winterFogActive = true; // Activate fog and visual effects after delay
            
            // Keep speeds at base level during winter (let normal speed progression resume)
            // Speeds remain at base values set when winter scene started
            // This allows natural game speed increases to resume from the beginning
            
            console.log('❄️ Winter visual effects activated - speeds remain at start level, natural progression resumes');
          }
          
          // Update seasonal phases based on remaining timer
          const timeElapsed = (winterSceneDuration + winterVisualDelay) - winterSceneTimer;
          if (timeElapsed >= winterPhaseDuration + springPhaseDuration && currentSeasonPhase !== 'summer') {
            currentSeasonPhase = 'summer';
            console.log('☀️ Summer phase activated');
          } else if (timeElapsed >= winterPhaseDuration && currentSeasonPhase === 'winter') {
            currentSeasonPhase = 'spring';
            console.log('🌸 Spring/Autumn phase activated');
          }
          
          // Winter sound is now started immediately when scene begins (no delay)
          
          if (winterSceneTimer <= 0) {
            winterSceneActive = false;
            winterFogActive = false; // Deactivate fog effect
            
            // Clear winter obstacles
            winterObstacles.length = 0;
            winterSideObstacles.length = 0;
            
            // Keep current speeds that have naturally progressed during winter scene
            // Don't restore pre-winter speeds - let natural progression continue
            player.speedX = currentPlayerSpeed;
            player.speedY = currentPlayerSpeed;
            
            console.log('❄️ Winter scene ended - speeds continue natural progression from winter levels');
            
            // Stop winter sound and restore background music
            try {
              if (winterSound && winterSound.playing()) {
                winterSound.stop();
                console.log('⏹️ Winter sound stopped');
              }
              
              // Resume background music
              if (backgroundMusic && backgroundMusic.state() === 'loaded') {
                backgroundMusic.play();
                console.log('🎵 Background music resumed after winter scene');
              } else {
                console.warn('⚠️ Background music not ready, attempting to load and play');
                if (backgroundMusic) {
                  backgroundMusic.once('load', () => {
                    backgroundMusic.play();
                    console.log('🎵 Background music started after loading');
                  });
                  backgroundMusic.load();
                  backgroundMusic.play();
                }
              }
              
              console.log('❄️ Winter scene ended - all audio restored');
            } catch (e) {
              console.error('❌ Error restoring audio after winter scene:', e);
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
            if (obstacle.type === 'desperados') {
              gameOverCause = 'desperados';
            } else {
              gameOverCause = 'default';
            }

            // Play appropriate game over sound based on obstacle type
            try {
              if (gameOverCause === 'desperados') {
                // Play desperados sound for desperados obstacles
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

        // Side obstacle collision detection - deadly obstacles (mountains and trees)
        sideObstacles.forEach((obstacle) => {
          // More realistic collision for side obstacles - they should be dangerous!
          let collisionReduction = 0.3; // Less forgiving - mountains and trees are solid obstacles
          
          // Slightly more forgiving collision on mobile
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

        // Mountain and tree collision detection - deadly natural obstacles
        mountainTrees.forEach((obstacle) => {
          // Standard collision for mountains and trees - they're solid!
          let collisionReduction = 0.25; // Less forgiving - mountains and trees are large solid obstacles
          
          // Slightly more forgiving collision on mobile
          if (isMobile()) {
            collisionReduction = 0.35;
          }
          
          // Extra forgiving for Solan car
          if (selectedCar === 'solan-propell-sykkel') {
            collisionReduction = 0.45;
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
            gameOverCause = 'default'; // Mountains and trees use default game over
            
            // Play default game over sound for mountains and trees
            try {
              if (gameOverSound && gameOverSound.state() === 'loaded') {
                gameOverSound.play();
              } else {
                console.warn('Game over sound not ready, attempting to play anyway');
                gameOverSound && gameOverSound.play();
              }
            } catch (e) {
              console.warn('Error playing mountain/tree game over sound:', e);
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
              
              // Set game over cause based on obstacle type
              if (obstacle.type === 'desperados') {
                gameOverCause = 'desperados'; // Desperados use special dialog and sound
              } else {
                gameOverCause = 'desert'; // Palm and camel use desert game over
              }
              
              // Play appropriate game over sound based on obstacle type
              try {
                if (gameOverCause === 'desperados') {
                  // Play desperados sound for desperados obstacles
                  if (desperadosGameOverSound && desperadosGameOverSound.state() === 'loaded') {
                    desperadosGameOverSound.play();
                  } else {
                    console.warn('Desperados game over sound not ready, attempting to play anyway');
                    desperadosGameOverSound && desperadosGameOverSound.play();
                  }
                } else {
                  // Play default game over sound for palm/camel
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
          
          // Desert side obstacle collision detection (deadly during desert scene)
          desertSideObstacles.forEach((obstacle) => {
            // Less forgiving collision for side obstacles - they're now dangerous!
            let collisionReduction = 0.2; // More precise collision than decorative side obstacles
            
            // Slightly more forgiving collision on mobile
            if (isMobile()) {
              collisionReduction = 0.3;
            }
            
            // Extra forgiving for Solan car
            if (selectedCar === 'solan-propell-sykkel') {
              collisionReduction = 0.4;
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
              
              // Set game over cause based on obstacle type
              if (obstacle.type === 'desperados') {
                gameOverCause = 'desperados'; // Desperados use special dialog and sound
              } else {
                gameOverCause = 'desert'; // Palm and camel use desert game over
              }
              
              // Play appropriate game over sound based on obstacle type
              try {
                if (gameOverCause === 'desperados') {
                  // Play desperados sound for desperados obstacles
                  if (desperadosGameOverSound && desperadosGameOverSound.state() === 'loaded') {
                    desperadosGameOverSound.play();
                  } else {
                    console.warn('Desperados game over sound not ready, attempting to play anyway');
                    desperadosGameOverSound && desperadosGameOverSound.play();
                  }
                } else {
                  // Play default game over sound for palm/camel
                  if (gameOverSound && gameOverSound.state() === 'loaded') {
                    gameOverSound.play();
                  } else {
                    console.warn('Game over sound not ready, attempting to play anyway');
                    gameOverSound && gameOverSound.play();
                  }
                }
              } catch (e) {
                console.warn('Error playing desert side obstacle game over sound:', e);
              }
            }
          });
        }

        // Winter obstacle collision detection (only during winter scene)
        if (winterSceneActive) {
          // Winter main obstacles (snow)
          winterObstacles.forEach((obstacle) => {
            // Standard collision for winter obstacles
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
              gameOverCause = 'winter'; // Winter snow obstacle collision
              
              // Play default game over sound for winter obstacles
              try {
                if (gameOverSound && gameOverSound.state() === 'loaded') {
                  gameOverSound.play();
                } else {
                  console.warn('Game over sound not ready, attempting to play anyway');
                  gameOverSound && gameOverSound.play();
                }
              } catch (e) {
                console.warn('Error playing winter obstacle game over sound:', e);
              }
            }
          });
          
          // Winter side obstacles (mountains) - less forgiving since they're on sides
          winterSideObstacles.forEach((obstacle) => {
            let collisionReduction = 0.2; // Less forgiving for side obstacles
            
            if (isMobile()) {
              collisionReduction = 0.3;
            }
            
            if (selectedCar === 'solan-propell-sykkel') {
              collisionReduction = 0.4;
            }
            
            const obstacleCollisionX = obstacle.x + (obstacle.width * collisionReduction / 2);
            const obstacleCollisionY = obstacle.y + (obstacle.height * collisionReduction / 2);
            const obstacleCollisionWidth = obstacle.width * (1 - collisionReduction);
            const obstacleCollisionHeight = obstacle.height * (1 - collisionReduction);
            
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
              gameOverCause = 'winter'; // Winter mountain obstacle collision
              
              // Play default game over sound for winter side obstacles
              try {
                if (gameOverSound && gameOverSound.state() === 'loaded') {
                  gameOverSound.play();
                } else {
                  console.warn('Game over sound not ready, attempting to play anyway');
                  gameOverSound && gameOverSound.play();
                }
              } catch (e) {
                console.warn('Error playing winter side obstacle game over sound:', e);
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

        // Draw background (desert, seasonal, or grass based on scene)
        if (desertSceneActive) {
          // Desert background - sandy beige gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
          gradient.addColorStop(0, "#F4A460"); // Sandy brown
          gradient.addColorStop(0.5, "#DEB887"); // Burlywood
          gradient.addColorStop(1, "#D2B48C"); // Tan
          ctx.fillStyle = gradient;
        } else if (winterSceneActive && winterFogActive) {
          // Seasonal background based on current phase
          const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
          if (currentSeasonPhase === 'winter') {
            // Winter - light gray/white
            gradient.addColorStop(0, "#F0F8FF"); // Alice blue
            gradient.addColorStop(0.5, "#E8E8E8"); // Light gray
            gradient.addColorStop(1, "#DCDCDC"); // Gainsboro
          } else if (currentSeasonPhase === 'spring') {
            // Spring/Autumn - orange/brown transitional colors
            gradient.addColorStop(0, "#FFA500"); // Orange
            gradient.addColorStop(0.5, "#CD853F"); // Peru
            gradient.addColorStop(1, "#D2691E"); // Chocolate
          } else if (currentSeasonPhase === 'summer') {
            // Summer - warm green, back to original-like
            gradient.addColorStop(0, "#32CD32"); // Lime green
            gradient.addColorStop(0.5, "#228B22"); // Forest green
            gradient.addColorStop(1, "#006400"); // Dark green
          }
          ctx.fillStyle = gradient;
        } else {
          // Normal grass background
          ctx.fillStyle = "#228B22"; // Forest green color for grass
        }
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Draw track (scrolling road) - using display dimensions
        if (desertSceneActive) {
          ctx.fillStyle = "#CD853F"; // Desert road color (sandy brown)
        } else if (winterSceneActive && winterFogActive) {
          // Seasonal road colors
          if (currentSeasonPhase === 'winter') {
            ctx.fillStyle = "#FAFAFA"; // Winter road color (white)
          } else if (currentSeasonPhase === 'spring') {
            ctx.fillStyle = "#8B4513"; // Spring/Autumn road color (saddle brown)
          } else if (currentSeasonPhase === 'summer') {
            ctx.fillStyle = "#708090"; // Summer road color (slate gray)
          }
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
            } else if (obstacle.type === 'desperados' && desperadosObstacleImageLoaded) {
              ctx.drawImage(
                desperadosObstacleImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            } else {
              // Fallback for when images aren't loaded
              let fillColor = "brown";
              if (obstacle.type === 'palm') fillColor = "green";
              else if (obstacle.type === 'desperados') fillColor = "purple";
              ctx.fillStyle = fillColor;
              ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            }
          });
          
          // Draw desert side obstacles during desert scene
          desertSideObstacles.forEach((obstacle) => {
            // Draw shadow circle behind side obstacle
            const shadowRadius = Math.max(obstacle.width, obstacle.height) / 2 + 6;
            const shadowCenterX = obstacle.x + obstacle.width / 2;
            const shadowCenterY = obstacle.y + obstacle.height;
            
            // Create shadow gradient
            const shadowGradient = ctx.createRadialGradient(
              shadowCenterX, shadowCenterY, 0,
              shadowCenterX, shadowCenterY, shadowRadius
            );
            shadowGradient.addColorStop(0, "rgba(139, 69, 19, 0.4)"); // Brown shadow, slightly darker for sides
            shadowGradient.addColorStop(0.6, "rgba(139, 69, 19, 0.2)");
            shadowGradient.addColorStop(1, "rgba(139, 69, 19, 0)");
            
            // Draw shadow circle
            ctx.fillStyle = shadowGradient;
            ctx.beginPath();
            ctx.arc(shadowCenterX, shadowCenterY, shadowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw the desert side obstacle image on top of shadow
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
            } else if (obstacle.type === 'desperados' && desperadosObstacleImageLoaded) {
              ctx.drawImage(
                desperadosObstacleImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            } else {
              // Fallback for when images aren't loaded
              let fillColor = "brown";
              if (obstacle.type === 'palm') fillColor = "green";
              else if (obstacle.type === 'desperados') fillColor = "purple";
              ctx.fillStyle = fillColor;
              ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            }
          });
        }

        // Draw winter obstacles during winter scene (only after visual delay)
        if (winterSceneActive && winterFogActive) {
          // Draw winter main obstacles (snow)
          winterObstacles.forEach((obstacle) => {
            // Draw shadow circle behind obstacle
            const shadowRadius = Math.max(obstacle.width, obstacle.height) / 2 + 8;
            const shadowCenterX = obstacle.x + obstacle.width / 2;
            const shadowCenterY = obstacle.y + obstacle.height;
            
            // Shadow gradient
            const gradient = ctx.createRadialGradient(
              shadowCenterX, shadowCenterY, 0,
              shadowCenterX, shadowCenterY, shadowRadius
            );
            gradient.addColorStop(0, 'rgba(150, 100, 100, 0.4)'); // Red shadow for danger warning
            gradient.addColorStop(1, 'rgba(150, 100, 100, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(shadowCenterX, shadowCenterY, shadowRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw the snow obstacle image
            if (snowImageLoaded) {
              ctx.drawImage(
                snowImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            } else {
              // Fallback: white snow pile
              ctx.fillStyle = "white";
              ctx.strokeStyle = "#E6F3FF"; // Light blue outline
              ctx.lineWidth = 2;
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
              ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
          });
          
          // Draw winter side obstacles (mountains)
          winterSideObstacles.forEach((obstacle) => {
            // Draw shadow circle behind side obstacle
            const shadowRadius = Math.max(obstacle.width, obstacle.height) / 2 + 6;
            const shadowCenterX = obstacle.x + obstacle.width / 2;
            const shadowCenterY = obstacle.y + obstacle.height;
            
            // Shadow gradient
            const gradient = ctx.createRadialGradient(
              shadowCenterX, shadowCenterY, 0,
              shadowCenterX, shadowCenterY, shadowRadius
            );
            gradient.addColorStop(0, 'rgba(100, 100, 150, 0.25)');
            gradient.addColorStop(1, 'rgba(100, 100, 150, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(shadowCenterX, shadowCenterY, shadowRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw the mountain obstacle image
            if (mountainImageLoaded) {
              ctx.drawImage(
                mountainImage,
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
              );
            } else {
              // Fallback: gray mountain with snow cap
              ctx.fillStyle = "#8B9DC3"; // Gray-blue mountain
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
              
              // Snow cap
              ctx.fillStyle = "white";
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height * 0.3);
              
              ctx.strokeStyle = "#5D6B8D";
              ctx.lineWidth = 2;
              ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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
            } else if (collectible.type === 'kjelke') {
              // Draw kjelke (winter collectible with 15 points) with gold glow
              
              // Create gold glow effect
              const glowRadius = Math.max(collectible.width, collectible.height) / 2 + 12;
              const glowCenterX = collectible.x + collectible.width / 2;
              const glowCenterY = collectible.y + collectible.height / 2;
              
              // Outer gold glow
              const outerGlow = ctx.createRadialGradient(
                glowCenterX, glowCenterY, 0,
                glowCenterX, glowCenterY, glowRadius
              );
              outerGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)'); // Gold
              outerGlow.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)');
              outerGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
              
              ctx.fillStyle = outerGlow;
              ctx.beginPath();
              ctx.arc(glowCenterX, glowCenterY, glowRadius, 0, 2 * Math.PI);
              ctx.fill();
              
              // Inner bright glow
              const innerGlow = ctx.createRadialGradient(
                glowCenterX, glowCenterY, 0,
                glowCenterX, glowCenterY, glowRadius * 0.6
              );
              innerGlow.addColorStop(0, 'rgba(255, 255, 0, 0.4)'); // Bright yellow
              innerGlow.addColorStop(1, 'rgba(255, 255, 0, 0)');
              
              ctx.fillStyle = innerGlow;
              ctx.beginPath();
              ctx.arc(glowCenterX, glowCenterY, glowRadius * 0.6, 0, 2 * Math.PI);
              ctx.fill();
              
              if (kjelkeImageLoaded) {
                ctx.drawImage(
                  kjelkeImage,
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              } else {
                // Fallback for kjelke: brown sled shape
                ctx.fillStyle = "#8B4513"; // Brown color
                ctx.fillRect(
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
                // Add some detail lines
                ctx.strokeStyle = "#654321";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              }
            } else if (collectible.type === 'wrench') {
              // Draw wrench (spring collectible with 15 points) with gold glow
              
              // Create gold glow effect
              const glowRadius = Math.max(collectible.width, collectible.height) / 2 + 12;
              const glowCenterX = collectible.x + collectible.width / 2;
              const glowCenterY = collectible.y + collectible.height / 2;
              
              // Outer gold glow
              const outerGlow = ctx.createRadialGradient(
                glowCenterX, glowCenterY, 0,
                glowCenterX, glowCenterY, glowRadius
              );
              outerGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)'); // Gold
              outerGlow.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)');
              outerGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
              
              ctx.fillStyle = outerGlow;
              ctx.beginPath();
              ctx.arc(glowCenterX, glowCenterY, glowRadius, 0, 2 * Math.PI);
              ctx.fill();
              
              // Inner bright glow
              const innerGlow = ctx.createRadialGradient(
                glowCenterX, glowCenterY, 0,
                glowCenterX, glowCenterY, glowRadius * 0.6
              );
              innerGlow.addColorStop(0, 'rgba(255, 255, 0, 0.4)'); // Bright yellow
              innerGlow.addColorStop(1, 'rgba(255, 255, 0, 0)');
              
              ctx.fillStyle = innerGlow;
              ctx.beginPath();
              ctx.arc(glowCenterX, glowCenterY, glowRadius * 0.6, 0, 2 * Math.PI);
              ctx.fill();
              
              if (wrenchImageLoaded) {
                ctx.drawImage(
                  wrenchImage,
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              } else {
                // Fallback for wrench: silver tool shape
                ctx.fillStyle = "#C0C0C0"; // Silver color
                ctx.fillRect(
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
                // Add some detail lines
                ctx.strokeStyle = "#A0A0A0";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                  collectible.x,
                  collectible.y,
                  collectible.width,
                  collectible.height
                );
              }
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

        // Draw winter hint message with kjelke image
        if (showWinterHint) {
          // Define responsive image dimensions based on device type
          const isMobileDevice = isMobile();
          const displayWidth = canvas.getBoundingClientRect().width;
          const displayHeight = canvas.getBoundingClientRect().height;
          
          // Responsive image sizing: smaller on mobile, larger on desktop
          const imageWidth = isMobileDevice ? Math.min(60, displayWidth * 0.15) : 80;
          const imageHeight = isMobileDevice ? Math.min(60, displayHeight * 0.1) : 80;
          
          // Responsive font size for hint message
          const fontSize = isMobileDevice ? Math.max(18, Math.min(24, displayWidth * 0.045)) : 28;
          ctx.font = `bold ${fontSize}px Arial`;
          
          // Responsive gap between image and text
          const gap = isMobileDevice ? Math.max(10, displayWidth * 0.025) : 20;
          
          // Calculate positions with responsive values
          const hintText = "Hint: catch the kjelke";
          const textWidth = ctx.measureText(hintText).width;
          const totalWidth = imageWidth + gap + textWidth;
          const startX = displayWidth / 2 - totalWidth / 2; // Center the combined image and text
          const imageX = Math.max(10, startX); // Image on the left with minimum margin
          
          // Position based on device type: under scoreboards for mobile, top for desktop
          let imageY, textY;
          if (isMobileDevice) {
            // Mobile: position under scoreboards
            const scoreboardHeight = 80; // Estimated height of scoreboards area
            const marginFromScoreboards = 15; // Small margin under scoreboards
            imageY = scoreboardHeight + marginFromScoreboards;
            textY = imageY + imageHeight / 2 + (fontSize * 0.3);
          } else {
            // Desktop: position at top
            imageY = 25;
            textY = imageY + imageHeight / 2 + (fontSize * 0.3);
          }
          
          const textX = imageX + imageWidth + gap; // Text to the right of the image

          // Draw the kjelke image to the left with winter glow
          if (kjelkeImageLoaded) {
            // Add winter glow effect around kjelke image
            const glowRadius = Math.max(imageWidth, imageHeight) / 2 + 8;
            const glowCenterX = imageX + imageWidth / 2;
            const glowCenterY = imageY + imageHeight / 2;
            
            // Winter blue glow
            const winterGlow = ctx.createRadialGradient(
              glowCenterX, glowCenterY, 0,
              glowCenterX, glowCenterY, glowRadius
            );
            winterGlow.addColorStop(0, 'rgba(173, 216, 230, 0.6)'); // Light blue
            winterGlow.addColorStop(0.7, 'rgba(173, 216, 230, 0.3)');
            winterGlow.addColorStop(1, 'rgba(173, 216, 230, 0)');
            
            ctx.fillStyle = winterGlow;
            ctx.beginPath();
            ctx.arc(glowCenterX, glowCenterY, glowRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.drawImage(
              kjelkeImage,
              imageX,
              imageY,
              imageWidth,
              imageHeight
            );
          } else {
            // Fallback if image fails to load
            ctx.fillStyle = "#8B4513"; // Brown color for kjelke
            ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
          }

          // Draw the winter hint text to the right of the image
          ctx.fillStyle = "#87CEEB"; // Sky blue color for winter theme
          ctx.textAlign = "left"; // Align text to the left for precise positioning
          
          // Add text shadow for better readability with winter theme
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          ctx.fillText(hintText, textX, textY);
          
          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // Draw mist overlay if active
        if (mistActive) {
          // Calculate mist opacity based on remaining time
          let mistOpacity;

          // Fade in for first 1 second, full opacity for 6 seconds, fade out for last 1 second
          if (mistTimer > mistDuration - 1000) {
            mistOpacity = ((mistDuration - mistTimer) / 1000) * 0.855; // Fade in - dense but not overwhelming
          } else if (mistTimer < 1000) {
            mistOpacity = (mistTimer / 1000) * 0.855; // Fade out - dense but not overwhelming
          } else {
            mistOpacity = 0.855; // Full mist - 10% less foggy (0.95 × 0.9)
          }

          // Create animated mist particles
          const time = gameTime / 1000;
          ctx.globalAlpha = mistOpacity;

          // Calculate track boundaries for mist coverage
          const canvasDisplayWidth = canvas.getBoundingClientRect().width;
          const trackWidthRatio = isMobile() ? 0.7 : 0.5;
          const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
          const trackWidth = canvasDisplayWidth * trackWidthRatio;
          const trackRight = trackLeft + trackWidth;
          
          // Draw extremely dense mist layers - ONLY over the race track
          const particlesPerLayer = (isMobile() || isTablet()) ? 16 : 14; // Even more particles for density
          const layerCount = (isMobile() || isTablet()) ? 7 : 6; // More layers for thicker fog
          
          for (let layer = 0; layer < layerCount; layer++) {
            const layerOffset = layer * 80;
            const layerSpeed = (layer + 1) * 0.4;

            for (let i = 0; i < particlesPerLayer; i++) {
              // Position mist particles only within track boundaries
              const x = trackLeft + ((i * (trackWidth / particlesPerLayer) + Math.sin(time * layerSpeed + i) * 30) % trackWidth);
              // Enhanced Y distribution for full track coverage on mobile/tablet
              const yRange = (isMobile() || isTablet()) ? canvas.height + 200 : canvas.height + 150;
              const yOffset = (isMobile() || isTablet()) ? -100 : -75;
              const y =
                ((i * 60 + Math.cos(time * layerSpeed * 0.8 + i) * 40) %
                  yRange) +
                yOffset;

              // Create track-focused mist particles  
              const mistSizeMultiplier = isTablet() ? 2.5 : (isMobile() ? 1.8 : 1.2); // Adjusted for track coverage
              const baseRadius = (trackWidth / particlesPerLayer) * 0.8 * mistSizeMultiplier; // Size based on track width
              const layerRadius = layer * 15 * mistSizeMultiplier;
              const gradient = ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                baseRadius + layerRadius
              );
              gradient.addColorStop(
                0,
                `rgba(180, 180, 180, ${0.7 + layer * 0.2})` // Denser center, darker color
              );
              gradient.addColorStop(
                0.5,
                `rgba(200, 200, 200, ${0.4 + layer * 0.15})` // More opacity at mid-point
              );
              gradient.addColorStop(
                0.8,
                `rgba(210, 210, 210, ${0.2 + layer * 0.1})` // Extended dense area
              );
              gradient.addColorStop(1, "rgba(220, 220, 220, 0)");

              ctx.fillStyle = gradient;
              const particleRadius = baseRadius + layerRadius;
              ctx.fillRect(
                x - particleRadius,
                y - particleRadius,
                particleRadius * 2,
                particleRadius * 2
              );
            }
          }

          // Add additional heavy fog overlay
          ctx.fillStyle = `rgba(230, 230, 230, ${mistOpacity * 0.3})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Reset global alpha
          ctx.globalAlpha = 1.0;
        }

        // Draw winter fog overlay if active (lighter fog without dirty tricks)
        if (winterFogActive && winterSceneActive) {
          // Calculate winter fog opacity (lighter than mist)
          let fogOpacity = 0.4; // Much lighter than mist effect
          
          // Create animated winter fog particles
          const time = gameTime / 1000;
          ctx.globalAlpha = fogOpacity;

          // Calculate track boundaries for fog coverage
          const canvasDisplayWidth = canvas.getBoundingClientRect().width;
          const trackWidthRatio = isMobile() ? 0.7 : 0.5;
          const trackLeft = canvasDisplayWidth * (1 - trackWidthRatio) / 2;
          const trackWidth = canvasDisplayWidth * trackWidthRatio;
          const trackRight = trackLeft + trackWidth;
          
          // Draw light winter fog layers - over the race track
          const particlesPerLayer = (isMobile() || isTablet()) ? 8 : 6; // Fewer particles for lighter effect
          const layerCount = (isMobile() || isTablet()) ? 4 : 3; // Fewer layers for lighter fog
          
          for (let layer = 0; layer < layerCount; layer++) {
            const layerOffset = layer * 60;
            const layerSpeed = (layer + 1) * 0.3; // Slower movement for gentler effect

            for (let i = 0; i < particlesPerLayer; i++) {
              // Position fog particles only within track boundaries
              const x = trackLeft + ((i * (trackWidth / particlesPerLayer) + Math.sin(time * layerSpeed + i) * 20) % trackWidth);
              // Winter fog Y distribution
              const yRange = (isMobile() || isTablet()) ? canvas.height + 150 : canvas.height + 100;
              const yOffset = (isMobile() || isTablet()) ? -75 : -50;
              const y =
                ((i * 50 + Math.cos(time * layerSpeed * 0.7 + i) * 30) %
                  yRange) +
                yOffset;

              // Seasonal fog particles
              const particleRadius = (isMobile() || isTablet()) ? 15 + layer * 3 : 12 + layer * 2.5;
              
              const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleRadius);
              if (currentSeasonPhase === 'winter') {
                gradient.addColorStop(0, 'rgba(245, 248, 255, 0.3)'); // Light blue-white center
                gradient.addColorStop(1, 'rgba(220, 235, 250, 0)'); // Transparent edges
              } else if (currentSeasonPhase === 'spring') {
                gradient.addColorStop(0, 'rgba(255, 215, 170, 0.3)'); // Orange-tinted center
                gradient.addColorStop(1, 'rgba(255, 200, 150, 0)'); // Transparent edges
              } else if (currentSeasonPhase === 'summer') {
                gradient.addColorStop(0, 'rgba(200, 255, 200, 0.3)'); // Green-tinted center
                gradient.addColorStop(1, 'rgba(180, 255, 180, 0)'); // Transparent edges
              }
              
              ctx.fillStyle = gradient;
              ctx.fillRect(
                x - particleRadius,
                y - particleRadius,
                particleRadius * 2,
                particleRadius * 2
              );
            }
          }

          // Add light seasonal fog overlay
          if (currentSeasonPhase === 'winter') {
            ctx.fillStyle = `rgba(240, 245, 255, ${fogOpacity * 0.2})`; // Blue-tinted
          } else if (currentSeasonPhase === 'spring') {
            ctx.fillStyle = `rgba(255, 220, 180, ${fogOpacity * 0.2})`; // Orange-tinted
          } else if (currentSeasonPhase === 'summer') {
            ctx.fillStyle = `rgba(220, 255, 220, ${fogOpacity * 0.2})`; // Green-tinted
          }
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
          // Use display dimensions for proper responsive positioning
          const displayWidth = canvas.getBoundingClientRect().width;
          const displayHeight = canvas.getBoundingClientRect().height;
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          
          // Device-specific positioning and sizing
          const isMobileDevice = isMobile();
          const isTabletDevice = isTablet();
          
          // Responsive safe zone and positioning
          const safeZone = isMobileDevice ? 80 : (isTabletDevice ? 100 : 120);
          const hintY = canvasHeight - safeZone;
          const hintX = canvasWidth / 2;
          
          // Responsive font size
          const fontSize = isMobileDevice ? 
            Math.max(20, Math.min(28, displayWidth * 0.045)) : 
            (isTabletDevice ? Math.max(24, Math.min(32, displayWidth * 0.04)) : 28);
          
          // Draw hint text with mystical green shadow
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = "#FFFFFF"; // White text
          ctx.textAlign = "center";
          ctx.shadowColor = "#00FF00"; // Green text shadow
          ctx.shadowBlur = isMobileDevice ? 10 : 15;
          ctx.fillText("Hint: Catch the radar", hintX, hintY);
          
          // Draw radar image AFTER text with enhanced green glow
          const imageSize = isMobileDevice ? 
            Math.max(30, Math.min(40, displayWidth * 0.06)) : 
            (isTabletDevice ? Math.max(35, Math.min(45, displayWidth * 0.05)) : 45);
          const textMetrics = ctx.measureText("Hint: Catch the radar");
          const textWidth = textMetrics.width;
          const spacing = isMobileDevice ? 15 : 25;
          const imageX = hintX + textWidth / 2 + spacing;
          const imageY = hintY - imageSize / 2 - 3;
          
          // Enhanced green glow for radar image
          ctx.shadowColor = "#00FF00"; // Bright green shadow
          ctx.shadowBlur = isMobileDevice ? 15 : 25;
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