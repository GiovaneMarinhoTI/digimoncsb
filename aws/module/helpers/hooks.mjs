import PokemonImporter from "../applications/apps/pokemon-importer.mjs";
import MoveImporter from "../applications/apps/move-importer.mjs";
import utils from "./utils.mjs";
import CompendiumBrowser from "../applications/apps/compendium-browser.mjs";
import { PTA } from "./config.mjs";

async function getRandomTrainerSprite() {
    const module = game.modules.get("pokemon-assets");
    if (!module?.active) return null;
    const api = module.api;
    if (!api?.PokemonSheets) return null;

    const allKeys = Array.from(api.PokemonSheets.allSheetKeys?.() ?? []);
    const trainerKeys = allKeys.filter((k) => k.startsWith("modules/pokemon-assets/img/trainers-overworld/"));
    if (!trainerKeys.length) return null;

    const tokenSrc = trainerKeys[Math.floor(Math.random() * trainerKeys.length)];
    const tokenSettings = api.PokemonSheets.getTokenChangesForSpritesheet(tokenSrc);
    if (!tokenSettings) return null;

    let profileSrc = tokenSrc.replace("modules/pokemon-assets/img/trainers-overworld/", "modules/pokemon-assets/img/trainers-profile/");
    try {
        const response = await fetch(profileSrc, { method: 'HEAD' });
        if (!response.ok) profileSrc = tokenSrc;
    } catch {
        profileSrc = tokenSrc;
    }

    return {
        img: profileSrc,
        prototypeToken: tokenSettings,
    };
}

async function assignRandomTrainerActor(actor) {
    if (!actor || actor.type !== 'npc') return;
    const randomSprite = await getRandomTrainerSprite();
    if (!randomSprite) return;

    const image = actor.img || null;
    const defaultIcon = "icons/svg/mystery-man.svg";
    if (image && image !== defaultIcon) return;

    await actor.update({
        img: randomSprite.img,
        prototypeToken: randomSprite.prototypeToken,
    });
}

/**
 * @callback HooksOn
 * @param {String} hook - the event to be called on
 * @param {Function} fn - the function to be triggered
 * @param {Object} options - options to customize the registered hook
 * @returns {Number} Id number of the registered hook
 */

/**
 * @callback HookOnce
 * @param {String} hook - the hook to be called on
 * @param {Function} fn - the function to be triggered
 */

/**
 * @callback HookOff
 * @param {String} hook - the event to unregister from
 * @param {Function|Number} fn - the function, or it's id number, to be disabled
 */

/**
 * @typedef {Object} Hooks
 * @prop {HooksOn} on - register a hook to be called
 * @prop {HookOnce} once - register a single use hook
 * @prop {HookOff} off - delist a hook from active duty
 */

export default function registerHooks() {
    const move_importer = new MoveImporter();
    Hooks.on('renderItemDirectory', async (directory, element, data) => {
        /**@type {Element} */
        let ele = element.querySelector('.directory-footer.action-buttons');

        let button = document.createElement('BUTTON');
        button.innerHTML = utils.localize(`PTA.Button.ImportMove`);
        ele.appendChild(button);

        button.addEventListener('click', async () => {
            move_importer.render(true);
        })
    })

    const pokemon_importer = new PokemonImporter();
    const compendium_browser = new CompendiumBrowser();
    Hooks.on('renderActorDirectory', async (directory, element, data) => {

        //==============================================================================
        //> Render API import wizard
        //==============================================================================
        try {
            /**@type {Element} */
            let ele = element.querySelector('.directory-footer.action-buttons');

            const importButton = document.createElement('BUTTON');
            importButton.innerHTML = utils.localize(`PTA.Button.ImportPokemon`);
            ele.appendChild(importButton);

            importButton.addEventListener('click', async () => {
                pokemon_importer.render(true);
            })

            const npcButton = document.createElement('BUTTON');
            npcButton.innerHTML = utils.localize(`PTA.Button.GenerateNpcSprite`);
            ele.appendChild(npcButton);

            npcButton.addEventListener('click', async () => {
                try {
                    const randomSprite = await getRandomTrainerSprite();
                    if (!randomSprite) return ui.notifications.warn(game.i18n.localize("PTA.Error.NoTrainerSprites") || "No trainer sprites were found in Pokemon Assets.");

                    const tokenName = randomSprite.img?.split('/').pop()?.replace(/\.[^.]+$/, '') || "Random NPC";
                    await Actor.create({
                        name: `NPC ${utils.toTitleCase(tokenName.replace(/[-_]/g, ' '))}`,
                        type: 'npc',
                        img: randomSprite.img,
                        prototypeToken: randomSprite.prototypeToken,
                    });
                } catch (err) {
                    console.error('PTA3: Failed to create random NPC actor', err);
                    ui.notifications.error(game.i18n.localize("PTA.Error.RandomNpcCreateFailed") || "Failed to create a random NPC actor.");
                }
            })
        } catch (err) {
            console.error('Failed to append PokéApi footer in actor directory', err);
        }

        // CURRENTLY DISABLED DUE TO ERRORS
        //==============================================================================
        //> Render comepndium browser button
        //==============================================================================
        /*
        try {
            const cp_browser = document.createElement('BUTTON');
            cp_browser.innerHTML = utils.localize('PTA.Button.CompendiumBrowser');
            let header = element.querySelector('header.directory-header');
            let search = header.querySelector('search');
            header.insertBefore(cp_browser, search);

            cp_browser.addEventListener('click', async () => {
                compendium_browser.render(true);
            })
        } catch (err) {
            console.error('Failed to append compendium browser header in actor directory', err);
        }
        */
    });

    Hooks.on('createActor', async (actor, options, userId) => {
        try {
            if (!game.modules.get("pokemon-assets")?.active) return;
            await assignRandomTrainerActor(actor);
        } catch (err) {
            console.error('PTA3: Failed to assign random trainer sprite to new actor', err);
        }
    });

    //==========================================================================================================
    //> Developer links
    //==========================================================================================================
    Hooks.on('renderSettings', async (settings, html, context, options) => {
        try {
            const section = document.createElement('section');
            section.classList.add('flexcol');

            // create the divider header
            const divider = document.createElement('h4');
            divider.classList.add('divider');
            divider.textContent = 'System Developers';

            // System github
            const git = document.createElement('a');
            git.href = 'https://github.com/dragonkie/PTA3-FVTT';
            git.classList.add('button');
            git.innerHTML = `<i class="fa-brands fa-github"></i> Github`;

            // Developers patreon
            const patreon = document.createElement('a');
            patreon.href = 'https://www.patreon.com/cw/AstasArmoury';
            patreon.classList.add('button');
            patreon.innerHTML = `<i class="fa-brands fa-patreon"></i> Patreon`;

            // Ko-fi link
            const kofi = document.createElement('a');
            kofi.href = 'https://ko-fi.com/dragonkie';
            kofi.classList.add('button');
            kofi.innerHTML = `<i class="fas fa-coffee"></i> Ko-Fi`;

            // add everything together
            section.appendChild(divider);
            section.appendChild(git);
            section.appendChild(kofi);
            section.appendChild(patreon);

            // append it to the settings tab
            html.appendChild(section);
        } catch (err) {
            console.error('Failed to append developer support links');
        }
    })

}