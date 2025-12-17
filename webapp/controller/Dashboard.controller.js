sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "qualityportal/utils/ServiceHelper"
], (Controller, MessageToast, JSONModel, Filter, FilterOperator, ServiceHelper) => {
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
            
            ServiceHelper.loadInspectionLots(oInspectionModel)
                .then((oData) => {
                    const oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "inspection");
                    
                    // Calculate and display metrics
                    const oMetrics = ServiceHelper.calculateQualityMetrics(oData.results);
                    const oMetricsModel = new JSONModel(oMetrics);
                    this.getView().setModel(oMetricsModel, "metrics");
                    
                    MessageToast.show(`Loaded ${oData.results ? oData.results.length : 0} inspection lots`);
                })
                .catch((oError) => {
                    MessageToast.show("Failed to load inspection data. Please check your connection.");
                    console.error("Inspection data error:", oError);
                    
                    // Set empty model to prevent binding errors
                    const oEmptyModel = new JSONModel({ results: [] });
                    this.getView().setModel(oEmptyModel, "inspection");
                    
                    const oEmptyMetrics = new JSONModel({
                        totalLots: 0,
                        pendingLots: 0,
                        approvedLots: 0,
                        rejectedLots: 0
                    });
                    this.getView().setModel(oEmptyMetrics, "metrics");
                });
        },

        _loadResultData() {
            const oResultModel = this.getOwnerComponent().getModel("result");
            
            ServiceHelper.loadResultRecords(oResultModel)
                .then((oData) => {
                    const oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "result");
                    MessageToast.show(`Loaded ${oData.results ? oData.results.length : 0} result records`);
                })
                .catch((oError) => {
                    MessageToast.show("Failed to load result data. Please check your connection.");
                    console.error("Result data error:", oError);
                    
                    // Set empty model to prevent binding errors
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
                    MessageToast.show(`Loaded ${oData.results ? oData.results.length : 0} usage decisions`);
                })
                .catch((oError) => {
                    MessageToast.show("Failed to load usage data. Please check your connection.");
                    console.error("Usage data error:", oError);
                    
                    // Set empty model to prevent binding errors
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

        getRouter() {
            return this.getOwnerComponent().getRouter();
        }
    });
});