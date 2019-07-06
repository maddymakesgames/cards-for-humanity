import {Client, Guild, Base, Structures, Message, TextChannel, User, Collection, Collector} from 'discord.js';
import * as fs from 'fs';
import { CFHUser } from './user';

export type Card = {
	type:CardType
	des:string
}

export class CFHClient extends Client {
	public cards:Card[]
	public commands:Collection<string, CFHCommand>;
	public aliases:Collection<string, CFHCommand>;

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

export interface CFHCommand  {
    aliases:string[];
	name:string;
	run(Client:CFHClient, message:Message, args:string[]):void;
    
}

export interface CFHEvent {
	name:string;
	run(Client:CFHClient, event: TextChannel | CFHUser | Message):void;	
	
}

export enum CardType {
	Black,
	White
}

export class CFHGuild extends Guild {
	public readonly client:CFHClient;
}