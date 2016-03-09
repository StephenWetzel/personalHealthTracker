A personal health stats tracker.  Purely vanilla javascript.  Stores data to local storage, so it can be used offline.

There are currently about 8 stats available for the user to track, although more can be easily added to the JSON.  On the bottom are button to clear out all data, or to load some default data, which is useful for testing.  The first time you load the page it should load the default data.

The user adds data with the "Add Data" link, and the system will check if it's outside the healthy range.  If it is there will be an alert, and the value will be highlighted red.  The healthy range for a given stat is shown as hover text on the current value.  If the user has not logged data in a long time, the age will be highlighted red.

The user can click "Report" to generate a table of their data for that type, and display it at the bottom of the page.  Values which are outside the healthy range will be highlighted red.

The user can enter some static info (name, and height), in the upper right "Add User Info".  Their name is displayed in the page title, but the height is not currently used.

Live demo:
[http://stephenwetzel.github.io/personalHealthTracker/](http://stephenwetzel.github.io/personalHealthTracker/)

Open sourced with the MIT licence on Github:
[https://github.com/StephenWetzel/personalHealthTracker](https://github.com/StephenWetzel/personalHealthTracker)


Stephen Wetzel  
CS 338

