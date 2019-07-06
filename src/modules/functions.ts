import { CFHClient, CFHEvent, CFHCommand } from "../typings/types";
import * as fs from 'fs';
import { Collection } from "discord.js";

export const initEvents = async (client:CFHClient) => {
	const jsFiles = fs.readdirSync('../events/');
	for(const file of jsFiles) {
		const event:CFHEvent = require(`../events/${file}`);
		client.on(event.name, event.run);
	}
}

export const initCommands = async (client:CFHClient) => {
	const jsFiles = fs.readdirSync('../commands');
	let commandList:[string,CFHCommand][] = [];
	let aliasList:[string,CFHCommand][] = [];
	for(const file of jsFiles) {
		const command:CFHCommand = require(`../commands/${file}`);
		commandList.push([command.name, command]);
		for(const alias in command.aliases) {
			aliasList.push([alias, command]);
		}
	}
	client.commands = new Collection(commandList);
	client.aliases = new Collection(aliasList);
}


export const RedefineDefaults = () => {
	Array.prototype.forEach = async function (fun: Function, thisp: any): Promise<void> {
		if (this === void 0 || this === null)
			throw new TypeError();
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function")
			throw new TypeError();
		for (var i = 0; i < len; i++) {
			if (i in t)
				await fun.call(thisp, t[i], i, t);
		}
	};
}

