'use strict';
const fs = require('fs');
const _  = require('lodash');
const Hapi = require('@hapi/hapi');
const server = Hapi.server();

const UPLOAD_PATH = './lib/public/upload';

module.exports = [
    {
        method: 'get',
        path: '/',
        handler: (res, h) => {
            let files = fs.readdirSync(UPLOAD_PATH)
            return h.view('home', { files: _.shuffle(files).slice(0, 12), total: files.length });
        }
    },
    {
        method: 'get',
        path: '/new_turn',
        handler: (res, h) => {
            let files = fs.readdirSync(UPLOAD_PATH)
            return { files: _.shuffle(files).slice(0, 12), total: files.length };
        }
    },
    {
        method: 'get',
        path: '/get_winner',
        handler: (res, h) => {
            let files = fs.readdirSync(UPLOAD_PATH)
            let winner = _.sample(files);

            return winner;
        }
    },
    {
        method: 'get',
        path: '/gallery',
        handler: (res, h) => {
            let files = fs.readdirSync(UPLOAD_PATH)
            return h.view('gallery', { files });
        }
    },
    {
        method: 'POST',
        path: '/remove_image',
        handler: (res, h) => {
            try {
                fs.unlinkSync(UPLOAD_PATH + '/' + res.payload.imgUrl );
                return { success: true }
            } catch (error) {
                return { success: false }
            }
        }
    }
];
