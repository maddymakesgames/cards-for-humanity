import { User } from "discord.js";
import { CFHClient } from "./types";
import { Game } from "./game";


export class CFHUser extends User {
	public readonly BASE = 'User';
	public readonly game?:Game;
	constructor(client:CFHClient, data:object) {
		super(client, data);
	}
}