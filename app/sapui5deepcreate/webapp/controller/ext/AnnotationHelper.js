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

            this._setCommunicationModel(sTitle, oControl.getBindingContext());
            this.openQuickView(oControl);
        },

        openQuickView: function (oControl) {
            var oView = this.base.getView();

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

        _setCommunicationModel: function (sTitle, oContext) {
            var sPath = oContext.getPath(),
                mPages;

            //console.log("_setCompanyModel", sPath, oContext.getObject());

            if (sPath.startsWith("/SalesOrderPartnerAddress")) {
                mPages = this._getCommunicationByPartner(sTitle, oContext);
            }

            var oQuickViewModel = this.base.getModel("quickView");
            if (!oQuickViewModel) {
                oQuickViewModel = new JSONModel();
                this.base.getView().setModel(oQuickViewModel, "quickView");
            }
            oQuickViewModel.setProperty("/pages", Array.isArray(mPages) ? mPages : [mPages]);
        },

        _getCommunicationByPartner: function (sTitle, oContext) {
            var oData = oContext.getObject();

            return {
                pageId: "Partner",
                header: sTitle,
                title: oData.OrganizationName1,
                description: oData.AddresseeFullName,
                avatarSrc: "sap-icon://building",
                groups: [{
                    heading: this.base.getText("Contact"),
                    elements: [{
                        label: this.base.getText("Email"),
                        value: oData.EmailAddress,
                        type: "email",
                        emailSubject: "Please contact me..."
                    }, {
                        label: this.base.getText("Phone"),
                        value: oData.PhoneNumberCountry,
                        type: "phone"
                    }, {
                        label: this.base.getText("Mobile"),
                        value: oData.MobilePhoneCountry,
                        type: "mobile"
                    }
                        /*
                        }, {
                            label: this.base.getText("Website"),
                            value: oData.???,
                            type: "link",
                            url: "https://www.uniorg.de"
                        }
                        */
                    ]
                }]
            };
        },

        _getCommunicationByXyz: function (sTitle, oContext) {
            var oData = oContext.getObject(),
                oPage = {},
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

            return oPage;
        }

    });
});