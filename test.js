const _ = global._ = require('lodash');
require('./nodelib/common/extensions');

traceClear();

const GoogleSheet = require('google-spreadsheet');
var async = require('async');


var doc = new GoogleSheet('1u5ehoTw1OaYZojZhKsSDkSwoPid-N8wu5CyB-UDWMsA');

var sheet;


async.series([
	(step) => {
		var creds_json = {
			client_email: 'erds-google-api@erds-2017.iam.gserviceaccount.com',
			private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD1WKiHxBcAPNSd\n6aG2Y3eCEIbTBGyIpY4zSR3vQ1jDoxMXmxMY7CF22hROgjICatqP58Cyk4Tk9Pg2\nhv5ijsqYG5qiZxWfU2UyIk5ybbSxsv3kPB+N3TbS5kSb1mx/TZd5ovOP1LikghGH\nuCB7Z3rxbBWE8J8axSNJgfvyqesTTnQU27LXC1jZBTJUz6KSLdODmE/sSb53Nk2D\n73NJr2QksaXqXzZ4VjIFDF6iTmslXIR5gkXBHIfJsyfTSJTkYob0Aa0chTNhnbrE\nU/LPLqggqvq/6vWolHKGIoff6cLC78NcSovT8ChKG6idZGO1cvxnf+G86Ek+ARLZ\nLgxJHt3XAgMBAAECggEACZhNBvo5OA4o9oADjgF31ANXcnsyz2lCFWlfnVLR7ty6\ny2qKJaheaqp+rs9Sq1uIbqZOl+1C/j1CU8eVvT7+V1KFCqLjapa1V2+WB82YinaI\njVt4lHC5SygsOLf7CEN9kAk6Yz6bdfuMOfWOd6UFXtmuQcOzRTW+eop10vioM9oC\n/6yBQ7JKuF78muTlQ6y06rCO7Y4H6a+gmJWofK+WJ6oTC4bbR7sLtPA+n/Uqkua8\nLa7Sj0MVzoz2HAEOxalBis55PlGke1xpesgUcjegpQ3GVuUDnj4I6SNycWjlhZ3x\nl3g+n5T23Mt47bkJgGetAwgkJPF/De/9jn+ycuUAMQKBgQD9TMSrUxEL/nTRTST2\noL+MX3cpU6CLMrEph/wb/xTMeBtphSkb/jgN0LCAFYsOpSB32TSl/xSEdpL6LQA1\nB3dLkxWjuura+6COXDfPmk9c38Dzl/TI4kAAabSeywUicDXtsL0qsB0d/MLysLQf\nOfelOMeBEP4MQu7J3RpU1p/duQKBgQD39i+BwI0WJs3PNnY3n1Ry8z1Bja2MZDqZ\nhnZ66k8yXifk8A739XDNAh9iRndlrvLtUjHVFkSikxLthzPSKDpRpXCtHDIWYBtB\nECgzW56VZgdasPc471EI0S6Gz6Por97FP37JiPJ1gCdL1FIOM6Xy7eGDBdh1kjCZ\npCeZOTfgDwKBgQCDSTbmVbeQL+L8WK+/5LFjYFey49ViUHPiwsi4+g0drWMH3izg\nhXMoNfJFcOUSQiQB+mJ/ZyaLQaoMYSaqVaRPV3zv0AHKXoFpSALlZ2WbDZ5Eo44M\nULg7fo5Pf4q5vs8001Y4ue9di5S/lTbGuJTS3gsJqnUChe6eUitDrbpOgQKBgEI+\n9oA+1jK12URj8392xNQVIidyV4xrdrBvmRXLpa76MsRaUlVysFlFGOdjliCHdgVr\ncT7RvTKGAoeNGI4sCzCm94x4PPV3ZbCjRWo7LwoRASP8pYADh+3IHRsNPGg9HFIs\nXY4wVT6JJ3Z92hJLQCm/3gDoPeVjUjKqBZ5NCB2HAoGBAO3T4Hg2ySISDuxlKeMq\nftKBq5QRle1ALRz4A8t3lmboxSxKxChS2uE5GZhBzW+54TuDP8kE5WNBn8HRAT18\nlCVzijg//o5S+yRmCNtsc1BXMGUrartw/CIcvd0DGpNvR62B0zJoOcUcu54UdbmS\nAmAKd0/oOPgZ+WDZ7+1YYFVl\n-----END PRIVATE KEY-----\n",
		};

		doc.useServiceAccountAuth(creds_json, function (err) {
			if(err) return trace(err);
			step.apply(null, arguments);
		});
	},
	(step) => {
		doc.getInfo(function(err, info) {
			console.log('Loaded doc: '+info.title+' by '+info.author.email);
			sheet = info.worksheets[0];
			console.log('sheet 1: '+sheet.title+' '+sheet.rowCount+'x'+sheet.colCount);
			step();
		});
	}
]);