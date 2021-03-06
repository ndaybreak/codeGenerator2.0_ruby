/**
 * Services live in this file.
 */
angular.module("DataServiceModule", ["UtilityModule"]).factory("AdminService", function($http, logger, sharedService, loading)
{
	//------------------------------------------------------------------------
	// Constants
	//------------------------------------------------------------------------
	var REST_BASE_URL = BASE_URL + "rest/";
	var URL_GET_OPTSQCTRYBUEXCP = REST_BASE_URL + "getAllOptSqCtryBuExcp";
	var URL_SAVE_OPTSQCTRYBUEXCP = REST_BASE_URL + "saveOptSqCtryBuExcp";
	var URL_UPDATE_OPTSQCTRYBUEXCP = REST_BASE_URL + "updateOptSqCtryBuExcp";
	var URL_DELETE_OPTSQCTRYBUEXCP = REST_BASE_URL + "massDeleteOptSqCtryBuExcp";
	// Real RESTful URL style, use the same URL with different HTTP actions (POST=insert, PUT=update, DELETE=delete, GET=select)
	var URL_OPT_PRICE_QUALITY_BAND = REST_BASE_URL + "PriceQualityBandGroup";

	var URL_STATIC_DATA = REST_BASE_URL + "getStaticData";
	var URL_STATIC_DATAS = REST_BASE_URL + "getStaticDatas";

	var URL_BASIC_PRICEDESCRIPTOR_DATA = REST_BASE_URL + "getBasePriceDescriptorByCountryCode";
	var URL_ADDITIONAL_PRICEDESCRIPTOR_DATA = REST_BASE_URL + "getAdditionalPriceDescriptorByCountryCode";

	var URL_AMID2_DATA = REST_BASE_URL + "getAmid2ByDescriptionPrefix";
	var URL_GUIDANCE_ROLES_DATA = REST_BASE_URL + "getAllGuidanceRolesByRouteToMarket";
	var URL_Role_Negative_Margin_Flag_DATA = REST_BASE_URL + "getGuidanceRole";

	var URL_EXPORT_TO_EXCEL = BASE_URL + "export2Excel";

	//------------------------------------------------------------------------
	// Private data
	//------------------------------------------------------------------------
	var promiseOptSqCtryBuExcp;

	//------------------URL paging---------START-------
	/*optSqCtryBuExcp*/
	var URL_OPTSQCTRYBUEXCP_DATA = REST_BASE_URL + "OptSqCtryBuExcp";//all data
	var URL_OPTSQCTRYBUEXCP_FILTERED_DATA = URL_OPTSQCTRYBUEXCP_DATA + "/Filtered";//filtered data
	var URL_OPTSQCTRYBUEXCP_SELECT_DATA = URL_OPTSQCTRYBUEXCP_DATA + "/FilterData";//data for select dropdown
	//------------------URL paging---------END-------
	//variables for server side paging : returned selecte data and page data ---------------START--------------
	//optSqCtryBuExcp
	var optSqCtryBuExcpFilteredData,
	    optSqCtryBuExcpSelectData;
	//variables for server side paging : returned selecte data and page data ---------------END--------------

	var optSqCtryBuExcpList;

	var countriesList;
	var geosList;
	var currenciesList;
	var bunitsList; //business units
	var productLines;
	var productFamilies;
	var regionList;
	var benchmarkList;
	var unverCustPrcMthdList;
	var custSegList;
	var routeToMarketList;
	var authList;
	var negMarginAprvlFgs;
	var allUserRoles;
	//var priceDescriptorList;
	var mcChargeList;

	var version;
	
	var tipText = {
		'autoComplete':'please enter at least 2 characters'
	};
	
	var errMsgList = {

		// === Customized (Non-generated) validations START === //
		'ErrMsg_revenueBucket':{
 			'eg':
			{
				'notNull':'EG($) is required.',
				'max18dec2':'EG($) should be numeric, with maximum 2 decimal places, like 10.25',
				'between':'The value of EG($) must BETWEEN {small} and {big}',
				'lastValue':'The value of EG($) must LARGER than {small}',
				'unEditable':'The value of First EG($) can NOT be Edited',
				'positive':'The value of EG($) must LARGER than 0'
			},
 			'pps':
			{
				'notNull':'PPS($) is required.',
				'max18dec2':'PPS($) should be numeric, with maximum 2 decimal places, like 10.25',
				'between':'The value of PPS($) must BETWEEN {small} and {big}',
				'lastValue':'The value of PPS($) must LARGER than {small}',
				'unEditable':'The value of First PPS($) can NOT be Edited',
				'positive':'The value of EG($) must LARGER than 0'
			},
		}
		// === Customized (Non-generated) validations END === //
	};
	
	function getErrMsg(page, name, errName){
		try{
			return errMsgList[page][name][errName];
		}catch(e){
			logger.error('getErrMsg occurs error.page:'+page+',objName:'+name+',errName:'+errName);
		}
	}

	function removeItemFromList(list, item, id) {
		var j = null;
		var isArray = false;
		var result = [];
		var duplicate;
		if(item.hasOwnProperty('length')){
			//determine if the item is an Array
			isArray = true;
		}
	    if (!item || !list || list.length == 0)
	        return;

	    for (var index=0 ; index<list.length ; index++) {
	    	if(isArray){
	    		j = item.length;
	    		duplicate = false;
	    		while(j--){
	    			if (list[index][id] === item[j][id]){
		    			//list.splice(index, 1);
		    			duplicate = true;
		    			break;
		    		}
	    		}
	    		if(!duplicate){
	    			result.push(list[index]);
	    		}
	    		
	    	}else{
	    		if (list[index][id] !== item[id]){
	    			//list.splice(index, 1);
	    			result.push(list[index]);
	    		}
	    	}
	    }
	    return result;
	}

	function getIndexOf(valueToCompare, container, propertyName) {
	    if (!container || !propertyName || !valueToCompare)
	        return -1;

	    //Handle ARRAY here	
	    if (Object.prototype.toString.call(container) === '[object Array]') {
	        for (var index in container) {
	            if (valueToCompare === container[index][propertyName])
	                return index;
	        }
	    }
	    //TODO - handle OBJECT here.
	    return -1;
	}

	function sync(srcObj, destList, matchProperty) {
		var i, j, prop;
	    if (!srcObj || !destList || destList.length === 0)
	        return;

	    //cause the old update return data is an object, the new update return data is an array of object
	    //we need to take care two kinds of data
	    if(!srcObj.length){
		    for (i in destList) {
		        if (srcObj[matchProperty] == destList[i][matchProperty]) {
		            for (prop in srcObj) {
		                destList[i][prop] = srcObj[prop];
		            }
		            break;
		        }
		    }
	    }else{
	    	i = destList.length;
	    	while(i--) {
		    	j = srcObj.length;
		    	while(j--){
			        if (srcObj[j][matchProperty] == destList[i][matchProperty]) {
			            for (prop in srcObj[j]) {
			                destList[i][prop] = srcObj[j][prop];
			            }
			            break;
			        }
		        }
		    }
	    }
	    return destList;
	}
	
	function handleError(error, operation)
	{
		var msg = operation + " operation failed." + (error ? (error.data || error.message) : '');
		logger.error(msg);
	}
	
	var service =  
	{
		getVersion: function() { return version; },
		getGeos: function() { return geosList;},
		getRegion: function() { return regionList;},
		getCountries: function() { return countriesList;},
		getCurrencies: function() { return currenciesList; },
		getBusinessUnits: function() {return bunitsList;},
		getProductLines: function() {return productLines;},
		getProductFamilies: function() {return productFamilies;},
		getRegions: function() { return regionList; },
		getUserRoles:function() {return [{cd:"Role1"}, {cd:"Role2"}, {cd:"Role3"}, {cd:"Role4"}, {cd:"Role5"}];},
		getBenchmarks: function() { return benchmarkList;  },
		getUnverCustPrcMthds : function() { return unverCustPrcMthdList;  },
		getCustSegs : function() { return custSegList;  },
		getRouteToMarkets : function() { return routeToMarketList;  },
		getCheckValueYN : function() { return [{cd:"", valueForDisplay:""}, {cd:"Y", valueForDisplay:"Yes"}, {cd:"N", valueForDisplay:"No"}];  },
		getCheckValueAI : function() { return [{cd:"", valueForDisplay:""}, {cd:"A", valueForDisplay:"Active"}, {cd:"I", valueForDisplay:"InActive"}];  },
		getAuthList : function() { return authList;  },
		getNegMarginAprvlFgs : function() { return negMarginAprvlFgs;  },
		getAllUserRoles : function() { return allUserRoles;  },
		//getPriceDescriptors : function() { return priceDescriptorList;  },
		getMcCharges : function() { return mcChargeList },
		
		getCheck : function(ctrlName, elm) { 
			return checkValueList[ctrlName][elm];
		},
		
		getTipText : function(name) { 
			name = name? name : 'autoComplete';
			return tipText[name];  
		},
		
		getIndexOf: getIndexOf,
		
		getErrMsg: getErrMsg,
		
		getExportToExcelUrl: function(){
			return URL_EXPORT_TO_EXCEL;
		},
		
		getStaticDatas: function()
		{
			//TODO - get static datas from server and set it to list objects here in service.
			logger.info("Executing getStaticDatas() from 'AdminService'.");
			if (typeof staticDatas == "undefined")
			{
				staticDatas = this.httpGet(
												URL_STATIC_DATAS,
												function(result){
													logger.info("getStaticDatas() call successful.");
											   		logger.debug(JSON.stringify(result.data));
											   		version = result.data.d.releaseVersionNumber;	
											   		loading.close();
												},
												'Get static datas');
				
			}else{
				loading.close();
			}
			
		},
		
		getStaticData: function(cb)
		{
			//TODO - get static data from server and set it to list objects here in service.
			logger.info("Executing getStaticData() from 'AdminService'.");
			if (typeof promiseStaticData == "undefined")
			{
				promiseStaticData = this.httpGet(
												URL_STATIC_DATA,
												function(result){
											   		logger.info("getStaticData() call successful.");
											   		logger.debug(JSON.stringify(result.data));
											   		countriesList = result.data.countries;
											   		geosList = result.data.geos;
											   		regionList = result.data.region;
											   		bunitsList = result.data.businessUnits;
											   		productLines = result.data.productLines;
											   		productFamilies = result.data.productFamilies;
											   		regionList = result.data.regions;
											   		benchmarkList = result.data.benchmarks;
											   		currenciesList = result.data.currencies;									   		
											  		unverCustPrcMthdList = result.data.unverifiedCustomerPricingMethods;
													custSegList = result.data.customerSegments;
													routeToMarketList = result.data.routeToMarkets;
													negMarginAprvlFgs = result.data.negMarginAprvlFgs;
													allUserRoles = result.data.userRoles;
													//priceDescriptorList = result.data.priceDescriptors;
													mcChargeList = result.data.mcCharges;
													
													//mock up
													var pageName = ['OptBuCustExcp','OptCntryExcp','OptCurrExcp','OptCustExcp','OptCustSegExcp','OptDefaultPriceDesc','OptDefaultRevenueBucket','OptGuidanceDefaultPt','OptNonDiscProdExcp','OptProdExcp','OptSysParam','OptThreshold','OptUser'];
													var list = {};
													var i = pageName.length;
													var readOnly = result.data.logonUser.role.authList[0].uiAuth === 'R' ? false : true;
													while(i--){
														list[pageName[i]] = {
															'btn':{
																'add':readOnly,
																'del':readOnly,
																'update':readOnly
															}
														};
													}
													result.data.authList = list;
													authList = result.data.authList;
													
													loading.close();
													
													//excute the callback
											   		if(cb){
											   		    cb();
											   		}
											   		
											   		_waq.push([
														'gridDataReceived',
														(new Date()).valueOf(),
														{group:'gridLoadGroup'}
													]);
												},
												'Get static data');
				
			}else{
				loading.close();
				
				//excute the callback
				if(cb){
                    cb();
                }
				
				_waq.push([
					'gridDataReceived',
					(new Date()).valueOf(),
					{group:'gridLoadGroup'}
				]);
			}
			
		},
		
		getBasicPRICEDESCRIPTORData: function()
		{
			return URL_BASIC_PRICEDESCRIPTOR_DATA;
		},
		
		getAdditionalPRICEDESCRIPTORData: function()
		{
			return URL_ADDITIONAL_PRICEDESCRIPTOR_DATA;
		},
		
		getAMID2Data: function()
		{
			return URL_AMID2_DATA;
		},
		
		getGuidanceRolesData: function()
		{
			return URL_GUIDANCE_ROLES_DATA;
		},
		
		getRoleNegativeMarginFlagData: function()
		{
			return URL_Role_Negative_Margin_Flag_DATA;
		},

		//action edit or update use http put method
		saveOrUpdateOptPriceQualityBand: function(inputObj,callback)
		{
		    logger.info("Executing saveOrUpdateOptPriceQualityBand()");
			logger.debug(JSON.stringify(inputObj));
			this.httpPost(URL_OPT_PRICE_QUALITY_BAND, inputObj, function(result){
				//sync(result.data, optPriceQualityBandList, "id"); refresh code change
				optPriceQualityBandList = result.data;
				logger.info("Update saveOrUpdateOptPriceQualityBand operation successful.");
				if(callback)callback(optPriceQualityBandList);
			});
		},
//-------------------get filter and paging data-------------START-------------------
	   //---OptSqCtryBuExcp
		getOptSqCtryBuExcpSelectData: function(callback)
		{
			logger.info("Executing getOptSqCtryBuExcpSelectData() from 'AdminService'.");
			_waq.push([
				'gridDataRequested',
				(new Date()).valueOf(),
				{group:'gridLoadGroup'}
			]);
			this.httpGet(URL_OPTSQCTRYBUEXCP_SELECT_DATA,
									function(result)
								   {
								        logger.info("getOptSqCtryBuExcpSelectData() call successful.");
								        logger.debug(JSON.stringify(result.data));
								        optSqCtryBuExcpSelectData = result.data;
								        callback && callback(optSqCtryBuExcpSelectData);
								   }, 
								   "Get getOptSqCtryBuExcpSelectData"
								   );
		},
		getOptSqCtryBuExcpData: function(para,callback)
		{
			logger.info("Executing getOptSqCtryBuExcpData() from 'AdminService'.");
			_waq.push([
				'gridDataRequested',
				(new Date()).valueOf(),
				{group:'gridLoadGroup'}
			]);
			this.httpGet(URL_OPTSQCTRYBUEXCP_DATA +'/'+para.pageSize+'/'+para.pageIndex,function(result){
								        logger.info("getOptSqCtryBuExcpData() call successful.");
								        logger.debug(JSON.stringify(result.data));
								        optSqCtryBuExcpFilteredData = result.data;
								        formatData.toDollerData(optSqCtryBuExcpFilteredData.lineData,para.dollerFields);
								        formatData.toPercentData(optSqCtryBuExcpFilteredData.lineData,para.percentFields);
								        callback && callback(optSqCtryBuExcpFilteredData);
								   }, 
								   "Get getOptSqCtryBuExcpData"
								   );
		},
		getOptSqCtryBuExcpFilteredData: function(para, callback)
		{
			logger.info("Executing getOptSqCtryBuExcpFilteredData()");
			logger.debug(JSON.stringify(para.filterObj));
			this.httpPost(URL_OPTSQCTRYBUEXCP_FILTERED_DATA+'/'+para.pageSize+'/'+para.pageIndex, para.filterObj, function(result){
				logger.info("Get getOptSqCtryBuExcpFilteredData operation successful.");
				optSqCtryBuExcpFilteredData = result.data;
				formatData.toDollerData(optSqCtryBuExcpFilteredData.lineData,para.dollerFields);
				formatData.toPercentData(optSqCtryBuExcpFilteredData.lineData,para.percentFields);
				callback && callback(optSqCtryBuExcpFilteredData);
			});
		}, 
		//-------------------get filter and paging data---------END-------------------
		// ===== Generated codes START ===== //
		getOptSqCtryBuExcpList: function(callback)
		{
			logger.info("Executing getOptSqCtryBuExcpList() from 'AdminService'.");
			_waq.push([
				'gridDataRequested',
				(new Date()).valueOf(),
				{group:'gridLoadGroup'}
			]);
			if (!optSqCtryBuExcpList)
			{
				this.httpGet(URL_GET_OPTSQCTRYBUEXCP,
										function(result)
									   {
									        logger.info("getOptSqCtryBuExcpList() call successful.");
									        logger.debug(JSON.stringify(result.data));
									   		optSqCtryBuExcpList = result.data;
									   		callback(optSqCtryBuExcpList);
									   		return optSqCtryBuExcpList;
									   }, 
									   "Get OptSqCtryBuExcp"
									   );
			}else{
				callback(optSqCtryBuExcpList);
			}
		},

		getList_optSqCtryBuExcpList: function()
		{
			return optSqCtryBuExcpList;
		},

//-------popup -------save--------START------
		saveOptSqCtryBuExcp: function(options, callback)
		{
			logger.info("Executing saveOptSqCtryBuExcp()");
			logger.debug(JSON.stringify(options.item));
			this.httpPost(URL_SAVE_OPTSQCTRYBUEXCP, options.item, function(result){
				logger.info("Save OptSqCtryBuExcp operation successful.");
				result.data.addFlag = true;
				formatData.toDollerData(result.data,options.dollerFields);
				formatData.toPercentData(result.data,options.percentFields);
				optSqCtryBuExcpFilteredData.lineData.push(result.data);
				if(callback)callback(optSqCtryBuExcpFilteredData);
			});
		},

//-------popup -------save--------END------

//-------popup -------delete--------START------
		deleteOptSqCtryBuExcp: function(options,callback)
		{
			logger.info("Executing deleteOptSqCtryBuExcp()");
			removeAttrAddFlag(options.itemToDelete);
			formatData.removeCommaForList(options.itemToDelete,options.dollerFields);
			logger.debug(JSON.stringify(options.itemToDelete));
			this.httpPost(URL_DELETE_OPTSQCTRYBUEXCP, options.itemToDelete, function(result){
				logger.info("Delete OptSqCtryBuExcp service call successful.");
				optSqCtryBuExcpFilteredData = removeItemFromList(optSqCtryBuExcpFilteredData, result.data, "id");
				if(callback)callback(optSqCtryBuExcpFilteredData);
			});
		},

//-------popup -------delete--------END------

//-------popup -------update--------START------
		updateOptSqCtryBuExcp: function(options,callback)
		{
		    logger.info("Executing updateOptSqCtryBuExcp()");
			logger.debug(JSON.stringify(options.item));
			this.httpPost(URL_UPDATE_OPTSQCTRYBUEXCP, options.item, function(result){
				formatData.toDollerData(result.data,options.dollerFields);
				formatData.toPercentData(result.data,options.percentFields);
				sync(result.data, optSqCtryBuExcpFilteredData, "id");
				logger.info("Update OptSqCtryBuExcp operation successful.");
				if(callback)callback(optSqCtryBuExcpFilteredData);
			});
		},

//-------popup -------update--------END------
		// ===== Generated codes END ===== //

		httpGet : function(url, cb, errMsg){
			//prevent cache
			if(url.indexOf('?')===-1){
				url += '?'+(new Date).valueOf();
			}
			
			return $http
					.get(url)
					.then(function(result)
					{
						cb(result);
					}, 
					function(error)
					{
						errMsg = errMsg || 'error happened when httpGet';
						handleError(error, errMsg);
					});
		},
		httpPost : function(url,inputObj,cb){
			return $http
			.post(url,inputObj).then(function(result){
				var isSuccess = true;
				var msg;
				var data = result.data;
				if(data.hasOwnProperty('length')){
					//if the result is an array of DTO
					//then check if every DTO is success
					var i = data.length;
					while(i--){
						if(!data[i].success){
							//always just show the last error message of DTO arry
							msg = data[i].message;
							isSuccess = false;
							break;
						}
					}
				}else{
					if(!(isSuccess = result.data.success)){
						msg = result.data.message;
					}
				}
				
				if(isSuccess)
				{
					cb(result);
				}
				else
				{
					sharedService.errorOcurs(msg, result.config.url);
				}
			},function(error)
			{
				sharedService.errorOcurs('Error Occurs,Please Retry', error.config.url);
			});
		},
		//sofi add put method
		httpPut : function(url,inputObj,cb){
			return $http
			.put(url,inputObj).then(function(result){
				var isSuccess = true;
				var msg;
				var data = result.data;
				if(data.hasOwnProperty('length')){
					//if the result is an array of DTO
					//then check if every DTO is success
					var i = data.length;
					while(i--){
						if(!data[i].success){
							//always just show the last error message of DTO arry
							msg = data[i].message;
							isSuccess = false;
							break;
						}
					}
				}else{
					if(!(isSuccess = result.data.success)){
						msg = result.data.message;
					}
				}
				
				if(isSuccess)
				{
					cb(result);
				}
				else
				{
					sharedService.errorOcurs(msg, result.config.url);
				}
			},function(error)
			{
				sharedService.errorOcurs('Error Occurs,Please Retry', error.config.url);
			});
		}
	};
	return service;
});