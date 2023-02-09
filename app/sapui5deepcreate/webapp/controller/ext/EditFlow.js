sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/ui/core/ValueState",
    "sap/ui/core/Element",
    "sap/m/MessageBox",
    "sap/base/Log"
], function (ControllerExtension, OverrideExecution, ValueState, Element, MessageBox, Log) {
    "use strict";

    /**
     * @class A controller extension offering CRUD editFlow features as mixin
     * @implements sap.fe.core.controllerextensions.EditFlow
     *
     * @name udina.sample.sapui5deepcreate.controller.ext.EditFlow
     * @hideconstructor
     * @public
     * @since 1.2.0
     */
    return ControllerExtension.extend("udina.sample.sapui5deepcreate.controller.ext.EditFlow", {

        metadata: {
            methods: {
                "onBeforeSave": { "public": true, "final": false, overrideExecution: OverrideExecution.After }
            }
        },

        // this section allows to extend lifecycle hooks or override public methods of the base controller
        override: {
            onInit: function () {
                // example chain to traverse controller objects
                var oBase = this.base, // current controller
                    oComponent = oBase.getAppComponent(),
                    oView = oBase.getView(),
                    oController = oView.getController();

                //console.log("baseCtrl", oBase, oComponent, oView, oController);

                this._oContext = undefined;
            }
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        onBeforeSave: function () {
            // to be overwritten like -> return Promise.reject("Canceld by user");
            return Promise.resolve();
        },

        onCancel: function () {
            this.cancelDocument();
            this._navBack();
        },

        onSave: function (oEvent) {
            this.saveDocument(this.getContext(), oEvent.getSource());
        },

        onSavePreProcessed: function (oEvent) {
            this.saveDocumentPreProcessed(this.getContext(), oEvent.getSource());
        },

        onContextCreated: function (oContext) { },

        /* =========================================================== */
        /* Upload handling                                             */
        /* =========================================================== */

        onUploadCompleted: function (oEvent) {
            var oUploadSet = oEvent.getSource(),
                oUploadSetBinding = oUploadSet.getBinding("items"),
                oItem = oEvent.getParameter("item"),
                oFileObject = oItem.getFileObject(),
                oReader = new FileReader();

            //console.log("onUploadCompleted", oItem, oContext, oUploadSetBinding);

            oReader.onload = function () {
                // Create oData context
                var oNewContext = oUploadSetBinding.create(({
                    // support renamed fileName instead origin
                    "FileName": oItem.getFileName(),
                    "MediaType": oFileObject.type,
                    "Data": oReader.result.split(",")[1]
                }), true); // insert at end      

                // fake preview
                //oItem.setProperty("url", "data:" + oFileObject.type + ";base64," + oReader.result.split(",")[1]);

                // use url to store ref to odata context, 
                // because custom data is empty at afterItemRemoved
                oItem.setProperty("url", oNewContext.getPath());
            };
            oReader.readAsDataURL(oFileObject);

            this._refreshAttachmentCount(oUploadSet);
        },

        onUploadAdd: function (oEvent) {
            var oUploadSet = oEvent.getSource(),
                aItems = oUploadSet.getItems(),
                oItem = oEvent.getParameter("item"),
                sFileName = oItem.getFileName();

            const oTargetItem = aItems.find(oItem => oItem.getFileName() === sFileName);
            if (oTargetItem) {
                // avoid redundant files, because filename is used as ref between files and attachments
                MessageBox.error("This file was already added!", {
                    title: "File exists",
                });
                // skip adding existing file
                oEvent.preventDefault();
            }            
        },

        onUploadRenamed: function (oEvent) {
            var oUploadSet = oEvent.getSource(),
                oItemsBinding = oUploadSet.getBinding("items"),
                aItemContexts = oItemsBinding.getContexts(),
                oItem = oEvent.getParameter("item"),
                sPath = oItem.getProperty("url");

            const oTargetItem = aItemContexts.find(oItem => oItem.sPath === sPath);
            if (oTargetItem) {
                //console.log("onUploadRenamed", sPath, oRenameItem, oItem.getFileName());
                oTargetItem.getModel().setProperty("FileName", oItem.getFileName(), oRenameItem);
            }
        },

        onUploadRemoved: function (oEvent) {
            var oUploadSet = oEvent.getSource(),
                oItemsBinding = oUploadSet.getBinding("items"),
                aItemContexts = oItemsBinding.getContexts(),
                oItem = oEvent.getParameter("item"),
                sPath = oItem.getProperty("url");

            const oTargetItem = aItemContexts.find(oItem => oItem.sPath === sPath);
            if (oTargetItem) {
                //console.log("onUploadItemRemoved", sPath, oDeleteItem, oItem);
                oTargetItem.delete();
            }
            this._refreshAttachmentCount(oUploadSet);
        },

        onUploadDataReceived: function(oEvent) {
            var iTotal = oEvent.getParameter("data").results.length;

            this._refreshAttachmentCount(undefined, iTotal);
        },

        _refreshAttachmentCount: function(oUploadSet, iTotal) {
            var iCount = (oUploadSet) ? oUploadSet.getItems().length : iTotal;
            
            this.base.getView().getModel("view").setProperty("/attachmentCount", iCount);
        },

        /* =========================================================== */
        /* Public functions                                            */
        /* =========================================================== */

        /**
         * Get the currently used View/Edit context
         *
         * @public
         */
        getContext: function () {
            return this._oContext;
        },

        /**
         * Discard the editable document
         *
         * @public
         */
        cancelDocument: function () {
            var oDataModel = this.base.getModel();
            return oDataModel.resetChanges([this._oContext.getPath()], false, true);
        },

        /**
         * Creates a new document
         *
         * @public
         * @return Promise
         */
        createDocument: function (vListBinding, mProperties, mInParameters) {
            var oDataModel = this.base.getModel(),
                oView = this.base.getView();

            this._oContext = oDataModel.createEntry(vListBinding, {
                properties: mProperties
            });

            // use created promise of root entity to handle a successful create
            // Note: subcontext references like oItemContext must no longer be used then!
            this._oContext.created()
                .then(this.onContextCreated.bind(this))
                .catch(function () {
                    oView.unbindElement();
                    this._oContext = null;

                }.bind(this));

            this._refreshAttachmentCount(undefined, 0);

            // bind a form against the transient context for the newly created entity
            //oView.setBindingContext(this._oContext);

            return this._oContext;
        },

        /**
         * Deletes the document
         *
         * @public
         */
        deleteDocument: function () { },

        /**
         * Creates a new document
         *
         * @public
         */
        editDocument: function () { },

        /**
         * Invokes an action
         *
         * @public
         */
        invokeAction: function () { },

        /**
         * Saves a new document after checking it
         *
         * @public
         */
        saveDocument: function (oContext, oButton) {
            return new Promise(async function (fnResolve, fnReject) {
                try {
                    var bValid = await this._checkForValidationErrors();

                    if (!bValid) {
                        return;
                    }

                    // disable save button while processing
                    oButton.setBusy(true);

                    await this.base.editFlow.onBeforeSave({ context: oContext });

                    //this._setEditMode(EditMode.Display, false);
                    //this._getMessageHandler().showMessageDialog();
                    //messageHandler.removeTransitionMessages();

                    await this._submitChanges(oContext);

                    // navigate back to ListReport
                    //this.base.getAppComponent().getRouter().navTo("list");
                    this._navToContext(oContext);

                    oButton.setBusy(false);

                    fnResolve();
                } catch (oError) {
                    Log.error("saveDocument",
                        JSON.stringify(oError),
                        this.getMetadata().getName()
                    );
                    oButton.setBusy(false);
                    fnReject(oError);
                }
            }.bind(this));
        },

        saveDocumentPreProcessed: async function (oContext, oButton) {
            return new Promise(async function (fnResolve, fnReject) {
                try {
                    var bValid = await this._checkForValidationErrors();

                    if (!bValid) {
                        return;
                    }

                    // disable save button while processing
                    oButton.setBusy(true);

                    await this.base.editFlow.onBeforeSave({ context: oContext });

                    var oDataModel = oContext.getModel(),
                        oData = this._getDeepObject(oContext);

                    // handle attachment serialisation
                    var aAttachment = await this._processUploadCollection(
                        this.base.byId("UploadSet")
                    );
                    oData.to_Attachment = aAttachment;

                    // trigger create 
                    await this._create(oData);

                    // navigate back to ListReport
                    this._navToContext(oContext);

                    fnResolve();
                } catch (oError) {
                    Log.error("saveDocumentPreProcessed",
                        JSON.stringify(oError),
                        this.getMetadata().getName()
                    );
                    oButton.setBusy(false);
                    fnReject(oError);
                }
            }.bind(this));
        },

        /**
         * Updates the document and displays the error messages if there are errors during an update.
         *
         * @public
         */
        updateDocument: function () { },

        /* =========================================================== */
        /* Private functions                                           */
        /* =========================================================== */

        _navBack: function () {
            this.base.getRouter().navTo("list");
        },

        _navToContext: function (oContext) {
            // TODO: maybe navTo ObjectPage view mode after creation
            //this.base.getRouter().navTo("list");
            this._navBack();
        },

        _getDeepObject: function (oContext, aExpandPath) {
            var oData = oContext.getObject();
            /* not working on transient entities!!!
            oData = oDataModel.getObject(
                oContext.getPath(),
                oContext,
                {
                    expand: "to_Item"
                }
            );*/

            delete oData.__metadata;

            for (const [sKey, aValue] of Object.entries(oContext.getSubContexts())) {
                var aSubData = [];

                aValue.forEach(function (oSubContext) {
                    var oSubData = oSubContext.getObject();
                    delete oSubData.__metadata;
                    aSubData.push(oSubData);
                });

                oData[sKey] = aSubData;
            }

            return oData;
        },

        _submitChanges: function (oContext) {
            return new Promise(function (fnResolve, fnReject) {
                const oDataModel = oContext.getModel();

                if (oDataModel.bUseBatch) {
                    oDataModel.attachEventOnce("batchRequestCompleted", fnResolve);
                    oDataModel.attachEventOnce("batchRequestFailed", fnReject);
                } else {
                    oDataModel.attachEventOnce("requestCompleted", fnResolve);
                    oDataModel.attachEventOnce("requestFailed", fnReject);
                }

                oDataModel.submitChanges();
            });
        },

        _create: function (oData) {
            var oDataModel = this.base.getModel();

            return new Promise(function (fnResolve, fnReject) {
                oDataModel.create("/SalesOrder", oData, {
                    success: fnResolve,
                    error: fnReject,
                    async: true
                });
            });
        },

        /* =========================================================== */
        /* attachment handling                                         */
        /* =========================================================== */

        _processUploadCollection: function (oUploadSet) {
            var aAttachment = [];

            return new Promise(async function (fnResolve) {
                if (!oUploadSet) {
                    return;
                }

                var oFileUploader = oUploadSet.getDefaultFileUploader(),
                    aFiles;

                if (oUploadSet.getInstantUpload()) {
                    aFiles = oUploadSet.getItems();
                } else {
                    aFiles = oUploadSet.getIncompleteItems();
                }

                if (aFiles.length > 0) {
                    // process files using FileReader
                    var iPending = 0;
                    await new Promise(async function (fnResolve2) {
                        Array.prototype.forEach.call(aFiles, function (oFile, iIndex) {
                            var oFileObject = oFile.getFileObject(),
                                oReader = new FileReader();

                            oReader.onload = function () {
                                var sBase64 = oReader.result.split(",")[1];
                                aAttachment.push({
                                    // support renamed fileName instead origin
                                    "FileName": oFile.getFileName(),
                                    "MediaType": oFileObject.type,
                                    "Data": sBase64
                                });

                                --iPending;
                                if (iPending == 0) {
                                    // All requests are complete, you're done
                                    fnResolve(aAttachment);
                                }
                            };

                            ++iPending;
                            oReader.readAsDataURL(oFileObject);
                        });
                    });
                } else {
                    fnResolve(aAttachment)
                }
            });
        },

        /* =========================================================== */
        /* validation handling                                         */
        /* =========================================================== */

        /**
         * validation of the newly created or changed notification
         *
         * @returns {boolean} entity is valid?
         * @public
         */
        _checkForValidationErrors: function () {
            var bValid = (!this._checkAndMarkEmptyMandatoryFields(true)
                && !this._fieldWithErrorState());

            return bValid;
        },

        /**
         * If flag bErrorsMarked is set to true, the empty mandatory fields are set to value state of error
         * @param {boolean} bErrorsMarked flag if errors are marked
         * @return {boolean} errrors were found?
         * @private
         */
        _checkAndMarkEmptyMandatoryFields: function (bErrorsMarked) {
            var bErrors = false;

            // Check that inputs are not empty or space.
            // This does not happen during data binding because this is only triggered by changes.
            this._getMandatoryFields().forEach(function (oInput) {
                if (oInput && oInput.getValue) {
                    if (!oInput.getValue() || oInput.getValue().trim() === "") {
                        bErrors = true;
                        if (bErrorsMarked) {
                            //console.log("_checkAndMarkEmptyMandatoryFields", input);
                            oInput.setValueState(ValueState.Error);
                        }
                    } else {
                        oInput.setValueState(ValueState.None);
                    }
                } else if (oInput && oInput.getSelectedItem) {
                    if (!oInput.getSelectedItem()
                        || oInput.getSelectedItem().getText().trim() === "") {
                        bErrors = true;
                        if (bErrorsMarked) {
                            oInput.setValueState(ValueState.Error);
                        }
                    } else {
                        oInput.setValueState(ValueState.None);
                    }
                } else if (oInput && oInput.getSelectedButton) {
                    if (!oInput.getSelectedButton()) {
                        bErrors = true;
                        if (bErrorsMarked) {
                            oInput.setValueState(ValueState.Error);
                        }
                    } else {
                        oInput.setValueState(ValueState.None);
                    }
                }
            });

            return bErrors;
        },

        /**
         * Internal helper method to retrieve mandatory fields
         * @return {[object]} array of mandatory fields
         * @private
         */
        _getMandatoryFields: function () {
            var aMandatoryFields = [],
                domElements = document.querySelectorAll("#" + this.base.getView().getId() + " *");

            // retrieve all elements of this view and check ValueState if available
            domElements.forEach(function (domEl) {
                var oControl = Element.closestTo(domEl);

                if (!oControl) {
                    return;
                }

                // add mandatory smartfields
                if (oControl.isA("sap.ui.comp.smartfield.SmartField")
                    && oControl.getEditable()
                    && oControl.getMandatory()) {
                    aMandatoryFields.push(oControl);
                } else if (oControl.data("mandatory")
                    && oControl.data("mandatory") === "true") {
                    // add controls with CustomData data:mandatory="true"
                    aMandatoryFields.push(oControl);
                }
            });

            return aMandatoryFields;
        },

        /**
         * checks fields for error state
         * @return {boolean} fields with error state?
         * @private
         */
        _fieldWithErrorState: function () {
            var bError = false,
                domElements = document.querySelectorAll("#" + this.base.getView().getId() + " *");

            domElements.forEach(function (domEl) {
                var oControl = Element.closestTo(domEl);

                if (oControl
                    && oControl.getValueState
                    && oControl.getValueState() === ValueState.Error) {
                    bError = true;
                }
            });

            return bError;
        }

    });
});
