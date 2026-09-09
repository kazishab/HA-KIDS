// ============= FIREBASE CONFIGURATION =============

const firebaseConfig = {
  apiKey: "AIzaSyCvp6A7K2NpHmD9C0ZNP4eQgZMfdHN8Chg",
  authDomain: "ha-kids.firebaseapp.com",
  projectId: "ha-kids",
  storageBucket: "ha-kids.firebasestorage.app",
  messagingSenderId: "3912039821",
  appId: "1:3912039821:web:685a5e1c2d84e48f7511c4",
  databaseURL: "https://ha-kids-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Global Variables
window.currentUser = null;
window.userId = null;
window.currentRoomId = null;
window.currentRoomCode = null;

// ============= AUTHENTICATION =============
auth.onAuthStateChanged((user) => {
  if (user) {
    window.currentUser = user;
    window.userId = user.uid;
    console.log("✅ User logged in:", user.uid);
  } else {
    // Anonymous Authentication
    auth.signInAnonymously().catch((error) => {
      console.error("❌ Auth Error:", error.message);
    });
  }
});

// ============= DATABASE FUNCTIONS =============

/**
 * Save game score to Firebase
 */
async function saveGameScore(gameType, score, mode, timeSpent) {
  if (!window.userId) {
    setTimeout(() => saveGameScore(gameType, score, mode, timeSpent), 1000);
    return;
  }

  try {
    const timestamp = new Date().getTime();
    
    // Save user score
    await database.ref(`users/${window.userId}/games/${gameType}/scores`).push({
      score: score,
      mode: mode,
      timeSpent: timeSpent,
      timestamp: timestamp
    });

    // Update leaderboard
    const leaderboardRef = database.ref(`leaderboard/${gameType}/${window.userId}`);
    const snapshot = await leaderboardRef.once('value');
    
    if (!snapshot.exists() || snapshot.val().score < score) {
      await leaderboardRef.set({
        score: score,
        uid: window.userId,
        timestamp: timestamp
      });
    }

    console.log("✅ Score saved:", score);
  } catch (error) {
    console.error("❌ Error saving score:", error);
  }
}

/**
 * Create online game room
 */
async function createGameRoom(gameType) {
  try {
    // Generate 4-digit room code (only numbers as per requirement)
    const roomCode = Math.floor(Math.random() * 9000) + 1000;
    const roomId = `room_${Date.now()}_${window.userId.substring(0, 5)}`;

    await database.ref(`rooms/${gameType}/${roomId}`).set({
      roomCode: roomCode,
      gameType: gameType,
      createdBy: window.userId,
      createdAt: new Date().getTime(),
      status: "waiting",
      players: {
        [window.userId]: {
          id: window.userId,
          name: "Player 1",
          score: 0,
          ready: false,
          joinedAt: new Date().getTime()
        }
      }
    });

    console.log("✅ Room created:", roomCode);
    return {
      roomId: roomId,
      roomCode: roomCode
    };
  } catch (error) {
    console.error("❌ Error creating room:", error);
    return null;
  }
}

/**
 * Join online game room
 */
async function joinGameRoom(gameType, roomCode) {
  try {
    // Find room by code (only numbers)
    const roomCodeNum = parseInt(roomCode);
    
    const snapshot = await database
      .ref(`rooms/${gameType}`)
      .once('value');

    if (!snapshot.exists()) {
      return { success: false, message: "কোনো রুম নেই!" };
    }

    const roomsData = snapshot.val();
    let foundRoom = null;
    let foundRoomId = null;

    for (const [roomId, roomData] of Object.entries(roomsData)) {
      if (roomData.roomCode === roomCodeNum) {
        foundRoom = roomData;
        foundRoomId = roomId;
        break;
      }
    }

    if (!foundRoom) {
      return { success: false, message: "রুম খুঁজে পাওয়া যাচ্ছে না!" };
    }

    // Check if room is full
    const playerCount = Object.keys(foundRoom.players || {}).length;
    if (playerCount >= 2) {
      return { success: false, message: "রুম পূর্ণ!" };
    }

    // Add player to room
    await database
      .ref(`rooms/${gameType}/${foundRoomId}/players/${window.userId}`)
      .set({
        id: window.userId,
        name: "Player 2",
        score: 0,
        ready: false,
        joinedAt: new Date().getTime()
      });

    // Update room status
    await database
      .ref(`rooms/${gameType}/${foundRoomId}/status`)
      .set("playing");

    console.log("✅ Room joined:", roomCode);
    return {
      success: true,
      roomId: foundRoomId,
      roomCode: roomCodeNum,
      message: "সফলভাবে যোগদান করেছেন!"
    };
  } catch (error) {
    console.error("❌ Error joining room:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Update player score in online room
 */
async function updateRoomPlayerScore(gameType, roomId, score) {
  try {
    await database
      .ref(`rooms/${gameType}/${roomId}/players/${window.userId}/score`)
      .set(score);
    console.log("✅ Room score updated:", score);
  } catch (error) {
    console.error("❌ Error updating room score:", error);
  }
}

/**
 * Get leaderboard for a game
 */
async function getGameLeaderboard(gameType, limit = 10) {
  try {
    const snapshot = await database
      .ref(`leaderboard/${gameType}`)
      .orderByChild("score")
      .limitToLast(limit)
      .once('value');

    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const leaderboardArray = Object.entries(data).map(([uid, userData]) => ({
      uid: uid,
      score: userData.score,
      timestamp: userData.timestamp
    }));

    return leaderboardArray.reverse();
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    return [];
  }
}

/**
 * Get room data
 */
async function getRoomData(gameType, roomId) {
  try {
    const snapshot = await database
      .ref(`rooms/${gameType}/${roomId}`)
      .once('value');

    return snapshot.val();
  } catch (error) {
    console.error("❌ Error getting room data:", error);
    return null;
  }
}

/**
 * Watch room updates in real-time
 */
function watchRoomUpdates(gameType, roomId, callback) {
  return database
    .ref(`rooms/${gameType}/${roomId}`)
    .on('value', (snapshot) => {
      callback(snapshot.val());
    });
}

/**
 * Leave room
 */
async function leaveRoom(gameType, roomId) {
  try {
    await database
      .ref(`rooms/${gameType}/${roomId}/players/${window.userId}`)
      .remove();

    // Check if room is empty and delete it
    const snapshot = await database
      .ref(`rooms/${gameType}/${roomId}/players`)
      .once('value');

    if (!snapshot.exists()) {
      await database.ref(`rooms/${gameType}/${roomId}`).remove();
    }

    console.log("✅ Left room");
  } catch (error) {
    console.error("❌ Error leaving room:", error);
  }
}

/**
 * Get user stats
 */
async function getUserStats() {
  try {
    const snapshot = await database
      .ref(`users/${window.userId}`)
      .once('value');

    return snapshot.val() || {};
  } catch (error) {
    console.error("❌ Error getting user stats:", error);
    return {};
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('bn-BD');
}

/**
 * Format time in seconds to MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
