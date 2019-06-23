import * as Discord from 'discord.js';
import { CFHClient } from './typings/types';
const config = require('../config.json')
const Client = new CFHClient();

Client.on('ready', () => {
	console.log('Shall we play a game?');
});

