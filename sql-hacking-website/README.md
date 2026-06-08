# SQL Vulnerability Analysis Application

The website is designed to be a user friendly interactive learning website that teaches beginners about SQL injections and provides practical experience in practice labs. 

## Description

The website first directs to a login/registration form. This is connected to an SQL database which stores user email and passwords. Once logged in, the user lands on the Home Page 
which displays a small description, links to labs and notes, and a progress bar with levels marked. The level progression “game-ifies” it to keep user engagement high and positive.
The navigation bar on top allows users to quickly move from page to page using React Router. It also features a logout button. The labs page has labs 1-5 ranking from very easy to 
challenging. These all showcase different types of SQL injections and provide a link to a separate page with a separate database that users can practice hacking. Progress is updated 
upon starting and completion. These labs also feature a reset button. The notes page is similar but more Spartan than the labs page. There 7 notes which discuss the basics of SQL 
injections and how to prevent them. The content is expanded upon clicking a read note button. 5 notes end with a multiple choice question that if guessed correctly contributes to the 
overall progress.

## Set Up Instructions

* Extract sql-hacking-website
* Install MariaDB (https://mariadb.org/download/?t=mariadb&p=mariadb&r=12.2.2&os=windows&cpu=x86_64&pkg=msi&mirror=xtom_ams; ensure no root password is created)
* Install node.js (https://nodejs.org/en/download/current; install all dependencies in setup wizard)
* Open command prompt in this directory and enter:
```
npm install
cd client
npm install
cd ..
cd labs\sql-injection-basics
npm install
cd ..\.. ## should return to root folder
```
* Open command prompt wherever setup_databases.sql is installed
```
mysql -u root < setup_databases.sql
```
* Return to root folder in command prompt and enter
```
npm run dev
```
* Open
```
http://localhost:5173
```
* Register, log in, enjoy

## NB
If you want to add a root password, change the mysql command to
```
mysql -u root - p < setup_databases.sql
```
Then enter your root password

## Future Improvements

* Currently the lab's save state is based on localStorage and is not user-specific. This persistence should be switched to the database so each user's progress is unique to that account.
* Redesign lab 4 for a more user-friendly experience, and give some more hints towards the answer
* Complete lab 5
