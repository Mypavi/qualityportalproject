sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "qualityportal/utils/ServiceHelper"
], (Controller, MessageToast, BusyDialog, JSONModel, Filter, FilterOperator, ServiceHelper) => {
    "use strict";

    return Controller.extend("qualityportal.controller.Dashboard", {
        onInit() {
            // Check if user is logged in
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("dashboard").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched() {
            const oUserModel = this.getOwnerComponent().getModel("user");
            if (!oUserModel || !oUserModel.getProperty("/isLoggedIn")) {
                // Redirect to login if not authenticated
                this.getRouter().navTo("login");
                return;
            }

            // Load all data
            this._loadInspectionData();
            this._loadResultData();
            this._loadUsageData();
        },

        _loadInspectionData() {
            const oInspectionModel = this.getOwnerComponent().getModel("inspection");
            
            // Show loading indicator
            this._showLoadingIndicator("Loading inspection data...");
            
            ServiceHelper.loadInspectionLots(oInspectionModel)
                .then((oData) => {
                    const oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "inspection");
                    
                    // Calculate and display metrics
                    const oMetrics = ServiceHelper.calculateQualityMetrics(oData.results);
                    const oMetricsModel = new JSONModel(oMetrics);
                    this.getView().setModel(oMetricsModel, "metrics");
                    
                    MessageToast.show(`Successfully loaded ${oData.results ? oData.results.length : 0} inspection lots`);
                    this._hideLoadingIndicator();
                })
                .catch((oError) => {
                    console.error("Inspection data error:", oError);
                    this._hideLoadingIndicator();
                    
                    // ServiceHelper now provides fallback data, so this should not fail
                    // But we still handle it gracefully
                    const oEmptyModel = new JSONModel({ results: [] });
                    this.getView().setModel(oEmptyModel, "inspection");
                    
                    const oEmptyMetrics = new JSONModel({
                        totalLots: 0,
                        pendingLots: 0,
                        approvedLots: 0,
                        rejectedLots: 0
                    });
                    this.getView().setModel(oEmptyMetrics, "metrics");
                    
                    MessageToast.show("Using sample data. Please check SAP connection for live data.");
                });
        },

        _loadResultData() {
            const oResultModel = this.getOwnerComponent().getModel("result");
            
            ServiceHelper.loadResultRecords(oResultModel)
                .then((oData) => {
                    const oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "result");
                    console.log("Result data loaded:", oData.results ? oData.results.length : 0, "records");
                })
                .catch((oError) => {
                    console.error("Result data error:", oError);
                    
                    // ServiceHelper now provides fallback data
                    const oEmptyModel = new JSONModel({ results: [] });
                    this.getView().setModel(oEmptyModel, "result");
                });
        },

        _loadUsageData() {
            const oUsageModel = this.getOwnerComponent().getModel("usage");
            
            ServiceHelper.loadUsageDecisions(oUsageModel)
                .then((oData) => {
                    const oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "usage");
                    console.log("Usage data loaded:", oData.results ? oData.results.length : 0, "records");
                })
                .catch((oError) => {
                    console.error("Usage data error:", oError);
                    
                    // ServiceHelper now provides fallback data
                    const oEmptyModel = new JSONModel({ results: [] });
                    this.getView().setModel(oEmptyModel, "usage");
                });
        },

        onRefreshInspection() {
            this._loadInspectionData();
        },

        onRefreshResults() {
            this._loadResultData();
        },

        onRefreshUsage() {
            this._loadUsageData();
        },

        onInspectionSelect(oEvent) {
            const oSelectedItem = oEvent.getParameter("listItem");
            const oContext = oSelectedItem.getBindingContext("inspection");
            const sLotNumber = oContext.getProperty("InspectionLotNumber");
            
            MessageToast.show(`Selected Inspection Lot: ${sLotNumber}`);
        },

        onInspectionItemPress(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("inspection");
            const oData = oContext.getObject();
            
            // Show detailed information
            this._showInspectionDetails(oData);
        },

        _showInspectionDetails(oData) {
            if (!this._oInspectionDialog) {
                this._oInspectionDialog = sap.ui.xmlfragment(
                    "qualityportal.fragment.InspectionDetails",
                    this
                );
                this.getView().addDependent(this._oInspectionDialog);
            }
            
            // Set the data to the dialog
            const oModel = new JSONModel(oData);
            this._oInspectionDialog.setModel(oModel);
            
            this._oInspectionDialog.open();
        },

        onCloseDialog() {
            if (this._oInspectionDialog) {
                this._oInspectionDialog.close();
            }
        },

        onViewResults() {
            const oModel = this._oInspectionDialog.getModel();
            const sLotNumber = oModel.getProperty("/InspectionLotNumber");
            
            // Switch to Result Records tab and filter by lot number
            const oIconTabBar = this.byId("iconTabBar");
            oIconTabBar.setSelectedKey("resultRecords");
            
            // Filter result table
            this._filterResultsByLotNumber(sLotNumber);
            
            this.onCloseDialog();
        },

        onViewUsageDecision() {
            const oModel = this._oInspectionDialog.getModel();
            const sLotNumber = oModel.getProperty("/InspectionLotNumber");
            
            // Switch to Usage Decision tab and filter by lot number
            const oIconTabBar = this.byId("iconTabBar");
            oIconTabBar.setSelectedKey("usageDecision");
            
            // Filter usage table
            this._filterUsageByLotNumber(sLotNumber);
            
            this.onCloseDialog();
        },

        _filterResultsByLotNumber(sLotNumber) {
            const oResultTable = this.byId("resultTable");
            const oBinding = oResultTable.getBinding("items");
            
            if (oBinding) {
                const oFilter = new Filter("InspectionLotNumber", FilterOperator.EQ, sLotNumber);
                oBinding.filter([oFilter]);
            }
        },

        _filterUsageByLotNumber(sLotNumber) {
            const oUsageTable = this.byId("usageTable");
            const oBinding = oUsageTable.getBinding("items");
            
            if (oBinding) {
                const oFilter = new Filter("InspectionLotNumber", FilterOperator.EQ, sLotNumber);
                oBinding.filter([oFilter]);
            }
        },

        isDecisionMade(sStatus) {
            return sStatus === "Decision Made";
        },

        formatStatus(sStatus) {
            switch (sStatus) {
                case "Decision Made":
                    return "Success";
                case "Pending":
                    return "Warning";
                default:
                    return "None";
            }
        },

        formatRecordingStatus(sStatus) {
            switch (sStatus) {
                case "View Only":
                    return "Information";
                default:
                    return "None";
            }
        },

        formatDecisionStatus(sStatus) {
            switch (sStatus) {
                case "Allowed":
                    return "Success";
                case "Blocked":
                    return "Error";
                default:
                    return "Warning";
            }
        },

        formatDecisionCode(sCode) {
            switch (sCode) {
                case "A":
                    return "Success";
                case "R":
                case "R2":
                    return "Error";
                default:
                    return "None";
            }
        },

        getCategoryIcon(sCategory) {
            switch (sCategory) {
                case "Unrestricted Stock":
                    return "sap-icon://accept";
                case "Block Stock":
                    return "sap-icon://decline";
                case "Production Stock":
                    return "sap-icon://factory";
                default:
                    return "sap-icon://question-mark";
            }
        },

        getCategoryColor(sCategory) {
            switch (sCategory) {
                case "Unrestricted Stock":
                    return "#107e3e";
                case "Block Stock":
                    return "#bb0000";
                case "Production Stock":
                    return "#0070f3";
                default:
                    return "#666";
            }
        },

        getStatusIcon(sStatus) {
            switch (sStatus) {
                case "Allowed":
                    return "sap-icon://accept";
                case "Blocked":
                    return "sap-icon://decline";
                default:
                    return "sap-icon://pending";
            }
        },

        getStatusColor(sStatus) {
            switch (sStatus) {
                case "Allowed":
                    return "#107e3e";
                case "Blocked":
                    return "#bb0000";
                default:
                    return "#e9730c";
            }
        },

        onLogout() {
            // Clear user session
            this.getOwnerComponent().setModel(null, "user");
            
            // Navigate to login
            this.getRouter().navTo("login");
            MessageToast.show("Logged out successfully");
        },

        // New formatter functions for enhanced UI
        formatUsageDecisionText(sCode) {
            switch (sCode) {
                case "A":
                    return "Approved";
                case "R":
                    return "Rejected";
                case "R2":
                    return "Rework";
                case "":
                case null:
                case undefined:
                    return "Pending";
                default:
                    return sCode || "Pending";
            }
        },

        getDecisionIcon(sCode) {
            switch (sCode) {
                case "A":
                    return "sap-icon://accept";
                case "R":
                case "R2":
                    return "sap-icon://decline";
                default:
                    return "sap-icon://pending";
            }
        },

        getDecisionIconColor(sCode) {
            switch (sCode) {
                case "A":
                    return "Accent6"; // Green
                case "R":
                case "R2":
                    return "Accent2"; // Red
                default:
                    return "Accent3"; // Orange
            }
        },

        calculateInspectionProgress(oLot) {
            if (!oLot) return 0;
            
            const actualQty = parseFloat(oLot.ActualQuantity) || 0;
            const inspectedQty = parseFloat(oLot.InspectedQuantity) || 0;
            
            if (actualQty === 0) return 0;
            
            const progress = (inspectedQty / actualQty) * 100;
            return Math.min(progress, 100);
        },

        getProgressText(oLot) {
            if (!oLot) return "0%";
            
            const actualQty = parseFloat(oLot.ActualQuantity) || 0;
            const inspectedQty = parseFloat(oLot.InspectedQuantity) || 0;
            
            if (actualQty === 0) return "0%";
            
            const progress = (inspectedQty / actualQty) * 100;
            return Math.min(progress, 100).toFixed(1) + "%";
        },

        getProgressState(sStatus) {
            switch (sStatus) {
                case "Decision Made":
                    return "Success";
                case "Pending":
                    return "Warning";
                default:
                    return "Information";
            }
        },

        calculatePendingPercentage(iPendingLots) {
            const oMetrics = this.getView().getModel("metrics");
            if (!oMetrics) return 0;
            
            const iTotalLots = oMetrics.getProperty("/totalLots") || 1;
            return (iPendingLots / iTotalLots) * 100;
        },

        calculateApprovedPercentage(iApprovedLots) {
            const oMetrics = this.getView().getModel("metrics");
            if (!oMetrics) return 0;
            
            const iTotalLots = oMetrics.getProperty("/totalLots") || 1;
            return (iApprovedLots / iTotalLots) * 100;
        },

        calculateRejectedPercentage(iRejectedLots) {
            const oMetrics = this.getView().getModel("metrics");
            if (!oMetrics) return 0;
            
            const iTotalLots = oMetrics.getProperty("/totalLots") || 1;
            return (iRejectedLots / iTotalLots) * 100;
        },

        getUsageStatusColor(sStatus) {
            switch (sStatus) {
                case "Allowed":
                    return "Accent6"; // Green
                case "Blocked":
                    return "Accent2"; // Red
                default:
                    return "Accent3"; // Orange
            }
        },

        getRouter() {
            return this.getOwnerComponent().getRouter();
        },

        _showLoadingIndicator(sMessage) {
            if (!this._oLoadingDialog) {
                this._oLoadingDialog = new BusyDialog({
                    text: sMessage || "Loading data..."
                });
            } else {
                this._oLoadingDialog.setText(sMessage || "Loading data...");
            }
            this._oLoadingDialog.open();
        },

        _hideLoadingIndicator() {
            if (this._oLoadingDialog) {
                this._oLoadingDialog.close();
            }
        }
    });
});