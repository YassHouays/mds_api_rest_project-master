const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv').config()

const routes = require('./routes');

/**
 * Server
 * @Class
 */
class Server {
    constructor() {
        this.app = express()
    }

    /**
     * DataBase connect
     * @return {Object} connect
     */
    dbConnect() {
        const host = `mongodb+srv://${process.env.NOSQL_USER}:${process.env.NOSQL_PWD}@${process.env.NOSQL_HOST}/${process.env.NOSQL_TABLE}`
        const connect = mongoose.createConnection(host, { useNewUrlParser: true, useUnifiedTopology: true })

        connect.on('error', (err) => {
            setTimeout(() => {
                console.error(`[ERROR], api dbConnect() -> ${err}`);
                this.connect = this.dbConnect(host)
            }, 5000)
        }) 

        connect.on('disconnected', (err) => {
            setTimeout(() => {
                console.log(`[DISCONNECTED], api dbConnect() -> mongodb disconnected`);
                this.connect = this.dbConnect(host)
            }, 5000)
        }) 

        process.on('SIGINT', () => {
            connect.close(() => {
                console.log('[API END PROCESS] api dbConnect() -> close mongodb connection')
                process.exit(0)
            })
        }) 

        return connect
    }

    /**
     * Middleware
     */
    middleware() {
        this.app.use(cors())
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({'extended': true}))
        this.app.use(express.static('public'))
        this.app.use(fileUpload())
    }

    /**
     * Routes
     */
    routes() {
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        
        new routes.User(this.app, this.connect)
        new routes.Post(this.app, this.connect)
    }

    /**
     * Run
     */
    run() {
        try {
            this.connect = this.dbConnect()
            this.dbConnect()
            this.middleware()
            this.routes()
            this.app.listen(3030)
            console.log('listen on http://localhost:3030');
            
        } catch(err) {
            console.log(`[ERROR] SERVER -> ${err}`)
        }
    }
}

module.exports = Server


