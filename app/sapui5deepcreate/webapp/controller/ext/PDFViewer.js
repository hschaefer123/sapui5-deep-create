sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/PDFViewer",
    "sap/ui/Device",
    "sap/m/library"
], function (ControllerExtension, PDFViewer, Device, library) {
    "use strict";

    /**
     * @class A controller extension offering PDFViewer features as mixin
     *
     * @name udina.sample.sapui5deepcreate.controller.ext.PDFViewer
     * @hideconstructor
     * @public
     * @since 1.2.0
     */
    return ControllerExtension.extend("udina.sample.sapui5deepcreate.controller.ext.PDFViewer", {

        _oPDFViewer: undefined,

        // this section allows to extend lifecycle hooks or override public methods of the base controller
        override: {
            onExit: function () {
                if (this._oPDFViewer) {
                    this._oPDFViewer.destroy();
                    this._oPDFViewer = null;
                }
            }
        },

        onLinkPress: function (oEvent) {
            var oSource = oEvent.getSource(),
                oContext = oSource.getBindingContext();

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

        openFile: function (sFileName, sUrl, sMediaType) {
            if (sMediaType === "application/pdf") {
                this._openPdf(sFileName, sUrl);
            } else if (sMediaType.startsWith("image/")) {
                // TODO: inline image preview using dialog
                this.getURLHelper().redirect(sUrl, true);
            } else {
                // force download
                this.getURLHelper().redirect(sUrl, true);
            }
        },

        _openPdf: function (sTitle, sUrl) {
            var bIOS = (Device.os.ios || Device.os.macintosh && Device.system.tablet),
                iPos = sUrl.lastIndexOf(".");

            if (!bIOS) {
                // open inline using PDF viewer (only desktop supported)
                var oPDFViewer = this.getPDFViewer();
                iPos = sUrl.lastIndexOf("/");

                oPDFViewer.setSource(encodeURI(sUrl));
                oPDFViewer.setTitle((sTitle) ? sTitle : sUrl.substr(iPos + 1));
                oPDFViewer.open();
            } else {
                // force download
                this.getURLHelper().redirect(sUrl, true);
            }
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
        }

    });
});