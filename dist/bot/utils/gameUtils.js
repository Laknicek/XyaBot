"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = void 0;
class GameManager {
    constructor() {
        this.games = new Map();
    }
    /**
     * Register a new game. If user has existing game, stops it.
     */
    register(userId, type, channelId, stopFn) {
        if (this.games.has(userId)) {
            try {
                this.games.get(userId)?.stop();
            }
            catch (e) {
                console.error(`[GameManager] Error stopping old game for ${userId}:`, e);
            }
        }
        this.games.set(userId, {
            userId,
            type,
            channelId,
            stop: stopFn
        });
        console.log(`[GameManager] Started ${type} for ${userId}`);
    }
    /**
     * Stop a specific user's game if it exists.
     */
    stopGame(userId) {
        const game = this.games.get(userId);
        if (game) {
            try {
                game.stop();
            }
            catch (e) {
                console.error(`[GameManager] Error stopping game for ${userId}:`, e);
            }
            this.games.delete(userId);
            console.log(`[GameManager] Stopped ${game.type} for ${userId}`);
            return true;
        }
        return false;
    }
    /**
     * Check if user has an active game
     */
    hasGame(userId) {
        return this.games.has(userId);
    }
}
exports.gameManager = new GameManager();
exports.default = exports.gameManager;
