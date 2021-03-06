/*
Stephen Wetzel
smw347@drexel.edu
CS338:GUI, Project
*/

var hourly = 60 * 60;
var daily = 60 * 60 * 24;
var twiceDaily = 60 * 60 * 12;
var weekly = 60 * 60 * 24 * 7;
var monthly = 60 * 60 * 24 * 30;

//user data for testing/demos
var testUserData = [ 
{"type":"Blood Pressure (diastolic)","data":[{"date":1457277331940,"value":78},{"date":1457297330949,"value":83},{"date":1457426304867,"value":88},{"date":1457486504867,"value":95}]},
{"type":"Blood Pressure (systolic)","data":[{"date":1457277231840,"value":119},{"date":1457297230849,"value":108},{"date":1457426304867,"value":138},{"date":1457486507867,"value":131}]},
{"type":"Cholesterol (Total)","data":[{"date":1457297231840,"value":197},{"date":1457297230849,"value":203},{"date":1457426304867,"value":215},{"date":1457486507867,"value":192}]},
{"type":"Heart Rate","data":[{"date":1457177231912,"value":72},{"date":1457187131929,"value":66}]}];

var defaultUserInfo = {name: '', height: 0, sex: ''};
var userData = [];
var userInfo = defaultUserInfo;

//these are the types of stats that can be tracked
var datatypes = [
	{type: "Fasting Blood Sugar", max: 100, min: 70, logFreq: daily, unit: "mg/dL"}, 
	{type: "Heart Rate", max: 100, min: 60, logFreq: daily, unit: "BPM"},
	{type: "Cholesterol (Total)", max: 200, min: 70, logFreq: daily, unit: "mg/dL"},
	{type: "Cholesterol (LDL)", max: 130, min: 70, logFreq: daily, unit: "mg/dL"},
	{type: "Cholesterol (HDL)", max: 200, min: 50, logFreq: daily, unit: "mg/dL"},
	{type: "Triglycerides", max: 150, min: 10, logFreq: daily, unit: "mg/dL"},
	{type: "Blood Pressure (diastolic)", max: 90, min: 60, logFreq: daily, unit: "mm Hg"},
	{type: "Blood Pressure (systolic)", max: 120, min: 80, logFreq: daily, unit: "mm Hg"}];


function StoreData(obj, name)
{//take a js obj and store it as a string in localStorage
	localStorage.setItem(name, JSON.stringify(obj));
}

function ReadData(name)
{//retrieve string from localStorage, and parse it as obj
	var data = localStorage[name];
	if (data === undefined) { return null; }
	else { return JSON.parse(data); }
}

function roundTo(num, digits)
{//rounds num to #digits past decimal
	digits = typeof digits !== 'undefined' ? digits : 2; //default to 2 digits
	var offset = Math.pow(10,digits);
	var num = Math.round(offset*num)/offset
	return num;	
}

function zeroPad(num)
{//pad to 2 digits with zeros (eg, 7 -> 07)
	if (num <= 9) { (num = '0' + num).slice(-2); }
	return num;
}

function formatTime(timestamp) //takes a unix timestamp
{//Output format: 10:01:51 PM
	var date = new Date(timestamp);
	output = "";
	if (date.getHours() > 12) {
		output += date.getHours() - 12 + ":";
		amPm = "PM";
	} else if (date.getHours() == 12) {
		output += "12:";
		amPm = "PM";
	} else if (date.getHours() == 0) {
		output += "12:";
		amPm = "AM";
	} else {
		output += date.getHours() + ":";
		amPm = "AM";
	}
	output += zeroPad(date.getMinutes()) + ":";
	output += zeroPad(date.getSeconds()) + " ";
	output += amPm;
	return output;
}

function formatDate(timestamp) //takes a unix timestamp
{//Output format: 2016-02-29
	var date = new Date(timestamp);
	output = "";
	output += date.getFullYear() + "-";
	output += zeroPad(date.getMonth() + 1) + "-";
	output += zeroPad(date.getDate()) + "";
	return output;
}

function convertSecsToDays(secs) 
{//takes a number of seconds and returns a string telling how many hours/mins/days/etc ago that was
	output = '';
	if (secs > monthly) {
		output = roundTo(secs / monthly) + " months ago";
	} else if (secs > weekly) {
		output = roundTo(secs / weekly) + " weeks ago";
	} else if (secs > daily) {
		output = roundTo(secs / daily) + " days ago";
	} else if (secs > hourly) {
		output = roundTo(secs / hourly) + " hours ago";
	} else if (secs > 60) {
		output = roundTo(secs / 60) + " minutes ago";
	} else {
		output = roundTo(secs) + " seconds ago";
	}
	return output;
}

function getDataSeries(typeName)
{//take a stat name, and return the user's data series for it
	var dataSeries = null;
	userData.forEach(function(item, ii) {
		if (item.type == typeName)
		{
			dataSeries = item;
		}
	});
	return dataSeries;
}

function isCurrTracked(typeName)
{//true if this stat is currently tracked
	return (getDataSeries(typeName) != null);
}

function getNewestPoint(thisSeries)
{//return the newest point in a given data series
	var newestDate = 0;
	var newestValue = 0;
	thisSeries.data.forEach(function(item, ii) {
		if (item.date > newestDate) {
			newestDate = item.date;
			newestValue = item.value;
		}
	});
	return {date: newestDate, value: newestValue}
}

function getDataAge(thisSeries)
{//gets the age of data, and returns a span tag with proper style
	var output = '';
	var freq = 0;
	datatypes.forEach(function(item, ii) {
		if (item.type == thisSeries.type) 
		{
			freq = item.logFreq;
		}
	});
	var newestPoint = getNewestPoint(thisSeries);
	
	var now = Date.now();
	var age = (now - newestPoint.date) / 1000;
	if (age > freq) {
		output = "<span class='oldData'>" + convertSecsToDays(age) + "</span>";
	} else {
		output = "<span class='currData'>" + convertSecsToDays(age) + "</span>";
	}
	return output;
}

function AddDataType()
{//user chooses to track a new type of stat
	var newType = document.getElementById("DataTypeSelect").value
	if ( !isCurrTracked(newType) ) {
		userData.push({type: newType, data: []});
		PromptForData(newType);
	} else {
		
	}
	StoreData(userData, "userData");
	BuildHomePage();
}

function AddData(typeName, value)
{//store a data point in this data series
	userData.forEach(function(item, ii) {
		if (item.type == typeName)
		{
			item.data.push({date: Date.now(), value: value});
		}
	});
	StoreData(userData, "userData");
}

function getHealthyLimits(typeName)
{//returns an array of the [min, max] healthy limits for a given stat
	var max = 0;
	var min = 0;
	datatypes.forEach(function(item, ii) {
		if (item.type == typeName) 
		{
			max = item.max;
			min = item.min;
		}
	});
	return [min, max]
}

function checkDataPoint(typeName, value)
{//check to see if a given value is below (-1) inside (0) or above(1) the healthy range
	//This can be updated to destructuring assignment when it is better supported
	var temp = getHealthyLimits(typeName);
	var min = temp[0]; var max = temp[1];
	if (value > max) {
		return 1;
	} else if (value < min) {
		return -1;
	}
	return 0;
}

function PromptForData(typeName)
{//ask the user for a value for this type of data, store it, and refresh page
	var input = '';
	while (!isNumeric(input)) {	
		input = prompt("Enter New " + typeName, '');
	}
	AddData(typeName, input);
	var ok = checkDataPoint(typeName, input);
	if (ok == 1) { alert ("Warning! Too high!"); }
	else if (ok == -1) { alert ("Warning! Too low!"); }
	else { /*ok value*/ }
	BuildHomePage();
}

function DeleteData(typeName)
{//delete a data type
	userData.forEach(function(item, ii) {
		if (item.type == typeName)
		{
			userData.pop(ii);
		}
	});
	StoreData(userData, "userData");
	BuildHomePage();
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getUnit(thisSeries) 
{//get the units (eg mg/dL) for a given data series
	var unit = '';
	datatypes.forEach(function(item, ii) {
		if (item.type == thisSeries.type) 
		{
			unit = item.unit;
		}
	});
	return unit;
}

function getUnitFromName(typeName)
{//wrapper for getUnits, if we instead have the data type name
	thisSeries = getDataSeries(typeName);
	return getUnit(thisSeries);
}

function BuildHomePage()
{//create the main stats container
	var output = '';
	var style = "oddLine";
	
	userInfo = ReadData("userInfo");
	userData = ReadData("userData");
	
	if (userInfo == null) { userInfo = defaultUserInfo; }
	if (userData == null) { userData = testUserData; }
	
	
	userData.forEach(function(item, ii) {
		var age = getDataAge(item);
		var unit = getUnit(item);
		var newestPoint = getNewestPoint(item);
		var name = item.type;
		var temp = getHealthyLimits(name);
		var min = temp[0]; var max = temp[1];
		var condClass = '';
		var ok = checkDataPoint(name, newestPoint.value)
		if (ok == 0) { condClass = "okValue"; }
		else { condClass = "badValue"; }
		output += "<div class='dashDataLine " + style + "'>";
		output += "<span class='dashDataName'>";
		output += name + "</span>";
		output += "<span class='dashDataValue "+condClass+"' title='Healthy range is: ("+min+" - "+max+")'>"
		output += "Current Value: "+newestPoint.value+" "+unit+"</span>";
		output += "<span class='dashDataButton fakeLink' onclick='PromptForData(\""+name+"\")'>Add Data</span>"
		output += "<span class='dashReportButton fakeLink' onclick='GenReport(\""+name+"\")'>Report</span>"
		output += "<span class='dashDataDate'>Last updated: " + age + "</span>";
		output += "<span class='dashDeleteButton fakeLink' onclick='DeleteData(\""+name+"\")'>Delete</span>"
		
		output += "</div>";
		if (style == "oddLine") { style = "evenLine"; }
		else {style = "oddLine"; }
	});
	
	output += "<div class='dashAddType'>Track a new type of data: <select id='DataTypeSelect'>"
	datatypes.forEach(function(item, ii) {
		output += "<option value='"+item.type+"'>"+item.type+"</option>";
	});
	output += "</select>  <input type='submit' value='Track a New Type' onclick='AddDataType()'></div>";
		
	document.getElementById('container').innerHTML = output;
	if (userInfo.name != '') {
		document.getElementById('userNameSpan').innerHTML = userInfo.name+"'s ";
	}
}

function ResetDefaultData()
{//reset everything to default (testing) data
	userData = testUserData;
	userInfo = defaultUserInfo;
	StoreData(userData, "userData");
	StoreData(userInfo, "userInfo");
	BuildHomePage();
}

function ClearAllData()
{//clear all the stored data
	userData = [];
	userInfo = defaultUserInfo;
	StoreData(userData, "userData");
	StoreData(userInfo, "userInfo");
	BuildHomePage();
}

function addUserInfo()
{//ask user for their unchanging info (name, etc)
	var input = '';
	input = prompt("Enter Your Name ", '');
	userInfo.name = input;
	
	input = '';
	while (!isNumeric(input)) {	
		input = prompt("Enter Your Height (inches) ", '');
	}
	userInfo.height = input;
	
	//input = '';
	//input = prompt("Enter Your Name ", '');
	//userInfo.sex = input;
	StoreData(userInfo, "userInfo");
	BuildHomePage();
}

function GenReport(typeName)
{//build the table for a given stat and put it on the bottom of the page
	var unit = getUnitFromName(typeName);
	var thisSeries = getDataSeries(typeName);
	var output = '';
	output += "<table class='table table-striped'><thead><tr>";
	output += "<th>Date</th><th>Time</th><th>Value ("+unit+")</th>";
	output += "</tr></thead><tbody>";
	
	thisSeries.data.forEach(function(item, ii) {
		output += "<tr><td>"+formatDate(item.date)+"</td>";
		output += "<td>"+formatTime(item.date)+"</td>";
		output += "<td class='"
		if (!checkDataPoint(typeName, item.value)) 
		{output += "okValue"; }
		else { output += "badValue"; }
		output += "'>"+item.value+"</td></tr>";
		
	});
	output += "</tbody></table>";
	output += "<span class='fakeLink' onclick='clearReport()'>Close Report</span>"
	
	document.getElementById('reportArea').innerHTML = output;
}

function clearReport()
{//delete the shown report
	document.getElementById('reportArea').innerHTML = '';
}
