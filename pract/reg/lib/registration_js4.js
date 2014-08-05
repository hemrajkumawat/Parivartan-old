var base_url='http://www.emailmeform.com/builder/';var site_url='http://www.emailmeform.com/builder';
var g_emf_session_id="l50p8ahfjpdq2noukhltubf323";
/* 
 * Inline Form Validation Engine 1.6.3, jQuery plugin
 * 
 * Copyright(c) 2009, Cedric Dugas
 * http://www.position-relative.net
 *	
 * Form validation engine allowing custom regex rules to be added.
 * Thanks to Francois Duquette
 * Licenced under the MIT Licence
 * swift rui modified
 */
 
(function($) {
	
	$.fn.validationEngine = function(settings) {

	if($.validationEngineLanguage){				// IS THERE A LANGUAGE LOCALISATION ?
		allRules = $.validationEngineLanguage.allRules;
	}else{
		$.validationEngine.debug("Validation engine rules are not loaded check your external file");
	}
 	settings = jQuery.extend({
		allrules:allRules,
		validationEventTriggers:"focusout",					
		inlineValidation: true,	
		returnIsValid:false,
		liveEvent:false,
		unbindEngine:true,
		ajaxSubmit: false,
		scroll:true,
		promptPosition: "topRight",	// OPENNING BOX POSITION, IMPLEMENTED: topLeft, topRight, bottomLeft, centerRight, bottomRight
		success : false,
		beforeSuccess :  function() {},
		failure : function() {}
	}, settings);	
	$.validationEngine.settings = settings;
	if(typeof($.validationEngine.ajaxValidArray)=="undefined")
		$.validationEngine.ajaxValidArray = new Array();	// ARRAY FOR AJAX: VALIDATION MEMORY 
	
	if(settings.inlineValidation == true){ 		// Validating Inline ?
		if(!settings.returnIsValid){					// NEEDED FOR THE SETTING returnIsValid
			allowReturnIsvalid = false;
			if(settings.liveEvent){						// LIVE event, vast performance improvement over BIND
				$(this).find("[class*=validate][type!=checkbox]").live(settings.validationEventTriggers, function(caller){ _inlinEvent(this);})
				$(this).find("[class*=validate][type=checkbox]").live("click", function(caller){ _inlinEvent(this); })
			}else{
				$(this).find("[class*=validate]").not("[type=checkbox]").bind(settings.validationEventTriggers, function(caller){ _inlinEvent(this); })
				$(this).find("[class*=validate][type=checkbox]").bind("click", function(caller){ _inlinEvent(this); })
			}
			firstvalid = false;
		}
			function _inlinEvent(caller){
				$.validationEngine.settings = settings;
				if($.validationEngine.intercept == false || !$.validationEngine.intercept){		// STOP INLINE VALIDATION THIS TIME ONLY
					$.validationEngine.onSubmitValid=false;
					$.validationEngine.loadValidation(caller); 
				}else{
					$.validationEngine.intercept = false;
				}
			}
	}
	if (settings.returnIsValid){		// Do validation and return true or false, it bypass everything;
		if ($.validationEngine.submitValidation(this,settings)){
			return false;
		}else{
			return true;
		}
	}
	$(this).bind("submit", function(caller){   // ON FORM SUBMIT, CONTROL AJAX FUNCTION IF SPECIFIED ON DOCUMENT READY
		$.validationEngine.onSubmitValid = true;
		$.validationEngine.settings = settings;
		if($.validationEngine.submitValidation(this,settings) == false){
			if($.validationEngine.submitForm(this,settings) == true) {return false;}
		}else{
			settings.failure && settings.failure(); 
			return false;
		}		
	})
};	
$.validationEngine = {
	defaultSetting : function(caller) {		// NOT GENERALLY USED, NEEDED FOR THE API, DO NOT TOUCH
		if($.validationEngineLanguage){				
			allRules = $.validationEngineLanguage.allRules;
		}else{
			$.validationEngine.debug("Validation engine rules are not loaded check your external file");
		}	
		settings = {
			allrules:allRules,
			validationEventTriggers:"blur",					
			inlineValidation: true,	
			returnIsValid:false,
			scroll:true,
			unbindEngine:true,
			ajaxSubmit: false,
			promptPosition: "topRight",	// OPENNING BOX POSITION, IMPLEMENTED: topLeft, topRight, bottomLeft, centerRight, bottomRight
			success : false,
			failure : function() {}
		}	
		$.validationEngine.settings = settings;
	},
	loadValidation : function(caller) {		// GET VALIDATIONS TO BE EXECUTED
		if(!$.validationEngine.settings){
			$.validationEngine.defaultSetting()
		}
		rulesParsing = $(caller).attr('class');
		rulesRegExp = /\[(.*)\]/;
		getRules = rulesRegExp.exec(rulesParsing);
		str = getRules[1];
		pattern = /\[|,|\]/;
		result= str.split(pattern);	
		var validateCalll = $.validationEngine.validateCall(caller,result)
		return validateCalll;
	},
	validateCall : function(caller,rules) {	// EXECUTE VALIDATION REQUIRED BY THE USER FOR THIS FIELD
		var promptText =""	
		
		if(!$(caller).attr("id")) { $.validationEngine.debug("This field have no ID attribut( name & class displayed): "+$(caller).attr("name")+" "+$(caller).attr("class")) }

		caller = caller;
		ajaxValidate = false;
		var callerName = $(caller).attr("name");
		$.validationEngine.isError = false;
		$.validationEngine.showTriangle = true;
		
		callerType = get_property(caller, "type");

		for (i=0; i<rules.length;i++){
			switch (rules[i]){
			case "optional": 
				if(!$(caller).val()){
					$.validationEngine.closePrompt(caller);
					return $.validationEngine.isError;
				}
			break;
			case "required": 
				_required(caller,rules);
			break;
			case "custom": 
				 _customRegex(caller,rules,i);
			break;
			case "exemptString": 
				 _exemptString(caller,rules,i);
			break;
			case "ajax": 
				if(!$.validationEngine.onSubmitValid){
					_ajax(caller,rules,i);	
				};
			break;
			case "length": 
				 _length(caller,rules,i);
			break;
			case "lengthWord": 
				 _lengthWord(caller,rules,i);
			break;
			case "lengthValue": 
				 _lengthValue(caller,rules,i);
			break;
			case "maxCheckbox": 
				_maxCheckbox(caller,rules,i);
			 	groupname = $(caller).attr("name");
			 	caller = $("input[name='"+groupname+"']");
			break;
			case "minCheckbox": 
				_minCheckbox(caller,rules,i);
				groupname = $(caller).attr("name");
				caller = $("input[name='"+groupname+"']");
			break;
			case "minSelect": 
				_minSelect(caller,rules,i);
			break;
			case "confirm": 
				_confirm(caller,rules,i);
			break;
			case "funcCall": 
				_funcCall(caller,rules,i);
			break;
			default :;
			};
		};
		radioHack();
		if ($.validationEngine.isError == true){
			linkTofield = $.validationEngine.linkTofield(caller);
			
			($("div."+linkTofield).size() ==0) ? $.validationEngine.buildPrompt(caller,promptText,"error")	: $.validationEngine.updatePromptText(caller,promptText);
			//re-update form error position
			$.validationEngine.updatePromptText(caller,promptText);
		}else{ $.validationEngine.closePrompt(caller);}			
		/* UNFORTUNATE RADIO AND CHECKBOX GROUP HACKS */
		/* As my validation is looping input with id's we need a hack for my validation to understand to group these inputs */
		function radioHack(){
	      if($("input[name='"+callerName+"']").size()> 1 && (callerType == "radio" || callerType == "checkbox")) {        // Hack for radio/checkbox group button, the validation go the first radio/checkbox of the group
	          caller = $("input[name='"+callerName+"'][type!=hidden]:first");
	          /*to show triangle for radio and checkbox,modify by swift
	          $.validationEngine.showTriangle = false;
	          */
	          $.validationEngine.showTriangle = true;
	      }      
	    }
		/* VALIDATION FUNCTIONS */
		function _required(caller,rules){   // VALIDATE BLANK FIELD
			callerType = get_property(caller, "type");
			if (callerType == "text" || callerType == "password" || callerType == "textarea" || callerType == "file"){
								
				if(!$(caller).val()){
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}	
			}	
			if (callerType == "radio" || callerType == "checkbox" ){
				callerName = $(caller).attr("name");
		
				if($("input[name='"+callerName+"']:checked").size() == 0) {
					$.validationEngine.isError = true;
					if($("input[name='"+callerName+"']").size() ==1) {
						promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxe+"<br />"; 
					}else{
						 promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxMultiple+"<br />";
					}	
				}
			}
			if (callerType == "select-one") { // added by paul@kinetek.net for select boxes, Thank you		
				if(!$(caller).val()) {
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}
			}
			if (callerType == "select-multiple") { // added by paul@kinetek.net for select boxes, Thank you	
				if(!$(caller).find("option:selected").val()) {
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}
			}
		}
		function _customRegex(caller,rules,position){		 // VALIDATE REGEX RULES
			customRule = rules[position+1];
			pattern = eval($.validationEngine.settings.allrules[customRule].regex);
			
			if(!pattern.test($(caller).attr('value'))){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules[customRule].alertText+"<br />";
			}
		}
		function _exemptString(caller,rules,position){		 // VALIDATE REGEX RULES
			customString = rules[position+1];
			if(customString == $(caller).attr('value')){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules['required'].alertText+"<br />";
			}
		}
		function _funcCall(caller,rules,position){  		// VALIDATE CUSTOM FUNCTIONS OUTSIDE OF THE ENGINE SCOPE
			customRule = rules[position+1];
			params = rules.slice(position+2);
			funce = $.validationEngine.settings.allrules[customRule].fname;
			
			var fn = window[funce];
			if (typeof(fn) === 'function'){
				var fn_result = fn(caller,params);
				var is_error=false;
				var alert_text=$.validationEngine.settings.allrules[customRule].alertText;;
				if(typeof fn_result==='object'){
					is_error=fn_result['is_error'];
					if(fn_result['message']){
						alert_text=fn_result['message'];
					}
				}else{
					is_error=fn_result;
				}
				$.validationEngine.isError = is_error;
				promptText += alert_text+"<br />";
			}
		}
		function _ajax(caller,rules,position){				 // VALIDATE AJAX RULES
			
			customAjaxRule = rules[position+1];
			postfile = $.validationEngine.settings.allrules[customAjaxRule].file;
			fieldValue = $(caller).val();
			ajaxCaller = caller;
			fieldId = $(caller).attr("id");
			ajaxValidate = true;
			ajaxisError = $.validationEngine.isError;
			
			if($.validationEngine.settings.allrules[customAjaxRule].extraData){
				var tempExtraData = $.validationEngine.settings.allrules[customAjaxRule].extraData;
				if(tempExtraData instanceof Function){
					extraData=tempExtraData();
				}else{
					extraData=tempExtraData;
				}
			}else{
				extraData = "";
			}
			//log_for_debug('extraData:'+extraData+" : "+postfile);
			/* AJAX VALIDATION HAS ITS OWN UPDATE AND BUILD UNLIKE OTHER RULES */	
			if(!ajaxisError){
				$.ajax({
				   	type: "POST",
				   	url: postfile,
				   	async: true,
				   	data: "validateValue="+fieldValue+"&validateId="+fieldId+"&validateError="+customAjaxRule+"&"+extraData,
				   	beforeSend: function(){		// BUILD A LOADING PROMPT IF LOAD TEXT EXIST		   			
				   		if($.validationEngine.settings.allrules[customAjaxRule].alertTextLoad){
				   		
				   			if(!$("div."+fieldId+"formError")[0]){				   				
	 			 				return $.validationEngine.buildPrompt(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad,"load");
	 			 			}else{
	 			 				$.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad,"load");
	 			 			}
			   			}
			  	 	},
			  	 	error: function(data,transport){ $.validationEngine.debug("error in the ajax (_ajax): "+data.status+" "+transport) },
					success: function(data){					// GET SUCCESS DATA RETURN JSON
						data = eval( "("+data+")");				// GET JSON DATA FROM PHP AND PARSE IT
						ajaxisError = data.jsonValidateReturn[2];
						customAjaxRule = data.jsonValidateReturn[1];
						ajaxCaller = $("#"+data.jsonValidateReturn[0])[0];
						fieldId = ajaxCaller;
						ajaxErrorLength = $.validationEngine.ajaxValidArray.length;
						existInarray = false;
						
			 			 if(ajaxisError == "false"){			// DATA FALSE UPDATE PROMPT WITH ERROR;
			 			 	
			 			 	_checkInArray(false)				// Check if ajax validation alreay used on this field
			 			 	
			 			 	if(!existInarray){		 			// Add ajax error to stop submit		 		
				 			 	$.validationEngine.ajaxValidArray[ajaxErrorLength] =  new Array(2);
				 			 	$.validationEngine.ajaxValidArray[ajaxErrorLength][0] = fieldId;
				 			 	$.validationEngine.ajaxValidArray[ajaxErrorLength][1] = false;
				 			 	existInarray = false;
			 			 	}
				
			 			 	$.validationEngine.ajaxValid = false;
							promptText += $.validationEngine.settings.allrules[customAjaxRule].alertText+"<br />";
							$.validationEngine.updatePromptText(ajaxCaller,promptText,"",true);				
						 }else{	 
						 	_checkInArray(true);
						 	$.validationEngine.ajaxValid = true; 						   
	 			 			if($.validationEngine.settings.allrules[customAjaxRule].alertTextOk){	// NO OK TEXT MEAN CLOSE PROMPT	 			
	 			 				 				$.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextOk,"pass",true);
 			 				}else{
				 			 	ajaxValidate = false;		 	
				 			 	$.validationEngine.closePrompt(ajaxCaller);
 			 				}		
			 			 }
			 			function  _checkInArray(validate){
			 				for(x=0;x<ajaxErrorLength;x++){
			 			 		if($.validationEngine.ajaxValidArray[x][0] == fieldId){
			 			 			$.validationEngine.ajaxValidArray[x][1] = validate;
			 			 			existInarray = true;
			 			 		
			 			 		}
			 			 	}
			 			}
			 		}				
				});
			}
		}
		function _confirm(caller,rules,position){		 // VALIDATE FIELD MATCH
			confirmField = rules[position+1];
			msg_order = rules[position+2];
			if($(caller).attr('value') != $("#"+confirmField).attr('value')){
				$.validationEngine.isError = true;
				switch(msg_order){
					case "2":promptText += $.validationEngine.settings.allrules["confirm"].alertText2+"<br />";break;
					case "3":promptText += $.validationEngine.settings.allrules["confirm"].alertText3+"<br />";break;
					default:promptText += $.validationEngine.settings.allrules["confirm"].alertText+"<br />";break;
				}
			}
		}
		function _length(caller,rules,position){    	  // VALIDATE LENGTH
			startLength = eval(rules[position+1]);
			endLength = eval(rules[position+2]);
			feildLength = $(caller).attr('value').length;
			
			if(feildLength<startLength || feildLength>endLength){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["length"].alertText+startLength+$.validationEngine.settings.allrules["length"].alertText2+endLength+$.validationEngine.settings.allrules["length"].alertText3+"<br />"
			}
		}
		function _lengthWord(caller,rules,position){    	  // VALIDATE LENGTH
			startLength = eval(rules[position+1]);
			endLength = eval(rules[position+2]);
			feildLength = $.trim($(caller).attr('value')).split(' ').length;

			if(feildLength<startLength || feildLength>endLength){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["lengthWord"].alertText+startLength+$.validationEngine.settings.allrules["lengthWord"].alertText2+endLength+$.validationEngine.settings.allrules["lengthWord"].alertText3+"<br />"
			}
		}
		function _lengthValue(caller,rules,position){    	  // VALIDATE LENGTH
			startValue = eval(rules[position+1]);
			endValue = eval(rules[position+2]);
			feildValue = $.trim($(caller).attr('value'));

			if(feildValue<startValue || feildValue>endValue || isNaN(feildValue)){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["lengthValue"].alertText+startValue+$.validationEngine.settings.allrules["lengthValue"].alertText2+endValue+$.validationEngine.settings.allrules["lengthValue"].alertText3+"<br />"
			}
		}
		function _maxCheckbox(caller,rules,position){  	  // VALIDATE CHECKBOX NUMBER
		
			nbCheck = eval(rules[position+1]);
			groupname = $(caller).attr("name");
			groupSize = $("input[name='"+groupname+"']:checked").size();
			if(groupSize > nbCheck){	
				$.validationEngine.showTriangle = false;
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["maxCheckbox"].alertText+"<br />";
			}
		}
		function _minCheckbox(caller,rules,position){  	  // VALIDATE CHECKBOX NUMBER
		
			nbCheck = eval(rules[position+1]);
			groupname = $(caller).attr("name");
			groupSize = $("input[name='"+groupname+"']:checked").size();
			if(groupSize < nbCheck){	
			
				$.validationEngine.isError = true;
				$.validationEngine.showTriangle = false;
				promptText += $.validationEngine.settings.allrules["minCheckbox"].alertText+" "+nbCheck+" "+$.validationEngine.settings.allrules["minCheckbox"].alertText2+"<br />";
			}
		}
		function _minSelect(caller,rules,position){  	  // VALIDATE SELECT NUMBER
			nbCheck = eval(rules[position+1]);
			id_name = $(caller).attr("id");
			groupSize = $("select[id='"+id_name+"'] option:selected").size();
			if(groupSize < nbCheck){
				$.validationEngine.isError = true;
				$.validationEngine.showTriangle = false;
				promptText += $.validationEngine.settings.allrules["minSelect"].alertText+" "+nbCheck+" "+$.validationEngine.settings.allrules["minSelect"].alertText2+"<br />";
			}
		}
		return($.validationEngine.isError) ? $.validationEngine.isError : false;
	},
	submitForm : function(caller){
		if($.validationEngine.settings.ajaxSubmit){		
			if($.validationEngine.settings.ajaxSubmitExtraData){
				extraData = $.validationEngine.settings.ajaxSubmitExtraData;
			}else{
				extraData = "";
			}
			$.ajax({
			   	type: "POST",
			   	url: $.validationEngine.settings.ajaxSubmitFile,
			   	async: true,
			   	data: $(caller).serialize()+"&"+extraData,
			   	error: function(data,transport){ $.validationEngine.debug("error in the ajax (submitForm): "+data.status+" "+transport) },
			   	success: function(data){
			   		if(data == "true"){			// EVERYTING IS FINE, SHOW SUCCESS MESSAGE
			   			$(caller).css("opacity",1)
			   			$(caller).animate({opacity: 0, height: 0}, function(){
			   				$(caller).css("display","none");
			   				$(caller).before("<div class='ajaxSubmit'>"+$.validationEngine.settings.ajaxSubmitMessage+"</div>");
			   				$.validationEngine.closePrompt(".formError",true); 	
			   				$(".ajaxSubmit").show("slow");
			   				if ($.validationEngine.settings.success){	// AJAX SUCCESS, STOP THE LOCATION UPDATE
								$.validationEngine.settings.success && $.validationEngine.settings.success(); 
								return false;
							}
			   			})
		   			}else{						// HOUSTON WE GOT A PROBLEM (SOMETING IS NOT VALIDATING)
			   			data = eval( "("+data+")");	
			   			if(!data.jsonValidateReturn){
			   				 $.validationEngine.debug("you are not going into the success fonction and jsonValidateReturn return nothing");
			   			}
			   			errorNumber = data.jsonValidateReturn.length	
			   			for(index=0; index<errorNumber; index++){	
			   				fieldId = data.jsonValidateReturn[index][0];
			   				promptError = data.jsonValidateReturn[index][1];
			   				type = data.jsonValidateReturn[index][2];
			   				$.validationEngine.buildPrompt(fieldId,promptError,type);
		   				}
	   				}
   				}
			})	
			return true;
		}
		// LOOK FOR BEFORE SUCCESS METHOD		
			if(!$.validationEngine.settings.beforeSuccess()){
				if ($.validationEngine.settings.success){	// AJAX SUCCESS, STOP THE LOCATION UPDATE
					if($.validationEngine.settings.unbindEngine){ $(caller).unbind("submit") }
					$.validationEngine.settings.success && $.validationEngine.settings.success(); 
					return true;
				}
			}else{
				return true;
			} 
		return false;
	},
	buildPrompt : function(caller,promptText,type,ajaxed) {			// ERROR PROMPT CREATION AND DISPLAY WHEN AN ERROR OCCUR
		if(!$.validationEngine.settings){
			$.validationEngine.defaultSetting()
		}
		deleteItself = "." + $(caller).attr("id") + "formError"
	
		if($(deleteItself)[0]){
			$(deleteItself).stop();
			$(deleteItself).remove();
		}
		var divFormError = document.createElement('div');
		var formErrorContent = document.createElement('div');
		linkTofield = $.validationEngine.linkTofield(caller)
		$(divFormError).addClass("formError")
		
		if(type == "pass"){ $(divFormError).addClass("greenPopup") }
		if(type == "load"){ $(divFormError).addClass("blackPopup") }
		if(ajaxed){ $(divFormError).addClass("ajaxed") }
		
		$(divFormError).addClass(linkTofield);
		$(formErrorContent).addClass("formErrorContent");
		
		$("body").append(divFormError);
		$(divFormError).append(formErrorContent);
			
		if($.validationEngine.showTriangle != false){		// NO TRIANGLE ON MAX CHECKBOX AND RADIO
			var arrow = document.createElement('div');
			$(arrow).addClass("formErrorArrow");
			$(divFormError).append(arrow);
			if($.validationEngine.settings.promptPosition == "bottomLeft" || $.validationEngine.settings.promptPosition == "bottomRight"){
			$(arrow).addClass("formErrorArrowBottom")
			$(arrow).html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
		}
			if($.validationEngine.settings.promptPosition == "topLeft" || $.validationEngine.settings.promptPosition == "topRight"){
				$(divFormError).append(arrow);
				$(arrow).html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
			}
		}
		$(formErrorContent).html(promptText)
	
		callerTopPosition = $(caller).offset().top;
		callerleftPosition = $(caller).offset().left;
		callerWidth =  $(caller).width();
		inputHeight = $(divFormError).height();
	
		/* POSITIONNING */
		if($.validationEngine.settings.promptPosition == "topRight"){callerleftPosition +=  callerWidth -30; callerTopPosition += -inputHeight -10; }
		if($.validationEngine.settings.promptPosition == "topLeft"){ callerTopPosition += -inputHeight -10; }
		
		if($.validationEngine.settings.promptPosition == "centerRight"){ callerleftPosition +=  callerWidth +13; }
		
		if($.validationEngine.settings.promptPosition == "bottomLeft"){
			callerHeight =  $(caller).height();
			callerleftPosition = callerleftPosition;
			callerTopPosition = callerTopPosition + callerHeight + 15;
		}
		if($.validationEngine.settings.promptPosition == "bottomRight"){
			callerHeight =  $(caller).height();
			callerleftPosition +=  callerWidth -30;
			callerTopPosition +=  callerHeight + 15;
		}
		$(divFormError).css({
			top:callerTopPosition,
			left:callerleftPosition,
			opacity:0
		});
		
		$(divFormError).click(function(){
			$(this).remove();
		});
		
		return $(divFormError).animate({"opacity":0.87},function(){return true;});	
	},
	updatePromptText : function(caller,promptText,type,ajaxed) {	// UPDATE TEXT ERROR IF AN ERROR IS ALREADY DISPLAYED
		
		linkTofield = $.validationEngine.linkTofield(caller);
		var updateThisPrompt =  "."+linkTofield;
		
		if(type == "pass") { $(updateThisPrompt).addClass("greenPopup") }else{ $(updateThisPrompt).removeClass("greenPopup")};
		if(type == "load") { $(updateThisPrompt).addClass("blackPopup") }else{ $(updateThisPrompt).removeClass("blackPopup")};
		if(ajaxed) { $(updateThisPrompt).addClass("ajaxed") }else{ $(updateThisPrompt).removeClass("ajaxed")};
	
		$(updateThisPrompt).find(".formErrorContent").html(promptText);
		callerTopPosition  = $(caller).offset().top;
		inputHeight = $(updateThisPrompt).height();
		
		if($.validationEngine.settings.promptPosition == "bottomLeft" || $.validationEngine.settings.promptPosition == "bottomRight"){
			callerHeight =  $(caller).height();
			callerTopPosition =  callerTopPosition + callerHeight + 15;
		}
		if($.validationEngine.settings.promptPosition == "centerRight"){  callerleftPosition +=  callerWidth +13;}
		if($.validationEngine.settings.promptPosition == "topLeft" || $.validationEngine.settings.promptPosition == "topRight"){
			callerTopPosition = callerTopPosition  -inputHeight -10;
		}
		$(updateThisPrompt).animate({ top:callerTopPosition });
	},
	linkTofield : function(caller){
		linkTofield = $(caller).attr("id") + "formError";
		linkTofield = linkTofield.replace(/\[/g,""); 
		linkTofield = linkTofield.replace(/\]/g,"");
		return linkTofield;
	},
	closePrompt : function(caller,outside) {						// CLOSE PROMPT WHEN ERROR CORRECTED
		if(!$.validationEngine.settings){
			$.validationEngine.defaultSetting()
		}
		if(outside){
			$(caller).fadeTo("fast",0,function(){
				$(caller).remove();
			});
			return false;
		}
		if(typeof(ajaxValidate)=='undefined'){ajaxValidate = false}
		if(!ajaxValidate){
			linkTofield = $.validationEngine.linkTofield(caller);
			closingPrompt = "."+linkTofield;
			$(closingPrompt).fadeTo("fast",0,function(){
				$(closingPrompt).remove();
			});
		}
	},
	debug : function(error) {
		if(!$("#debugMode")[0]){
			$("body").append("<div id='debugMode'><div class='debugError'><strong>This is a debug mode, you got a problem with your form, it will try to help you, refresh when you think you nailed down the problem</strong></div></div>");
		}
		$(".debugError").append("<div class='debugerror'>"+error+"</div>");
	},			
	submitValidation : function(caller) {					// FORM SUBMIT VALIDATION LOOPING INLINE VALIDATION
		var stopForm = false;
		$.validationEngine.ajaxValid = true;
		$(caller).find(".formError").remove();
		var toValidateSize = $(caller).find("[class*=validate]").size();
		
		$(caller).find("[class*=validate]").each(function(){
			linkTofield = $.validationEngine.linkTofield(this);
			
			if(!$("."+linkTofield).hasClass("ajaxed")){	// DO NOT UPDATE ALREADY AJAXED FIELDS (only happen if no normal errors, don't worry)
				var validationPass = $.validationEngine.loadValidation(this);
				return(validationPass) ? stopForm = true : "";					
			};
		});
		ajaxErrorLength = $.validationEngine.ajaxValidArray.length;		// LOOK IF SOME AJAX IS NOT VALIDATE
		for(x=0;x<ajaxErrorLength;x++){
	 		if($.validationEngine.ajaxValidArray[x][1] == false){
	 			$.validationEngine.ajaxValid = false;
 			}
 		}
		if(stopForm || !$.validationEngine.ajaxValid){		// GET IF THERE IS AN ERROR OR NOT FROM THIS VALIDATION FUNCTIONS
			if($.validationEngine.settings.scroll){
				destination = $(".formError:not('.greenPopup'):first").offset().top;
				$(".formError:not('.greenPopup')").each(function(){
					testDestination = $(this).offset().top;
					if(destination>testDestination){
						destination = $(this).offset().top;
					}
				})
				$("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination}, 1100);
			}
			return true;
		}else{
			return false;
		}
	}
}
})(jQuery);;var EMF_jQuery=jQuery;
(function($) {
	$.fn.validationEngineLanguage = function() {};
	$.validationEngineLanguage = {
		newLang: function() {
			$.validationEngineLanguage.allRules = {
				"required":{				// Add your regex rules here, you can take telephone as an example
					"regex":"none",
					"alertText":"* This field is required",
					"alertTextCheckboxMultiple":"* Please select an option",
					"alertTextCheckboxe":"* This checkbox is required"},
				"length":{
					"regex":"none",
					"alertText":"*Between ",
					"alertText2":" and ",
					"alertText3": " characters allowed"},
				"lengthWord":{
					"regex":"none",
					"alertText":"*Between ",
					"alertText2":" and ",
					"alertText3": " words allowed"},
				"lengthValue":{
					"regex":"none",
					"alertText":"*Between ",
					"alertText2":" and ",
					"alertText3": " value allowed"},
				"maxCheckbox":{
					"regex":"none",
					"alertText":"* Checks allowed Exceeded"},	
				"minCheckbox":{
					"regex":"none",
					"alertText":"* Please select ",
					"alertText2":" options"},
				"minSelect":{
					"regex":"none",
					"alertText":"* Please select ",
					"alertText2":" options"},
				"confirm":{
					"regex":"none",
					"alertText":"* Your field is not matching",
					"alertText2":"* The password entered does not match. Please try again.",
					"alertText3":"* The email does not match. Please try again."},
				"telephone":{
					"regex":"/^[0-9\-\(\)\+\ ]+$/",
					"alertText":"* Invalid phone number"},
				"email":{
					"regex":"/^[a-zA-Z0-9_\.\+\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,4}$/",
					"alertText":"* Invalid email address"},
				"url":{
					"regex":/^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
					"alertText":"* Invalid website address"},
				"date":{
					"regex":"/^[0-9]{4}\-\[0-9]{1,2}\-\[0-9]{1,2}$/",
					"alertText":"* Invalid date, must be in YYYY-MM-DD format"},
				"onlyNumber":{
					"regex":"/^[0-9\ ]+$/",
					"alertText":"* Numbers only"},	
				"extNumber":{
						"regex":"/^[0-9,\.\ ]+$/",
						"alertText":"* Numbers only"},
				"noSpecialCaracters":{
					"regex":"/^[0-9a-zA-Z]+$/",
					"alertText":"* No special caracters allowed"},
				"noSpecialCaractersEx":{
					"regex":/^[0-9a-zA-Z\ \-\&\']+$/,
					"alertText":"* No special caracters allowed"},
				/*
				"ajaxCaptcha":{
					"file":get_site_url('forms/check_captcha_code'),
					"extraData":"captcha_code="+$('#captcha_code').val(),
					"alertTextOk":"* This captcha is available",	
					"alertTextLoad":"* Loading, please wait",
					"alertText":"* This captcha is wrong"
				},
				*/
				"ajaxPassword":{
						"file":get_site_url('account/check_password'),
						"extraData":"Password="+$('#Password').val(),
						"alertTextOk":"* Old Password is correct",	
						"alertTextLoad":"* Loading, please wait",
						"alertText":"* Old Password is wrong"
				},
				"onlyLetter":{
					"regex":"/^[a-zA-Z\ \']+$/",
					"alertText":"* Letters only"
				},
				"ajaxUsername":{
						"file":get_site_url('account/check_user'),
						"extraData":"Username="+$('#Username').val(),
						"alertTextOk":"* This user is available",	
						"alertTextLoad":"* Loading, please wait",
						"alertText":"* This user is already taken"
				},
				"ajaxEmail":{
						"file":get_site_url('account/check_email'),
						"extraData":"ContactEmail="+$('#ContactEmail').val(),
						"alertTextOk":"* This email is available",	
						"alertTextLoad":"* Loading, please wait",
						"alertText":"* This email is already taken"
				},
				"NameEmail":{
   					"fname":"NameEmail",
   					"alertText":"* Invalid email address"
				},
				"valid_captcha":{
					"fname":"valid_captcha",
					"alertText":"* This captcha is wrong"
				},
				"url_ex":{
					"fname":"url_ex",
					"alertText":"* Invalid website address"
					/*,
					"alertText2":"* Valid URL start with 'http://' or 'https://' is allowed."
					*/
				},
				"check_file_error":{
					"fname":"check_file_error",
					"alertText":"* File type invalid or file size is too large"
				}
			}
		}
	}
})(jQuery);
EMF_jQuery(document).ready(function() {	
	EMF_jQuery.validationEngineLanguage.newLang();
});;
/**
 * options:{modal=false, width='auto', height='auto', resizable=false,title="",hide_after_create=false}
 *
 */
function show_dialog(id,options){
	var modal=false;
	var width='auto';
	var height='auto';
	var resizable=false;
	var title='';
	var hide_close_button=false;
	var close_on_escape=false;
	if(typeof(options)!='undefined' && options){
		if(options['modal']==true){
			modal=true;
		}
		if(options['width']){
			width=options['width'];
		}
		if(options['height']){
			height=options['height'];
		}
		if(options['resizable']==true){
			resizable=options['resizable'];
		}
		if(options['title']){
			title=options['title'];
		}
		if(options['hide_close_button']){
			hide_close_button=options['hide_close_button'];
		}
		
		if(typeof(options['closeOnEscape'])=='undefined'){
			close_on_escape=!hide_close_button;
		}else{
			close_on_escape=options['closeOnEscape'];
		}
	}
	//debug_log("modal:"+modal+" height:"+height+" width:"+width);
	$("#"+id).dialog({title:title,modal: modal,resizable:resizable,width:width,height:height,
		dialogClass:'emf_dialog',closeOnEscape: close_on_escape,close: function(event, ui){
//			console.log(this);
			hide_error_on_dialog(this);
		}
	});
	
	if(hide_close_button){
//		closeOnEscape: false,
		$("#"+id).parents('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
	}
}
function rand_id(){
	var id=""+Math.random();
	return "id_"+id.substr(2);
}
function debug_log(msg){
//	console.debug(msg);
}
/**
 * options:{
 * modal=false, width='auto', height='auto', resizable=false,title="",hide_after_create=false,custom_id=null,destory_after_close=false,
 * image_buttons:{},text_buttons:{},list_buttons:{}
 * }
 *
 */
function create_dialog(title,html_content,options){
//create dialog
//	debug_log(options);
	if(typeof(options)=='undefined' || options==null){
		options={};
	}
	var custom_id=null;
	var enable_show_dialog=true;
//	var destory_after_close=false;
	custom_id=options['custom_id'];
	if(options['hide_after_create']){
		enable_show_dialog=false;
	}
//	if(options['destory_after_close']==true){
//		destory_after_close=true;
//	}
	var id;
	var found_dialog=false;
	if(custom_id){
		//search custom_id
		if($("#"+custom_id).length>0){
			found_dialog=true;
		}
		id=custom_id;
	}else{
		id=rand_id();
	}
//	debug_log("found_dialog:"+found_dialog);
	if(found_dialog){
		var title_html="";
		if(title){
			title_html="<h2>"+title+"</h2>";
		}
		$("#"+id+" .TB_content_caption").html(title_html+"\n"+(html_content?html_content:""));

	}else{
		var title_html="";
		if(title){
			title_html="<h2>"+title+"</h2>";
		}
		var html="<div id='"+id+"' class='thickbox' style='display:none'><div class='TB_content'>\n"
				+"<div class='TB_content_caption'>"+title_html+"\n"+(html_content?html_content:"")
				+"<div class='TB_inline_error'></div></div>\n"
				+"<input type='button' style='display:none;' class='thickbox' id='"+id+"_button'>"
				+"</div>";

		$(document.body).append(html);
//		$("#"+id).attr("destory_after_close",destory_after_close).dialog({
//			close: function(event, ui) {
//				if($(this).attr("destory_after_close")=='true'){
//	//				debug_log("remove it");
//					$(this).remove();
//				}
//			}
//		});
	}
	//image buttons
	if(options['image_buttons']){
		create_image_buttons(id,options['image_buttons']);
	}
	options['image_buttons']=null;
	//text buttons
	if(options['text_buttons']){
		create_text_buttons(id,options['text_buttons']);
	}
	options['text_buttons']=null;
	//list buttons
	if(options['list_buttons']){
		create_list_buttons(id,options['list_buttons']);
	}
	options['list_buttons']=null;
	if(enable_show_dialog){
		show_dialog(id,options);
	}
	return id;
}
function show_error_on_dialog(err,id){
	var sel;
	if(id){
		sel="#"+id+" .TB_inline_error";
	}else{
		sel=".emf_dialog .TB_inline_error";
	}
	$(sel).html(err).show();
}
function hide_error_on_dialog(dialog){
	if(dialog){
		$(dialog).find(".TB_inline_error").html("").hide();
	}else{
		$(".emf_dialog .TB_inline_error").html("").hide();
	}
}
/**
list_buttons: [
    {
		html: "",
        click: function(id) {		get_dialog(this).dialog("close");; }
    }
]
 *
 */
function create_list_buttons(id,btns){
	if(btns.length>0){
		var create_btns=$("<div class='TB_content_button' style='margin: 0px auto 0px; text-align: center;'>\n<ul class='ul-lists'></ul></div>\n");
		var lists=create_btns.find(".ul-lists");
		for(var i=0;i<btns.length;i++){
			var btn=btns[i];
//			debug_log(btn);
			if(btn['html']){
//				var create_btn=$("<a class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-text'>"+btn['text']+"</a>");
				var create_btn=$("<li class='anchor'><b>"+(i+1)+". "+btn['html']+"</b></li>");
				create_btn.click(btn['click']);
				lists.append(create_btn);
			}
		}
//		debug_log(create_btns);
		$("#"+id+" .TB_content").append(create_btns);
//		debug_log("#"+id+" .TB_content_caption");
	}
}
/**
 *
 text_buttons: [
    {
		text: "",
        click: function() {		get_dialog(this).dialog("close"); }
    }
]
*/
function create_text_buttons(id,btns){
	if(btns.length>0){
		var create_btns=$("<div class='TB_content_button' style='margin: 30px auto 0px; text-align: center;'>\n</div>\n");
		for(var i=0;i<btns.length;i++){
			var btn=btns[i];
//			debug_log(btn);
			if(btn['text']){
//				var create_btn=$("<a class='ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-text'>"+btn['text']+"</a>");
				var create_btn=$("<button class='ui-button  ui-widget ui-state-default ui-corner-all ui-button-text-only ui-button-text'><span class='ui-button-text'>"+btn['text']+"</span></button>");
				create_btn.click(btn['click']);
				create_btns.append(create_btn);
			}
		}
//		debug_log(create_btns);
		$("#"+id+" .TB_content_caption").append(create_btns);
//		debug_log("#"+id+" .TB_content_caption");
	}
}
/**
 *
 image_buttons: [
    {
		image: "",
        click: function() {		get_dialog(this).dialog("close"); }
    }
]
*/
function create_image_buttons(id,btns){
//	debug_log(btns);
	if(btns.length>0){
		var create_btns=$("<div class='TB_content_button' style='margin: 30px auto 0px; text-align: center;'>\n</div>\n");
		for(var i=0;i<btns.length;i++){
			var btn=btns[i];
//			debug_log(btn);
			if(btn['image']){
				var create_btn=$("<img src='"+btn['image']+"' >\n");
				create_btn.click(btn['click']);
				create_btns.append(create_btn);
			}
		}
		$("#"+id+" .TB_content_caption").append(create_btns);
	}
}
function get_dialog(ctrl){
	var jq_ctrl=$(ctrl);
	if(jq_ctrl.hasClass("thickbox")){
		return jq_ctrl;
	}else{
//		debug_log(jq_ctrl);
		return jq_ctrl.parents("div.thickbox");
	}
}
/**
	show_dialog_with_button_list('test text title',"<h3>text content</h3>",
	[{html:"1. Go to the Template section. I'd like to choose from a list of pre-made forms.",
		click:function(){
			go_url_self('<?php echo site_url("templates"); ?>');
		}
	},
	{html:"2. Take me to the Form Builder. I'd like to create my own form.",
		click:function(){
			go_url_self('<?php echo site_url("forms/build"); ?>');
	}}]);
 *
 */
function show_dialog_with_button_list(list_buttons,options){
	if(typeof(options)=='undefined' || options==null){
		options={};
	}
	options['list_buttons']=list_buttons;
	options['modal']=true;
	create_dialog(null,null,options);
}
/**
	show_dialog_with_text_buttons('test text title',"<h3>text content</h3>",
	[{text:"yes",click:function(){
			alert("yes");
		}
	},
	{text:"no",click:function(){
		get_dialog(this).dialog("close");
	}}]);
 *
 */
function show_dialog_with_text_buttons(title,html_content,text_buttons,options){
	if(typeof(options)=='undefined' || options==null){
		options={};
	}
	options['text_buttons']=text_buttons;
	create_dialog(title,html_content,options);
}
/**
show_dialog_with_image_buttons('test confirm title',"<h3>confirm content</h3>",
	[{image:base_url+'images/dialog-box-button-yes.png',
		click:function(){
			alert("yes");
		}
	},
	{image:base_url+'images/dialog-box-button-close.png',click:function(){
		get_dialog(this).dialog("close");
	}}]);
 *
 */
function show_dialog_with_image_buttons(title,html_content,image_buttons,options){
	if(typeof(options)=='undefined' || options==null){
		options={};
	}
	options['image_buttons']=image_buttons;
	create_dialog(title,html_content,options);
}
/**
show_alert("test alert title","alert content");
 *
 */
function show_alert(title,html_content,options){
	if(typeof(options)=='undefined' || options==null){
		options={width:500};
	}
	options['image_buttons']=[{'image':base_url+'images/dialog-box-button-close.png',click:function(){
		get_dialog(this).dialog("close");
	}}];
	options['modal']=true;
	create_dialog(title,html_content,options);
}

function show_error_for_public(title,html_content,options){
	html_content+="<BR><BR>EmailMeForm is an online webform and survey builder tool.";
	if(typeof(options)=='undefined' || options==null){
		options={width:500};
	}
	options['image_buttons']=[{'image':base_url+'images/dialog-box-button-learn-more.png',click:function(){
		window.location.href=get_site_url('');
	}}];
	options['modal']=true;
	options['hide_close_button']=true;
	
	create_dialog(title,html_content,options);
}
/**
show_confirm('test confirm title',"<h3>confirm content</h3>",
	[{image:base_url+'images/dialog-box-button-yes.png',
		click:function(){
			alert("yes");
		}
	},
	{image:base_url+'images/dialog-box-button-close.png',click:function(){
		get_dialog(this).dialog("close");
	}}]);
 *
 */
function show_confirm(title,html_content,image_buttons,options){
	if(typeof(options)=='undefined' || options==null){
		options={width: 500};
	}
//	options['custom_id']='ui_confirm_dialog';
	if(options['modal']!=true && options['modal']!=false){
		options['modal']=true;
	}
	show_dialog_with_image_buttons(title,html_content,image_buttons,options);
}
function show_confirm_dialog(title, html_content, yes_function, no_function, options){
	if(no_function==null){
		no_function=function(){
			get_dialog(this).dialog("close");
		}
	}
	show_confirm(title , html_content, [
		{image: base_url+'images/dialog-box-button-yes.png', click: yes_function},
		{image:base_url+'images/dialog-box-button-no.png', click: no_function}
	], options);
}
function show_confirm_deletion_dialog(entity_name, entity_instance_name, yes_function){
	show_confirm_dialog('Please Confirm', 'Are you sure you want to delete the '+entity_name+' "'+get_safe_html(entity_instance_name)+'"?', yes_function);
}
function show_custom_upgrade_dialog(title, html_content, is_top_plan,next_plan_id){
	var	options={width:500, modal:true};
	options['image_buttons']=[
  		is_top_plan ?
  			{image:base_url+'images/dialog-box-button-contact-us.png',
  				click:function(){
  					go_url_self(base_url+'onlineform/sendfeedback_logged/Accounts and Billing');
  				}
  			} 
  			:
  			{image:base_url+'images/dialog-box-button-upgrade.png',
  				click:function(){
  					if(next_plan_id){
  						go_url_self(base_url+'pay/plan/'+next_plan_id);
  					}else{
  						go_url_self(base_url+'account');
  					}
  				}
  			},
  		{image:base_url+'images/dialog-box-button-close.png',click:function(){
  			get_dialog(this).dialog("close");
  		}}
  	];
  	create_dialog(title,html_content,options);
}
/**
show_upgrade_dialog('Plus Plan Feature!',"<h3>In order to access this feature, you must upgrade your EmailMeForm plan.</h3>");
 *
 */
function show_upgrade_dialog(html_content, entity_name, is_top_plan,next_plan_id){
	var	options={width:500, modal:true};
	var title=capitalize_first_char(entity_name)+' Limit Reached';
	
	html_content+=" ";
	html_content+=is_top_plan ?
			'If you need to create additional '+entity_name+', please contact Accounts and Billing to further discuss your organization\'s needs.'
			:
			'Please upgrade your plan if you need to create additional '+entity_name+'.';
	
	options['image_buttons']=[
		is_top_plan ?
			{image:base_url+'images/dialog-box-button-contact-us.png',
				click:function(){
					go_url_self(base_url+'onlineform/sendfeedback_logged/Accounts and Billing');
				}
			} 
			:
			{image:base_url+'images/dialog-box-button-upgrade.png',
				click:function(){
					if(next_plan_id){
						go_url_self(base_url+'pay/plan/'+next_plan_id);
					}else{
						go_url_self(base_url+'account');
					}
				}
			},
		{image:base_url+'images/dialog-box-button-close.png',click:function(){
			get_dialog(this).dialog("close");
		}}
	];
	create_dialog(title,html_content,options);
}
function show_common_upgrade_dialog(entity_name, is_top_plan,next_plan_id){
	var message=is_top_plan ?
			'You have reached the maximum number of '+entity_name+' that you can create with your plan.'
			:
			'You have reached the maximum number of '+entity_name+' that you can create with your plan.';
	show_upgrade_dialog(
		'You have reached the maximum number of '+entity_name+' that you can create with your plan.',
		entity_name,
		is_top_plan,
		next_plan_id
	);
}
function go_url_blank(url){
	window.open(url);
}
function go_url_self(url){
	window.location.href=url;
}
function close_dialog(id){
	var dialog=null;
	if(typeof(id)=='object'){
		dialog=get_dialog(id);
	}else{
		dialog=$("#"+id);
	}
	dialog.dialog("close");
}
function close_container_dialog(control){
	get_dialog(control).dialog("close");
}
function extract_parameters(paramStr){
	var vars = [], hash;
	if(paramStr){
		var hashes = paramStr.slice(paramStr.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++){
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
	}
	return vars;
}
function convert_to_real(p,max){
	if(p.substr(p.length-1,1)=='%'){
		var n=p.substr(0,p.length-1);
		if(!isNaN(n)){
			var n=parseInt(n, 10);
			p=Math.round(n/100*max);
		}
	}
	return p;
}
function is_percent(p){
	return p.substr(p.length-1,1)=='%' && !isNaN(p.substr(0,p.length-1));
}
function reset_width_height_for_iframe(ctrl){
	var a = $(ctrl).attr("href") || $(ctrl).attr("alt");
	var params=extract_parameters(a);
	var id=params['inlineId'];
	if($("#"+id).find("iframe").length>0){
		var options=params;
//		debug_log("id:"+id);
		if(options['height']){
//			debug_log("get height:"+options['height']);
			if(isNaN(options['height'])){
				var h=options['height'];
				if(is_percent(h)){
					options['height']=convert_to_real(h,$(window).height());
				}
			}else{
				options['height']=parseInt(options['height'],10)+30;
			}
//			debug_log("set height:"+options['height']);
			$("#"+id+" .TB_content").css("height",options['height']-55);
			$("#"+id+" .TB_content_caption").css("height",options['height']-55);
		}
//	if(options['width']){
//		if(isNaN(options['width'])){
//			var w=options['width'];
//			if(is_percent(w)){
//				options['width']=convert_to_real(w,$(window).width());
//			}
//		}else{
//			options['width']=parseInt(options['width'],10)+39;
//		}
//		debug_log("set width:"+options['width']);
//		$("#"+id+" .TB_content").css("width",options['width']);
//	}
	}
}
function init_dialog(ctrl){
	$(ctrl).each(function(){
		reset_width_height_for_iframe(this);
	});

	$(ctrl).unbind("click");
	$(ctrl).click(function(){
	var t = this.title || this.name || null;
	var a = this.href || this.alt;
//	var g = this.rel || false;
	var params=extract_parameters(a);
	var id=params['inlineId'];
	//fix width/height
	var options=params;
	if(options['height']){
		if(isNaN(options['height'])){
			var h=options['height'];
			if(is_percent(h)){
				options['height']=convert_to_real(h,$(window).height());
			}
		}else{
			options['height']=parseInt(options['height'],10)+30;
		}
	}
	if(options['width']){
		if(isNaN(options['width'])){
			var w=options['width'];
			if(is_percent(w)){
				options['width']=convert_to_real(w,$(window).width());
			}
		}else{
			options['width']=parseInt(options['width'],10)+39;
		}
	}
	if(t){
		options['title']=t;
	}
	if(options['modal']!=false && options['modal']!=true){
		options['modal']=true;
	}
	show_dialog(id,options);
	this.blur();
	return false;
	});

	//create confirm dialog
//	$("<div id='ui_confirm_dialog'></div>").appendTo(document.body);
}
function close_all_dialogs(){
	//close all
	$('div.thickbox').dialog("close");
}
function tb_init(ctrl){
	init_dialog(ctrl);
}
function tb_remove(){
	close_all_dialogs();
}

$(document).ready(function(){
	init_dialog('a.thickbox, area.thickbox, input.thickbox');//pass where to apply thickbox
});

;/*!
 * jQuery corner plugin: simple corner rounding
 * Examples and documentation at: http://jquery.malsup.com/corner/
 * version 2.09 (11-MAR-2010)
 * Requires jQuery v1.3.2 or later
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Authors: Dave Methvin and Mike Alsup
 */

/**
 *  corner() takes a single string argument:  $('#myDiv').corner("effect corners width")
 *
 *  effect:  name of the effect to apply, such as round, bevel, notch, bite, etc (default is round). 
 *  corners: one or more of: top, bottom, tr, tl, br, or bl.  (default is all corners)
 *  width:   width of the effect; in the case of rounded corners this is the radius. 
 *           specify this value using the px suffix such as 10px (yes, it must be pixels).
 */
;(function($) { 

var style = document.createElement('div').style;
var moz = style['MozBorderRadius'] !== undefined;
var webkit = style['WebkitBorderRadius'] !== undefined;
var radius = style['borderRadius'] !== undefined || style['BorderRadius'] !== undefined;
var mode = document.documentMode || 0;
var noBottomFold = $.browser.msie && (($.browser.version < 8 && !mode) || mode < 8);

var expr = $.browser.msie && (function() {
    var div = document.createElement('div');
    try { div.style.setExpression('width','0+0'); div.style.removeExpression('width'); }
    catch(e) { return false; }
    return true;
})();
    
function sz(el, p) { 
    return parseInt($.css(el,p))||0; 
};
function hex2(s) {
    var s = parseInt(s).toString(16);
    return ( s.length < 2 ) ? '0'+s : s;
};
function gpc(node) {
    while(node) {
        var v = $.css(node,'backgroundColor');
        if (v && v != 'transparent' && v != 'rgba(0, 0, 0, 0)') {
	        if (v.indexOf('rgb') >= 0) { 
	            var rgb = v.match(/\d+/g); 
	            return '#'+ hex2(rgb[0]) + hex2(rgb[1]) + hex2(rgb[2]);
	        }
            return v;
		}
		node = node.parentNode; // keep walking if transparent
    }
    return '#ffffff';
};

function getWidth(fx, i, width) {
    switch(fx) {
    case 'round':  return Math.round(width*(1-Math.cos(Math.asin(i/width))));
    case 'cool':   return Math.round(width*(1+Math.cos(Math.asin(i/width))));
    case 'sharp':  return Math.round(width*(1-Math.cos(Math.acos(i/width))));
    case 'bite':   return Math.round(width*(Math.cos(Math.asin((width-i-1)/width))));
    case 'slide':  return Math.round(width*(Math.atan2(i,width/i)));
    case 'jut':    return Math.round(width*(Math.atan2(width,(width-i-1))));
    case 'curl':   return Math.round(width*(Math.atan(i)));
    case 'tear':   return Math.round(width*(Math.cos(i)));
    case 'wicked': return Math.round(width*(Math.tan(i)));
    case 'long':   return Math.round(width*(Math.sqrt(i)));
    case 'sculpt': return Math.round(width*(Math.log((width-i-1),width)));
	case 'dogfold':
    case 'dog':    return (i&1) ? (i+1) : width;
    case 'dog2':   return (i&2) ? (i+1) : width;
    case 'dog3':   return (i&3) ? (i+1) : width;
    case 'fray':   return (i%2)*width;
    case 'notch':  return width; 
	case 'bevelfold':
    case 'bevel':  return i+1;
    }
};

$.fn.corner = function(options) {
    // in 1.3+ we can fix mistakes with the ready state
	if (this.length == 0) {
        if (!$.isReady && this.selector) {
            var s = this.selector, c = this.context;
            $(function() {
                $(s,c).corner(options);
            });
        }
        return this;
	}

    return this.each(function(index){
		var $this = $(this);
		// meta values override options
		var o = [$this.attr($.fn.corner.defaults.metaAttr) || '', options || ''].join(' ').toLowerCase();
		var keep = /keep/.test(o);                       // keep borders?
		var cc = ((o.match(/cc:(#[0-9a-f]+)/)||[])[1]);  // corner color
		var sc = ((o.match(/sc:(#[0-9a-f]+)/)||[])[1]);  // strip color
		var width = parseInt((o.match(/(\d+)px/)||[])[1]) || 10; // corner width
		var re = /round|bevelfold|bevel|notch|bite|cool|sharp|slide|jut|curl|tear|fray|wicked|sculpt|long|dog3|dog2|dogfold|dog/;
		var fx = ((o.match(re)||['round'])[0]);
		var fold = /dogfold|bevelfold/.test(o);
		var edges = { T:0, B:1 };
		var opts = {
			TL:  /top|tl|left/.test(o),       TR:  /top|tr|right/.test(o),
			BL:  /bottom|bl|left/.test(o),    BR:  /bottom|br|right/.test(o)
		};
		if ( !opts.TL && !opts.TR && !opts.BL && !opts.BR )
			opts = { TL:1, TR:1, BL:1, BR:1 };
			
		// support native rounding
		if ($.fn.corner.defaults.useNative && fx == 'round' && (radius || moz || webkit) && !cc && !sc) {
			if (opts.TL)
				$this.css(radius ? 'border-top-left-radius' : moz ? '-moz-border-radius-topleft' : '-webkit-border-top-left-radius', width + 'px');
			if (opts.TR)
				$this.css(radius ? 'border-top-right-radius' : moz ? '-moz-border-radius-topright' : '-webkit-border-top-right-radius', width + 'px');
			if (opts.BL)
				$this.css(radius ? 'border-bottom-left-radius' : moz ? '-moz-border-radius-bottomleft' : '-webkit-border-bottom-left-radius', width + 'px');
			if (opts.BR)
				$this.css(radius ? 'border-bottom-right-radius' : moz ? '-moz-border-radius-bottomright' : '-webkit-border-bottom-right-radius', width + 'px');
			return;
		}
			
		var strip = document.createElement('div');
		$(strip).css({
			overflow: 'hidden',
			height: '1px',
			minHeight: '1px',
			fontSize: '1px',
			backgroundColor: sc || 'transparent',
			borderStyle: 'solid'
		});
	
        var pad = {
            T: parseInt($.css(this,'paddingTop'))||0,     R: parseInt($.css(this,'paddingRight'))||0,
            B: parseInt($.css(this,'paddingBottom'))||0,  L: parseInt($.css(this,'paddingLeft'))||0
        };

        if (typeof this.style.zoom != undefined) this.style.zoom = 1; // force 'hasLayout' in IE
        if (!keep) this.style.border = 'none';
        strip.style.borderColor = cc || gpc(this.parentNode);
        var cssHeight = $(this).outerHeight();

        for (var j in edges) {
            var bot = edges[j];
            // only add stips if needed
            if ((bot && (opts.BL || opts.BR)) || (!bot && (opts.TL || opts.TR))) {
                strip.style.borderStyle = 'none '+(opts[j+'R']?'solid':'none')+' none '+(opts[j+'L']?'solid':'none');
                var d = document.createElement('div');
                $(d).addClass('jquery-corner');
                var ds = d.style;

                bot ? this.appendChild(d) : this.insertBefore(d, this.firstChild);

                if (bot && cssHeight != 'auto') {
                    if ($.css(this,'position') == 'static')
                        this.style.position = 'relative';
                    ds.position = 'absolute';
                    ds.bottom = ds.left = ds.padding = ds.margin = '0';
                    if (expr)
                        ds.setExpression('width', 'this.parentNode.offsetWidth');
                    else
                        ds.width = '100%';
                }
                else if (!bot && $.browser.msie) {
                    if ($.css(this,'position') == 'static')
                        this.style.position = 'relative';
                    ds.position = 'absolute';
                    ds.top = ds.left = ds.right = ds.padding = ds.margin = '0';
                    
                    // fix ie6 problem when blocked element has a border width
                    if (expr) {
                        var bw = sz(this,'borderLeftWidth') + sz(this,'borderRightWidth');
                        ds.setExpression('width', 'this.parentNode.offsetWidth - '+bw+'+ "px"');
                    }
                    else
                        ds.width = '100%';
                }
                else {
                	ds.position = 'relative';
                    ds.margin = !bot ? '-'+pad.T+'px -'+pad.R+'px '+(pad.T-width)+'px -'+pad.L+'px' : 
                                        (pad.B-width)+'px -'+pad.R+'px -'+pad.B+'px -'+pad.L+'px';                
                }

                for (var i=0; i < width; i++) {
                    var w = Math.max(0,getWidth(fx,i, width));
                    var e = strip.cloneNode(false);
                    e.style.borderWidth = '0 '+(opts[j+'R']?w:0)+'px 0 '+(opts[j+'L']?w:0)+'px';
                    bot ? d.appendChild(e) : d.insertBefore(e, d.firstChild);
                }
				
				if (fold && $.support.boxModel) {
					if (bot && noBottomFold) continue;
					for (var c in opts) {
						if (!opts[c]) continue;
						if (bot && (c == 'TL' || c == 'TR')) continue;
						if (!bot && (c == 'BL' || c == 'BR')) continue;
						
						var common = { position: 'absolute', border: 'none', margin: 0, padding: 0, overflow: 'hidden', backgroundColor: strip.style.borderColor };
						var $horz = $('<div/>').css(common).css({ width: width + 'px', height: '1px' });
						switch(c) {
						case 'TL': $horz.css({ bottom: 0, left: 0 }); break;
						case 'TR': $horz.css({ bottom: 0, right: 0 }); break;
						case 'BL': $horz.css({ top: 0, left: 0 }); break;
						case 'BR': $horz.css({ top: 0, right: 0 }); break;
						}
						d.appendChild($horz[0]);
						
						var $vert = $('<div/>').css(common).css({ top: 0, bottom: 0, width: '1px', height: width + 'px' });
						switch(c) {
						case 'TL': $vert.css({ left: width }); break;
						case 'TR': $vert.css({ right: width }); break;
						case 'BL': $vert.css({ left: width }); break;
						case 'BR': $vert.css({ right: width }); break;
						}
						d.appendChild($vert[0]);
					}
				}
            }
        }
    });
};

$.fn.uncorner = function() { 
	if (radius || moz || webkit)
		this.css(radius ? 'border-radius' : moz ? '-moz-border-radius' : '-webkit-border-radius', 0);
	$('div.jquery-corner', this).remove();
	return this;
};

// expose options
$.fn.corner.defaults = {
	useNative: true, // true if plugin should attempt to use native browser support for border radius rounding
	metaAttr:  'data-corner' // name of meta attribute to use for options
};
    
})(jQuery);

;/*
   jQuery (character and word) counter
   Copyright (C) 2009  Wilkins Fernandez

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/(function(b) { b.fn.extend({ counter: function(a) { a = b.extend({}, { type: "char", count: "down", goal: 140 }, a); var d = false; return this.each(function() { function e(c) { if (typeof a.type === "string") switch (a.type) { case "char": if (a.count === "down") { g = " character(s) left"; return a.goal - c } else if (a.count === "up") { g = " characters (" + a.goal + " max)"; return c } break; case "word": if (a.count === "down") { g = " word(s) left"; return a.goal - c } else if (a.count === "up") { g = " words (" + a.goal + " max)"; return c } break; default: } } var g, f = b(this); b('<div id="' + this.id + '_counter"><span>' + e(b(f).val().length) + "</span>" + g + "</div>").insertAfter(f); var i = b("#" + this.id + "_counter span"); f.bind("keyup click blur focus change paste", function(c) { switch (a.type) { case "char": c = b(f).val().length; break; case "word": c = f.val() === "" ? 0 : b.trim(f.val()).replace(/\s+/g, " ").split(" ").length; break; default: } switch (a.count) { case "up": if (e(c) >= a.goal && a.type === "char") { b(this).val(b(this).val().substring(0, a.goal)); d = true; break } if (e(c) === a.goal && a.type === "word") { d = true; break } else if (e(c) > a.goal && a.type === "word") { b(this).val(""); i.text("0"); d = true; break } break; case "down": if (e(c) <= 0 && a.type === "char") { b(this).val(b(this).val().substring(0, a.goal)); d = true; break } if (e(c) === 0 && a.type === "word") d = true; else if (e(c) < 0 && a.type === "word") { b(this).val(""); d = true; break } break; default: } f.keydown(function(h) { if (d) { this.focus(); if (h.keyCode !== 46 && h.keyCode !== 8) if (b(this).val().length > a.goal && a.type === "char") { b(this).val(b(this).val().substring(0, a.goal)); return false } else return h.keyCode !== 32 && h.keyCode !== 8 && a.type === "word" ? true : false; else { d = false; return true } } }); i.text(e(c)) }) }) } }) })(jQuery);;/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
};function upload_file_with_progress(widget_obj, form_id, field_id, allowed_file_ext_arr, max_size){
	var file_input=$('input[type=file]', widget_obj);
	
	var files=new Array();
	if(file_input[0].files){
		$.each(file_input[0].files, function(index, item){
			files.push({"name": item.name, "size": item.size});
		});
	}else{
		files.push({"name": file_input.val().split('\\').pop().split('/').pop(), "size": null});
	}
		
	var errors=new Array();
	var max_size_in_byte=get_byte_length(max_size);
	$.each(files, function(index, item){
		var filename=item['name'];
		if(!is_allowed_file(filename, allowed_file_ext_arr)){
			errors.push("Error: The type of file \""+filename+"\" is invalid, \""+allowed_file_ext_arr.join(", ")+"\" allowed.");
		}
		var size=item['size'];    		
		if(size!==null && max_size_in_byte>0 && size > max_size_in_byte){
			errors.push("Error: The size of file \""+filename+"\" is too large, maximumn "+max_size+" allowed.");
		}
	});
	if(errors.length>0){
		alert(errors.join("\n"));
		return;
	}
	
	if(support_html5_upload()){
		$.each(file_input[0].files, function(index, file){
			new FileUploadProgress(widget_obj, form_id, field_id, allowed_file_ext_arr, max_size).upload_file_with_html5(file);
		});
	}else{
		new FileUploadProgress(widget_obj, form_id, field_id, allowed_file_ext_arr, max_size).upload_file();
	}
}

function FileUploadProgress(widget_obj, form_id, field_id, allowed_file_ext_arr, max_size){
	var file_input=$('input[type=file]', widget_obj);
	var filename_input=$('input[type=hidden]', widget_obj);
	var files_container=$('.emf-upload-files-container', widget_obj);

	var pbar;
    var file_item_obj;
	var iframe_obj;
	var xhr;
	
    var previous_progress;
    var finished;
    var canceled;

    var start_time;
    
    var debug=false;
    var log_id='emf-log-textarea';
	if(debug && $('#'+log_id).length==0){
		$(document.body).before("<textarea style='width:80%;height:300px;' id='"+log_id+"'></textarea>");
	}
	var log=$('#'+log_id);    
    
    var self=this;
    
    var get_progress_url=base_url+'forms/get_upload_progress';
    var get_unique_id_url=base_url+'forms/get_unique_id';
    var get_upload_error_url=base_url+'forms/get_upload_error';
    var upload_url=base_url+'forms/upload/'+form_id+"/"+field_id;
    var delete_cloud_file_url=base_url+'forms/delete_file_on_cloud';
    
    var uid_field_name='UPLOAD_IDENTIFIER';
	var file_input_name='file_data';
	
	this.log=function(message){
		if(debug){
			log.val(log.val()+message+"\n");
		}
	};
	
    this.upload_file_with_html5=function(file){
    	$.ajax({
			type: 'GET',
			url: get_unique_id_url,
			dataType: 'jsonp',
			data: {PHPSESSID: g_emf_session_id},
			cache: false,
			success: function (data) {
				var uid=data;
		    	
				finished=false;
	            self.update_ongoing_count(1);
	            
				file_item_obj=self.add_file(file['name'], true, uid);
				var pbar_class='emf-upload-progress-bar';
				pbar = $('.'+pbar_class, file_item_obj);
				if(pbar.length==0){
					file_item_obj.append('<div class="'+pbar_class+'"></div>');
				}
				pbar = $('.'+pbar_class, file_item_obj);
			    pbar.show().progressbar();
			    pbar.progressbar('value', 0);
			    
				var form_data = new FormData();
				form_data.append(uid_field_name, uid);
				form_data.append(file_input_name, file);
				
				xhr = new XMLHttpRequest();
				xhr.open('POST', upload_url+"/"+uid+"?PHPSESSID="+g_emf_session_id, true);
				xhr.upload.onprogress = function(e) {
					if (e.lengthComputable) {
						var value=(e.loaded / e.total) * 100;
						pbar.progressbar('value', value);
				    }
				};
				  
				xhr.onload = function(e) {
					finished = true;
			        pbar.progressbar('value', 100);
			        
			        if(debug){
			            self.log(uid+' Upload Complete. time cost:'+(new Date().getTime()-start_time));
			        }
			
			        self.get_upload_error(uid);
				};
				
				xhr.onerror = function(e){
					self.update_ongoing_count(-1);
					self.show_error('Error occurs while uploading.');
				};
				xhr.onabort = function(e){
					self.log('Aborted.');
				};
				
				xhr.send(form_data);
			}
		});
    	
    	emf_session_timeout_warner.set_timers();
    };
    
    this.upload_file = function(){
    	var filename=file_input.val().split('\\').pop().split('/').pop();
        $(document.body).append("<form method='post' enctype='multipart/form-data'></form>");
    	var form_obj=$("form:last");
    	form_obj.hide();
		
		form_obj.append('<input type="hidden" name="'+uid_field_name+'" value="">');

		file_input.prev().after(file_input.clone());
		
		form_obj.append(file_input);
		file_input.attr("name", file_input_name);
    	
    	form_obj.submit(function(){
            start_time=new Date().getTime();
            previous_progress=0;
            finished=false;
            self.update_ongoing_count(1);
            
            $.ajax({
				type: 'GET',
				url: get_unique_id_url,
				dataType: 'jsonp',
				data: {PHPSESSID: g_emf_session_id},
				cache: false,
				success: function (data) {
					var uid=data;

                   	file_item_obj=self.add_file(filename, true, uid);
        			var pbar_class='emf-upload-progress-bar';
        			pbar = $('.'+pbar_class, file_item_obj);
        			if(pbar.length==0){
        				file_item_obj.append('<div class="'+pbar_class+'"></div>');
        			}
        			pbar = $('.'+pbar_class, file_item_obj);
                    pbar.show().progressbar();
                    pbar.progressbar('value', 0);
                    
                    $('input[name='+uid_field_name+']', form_obj).val(uid);
                    //uid in url is necessary; in case of file size exceeds MAX_POST_SIZE, $_POST will be empty. And uid in $_POST is used by PHP extension.
                    form_obj.attr('action', upload_url+"/"+uid);
                    
            		var iframe_name='emf-upload-frame-'+uid;
            		$(document.body).append('<iframe style="display:none;" name="'+iframe_name+'"></iframe>');
            		iframe_obj=$('iframe[name='+iframe_name+']');
            		form_obj.attr('target', iframe_name);

                    iframe_obj.unbind('load').bind('load', function () {
                        if(canceled){
                        	self.log('Upload Canceled. time cost:'+(new Date().getTime()-start_time));
                        }else{
	                        finished = true;
	                        pbar.progressbar('value', 100);
	                        
	                        if(debug){
	                        	self.log(uid+' Upload Complete. time cost:'+(new Date().getTime()-start_time));
	                        }
	
	                        self.get_upload_error(uid);
                        }
                    });
                   		
					form_obj[0].submit();

                    setTimeout(function () {
                        self.update_progress(uid);
                    }, 500);
				}
          	});

			return false;
		});

    	form_obj.submit();
    	
    	emf_session_timeout_warner.set_timers();
	};
 
	this.update_progress=function(uid) {
	    if(debug){
	    	self.log(uid+' update progress:');
		}
		var time = new Date().getTime();
		
		$.ajax({
			type : 'GET',
			url : get_progress_url, 
			dataType: 'jsonp',
			cache: false,
			data : { 'UPLOAD_IDENTIFIER': uid, PHPSESSID: g_emf_session_id}, 
			success : function (data) {
				if(debug){
					self.log(uid+' progress:'+(data));
				}

			   	emf_session_timeout_warner.set_timers();
				
				if(finished){
					return;
				}
				
				var progress = parseInt(data, 10);
				if(previous_progress>0 && progress==0){
					progress=100;
					finished=true;
				}
				
				pbar.progressbar('value', progress);
			   	previous_progress=progress;

			   	if(debug){
			   		self.log(uid+' query progress time cost:'+(new Date().getTime()-time))
				}
			   	
			   	if (!finished) {
				    setTimeout(function () {
				    	self.update_progress(uid);
				    }, 500);
				}
			}
		});
    };

    this.show_error=function(error){
    	pbar.hide();
    	var control=$('.emf-upload-control', file_item_obj);
    	$('.emf-upload-status', file_item_obj).html("Error: "+error);
		
		self.remove_filename(control);
		control.html('Close').unbind('click').click(function(){
			self.remove_file(control);
		});	
    };
    
    this.get_upload_error=function(uid) {
    	$.ajax({
            type : 'GET',
            dataType: 'jsonp',
            url : get_upload_error_url+'/'+uid,
			data : {PHPSESSID: g_emf_session_id},
            cache: false,
            success : function (data) {
				var error=data;
				if(error){
					self.show_error(error);
				}else{
					pbar.hide();
					var control=$('.emf-upload-control', file_item_obj);
					control.html('Delete').unbind('click').click(function(){
						self.remove_file_and_filename(control);
					});
				}

				if(debug){
					self.log('status:'+ (error=='' ? 'success' : error));
				}
				
				self.update_ongoing_count(-1);
				
				post_message_for_frame_height();
			}
		});
    };

    this.cancel_upload=function(src_control){
        finished=true;
        canceled=true;
        self.update_ongoing_count(-1);
        
        if(xhr!=null){
        	xhr.abort();
        }else{
        	iframe_obj.attr('src','');
        }
        self.remove_file_and_filename(src_control);
    };

    this.is_cloud_file=function(filename){
    	return filename.match(/^https?:\/\//);
    };
    
    this.add_file=function(filename, is_uploading, uid){
    	is_uploading=is_uploading==null ? false : is_uploading;
    	
		files_container.append("<div class='emf-upload-progress'></div>");
		var file_item=$('.emf-upload-progress:last', files_container);
       	file_item.append("<a href='javascript:void(0)' class='emf-upload-control'></a>");
		var control=$('.emf-upload-control', file_item);
		control.html(is_uploading ? 'Cancel' : 'Delete');
		control.unbind('click').click(function(){
			is_uploading ? self.cancel_upload(control) : self.remove_file_and_filename(control);
		});
		
		var display_filename='';
		
		if(this.is_cloud_file(filename)){
			display_filename="<a href='"+filename+"' target='_blank'>"+filename+"</a>";
		}else{
			display_filename=filename;
		}
		file_item.append("<div class='emf-upload-file'>"+display_filename+"</div>");
        
		file_item.append("<div class='emf-upload-status'></div>");
		
		filename_input.val((filename_input.val().length>0 ? filename_input.val()+"\n" : "")+filename+(is_uploading ? "\t"+uid : ""));
		
		post_message_for_frame_height();
		return file_item;
    };

    this.remove_file_and_filename=function(src_control){
    	self.remove_filename(src_control);
    	self.remove_file(src_control);
    },
    
    this.remove_filename=function(src_control){
    	var file_item_obj=src_control.parents('.emf-upload-progress');
		var index=file_item_obj.index();
		var str_arr=filename_input.val().split("\n");
		str_arr.splice(index, 1)[0];
		
		filename_input.val(str_arr.join("\n"));
    },
    
    this.remove_file=function(src_control){
    	var file_item_obj=src_control.parents('.emf-upload-progress');
		file_item_obj.remove();
		
		post_message_for_frame_height();
    },
    
    this.update_ongoing_count=function(operand){
    	var form_obj=widget_obj.parents('form');
    	var count_attr="emf-upload-progress-ongoing-count";
    	var count=form_obj.attr(count_attr);
    	var original_count=count;
    	
    	count = count==null?0:parseInt(count);
    	count+=operand;
    	form_obj.attr(count_attr, count);
    	
    	$('input[type=submit], button[type=submit]', form_obj).attr("disabled", count>0);
    	self.log('ongiong count:'+count+", operand:"+operand+":"+original_count);
    }
}
;var empty_string="";

function refresh_current_page(){
	window.location.reload();
}

function show_message(msg){
	alert(msg);
}

function set_void(){
	return void(0);
}

function only_allow_enter_number(obj){
	if(isNaN(obj.value)){
		obj.value=empty_string;
	}
}

function hide_element_by_css(element) {
	$("#" + element).css("display", "none");
}

function show_element_by_css(element) {
	$("#" + element).css("display", "block");
}

function fix_base_site_url(){
	if("https:" == document.location.protocol){
		base_url=base_url.replace('http://','https://');
		site_url=site_url.replace('http://','https://');
	}
}

function get_site_url(uri,ssl){
	fix_base_site_url();
	var site_url_temp=ssl==1?site_url.replace('http://','https://'):site_url;
	return site_url_temp + '/' +uri;
}

function set_json_undefined_as_blank(json){
	$.each( json, function(i, n){
		if(n==null){
			json[i]='';
		}
	});
}

function clear_and_set_value(obj,value){
	$(obj).val(empty_string);
	$(obj).val(value);
}

function is_url(str,ignore_default){
	str=$.trim(str);
	if(ignore_default==true){
		if(str=='' || str=='http://' || str=='https://'){
			return true;
		}
	}
	if(str!=''){
		var strRegex = /^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
		var re = new RegExp(strRegex);
		return re.test(str);
	}
}

function is_email(str){
	if(str!=''){
		var strRegex = /^[0-9a-zA-Z_\-\+\.]+@[0-9a-zA-Z_\-]+(\.[0-9a-zA-Z_\-]+)*$/;
		var re = new RegExp(strRegex);
		return re.test(str);
	}
}

function set_corner(){
//	if($.browser.msie || $.browser.opera)  return;
//	$("#TB_title").corner('top');
//	$("#TB_window").corner();
//	$("#TB_ajaxContent").corner('bottom');
}

function set_tooltips() {
	$(".emf-tooltip").each(function(i){
		$(this).unbind('click').click(function(){
			if($(this).next().attr("id") == "emf-tooltip"){
				hide_tooltip(this.nextSibling);
			}else{
				show_tooltip(this);
			}
			return false
		});
	});
}

function show_tooltip(a) {
	if ($("#emf-tooltip").length) {
		hide_tooltip("#emf-tooltip")
	}
	var style = 'display: none;text-align:left;'
	if(a.id){
		style=style+'top:250px;left:550px;';
	}
	var b = "<table onclick=\"hide_tooltip(this);return false;\" id=\"emf-tooltip\" style=\""
			+ style + "\"><tr><td width='99%'>" + "<b>" + a.title + "</b></td><td width='1%' style='cursor:pointer;padding-right:4px;'>X</td></tr>"
			+ "<tr><td colspan='2'><em>" + (a.rel).replace('<','&lt;')
			+ "</em>" + "</td></tr></table>";
	$(b).insertAfter(a).show("fast");
}

function hide_tooltip(a) {
	$(a).fadeOut("fast", function() {
		$(this).remove();
	})
}

/* Form Data Guarder
 * When user is leaving current page and there're unchanged value in form, this function will prompt user.
 */
function FormDataGuarder(getDataStringCallBack){
	var myThis=this;
	this.ignored=false;

	function getDesc(dataObj){
		var result="";
		if(dataObj!=null){
			for(name in dataObj){
				result+=name+":"+dataObj[name]+"\n";
			}
		}
		return result;
	}

	function getValueOfControl(control){
		var result=null;
		if(control.tagName.toLowerCase()=='input' &&
				(control.type=='radio' || control.type=='checkbox') ){
			if(control.checked==true){
				result=control.value;
			}
		}else{
			result=control.value;
		}
		return result;
	}

	function hasChanges(){
		var result=false;

		var currFormData=getDataStringCallBack();
		result=previousData!=currFormData;

		return result;
	}

	function cloneObject(obj){
		var result=null;
		if(obj!=null){
			result=new Object();
			for(name in obj){
				result[name]=obj[name];
			}
		}
		return result;
	}

	function checkUnSavedChanges(e){
//		alert(formData.name);
//		alert(previousData+'\n\n'+getDataStringCallBack());
//		alert('ignored:'+myThis.ignored);
	    if (!myThis.ignored && hasChanges()){
	        return "YOU HAVEN'T SAVED YET AND YOU'LL BE ABANDONING YOUR CHANGES.";
	    }
	}
//	alert('ok');
	var previousData=getDataStringCallBack();
//	alert(previousData);

	window.onbeforeunload = checkUnSavedChanges;
}

function closeAllValidationPrompt(){
	$.validationEngine.closePrompt(".formError", true);
}

function validateForm(form_id){
	return $("#"+form_id).validationEngine({
		scroll	: false,
		returnIsValid : true
	});
}

function isEmail(email){
	var left_bracket_pos=email.indexOf('<');
	var right_bracket_pos=email.indexOf('>');
	if((left_bracket_pos!==-1) && (right_bracket_pos!==-1)){
		var new_email= email.substr(left_bracket_pos+1,right_bracket_pos-left_bracket_pos-1);
	}else{
		var new_email= email;
	}

	return /^[0-9a-zA-Z_\-\+\.]+@[0-9a-zA-Z_\-]+(\.[0-9a-zA-Z_\-]+)*$/.test(new_email);
}

var captcha_code_md5='';
function valid_captcha(){
	var temp_code=$.trim($('#captcha_code').val());
	return hex_md5(temp_code.toLowerCase())!=captcha_code_md5;
}
function get_valid_captcha(){
	$.ajax({
		url: get_site_url('forms/check_captcha_code_by_jsonp'),
		dataType: 'jsonp',
		data: {captcha_code:'', PHPSESSID: g_emf_session_id},
		success: function(response){
			response = response || {};
			captcha_code_md5=response.code;
			//debug_code=response.debug_code;
			//alert("code is:'"+debug_code+"'")
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("Error occurs when get captcha: "+textStatus);
		}
	});
}

var emf_session_forced=false;
function on_captcha_image_load(){
	if(!emf_session_forced && is_cookie_disabled()){
		emf_session_forced=true;
		$('#captcha_image').css('visibility','hidden');
		$('#captcha_image').attr("src", $('#captcha_image').attr("src")+"?PHPSESSID="+g_emf_session_id);
	}else{
		$('#captcha_image').css('visibility','visible');
		get_valid_captcha();
	}
}

//TODO remove
function force_cookie_for_captcha(){
	$(document.body).append('<iframe id="emf_safari_session_iframe" name="emf_safari_session_iframe" src="'+get_site_url('forms/force_safari_cookies')+'" style="display:none;"></iframe>'
			+'<form id="emf_safari_session_form" enctype="application/x-www-form-urlencoded" action="'+get_site_url('forms/force_safari_cookies')+'" target="emf_safari_session_iframe" method="post"></form>');
	$('#emf_safari_session_iframe').bind('load',function(){
		//alert('refreh:'+$(this.contentWindow.document.body).html())
		if($(this.contentWindow.document.body).html()=='POST'){
			$('#captcha_code_refresh').click();
		}
	});

	$('#emf_safari_session_form').submit();
}


function in_array(v,a){
	return jQuery.inArray(v,a)>=0;
}

/*
function load_location_by_ip(ip){
	$.ajax({
		url: 'http://ipinfodb.com/ip_query.php?output=json&callback=?',
		dataType: 'json',
		data: {'timezone':'false', 'ip':ip},
		success: function(data){
			var locations=[data['RegionName'],data['CountryName']];
			var str="";
			for(var i=0;i<locations.length;i++){
				if(locations[i]!=null && locations[i]!=null){
					if(str!=''){
						str+=", ";
					}
					str+=locations[i];
				}
			}

	  		//alert(str);
			$('#ip_location').html(str);
		}
	});
}
*/

function url_ex(caller,p){
	var ignore=true;
	if(p){
		ignore = p[0]!='required'
	}
	return ! is_url($(caller).val(),ignore);
}

function escape_html_tag(html){
	if(html==null){
		return html;
	}

	html=html.replace(/</g, '&lt;');
	html=html.replace(/>/g, '&gt;');
	return html;
}

function escape_script_tag(html){
	if(html==null){
		return html;
	}

	html=html.replace(/<script>/gi, '&lt;script&gt;');
	html=html.replace(/<\/script>/gi, '&lt;/script&gt;');
	return html;
}

function get_safe_html(html){
	if(html==null){
		return null;
	}

	html=html.replace(/</g, '&lt;');
	html=html.replace(/>/g, '&gt;');
	html=html.replace(/"/g, '&quot;');
	html=html.replace(/'/g, '&apos;');
	return html;
}

function array_remove(arr, to_remove_arr){
	if(arr==null || to_remove_arr==null){
		return arr;
	}
	var result=new Array();
	for(var i=0;i<arr.length;i++){
		if(jQuery.inArray(arr[i], to_remove_arr)==-1){
			result[result.length]=arr[i];
		}
	}
	return result;
}
function show_choice(src_element){
	var tab_index=-1;
	var count=0;
	$(src_element).parent().find(src_element.tagName).each(function(){
		if(src_element==this){
			tab_index=count;
			return false;
		}
		count++;
	});

	$(src_element).parent().find('.emf-my-choices').each(function(index, value){
		$(this).find('input,select,textarea').attr('disabled',tab_index!=index);
		$(this).toggle(tab_index==index);
	});
}

var my_events_listeners=new Object();
function fire_my_event(event, stop_on_first_error){
	stop_on_first_error=stop_on_first_error==null?false:stop_on_first_error;

	var listeners=my_events_listeners[event];
	var result=new Array();
	if(listeners!=null){
		for(var i=0;i<listeners.length;i++){
			var error=listeners[i].apply(null, arguments);
			if(error){
				result[result.length]=error;
			}
			if(stop_on_first_error && error){
				break;
			}
		}
	}
	return result;
}

function add_my_listener(event, func){
	var listeners=my_events_listeners[event];
	if(listeners==null){
		listeners=[];
		my_events_listeners[event]=listeners;
	}
	listeners.push(func);
}
function clone(obj) {
	var result = jQuery.extend(true, {}, obj);
	return result;
}
function plain_to_html(v){
	return v.replace(/</gi,'&lt;').replace(/>/gi,'&gt;');
}
function html_to_plain(v){
	return v.replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&amp;/gi,'&');
}
function set_form_hidden_field(form_obj, name, value){
	if($('input[name='+name+']', form_obj).length==0){
		$(form_obj).append("<input type='hidden' name='"+name+"'>");
	}
	$('input[name='+name+']', form_obj).val(value);
}

function submit_form(form, fire_onsubmit){
	fire_onsubmit= fire_onsubmit==null ? false : fire_onsubmit;

	if(fire_onsubmit && form.onsubmit!=null && form.onsubmit()){
		form.submit();
	}else{
		form.submit();
	}
}

function highlight_field(li_obj, not_focus){
	/*
	not_focus= not_focus==null?false:not_focus;
	if(!not_focus){
		$(li_obj).find("input[type!=submit][type!=reset][type!=image]:visible, textarea:visible, select:visible").each(function(){
			if(!this.disabled){
				this.click();
				return false;
			}
		});
	}*/
	var editable=$(li_obj).hasClass("data_container");

	if(editable){
		var class_name='highlight-field';
		$(li_obj).parent('ul').find('li').removeClass(class_name);
		$(li_obj).addClass(class_name);
	}
}
function highlight_field_on_focus(){
	highlight_field($(this).parents('li')[0], true);
}
function highlight_field_on_mousedown(event){
	var not_focus=false;
	if(event.target && event.target.tagName){
		not_focus=$.inArray(event.target.tagName.toLowerCase(), ['input','textarea','select'])>-1;
	}
	highlight_field(this, not_focus);
}

function log_for_debug(msg){
	var id="log_for_debug_div";
	var obj=null;
	if($("#"+id).length==0){
		obj=$(document.body).append("<div id='"+id+"' style='border:1px solid gray;margin:10px;'></div>");
	}
	obj=$("#"+id);

	obj.html(obj.html()+"<BR>"+msg);
}

function get_frame_height(adjust_height){
	var scroll_height = get_scroll_height();
	var client_height = get_client_height();

	var result;
	if(scroll_height === undefined){
		result = "100%";
	}else if  (Math.abs(scroll_height - client_height) > 0){
		//result = (scroll_height + 20) ;//margin defaut is 8px
		result = scroll_height;
		if(adjust_height){
			result+=adjust_height;
		}
		result+="px";
	}
	return result;
};

function get_scroll_height(){
	var height;
	var margin=$(document.body).outerHeight(true) - $(document.body).outerHeight();
	try{
		//alert("document.height:"+document.height+", document.body.scrollHeight:"+document.body.scrollHeight+", document.body.offsetHeight:"+document.body.offsetHeight+", document.documentElement.scrollHeight:"+document.documentElement.scrollHeight+", margin:"+margin)
		if (document.body){
			if (document.body.scrollHeight){
				height = document.body.scrollHeight;
			}else if (document.body.offsetHeight){
				height = document.body.offsetHeight;
			}
			height+=margin;
		}else if (document.documentElement && document.documentElement.scrollHeight){
			height = document.documentElement.scrollHeight;
			//alert('document.documentElement:'+height);
		}else if (document.height){
			height = document.height;
			//alert('document.height:'+height);
		}
	}catch(e){alert('error:'+e)}
	return height;
};

function get_client_height(){
	var height = 0;
	try{
		if(window.innerHeight){
			height = window.innerHeight - 18;
		}else if ((document.documentElement) && (document.documentElement.clientHeight)){
			height = document.documentElement.clientHeight;
		}else if ((document.body) && (document.body.clientHeight)){
			height = document.body.clientHeight;
		}
	}catch(e){}
	return height;
};

function get_frame_width(adjust_width){
	var scroll_width = get_scroll_width();
	var client_width = get_client_width();

	var result;
	if(scroll_width === undefined){
		result = "100%";
	}else if  (Math.abs(scroll_width - client_width) > 0){
		result = scroll_width;
		if(adjust_width){
			result+=adjust_width;
		}
		result+="px";
	}
	return result;
};

function get_scroll_width(){
	var width;
	var margin=$(document.body).outerWidth(true) - $(document.body).outerWidth();
	try{
		//alert("document.width:"+document.width+", document.body.scrollWidth:"+document.body.scrollWidth+", document.body.offsetWidth:"+document.body.offsetWidth+", document.documentElement.scrollWidth:"+document.documentElement.scrollWidth)
		//Unlike get_scroll_height, we prefer document.documentElement.scrollWidth after test it on multiple browsers.
		if(document.documentElement && document.documentElement.scrollWidth){
			width = document.documentElement.scrollWidth;
			//alert('document.documentElement:'+width)
		}else if (document.width){
			width = document.width;
			//alert('document.width:'+width)
		} else if (document.body){
			if (document.body.scrollWidth){
				width = document.body.scrollWidth;
			}else if (document.body.offsetWidth){
				width = document.body.offsetWidth;
			}
			width+=margin;
		}
	}catch(e){alert('error:'+e)}
	return width;
};

function get_client_width(){
	var width = 0;
	try{
		if(window.innerWidth){
			width = window.innerWidth - 18;
		}else if ((document.documentElement) && (document.documentElement.clientWidth)){
			width = document.documentElement.clientWidth;
		}else if ((document.body) && (document.body.clientWidth)){
			width = document.body.clientWidth;
		}
	}catch(e){}
	return width;
};

function show_element_of_group(element_selector, group_selector){
	$(group_selector).css('display','none').find(':input').attr('disabled',true);

	$(element_selector).css('display','block').find(':input').attr('disabled',false);
}

function get_null_safe_string(str){
	return str==null?"":str;
}

function get_validation_class(element){
	var result='';
	var control_obj=$(element);
	var class_str=control_obj.attr('class');
	if(class_str){
		var reg_exp = /(validate\[.*\])/;
		var reg_exp_result=reg_exp.exec(class_str);
		if(reg_exp_result && reg_exp_result.length>=2){
			result=reg_exp_result[1];
		}
	}
	return result;
}

function close_validation_prompt(){
	$.validationEngine.closePrompt(".formError",true);
}

function has_property(obj){
	var result=false;
	for(key in obj){
		result=true;
		break;
	}
	return result;
}

function post_message_for_frame_height(){
	var parent_url = decodeURIComponent(document.location.hash.replace(/^#/, ''));
	//alert('ok:'+get_frame_height()+":"+ parent_url+":"+$(document.body).is(":visible"))

	var frame_height=get_frame_height();
	if(!frame_height){
		//if embeded jsform is not visible when page loaded (e.g. embeded in a Javascript-Tab), we'll get null for frame height, so start the Timer. see 0002571
		setTimeout(post_message_for_frame_height, 500);
	}else{
		XD.postMessage(frame_height, parent_url, parent);
	}
}

function post_message_for_frame_dimension(id){
	//alert('ok:'+get_frame_width()+":"+get_frame_height()+":"+$(document.body).is(":visible"));
	var frame_width=get_frame_width();
	var frame_height=get_frame_height();
	if(!frame_width || !frame_height){
		setTimeout(function(){post_message_for_frame_dimension(id)}, 500);
	}else{
		var parent_url = decodeURIComponent(document.location.hash.replace(/^#/, ''));
		XD.postMessage(id+","+frame_width+","+frame_height, parent_url, parent);
	}
}

function show_thick_box(button_id){
	//tb_remove(true);

	$('#'+button_id).click();
	set_corner();
	$('#TB_ajaxContent .TB_content .TB_content_button').css({"margin":"30px auto 0 auto","text-align": "center"});
}

function is_scrolled_into_view(elem) {
    var doc_view_top = $(window).scrollTop(),
    	doc_view_bottom = doc_view_top + $(window).height(),
    	element_top = $(elem).offset().top,
    	element_bottom = element_top + $(elem).height();

   	return element_top >= doc_view_top && element_bottom <= doc_view_bottom;
}
function has_margin_to_view_bottom(elem, margin) {
    var doc_view_top = $(window).scrollTop(),
		doc_view_bottom = doc_view_top + $(window).height(),
		element_top = $(elem).offset().top,
		element_bottom = element_top + $(elem).height();

	return element_bottom + margin <= doc_view_bottom;
}
function has_margin_to_view_top(elem, margin) {
    var doc_view_top = $(window).scrollTop(),
		doc_view_bottom = doc_view_top + $(window).height(),
		element_top = $(elem).offset().top,
		element_bottom = element_top + $(elem).height();

	return element_top - margin >= doc_view_top;
}
function get_url_parameter(param_name) {
	var search_string = window.location.search.substring(1);
	var params = search_string.split("&");

	for (var i=0;i<params.length;i++) {
		var val = params[i].split("=");
		if (val[0] == param_name) {
			return unescape(val[1]);
		}
	}
	return null;
}
function trim_quote_blank(str){
	var result=$.trim(str);
	if(result!=null && result.length>=2){
		quote_chars=['"',"'"];
		$.each(quote_chars, function(){
			if(result.charAt(0)==this && result.charAt(result.length-1)==this){
				result=result.substr(1, result.length-2);
				return false;
			};
		});
	}
	return result;
}
function get_css_attribute(css_str, param_name) {
	if(css_str){
		var attributes = css_str.split(";");

		for (var i=0;i<attributes.length;i++) {
			var val = attributes[i].split(":");
			if (val[0] && param_name && $.trim(val[0].toLowerCase()) == $.trim(param_name.toLowerCase())) {
				return trim_quote_blank(val[1]);
			}
		}
	}
	return null;
}
function select_item_in_group(selected_item_obj, group_selector, selected_class){
	selected_class=selected_class==null?"selected":selected_class;

	$(group_selector).removeClass(selected_class);
	$(selected_item_obj).addClass(selected_class);
}
function select_item_in_group_by_index(selected_index, group_selector, selected_class){
	select_item_in_group($(group_selector).eq(selected_index), group_selector, selected_class);
}
function is_empty_str(str){
	return str=null || str=='';
}
function is_empty_mysql_date(mysql_date_str){
	return is_empty_str(mysql_date_str) || mysql_date_str=='0000-00-00 00:00:00';
}
function left_trim_char(str, to_trim_char){
	if(str==null){
		return null;
	}
	var result='';
	var i;
	for(i=0;i<str.length;i++){
		var char=str.charAt(i);
		if(char!=to_trim_char){
			break;
		}
	}
	result=str.substr(i);
	return result;
}
function left_pad_char(str, to_pad_char, target_str_length){
	str = str==null ? "" : str;
	var result=str;
	for(var i=0;i<target_str_length-str.length;i++){
		result=to_pad_char+result;
	}
	return result;
}

function nl2br(value) {
	if(value){
		return value.replace(/\n/g, "<br/>");
	}else{
		return value;
	}
}

function show_ckeditor(editor_obj, properties){
	//Need to destroy then create otherwise the editor will be locked.
	editor_obj.each(function(){
		var id=$(this).attr("id");
		var name=$(this).attr("name");
		var instance_id=id ? id : name;

		if(CKEDITOR.instances[instance_id]){
			CKEDITOR.instances[instance_id].destroy();
		}
	});
	editor_obj.ckeditor(properties);
}

function is_allowed_file(filename, allowed_file_ext_arr){
	var result=true;
	if(!allowed_file_ext_arr){
		return result;
	}
	
	var parts=filename.split('.');
	var extension=null;
	if(parts.length>1){
		extension=parts.pop();
    }
	if(!extension){
		result=false;
	}else{
		result=$.inArray(extension.toLowerCase(), allowed_file_ext_arr)>-1;
	}
	return result;
}

function check_file_type_error(caller, params){
	var allowed_file_ext_arr=null;
	if(params && params[0]){
		allowed_file_ext_arr=params[0].split("|");
	}
	var file_type_desc=allowed_file_ext_arr.join(", ");
	return {"is_error": !is_allowed_file($(caller).val(),allowed_file_ext_arr), "message": "* Invalid file type, \""+file_type_desc+"\" allowed."};
}

function check_file_size_error(caller, params){
	var result={"is_error": false, "message": ""};
	var max_size=null;
	var max_size_in_byte=null;
	if(params && params[0]){
		max_size=params[0];
		var max_size_in_byte=get_byte_length(max_size);
	}
	
	if(caller.files){
		for(var i=0;i<caller.files.length;i++){
			var file=caller.files[i];
			if(file.size>max_size_in_byte){
				result={"is_error": true, "message": "* File size is too large, maximum "+max_size+" allowed"};
				break;
			}
		}
	}
	return result;
}

function check_file_error(caller, params){
	var is_error=false;
	var message="";
//	console.log(params);
	var allowed_file_ext_arr=null;
	if(params && params[0]){
		allowed_file_ext_arr=params[0].split("|");
	}
//	console.log("allowed_file_ext_arr:"+allowed_file_ext_arr);
	if(allowed_file_ext_arr && allowed_file_ext_arr!='null' && !/^[0-9]+M$/.exec(allowed_file_ext_arr)){
		var file_type_desc=allowed_file_ext_arr.join(", ");
		var is_error=!is_allowed_file($(caller).val(),allowed_file_ext_arr);
		if(is_error){
			message+=(message?"<BR>":"")+"* Invalid file type, \""+file_type_desc+"\" allowed.";
		}
	}

	var max_size=null;
	var max_size_in_byte=null;
	if(params && params[1]){
		max_size=params[1];
		var max_size_in_byte=get_byte_length(max_size);
	}
	
	if(caller.files && max_size_in_byte>0){
		for(var i=0;i<caller.files.length;i++){
			var file=caller.files[i];
			if(file.size>max_size_in_byte){
				is_error=true;
				message+=(message?"<BR>":"")+"* File size is too large, maximum "+max_size+" allowed";
				break;
			}
		}
	}
	return {"is_error": is_error, "message": message};
}

function get_byte_length(length_str){
	var str=$.trim(length_str.toUpperCase());
	var unit=str.substr(str.length-1);
	var times=1;
	switch (unit){
		case 'B':
			times=1;
			break;
		case 'K':
			times=1024;
			break;
		case 'M':
			times=1024*1024;
			break;
		case 'G':
			times=1024*1024*1024;
			break;
		default:
			times=0;
	}
	nubmer=str.substr(0,str.length-1);
	result=nubmer*times;
	return result;
}

function support_html5_upload(){
	var result=false;
	try{
		result=FormData!=null;
	}catch(E){
	}
	return result;
}

function do_smart_captcha_for_login(form_obj){
	$('#my-recaptcha-container').hide();
	
	form_obj.append("<input type='hidden' name='javascript_executed' value='true'>");
	$.ajax({
		url: get_site_url('authenticator/if_show_smart_captcha'),
		dataType: 'jsonp',
		data: {dummy:'dummy'},
		success: function(response){
			var show_captcha=response;
			$('#my-recaptcha-container').toggle(show_captcha);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			//alert('Smart Captcha Error: '+textStatus+"\n"+errorThrown);
		}
	});
}
function capitalize_first_char(str){
	if(str==null){
		return str;
	}
	var result=str.slice(0,1).toUpperCase()+str.slice(1,str.length);
	return result;
}

//Compatible on JQuery1.4 and 1.7
function get_property(element, name){
	return $(element).prop ? $(element).prop(name) : $(element).attr(name);
}

function get_cookie(c_name){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++){
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");
	  if (x==c_name){
	    return unescape(y);
	  }
	}
}

function set_cookie(c_name,value,exdays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

;
var XD=function(){var interval_id,last_hash,cache_bust=1,attached_callback,window=this;return{postMessage:function(message,target_url,target){if(!target_url){return}target=target||parent;if(window['postMessage']){target['postMessage'](message,target_url.replace(/([^:]+:\/\/[^\/]+).*/,'$1'))}else if(target_url){target.location=target_url.replace(/#.*$/,'')+'#'+(+new Date)+(cache_bust++)+'&'+message}},receiveMessage:function(callback,source_origin){if(window['postMessage']){if(callback){attached_callback=function(e){if((typeof source_origin==='string'&&e.origin!==source_origin)||(Object.prototype.toString.call(source_origin)==="[object Function]"&&source_origin(e.origin)===!1)){return!1}callback(e)}}if(window['addEventListener']){window[callback?'addEventListener':'removeEventListener']('message',attached_callback,!1)}else{window[callback?'attachEvent':'detachEvent']('onmessage',attached_callback)}}else{interval_id&&clearInterval(interval_id);interval_id=null;if(callback){interval_id=setInterval(function(){var hash=document.location.hash,re=/^#?\d+&/;if(hash!==last_hash&&re.test(hash)){last_hash=hash;callback({data:hash.replace(re,'')})}},100)}}}}}();;// ColorBox v1.3.17.2 - a full featured, light-weight, customizable lightbox based on jQuery 1.3+
// Copyright (c) 2011 Jack Moore - jack@colorpowered.com
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
(function(a,b,c){function bc(b){if(!U){P=b,_(),y=a(P),Q=0,K.rel!=="nofollow"&&(y=a("."+g).filter(function(){var b=a.data(this,e).rel||this.rel;return b===K.rel}),Q=y.index(P),Q===-1&&(y=y.add(P),Q=y.length-1));if(!S){S=T=!0,r.show();if(K.returnFocus)try{P.blur(),a(P).one(l,function(){try{this.focus()}catch(a){}})}catch(c){}q.css({opacity:+K.opacity,cursor:K.overlayClose?"pointer":"auto"}).show(),K.w=Z(K.initialWidth,"x"),K.h=Z(K.initialHeight,"y"),X.position(),o&&z.bind("resize."+p+" scroll."+p,function(){q.css({width:z.width(),height:z.height(),top:z.scrollTop(),left:z.scrollLeft()})}).trigger("resize."+p),ba(h,K.onOpen),J.add(D).hide(),I.html(K.close).show()}X.load(!0)}}function bb(){var a,b=f+"Slideshow_",c="click."+f,d,e,g;K.slideshow&&y[1]?(d=function(){F.text(K.slideshowStop).unbind(c).bind(j,function(){if(Q<y.length-1||K.loop)a=setTimeout(X.next,K.slideshowSpeed)}).bind(i,function(){clearTimeout(a)}).one(c+" "+k,e),r.removeClass(b+"off").addClass(b+"on"),a=setTimeout(X.next,K.slideshowSpeed)},e=function(){clearTimeout(a),F.text(K.slideshowStart).unbind([j,i,k,c].join(" ")).one(c,d),r.removeClass(b+"on").addClass(b+"off")},K.slideshowAuto?d():e()):r.removeClass(b+"off "+b+"on")}function ba(b,c){c&&c.call(P),a.event.trigger(b)}function _(b){K=a.extend({},a.data(P,e));for(b in K)a.isFunction(K[b])&&b.substring(0,2)!=="on"&&(K[b]=K[b].call(P));K.rel=K.rel||P.rel||"nofollow",K.href=K.href||a(P).attr("href"),K.title=K.title||P.title,typeof K.href=="string"&&(K.href=a.trim(K.href))}function $(a){return K.photo||/\.(gif|png|jpg|jpeg|bmp)(?:\?([^#]*))?(?:#(\.*))?$/i.test(a)}function Z(a,b){return Math.round((/%/.test(a)?(b==="x"?z.width():z.height())/100:1)*parseInt(a,10))}function Y(c,d,e){e=b.createElement("div"),c&&(e.id=f+c),e.style.cssText=d||"";return a(e)}var d={transition:"elastic",speed:300,width:!1,initialWidth:"600",innerWidth:!1,maxWidth:!1,height:!1,initialHeight:"450",innerHeight:!1,maxHeight:!1,scalePhotos:!0,scrolling:!0,inline:!1,html:!1,iframe:!1,fastIframe:!0,photo:!1,href:!1,title:!1,rel:!1,opacity:.9,preloading:!0,current:"image {current} of {total}",previous:"previous",next:"next",close:"close",open:!1,returnFocus:!0,loop:!0,slideshow:!1,slideshowAuto:!0,slideshowSpeed:2500,slideshowStart:"start slideshow",slideshowStop:"stop slideshow",onOpen:!1,onLoad:!1,onComplete:!1,onCleanup:!1,onClosed:!1,overlayClose:!0,escKey:!0,arrowKey:!0,top:!1,bottom:!1,left:!1,right:!1,fixed:!1,data:!1},e="colorbox",f="cbox",g=f+"Element",h=f+"_open",i=f+"_load",j=f+"_complete",k=f+"_cleanup",l=f+"_closed",m=f+"_purge",n=a.browser.msie&&!a.support.opacity,o=n&&a.browser.version<7,p=f+"_IE6",q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X;X=a.fn[e]=a[e]=function(b,c){var f=this;b=b||{};if(!f[0]){if(f.selector)return f;f=a("<a/>"),b.open=!0}c&&(b.onComplete=c),f.each(function(){a.data(this,e,a.extend({},a.data(this,e)||d,b)),a(this).addClass(g)}),(a.isFunction(b.open)&&b.open.call(f)||b.open)&&bc(f[0]);return f},X.init=function(){z=a(c),r=Y().attr({id:e,"class":n?f+(o?"IE6":"IE"):""}),q=Y("Overlay",o?"position:absolute":"").hide(),s=Y("Wrapper"),t=Y("Content").append(A=Y("LoadedContent","width:0; height:0; overflow:hidden"),C=Y("LoadingOverlay").add(Y("LoadingGraphic")),D=Y("Title"),E=Y("Current"),G=Y("Next"),H=Y("Previous"),F=Y("Slideshow").bind(h,bb),I=Y("Close")),s.append(Y().append(Y("TopLeft"),u=Y("TopCenter"),Y("TopRight")),Y(!1,"clear:left").append(v=Y("MiddleLeft"),t,w=Y("MiddleRight")),Y(!1,"clear:left").append(Y("BottomLeft"),x=Y("BottomCenter"),Y("BottomRight"))).children().children().css({"float":"left"}),B=Y(!1,"position:absolute; width:9999px; visibility:hidden; display:none"),a("body").prepend(q,r.append(s,B)),t.children().hover(function(){a(this).addClass("hover")},function(){a(this).removeClass("hover")}).addClass("hover"),L=u.height()+x.height()+t.outerHeight(!0)-t.height(),M=v.width()+w.width()+t.outerWidth(!0)-t.width(),N=A.outerHeight(!0),O=A.outerWidth(!0),r.css({"padding-bottom":L,"padding-right":M}).hide(),G.click(function(){X.next()}),H.click(function(){X.prev()}),I.click(function(){X.close()}),J=G.add(H).add(E).add(F),t.children().removeClass("hover"),q.click(function(){K.overlayClose&&X.close()}),a(b).bind("keydown."+f,function(a){var b=a.keyCode;S&&K.escKey&&b===27&&(a.preventDefault(),X.close()),S&&K.arrowKey&&y[1]&&(b===37?(a.preventDefault(),H.click()):b===39&&(a.preventDefault(),G.click()))})},X.remove=function(){r.add(q).remove(),a("."+g).removeData(e).removeClass(g)},X.position=function(a,c){function g(a){u[0].style.width=x[0].style.width=t[0].style.width=a.style.width,C[0].style.height=C[1].style.height=t[0].style.height=v[0].style.height=w[0].style.height=a.style.height}var d=0,e=0;z.unbind("resize."+f),r.hide(),K.fixed&&!o?r.css({position:"fixed"}):(d=z.scrollTop(),e=z.scrollLeft(),r.css({position:"absolute"})),K.right!==!1?e+=Math.max(z.width()-K.w-O-M-Z(K.right,"x"),0):K.left!==!1?e+=Z(K.left,"x"):e+=Math.round(Math.max(z.width()-K.w-O-M,0)/2),K.bottom!==!1?d+=Math.max(b.documentElement.clientHeight-K.h-N-L-Z(K.bottom,"y"),0):K.top!==!1?d+=Z(K.top,"y"):d+=Math.round(Math.max(b.documentElement.clientHeight-K.h-N-L,0)/2),r.show(),a=r.width()===K.w+O&&r.height()===K.h+N?0:a||0,s[0].style.width=s[0].style.height="9999px",r.dequeue().animate({width:K.w+O,height:K.h+N,top:d,left:e},{duration:a,complete:function(){g(this),T=!1,s[0].style.width=K.w+O+M+"px",s[0].style.height=K.h+N+L+"px",c&&c(),setTimeout(function(){z.bind("resize."+f,X.position)},1)},step:function(){g(this)}})},X.resize=function(a){if(S){a=a||{},a.width&&(K.w=Z(a.width,"x")-O-M),a.innerWidth&&(K.w=Z(a.innerWidth,"x")),A.css({width:K.w}),a.height&&(K.h=Z(a.height,"y")-N-L),a.innerHeight&&(K.h=Z(a.innerHeight,"y"));if(!a.innerHeight&&!a.height){var b=A.wrapInner("<div style='overflow:auto'></div>").children();K.h=b.height(),b.replaceWith(b.children())}A.css({height:K.h}),X.position(K.transition==="none"?0:K.speed)}},X.prep=function(b){function h(){K.h=K.h||A.height(),K.h=K.mh&&K.mh<K.h?K.mh:K.h;return K.h}function g(){K.w=K.w||A.width(),K.w=K.mw&&K.mw<K.w?K.mw:K.w;return K.w}if(!!S){var c,d=K.transition==="none"?0:K.speed;A.remove(),A=Y("LoadedContent").append(b),A.hide().appendTo(B.show()).css({width:g(),overflow:K.scrolling?"auto":"hidden"}).css({height:h()}).prependTo(t),B.hide(),a(R).css({"float":"none"}),o&&a("select").not(r.find("select")).filter(function(){return this.style.visibility!=="hidden"}).css({visibility:"hidden"}).one(k,function(){this.style.visibility="inherit"}),c=function(){function o(){n&&r[0].style.removeAttribute("filter")}var b,c,g,h,i=y.length,k,l;!S||(l=function(){clearTimeout(W),C.hide(),ba(j,K.onComplete)},n&&R&&A.fadeIn(100),D.html(K.title).add(A).show(),i>1?(typeof K.current=="string"&&E.html(K.current.replace("{current}",Q+1).replace("{total}",i)).show(),G[K.loop||Q<i-1?"show":"hide"]().html(K.next),H[K.loop||Q?"show":"hide"]().html(K.previous),b=Q?y[Q-1]:y[i-1],g=Q<i-1?y[Q+1]:y[0],K.slideshow&&F.show(),K.preloading&&(h=a.data(g,e).href||g.href,c=a.data(b,e).href||b.href,h=a.isFunction(h)?h.call(g):h,c=a.isFunction(c)?c.call(b):c,$(h)&&(a("<img/>")[0].src=h),$(c)&&(a("<img/>")[0].src=c))):J.hide(),K.iframe?(k=a("<iframe/>").addClass(f+"Iframe")[0],K.fastIframe?l():a(k).one("load",l),k.name=f+ +(new Date),k.src=K.href,K.scrolling||(k.scrolling="no"),n&&(k.frameBorder=0,k.allowTransparency="true"),a(k).appendTo(A).one(m,function(){k.src="//about:blank"})):l(),K.transition==="fade"?r.fadeTo(d,1,o):o())},K.transition==="fade"?r.fadeTo(d,0,function(){X.position(0,c)}):X.position(d,c)}},X.load=function(b){var c,d,e=X.prep;T=!0,R=!1,P=y[Q],b||_(),ba(m),ba(i,K.onLoad),K.h=K.height?Z(K.height,"y")-N-L:K.innerHeight&&Z(K.innerHeight,"y"),K.w=K.width?Z(K.width,"x")-O-M:K.innerWidth&&Z(K.innerWidth,"x"),K.mw=K.w,K.mh=K.h,K.maxWidth&&(K.mw=Z(K.maxWidth,"x")-O-M,K.mw=K.w&&K.w<K.mw?K.w:K.mw),K.maxHeight&&(K.mh=Z(K.maxHeight,"y")-N-L,K.mh=K.h&&K.h<K.mh?K.h:K.mh),c=K.href,W=setTimeout(function(){C.show()},100),K.inline?(Y().hide().insertBefore(a(c)[0]).one(m,function(){a(this).replaceWith(A.children())}),e(a(c))):K.iframe?e(" "):K.html?e(K.html):$(c)?(a(R=new Image).addClass(f+"Photo").error(function(){K.title=!1,e(Y("Error").text("This image could not be loaded"))}).load(function(){var a;R.onload=null,K.scalePhotos&&(d=function(){R.height-=R.height*a,R.width-=R.width*a},K.mw&&R.width>K.mw&&(a=(R.width-K.mw)/R.width,d()),K.mh&&R.height>K.mh&&(a=(R.height-K.mh)/R.height,d())),K.h&&(R.style.marginTop=Math.max(K.h-R.height,0)/2+"px"),y[1]&&(Q<y.length-1||K.loop)&&(R.style.cursor="pointer",R.onclick=function(){X.next()}),n&&(R.style.msInterpolationMode="bicubic"),setTimeout(function(){e(R)},1)}),setTimeout(function(){R.src=c},1)):c&&B.load(c,K.data,function(b,c,d){e(c==="error"?Y("Error").text("Request unsuccessful: "+d.statusText):a(this).contents())})},X.next=function(){!T&&y[1]&&(Q<y.length-1||K.loop)&&(Q=Q<y.length-1?Q+1:0,X.load())},X.prev=function(){!T&&y[1]&&(Q||K.loop)&&(Q=Q?Q-1:y.length-1,X.load())},X.close=function(){S&&!U&&(U=!0,S=!1,ba(k,K.onCleanup),z.unbind("."+f+" ."+p),q.fadeTo(200,0),r.stop().fadeTo(300,0,function(){r.add(q).css({opacity:1,cursor:"auto"}).hide(),ba(m),A.remove(),setTimeout(function(){U=!1,ba(l,K.onClosed)},1)}))},X.element=function(){return a(P)},X.settings=d,V=function(a){a.button!==0&&typeof a.button!="undefined"||a.ctrlKey||a.shiftKey||a.altKey||(a.preventDefault(),bc(this))},a.fn.delegate?a(b).delegate("."+g,"click",V):a("."+g).live("click",V),a(X.init)})(jQuery,document,this);;
function apply_rules(){
	for(key in emf_group_to_field_rules_map){
		var field_rules=emf_group_to_field_rules_map[key];
		do_action(field_rules[0], eval_conditions(field_rules));
	}
	
	for(key in emf_group_to_page_rules_for_confirmation_map){
		var page_rules=emf_group_to_page_rules_for_confirmation_map[key];
		toggle_captcha(eval_conditions(page_rules));
	}
}
function eval_conditions(field_rules){
	var exp="";
	for(var i=0;i<field_rules.length;i++){
		if(i>0){
			exp+=field_rules[i]["AndOr"]=="1"? "&&" : "||";
		}
		exp+=eval_condition(field_rules[i])? "true" : "false";
	}
	return eval(exp);
}

function eval_condition(field_rule){
	var result=false;
	var condition_field_get_value_js=emf_widgets[field_rule['ConditionFieldWidgetName']];
	if(condition_field_get_value_js){
		var condition_field_value=condition_field_get_value_js(field_rule['ConditionFieldIndex']);
		var func=emf_condition_id_to_js_map[field_rule['Operation']];
	
		result=func(get_null_safe_string(condition_field_value), get_null_safe_string(field_rule['Value']));
	}
	return result;
}

function toggle_emf_element(element_obj, visible){
	element_obj.toggle(visible);
	if(!visible){
		$.merge(element_obj, $("[class*=validate]", element_obj)).each(function(index, element){
			var validation_class=get_validation_class(element);
			$(element).attr('temp_validation_def', get_validation_class(element)).removeClass(validation_class);
		});
		close_validation_prompt();
	}else{
		$.merge(element_obj, $("[temp_validation_def]", element_obj)).each(function(index, element){
			var temp_validation_def=$(element).attr("temp_validation_def");
			if(temp_validation_def){
				$(element).addClass(temp_validation_def);
			}
		});
	}
}

function do_action(field_rule, condition_result){
	var visible= (field_rule['ResultAction']=='1') == condition_result;
	var element_obj=$("#emf-li-"+field_rule['ResultContentIndex']);
	toggle_emf_element(element_obj, visible);
}

function delete_file(element_name, hide_block){
	hide_block.hide();
	$('#'+element_name).show().attr('disabled',false).attr('class', $('#'+element_name).attr('temp_class'));
}

var emf_captcha_visible_by_rules=true;
function toggle_captcha(visible){
	toggle_emf_element($('#emf-li-captcha, #emf-li-recaptcha'), visible);
	emf_captcha_visible_by_rules=visible;
	
	post_message_for_frame_height();
}

function init_rules(){
	/* DatePicker need onchange() event to fire */
	/* removed keyup(apply_rules) for 0003322 */
	$('input[type=text], input[type=password], textarea', $('#emf-form')).blur(apply_rules).change(apply_rules);
	$('input[type=radio], input[type=checkbox], input[type=submit], input[type=hidden], input[type=file], select', $('#emf-form')).change(apply_rules);
	
	apply_rules();
}

function do_smart_captcha(form_id){
	$('#emf-form').append("<input type='hidden' name='javascript_executed' value='true'>");
	$.ajax({
		url: get_site_url('forms/if_show_smart_captcha'),
		dataType: 'jsonp',
		data: {form_id:form_id},
		success: function(response){
			var show_captcha=response;
			toggle_captcha(emf_captcha_visible_by_rules && show_captcha);
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert('Error: '+textStatus+"\n"+errorThrown);
		}
	});
}

function set_readonly(){
	$('#emf-form input, #emf-form select').attr("disabled","disabled");
	$("#emf-form").children().first().before("<div style='color:red;font-weight:bold;'>This form is temporarily restricted. Please contact Accounts and Billing to resolve this issue with the account. Thank you. </div>");
}

function SessionTimeoutWarner(timeout_interval_in_seconds){
	var confirm_timer=null;
	var alert_timer=null;
	var self=this;
	this.show_confirm_dialog=function(){
		show_confirm_dialog("Session is about to timeout", "Do you want to extend it and continue completing the form?",
			function(event){
				$.ajax({
			        url : get_site_url('forms/keep_session_alive'), 
			        dataType: 'jsonp',
			        success : function (data) {
			        	get_dialog(event.target).dialog("close");
			        	self.set_timers();
			        },
			        error : function (){
		               alert('Extend session timeout error.')
			        }
				})
			},
			null,
			{hide_close_button:true}
		)
	};
	this.show_alert_dialog=function(){
		close_all_dialogs();
		show_alert("Your session is about to timeout", "Please reload the page and start over.",{hide_close_button:true});
	};
	
	this.set_timers=function(){
		var confirm_timeout=Math.floor(timeout_interval_in_seconds * 1000 * 0.95);
		var alert_timeout=timeout_interval_in_seconds * 1000;
		
		clearTimeout(confirm_timer);
		clearTimeout(alert_timer);
		
		confirm_timer=setTimeout(this.show_confirm_dialog, confirm_timeout);
		alert_timer=setTimeout(this.show_alert_dialog, alert_timeout);
	} 
}

//Not to use navigator.cookieEnabled for the case Safari5 on Windows7 will block third-party cookie.
function is_cookie_disabled(){
	var name="emf_test_cookie";
	var value="OK";
	set_cookie(name,value);
	var result=get_cookie(name)!=value;
	set_cookie(name,"",-1);
	return result;
}

function force_session_for_submit_form(){
	if(is_cookie_disabled()){
		set_form_hidden_field($('#emf-form')[0], 'PHPSESSID', g_emf_session_id);
	}
}

var EMF_price={
	set_price_field: function (idx,fld_type){
		//console.debug("idx:"+idx+" fld_type:"+fld_type);
		var field_options_map=EMF_price.price_fld_info.price_list;
		var fld_opt=null;
		if(field_options_map && field_options_map['idx_'+idx]){
			fld_opt=field_options_map['idx_'+idx];
		}else{
			return false;
		}
		var price=0.00;
		var fld_label=null;
		if(fld_type==EMF_price.FORM_FIELD_TYPE_DROPDOWN){
			var opt_idx=document.getElementById("element_"+idx).selectedIndex;
			//console.debug("idx:"+idx+" optIdx:"+optIdx);
			if(opt_idx>=0){
				if(fld_opt['fld_price_options']){
					price=fld_opt['fld_price_options']['opt_'+opt_idx];
				}
				if(fld_opt['fld_defined_options']['opt_'+opt_idx]){
					fld_label=fld_opt['fld_defined_options']['opt_'+opt_idx]['option'];
				}
			}
		}else if(fld_type==EMF_price.FORM_FIELD_TYPE_MULTIPLE_CHOICE){
			var options=fld_opt['fld_price_options'];
			if(options){
				EMF_jQuery.each(options, function(opt_key,opt_price){
					var opt_idx=opt_key.split("_")[1];
					//console.debug("check: #element_"+idx+"_"+opt_idx);
					if(EMF_jQuery("#element_"+idx+"_"+opt_idx).is(":checked")){
						price=opt_price;
						fld_label=fld_opt['fld_defined_options']['opt_'+opt_idx]['option'];
					}
				});
			}
		}else if (fld_type==EMF_price.FORM_FIELD_TYPE_PRICE){
			//price=EMF_jQuery("#element_"+idx).val();
			var price1=EMF_jQuery("#element_"+idx+"_1").val();
			var price2=EMF_jQuery("#element_"+idx+"_2").val();
			price=price1;
			if(price=="" || isNaN(parseInt(price,10))){
				price="0";
			}
			if(price2=="" || isNaN(parseInt(price2,10))){
				price+=".00";
			}else{
				price+="."+price2;
			}
		}
	
		var float_price=parseFloat(price);
		fld_opt['price']=float_price;
		if(fld_label!=null){
			fld_opt['fld_name']=fld_label;
		}
	},
	format_price:function (currency,price){
		return currency+new Number(price).toFixed(2);
	},
	get_item_label:function(val){
		return val['fld_name'];
	},
	calc_price_fields:function (){
		//calc by price_fld_info
		var currency=EMF_price.price_fld_info['currency'];
		var fixed_price=EMF_price.price_fld_info['fixed_price'];
		var total_items=EMF_jQuery("#f"+EMF_price.form_id+"_total_items");
		total_items.html("");
		if(fixed_price>0.0){
			total_items.append("<tr><th>"+EMF_price.price_fld_info['fixed_price_label']+"</th><td>"+EMF_price.format_price(currency,fixed_price)+"</td></tr>");
		}
		var price_list=EMF_price.price_fld_info['price_list'];
		var totalPrice=fixed_price;
		
		if(emf_cart==null){
			emf_cart=new Array();
		}
		if(price_list){
			var items_in_page=new Array();
			
			EMF_jQuery.each(price_list,function(){
				var val=this;
				var fld_type=val["fld_type"];
				var idx=val['idx'];
				
				if(idx <= emf_page_info.page_element_index_max && idx >= emf_page_info.page_element_index_min){
					var label=null;
					var price=null;
					if(fld_type==EMF_price.FORM_FIELD_TYPE_CHECKBOX){
						//checkbox
						var fld_opt=EMF_price.price_fld_info['price_list']['idx_'+idx];
						$("input[name='element_"+idx+"[]']:checked").each(function(){
							var id=$(this).attr("id");
							var opt_idx=id.split("_")[2];
							var fld_label=fld_opt['fld_defined_options']['opt_'+opt_idx]['option'];
							var price=fld_opt['fld_price_options']['opt_'+opt_idx];
							if(price==null || price==''){
								price=0.0;
							}
							var float_price=parseFloat(price);
							
							var cart_item=new Object();
							cart_item['label']=fld_label;
							cart_item['price']=float_price;
							items_in_page.push(cart_item);
						});
					}else{
						EMF_price.set_price_field(idx,fld_type);
						var float_price=val['price'];
						if(float_price>0.0){
							var cart_item=new Object();
							cart_item['label']=EMF_price.get_item_label(val);
							cart_item['price']=float_price;
							items_in_page.push(cart_item);
						}
					}
				}
			});
			
			emf_cart[emf_page_info.current_page_index]=items_in_page;
		}
		
		$.each(emf_cart, function(index, items_in_page){
			$.each(items_in_page, function(index, item){
				if(typeof(item['label'])!='undefined'){
					total_items.append("<tr><th>"+item['label']+"</th><td>"+EMF_price.format_price(currency,item['price'])+"</td></tr>");
					totalPrice+=item['price'];
				}
			});
		});
		
		EMF_jQuery("#f"+EMF_price.form_id+"_total_price").html(EMF_price.format_price(currency,totalPrice));
		set_form_hidden_field($("#emf-form"), "emf_cart", JSON.stringify(emf_cart));
	}
};

function init_payment(){
	$insertion_points=["#emf-li-recaptcha, #emf-li-captcha", ".emf-li-field.emf-field-page_break", "#emf-li-post-button"];
	$.each($insertion_points, function(index, item){
		if(EMF_jQuery(item).size()>0){
			EMF_jQuery(item).before(EMF_jQuery("div.total"));
			return false;
		}
	});

	EMF_jQuery("div.total").show();
	//price fields
	if(EMF_price.price_fld_info){
		//debug
		EMF_price.calc_price_fields();
		var price_list=EMF_price.price_fld_info['price_list'];
		if(price_list){
			EMF_jQuery.each(price_list,function(idx,val){
				var fld_type=val["fld_type"];
				var price_fld_idx=val["idx"];
				if(fld_type==EMF_price.FORM_FIELD_TYPE_DROPDOWN){
					EMF_jQuery("#element_"+price_fld_idx).change(function(){
						//var price_field_key=$(this).attr("id").split("_")[1];
						EMF_price.calc_price_fields();
					});
				}else if(fld_type==EMF_price.FORM_FIELD_TYPE_MULTIPLE_CHOICE){
					//console.debug("input[name=element_"+price_fld_idx+"]");
					EMF_jQuery("input[name=element_"+price_fld_idx+"]").click(function(){
						//var price_field_key=$(this).attr("id").split("_")[1];
						//console.debug("click:"+EMF_jQuery(this).attr("id"));
						EMF_price.calc_price_fields();
					});
				}else if(fld_type==EMF_price.FORM_FIELD_TYPE_CHECKBOX){
					EMF_jQuery("input[name='element_"+price_fld_idx+"[]']").change(function(){
						EMF_price.calc_price_fields();
					});
				}else if(fld_type==EMF_price.FORM_FIELD_TYPE_PRICE){
					//console.debug("#element_"+price_fld_idx+"_1,#element_"+price_fld_idx+"_2");
					EMF_jQuery("#element_"+price_fld_idx+"_1,#element_"+price_fld_idx+"_2").blur(function(){
						EMF_price.calc_price_fields();
					});
				}
			});
		}
	}
}
;