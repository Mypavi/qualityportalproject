sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageToast"
], function (BaseObject, MessageToast) {
    "use strict";

    return BaseObject.extend("qualityportal.utils.ServiceHelper", {
        
        /**
         * Authenticate user with login service
         * @param {string} sUserId - User ID
         * @param {string} sPassword - Password
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - Login model
         * @returns {Promise} Promise that resolves with user data or rejects with error
         */
        authenticateUser: function(sUserId, sPassword, oModel) {
            return new Promise((resolve, reject) => {
                const sPath = `/ZQM_LOG_PR(bname='${sUserId}',password='${sPassword}')`;
                
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

        /**
         * Load inspection lots data
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - Inspection model
         * @returns {Promise} Promise that resolves with inspection data
         */
        loadInspectionLots: function(oModel) {
            return new Promise((resolve, reject) => {
                oModel.read("/ZQM_INSPECT_PR", {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Load result records data
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - Result model
         * @returns {Promise} Promise that resolves with result data
         */
        loadResultRecords: function(oModel) {
            return new Promise((resolve, reject) => {
                oModel.read("/ZQM_RESULT_PR", {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Load usage decision data
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - Usage model
         * @returns {Promise} Promise that resolves with usage data
         */
        loadUsageDecisions: function(oModel) {
            return new Promise((resolve, reject) => {
                oModel.read("/ZQM_US_PR", {
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Get inspection lot by number
         * @param {string} sLotNumber - Inspection lot number
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - Inspection model
         * @returns {Promise} Promise that resolves with specific lot data
         */
        getInspectionLotByNumber: function(sLotNumber, oModel) {
            return new Promise((resolve, reject) => {
                const sPath = `/ZQM_INSPECT_PR('${sLotNumber}')`;
                
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

        /**
         * Format status for display
         * @param {string} sStatus - Status value
         * @returns {string} Formatted status
         */
        formatStatus: function(sStatus) {
            switch (sStatus) {
                case "Decision Made":
                    return "Success";
                case "Pending":
                    return "Warning";
                default:
                    return "None";
            }
        },

        /**
         * Format decision status for display
         * @param {string} sStatus - Decision status value
         * @returns {string} Formatted decision status
         */
        formatDecisionStatus: function(sStatus) {
            switch (sStatus) {
                case "Allowed":
                    return "Success";
                case "Blocked":
                    return "Error";
                default:
                    return "Warning";
            }
        },

        /**
         * Calculate quality metrics from data
         * @param {Array} aInspectionData - Inspection lots data
         * @returns {Object} Quality metrics object
         */
        calculateQualityMetrics: function(aInspectionData) {
            if (!aInspectionData || !Array.isArray(aInspectionData)) {
                return {
                    totalLots: 0,
                    pendingLots: 0,
                    approvedLots: 0,
                    rejectedLots: 0
                };
            }

            const metrics = {
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
        }
    });
});