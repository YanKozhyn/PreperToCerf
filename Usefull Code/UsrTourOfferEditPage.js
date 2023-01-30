define("UsrTourOfferEditPage", ["ServiceHelper", "ProcessModuleUtilities"], function(ServiceHelper, ProcessModuleUtilities) {
	return {
		entitySchemaName: "UsrTourOffer",
		messages: {
			"AddingTours": {
				"mode": Terrasoft.MessageMode.BROADCAST,
				"direction": Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			"CallTourPageService": {
                "mode": Terrasoft.MessageMode.PTP,
                "direction": Terrasoft.MessageDirectionType.SUBSCRIBE
            },
			"GetTourProcess": {
                "mode": Terrasoft.MessageMode.PTP,
                "direction": Terrasoft.MessageDirectionType.SUBSCRIBE
            },
		},
		attributes: {            
            "responseCollectionTours": {
                "dataValueType": Terrasoft.DataValueType.INTEGER,
                "type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
            },
            "maximumDailyActiveTours": {
                "dataValueType": Terrasoft.DataValueType.INTEGER,
                "type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
            }
		},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"Files": {
				"schemaName": "FileDetailV2",
				"entitySchemaName": "UsrTourOfferFile",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "UsrTourOffer"
				}
			},
			"UsrSchema65c3b34bDetail90c50f84": {
				"schemaName": "UsrTourDetailSchema",
				"entitySchemaName": "UsrTour",
				"filter": {
					"detailColumn": "UsrUsrTourSection",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{
			"UsrOwner": {
				"06f0e681-7091-47e7-96d0-f3b8b5d5a85f": {
					"uId": "06f0e681-7091-47e7-96d0-f3b8b5d5a85f",
					"enabled": true,
					"removed": false,
					"ruleType": 1,
					"baseAttributePatch": "Type",
					"comparisonType": 3,
					"autoClean": false,
					"autocomplete": false,
					"type": 0,
					"value": "60733efc-f36b-1410-a883-16d83cab0980",
					"dataValueType": 10
				}
			}
		}/**SCHEMA_BUSINESS_RULES*/,
		methods: {  
            onEntityInitialized: function(){
                this.callParent(arguments);
                this.getPeriodicityActiveNumber();
                this.getMaximumDailyActiveTours();
            },
            getPeriodicityActiveNumber: function() {
                var periodicityId = "07331224-DBAB-4BF6-8948-E565F055CE74";
                var esqPeriodicity = this.Ext.create("Terrasoft.EntitySchemaQuery", {
                    rootSchemaName: "UsrTourOffer"
                });
                esqPeriodicity.addColumn("UsrName");
                var groupFilters = this.Ext.create("Terrasoft.FilterGroup");
                var filterPerodicityId = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, "UsrPeriodicity.Id", periodicityId);
                var thisId = this.get("Id");
                var filterId = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.NOT_EQUAL, "Id", thisId);
                var filterIsActive = this.Terrasoft.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL, "UsrIsActive", true);
                groupFilters.addItem(filterPerodicityId);
                groupFilters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
                groupFilters.addItem(filterIsActive);
                groupFilters.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
                groupFilters.addItem(filterId);
                esqPeriodicity.filters.add(groupFilters);
                esqPeriodicity.getEntityCollection(function(result) {
                    if (!result.success) {
                        this.showInformationDialog("Request error");
                        return;
                    }
                    else {
                        var lengthCollection = result.collection.collection.length;
                        this.set("responseCollectionTours", lengthCollection);
                    }
                }, this);
            },
            setValidationConfig: function() {
                this.callParent(arguments);
                this.addColumnValidator("UsrPeriodicity", this.periodicityValidator);
            },
            periodicityValidator: function() {
                var invalidMessage= "";
                var periodicityId = this.get("UsrPeriodicity").value;
				var periodicityIdCheck = "07331224-DBAB-4BF6-8948-E565F055CE74";
                if (periodicityId === periodicityIdCheck) {
                    var isActive = this.get("UsrIsActive");
                    var myVariable = this.get("maximumDailyActiveTours");
                    var lengthCollection = this.get("responseCollectionTours");
                    if (lengthCollection >= myVariable && isActive) {
                        invalidMessage = "Допускается не более " + myVariable + " активных ежедневных турпредложений.";
                    }
                }
                else {
                    invalidMessage = "";
                }
                return {
                    invalidMessage: invalidMessage
                };
            },
            getMaximumDailyActiveTours: function() {
                var myVariable;
                var callback = function(value) {
                    myVariable = value;
                };
                this.Terrasoft.SysSettings.querySysSettingsItem("TourNumber", callback, this);
                if (myVariable === undefined) {
                    return;
                }
                else {
                    this.set("maximumDailyActiveTours", myVariable);
                }			
			},
			init: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("AddingTours", this.updateTours, this);
				this.sandbox.subscribe("GetTourProcess",  this.getBusinessProcessAddTours, this);
				this.sandbox.subscribe("CallTourPageService", this.onGetServiceInfoClick, this); 
			},			
			getActions: function() {
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.AddToursActionCaption"},
					"Click": {bindTo: "getBusinessProcessAddTours"},
					"Enabled": true
				}));
				return actionMenuItems;
			},
			updateTours: function() {
				this.updateDetail({
					"detail": "UsrSchema65c3b34bDetail90c50f84",
					"reloadAll": true
				});
			},
			getBusinessProcessAddTours: function() {		
				var id = this.get("Id");
				var periodicity = this.get("UsrPeriodicity").displayValue;
				var manager = this.get("UsrOwner").value;
				if (!periodicity) {
					return;
				}
				var args = {
					sysProcessName: "UsrAddToursProcess",
					parameters: {
						ProcessSchemaId: id,
						ProcessSchemaPeriodicity: periodicity,
						ProcessSchemaManager: manager
					}
				};
				ProcessModuleUtilities.executeProcess(args);
			},
			onGetServiceInfoClick: function() { 
				var code = this.get("UsrCode");
				var serviceData = {
					code: code
				};
				ServiceHelper.callService("UsrTourService", "GetToursQuantity",
					function(response) {
						var result = response.GetToursQuantityResult;
						this.showInformationDialog("Цена за все туры: " + result);
					}, serviceData, this);
			}		
		},
			
			
			
			
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "ActionButtonsContainer",
				"propertyName": "items",
				"name": "GetServiceInfoButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "Resources.Strings.GetServiceInfoButtonCaption"},
					"click": {"bindTo": "onGetServiceInfoClick"},
					"enabled": true,
					"layout": {"column": 1, "row": 6, "colSpan": 2, "rowSpan": 1}
				}
			},
			{
				"operation": "insert",
				"name": "UsrName",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrName"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrCode",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrCode",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "UsrPeriodicity",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrPeriodicity",
					"enabled": true,
					"contentType": 3
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "UsrOwner",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 3,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrOwner",
					"enabled": true,
					"contentType": 5
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 3
			},
			{
				"operation": "insert",
				"name": "UsrIsActive",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 4,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrIsActive",
					"enabled": true
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 4
			},
			{
				"operation": "insert",
				"name": "UsrComment",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrComment"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "TabLabelTour",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.TabLabelTourTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrSchema65c3b34bDetail90c50f84",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "TabLabelTour",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 1
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Files",
				"values": {
					"itemType": 2
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"values": {
					"itemType": 15,
					"caption": {
						"bindTo": "Resources.Strings.NotesGroupCaption"
					},
					"items": []
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"bindTo": "UsrNotes",
					"dataValueType": 1,
					"contentType": 4,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"labelConfig": {
						"visible": false
					},
					"controlConfig": {
						"imageLoaded": {
							"bindTo": "insertImagesToNotes"
						},
						"images": {
							"bindTo": "NotesImagesCollection"
						}
					}
				},
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 2
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
