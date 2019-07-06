import {CFHCommand, CFHClient} from '../typings/types'
import { Message, ReactionCollectorOptions, MessageReaction, User } from 'discord.js';

export class StartCommand implements CFHCommand {
    async run(Client: CFHClient, message: Message, args: string[]): Promise<void> {
        const msg = <Message> await message.channel.send();
        const filter = (reaction: MessageReaction, user:User) => reaction.emoji.name == '👍' && !user.bot 
        const collector = msg.createReactionCollector(filter, <ReactionCollectorOptions>{'time':30000});
        collector.on('collect', (reaction, user) => {})
    }   
    aliases: string[] = ['s', 'newgame'];
    name: string = 'start';

    
} 