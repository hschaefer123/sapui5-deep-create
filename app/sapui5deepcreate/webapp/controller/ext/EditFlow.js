sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/base/Log"
], function (ControllerExtension, OverrideExecution, Log) {
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

        onSave: function () {
            this.saveDocument(this.getContext());
        },

        onSavePreProcessed: function () {
            this.saveDocumentPreProcessed(this.getContext());
        },

        onContextCreated: function (oContext) { },

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

            // bind a form against the transient context for the newly created entity
            oView.setBindingContext(this._oContext);

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
        saveDocument: function (oContext) {
            return new Promise(async function (fnResolve, fnReject) {
                try {
                    //await this._checkForValidationErrors();

                    await this.base.editFlow.onBeforeSave({ context: oContext });

                    //this._setEditMode(EditMode.Display, false);
                    //this._getMessageHandler().showMessageDialog();
                    //messageHandler.removeTransitionMessages();

                    await this._submitChanges(oContext);

                    // navigate back to ListReport
                    //this.base.getAppComponent().getRouter().navTo("list");
                    this._navToContext(oContext);

                    fnResolve();
                } catch (oError) {
                    Log.error("saveDocument",
                        JSON.stringify(oError),
                        this.getMetadata().getName()
                    );
                    fnReject(oError);
                }
            }.bind(this));
        },

        saveDocumentPreProcessed: async function (oContext) {
            return new Promise(async function (fnResolve, fnReject) {
                try {
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
                                    "FileName": oFileObject.name,
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
        }

    });
});
