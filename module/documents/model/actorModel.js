/*
 * Author: Jean-Baptiste Louvet-Daniel
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { BodyModel, DisplayModel, HeaderModel, HiddenPropsModel, ModifiersModel } from './baseModels.js';
const { NumberField, StringField, BooleanField, ArrayField, ObjectField, SchemaField, TypedObjectField } = foundry.data.fields;
class AbstractActorDataModel extends foundry.abstract.TypeDataModel {
}
const defineTemplateActorDataModelSchema = () => ({
    body: BodyModel(),
    display: DisplayModel(),
    header: HeaderModel(),
    hidden: HiddenPropsModel(),
    templateSystemUniqueVersion: new NumberField({ required: false }),
    attributeBar: new TypedObjectField(new SchemaField({
        max: new StringField({ required: true }),
        value: new StringField({ required: true }),
        editable: new BooleanField({ required: true })
    }), {
        required: true
    }),
    statusEffects: new TypedObjectField(ModifiersModel(), {
        required: true
    })
});
export class TemplateActorDataModel extends AbstractActorDataModel {
    static defineSchema() {
        return defineTemplateActorDataModelSchema();
    }
}
const defineCharacterActorDataModelSchema = () => ({
    ...defineTemplateActorDataModelSchema(),
    template: new StringField({ required: false }),
    props: new ObjectField({
        required: true
    }),
    activeConditionalModifierGroups: new ArrayField(new StringField({ required: true }))
});
export class CharacterActorDataModel extends AbstractActorDataModel {
    static defineSchema() {
        return defineCharacterActorDataModelSchema();
    }
}

// Tamer Data Model for Digidices System
const defineTamerActorDataModelSchema = () => ({
    // Personal Info
    nome: new StringField({ required: false, initial: '' }),
    idade: new NumberField({ required: false, initial: 0 }),
    nivel: new NumberField({ required: false, initial: 1 }),
    brasao: new StringField({ required: false, initial: '' }),
    popularidade: new NumberField({ required: false, initial: 0 }),
    estudo: new NumberField({ required: false, initial: 0 }),
    
    // Attributes
    atributos: new SchemaField({
        forca: new NumberField({ required: true, initial: 1 }),
        agilidade: new NumberField({ required: true, initial: 1 }),
        vigor: new NumberField({ required: true, initial: 1 }),
        inteligencia: new NumberField({ required: true, initial: 1 }),
        vontade: new NumberField({ required: true, initial: 1 }),
        carisma: new NumberField({ required: true, initial: 1 })
    }),
    
    // Skills
    pericias: new SchemaField({
        // Physical
        atletismo: new NumberField({ required: false, initial: 0 }),
        luta: new NumberField({ required: false, initial: 0 }),
        acrobacia: new NumberField({ required: false, initial: 0 }),
        furtividade: new NumberField({ required: false, initial: 0 }),
        pontaria: new NumberField({ required: false, initial: 0 }),
        conducao: new NumberField({ required: false, initial: 0 }),
        reflexos: new NumberField({ required: false, initial: 0 }),
        // Mental
        percepcao: new NumberField({ required: false, initial: 0 }),
        investigacao: new NumberField({ required: false, initial: 0 }),
        tecnologia: new NumberField({ required: false, initial: 0 }),
        medicina: new NumberField({ required: false, initial: 0 }),
        ciencias: new NumberField({ required: false, initial: 0 }),
        tapiologia: new NumberField({ required: false, initial: 0 }),
        sobrevivencia: new NumberField({ required: false, initial: 0 }),
        // Social
        empatia: new NumberField({ required: false, initial: 0 }),
        enganacao: new NumberField({ required: false, initial: 0 }),
        intimidacao: new NumberField({ required: false, initial: 0 }),
        persuasao: new NumberField({ required: false, initial: 0 }),
        performance: new NumberField({ required: false, initial: 0 }),
        vontadePericia: new NumberField({ required: false, initial: 0 }),
        intuicao: new NumberField({ required: false, initial: 0 })
    }),
    
    // Combat Stats
    pv: new SchemaField({
        valor: new NumberField({ required: true, initial: 10 }),
        maximo: new NumberField({ required: true, initial: 10 }),
        formula: new StringField({ required: false, initial: '5 + (vigor * 3) + (nivel * 2)' })
    }),
    
    digiAura: new SchemaField({
        valor: new NumberField({ required: true, initial: 5 }),
        maximo: new NumberField({ required: true, initial: 5 }),
        formula: new StringField({ required: false, initial: '(vontade * 2) + nivel' })
    }),
    
    defesa: new SchemaField({
        valor: new NumberField({ required: true, initial: 10 }),
        formula: new StringField({ required: false, initial: '10 + agilidade' })
    }),
    
    // Resources (array for dynamic resources)
    recursos: new ArrayField(new SchemaField({
        id: new StringField({ required: true }),
        nome: new StringField({ required: true }),
        descricao: new StringField({ required: false, initial: '' }),
        temRolagem: new BooleanField({ required: false, initial: false }),
        dadosRolagem: new StringField({ required: false, initial: '' }),
        atributoRolagem: new StringField({ required: false, initial: '' }),
        periciaRolagem: new StringField({ required: false, initial: '' }),
        modificador: new NumberField({ required: false, initial: 0 })
    })),
    
    // Inventory
    inventario: new ArrayField(new SchemaField({
        id: new StringField({ required: true }),
        nome: new StringField({ required: true }),
        descricao: new StringField({ required: false, initial: '' }),
        quantidade: new NumberField({ required: false, initial: 1 }),
        peso: new NumberField({ required: false, initial: 0 })
    })),
    
    // Digivice
    digivice: new SchemaField({
        tipo: new StringField({ required: false, initial: '' }),
        cor: new StringField({ required: false, initial: '' }),
        descricao: new StringField({ required: false, initial: '' })
    }),
    
    // Profile image and display
    display: DisplayModel(),
    body: BodyModel(),
    header: HeaderModel(),
    hidden: HiddenPropsModel()
});

export class TamerActorDataModel extends AbstractActorDataModel {
    static defineSchema() {
        return defineTamerActorDataModelSchema();
    }
}
