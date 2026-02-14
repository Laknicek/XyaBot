import { ButtonInteraction, CommandInteraction, Interaction, Message, MessageComponentInteraction } from 'discord.js';

type GameType = 'trivia' | 'wordle' | 'rps' | 'tictactoe' | 'connect4';

interface ActiveGame {
    userId: string;
    type: GameType;
    channelId: string;
    stop: () => void; // Function to call to stop the game (e.g., stop collector)
}

class GameManager {
    private games: Map<string, ActiveGame> = new Map();

    /**
     * Register a new game. If user has existing game, stops it.
     */
    register(userId: string, type: GameType, channelId: string, stopFn: () => void) {
        if (this.games.has(userId)) {
            try {
                this.games.get(userId)?.stop();
            } catch (e) {
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
    stopGame(userId: string): boolean {
        const game = this.games.get(userId);
        if (game) {
            try {
                game.stop();
            } catch (e) {
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
    hasGame(userId: string): boolean {
        return this.games.has(userId);
    }
}

export const gameManager = new GameManager();

export default gameManager;
