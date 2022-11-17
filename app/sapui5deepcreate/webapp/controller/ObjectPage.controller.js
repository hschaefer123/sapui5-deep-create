sap.ui.define([
    "udina/sample/sapui5deepcreate/controller/BaseController",
    "udina/sample/sapui5deepcreate/controller/ext/EditFlow",
    "udina/sample/sapui5deepcreate/controller/ext/MessageHandler",
    "udina/sample/sapui5deepcreate/controller/ext/PDFViewer",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ndc/BarcodeScanner"
], function (BaseController, EditFlow, MessageHandler, PDFViewer, JSONModel, BindingMode, BarcodeScanner) {
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
        pdfViewer: PDFViewer,

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
                isEditable: false,
                itemCount: 0
            })
            oUiModel.setDefaultBindingMode(BindingMode.OneWay);
            this.getView().setModel(oUiModel, "ui");
            this._oUiModel = oUiModel;

            // handle current route
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            // use editFlow events
            // this.editFlow.onBeforeSave = this.onEditFlowBeforeSave;
        },

        onBarcodeScan: function () {
            var that = this;
            BarcodeScanner.scan(
                function (mResult) {
                    var sCode = mResult.text;
                    //console.log("onBarcodeScan", mResult, sCode);
                    if (sCode) {
                        that._addItem({ Material: sCode });
                    }
                },
                function (sError) {
                    // TODO: i18n text
                    //that.getUtil().messageToast("Scan failed: " + sError);        
                }
            );
        },

        onItemUpdateFinished: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            this._oUiModel.setProperty("/itemCount", iTotal);
        },

        /*
        onSmartTableInitialize: function() {
            console.log("smt init");
            this._addItem();
        },
        */

        onEditFlowBeforeSave: function (mParameters) {
            return Promise.reject("not confirmed by user");
        },

        onAddItem: function (oEvent) {
            this._addItem();
        },

        onDeleteItem: function (oEvent) {
            var oList = oEvent.getSource(),
                oItem = oEvent.getParameter("listItem"),
                oContext = oItem.getBindingContext();

            // after deletion put the focus back to the list
            oList.attachEventOnce("updateFinished", oList.focus, oList);

            // send a delete request to the odata service
            oContext.delete();
        },

        onDeleteItemOld: function (oEvent) {
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
                // display mode
                sObjectPath = "/" + this.getModel().createKey("SalesOrder", {
                    SalesOrder: sKey
                });
            } else {
                // edit mode
                //this.getView().attachEventOnce("afterRendering", function() {                
                //}, this);

                // focus first editable field
                this.byId("SmartForm").setFocusOnEditableControl();
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
                    CustomerPurchaseOrderDate: new Date(),
                    PurchaseOrderByCustomer: ""
                });

                // create transient context for subentity (sales order line item) 
                // and display it in the items table (use placeholder)
                this._addItem();

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

        _addItem: function (oDefaultData) {
            /*
            var oSmartTable = this.byId("smartTableItems");
            oSmartTable.rebindTable(true);
            */
            var oTable = this.byId("itemTable"),
                oBinding = oTable.getBinding("items");

            var oData = {
                RequestedQuantity: 1.0,
                RequestedQuantityUnit: "PC"
            };

            if (oDefaultData) {
                oData = Object.assign(oDefaultData, oData);
            }

            // create transient context for subentity (sales order line item) 
            oBinding.create(oData, true); // insert at end                        

            // after adding put the focus on the newly create item
            oTable.attachEventOnce("updateFinished", function () {
                var aItems = oTable.getItems(),
                    oItem = aItems[aItems.length - 1];
                oItem.focus();
            }, oTable);
        }

    });
});
