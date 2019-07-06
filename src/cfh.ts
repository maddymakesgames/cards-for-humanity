import * as Discord from 'discord.js';
import { CFHClient } from './typings/types';
import { RedefineDefaults, initCommands, initEvents} from './modules/functions';
const config = require('../config.json')
const Client = new CFHClient();

RedefineDefaults();
initCommands(Client);
initEvents(Client);

Client.on('ready', () => {
	console.log('Shall we play a game?');
});


