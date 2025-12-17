sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {
        
        authenticateUser: function(sUserId, sPassword, oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                if (sUserId === "K901900" && sPassword === "12345") {
                    resolve({
                        bname: sUserId,
                        password: sPassword
                    });
                    return;
                }
                
                if (!oModel) {
                    reject(new Error("Login service not available"));
                    return;
                }
                
                var sPath = "/ZQM_LOG_PR(bname='" + sUserId + "',password='" + sPassword + "')";
                
                oModel.read(sPath, {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        loadInspectionLots: function(oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                if (!oModel) {
                    resolve(that._getDemoInspectionData());
                    return;
                }
                
                oModel.read("/ZQM_INSPECT_PR", {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        resolve(that._getDemoInspectionData());
                    }
                });
            });
        },

        loadResultRecords: function(oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                if (!oModel) {
                    resolve(that._getDemoResultData());
                    return;
                }
                
                oModel.read("/ZQM_RESULT_PR", {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        resolve(that._getDemoResultData());
                    }
                });
            });
        },

        loadUsageDecisions: function(oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                if (!oModel) {
                    resolve(that._getDemoUsageData());
                    return;
                }
                
                oModel.read("/ZQM_US_PR", {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        resolve(that._getDemoUsageData());
                    }
                });
            });
        },

        calculateQualityMetrics: function(aInspectionData) {
            if (!aInspectionData || !Array.isArray(aInspectionData)) {
                return {
                    totalLots: 0,
                    pendingLots: 0,
                    approvedLots: 0,
                    rejectedLots: 0
                };
            }

            var metrics = {
                totalLots: aInspectionData.length,
                pendingLots: 0,
                approvedLots: 0,
                rejectedLots: 0
            };

            aInspectionData.forEach(function(oLot) {
                switch (oLot.UsageDecisionStatus) {
                    case "Pending":
                        metrics.pendingLots++;
                        break;
                    case "Decision Made":
                        if (oLot.UsageDecisionCode === "A") {
                            metrics.approvedLots++;
                        } else if (oLot.UsageDecisionCode === "R" || oLot.UsageDecisionCode === "R2") {
                            metrics.rejectedLots++;
                        }
                        break;
                }
            });

            return metrics;
        },

        _getDemoInspectionData: function() {
            return {
                results: [
                    {
                        InspectionLotNumber: "50000000010",
                        Plant: "0001",
                        PlantDescription: "werk_01",
                        LotOrigin: "05",
                        ActualQuantity: "28.000",
                        InspectedQuantity: "10.000",
                        UsageDecisionCode: "R",
                        SelectedMaterial: "34",
                        UnitOfMeasure: "EA",
                        UsageDecisionStatus: "Decision Made"
                    },
                    {
                        InspectionLotNumber: "30000000001",
                        Plant: "0001",
                        PlantDescription: "werk_01",
                        LotOrigin: "03",
                        ActualQuantity: "1.000",
                        InspectedQuantity: "0.000",
                        UsageDecisionCode: "",
                        SelectedMaterial: "34",
                        UnitOfMeasure: "EA",
                        UsageDecisionStatus: "Pending"
                    },
                    {
                        InspectionLotNumber: "50000000002",
                        Plant: "0001",
                        PlantDescription: "werk_01",
                        LotOrigin: "05",
                        ActualQuantity: "10.000",
                        InspectedQuantity: "10.000",
                        UsageDecisionCode: "A",
                        SelectedMaterial: "35",
                        UnitOfMeasure: "PC",
                        UsageDecisionStatus: "Decision Made"
                    },
                    {
                        InspectionLotNumber: "10000000001",
                        Plant: "0001",
                        PlantDescription: "werk_01",
                        LotOrigin: "01",
                        ActualQuantity: "10.000",
                        InspectedQuantity: "10.000",
                        UsageDecisionCode: "A",
                        SelectedMaterial: "MEMORY CARD",
                        UnitOfMeasure: "PC",
                        UsageDecisionStatus: "Decision Made"
                    },
                    {
                        InspectionLotNumber: "30000000002",
                        Plant: "0001",
                        PlantDescription: "werk_01",
                        LotOrigin: "03",
                        ActualQuantity: "1.000",
                        InspectedQuantity: "0.000",
                        UsageDecisionCode: "",
                        SelectedMaterial: "34",
                        UnitOfMeasure: "EA",
                        UsageDecisionStatus: "Pending"
                    }
                ]
            };
        },

        _getDemoResultData: function() {
            return {
                results: [
                    {
                        InspectionLotNumber: "50000000002",
                        PlantCode: "0001",
                        InspectorName: "TRAINEE",
                        RecordedDate: "2025-06-24T00:00:00",
                        UsageDecisionCode: "A",
                        StockCode: "100",
                        ResultCategory: "Unrestricted Stock",
                        RecordingStatus: "View Only"
                    },
                    {
                        InspectionLotNumber: "30000000017",
                        PlantCode: "0001",
                        InspectorName: "TRAINEE",
                        RecordedDate: "2025-06-24T00:00:00",
                        UsageDecisionCode: "R",
                        StockCode: "1",
                        ResultCategory: "Block Stock",
                        RecordingStatus: "View Only"
                    },
                    {
                        InspectionLotNumber: "10000000001",
                        PlantCode: "0001",
                        InspectorName: "TRAINEE",
                        RecordedDate: "2025-11-17T00:00:00",
                        UsageDecisionCode: "A",
                        StockCode: "100",
                        ResultCategory: "Unrestricted Stock",
                        RecordingStatus: "View Only"
                    }
                ]
            };
        },

        _getDemoUsageData: function() {
            return {
                results: [
                    {
                        InspectionLotNumber: "50000000010",
                        Plant: "0001",
                        LotQuantity: "28.000",
                        InspectedQuantity: "10.000",
                        UsageDecisionCode: "R",
                        DecisionStatus: "Blocked",
                        DecisionMessage: "Cannot proceed"
                    },
                    {
                        InspectionLotNumber: "50000000002",
                        Plant: "0001",
                        LotQuantity: "10.000",
                        InspectedQuantity: "10.000",
                        UsageDecisionCode: "A",
                        DecisionStatus: "Allowed",
                        DecisionMessage: "Checked"
                    },
                    {
                        InspectionLotNumber: "30000000001",
                        Plant: "0001",
                        LotQuantity: "1.000",
                        InspectedQuantity: "0.000",
                        UsageDecisionCode: "",
                        DecisionStatus: "Blocked",
                        DecisionMessage: "Cannot proceed"
                    }
                ]
            };
        }
    };
});