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
{"type":"Blood Pressure (diastolic)","data":[{"date":1457297331940,"value":78},{"date":1457297330949,"value":83}]},
{"type":"Blood Pressure (systolic)","data":[{"date":1457297231840,"value":119},{"date":1457297230849,"value":108}]},
{"type":"Heart Rate","data":[{"date":1457177231912,"value":72},{"date":1457187131929,"value":66}]}]

userData = []

datatypes = [
	{type: "Fasting Blood Sugar", max: 100, min: 70, logFreq: daily, unit: "mg/dL"}, 
	{type: "Heart Rate", max: 100, min: 60, logFreq: daily, unit: "BPM"},
	{type: "Cholesterol (Total)", max: 200, min: 70, logFreq: daily, unit: "mg/dL"},
	{type: "Cholesterol (LDL)", max: 130, min: 70, logFreq: daily, unit: "mg/dL"},
	{type: "Cholesterol (HDL)", max: 200, min: 50, logFreq: daily, unit: "mg/dL"},
	{type: "Triglycerides", max: 150, min: 10, logFreq: daily, unit: "mg/dL"},
	{type: "Blood Pressure (diastolic)", max: 90, min: 60, logFreq: daily, unit: "mm Hg"},
	{type: "Blood Pressure (systolic)", max: 120, min: 80, logFreq: daily, unit: "mm Hg"}]


function StoreData(obj)
{//take a js obj and store it a string in localStorage
	localStorage.setItem("userData", JSON.stringify(obj));
}

function ReadData()
{//retrieve string from localStorage, and parse it as obj
	var data = localStorage.userData;
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


function getNewestPoint(data)
{
	var newestDate = 0;
	var newestValue = 0;
	data.data.forEach(function(item, ii) {
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

function isCurrTracked(type)
{
	var bool = false;
	userData.forEach(function(item, ii) {
		if (item.type == type) {
			bool = true; 
		}
	});
	return bool;
}

function getDataAge(data)
{
	var output = '';
	var freq = 0;
	datatypes.forEach(function(item, ii) {
		if (item.type == data.type) 
		{
			freq = item.logFreq;
		}
	});
	var newestPoint = getNewestPoint(data);
	
	var now = Date.now();
	var age = (now - newestPoint.date) / 1000;
	if (age > freq) {
		output = "<span class='oldData'>" + convertSecsToDays(age) + "</span>";
	} else {
		output = "<span class='currData'>" + convertSecsToDays(age) + "</span>";
	}
	return output;
}

function AddDataType(type)
{
	var newType = document.getElementById("DataTypeSelect").value
	//{"type":"Blood Pressure (diastolic)","data":[]}
	if ( !isCurrTracked(newType) ) {
		userData.push({type: newType, data: []});
		PromptForData(newType);
	} else {
		
	}
	StoreData(userData);
	BuildHomePage();
}

function AddData(type, data)
{
	userData.forEach(function(item, ii) {
		if (item.type == type)
		{
			item.data.push({date: Date.now(), value: data});
		}
	});
	StoreData(userData);
}

function checkDataPoint(type, data)
{
	datatypes.forEach(function(item, ii) {
		if (item.type == type) 
		{
			max = item.max;
			min = item.min;
		}
	});
	
	if (data > max) {
		return 1;
	} else if (data < min) {
		return -1;
	}
	return 0;
}

function PromptForData(type)
{
	var input = '';
	while (!isNumeric(input)) {	
		input = prompt("Enter New " + type, '');
	}
	AddData(type, input);
	var ok = checkDataPoint(type, input);
	if (ok == 1) { alert ("Warning! Too high!"); }
	else if (ok == -1) { alert ("Warning! Too low!"); }
	else { /*ok value*/ }
	BuildHomePage();
}

function DeleteData(type)
{
	userData.forEach(function(item, ii) {
		if (item.type == type)
		{
			userData.pop(ii);
		}
	});
	StoreData(userData);
	BuildHomePage();
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getUnit(data) {
	var unit = '';
	datatypes.forEach(function(item, ii) {
		if (item.type == data.type) 
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
	
	userData = ReadData();
	
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
		output += "<span class='dashDataButton'><input type='submit' value='Add Data' onclick='PromptForData(\""+item.type+"\")'></span>"
		output += "<span class='dashDataDate'>Last updated: " + age + "</span>";
		output += "<span class='dashDeleteButton'><input type='submit' value='Delete Data' onclick='DeleteData(\""+item.type+"\")'></span>"
		
		output += "</div>";
		if (style == "oddLine") { style = "evenLine"; }
		else {style = "oddLine"; }
		
		
	});
	
	output += "<div class='dashAddType'>Track a new type of data: <select id='DataTypeSelect'>"
	datatypes.forEach(function(item, ii) {
		output += "<option value='"+item.type+"'>"+item.type+"</option>";
	});
	output += "</select>  <input type='submit' value='Track a New Type' onclick='AddDataType()'></div>";
	
	
	//clear all button
	//result to default data button
	
	document.getElementById('container').innerHTML = output;
}
