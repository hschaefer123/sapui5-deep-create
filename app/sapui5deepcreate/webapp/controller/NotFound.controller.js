sap.ui.define([
    "udina/sample/sapui5deepcreate/controller/BaseController",
], function (BaseController) {
    "use strict";

    return BaseController.extend("udina.sample.sapui5deepcreate.controller.NotFound", {

        /**
         * Navigates to the worklist when the link is pressed
         * @public
         */
        onLinkPressed: function () {
            this.getRouter().navTo("ListReport");
        }

    });

});