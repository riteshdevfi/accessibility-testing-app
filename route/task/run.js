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

const logger = require('../../enhanced-logging');

// ObjectID validation function
function isValidObjectId(id) {
	return /^[0-9a-fA-F]{24}$/.test(id);
}

module.exports = function run(app) {
	app.express.get('/:id/run', (request, response, next) => {
		// Enhanced logging for ObjectID tracking
		logger.objectId('RUN_VALIDATE', request.params.id, {
			requestId: request.id,
			url: request.url,
			method: request.method,
			userAgent: request.get('User-Agent')
		});

		// Validate ObjectID format before processing
		if (!isValidObjectId(request.params.id)) {
			logger.error('Invalid ObjectID format in run route', null, {
				requestId: request.id,
				objectId: request.params.id,
				url: request.url
			});
			return next();
		}

		logger.info('Starting task run', {
			requestId: request.id,
			objectId: request.params.id
		});

		app.webservice.task(request.params.id).run(error => {
			if (error) {
				logger.error('Error running task', error, {
					requestId: request.id,
					objectId: request.params.id
				});
				return next();
			}
			
			logger.info('Task run started successfully', {
				requestId: request.id,
				objectId: request.params.id
			});
			
			response.redirect(`/${request.params.id}?running`);
		});
	});
};
