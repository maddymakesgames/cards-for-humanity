import { Message, MessageEmbed, User, GuildMember, ReactionCollector, MessageReaction, ClientUser } from "discord.js";
import { EventEmitter } from "events";

export type PageOptions = {
    itemsPerPage?:number;
    title?:string;
    textOnly?:boolean;
    hasOptions?:boolean;
}

export type PageInputData = {
	data:string[][]
}

export class Page extends EventEmitter{
	public ePerPage:number;
	public numOfPages:number;
	public pages:string[][][];
	public currentPage:number;
	public title:string | null;
	public textOnly:boolean;
	public message:Message;
	public embed:MessageEmbed;
	public member:GuildMember;
	public author:User;
	public hasOptions:boolean | undefined;
	public callback:Function;
	public listener:ReactionCollector;

	/**
	 * Creates a pagified embed
	 * @param {Message} message The message to put the embed in.
	 * @param {User} member The person who run the command.
	 * @param {Object} data The data to be displayed in the embed.
	 * @param {Object} options The options for the page. Consists of the items per page, the title and whether or not to make the data into options you can select.
	 * @param {function} callback The callback to call when the user selects an option
	 * @param {MessageEmbed} embed The base embed to add the data to.
	 */
	constructor(message:Message, member:GuildMember, data?:PageInputData, options:PageOptions = { 'itemsPerPage' : 8, 'title': '','hasOptions':false,'textOnly':false},callback = function(option:number, currentPage:number) { return null; }, embed = new MessageEmbed(),) {
		super();
		this.ePerPage = options.itemsPerPage || 8;
		this.numOfPages = data ? Math.ceil(data.data.length / this.ePerPage) : 0;
		this.pages = [];
		this.currentPage = 0;
		this.title = options.title || null;
		this.textOnly = options.textOnly || false;
		this.message = message;
		this.embed = embed;
		this.member = member;
		this.author = member.user;
		this.hasOptions = options.hasOptions;
		data ? this.readData(data) : 1;
		this.callback = callback;
		this.listener = new ReactionCollector(message, ()=>true);
	}

	/**
	 * Reads the data provided into pages.
	 * @param {Object} data The data to put into the pages.
	 */
	readData(data:PageInputData) {
		this.pages = [];
		for (let e = 0; e < this.numOfPages; e++) {
			this.pages[e] = [];
			for (let p = 0; p < this.ePerPage; p++) {
				this.pages[e][p] = [data.data[p + (e * this.ePerPage)][0], data.data[p + (e * this.ePerPage)][1]];
			}
		}
	}

	/**
	 * Sets the data for the page. Data must be correctly formated. Format should be [[['page one data', data][key, data]], [['page 2 data', data], ['key', data]]]
	 * @param {string[][][]} data the data to give the page.
	 */
	async setData(data:string[][][]) {
		this.pages = data;
		this.numOfPages = data.length;
	}
	
	/**
	 * 
	 * @param {MessageEmbed} embed 
	 * @param {?string} title 
	 */
	createEmbed(embed:MessageEmbed, title:String | null) {
		if(title == null) {embed.setTitle(`Page ${this.currentPage + 1}:`);}
		else {
			title = title.replace(/{{currentPage}}/g, (this.currentPage + 1).toString());
			embed.setTitle(title);
		}
		for (const prop in this.pages[this.currentPage]) {
			if(this.pages[this.currentPage][prop][0] != undefined) embed.addField(this.pages[this.currentPage][prop][0], `\`${this.pages[this.currentPage][prop][1]}\``);
		}
		return embed;
	}

	createText(title:String | null) {
		if(title == null) title = `Page ${this.currentPage + 1}\n`;
		else {
			title = title.replace(/{{currentPage}}/g, (this.currentPage + 1).toString()) + '\n';
		}
		let output = title;
		for(const prop in this.pages[this.currentPage]) {
			if(this.pages[this.currentPage][prop][0] != undefined) output += `\`${this.pages[this.currentPage][prop][0]}\`\n${this.pages[this.currentPage][prop][1]}\n`;
		}
		return output;
	}

	async updatePage(direction:string) {
		if(direction != 'start') {
			this.currentPage = (direction.toLowerCase() == 'forward' || direction.toLowerCase() == 'next') ? this.currentPage + 1 : this.currentPage - 1;
		}
		// Create a blank embed, set its color, and then run createEmbed with the title set to either null or the custom title.
		if(!this.textOnly) {
			let embed = new MessageEmbed()
				.setColor(this.embed.color || '#ffad22')
				.setFooter(`${this.member.displayName}#${this.author.discriminator}`)
				.setTimestamp(this.embed.timestamp || new Date());
			embed = this.createEmbed(embed, this.title || null);
			this.message = await this.message.edit(embed);
		}
		else {
			const text = this.createText(this.title || null);
			this.message = await this.message.edit(text);
		}
	}

	async start() {
		// Setup the reaction listener.
		if(this.hasOptions) return await this.startOptions();
		const filter = (reaction:MessageReaction, user:User) => (reaction.emoji.name == '⬅' || reaction.emoji.name == '➡') && user.id == this.author.id;
		const pageCollector = this.message.createReactionCollector(filter, { time:15000, dispose:true });
		// Tell the reaction collector what to do when it detects a reaction.
		pageCollector.on('collect', async (reaction, user) => {
			// Remove the user's reaction
			this.message.reactions.each((react) => react.users.remove(user));
			// See if we need to remove some of out emotes
			if (this.currentPage <= 0) (<MessageReaction>(this.message.reactions.filter((react)=>react.emoji.name=='⬅').first())).users.remove((<ClientUser>(this.message.channel.client.user)));
			if (this.currentPage >= this.numOfPages - 1) this.message.reactions.filter((react)=>react.emoji.name=='➡');
			// See if we need to add any emotes
			if (reaction.emoji.name == '➡' && this.currentPage < this.numOfPages - 1) {
				await this.updatePage('next');
				if(this.message.reactions.find((react)=>react.emoji.name=='⬅' && this.currentPage > 0)) this.message.react('⬅')
			}
			if (reaction.emoji.name == '⬅' && this.currentPage > 0) {
				await this.updatePage('back');
				if(this.message.reactions.find((react)=>react.emoji.name=='➡') && this.currentPage < this.numOfPages-1) this.message.react('➡');
			}
		});
		// Tell the reaction collector to remove all reactions when it stops collecting them.
		pageCollector.on('end', async () => {
			await this.message.reactions.removeAll();
		});

		// Change the embed
		await this.updatePage('start');
		if (this.currentPage < this.numOfPages - 1) this.message.react('➡');
		if (this.currentPage > 0) this.message.react('⬅');
	}

	async startOptions(returnListener = false):Promise<ReactionCollector | void> {
		let actions = ['🔟', '9⃣', '8⃣', '7⃣', '6⃣', '5⃣', '4⃣', '3⃣', '2⃣', '1⃣', '⬅','➡',];
		let saveSpace = 0;
		if(this.numOfPages < 2) saveSpace = 2;
		let curractions = actions.reverse().splice(saveSpace, this.pages[this.currentPage].length);
		this.listener = this.message.createReactionCollector((reaction, user) => user.id == this.author.id);
		for(let i = 0; i < curractions.length; i++) {
			this.message.react(curractions[i]);
		}
		// if (returnListener) return this.listener;
		// else if (!this.callback) throw new Error('For a page to have options you have to either return the listener or provided a callback in the constructor.');
		// else if (typeof this.callback != 'function') throw new Error('The callback for the page options has to be a function');
		// else {
			this.listener.on('collect', async (reaction, user) => {
				actions = ['🔟', '9⃣', '8⃣', '7⃣', '6⃣', '5⃣', '4⃣', '3⃣', '2⃣', '1⃣'];
				// Remove the user's reaction
				this.message.reactions.each((react) => react.users.remove(user));
				// See if we need to remove some of out emotes
				if (this.currentPage <= 0) (<MessageReaction>(this.message.reactions.filter((react)=>react.emoji.name=='⬅').first())).users.remove((<ClientUser>(this.message.channel.client.user)));
				if (this.currentPage >= this.numOfPages - 1) this.message.reactions.filter((react)=>react.emoji.name=='➡');
				// See if we need to add any emotes
				if (reaction.emoji.name == '➡' && this.currentPage < this.numOfPages - 1) {
				await this.updatePage('next');
				if(this.message.reactions.find((react)=>react.emoji.name=='⬅' && this.currentPage > 0)) this.message.react('⬅')
				}
				if (reaction.emoji.name == '⬅' && this.currentPage > 0) {
				await this.updatePage('back');
				if(this.message.reactions.find((react)=>react.emoji.name=='➡') && this.currentPage < this.numOfPages-1) this.message.react('➡');
				}
				let actionSplit = actions.reverse().splice(2, this.pages[this.currentPage].length+1);
				this.message.reactions.filter((react) => !actions.includes(react.emoji.name)).each((react) => react.users.remove((<ClientUser>(this.message.channel.client.user))));
				let index = actionSplit.indexOf(reaction.emoji.name);
				this.emit('collect', index, this.currentPage);
			});
			this.listener.on('end', async () => {
				await this.message.reactions.removeAll();
				this.emit('end');
			});

			await this.updatePage('start');
		}
	// }

	stop() {
		delete this.listener;
		delete this.pages;
		delete this.author;
		delete this.callback;
		delete this.currentPage;
		delete this.ePerPage;
		delete this.embed;
		delete this.hasOptions;
		delete this.member;
		delete this.message;
		delete this.numOfPages;
	}
}