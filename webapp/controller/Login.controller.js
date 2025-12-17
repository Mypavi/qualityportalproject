sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "qualityportal/utils/ServiceHelper"
], (Controller, MessageToast, JSONModel, ServiceHelper) => {
    "use strict";

    return Controller.extend("qualityportal.controller.Login", {
        onInit() {
            // Initialize login model
            const oLoginModel = new JSONModel({
                bname: "",
                password: ""
            });
            this.getView().setModel(oLoginModel);
        },

        onLogin() {
            const oView = this.getView();
            const oModel = oView.getModel();
            const oLoginModel = this.getOwnerComponent().getModel("login");
            const oMessageStrip = this.byId("messageStrip");
            
            const sUserId = oModel.getProperty("/bname");
            const sPassword = oModel.getProperty("/password");

            // Validate input
            if (!sUserId || !sPassword) {
                this._showMessage("Please enter both User ID and Password", "Error");
                return;
            }

            // Show loading
            const oButton = this.byId("loginButton");
            oButton.setEnabled(false);
            oButton.setText("Logging in...");

            // Call login service using ServiceHelper
            ServiceHelper.authenticateUser(sUserId, sPassword, oLoginModel)
                .then((oData) => {
                    // Login successful
                    MessageToast.show("Login successful!");
                    
                    // Store user session
                    const oUserModel = new JSONModel({
                        bname: oData.bname,
                        isLoggedIn: true
                    });
                    this.getOwnerComponent().setModel(oUserModel, "user");
                    
                    // Navigate to dashboard
                    this.getRouter().navTo("dashboard");
                })
                .catch((oError) => {
                    // Login failed
                    this._showMessage("Invalid credentials. Please try again.", "Error");
                    console.error("Login error:", oError);
                })
                .finally(() => {
                    // Reset button
                    oButton.setEnabled(true);
                    oButton.setText("Login");
                });
        },

        _showMessage(sMessage, sType) {
            const oMessageStrip = this.byId("messageStrip");
            oMessageStrip.setText(sMessage);
            oMessageStrip.setType(sType);
            oMessageStrip.setVisible(true);
            
            // Hide message after 5 seconds
            setTimeout(() => {
                oMessageStrip.setVisible(false);
            }, 5000);
        },

        getRouter() {
            return this.getOwnerComponent().getRouter();
        }
    });
});