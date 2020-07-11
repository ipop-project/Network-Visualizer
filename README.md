# **IPOP NETWORK VISUALIZER** ![version badge](https://img.shields.io/badge/version-0.1.0-grey.svg)
The IPOP Network Visualizer is a web application to monitor a system that using IPOP. 

Read more about IPOP : https://ipop-project.org/wiki/Home
 
## **Prerequisites**

[![node badge](https://img.shields.io/badge/node.js-v12.16.3-green.svg)](https://nodejs.org/dist/v12.16.3/)
[![npm badge](https://img.shields.io/badge/npm-6.14.4-green.svg)](https://nodejs.org/dist/v12.16.3/)
[![git badge](https://img.shields.io/badge/git-latest-orange.svg)](https://git-scm.com/downloads)

## **Getting started**

if you don't have git on your device, install it first and clone the project to your local directory
```
git clone -b dev/webapp https://github.com/ipop-project/Network-Visualizer.git
```

in project directory, Install node modules.
```
npm install 
```
start application on your local device.
```
npm start
```
a landing page will show up on your browser. ( Google Chrome is recommended. )

![Image of lannding](https://i.imgur.com/172SIg5.png)

## **Config.js**
in `config.js` ( Network-Visualizer/src/config.js )

![Image of config.js](https://imgur.com/kUmW7sA.png)

you can change an `ip address and port of data collector service`.

## **Depolyment**
in project directory, use npm command to build the project.
```
npm run build
```
you will have a build folder in your project directory. you can use this folder to deploy your application on your web server such as apache or nginx.

---
![warning badge](https://img.shields.io/badge/WARNING-ALERT-red.svg)

if your application is on the same place with data collector service, you have to use an empty string value for `allowOrigin` variable instead.

line : 31, use allowOrigin on line 32 instead.

![Image of allowOrigin0](https://imgur.com/ZLZai6z.png)

line : 124, use allowOrigin on line 125 instead.

![Image of allowOrigin1](https://imgur.com/FddIi4t.png)

---

## **Author**
 created by [@P-Parinya](https://github.com/P-Parinya)
( if you have a question or images don't show up, please contact me. )

![last update badge](https://img.shields.io/badge/updated-07.Jul.2020-blue.svg)

