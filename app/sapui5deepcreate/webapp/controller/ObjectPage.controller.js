sap.ui.define([
    "udina/sample/sapui5deepcreate/controller/BaseController",
    "udina/sample/sapui5deepcreate/controller/ext/EditFlow",
    "udina/sample/sapui5deepcreate/controller/ext/MessageHandler",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode"
], function (BaseController, EditFlow, MessageHandler, JSONModel, BindingMode) {
    "use strict";

    const EditMode = {
        /**
         * View is currently displaying only.
         *
         * @constant
         * @type {string}
         * @public
         */
        Display: "Display",
        /**
         * View is currently editable.
         *
         * @constant
         * @type {string}
         * @public
         */
        Editable: "Editable"
    };

    return BaseController.extend("udina.sample.sapui5deepcreate.controller.ObjectPage", {

        // add used extensions
        editFlow: EditFlow,
        messageHandler: MessageHandler,

        onInit: function () {
            var iOriginalBusyDelay;

            // Store original busy indicator delay, so it can be restored later on
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            // this is only for SAP FE compliance reason.
            // do not use the "ui" model in custom code to avoid namespace issues!
            var oUiModel = new JSONModel({
                busy: true,
                delay: 0,
                editMode: EditMode.Display,
                isEditable: false
            })
            oUiModel.setDefaultBindingMode(BindingMode.OneWay);
            this.getView().setModel(oUiModel, "ui");

            // handle current route
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            // use editFlow events
            // this.editFlow.onBeforeSave = this.onEditFlowBeforeSave;
        },

        onEditFlowBeforeSave: function (mParameters) {
            return Promise.reject("not confirmed by user");
        },

        onAddItem: function (oEvent) {
            this._addItem();
        },

        onDeleteItem: function (oEvent) {
            var oItem = oEvent.getSource(),
                oContext = oItem.getBindingContext();

            oContext.delete();
        },

        setEditable: function (bEditable) {
            var oUiModel = this.getView().getModel("ui");
            oUiModel.setProperty("/editMode", (bEditable) ? EditMode.Editable : EditMode.Display);
            oUiModel.setProperty("/isEditable", bEditable);
        },

        _onObjectMatched: function (oEvent) {
            var sKey = oEvent.getParameter("arguments").objectId,
                sObjectPath;

            if (sKey) {
                sObjectPath = "/" + this.getModel().createKey("SalesOrder", {
                    SalesOrder: sKey
                });
            }

            this._bindView(sObjectPath);
        },

        /**
        * Binds the view to the object path. Makes sure that detail view displays
        * a busy indicator while data for the corresponding element binding is loaded.
        * @function
        * @param {string} sPath path to the object to be bound to the view.
        * @param {object} mParameters binding params
        * @private
        */
        _bindView: function (sPath) {
            var oView = this.getView(),
                oViewModel = oView.getModel("ui"),
                oDataModel = this.getModel(),
                bEditable = sPath === undefined;

            // remove former binding
            oView.unbindElement();

            // EDIT/DISPLAY MODE
            this.setEditable(bEditable);

            if (bEditable) {
                // create transient context for root entity (sales order)
                this.editFlow.createDocument("/SalesOrder", {
                    PurchaseOrderByCustomer: "Your order info"
                });

                // create transient context for subentity (sales order line item) and display it in the items table
                this._addItem(true);

                oViewModel.setProperty("/busy", false);
            } else {
                oView.bindElement({
                    path: sPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function () {
                            oDataModel.metadataLoaded().then(function () {
                                // Busy indicator on view should only be set if metadata is loaded,
                                // otherwise there may be two busy indications next to each other on the
                                // screen. This happens because route matched handler already calls '_bindView'
                                // while metadata is loaded.
                                oViewModel.setProperty("/busy", true);
                            });
                        },
                        dataReceived: function () {
                            oViewModel.setProperty("/busy", false);
                        }
                    }
                });
            }
        },

        /**
         * Event handler for binding change event
         * @function
         * @private
         */
        _onBindingChange: function (oEvent) {
            var oView = this.getView(),
                //oElementBinding = oView.getElementBinding(),
                oViewModel = this.getView().getModel("ui");

            // No data for the binding
            if (!oView.getBindingContext()) {
                //if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            // Everything went fine.
            oViewModel.setProperty("/busy", false);
        },

        _addItem: function (bDemoMaterial) {
            var oItemsTable = this.byId("itemTable"),
                oItemsBinding = oItemsTable.getBinding("items");

            // create transient context for subentity (sales order line item) 
            oItemsBinding.create({
                RequestedQuantity: 1.000,
                RequestedQuantityUnit: "PC",
                Material: (bDemoMaterial) ? "TG11" : null
            }, true); // insert at end
        }

    });
});
