define("UsrTourOfferSection", ["ServiceHelper", "ProcessModuleUtilities"], function(ServiceHelper, ProcessModuleUtilitie) {
	return {
		entitySchemaName: "UsrTourOffer",
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		messages: {
			"GetTourProcess": {
                "mode": Terrasoft.MessageMode.PTP,
                "direction": Terrasoft.MessageDirectionType.PUBLISH
            },
			"CallTourPageService": {
                "mode": Terrasoft.MessageMode.PTP,
                "direction": Terrasoft.MessageDirectionType.PUBLISH
            },
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "CombinedModeActionButtonsCardLeftContainer",
				"propertyName": "items",
				"name": "TestButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": "BestService",
					"click": {"bindTo": "onGetServiceInfoClick"}
				}
			}
		]/**SCHEMA_DIFF*/,
		methods: {		
			init: function() {
				this.callParent(arguments);
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
			getBusinessProcessAddTours: function() {		
				this.sandbox.publish("GetTourProcess");
			},			
			onGetServiceInfoClick: function() { 
				this.sandbox.publish("CallTourPageService");
			},							
		}
	};
});
