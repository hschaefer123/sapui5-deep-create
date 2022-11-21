sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/Device"
],
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, BindingMode, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode(BindingMode.OneWay);
                return oModel;
            },

            createUiModel: function (sEditMode) {
                var oModel = new JSONModel({
                    editMode: sEditMode,
                    isEditable: false,
                    busy: true,
                    delay: 0
                });
                oModel.setDefaultBindingMode(BindingMode.OneWay);
                return oModel;
            }
        };
    }
);