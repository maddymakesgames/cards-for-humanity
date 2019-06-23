import {Client, Guild, Base, Structures} from 'discord.js';
import * as fs from 'fs';

export type Card = {
	type:CardType
	des:string
}

export class CFHClient extends Client {
	public cards:Card[]

	constructor(...args: any[]) {
		super(...args);
		this.cards = JSON.parse(fs.readFileSync('../../cards.json').toString());
	}

	get blackCards():Card[] {
		return this.cards.filter((c) => c.type==CardType.Black);
	}
	get whiteCards():Card[] {
		return this.cards.filter((c) => c.type==CardType.White);
	}
}

export enum CardType {
	Black,
	White
}

export class CFHGuild extends Guild {
	public readonly client:CFHClient;
	constructor(client:CFHClient, data:object) {
		super(client, data);
		this.client = client;
	}
}