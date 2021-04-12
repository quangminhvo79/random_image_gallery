'use strict';

const uuid = require('uuid');
// const Boom = require('Boom');
const fs = require('fs');
var pathlib = require('path');
const jimp = require('jimp');

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');


const UPLOAD_PATH = pathlib.join(__dirname, '..', 'public', 'upload');
const MIN_IMAGES_DIR = 'compression';
const fileOptions = { dest: UPLOAD_PATH + '/' };

const uploader = function (file = null, options= fileOptions) {
    if (!file) throw new Error('no file(s)');

    return Array.isArray(file) ? _filesHandler(file, options) : _fileHandler(file, options);
}

async function resize_image(path) {
    const image = await jimp.read(path);
    await image.resize(600, jimp.AUTO);
    await image.writeAsync(path);
}

async function compression_images(path){
    await imagemin([`${UPLOAD_PATH}/*.{jpg,png}`], {
		destination: pathlib.join(__dirname, '..', 'public', MIN_IMAGES_DIR),
		plugins: [
			imageminJpegtran(),
			imageminPngquant({
				quality: [0.6, 0.8]
			})
		]
	});
}

const _fileHandler = function (file = null, options= fileOptions, multi = false) {
    if (!file || !file.hapi.filename.length) throw new Error('no file');

    const filename = uuid.v1() + pathlib.extname(file.hapi.filename);
    const path = `${options.dest}${filename}`;
    return new Promise((resolve, reject) => {
        fs.writeFile(path, file._data, err => {
           if (err) {
            reject(err)
           }
           resize_image(path);
        //    compression_images(path)
           resolve({ message: 'Upload successfully!' })
        })
    })
}

const _filesHandler = function (files= null, options= {}) {
    if (!files || !Array.isArray(files)) throw new Error('no files');

    const promises = files.map(x => _fileHandler(x, options));
    return Promise.all(promises).then(values => {
        
        return { message: 'Upload successfully ' + values.length + ' images.' }
    });;

}

module.exports = [
    {
        method: 'GET',
        path: '/upload-gallery',
        handler:  (request, h) => {
            var params = request.query
            console.log(params);
            return h.view('upload-gallery', { data: 'Misnh' });
        }
    },
    {
        method: 'POST',
        path: '/upload-gallery',
        handler: async (request, reply) => {
            try {
                const data = request.payload;
                const files = data['images'];
    
                const filesDetails = await uploader(files, fileOptions);
                return filesDetails;
            } catch (err) {
                return { message: err.message}
            }
        },
        options: {
            payload: {
                output: 'stream',
                maxBytes: 1024 * 1024 * 100,
                multipart: true,
            }
        },
    }
];
