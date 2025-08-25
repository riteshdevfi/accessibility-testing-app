// This file is part of Pa11y Dashboard.
//
// Pa11y Dashboard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Pa11y Dashboard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Pa11y Dashboard.  If not, see <http://www.gnu.org/licenses/>.
'use strict';

const presentTask = require('../../view/presenter/task');
const presentResult = require('../../view/presenter/result');
const presentResultList = require('../../view/presenter/result-list');
const logger = require('../../enhanced-logging');

// ObjectID validation function
function isValidObjectId(id) {
	return /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = function taskIndex(app) {
	app.express.get('/:id', (request, response, next) => {
		// Enhanced logging for ObjectID tracking
		logger.objectId('VALIDATE', request.params.id, {
			requestId: request.id,
			url: request.url,
			method: request.method,
			userAgent: request.get('User-Agent')
		});

		// Validate ObjectID format before processing
		if (!isValidObjectId(request.params.id)) {
			logger.error('Invalid ObjectID format', null, {
				requestId: request.id,
				objectId: request.params.id,
				url: request.url
			});
			return next();
		}

		logger.info('Fetching task', {
			requestId: request.id,
			objectId: request.params.id
		});

		app.webservice.task(request.params.id).get({lastres: true}, (error, task) => {
			if (error) {
				logger.error('Error fetching task', error, {
					requestId: request.id,
					objectId: request.params.id
				});
				return next();
			}
			
			logger.info('Task fetched successfully', {
				requestId: request.id,
				objectId: request.params.id,
				taskName: task.name,
				taskUrl: task.url
			});

			app.webservice.task(request.params.id).results({}, (webserviceError, results) => {
				if (webserviceError) {
					logger.error('Error fetching results', webserviceError, {
						requestId: request.id,
						objectId: request.params.id
					});
					return next(webserviceError);
				}
				const presentedResults = presentResultList(results.map(presentResult));
				response.render('task', {
					task: presentTask(task),
					results: presentedResults,
					mainResult: task.lastResult || null,
					added: (typeof request.query.added !== 'undefined'),
					running: (typeof request.query.running !== 'undefined'),
					ruleIgnored: (typeof request.query['rule-ignored'] !== 'undefined'),
					ruleUnignored: (typeof request.query['rule-unignored'] !== 'undefined'),
					hasOneResult: (presentedResults.length < 2),
					isTaskPage: true
				});
			});
		});
	});
};
