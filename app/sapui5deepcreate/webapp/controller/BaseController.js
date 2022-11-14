sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("udina.sample.sapui5deepcreate.controller.BaseController", {

        _oAppComponent: undefined,

        /**
         * Returns the current app component.
         *
         * @returns The app component or, if not found, null
         * @alias sap.fe.core.BaseController#getAppComponent
         * @public
         */
        getAppComponent() {
            if (!this._oAppComponent) {
                this._oAppComponent = this.getOwnerComponent();
            }
            return this._oAppComponent;
        },

        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return this.getAppComponent().getRouter();
            //return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method provided by SAP Fiori elements to enable applications to include the view model by name into each controller.
         *
         * @public
         * @param sName The model name
         * @returns The model instance
         */
        getModel(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model in every controller of the application.
         *
         * @public
         * @param oModel The model instance
         * @param sName The model name
         * @returns The view instance
         */
        setModel(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @param sI18nModelName The model name or empty for default i18n model
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle(sI18nModelName) {
            if (!sI18nModelName) {
                sI18nModelName = "i18n";
            }
            return (this.getAppComponent().getModel(sI18nModelName)).getResourceBundle();
        }

    });
});
