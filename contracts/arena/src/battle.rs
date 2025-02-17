use crate::execute::execute_action;
use arena_io::{AttackKind, BattleAction, BattleLog, Character, CharacterState, Spell, YourTurn};
use gstd::errors::Error;
use gstd::{debug, msg, prelude::*};

const FIRST_POS: u8 = 6;
const SECOND_POS: u8 = 10;

const INITIATIVE_MODIFIER: u16 = 125;

pub struct Battle {
    pub c1: Character,
    pub c2: Character,
}

impl Battle {
    pub fn new(mut c1: Character, mut c2: Character) -> Battle {
        c1.position = FIRST_POS;
        c2.position = SECOND_POS;
        Battle { c1, c2 }
    }

    pub async fn fight(mut self) -> BattleLog {
        let mut turns = vec![];

        loop {
            if turns.len() > 25 {
                debug!("New GAMEPLAY!");
                debug!("p1 = {} hp x p2 = {} hp!", self.c1.hp, self.c2.hp);
                return BattleLog {
                    character1: (self.c1.id, self.c1.hp > self.c2.hp),
                    character2: (self.c2.id, self.c2.hp > self.c1.hp),
                    turns,
                };
            };

            turns.push(vec![]);
            let index = turns.len() - 1;
            let turn_logs = &mut turns[index];

            let p1_state = CharacterState {
                hp: self.c1.hp,
                position: self.c1.position,
                energy: self.c1.energy,
                rest_count: self.c1.rest_count,
                disable_agiim: self.c1.disable_agiim,
                chilling_touch: self.c1.chilling_touch,
                earth_skin: self.c1.earth_skin,
                earth_smites: self.c1.earth_smites,
                fire_haste: self.c1.fire_haste,
                fire_wall: self.c1.fire_wall,
                water_burst: self.c1.water_burst,
            };
            let p2_state = CharacterState {
                hp: self.c2.hp,
                position: self.c2.position,
                energy: self.c2.energy,
                rest_count: self.c2.rest_count,
                disable_agiim: self.c2.disable_agiim,
                chilling_touch: self.c2.chilling_touch,
                earth_skin: self.c2.earth_skin,
                earth_smites: self.c2.earth_smites,
                fire_haste: self.c2.fire_haste,
                fire_wall: self.c2.fire_wall,
                water_burst: self.c2.water_burst,
            };

            let p1_turn = YourTurn {
                you: p1_state.clone(),
                enemy: p2_state.clone(),
            };
            let p1_action: BattleAction =
                match msg::send_for_reply_as(self.c1.algorithm_id, p1_turn, 0, 0)
                    .expect("unable to send message")
                    .await
                {
                    Ok(action) => action,
                    Err(err) => match err {
                        Error::Timeout(_, _) => {
                            return BattleLog {
                                character1: (self.c1.id, false),
                                character2: (self.c2.id, true),
                                turns,
                            }
                        }
                        _ => panic!("unable to receive `BattleAction`: {err:?}"),
                    },
                };

            let p2_turn = YourTurn {
                you: p2_state,
                enemy: p1_state,
            };
            let p2_action: BattleAction =
                match msg::send_for_reply_as(self.c2.algorithm_id, p2_turn, 0, 0)
                    .expect("unable to send message")
                    .await
                {
                    Ok(action) => action,
                    Err(err) => match err {
                        Error::Timeout(_, _) => {
                            return BattleLog {
                                character1: (self.c1.id, true),
                                character2: (self.c2.id, false),
                                turns,
                            }
                        }
                        _ => panic!("unable to receive `BattleAction`: {err:?}"),
                    },
                };

            let p1_initiative = player_initiative(&self.c1, &self.c2, &p1_action);
            let p2_initiative = player_initiative(&self.c2, &self.c1, &p2_action);

            self.c1.disable_agiim = false;
            self.c2.disable_agiim = false;

            if p1_initiative > p2_initiative {
                self.c1.parry = matches!(&p1_action, BattleAction::Parry);
                self.c2.parry = false;

                execute_action(&p1_action, &mut self.c1, &mut self.c2, turn_logs);
                if let Some((character1, character2)) = self.check_winner() {
                    return BattleLog {
                        character1,
                        character2,
                        turns,
                    };
                }

                execute_action(&p2_action, &mut self.c2, &mut self.c1, turn_logs);
                if let Some((character1, character2)) = self.check_winner() {
                    return BattleLog {
                        character1,
                        character2,
                        turns,
                    };
                }
            } else {
                self.c1.parry = false;
                self.c2.parry = matches!(&p2_action, BattleAction::Parry);

                execute_action(&p2_action, &mut self.c2, &mut self.c1, turn_logs);
                if let Some((character1, character2)) = self.check_winner() {
                    return BattleLog {
                        character1,
                        character2,
                        turns,
                    };
                }

                execute_action(&p1_action, &mut self.c1, &mut self.c2, turn_logs);
                if let Some((character1, character2)) = self.check_winner() {
                    return BattleLog {
                        character1,
                        character2,
                        turns,
                    };
                }
            }

            update_effects(&mut self.c1);
            update_effects(&mut self.c2);
        }
    }

    fn check_winner(&self) -> Option<((u128, bool), (u128, bool))> {
        if self.c1.hp == 0 {
            Some(((self.c1.id, false), (self.c2.id, true)))
        } else if self.c2.hp == 0 {
            Some(((self.c1.id, true), (self.c2.id, false)))
        } else {
            None
        }
    }
}

fn spell_initiative(spell: &Spell) -> u16 {
    match spell {
        Spell::FireWall | Spell::EarthSkin | Spell::WaterRestoration => 10,
        Spell::Fireball | Spell::EarthCatapult | Spell::WaterBurst => 16,
        Spell::FireHaste | Spell::EarthSmites | Spell::ChillingTouch => 20,
    }
}

fn action_initiative(action: &BattleAction) -> u16 {
    match action {
        BattleAction::Attack { kind } => match kind {
            AttackKind::Quick => 10,
            AttackKind::Precise => 15,
            AttackKind::Heavy => 20,
        },
        BattleAction::MoveLeft | BattleAction::MoveRight | BattleAction::Rest => 8,
        BattleAction::Parry => 12,
        BattleAction::Guardbreak => 18,
        BattleAction::CastSpell { spell } => spell_initiative(spell),
    }
}

fn player_initiative(player: &Character, enemy: &Character, action: &BattleAction) -> u16 {
    let base_initiative = action_initiative(action) * 100;
    let mut modifier = INITIATIVE_MODIFIER;

    if player.fire_haste > 0 {
        modifier += INITIATIVE_MODIFIER / 9 * u16::from(player.attributes.intelligence);
    }

    if player.chilling_touch > 0 {
        modifier -= INITIATIVE_MODIFIER / 9 * u16::from(enemy.attributes.intelligence);
    }

    if player.disable_agiim {
        base_initiative
    } else {
        base_initiative - (u16::from(player.attributes.agility) * modifier)
    }
}

fn update_effects(player: &mut Character) {
    if player.fire_wall.0 != 0 {
        player.fire_wall.0 -= 1;
    }

    if player.earth_skin.0 != 0 {
        player.earth_skin.0 -= 1;
    }

    if player.chilling_touch != 0 {
        player.chilling_touch -= 1;
    }

    if player.water_burst != 0 {
        player.water_burst -= 1;
    }

    if player.fire_haste != 0 {
        player.fire_haste -= 1;
    }

    if player.earth_smites.0 != 0 {
        player.earth_smites.0 -= 1;
    }
}
