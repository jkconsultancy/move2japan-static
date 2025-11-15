# Static Site Requirements

# Check to see if the user has been to the site before. If not, load the initial Checklist from a .json configuration file hosted via a url endpoint. An example of this configuration is within the intial_checklist.json file. Save this data to the user's local browser using cookies. This cookie will be checked in the future to determine if the user has already visited the site, and to store the progress of their checklist.


# Design Notes
Site should have the following elements, from top to bottom:
- Header
- Hero Image
- Checklist

## Header Details:
- Contains a logo in the lefthand corner
- A button labeld 'Signup' on the right

# Hero Image Details:
- Image of Japan
- Site title: "Moving to Japan Checklist"
- Subtitle: "A comprehensive to do guide for moving to Japan from the US"

# Checklist Details:

- Checklist is broken up by categories.
	- Contains a overall progress bar for all completed checklist items)

- Checklist: Categories
	- Each has a title (ie Phase 1: Initial Planning) and is an expandable UI
widget (denoted with a disclosure caret).
	- Each category contains sub-sections (ie Visa and Immigration).
	- Has a progress bar (of all completed checklist items from only it's sub-sections)

- Checklist:Category:Sub-sections
	- Has it's own title but no progress bar
	- Contain rows of items that need to be completed. 

- Checklist:Category:Sub-sections:Rows
	- Each has a checklist toggle. If enabled, all the text in the row will be striked through, and the font color greyed out. Clicking anywhere else will open up the first url link of that task into a new tab.


