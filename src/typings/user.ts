import { User } from "discord.js";
import { CFHClient, Card } from "./types";
import { Game } from "./game";
export class CFHUser extends User {
	public readonly BASE = 'User';
	public readonly game?:Game;
	public hand:Card[] = [];
	constructor(client:CFHClient, data:object) {
		super(client, data);
	}
}