"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const discord_js_1 = require("discord.js");
const profile = __importStar(require("./profile"));
const daily = __importStar(require("./daily"));
const help = __importStar(require("./help"));
const wordoftheday = __importStar(require("./wordoftheday"));
const leaderboard = __importStar(require("./leaderboard"));
const join = __importStar(require("./join"));
const rps = __importStar(require("./rps"));
const coinflip = __importStar(require("./coinflip"));
const shop = __importStar(require("./shop"));
const buy = __importStar(require("./buy"));
const gift = __importStar(require("./gift"));
const radio = __importStar(require("./radio"));
const inventory = __importStar(require("./inventory"));
const setupWelcome = __importStar(require("./setup-welcome"));
const testWelcome = __importStar(require("./test-welcome"));
const settings = __importStar(require("./settings"));
const manageFeatures = __importStar(require("./manage-features"));
const sing = __importStar(require("./sing"));
const birthday = __importStar(require("./birthday"));
const confess = __importStar(require("./confess"));
const remind = __importStar(require("./remind"));
const poll = __importStar(require("./poll"));
const eightball = __importStar(require("./8ball"));
const wyr = __importStar(require("./wyr"));
const trivia = __importStar(require("./trivia"));
const tod = __importStar(require("./tod"));
const slots = __importStar(require("./slots"));
const setup = __importStar(require("./setup"));
exports.commands = new discord_js_1.Collection();
exports.commands.set(profile.data.name, profile);
exports.commands.set(daily.data.name, daily);
exports.commands.set(help.data.name, help);
exports.commands.set(wordoftheday.data.name, wordoftheday);
exports.commands.set(leaderboard.data.name, leaderboard);
exports.commands.set(join.data.name, join);
exports.commands.set(rps.data.name, rps);
exports.commands.set(coinflip.data.name, coinflip);
exports.commands.set(shop.data.name, shop);
exports.commands.set(buy.data.name, buy);
exports.commands.set(gift.data.name, gift);
exports.commands.set(radio.data.name, radio);
exports.commands.set(inventory.data.name, inventory);
exports.commands.set(setupWelcome.data.name, setupWelcome);
exports.commands.set(testWelcome.data.name, testWelcome);
exports.commands.set(settings.data.name, settings);
exports.commands.set(manageFeatures.data.name, manageFeatures);
exports.commands.set(sing.data.name, sing);
exports.commands.set(birthday.data.name, birthday);
exports.commands.set(confess.data.name, confess);
exports.commands.set(remind.data.name, remind);
exports.commands.set(poll.data.name, poll);
exports.commands.set(eightball.data.name, eightball);
exports.commands.set(wyr.data.name, wyr);
exports.commands.set(trivia.data.name, trivia);
exports.commands.set(tod.data.name, tod);
exports.commands.set(slots.data.name, slots);
exports.commands.set(setup.data.name, setup);
