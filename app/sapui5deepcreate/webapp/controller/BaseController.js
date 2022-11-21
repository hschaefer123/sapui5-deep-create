sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
], function (Controller, History) {
    "use strict";

    return Controller.extend("udina.sample.sapui5deepcreate.controller.BaseController", {

        _oAppComponent: undefined,

        /**
         * Event handler  for navigating back.
         * It checks if there is a history entry. If yes, history.go(-1) will happen.
         * If not, it will replace the current entry of the browser history with the worklist route.
         * Furthermore, it removes the defined binding context of the view by calling unbindElement().
         * @public
         */
        onNavBack: function (oEvent) {
            var oHistory, sPreviousHash;

            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("list", {}, true /*no history*/);
            }
        },

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
            //return this.getAppComponent().getRouter();
            return sap.ui.core.UIComponent.getRouterFor(this);
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
        },

        /**
         * Convenience method for getting the resource bundle text.
         * @public
         * @param {string} sKey  the property to read
         * @param {string[]} aArgs? List of parameters which should replace the place holders "{n}" (n is the index) in the found locale-specific string value.
         * @returns {String} the corresponding text for the key
         */
        getText: function (sKey, aArgs) {
            return this.getResourceBundle().getText(sKey, aArgs);
        }

    });
});
