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


testUserData = [
{"type":"Blood Pressure (diastolic)","data":[{"date":1457297331940,"value":78},{"date":1457297330949,"value":83},{"date":1457486304867,"value":88}]},
{"type":"Blood Pressure (systolic)","data":[{"date":1457297231840,"value":119},{"date":1457297230849,"value":108},{"date":1457486304867,"value":138}]},
{"type":"Heart Rate","data":[{"date":1457177231912,"value":72},{"date":1457187131929,"value":66}]}];

userData = [];

userInfo = {name: '', height: 0, sex: ''};

datatypes = [
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
	if (data === undefined) { return testUserData; }
	else { return JSON.parse(data); }
	//return JSON.parse(localStorage.userData);
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

//get a date object and return a formatted string, the format is hardcoded
function formatDate(date)
{//Output: 2/13/2001, 12:01:02 AM
	output = "";
	output += (date.getMonth() + 1) + "/";
	output += date.getDate() + "/";
	output += date.getFullYear() + ", ";
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

function getNewestPoint(thisSeries)
{
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

function convertSecsToDays(secs) {
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

function isCurrTracked(typeName)
{
	var bool = false;
	userData.forEach(function(item, ii) {
		if (item.type == typeName) {
			bool = true; 
		}
	});
	return bool;
}

function getDataAge(thisSeries)
{
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
{
	var newType = document.getElementById("DataTypeSelect").value
	//{"type":"Blood Pressure (diastolic)","data":[]}
	if ( !isCurrTracked(newType) ) {
		userData.push({type: newType, data: []});
		PromptForData(newType);
	} else {
		
	}
	StoreData(userData, "userData");
	BuildHomePage();
}

function AddData(typeName, value)
{
	userData.forEach(function(item, ii) {
		if (item.type == typeName)
		{
			item.data.push({date: Date.now(), value: value});
		}
	});
	StoreData(userData, "userData");
}

function checkDataPoint(typeName, value)
{
	datatypes.forEach(function(item, ii) {
		if (item.type == typeName) 
		{
			max = item.max;
			min = item.min;
		}
	});
	
	if (value > max) {
		return 1;
	} else if (value < min) {
		return -1;
	}
	return 0;
}

function PromptForData(typeName)
{
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
{
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

function getUnit(thisSeries) {
	var unit = '';
	datatypes.forEach(function(item, ii) {
		if (item.type == thisSeries.type) 
		{
			unit = item.unit;
		}
	});
	return unit;
}

function BuildHomePage()
{
	var output = '';
	var style = "oddLine";
	
	userInfo = ReadData("userInfo");
	userData = ReadData("userData");
	
	userData.forEach(function(item, ii) {
		var age = getDataAge(item);
		var unit = getUnit(item);
		var newestPoint = getNewestPoint(item);
		var condClass = '';
		var ok = checkDataPoint(item.type, newestPoint.value)
		if (ok == 0) { condClass = "okValue"; }
		else { condClass = "badValue"; }
		output += "<div class='dashDataLine " + style + "'>";
		output += "<span class='dashDataName'>";
		output += item.type + "</span>";
		output += "<span class='dashDataValue "+condClass+"'>Current Value: "+newestPoint.value+" "+unit+"</span>";
		output += "<span class='dashDataButton fakeLink' onclick='PromptForData(\""+item.type+"\")'>Add Data</span>"

		output += "<span class='dashReportButton fakeLink' onclick='GenReport(\""+item.type+"\")'>Report</span>"
		output += "<span class='dashDataDate'>Last updated: " + age + "</span>";
		output += "<span class='dashDeleteButton fakeLink' onclick='DeleteData(\""+item.type+"\")'>Delete</span>"
		
		output += "</div>";
		if (style == "oddLine") { style = "evenLine"; }
		else {style = "oddLine"; }
	});
	
	output += "<div class='dashAddType'>Track a new type of data: <select id='DataTypeSelect'>"
	datatypes.forEach(function(item, ii) {
		output += "<option value='"+item.type+"'>"+item.type+"</option>";
	});
	output += "</select>  <input type='submit' value='Track a New Type' onclick='AddDataType()'></div>";
	
	//confirm delete
	//view report at bottom of page
	//something with bmi
	
	document.getElementById('container').innerHTML = output;
}

function ResetDefaultData()
{
	userData = testUserData;
	userInfo = {name: '', height: 0, sex: ''};
	StoreData(userData, "userData");
	StoreData(userInfo, "userInfo");
	BuildHomePage();
}

function ClearAllData()
{
	userData = [];
	userInfo = {name: '', height: 0, sex: ''};
	StoreData(userData, "userData");
	StoreData(userInfo, "userInfo");
	BuildHomePage();
}

function addUserInfo()
{
	var input = '';
	input = prompt("Enter Your Name ", '');
	userInfo.name = input;
	
	input = '';
	while (!isNumeric(input)) {	
		input = prompt("Enter Your Height (inches) ", '');
	}
	userInfo.height = input;
	
	//input = '';
	//while (!isNumeric(input)) {	
	//	input = prompt("Enter Your Height (inches) ", '');
	//}
	//userInfo.height = input;
	StoreData(userInfo, "userInfo");
}

function GenReport(typeName)
{
}
