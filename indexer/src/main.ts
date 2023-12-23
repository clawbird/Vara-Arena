import { ProgramMetadata } from '@gear-js/api';
import { assertNotNull } from '@subsquid/substrate-processor';
import { TypeormDatabase } from '@subsquid/typeorm-store'

import { processor, MINT_ADDRESS, ARENA_ADDRESS } from './processor'
import { Character, Lobby, LobbyCharacter } from './model'
import { events } from './types'

const mintMeta = ProgramMetadata.from('000200000001000000000108000000010b00000000000000010d00000005104400081c6d696e745f696f284d696e74416374696f6e0001143c4372656174654368617261637465720c011c636f64655f6964040118436f646549640001106e616d65100118537472696e670001286174747269627574657314014c4368617261637465724174747269627574657300000034436861726163746572496e666f0401206f776e65725f696418011c4163746f72496400010030426174746c65526573756c740401206f776e65725f696418011c4163746f724964000200205365744172656e610401206172656e615f696418011c4163746f7249640003001c4c6576656c5570040110617474721c013c41747472696275746543686f696365000400000410106773746418636f6d6d6f6e287072696d69746976657318436f64654964000004000801205b75383b2033325d000008000003200000000c000c000005030010000005020014081c6d696e745f696f4c436861726163746572417474726962757465730000140120737472656e6774680c0108753800011c6167696c6974790c01087538000120766974616c6974790c0108753800011c7374616d696e610c01087538000130696e74656c6c6967656e63650c0108753800001810106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d00001c081c6d696e745f696f3c41747472696275746543686f69636500011020537472656e6774680000001c4167696c69747900010020566974616c6974790002001c5374616d696e610003000020081c6d696e745f696f244d696e744576656e7400010c40436861726163746572437265617465640401386368617261637465725f696e666f240134436861726163746572496e666f0000002c5870496e637265617365640801306368617261637465725f696418011c4163746f724964000108787028010c753332000100304c6576656c557064617465640801306368617261637465725f696418011c4163746f724964000110617474721c013c41747472696275746543686f6963650002000024081c6d696e745f696f34436861726163746572496e666f0000140108696418011c4163746f7249640001106e616d65100118537472696e670001286174747269627574657314014c436861726163746572417474726962757465730001146c6576656c0c01087538000128657870657269656e636528010c75333200002800000505002c0000040830300030000004000034081c6d696e745f696f244d696e74537461746500000401286368617261637465727338018042547265654d61703c4163746f7249642c20436861726163746572496e666f3e000038042042547265654d617008044b0118045601240004003c0000003c00000240004000000408182400')
const arenaMeta = ProgramMetadata.from('00020001000000000001030000000105000000010d00000000000000010f0000008510500010106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000401205b75383b2033325d0000040000032000000008000800000503000c08206172656e615f696f2c4172656e61416374696f6e0001142c4372656174654c6f6262790000002052656769737465720801206c6f6262795f6964100110753132380001206f776e65725f696400011c4163746f72496400010010506c61790401206c6f6262795f69641001107531323800020028526573657276654761730401206c6f6262795f69641001107531323800030028436c65616e53746174650401206c6f6262795f696410011075313238000400001000000507001408206172656e615f696f284172656e614576656e74000110304c6f626279437265617465640401206c6f6262795f69641001107531323800000040506c61796572526567697374657265640801206c6f6262795f696410011075313238000124706c617965725f696400011c4163746f7249640001002c47617352657365727665640401206c6f6262795f696410011075313238000200384c6f626279426174746c654c6f670c01206c6f6262795f69641001107531323800012477696e6e65725f696400011c4163746f7249640001106c6f67731801385665633c426174746c654c6f673e00030000180000021c001c08206172656e615f696f24426174746c654c6f670000100108633100011c4163746f724964000108633200011c4163746f72496400012477696e6e65725f696400011c4163746f7249640001147475726e732001445665633c5665633c5475726e4c6f673e3e00002000000224002400000228002808206172656e615f696f1c5475726e4c6f67000008012463686172616374657200011c4163746f724964000118616374696f6e2c01245475726e4576656e7400002c08206172656e615f696f245475726e4576656e740001203c4e6f74456e6f756768456e65726779000000104d697373040120706f736974696f6e08010875380001001841747461636b080120706f736974696f6e080108753800011864616d6167650801087538000200104d6f7665040120706f736974696f6e08010875380003001052657374040118656e657267790801087538000400145061727279000500284775617264627265616b04011c73756363657373300110626f6f6c00060024436173745370656c6c0007000030000005000034000004083838003800000400003c08206172656e615f696f284172656e61537461746500000c01106d696e7400011c4163746f72496400012c6c6561646572626f61726440015842547265654d61703c4163746f7249642c207533323e00012c6c6f6262795f636f756e7410011075313238000040042042547265654d617008044b01000456014400040048000000440000050500480000024c004c00000408004400')

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
    let characters: Map<string, Character> = new Map()
    let lobbies = [];
    let lobbiesCharacter = [];

    for (let block of ctx.blocks) {
        for (let event of block.events) {
            if (events.gear.userMessageSent.v1000.is(event)) {
                let { message } = events.gear.userMessageSent.v1000.decode(event)
                if (message.source == MINT_ADDRESS) {
                    let data = mintMeta.createType(assertNotNull(mintMeta.types.handle.output), message.payload).toJSON() as any

                    if (data.characterCreated) {
                        let info = data.characterCreated.characterInfo
                        let character = new Character({
                            ...info,
                            owner: message.destination
                        })
                        characters.set(character.id, character)
                    } else if (data.xpIncreased) {
                        let character = characters.get(data.xpIncreased.characterId)
                        if (character == null) {
                            character = await ctx.store.findOneOrFail(Character, { where: { id: data.xpIncreased.characterId } })
                            characters.set(character.id, character)
                        }
                        character.experience = data.xpIncreased.xp
                    } else if (data.levelUpdated) {
                        if (!['strength', 'agility', 'vitality', 'stamina'].includes(data.levelUpdated.attr)) {
                            console.log(data.levelUpdated.attr)
                            throw new Error('unknown attr')
                        }

                        let character = characters.get(data.levelUpdated.characterId)
                        if (character == null) {
                            character = await ctx.store.findOneOrFail(Character, { where: { id: data.levelUpdated.characterId } })
                            characters.set(character.id, character)
                        }
                        let attributes = JSON.parse(character.attributes as any)
                        attributes[data.levelUpdated.attr] += 1
                        character.attributes = JSON.stringify(attributes)
                    } else {
                        console.log(data);
                        throw new Error('event is not supported')
                    }
                } else if (message.source == ARENA_ADDRESS) {
                    let data = arenaMeta.createType(assertNotNull(arenaMeta.types.handle.output), message.payload).toJSON() as any

                    if (data.lobbyCreated) {
                        let lobby = new Lobby({
                            id: data.lobbyCreated.lobbyId,
                            capacity: data.lobbyCreated.capacity,
                        })
                        lobbies.push(lobby)
                    } else if (data.playerRegistered) {
                        let lobbyCharacter = new LobbyCharacter({
                            id: event.id,
                            character: data.playerRegistered.playerId,
                            lobby: data.playerRegistered.lobbyId,
                        })
                        lobbiesCharacter.push(lobbyCharacter)
                    } else {
                        throw new Error('event is not supported')
                    }
                }
            }
        }
    }

    await ctx.store.upsert([...characters.values()])
    await ctx.store.upsert(lobbies)
    await ctx.store.upsert(lobbiesCharacter)
})
