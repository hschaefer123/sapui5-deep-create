sap.ui.define([
    "udina/sample/sapui5deepcreate/controller/BaseController",
    "udina/sample/sapui5deepcreate/controller/ext/EditFlow",
    "udina/sample/sapui5deepcreate/controller/ext/MessageHandler",
    "udina/sample/sapui5deepcreate/model/formatter",
], function (BaseController, EditFlow, MessageHandler, formatter) {
    "use strict";

    return BaseController.extend("udina.sample.sapui5deepcreate.controller.PageController", {

        formatter: formatter,

        // add used extensions
        editFlow: EditFlow,
        messageHandler: MessageHandler,

        onInit: function () {
            const oUIModel = this.getAppComponent().getModel("ui"),
                sPath = `/pages/${this.getView().getId()}`;

            console.log("sPath", sPath);

            // as the model propagation happens after init but we actually 
            // want to access the binding context in the
            // init phase already setting the model here
            this.getView().setModel(oUIModel, "ui");
        },

        onBeforeRendering() {
            /*
            if (this.placeholder.attachHideCallback) {
                this.placeholder.attachHideCallback();
            }
            */
        },

        onPageReady(mParameters) {
            // Apply app state only after the page is ready with the first section selected
            //this.getAppComponent().getAppStateHandler().applyAppState();
        }

    });
});
