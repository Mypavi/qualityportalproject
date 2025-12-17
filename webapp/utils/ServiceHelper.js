sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    "use strict";

    return {
        
        authenticateUser: function(sUserId, sPassword, oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                // Always use real service for authentication
                if (!oModel) {
                    reject(new Error("Login service not available"));
                    return;
                }
                
                var sPath = "/ZQM_LOG_PR(bname='" + sUserId + "',password='" + sPassword + "')";
                
                oModel.read(sPath, {
                    success: function(oData) {
                        // Check if authentication was successful
                        if (oData && oData.bname) {
                            resolve(oData);
                        } else {
                            reject(new Error("Invalid credentials"));
                        }
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
                    reject(new Error("Inspection service not available"));
                    return;
                }
                
                oModel.read("/ZQM_INSPECT_PR", {
                    urlParameters: {
                        "$format": "json"
                    },
                    success: function(oData) {
                        // Ensure we have the results array
                        if (oData && oData.results) {
                            resolve(oData);
                        } else if (oData && Array.isArray(oData)) {
                            resolve({ results: oData });
                        } else {
                            resolve({ results: [] });
                        }
                    },
                    error: function(oError) {
                        console.error("Failed to load inspection data:", oError);
                        reject(oError);
                    }
                });
            });
        },

        loadResultRecords: function(oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                if (!oModel) {
                    reject(new Error("Result service not available"));
                    return;
                }
                
                oModel.read("/ZQM_RESULT_PR", {
                    urlParameters: {
                        "$format": "json"
                    },
                    success: function(oData) {
                        // Ensure we have the results array
                        if (oData && oData.results) {
                            resolve(oData);
                        } else if (oData && Array.isArray(oData)) {
                            resolve({ results: oData });
                        } else {
                            resolve({ results: [] });
                        }
                    },
                    error: function(oError) {
                        console.error("Failed to load result data:", oError);
                        reject(oError);
                    }
                });
            });
        },

        loadUsageDecisions: function(oModel) {
            var that = this;
            return new Promise(function(resolve, reject) {
                if (!oModel) {
                    reject(new Error("Usage service not available"));
                    return;
                }
                
                oModel.read("/ZQM_US_PR", {
                    urlParameters: {
                        "$format": "json"
                    },
                    success: function(oData) {
                        // Ensure we have the results array
                        if (oData && oData.results) {
                            resolve(oData);
                        } else if (oData && Array.isArray(oData)) {
                            resolve({ results: oData });
                        } else {
                            resolve({ results: [] });
                        }
                    },
                    error: function(oError) {
                        console.error("Failed to load usage data:", oError);
                        reject(oError);
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

        // Helper method to format date from SAP format
        formatSAPDate: function(sDate) {
            if (!sDate) return "";
            
            try {
                // Handle different date formats from SAP
                if (sDate.indexOf("/Date(") !== -1) {
                    // Extract timestamp from /Date(timestamp)/
                    var timestamp = parseInt(sDate.replace(/\/Date\((\d+)\)\//, "$1"));
                    return new Date(timestamp).toLocaleDateString();
                } else if (sDate.indexOf("T") !== -1) {
                    // ISO format
                    return new Date(sDate).toLocaleDateString();
                } else {
                    return sDate;
                }
            } catch (e) {
                return sDate;
            }
        },

        // Helper method to format numbers
        formatQuantity: function(sQuantity) {
            if (!sQuantity) return "0";
            return parseFloat(sQuantity).toFixed(3);
        }
    };
});