import {TextChannel, Guild, User, MessageEmbed, Message, GuildMember} from 'discord.js';
import { Card, CFHGuild } from './types';
import { CFHUser } from './user';
import { Page, PageInputData } from '../modules/page';

export class Game {
	public channel:TextChannel;
	public guild:Guild;
	public players:CFHUser[];
	private blackCards:Card[];
	private whiteCards:Card[];
	private turn:number = 1;
	constructor(players:CFHUser[], channel:TextChannel, guild:CFHGuild) {
		this.channel = channel;
		this.guild = guild;
		this.players = players;
		this.blackCards = guild.client.blackCards;
		this.whiteCards = guild.client.whiteCards;
	}

	startGame = () => {
		this.players.forEach((p)=>p.hand=[]);
		for(let i = 0; i < 10; i++) {
			for(let player of this.players) {
				player.hand.push(<Card>(this.whiteCards.shift()));
			}
		}
	}

	advanceTurn = async () => {
		if(this.turn!=1) this.players.forEach((p)=>p.hand.push(<Card>(this.whiteCards.shift())))
		this.turn++;
		let whiteCards = [];
		await this.players.forEach(async (p) => {
			let hand:PageInputData = {data:[]};
			for(let i = 0; i < p.hand.length; i++) {
				hand.data.push([i.toString(), p.hand[i].des]);
			}
			const handPage = new Page(<Message>await p.send('', new MessageEmbed()), <GuildMember>this.guild.members.filter(m=>m.id==p.id).first(), hand);
			handPage.on('collect', (index: number, page: number) => {
				let collectedItem = hand.data[index + (8 * page)];
				p.send(`You have played ${collectedItem[1]}`);
				whiteCards.push(p.hand[parseInt(collectedItem[0])]);
				p.hand.splice(parseInt(collectedItem[0]), 1);
				handPage.stop();
			});
			await handPage.start();
		});
		
	}
}