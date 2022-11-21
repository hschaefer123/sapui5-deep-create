sap.ui.define([
], function (ValueState) {
    "use strict";

    return {

        itemInfo: function (aItems) {
            var aList = [],
                oModel = this.getView().getModel();

            if (aItems && aItems.length > 0) {
                aItems.forEach(function (oItem) {
                    var sContextPath = "/" + oItem;

                    var sInfo = oModel.getProperty(sContextPath + "/RequestedQuantity");
                    sInfo += " x ";
                    sInfo += oModel.getProperty(sContextPath + "/Material");

                    aList.push(sInfo);
                })
            }

            return aList.join(", ");
        },

        fileNameIcon: function (sFileName) {
            var aParts = sFileName.split("."),
                sFileExtension = aParts[aParts.length - 1];

            if (!sFileExtension) {
                return "sap-icon://document";
            }

            switch (sFileExtension.toLowerCase()) {
                case "bmp":
                case "jpg":
                case "jpeg":
                case "png":
                case "svg":
                    return "sap-icon://card";
                case "csv":
                case "xls":
                case "xlsx":
                    return "sap-icon://excel-attachment";
                case "doc":
                case "docx":
                case "odt":
                    return "sap-icon://doc-attachment";
                case "pdf":
                    return "sap-icon://pdf-attachment";
                case "ppt":
                case "pptx":
                    return "sap-icon://ppt-attachment";
                case "txt":
                    return "sap-icon://document-text";
                default:
                    return "sap-icon://document";
            }
        }

    };

});