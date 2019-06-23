import {TextChannel, Guild, User} from 'discord.js';
import { Card, CFHGuild } from './types';

export class Game {
	public channel:TextChannel;
	public guild:Guild;
	public players:User[];
	private blackCards:Card[];
	private whiteCards:Card[];
	constructor(players:User[], channel:TextChannel, guild:CFHGuild) {
		this.channel = channel;
		this.guild = guild;
		this.players = players;
		this.blackCards = guild.client.blackCards;
		this.whiteCards = guild.client.whiteCards;
	}
}