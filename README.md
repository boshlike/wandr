# Wandr
## App Description

A cross between travel log and travel planning that allows users to add places they have been or intend to go and visualise the places on the map with links to each place. Ability to search for a place with Bing maps. Planned trips have the ability to search for flights through the Skyscanner widget. 

## User Stories (with those achieved and failed)

* The user arrives at the landing page and is able to register an account :heavy_check_mark:
* The user can create an account and receives error messages if validations fail :heavy_check_mark:
* The user logs in and arrives at their dashboard, which is a map with pins and a list of countries. There is filtering to filter the list of places. :heavy_check_mark:
* A user can click on a country and the map zooms, showing the places tagged within that country. :heavy_check_mark:
* A user can click on the add country and come to a form to fill in details which will be saved to the database and saved against the user. These entries can be updated. Photos can be added when a user is logging a place. :heavy_check_mark:
* A user profile showing details about the user. :heavy_check_mark:
* Ability to follow other users and see their entries. :x:
* A newsfeed that updates when you other users add places. :x:
* An inspiration page where users can see top rated places, most visited, most planned etc. :heavy_check_mark:

## Link to App

[Wandr](https://wandr-0h26.onrender.com)

## RESTful routes

* GET
* NEW - New user registration page, new place creation page
* SHOW - Show user profile, show place details, show dashboard of user
* POST - Create new place, create new user
* EDIT - Edit user profile details page, edit a place page
* PUT/PATCH - Submit changes to user profile and place
* DELETE - Delete user profile and delete place

## Technologies and Packages Used

* Bulma - CSS framework
* Node.js with the below packages:
  * Express - Framework for Node.js
  * Express-session - Tool for creating cookies and user sessions
  * Axios - For fetch requests to Bing
  * Bcrypt - For password hashing
  * Dotenv - For environment variable injection
  * EJS - Template engine for serving dynamic HTML content
  * Joi - For data validation
  * Mongoose - For straight forward usage of MongoDB.
  * Method-override - For patch and delete REST routes
  * Multer - For image uploads
* Plain Old JavaScript - For interaction elements on the client side
* MongoDB
* Bing Maps and AutoSuggest
* Skyscanner flight booking widget

## Problems Faced

* Finalising the MongoDB data structure to encapsulate the requirements and minimise calls to Bing maps. I had to redesign the structure more than once to accommodate some features.
* Mongoose and MongoDB generally had quite steep learning curves and a lot of errors before finally working. Update tags especially are 
* The map features. Bing documentation is not particularly user friendly and a lot of trial and error was required.

## Future Feature Ideas

* An ability to follow other users and see when they update their profiles
* Ability to upload a gallery of images for each place visited
* Create more features for the inspiration page, such as suggestions from external sources such as Trip Advisor or Culture Trip.
* Tailored suggestions based on your trips
