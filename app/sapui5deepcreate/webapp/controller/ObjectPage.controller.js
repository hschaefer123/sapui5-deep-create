sap.ui.define([
    "udina/sample/sapui5deepcreate/controller/PageController",
    "udina/sample/sapui5deepcreate/controller/ext/EditFlow",
    "udina/sample/sapui5deepcreate/controller/ext/MessageHandler",
    "udina/sample/sapui5deepcreate/controller/ext/FileViewer",
    "udina/sample/sapui5deepcreate/controller/ext/AnnotationHelper",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/aria/HasPopup",
    "sap/ndc/BarcodeScanner"
], function (PageController, EditFlow, MessageHandler, FileViewer, AnnotationHelper, JSONModel, 
    HasPopup, BarcodeScanner) {
    "use strict";

    return PageController.extend("udina.sample.sapui5deepcreate.controller.ObjectPage", {

        // add used extensions
        editFlow: EditFlow,
        messageHandler: MessageHandler,
        fileViewer: FileViewer,
        annotationHelper: AnnotationHelper,

        onInit: function () {
            var iOriginalBusyDelay;

            // Store original busy indicator delay, so it can be restored later on
            iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            // local view model
            var oViewModel = new JSONModel({
                itemCount: 0,
                attachmentCount: 0,
                pdfSource: "",
                pdfTitle: "",
            })
            this.getView().setModel(oViewModel, "view");
            this._oViewModel = oViewModel;

            // site view
            this._oDynamicSideView = this.byId("DynamicSideContent");

            // handle current route
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            // use editFlow events
            // this.editFlow.onBeforeSave = this.onEditFlowBeforeSave;

            // attach fileViewer event
            /*
            this.fileViewer.onBeforeOpenFile = function(mFile) {
                if (mFile.MediaType === "application/pdf") {
                    oViewModel.setProperty("/pdfSource", mFile.Url);
                    oViewModel.setProperty("/pdfTitle", mFile.FileName);
                }
                return Promise.resolve();
            }
            */

            // handle attachment count
            this.byId("UploadSet").getList().attachUpdateFinished(this.onAttachmentUpdateFinished, this);
        },

        onAfterRendering: function () {
            this._sCurrentBreakpoint = this._oDynamicSideView.getCurrentBreakpoint();
        },

        onFileOpenBySide: function (oEvent) {
            var oSource = oEvent.getSource(),
                oList = oSource.getList(),
                oItem = (oEvent.getParameter("items")) 
                    ? oEvent.getParameter("items")[0]
                    : oList.getSelectedItem(),
                oContext = oItem.getBindingContext();

            if (oContext.getProperty("MediaType") === "application/pdf") {
                this._oDynamicSideView.setShowSideContent(true);
                this._oViewModel.setProperty("/pdfSource", oContext.getProperty("Url"));
                this._oViewModel.setProperty("/pdfTitle", oContext.getProperty("FileName"));
            } else {
                this.fileViewer.onAvatarPress.apply(this, arguments);
            }

            // deselect litem items
            oList.removeSelections();
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
            this._oViewModel.setProperty("/itemCount", iTotal);
        },

        onAttachmentUpdateFinished: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            this._oViewModel.setProperty("/attachmentCount", iTotal);
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

        onSideContentToggle: function (oEvent) {
            if (this._sCurrentBreakpoint === "S") {
                this._oDynamicSideView.toggle();
            } else {
                this._oDynamicSideView.setShowSideContent(true);
            }

            this.byId("SideContentToggleButton").setVisible(false);
            this.byId("SideContentCloseButton").focus();
        },

        onSideContentClose: function () {
            if (this._sCurrentBreakpoint === "S") {
                this._oDynamicSideView.toggle();
            } else {
                this._oDynamicSideView.setShowSideContent(false);
            }

            /*
            var oButton = this.byId("SideContentToggleButton");
            oButton.setVisible(true);
            setTimeout(function () {
                oButton.focus();
            }.bind(this));
            */
        },

        onSideContentBreakpointChanged: function (oEvent) {
            return;
            this._sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

            var oButton = this.byId("SideContentToggleButton");
            if (this._sCurrentBreakpoint === "S" || !this._oDynamicSideView.isSideContentVisible()) {
                oButton.setVisible(true);
            } else {
                oButton.setVisible(false);
            }
        },

        _onObjectMatched: function (oEvent) {
            var sKey = oEvent.getParameter("arguments").objectId,
                sObjectPath;

            if (sKey === "...") {
                // create (edit mode)
                //this.getView().attachEventOnce("afterRendering", function() {}, this);

                sObjectPath = sKey;

                // focus first editable field
                this.byId("SmartForm").setFocusOnEditableControl();
            } else {
                // display mode
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
                oEditArea = this.byId("ObjectPageLayout"),
                bEditable = sPath === "...";

            // remove former binding
            oView.unbindElement();
            //oEditArea.unbindElement();

            // EDIT/DISPLAY MODE
            this.getAppComponent().setEditable(bEditable);

            // hide side content
            this._oDynamicSideView.setShowSideContent(false);

            if (bEditable) {
                // create transient context for root entity (sales order)
                // and bind context to view
                var oEditContext = this.editFlow.createDocument("/SalesOrder", {
                    CustomerPurchaseOrderDate: new Date(),
                    PurchaseOrderByCustomer: ""
                });

                //oEditArea.setBindingContext(oEditContext);
                oView.setBindingContext(oEditContext);

                this._addInitialItem();

                /*
                var that = this,
                    oSmartTableItems = this.byId("smartTableItems");

                if (oSmartTableItems.isInitialised()) {
                    this._addItem();
                } else {
                    var fnAddItem = function () {
                        // create transient context for subentity (sales order line item) 
                        // and display it in the items table (use placeholder)
                        setTimeout(function () {
                            that._addItem();
                            oSmartTableItems.detachBeforeRebindTable(fnAddItem);
                            oSmartTableItems.rebindTable(true);
                        }, 100);
                    };
                    oSmartTableItems.attachBeforeRebindTable(undefined, fnAddItem);
                }
                */

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

        _addInitialItem: function () {
            var that = this,
                oSmartTableItems = this.byId("smartTableItems");

            if (oSmartTableItems.isInitialised()) {
                this._addItem();
            } else {
                var fnAddItem = function () {
                    // create transient context for subentity (sales order line item) 
                    // and display it in the items table (use placeholder)
                    setTimeout(function () {
                        oSmartTableItems.detachBeforeRebindTable(fnAddItem); // needs to be done before rebind
                        that._addItem();
                        oSmartTableItems.rebindTable(true);                        
                        /*
                        var oBinding = oSmartTableItems.getTable().getBinding("items");
                        if (oBinding) {
                            oBinding.refresh(true);
                        }
                        */
                    }, 100);
                };
                oSmartTableItems.attachBeforeRebindTable(undefined, fnAddItem);
            }
        },

        _addItem: function (oDefaultData) {
            var oSmartTable = this.byId("smartTableItems"),
                oTable = (oSmartTable) ? oSmartTable.getTable() : this.byId("itemTable"),
                oBinding = oTable.getBinding("items");

            if (!oBinding) {
                return;
            }

            var oData = {
                RequestedQuantity: 1.0,
                RequestedQuantityUnit: "PC"
            };

            if (oDefaultData) {
                oData = Object.assign(oDefaultData, oData);
            }

            // after adding put the focus on the newly create item
            oTable.attachEventOnce("updateFinished", function () {
                var aItems = oTable.getItems(),
                    oItem = aItems[aItems.length - 1];

                if (oItem) {
                    oItem.focus();
                }
            }, oTable);

            // create transient context for subentity (sales order line item) 
            oBinding.create(oData, true); // insert at end                        
        }

    });
});
