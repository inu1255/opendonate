import Scanner from 'zbar.wasm';

let _scanner;

function load() {
	if (_scanner) return _scanner;
	return _scanner = Scanner({ locateFile: file => ('/js/' + file) });
}

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @returns {Promise<string[]>}
 */
export function read(canvas) {
	const ctx = canvas.getContext('2d');
	let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	return load().then(scanner => scanner.scanQrcode(imageData.data, canvas.width, canvas.height));
}

/**
 * 
 * @param {File} canvas 
 * @returns {Promise<string[]>}
 */
export function readFile(file) {
	return new Promise(function(resolve, reject) {
		var img = document.createElement('img');
		img.src = URL.createObjectURL(file);
		img.onload = function() {
			var canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			canvas.getContext('2d').drawImage(img, 0, 0);
			resolve(read(canvas));
		};
		img.onerror = reject;
	});
}