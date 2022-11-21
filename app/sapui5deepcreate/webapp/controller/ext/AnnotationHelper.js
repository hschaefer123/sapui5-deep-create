sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (ControllerExtension, JSONModel, Fragment) {
    "use strict";

    /**
     * @class A controller extension offering Annotation helpers as mixin
     * @implements sap.fe.core.controllerextensions.AnnotationHelper
     *
     * @name udina.sample.sapui5deepcreate.controller.ext.AnnotationHelper
     * @hideconstructor
     * @public
     * @since 1.2.0
     */
    return ControllerExtension.extend("udina.sample.sapui5deepcreate.controller.ext.AnnotationHelper", {

        // this section allows to extend lifecycle hooks or override public methods of the base controller
        /*
        override: {
            onInit: function () {
                this.base.getView().setModel(new JSONModel(), "quickView");
            }
        },
        */

        /*
        ** !!! WILL BE REFACTORED TO SUPPORT ANNOTATION DRIVEN CUSTOM WIDGETS!!!
        **/

        onQuickView: function (oEvent) {
            var oControl = oEvent.getSource(),
                sTitle = oControl.data("title"),
                sTarget = oControl.data("target");

            this._setCompanyModel(sTitle, sTarget);
            this.openQuickView(oControl);
        },

        openQuickView: function (oControl) {
            var oView = this.base.getView(),
                sTitle = oControl.data("title"),
                sTarget = oControl.data("target");

            if (!this._pQuickView) {
                this._pQuickView = Fragment.load({
                    id: oView.getId(),
                    name: "udina.sample.sapui5deepcreate.view.fragment.QuickView",
                    controller: this
                }).then(function (oQuickView) {
                    oView.addDependent(oQuickView);
                    return oQuickView;
                });
            }
            this._pQuickView.then(function (oQuickView) {
                oQuickView.setModel(oView.getModel("quickView"));
                oQuickView.openBy(oControl);
            });
        },

        _setCompanyModel: function (sTitle, sTarget) {            
            var oPage = {},
                aPages = [],
                aGroups = [],
                aElements = [];

            oPage = {
                pageId: "customer",
                header: sTitle,
                title: "ABNTi",
                titleUrl: undefined,
                description: "desc",
                groups: aGroups
            }

            aElements.push({
                label: "el",
                value: "ev",
                url: "eUri",
                type: "type",
                pageLinkId: oPage.pageId,
                emailSubject: "emsuv",
                target: "{target}"
            });
            aElements.push({
                label: "el",
                value: "ev",
                url: "eUri",
                type: "type",
                pageLinkId: oPage.pageId,
                emailSubject: "emsuv",
                target: "{target}"
            });

            aGroups.push({
                heading: "ghead{heading}",
                elements: aElements
            });

            aPages.push(oPage);

            var oQuickViewModel = this.base.getModel("quickView");
            if (!oQuickViewModel) {
                oQuickViewModel = new JSONModel();
                this.base.getView().setModel(oQuickViewModel, "quickView");
            }
            oQuickViewModel.setProperty("/pages", aPages);
        }

    });
});