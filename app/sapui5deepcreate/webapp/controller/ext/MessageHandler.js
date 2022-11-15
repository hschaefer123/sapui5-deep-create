sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Fragment"
], function (ControllerExtension, Fragment) {
    "use strict";

    /**
     * @class A controller extension offering Message handling features as mixin
     * @implements sap.fe.core.controllerextensions.MessageHandler
     *
     * @name udina.sample.sapui5deepcreate.controller.ext.MessageHandler
     * @hideconstructor
     * @public
     * @since 1.2.0
     */
    return ControllerExtension.extend("udina.sample.sapui5deepcreate.controller.ext.MessageHandler", {

        onMessagePopoverPress: function (oEvent) {
            this.showMessageDialog(oEvent.getSource());
        },

        showMessageDialog: function (oSourceControl) {
            this._getMessagePopover().then(function (oMessagePopover) {
                oMessagePopover.openBy(oSourceControl);
            });
        },

        _getMessagePopover: function () {
            var oView = this.base.getView();

            // create popover lazily (singleton)
            if (!this._pMessagePopover) {
                this._pMessagePopover = Fragment.load({
                    id: oView.getId(),
                    name: "udina.sample.sapui5deepcreate.view.fragment.MessagePopover"
                }).then(function (oMessagePopover) {
                    oView.addDependent(oMessagePopover);
                    return oMessagePopover;
                });
            }
            return this._pMessagePopover;
        }

    });
});