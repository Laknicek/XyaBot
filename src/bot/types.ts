import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder | any; // any to allow mix of builders
    execute: (interaction: ChatInputCommandInteraction) => Promise<any>;
}

export interface ExtendedClient extends Client {
    commands: Map<string, Command>;
}
