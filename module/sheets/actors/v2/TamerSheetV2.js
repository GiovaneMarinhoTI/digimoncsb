/*
 * Digidices System - Tamer Sheet
 * Custom sheet for Tamer actors in the Digidices RPG system
 * This sheet is independent from the CSB template system
 */

/**
 * The Tamer actor sheet for Digidices
 * @extends {ActorSheetV2}
 */
//@ts-expect-error Types too deep
export class TamerSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ['custom-system', 'sheet', 'actor', 'actor-v2', 'digidices-tamer'],
        position: {
            width: 700,
            height: 800
        },
        window: {
            resizable: true
        },
        form: {
            submitOnChange: true
        },
        actions: {
            editImage: TamerSheetV2.onEditImage,
            rolarTeste: TamerSheetV2.onRolarTeste,
            adicionarRecurso: TamerSheetV2.onAdicionarRecurso,
            removerRecurso: TamerSheetV2.onRemoverRecurso,
            rolarRecurso: TamerSheetV2.onRolarRecurso,
            editarFormula: TamerSheetV2.onEditarFormula,
            adicionarItem: TamerSheetV2.onAdicionarItem,
            removerItem: TamerSheetV2.onRemoverItem,
            switchTab: TamerSheetV2.onSwitchTab
        }
    };

    static PARTS = {
        form: {
            template: `systems/custom-system-builder/templates/actor/v2/actor-tamer-sheet.hbs`,
            classes: ['custom-system-actor-content', 'digidices-tamer']
        }
    };

    // Current active tab
    _activeTab = 'pessoal';

    static async onEditImage(_event, target) {
        const field = target.dataset.field || 'img';
        const current = foundry.utils.getProperty(this.document, field);
        const fp = new foundry.applications.apps.FilePicker.implementation({
            type: 'image',
            current: current,
            callback: (path) => {
                void this.document.update({ [field]: path });
            }
        });
        await fp.render({ force: true });
    }

    static onSwitchTab(_event, target) {
        const tab = target.dataset.tab;
        this._activeTab = tab;
        this.render();
    }

    // Roll Test - Attribute + Skill
    static async onRolarTeste(_event, _target) {
        const actor = this.actor;
        const atributos = actor.system.atributos;
        const pericias = actor.system.pericias;

        // Create dialog for roll selection
        const atributosOptions = Object.entries(atributos)
            .map(([key, value]) => `<option value="${key}">${TamerSheetV2._getAtributoLabel(key)} (${value})</option>`)
            .join('');

        const periciasOptions = Object.entries(pericias)
            .map(([key, value]) => `<option value="${key}">${TamerSheetV2._getPericiaLabel(key)} (${value})</option>`)
            .join('');

        const dialogContent = `
            <form class="digidices-roll-dialog">
                <div class="form-group">
                    <label>Atributo:</label>
                    <select name="atributo">${atributosOptions}</select>
                </div>
                <div class="form-group">
                    <label>Pericia:</label>
                    <select name="pericia">${periciasOptions}</select>
                </div>
                <div class="form-group">
                    <label>Modificador:</label>
                    <input type="number" name="modificador" value="0" />
                </div>
            </form>
        `;

        new Dialog({
            title: 'Rolar Teste',
            content: dialogContent,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-dice"></i>',
                    label: 'Rolar',
                    callback: async (html) => {
                        const form = html[0].querySelector('form');
                        const atributo = form.querySelector('[name="atributo"]').value;
                        const pericia = form.querySelector('[name="pericia"]').value;
                        const modificador = parseInt(form.querySelector('[name="modificador"]').value) || 0;

                        const atributoValor = atributos[atributo];
                        const periciaValor = pericias[pericia];
                        const bonus = atributoValor + periciaValor + modificador;

                        const roll = new Roll(`1d20 + ${bonus}`);
                        await roll.evaluate();

                        const atributoLabel = TamerSheetV2._getAtributoLabel(atributo);
                        const periciaLabel = TamerSheetV2._getPericiaLabel(pericia);

                        await roll.toMessage({
                            speaker: ChatMessage.getSpeaker({ actor: actor }),
                            flavor: `<strong>${actor.name}</strong> - Teste de ${atributoLabel} + ${periciaLabel}${modificador !== 0 ? ` (${modificador >= 0 ? '+' : ''}${modificador})` : ''}`
                        });
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'roll'
        }).render(true);
    }

    // Add Resource
    static async onAdicionarRecurso(_event, _target) {
        const actor = this.actor;
        const atributos = actor.system.atributos;
        const pericias = actor.system.pericias;

        const atributosOptions = `<option value="">Nenhum</option>` + Object.entries(atributos)
            .map(([key, _value]) => `<option value="${key}">${TamerSheetV2._getAtributoLabel(key)}</option>`)
            .join('');

        const periciasOptions = `<option value="">Nenhuma</option>` + Object.entries(pericias)
            .map(([key, _value]) => `<option value="${key}">${TamerSheetV2._getPericiaLabel(key)}</option>`)
            .join('');

        const dialogContent = `
            <form class="digidices-resource-dialog">
                <div class="form-group">
                    <label>Nome do Recurso:</label>
                    <input type="text" name="nome" required />
                </div>
                <div class="form-group">
                    <label>Descricao:</label>
                    <textarea name="descricao"></textarea>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="temRolagem" />
                        Tem Rolagem?
                    </label>
                </div>
                <div class="roll-options" style="display: none;">
                    <div class="form-group">
                        <label>Dados (ex: 2d6):</label>
                        <input type="text" name="dadosRolagem" placeholder="1d6" />
                    </div>
                    <div class="form-group">
                        <label>Atributo:</label>
                        <select name="atributoRolagem">${atributosOptions}</select>
                    </div>
                    <div class="form-group">
                        <label>Pericia:</label>
                        <select name="periciaRolagem">${periciasOptions}</select>
                    </div>
                    <div class="form-group">
                        <label>Modificador:</label>
                        <input type="number" name="modificador" value="0" />
                    </div>
                </div>
            </form>
        `;

        new Dialog({
            title: 'Adicionar Recurso',
            content: dialogContent,
            buttons: {
                add: {
                    icon: '<i class="fas fa-plus"></i>',
                    label: 'Adicionar',
                    callback: async (html) => {
                        const form = html[0].querySelector('form');
                        const novoRecurso = {
                            id: foundry.utils.randomID(),
                            nome: form.querySelector('[name="nome"]').value,
                            descricao: form.querySelector('[name="descricao"]').value,
                            temRolagem: form.querySelector('[name="temRolagem"]').checked,
                            dadosRolagem: form.querySelector('[name="dadosRolagem"]').value,
                            atributoRolagem: form.querySelector('[name="atributoRolagem"]').value,
                            periciaRolagem: form.querySelector('[name="periciaRolagem"]').value,
                            modificador: parseInt(form.querySelector('[name="modificador"]').value) || 0
                        };

                        const recursos = actor.system.recursos || [];
                        await actor.update({ 'system.recursos': [...recursos, novoRecurso] });
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'add',
            render: (html) => {
                html[0].querySelector('[name="temRolagem"]').addEventListener('change', function() {
                    html[0].querySelector('.roll-options').style.display = this.checked ? 'block' : 'none';
                });
            }
        }).render(true);
    }

    // Remove Resource
    static async onRemoverRecurso(_event, target) {
        const resourceId = target.dataset.resourceId;
        const actor = this.actor;
        const recursos = actor.system.recursos.filter(r => r.id !== resourceId);
        await actor.update({ 'system.recursos': recursos });
    }

    // Roll Resource
    static async onRolarRecurso(_event, target) {
        const resourceId = target.dataset.resourceId;
        const actor = this.actor;
        const recurso = actor.system.recursos.find(r => r.id === resourceId);

        if (!recurso || !recurso.temRolagem) return;

        let formula = recurso.dadosRolagem || '1d6';
        let bonus = recurso.modificador || 0;

        if (recurso.atributoRolagem) {
            bonus += actor.system.atributos[recurso.atributoRolagem] || 0;
        }
        if (recurso.periciaRolagem) {
            bonus += actor.system.pericias[recurso.periciaRolagem] || 0;
        }

        if (bonus !== 0) {
            formula += ` + ${bonus}`;
        }

        const roll = new Roll(formula);
        await roll.evaluate();

        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: `<strong>${actor.name}</strong> - ${recurso.nome}`
        });
    }

    // Edit Formula (for PV, Defesa, Digi-Aura)
    static async onEditarFormula(_event, target) {
        const field = target.dataset.field;
        const actor = this.actor;
        const currentFormula = actor.system[field]?.formula || '';

        const dialogContent = `
            <form class="digidices-formula-dialog">
                <div class="form-group">
                    <label>Formula para ${TamerSheetV2._getFieldLabel(field)}:</label>
                    <input type="text" name="formula" value="${currentFormula}" />
                </div>
                <p class="hint">
                    Variaveis disponiveis: nivel, forca, agilidade, vigor, inteligencia, vontade, carisma
                </p>
            </form>
        `;

        new Dialog({
            title: `Editar Formula - ${TamerSheetV2._getFieldLabel(field)}`,
            content: dialogContent,
            buttons: {
                save: {
                    icon: '<i class="fas fa-save"></i>',
                    label: 'Salvar',
                    callback: async (html) => {
                        const form = html[0].querySelector('form');
                        const novaFormula = form.querySelector('[name="formula"]').value;
                        await actor.update({ [`system.${field}.formula`]: novaFormula });
                        
                        // Recalculate value
                        const novoValor = TamerSheetV2._calcularFormula(actor, novaFormula);
                        await actor.update({ [`system.${field}.maximo`]: novoValor });
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'save'
        }).render(true);
    }

    // Add Inventory Item
    static async onAdicionarItem(_event, _target) {
        const actor = this.actor;

        const dialogContent = `
            <form class="digidices-item-dialog">
                <div class="form-group">
                    <label>Nome do Item:</label>
                    <input type="text" name="nome" required />
                </div>
                <div class="form-group">
                    <label>Descricao:</label>
                    <textarea name="descricao"></textarea>
                </div>
                <div class="form-group">
                    <label>Quantidade:</label>
                    <input type="number" name="quantidade" value="1" min="1" />
                </div>
            </form>
        `;

        new Dialog({
            title: 'Adicionar Item',
            content: dialogContent,
            buttons: {
                add: {
                    icon: '<i class="fas fa-plus"></i>',
                    label: 'Adicionar',
                    callback: async (html) => {
                        const form = html[0].querySelector('form');
                        const novoItem = {
                            id: foundry.utils.randomID(),
                            nome: form.querySelector('[name="nome"]').value,
                            descricao: form.querySelector('[name="descricao"]').value,
                            quantidade: parseInt(form.querySelector('[name="quantidade"]').value) || 1,
                            peso: 0
                        };

                        const inventario = actor.system.inventario || [];
                        await actor.update({ 'system.inventario': [...inventario, novoItem] });
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancelar'
                }
            },
            default: 'add'
        }).render(true);
    }

    // Remove Inventory Item
    static async onRemoverItem(_event, target) {
        const itemId = target.dataset.itemId;
        const actor = this.actor;
        const inventario = actor.system.inventario.filter(i => i.id !== itemId);
        await actor.update({ 'system.inventario': inventario });
    }

    // Helper functions
    static _getAtributoLabel(key) {
        const labels = {
            forca: 'Forca',
            agilidade: 'Agilidade',
            vigor: 'Vigor',
            inteligencia: 'Inteligencia',
            vontade: 'Vontade',
            carisma: 'Carisma'
        };
        return labels[key] || key;
    }

    static _getPericiaLabel(key) {
        const labels = {
            atletismo: 'Atletismo',
            luta: 'Luta',
            acrobacia: 'Acrobacia',
            furtividade: 'Furtividade',
            pontaria: 'Pontaria',
            conducao: 'Conducao',
            reflexos: 'Reflexos',
            percepcao: 'Percepcao',
            investigacao: 'Investigacao',
            tecnologia: 'Tecnologia',
            medicina: 'Medicina',
            ciencias: 'Ciencias',
            tapiologia: 'Tapiologia',
            sobrevivencia: 'Sobrevivencia',
            empatia: 'Empatia',
            enganacao: 'Enganacao',
            intimidacao: 'Intimidacao',
            persuasao: 'Persuasao',
            performance: 'Performance',
            vontadePericia: 'Vontade',
            intuicao: 'Intuicao'
        };
        return labels[key] || key;
    }

    static _getFieldLabel(field) {
        const labels = {
            pv: 'Pontos de Vida',
            defesa: 'Defesa',
            digiAura: 'Digi-Aura'
        };
        return labels[field] || field;
    }

    static _calcularFormula(actor, formula) {
        try {
            const vars = {
                nivel: actor.system.nivel || 1,
                forca: actor.system.atributos?.forca || 1,
                agilidade: actor.system.atributos?.agilidade || 1,
                vigor: actor.system.atributos?.vigor || 1,
                inteligencia: actor.system.atributos?.inteligencia || 1,
                vontade: actor.system.atributos?.vontade || 1,
                carisma: actor.system.atributos?.carisma || 1
            };

            let processedFormula = formula;
            for (const [key, value] of Object.entries(vars)) {
                processedFormula = processedFormula.replace(new RegExp(key, 'g'), value);
            }

            return Math.floor(eval(processedFormula));
        } catch (e) {
            console.error('Error calculating formula:', e);
            return 0;
        }
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        
        const system = this.actor.system;
        
        // Basic data
        context.system = system;
        context.activeTab = this._activeTab;
        
        // Computed arrays for easier template iteration
        context.atributosArray = [
            { key: 'forca', abbr: 'FOR', label: 'Forca', value: system.atributos?.forca || 1 },
            { key: 'agilidade', abbr: 'AGI', label: 'Agilidade', value: system.atributos?.agilidade || 1 },
            { key: 'vigor', abbr: 'VIG', label: 'Vigor', value: system.atributos?.vigor || 1 },
            { key: 'inteligencia', abbr: 'INT', label: 'Inteligencia', value: system.atributos?.inteligencia || 1 },
            { key: 'vontade', abbr: 'VON', label: 'Vontade', value: system.atributos?.vontade || 1 },
            { key: 'carisma', abbr: 'CAR', label: 'Carisma', value: system.atributos?.carisma || 1 }
        ];

        context.periciasFisicas = [
            { key: 'atletismo', label: 'Atletismo', value: system.pericias?.atletismo || 0 },
            { key: 'luta', label: 'Luta', value: system.pericias?.luta || 0 },
            { key: 'acrobacia', label: 'Acrobacia', value: system.pericias?.acrobacia || 0 },
            { key: 'furtividade', label: 'Furtividade', value: system.pericias?.furtividade || 0 },
            { key: 'pontaria', label: 'Pontaria', value: system.pericias?.pontaria || 0 },
            { key: 'conducao', label: 'Conducao', value: system.pericias?.conducao || 0 },
            { key: 'reflexos', label: 'Reflexos', value: system.pericias?.reflexos || 0 }
        ];

        context.periciasMentais = [
            { key: 'percepcao', label: 'Percepcao', value: system.pericias?.percepcao || 0 },
            { key: 'investigacao', label: 'Investigacao', value: system.pericias?.investigacao || 0 },
            { key: 'tecnologia', label: 'Tecnologia', value: system.pericias?.tecnologia || 0 },
            { key: 'medicina', label: 'Medicina', value: system.pericias?.medicina || 0 },
            { key: 'ciencias', label: 'Ciencias', value: system.pericias?.ciencias || 0 },
            { key: 'tapiologia', label: 'Tapiologia', value: system.pericias?.tapiologia || 0 },
            { key: 'sobrevivencia', label: 'Sobrevivencia', value: system.pericias?.sobrevivencia || 0 }
        ];

        context.periciasSociais = [
            { key: 'empatia', label: 'Empatia', value: system.pericias?.empatia || 0 },
            { key: 'enganacao', label: 'Enganacao', value: system.pericias?.enganacao || 0 },
            { key: 'intimidacao', label: 'Intimidacao', value: system.pericias?.intimidacao || 0 },
            { key: 'persuasao', label: 'Persuasao', value: system.pericias?.persuasao || 0 },
            { key: 'performance', label: 'Performance', value: system.pericias?.performance || 0 },
            { key: 'vontadePericia', label: 'Vontade', value: system.pericias?.vontadePericia || 0 },
            { key: 'intuicao', label: 'Intuicao', value: system.pericias?.intuicao || 0 }
        ];

        context.recursos = system.recursos || [];
        context.inventario = system.inventario || [];

        // Calculate bar percentages
        const pvMax = system.pv?.maximo || 1;
        const pvVal = system.pv?.valor || 0;
        context.pvPercent = Math.min(100, Math.max(0, (pvVal / pvMax) * 100));

        const auraMax = system.digiAura?.maximo || 1;
        const auraVal = system.digiAura?.valor || 0;
        context.auraPercent = Math.min(100, Math.max(0, (auraVal / auraMax) * 100));

        return context;
    }
}
