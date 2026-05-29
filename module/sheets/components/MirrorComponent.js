import { RequiredFieldError } from '../../errors/ComponentValidationError.js';
import Logger from '../../Logger.js';
import Component from './Component.js';
class MirrorComponent extends Component {
    /**
     * Should this component type be included by default in component creation windows ?
     * If false, component must be explicitly required when opening the dialog
     */
    static publicComponent = false;
    /** Key of the component in the item to mirror */
    _targetKey;
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this._targetKey = props.targetKey;
    }
    /**
     * Renders component
     * @override
     * @param entity Rendered entity (actor or item)
     * @param isEditable Is the component editable by the current user?
     * @param options Additional options usable by the final Component
     * @returns The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        if (!options.linkedEntity) {
            Logger.error('Cannot render a Mirror Component without a linkedEntity', this._key, entity.uuid);
            return $('<span>ERROR</span>');
        }
        const component = options.linkedEntity.templateSystem.componentMap[this._targetKey];
        if (!component) {
            Logger.error('Component not found in linkedEntity', this._key, entity.uuid, this._targetKey, options.linkedEntity);
            return $('<span>ERROR</span>');
        }
        return component.render(options.linkedEntity.templateSystem, isEditable, {
            ...options,
            noName: true,
            changeCallback: (_ev, key, value) => {
                if (!options.linkedEntity) {
                    Logger.error('Cannot update a Mirror Component without a linkedEntity', this._key, entity.uuid);
                    return;
                }
                void options.linkedEntity?.update({
                    [`system.props.${key}`]: value
                });
            }
        });
    }
    /**
     * Returns serialized component
     */
    toJSON() {
        const jsonObj = super.toJSON();
        return {
            ...jsonObj,
            targetKey: this._targetKey
        };
    }
    /**
     * Creates mirrorComponent from JSON description
     */
    static fromJSON(json, templateAddress, parent) {
        return new MirrorComponent({
            ...json,
            parent: parent,
            templateAddress: templateAddress
        });
    }
    /**
     * Gets technical name for this component's type
     * @return The technical name
     * @throws {Error} If not implemented
     */
    static getTechnicalName() {
        return 'mirrorComponent';
    }
    /**
     * Gets pretty name for this component's type
     * @returns The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return game.i18n.localize('CSB.ComponentProperties.ComponentType.MirrorComponent');
    }
    /**
     * Get configuration form for component creation / edition
     * @returns The jQuery element holding the component
     */
    static async getConfigForm(_entity, appId, existingComponent) {
        const mainElt = document.createElement('div');
        mainElt.innerHTML = await foundry.applications.handlebars.renderTemplate(`systems/${game.system.id}/templates/_template/components/mirrorComponent.hbs`, {
            ...existingComponent,
            appId
        });
        return mainElt;
    }
    /**
     * Extracts configuration from submitted HTML form
     * @param html The submitted form
     * @returns The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(rawConfigData, html) {
        const configData = rawConfigData;
        const fieldData = {
            ...super.extractConfig(configData, html),
            targetKey: configData.targetKey
        };
        return fieldData;
    }
    /**
     * Validates if the passed JSON-Object meets all criteria for Component creation.
     * Can be overridden by each Component's subclass.
     * @param json The new Component's JSON
     * @throws {ComponentValidationError} If configuration contains validation errors
     */
    static validateConfig(json) {
        super.validateConfig(json);
        if (!json.targetKey) {
            throw new RequiredFieldError(game.i18n.localize('CSB.ComponentProperties.MirrorComponent.TargetKey'), json);
        }
    }
}
/**
 * @ignore
 */
export default MirrorComponent;
