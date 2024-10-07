# Chapter-Chai
Our project aims to develop an app that helps users find coffee shops and bookstores in a specified area. Using common APIs, the app simplifies the search for places to relax and enjoy coffee, especially in unfamiliar locations. The goal is to provide a quick, easy way to discover nearby coffee shops and bookstores.

## Installation Guide
If you are interested in visiting our website while it is active on GCP, feel free to visit our link here: [link for once we push to gcloud]

If you would like to run a local instance of this project, open your terminal and change directories to \chapter_chai\backend.

Afterwards, run the command 'mvn package', which should put the code into a JAR from which the application will run.

To test the web app, run 'mvn spring-boot:run' and visit "http://localhost:8080/"

If you're a registered user, feel free to login via google!

## Release Notes (1.0.0)

This is our first workable release of this app. Here are some things to keep in mind:
- You can search for either bookstores or coffee shops of a location within a specified radius after logging in
- Filter by price or review ratings using the filters above the coffee shop and bookstore tabs
- If you want to make sure that the place you're going to is open, we have a filter for that too!
- The Settings button will allow you to log out if you'd like to test logging in again
- You can go through the map by searching for a location or panning through it
- Our app is built for computers, so functionality may be limited on mobile
