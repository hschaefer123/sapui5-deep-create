sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/PDFViewer",
    "sap/m/LightBox",
    "sap/m/LightBoxItem",
    "sap/ui/Device",
    "sap/m/library"
], function (ControllerExtension, PDFViewer, LightBox, LightBoxItem, Device, library) {
    "use strict";

    /**
     * @class A controller extension offering FileViewer features as mixin
     *
     * @name udina.sample.sapui5deepcreate.controller.ext.FileViewer
     * @hideconstructor
     * @public
     * @since 1.2.0
     */
    return ControllerExtension.extend("udina.sample.sapui5deepcreate.controller.ext.FileViewer", {

        _oPDFViewer: undefined,

        // this section allows to extend lifecycle hooks or override public methods of the base controller
        override: {
            onExit: function () {
                if (this._oImageViewer) {
                    this._oImageViewer.destroy();
                    this._oImageViewer = null;
                }
                if (this._oPDFViewer) {
                    this._oPDFViewer.destroy();
                    this._oPDFViewer = null;
                }
            }
        },

        onBeforeOpenFile: function () {
            // to be overwritten like -> return Promise.reject("Canceld by user");
            return Promise.resolve();
        },

        onAvatarPress: function (oEvent) {
            var oSource = oEvent.getSource(),
                oList = oSource.getList(),
                oItem = (oEvent.getParameter("items")) 
                    ? oEvent.getParameter("items")[0]
                    : oList.getSelectedItem(),
                oContext = oItem.getBindingContext(); 

            this.openFile(
                oContext.getProperty("FileName"),
                oContext.getProperty("Url"),
                oContext.getProperty("MediaType"),
            );

            oEvent.preventDefault();
        },

        onUploadSetItemOpenPressed: function (oEvent) {            
            var oItem = oEvent.getParameter("item");

            this.openFile(
                oItem.getFileName(),
                oItem.getUrl(),
                oItem.getMediaType()
            );

            // prevent UploadSet default open handling
            oEvent.preventDefault();
        },

        getImageViewer: function () {
            if (!this._oImageViewer) {
                this._oImageViewer = new LightBox({
                    imageContent: new LightBoxItem()
                });
                this.base.getView().addDependent(this._oImageViewer);
            }

            return this._oImageViewer;
        },

        getPDFViewer: function () {
            if (!this._oPDFViewer) {
                this._oPDFViewer = new PDFViewer();
                this.base.getView().addDependent(this._oPDFViewer);
            }

            return this._oPDFViewer;
        },

        getURLHelper: function () {
            return library.URLHelper;
        },

        openFile: async function (sFileName, sUrl, sMediaType) {
            await this.base.fileViewer.onBeforeOpenFile({ 
                FileName: sFileName, 
                Url: sUrl, 
                MediaType: sMediaType
            });

            if (sMediaType === "application/pdf") {
                this._openPdf(sFileName, sUrl);
            } else if (sMediaType.startsWith("image/")) {
                this._openImage(sFileName, sUrl);
            } else {
                // force download
                this.getURLHelper().redirect(sUrl, true);
            }
        },

        _openImage: function (sTitle, sUrl) {
            var oImageViewer = this.getImageViewer(),
                oLightBoxItem = oImageViewer.getImageContent()[0];

            oLightBoxItem.setTitle(sTitle);
            oLightBoxItem.setImageSrc(sUrl);
            oImageViewer.open();
        },

        _openPdf: function (sTitle, sUrl) {
            var bIOS = (Device.os.ios || Device.os.macintosh && Device.system.tablet),
                iPos = sUrl.lastIndexOf(".");

            if (!bIOS) {
                // open inline using PDF viewer (only desktop supported)
                var oPDFViewer = this.getPDFViewer();
                iPos = sUrl.lastIndexOf("/");

                //oPDFViewer.setSource(encodeURI(sUrl));
                oPDFViewer.setSource(sUrl);
                oPDFViewer.setTitle((sTitle) ? sTitle : sUrl.substr(iPos + 1));
                oPDFViewer.open();
            } else {
                // force download
                this.getURLHelper().redirect(sUrl, true);
            }
        }

    });
});